import { getLawyerAnalytics } from '@/api-client';
import { SkeletonCard } from '@/components/SkeletonCard';
import { CaseCodeText } from '@/components/CaseCodeText';
import { StatusBadge } from '@/components/StatusBadge';
import WithShimmer from '@/components/WithShimmer';
import { path, ROUTES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { calculateYearsOfExperience } from '@/lib/helpers';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Briefcase, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const LawyerDashboard = () => {
  const { user } = useAuth();

  const {
    data: analyticsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['lawyerAnalytics'],
    queryFn: async () => {
      const response = await getLawyerAnalytics();
      return response.data;
    },
  });

  const activeCases = analyticsData?.totalActiveCases || 0;
  const totalCases = analyticsData?.totalHandledCases || 0;
  const assignedCases = analyticsData?.assignedCases || [];
  const experience = analyticsData?.lawyerExp || null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Welcome, Adv. {user?.fullName?.split?.(' ')?.[0]}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Your case assignments and tasks at a glance.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: 'Active Cases',
              value: activeCases,
              icon: Briefcase,
              color: 'text-info',
            },
            {
              label: 'Total Handled',
              value: totalCases,
              icon: CheckCircle,
              color: 'text-success',
            },
            {
              label: 'Experience',
              value: calculateYearsOfExperience(experience),
              icon: Clock,
              color: 'text-muted-foreground',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <WithShimmer loading={isLoading} className="h-4 w-20">
                  <span className="text-sm text-muted-foreground">
                    {s.label}
                  </span>
                </WithShimmer>
                <WithShimmer loading={isLoading} className="h-4 w-4">
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </WithShimmer>
              </div>
              <WithShimmer loading={isLoading} className="mt-2 h-8 w-16">
                <p className="mt-2 text-2xl font-bold">{s.value}</p>
              </WithShimmer>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="mb-4 text-lg font-semibold">Assigned Cases</h2>
            <div className="mb-4 flex items-center justify-end">
              <Link
                to={ROUTES.lawyer.cases}
                className="text-sm text-gold hover:underline"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            ) : error ? (
              <div className="rounded-xl border bg-card p-8 text-center">
                <p className="text-destructive">
                  Failed to load cases. Please try again.
                </p>
              </div>
            ) : assignedCases.length === 0 ? (
              <div className="rounded-xl border bg-card p-8 text-center">
                <p className="text-muted-foreground">No assigned cases yet.</p>
              </div>
            ) : (
              assignedCases?.map((c) => (
                <Link
                  key={c.id}
                  to={path.caseDetail(c.id)}
                  className="block rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <CaseCodeText className="text-xs text-muted-foreground">
                          {c.caseCode}
                        </CaseCodeText>
                        <StatusBadge status={c.status} />
                        {c.priority === 'urgent' && (
                          <span className="flex items-center gap-1 text-xs text-destructive">
                            <AlertTriangle className="h-3 w-3" />
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 min-w-0 break-words font-medium">
                        {c.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {c?.user?.fullName} • {c.practiceArea?.name}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LawyerDashboard;
