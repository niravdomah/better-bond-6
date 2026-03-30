'use client';

import DashboardContent from '@/components/DashboardContent';

export default function DashboardPage() {
  return (
    <main className="container mx-auto px-4 py-8 lg:px-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <DashboardContent />
    </main>
  );
}
