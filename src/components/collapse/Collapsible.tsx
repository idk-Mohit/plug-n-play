import * as React from "react";
import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Select } from "@radix-ui/react-select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";

// Define supported input types
type CollapsibleItem =
  | {
      type: "checkbox" | "toggle";
      label: string;
      value: boolean;
      onChange: (v: boolean) => void;
      icon?: React.ReactNode;
    }
  | {
      type: "select";
      label: string;
      value: string;
      options: string[];
      onChange: (v: string) => void;
    }
  | {
      type: "button";
      label: string;
      onClick: () => void;
    };

type CollapsibleGroup = {
  name: string;
  items: CollapsibleItem[];
};

interface CollapsibleComponentProps {
  data: CollapsibleGroup[];
}

export function CollapsibleComponent({ data }: CollapsibleComponentProps) {
  return (
    <>
      {data.map((group, index) => (
        <React.Fragment key={group.name}>
          <SidebarGroup className="p-0 my-2">
            <Collapsible
              defaultOpen={index === 0}
              className="group/collapsible"
            >
              <SidebarGroupLabel
                asChild
                className="group/label mb-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full text-sm"
              >
                <CollapsibleTrigger>
                  {group.name}
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-2">
                    {group.items.map((item) => {
                      switch (item.type) {
                        case "checkbox":
                        case "toggle":
                          return (
                            <SidebarMenuItem key={item.label}>
                              <SidebarMenuButton asChild>
                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                  <input
                                    type="checkbox"
                                    checked={item.value}
                                    onChange={(e) =>
                                      item.onChange(e.target.checked)
                                    }
                                    className="accent-sidebar-primary"
                                  />
                                  {item.label}
                                </label>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        case "select":
                          return (
                            <SidebarMenuItem key={item.label}>
                              <SidebarMenuButton asChild>
                                <div className="flex h-[30px] items-center gap-2 justify-between py-4">
                                  <Label className="flex flex-col gap-1 text-sm w-fit">
                                    {item.label}
                                  </Label>
                                  <Select
                                    value={item.value}
                                    onValueChange={(value) =>
                                      item.onChange(value)
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select grid" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {item.options.map((type) => (
                                        <SelectItem key={type} value={type}>
                                          {type}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        case "button":
                          return (
                            <SidebarMenuItem key={item.label}>
                              <SidebarMenuButton onClick={item.onClick}>
                                {item.label}
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        default:
                          return null;
                      }
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
          {/* <SidebarSeparator className="mx-0" /> */}
        </React.Fragment>
      ))}
    </>
  );
}
