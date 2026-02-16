"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    MultiSelect,
    MultiSelectTrigger,
    MultiSelectContent,
    MultiSelectSearch,
    MultiSelectList,
    MultiSelectGroup,
    MultiSelectItem,
    MultiSelectValue,
    MultiSelectEmpty,
} from "@/components/ui/multiselect";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AddMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentMemberIds: number[];
    onAdd: (employeeIds: number[]) => Promise<void>;
}

export function AddMemberDialog({
    open,
    onOpenChange,
    currentMemberIds,
    onAdd,
}: AddMemberDialogProps) {
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (open) {
            setFetching(true);
            axios
                .post("/api/employees")
                .then((res) => {
                    setEmployees(res.data.attributes.employees || []);
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("Failed to load employees");
                })
                .finally(() => setFetching(false));
            setSelectedIds([]);
        }
    }, [open]);

    const handleAdd = async () => {
        if (selectedIds.length === 0) return;
        setLoading(true);
        try {
            await onAdd(selectedIds.map(Number));
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Filter out already assigned members
    const availableEmployees = employees.filter(
        (e) => !currentMemberIds.includes(Number(e.id))
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Team Members</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {fetching ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                                Select employees to add to this project.
                            </div>
                            <MultiSelect
                                onValueChange={setSelectedIds}
                                value={selectedIds}
                            >
                                <MultiSelectTrigger>
                                    <MultiSelectValue placeholder="Select employees..." />
                                </MultiSelectTrigger>
                                <MultiSelectContent>
                                    <MultiSelectSearch placeholder="Search employees..." />
                                    <MultiSelectList>
                                        <MultiSelectGroup heading="Available Employees">
                                            {availableEmployees.map((emp) => (
                                                <MultiSelectItem
                                                    key={emp.id}
                                                    value={String(emp.id)}
                                                >
                                                    {emp.name}
                                                </MultiSelectItem>
                                            ))}
                                        </MultiSelectGroup>
                                    </MultiSelectList>
                                    <MultiSelectEmpty>
                                        No available employees found.
                                    </MultiSelectEmpty>
                                </MultiSelectContent>
                            </MultiSelect>
                            <div className="text-xs text-muted-foreground text-right">
                                {selectedIds.length} selected
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAdd}
                        disabled={loading || selectedIds.length === 0}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Members
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
