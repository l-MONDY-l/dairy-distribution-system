import type {
  CompanyProfile,
  CompanyProfileCompletionResponse,
} from '@/lib/types/company-profile';

const BASE_PATH = '/api/company-profile';

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser: relative URLs are fine
    return '';
  }
  // Server (RSC / API): need absolute URL
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  return envUrl ?? 'http://localhost:3000';
}

async function handleResponse<T>(res: Response): Promise<T> {
  let body: any = null;

  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    throw new Error(
      body?.error ||
        body?.message ||
        `Request failed with status ${res.status}`,
    );
  }

  return body as T;
}

export async function fetchCompanyProfile(): Promise<CompanyProfile | null> {
  const res = await fetch(`${getBaseUrl()}${BASE_PATH}`, { cache: 'no-store' });
  if (res.status === 404) {
    return null;
  }
  return handleResponse<CompanyProfile>(res);
}

export async function createCompanyProfile(
  payload: Partial<CompanyProfile>,
): Promise<CompanyProfile> {
  const res = await fetch(`${getBaseUrl()}${BASE_PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<CompanyProfile>(res);
}

export async function updateCompanyProfile(
  payload: Partial<CompanyProfile>,
): Promise<CompanyProfile> {
  const res = await fetch(`${getBaseUrl()}${BASE_PATH}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<CompanyProfile>(res);
}

export async function fetchCompanyProfileCompletion(): Promise<CompanyProfileCompletionResponse> {
  const res = await fetch(`${getBaseUrl()}${BASE_PATH}/completion`, { cache: 'no-store' });
  return handleResponse<CompanyProfileCompletionResponse>(res);
}

