import type { Author } from '../../types/contracts';

interface AvatarProps {
  author: Pick<Author, 'name' | 'initials' | 'avatarUrl'>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  ringClass?: string;
}

const sizes: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-24 w-24 text-xl',
};

export function Avatar({ author, size = 'md', ringClass }: AvatarProps) {
  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-primary-light font-medium text-primary-dark ${sizes[size]} ${ringClass ?? ''}`}
      aria-label={author.name}
    >
      {author.avatarUrl ? (
        <img
          src={author.avatarUrl}
          alt=""
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <span>{author.initials}</span>
      )}
    </div>
  );
}
