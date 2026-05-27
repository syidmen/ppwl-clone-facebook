import {
  createPostService,
  deletePostService,
  getPostByIdService,
  getPostsService,
  updatePostService
} from "./posts.service";

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

    // 1. Ambil data teks murni dan file dari bodi FormData
    const contentText = body.content;
    const imageFile = body.image; 

    let finalImageUrl = null;

    // 2. Jika user mengunggah file gambar, simpan ke folder 'uploads' lokal server
    if (imageFile && imageFile instanceof File) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Mengamankan nama file dari karakter spasi
      const fileName = `${Date.now()}_${imageFile.name.replace(/\s+/g, "_")}`;
      const filePath = `./uploads/${fileName}`; 
      
      // Menulis biner ke storage server menggunakan Bun runtime
      await Bun.write(filePath, buffer);
      
      // Alamat path/URL string yang akan disimpan di database
      finalImageUrl = `/uploads/${fileName}`;
    }

    // 3. Susun data yang sudah bersih agar aman diterima oleh Service database Anda
    const cleanPostData = {
      content: contentText,   // Sesuaikan jika service database Anda meminta key 'text'
      imageUrl: finalImageUrl // Sesuaikan jika service database Anda meminta key 'image'
    };

    const post = await createPostService(
      authUser,
      cleanPostData
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