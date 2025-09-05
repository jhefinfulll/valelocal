'use client';

import { usePathname } from 'next/navigation';
import Layout from '@/components/Layout';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  return (
    <Layout>
      {children}
    </Layout>
  );
}
