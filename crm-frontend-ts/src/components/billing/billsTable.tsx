"use client";
import React, { useEffect } from "react";
import DataTable from "./components/data-table";
import { Main } from "../layout/main";
import { InvoiceModal } from "./components/invoice-modal";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BillsTable = ({ loading, bills, fetchBills }: any) => {
  const [selectedBill, setSelectedBill] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  useEffect(() => {
    fetchBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRowClick = (billData: any) => {
    setSelectedBill(billData);
    setIsModalOpen(true);
  };

  return (
    <Main>
      <DataTable loading={loading} data={bills} onRowClick={handleRowClick} />
      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bill={selectedBill}
      />
    </Main>
  );
};

export default BillsTable;
