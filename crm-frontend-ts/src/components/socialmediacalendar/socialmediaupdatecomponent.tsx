"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function SocialUpdateForm() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

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

  // Load old values when ID is provided
  const loadData = async () => {
    if (!id || id.trim() === "") {
      toast.error("Please enter an ID first");
      return;
    }

    setLoadingData(true);
    try {
      const res = await axios.get(`/api/socialmediacalendar/${id}`);

      const data = res.data?.data;

      if (data) {
        setForm({
          clientId: String(data.clientId || ""),
          title: data.title || "",
          mediaType: data.mediaType || "",
          referenceLink: data.referenceLink || "",
          mediaLink: data.mediaLink || "",
          colorFormat: data.colorFormat || "",
          scheduledAt: data.scheduledAt ? data.scheduledAt.slice(0, 16) : "",
          status: data.status || "",
          notes: data.notes || "",
        });
        toast.success("Data loaded successfully");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Failed to load data");
    }
    setLoadingData(false);
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!id || id.trim() === "") {
      toast.error("Please enter an ID and load data first");
      return;
    }

    setLoading(true);

    const payload = {
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
      const res = await axios.put(`/api/socialmediacalendar/${id}`, payload);

      const data = res.data;

      if (data.success) {
        toast.success(data.message || "Updated successfully");
      } else {
        toast.error(data.error?.message || "Something went wrong");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Update failed");
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex justify-center mt-10 px-4">
      <Card className="w-full max-w-2xl mt-10 shadow-md border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Update Social Entry
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* ID Input and Load Button */}
          <div className="flex gap-2">
            <Input
              name="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Enter Social Media Entry ID"
              type="number"
            />
            <Button 
              onClick={loadData} 
              disabled={loadingData}
              className="whitespace-nowrap"
            >
              {loadingData ? "Loading..." : "Load Data"}
            </Button>
          </div>

          <div className="border-t pt-4 space-y-4">
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Title"
            />

          <Input
            name="mediaType"
            value={form.mediaType}
            onChange={handleChange}
            placeholder="VIDEO | IMAGE"
          />

          <Input
            name="referenceLink"
            value={form.referenceLink}
            onChange={handleChange}
            placeholder="Reference link"
          />

          <Input
            name="mediaLink"
            value={form.mediaLink}
            onChange={handleChange}
            placeholder="Media link"
          />

          <Input
            name="colorFormat"
            value={form.colorFormat}
            onChange={handleChange}
            placeholder="#FFCC00,#000000"
          />

          <Input
            type="datetime-local"
            name="scheduledAt"
            value={form.scheduledAt}
            onChange={handleChange}
          />

          <Input
            name="status"
            value={form.status}
            onChange={handleChange}
            placeholder="SCHEDULED | PUBLISHED"
          />

          <Textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Notes..."
          />

          <Button className="w-full" disabled={loading} onClick={handleSubmit}>
            {loading ? "Updating..." : "Update"}
          </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
