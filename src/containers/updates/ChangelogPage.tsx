import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { UpdateCard, type Update } from "./changelog/UpdateCard";

// Summarized from your git log (picked real, meaningful changes)
const updates: Update[] = [
  {
    id: "2025-10-15",
    date: "Oct 15, 2025",
    title: "Dataset Containers, File Uploads & Changelog Page",
    tags: ["Feature", "Fix", "Chore"],
    sections: [
      {
        title: "New Features",
        items: [
          "Add **ButtonGroup** component for enhanced button layouts.",
          "Implement **Dataset** container for dataset management and display.",
          "Create **Datasources** container for handling data source uploads.",
          "Develop **DatasourceList** component for displaying datasets with previews.",
          "Introduce **JsonUpload** component for JSON data uploads with validation.",
          "Implement **FileUpload** component for CSV and JSON file uploads.",
          "Add **ChangelogPage** to display application updates and changes.",
          "Create **UpdateCard** component for rendering individual update entries.",
          "Implement **OPFS utility functions** for file system access.",
        ],
      },
      {
        title: "Fixes",
        items: ["Add type definitions for global file system interfaces."],
      },
      {
        title: "Chores & Refactors",
        items: [
          "Refactor and organize code for improved readability and maintainability.",
        ],
      },
    ],
  },
  {
    id: "2025-10-13",
    date: "Oct 13, 2025",
    title: "Enhanced Date Handling & Scroll UI",
    tags: ["Feature", "Fix"],
    sections: [
      {
        title: "Improvements",
        items: [
          "Add d3-time-format + types for robust date formatting in charts.",
          "Introduce ScrollArea (+ ScrollBar) and integrate into dataset list.",
          "JSON upload UX: Textarea input with validation & error states.",
        ],
      },
      {
        title: "Bug Fixes",
        items: ["Remove unused imports (e.g., ScrollArea in DatasetsPage)."],
      },
    ],
  },
  {
    id: "2025-08-22",
    date: "Aug 22, 2025",
    title: "Dataset Management & Validation",
    tags: ["Feature", "Refactor"],
    sections: [
      {
        title: "Improvements",
        items: [
          "Add lodash-es utilities; introduce persisted Jotai atoms for datasets.",
          "Implement dataset upload (JSON/CSV) with validation pipeline.",
          "Add Activity & Visuals views; switch Home → ViewRenderer.",
        ],
      },
      {
        title: "Changes",
        items: [
          "Force dark theme; tidy imports and comments across components.",
        ],
      },
    ],
  },
  {
    id: "2025-07-24",
    date: "Jul 24, 2025",
    title: "Tooltip Overhaul & UI Polish",
    tags: ["Fix", "Refactor"],
    sections: [
      {
        title: "Changes",
        items: [
          "Replace SVG tooltip with HTML tooltip; auto arrow direction.",
          "Refine tooltip positioning; remove unused Arrow import.",
        ],
      },
      {
        title: "Chore",
        items: ["Add favicon and update index.html metadata."],
      },
    ],
  },
  {
    id: "2025-07-20",
    date: "Jul 20, 2025",
    title: "Chart Settings & Performance",
    tags: ["Feature", "Refactor"],
    sections: [
      {
        title: "Improvements",
        items: [
          "Grid type & data-point visibility toggles in Chart settings.",
          "BaseChart: add SVG tooltip support hook; settings propagation cleanup.",
        ],
      },
    ],
  },
  {
    id: "2025-07-08",
    date: "Jul 8, 2025",
    title: "Color Picker & Rendering Improvements",
    tags: ["Feature", "Fix", "Refactor"],
    sections: [
      {
        title: "Improvements",
        items: [
          "Add react-colorful + ColorSelector; gradient fill support for area charts.",
          "Streamline renderAxes/renderSeries; improve grid generation (idempotent).",
        ],
      },
      {
        title: "Bug Fixes",
        items: ["Type fixes for lastRef; tooltip data handling improvements."],
      },
    ],
  },
  {
    id: "2025-07-07",
    date: "Jul 7, 2025",
    title: "Type Support for WebAssembly Bridge",
    tags: ["Chore"],
    sections: [
      {
        title: "Improvements",
        items: [
          "Add TypeScript declarations for wasm_math_bg.wasm (memory + bindings).",
        ],
      },
    ],
  },
  {
    id: "2025-07-05",
    date: "Jul 5, 2025",
    title: "Initial Setup & Worker-based Data",
    tags: ["Feature"],
    sections: [
      {
        title: "Improvements",
        items: [
          "Project bootstrap: Vite + React + Tailwind + TypeScript.",
          "Add dataWorker.ts for WASM-backed time-series generation.",
          "Create simple LineChart demo and TS configs (app/node).",
        ],
      },
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen">
      {/* Sticky header */}
      <header className="h-70 sticky top-0 z-20 overflow-hidden flex items-center bg-gradient-to-br from-blue-500 to-black p-6 text-center text-white shadow-md sm:p-10">
        <div className="mx-auto max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2">
            <Badge className="bg-white/10 text-white hover:bg-white/20">
              Changelog
            </Badge>
            <span className="opacity-80 text-sm">Plug &amp; Play</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            What&apos;s new?
          </h1>
          <p className="text-balance text-sm opacity-85 sm:text-base">
            Feature releases, enhancements, design updates, and important fixes.
          </p>
        </div>
      </header>

      {/* Scrollable log list */}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10">
          {updates.map((u, i) => (
            <React.Fragment key={u.id}>
              <UpdateCard update={u} />
              {i < updates.length - 1 && <hr className="border-t" />}
            </React.Fragment>
          ))}
        </div>
      </main>
    </div>
  );
}
