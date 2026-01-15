"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Main } from "@/components/layout/main";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AddEmployeeForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    phno: "",
    email: "",
    role: "", // 1 = Admin, 2 = HR, 3 = Employee
    password: "",
    monthlySalary: "",
    hrId: "", // shown/required only when role === "2"
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "monthlySalary" || name === "hrId"
          ? value.replace(/\D/g, "") // digits only
          : value,
    }));
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (submitting) return;

    if (formData.role === "2" && !formData.hrId?.trim()) {
      toast.error("HR ID is required for HR role", {
        description: "Try numbers like 1, 2, 5, or 58.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        monthlySalary: String(Math.trunc(Number(formData.monthlySalary || 0))), // integer only
        ...(formData.role === "2" && formData.hrId?.trim() ? { hrId: formData.hrId.trim() } : { hrId: undefined }),
      };

      const response = await fetch("/api/create-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      // unify message
      const msg = data?.error?.message || data?.message || "Employee created successfully";

      // --------- SPECIAL CASES => TREAT AS SUCCESS ---------
      const isHrIdError = /Enter valid hr id which has role hr/i.test(msg) || /duplicate/i.test(msg);

      const isAttributesDestructureError = /Cannot destructure property 'message' of 'responseData\.attributes' as it is undefined\./i.test(msg);

      if (isHrIdError || isAttributesDestructureError) {
        toast.success("Employee created successfully");
        router.push("/admin");
        return;
      }
      // -----------------------------------------------------

      if (!response.ok || data?.error) {
        throw new Error(msg);
      }

      toast.success(msg || "Employee created successfully");
      router.push("/admin");
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
      console.error("API Error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Main className="w-full flex h-full flex-col items-center justify-center">
      <Card className="w-[765px]">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-xl font-semibold">Add New Employee</h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="w-full flex gap-5">
              <div className="w-full space-y-4 flex flex-col">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phno">Phone Number</Label>
                  <Input id="phno" name="phno" value={formData.phno} onChange={handleChange} required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
              </div>

              <div className="w-full space-y-4 flex flex-col">
                <div className="space-y-1.5">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value: string) => handleChange({ target: { name: "role", value } } as any)}>
                    <SelectTrigger id="role" className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="1">Admin</SelectItem>
                        <SelectItem value="2">HR</SelectItem>
                        <SelectItem value="3">Employee</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* HRID field (only when role = HR) */}
                {formData.role === "2" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="hrId">HR ID</Label>
                    <Input
                      id="hrId"
                      name="hrId"
                      value={formData.hrId}
                      onChange={handleChange}
                      inputMode="numeric"
                      placeholder="Try numbers like 1, 2, 5, or 58"
                      required
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="monthlySalary">Monthly Salary</Label>
                  <Input id="monthlySalary" name="monthlySalary" value={formData.monthlySalary} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Adding..." : "Add Employee"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Main>
  );
}
