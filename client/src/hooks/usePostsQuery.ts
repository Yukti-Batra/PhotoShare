import { useInfiniteQuery } from "@tanstack/react-query";
import { getFeedPosts } from "../api/posts";
import { Post } from "../types";

export const usePostsQuery = () => {
  return useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam = 1 }) => getFeedPosts(pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

export const getFlattedPosts = (
  data:
    | {
        pages: {
          data: Post[];
          currentPage: number;
          totalPages: number;
          totalCount: number;
        }[];
      }
    | undefined
): Post[] => {
  if (!data) return [];
  return data.pages.flatMap((page) => page.data);
};
