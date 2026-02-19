"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
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
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";

interface Client {
  clientId: number;
  name: string;
}

interface SocialEntry {
  id: number;
  title: string;
  status: string;
  clientId?: number;
  mediaType?: string;
  referenceLink?: string;
  mediaLink?: string;
  colorFormat?: string;
  notes?: string;
  scheduledAt?: string;
}

export default function SocialUpdateForm() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [socialEntries, setSocialEntries] = useState<SocialEntry[]>([]); // Store fetched entries
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

  // Fetch clients and social entries on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, entriesRes] = await Promise.all([
          axios.post("/api/get-all-clients"),
          axios.get("/api/socialmediacalendar/social-all"),
        ]);

        if (clientsRes.data.success) {
          setClients(clientsRes.data.data);
        }
        if (entriesRes.data.success) {
          setSocialEntries(entriesRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
        toast.error("Failed to load initial data");
      }
    };
    fetchData();
  }, []);

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
          status: data.status || "",
          notes: data.notes || "",
        });

        if (data.scheduledAt) {
          try {
            setSelectedDate(parseISO(data.scheduledAt));
          } catch (e) {
            console.error("Date parse error", e);
          }
        }

        toast.success("Data loaded successfully");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error.response?.data?.error?.message || "Failed to load data");
    }
    setLoadingData(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    if (!id || id.trim() === "") {
      toast.error("Please enter an ID and load data first");
      return;
    }
    if (!form.clientId) {
      toast.error("Client is required");
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
      mediaType: form.mediaType,
      referenceLink: form.referenceLink,
      mediaLink: form.mediaLink,
      colorFormat: form.colorFormat,
      scheduledAt: format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss"),
      status: form.status,
      notes: form.notes,
      companyId: 1, // Add companyId match create
    };

    try {
      const res = await axios.put(`/api/socialmediacalendar/${id}`, payload);

      const data = res.data;

      if (data.success) {
        toast.success(data.message || "Updated successfully");
      } else {
        toast.error(data.error?.message || "Something went wrong");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error.response?.data?.error?.message || "Update failed");
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
          {/* ID Selection Dropdown */}
          <div className="flex gap-4 items-end mb-6">
            <div className="w-full space-y-2">
              <Label>Select Entry to Update</Label>
              <Select
                value={id}
                onValueChange={(val) => {
                  setId(val);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Social Entry ID" />
                </SelectTrigger>
                <SelectContent>
                  {socialEntries.map((entry) => (
                    <SelectItem key={entry.id} value={String(entry.id)}>
                      #{entry.id} - {entry.title} ({entry.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={loadData}
              disabled={loadingData || !id}
              className="whitespace-nowrap mb-px"
            >
              {loadingData ? "Loading..." : "Load Data"}
            </Button>
          </div>

          <div className="border-t pt-6 space-y-4">
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

            <Button className="w-full" disabled={loading} onClick={handleSubmit}>
              {loading ? "Updating..." : "Update"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
