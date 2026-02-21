"use client";

import { useEffect, useState } from "react";
import { Main } from "@/components/layout/main";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Banknote, CalendarCheck, Percent, ReceiptIndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

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

type SortField = "employeeName" | "month" | "totalSalary" | "netSalary";

const SalariesPage = () => {
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageNum, setPageNum] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("month");
  const [isCompact, setIsCompact] = useState(false);

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

  const filteredSalaries = salaries
    .filter((salary) =>
      `${salary.employeeName || `ID: ${salary.employeeId}`} ${salary.month}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === "employeeName" || sortField === "month") {
        const valA = String(a[sortField] || "");
        const valB = String(b[sortField] || "");
        return valA.localeCompare(valB, "en", { sensitivity: "base" });
      } else {
        return (b[sortField] || 0) - (a[sortField] || 0);
      }
    });

  return (
    <Main>
      <div className="px-4 py-10 space-y-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-2xl font-bold">💳 Salary History</CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => window.location.href = '/salaries/calculate'}>
                ➕ Calculate Salary
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/salaries/mark-paid'}>
                ✔️ Mark as Paid
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <Input
                placeholder="🔍 Search salaries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-1/2"
              />
              <div className="flex items-center gap-4">
                <Label htmlFor="sort">Sort By</Label>
                <select
                  id="sort"
                  className="border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                >
                  <option value="month">Month</option>
                  <option value="employeeName">Employee Name</option>
                  <option value="totalSalary">Total Salary</option>
                  <option value="netSalary">Net Salary</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="compact-toggle"
                  checked={isCompact}
                  onCheckedChange={setIsCompact}
                />
                <Label htmlFor="compact-toggle">Compact Mode</Label>
              </div>
            </div>

            <div className="space-y-2 divide-y border rounded-md overflow-hidden">
              {loading && salaries.length === 0 && (
                <p className="text-muted-foreground text-sm px-4 py-6 text-center">
                  Loading salaries...
                </p>
              )}
              {!loading && filteredSalaries.length === 0 && (
                <p className="text-muted-foreground text-sm px-4 py-6 text-center">
                  No records found.
                </p>
              )}
              {filteredSalaries.map((salary) => (
                <div
                  key={salary.id}
                  className={cn(
                    "flex flex-col md:flex-row justify-between items-start md:items-center p-4 transition-all gap-4",
                    isCompact ? "text-sm" : "text-base"
                  )}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{salary.employeeName || `ID: ${salary.employeeId}`}</p>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-semibold",
                        salary.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      )}>
                        {salary.status || 'Calculated'}
                      </span>
                    </div>
                    <p className="text-muted-foreground font-medium flex items-center gap-1">
                      <CalendarCheck className="w-4 h-4" /> {salary.month}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
                    <div className="flex flex-col items-end md:items-start">
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Banknote className="w-4 h-4" /> Total: <span className="font-medium text-foreground">₹{salary.totalSalary?.toFixed(2)}</span>
                      </p>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Percent className="w-4 h-4" /> Tax: <span className="font-medium text-foreground">{salary.taxPercentage}% (₹{(salary.taxAmount || 0).toFixed(2)})</span>
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-muted-foreground">Net Salary</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-500 flex items-center gap-1">
                        <ReceiptIndianRupee className="w-5 h-5" />
                        ₹{(salary.totalSalary - (salary.taxAmount || 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageNum(Math.max(0, pageNum - 1))}
                disabled={pageNum === 0 || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="text-sm text-muted-foreground font-medium">
                Page {pageNum + 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageNum(pageNum + 1)}
                disabled={salaries.length < pageSize || loading}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Main>
  );
};

export default SalariesPage;
