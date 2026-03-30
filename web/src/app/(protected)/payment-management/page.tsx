'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getPayments, parkPayments, unparkPayments } from '@/lib/api/endpoints';
import type { PaymentRead } from '@/types/api-generated';

const PAGE_SIZE = 10;

const currencyFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
});

function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return '-';
  return currencyFormatter.format(amount);
}

const GRID_COLUMNS = [
  'Agency Name',
  'Batch ID',
  'Claim Date',
  'Agent Name & Surname',
  'Bond Amount',
  'Commission Type',
  'Grant Date',
  'Reg Date',
  'Bank',
  'Commission Amount',
  'VAT',
  'Status',
] as const;

interface ConfirmationModalState {
  type: 'park' | 'unpark';
  mode: 'single' | 'bulk';
  payments: PaymentRead[];
}

export default function PaymentManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const agencyName = searchParams.get('agency');

  // Data state
  const [payments, setPayments] = useState<PaymentRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [claimDateFilter, setClaimDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selection state
  const [selectedReadyIds, setSelectedReadyIds] = useState<Set<number>>(
    new Set(),
  );
  const [selectedParkedIds, setSelectedParkedIds] = useState<Set<number>>(
    new Set(),
  );

  // Modal state
  const [modalState, setModalState] = useState<ConfirmationModalState | null>(
    null,
  );
  const [isMutating, setIsMutating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Redirect if no agency
  useEffect(() => {
    if (!agencyName) {
      router.push('/');
    }
  }, [agencyName, router]);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    if (!agencyName) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPayments({ AgencyName: agencyName });
      setPayments(data.PaymentList ?? []);
    } catch {
      setError('Something went wrong while loading payment data.');
    } finally {
      setIsLoading(false);
    }
  }, [agencyName]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Split payments by status
  const readyPayments = useMemo(
    () => payments.filter((p) => p.Status === 'READY'),
    [payments],
  );

  const parkedPayments = useMemo(
    () => payments.filter((p) => p.Status === 'PARKED'),
    [payments],
  );

  // Apply filters to ready payments
  const filteredReadyPayments = useMemo(() => {
    let filtered = readyPayments;

    if (searchText) {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter((p) => {
        const fullName =
          `${p.AgentName ?? ''} ${p.AgentSurname ?? ''}`.toLowerCase();
        const batchId = String(p.BatchId ?? '').toLowerCase();
        const agency = (p.AgencyName ?? '').toLowerCase();
        return (
          fullName.includes(lower) ||
          batchId.includes(lower) ||
          agency.includes(lower)
        );
      });
    }

    if (claimDateFilter) {
      filtered = filtered.filter((p) => p.ClaimDate === claimDateFilter);
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.Status === statusFilter);
    }

    return filtered;
  }, [readyPayments, searchText, claimDateFilter, statusFilter]);

  // Paginated ready payments
  const totalPages = Math.max(
    1,
    Math.ceil(filteredReadyPayments.length / PAGE_SIZE),
  );
  const paginatedReadyPayments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredReadyPayments.slice(start, start + PAGE_SIZE);
  }, [filteredReadyPayments, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, claimDateFilter, statusFilter]);

  // Selection handlers
  function toggleReadySelection(id: number) {
    setSelectedReadyIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleParkedSelection(id: number) {
    setSelectedParkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // Get username for LastChangedUser header
  const username = session?.user?.name ?? session?.user?.email ?? 'unknown';

  // Modal actions
  function openSingleParkModal(payment: PaymentRead) {
    setMutationError(null);
    setModalState({
      type: 'park',
      mode: 'single',
      payments: [payment],
    });
  }

  function openBulkParkModal() {
    setMutationError(null);
    const selected = readyPayments.filter(
      (p) => p.Id !== undefined && selectedReadyIds.has(p.Id),
    );
    setModalState({
      type: 'park',
      mode: 'bulk',
      payments: selected,
    });
  }

  function openSingleUnparkModal(payment: PaymentRead) {
    setMutationError(null);
    setModalState({
      type: 'unpark',
      mode: 'single',
      payments: [payment],
    });
  }

  function openBulkUnparkModal() {
    setMutationError(null);
    const selected = parkedPayments.filter(
      (p) => p.Id !== undefined && selectedParkedIds.has(p.Id),
    );
    setModalState({
      type: 'unpark',
      mode: 'bulk',
      payments: selected,
    });
  }

  function closeModal() {
    setModalState(null);
    setMutationError(null);
  }

  async function confirmAction() {
    if (!modalState) return;
    const ids = modalState.payments
      .map((p) => p.Id)
      .filter((id): id is number => id !== undefined);
    if (ids.length === 0) return;

    setIsMutating(true);
    setMutationError(null);

    try {
      if (modalState.type === 'park') {
        await parkPayments({ PaymentIds: ids }, username);
      } else {
        await unparkPayments({ PaymentIds: ids }, username);
      }

      // Clear selections and close modal
      setSelectedReadyIds(new Set());
      setSelectedParkedIds(new Set());
      setModalState(null);

      // Re-fetch data
      await fetchPayments();
    } catch {
      setMutationError(
        `Failed to ${modalState.type} payment(s). Please try again.`,
      );
    } finally {
      setIsMutating(false);
    }
  }

  // Compute modal display values
  const modalTotalCommission = modalState
    ? modalState.payments.reduce((sum, p) => sum + (p.CommissionAmount ?? 0), 0)
    : 0;

  if (!agencyName) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Payment Management -- {agencyName}
      </h1>

      {/* Loading state */}
      {isLoading && (
        <div role="status" aria-label="Loading payments">
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <p className="text-red-800">{error}</p>
          <Button variant="outline" className="mt-2" onClick={fetchPayments}>
            Retry
          </Button>
        </div>
      )}

      {/* Main content */}
      {!isLoading && !error && (
        <>
          {/* Filter bar */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Input
              type="search"
              placeholder="Search payments..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="max-w-xs"
            />
            <Input
              type="date"
              placeholder="Claim Date"
              value={claimDateFilter}
              onChange={(e) => setClaimDateFilter(e.target.value)}
              className="max-w-xs"
              aria-label="Claim Date"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" aria-label="Status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="READY">Ready</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Main Grid - READY Payments */}
          <section aria-label="Ready Payments">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Ready Payments ({filteredReadyPayments.length})
              </h2>
              <Button
                disabled={selectedReadyIds.size === 0}
                onClick={openBulkParkModal}
              >
                Park Selected
              </Button>
            </div>

            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    {GRID_COLUMNS.map((col) => (
                      <TableHead key={col}>{col}</TableHead>
                    ))}
                    <TableHead className="w-20">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReadyPayments.map((payment) => (
                    <TableRow key={payment.Id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedReadyIds.has(payment.Id!)}
                          onCheckedChange={() =>
                            toggleReadySelection(payment.Id!)
                          }
                          aria-label={`Select ${payment.AgentName} ${payment.AgentSurname}`}
                        />
                      </TableCell>
                      <TableCell>{payment.AgencyName}</TableCell>
                      <TableCell>{payment.BatchId ?? '-'}</TableCell>
                      <TableCell>{payment.ClaimDate}</TableCell>
                      <TableCell>
                        {payment.AgentName} {payment.AgentSurname}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(payment.BondAmount)}
                      </TableCell>
                      <TableCell>{payment.CommissionType}</TableCell>
                      <TableCell>{payment.GrantDate}</TableCell>
                      <TableCell>{payment.RegistrationDate}</TableCell>
                      <TableCell>{payment.Bank}</TableCell>
                      <TableCell>
                        {formatCurrency(payment.CommissionAmount)}
                      </TableCell>
                      <TableCell>{formatCurrency(payment.VAT)}</TableCell>
                      <TableCell>{payment.Status}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openSingleParkModal(payment)}
                        >
                          Park
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedReadyPayments.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={GRID_COLUMNS.length + 2}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No ready payments
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* Parked Grid */}
          <section aria-label="Parked Payments" className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Parked Payments ({parkedPayments.length})
              </h2>
              <Button
                disabled={selectedParkedIds.size === 0}
                onClick={openBulkUnparkModal}
              >
                Unpark Selected
              </Button>
            </div>

            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    {GRID_COLUMNS.map((col) => (
                      <TableHead key={col}>{col}</TableHead>
                    ))}
                    <TableHead className="w-20">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parkedPayments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={GRID_COLUMNS.length + 2}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No parked payments
                      </TableCell>
                    </TableRow>
                  ) : (
                    parkedPayments.map((payment) => (
                      <TableRow key={payment.Id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedParkedIds.has(payment.Id!)}
                            onCheckedChange={() =>
                              toggleParkedSelection(payment.Id!)
                            }
                            aria-label={`Select ${payment.AgentName} ${payment.AgentSurname}`}
                          />
                        </TableCell>
                        <TableCell>{payment.AgencyName}</TableCell>
                        <TableCell>{payment.BatchId ?? '-'}</TableCell>
                        <TableCell>{payment.ClaimDate}</TableCell>
                        <TableCell>
                          {payment.AgentName} {payment.AgentSurname}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(payment.BondAmount)}
                        </TableCell>
                        <TableCell>{payment.CommissionType}</TableCell>
                        <TableCell>{payment.GrantDate}</TableCell>
                        <TableCell>{payment.RegistrationDate}</TableCell>
                        <TableCell>{payment.Bank}</TableCell>
                        <TableCell>
                          {formatCurrency(payment.CommissionAmount)}
                        </TableCell>
                        <TableCell>{formatCurrency(payment.VAT)}</TableCell>
                        <TableCell>{payment.Status}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openSingleUnparkModal(payment)}
                          >
                            Unpark
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </section>
        </>
      )}

      {/* Confirmation Modal */}
      <Dialog
        open={modalState !== null}
        onOpenChange={(open) => !open && closeModal()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalState?.mode === 'single'
                ? `${modalState.type === 'park' ? 'Park' : 'Unpark'} Payment?`
                : `${modalState?.type === 'park' ? 'Park' : 'Unpark'} ${modalState?.payments.length} Payments?`}
            </DialogTitle>
            <DialogDescription>
              {modalState?.mode === 'single' && modalState.payments[0] && (
                <>
                  <span className="block">
                    Agent: {modalState.payments[0].AgentName}{' '}
                    {modalState.payments[0].AgentSurname}
                  </span>
                  <span className="block">
                    Claim Date: {modalState.payments[0].ClaimDate}
                  </span>
                  <span className="block">
                    Commission:{' '}
                    {formatCurrency(modalState.payments[0].CommissionAmount)}
                  </span>
                </>
              )}
              {modalState?.mode === 'bulk' && (
                <>
                  <span className="block">
                    {modalState.payments.length} payment(s) selected
                  </span>
                  <span className="block">
                    Total amount: {formatCurrency(modalTotalCommission)}
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {mutationError && (
            <div className="p-3 border border-red-300 bg-red-50 rounded-md">
              <p className="text-red-800 text-sm">{mutationError}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeModal}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button onClick={confirmAction} disabled={isMutating}>
              {isMutating ? (
                <span role="status">Processing...</span>
              ) : (
                `Confirm ${modalState?.type === 'park' ? 'Park' : 'Unpark'}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
