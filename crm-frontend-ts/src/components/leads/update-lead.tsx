/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
    Pencil,
    User,
    Phone,
    Building,
    Activity,
    Briefcase,
    Loader2,
} from "lucide-react";

interface LeadData {
    id: number;
    name: string;
    phoneNumber: string;
    business: string;
    status: string;
    employee?: {
        id: number;
        name?: string;
    };
    employeeId?: number;
}

export default function UpdateLeadPage({ defaultLeadId }: { defaultLeadId?: number }) {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    const [form, setForm] = useState({
        name: "",
        phoneNumber: "",
        business: "",
        status: "NEW",
        employeeId: "",
    });

    // Fetch employees for the dropdown
    useEffect(() => {
        const fetchEmployees = async () => {
            setLoadingEmployees(true);
            try {
                const res = await axios.post("/api/employees");
                if (res.data?.attributes?.employees) {
                    setEmployees(res.data.attributes.employees);
                }
            } catch (err) {
                console.error("Failed to load employees:", err);
            } finally {
                setLoadingEmployees(false);
            }
        };
        fetchEmployees();
    }, []);

    // Fetch lead data to pre-populate
    useEffect(() => {
        if (!defaultLeadId) return;

        const fetchLead = async () => {
            setFetching(true);
            try {
                const res = await axios.get("/api/lead/list");
                const data = res.data;
                if (data.success && data.leads) {
                    const lead = data.leads.find((l: LeadData) => l.id === defaultLeadId);
                    if (lead) {
                        setForm({
                            name: lead.name || "",
                            phoneNumber: lead.phoneNumber || "",
                            business: lead.business || "",
                            status: lead.status || "NEW",
                            employeeId: lead.employee?.id
                                ? String(lead.employee.id)
                                : lead.employeeId
                                    ? String(lead.employeeId)
                                    : "",
                        });
                    } else {
                        toast.error("Lead not found in list");
                    }
                }
            } catch (err) {
                console.error("Failed to fetch lead:", err);
                toast.error("Failed to load lead data");
            }
            setFetching(false);
        };
        fetchLead();
    }, [defaultLeadId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!defaultLeadId) {
            toast.error("No lead selected");
            return;
        }

        if (!form.name || !form.phoneNumber || !form.business || !form.status) {
            toast.error("Please fill all required fields");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post("/api/lead/update", {
                leadId: defaultLeadId,
                name: form.name,
                phoneNumber: form.phoneNumber,
                business: form.business,
                status: form.status,
                ...(form.employeeId ? { employeeId: parseInt(form.employeeId) } : {}),
            });

            const data = res.data;

            if (data.success) {
                toast.success(data.message || "Lead updated successfully");
            } else {
                toast.error(data.error?.message || "Something went wrong");
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response && err.response.data) {
                toast.error(err.response.data.error?.message || "Failed to update lead");
            } else {
                toast.error("Failed to update lead");
            }
        }

        setLoading(false);
    };

    if (fetching) {
        return (
            <div className="w-full flex justify-center mt-2 px-2">
                <Card className="w-full max-w-2xl shadow-sm border rounded-2xl">
                    <CardContent className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading lead data...
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center mt-2 px-2">
            <Card className="w-full max-w-2xl shadow-sm border rounded-2xl">
                <CardHeader className="bg-muted/30 border-b pb-4 mb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Pencil className="w-5 h-5 text-blue-600" />
                        Update Lead
                        {defaultLeadId && (
                            <span className="text-sm font-normal text-muted-foreground ml-1">
                                #{defaultLeadId}
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-5">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label className="text-muted-foreground flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            Name
                        </Label>
                        <Input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Lead name"
                            className="bg-muted/20"
                        />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                        <Label className="text-muted-foreground flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            Phone Number
                        </Label>
                        <Input
                            name="phoneNumber"
                            value={form.phoneNumber}
                            onChange={handleChange}
                            placeholder="Phone number"
                            type="tel"
                            className="bg-muted/20"
                        />
                    </div>

                    {/* Business */}
                    <div className="space-y-1.5">
                        <Label className="text-muted-foreground flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5" />
                            Business
                        </Label>
                        <Input
                            name="business"
                            value={form.business}
                            onChange={handleChange}
                            placeholder="Business type"
                            className="bg-muted/20"
                        />
                    </div>

                    {/* Status & Employee side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-muted-foreground flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5" />
                                Status
                            </Label>
                            <Select
                                value={form.status}
                                onValueChange={(val) => setForm({ ...form, status: val })}
                            >
                                <SelectTrigger className="w-full bg-muted/20">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NEW">NEW</SelectItem>
                                    <SelectItem value="CONTACTED">CONTACTED</SelectItem>
                                    <SelectItem value="QUALIFIED">QUALIFIED</SelectItem>
                                    <SelectItem value="LOST">LOST</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-muted-foreground flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5" />
                                Assigned Employee
                            </Label>
                            {employees.length > 0 ? (
                                <Select
                                    value={form.employeeId}
                                    onValueChange={(val) => setForm({ ...form, employeeId: val })}
                                    disabled={loadingEmployees}
                                >
                                    <SelectTrigger className="w-full bg-muted/20">
                                        <SelectValue placeholder={loadingEmployees ? "Loading..." : "Select Employee"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((emp) => (
                                            <SelectItem key={emp.id} value={String(emp.id)}>
                                                {emp.name} (ID: {emp.id})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    name="employeeId"
                                    value={form.employeeId}
                                    onChange={handleChange}
                                    placeholder={loadingEmployees ? "Loading..." : "Employee ID"}
                                    type="number"
                                    className="bg-muted/20"
                                    disabled={loadingEmployees}
                                />
                            )}
                        </div>
                    </div>

                    <Button
                        className="w-full h-11 text-base shadow-sm mt-4"
                        disabled={loading}
                        onClick={handleSubmit}
                    >
                        {loading ? "Updating..." : "Update Lead"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
