import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Button, Input, Spinner } from '../components/ui';
import { generatedSitesApi } from '../api/generatedSitesApi';
import type { GeneratedSite } from '../types/GeneratedSite';
import { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const statusColors: Record<GeneratedSite['status'], string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border border-blue-200',
  completed: 'bg-green-50 text-green-700 border border-green-200',
  failed: 'bg-red-50 text-red-700 border border-red-200',
};

export function SiteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [site, setSite] = useState<GeneratedSite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [editedTitle, setEditedTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSite(id);
    }
  }, [id]);

  const fetchSite = async (siteId: string) => {
    try {
      setIsLoading(true);
      setError('');
      const data = await generatedSitesApi.getById(siteId);
      setSite(data);
      setEditedTitle(data.title || '');
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 404) {
          setError('Site not found');
        } else {
          setError(err.response?.data?.message || 'Failed to load site details');
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!id || !site) return;

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await generatedSitesApi.update(id, { title: editedTitle });
      setSite(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      if (err instanceof AxiosError) {
        alert(err.response?.data?.message || 'Failed to save changes');
      } else {
        alert('An unexpected error occurred');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleDownload = async () => {
    if (!site?.siteUrl) return;
    
    try {
      const url = site.siteUrl.startsWith('http') ? site.siteUrl : `${API_BASE_URL}${site.siteUrl}`;
      const response = await fetch(url);
      const html = await response.text();
      
      const blob = new Blob([html], { type: 'text/html' });
      const downloadUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${site.title || 'portfolio'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert('Failed to download file');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !site) {
    return (
      <Card className="text-center">
        <div className="py-8">
          <p className="text-red-600 mb-4">{error || 'Site not found'}</p>
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard"
          className="text-slate-500 hover:text-slate-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-slate-800">Site Details</h1>
      </div>

      <Card>
        <div className="space-y-6">
          {/* Title Edit */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Title
            </label>
            <div className="flex gap-2">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Enter site title"
                className="flex-1"
              />
              <Button
                onClick={handleSaveTitle}
                isLoading={isSaving}
                disabled={isSaving || editedTitle === site.title}
                variant={saveSuccess ? 'secondary' : 'primary'}
              >
                {saveSuccess ? 'Saved!' : 'Save'}
              </Button>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Status
            </label>
            <span
              className={`inline-block text-sm font-medium px-2.5 py-0.5 rounded ${statusColors[site.status]}`}
            >
              {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
            </span>
          </div>

          {/* Timestamps */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Created
              </label>
              <p className="text-sm text-slate-600">{formatDate(site.createdAt)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Last Updated
              </label>
              <p className="text-sm text-slate-600">{formatDate(site.updatedAt)}</p>
            </div>
          </div>

          {/* Description */}
          {site.description && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description
              </label>
              <p className="text-sm text-slate-600">{site.description}</p>
            </div>
          )}

          {/* Site URL */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Generated Website
            </label>
            {site.siteUrl && site.status === 'completed' ? (
              <div className="flex flex-wrap gap-3">
                <a
                  href={site.siteUrl.startsWith('http') ? site.siteUrl : `${API_BASE_URL}${site.siteUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-md font-medium hover:bg-accent-hover active:scale-[0.98]"
                >
                  <span>Open your website</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </a>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-md font-medium hover:bg-slate-200 border border-slate-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Download HTML</span>
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">
                {site.status === 'failed'
                  ? 'Generation failed. Please try again.'
                  : site.status === 'pending' || site.status === 'processing'
                  ? 'Your website is being generated...'
                  : 'No website URL available'}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default SiteDetailPage;
