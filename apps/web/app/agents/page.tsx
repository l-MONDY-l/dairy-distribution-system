'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { getRegions } from '@/lib/regions-api';
import {
  deleteAgent,
  getAgents,
  getAvailableAgentUsers,
  updateAgent,
  updateAgentStatus,
  createAgent,
} from '@/lib/agents-api';
import type {
  AgentProfile,
  Region,
  UpdateAgentPayload,
  CreateAgentPayload,
  User,
} from '@/lib/types';

const initialCreateForm: CreateAgentPayload = {
  userId: '',
  regionId: '',
  monthlyTarget: '',
  notificationSms: true,
  notificationEmail: true,
  status: true,
};

const initialEditForm: UpdateAgentPayload = {
  regionId: '',
  monthlyTarget: '',
  notificationSms: true,
  notificationEmail: true,
  status: true,
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSave, setEditingSave] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [createForm, setCreateForm] =
    useState<CreateAgentPayload>(initialCreateForm);
  const [editingAgent, setEditingAgent] = useState<AgentProfile | null>(null);
  const [editForm, setEditForm] =
    useState<UpdateAgentPayload>(initialEditForm);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [performanceFilter, setPerformanceFilter] = useState<
    'ALL' | 'UNDER_70' | 'BETWEEN_70_100' | 'OVER_100'
  >('ALL');
  const [searchName, setSearchName] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchTown, setSearchTown] = useState('');

  const formatDateTime = (d: string | null | undefined) =>
    d
      ? new Date(d).toLocaleString(undefined, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [agentsData, regionsData, availableUsersData] = await Promise.all([
        getAgents(),
        getRegions(),
        getAvailableAgentUsers(),
      ]);

      setAgents(agentsData);
      setRegions(regionsData);
      setAvailableUsers(availableUsersData);
    } catch {
      setError('Failed to load agents data.');
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
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    setCreateForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    setEditForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await createAgent(createForm);
      setSuccess('Agent profile created successfully.');
      setCreateForm(initialCreateForm);
      await loadData();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Failed to create agent profile.',
      );
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (agent: AgentProfile) => {
    setEditingAgent(agent);
    setEditForm({
      regionId: agent.region.id,
      monthlyTarget: agent.monthlyTarget || '0',
      notificationSms: agent.notificationSms,
      notificationEmail: agent.notificationEmail,
      status: agent.status,
    });
    setError('');
    setSuccess('');
  };

  const closeEditModal = () => {
    setEditingAgent(null);
    setEditForm(initialEditForm);
  };

  const handleEditAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgent) return;
    try {
      setEditingSave(true);
      setError('');
      setSuccess('');
      await updateAgent(editingAgent.id, editForm);
      setSuccess('Agent updated successfully.');
      closeEditModal();
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update agent.');
    } finally {
      setEditingSave(false);
    }
  };

  const handleStatusToggle = async (agent: AgentProfile) => {
    try {
      setError('');
      setSuccess('');
      await updateAgentStatus(agent.id, !agent.status);
      setSuccess(
        `Agent ${!agent.status ? 'activated' : 'disabled'} successfully.`,
      );
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update agent status.');
    }
  };

  const handleDeleteAgent = async (agent: AgentProfile) => {
    const name = agent.user?.fullName ?? agent.user?.email ?? agent.id;
    if (
      !window.confirm(
        `Do you want to delete this agent? (${name})\n\nThis will remove their profile and unassign them from towns, orders, and related records.`,
      )
    ) {
      return;
    }
    try {
      setDeletingId(agent.id);
      setError('');
      setSuccess('');
      await deleteAgent(agent.id);
      setSuccess('Agent deleted successfully.');
      setAgents((prev) => prev.filter((a) => a.id !== agent.id));
      if (editingAgent?.id === agent.id) {
        setEditingAgent(null);
        setEditForm(initialEditForm);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete agent.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAgents = agents.filter((agent) => {
    const matchesRegion =
      regionFilter === 'ALL' ? true : agent.region.id === regionFilter;

    const target = Number(agent.monthlyTarget || 0);
    const sold = agent.currentSalesQty ?? 0;
    const pct = target ? Math.round((sold / target) * 100) : 0;

    const matchesPerformance =
      performanceFilter === 'ALL'
        ? true
        : performanceFilter === 'UNDER_70'
          ? pct > 0 && pct < 70
          : performanceFilter === 'BETWEEN_70_100'
            ? pct >= 70 && pct < 100
            : pct >= 100;

    const matchText = (value: string | null | undefined, q: string) =>
      !q.trim() ||
      (value ?? '').toLowerCase().includes(q.trim().toLowerCase());

    const allCities = (() => {
      const directCities =
        agent.cityAssignments?.map((a) => a.city.name) ?? [];
      const citiesFromTowns =
        agent.townAssignments?.map((a) => a.town.city.name) ?? [];
      return Array.from(new Set([...directCities, ...citiesFromTowns]));
    })();

    const allTowns =
      agent.townAssignments?.map((a) => a.town.name) ?? [];

    const matchesName = matchText(agent.user.fullName, searchName);
    const matchesContact =
      matchText(agent.user.phone, searchContact) ||
      matchText(agent.user.email, searchContact);
    const matchesCity =
      !searchCity.trim() ||
      allCities.some((c) =>
        c.toLowerCase().includes(searchCity.trim().toLowerCase()),
      );
    const matchesTown =
      !searchTown.trim() ||
      allTowns.some((t) =>
        t.toLowerCase().includes(searchTown.trim().toLowerCase()),
      );

    return (
      matchesRegion &&
      matchesPerformance &&
      matchesName &&
      matchesContact &&
      matchesCity &&
      matchesTown
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Agents Management</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage field agents, monthly targets, and territory assignments.
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

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 md:p-6">
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3 md:max-w-4xl">
            {/* Agent Status card */}
            <div className="rounded-2xl border border-emerald-500/60 bg-emerald-500/15 p-4 text-left text-xs font-medium text-slate-100 ring-2 ring-emerald-500/30 min-h-[7rem] flex flex-col justify-center">
              <span className="block text-2xl font-bold text-white">
                {agents.length}
              </span>
              <span className="mt-0.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
                Agent status
              </span>
              <p className="mt-1 text-[11px] text-slate-400/80">
                Current activity, performance, and status by agent.
              </p>
            </div>
            {/* Agent stock & returns card */}
            <Link
              href="/agents/stock-returns"
              className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-left text-xs text-slate-200 hover:border-emerald-500 hover:bg-slate-800 min-h-[7rem] flex flex-col justify-center"
            >
              <span className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                Agent stock &amp; returns
              </span>
              <p className="mt-1 text-[11px] text-slate-500">
                View allocated stock, used quantity, and returns by agent.
              </p>
            </Link>
            {/* Agent targets & rewards card */}
            <Link
              href="/agents/targets-rewards"
              className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-left text-xs text-slate-200 hover:border-emerald-500 hover:bg-slate-800 min-h-[7rem] flex flex-col justify-center"
            >
              <span className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                Agent targets &amp; rewards
              </span>
              <p className="mt-1 text-[11px] text-slate-500">
                Track targets, performance, and incentive rewards.
              </p>
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="text-xs text-slate-400">
              Showing {filteredAgents.length} of {agents.length} agents
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
            >
              <option value="ALL">All regions</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
            <div className="inline-flex gap-1 rounded-2xl border border-slate-700 bg-slate-950 p-1 text-xs">
              <button
                type="button"
                onClick={() => setPerformanceFilter('ALL')}
                className={`rounded-xl px-3 py-1.5 ${
                  performanceFilter === 'ALL'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                All performance
              </button>
              <button
                type="button"
                onClick={() => setPerformanceFilter('UNDER_70')}
                className={`rounded-xl px-3 py-1.5 ${
                  performanceFilter === 'UNDER_70'
                    ? 'bg-red-500 text-white'
                    : 'text-red-300 hover:bg-slate-800'
                }`}
              >
                &lt; 70%
              </button>
              <button
                type="button"
                onClick={() => setPerformanceFilter('BETWEEN_70_100')}
                className={`rounded-xl px-3 py-1.5 ${
                  performanceFilter === 'BETWEEN_70_100'
                    ? 'bg-amber-500 text-slate-900'
                    : 'text-amber-300 hover:bg-slate-800'
                }`}
              >
                70–99%
              </button>
              <button
                type="button"
                onClick={() => setPerformanceFilter('OVER_100')}
                className={`rounded-xl px-3 py-1.5 ${
                  performanceFilter === 'OVER_100'
                    ? 'bg-emerald-500 text-slate-900'
                    : 'text-emerald-300 hover:bg-slate-800'
                }`}
              >
                ≥ 100%
              </button>
            </div>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Search by agent name"
              className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              value={searchContact}
              onChange={(e) => setSearchContact(e.target.value)}
              placeholder="Search by email / phone"
              className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Search by city"
              className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              value={searchTown}
              onChange={(e) => setSearchTown(e.target.value)}
              placeholder="Search by town"
              className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="mt-4 overflow-x-auto">
            {loading ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center text-slate-400">
                Loading agents...
              </div>
            ) : (
              <table className="min-w-full overflow-hidden rounded-2xl border border-slate-800 text-sm">
                <thead className="bg-slate-950 text-xs text-slate-400">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Agent</th>
                    <th className="px-4 py-3 text-left font-medium">Region</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">Contact number</th>
                    <th className="px-4 py-3 text-left font-medium">City</th>
                    <th className="px-4 py-3 text-left font-medium">Town</th>
                    <th className="px-4 py-3 text-left font-medium">Target qty</th>
                    <th className="px-4 py-3 text-left font-medium">Current sale qty</th>
                    <th className="px-4 py-3 text-left font-medium">% of target</th>
                    <th className="px-4 py-3 text-left font-medium">Current sales (LKR)</th>
                    <th className="px-4 py-3 text-left font-medium">Orders (this month)</th>
                    <th className="px-4 py-3 text-left font-medium">Last active</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map((agent) => (
                    <tr
                      key={agent.id}
                      className="border-t border-slate-800 bg-slate-900 text-slate-200"
                    >
                      <td className="px-4 py-3 font-medium">
                        {agent.user.fullName}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {agent.region.name}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {agent.user.email}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {agent.user.phone ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {(() => {
                          const directCities =
                            agent.cityAssignments?.map((a) => a.city.name) ??
                            [];
                          const citiesFromTowns =
                            agent.townAssignments?.map(
                              (a) => a.town.city.name,
                            ) ?? [];
                          const allCities = Array.from(
                            new Set([...directCities, ...citiesFromTowns]),
                          ).filter(Boolean);
                          if (!allCities.length) return '—';
                          return allCities.join(', ');
                        })()}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {(() => {
                          const towns =
                            agent.townAssignments?.map(
                              (a) => a.town.name,
                            ) ?? [];
                          if (!towns.length) return '—';
                          return towns.join(', ');
                        })()}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {agent.monthlyTarget
                          ? Number(agent.monthlyTarget).toLocaleString()
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {agent.currentSalesQty ?? 0}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {(() => {
                          const target = Number(agent.monthlyTarget || 0);
                          const sold = agent.currentSalesQty ?? 0;
                          if (!target) return '—';
                          const pct = Math.round((sold / target) * 100);
                          const colorClass =
                            pct >= 100
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                              : pct >= 70
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                                : 'bg-red-500/15 text-red-300 border-red-500/40';
                          return (
                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${colorClass}`}
                            >
                              {pct}%
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {agent.currentSales
                          ? `LKR ${Number(agent.currentSales).toLocaleString()}`
                          : 'LKR 0'}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {agent.ordersAssigned ?? 0}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {formatDateTime(agent.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            agent.status
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-amber-500/15 text-amber-400'
                          }`}
                        >
                          {agent.status ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {editingAgent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Edit Agent</h2>
                <button
                  onClick={closeEditModal}
                  className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Close
                </button>
              </div>

              <form
                onSubmit={handleEditAgent}
                className="mt-6 grid gap-4 md:grid-cols-2"
              >
                <select
                  name="regionId"
                  value={editForm.regionId || ''}
                  onChange={handleEditChange}
                  required
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                >
                  <option value="">Select Region</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>

                <input
                  name="monthlyTarget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.monthlyTarget || ''}
                  onChange={handleEditChange}
                  placeholder="Monthly Target"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                />

                <label className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    name="notificationSms"
                    checked={!!editForm.notificationSms}
                    onChange={handleEditChange}
                  />
                  SMS Alerts
                </label>

                <label className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    name="notificationEmail"
                    checked={!!editForm.notificationEmail}
                    onChange={handleEditChange}
                  />
                  Email Alerts
                </label>

                <label className="md:col-span-2 flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    name="status"
                    checked={!!editForm.status}
                    onChange={handleEditChange}
                  />
                  Active
                </label>

                <div className="md:col-span-2 flex justify-end gap-3">
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

