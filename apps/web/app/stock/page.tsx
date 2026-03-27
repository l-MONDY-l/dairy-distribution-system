'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '@/lib/products-api';
import {
  createStockBatch,
  deleteStockBatch,
  getStockBatches,
  getStockBatchesCount,
  updateStockBatch,
} from '@/lib/stock-batches-api';
import { getUploadPreviewUrl, uploadProductImage } from '@/lib/uploads-api';
import type { Product, StockBatch, UpdateProductPayload, UpdateStockBatchPayload } from '@/lib/types';

const PAGE_SIZE = 10;
const UNIT_TYPES = [
  'Unit',
  'Piece',
  'Bottle',
  'Bottles',
  'Litre',
  'Litres',
  'Carton',
  'Cartons',
  'Box',
  'Boxes',
  'Crate',
  'Crates',
  'Kg',
  'Packet',
  'Packets',
  'Pouch',
  'Pouches',
  'Tin',
  'Tins',
  'Jar',
  'Jars',
];

const getTodayDateString = () => new Date().toISOString().slice(0, 10);

/** SKU from first letters of product name words, e.g. "Fresh Milk" -> "FM" */
function skuFromName(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  return initials || 'P';
}

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSave, setEditingSave] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editModalMode, setEditModalMode] = useState<'product' | 'stock'>('product');
  const [editForm, setEditForm] = useState<UpdateProductPayload>({});
  const [editImageUploading, setEditImageUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const [stockFilter, setStockFilter] = useState<
    'ALL' | 'NEW' | 'REMAINING' | 'COMPLETE' | 'EXPIRED'
  >('NEW');
  const [searchName, setSearchName] = useState('');
  const [searchSku, setSearchSku] = useState('');
  const [searchMinPrice, setSearchMinPrice] = useState('');
  const [searchMaxPrice, setSearchMaxPrice] = useState('');
  const [searchMinRemaining, setSearchMinRemaining] = useState('');
  const [searchMaxRemaining, setSearchMaxRemaining] = useState('');
  const [searchHasDiscount, setSearchHasDiscount] = useState<
    'ALL' | 'YES' | 'NO'
  >('ALL');
  const [searchExpiryFrom, setSearchExpiryFrom] = useState('');
  const [searchExpiryTo, setSearchExpiryTo] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalMode, setCreateModalMode] = useState<'add-product' | 'create-stock'>('add-product');
  const [addProductForm, setAddProductForm] = useState({ name: '', imageUrl: '', description: '' });
  const [createStockForm, setCreateStockForm] = useState({
    productId: '',
    unitType: 'Unit',
    price: '0',
    agentPrice: '',
    retailPrice: '',
    specialDiscount: false,
    stockCreateDate: getTodayDateString(),
    expiryDate: '',
    quantity: 0,
    soldQty: 0,
    remainingQty: 0,
  });
  const [stockBatches, setStockBatches] = useState<StockBatch[]>([]);
  const [stockBatchesCount, setStockBatchesCount] = useState(0);
  const [editingBatch, setEditingBatch] = useState<StockBatch | null>(null);
  const [confirmDeleteBatch, setConfirmDeleteBatch] = useState<StockBatch | null>(null);
  const [editBatchForm, setEditBatchForm] = useState<UpdateStockBatchPayload>({});

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [productsData, batchesData, countData] = await Promise.all([
        getProducts(),
        getStockBatches(),
        getStockBatchesCount(),
      ]);
      setProducts(productsData);
      setStockBatches(batchesData);
      setStockBatchesCount(countData);
    } catch {
      setError('Failed to load stock.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const todayStart = useMemo(
    () => new Date(new Date().setHours(0, 0, 0, 0)),
    [],
  );

  const stockCounts = useMemo(() => {
    const isPastExpiryP = (p: Product) =>
      p.expiryDate ? new Date(p.expiryDate) < todayStart : false;
    const remainingQty = (p: Product) => p.remainingQty ?? 0;
    const soldQty = (p: Product) => p.soldQty ?? 0;
    // Complete = remaining 0. Expired = past expiry and still has stock.
    const isNewStockP = (p: Product) =>
      !isPastExpiryP(p) && remainingQty(p) > 0 && soldQty(p) === 0;
    const isRemainingP = (p: Product) =>
      !isPastExpiryP(p) && remainingQty(p) > 0 && soldQty(p) > 0;
    const isCompleteP = (p: Product) => remainingQty(p) === 0;
    const isExpiredP = (p: Product) =>
      isPastExpiryP(p) && remainingQty(p) > 0;
    const newStock = products.filter(isNewStockP).length;
    const remaining = products.filter(isRemainingP).length;
    const complete = products.filter(isCompleteP).length;
    const expired = products.filter(isExpiredP).length;
    return {
      total: newStock,
      remaining,
      complete,
      expired,
    };
  }, [products, todayStart]);

  const filteredProducts = useMemo(() => {
    const isPastExpiryP = (p: Product) =>
      p.expiryDate ? new Date(p.expiryDate) < todayStart : false;
    const remainingQty = (p: Product) => p.remainingQty ?? 0;
    const soldQty = (p: Product) => p.soldQty ?? 0;
    const isNewStockP = (p: Product) =>
      !isPastExpiryP(p) && remainingQty(p) > 0 && soldQty(p) === 0;
    const isRemainingP = (p: Product) =>
      !isPastExpiryP(p) && remainingQty(p) > 0 && soldQty(p) > 0;
    const isCompleteP = (p: Product) => remainingQty(p) === 0;
    const isExpiredP = (p: Product) =>
      isPastExpiryP(p) && remainingQty(p) > 0;
    const byStatus =
      stockFilter === 'ALL'
        ? products
        : stockFilter === 'NEW'
          ? products.filter(isNewStockP)
          : stockFilter === 'REMAINING'
            ? products.filter(isRemainingP)
            : stockFilter === 'COMPLETE'
              ? products.filter(isCompleteP)
              : products.filter(isExpiredP);

    const matchText = (value: string | null | undefined, q: string) =>
      !q.trim() ||
      (value ?? '').toLowerCase().includes(q.trim().toLowerCase());

    const minPrice = Number(searchMinPrice) || 0;
    const maxPrice = Number(searchMaxPrice) || 0;
    const minRemaining = Number(searchMinRemaining) || 0;
    const maxRemaining = Number(searchMaxRemaining) || 0;
    const fromDate = searchExpiryFrom ? new Date(searchExpiryFrom) : null;
    const toDate = searchExpiryTo ? new Date(searchExpiryTo) : null;

    return byStatus.filter((p) => {
      if (!matchText(p.name, searchName)) return false;
      if (!matchText(p.sku, searchSku)) return false;

      const priceNum = Number(p.price) || 0;
      if (searchMinPrice && priceNum < minPrice) return false;
      if (searchMaxPrice && priceNum > maxPrice) return false;

      const remaining = p.remainingQty ?? 0;
      if (searchMinRemaining && remaining < minRemaining) return false;
      if (searchMaxRemaining && remaining > maxRemaining) return false;

      if (searchHasDiscount === 'YES' && !p.specialDiscount) return false;
      if (searchHasDiscount === 'NO' && p.specialDiscount) return false;

      if (fromDate || toDate) {
        if (!p.expiryDate) return false;
        const exp = new Date(p.expiryDate);
        if (fromDate && exp < fromDate) return false;
        if (toDate && exp > toDate) return false;
      }

      return true;
    });
  }, [
    products,
    stockFilter,
    todayStart,
    searchName,
    searchSku,
    searchMinPrice,
    searchMaxPrice,
    searchMinRemaining,
    searchMaxRemaining,
    searchHasDiscount,
    searchExpiryFrom,
    searchExpiryTo,
  ]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  // Batch-based counts and list for All Stock (daily stock per product; count from DB)
  // Complete = remaining 0 (sold out). Expired = past expiry and still has stock.
  const batchCounts = useMemo(() => {
    const isPastExpiryB = (b: StockBatch) =>
      b.expiryDate ? new Date(b.expiryDate) < todayStart : false;
    const remainingQty = (b: StockBatch) => b.remainingQty ?? 0;
    const soldQty = (b: StockBatch) => b.soldQty ?? 0;
    const isNewB = (b: StockBatch) =>
      !isPastExpiryB(b) && remainingQty(b) > 0 && soldQty(b) === 0;
    const isRemainingB = (b: StockBatch) =>
      !isPastExpiryB(b) && remainingQty(b) > 0 && soldQty(b) > 0;
    const isCompleteB = (b: StockBatch) => remainingQty(b) === 0;
    const isExpiredB = (b: StockBatch) =>
      isPastExpiryB(b) && remainingQty(b) > 0;
    return {
      total: stockBatches.filter(isNewB).length,
      remaining: stockBatches.filter(isRemainingB).length,
      complete: stockBatches.filter(isCompleteB).length,
      expired: stockBatches.filter(isExpiredB).length,
    };
  }, [stockBatches, todayStart]);

  const filteredBatches = useMemo(() => {
    const isPastExpiryB = (b: StockBatch) =>
      b.expiryDate ? new Date(b.expiryDate) < todayStart : false;
    const remainingQty = (b: StockBatch) => b.remainingQty ?? 0;
    const soldQty = (b: StockBatch) => b.soldQty ?? 0;
    const isNewB = (b: StockBatch) =>
      !isPastExpiryB(b) && remainingQty(b) > 0 && soldQty(b) === 0;
    const isRemainingB = (b: StockBatch) =>
      !isPastExpiryB(b) && remainingQty(b) > 0 && soldQty(b) > 0;
    const isCompleteB = (b: StockBatch) => remainingQty(b) === 0;
    const isExpiredB = (b: StockBatch) =>
      isPastExpiryB(b) && remainingQty(b) > 0;
    const byStatus =
      stockFilter === 'ALL'
        ? stockBatches
        : stockFilter === 'NEW'
          ? stockBatches.filter(isNewB)
          : stockFilter === 'REMAINING'
            ? stockBatches.filter(isRemainingB)
            : stockFilter === 'COMPLETE'
              ? stockBatches.filter(isCompleteB)
              : stockBatches.filter(isExpiredB);
    const matchText = (value: string | null | undefined, q: string) =>
      !q.trim() ||
      (value ?? '').toLowerCase().includes(q.trim().toLowerCase());
    const minPrice = Number(searchMinPrice) || 0;
    const maxPrice = Number(searchMaxPrice) || 0;
    const minRemaining = Number(searchMinRemaining) || 0;
    const maxRemaining = Number(searchMaxRemaining) || 0;
    const fromDate = searchExpiryFrom ? new Date(searchExpiryFrom) : null;
    const toDate = searchExpiryTo ? new Date(searchExpiryTo) : null;
    return byStatus.filter((b) => {
      const p = b.product;
      if (!matchText(p.name, searchName)) return false;
      if (!matchText(p.sku, searchSku)) return false;
      const priceNum = Number(b.price) || 0;
      if (searchMinPrice && priceNum < minPrice) return false;
      if (searchMaxPrice && priceNum > maxPrice) return false;
      const rem = b.remainingQty ?? 0;
      if (searchMinRemaining && rem < minRemaining) return false;
      if (searchMaxRemaining && rem > maxRemaining) return false;
      if (searchHasDiscount === 'YES' && !b.specialDiscount) return false;
      if (searchHasDiscount === 'NO' && b.specialDiscount) return false;
      if (fromDate || toDate) {
        if (!b.expiryDate) return false;
        const exp = new Date(b.expiryDate);
        if (fromDate && exp < fromDate) return false;
        if (toDate && exp > toDate) return false;
      }
      return true;
    });
  }, [
    stockBatches,
    stockFilter,
    todayStart,
    searchName,
    searchSku,
    searchMinPrice,
    searchMaxPrice,
    searchMinRemaining,
    searchMaxRemaining,
    searchHasDiscount,
    searchExpiryFrom,
    searchExpiryTo,
  ]);

  const paginatedBatches = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredBatches.slice(start, start + PAGE_SIZE);
  }, [filteredBatches, page]);

  const totalPagesBatches = Math.max(1, Math.ceil(filteredBatches.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [stockFilter, searchName, searchSku, searchMinPrice, searchMaxPrice, searchMinRemaining, searchMaxRemaining, searchHasDiscount, searchExpiryFrom, searchExpiryTo]);

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setEditForm((prev) => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'quantity' || name === 'soldQty') {
        const qty = Number(next.quantity) ?? 0;
        const sold = Number(next.soldQty) ?? 0;
        next.remainingQty = Math.max(0, qty - sold);
      }
      return next;
    });
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await createProduct({
        name: addProductForm.name.trim(),
        description: addProductForm.description.trim() || undefined,
        imageUrl: addProductForm.imageUrl || undefined,
      });
      setSuccess('Product added. You can now add stock via Create Stock.');
      setAddProductForm({ name: '', imageUrl: '', description: '' });
      setShowCreateModal(false);
      await loadData();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to add product.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCreateStockChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setCreateStockForm((prev) => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      if (name === 'quantity' || name === 'soldQty') {
        const qty = Number(next.quantity) || 0;
        const sold = Number(next.soldQty) || 0;
        next.remainingQty = Math.max(0, qty - sold);
      }
      return next;
    });
  };

  const handleCreateStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createStockForm.productId) {
      setError('Please select a product.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const qty = Number(createStockForm.quantity) || 0;
      const sold = Number(createStockForm.soldQty) || 0;
      const created = await createStockBatch({
        productId: createStockForm.productId,
        unitType: createStockForm.unitType,
        price: String(createStockForm.price || '0'),
        agentPrice: createStockForm.agentPrice ? String(createStockForm.agentPrice) : undefined,
        retailPrice: createStockForm.retailPrice ? String(createStockForm.retailPrice) : undefined,
        specialDiscount: createStockForm.specialDiscount,
        stockCreateDate: createStockForm.stockCreateDate || getTodayDateString(),
        expiryDate: createStockForm.expiryDate || undefined,
        quantity: qty,
        soldQty: sold,
        remainingQty: Math.max(0, qty - sold),
      });
      setSuccess(`Stock batch created. Stock ID: ${created.stockNumber != null ? String(created.stockNumber).padStart(3, '0') : created.id}`);
      setCreateStockForm({
        productId: '',
        unitType: 'Unit',
        price: '0',
        agentPrice: '',
        retailPrice: '',
        specialDiscount: false,
        stockCreateDate: getTodayDateString(),
        expiryDate: '',
        quantity: 0,
        soldQty: 0,
        remainingQty: 0,
      });
      setShowCreateModal(false);
      await loadData();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to create stock.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleProductImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImageUploading(true);
      const { url } = await uploadProductImage(file);
      setAddProductForm((prev) => ({ ...prev, imageUrl: url }));
    } catch {
      setError('Image upload failed.');
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  /** Open Edit product modal (from Add product → Existing products list). Product-only fields. */
  const openEditProduct = (product: Product) => {
    setEditModalMode('product');
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      sku: product.sku,
      unitType: product.unitType,
      price: product.price,
      quantity: product.quantity ?? 0,
      soldQty: product.soldQty ?? 0,
      remainingQty: product.remainingQty ?? 0,
      agentPrice: product.agentPrice ?? undefined,
      specialDiscount: product.specialDiscount ?? false,
      description: product.description ?? undefined,
      imageUrl: product.imageUrl ?? undefined,
      expiryDate: product.expiryDate
        ? product.expiryDate.slice(0, 10)
        : undefined,
      stockCreateDate:
        product.stockCreateDate?.slice(0, 10) ??
        (product.createdAt ? product.createdAt.slice(0, 10) : undefined),
    });
  };

  /** Open Edit stock modal (from All Stock table). Stock/pricing/batch fields. */
  const openEditStock = (product: Product) => {
    setEditModalMode('stock');
    setEditingProduct(product);
    const stockCreateDate =
      product.stockCreateDate?.slice(0, 10) ??
      (product.createdAt ? product.createdAt.slice(0, 10) : undefined);
    setEditForm({
      name: product.name,
      sku: product.sku,
      unitType: product.unitType,
      price: product.price,
      quantity: product.quantity ?? 0,
      soldQty: product.soldQty ?? 0,
      remainingQty: product.remainingQty ?? 0,
      agentPrice: product.agentPrice ?? undefined,
      specialDiscount: product.specialDiscount ?? false,
      description: product.description ?? undefined,
      imageUrl: product.imageUrl ?? undefined,
      expiryDate: product.expiryDate
        ? product.expiryDate.slice(0, 10)
        : undefined,
      stockCreateDate,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      setEditingSave(true);
      setError('');
      // Edit product: only product-level fields (no stock/market fields)
      await updateProduct(editingProduct.id, {
        name: editForm.name?.trim() ?? editingProduct.name,
        price: editForm.price ?? editingProduct.price,
        description: editForm.description?.trim() ?? undefined,
        imageUrl: editForm.imageUrl ?? undefined,
      });
      setSuccess('Product updated successfully.');
      setEditingProduct(null);
      await loadData();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to update product.',
      );
    } finally {
      setEditingSave(false);
    }
  };

  const handleEditStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      setEditingSave(true);
      setError('');
      const quantity = Number(editForm.quantity) ?? 0;
      const soldQty = Number(editForm.soldQty) ?? 0;
      await updateProduct(editingProduct.id, {
        unitType: editForm.unitType ?? editingProduct.unitType,
        price: editForm.price ?? editingProduct.price,
        agentPrice: editForm.agentPrice !== undefined ? String(editForm.agentPrice) : undefined,
        specialDiscount: editForm.specialDiscount,
        stockCreateDate: editForm.stockCreateDate?.trim() || undefined,
        expiryDate: editForm.expiryDate?.trim() || undefined,
        quantity,
        soldQty,
        remainingQty: Math.max(0, quantity - soldQty),
      });
      setSuccess('Stock updated successfully.');
      setEditingProduct(null);
      await loadData();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to update stock.',
      );
    } finally {
      setEditingSave(false);
    }
  };

  const handleEditImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setEditImageUploading(true);
      const { url } = await uploadProductImage(file);
      setEditForm((prev) => ({ ...prev, imageUrl: url }));
    } catch {
      setError('Image upload failed.');
    } finally {
      setEditImageUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeletingId(confirmDelete.id);
      setError('');
      await deleteProduct(confirmDelete.id);
      setSuccess('Stock item deleted.');
      setConfirmDelete(null);
      await loadData();
    } catch {
      setError('Failed to delete stock item.');
    } finally {
      setDeletingId(null);
    }
  };

  const openEditBatch = (batch: StockBatch) => {
    setEditingBatch(batch);
    setEditBatchForm({
      unitType: batch.unitType,
      price: batch.price,
      agentPrice: batch.agentPrice ?? undefined,
      retailPrice: batch.retailPrice ?? undefined,
      specialDiscount: batch.specialDiscount,
      stockCreateDate: batch.stockCreateDate?.slice(0, 10) ?? getTodayDateString(),
      expiryDate: batch.expiryDate?.slice(0, 10) ?? undefined,
      quantity: batch.quantity,
      soldQty: batch.soldQty,
      remainingQty: batch.remainingQty,
    });
  };

  const handleEditBatchChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setEditBatchForm((prev) => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      if (name === 'quantity' || name === 'soldQty') {
        const qty = Number(next.quantity) ?? 0;
        const sold = Number(next.soldQty) ?? 0;
        next.remainingQty = Math.max(0, qty - sold);
      }
      return next;
    });
  };

  const handleEditBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;
    try {
      setEditingSave(true);
      setError('');
      const qty = Number(editBatchForm.quantity) ?? 0;
      const sold = Number(editBatchForm.soldQty) ?? 0;
      await updateStockBatch(editingBatch.id, {
        unitType: editBatchForm.unitType,
        price: editBatchForm.price,
        agentPrice: editBatchForm.agentPrice !== undefined ? String(editBatchForm.agentPrice) : undefined,
        retailPrice: editBatchForm.retailPrice !== undefined ? String(editBatchForm.retailPrice) : undefined,
        specialDiscount: editBatchForm.specialDiscount,
        stockCreateDate: editBatchForm.stockCreateDate,
        expiryDate: editBatchForm.expiryDate,
        quantity: qty,
        soldQty: sold,
        remainingQty: Math.max(0, qty - sold),
      });
      setSuccess('Stock batch updated.');
      setEditingBatch(null);
      await loadData();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to update batch.',
      );
    } finally {
      setEditingSave(false);
    }
  };

  const handleDeleteBatch = async () => {
    if (!confirmDeleteBatch) return;
    try {
      setDeletingId(confirmDeleteBatch.id);
      setError('');
      await deleteStockBatch(confirmDeleteBatch.id);
      setSuccess('Stock batch deleted.');
      setConfirmDeleteBatch(null);
      await loadData();
    } catch {
      setError('Failed to delete stock batch.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (d: string | null | undefined) =>
    d ? new Date(d).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' }) : '—';

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Stock Management</h1>
          <p className="mt-1 text-slate-400">
            Add and manage dairy product stock, expiry, and agent pricing.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        )}

        <div className="flex flex-col gap-6">
          {/* Two cards: Add product, Create Stock — like regions */}
          <section className="space-y-4 rounded-3xl border border-slate-700 bg-slate-900/60 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Stock actions
            </h2>
            <div className="space-y-4">
              {/* Add product */}
              <div className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900 p-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">Add product</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Create a new product with name, SKU, pricing, media and stock details.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="min-w-[3rem] rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-center text-sm font-semibold tabular-nums text-slate-200">
                    {loading ? '…' : products.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCreateModalMode('add-product');
                      setShowCreateModal(true);
                    }}
                    className="rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                  >
                    Add product
                  </button>
                </div>
              </div>

              {/* Create Stock */}
              <div className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900 p-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">Create Stock</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Add stock with batch details, quantity, expiry and pricing.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="min-w-[3rem] rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-center text-sm font-semibold tabular-nums text-slate-200" title="Stock entries in database">
                    {loading ? '…' : stockBatchesCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCreateModalMode('create-stock');
                      setShowCreateModal(true);
                    }}
                    className="rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                  >
                    Create Stock
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Create modal: Add product (name, SKU auto, image, description) or Create Stock (product + unit, pricing, batch) */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowCreateModal(false)}>
              <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    {createModalMode === 'add-product' ? 'Add product' : 'Create Stock'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>

                {createModalMode === 'add-product' ? (
                  <form onSubmit={handleAddProductSubmit} className="mt-6 space-y-6">
                    <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-5 shadow-sm">
                      <h3 className="border-l-4 border-emerald-500/70 pl-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
                        Product identity
                      </h3>
                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-400">
                            Product name <span className="text-red-400">*</span>
                          </label>
                          <input
                            name="name"
                            value={addProductForm.name}
                            onChange={(e) => setAddProductForm((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter product name"
                            required
                            className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-400">
                            SKU (auto-generated)
                          </label>
                          <div className="rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-400">
                            {addProductForm.name.trim() ? skuFromName(addProductForm.name) : '—'}
                          </div>
                          <p className="mt-1 text-xs text-slate-500">First letter of each word. Final SKU may include a number if needed for uniqueness.</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-5 shadow-sm">
                      <h3 className="border-l-4 border-emerald-500/70 pl-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
                        Media & description
                      </h3>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-400">
                            Product image
                          </label>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            className="hidden"
                            id="add-product-image"
                            onChange={handleProductImageUpload}
                            disabled={imageUploading}
                          />
                          <label
                            htmlFor="add-product-image"
                            className="inline-block cursor-pointer rounded-xl border border-slate-600 bg-slate-950 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                          >
                            {imageUploading ? 'Uploading…' : 'Choose file'}
                          </label>
                          {addProductForm.imageUrl && (
                            <img
                              src={getUploadPreviewUrl(addProductForm.imageUrl)}
                              alt="Product"
                              className="mt-2 h-16 w-16 rounded object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-400">
                            Description
                          </label>
                          <textarea
                            name="description"
                            value={addProductForm.description}
                            onChange={(e) => setAddProductForm((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Enter product description"
                            rows={2}
                            className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                        <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className="rounded-xl bg-emerald-500 py-3 px-6 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                      >
                        {saving ? 'Adding…' : 'Add product'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="rounded-xl border border-slate-600 py-3 px-6 text-sm text-slate-300 hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Products list inside Add product modal */}
                    <div className="mt-6 border-t border-slate-700 pt-6">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                        Existing products
                      </h3>
                      {loading ? (
                        <p className="text-sm text-slate-400">Loading…</p>
                      ) : products.length === 0 ? (
                        <p className="text-sm text-slate-400">No products yet.</p>
                      ) : (
                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                          {products.map((p) => (
                            <li
                              key={p.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-800/50 px-3 py-2"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {p.imageUrl && (
                                  <img
                                    src={getUploadPreviewUrl(p.imageUrl)}
                                    alt=""
                                    className="h-8 w-8 rounded object-cover shrink-0"
                                  />
                                )}
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-slate-100 truncate">{p.name}</p>
                                  <p className="text-xs text-slate-500">{p.sku}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowCreateModal(false);
                                    openEditProduct(p);
                                  }}
                                  className="rounded-lg border border-slate-600 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowCreateModal(false);
                                    setConfirmDelete(p);
                                  }}
                                  className="rounded-lg border border-red-500/50 px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10"
                                >
                                  Delete
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleCreateStockSubmit} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-5 shadow-sm lg:col-span-2">
                      <h3 className="border-l-4 border-emerald-500/70 pl-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
                        Product & unit
                      </h3>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-400">
                            Product <span className="text-red-400">*</span>
                          </label>
                          <select
                            name="productId"
                            value={createStockForm.productId}
                            onChange={handleCreateStockChange}
                            required
                            className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                          >
                            <option value="">Select product</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-400">
                            Unit
                          </label>
                          <select
                            name="unitType"
                            value={createStockForm.unitType}
                            onChange={handleCreateStockChange}
                            className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                          >
                            {UNIT_TYPES.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-5 shadow-sm">
                      <h3 className="border-l-4 border-emerald-500/70 pl-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
                        Pricing
                      </h3>
                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-400">
                            Manufacture cost (LKR)
                          </label>
                          <input
                            name="price"
                            type="number"
                            min={0}
                            step="0.01"
                            value={createStockForm.price}
                            onChange={handleCreateStockChange}
                            className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-400">
                            Agent price (LKR)
                          </label>
                          <input
                            name="agentPrice"
                            type="number"
                            min={0}
                            step="0.01"
                            value={createStockForm.agentPrice}
                            onChange={handleCreateStockChange}
                            className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-400">
                            Retail price (LKR)
                          </label>
                          <input
                            name="retailPrice"
                            type="number"
                            min={0}
                            step="0.01"
                            value={createStockForm.retailPrice}
                            onChange={handleCreateStockChange}
                            className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                          />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-slate-300">
                          <input
                            type="checkbox"
                            name="specialDiscount"
                            checked={createStockForm.specialDiscount}
                            onChange={handleCreateStockChange}
                            className="h-4 w-4 rounded border-slate-600"
                          />
                          Special discount
                        </label>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-5 shadow-sm">
                      <h3 className="border-l-4 border-emerald-500/70 pl-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
                        Inventory & batch
                      </h3>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-400">
                            Stock create date
                          </label>
                          <input
                            name="stockCreateDate"
                            type="date"
                            value={createStockForm.stockCreateDate}
                            onChange={handleCreateStockChange}
                            className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500 [color-scheme:dark]"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-400">
                            Expiry date
                          </label>
                          <input
                            name="expiryDate"
                            type="date"
                            value={createStockForm.expiryDate}
                            onChange={handleCreateStockChange}
                            className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500 [color-scheme:dark]"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-400">
                            Quantity
                          </label>
                          <input
                            name="quantity"
                            type="number"
                            min={0}
                            value={createStockForm.quantity}
                            onChange={handleCreateStockChange}
                            className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-400">
                            Sold products
                          </label>
                          <input
                            name="soldQty"
                            type="number"
                            min={0}
                            value={createStockForm.soldQty}
                            onChange={handleCreateStockChange}
                            className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-xs font-medium text-slate-400">
                            Remaining products
                          </label>
                          <input
                            name="remainingQty"
                            type="number"
                            min={0}
                            value={createStockForm.remainingQty}
                            readOnly
                            className="w-full max-w-xs rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-300"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 lg:col-span-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="rounded-xl bg-emerald-500 py-3 px-6 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                      >
                        {saving ? 'Updating…' : 'Create Stock'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="rounded-xl border border-slate-600 py-3 px-6 text-sm text-slate-300 hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Table */}
          {/* All Stock — below */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  All Stock
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  {stockBatchesCount} stock {stockBatchesCount === 1 ? 'entry' : 'entries'} in database (same product can have multiple batches, e.g. daily).
                </p>
              </div>
              <div className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300">
                {stockFilter === 'ALL'
                  ? `Showing ${filteredBatches.length} of ${stockBatches.length}`
                  : stockFilter === 'NEW'
                    ? `Showing ${filteredBatches.length} of ${batchCounts.total}`
                    : stockFilter === 'REMAINING'
                      ? `Showing ${filteredBatches.length} of ${batchCounts.remaining}`
                      : stockFilter === 'COMPLETE'
                        ? `Showing ${filteredBatches.length} of ${batchCounts.complete}`
                        : `Showing ${filteredBatches.length} of ${batchCounts.expired}`}
              </div>
            </div>

            {/* Status filter cards — New stock first; All stock last */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <button
                type="button"
                onClick={() => setStockFilter('NEW')}
                className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  stockFilter === 'NEW'
                    ? 'border-emerald-500/60 bg-emerald-500/15 ring-2 ring-emerald-500/30'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <span className="block text-2xl font-bold text-white">
                  {batchCounts.total}
                </span>
                <span className="mt-0.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
                  New stock
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('REMAINING')}
                className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  stockFilter === 'REMAINING'
                    ? 'border-emerald-500/60 bg-emerald-500/15 ring-2 ring-emerald-500/30'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <span className="block text-2xl font-bold text-white">
                  {batchCounts.remaining}
                </span>
                <span className="mt-0.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
                  Remaining stock
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('COMPLETE')}
                className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  stockFilter === 'COMPLETE'
                    ? 'border-emerald-500/60 bg-emerald-500/15 ring-2 ring-emerald-500/30'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <span className="block text-2xl font-bold text-white">
                  {batchCounts.complete}
                </span>
                <span className="mt-0.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
                  Complete stock
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('EXPIRED')}
                className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
                  stockFilter === 'EXPIRED'
                    ? 'border-red-500/60 bg-red-500/15 ring-2 ring-red-500/30'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <span className="block text-2xl font-bold text-white">
                  {batchCounts.expired}
                </span>
                <span className="mt-0.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
                  Expired stock
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('ALL')}
                className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  stockFilter === 'ALL'
                    ? 'border-emerald-500/60 bg-emerald-500/15 ring-2 ring-emerald-500/30'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <span className="block text-2xl font-bold text-white">
                  {stockBatches.length}
                </span>
                <span className="mt-0.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
                  All stock
                </span>
              </button>
            </div>

            {/* Smart search filters */}
            <div className="mt-4 rounded-2xl border border-slate-700/80 bg-slate-800/40 p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                Search filters
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Product name"
                  className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={searchSku}
                  onChange={(e) => setSearchSku(e.target.value)}
                  placeholder="SKU"
                  className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  min={0}
                  value={searchMinPrice}
                  onChange={(e) => setSearchMinPrice(e.target.value)}
                  placeholder="Min price"
                  className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  min={0}
                  value={searchMaxPrice}
                  onChange={(e) => setSearchMaxPrice(e.target.value)}
                  placeholder="Max price"
                  className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  min={0}
                  value={searchMinRemaining}
                  onChange={(e) => setSearchMinRemaining(e.target.value)}
                  placeholder="Min remaining"
                  className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  min={0}
                  value={searchMaxRemaining}
                  onChange={(e) => setSearchMaxRemaining(e.target.value)}
                  placeholder="Max remaining"
                  className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
                />
                <select
                  value={searchHasDiscount}
                  onChange={(e) =>
                    setSearchHasDiscount(e.target.value as 'ALL' | 'YES' | 'NO')
                  }
                  className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500"
                >
                  <option value="ALL">Discount: All</option>
                  <option value="YES">Discount: Yes</option>
                  <option value="NO">Discount: No</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={searchExpiryFrom}
                    onChange={(e) => setSearchExpiryFrom(e.target.value)}
                    className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
                  />
                  <input
                    type="date"
                    value={searchExpiryTo}
                    onChange={(e) => setSearchExpiryTo(e.target.value)}
                    className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              {(searchName ||
                searchSku ||
                searchMinPrice ||
                searchMaxPrice ||
                searchMinRemaining ||
                searchMaxRemaining ||
                searchExpiryFrom ||
                searchExpiryTo ||
                searchHasDiscount !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchName('');
                    setSearchSku('');
                    setSearchMinPrice('');
                    setSearchMaxPrice('');
                    setSearchMinRemaining('');
                    setSearchMaxRemaining('');
                    setSearchHasDiscount('ALL');
                    setSearchExpiryFrom('');
                    setSearchExpiryTo('');
                  }}
                  className="mt-3 text-sm text-emerald-400 hover:text-emerald-300"
                >
                  Clear filters
                </button>
              )}
            </div>

            {loading ? (
              <p className="mt-4 text-slate-400">Loading…</p>
            ) : products.length === 0 ? (
              <p className="mt-4 text-slate-400">No stock items yet.</p>
            ) : filteredBatches.length === 0 ? (
              <p className="mt-4 text-slate-400">
                No {stockFilter === 'ALL' ? 'all' : stockFilter === 'NEW' ? 'new' : stockFilter === 'REMAINING' ? 'remaining' : stockFilter === 'COMPLETE' ? 'complete' : 'expired'} stock entries. Create stock from the &quot;Create Stock&quot; button above.
              </p>
            ) : (
              <>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-left text-slate-400">
                        <th className="pb-3 pr-2 font-medium">Stock ID</th>
                        <th className="pb-3 pr-2 font-medium">Name</th>
                        <th className="pb-3 pr-2 font-medium">SKU</th>
                        <th className="pb-3 pr-2 font-medium">Manufacture cost</th>
                        <th className="pb-3 pr-2 font-medium">Qty</th>
                        <th className="pb-3 pr-2 font-medium">Created</th>
                        <th className="pb-3 pr-2 font-medium">Expiry</th>
                        <th className="pb-3 pr-2 font-medium">Sold</th>
                        <th className="pb-3 pr-2 font-medium">Remaining</th>
                        <th className="pb-3 pr-2 font-medium">Agent price</th>
                        <th className="pb-3 pr-2 font-medium">Retail price</th>
                        <th className="pb-3 pr-2 font-medium">Discount</th>
                        <th className="pb-3 pr-2 font-medium">Image</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedBatches.map((b) => (
                        <tr
                          key={b.id}
                          className="border-b border-slate-800 text-slate-300"
                        >
                          <td className="py-3 pr-2 font-mono text-slate-400" title={b.id}>
                            {b.stockNumber != null ? String(b.stockNumber).padStart(3, '0') : b.id.slice(0, 8)}
                          </td>
                          <td className="py-3 pr-2 font-medium text-white">
                            {b.product.name}
                          </td>
                          <td className="py-3 pr-2 text-slate-300">{b.product.sku}</td>
                          <td className="py-3 pr-2">
                            LKR {Number(b.price).toLocaleString()}
                          </td>
                          <td className="py-3 pr-2">{b.quantity ?? 0}</td>
                          <td className="py-3 pr-2">
                            {formatDate(b.stockCreateDate ?? b.createdAt)}
                          </td>
                          <td className="py-3 pr-2">
                            {formatDate(b.expiryDate ?? undefined)}
                          </td>
                          <td className="py-3 pr-2">{b.soldQty ?? 0}</td>
                          <td className="py-3 pr-2 text-emerald-400">
                            {b.remainingQty ?? 0}
                          </td>
                          <td className="py-3 pr-2">
                            {b.agentPrice
                              ? `LKR ${Number(b.agentPrice).toLocaleString()}`
                              : '—'}
                          </td>
                          <td className="py-3 pr-2">
                            {b.retailPrice
                              ? `LKR ${Number(b.retailPrice).toLocaleString()}`
                              : '—'}
                          </td>
                          <td className="py-3 pr-2">
                            {b.specialDiscount ? 'Yes' : 'No'}
                          </td>
                          <td className="py-3 pr-2">
                            {b.product.imageUrl ? (
                              <img
                                src={getUploadPreviewUrl(b.product.imageUrl)}
                                alt={b.product.name}
                                className="h-10 w-10 rounded object-cover"
                              />
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => openEditBatch(b)}
                                className="text-xs text-emerald-400 hover:text-emerald-300"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteBatch(b)}
                                className="text-xs text-red-400 hover:text-red-300"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPagesBatches > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-slate-400">
                      Page {page} of {totalPagesBatches}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPagesBatches, p + 1))}
                      disabled={page === totalPagesBatches}
                      className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Edit modal: Edit product (from Add product list) or Edit stock (from All Stock table) */}
        {editingProduct && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setEditingProduct(null)}
          >
            <div
              className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 ${editModalMode === 'stock' ? 'max-w-4xl' : 'max-w-lg'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">
                  {editModalMode === 'stock' ? 'Edit stock' : 'Edit product'}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="rounded-xl border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Close
                </button>
              </div>

              {editModalMode === 'stock' ? (
                <form onSubmit={handleEditStockSubmit} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-5 shadow-sm lg:col-span-2">
                    <h3 className="border-l-4 border-emerald-500/70 pl-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
                      Product & unit
                    </h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-400">Product</label>
                        <div className="rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-400">
                          {editingProduct.name} ({editingProduct.sku})
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-400">Unit</label>
                        <select
                          name="unitType"
                          value={editForm.unitType ?? ''}
                          onChange={handleEditChange}
                          className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                        >
                          {UNIT_TYPES.map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-5 shadow-sm">
                    <h3 className="border-l-4 border-emerald-500/70 pl-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
                      Pricing
                    </h3>
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-400">Manufacture cost (LKR)</label>
                        <input
                          name="price"
                          type="number"
                          min={0}
                          step="0.01"
                          value={editForm.price ?? ''}
                          onChange={handleEditChange}
                          className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-400">Agent price (LKR)</label>
                        <input
                          name="agentPrice"
                          type="number"
                          min={0}
                          step="0.01"
                          value={editForm.agentPrice ?? ''}
                          onChange={handleEditChange}
                          className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-slate-300">
                        <input
                          type="checkbox"
                          name="specialDiscount"
                          checked={!!editForm.specialDiscount}
                          onChange={handleEditChange}
                          className="h-4 w-4 rounded border-slate-600"
                        />
                        Special discount
                      </label>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-5 shadow-sm">
                    <h3 className="border-l-4 border-emerald-500/70 pl-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
                      Inventory & batch
                    </h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-400">Stock create date</label>
                        <input
                          name="stockCreateDate"
                          type="date"
                          value={editForm.stockCreateDate ?? ''}
                          onChange={handleEditChange}
                          className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500 [color-scheme:dark]"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-400">Expiry date</label>
                        <input
                          name="expiryDate"
                          type="date"
                          value={editForm.expiryDate ?? ''}
                          onChange={handleEditChange}
                          className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500 [color-scheme:dark]"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-400">Quantity</label>
                        <input
                          name="quantity"
                          type="number"
                          min={0}
                          value={editForm.quantity ?? ''}
                          onChange={handleEditChange}
                          className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-400">Sold products</label>
                        <input
                          name="soldQty"
                          type="number"
                          min={0}
                          value={editForm.soldQty ?? ''}
                          onChange={handleEditChange}
                          className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs font-medium text-slate-400">Remaining products</label>
                        <input
                          name="remainingQty"
                          type="number"
                          min={0}
                          value={editForm.remainingQty ?? ''}
                          readOnly
                          className="w-full max-w-xs rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-300"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 lg:col-span-2">
                    <button type="button" onClick={() => setEditingProduct(null)} className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
                      Cancel
                    </button>
                    <button type="submit" disabled={editingSave} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60">
                      {editingSave ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </form>
              ) : (
              <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">
                    Product name <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="name"
                    value={editForm.name ?? ''}
                    onChange={handleEditChange}
                    placeholder="Enter product name"
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">
                    SKU
                  </label>
                  <div className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-400">
                    {editingProduct.sku}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">Auto-generated; change stock in Create Stock.</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">
                    Manufacture cost (LKR)
                  </label>
                  <input
                    name="price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={editForm.price ?? ''}
                    onChange={handleEditChange}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">
                    Product image
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    id="edit-product-image"
                    onChange={handleEditImageUpload}
                    disabled={editImageUploading}
                  />
                  <label
                    htmlFor="edit-product-image"
                    className="inline-block cursor-pointer rounded-xl border border-slate-600 bg-slate-950 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                  >
                    {editImageUploading ? 'Uploading…' : 'Choose file'}
                  </label>
                  {editForm.imageUrl && (
                    <img
                      src={getUploadPreviewUrl(editForm.imageUrl)}
                      alt="Product"
                      className="mt-2 h-16 w-16 rounded object-cover"
                    />
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editForm.description ?? ''}
                    onChange={handleEditChange}
                    placeholder="Enter product description"
                    rows={2}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editingSave}
                    className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                  >
                    {editingSave ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </form>
              )}
            </div>
          </div>
        )}

        {/* Delete confirm */}
        {confirmDelete && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => !deletingId && setConfirmDelete(null)}
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white">
                Delete stock item?
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                &quot;{confirmDelete.name}&quot; will be removed. This cannot be
                undone.
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  disabled={deletingId}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deletingId}
                  className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-60"
                >
                  {deletingId ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit batch modal (from All Stock table) */}
        {editingBatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setEditingBatch(null)}>
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">Edit stock batch</h3>
                <button type="button" onClick={() => setEditingBatch(null)} className="rounded-xl border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800">Close</button>
              </div>
              <form onSubmit={handleEditBatchSubmit} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-5 shadow-sm lg:col-span-2">
                  <h3 className="border-l-4 border-emerald-500/70 pl-3 text-sm font-semibold uppercase tracking-wider text-slate-300">Product</h3>
                  <div className="mt-4 rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-400">
                    {editingBatch.product.name} ({editingBatch.product.sku})
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-5 shadow-sm">
                  <h3 className="border-l-4 border-emerald-500/70 pl-3 text-sm font-semibold uppercase tracking-wider text-slate-300">Pricing</h3>
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-400">Manufacture cost (LKR)</label>
                      <input name="price" type="number" min={0} step="0.01" value={editBatchForm.price ?? ''} onChange={handleEditBatchChange} className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-400">Agent price (LKR)</label>
                      <input name="agentPrice" type="number" min={0} step="0.01" value={editBatchForm.agentPrice ?? ''} onChange={handleEditBatchChange} className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500" />
                    </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-400">Retail price (LKR)</label>
                        <input name="retailPrice" type="number" min={0} step="0.01" value={editBatchForm.retailPrice ?? ''} onChange={handleEditBatchChange} className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500" />
                      </div>
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                      <input type="checkbox" name="specialDiscount" checked={!!editBatchForm.specialDiscount} onChange={handleEditBatchChange} className="h-4 w-4 rounded border-slate-600" />
                      Special discount
                    </label>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-5 shadow-sm">
                  <h3 className="border-l-4 border-emerald-500/70 pl-3 text-sm font-semibold uppercase tracking-wider text-slate-300">Unit & inventory</h3>
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-400">Unit</label>
                      <select name="unitType" value={editBatchForm.unitType ?? ''} onChange={handleEditBatchChange} className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500">
                        {UNIT_TYPES.map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-400">Stock create date</label>
                      <input name="stockCreateDate" type="date" value={editBatchForm.stockCreateDate ?? ''} onChange={handleEditBatchChange} className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500 [color-scheme:dark]" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-400">Expiry date</label>
                      <input name="expiryDate" type="date" value={editBatchForm.expiryDate ?? ''} onChange={handleEditBatchChange} className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500 [color-scheme:dark]" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-400">Quantity</label>
                      <input name="quantity" type="number" min={0} value={editBatchForm.quantity ?? ''} onChange={handleEditBatchChange} className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-400">Sold products</label>
                      <input name="soldQty" type="number" min={0} value={editBatchForm.soldQty ?? ''} onChange={handleEditBatchChange} className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-400">Remaining</label>
                      <input name="remainingQty" type="number" min={0} value={editBatchForm.remainingQty ?? ''} readOnly className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-300" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 lg:col-span-2">
                  <button type="button" onClick={() => setEditingBatch(null)} className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Cancel</button>
                  <button type="submit" disabled={editingSave} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60">{editingSave ? 'Saving…' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete batch confirm */}
        {confirmDeleteBatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => !deletingId && setConfirmDeleteBatch(null)}>
            <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-white">Delete stock batch?</h3>
              <p className="mt-2 text-sm text-slate-400">
                Batch for &quot;{confirmDeleteBatch.product.name}&quot; (created {formatDate(confirmDeleteBatch.stockCreateDate ?? confirmDeleteBatch.createdAt)}) will be removed.
              </p>
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => setConfirmDeleteBatch(null)} disabled={deletingId} className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Cancel</button>
                <button type="button" onClick={handleDeleteBatch} disabled={deletingId} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-60">{deletingId ? 'Deleting…' : 'Delete'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
