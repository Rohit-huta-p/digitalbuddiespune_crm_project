"use client";

import { z } from "zod";

export const taskSchema = z.object({
  assignedBy: z.number(),
  deadlineTimestamp: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  assignedTimestamp: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  description: z.string(),
  taskName: z.string(),
  assignedToEmployeeId: z.array(z.number()),
  id: z.number(),
  email: z.string().email().optional().nullable(),
  status: z.string(),
  priority: z.string().optional().nullable(),
});

export type Task = z.infer<typeof taskSchema>;
