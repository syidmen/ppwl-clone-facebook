import { dummyPosts } from "../posts/posts.service";

const likedMap = new Map<
  string,
  Set<string>
>();

export const toggleLikeService = (
  postId: string,
  userId: string
) => {
  const post = dummyPosts.find(
    (p) => p.id === postId
  );

  if (!post) {
    throw new Error("Post tidak ditemukan");
  }

  if (!likedMap.has(postId)) {
    likedMap.set(postId, new Set());
  }

  const likes = likedMap.get(postId)!;

  let liked = false;

  if (likes.has(userId)) {
    likes.delete(userId);

    post.likeCount = Math.max(
      0,
      post.likeCount - 1
    );

    liked = false;
  } else {
    likes.add(userId);

    post.likeCount += 1;

    liked = true;
  }

  return {
    liked,
    likeCount: post.likeCount
  };
};