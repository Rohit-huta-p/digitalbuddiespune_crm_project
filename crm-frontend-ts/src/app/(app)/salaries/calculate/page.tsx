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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { User } from "@/types/user";

const CalculateSalaryPage = () => {
    const [employees, setEmployees] = useState<User[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string>("");
    const [manualTax, setManualTax] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

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

    const handleCalculate = async () => {
        if (!selectedEmployee) {
            toast.error("Please select an employee.");
            return;
        }

        setLoading(true);
        setResult(null);
        try {
            const payload: any = { id: parseInt(selectedEmployee) };
            if (manualTax) {
                payload.manualTaxPercentage = parseFloat(manualTax);
            }

            const res = await fetch("/api/salary/calculateDailySalary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to calculate salary");
            }

            const data = await res.json();
            setResult(data);
            toast.success("Salary calculated successfully.");
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Error calculating salary.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Main>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Calculate Daily Salary</h1>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Calculation Parameters</CardTitle>
                        <CardDescription>Select an employee to calculate their daily salary based on attendance.</CardDescription>
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

                        <div className="space-y-2">
                            <Label>Manual Tax Percentage (Optional)</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 5.0"
                                value={manualTax}
                                onChange={(e) => setManualTax(e.target.value)}
                            />
                            <p className="text-[0.8rem] text-muted-foreground">Leave empty to use default tax settings.</p>
                        </div>

                        <Button
                            className="w-full"
                            onClick={handleCalculate}
                            disabled={loading}
                        >
                            {loading ? "Calculating..." : "Calculate Salary"}
                        </Button>
                    </CardContent>
                </Card>

                {result && (
                    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <CardHeader>
                            <CardTitle className="text-green-800 dark:text-green-300">Calculation Result</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Base Salary</Label>
                                    <p className="text-xl font-semibold">₹{result.baseSalary?.toFixed(2) || '0.00'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Commission Earned</Label>
                                    <p className="text-xl font-semibold text-blue-600">₹{result.commissionEarned?.toFixed(2) || '0.00'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Gross Salary</Label>
                                    <p className="text-xl font-semibold">₹{result.grossSalary?.toFixed(2) || '0.00'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Tax Percentage</Label>
                                    <p className="text-xl font-semibold">{result.taxPercentage?.toFixed(2) || '0'}%</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Tax Amount</Label>
                                    <p className="text-xl font-semibold text-red-600">₹{result.taxAmount?.toFixed(2) || '0.00'}</p>
                                </div>
                                <div className="col-span-2 pt-4 border-t">
                                    <Label className="text-muted-foreground">Total Net Salary</Label>
                                    <p className="text-3xl font-bold text-green-700 dark:text-green-400">₹{result.netSalary?.toFixed(2) || result.totalSalary?.toFixed(2) || '0.00'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </Main>
    );
};

export default CalculateSalaryPage;
