'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { getRegions } from '@/lib/regions-api';
import {
  createAgent,
  getAgents,
  getAvailableAgentUsers,
  updateAgent,
  updateAgentStatus,
} from '@/lib/agents-api';
import type {
  AgentProfile,
  CreateAgentPayload,
  Region,
  UpdateAgentPayload,
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
      setError(err?.response?.data?.message || 'Failed to create agent profile.');
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
            Admin Module
          </p>
          <h1 className="mt-1 text-2xl font-bold">Agents Management</h1>
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

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Create Agent Profile</h2>

            <form onSubmit={handleCreateAgent} className="mt-6 space-y-4">
              <select
                name="userId"
                value={createForm.userId}
                onChange={handleCreateChange}
                required
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
              >
                <option value="">Select Agent User</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} - {user.email}
                  </option>
                ))}
              </select>

              <select
                name="regionId"
                value={createForm.regionId}
                onChange={handleCreateChange}
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
                value={createForm.monthlyTarget || ''}
                onChange={handleCreateChange}
                placeholder="Monthly Target"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
              />

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    name="notificationSms"
                    checked={!!createForm.notificationSms}
                    onChange={handleCreateChange}
                  />
                  SMS Alerts
                </label>

                <label className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    name="notificationEmail"
                    checked={!!createForm.notificationEmail}
                    onChange={handleCreateChange}
                  />
                  Email Alerts
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
              >
                {saving ? 'Creating...' : 'Create Agent'}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Agent Directory</h2>
              <div className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300">
                Total: {agents.length}
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              {loading ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center text-slate-400">
                  Loading agents...
                </div>
              ) : (
                <table className="min-w-full overflow-hidden rounded-2xl border border-slate-800">
                  <thead className="bg-slate-950">
                    <tr className="text-left text-sm text-slate-400">
                      <th className="px-4 py-3 font-medium">Agent</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Region</th>
                      <th className="px-4 py-3 font-medium">Target</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((agent) => (
                      <tr
                        key={agent.id}
                        className="border-t border-slate-800 bg-slate-900 text-sm"
                      >
                        <td className="px-4 py-3 font-medium text-white">
                          {agent.user.fullName}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {agent.user.email}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {agent.region.name}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {agent.monthlyTarget}
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
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(agent)}
                              className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleStatusToggle(agent)}
                              className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
                            >
                              {agent.status ? 'Disable' : 'Activate'}
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

