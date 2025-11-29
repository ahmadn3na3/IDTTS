import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus, TaskPriority } from '../../models/task.model';

@Component({
    selector: 'app-task-detail',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './task-detail.component.html',
    styleUrl: './task-detail.component.css'
})
export class TaskDetailComponent implements OnInit {
    task: Task | null = null;

    // Mappings
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

    constructor(
        private route: ActivatedRoute,
        private taskService: TaskService
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.taskService.getTasks().subscribe(tasks => {
                this.task = tasks.find(t => t.id === id) || null;
            });
        }
    }
}
