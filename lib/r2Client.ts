import { S3Client } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID?.trim();
const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();

export const r2BucketName = process.env.R2_BUCKET_NAME?.trim() || "";
export const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim() || "";

function initR2Client(): S3Client | null {
  if (
    !accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    accountId === "undefined"
  ) {
    return null;
  }

  try {
    return new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  } catch (err) {
    console.error("R2 client init error:", err);
    return null;
  }
}

export const r2Client = initR2Client();
