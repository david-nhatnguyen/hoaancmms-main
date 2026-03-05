import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/api/endpoints/users.api";

/**
 * Search users that can be assigned to a role.
 * Uses the /users/search endpoint with a query string.
 * Only fires when query has at least 1 character.
 */
export function useUserSearch(query: string) {
  return useQuery({
    queryKey: ["user-search", query],
    queryFn: () => usersApi.search(query),
    enabled: query.length > 0,
    staleTime: 30 * 1000,
  });
}
