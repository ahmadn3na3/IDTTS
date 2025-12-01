import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus } from '../../models/task.model';
import { TaskCardComponent } from '../task-card/task-card';
import { UserService } from '../../services/user.service';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, TaskCardComponent],
  templateUrl: './kanban-board.html',
  styleUrl: './kanban-board.css'
})
export class KanbanBoardComponent implements OnInit {
  tasks: Task[] = [];
  columns: TaskStatus[] = Object.values(TaskStatus) as TaskStatus[];

  statusMap: Record<string, string> = {
    [TaskStatus.NEW]: 'جديد',
    [TaskStatus.UNDER_REVIEW]: 'قيد المراجعة',
    [TaskStatus.AWAITING_APPROVAL]: 'بانتظار الموافقة',
    [TaskStatus.IN_PROGRESS]: 'قيد التنفيذ',
    [TaskStatus.BLOCKED]: 'متوقف (عقبة)',
    [TaskStatus.COMPLETED]: 'مكتمل',
    [TaskStatus.CLOSED]: 'مغلق'
  };

  currentUser: User | null = null;

  userMap: Record<string, string> = {};
  users: User[] = [];

  constructor(private taskService: TaskService, private userService: UserService, private router: Router) {
    this.userService.currentUser$.subscribe(u => {
      this.currentUser = u;
      this.loadTasks();
    });
  }

  ngOnInit() {
    this.loadTasks();
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
      this.userMap = users.reduce((acc, user) => {
        acc[user.id] = user.username;
        return acc;
      }, {} as Record<string, string>);
    });
  }

  loadTasks() {
    this.taskService.getTasks().subscribe(tasks => {
      if (!this.currentUser) {
        this.tasks = [];
        return;
      }

      if (this.currentUser.role === UserRole.ADMIN) {
        this.tasks = tasks;
      } else if (this.currentUser.role === UserRole.DEPARTMENT_HEAD) {
        this.tasks = tasks.filter(t =>
          t.currentDepartment === this.currentUser?.department ||
          t.assignedTo === this.currentUser?.id
        );
      } else {
        // Regular User
        this.tasks = tasks.filter(t => t.assignedTo === this.currentUser?.id);
      }
    });
  }

  getTasksByStatus(status: string | TaskStatus): Task[] {
    return this.tasks.filter(t => t.status === status);
  }

  handleAction(event: { type: string, payload?: any }, task: Task) {
    if (!this.canPerformAction(event.type, task)) {
      alert('ليس لديك صلاحية للقيام بهذا الإجراء');
      return;
    }

    switch (event.type) {
      case 'submitForReview':
        this.taskService.submitForReview(task.id).subscribe(() => this.loadTasks());
        break;
      case 'approveCredit':
        this.taskService.approveCredit(task.id).subscribe(() => this.loadTasks());
        break;
      case 'reportObstacle':
        const obstacle = prompt('أدخل وصف العقبة:');
        if (obstacle) {
          this.taskService.reportObstacle(task.id, obstacle).subscribe(() => this.loadTasks());
        }
        break;
      case 'resolveObstacle':
        this.taskService.resolveObstacle(task.id).subscribe(() => this.loadTasks());
        break;
      case 'completeProduction':
        this.taskService.completeProduction(task.id).subscribe(() => this.loadTasks());
        break;
      case 'closeTask':
        this.taskService.closeTask(task.id).subscribe(() => this.loadTasks());
        break;
    }
  }

  createTask() {
    this.router.navigate(['/tasks/new']);
  }

  canPerformAction(action: string, task: Task): boolean {
    if (!this.currentUser) return false;
    const role = this.currentUser.role;

    if (role === UserRole.ADMIN || role === UserRole.DEPARTMENT_HEAD) return true;

    // Regular User Logic
    if (role === UserRole.REGULAR_USER) {
      // Cannot Approve/Reject (which implies moving status usually, but let's be specific)
      // Matrix: Approve/Reject = X. Delete = X.
      // Edit = Check (within department).

      // Actions like 'approveCredit', 'completeProduction' are state changes (Approve/Reject/Move).
      // Regular users usually work on tasks (e.g. report obstacle, maybe complete?), but matrix says "Approve/Reject" is X.
      const user = this.currentUser; // Use a local variable for clarity

      if (user.role === UserRole.ADMIN) return true;

      // However, 'reportObstacle' might be considered "Edit" or "Work".
      // Let's strictly follow: Regular User can Edit (within dept).
      // Does 'approveCredit' count as Edit? It changes status.
      // Usually "Approve/Reject" refers to specific approval steps.

      // Department Head: Can do anything on tasks in their department
      if (user.role === UserRole.DEPARTMENT_HEAD && user.department === task.currentDepartment) {
        return true;
      }

      // Regular User: Can do anything EXCEPT approve/close on tasks in their department
      if (user.role === UserRole.REGULAR_USER && user.department === task.currentDepartment) {
        if (action === 'approveCredit' || action === 'closeTask') {
          return false;
        }
        return true;
      }

      return false;
    }
    return false;
  }
}
