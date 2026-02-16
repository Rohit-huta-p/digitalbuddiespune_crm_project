"use client";

import { useEffect, useState } from "react";
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User } from "@/types/user";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const MarkPaidPage = () => {
    const [employees, setEmployees] = useState<User[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string>("");

    // Month picker state
    const currentYear = new Date().getFullYear();
    const [month, setMonth] = useState<string>("");
    const [year, setYear] = useState<string>(currentYear.toString());
    const [openDatePopover, setOpenDatePopover] = useState(false);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await fetch("/api/employees", { method: "POST" });
                const data = await res.json();
                setEmployees(data.attributes.employees || []);
            } catch (err) {
                console.error("Error fetching employees:", err);
                toast.error("Failed to load employees.");
            }
        };
        fetchEmployees();
    }, []);

    const handleMarkPaid = async () => {
        if (!selectedEmployee || !month || !year) {
            toast.error("Please select an employee and a month.");
            return;
        }

        setLoading(true);
        try {
            // Format date as YYYY-MM-DD (start of the month)
            // Month is 0-indexed in Date, but assuming our select returns 0-11 or 1-12
            // Let's use 1-12 for the value in select
            const formattedDate = `${year}-${month.padStart(2, "0")}-01`;

            const res = await fetch("/api/salary/markPaid", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: parseInt(selectedEmployee),
                    month: formattedDate,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to mark as paid");
            }

            toast.success("Salary marked as paid successfully.");
            setSelectedEmployee("");
            setMonth("");
            setYear(currentYear.toString());
        } catch (err: any) {
            console.error(err);
            if (err.message && err.message.includes("Salary record not found")) {
                toast.error("Salary record not found for this month. Please calculate the salary first.");
            } else {
                toast.error(err.message || "Error marking salary as paid.");
            }
        } finally {
            setLoading(false);
        }
    };

    const months = [
        { value: "1", label: "January" },
        { value: "2", label: "February" },
        { value: "3", label: "March" },
        { value: "4", label: "April" },
        { value: "5", label: "May" },
        { value: "6", label: "June" },
        { value: "7", label: "July" },
        { value: "8", label: "August" },
        { value: "9", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" },
    ];

    const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

    return (
        <Main>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Mark Salary as Paid</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Select Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Select Employee</Label>
                            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose an employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map((emp) => (
                                        <SelectItem key={emp.id} value={emp.id.toString()}>
                                            {emp.name} ({emp.role})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 flex flex-col">
                            <Label>Select Month</Label>
                            <Popover open={openDatePopover} onOpenChange={setOpenDatePopover}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            (!month || !year) && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {month && year ? `${months.find(m => m.value === month)?.label} ${year}` : <span>Pick a month</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-4" align="start">
                                    <div className="flex gap-2">
                                        <Select value={month} onValueChange={(v) => { setMonth(v); }}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Month" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {months.map((m) => (
                                                    <SelectItem key={m.value} value={m.value}>
                                                        {m.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select value={year} onValueChange={setYear}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map((y) => (
                                                    <SelectItem key={y} value={y}>
                                                        {y}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <Button size="sm" onClick={() => setOpenDatePopover(false)}>Done</Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <p className="text-[0.8rem] text-muted-foreground">The salary for the selected month will be marked as paid.</p>
                        </div>

                        <Button
                            className="w-full"
                            onClick={handleMarkPaid}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Mark as Paid"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </Main>
    );
};

export default MarkPaidPage;
