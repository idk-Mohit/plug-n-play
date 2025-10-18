import { Separator } from "@/components/ui/separator";
import { PanelBottomOpen } from "lucide-react";
import IconButton from "../IconButton";
import { Combobox } from "../ui/combobox";

export function SiteFooter() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-t transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <IconButton icon={PanelBottomOpen} variant="ghost" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="ml-auto flex items-center gap-2">
          <Combobox
            options={["Dog", "Cat", "Horse", "Elephant", "Monkey"]}
            getOptionLabel={(s) => s}
            getOptionValue={(s) => s}
            placeholder="Pick an animal"
            triggerWidthClass="w-64" // easy width control
            onValueChange={(v) => console.log("Selected:", v)} // v is string | null
          />
        </div>
      </div>
    </header>
  );
}
