"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OverviewTab } from "./tabs/overview-tab";
import { TasksTab } from "./tabs/tasks-tab";
import { TeamTab } from "./tabs/team-tab";
import { ActivityTab } from "./tabs/activity-tab";
import { ProjectWorkspaceSkeleton } from "./project-workspace-skeleton";
import { toast } from "sonner";
import type { Project, ProjectTask } from "@/types/project";

interface ProjectWorkspaceProps {
    projectId: number;
    onProjectDeleted: () => void;
}

export function ProjectWorkspace({
    projectId,
    onProjectDeleted,
}: ProjectWorkspaceProps) {
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<ProjectTask[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProjectDetails = useCallback(async () => {
        try {
            const res = await fetch(`/api/project-group/get-by-id`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectGroupId: String(projectId) }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result?.error?.message || "Project error");
            setProject(result.data);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Error fetching project");
        }
    }, [projectId]);

    const fetchProjectTasks = useCallback(async () => {
        try {
            const res = await fetch(`/api/project-group/get-tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectGroupId: String(projectId) }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result?.error?.message || "Task error");
            setTasks(result.data?.tasks || []);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Error loading tasks");
        }
    }, [projectId]);

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            await Promise.all([fetchProjectDetails(), fetchProjectTasks()]);
        } finally {
            setLoading(false);
        }
    }, [fetchProjectDetails, fetchProjectTasks]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const handleRefresh = () => {
        loadAll();
        onProjectDeleted();
    };

    if (loading) {
        return <ProjectWorkspaceSkeleton />;
    }

    if (!project) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                Project not found.
            </div>
        );
    }

    return (
        <ScrollArea className="h-full">
            <div className="p-6">
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="bg-muted/50">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="tasks">Tasks</TabsTrigger>
                        <TabsTrigger value="team">Team</TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <OverviewTab
                            project={project}
                            tasks={tasks}
                            onRefresh={handleRefresh}
                        />
                    </TabsContent>

                    <TabsContent value="tasks">
                        <TasksTab
                            project={project}
                            tasks={tasks}
                            loading={loading}
                            onRefresh={handleRefresh}
                        />
                    </TabsContent>

                    <TabsContent value="team">
                        <TeamTab project={project} onRefresh={handleRefresh} />
                    </TabsContent>

                    <TabsContent value="activity">
                        <ActivityTab />
                    </TabsContent>
                </Tabs>
            </div>
        </ScrollArea>
    );
}
