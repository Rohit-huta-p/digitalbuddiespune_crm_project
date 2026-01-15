"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";

export default function SocialCreateForm() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    clientId: "",
    title: "",
    mediaType: "",
    referenceLink: "",
    mediaLink: "",
    colorFormat: "",
    scheduledAt: "",
    status: "",
    notes: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);

    const payload = {
      clientId: Number(form.clientId),
      title: form.title,
      mediaType: form.mediaType,
      referenceLink: form.referenceLink,
      mediaLink: form.mediaLink,
      colorFormat: form.colorFormat,
      scheduledAt: form.scheduledAt,
      status: form.status,
      notes: form.notes,
    };

    try {
      const res = await axios.post("/api/socialmediacalendar/social-create", payload);

      const data = res.data;

      if (data.success) {
        toast.success(data.message || "Created successfully");
        // Reset form
        setForm({
          clientId: "",
          title: "",
          mediaType: "",
          referenceLink: "",
          mediaLink: "",
          colorFormat: "",
          scheduledAt: "",
          status: "",
          notes: "",
        });
      } else {
        toast.error(data.error?.message || "Something went wrong");
      }
    } catch (err: any) {
      console.error("Create Social Error:", err);
      toast.error(err.response?.data?.error?.message || "Server error");
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex justify-center mt-10 px-4">
      <Card className="w-full max-w-2xl mt-10 shadow-md border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Create Social Entry
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            name="clientId"
            placeholder="Client ID"
            onChange={handleChange}
          />
          <Input name="title" placeholder="Title" onChange={handleChange} />
          <Input
            name="mediaType"
            placeholder="VIDEO | IMAGE"
            onChange={handleChange}
          />

          <Input
            name="referenceLink"
            placeholder="Reference link"
            onChange={handleChange}
          />
          <Input
            name="mediaLink"
            placeholder="Media link"
            onChange={handleChange}
          />
          <Input
            name="colorFormat"
            placeholder="#FFCC00,#000000"
            onChange={handleChange}
          />

          <Input
            type="datetime-local"
            name="scheduledAt"
            onChange={handleChange}
          />

          <Input
            name="status"
            placeholder="SCHEDULED | PUBLISHED"
            onChange={handleChange}
          />

          <Textarea
            name="notes"
            placeholder="Notes..."
            onChange={handleChange}
          />

          <Button disabled={loading} onClick={handleSubmit} className="w-full">
            {loading ? "Saving..." : "Create"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
