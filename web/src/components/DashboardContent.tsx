'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getDashboard } from '@/lib/api/endpoints';
import type {
  PaymentsDashboardRead,
  PaymentStatusReportItem,
  ParkedPaymentsAgingReportItem,
} from '@/types/api-generated';
import { formatZAR } from '@/lib/utils/format-currency';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type LoadingState = 'loading' | 'error' | 'success';

/**
 * Derive the total payment amount for a given status from PaymentStatusReport.
 */
function sumByStatus(
  report: PaymentStatusReportItem[] | undefined,
  status: string,
): number {
  if (!report) return 0;
  return report
    .filter((item) => item.Status === status)
    .reduce((sum, item) => sum + (item.TotalPaymentAmount ?? 0), 0);
}

/**
 * Derive bar chart data for a given status, mapping CommissionType to short labels.
 */
function chartDataByStatus(
  report: PaymentStatusReportItem[] | undefined,
  status: string,
): { name: string; count: number }[] {
  if (!report) return [];
  return report
    .filter((item) => item.Status === status)
    .map((item) => ({
      name:
        item.CommissionType === 'Bond Registration Commission'
          ? 'Bond Comm'
          : (item.CommissionType ?? 'Unknown'),
      count: item.PaymentCount ?? 0,
    }));
}

/**
 * Derive aging report chart data.
 */
function agingChartData(
  report: ParkedPaymentsAgingReportItem[] | undefined,
): { name: string; count: number }[] {
  if (!report) return [];
  return report.map((item) => ({
    name: item.Range ?? '',
    count: item.PaymentCount ?? 0,
  }));
}

export default function DashboardContent() {
  const [data, setData] = useState<PaymentsDashboardRead | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [fetchTrigger, setFetchTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getDashboard()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoadingState('success');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadingState('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchTrigger]);

  const handleRetry = useCallback(() => {
    setLoadingState('loading');
    setData(null);
    setFetchTrigger((prev) => prev + 1);
  }, []);

  // Loading state: show skeleton placeholders
  if (loadingState === 'loading') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton data-testid="skeleton" className="h-5 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton data-testid="skeleton" className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state: show error banner with Retry
  if (loadingState === 'error') {
    return (
      <div
        role="alert"
        className="rounded-md border border-red-200 bg-red-50 p-4"
      >
        <p className="text-red-800 font-medium">
          Something went wrong while loading the dashboard data.
        </p>
        <Button variant="outline" className="mt-2" onClick={handleRetry}>
          Retry
        </Button>
      </div>
    );
  }

  // Success state: render all 6 components
  const readyTotal = sumByStatus(data?.PaymentStatusReport, 'READY');
  const parkedTotal = sumByStatus(data?.PaymentStatusReport, 'PARKED');
  const readyChartData = chartDataByStatus(data?.PaymentStatusReport, 'READY');
  const parkedChartData = chartDataByStatus(
    data?.PaymentStatusReport,
    'PARKED',
  );
  const agingData = agingChartData(data?.ParkedPaymentsAgingReport);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Total Value Ready for Payment */}
      <Card>
        <CardHeader>
          <CardTitle>Total Value Ready for Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatZAR(readyTotal)}</p>
        </CardContent>
      </Card>

      {/* Total Value of Parked Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Total Value of Parked Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatZAR(parkedTotal)}</p>
        </CardContent>
      </Card>

      {/* Payments Ready for Payment Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Payments Ready for Payment</CardTitle>
        </CardHeader>
        <CardContent>
          {readyChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={readyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 flex justify-around text-sm">
                {readyChartData.map((item, index) => (
                  <span key={`ready-${item.name}-${index}`}>
                    {item.name}: {item.count}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">No data available</p>
          )}
        </CardContent>
      </Card>

      {/* Parked Payments Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Parked Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {parkedChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={parkedChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7c3aed" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 flex justify-around text-sm">
                {parkedChartData.map((item, index) => (
                  <span key={`parked-${item.name}-${index}`}>
                    {item.name}: {item.count}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">No data available</p>
          )}
        </CardContent>
      </Card>

      {/* Parked Payments Aging Report Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Parked Payments Aging Report</CardTitle>
        </CardHeader>
        <CardContent>
          {agingData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={agingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 flex justify-around text-sm">
                {agingData.map((item, index) => (
                  <span key={`aging-${item.name}-${index}`}>
                    {item.name}: {item.count}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">No parked payments</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
