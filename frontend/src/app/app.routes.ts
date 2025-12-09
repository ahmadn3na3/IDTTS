import { Routes } from '@angular/router';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board';
import { LoginComponent } from './components/login/login.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { DepartmentListComponent } from './components/department-list/department-list.component';
import { DepartmentFormComponent } from './components/department-form/department-form.component';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { TaskDetailComponent } from './components/task-detail/task-detail.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { UserRole } from './models/user.model';
import { CLevelDashboardComponent } from './components/c-level-dashboard/c-level-dashboard.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: 'dashboard',
        component: CLevelDashboardComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'users',
        component: UserListComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: [UserRole.ADMIN] }
    },
    {
        path: 'users/:id',
        component: UserFormComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: [UserRole.ADMIN] }
    },
    {
        path: 'departments',
        component: DepartmentListComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: [UserRole.ADMIN] }
    },
    {
        path: 'departments/:id',
        component: DepartmentFormComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: [UserRole.ADMIN] }
    },
    {
        path: 'tasks/new',
        component: TaskFormComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'tasks/:id',
        component: TaskDetailComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'reporting',
        loadComponent: () => import('./components/reporting-dashboard/reporting-dashboard.component').then(m => m.ReportingDashboardComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'reports/time-deviation',
        loadComponent: () => import('./components/time-deviation-report/time-deviation-report').then(m => m.TimeDeviationReportComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'reports/stopped-tasks',
        loadComponent: () => import('./components/stopped-tasks-report/stopped-tasks-report').then(m => m.StoppedTasksReportComponent),
        canActivate: [AuthGuard]
    },
    { path: '', component: KanbanBoardComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: '' }
];
