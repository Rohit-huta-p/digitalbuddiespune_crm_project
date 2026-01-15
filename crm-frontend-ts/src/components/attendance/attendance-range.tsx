"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function AttendanceRangePage() {
  const [loading, setLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [form, setForm] = useState({
    from: "",
    to: "",
  });
  const [attendance, setAttendance] = useState<any[]>([]);

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

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!employeeId) {
      toast.error("Employee ID not loaded. Please refresh the page.");
      return;
    }
    
    if (!form.from || !form.to) {
      toast.error("Please select date range");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/api/attendance/range", {
        employeeId: parseInt(employeeId),
        from: form.from,
        to: form.to,
      });

      const data = res.data;

      if (data.success) {
        setAttendance(data.attendance || []);
        if (data.attendance.length === 0) {
          toast.info("No attendance records found for this period");
        } else {
          toast.success(`Found ${data.attendance.length} record(s)`);
        }
      } else {
        toast.error(data.error?.message || "Something went wrong");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || err.response?.data?.error?.title || "Failed to load attendance";
      toast.error(errorMsg);
      console.error("Attendance range error:", err.response?.data);
      setAttendance([]);
    }

    setLoading(false);
  };

  const calculateWorkHours = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn || !checkOut) return "In Progress";
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="w-full flex justify-center mt-10 px-4">
      <Card className="w-full max-w-4xl shadow-md border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Attendance Report
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Employee ID:</strong> {employeeId || "Loading..."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              name="from"
              value={form.from}
              onChange={handleChange}
              type="date"
              placeholder="From Date"
            />

            <Input
              name="to"
              value={form.to}
              onChange={handleChange}
              type="date"
              placeholder="To Date"
            />
          </div>

          <Button 
            className="w-full" 
            disabled={loading || !employeeId} 
            onClick={handleSubmit}
          >
            {loading ? "Loading..." : !employeeId ? "Loading Employee..." : "Get Attendance Report"}
          </Button>

          {attendance.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Attendance Records</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Date</th>
                      <th className="border p-2 text-left">Check-In</th>
                      <th className="border p-2 text-left">Check-Out</th>
                      <th className="border p-2 text-left">Work Hours</th>
                      <th className="border p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border p-2">
                          {record.attendanceDate || new Date(record.checkIn).toLocaleDateString()}
                        </td>
                        <td className="border p-2">
                          {record.checkIn
                            ? new Date(record.checkIn).toLocaleTimeString()
                            : "N/A"}
                        </td>
                        <td className="border p-2">
                          {record.checkOut
                            ? new Date(record.checkOut).toLocaleTimeString()
                            : "Not checked out"}
                        </td>
                        <td className="border p-2">
                          {calculateWorkHours(record.checkIn, record.checkOut)}
                        </td>
                        <td className="border p-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            record.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                            record.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                            record.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                            record.status === 'HALF_DAY' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {record.status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
