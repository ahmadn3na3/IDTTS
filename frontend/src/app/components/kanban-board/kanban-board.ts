import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus, TaskPriority } from '../../models/task.model';
import { TaskCardComponent } from '../task-card/task-card';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, TaskCardComponent],
  templateUrl: './kanban-board.html',
  styleUrl: './kanban-board.css'
})
export class KanbanBoardComponent implements OnInit {
  tasks: Task[] = [];
  columns = Object.values(TaskStatus);

  statusMap: Record<string, string> = {
    [TaskStatus.NEW]: 'جديد',
    [TaskStatus.UNDER_REVIEW]: 'قيد المراجعة',
    [TaskStatus.AWAITING_APPROVAL]: 'بانتظار الموافقة',
    [TaskStatus.IN_PROGRESS]: 'قيد التنفيذ',
    [TaskStatus.BLOCKED]: 'متوقف (عقبة)',
    [TaskStatus.COMPLETED]: 'مكتمل',
    [TaskStatus.CLOSED]: 'مغلق'
  };

  constructor(private taskService: TaskService) { }

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
    });
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks.filter(t => t.status === status);
  }

  handleAction(event: { type: string, payload?: any }, task: Task) {
    switch (event.type) {
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
    const requestingParty = prompt('الجهة الطالبة:', 'المبيعات');
    if (!requestingParty) return;

    const priority = prompt('الأولوية (High, Medium, Low):', 'Medium') as TaskPriority;
    const plannedTime = Number(prompt('الوقت المخطط (بالأيام):', '5'));

    if (requestingParty && priority && plannedTime) {
      this.taskService.createTask({
        requestingParty,
        priority,
        plannedTime
      }).subscribe(() => this.loadTasks());
    }
  }
}
