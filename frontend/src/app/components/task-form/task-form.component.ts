import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DepartmentService } from '../../services/department.service';
import { Department } from '../../models/department.model';
import { TaskService } from '../../services/task.service';
import { Task, TaskPriority } from '../../models/task.model';

@Component({
    selector: 'app-task-form',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './task-form.component.html',
    styleUrl: './task-form.component.css'
})
export class TaskFormComponent implements OnInit {
    task: Partial<Task> = {
        priority: TaskPriority.MEDIUM,
        plannedTime: 5
    };
    priorities = Object.values(TaskPriority);
    departments: Department[] = [];
    isLoading = false;

    constructor(
        private taskService: TaskService,
        private departmentService: DepartmentService,
        private router: Router
    ) { }

    ngOnInit() {
        this.departmentService.getDepartments().subscribe(deps => {
            this.departments = deps;
            // Set default department if available
            if (this.departments.length > 0) {
                this.task.currentDepartment = this.departments[0].name;
            }
        });
    }

    save() {
        this.isLoading = true;
        this.taskService.createTask(this.task).subscribe(() => {
            this.router.navigate(['/']);
        });
    }
}
