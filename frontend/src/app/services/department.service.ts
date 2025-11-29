import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Department } from '../models/department.model';


@Injectable({
    providedIn: 'root'
})
export class DepartmentService {
    private mockDepartments: Department[] = [
        { id: 'Sales', name: 'Sales' },
        { id: 'Accounts', name: 'Accounts' },
        { id: 'Production', name: 'Production' },
        { id: 'Purchasing', name: 'Purchasing' }
    ];

    getDepartments(): Observable<Department[]> {
        return of(this.mockDepartments).pipe(delay(500));
    }

    createDepartment(department: Department): Observable<Department> {
        const newDept = { ...department, id: department.name }; // Simple ID gen
        this.mockDepartments.push(newDept);
        return of(newDept).pipe(delay(500));
    }

    updateDepartment(id: string, department: Partial<Department>): Observable<Department> {
        const index = this.mockDepartments.findIndex(d => d.id === id);
        if (index !== -1) {
            this.mockDepartments[index] = { ...this.mockDepartments[index], ...department };
            return of(this.mockDepartments[index]).pipe(delay(500));
        }
        return throwError(() => new Error('Department not found'));
    }

    deleteDepartment(id: string): Observable<void> {
        this.mockDepartments = this.mockDepartments.filter(d => d.id !== id);
        return of(void 0).pipe(delay(500));
    }
}
