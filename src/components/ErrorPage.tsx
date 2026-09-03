import { useRouteError, Link } from 'react-router-dom';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

export default function ErrorPage() {
  const error = useRouteError() as any;

  const errorMessage = error?.statusText || error?.message || 'An unexpected error occurred in SecureFlow.';

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-6">
      <div className="max-w-md w-full border-2 border-deepbrown/20 bg-background p-8 text-center shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-destructive/10 text-destructive rounded-full">
            <AlertTriangle className="w-10 h-10" />
          </div>
        </div>
        
        <h1 className="font-heading text-3xl text-foreground mb-3">Application Error</h1>
        <p className="font-paragraph text-sm text-secondary-foreground mb-6 break-words">
          {errorMessage}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-deepbrown text-foreground hover:bg-deepbrown hover:text-background font-paragraph text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reload Page
          </button>
          
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-deepbrown font-paragraph text-sm transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}