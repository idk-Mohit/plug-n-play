"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * A small, flexible Combobox wrapper for shadcn/ui.
 * - Works with arbitrary item shapes via getOptionLabel/getOptionValue.
 * - Controlled or uncontrolled.
 * - Exposes onValueChange with the full object (or null).
 * - Customizable sizing & styling.
 */

type ComboboxProps<T> = {
  options: T[];

  /** Uncontrolled default selected item (object) */
  defaultValue?: T | null;

  /** Controlled selected item (object) */
  value?: T | null;

  /** Called with the object (or null) when selection changes */
  onValueChange?: (next: T | null) => void;

  /** Map item -> label (default: String(item as any)) */
  getOptionLabel?: (item: T) => string;

  /** Map item -> string id (must be unique & stable) */
  getOptionValue?: (item: T) => string;

  /** Placeholders / messages */
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;

  /** UI controls */
  disabled?: boolean;

  /** Sizing & classes */
  className?: string; // wrapper
  triggerClassName?: string; // button
  contentClassName?: string; // popover content
  listClassName?: string; // CommandList/Group wrapper
  matchTriggerWidth?: boolean; // popover matches trigger width
  triggerWidthClass?: string; // override width class for trigger (e.g. "w-64" or "w-full")

  /** Popover control (rarely needed) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  /** Optional custom render for each option row (advanced) */
  renderOption?: (item: T, selected: boolean, label: string) => React.ReactNode;
};

export function Combobox<T>({
  options,
  defaultValue = null,
  value,
  onValueChange,

  getOptionLabel = (item) => String(item as unknown),
  getOptionValue = (item) => getOptionLabel(item),

  placeholder = "Select an option…",
  searchPlaceholder = "Search…",
  emptyMessage = "No results.",
  disabled = false,

  className,
  triggerClassName,
  contentClassName,
  listClassName,
  matchTriggerWidth = true,
  triggerWidthClass = "w-[240px]",

  open,
  onOpenChange,

  renderOption,
}: ComboboxProps<T>) {
  const isControlled = value !== undefined;

  // Internally we track the selected "id" (string) for CommandItem.value
  const toId = React.useCallback(
    (item: T | null | undefined) => (item ? getOptionValue(item) : ""),
    [getOptionValue]
  );

  // Build index maps for quick lookup
  const idToItem = React.useMemo(() => {
    const map = new Map<string, T>();
    for (const opt of options) map.set(getOptionValue(opt), opt);
    return map;
  }, [options, getOptionValue]);

  // Uncontrolled fallback state
  const [uncontrolledId, setUncontrolledId] = React.useState(
    defaultValue ? toId(defaultValue) : ""
  );

  // Keep uncontrolled state in sync with defaultValue changes
  React.useEffect(() => {
    if (!isControlled && defaultValue !== undefined) {
      setUncontrolledId(defaultValue ? toId(defaultValue) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  const selectedId = isControlled ? toId(value as T | null) : uncontrolledId;
  const selectedItem = selectedId ? idToItem.get(selectedId) ?? null : null;
  const selectedLabel = selectedItem ? getOptionLabel(selectedItem) : "";

  // Popover open state
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = open ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const selectById = (id: string) => {
    const next = id ? idToItem.get(id) ?? null : null;

    if (!isControlled) setUncontrolledId(id);

    onValueChange?.(next);
    setOpen(false);
  };

  return (
    <div className={cn("inline-flex flex-col gap-1", className)}>
      <Popover open={isOpen} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            disabled={disabled}
            className={cn(
              "justify-between",
              triggerWidthClass,
              disabled && "cursor-not-allowed opacity-60",
              triggerClassName
            )}
          >
            <span
              className={cn(
                "truncate text-left",
                !selectedLabel && "text-muted-foreground"
              )}
            >
              {selectedLabel || placeholder}
            </span>

            <span className="ml-2 flex items-center gap-1 shrink-0">
              <ChevronsUpDownIcon className="h-4 w-4 opacity-60" />
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className={cn(
            matchTriggerWidth && triggerWidthClass,
            "p-0",
            contentClassName
          )}
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList className={listClassName}>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const id = getOptionValue(opt);
                  const label = getOptionLabel(opt);
                  const selected = id === selectedId;

                  return (
                    <CommandItem
                      key={id}
                      value={id}
                      onSelect={(currentId) => selectById(currentId)}
                    >
                      {renderOption ? (
                        renderOption(opt, selected, label)
                      ) : (
                        <>
                          <CheckIcon
                            className={cn(
                              "mr-2 h-4 w-4",
                              selected ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="truncate">{label}</span>
                        </>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
