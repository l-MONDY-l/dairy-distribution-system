'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import {
  createProduct,
  getProducts,
  updateProduct,
  updateProductStatus,
} from '@/lib/products-api';
import type {
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from '@/lib/types';

const initialCreateForm: CreateProductPayload = {
  name: '',
  sku: '',
  unitType: '',
  unitVolume: '',
  price: '',
  status: true,
};

const initialEditForm: UpdateProductPayload = {
  name: '',
  sku: '',
  unitType: '',
  unitVolume: '',
  price: '',
  status: true,
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSave, setEditingSave] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createForm, setCreateForm] =
    useState<CreateProductPayload>(initialCreateForm);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<UpdateProductPayload>(initialEditForm);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const productsData = await getProducts();
      setProducts(productsData);
    } catch {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleCreateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setCreateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await createProduct(createForm);

      setSuccess('Product created successfully.');
      setCreateForm(initialCreateForm);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create product.');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      sku: product.sku,
      unitType: product.unitType,
      unitVolume: product.unitVolume || '',
      price: String(product.price),
      status: product.status,
    });
    setError('');
    setSuccess('');
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setEditForm(initialEditForm);
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProduct) return;

    try {
      setEditingSave(true);
      setError('');
      setSuccess('');

      await updateProduct(editingProduct.id, editForm);

      setSuccess('Product updated successfully.');
      closeEditModal();
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update product.');
    } finally {
      setEditingSave(false);
    }
  };

  const handleStatusToggle = async (product: Product) => {
    try {
      setError('');
      setSuccess('');

      await updateProductStatus(product.id, !product.status);
      setSuccess(`Product ${!product.status ? 'enabled' : 'disabled'} successfully.`);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update product status.');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="mt-1 text-2xl font-bold">Products Management</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage milk products, pricing, and active catalog items.
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

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Create Product</h2>
            <p className="mt-1 text-sm text-slate-400">
              Add milk items to the system catalog.
            </p>

            <form onSubmit={handleCreateProduct} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Product Name</label>
                <input
                  name="name"
                  value={createForm.name}
                  onChange={handleCreateChange}
                  required
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  placeholder="Fresh Milk 1L"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">SKU</label>
                <input
                  name="sku"
                  value={createForm.sku}
                  onChange={handleCreateChange}
                  required
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  placeholder="MILK-1L"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Unit Type</label>
                <input
                  name="unitType"
                  value={createForm.unitType}
                  onChange={handleCreateChange}
                  required
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  placeholder="Bottle / Pack / Crate"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Unit Volume</label>
                <input
                  name="unitVolume"
                  value={createForm.unitVolume}
                  onChange={handleCreateChange}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  placeholder="1L / 500ml"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Price</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={createForm.price}
                  onChange={handleCreateChange}
                  required
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  placeholder="250.00"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {saving ? 'Creating...' : 'Create Product'}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Product Catalog</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Current products available for orders and stock allocation.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300">
                Total: {products.length}
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              {loading ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center text-slate-400">
                  Loading products...
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center text-slate-400">
                  No products found.
                </div>
              ) : (
                <table className="min-w-full overflow-hidden rounded-2xl border border-slate-800">
                  <thead className="bg-slate-950">
                    <tr className="text-left text-sm text-slate-400">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">SKU</th>
                      <th className="px-4 py-3 font-medium">Unit</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="border-t border-slate-800 bg-slate-900 text-sm"
                      >
                        <td className="px-4 py-3 font-medium text-white">
                          {product.name}
                        </td>
                        <td className="px-4 py-3 text-slate-300">{product.sku}</td>
                        <td className="px-4 py-3 text-slate-300">
                          {product.unitType}
                          {product.unitVolume ? ` / ${product.unitVolume}` : ''}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          LKR {Number(product.price).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              product.status
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-amber-500/15 text-amber-400'
                            }`}
                          >
                            {product.status ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleStatusToggle(product)}
                              className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
                            >
                              {product.status ? 'Disable' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Edit Product</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Update product details and pricing.
                  </p>
                </div>
                <button
                  onClick={closeEditModal}
                  className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleEditProduct} className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Product Name</label>
                  <input
                    name="name"
                    value={editForm.name || ''}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">SKU</label>
                  <input
                    name="sku"
                    value={editForm.sku || ''}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Unit Type</label>
                  <input
                    name="unitType"
                    value={editForm.unitType || ''}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Unit Volume</label>
                  <input
                    name="unitVolume"
                    value={editForm.unitVolume || ''}
                    onChange={handleEditChange}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Price</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.price || ''}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Status</label>
                  <select
                    name="status"
                    value={String(editForm.status)}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        status: e.target.value === 'true',
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  >
                    <option value="true">ACTIVE</option>
                    <option value="false">INACTIVE</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="rounded-2xl border border-slate-700 px-4 py-3 text-sm text-slate-200 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editingSave}
                    className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                  >
                    {editingSave ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}