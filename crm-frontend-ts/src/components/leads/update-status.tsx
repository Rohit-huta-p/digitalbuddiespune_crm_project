"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function UpdateLeadStatusPage({ defaultLeadId }: { defaultLeadId?: number }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    leadId: defaultLeadId ? String(defaultLeadId) : "",
    status: "CONTACTED",
  });

  useEffect(() => {
    if (defaultLeadId) setForm((f) => ({ ...f, leadId: String(defaultLeadId) }));
  }, [defaultLeadId]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.leadId || !form.status) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/api/lead/status", {
        leadId: parseInt(form.leadId),
        status: form.status,
      });

      const data = res.data;

      if (data.success) {
        toast.success(data.message || "Lead status updated successfully");
        setForm({ leadId: "", status: "CONTACTED" });
      } else {
        toast.error(data.error?.message || "Something went wrong");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Failed to update status");
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex justify-center mt-40 px-4">
      <Card className="w-full max-w-2xl shadow-md border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Update Lead Status
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            name="leadId"
            value={form.leadId}
            onChange={handleChange}
            placeholder="Lead ID"
            type="number"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="QUALIFIED">QUALIFIED</option>
            <option value="LOST">LOST</option>
          </select>

          <Button className="w-full" disabled={loading} onClick={handleSubmit}>
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
