import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReportModerationItem, ReportStatus } from '../model/entities/Report';
import { toSecurityError } from '../model/entities/SecurityError.ts';
import type { SecurityRepository } from '../model/repositories/SecurityRepository';
import { securityErrorMessage } from '../model/services/securityFormat.ts';
import { useAsyncAction } from './useAsyncAction.ts';

export type ModerationFilter = 'pending' | 'resolved' | 'all';
export type ModerationStatus = 'loading' | 'ready' | 'error' | 'unauthorized';

export function useModerationReportsViewModel(repository: SecurityRepository) {
  const [reports, setReports] = useState<ReportModerationItem[]>([]);
  const [status, setStatus] = useState<ModerationStatus>('loading');
  const [filter, setFilter] = useState<ModerationFilter>('pending');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<ReportModerationItem | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [resolving, run] = useAsyncAction();

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setLoadError(null);

    repository
      .listModerationReports()
      .then((items) => {
        if (!active) return;
        setReports(items);
        setStatus('ready');
      })
      .catch((failure) => {
        if (!active) return;
        const secErr = toSecurityError(failure);
        if (secErr.code === 'unauthorized') {
          setStatus('unauthorized');
          setLoadError(securityErrorMessage('unauthorized'));
        } else {
          setStatus('error');
          setLoadError(securityErrorMessage(secErr.code));
        }
      });

    return () => {
      active = false;
    };
  }, [repository, attempt]);

  const counts = useMemo(() => {
    let pending = 0;
    let resolved = 0;
    reports.forEach((r) => {
      if (r.status === 'resolved') resolved += 1;
      else pending += 1;
    });
    return { pending, resolved, total: reports.length };
  }, [reports]);

  const visibleReports = useMemo(() => {
    if (filter === 'all') return reports;
    return reports.filter((r) => r.status === filter);
  }, [reports, filter]);

  const confirmResolve = useCallback(() => {
    return run(async () => {
      if (!confirming) return;
      setError(null);
      try {
        await repository.resolveReport(confirming.id);
        setReports((current) =>
          current.map((r) =>
            r.id === confirming.id ? { ...r, status: 'resolved' as ReportStatus } : r,
          ),
        );
        setConfirming(null);
      } catch (failure) {
        setConfirming(null);
        setError(securityErrorMessage(toSecurityError(failure).code));
      }
    });
  }, [run, confirming, repository]);

  return {
    status,
    filter,
    setFilter,
    reports: visibleReports,
    counts,
    empty: status === 'ready' && visibleReports.length === 0,
    totalEmpty: status === 'ready' && reports.length === 0,
    loadError,
    error,
    retry: () => setAttempt((n) => n + 1),
    confirming,
    askResolve: (report: ReportModerationItem) => {
      setError(null);
      setConfirming(report);
    },
    cancelResolve: () => setConfirming(null),
    confirmResolve,
    resolving,
  };
}
