import { LawyerProfileForm } from '@/components/profile/LawyerProfileForm';
import { UserProfileForm } from '@/components/profile/UserProfileForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ActiveSubscriptionCard } from '@/components/user/ActiveSubscriptionCard';
import { DownloadSamvidhanCard } from '@/components/user/DownloadSamvidhanCard';
import { ROUTES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveSubscription } from '@/hooks/useActiveSubscription';
import { useProfilePage } from '@/hooks/useProfilePage';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { getCookie } from '@/lib/helpers';
import { isLawyerApprovedForPractice } from '@/lib/lawyer-access';
import { Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const { user } = useAuth();
  const isLawyer = getCookie('x-active-role') === 'lawyer';
  const profile = useProfilePage();
  const { subscription, isLoading: isSubscriptionLoading } =
    useActiveSubscription();
  const lawyerApproved = isLawyer && isLawyerApprovedForPractice(user);
  const lp = user?.lawyerProfile;
  // Cancel-at-period-end still grants access until endDate, so we only require
  // that the hook returned a subscription (it only returns currently entitled
  // subscriptions).
  const showAdvisoryCardNotice = !isLawyer && !!subscription;

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
                  Complete your advocate profile below. After you submit your
                  details and documents, an admin will review and verify your
                  account before you can open cases or messages.
                </p>
              ) : (
                <p>
                  Your profile is submitted. An admin is reviewing your
                  verification. You will get full access once your account is
                  approved.
                </p>
              )}
            </AlertDescription>
          </Alert>
        ) : null}

        {isLawyer ? (
          <LawyerProfileForm profile={profile} />
        ) : (
          <UserProfileForm profile={profile} />
        )}

        {!isLawyer && (
          <>
            <ActiveSubscriptionCard
              subscription={subscription}
              isLoading={isSubscriptionLoading}
              action={
                !isSubscriptionLoading ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    asChild
                    className="h-7 px-2 text-xs font-medium"
                  >
                    <Link to={ROUTES.user.subscription}>
                      {subscription ? 'Manage' : 'View plans'}
                    </Link>
                  </Button>
                ) : null
              }
            />

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
