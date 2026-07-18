"use client";

import { Activity } from "lucide-react";

export default function AdminActivityPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Activity Logs</h1>
          <p className="font-mono text-xs text-ink-muted mt-1">System and admin action audit trail</p>
        </div>
      </div>

      <div className="stitch-card overflow-hidden p-12 text-center">
        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600" aria-hidden="true">
          <Activity size={32} />
        </div>
        <h2 className="text-ink font-semibold mb-2">Audit Logs</h2>
        <p className="text-ink-muted text-sm max-w-md mx-auto">
          View a chronological timeline of all admin actions, inventory changes, and system events.
        </p>
      </div>
    </div>
  );
}
