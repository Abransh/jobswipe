/**
 * Jobs Page Layout
 * Includes persistent sidebar navigation matching dashboard layout
 */

import { DashboardNavigation } from '@/components/dashboard/DashboardNavigation';

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Dashboard Navigation Sidebar */}
      <DashboardNavigation />

      {/* Main Content Area with offset for sidebar */}
      <div className="lg:pl-72 flex-1">
        {children}
      </div>
    </div>
  );
}
