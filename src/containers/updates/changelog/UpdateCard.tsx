import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type UpdateSection = {
  title: string; // "Improvements" | "Bug Fixes" | "Changes" | "New"
  items: string[];
};

export type Update = {
  id: string;
  date: string; // "Oct 13, 2025"
  title: string; // "Version 4.2.92" or "October Updates"
  tags: ("Feature" | "Fix" | "Refactor" | "Chore")[];
  sections: UpdateSection[];
};

const TagBadge: React.FC<{ t: Update["tags"][number] }> = ({ t }) => {
  const styles: Record<string, string> = {
    Feature: "bg-purple-500/15 text-purple-600 hover:bg-purple-500/25",
    Fix: "bg-red-500/15 text-red-600 hover:bg-red-500/25",
    Refactor: "bg-amber-500/15 text-amber-600 hover:bg-amber-500/25",
    Chore: "bg-slate-500/15 text-slate-600 hover:bg-slate-500/25",
  };
  return <Badge className={styles[t]}>{t}</Badge>;
};

export const UpdateCard: React.FC<{ update: Update }> = ({ update }) => {
  return (
    <div className="grid gap-4 md:grid-cols-[120px_1fr] md:gap-8">
      {/* Left: date */}
      <div className="text-muted-foreground mt-1 text-sm md:text-right">
        {update.date}
      </div>

      {/* Right: content */}
      <Card className="rounded-xl">
        <CardContent className="p-5 md:p-6 grid gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold">{update.title}</h2>
            <div className="ml-auto flex flex-wrap gap-2">
              {update.tags?.map((t) => (
                <TagBadge key={t} t={t} />
              ))}
            </div>
          </div>

          {update.sections.map((sec) => (
            <div key={sec.title} className="grid gap-2">
              <h3 className="text-lg font-semibold">{sec.title}</h3>
              <ul className="text-muted-foreground list-disc space-y-1 pl-5">
                {sec.items.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
