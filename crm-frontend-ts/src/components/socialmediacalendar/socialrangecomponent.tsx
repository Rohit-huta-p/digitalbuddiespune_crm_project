"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";

export default function SocialRangePage() {
  const [from, setFrom] = useState<Date | undefined>(startOfWeek(new Date()));
  const [to, setTo] = useState<Date | undefined>(endOfWeek(new Date()));
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");

  const fetchRecords = async (startDate: Date, endDate: Date) => {
    setLoading(true);
    setError("");

    // Format dates to LocalDateTime string (yyyy-MM-dd'T'HH:mm:ss)
    const fromStr = format(startDate, "yyyy-MM-dd'T'00:00:00");
    const toStr = format(endDate, "yyyy-MM-dd'T'23:59:59");

    try {
      const res = await fetch("/api/socialmediacalendar/social-range", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: fromStr, to: toStr }),
      });

      const result = await res.json();

      if (!result.success) {
        setError(result.error?.message || "Something went wrong");
        setRecords([]);
        toast.error(result.error?.message || "Failed to fetch records");
      } else {
        setRecords(result.data);
        toast.success(`Found ${result.data?.length || 0} records`);
      }
    } catch (err) {
      setError("Unable to fetch data");
      setRecords([]);
      toast.error("Network error");
    }

    setLoading(false);
  };

  React.useEffect(() => {
    if (from && to) {
      fetchRecords(from, to);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!from || !to) {
      toast.error("Please select a date range");
      return;
    }
    await fetchRecords(from, to);
  };

  return (
    <div className="w-full flex justify-center mt-20 px-4">
      <Card className="w-full max-w-5xl shadow-md border rounded-2xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Social Media Calendar Range Report</h2>

          {/* Filter Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-end gap-4 mb-8">
            <div className="flex flex-col space-y-2 w-full sm:w-auto">
              <Label>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full sm:w-[240px] justify-start text-left font-normal",
                      !from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {from ? format(from, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={from}
                    onSelect={setFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col space-y-2 w-full sm:w-auto">
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full sm:w-[240px] justify-start text-left font-normal",
                      !to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {to ? format(to, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={to}
                    onSelect={setTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Searching..." : "Search Records"}
            </Button>
          </form>

          {/* Error */}
          {error && (
            <p className="text-red-600 mb-4 text-center font-medium bg-red-50 p-3 rounded">{error}</p>
          )}

          {/* Records Table */}
          <div>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : records.length > 0 ? (
              <ScrollArea className="w-full border rounded-lg h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Media Details</TableHead>
                      <TableHead>Scheduled At</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {records.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.id}</TableCell>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs uppercase text-muted-foreground">{item.mediaType}</span>
                            {item.mediaLink && (
                              <a href={item.mediaLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs truncate max-w-[150px]">
                                Link
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(item.scheduledAt), "PPP p")}
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-semibold",
                            item.status === 'POSTED' ? "bg-green-100 text-green-800" :
                              item.status === 'SCHEDULED' ? "bg-blue-100 text-blue-800" :
                                "bg-gray-100 text-gray-800"
                          )}>
                            {item.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-xl">
                <p>No records found for the selected range.</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
