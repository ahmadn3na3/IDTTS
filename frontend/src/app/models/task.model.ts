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

export interface FlowLogEntry {
    status: TaskStatus;
    department: string;
    timestamp: Date;
    action: string;
    reason?: string;
}

export interface Task {
    id: string;
    name: string;
    description?: string;
    requestingParty: string;
    priority: TaskPriority;
    status: TaskStatus;
    startDate?: Date;
    dueDate?: Date;
    plannedTime: number;
    actualTime: number;
    obstacle?: string;
    currentDepartment: string;
    assignedTo?: string; // User ID
    flowLog: FlowLogEntry[];
    createdAt: Date;
    updatedAt: Date;
}
