// components/layout/client-task-actions.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import CreateNormalTaskDialog from "./create-norma-task";

export default function ClientTaskActions() {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <>
      <Button className="space-x-1" onClick={() => setOpenDialog(true)}>
        Create Tasks
      </Button>
      <CreateNormalTaskDialog open={openDialog} onOpenChange={setOpenDialog} />
    </>
  );
}
