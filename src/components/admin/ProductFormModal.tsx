import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { createProduct, updateProduct } from "@/lib/admin-data";

interface CategoryOption {
  id: string;
  name: string;
}

interface FormData {
  name: string;
  sku: string;
  price: string;
  stock: string;
  is_active: boolean;
  category_id: string;
}

interface FormErrors {
  name?: string;
  sku?: string;
  price?: string;
  stock?: string;
  category_id?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  product?: {
    id: string;
    name: string;
    sku: string | null;
    price: number;
    stock: number;
    is_active: boolean;
  } | null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductFormModal({ open, onClose, onSaved, product }: Props) {
  const isEdit = !!product;
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [form, setForm] = useState<FormData>({
    name: "",
    sku: "",
    price: "",
    stock: "",
    is_active: true,
    category_id: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, name")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  useEffect(() => {
    if (open) {
      if (product) {
        setForm({
          name: product.name,
          sku: product.sku ?? "",
          price: String(product.price),
          stock: String(product.stock),
          is_active: product.is_active,
          category_id: "",
        });
      } else {
        setForm({ name: "", sku: "", price: "", stock: "", is_active: true, category_id: "" });
      }
      setErrors({});
    }
  }, [open, product]);

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.sku.trim()) e.sku = "SKU is required";
    const price = parseFloat(form.price);
    if (!form.price || isNaN(price) || price <= 0) e.price = "Price must be greater than 0";
    const stock = parseInt(form.stock, 10);
    if (!form.stock || isNaN(stock) || stock < 0) e.stock = "Stock must be 0 or greater";
    if (!isEdit && !form.category_id) e.category_id = "Category is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit && product) {
        await updateProduct(product.id, {
          name: form.name.trim(),
          sku: form.sku.trim(),
          price: parseFloat(form.price),
          stock: parseInt(form.stock, 10),
          is_active: form.is_active,
        });
      } else {
        await createProduct({
          name: form.name.trim(),
          slug: slugify(form.name.trim()),
          sku: form.sku.trim(),
          price: parseFloat(form.price),
          stock: parseInt(form.stock, 10),
          category_id: form.category_id,
          is_active: form.is_active,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setErrors({ name: err instanceof Error ? err.message : "Failed to save product" });
    } finally {
      setSaving(false);
    }
  }

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "Create Product"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the product details below." : "Fill in the details to add a new product."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            {errors.name && <p className="text-xs text-red">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={form.sku}
              onChange={(e) => set("sku", e.target.value)}
            />
            {errors.sku && <p className="text-xs text-red">{errors.sku}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
              />
              {errors.price && <p className="text-xs text-red">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => set("stock", e.target.value)}
              />
              {errors.stock && <p className="text-xs text-red">{errors.stock}</p>}
            </div>
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={form.category_id}
                onChange={(e) => set("category_id", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="text-xs text-red">{errors.category_id}</p>}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="h-4 w-4 rounded border-border accent-foreground"
            />
            <Label htmlFor="is_active" className="text-sm">Active</Label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}