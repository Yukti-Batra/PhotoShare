import { useState, FormEvent, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HeartIcon, ChatBubbleLeftIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { getPost, likePost, unlikePost, deletePost, addComment, getComments, deleteComment } from '../api/posts';
import { useAuth } from '../context/AuthContext';
import { formatRelativeTime } from '../utils/date';

export const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [comment, setComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Get post details
  const {
    data: post,
    isLoading: postLoading,
    error: postError,
  } = useQuery({
    queryKey: ['post', id],
    queryFn: () => getPost(id!),
    enabled: !!id,
  });

  // Get comments
  const {
    data: commentsData,
    isLoading: commentsLoading,
    error: commentsError,
  } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => getComments(id!),
    enabled: !!id,
  });

  // Toggle like mutation
  const likeMutation = useMutation({
    mutationFn: () => (post?.isLiked ? unlikePost(id!) : likePost(id!)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: () => deletePost(id!),
    onSuccess: () => {
      navigate('/', { replace: true });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(id!, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
    },
  });

  // Handle like toggle
  const handleLikeToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    likeMutation.mutate();
  };

  // Handle post delete
  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate();
    }
  };

  // Handle comment submit
  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;

    setIsSubmittingComment(true);
    try {
      await addComment(id!, comment);
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle comment delete
  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  if (postLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-instagram-blue"></div>
        </div>
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:py-12">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-primary-800 dark:text-primary-200">
            Post not found
          </h2>
          <p className="mt-2 text-primary-600 dark:text-primary-400">
            The post you're looking for doesn't exist or is unavailable.
          </p>
          <Link to="/">
            <Button className="mt-4" variant="secondary">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isCurrentUserPost = user?.id === post.userId;
  const comments = commentsData?.data || [];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:py-12">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        icon={<ArrowLeftIcon className="h-5 w-5" />}
        onClick={() => navigate(-1)}
      >
        Back
      </Button>

      <div className="card">
        <div className="md:flex">
          {/* Post Image */}
          <div className="md:w-1/2 relative aspect-square bg-primary-100 dark:bg-primary-900 rounded-md overflow-hidden">
            <img
              src={post.imageUrl}
              alt={post.caption || 'Post'}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Post Details */}
          <div className="md:w-1/2 md:pl-6 mt-4 md:mt-0 flex flex-col">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-4">
              <Link to={`/profile/${post.user?.username}`} className="flex items-center">
                <Avatar src={post.user?.profileImage} alt={post.user?.username || ''} size="sm" />
                <span className="ml-2 font-medium">{post.user?.username}</span>
              </Link>
              <span className="text-sm text-primary-500 dark:text-primary-400">
                {formatRelativeTime(post.createdAt)}
              </span>
            </div>

            {/* Post Caption */}
            {post.caption && (
              <div className="mb-6 text-primary-800 dark:text-primary-200">
                <Link to={`/profile/${post.user?.username}`} className="font-medium mr-1">
                  {post.user?.username}
                </Link>
                <span>{post.caption}</span>
              </div>
            )}

            {/* Post Actions */}
            <div className="flex items-center mb-4">
              <button
                onClick={handleLikeToggle}
                className="flex items-center text-primary-700 dark:text-primary-300 hover:text-instagram-pink dark:hover:text-instagram-pink mr-4"
                aria-label={post.isLiked ? 'Unlike post' : 'Like post'}
              >
                {post.isLiked ? (
                  <HeartIconSolid className="h-6 w-6 text-instagram-pink" />
                ) : (
                  <HeartIcon className="h-6 w-6" />
                )}
                <span className="ml-1">{post._count?.likes || 0}</span>
              </button>

              <div className="flex items-center text-primary-700 dark:text-primary-300 mr-4">
                <ChatBubbleLeftIcon className="h-6 w-6" />
                <span className="ml-1">{post._count?.comments || 0}</span>
              </div>

              {isCurrentUserPost && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<TrashIcon className="h-5 w-5 text-red-500" />}
                  onClick={handleDeletePost}
                  isLoading={deleteMutation.isPending}
                  aria-label="Delete post"
                />
              )}
            </div>

            {/* Comments Section */}
            <div className="flex-grow overflow-auto">
              <h3 className="font-medium text-primary-900 dark:text-primary-100 mb-2">
                Comments
              </h3>

              {commentsLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-instagram-blue"></div>
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-hidden text-wrap">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start">
                      <Link to={`/profile/${comment.user?.username}`} className="flex-shrink-0">
                        <Avatar
                          src={comment.user?.profileImage}
                          alt={comment.user?.username || ''}
                          size="xs"
                        />
                      </Link>
                      <div className="ml-2 flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link to={`/profile/${comment.user?.username}`} className="font-medium text-sm mr-1">
                              {comment.user?.username}
                            </Link>
                            <span className="text-sm text-primary-800 dark:text-primary-200">
                              {comment.content}
                            </span>
                          </div>
                          {(user?.id === comment.userId || isCurrentUserPost) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 -mt-1 -mr-1"
                              onClick={() => handleDeleteComment(comment.id)}
                              isLoading={deleteCommentMutation.isPending}
                              aria-label="Delete comment"
                            >
                              <TrashIcon className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                        <div className="text-xs text-primary-500 dark:text-primary-400 mt-1">
                          {formatRelativeTime(comment.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-primary-500 dark:text-primary-400 text-sm py-2">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>

            {/* Add Comment */}
            {user ? (
              <form onSubmit={handleCommentSubmit} className="mt-4 flex items-start">
                <Avatar src={user.profileImage} alt={user.username} size="xs" className="flex-shrink-0 mt-1" />
                <div className="ml-2 flex-grow">
                  <textarea
                    className="form-input text-sm p-2 w-full"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={1}
                    required
                  ></textarea>
                  <Button
                    type="submit"
                    size="sm"
                    className="mt-2"
                    isLoading={isSubmittingComment}
                    disabled={!comment.trim() || isSubmittingComment}
                  >
                    Post
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mt-4 text-center">
                <Link to="/login" className="text-instagram-blue hover:text-instagram-purple">
                  Log in to comment
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 