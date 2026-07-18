"use client";

import { Users, Shield } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">RBAC & Users</h1>
          <p className="font-mono text-xs text-ink-muted mt-1">Manage admin access and user roles</p>
        </div>
        <button className="btn-primary font-mono text-xs uppercase tracking-wide px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          Invite User
        </button>
      </div>

      <div className="stitch-card overflow-hidden p-12 text-center">
        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600" aria-hidden="true">
          <Shield size={32} />
        </div>
        <h2 className="text-ink font-semibold mb-2">Role Based Access Control</h2>
        <p className="text-ink-muted text-sm max-w-md mx-auto">
          The RBAC management module will allow you to assign Super Admin, Institution Staff, and Support roles using Clerk metadata.
        </p>
      </div>
    </div>
  );
}
