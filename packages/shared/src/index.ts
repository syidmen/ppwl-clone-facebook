export type UserProvider = "email" | "google";

export type UserDTO = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  provider: UserProvider;
  createdAt: string;
};

export type PostDTO = {
  id: string;
  content: string;
  imageUrl: string | null;
  author: UserDTO;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CommentDTO = {
  id: string;
  content: string;
  author: UserDTO;
  createdAt: string;
};

export type NotificationDTO = {
  id: string;
  type: "like" | "comment";
  message: string;
  isRead: boolean;
  createdAt: string;
};
