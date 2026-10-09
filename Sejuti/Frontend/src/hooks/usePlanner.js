import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plannerService } from '../services/api';

export const usePlanner = () => {
  const queryClient = useQueryClient();

  const scheduleQuery = useQuery({
    queryKey: ['schedule'],
    queryFn: plannerService.getSchedule
  });

  const rebalanceMutation = useMutation({
    mutationFn: (data) => plannerService.rebalance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });

  return {
    schedule: scheduleQuery.data?.schedule || null,
    blocks: scheduleQuery.data?.schedule?.blocks || [],
    deficitHours: scheduleQuery.data?.schedule?.deficitHours || 0,
    bottleneckDetected: scheduleQuery.data?.schedule?.bottleneckDetected || false,
    totalScheduledHours: scheduleQuery.data?.schedule?.totalScheduledHours || 0,
    isLoading: scheduleQuery.isLoading,
    isError: scheduleQuery.isError,
    refetch: scheduleQuery.refetch,
    rebalance: rebalanceMutation.mutateAsync,
    isRebalancing: rebalanceMutation.isPending
  };
};
