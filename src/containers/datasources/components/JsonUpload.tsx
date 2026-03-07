// path: src/components/JsonUpload.tsx
import { persistedDatasetsAtom, type Dataset } from "@/state/data/dataset";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { dataEngine } from "@/core/data-engine";
import { useAtom } from "jotai";
import { CheckCircle, XCircle } from "lucide-react";
import React, { useState } from "react";

interface JsonUploadProps {
  setMode: React.Dispatch<React.SetStateAction<"idle" | "json">>;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    sizes.length - 1
  );
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
};

const JsonUpload = ({ setMode }: JsonUploadProps) => {
  const [datasets, setDatasets] = useAtom(persistedDatasetsAtom);
  const [jsonData, setJsonData] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // local status only
  const [parsed, setParsed] = useState<unknown | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleJsonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadSuccess(false);
    setError(null);

    try {
      // parse once
      const data = JSON.parse(jsonData);

      // compute metadata
      const bytes = new Blob([jsonData]).size;
      const size = formatBytes(bytes);
      const records = Array.isArray(data) ? data.length : undefined;

      const id = crypto.randomUUID();
      await dataEngine.saveDataset(id, data);

      const ds: Dataset = {
        id,
        name: `Dataset ${datasets.length + 1}`,
        type: "json",
        size,
        records,
        uploadDate: new Date().toISOString(),
        preview: Array.isArray(data) ? data.slice(0, 10) : [data],
        storageKey: `dataset:${id}`,
      };

      // set state
      setParsed(data);
      setDatasets([...datasets, ds]);
      setUploadSuccess(true);

      // go back to list view
      setMode("idle");
    } catch (err) {
      const msg = (err as Error)?.message || "Invalid JSON";
      setParsed(null);
      setError(msg);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadSuccess(false), 1200);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-card-foreground">Paste JSON</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMode("idle")}
          disabled={isUploading}
        >
          Back
        </Button>
      </div>

      <form onSubmit={handleJsonSubmit} className="space-y-4">
        <Textarea
          placeholder='Drop JSON here (e.g. [{"id":1,"name":"Alice"}])'
          value={jsonData}
          onChange={(e) => setJsonData(e.target.value)}
          className="min-h-[200px] max-h-[200px] font-mono text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          disabled={isUploading}
        />

        {/* status line */}
        <div className="text-sm text-muted-foreground min-h-[1.25rem]">
          {error && (
            <span className="text-destructive inline-flex items-center">
              <XCircle className="h-4 w-4 mr-1" /> {error}
            </span>
          )}
          {!error && parsed != null && (
            <span className="inline-flex items-center">
              Parsed{" "}
              {Array.isArray(parsed) ? `${parsed.length} item(s)` : "object"}{" "}
              and saved.
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={!jsonData.trim() || isUploading}
            className="relative"
          >
            {isUploading ? (
              <>
                <Loader type="line" size={35} />
                Processing...
              </>
            ) : uploadSuccess ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Success!
              </>
            ) : (
              "Parse & Save"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setMode("idle")}
            disabled={isUploading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default JsonUpload;
