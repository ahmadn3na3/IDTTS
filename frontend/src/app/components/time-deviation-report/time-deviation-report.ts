import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Chart, registerables, ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { TaskService } from '../../services/task.service';
import { DepartmentService } from '../../services/department.service';
import { Task } from '../../models/task.model';
import { Department } from '../../models/department.model';

Chart.register(...registerables, ChartDataLabels);

@Component({
    selector: 'app-time-deviation-report',
    standalone: true,
    imports: [CommonModule, BaseChartDirective, RouterModule],
    templateUrl: './time-deviation-report.html',
    styles: [`
    .chart-container {
      position: relative;
      height: 400px;
      width: 100%;
    }
  `]
})
export class TimeDeviationReportComponent implements OnInit {
    @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

    tasks: any[] = [];
    departments: Department[] = [];
    displayedTasks: any[] = [];

    public chartData: ChartData<'bar'> = {
        labels: [],
        datasets: []
    };

    public chartOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.dataset.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${value} يوم`;
                    }
                }
            },
            datalabels: {
                color: '#fff',
                font: { weight: 'bold' },
                formatter: (value) => value > 0 ? value : ''
            }
        }
    };

    constructor(
        private taskService: TaskService,
        private departmentService: DepartmentService,
        private router: Router
    ) { }

    ngOnInit() {
        forkJoin({
            tasks: this.taskService.getTasks(),
            departments: this.departmentService.getDepartments()
        }).subscribe(({ tasks, departments }) => {
            this.departments = departments;
            this.processData(tasks);
        });
    }

    processData(tasks: Task[]) {
        // 1. Prepare Chart Data (Aggregated by Dept)
        const deptMap = new Map<string, { planned: number, actual: number, name: string }>();

        // Initialize map with departments
        this.departments.forEach(d => {
            deptMap.set(d.id, { planned: 0, actual: 0, name: d.name });
        });
        // Add 'Other' if needed
        if (!deptMap.has('Other')) deptMap.set('Other', { planned: 0, actual: 0, name: 'Other' });

        tasks.forEach(t => {
            const deptId = t.currentDepartment || 'Other';
            const entry = deptMap.get(deptId) || deptMap.get('Other')!;
            entry.planned += t.plannedTime || 0;
            entry.actual += t.actualTime || 0;

            // Enhance task object for list
            (t as any).delay = (t.actualTime || 0) - (t.plannedTime || 0);
        });

        const labels = Array.from(deptMap.values()).map(d => d.name);
        const plannedData = Array.from(deptMap.values()).map(d => d.planned);
        const actualData = Array.from(deptMap.values()).map(d => d.actual);

        this.chartData = {
            labels: labels,
            datasets: [
                {
                    label: 'الوقت المخطط (أيام)',
                    data: plannedData,
                    backgroundColor: '#4CAF50',
                    borderColor: '#388E3C',
                    borderWidth: 1
                },
                {
                    label: 'الوقت الفعلي (أيام)',
                    data: actualData,
                    backgroundColor: '#E53935',
                    borderColor: '#D32F2F',
                    borderWidth: 1
                }
            ]
        };

        // 2. Prepare Detailed List (Sorted by Delay Descending)
        this.tasks = tasks;
        this.displayedTasks = [...tasks].sort((a: any, b: any) => b.delay - a.delay);
    }

    onTaskClick(taskId: string) {
        this.router.navigate(['/tasks', taskId]);
    }
}
