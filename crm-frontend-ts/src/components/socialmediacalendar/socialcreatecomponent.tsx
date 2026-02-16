"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function SocialCreateForm() {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  console.log("CLIENTS fetched: ", clients)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const [form, setForm] = useState({
    clientId: "",
    title: "",
    mediaType: "",
    referenceLink: "",
    mediaLink: "",
    colorFormat: "",
    status: "",
    notes: "",
  });

  // Fetch clients on mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.post("/api/get-all-clients");
        if (res.data.success) {
          setClients(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch clients", err);
        toast.error("Failed to load clients");
      }
    };
    fetchClients();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    if (!form.clientId) {
      toast.error("Please select a client");
      return;
    }
    if (!form.title) {
      toast.error("Title is required");
      return;
    }
    if (!selectedDate) {
      toast.error("Scheduled date is required");
      return;
    }

    setLoading(true);

    const payload = {
      clientId: Number(form.clientId),
      title: form.title,
      mediaType: form.mediaType || "IMAGE",
      referenceLink: form.referenceLink,
      mediaLink: form.mediaLink,
      colorFormat: form.colorFormat,
      scheduledAt: format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss"),
      status: form.status || "SCHEDULED",
      notes: form.notes,
      companyId: 1, // Add companyId
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
          status: "",
          notes: "",
        });
        setSelectedDate(undefined);
      } else {
        toast.error(data.error?.message || "Something went wrong");
      }
    } catch (err: any) {
      console.error("Create Social Error:", err);
      toast.error(err.response?.data?.error?.message || err.message || "Server error");
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex justify-center mt-20 px-4">
      <Card className="w-full max-w-2xl shadow-md border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Create Social Entry
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <Select onValueChange={(val) => handleSelectChange("clientId", val)} value={form.clientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.clientId} value={String(client.clientId)}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input name="title" placeholder="Post Title" value={form.title} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Media Type</Label>
              <Select onValueChange={(val) => handleSelectChange("mediaType", val)} value={form.mediaType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Media Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IMAGE">Image</SelectItem>
                  <SelectItem value="VIDEO">Video</SelectItem>
                  <SelectItem value="CAROUSEL">Carousel</SelectItem>
                  <SelectItem value="STORY">Story</SelectItem>
                  <SelectItem value="REEL">Reel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select onValueChange={(val) => handleSelectChange("status", val)} value={form.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="POSTED">Posted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Scheduled Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Reference Link</Label>
              <Input
                name="referenceLink"
                placeholder="https://..."
                value={form.referenceLink}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Media Link</Label>
              <Input
                name="mediaLink"
                placeholder="https://..."
                value={form.mediaLink}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Color Format (Hex)</Label>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-10 rounded-md border shadow-sm relative overflow-hidden"
                  style={{ backgroundColor: form.colorFormat || "#FFFFFF" }}
                >
                  <Input
                    type="color"
                    name="colorFormat"
                    value={form.colorFormat || "#FFFFFF"}
                    onChange={handleChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full p-0 border-0"
                  />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {form.colorFormat || "Pick a color"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "#FF5733", // Red-Orange
                  "#33FF57", // Green
                  "#3357FF", // Blue
                  "#F333FF", // Magenta
                  "#FF33F3", // Pink
                  "#33FFF3", // Cyan
                  "#F3FF33", // Yellow
                  "#000000", // Black
                  "#FFFFFF", // White
                ].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-6 h-6 rounded-full border-2 transition-all",
                      form.colorFormat === color
                        ? "border-primary scale-110 ring-2 ring-primary/30"
                        : "border-transparent hover:scale-105"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => handleSelectChange("colorFormat", color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              name="notes"
              placeholder="Additional notes or captions..."
              value={form.notes}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <Button disabled={loading} onClick={handleSubmit} className="w-full">
            {loading ? "Creating..." : "Create Social Entry"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
