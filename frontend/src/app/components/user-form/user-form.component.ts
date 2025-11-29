import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { DepartmentService } from '../../services/department.service';
import { User, UserRole } from '../../models/user.model';
import { Department } from '../../models/department.model';

@Component({
    selector: 'app-user-form',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './user-form.component.html',
    styleUrl: './user-form.component.css'
})
export class UserFormComponent implements OnInit {
    user: Partial<User> = {
        role: UserRole.REGULAR_USER
    };
    departments: Department[] = [];
    roles = Object.values(UserRole);
    isEditMode = false;
    isLoading = false;

    constructor(
        private userService: UserService,
        private departmentService: DepartmentService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.departmentService.getDepartments().subscribe(depts => this.departments = depts);

        const id = this.route.snapshot.paramMap.get('id');
        if (id && id !== 'new') {
            this.isEditMode = true;
            this.userService.getUsers().subscribe(users => {
                const found = users.find(u => u.id === id);
                if (found) {
                    this.user = { ...found };
                }
            });
        }
    }

    save() {
        this.isLoading = true;
        if (this.isEditMode && this.user.id) {
            this.userService.updateUser(this.user.id, this.user).subscribe(() => {
                this.router.navigate(['/users']);
            });
        } else {
            this.userService.createUser(this.user as User).subscribe(() => {
                this.router.navigate(['/users']);
            });
        }
    }
}
