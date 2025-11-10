'use client';

/**
 * Redirect page from old /jobs/swipe to new consolidated /jobs page
 * Preserves URL parameters for seamless user experience
 */

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function JobSwipeRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Construct the new URL with swipe view as default
    const newUrl = new URL('/jobs', window.location.origin);

    // Set view mode to swipe to preserve the user's intention
    newUrl.searchParams.set('view', 'swipe');

    // Preserve any existing search parameters
    searchParams.forEach((value, key) => {
      if (key !== 'view') { // Don't override the view parameter
        newUrl.searchParams.set(key, value);
      }
    });

    // Redirect to the new consolidated jobs page
    router.replace(newUrl.pathname + newUrl.search);
  }, [router, searchParams]);

  // Show a loading state while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to job discovery...</p>
      </div>
    </div>
  );
}

export default function JobSwipeRedirect() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <JobSwipeRedirectContent />
    </Suspense>
  );
}