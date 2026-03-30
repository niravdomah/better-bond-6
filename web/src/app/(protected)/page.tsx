'use client';

import { useState } from 'react';
import DashboardContent from '@/components/DashboardContent';

export default function DashboardPage() {
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);

  return (
    <main className="container mx-auto px-4 py-8 lg:px-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {selectedAgency && (
        <p className="text-sm text-muted-foreground mb-4">
          Selected agency: {selectedAgency}
        </p>
      )}
      <DashboardContent
        selectedAgency={selectedAgency}
        onSelectAgency={setSelectedAgency}
      />
    </main>
  );
}
