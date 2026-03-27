import { api } from '@/lib/api';
import type {
  AgentProfile,
  CreateAgentPayload,
  UpdateAgentPayload,
  User,
} from '@/lib/types';

export async function getAgents(): Promise<AgentProfile[]> {
  const response = await api.get('/agents');
  return response.data;
}

export async function getAgent(id: string): Promise<AgentProfile> {
  const response = await api.get(`/agents/${id}`);
  return response.data;
}

export async function getAvailableAgentUsers(): Promise<User[]> {
  const response = await api.get('/agents/available-users');
  return response.data;
}

export async function createAgent(
  payload: CreateAgentPayload,
): Promise<AgentProfile> {
  const response = await api.post('/agents', payload);
  return response.data;
}

export async function updateAgent(
  id: string,
  payload: UpdateAgentPayload,
): Promise<AgentProfile> {
  const response = await api.patch(`/agents/${id}`, payload);
  return response.data;
}

export async function updateAgentStatus(
  id: string,
  status: boolean,
): Promise<AgentProfile> {
  const response = await api.patch(`/agents/${id}/status`, { status });
  return response.data;
}

export async function deleteAgent(id: string): Promise<void> {
  await api.delete(`/agents/${id}`);
}

