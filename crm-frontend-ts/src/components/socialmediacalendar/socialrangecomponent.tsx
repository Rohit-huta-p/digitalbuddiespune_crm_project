"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export default function SocialRangePage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/socialmediacalendar/social-range", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to }),
      });

      const result = await res.json();

      if (!result.success) {
        setError(result.error?.message || "Something went wrong");
        setRecords([]);
      } else {
        setRecords(result.data);
      }
    } catch (err) {
      setError("Unable to fetch data");
      setRecords([]);
    }

    setLoading(false);
  };

  return (
    <div className="md:p-8 max-w-6xl mt-10 mx-auto">

      {/* Filter Form */}
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 mb-6">
        
        <div className="space-y-1 w-full sm:w-auto">
          <Label className="text-xs">From</Label>
          <Input
            type="datetime-local"
            className="h-8 text-xs"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1 w-full sm:w-auto">
          <Label className="text-xs">To</Label>
          <Input
            type="datetime-local"
            className="h-8 text-xs"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
          />
        </div>

        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "..." : "Search"}
        </Button>
      </form>

      {/* Error */}
      {error && (
        <p className="text-red-600 mb-4 text-center font-medium">{error}</p>
      )}

      {/* Records Table */}
      <div>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : records.length > 0 ? (
          <ScrollArea className="w-full border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Media</TableHead>
                  <TableHead>Scheduled At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {records.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.mediaType}</TableCell>
                    <TableCell>
                      {new Date(item.scheduledAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-semibold">{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <p className="text-center text-gray-600">No records found.</p>
        )}
      </div>
    </div>
  );
}
