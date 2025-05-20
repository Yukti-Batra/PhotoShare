import { useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { useInView } from 'react-intersection-observer';
import { PostCard } from '../components/PostCard';
import { Button } from '../components/Button';
import { usePostsQuery, getFlattedPosts } from '../hooks/usePostsQuery';
import { useAuth } from '../context/AuthContext';

export const HomePage = () => {
  const { user } = useAuth();
  const { ref, inView } = useInView();
  const alreadyLoadedMore = useRef(false);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = usePostsQuery();

  const posts = getFlattedPosts(data);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
      alreadyLoadedMore.current = true;
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (inView && !alreadyLoadedMore.current) {
      loadMore();
    } else if (!inView) {
      alreadyLoadedMore.current = false;
    }
  }, [inView, loadMore]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-instagram-blue"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:py-12">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-primary-800 dark:text-primary-200">
            Something went wrong
          </h2>
          <p className="mt-2 text-primary-600 dark:text-primary-400">
            Failed to load posts. Please try again.
          </p>
          <Button
            onClick={() => refetch()}
            className="mt-4"
            variant="secondary"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:py-12">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-primary-800 dark:text-primary-200">
            No posts yet
          </h2>
          <p className="mt-2 text-primary-600 dark:text-primary-400">
            Follow users or create your first post to see content here.
          </p>
          <Link to="/create-post">
            <Button
              className="mt-4"
              icon={<PlusCircleIcon className="h-5 w-5" />}
            >
              Create Post
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:py-12">
      <div className="grid gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {hasNextPage && (
        <div ref={ref} className="flex justify-center mt-8">
          {isFetchingNextPage ? (
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-instagram-blue"></div>
          ) : (
            <Button variant="secondary" onClick={loadMore}>
              Load More
            </Button>
          )}
        </div>
      )}

      {!hasNextPage && posts.length > 0 && (
        <div className="text-center mt-8 text-primary-600 dark:text-primary-400">
          You've reached the end!
        </div>
      )}
    </div>
  );
}; 