"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    CheckCircle,
    Clock,
    ListTodo,
    Trash2,
    Users,
    CalendarDays,
    ToggleRight,
    Briefcase,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import type { Project, ProjectTask } from "@/types/project";

interface OverviewTabProps {
    project: Project;
    tasks: ProjectTask[];
    onRefresh: () => void;
}

export function OverviewTab({ project, tasks, onRefresh }: OverviewTabProps) {
    const { user } = useAuth();
    const isAdmin = user?.role === "Admin";

    const openTasks = tasks.filter((t) => t.status !== "completed").length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;

    const leaders = project.participants?.filter((p) =>
        project.groupLeaderIds.includes(Number(p.id))
    );

    const handleToggleStatus = async () => {
        const newStatus = project.status === "open" ? "closed" : "open";
        try {
            const res = await fetch("/api/project-group/mark-project-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectGroupId: project.projectGroupId,
                    status: newStatus,
                }),
            });
            const result = await res.json();
            if (result.success) {
                toast.success(`Project marked as ${newStatus}`);
                onRefresh();
            } else {
                toast.error(result.error?.message || "Failed to update status");
            }
        } catch {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this project? This action is irreversible."
        );
        if (!confirmed) return;

        try {
            const res = await fetch("/api/project-group/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectGroupId: project.projectGroupId,
                }),
            });
            const result = await res.json();
            if (result.success) {
                toast.success("Project deleted successfully");
                onRefresh();
            } else {
                toast.error(result.error?.message || "Failed to delete project");
            }
        } catch {
            toast.error("Failed to delete project");
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            {/* Project header */}
            <div>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {project.projectName}
                        </h2>
                        <p className="text-muted-foreground mt-1">
                            {project.projectDesc || "No description provided."}
                        </p>
                    </div>
                    <Badge
                        variant={project.status === "open" ? "default" : "secondary"}
                        className="text-xs shrink-0"
                    >
                        {project.status?.toUpperCase()}
                    </Badge>
                </div>

                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    {project.clientName && (
                        <>
                            <Briefcase className="h-4 w-4" />
                            <span className="font-medium">Client: </span>
                            {project.clientId ? (
                                <Link
                                    href={`/clients/${project.clientId}`}
                                    className="hover:underline text-primary"
                                >
                                    {project.clientName}
                                </Link>
                            ) : (
                                <span>{project.clientName}</span>
                            )}
                            <span className="text-muted-foreground/40 mx-2">•</span>
                        </>
                    )}
                    <CalendarDays className="h-4 w-4" />
                    <span>Created {formatDate(project.createdAt)}</span>
                </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="bg-card">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <ListTodo className="h-4 w-4" />
                            <span className="text-xs font-medium">Total Tasks</span>
                        </div>
                        <p className="text-2xl font-bold">{tasks.length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-card">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs font-medium">In Progress</span>
                        </div>
                        <p className="text-2xl font-bold">{openTasks}</p>
                    </CardContent>
                </Card>
                <Card className="bg-card">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-xs font-medium">Completed</span>
                        </div>
                        <p className="text-2xl font-bold">{completedTasks}</p>
                    </CardContent>
                </Card>
                <Card className="bg-card">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Users className="h-4 w-4" />
                            <span className="text-xs font-medium">Members</span>
                        </div>
                        <p className="text-2xl font-bold">
                            {project.participants?.length || 0}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Group Leaders */}
            {leaders && leaders.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold mb-2">Group Leaders</h4>
                    <div className="flex flex-wrap gap-2">
                        {leaders.map((leader) => (
                            <Badge
                                key={leader.id}
                                variant="outline"
                                className="bg-primary/5 border-primary/20 text-primary py-1.5 px-3"
                            >
                                👤 {leader.name}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Admin actions */}
            {isAdmin && (
                <div className="flex items-center gap-3 pt-4 border-t">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={handleToggleStatus}
                    >
                        <ToggleRight className="h-4 w-4" />
                        Mark as {project.status === "open" ? "Closed" : "Open"}
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1.5"
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete Project
                    </Button>
                </div>
            )}
        </div>
    );
}
