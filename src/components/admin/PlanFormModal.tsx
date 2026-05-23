import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  usePlanFormModal,
  type AdminPlanFormSavePayload,
} from '@/hooks/usePlanFormModal';
import type { SubscriptionPlan } from '@/types';
import { Plus, X } from 'lucide-react';

const SUGGESTED_FEATURES = [
  'Unlimited legal queries',
  'Standard response time (48 hrs)',
  'Priority response (24 hrs)',
  'Document review (up to 5/month)',
  'Unlimited document review',
  'Email support',
  'Phone consultation (2/month)',
];

interface PlanFormModalProps {
  open: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  onSave: (data: AdminPlanFormSavePayload) => void;
  isSaving?: boolean;
}

export const PlanFormModal = ({
  open,
  onClose,
  plan,
  onSave,
  isSaving,
}: PlanFormModalProps) => {
  const {
    name,
    setName,
    selectedFeatures,
    customFeature,
    setCustomFeature,
    toggleFeature,
    addCustomFeature,
    removeFeature,
    buildSavePayload,
  } = usePlanFormModal(plan, open);

  const handleSave = () => {
    const payload = buildSavePayload();
    if (!payload) return;
    onSave(payload);
  };

  const availableSuggestions = SUGGESTED_FEATURES.filter(
    (f) => !selectedFeatures.includes(f)
  );

  if (!plan) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit plan</DialogTitle>
          <DialogDescription>
            You can update the display name and feature list only. Pricing and
            billing stay tied to Razorpay and database configuration.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Plan name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Professional"
            />
          </div>

          <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Read-only</p>
            <p className="mt-1">
              ₹{plan.price.toLocaleString('en-IN')} / {plan.period}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Selected features ({selectedFeatures.length})</Label>
            {selectedFeatures.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {selectedFeatures.map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    {f}
                    <button
                      type="button"
                      onClick={() => removeFeature(f)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No features yet. Pick from suggestions or add custom lines.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Add custom feature</Label>
            <div className="flex gap-2">
              <Input
                value={customFeature}
                onChange={(e) => setCustomFeature(e.target.value)}
                placeholder="Type a custom feature…"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomFeature();
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addCustomFeature}
                disabled={!customFeature.trim()}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {availableSuggestions.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Suggested (click to add)
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {availableSuggestions.map((f, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleFeature(f)}
                    className="rounded-full border border-dashed px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    + {f}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
