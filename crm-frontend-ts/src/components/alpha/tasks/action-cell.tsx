"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { useTasks } from "@/components/tasks/context/tasks-context";
import { Task } from "@/components/tasks/data/schema";

interface ActionCellProps {
    row: Task;
}

export function ActionCell({ row }: ActionCellProps) {
    const { setOpen, setCurrentRow } = useTasks();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Task actions</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => {
                        setCurrentRow(row);
                        setOpen("update");
                    }}
                >
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-red-500"
                    onClick={() => {
                        setCurrentRow(row);
                        setOpen("delete");
                    }}
                >
                    <Trash className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
