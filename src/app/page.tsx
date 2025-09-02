
"use client";

import withAuth from '@/components/auth/with-auth';
import DashboardPage from '@/components/dashboard/dashboard-page';

function HomePage() {
  return <DashboardPage />;
}

export default withAuth(HomePage);
