import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    username = '';
    password = '';
    error = '';
    isLoading = false;

    constructor(private userService: UserService, private router: Router) { }

    login() {
        this.isLoading = true;
        this.error = '';
        this.userService.login(this.username, this.password).subscribe({
            next: () => {
                this.router.navigate(['/']);
            },
            error: (err) => {
                this.error = 'Invalid username or password';
                this.isLoading = false;
            }
        });
    }
}
