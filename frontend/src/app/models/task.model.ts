export enum TaskPriority {
    HIGH = 'High',
    MEDIUM = 'Medium',
    LOW = 'Low',
}

export enum TaskStatus {
    NEW = 'New',
    UNDER_REVIEW = 'Under Review',
    AWAITING_APPROVAL = 'Awaiting Approval',
    IN_PROGRESS = 'In Progress',
    BLOCKED = 'Blocked by Obstacle',
    COMPLETED = 'Completed',
    CLOSED = 'Closed',
}

export enum Department {
    SALES = 'Sales',
    ACCOUNTS = 'Accounts',
    PRODUCTION = 'Production',
    PURCHASING = 'Purchasing',
}

export interface Task {
    id: string;
    requestingParty: string;
    priority: TaskPriority;
    status: TaskStatus;
    plannedTime: number;
    actualTime: number;
    obstacle?: string;
    currentDepartment: Department;
    flowLog: any[];
    createdAt: Date;
    updatedAt: Date;
}
