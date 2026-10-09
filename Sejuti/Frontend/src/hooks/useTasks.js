import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/api';

export const useTasks = () => {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks,
    refetchInterval: 30000 // auto-recompute every 30s for live deadline decay
  });

  const createTaskMutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, data }) => taskService.updateProgress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => taskService.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });

  return {
    tasks: tasksQuery.data?.tasks || [],
    totalCount: tasksQuery.data?.count || 0,
    criticalCount: tasksQuery.data?.criticalCount || 0,
    warningCount: tasksQuery.data?.warningCount || 0,
    totalRemainingHours: tasksQuery.data?.totalRemainingHours || 0,
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    refetch: tasksQuery.refetch,
    createTask: createTaskMutation.mutateAsync,
    isCreating: createTaskMutation.isPending,
    updateProgress: updateProgressMutation.mutateAsync,
    isUpdatingProgress: updateProgressMutation.isPending,
    updateTask: updateTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync
  };
};
