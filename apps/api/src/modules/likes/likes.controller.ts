import { toggleLikeService }
from "./likes.service";

export const toggleLikeController = async ({
  params,
  authUser,
  set
}: any) => {
  try {
    if (!authUser) {
      set.status = 401;

      return {
        message: "Unauthorized"
      };
    }

    const result =
      await toggleLikeService(
        params.id,
        authUser.sub
      );

    return {
      success: true,
      data: result
    };
  } catch (error: any) {
    set.status = 400;

    return {
      message: error.message
    };
  }
};
