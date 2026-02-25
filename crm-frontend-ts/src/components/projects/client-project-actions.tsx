"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ClientProjectActions() {
    const { user } = useAuth();

    if (user?.role?.toLowerCase() === "employee") {
        return null;
    }

    return (
        <Link href="/projects/new">
            <Button className="space-x-1">Create Project</Button>
        </Link>
    );
}
