import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskPriority, TaskStatus, Department } from '../../models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css'
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Output() action = new EventEmitter<{ type: string, payload?: any }>();

  TaskStatus = TaskStatus;
  Department = Department;

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

  departmentMap: Record<string, string> = {
    [Department.SALES]: 'المبيعات',
    [Department.ACCOUNTS]: 'الحسابات',
    [Department.PRODUCTION]: 'الإنتاج',
    [Department.PURCHASING]: 'المشتريات'
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
}
