"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import type { Project } from "@/types/project";

interface ProjectListItemProps {
    project: Project;
    isSelected: boolean;
    onClick: () => void;
}

export function ProjectListItem({
    project,
    isSelected,
    onClick,
}: ProjectListItemProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full text-left p-3 rounded-lg border transition-all duration-150",
                "hover:bg-accent/50 hover:border-primary/30",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                    ? "bg-primary/5 border-primary/40 shadow-sm ring-1 ring-primary/20"
                    : "border-transparent bg-card"
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    {project.clientName && (
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">
                            {project.clientName}
                        </p>
                    )}
                    <p
                        className={cn(
                            "font-medium text-sm truncate",
                            isSelected && "text-primary"
                        )}
                    >
                        {project.name}
                    </p>
                    {project.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {project.description}
                        </p>
                    )}
                </div>
                <Badge
                    variant={project.status === "open" ? "default" : "secondary"}
                    className="text-[10px] px-1.5 py-0 h-5 shrink-0"
                >
                    {project.status?.toUpperCase()}
                </Badge>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>
                    {project.participants.length} member
                    {project.participants.length !== 1 ? "s" : ""}
                </span>
                {project.createdAt && (
                    <>
                        <span className="text-muted-foreground/40">•</span>
                        <span>
                            {new Date(project.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                            })}
                        </span>
                    </>
                )}
            </div>
        </button>
    );
}
