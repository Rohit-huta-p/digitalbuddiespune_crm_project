"use client";

import {
  IconArrowDown,
  IconArrowRight,
  IconArrowUp,
  IconCircle,
  IconCircleCheck,
  IconCircleX,
  IconExclamationCircle,
  IconStopwatch,
} from "@tabler/icons-react";

export const labels = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
];

export const statuses = [
  {
    value: "open",
    label: "Open",
    icon: IconArrowUp,
  },
  {
    value: "closed",
    label: "Closed",
    icon: IconCircleCheck,
  },
  {
    value: "pending",
    label: "Pending",
    icon: IconArrowRight,
  },
];

export const priorities = [
  {
    label: "Low",
    value: "low",
    icon: IconArrowDown,
  },
  {
    label: "Medium",
    value: "medium",
    icon: IconArrowRight,
  },
  {
    label: "High",
    value: "high",
    icon: IconArrowUp,
  },
];
