import * as React from 'react';
import { toast as notify, type Id } from 'react-toastify';

import { AppToastContent } from '@/components/ui/app-toast-content';

/** Kept for compatibility with previous Radix toast typings. */
export type ToastActionElement = React.ReactElement<unknown>;

export type ToastProps = {
  variant?: 'default' | 'destructive';
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type ToastInput = Omit<ToastProps, 'open' | 'onOpenChange'>;

function toast({ variant = 'default', ...props }: ToastInput) {
  const isDestructive = variant === 'destructive';
  const id = notify(
    <AppToastContent title={props.title} description={props.description} action={props.action} />,
    {
      type: isDestructive ? 'error' : 'success',
      isLoading: false,
      hideProgressBar: true,
    },
  );

  return {
    id: String(id),
    dismiss: () => notify.dismiss(id),
    update: () => undefined,
  };
}

function useToast() {
  return {
    toasts: [] as const,
    toast,
    dismiss: (toastId?: Id) => {
      if (toastId === undefined) notify.dismiss();
      else notify.dismiss(toastId);
    },
  };
}

export { toast, useToast };
