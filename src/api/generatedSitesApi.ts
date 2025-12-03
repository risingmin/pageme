import apiClient from './client';
import type { GeneratedSite, CreateSitePayload, UpdateSitePayload } from '../types/GeneratedSite';

export const generatedSitesApi = {
  async list(): Promise<GeneratedSite[]> {
    const response = await apiClient.get<GeneratedSite[]>('/api/generated-sites');
    return response.data;
  },

  async getById(id: string): Promise<GeneratedSite> {
    const response = await apiClient.get<GeneratedSite>(`/api/generated-sites/${id}`);
    return response.data;
  },

  async create(payload: CreateSitePayload): Promise<GeneratedSite> {
    // If there's a file, use FormData
    if (payload.resumeFile) {
      const formData = new FormData();
      formData.append('resumeFile', payload.resumeFile);
      if (payload.title) {
        formData.append('title', payload.title);
      }
      const response = await apiClient.post<GeneratedSite>('/api/generated-sites', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    // Otherwise, send JSON
    const response = await apiClient.post<GeneratedSite>('/api/generated-sites', {
      resumeText: payload.resumeText,
      title: payload.title,
    });
    return response.data;
  },

  async update(id: string, payload: UpdateSitePayload): Promise<GeneratedSite> {
    const response = await apiClient.put<GeneratedSite>(`/api/generated-sites/${id}`, payload);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/generated-sites/${id}`);
  },
};

export default generatedSitesApi;
