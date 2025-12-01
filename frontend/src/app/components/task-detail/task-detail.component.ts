import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus, TaskPriority } from '../../models/task.model';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
    selector: 'app-task-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
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

    users: User[] = [];
    selectedUserId: string = '';

    constructor(
        private route: ActivatedRoute,
        private taskService: TaskService,
        private userService: UserService,
        private location: Location
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.taskService.getTasks().subscribe(tasks => {
                this.task = tasks.find(t => t.id === id) || null;
                if (this.task && this.task.assignedTo) {
                    this.selectedUserId = this.task.assignedTo;
                }
            });
        }
        this.userService.getUsers().subscribe(users => {
            this.users = users;
        });
    }

    assignTask() {
        if (this.task && this.selectedUserId) {
            this.taskService.assignTask(this.task.id, this.selectedUserId).subscribe(updatedTask => {
                this.task = updatedTask;
                alert('تم تعيين المهمة بنجاح');
            });
        }
    }

    goBack(): void {
        this.location.back();
    }
}
