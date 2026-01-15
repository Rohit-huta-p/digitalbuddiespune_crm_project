"use client";

import ClientTaskActions from "../sidebar/client-task-action";

export function TasksPrimaryButtons() {
  return (
    <div className="flex gap-2">
      <ClientTaskActions />
    </div>
  );
}
