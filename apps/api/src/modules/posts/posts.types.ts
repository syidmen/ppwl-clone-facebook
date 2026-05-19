export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: string;

  author: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };

  likeCount: number;
  commentCount: number;

  likedByMe?: boolean;
}