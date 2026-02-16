"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Info } from "lucide-react";

export default function CheckOutPage() {
  const [loading, setLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [notCheckedIn, setNotCheckedIn] = useState(false);

  useEffect(() => {
    // Fetch employee ID from server-side API (httpOnly cookies can't be read by JS)
    const fetchEmployeeId = async () => {
      try {
        const res = await axios.get("/api/auth/me");
        const data = res.data;

        if (data.authenticated && data.employeeId) {
          console.log("Employee ID loaded:", data.employeeId);
          setEmployeeId(data.employeeId);
        } else {
          toast.error("Please login first to use attendance features");
        }
      } catch (err: any) {
        console.error("Failed to load employee ID:", err);
        toast.error("Please login first to use attendance features");
      }
    };

    fetchEmployeeId();
  }, []);

  const handleSubmit = async () => {
    if (!employeeId) {
      toast.error("Employee ID not loaded. Please refresh the page.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/api/attendance/check-out", {
        employeeId: parseInt(employeeId),
      });

      const data = res.data;

      if (data.success) {
        toast.success(data.message || "Check-out recorded successfully!", {
          description: "Your attendance for today has been completed.",
        });
      } else {
        toast.error(data.error?.message || "Something went wrong");
      }
    } catch (err: any) {
      console.error("Check-out error:", err.response?.data);

      const errorMsg = err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.response?.data?.error?.title ||
        "";

      const status = err.response?.status;

      // Handle 500 errors (usually backend serialization issues)
      if (status === 500) {
        if (errorMsg.toLowerCase().includes("hibernate") ||
          errorMsg.toLowerCase().includes("bytebuddy") ||
          errorMsg.toLowerCase().includes("type definition")) {
          toast.error("Server configuration error", {
            description: "The attendance was likely recorded, but there's a backend issue. Please refresh and check your attendance report.",
            duration: 6000,
          });
        } else {
          toast.error("Server error occurred", {
            description: errorMsg || "Please try again or contact support.",
            duration: 5000,
          });
        }
        return;
      }

      // Check if user hasn't checked in yet today
      const notFoundError = errorMsg.toLowerCase().includes("not found") ||
        errorMsg.toLowerCase().includes("no record") ||
        errorMsg.toLowerCase().includes("check in first") ||
        status === 404;

      if (notFoundError) {
        toast.error("You haven't checked in yet today!", {
          description: "Please check-in first before checking out.",
          duration: 5000,
        });
        setNotCheckedIn(true);
      } else {
        toast.error(errorMsg || "Failed to record check-out");
      }
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex justify-center mt-20 px-4">
      <Card className="w-full max-w-2xl shadow-md border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Employee Check-Out
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-800 p-3 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-100">
              <strong>Employee ID:</strong> {employeeId || "Loading..."}
            </p>
          </div>

          {notCheckedIn ? (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-red-800 font-semibold mb-2">
                ⚠️ You haven&apos;t checked in yet today!
              </p>
              <p className="text-sm text-red-700 mb-3">
                You need to check-in first before you can check-out.
              </p>
              <Button
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={() => window.location.href = '/attendance-new'}
              >
                Go to Check-In Page
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-yellow-50 dark:bg-yellow-800 p-2 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <p className="text-sm text-yellow-800 dark:text-yellow-100">
                  <Info className="inline-block mr-2" /> This will record your check-out with the <strong>current date and time</strong> automatically.
                </p>
              </div>

              <Button
                className="w-full"
                disabled={loading || !employeeId}
                onClick={handleSubmit}
              >
                {loading ? "Recording..." : !employeeId ? "Loading..." : "Record Check-Out Now"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
