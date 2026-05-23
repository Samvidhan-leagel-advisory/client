import { getLawyersList } from '@/api-client';
import { PaginationControls } from '@/components/PaginationControls';
import PaywallModal from '@/components/PaywallModal';
import WithShimmer from '@/components/WithShimmer';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useActiveSubscription } from '@/hooks/useActiveSubscription';
import { useIsTruncated } from '@/hooks/useIsTruncated';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { calculateYearsOfExperience } from '@/lib/helpers';
import { useQuery } from '@tanstack/react-query';
import { Award, Briefcase, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const LawyerBio = ({ bio }: { bio?: string }) => {
  const { ref, isTruncated } = useIsTruncated<HTMLParagraphElement>();

  if (!bio) return null;

  const bioElement = (
    <p ref={ref} className="mt-2 line-clamp-2 text-xs text-muted-foreground">
      {bio}
    </p>
  );

  if (!isTruncated) return bioElement;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{bioElement}</TooltipTrigger>
        <TooltipContent className="max-w-xs whitespace-pre-wrap bg-black text-xs text-white">
          {bio}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const LawyersDirectory = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(30);
  const [orderBy] = useState('createdAt');
  const [order] = useState('ASC');
  const { isActive, isLoading: subscriptionLoading } = useActiveSubscription();

  const subscriptionGateResolved = !subscriptionLoading;
  const hasDirectoryAccess = subscriptionGateResolved && isActive;
  const paywallOpen = subscriptionGateResolved && !isActive;

  const {
    data: lawyersData,
    isLoading: lawyersLoading,
    error,
  } = useQuery({
    queryKey: ['lawyersList', page, limit, orderBy, order],
    queryFn: async () => {
      const response = !hasDirectoryAccess
        ? { data: [], pagination: { total: 0, totalPages: 0 } }
        : await getLawyersList({
            page,
            limit,
            orderBy,
            order,
          });
      return response.data;
    },
    enabled: hasDirectoryAccess,
  });

  const lawyers = lawyersData?.data || [];
  const totalPages = Math.ceil((lawyersData?.pagination?.total || 0) / limit);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-w-0 space-y-6">
        <div className="min-w-0">
          <h1 className="text-xl font-bold sm:text-2xl">Our Lawyers</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Browse verified lawyers available on the platform.
          </p>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subscriptionLoading || (hasDirectoryAccess && lawyersLoading) ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-5">
                <div className="flex items-start gap-3">
                  <WithShimmer
                    loading
                    className="h-12 w-12 shrink-0 rounded-full"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <WithShimmer loading className="h-5 w-3/4" />
                    <WithShimmer loading className="h-4 w-1/2" />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <WithShimmer loading className="h-5 w-16 rounded-full" />
                  <WithShimmer loading className="h-5 w-20 rounded-full" />
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <WithShimmer loading className="h-4 w-20" />
                  <WithShimmer loading className="h-4 w-14" />
                </div>
                <div className="mt-2 space-y-1">
                  <WithShimmer loading className="h-3 w-full" />
                  <WithShimmer loading className="h-3 w-4/5" />
                </div>
              </div>
            ))
          ) : !hasDirectoryAccess ? null : error ? (
            <div className="col-span-full rounded-xl border bg-card p-8 text-center">
              <p className="text-destructive">
                Failed to load lawyers. Please try again.
              </p>
            </div>
          ) : lawyers.length === 0 ? (
            <div className="col-span-full rounded-xl border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                No lawyers are currently available.
              </p>
            </div>
          ) : (
            lawyers.map((l) => (
              <div
                key={l.id}
                className="min-w-0 overflow-hidden rounded-xl border bg-card p-4 sm:p-5"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/20 font-bold text-gold">
                    {l.user?.avatarUrl ? (
                      <img
                        src={l.user?.avatarUrl}
                        alt={l.user?.fullName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/20 font-bold text-gold">
                        {l.user?.fullName?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-start gap-1.5">
                      <p className="min-w-0 break-words text-sm font-medium leading-snug">
                        Adv. {l.user?.fullName || 'Unknown Lawyer'}
                      </p>
                      {l.barCouncilId && (
                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 break-words text-xs leading-snug text-muted-foreground">
                      {l.degree || 'Degree not specified'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {l.lawyerPracticeAreas.length > 0 ? (
                    l.lawyerPracticeAreas.map((area) => (
                      <span
                        key={area.id}
                        className="inline-block max-w-full break-words rounded-full bg-gold/10 px-2 py-0.5 text-left text-[11px] font-medium leading-snug text-gold"
                      >
                        {area.practiceArea?.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs italic text-muted-foreground">
                      No specialization has been added
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex min-w-0 items-center gap-1">
                    <Briefcase className="h-3 w-3 shrink-0" />
                    <span className="break-words">
                      {calculateYearsOfExperience(l.careerStartDate)}
                    </span>
                  </span>
                  {l.gender && (
                    <span className="flex items-center gap-1">
                      <Award className="h-3 w-3 shrink-0" />
                      {l.gender}
                    </span>
                  )}
                </div>
                <LawyerBio bio={l.bio} />
              </div>
            ))
          )}
        </div>

        {hasDirectoryAccess && !lawyersLoading && !error && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            total={lawyersData?.pagination?.total}
            pageSize={limit}
            onNext={handleNextPage}
            onPrev={handlePrevPage}
          />
        )}

        <PaywallModal
          open={paywallOpen}
          onOpenChange={() => {}}
          showCloseButton={false}
          title="Lawyer directory is for subscribers"
          description="Activate a plan to browse verified advocates, credentials, and practice areas on the platform."
          perks={[
            'See full profiles, experience, and specializations',
            'Bar verification and bios in one place',
            'Included with every paid subscription',
          ]}
        />
      </div>
    </DashboardLayout>
  );
};

export default LawyersDirectory;
