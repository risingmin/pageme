import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, FileInput, Textarea } from '../components/ui';
import { generatedSitesApi } from '../api/generatedSitesApi';
import { AxiosError } from 'axios';

export function GeneratePage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [useTextInput, setUseTextInput] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!useTextInput && !file) {
      setError('Please upload a résumé file');
      return;
    }
    if (useTextInput && !textContent.trim()) {
      setError('Please enter your résumé content');
      return;
    }

    setIsLoading(true);
    try {
      if (useTextInput) {
        await generatedSitesApi.create({ resumeText: textContent.trim() });
      } else if (file) {
        await generatedSitesApi.create({ resumeFile: file });
      }
      
      alert('Your site is being generated! You will be redirected to the dashboard.');
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Failed to generate site. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">
            Generate Your Website
          </h1>
          <p className="text-sm text-slate-500">
            Upload your résumé in .txt format and we'll create a beautiful personal website for you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => setUseTextInput(false)}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium ${
                !useTextInput
                  ? 'bg-accent text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setUseTextInput(true)}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium ${
                useTextInput
                  ? 'bg-accent text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Paste Text
            </button>
          </div>

          {!useTextInput ? (
            <FileInput
              label="Résumé File"
              accept=".txt"
              onChange={setFile}
              disabled={isLoading}
            />
          ) : (
            <Textarea
              label="Résumé Content"
              placeholder="Paste your résumé content here..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              disabled={isLoading}
              className="min-h-[250px]"
            />
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Tips for best results</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Include your name, contact info, and a brief summary</li>
              <li>• List your skills, work experience, and education</li>
              <li>• Add any projects or achievements you'd like to highlight</li>
            </ul>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Website'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default GeneratePage;
