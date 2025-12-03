import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    if (!config.headers) config.headers = {} as any;
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export async function apiRegister(payload: { email: string; password: string; name?: string }) {
  const r = await api.post('/api/auth/register', payload);
  return r.data as { user: any; accessToken: string; refreshToken: string };
}

export async function apiLogin(payload: { email: string; password: string }) {
  const r = await api.post('/api/auth/login', payload);
  return r.data as { user: any; accessToken: string; refreshToken: string };
}

export async function apiRefresh(refreshToken: string) {
  const r = await api.post('/api/auth/refresh', { refreshToken });
  return r.data as { accessToken: string };
}

export async function apiMe() {
  const r = await api.get('/api/auth/me');
  return r.data as { user: any };
}

// Achievements
export async function apiListAchievements(params: { type?: string; status?: string } = {}) {
  const r = await api.get('/api/achievements', { params });
  return r.data as any[];
}

export async function apiGetAchievement(id: string) {
  const r = await api.get(`/api/achievements/${id}`);
  return r.data as any;
}

// Comments
export async function apiGetComments(achievementId: string) {
  const r = await api.get(`/api/achievements/${achievementId}/comments`);
  return r.data as any[];
}

export async function apiPostComment(achievementId: string, body: string) {
  const r = await api.post(`/api/achievements/${achievementId}/comments`, { body });
  return r.data as any;
}

// Upvotes
export async function apiToggleUpvote(achievementId: string) {
  const r = await api.post(`/api/achievements/${achievementId}/upvotes/toggle`);
  return r.data as { upvoted: boolean };
}

export async function apiGetUpvoteCount(achievementId: string) {
  const r = await api.get(`/api/achievements/${achievementId}/upvotes/count`);
  return r.data as { count: number };
}

// Create achievement
export async function apiCreateAchievement(payload: {
  title: string;
  shortDescription?: string;
  description?: string;
  type?: string;
  tags?: string[];
  achievementDate?: string;
  howItStarted?: string | null;
  howWeBuiltIt?: string | null;
  whatWeAchieved?: string | null;
  whatWeLearned?: string | null;
  photos?: string[];
}) {
  const r = await api.post('/api/achievements', payload);
  return r.data as any;
}

// User achievements
export async function apiGetUserAchievements(userId: string) {
  const r = await api.get(`/api/achievements/user/${userId}`);
  return r.data as any[];
}

// Admin - achievements
export async function apiListPendingAchievements() {
  const r = await api.get('/api/achievements/pending/list');
  return r.data as any[];
}

export async function apiReviewAchievement(id: string, payload: { status: 'approved' | 'rejected'; rejectionReason?: string }) {
  const r = await api.post(`/api/achievements/${id}/review`, payload);
  return r.data as any;
}

// Opportunities
export async function apiListOpportunities(params: { type?: string } = {}) {
  const r = await api.get('/api/opportunities', { params });
  return r.data as any[];
}

export async function apiCreateOpportunity(payload: {
  title: string;
  description: string;
  type?: string;
  organization?: string;
  location?: string;
  applyUrl?: string;
  detailsUrl?: string;
  joinTeamUrl?: string;
  eligibility?: string;
  thumbnailUrl?: string;
  customTypeLabel?: string;
  isStartup?: boolean;
  startupName?: string;
  deadline?: string;
  tags?: string[];
  isFeatured?: boolean;
}) {
  const r = await api.post('/api/opportunities', payload);
  return r.data as any;
}

// Admin - opportunities
export async function apiListPendingOpportunities() {
  const r = await api.get('/api/opportunities/pending/list');
  return r.data as any[];
}

export async function apiReviewOpportunity(id: string, payload: { status: 'approved' | 'rejected'; rejectionReason?: string }) {
  const r = await api.post(`/api/opportunities/${id}/review`, payload);
  return r.data as any;
}
