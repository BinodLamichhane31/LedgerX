import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import { getSessionsService, revokeSessionService, logoutAllService } from '../../services/authService';
import { AuthContext } from '../../auth/authProvider';

/**
 * Hook to fetch all active sessions for the current user
 */
export const useGetSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: getSessionsService,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 10000
  });
};

/**
 * Hook to revoke a specific session
 */
export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeSessionService,
    onSuccess: () => {
      // Invalidate sessions query to refetch
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  });
};

/**
 * Hook to logout from all devices
 */
export const useLogoutAll = () => {
  const queryClient = useQueryClient();
  const { logout } = useContext(AuthContext);

  return useMutation({
    mutationFn: logoutAllService,
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      // Call logout to clear local state and redirect
      logout();
    }
  });
};
