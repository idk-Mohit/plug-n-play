import { useState } from "react";
import { FileText } from "lucide-react";
import CardComponent from "@/components/card/CardComponent";
import FileUpload from "./components/fileUpload";
import JsonUpload from "./components/JsonUpload";
import { DatasourceList } from "./components/DatasourceList";

export default function DatasetsPage() {
  const [mode, setMode] = useState<"idle" | "json">("idle");

  return (
    <div className="flex justify-center items-center p-10">
      <div className="space-y-6 w-full max-w-screen-lg">
        {mode === "idle" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {/* JSON drop */}
            <CardComponent
              styles={{
                root: "!slide-in-from-left-2",
              }}
              onClick={() => setMode("json")}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-card-foreground group-hover:text-primary transition-colors duration-200">
                    Paste JSON
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Drop your data directly here
                  </p>
                </div>
              </div>
            </CardComponent>
            {/* File Upload */}
            <FileUpload />
          </div>
        )}

        {mode === "json" && <JsonUpload setMode={setMode} />}

        <div className="space-y-3">
          <DatasourceList />
        </div>
      </div>
    </div>
  );
}
