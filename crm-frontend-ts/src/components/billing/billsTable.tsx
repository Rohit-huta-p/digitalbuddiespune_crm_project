"use client";
import React, { useEffect } from "react";
import DataTable from "./components/data-table";
import { Main } from "../layout/main";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BillsTable = ({ loading, bills, fetchBills }: any) => {
  useEffect(() => {
    fetchBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Main>
      <DataTable loading={loading} data={bills} />
    </Main>
  );
};

export default BillsTable;
