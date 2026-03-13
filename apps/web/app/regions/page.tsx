'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { createRegion, deleteRegion, getRegions, updateRegion } from '@/lib/regions-api';
import type { Region } from '@/lib/types';

type ModalMode = 'create' | 'edit' | null;

type EditableRegion = Pick<Region, 'id' | 'name' | 'status'>;

export default function RegionsPage() {
  const [regions, setRegions] = useState<EditableRegion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [modalName, setModalName] = useState('');
  const [editingRegionId, setEditingRegionId] = useState<string | null>(null);
  const [modalSaving, setModalSaving] = useState(false);

  useEffect(() => {
    void loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getRegions();
      setRegions(
        data.map((r) => ({
          id: r.id,
          name: r.name,
          status: r.status,
        })),
      );
    } catch (err) {
      console.error(err);
      setError('Failed to load regions.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setModalName('');
    setEditingRegionId(null);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openEditModal = (region: EditableRegion) => {
    setModalMode('edit');
    setModalName(region.name);
    setEditingRegionId(region.id);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    if (modalSaving) return;
    setShowModal(false);
    setModalMode(null);
    setEditingRegionId(null);
    setModalName('');
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalMode) return;

    const trimmed = modalName.trim();
    if (!trimmed) {
      setError('Region name is required.');
      return;
    }

    try {
      setModalSaving(true);
      setError('');

      if (modalMode === 'create') {
        const created = await createRegion(trimmed);
        setRegions((prev) => [
          ...prev,
          { id: created.id, name: created.name, status: created.status },
        ]);
        setSuccess('Region created.');
      } else if (modalMode === 'edit' && editingRegionId) {
        const updated = await updateRegion(editingRegionId, { name: trimmed });
        setRegions((prev) =>
          prev.map((r) =>
            r.id === editingRegionId ? { ...r, name: updated.name } : r,
          ),
        );
        setSuccess('Region updated.');
      }

      closeModal();
    } catch (err) {
      console.error(err);
      setError('Failed to save region.');
    } finally {
      setModalSaving(false);
    }
  };

  const handleToggleStatus = async (region: EditableRegion) => {
    try {
      setError('');
      const updated = await updateRegion(region.id, { status: !region.status });
      setRegions((prev) =>
        prev.map((r) =>
          r.id === region.id ? { ...r, status: updated.status } : r,
        ),
      );
      setSuccess('Region status updated.');
    } catch (err) {
      console.error(err);
      setError('Failed to update region status.');
    }
  };

  const handleDeleteRegion = async (region: EditableRegion) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete region "${region.name}"?`,
    );
    if (!confirmed) return;

    try {
      setError('');
      await deleteRegion(region.id);
      setRegions((prev) => prev.filter((r) => r.id !== region.id));
      setSuccess('Region deleted.');
    } catch (err) {
      console.error(err);
      setError('Failed to delete region. It might be in use.');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
            Admin Module
          </p>
          <h1 className="mt-1 text-2xl font-bold">Territory And Region Management</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage regions and basic enable / disable state.
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

        {/* Top row: Manage Regions */}
        <div className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900 p-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Manage Regions
            </h2>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-2xl border border-slate-600 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800"
          >
            Manage Regions
          </button>
        </div>

        {/* Regions are managed inside the modal; nothing else here */}
      </div>

      {/* Manage Regions modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-3 py-6 md:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget && !modalSaving) {
              closeModal();
            }
          }}
        >
          <div className="flex max-h-full w-full max-w-xl flex-col rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-xl md:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-100">
                Manage Regions
              </h2>
              <button
                type="button"
                onClick={closeModal}
                disabled={modalSaving}
                aria-label="Close manage regions"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-60"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 space-y-5 overflow-hidden">
              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    {modalMode === 'edit' ? 'Edit Region Name' : 'Add New Region'}
                  </label>
                  <input
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={modalSaving}
                    className="rounded-2xl border border-slate-600 px-4 py-2 text-xs text-slate-100 hover:bg-slate-800 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalSaving}
                    className="rounded-2xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                  >
                    {modalSaving
                      ? 'Saving...'
                      : modalMode === 'edit'
                      ? 'Save Changes'
                      : 'Add Region'}
                  </button>
                </div>
              </form>

              <div className="max-h-64 space-y-2 overflow-y-auto pt-2 md:max-h-80">
                {loading && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-400">
                    Loading regions...
                  </div>
                )}

                {!loading && regions.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-400">
                    No regions yet. Use the form above to add one.
                  </div>
                )}

                {!loading &&
                  regions.map((region) => (
                    <div
                      key={region.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2"
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-100">
                          {region.name}{' '}
                          <span className="text-[10px] font-normal text-emerald-400">
                            {region.status ? '(Enabled)' : '(Disabled)'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(region)}
                          className="rounded-2xl border border-slate-600 px-2 py-1 text-[10px] text-slate-100 hover:bg-slate-800"
                        >
                          {region.status ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(region)}
                          className="rounded-2xl border border-slate-600 px-2 py-1 text-[10px] text-slate-100 hover:bg-slate-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRegion(region)}
                          className="rounded-2xl border border-red-500/70 px-2 py-1 text-[10px] text-red-400 hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

