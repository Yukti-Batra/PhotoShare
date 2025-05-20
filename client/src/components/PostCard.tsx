import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, ChatBubbleLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Post } from '../types';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { formatRelativeTime } from '../utils/date';
import { useAuth } from '../context/AuthContext';
import { likePost, unlikePost, deletePost } from '../api/posts';

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
  onLike?: (postId: string, isLiked: boolean) => void;
}

export const PostCard = ({ post, onDelete, onLike }: PostCardProps) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post._count?.likes || 0);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLikeToggle = async () => {
    try {
      if (isLiked) {
        await unlikePost(post.id);
        setLikesCount((prev) => prev - 1);
      } else {
        await likePost(post.id);
        setLikesCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
      if (onLike) onLike(post.id, !isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        setIsDeleting(true);
        await deletePost(post.id);
        if (onDelete) onDelete(post.id);
      } catch (error) {
        console.error('Error deleting post:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const isCurrentUserPost = user?.id === post.userId;

  return (
    <div className="card mb-4">
      {/* Post header */}
      <div className="flex items-center justify-between mb-3">
        <Link to={`/profile/${post.user?.username}`} className="flex items-center">
          <Avatar src={post.user?.profileImage} alt={post.user?.username || ''} size="sm" />
          <span className="ml-2 font-medium">{post.user?.username}</span>
        </Link>
        <span className="text-sm text-primary-500 dark:text-primary-400">
          {formatRelativeTime(post.createdAt)}
        </span>
      </div>

      {/* Post image */}
      <div className="relative aspect-square mb-3 bg-primary-100 dark:bg-primary-900 rounded-md overflow-hidden">
        <img
          src={post.imageUrl}
          alt={post.caption || 'Post'}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Post actions */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex space-x-2">
          <button
            onClick={handleLikeToggle}
            className="flex items-center text-primary-700 dark:text-primary-300 hover:text-instagram-pink dark:hover:text-instagram-pink"
            aria-label={isLiked ? 'Unlike post' : 'Like post'}
          >
            {isLiked ? (
              <HeartIconSolid className="h-6 w-6 text-instagram-pink" />
            ) : (
              <HeartIcon className="h-6 w-6" />
            )}
            <span className="ml-1">{likesCount}</span>
          </button>
          <Link
            to={`/post/${post.id}`}
            className="flex items-center text-primary-700 dark:text-primary-300 hover:text-primary-900 dark:hover:text-primary-100"
          >
            <ChatBubbleLeftIcon className="h-6 w-6" />
            <span className="ml-1">{post._count?.comments || 0}</span>
          </Link>
        </div>
        {isCurrentUserPost && (
          <Button
            variant="ghost"
            size="sm"
            icon={<TrashIcon className="h-5 w-5 text-red-500" />}
            onClick={handleDelete}
            isLoading={isDeleting}
            aria-label="Delete post"
          />
        )}
      </div>

      {/* Post caption */}
      {post.caption && (
        <div className="text-primary-800 dark:text-primary-200">
          <Link to={`/profile/${post.user?.username}`} className="font-medium mr-1">
            {post.user?.username}
          </Link>
          <span>{post.caption}</span>
        </div>
      )}

      {/* View comments link */}
      <Link
        to={`/post/${post.id}`}
        className="block mt-2 text-sm text-primary-500 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
      >
        {post._count && post._count.comments > 0
          ? `View all ${post._count.comments} comments`
          : 'Add a comment...'}
      </Link>
    </div>
  );
}; 