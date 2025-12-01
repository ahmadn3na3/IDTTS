import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { Task, TaskPriority } from '../../models/task.model';

import { Router } from '@angular/router';

@Component({
    selector: 'app-c-level-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './c-level-dashboard.component.html',
    styleUrls: ['./c-level-dashboard.component.css']
})
export class CLevelDashboardComponent implements OnInit {
    tasks: Task[] = [];
    highPriorityTasks: Task[] = [];
    mediumPriorityTasks: Task[] = [];
    lowPriorityTasks: Task[] = [];
    isLoading = true;

    constructor(private taskService: TaskService, private router: Router) { }

    ngOnInit(): void {
        this.loadTasks();
    }

    loadTasks(): void {
        this.taskService.getTasks().subscribe({
            next: (tasks) => {
                this.tasks = tasks;
                this.groupTasksByPriority();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading tasks', error);
                this.isLoading = false;
            }
        });
    }

    groupTasksByPriority(): void {
        const sortByDate = (a: Task, b: Task) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

        this.highPriorityTasks = this.tasks.filter(t => t.priority === TaskPriority.HIGH).sort(sortByDate);
        this.mediumPriorityTasks = this.tasks.filter(t => t.priority === TaskPriority.MEDIUM).sort(sortByDate);
        this.lowPriorityTasks = this.tasks.filter(t => t.priority === TaskPriority.LOW).sort(sortByDate);
    }

    getArabicStatus(status: string): string {
        const statusMap: { [key: string]: string } = {
            'New': 'جديد',
            'Under Review': 'قيد المراجعة',
            'Awaiting Approval': 'بانتظار الموافقة',
            'In Progress': 'قيد التنفيذ',
            'Blocked by Obstacle': 'متوقف لوجود عقبة',
            'Completed': 'مكتمل',
            'Closed': 'مغلق'
        };
        return statusMap[status] || status;
    }

    getArabicDepartment(department: string): string {
        const departmentMap: { [key: string]: string } = {
            'Sales': 'المبيعات',
            'Accounts': 'الحسابات',
            'Production': 'الإنتاج',
            'Purchasing': 'المشتريات',
            'Management': 'الإدارة',
            'Marketing': 'التسويق'
        };
        return departmentMap[department] || department;
    }

    viewTaskDetails(taskId: string): void {
        this.router.navigate(['/tasks', taskId]);
    }
}
