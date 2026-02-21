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
import { Activity, Hash } from "lucide-react";

export default function UpdateLeadStatusPage({ defaultLeadId }: { defaultLeadId?: number }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    leadId: defaultLeadId ? String(defaultLeadId) : "",
    status: "CONTACTED",
  });

  useEffect(() => {
    if (defaultLeadId) setForm((f) => ({ ...f, leadId: String(defaultLeadId) }));
  }, [defaultLeadId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setForm({ ...form, status: "CONTACTED" }); // Reset status, keep ID
      } else {
        toast.error(data.error?.message || "Something went wrong");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        toast.error(err.response.data.error?.message || "Failed to update status");
      } else {
        toast.error("Failed to update status");
      }
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex justify-center mt-2 px-2">
      <Card className="w-full max-w-md shadow-sm border rounded-2xl">
        <CardHeader className="bg-muted/30 border-b pb-4 mb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Update Lead Status
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              Lead ID
            </Label>
            <Input
              name="leadId"
              value={form.leadId}
              onChange={handleChange}
              placeholder="e.g. 12"
              type="number"
              className="bg-muted/20"
              disabled={!!defaultLeadId}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground">New Status</Label>
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

          <Button className="w-full h-11 text-base shadow-sm mt-4" disabled={loading} onClick={handleSubmit}>
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
