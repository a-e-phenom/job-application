import { useNavigate, useLocation } from 'react-router-dom';

export default function CompletionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the flow slug from location state or query params
  const flowSlug = (location.state as any)?.flowSlug || new URLSearchParams(location.search).get('flow');

  const handleRetake = () => {
    if (flowSlug) {
      navigate(`/flow/${flowSlug}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          End of the application flow
        </h1>
        
        {flowSlug && (
          <button
            onClick={handleRetake}
            className="mt-4 px-6 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            Retake
          </button>
        )}
      </div>
    </div>
  );
}

