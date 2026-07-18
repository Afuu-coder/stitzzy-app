"use client";

import { useEffect, useState, useRef } from "react";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Package, Plus, Edit2, Trash2, X, Loader2, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    basePrice: 0,
    stock: 0,
    institutionId: "",
    departmentId: "all", // defaulting to all for now
    category: "Shirt",
    gender: "Unisex",
    description: "",
    isActive: true,
  });
  
  const [sizes, setSizes] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const newFiles = [...imageFiles, ...files].slice(0, 5); // max 5
    setImageFiles(newFiles);
    // generate previews
    const previews = newFiles.map(f => URL.createObjectURL(f));
    setImagePreviews(previews);
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    // Revoke the URL being removed to free memory
    URL.revokeObjectURL(imagePreviews[idx]);
    const newFiles = imageFiles.filter((_, i) => i !== idx);
    const newPreviews = imagePreviews.filter((_, i) => i !== idx);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "26", "28", "30", "32", "34", "36", "38", "40", "42", "44"];

  async function fetchData() {
    setLoading(true);
    try {
      const [prodSnap, instSnap] = await Promise.all([
        getDocs(query(collection(db, "products"), orderBy("createdAt", "desc"), limit(200))),
        getDocs(query(collection(db, "institutions"), orderBy("name")))
      ]);
      setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setInstitutions(instSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.institutionId) {
      toast.error("Please select an institution");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, val]) => form.append(key, String(val)));
      
      form.append("sizes", JSON.stringify(sizes));
      imageFiles.forEach(file => form.append("images", file));

      let url = "/api/admin/products";
      let method = "POST";
      if (editId) {
        url = `/api/admin/products?id=${editId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        body: form,
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success(editId ? "Product updated" : "Product added");
      setIsModalOpen(false);
      setEditId(null);
      setFormData({ name: "", sku: "", basePrice: 0, stock: 0, institutionId: "", departmentId: "all", category: "Shirt", gender: "Unisex", description: "", isActive: true });
      setSizes([]);
      setImageFiles([]);
      setImagePreviews([]);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Status updated");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !currentFeatured }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(currentFeatured ? "Removed from homepage" : "Pinned to homepage ⭐");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (deletingId === id) {
      try {
        const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error(await res.text());
        toast.success("Product deleted");
        setDeletingId(null);
        fetchData();
      } catch (error: any) {
        toast.error(error.message || "Failed to delete product");
        setDeletingId(null);
      }
    } else {
      setDeletingId(id);
      toast(`Delete "${name}"? Click again to confirm.`, {
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
          <h1 className="font-display text-2xl font-semibold text-ink">Products</h1>
          <p className="font-mono text-xs text-ink-muted mt-1">Manage uniforms, SKUs and pricing</p>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setFormData({ name: "", sku: "", basePrice: 0, stock: 0, institutionId: "", departmentId: "all", category: "Shirt", gender: "Unisex", description: "", isActive: true });
            setSizes([]);
            setImageFiles([]);
            setImagePreviews([]);
            setIsModalOpen(true);
          }}
          className="btn-primary font-mono text-xs uppercase tracking-wide px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={14} aria-hidden="true" /> Add Product
        </button>
      </div>

      <div className="stitch-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Products">
            <thead>
              <tr className="border-b border-ink/5">
                <th scope="col" className="font-mono text-[10px] uppercase tracking-widest text-ink-muted text-left px-6 py-4 w-14"></th>
                <th scope="col" className="font-mono text-[10px] uppercase tracking-widest text-ink-muted text-left px-6 py-4">Product Name</th>
                <th scope="col" className="font-mono text-[10px] uppercase tracking-widest text-ink-muted text-left px-6 py-4">SKU</th>
                <th scope="col" className="font-mono text-[10px] uppercase tracking-widest text-ink-muted text-left px-6 py-4">Price</th>
                <th scope="col" className="font-mono text-[10px] uppercase tracking-widest text-ink-muted text-left px-6 py-4">Inventory</th>
                <th scope="col" className="font-mono text-[10px] uppercase tracking-widest text-ink-muted text-left px-6 py-4">Status</th>
                <th scope="col" className="font-mono text-[10px] uppercase tracking-widest text-ink-muted text-left px-6 py-4">Homepage</th>
                <th scope="col" className="font-mono text-[10px] uppercase tracking-widest text-ink-muted text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-ink-muted font-mono text-xs">Loading...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-ink-muted font-mono text-xs">No products found.</td>
                </tr>
              ) : (
                products.map((prod, i) => (
                  <motion.tr
                    key={prod.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-ink/5 hover:bg-canvas-2 transition-colors last:border-0"
                  >
                    <td className="px-6 py-4">
                      {prod.imageUrls?.[0] ? (
                        <div className="w-10 h-10 rounded overflow-hidden bg-canvas-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={prod.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-canvas-2 flex items-center justify-center">
                          <Package size={14} className="text-ink-muted/50" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-display font-medium text-ink">{prod.name}</span>
                        {prod.imageUrls?.length > 1 && (
                          <span className="ml-2 font-mono text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{prod.imageUrls.length} imgs</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-ink-muted">{prod.sku}</td>
                    <td className="px-6 py-4 font-display font-semibold text-ink">₹{prod.basePrice?.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4">
                      {prod.stock !== undefined ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-ink-muted">{prod.stock} left</span>
                          {prod.stock < 10 && (
                            <span className="font-mono text-[9px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                              Low Stock
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-ink-muted">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleStatus(prod.id, prod.isActive)}
                        className={`font-mono text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full transition-colors ${prod.isActive ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                      >
                        {prod.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleFeatured(prod.id, !!prod.isFeatured)}
                        title={prod.isFeatured ? "Remove from homepage" : "Show in Popular section"}
                        className={`font-mono text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 ${
                          prod.isFeatured ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-canvas-2 text-ink-muted hover:bg-canvas'
                        }`}
                      >
                        <span>{prod.isFeatured ? "⭐" : "☆"}</span>
                        {prod.isFeatured ? "Featured" : "Not featured"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditId(prod.id);
                            setFormData({
                              name: prod.name || "",
                              sku: prod.sku || "",
                              basePrice: prod.basePrice || 0,
                              stock: prod.stock || 0,
                              institutionId: prod.institutionId || "",
                              departmentId: prod.departmentId || "all",
                              category: prod.category || "Shirt",
                              gender: prod.gender || "Unisex",
                              description: prod.description || "",
                              isActive: prod.isActive ?? true,
                            });
                            setSizes(prod.sizes || []);
                            setImageFiles([]);
                            setImagePreviews(prod.imageUrls || []);
                            setIsModalOpen(true);
                          }}
                          aria-label={`Edit ${prod.name}`}
                          className="p-1.5 text-ink-muted hover:text-blue-600 transition-colors"
                        >
                          <Edit2 size={14} aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id, prod.name)}
                          aria-label={`Delete ${prod.name}${deletingId === prod.id ? " — click again to confirm" : ""}`}
                          className={`p-1.5 transition-colors ${deletingId === prod.id ? 'text-red-600' : 'text-ink-muted hover:text-red-600'}`}
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

      {/* Add Product Modal */}
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
                <h3 className="font-display font-semibold text-ink">{editId ? "Edit Product" : "Add Product"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-ink-muted hover:text-ink transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[80vh]">
                <form onSubmit={handleAddSubmit} className="p-6 space-y-4 bg-white">
                  
                  {/* Image Upload - Multiple */}
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5">
                      Product Images <span className="normal-case tracking-normal text-ink-muted/60">(up to 5)</span>
                    </label>

                    {/* Thumbnails Grid */}
                    {imagePreviews.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {imagePreviews.map((src, idx) => (
                          <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-ink/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute inset-0 bg-red-600/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={16} />
                            </button>
                            {idx === 0 && (
                              <span className="absolute bottom-0 left-0 right-0 bg-blue-600/80 text-white font-mono text-[8px] text-center py-0.5">PRIMARY</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Dropzone */}
                    {imageFiles.length < 5 && (
                      <div 
                        onClick={() => imageInputRef.current?.click()}
                        className="border-2 border-dashed border-ink/10 rounded-xl h-20 flex flex-col items-center justify-center cursor-pointer hover:bg-canvas-2 hover:border-blue-500/50 transition-colors"
                      >
                        <ImageIcon size={18} className="text-ink-muted mb-1" />
                        <span className="font-mono text-[10px] text-ink-muted">
                          {imageFiles.length === 0 ? 'Click to upload images' : `Add more (${imageFiles.length}/5)`}
                        </span>
                      </div>
                    )}
                    <input 
                      type="file" ref={imageInputRef} className="hidden" accept="image/*" multiple
                      onChange={handleImageSelect}
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5">Product Name</label>
                  <input 
                    required 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-canvas border border-ink/10 rounded-lg px-4 py-2.5 text-ink font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                    placeholder="e.g. B.Sc Formal Shirt"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5">SKU</label>
                    <input 
                      required 
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase().replace(/\s/g, '-') })}
                      className="w-full bg-canvas border border-ink/10 rounded-lg px-4 py-2.5 text-ink font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                      placeholder="e.g. SHIRT-01"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5">Institution</label>
                    <select
                      required
                      value={formData.institutionId}
                      onChange={(e) => setFormData({ ...formData, institutionId: e.target.value })}
                      className="w-full bg-canvas border border-ink/10 rounded-lg px-4 py-2.5 text-ink font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    >
                      <option value="">Select...</option>
                      {institutions.map(inst => (
                        <option key={inst.id} value={inst.id}>{inst.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5">Base Price (₹)</label>
                    <input 
                      required 
                      type="number"
                      min="0"
                      value={formData.basePrice || ""}
                      onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-canvas border border-ink/10 rounded-lg px-4 py-2.5 text-ink font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                      placeholder="649"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5">Initial Stock</label>
                    <input 
                      required 
                      type="number"
                      min="0"
                      value={formData.stock || ""}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      className="w-full bg-canvas border border-ink/10 rounded-lg px-4 py-2.5 text-ink font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                      placeholder="50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5">Category</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-canvas border border-ink/10 rounded-lg px-4 py-2.5 text-ink font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    >
                      <option value="Shirt">Shirt</option>
                      <option value="Pant">Pant</option>
                      <option value="Blazer">Blazer</option>
                      <option value="T-Shirt">T-Shirt</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5">Gender</label>
                    <select
                      required
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full bg-canvas border border-ink/10 rounded-lg px-4 py-2.5 text-ink font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    >
                      <option value="Unisex">Unisex</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5">Sizes Available</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SIZES.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          if (sizes.includes(size)) setSizes(sizes.filter(s => s !== size));
                          else setSizes([...sizes, size]);
                        }}
                        className={`px-3 py-1.5 rounded-md font-mono text-xs border transition-colors ${sizes.includes(size) ? 'bg-blue-600 text-white border-blue-600' : 'bg-canvas border-ink/10 text-ink-muted hover:text-ink hover:border-ink/20'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-ink-muted mb-1.5">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full bg-canvas border border-ink/10 rounded-lg px-4 py-2.5 text-ink font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" 
                    placeholder="Product details, fabric, and fit..."
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
                    {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : (editId ? "Update Product" : "Save Product")}
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
