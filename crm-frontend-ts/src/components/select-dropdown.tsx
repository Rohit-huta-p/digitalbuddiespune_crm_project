"use client";

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
  defaultValue?: T;
  placeholder?: string;
  onValueChange?: (value: T) => void;
}

export function SelectDropdown<T extends string | number>({
  items,
  defaultValue,
  placeholder,
  onValueChange,
}: SelectDropdownProps<T>) {
  return (
    <Select
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
