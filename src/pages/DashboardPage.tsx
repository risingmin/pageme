import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Spinner } from '../components/ui';
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

export function DashboardPage() {
  const [sites, setSites] = useState<GeneratedSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await generatedSitesApi.list();
      setSites(data);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Failed to load your sites');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this site? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      await generatedSitesApi.delete(id);
      setSites((prev) => prev.filter((site) => site.id !== id));
    } catch (err) {
      if (err instanceof AxiosError) {
        alert(err.response?.data?.message || 'Failed to delete site');
      } else {
        alert('An unexpected error occurred');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center">
        <div className="py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchSites}>Try again</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Your Sites</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your generated portfolio websites
          </p>
        </div>
        <Link to="/generate">
          <Button>Generate new site</Button>
        </Link>
      </div>

      {sites.length === 0 ? (
        <Card className="text-center py-12">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              No sites yet
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Upload your résumé to generate your first personal website
            </p>
            <Link to="/generate">
              <Button>Generate your first site</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sites.map((site) => (
            <Card key={site.id} className="flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-800 truncate">
                    {site.title || 'Untitled Site'}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Created {formatDate(site.createdAt)}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded ${statusColors[site.status]}`}
                >
                  {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100">
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!site.siteUrl || site.status !== 'completed'}
                  onClick={() => {
                    if (site.siteUrl) {
                      // If siteUrl is relative, prepend API base URL
                      const url = site.siteUrl.startsWith('http') 
                        ? site.siteUrl 
                        : `${API_BASE_URL}${site.siteUrl}`;
                      window.open(url, '_blank');
                    }
                  }}
                  className="flex-1"
                >
                  View site
                </Button>
                <Link to={`/sites/${site.id}`} className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full">
                    Details
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(site.id)}
                  isLoading={deletingId === site.id}
                  disabled={deletingId === site.id}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
