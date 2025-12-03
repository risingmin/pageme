export interface GeneratedSite {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  siteUrl?: string;
  description?: string;
  resumeText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSitePayload {
  resumeText?: string;
  resumeFile?: File;
  title?: string;
}

export interface UpdateSitePayload {
  title?: string;
  description?: string;
}
