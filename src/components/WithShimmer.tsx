import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface WithShimmerProps {
  loading: boolean;
  height?: string;
  width?: string;
  borderRadius?: string;
  className?: string;
  children?: React.ReactNode;
}

const WithShimmer = ({
  loading,
  height,
  width,
  borderRadius,
  className,
  children,
}: WithShimmerProps) => {
  if (loading) {
    return (
      <Skeleton
        className={cn(className)}
        style={{ height, width, borderRadius }}
      />
    );
  }
  return <>{children}</>;
};

export default WithShimmer;
