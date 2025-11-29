

export enum UserRole {
    ADMIN = 'Admin',
    DEPARTMENT_HEAD = 'Department Head',
    REGULAR_USER = 'Regular User'
}

export interface User {
    id: string;
    username: string;
    password?: string; // Optional for security in frontend, but needed for mock login
    role: UserRole;
    department?: string; // Optional for Admin
}
