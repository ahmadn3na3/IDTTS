import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';
import { TaskPriority, TaskStatus } from '../models/task.model'; // Use Department enum from task model for consistency

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    private mockUsers: User[] = [
        { id: '1', username: 'admin', password: 'password', role: UserRole.ADMIN },
        { id: '2', username: 'sales_head', password: 'password', role: UserRole.DEPARTMENT_HEAD, department: 'Sales' },
        { id: '3', username: 'sales_user', password: 'password', role: UserRole.REGULAR_USER, department: 'Sales' },
        { id: '4', username: 'production_head', password: 'password', role: UserRole.DEPARTMENT_HEAD, department: 'Production' },
        { id: '5', username: 'production_user', password: 'password', role: UserRole.REGULAR_USER, department: 'Production' },
    ];

    constructor() {
        // Check local storage for persisted user
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            this.currentUserSubject.next(JSON.parse(storedUser));
        }
    }

    login(username: string, password: string): Observable<User> {
        const user = this.mockUsers.find(u => u.username === username && u.password === password);
        if (user) {
            return of(user).pipe(
                delay(500),
                tap(u => {
                    this.currentUserSubject.next(u);
                    localStorage.setItem('currentUser', JSON.stringify(u));
                })
            );
        }
        return throwError(() => new Error('Invalid credentials'));
    }

    logout() {
        this.currentUserSubject.next(null);
        localStorage.removeItem('currentUser');
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    getUsers(): Observable<User[]> {
        return of(this.mockUsers).pipe(delay(500));
    }

    createUser(user: User): Observable<User> {
        const newUser = { ...user, id: Math.random().toString(36).substr(2, 9) };
        this.mockUsers.push(newUser);
        return of(newUser).pipe(delay(500));
    }

    updateUser(id: string, user: Partial<User>): Observable<User> {
        const index = this.mockUsers.findIndex(u => u.id === id);
        if (index !== -1) {
            this.mockUsers[index] = { ...this.mockUsers[index], ...user };
            return of(this.mockUsers[index]).pipe(delay(500));
        }
        return throwError(() => new Error('User not found'));
    }

    deleteUser(id: string): Observable<void> {
        this.mockUsers = this.mockUsers.filter(u => u.id !== id);
        return of(void 0).pipe(delay(500));
    }
}
