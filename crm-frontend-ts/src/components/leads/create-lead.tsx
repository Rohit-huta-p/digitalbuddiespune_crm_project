"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function CreateLeadPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    business: "",
    employeeId: "",
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

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
        toast.error("Failed to load employees. Defaulting to manual input.");
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phoneNumber || !form.business || !form.employeeId) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/api/lead/create", {
        name: form.name,
        phoneNumber: form.phoneNumber,
        business: form.business,
        employeeId: parseInt(form.employeeId),
      });

      const data = res.data;

      if (data.success) {
        toast.success(data.message || "Lead created successfully");
        setForm({ name: "", phoneNumber: "", business: "", employeeId: "" });
      } else {
        toast.error(data.error?.message || "Something went wrong");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        toast.error(err.response.data.error?.message || "Failed to create lead");
      } else {
        toast.error("Failed to create lead");
      }
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex justify-center mt-40 px-4">
      <Card className="w-full max-w-2xl shadow-md border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Create New Lead
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Lead Name"
          />

          <Input
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="Phone Number"
            type="tel"
          />

          <Input
            name="business"
            value={form.business}
            onChange={handleChange}
            placeholder="Business Type (e.g., Catering)"
          />

          {employees.length > 0 ? (
            <Select
              value={form.employeeId}
              onValueChange={(val) => setForm({ ...form, employeeId: val })}
              disabled={loadingEmployees}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loadingEmployees ? "Loading employees..." : "Assign to Employee"} />
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
              placeholder={loadingEmployees ? "Loading employees..." : "Employee ID"}
              type="number"
              disabled={loadingEmployees}
            />
          )}

          <Button className="w-full" disabled={loading} onClick={handleSubmit}>
            {loading ? "Creating..." : "Create Lead"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
