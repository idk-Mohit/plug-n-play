import { useRef, useState, type ChangeEvent } from "react";
import { useAtom } from "jotai";
import { persistedDatasetsAtom, type DatasetMeta } from "@/atoms/dataset.atom";
import { validateJsonDataset } from "@/utils/commonFunctions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DatasetsPage() {
  const [datasets, setDatasets] = useAtom(persistedDatasetsAtom);
  const [mode, setMode] = useState<"idle" | "json">("idle");
  const [jsonInput, setJsonInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleJsonSubmit = () => {
    const result = validateJsonDataset(jsonInput);
    if (!result.valid) return alert(result.reason);
    const id = Date.now();
    const newMeta: DatasetMeta = {
      id,
      name: `Dataset ${datasets.length + 1}`,
      type: "json",
      added: new Date().toISOString(),
    };
    setDatasets([...datasets, newMeta]);
    setJsonInput("");
    setMode("idle");
  };

  const handleCsvUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      if (!text.includes(",")) return alert("Invalid CSV");
      const id = Date.now();
      const newMeta: DatasetMeta = {
        id,
        name: file.name,
        type: "csv",
        added: new Date().toISOString(),
      };
      setDatasets([...datasets, newMeta]);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDelete = (id: number) => {
    setDatasets(datasets.filter((d) => d.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      {mode === "idle" && (
        <div className="flex gap-4 flex-wrap">
          <Card
            className="cursor-pointer w-60 hover:border-gray-600 transition"
            onClick={() => setMode("json")}
          >
            <CardHeader className="text-white text-base font-semibold">
              Paste JSON
            </CardHeader>
            <CardContent className="text-sm text-gray-400">
              Drop your data directly here
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer w-60 hover:border-gray-600 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <CardHeader className="text-white text-base font-semibold">
              Upload CSV
            </CardHeader>
            <CardContent className="text-sm text-gray-400">
              Choose your data file
            </CardContent>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleCsvUpload}
              hidden
            />
          </Card>
        </div>
      )}

      {mode === "json" && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={6}
            placeholder='[{"name": "value"}]'
            className="w-full bg-black text-sm text-white font-mono p-3 rounded border border-gray-700"
          />
          <div className="flex gap-3">
            <button
              onClick={handleJsonSubmit}
              className="px-4 py-1.5 text-sm bg-green-700 hover:bg-green-600 text-white rounded"
            >
              Save
            </button>
            <button
              onClick={() => setMode("idle")}
              className="px-4 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {datasets.map((ds) => (
          <div
            key={ds.id}
            className="bg-gray-900 border border-gray-800 p-4 rounded-md flex justify-between items-center hover:shadow-md transition"
          >
            <div>
              <h3 className="text-white font-medium">{ds.name}</h3>
              <p className="text-xs text-gray-400">
                {ds.type.toUpperCase()} • {new Date(ds.added).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => handleDelete(ds.id)}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          </div>
        ))}
        {datasets.length === 0 && (
          <p className="text-gray-500 text-sm text-center mt-10">
            No datasets added yet. Add one to get started.
          </p>
        )}
      </div>
    </div>
  );
}
