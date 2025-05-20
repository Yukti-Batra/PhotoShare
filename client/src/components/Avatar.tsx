import { UserIcon } from '@heroicons/react/24/solid';

type AvatarProps = {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

export const Avatar = ({ src, alt = 'User avatar', size = 'md', className = '' }: AvatarProps) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const sizeClass = sizeClasses[size];

  return (
    <div
      className={`relative rounded-full overflow-hidden bg-primary-200 dark:bg-primary-700 flex items-center justify-center ${sizeClass} ${className}`}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <UserIcon className="w-1/2 h-1/2 text-primary-500 dark:text-primary-300" />
      )}
    </div>
  );
}; 