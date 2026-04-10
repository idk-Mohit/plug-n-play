import { persistedDatasetsAtom, type Dataset } from "@/state/data/dataset";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { CheckCircle, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { dataEngine } from "@/core/data-engine";
import { formatBytes } from "@/utils/format";
import { parseCsvToRecords } from "@/utils/csv";

const FileUpload = () => {
  const [, setDatasets] = useAtom(persistedDatasetsAtom);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadSuccess(false);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const lower = file.name.toLowerCase();
      const isJson = lower.endsWith(".json");

      try {
        let parsedData: unknown;
        let recordCount = 0;

        if (isJson) {
          parsedData = JSON.parse(content);
          recordCount = Array.isArray(parsedData)
            ? parsedData.length
            : parsedData !== null && typeof parsedData === "object"
              ? 1
              : 0;
        } else {
          const rows = parseCsvToRecords(content);
          parsedData = rows;
          recordCount = rows.length;
        }

        const id = crypto.randomUUID();
        const displayName = file.name.replace(/\.[^/.]+$/, "");

        await dataEngine.saveDataset(id, parsedData);

        const bytes = new Blob([content]).size;
        const size = formatBytes(bytes);
        const preview =
          Array.isArray(parsedData) && parsedData.length > 0
            ? parsedData.slice(0, 10)
            : parsedData !== null && typeof parsedData === "object"
              ? [parsedData]
              : [];

        const ds: Dataset = {
          id,
          name: displayName,
          type: isJson ? "json" : "csv",
          size,
          records: recordCount,
          uploadDate: new Date().toISOString(),
          preview,
          storageKey: `dataset:${id}`,
        };

        setDatasets((prev) => [...prev, ds]);
        setIsUploading(false);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 10000);
      } catch (error) {
        console.error("Error parsing file:", error);
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  }, [setDatasets]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        void handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      void handleFileUpload(e.target.files[0]);
    }
  };
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-card rounded-lg border-2 border-dashed p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md group animate-in fade-in slide-in-from-right-4",
        dragActive
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-border hover:border-primary/50 hover:bg-accent/5",
        isUploading && "pointer-events-none opacity-75"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() =>
        !isUploading && document.getElementById("file-upload")?.click()
      }
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div
          className={`${
            isUploading ? "p-[8px] flex justify-center items-center" : "p-4"
          } rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110`}
        >
          {isUploading ? (
            <Loader type="random" size={35} />
          ) : uploadSuccess ? (
            <CheckCircle className="h-8 w-8 text-green-500" />
          ) : (
            <Upload className="h-8 w-8 text-primary" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-medium text-card-foreground group-hover:text-primary transition-colors duration-200">
            {isUploading
              ? "Processing..."
              : uploadSuccess
                ? "Upload Complete!"
                : "Upload CSV or JSON"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isUploading ? "Please wait..." : "Choose your data file"}
          </p>
        </div>
      </div>

      <input
        id="file-upload"
        type="file"
        accept=".json,.csv"
        onChange={handleFileInput}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};

export default FileUpload;
