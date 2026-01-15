import { useState, useMemo } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  values,
  onChange,
  options,
  placeholder = "Select options",
  className = "",
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase())
      ),
    [search, options]
  );

  const toggleOption = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border rounded-md px-3 py-2 text-left flex justify-between items-center"
      >
        <span
          className={cn(
            "truncate",
            values.length === 0 && "text-muted-foreground"
          )}
        >
          {values.length > 0
            ? options
                .filter((o) => values.includes(o.value))
                .map((o) => o.label)
                .join(", ")
            : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-md border bg-background shadow-md max-h-60 overflow-auto">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
          {filteredOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-center justify-between px-3 py-2 hover:bg-muted cursor-pointer"
              onClick={() => toggleOption(option.value)}
            >
              <span>{option.label}</span>
              {values.includes(option.value) && (
                <Check className="h-4 w-4 text-green-500" />
              )}
            </div>
          ))}
          {filteredOptions.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No options found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
