import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let s3: S3Client | undefined;

function getR2Endpoint() {
  if (process.env.R2_ENDPOINT) return process.env.R2_ENDPOINT;
  if (process.env.R2_ACCOUNT_ID) {
    return `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  }
  return undefined;
}

function getR2Bucket() {
  return process.env.R2_BUCKET;
}

function required(value: string | undefined, name: string) {
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function getS3Client() {
  s3 ??= new S3Client({
    region: process.env.R2_REGION ?? "auto",
    endpoint: required(getR2Endpoint(), "R2_ENDPOINT or R2_ACCOUNT_ID"),
    credentials: {
      accessKeyId: required(process.env.R2_ACCESS_KEY_ID, "R2_ACCESS_KEY_ID"),
      secretAccessKey: required(process.env.R2_SECRET_ACCESS_KEY, "R2_SECRET_ACCESS_KEY"),
    },
    forcePathStyle: process.env.R2_FORCE_PATH_STYLE === "true",
  });

  return s3;
}

export async function createPresignedUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: required(getR2Bucket(), "R2_BUCKET"),
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(getS3Client(), command, { expiresIn: 600 });
  return url;
}

export async function deleteS3Object(key: string) {
  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: required(getR2Bucket(), "R2_BUCKET"),
      Key: key,
    })
  );
}
