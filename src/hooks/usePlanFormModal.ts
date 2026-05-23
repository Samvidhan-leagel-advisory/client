import type { SubscriptionPlan } from '@/types';
import { useCallback, useEffect, useState } from 'react';

export type AdminPlanFormSavePayload = {
  name: string;
  features: string[];
  featuresRaw: string;
};

export function usePlanFormModal(plan: SubscriptionPlan | null, open: boolean) {
  const [name, setName] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customFeature, setCustomFeature] = useState('');

  useEffect(() => {
    if (open && plan) {
      setName(plan.name);
      setSelectedFeatures([...plan.features]);
    }
    if (!open) {
      setName('');
      setSelectedFeatures([]);
    }
    setCustomFeature('');
  }, [plan, open]);

  const toggleFeature = useCallback((feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  }, []);

  const addCustomFeature = useCallback(() => {
    setCustomFeature((current) => {
      const trimmed = current.trim();
      if (!trimmed) return current;
      setSelectedFeatures((prev) =>
        prev.includes(trimmed) ? prev : [...prev, trimmed]
      );
      return '';
    });
  }, []);

  const removeFeature = useCallback((feature: string) => {
    setSelectedFeatures((prev) => prev.filter((f) => f !== feature));
  }, []);

  const buildSavePayload = useCallback((): AdminPlanFormSavePayload | null => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    return {
      name: trimmed,
      features: selectedFeatures,
      featuresRaw: selectedFeatures.join(';'),
    };
  }, [name, selectedFeatures]);

  return {
    name,
    setName,
    selectedFeatures,
    customFeature,
    setCustomFeature,
    toggleFeature,
    addCustomFeature,
    removeFeature,
    buildSavePayload,
  };
}
