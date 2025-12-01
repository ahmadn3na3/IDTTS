import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Task, TaskStatus, TaskPriority } from '../models/task.model';

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private apiUrl = 'http://localhost:3001/tasks';
    private useMock = true; // Toggle this to switch between mock and real backend

    private mockTasks: Task[] = [
        {
            id: '1',
            name: 'تطوير واجهة المستخدم',
            description: 'تصميم وتطوير واجهة المستخدم الجديدة للنظام',
            requestingParty: 'Sales Team A',
            priority: TaskPriority.HIGH,
            status: TaskStatus.NEW,
            startDate: new Date(),
            plannedTime: 5,
            actualTime: 0,
            currentDepartment: 'Sales',
            assignedTo: '3', // Assigned to sales_user
            flowLog: [
                {
                    status: TaskStatus.NEW,
                    department: 'Sales',
                    timestamp: new Date(Date.now() - 86400000), // 1 day ago
                    action: 'Created'
                }
            ],
            createdAt: new Date(Date.now() - 86400000),
            updatedAt: new Date(Date.now() - 86400000)
        },
        {
            id: '2',
            name: 'مراجعة الميزانية',
            description: 'مراجعة الميزانية السنوية للقسم',
            requestingParty: 'Sales Team B',
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.UNDER_REVIEW,
            plannedTime: 3,
            actualTime: 1,
            currentDepartment: 'Accounts',
            flowLog: [
                {
                    status: TaskStatus.NEW,
                    department: 'Sales',
                    timestamp: new Date(Date.now() - 172800000), // 2 days ago
                    action: 'Created'
                },
                {
                    status: TaskStatus.UNDER_REVIEW,
                    department: 'Accounts',
                    timestamp: new Date(Date.now() - 86400000), // 1 day ago
                    action: 'Submitted for Review'
                }
            ],
            createdAt: new Date(Date.now() - 172800000),
            updatedAt: new Date(Date.now() - 86400000)
        },
        {
            id: '3',
            name: 'حملة تسويقية',
            description: 'إطلاق الحملة التسويقية للمنتج الجديد',
            requestingParty: 'Marketing',
            priority: TaskPriority.LOW,
            status: TaskStatus.IN_PROGRESS,
            plannedTime: 10,
            actualTime: 4,
            currentDepartment: 'Production',
            flowLog: [
                {
                    status: TaskStatus.NEW,
                    department: 'Sales',
                    timestamp: new Date(Date.now() - 432000000), // 5 days ago
                    action: 'Created'
                },
                {
                    status: TaskStatus.UNDER_REVIEW,
                    department: 'Accounts',
                    timestamp: new Date(Date.now() - 345600000), // 4 days ago
                    action: 'Submitted for Review'
                },
                {
                    status: TaskStatus.IN_PROGRESS,
                    department: 'Production',
                    timestamp: new Date(Date.now() - 259200000), // 3 days ago
                    action: 'Credit Approved'
                }
            ],
            createdAt: new Date(Date.now() - 432000000),
            updatedAt: new Date(Date.now() - 259200000)
        },
        {
            id: '4',
            name: 'شراء مواد خام',
            description: 'شراء المواد الخام اللازمة للإنتاج',
            requestingParty: 'Management',
            priority: TaskPriority.HIGH,
            status: TaskStatus.BLOCKED,
            plannedTime: 7,
            actualTime: 3,
            obstacle: 'Missing raw materials',
            currentDepartment: 'Purchasing',
            flowLog: [
                {
                    status: TaskStatus.NEW,
                    department: 'Sales',
                    timestamp: new Date(Date.now() - 604800000), // 7 days ago
                    action: 'Created'
                },
                {
                    status: TaskStatus.UNDER_REVIEW,
                    department: 'Accounts',
                    timestamp: new Date(Date.now() - 518400000), // 6 days ago
                    action: 'Submitted for Review'
                },
                {
                    status: TaskStatus.IN_PROGRESS,
                    department: 'Production',
                    timestamp: new Date(Date.now() - 432000000), // 5 days ago
                    action: 'Credit Approved'
                },
                {
                    status: TaskStatus.BLOCKED,
                    department: 'Purchasing',
                    timestamp: new Date(Date.now() - 172800000), // 2 days ago
                    action: 'Obstacle Reported: Missing raw materials'
                }
            ],
            createdAt: new Date(Date.now() - 604800000),
            updatedAt: new Date(Date.now() - 172800000)
        },
        {
            id: '5',
            name: 'تقرير المبيعات',
            description: 'إعداد تقرير المبيعات الشهري',
            requestingParty: 'Sales Team C',
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.COMPLETED,
            plannedTime: 2,
            actualTime: 2,
            currentDepartment: 'Sales',
            flowLog: [
                {
                    status: TaskStatus.NEW,
                    department: 'Sales',
                    timestamp: new Date(Date.now() - 259200000), // 3 days ago
                    action: 'Created'
                },
                {
                    status: TaskStatus.UNDER_REVIEW,
                    department: 'Accounts',
                    timestamp: new Date(Date.now() - 172800000), // 2 days ago
                    action: 'Submitted for Review'
                },
                {
                    status: TaskStatus.IN_PROGRESS,
                    department: 'Production',
                    timestamp: new Date(Date.now() - 86400000), // 1 day ago
                    action: 'Credit Approved'
                },
                {
                    status: TaskStatus.COMPLETED,
                    department: 'Sales',
                    timestamp: new Date(),
                    action: 'Production Completed'
                }
            ],
            createdAt: new Date(Date.now() - 259200000),
            updatedAt: new Date()
        }
    ];

    constructor(private http: HttpClient) { }

    getTasks(): Observable<Task[]> {
        if (this.useMock) {
            return of([...this.mockTasks]).pipe(delay(500));
        }
        return this.http.get<Task[]>(this.apiUrl);
    }

    createTask(taskData: Partial<Task>): Observable<Task> {
        if (this.useMock) {
            const newTask: Task = {
                id: Math.random().toString(36).substr(2, 9),
                name: taskData.name!,
                description: taskData.description,
                requestingParty: taskData.requestingParty!,
                priority: taskData.priority!,
                status: TaskStatus.UNDER_REVIEW, // Simulating backend logic
                plannedTime: taskData.plannedTime!,
                actualTime: 0,
                currentDepartment: taskData.currentDepartment || 'Accounts', // Use provided department or default
                flowLog: [{
                    status: TaskStatus.NEW,
                    department: 'Sales',
                    timestamp: new Date(),
                    action: 'Created'
                }],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            this.mockTasks.unshift(newTask);
            return of(newTask).pipe(delay(500));
        }
        return this.http.post<Task>(this.apiUrl, taskData);
    }

    submitForReview(id: string): Observable<Task> {
        if (this.useMock) {
            const task = this.mockTasks.find(t => t.id === id);
            if (task) {
                task.status = TaskStatus.UNDER_REVIEW;
                task.currentDepartment = 'Accounts';
                task.flowLog.push({
                    status: TaskStatus.UNDER_REVIEW,
                    department: 'Accounts',
                    timestamp: new Date(),
                    action: 'Submitted for Review'
                });
                return of(task).pipe(delay(500));
            }
            return throwError(() => new Error('Task not found'));
        }
        return this.http.patch<Task>(`${this.apiUrl}/${id}/submit-review`, {});
    }



    assignTask(id: string, userId: string): Observable<Task> {
        if (this.useMock) {
            const task = this.mockTasks.find(t => t.id === id);
            if (task) {
                task.assignedTo = userId;
                task.flowLog.push({
                    status: task.status,
                    department: task.currentDepartment,
                    timestamp: new Date(),
                    action: `Assigned to user ${userId}`
                });
                return of(task).pipe(delay(500));
            }
            return throwError(() => new Error('Task not found'));
        }
        return this.http.patch<Task>(`${this.apiUrl}/${id}/assign`, { userId });
    }

    approveCredit(id: string): Observable<Task> {
        if (this.useMock) {
            const task = this.mockTasks.find(t => t.id === id);
            if (task) {
                task.status = TaskStatus.IN_PROGRESS;
                task.currentDepartment = 'Production';
                task.flowLog.push({
                    status: TaskStatus.IN_PROGRESS,
                    department: 'Production',
                    timestamp: new Date(),
                    action: 'Credit Approved'
                });
                return of(task).pipe(delay(500));
            }
            return throwError(() => new Error('Task not found'));
        }
        return this.http.patch<Task>(`${this.apiUrl}/${id}/approve-credit`, {});
    }

    reportObstacle(id: string, obstacle: string): Observable<Task> {
        if (this.useMock) {
            const task = this.mockTasks.find(t => t.id === id);
            if (task) {
                task.status = TaskStatus.BLOCKED;
                task.currentDepartment = 'Purchasing';
                task.obstacle = obstacle;
                task.flowLog.push({
                    status: TaskStatus.BLOCKED,
                    department: 'Purchasing',
                    timestamp: new Date(),
                    action: `Obstacle Reported: ${obstacle}`
                });
                return of(task).pipe(delay(500));
            }
            return throwError(() => new Error('Task not found'));
        }
        return this.http.patch<Task>(`${this.apiUrl}/${id}/report-obstacle`, { obstacle });
    }

    resolveObstacle(id: string): Observable<Task> {
        if (this.useMock) {
            const task = this.mockTasks.find(t => t.id === id);
            if (task) {
                task.status = TaskStatus.IN_PROGRESS;
                task.currentDepartment = 'Production';
                task.obstacle = undefined;
                task.flowLog.push({
                    status: TaskStatus.IN_PROGRESS,
                    department: 'Production',
                    timestamp: new Date(),
                    action: 'Obstacle Resolved'
                });
                return of(task).pipe(delay(500));
            }
            return throwError(() => new Error('Task not found'));
        }
        return this.http.patch<Task>(`${this.apiUrl}/${id}/resolve-obstacle`, {});
    }

    completeProduction(id: string): Observable<Task> {
        if (this.useMock) {
            const task = this.mockTasks.find(t => t.id === id);
            if (task) {
                task.status = TaskStatus.COMPLETED;
                task.currentDepartment = 'Sales';
                task.flowLog.push({
                    status: TaskStatus.COMPLETED,
                    department: 'Sales',
                    timestamp: new Date(),
                    action: 'Production Completed'
                });
                return of(task).pipe(delay(500));
            }
            return throwError(() => new Error('Task not found'));
        }
        return this.http.patch<Task>(`${this.apiUrl}/${id}/complete-production`, {});
    }

    closeTask(id: string): Observable<Task> {
        if (this.useMock) {
            const task = this.mockTasks.find(t => t.id === id);
            if (task) {
                task.status = TaskStatus.CLOSED;
                task.flowLog.push({
                    status: TaskStatus.CLOSED,
                    department: task.currentDepartment,
                    timestamp: new Date(),
                    action: 'Task Closed'
                });
                return of(task).pipe(delay(500));
            }
            return throwError(() => new Error('Task not found'));
        }
        return this.http.patch<Task>(`${this.apiUrl}/${id}/close`, {});
    }
}
