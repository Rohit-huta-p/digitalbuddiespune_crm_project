export type Participant = {
    id: string;
    name: string;
    role: string;
    phone?: string;
};

export type Project = {
    projectGroupId: number;
    projectName: string;
    projectDesc: string;
    status: string;
    createdAt?: string;
    createdById?: number;
    clientId?: number;
    clientName?: string;
    participants: Participant[];
    groupLeaderIds: number[];
};

export type ProjectTask = {
    taskId: number;
    taskName: string;
    description: string;
    deadlineTimestamp?: string;
    assignedTimestamp?: string;
    assignedBy: number;
    assignedEmployees: number[];
    priority?: "High" | "Medium" | "Low" | string;
    status: string;
};
