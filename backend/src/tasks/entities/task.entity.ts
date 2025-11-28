import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TaskPriority, TaskStatus, Department } from '../task.enums';

@Entity()
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    requestingParty: string;

    @Column({
        type: 'enum',
        enum: TaskPriority,
    })
    priority: TaskPriority;

    @Column({
        type: 'enum',
        enum: TaskStatus,
        default: TaskStatus.NEW,
    })
    status: TaskStatus;

    @Column('int')
    plannedTime: number; // in days

    @Column('float', { default: 0 })
    actualTime: number; // in days

    @Column({ type: 'text', nullable: true })
    obstacle: string | null;

    @Column({
        type: 'enum',
        enum: Department,
        default: Department.SALES,
    })
    currentDepartment: Department;

    @Column('jsonb', { default: [] })
    flowLog: any[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
