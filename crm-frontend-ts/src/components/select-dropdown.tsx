"use client";
/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SelectItemOption<T extends string | number> {
  label: string;
  value: T;
}

interface SelectDropdownProps<T extends string | number> {
  items: SelectItemOption<T>[];
  value?: T;
  defaultValue?: T;
  placeholder?: string;
  onValueChange?: (_value: T) => void;
}

export function SelectDropdown<T extends string | number>({
  items,
  value,
  defaultValue,
  placeholder,
  onValueChange,
}: SelectDropdownProps<T>) {
  return (
    <Select
      value={value !== undefined ? String(value) : undefined}
      defaultValue={defaultValue !== undefined ? String(defaultValue) : undefined}
      onValueChange={(value) =>
        onValueChange?.(
          typeof items[0].value === "number"
            ? (Number(value) as T)
            : (value as T)
        )
      }
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={String(item.value)} value={String(item.value)}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
