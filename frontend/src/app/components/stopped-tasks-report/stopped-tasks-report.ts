import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus } from '../../models/task.model';

@Component({
    selector: 'app-stopped-tasks-report',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './stopped-tasks-report.html',
})
export class StoppedTasksReportComponent implements OnInit {
    stoppedTasks: any[] = [];
    today: Date = new Date();

    constructor(private taskService: TaskService) { }

    ngOnInit() {
        this.taskService.getTasks().subscribe(tasks => {
            this.processTasks(tasks);
        });
    }

    processTasks(tasks: Task[]) {
        this.stoppedTasks = tasks
            .filter(t => t.status === TaskStatus.BLOCKED)
            .map(t => {
                let delayDays = 0;
                if (t.dueDate) {
                    const diffTime = this.today.getTime() - new Date(t.dueDate).getTime();
                    delayDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                }

                return {
                    ...t,
                    delayDays: delayDays > 0 ? delayDays : 0, // Only show positive delay
                    isOverdue: delayDays > 0
                };
            })
            // Sort by delay (descending) then priority
            .sort((a, b) => b.delayDays - a.delayDays);
    }
}
