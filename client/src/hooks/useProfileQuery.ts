import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../api/users";
import { UserProfile } from "../types";

export const useProfileQuery = (username: string) => {
  return useQuery<UserProfile>({
    queryKey: ["profile", username],
    queryFn: () => getUserProfile(username),
    enabled: !!username,
  });
};
 