'use client';

import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <Layout>
        {user && <Dashboard user={user} />}
      </Layout>
    </ProtectedRoute>
  );
}
