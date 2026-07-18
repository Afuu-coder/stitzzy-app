"use client";

import { useEffect, useState, useRef } from "react";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Building2, Plus, Trash2, X, Loader2, Image as ImageIcon, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function AdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "university",
    city: "",
    state: "",
    address: "",
    description: "",
    isActive: true,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  async function fetchInstitutions() {
    setLoading(true);
    try {
      const q = query(collection(db, "institutions"), orderBy("createdAt", "desc"), limit(200));
      const snap = await getDocs(q);
      setInstitutions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      toast.error("Failed to load institutions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, val]) => form.append(key, String(val)));
      
      if (logoFile) form.append("logo", logoFile);
      if (coverFile) form.append("cover", coverFile);

      let url = "/api/admin/institutions";
      let method = "POST";
      if (editId) {
        url = `/api/admin/institutions?id=${editId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        body: form,
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success(editId ? "Institution updated" : "Institution added");
      setIsModalOpen(false);
      setEditId(null);
      setFormData({ name: "", slug: "", type: "university", city: "", state: "", address: "", description: "", isActive: true });
      setLogoFile(null);
      setCoverFile(null);
      fetchInstitutions();
    } catch (error: any) {
      toast.error(error.message || "Failed to add institution");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/institutions?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Status updated");
      fetchInstitutions();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const res = await fetch(`/api/admin/institutions?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !currentFeatured }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(currentFeatured ? "Removed from homepage" : "Pinned to homepage ⭐");
      fetchInstitutions();
    } catch (error: any) {
      toast.error(error.message || "Failed to update");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (deletingId === id) {
      try {
        const res = await fetch(`/api/admin/institutions?id=${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error(await res.text());
        toast.success("Institution deleted");
        setDeletingId(null);
        fetchInstitutions();
      } catch (error: any) {
        toast.error(error.message || "Failed to delete institution");
        setDeletingId(null);
      }
    } else {
      setDeletingId(id);
      toast(`Delete "${name}"? Click the button again to confirm.`, {
        duration: 4000,
        onDismiss: () => setDeletingId(null),
        onAutoClose: () => setDeletingId(null),
      });
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Institutions</h1>
          <p className="font-mono text-xs text-ink-muted mt-1">Manage university and college campuses</p>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setFormData({ name: "", slug: "", type: "university", city: "", state: "", address: "", description: "", isActive: true });
            setIsModalOpen(true);
          }}
          className="btn-primary font-mono text-xs uppercase tracking-wide px-4 py-2 rounded-lg flex items-center gap-2"
          aria-label="Add new institution"
        >
          <Plus size={14} aria-hidden="true" /> Add Institution
        </button>
      </div>

      <div className="stitch-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Institutions">
            <thead>
              <tr className="border-b border-ink/5">
                <th scope="col" className="font-mono text-[10px] uppercase tracking-widest text-ink-muted text-left px-6 py-4">Name</th>
                <th scope="col" className="font-mono text-[10px] uppercase tracking-widest text-ink-muted text-left px-6 py-4">Type</th>
                <th scope="col" className="font-mono text-[10px] uppercase tracking-widest text-ink-muted text-left px-6 py-4">Location</th>
                <th scope="col" className="font-mono text-[10px] uppercase tracking-widest text-ink-muted text-left px-6 py-4">Status</th>
                <th scope="col" className="font-mono text-[10px] uppercase tracking-widest text-ink-muted text-left px-6 py-4">Homepage</th>
                <th scope="col" className="font-mono text-[10px] uppercase tracking-widest text-ink-muted text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-ink-muted font-mono text-xs">Loading...</td>
                </tr>
              ) : institutions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-ink-muted font-mono text-xs">No institutions found.</td>
                </tr>
              ) : (
                institutions.map((inst, i) => (
                  <motion.tr
                    key={inst.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-ink/5 hover:bg-canvas-2 transition-colors last:border-0"
                  >
                    <td className="px-6 py-4 font-display font-medium text-ink">{inst.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-ink-muted capitalize">{inst.type}</td>
                    <td className="px-6 py-4 font-mono text-xs text-ink-muted">{inst.city ? `${inst.city}, ${inst.state}` : "N/A"}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(inst.id, inst.isActive)}
                        aria-label={`Toggle status for ${inst.name} — currently ${inst.isActive ? "active" : "inactive"}`}
                        className={`font-mono text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full transition-colors ${inst.isActive ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                      >
                        {inst.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleFeatured(inst.id, !!inst.isFeatured)}
                        aria-label={`${inst.isFeatured ? 'Remove from' : 'Pin to'} homepage`}
                        title={inst.isFeatured ? "Remove from homepage" : "Show on homepage"}
                        className={`font-mono text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 ${
                          inst.isFeatured ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-canvas-2 text-ink-muted hover:bg-canvas'
                        }`}
                      >
                        <span>{inst.isFeatured ? "⭐" : "☆"}</span>
                        {inst.isFeatured ? "Featured" : "Not featured"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditId(inst.id);
                            setFormData({
                              name: inst.name || "",
                              slug: inst.slug || "",
                              type: inst.type || "university",
                              city: inst.city || "",
                              state: inst.state || "",
                              address: inst.address || "",
                              description: inst.description || "",
                              isActive: inst.isActive ?? true,
                            });
                            setIsModalOpen(true);
                          }}
                          aria-label={`Edit ${inst.name}`}
                          className="p-1.5 text-ink-muted hover:text-blue-600 transition-colors"
                        >
                          <Edit2 size={14} aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleDelete(inst.id, inst.name)}
                          aria-label={`Delete ${inst.name}${deletingId === inst.id ? " — click again to confirm" : ""}`}
                          className={`p-1.5 transition-colors ${deletingId === inst.id ? 'text-red-600' : 'text-ink-muted hover:text-red-600'}`}
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Institution Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-ink/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="stitch-card w-full max-w-md overflow-hidden shadow-2xl p-0"
            >
              <div className="px-6 py-4 border-b border-ink/5 flex items-center justify-between bg-canvas">
                <h3 className="font-display font-semibold text-ink">{editId ? "Edit Institution" : "Add Institution"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-ink-muted hover:text-ink transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[80vh]">
                <form onSubmit={handleAddSubmit} className="p-6 space-y-4 bg-white">
                  
                  {/* Media Uploads */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5">Logo</label>
                      <div 
                        onClick={() => logoInputRef.current?.click()}
                        className="border-2 border-dashed border-ink/10 rounded-xl h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-canvas-2 hover:border-blue-500/50 transition-colors"
                      >
                        {logoFile ? (
                          <span className="font-mono text-xs text-blue-600 truncate px-2">{logoFile.name}</span>
                        ) : (
                          <>
                            <ImageIcon size={20} className="text-ink-muted mb-1" />
                            <span className="font-mono text-[10px] text-ink-muted">Upload Logo</span>
                          </>
                        )}
                      </div>
                      <input 
                        type="file" ref={logoInputRef} className="hidden" accept="image/*"
                        onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5">Cover Image</label>
                      <div 
                        onClick={() => coverInputRef.current?.click()}
                        className="border-2 border-dashed border-ink/10 rounded-xl h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-canvas-2 hover:border-blue-500/50 transition-colors"
                      >
                        {coverFile ? (
                          <span className="font-mono text-xs text-blue-600 truncate px-2">{coverFile.name}</span>
                        ) : (
                          <>
                            <ImageIcon size={20} className="text-ink-muted mb-1" />
                            <span className="font-mono text-[10px] text-ink-muted">Upload Cover</span>
                          </>
                        )}
                      </div>
                      <input 
                        type="file" ref={coverInputRef} className="hidden" accept="image/*"
                        onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5">Institution Name</label>
                  <input 
                    required 
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                      setFormData({ ...formData, name, slug });
                    }}
                    className="w-full bg-canvas border border-ink/10 rounded-lg px-4 py-2.5 text-ink font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                    placeholder="e.g. Dibrugarh University"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5">URL Slug</label>
                  <input 
                    required 
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full bg-canvas border border-ink/10 rounded-lg px-4 py-2.5 text-ink font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                    placeholder="e.g. dibrugarh-university"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5">Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-canvas border border-ink/10 rounded-lg px-4 py-2.5 text-ink font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                  >
                    <option value="university">University</option>
                    <option value="college">College</option>
                    <option value="school">School</option>
                    <option value="coaching">Coaching</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5">City</label>
                    <input 
                      required 
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-canvas border border-ink/10 rounded-lg px-4 py-2.5 text-ink font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                      placeholder="e.g. Dibrugarh"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5">State</label>
                    <input 
                      required 
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-canvas border border-ink/10 rounded-lg px-4 py-2.5 text-ink font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                      placeholder="e.g. Assam"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5">Address</label>
                  <input 
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-canvas border border-ink/10 rounded-lg px-4 py-2.5 text-ink font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                    placeholder="Full campus address"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full bg-canvas border border-ink/10 rounded-lg px-4 py-2.5 text-ink font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" 
                    placeholder="Brief information about the institution"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded bg-canvas border-ink/20 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="font-mono text-xs text-ink cursor-pointer">Active (Visible to users)</label>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-ink/10 text-ink font-mono text-xs uppercase tracking-wide hover:bg-canvas-2 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 rounded-lg btn-primary font-mono text-xs uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Save Institution"}
                  </button>
                </div>
              </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
