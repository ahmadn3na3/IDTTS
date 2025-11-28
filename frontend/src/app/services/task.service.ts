import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private apiUrl = 'http://localhost:3001/tasks';

    constructor(private http: HttpClient) { }

    getTasks(): Observable<Task[]> {
        return this.http.get<Task[]>(this.apiUrl);
    }

    createTask(task: Partial<Task>): Observable<Task> {
        return this.http.post<Task>(this.apiUrl, task);
    }

    approveCredit(id: string): Observable<Task> {
        return this.http.patch<Task>(`${this.apiUrl}/${id}/approve-credit`, {});
    }

    reportObstacle(id: string, obstacle: string): Observable<Task> {
        return this.http.patch<Task>(`${this.apiUrl}/${id}/report-obstacle`, { obstacle });
    }

    resolveObstacle(id: string): Observable<Task> {
        return this.http.patch<Task>(`${this.apiUrl}/${id}/resolve-obstacle`, {});
    }

    completeProduction(id: string): Observable<Task> {
        return this.http.patch<Task>(`${this.apiUrl}/${id}/complete-production`, {});
    }

    closeTask(id: string): Observable<Task> {
        return this.http.patch<Task>(`${this.apiUrl}/${id}/close`, {});
    }
}
