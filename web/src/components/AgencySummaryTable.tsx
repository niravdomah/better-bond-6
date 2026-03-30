'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { PaymentsByAgencyReportItem } from '@/types/api-generated';
import { formatZAR } from '@/lib/utils/format-currency';

interface AgencySummaryTableProps {
  agencies: PaymentsByAgencyReportItem[];
  selectedAgency: string | null;
  onSelectAgency: (agency: string | null) => void;
}

export default function AgencySummaryTable({
  agencies,
  selectedAgency,
  onSelectAgency,
}: AgencySummaryTableProps) {
  const router = useRouter();
  const [confirmAgency, setConfirmAgency] = useState<string | null>(null);

  if (agencies.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Agency Summary</h2>
        <p className="text-muted-foreground">
          There are no agencies to display.
        </p>
      </div>
    );
  }

  const handleRowClick = (agencyName: string) => {
    if (selectedAgency === agencyName) {
      onSelectAgency(null);
    } else {
      onSelectAgency(agencyName);
    }
  };

  const handleGoClick = (e: React.MouseEvent, agencyName: string) => {
    e.stopPropagation();
    setConfirmAgency(agencyName);
  };

  const handleConfirmNavigation = () => {
    if (confirmAgency) {
      router.push(
        `/payment-management?agency=${encodeURIComponent(confirmAgency)}`,
      );
    }
    setConfirmAgency(null);
  };

  const handleCancelNavigation = () => {
    setConfirmAgency(null);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Agency Summary</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agency Name</TableHead>
            <TableHead>Number of Payments</TableHead>
            <TableHead>Total Commission Amount</TableHead>
            <TableHead>VAT</TableHead>
            <TableHead className="w-20"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agencies.map((agency) => {
            const name = agency.AgencyName ?? '';
            const isSelected = selectedAgency === name;
            return (
              <TableRow
                key={name}
                aria-selected={isSelected}
                className={`cursor-pointer ${isSelected ? 'bg-muted' : ''}`}
                onClick={() => handleRowClick(name)}
              >
                <TableCell>{name}</TableCell>
                <TableCell>{agency.PaymentCount ?? 0}</TableCell>
                <TableCell>
                  {formatZAR(agency.TotalCommissionCount ?? 0)}
                </TableCell>
                <TableCell>{formatZAR(agency.Vat ?? 0)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleGoClick(e, name)}
                  >
                    Go
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <AlertDialog
        open={confirmAgency !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmAgency(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Navigate to Payment Management</AlertDialogTitle>
            <AlertDialogDescription>
              Navigate to Payment Management for {confirmAgency}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelNavigation}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmNavigation}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
