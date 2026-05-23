import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import WithShimmer from '@/components/WithShimmer';
import { ROUTES } from '@/constants';
import { useCategories } from '@/hooks/useCategories';
import { LAWYER_BIO_MAX_LENGTH } from '@/lib/mock-data';
import type { ProfilePageController } from '@/hooks/useProfilePage';
import { Camera, FileText, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Textarea } from '../ui/textarea';

interface LawyerProfileFormProps {
  profile: ProfilePageController;
}

export function LawyerProfileForm({ profile }: LawyerProfileFormProps) {
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
    toggleSpecialization,
    updateProfileMutation,
    updateLawyerMutation,
  } = profile;

  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories(true);

  const saving =
    updateProfileMutation.isPending || updateLawyerMutation.isPending;

  return (
    <div className="space-y-5 rounded-xl border bg-card p-6">
      <div className="flex items-center gap-4">
        <WithShimmer
          loading={isLoading || isUploading}
          className="h-16 w-16 rounded-full"
        >
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
            <p className="text-lg font-semibold">
              {currentUser?.fullName || user?.fullName}
            </p>
          </WithShimmer>
          <WithShimmer loading={isLoading} className="mt-1 h-4 w-48">
            <p className="text-sm text-muted-foreground">
              {currentUser?.email || user?.email}
            </p>
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
                onChange={(e) =>
                  patchForm({ phone: e.target.value.replace(/\D/g, '') })
                }
              />
            </div>
          </WithShimmer>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-dashed border-muted-foreground/25 bg-muted/20 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium">Professional documents</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Upload certificates, ID proofs, and other files for admin
            verification from your documents page.
          </p>
        </div>
        <Button
          asChild
          variant="secondary"
          className="mt-3 shrink-0 sm:mt-0"
          type="button"
        >
          <Link to={ROUTES.lawyer.documents}>
            <FileText className="mr-2 h-4 w-4" />
            Manage documents
          </Link>
        </Button>
      </div>

      <div className="mt-3 border-t pt-5">
        <h3 className="mb-4 font-semibold">Professional Details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Degree / Qualification</Label>
            <WithShimmer loading={isLoading} className="h-10 w-full">
              <Input
                value={form.degree}
                onChange={(e) => patchForm({ degree: e.target.value })}
                placeholder="Enter degree / qualification"
              />
            </WithShimmer>
          </div>
          <div className="space-y-2">
            <Label>Career Started From</Label>
            <WithShimmer loading={isLoading} className="h-10 w-full">
              <Input
                type="date"
                value={form.careerStartDate}
                onChange={(e) => patchForm({ careerStartDate: e.target.value })}
              />
            </WithShimmer>
          </div>
          <div className="space-y-2">
            <Label>Bar Council ID</Label>
            <WithShimmer loading={isLoading} className="h-10 w-full">
              <Input
                value={form.barCouncilId}
                onChange={(e) => patchForm({ barCouncilId: e.target.value })}
                placeholder="Enter Bar Council ID"
              />
            </WithShimmer>
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <WithShimmer loading={isLoading} className="h-10 w-full">
              <Select
                value={form.gender}
                onValueChange={(v) => patchForm({ gender: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </WithShimmer>
          </div>
          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <WithShimmer loading={isLoading} className="h-10 w-full">
              <Input
                type="date"
                value={form.dob}
                onChange={(e) => patchForm({ dob: e.target.value })}
              />
            </WithShimmer>
          </div>
          <div className="space-y-2">
            <Label>Specializations</Label>
            <div className="flex flex-wrap gap-1.5 rounded-lg border p-2.5">
              {categoriesLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <WithShimmer
                      key={i}
                      loading
                      className="h-7 w-20 rounded-full"
                    />
                  ))
                : categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleSpecialization(cat.id)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        form.selectedSpecializations.includes(cat.id)
                          ? 'bg-gold text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 border-t pt-5">
        <div className="mb-4 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gold" />
          <h3 className="font-semibold">Address Details</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Address Line 1</Label>
            <WithShimmer loading={isLoading} className="h-10 w-full">
              <Input
                value={form.addressLine1}
                onChange={(e) => patchForm({ addressLine1: e.target.value })}
                placeholder="Street address, building name"
              />
            </WithShimmer>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Address Line 2</Label>
            <WithShimmer loading={isLoading} className="h-10 w-full">
              <Input
                value={form.addressLine2}
                onChange={(e) => patchForm({ addressLine2: e.target.value })}
                placeholder="Apartment, suite, floor (optional)"
              />
            </WithShimmer>
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <WithShimmer loading={isLoading} className="h-10 w-full">
              <Input
                value={form.city}
                onChange={(e) => patchForm({ city: e.target.value })}
                placeholder="Enter city"
              />
            </WithShimmer>
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <WithShimmer loading={isLoading} className="h-10 w-full">
              <Input
                value={form.state}
                onChange={(e) => patchForm({ state: e.target.value })}
                placeholder="Enter state"
              />
            </WithShimmer>
          </div>
          <div className="space-y-2">
            <Label>Pincode</Label>
            <WithShimmer loading={isLoading} className="h-10 w-full">
              <Input
                value={form.pincode}
                onChange={(e) => patchForm({ pincode: e.target.value })}
                placeholder="Enter pincode"
                maxLength={6}
              />
            </WithShimmer>
          </div>
        </div>
      </div>

      <div className="mt-3 border-t pt-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <Label>Bio</Label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {(form.bio ?? '').length}/{LAWYER_BIO_MAX_LENGTH}
            </span>
          </div>
          <WithShimmer loading={isLoading} className="h-10 w-full">
            <Textarea
              rows={6}
              value={form.bio}
              maxLength={LAWYER_BIO_MAX_LENGTH}
              onChange={(e) => patchForm({ bio: e.target.value })}
              placeholder="Tell us about yourself"
            />
          </WithShimmer>
          <p className="text-xs text-muted-foreground">
            Maximum {LAWYER_BIO_MAX_LENGTH} characters.
          </p>
        </div>
      </div>

      {!isLoading && (
        <WithShimmer loading={isLoading} className="h-10 w-32">
          <Button
            type="button"
            onClick={() => handleSaveChanges(true)}
            disabled={saving || isUploading || !hasChanges(true)}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </WithShimmer>
      )}
    </div>
  );
}
