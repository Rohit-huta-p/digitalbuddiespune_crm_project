"use client";

import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function UpdateClientPage() {
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState("");
  const [form, setForm] = useState({
    name: "",
    phno: "",
    email: "",
    companyId: "",
    numberOfPosts: "",
    numberOfVideos: "",
    numberOfShoots: "",
    totalTarget: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!clientId) {
      toast.error("Please enter Client ID");
      return;
    }

    // Validate phone number format if provided (10 digits, cannot start with 0)
    if (form.phno) {
      const phoneRegex = /^[1-9]\d{9}$/;
      if (!phoneRegex.test(form.phno)) {
        toast.error("Phone number must be 10 digits and cannot start with 0");
        return;
      }
    }

    setLoading(true);

    try {
      const payload: any = { clientId: parseInt(clientId) };
      
      if (form.name) payload.name = form.name;
      if (form.phno) payload.phno = form.phno;
      if (form.email) payload.email = form.email;
      if (form.companyId) payload.companyId = parseInt(form.companyId);
      if (form.numberOfPosts) payload.numberOfPosts = parseInt(form.numberOfPosts);
      if (form.numberOfVideos) payload.numberOfVideos = parseInt(form.numberOfVideos);
      if (form.numberOfShoots) payload.numberOfShoots = parseInt(form.numberOfShoots);
      if (form.totalTarget) payload.totalTarget = parseInt(form.totalTarget);

      const res = await axios.put("/api/update-client", payload);

      const data = res.data;

      if (data.success) {
        toast.success(data.message || "Client updated successfully");
      } else {
        toast.error(data.error?.message || "Something went wrong");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Failed to update client");
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex justify-center mt-10 px-4">
      <Card className="w-full max-w-2xl shadow-md border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Update Client
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Client ID *"
            type="number"
          />

          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Client Name"
          />

          <Input
            name="phno"
            value={form.phno}
            onChange={handleChange}
            placeholder="Phone Number (10 digits, e.g., 9876543210)"
            type="tel"
            maxLength={10}
          />

          <Input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            type="email"
          />

          <Input
            name="companyId"
            value={form.companyId}
            onChange={handleChange}
            placeholder="Company ID"
            type="number"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              name="numberOfPosts"
              value={form.numberOfPosts}
              onChange={handleChange}
              placeholder="Number of Posts"
              type="number"
            />

            <Input
              name="numberOfVideos"
              value={form.numberOfVideos}
              onChange={handleChange}
              placeholder="Number of Videos"
              type="number"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              name="numberOfShoots"
              value={form.numberOfShoots}
              onChange={handleChange}
              placeholder="Number of Shoots"
              type="number"
            />

            <Input
              name="totalTarget"
              value={form.totalTarget}
              onChange={handleChange}
              placeholder="Total Target"
              type="number"
            />
          </div>

          <Button className="w-full" disabled={loading} onClick={handleSubmit}>
            {loading ? "Updating..." : "Update Client"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
