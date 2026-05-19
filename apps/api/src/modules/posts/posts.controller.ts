import {
  createPostService,
  deletePostService,
  getPostByIdService,
  getPostsService,
  updatePostService
} from "./posts.service";

export const getPostsController = () => {
  return {
    success: true,
    data: getPostsService()
  };
};

export const getPostByIdController = ({
  params,
  set
}: any) => {
  const post = getPostByIdService(params.id);

  if (!post) {
    set.status = 404;

    return {
      message: "Post tidak ditemukan"
    };
  }

  return {
    success: true,
    data: post
  };
};

export const createPostController = ({
  authUser,
  body,
  set
}: any) => {
  try {
    if (!authUser) {
      set.status = 401;

      return {
        message: "Unauthorized"
      };
    }

    const post = createPostService(
      authUser,
      body
    );

    return {
      success: true,
      data: post
    };
  } catch (error: any) {
    set.status = 400;

    return {
      message: error.message
    };
  }
};

export const updatePostController = ({
  params,
  authUser,
  body,
  set
}: any) => {
  try {
    const post = updatePostService(
      params.id,
      authUser,
      body
    );

    return {
      success: true,
      data: post
    };
  } catch (error: any) {
    set.status = 400;

    return {
      message: error.message
    };
  }
};

export const deletePostController = ({
  params,
  authUser,
  set
}: any) => {
  try {
    return deletePostService(
      params.id,
      authUser
    );
  } catch (error: any) {
    set.status = 400;

    return {
      message: error.message
    };
  }
};