'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from '@/lib/auth/auth-client';

/**
 * Validates callback URL to prevent open redirect attacks.
 * Only allows relative URLs (same-origin).
 *
 * @param url - The callback URL to validate
 * @returns Validated URL (relative) or '/' if invalid
 */
function validateCallbackUrl(url: string | null): string {
  if (!url) return '/';

  try {
    if (url.startsWith('//')) {
      console.warn('Open redirect attempt blocked:', url);
      return '/';
    }

    if (!url.startsWith('/')) {
      console.warn('Open redirect attempt blocked:', url);
      return '/';
    }

    if (url.toLowerCase().match(/^\/*(data|javascript):/i)) {
      console.warn('Potential XSS attempt blocked:', url);
      return '/';
    }

    return url;
  } catch (error) {
    console.error('Error validating callback URL:', error);
    return '/';
  }
}

function SignInForm(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = validateCallbackUrl(searchParams.get('callbackUrl'));

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn(username, password);

      if (result.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch {
      setError('An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-sm mx-auto mt-24">
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/morgagemaxlogo.png"
            alt="MortgageMax Logo"
            width={180}
            height={60}
            priority
          />
          <h1 className="text-xl font-bold mt-4">Commission Payments System</h1>
        </div>
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader />
            <CardContent className="space-y-4">
              {error && (
                <div
                  className="rounded-md bg-destructive/15 p-3 text-sm text-destructive"
                  role="alert"
                  aria-live="polite"
                >
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                aria-label={isLoading ? 'Signing in...' : 'Sign in'}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function SignInPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div>Loading...</div>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
