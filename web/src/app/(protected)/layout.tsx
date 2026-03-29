/**
 * Protected Layout - Authentication Required
 *
 * This layout wraps all routes in the (protected) group and requires authentication.
 * Unauthenticated users are redirected to /auth/signin.
 * Includes the NavBar on all authenticated pages.
 */

import { requireAuth } from '@/lib/auth/auth-server';
import NavBar from '@/components/NavBar';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps): Promise<React.ReactElement> {
  // Redirects to /auth/signin if not authenticated
  await requireAuth();

  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
