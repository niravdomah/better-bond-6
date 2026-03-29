'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';

const navLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/payment-management', label: 'Payment Management' },
];

export default function NavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userDisplay = session?.user?.email || session?.user?.name || '';

  const handleSignOut = () => {
    signOut({ redirect: true, callbackUrl: '/auth/signin' });
  };

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/morgagemaxlogo.png"
            alt="MortgageMax"
            width={140}
            height={40}
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" role="navigation">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-secondary underline underline-offset-4'
                    : 'text-primary-foreground hover:text-secondary'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop User Info + Sign Out */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm">{userDisplay}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-primary-foreground hover:text-secondary"
          >
            Sign Out
          </Button>
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Menu"
                className="text-primary-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-primary text-primary-foreground"
            >
              <SheetTitle className="text-primary-foreground">
                Navigation
              </SheetTitle>
              <nav className="flex flex-col gap-4 mt-6" role="navigation">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={`text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-secondary underline underline-offset-4'
                          : 'text-primary-foreground hover:text-secondary'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-6 flex flex-col gap-4">
                <span className="text-sm">{userDisplay}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-primary-foreground hover:text-secondary justify-start"
                >
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
