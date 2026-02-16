"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Crown, Trash2, UserPlus } from "lucide-react";
import type { Project } from "@/types/project";
import { AddMemberDialog } from "../dialogs/add-member-dialog";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TeamTabProps {
    project: Project;
    onRefresh?: () => void;
}

export function TeamTab({ project, onRefresh }: TeamTabProps) {
    const { participants, groupLeaderIds } = project;
    const { user } = useAuth();
    const isAdmin = user?.role === "Admin";
    // Check if current user is a group leader
    const isLeader = user?.employeeId && groupLeaderIds.includes(Number(user.employeeId));
    const canManage = isAdmin || isLeader;

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAddMembers = async (employeeIds: number[]) => {
        try {
            const res = await fetch("/api/project-group/add-participant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectGroupId: project.projectGroupId,
                    companyId: "1", // TODO: Get from context/user
                    employeeIds,
                }),
            });
            const result = await res.json();
            if (result.success) {
                toast.success("Members added successfully");
                onRefresh?.();
            } else {
                toast.error(result.error?.message || "Failed to add members");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to add members");
        }
    };

    const handleRemoveMember = async (employeeId: string) => {
        setLoading(true);
        try {
            const res = await fetch("/api/project-group/remove-participant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectGroupId: project.projectGroupId,
                    companyId: "1",
                    employeeId,
                }),
            });
            const result = await res.json();
            if (result.success) {
                toast.success("Member removed successfully");
                onRefresh?.();
            } else {
                toast.error(result.error?.message || "Failed to remove member");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to remove member");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Team Members</h3>
                    <p className="text-sm text-muted-foreground">
                        {participants.length} member
                        {participants.length !== 1 ? "s" : ""} assigned to this project
                    </p>
                </div>
                {canManage && (
                    <Button onClick={() => setIsAddOpen(true)} size="sm" className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Add Member
                    </Button>
                )}
            </div>

            {participants.length === 0 ? (
                <div className="text-center py-8 border rounded-lg border-dashed">
                    <p className="text-muted-foreground text-sm">No team members yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {participants.map((member) => {
                        const isMemberLeader = groupLeaderIds.includes(Number(member.id));
                        return (
                            <Card
                                key={member.id}
                                className={
                                    isMemberLeader
                                        ? "border-primary/30 bg-primary/5"
                                        : "bg-card"
                                }
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-sm truncate">
                                                    {member.name}
                                                </p>
                                                {isMemberLeader && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] h-4 px-1 border-primary/30 text-primary gap-0.5"
                                                    >
                                                        <Crown className="h-2.5 w-2.5" />
                                                        Leader
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {member.role?.replace(/_/g, " ")}
                                            </p>
                                        </div>
                                        {canManage && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-muted-foreground hover:text-destructive -mr-2 -mt-1"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to remove{" "}
                                                            <span className="font-medium text-foreground">
                                                                {member.name}
                                                            </span>{" "}
                                                            from this project?
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleRemoveMember(member.id);
                                                            }}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Remove
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                    {member.phone && (
                                        <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                                            <Phone className="h-3 w-3" />
                                            <span>{member.phone}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <AddMemberDialog
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                currentMemberIds={participants.map((p) => Number(p.id))}
                onAdd={handleAddMembers}
            />
        </div>
    );
}
