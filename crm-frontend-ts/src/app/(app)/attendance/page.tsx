"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CircleCheck, Info, Clock, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";

const AttendancePage = () => {
  const [isPresent, setIsPresent] = useState(false);
  const [status, setStatus] = useState<"none" | "ongoing" | "completed">(
    "none"
  );
  const [workedTime, setWorkedTime] = useState<string | null>(null);
  const [logoutTime, setLogoutTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    const start = localStorage.getItem("attendanceStartTime");
    const end = localStorage.getItem("attendanceEndTime");
    const localStatus = localStorage.getItem("attendanceStatus");

    if (localStatus === "ongoing" && start && !end) {
      setStatus("ongoing");
      updateOngoingTime();
    } else if (localStatus === "completed" && start && end) {
      setStatus("completed");
      setWorkedTime(calculateWorkedTime(start, end));
      setLogoutTime(new Date(end).toLocaleString());
    }

    const interval = setInterval(() => {
      if (status === "ongoing") updateOngoingTime();
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    const checkAttendance = async () => {
      try {
        const res = await fetch("/api/attendance/check", {
          method: "POST",
        });
        const data = await res.json();

        if (res.ok && data?.isPresent) {
          setIsPresent(true);
          setStatus("ongoing");

          if (!localStorage.getItem("attendanceStartTime")) {
            const now = new Date().toISOString();
            localStorage.setItem("attendanceStartTime", now);
            localStorage.setItem("attendanceStatus", "ongoing");
          }
        } else {
          setIsPresent(false);
          setStatus("none");
        }
      } catch (error) {
        console.error("Attendance check error:", error);
        toast.error("Failed to check attendance.");
      }
    };

    checkAttendance();
  }, []);

  const calculateWorkedTime = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
    return `${hours}h ${mins}m ${secs}s`;
  };

  const updateOngoingTime = () => {
    const start = localStorage.getItem("attendanceStartTime");
    if (start) {
      const now = new Date().toISOString();
      setWorkedTime(calculateWorkedTime(start, now));
    }
  };

  const handleMarkAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/attendance/mark", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error?.message || "Could not mark attendance");
      }

      const now = new Date().toISOString();
      localStorage.setItem("attendanceStartTime", now);
      localStorage.removeItem("attendanceEndTime");
      localStorage.setItem("attendanceStatus", "ongoing");

      setIsPresent(true);
      setStatus("ongoing");
      setWorkedTime("0h 0m 0s");

      toast.success(data.message || "Attendance marked!");
    } catch (err: any) {
      toast.error(err.message || "Failed to mark attendance.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLogout = () => {
    const now = new Date().toISOString();
    const start = localStorage.getItem("attendanceStartTime");

    if (!start) {
      toast.error("No login time found.");
      return;
    }

    const worked = calculateWorkedTime(start, now);
    localStorage.setItem("attendanceEndTime", now);
    localStorage.setItem("attendanceStatus", "completed");

    setWorkedTime(worked);
    setLogoutTime(new Date(now).toLocaleString());
    setStatus("completed");

    toast.success("Logout successful!");
    setConfirmDialogOpen(false);
  };

  return (
    <section className="w-full h-full p-5">
      <h1 className="text-3xl font-bold mb-6 text-center">
        📍 Attendance Tracker
      </h1>

      <div className="max-w-3xl mx-auto grid gap-6">
        <Alert
          variant={isPresent ? "success" : "default"}
          className="bg-gray-100 dark:bg-zinc-900 border-green-800 dark:border-zinc-800"
        >
          {isPresent ? (
            <CircleCheck className="h-5 w-5 text-green-500" />
          ) : (
            <Info className="h-5 w-5 text-yellow-500" />
          )}
          <AlertTitle className="text-md font-semibold">
            {isPresent ? "You're Active!" : "Not Logged In"}
          </AlertTitle>
          <AlertDescription>
            {isPresent
              ? status === "ongoing"
                ? "⏳ Timer running... stay productive!"
                : "✅ You've logged in and out."
              : "⚠️ Please mark your attendance to begin."}
          </AlertDescription>
        </Alert>

        {workedTime && (
          <Alert className="border bg-blue-50 dark:border-blue-900 dark:border-2 dark:bg-blue-900/20">
            <Clock className="h-5 w-5 text-blue-500" />
            <AlertTitle>
              {status === "completed"
                ? "🕓 Total Time Worked"
                : "⏳ Time Elapsed"}
            </AlertTitle>
            <AlertDescription>{workedTime}</AlertDescription>
            {logoutTime && (
              <p className="text-xs pt-1 text-muted-foreground">
                Logged out at: {logoutTime}
              </p>
            )}
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3">
          <div
            onClick={handleMarkAttendance}
            className={`text-center bg-green-600 font-semibold text-white px-6 py-5 rounded-xl cursor-pointer transition-all
            ${
              status !== "none"
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-green-700"
            }`}
          >
            <LogIn className="inline-block mr-2" />
            Mark Attendance
          </div>

          <div
            onClick={() => {
              if (status === "ongoing") setConfirmDialogOpen(true);
            }}
            className={`text-center bg-red-600 font-semibold text-white px-6 py-5 rounded-xl cursor-pointer transition-all
            ${
              status !== "ongoing"
                ? "opacity-50 cursor-not-allowed"
                : " hover:bg-red-700"
            }`}
          >
            <LogOut className="inline-block mr-2" />
            Mark Logout
          </div>
        </div>
      </div>

      {/* Confirm Logout Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to logout?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will stop your working timer and mark your attendance as
            completed.
          </p>
          <DialogFooter className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmLogout}>
              Yes, Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AttendancePage;
