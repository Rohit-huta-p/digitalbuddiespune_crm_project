"use client";
import Bills from "@/components/billing/bills";
import BillsTable from "@/components/billing/billsTable";
import { Main } from "@/components/layout/main";
import { Separator } from "@/components/ui/separator";
// import axios from "axios";
import React, { useState } from "react";

const BillsPage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const fetchBills = async () => {
        try {
          const response = await fetch(
            "/api/get-all-bills?pageSize=15&pageNum=1",
            {
              method: "POST",
            }
          );
          const data = await response.json();
          console.log("BILLING RESPONSE", data);

          const fetchedBills = data.data?.bills || [];
          console.log("BILLS", fetchedBills);

          setBills(fetchedBills);
        } catch (error) {
          console.error("Error fetching bills:", error);
        }
      };
      fetchBills();
      setLoading(false);
    } catch (err: any) {
      console.log(err);
    }
  };

  return (
    <Main className="mt-[4.8rem]">
      <h1 className="text-3xl font-bold tracking-tight pb-3 ml-5">Bills</h1>
      <Separator />

      <Bills fetchBills={fetchBills} />
      <h3 className="text-xl font-semibold tracking-tight ml-5">
        Pending and completed bills
      </h3>
      <BillsTable loading={loading} bills={bills} fetchBills={fetchBills} />
    </Main>
  );
};

export default BillsPage;
