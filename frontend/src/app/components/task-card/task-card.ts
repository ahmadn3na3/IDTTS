import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Task, TaskPriority, TaskStatus } from '../../models/task.model';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css'
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Input() currentUser: User | null = null;
  @Output() action = new EventEmitter<{ type: string, payload?: any }>();

  TaskStatus = TaskStatus;


  // Arabic Mappings
  priorityMap: Record<string, string> = {
    [TaskPriority.HIGH]: 'عالية',
    [TaskPriority.MEDIUM]: 'متوسطة',
    [TaskPriority.LOW]: 'منخفضة'
  };

  statusMap: Record<string, string> = {
    [TaskStatus.NEW]: 'جديد',
    [TaskStatus.UNDER_REVIEW]: 'قيد المراجعة',
    [TaskStatus.AWAITING_APPROVAL]: 'بانتظار الموافقة',
    [TaskStatus.IN_PROGRESS]: 'قيد التنفيذ',
    [TaskStatus.BLOCKED]: 'متوقف (عقبة)',
    [TaskStatus.COMPLETED]: 'مكتمل',
    [TaskStatus.CLOSED]: 'مغلق'
  };



  getBorderClass(): string {
    switch (this.task.priority) {
      case TaskPriority.HIGH: return 'border-danger';
      case TaskPriority.MEDIUM: return 'border-warning';
      case TaskPriority.LOW: return 'border-success';
      default: return 'border-secondary';
    }
  }

  getPriorityBadgeClass(): string {
    switch (this.task.priority) {
      case TaskPriority.HIGH: return 'bg-danger-subtle text-danger-emphasis';
      case TaskPriority.MEDIUM: return 'bg-warning-subtle text-warning-emphasis';
      case TaskPriority.LOW: return 'bg-success-subtle text-success-emphasis';
      default: return 'bg-secondary-subtle text-secondary-emphasis';
    }
  }

  isDelayed(): boolean {
    if (this.task.actualTime > this.task.plannedTime * 1.2) return true;
    return false;
  }

  onAction(type: string, payload?: any) {
    this.action.emit({ type, payload });
  }

  canPerformAction(action: string): boolean {
    if (!this.currentUser) return false;
    const role = this.currentUser.role;

    if (role === UserRole.ADMIN || role === UserRole.DEPARTMENT_HEAD) return true;

    if (role === UserRole.REGULAR_USER) {
      if (action === 'approveCredit' || action === 'closeTask') return false;
      if (this.currentUser.department === this.task.currentDepartment) {
        return true;
      }
    }

    return false;
  }
}
