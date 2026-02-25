"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Project } from "@/types/project";
import { ProjectSearchInput } from "./project-search-input";
import { ProjectStatusFilter } from "./project-status-filter";
import { ProjectListItem } from "./project-list-item";
import { ProjectListSkeleton } from "./project-list-skeleton";
import { useAuth } from "@/context/auth-context";

interface ProjectListProps {
    projects: Project[];
    totalProjects: number;
    selectedProjectId: number | null;
    page: number;
    pageSize: number;
    search: string;
    statusFilter: string;
    loading: boolean;
    onSelectProject: (id: number) => void;
    onSearchChange: (query: string) => void;
    onStatusChange: (status: string) => void;
    onPageChange: (page: number) => void;
}

export function ProjectList({
    projects,
    totalProjects,
    selectedProjectId,
    page,
    pageSize,
    search,
    statusFilter,
    loading,
    onSelectProject,
    onSearchChange,
    onStatusChange,
    onPageChange,
}: ProjectListProps) {
    const router = useRouter();
    const { user } = useAuth();
    const totalPages = Math.max(1, Math.ceil(totalProjects / pageSize));

    // Group projects by status
    const openProjects = projects.filter((p) => p.status === "open");
    const closedProjects = projects.filter((p) => p.status !== "open");

    const renderGroup = (label: string, items: Project[]) => {
        if (items.length === 0) return null;
        return (
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 py-1.5">
                    {label} ({items.length})
                </p>
                <div className="space-y-1">
                    {items.map((project) => (
                        <ProjectListItem
                            key={project.id}
                            project={project}
                            isSelected={selectedProjectId === project.id}
                            onClick={() => onSelectProject(project.id)}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold tracking-tight">Projects</h2>
                        <p className="text-xs text-muted-foreground">
                            {totalProjects} total
                        </p>
                    </div>
                    {user?.role?.toLowerCase() !== "employee" && (
                        <Button
                            size="sm"
                            className="h-8 gap-1"
                            onClick={() => router.push("/projects/new")}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            New
                        </Button>
                    )}
                </div>
                <ProjectSearchInput onSearch={onSearchChange} defaultValue={search} />
                <ProjectStatusFilter value={statusFilter} onChange={onStatusChange} />
            </div>

            {/* List */}
            <ScrollArea className="flex-1">
                {loading ? (
                    <ProjectListSkeleton />
                ) : projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="rounded-full bg-muted p-3 mb-3">
                            <Plus className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                            No projects found
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                            {search ? "Try a different search term" : "Create your first project"}
                        </p>
                    </div>
                ) : (
                    <div className="p-2 space-y-3">
                        {statusFilter === "" ? (
                            <>
                                {renderGroup("Open", openProjects)}
                                {renderGroup("Closed", closedProjects)}
                            </>
                        ) : (
                            <div className="space-y-1">
                                {projects.map((project) => (
                                    <ProjectListItem
                                        key={project.id}
                                        project={project}
                                        isSelected={selectedProjectId === project.id}
                                        onClick={() => onSelectProject(project.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </ScrollArea>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-3 border-t flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => onPageChange(Math.max(1, page - 1))}
                        disabled={page === 1}
                    >
                        ← Prev
                    </Button>
                    <span className="text-xs text-muted-foreground">
                        {page} / {totalPages}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                    >
                        Next →
                    </Button>
                </div>
            )}
        </div>
    );
}
