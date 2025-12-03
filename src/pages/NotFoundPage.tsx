import { Link } from 'react-router-dom';
import { Card, Button } from '../components/ui';

export function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="text-center max-w-md">
        <div className="py-8">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔍</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <Link to="/">
            <Button>Go back home</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default NotFoundPage;
