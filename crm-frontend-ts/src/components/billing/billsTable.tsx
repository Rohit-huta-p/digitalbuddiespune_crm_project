"use client";
import React, { useEffect, useState } from "react";
import DataTable from "./components/data-table";
import axios from "axios";
import { Main } from "../layout/main";

const BillsTable = ({ loading, bills, fetchBills }: any) => {
  useEffect(() => {
    fetchBills();
  }, []);

  return (
    <Main>
      <DataTable loading={loading} data={bills} />
    </Main>
  );
};

export default BillsTable;
