import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);

const extensionByType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif"
};

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1"
});

function getPublicObjectUrl(bucket: string, key: string) {
  const region = process.env.AWS_REGION ?? "us-east-1";
  const encodedKey = key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  if (region === "us-east-1") {
    return `https://${bucket}.s3.amazonaws.com/${encodedKey}`;
  }

  return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
}

export async function createImageUploadUrl(userId: string, contentType: string) {
  const bucket = process.env.S3_IMAGE_BUCKET;

  if (!bucket) {
    throw new Error("S3_IMAGE_BUCKET belum diset di environment.");
  }

  if (!allowedImageTypes.has(contentType)) {
    throw new Error("File harus berupa gambar JPG, PNG, WEBP, atau GIF.");
  }

  const prefix = (process.env.S3_IMAGE_PREFIX ?? "uploads").replace(/^\/+|\/+$/g, "");
  const extension = extensionByType[contentType];
  const key = `${prefix}/${userId}/${crypto.randomUUID()}.${extension}`;

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType
    }),
    { expiresIn: 300 }
  );

  return {
    uploadUrl,
    imageUrl: getPublicObjectUrl(bucket, key),
    key
  };
}
