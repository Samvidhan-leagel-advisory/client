import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import WithShimmer from '@/components/WithShimmer';
import type { ProfilePageController } from '@/hooks/useProfilePage';
import { Camera } from 'lucide-react';

interface UserProfileFormProps {
  profile: ProfilePageController;
}

export function UserProfileForm({ profile }: UserProfileFormProps) {
  const {
    user,
    currentUser,
    isLoading,
    form,
    patchForm,
    fileRef,
    isUploading,
    handleAvatarChange,
    handleSaveChanges,
    hasChanges,
    updateProfileMutation,
    updateLawyerMutation,
  } = profile;

  const saving = updateProfileMutation.isPending || updateLawyerMutation.isPending;

  return (
    <div className="space-y-5 rounded-xl border bg-card p-6">
      <div className="flex items-center gap-4">
        <WithShimmer loading={isLoading || isUploading} className="h-16 w-16 rounded-full">
          <div className="group relative">
            {form.avatarUrl || currentUser?.avatarUrl ? (
              <img
                src={form.avatarUrl || currentUser?.avatarUrl || ''}
                alt="Profile"
                referrerPolicy="no-referrer"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-xl font-bold text-primary-foreground">
                {currentUser?.fullName?.charAt(0) || user?.fullName?.charAt(0)}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={isUploading}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/50 opacity-0 transition-opacity disabled:cursor-not-allowed group-hover:opacity-100"
            >
              <Camera className="h-5 w-5 text-white" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={isUploading}
            />
          </div>
        </WithShimmer>
        <div>
          <WithShimmer loading={isLoading} className="h-6 w-32">
            <p className="text-lg font-semibold">{currentUser?.fullName || user?.fullName}</p>
          </WithShimmer>
          <WithShimmer loading={isLoading} className="mt-1 h-4 w-48">
            <p className="text-sm text-muted-foreground">{currentUser?.email || user?.email}</p>
          </WithShimmer>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <WithShimmer loading={isLoading} className="h-10 w-full">
            <Input
              value={form.fullName}
              onChange={(e) => patchForm({ fullName: e.target.value })}
              placeholder="Enter your full name"
            />
          </WithShimmer>
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <WithShimmer loading={isLoading} className="h-10 w-full">
            <Input value={currentUser?.email || user?.email} disabled />
          </WithShimmer>
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <WithShimmer loading={isLoading} className="h-10 w-full">
            <div className="flex rounded-md ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                +91
              </span>
              <Input
                className="rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="9876543210"
                maxLength={10}
                value={form.phone}
                onChange={(e) => patchForm({ phone: e.target.value.replace(/\D/g, '') })}
              />
            </div>
          </WithShimmer>
        </div>
      </div>

      {!isLoading && (
        <WithShimmer loading={isLoading} className="h-10 w-32">
          <Button
            type="button"
            onClick={() => handleSaveChanges(false)}
            disabled={saving || isUploading || !hasChanges(false)}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </WithShimmer>
      )}
    </div>
  );
}
