import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus } from '../../models/task.model';
import { TaskCardComponent } from '../task-card/task-card';
import { UserService } from '../../services/user.service';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, TaskCardComponent, FormsModule],
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

  // Modal State
  showModal: boolean = false;
  modalTask: Task | null = null;
  modalAction: string = '';
  modalReason: string = '';
  modalTitle: string = '';
  isObstacle: boolean = false;

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

    // Open Modal instead of prompt
    this.modalTask = task;
    this.modalAction = event.type;
    this.modalReason = '';
    this.isObstacle = false;

    switch (event.type) {
      case 'submitForReview':
        this.modalTitle = 'إرسال للمراجعة - أدخل ملاحظة (اختياري)';
        break;
      case 'approveCredit':
        this.modalTitle = 'الموافقة على الاعتماد - أدخل ملاحظة (اختياري)';
        break;
      case 'reportObstacle':
        this.modalTitle = 'الإبلاغ عن عقبة';
        this.isObstacle = true;
        break;
      case 'resolveObstacle':
        this.modalTitle = 'حل العقبة - أدخل ملاحظة (اختياري)';
        break;
      case 'completeProduction':
        this.modalTitle = 'إتمام الإنتاج - أدخل ملاحظة (اختياري)';
        break;
      case 'closeTask':
        this.modalTitle = 'إغلاق المهمة - أدخل ملاحظة (اختياري)';
        break;
    }

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.modalTask = null;
    this.modalAction = '';
    this.modalReason = '';
  }

  confirmAction() {
    if (!this.modalTask) return;

    const task = this.modalTask;
    const reason = this.modalReason; // For obstacles this works too (as payload)

    switch (this.modalAction) {
      case 'submitForReview':
        this.taskService.submitForReview(task.id, reason).subscribe(() => this.loadTasks());
        break;
      case 'approveCredit':
        this.taskService.approveCredit(task.id, reason).subscribe(() => this.loadTasks());
        break;
      case 'reportObstacle':
        if (reason) {
          this.taskService.reportObstacle(task.id, reason).subscribe(() => this.loadTasks());
        }
        break;
      case 'resolveObstacle':
        this.taskService.resolveObstacle(task.id, reason).subscribe(() => this.loadTasks());
        break;
      case 'completeProduction':
        this.taskService.completeProduction(task.id, reason).subscribe(() => this.loadTasks());
        break;
      case 'closeTask':
        this.taskService.closeTask(task.id, reason).subscribe(() => this.loadTasks());
        break;
    }

    this.closeModal();
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
