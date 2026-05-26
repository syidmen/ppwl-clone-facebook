import {
  createPostService,
  deletePostService,
  getPostByIdService,
  getPostsService,
  updatePostService
} from "./posts.service";
import { createImageUploadUrl } from "./upload.service";

export const getPostsController = async () => {
  return {
    success: true,
    data: await getPostsService()
  };
};

export const getPostByIdController = async ({
  params,
  set
}: any) => {
  const post = await getPostByIdService(params.id);

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

export const createPostController = async ({
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

    const post = await createPostService(
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

export const updatePostController = async ({
  params,
  authUser,
  body,
  set
}: any) => {
  try {
    const post = await updatePostService(
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

export const deletePostController = async ({
  params,
  authUser,
  set
}: any) => {
  try {
    return await deletePostService(
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

export const getUploadUrlController = async ({
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

    const data = await createImageUploadUrl(
      authUser.sub,
      body.contentType
    );

    return {
      success: true,
      data
    };
  } catch (error: any) {
    set.status = 400;

    return {
      message: error.message
    };
  }
};
