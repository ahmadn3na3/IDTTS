import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DepartmentService } from '../../services/department.service';
import { Department } from '../../models/department.model';

@Component({
    selector: 'app-department-form',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './department-form.component.html',
    styleUrl: './department-form.component.css'
})
export class DepartmentFormComponent implements OnInit {
    department: Partial<Department> = {};
    isEditMode = false;
    isLoading = false;

    constructor(
        private departmentService: DepartmentService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id && id !== 'new') {
            this.isEditMode = true;
            this.departmentService.getDepartments().subscribe(depts => {
                const found = depts.find(d => d.id === id);
                if (found) {
                    this.department = { ...found };
                }
            });
        }
    }

    save() {
        this.isLoading = true;
        if (this.isEditMode && this.department.id) {
            this.departmentService.updateDepartment(this.department.id, this.department).subscribe(() => {
                this.router.navigate(['/departments']);
            });
        } else {
            this.departmentService.createDepartment(this.department as Department).subscribe(() => {
                this.router.navigate(['/departments']);
            });
        }
    }
}
