import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User, UserRole } from '../../models/user.model';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css'
})
export class NavbarComponent {
    currentUser: User | null = null;
    UserRole = UserRole;

    constructor(public userService: UserService, private router: Router) {
        this.userService.currentUser$.subscribe(user => this.currentUser = user);
    }

    logout() {
        this.userService.logout();
        this.router.navigate(['/login']);
    }
}
