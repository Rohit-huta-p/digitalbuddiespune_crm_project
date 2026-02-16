"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function AddFollowUpPage({ defaultLeadId }: { defaultLeadId?: number }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    leadId: defaultLeadId ? String(defaultLeadId) : "",
    note: "",
    callTime: "",
    callStatus: "PENDING",
  });

  useEffect(() => {
    if (defaultLeadId) setForm((f) => ({ ...f, leadId: String(defaultLeadId) }));
  }, [defaultLeadId]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.leadId || !form.note || !form.callTime) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`/api/lead/${form.leadId}/follow-up`, {
        note: form.note,
        callTime: form.callTime,
        callStatus: form.callStatus,
      });

      const data = res.data;

      if (data.success) {
        toast.success(data.message || "Follow-up added successfully");
        setForm({ leadId: "", note: "", callTime: "", callStatus: "PENDING" });
      } else {
        toast.error(data.error?.message || "Something went wrong");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Failed to add follow-up");
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex justify-center mt-40 px-4">
      <Card className="w-full max-w-2xl shadow-md border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Add Follow-up
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

          <Textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Follow-up note (e.g., Call tomorrow morning)"
            rows={3}
          />

          <Input
            name="callTime"
            value={form.callTime}
            onChange={handleChange}
            type="datetime-local"
            placeholder="Call Time"
          />

          <select
            name="callStatus"
            value={form.callStatus}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="PENDING">PENDING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <Button className="w-full" disabled={loading} onClick={handleSubmit}>
            {loading ? "Adding..." : "Add Follow-up"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
