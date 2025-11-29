import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DepartmentService } from '../../services/department.service';
import { Department } from '../../models/department.model';

@Component({
    selector: 'app-department-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './department-list.component.html',
    styleUrl: './department-list.component.css'
})
export class DepartmentListComponent implements OnInit {
    departments: Department[] = [];

    constructor(private departmentService: DepartmentService) { }

    ngOnInit() {
        this.loadDepartments();
    }

    loadDepartments() {
        this.departmentService.getDepartments().subscribe(depts => this.departments = depts);
    }

    deleteDepartment(id: string) {
        if (confirm('هل أنت متأكد من حذف هذا القسم؟')) {
            this.departmentService.deleteDepartment(id).subscribe(() => this.loadDepartments());
        }
    }
}
