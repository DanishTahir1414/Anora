import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useInventoryManagement, type InventoryProductRow } from "@/lib/admin-inventory";
import { supabase } from "@/lib/supabase";
import { InventoryHistoryDrawer } from "./InventoryHistoryDrawer";
import { ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

function getStockBadge(stock: number) {
  if (stock <= 2) return <Badge variant="destructive">Critical</Badge>;
  if (stock <= 10) return <Badge variant="secondary">Low</Badge>;
  if (stock > 100) return <Badge>Overstock</Badge>;
  return <Badge variant="outline">Healthy</Badge>;
}

export function InventoryTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [stockStatus, setStockStatus] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [historyProductId, setHistoryProductId] = useState<string | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [reservations, setReservations] = useState<any[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const pageSize = 20;

  const { result, loading, error, refetch } = useInventoryManagement(
    page,
    pageSize,
    search,
    sortBy,
    sortDir,
    stockStatus === "all" ? "" : stockStatus,
    categoryId === "all" ? "" : categoryId,
  );

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, name")
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, []);

  // Fetch reservations whenever page or reload trigger changes
  useEffect(() => {
    supabase
      .from("inventory_reservations")
      .select("product_id, variant_id, size, quantity")
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .then(({ data }) => {
        if (data) setReservations(data);
      });
  }, [page, reloadTrigger]);

  const triggerReload = () => {
    setReloadTrigger((prev) => prev + 1);
    refetch();
  };

  const getReservedQty = (productId: string, variantId: string | null, size: string) => {
    return reservations
      .filter(
        (r) =>
          r.product_id === productId &&
          (variantId ? r.variant_id === variantId : !r.variant_id) &&
          r.size === size
      )
      .reduce((sum, r) => sum + r.quantity, 0);
  };

  async function handleSaveSizeStock(
    product: any,
    variantId: string | null,
    size: string,
    newQty: number
  ) {
    const saveKey = `${product.id}-${variantId || ""}-${size}`;
    setSavingId(saveKey);
    try {
      if (variantId) {
        const variantObj = product.variants?.find((v: any) => v.id === variantId);
        if (!variantObj) throw new Error("Variant not found");
        const nextSizeStock = { ...variantObj.size_stock, [size]: newQty };
        const { error } = await supabase
          .from("product_variants")
          .update({ size_stock: nextSizeStock })
          .eq("id", variantId);
        if (error) throw error;
      } else {
        const nextSizeStock = { ...product.size_stock, [size]: newQty };
        const { error } = await supabase
          .from("products")
          .update({ size_stock: nextSizeStock })
          .eq("id", product.id);
        if (error) throw error;
      }
      toast.success("Stock updated successfully");
      triggerReload();
    } catch (err: any) {
      toast.error(`Failed to update stock: ${err.message}`);
    } finally {
      setSavingId(null);
    }
  }

  function handleSort(column: string) {
    if (sortBy === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
    setPage(1);
  }

  const sortIndicator = (column: string) => {
    if (sortBy !== column) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  const toggleExpandProduct = (productId: string) => {
    setExpandedProducts((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const totalPages = Math.max(1, Math.ceil((result?.total ?? 0) / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Select
          value={stockStatus}
          onValueChange={(val) => {
            setStockStatus(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stock</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="healthy">Healthy</SelectItem>
            <SelectItem value="overstock">Overstock</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={categoryId}
          onValueChange={(val) => {
            setCategoryId(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => handleSort("name")}>
                Product{sortIndicator("name")}
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => handleSort("sku")}>
                SKU{sortIndicator("sku")}
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort("stock")}
              >
                Stock{sortIndicator("stock")}
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (result?.products?.length ?? 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              result?.products.map((product) => {
                const isExpanded = !!expandedProducts[product.id];
                const isSingle = !product.variants || product.variants.length === 0;

                return (
                  <>
                    <TableRow key={product.id} className="hover:bg-muted/50">
                      <TableCell className="p-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleExpandProduct(product.id)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="font-mono text-sm">{product.sku ?? "—"}</TableCell>
                      <TableCell className="text-sm">{product.category_name}</TableCell>
                      <TableCell className="text-right font-mono font-semibold">{product.stock}</TableCell>
                      <TableCell>{getStockBadge(product.stock)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setHistoryProductId(product.id)}
                        >
                          History
                        </Button>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow key={`${product.id}-expanded`}>
                        <TableCell colSpan={7} className="bg-stone-50/50 dark:bg-stone-900/10 p-4">
                          {isSingle ? (
                            <div className="max-w-3xl border rounded bg-background p-4 space-y-2">
                              <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Sizes Stock</p>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-20">Size</TableHead>
                                    <TableHead className="w-40">SKU</TableHead>
                                    <TableHead className="w-32 text-right">Current Stock</TableHead>
                                    <TableHead className="w-32 text-right">Reserved Stock</TableHead>
                                    <TableHead className="w-32 text-right">Available Stock</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {product.sizes?.map((sz: string) => {
                                    const currentStock = product.size_stock?.[sz] ?? 0;
                                    const reserved = getReservedQty(product.id, null, sz);
                                    const available = Math.max(0, currentStock - reserved);
                                    return (
                                      <SizeStockRow
                                        key={sz}
                                        productId={product.id}
                                        variantId={null}
                                        size={sz}
                                        sku={product.sku ? `${product.sku}-${sz}` : `—`}
                                        currentStock={currentStock}
                                        reserved={reserved}
                                        available={available}
                                        onSave={(newVal) =>
                                          handleSaveSizeStock(product, null, sz, newVal)
                                        }
                                        saving={savingId === `${product.id}--${sz}`}
                                      />
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <div className="space-y-4 max-w-3xl">
                              <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Color Variants</p>
                              {product.variants?.map((v: any) => (
                                <div key={v.id} className="border border-border/60 rounded p-4 bg-background space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className="w-4 h-4 rounded-full border"
                                        style={{ backgroundColor: v.color_hex || "#FFFFFF" }}
                                      />
                                      <span className="font-semibold text-sm">{v.name}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground font-mono">
                                      SKU: {v.sku || "—"} | Stock: <strong>{v.stock}</strong>
                                    </span>
                                  </div>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-20">Size</TableHead>
                                        <TableHead className="w-40">SKU</TableHead>
                                        <TableHead className="w-32 text-right">Current Stock</TableHead>
                                        <TableHead className="w-32 text-right">Reserved Stock</TableHead>
                                        <TableHead className="w-32 text-right">Available Stock</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {v.sizes?.map((sz: string) => {
                                        const currentStock = v.size_stock?.[sz] ?? 0;
                                        const reserved = getReservedQty(product.id, v.id, sz);
                                        const available = Math.max(0, currentStock - reserved);
                                        return (
                                          <SizeStockRow
                                            key={sz}
                                            productId={product.id}
                                            variantId={v.id}
                                            size={sz}
                                            sku={v.sku ? `${v.sku}-${sz}` : `—`}
                                            currentStock={currentStock}
                                            reserved={reserved}
                                            available={available}
                                            onSave={(newVal) =>
                                              handleSaveSizeStock(product, v.id, sz, newVal)
                                            }
                                            saving={savingId === `${product.id}-${v.id}-${sz}`}
                                          />
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{result?.total ?? 0} total</p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <InventoryHistoryDrawer
        productId={historyProductId}
        onClose={() => setHistoryProductId(null)}
      />
    </div>
  );
}

interface SizeStockRowProps {
  productId: string;
  variantId: string | null;
  size: string;
  sku: string;
  currentStock: number;
  reserved: number;
  available: number;
  onSave: (val: number) => void;
  saving: boolean;
}

function SizeStockRow({
  sku,
  size,
  currentStock,
  reserved,
  available,
  onSave,
  saving,
}: SizeStockRowProps) {
  const [val, setVal] = useState(currentStock);

  useEffect(() => {
    setVal(currentStock);
  }, [currentStock]);

  const isChanged = val !== currentStock;

  return (
    <TableRow>
      <TableCell className="font-semibold text-sm">{size}</TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">{sku}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Input
            type="number"
            min="0"
            value={val}
            onChange={(e) => setVal(Math.max(0, parseInt(e.target.value) || 0))}
            className="h-8 w-20 text-right text-xs"
            disabled={saving}
          />
          {isChanged && (
            <Button
              size="sm"
              onClick={() => onSave(val)}
              disabled={saving}
              className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              {saving ? "..." : "Save"}
            </Button>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right font-mono text-xs text-muted-foreground">{reserved}</TableCell>
      <TableCell className="text-right font-mono text-sm font-semibold">{available}</TableCell>
    </TableRow>
  );
}
