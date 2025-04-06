"use client";

import React from "react";

// No props needed for simplified header
export function HistoryHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Interview History</h1>
        <p className="text-muted-foreground">
          Track your performance and progress over time
        </p>
      </div>
    </div>
  );
}
