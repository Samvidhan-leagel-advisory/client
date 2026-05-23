import { LawyerProfileForm } from '@/components/profile/LawyerProfileForm';
import { UserProfileForm } from '@/components/profile/UserProfileForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DownloadSamvidhanCard } from '@/components/user/DownloadSamvidhanCard';
import { ROUTES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveSubscription } from '@/hooks/useActiveSubscription';
import { useProfilePage } from '@/hooks/useProfilePage';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { getCookie } from '@/lib/helpers';
import { isLawyerApprovedForPractice } from '@/lib/lawyer-access';
import { formatDateEnIn } from '@/pages/user/userSubscription.helpers';
import { Calendar, CheckCircle2, Clock, CreditCard, Info } from 'lucide-react';

const UserProfile = () => {
  const { user } = useAuth();
  const isLawyer = getCookie('x-active-role') === 'lawyer';
  const profile = useProfilePage();
  const { subscription } = useActiveSubscription();
  const lawyerApproved = isLawyer && isLawyerApprovedForPractice(user);
  const lp = user?.lawyerProfile;
  const showAdvisoryCardNotice =
    !isLawyer &&
    subscription &&
    subscription.status === 'active' &&
    !subscription.cancelledAtPeriodEnd;

  return (
    <DashboardLayout>
      <div className="w-full space-y-6">
        <h1 className="text-2xl font-bold">Profile & Settings</h1>

        {isLawyer && !lawyerApproved ? (
          <Alert className="border-gold/30 bg-gold/5">
            <Info className="h-4 w-4 text-gold" />
            <AlertTitle>Account access</AlertTitle>
            <AlertDescription>
              {lp?.isProfileCompleted !== true ? (
                <p>
                  Complete your advocate profile below. After you submit your details and documents,
                  an admin will review and verify your account before you can open cases or
                  messages.
                </p>
              ) : (
                <p>
                  Your profile is submitted. An admin is reviewing your verification. You will get
                  full access once your account is approved.
                </p>
              )}
            </AlertDescription>
          </Alert>
        ) : null}

        {isLawyer ? <LawyerProfileForm profile={profile} /> : <UserProfileForm profile={profile} />}

        {!isLawyer && (
          <>
            <div className="space-y-3 rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gold" />
                <h3 className="font-semibold">My Plan</h3>
              </div>

              {subscription ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3 rounded-md">
                    <div>
                      <p className="text-lg font-bold">{subscription.plan.name}</p>
                      <p className="text-sm capitalize text-muted-foreground">
                        Billed {subscription.plan.billingCycle}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="flex items-center justify-end gap-1 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        {subscription.cancelledAtPeriodEnd ? (
                          <span>Access until {formatDateEnIn(subscription.currentPeriodEnd)}</span>
                        ) : (
                          <span>Renews {formatDateEnIn(subscription.currentPeriodEnd)}</span>
                        )}
                      </div>
                      <div
                        className={
                          subscription.cancelledAtPeriodEnd
                            ? 'mt-0.5 flex items-center justify-end gap-1 text-xs text-muted-foreground'
                            : 'mt-0.5 flex items-center justify-end gap-1 text-xs text-green-600'
                        }
                      >
                        {subscription.cancelledAtPeriodEnd ? (
                          <>
                            <Clock className="h-3 w-3" />
                            Cancels at period end
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" asChild>
                    <a href={ROUTES.user.subscription}>Manage Subscription</a>
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    You do not have an active subscription. Choose a plan to get full access.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={ROUTES.user.subscription}>View plans</a>
                  </Button>
                </>
              )}
            </div>

            {showAdvisoryCardNotice && subscription ? (
              <DownloadSamvidhanCard subscriptionPlan={subscription} />
            ) : null}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;
