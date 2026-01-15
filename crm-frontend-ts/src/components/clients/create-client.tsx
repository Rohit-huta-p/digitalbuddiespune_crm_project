"use client";

import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function CreateClientPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phno: "",
    email: "",
    password: "",
    companyId: "1",
    numberOfPosts: "",
    numberOfVideos: "",
    numberOfShoots: "",
    totalTarget: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phno || !form.email || !form.password) {
      toast.error("Please fill all required fields");
      return;
    }

    // Validate phone number format (10 digits, cannot start with 0)
    const phoneRegex = /^[1-9]\d{9}$/;
    if (!phoneRegex.test(form.phno)) {
      toast.error("Phone number must be 10 digits and cannot start with 0");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/api/create-client", {
        name: form.name,
        phno: form.phno,
        email: form.email,
        password: form.password,
        companyId: parseInt(form.companyId),
        numberOfPosts: form.numberOfPosts ? parseInt(form.numberOfPosts) : undefined,
        numberOfVideos: form.numberOfVideos ? parseInt(form.numberOfVideos) : undefined,
        numberOfShoots: form.numberOfShoots ? parseInt(form.numberOfShoots) : undefined,
        totalTarget: form.totalTarget ? parseInt(form.totalTarget) : undefined,
      });

      const data = res.data;

      if (data.success) {
        toast.success(data.message || "Client created successfully");
        setForm({
          name: "",
          phno: "",
          email: "",
          password: "",
          companyId: "1",
          numberOfPosts: "",
          numberOfVideos: "",
          numberOfShoots: "",
          totalTarget: "",
        });
      } else {
        toast.error(data.error?.message || "Something went wrong");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Failed to create client");
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex justify-center mt-10 px-4">
      <Card className="w-full max-w-2xl shadow-md border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Create New Client
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Client Name *"
          />

          <Input
            name="phno"
            value={form.phno}
            onChange={handleChange}
            placeholder="Phone Number * (10 digits, e.g., 9876543210)"
            type="tel"
            maxLength={10}
          />

          <Input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email *"
            type="email"
          />

          <Input
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password *"
            type="password"
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
            {loading ? "Creating..." : "Create Client"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
