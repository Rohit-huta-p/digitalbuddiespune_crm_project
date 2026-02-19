/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function MarkAttendanceButton() {
  const [loading, setLoading] = useState(false);

  const handleAttendance = async () => {
    setLoading(true);

    try {
      // Step 1: Check attendance
      const checkRes = await fetch("/api/attendance/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const checkData = await checkRes.json();

      if (!checkRes.ok || checkData?.error) {
        throw new Error(
          checkData.error?.message || "Failed to check attendance"
        );
      }

      if (checkData.isPresent) {
        toast.warning("You have already marked attendance.");
      } else {
        // Step 2: Mark attendance
        const markRes = await fetch("/api/attendance/mark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const markData = await markRes.json();

        if (!markRes.ok || markData?.error) {
          throw new Error(
            markData.error?.message || "Failed to mark attendance"
          );
        }

        toast.success(markData.message || "Attendance marked successfully.");
      }
    } catch (error: any) {
      console.error("Attendance error:", error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button className="w-full" onClick={handleAttendance} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Checking Attendance...
        </>
      ) : (
        "Check & Mark Attendance"
      )}
    </Button>
  );
}
