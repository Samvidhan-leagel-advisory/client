import { getAdminSettings, updateAdminSettings } from '@/api-client';
import WithShimmer from '@/components/WithShimmer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/layouts/AdminLayout';
import { queryClient } from '@/lib/query-client';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const AdminSettings = () => {
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [supportAddress, setSupportAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { isLoading: isSettingsLoading } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: async () => {
      const { data } = await getAdminSettings();
      setSupportEmail(data.supportEmail);
      setSupportPhone(data.supportPhone);
      setSupportAddress(data.supportAddress);
    },
  });

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      await updateAdminSettings({
        supportEmail,
        supportPhone,
        supportAddress,
      });
      await queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
      toast({
        title: 'Settings saved successfully',
        description: 'The settings have been updated.',
      });
    } catch (error) {
      toast({
        title: 'Failed to save settings',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Platform Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Configure global platform settings.
          </p>
        </div>

        <div className="space-y-5 rounded-xl border bg-card p-6">
          <h3 className="font-semibold">General</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Support Email</Label>
              <WithShimmer
                loading={isSettingsLoading}
                className="h-10 w-full rounded-md"
              >
                <Input
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="support@nyayasetu.in"
                />
              </WithShimmer>
            </div>

            <div className="space-y-2">
              <Label>Support Phone</Label>
              <WithShimmer
                loading={isSettingsLoading}
                className="h-10 w-full rounded-md"
              >
                <div className="flex rounded-md ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                    +91
                  </span>
                  <Input
                    className="rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="9876543210"
                    maxLength={10}
                    value={supportPhone}
                    onChange={(e) =>
                      setSupportPhone(e.target.value.replace(/\D/g, ''))
                    }
                  />
                </div>
              </WithShimmer>
            </div>
            <div className="sm:col-span-2">
              <Label>Support Address</Label>
              <WithShimmer
                loading={isSettingsLoading}
                className="h-24 w-full rounded-md"
              >
                <Textarea
                  rows={3}
                  value={supportAddress}
                  onChange={(e) => setSupportAddress(e.target.value)}
                  placeholder="123 Main St, Anytown, USA"
                />
              </WithShimmer>
            </div>
          </div>
        </div>

        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
