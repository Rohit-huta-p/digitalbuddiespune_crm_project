"use client";

import { useEffect, useState } from "react";
import { Main } from "@/components/layout/main";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SalaryRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  month: string;
  totalSalary: number;
  taxPercentage: number;
  taxAmount: number;
  netSalary: number;
  status: string;
  paidDate?: string;
}

const SalariesPage = () => {
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageNum, setPageNum] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/salary/getSalaries?pageNum=${pageNum}&pageSize=${pageSize}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // Sending empty filter for now
      });

      if (!res.ok) throw new Error("Failed to fetch salaries");

      const data = await res.json();
      // Adjust based on actual backend response structure
      setSalaries(data.content || []);
      setTotalPages(data.totalPages || 0);

    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load salary history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, [pageNum, pageSize]);

  return (
    <Main>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Salary History</h1>
        <div className="flex gap-2">
          <Button onClick={() => window.location.href = '/salaries/calculate'}>
            Calculate Salary
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/salaries/mark-paid'}>
            Mark as Paid
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Salary Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Total Salary</TableHead>
                  <TableHead>Tax (%)</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : salaries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  salaries.map((salary) => (
                    <TableRow key={salary.id}>
                      <TableCell className="font-medium">{salary.employeeName || `ID: ${salary.employeeId}`}</TableCell>
                      <TableCell>{salary.month}</TableCell>
                      <TableCell>₹{salary.totalSalary?.toFixed(2)}</TableCell>
                      <TableCell>{salary.taxPercentage}%</TableCell>
                      <TableCell className="font-bold text-green-600">
                        ₹{(salary.totalSalary - (salary.taxAmount || 0)).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${salary.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {salary.status || 'Calculated'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNum(Math.max(0, pageNum - 1))}
              disabled={pageNum === 0 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {pageNum + 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNum(pageNum + 1)}
              disabled={salaries.length < pageSize || loading} // Simple check, ideally use totalPages
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Main>
  );
};

export default SalariesPage;
