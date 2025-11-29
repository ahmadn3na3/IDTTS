import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TaskPriority, TaskStatus, Department } from '../task.enums';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true })
export class Task {
    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop()
    requestingParty: string;

    @Prop({ type: String, enum: TaskPriority })
    priority: TaskPriority;

    @Prop({ type: String, enum: TaskStatus, default: TaskStatus.NEW })
    status: TaskStatus;

    @Prop()
    startDate: Date;

    @Prop()
    plannedTime: number; // in days

    @Prop({ default: 0 })
    actualTime: number; // in days

    @Prop({ type: String, required: false })
    obstacle: string | null;

    @Prop({ type: String, enum: Department, default: Department.SALES })
    currentDepartment: Department;

    @Prop({ type: [Object], default: [] })
    flowLog: Record<string, any>[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);

// Add id virtual to match previous entity behavior if needed, 
// though usually _id is enough. 
// To ensure 'id' is present in JSON:
TaskSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete (ret as any)._id;
    }
});
