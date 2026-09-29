import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CONFIG } from '../config';

let s3Client: S3Client | null = null;

try {
  if (!CONFIG.DEMO_MODE) {
    s3Client = new S3Client({ region: CONFIG.AWS_REGION });
  }
} catch (err) {
  console.warn('[S3] SDK initialization fallback to DEMO_MODE');
}

export const generateS3DownloadUrl = async (s3Key: string): Promise<string> => {
  if (CONFIG.DEMO_MODE || !s3Client) {
    // In demo mode, return a dummy mock presigned download URL
    return `https://s3.${CONFIG.AWS_REGION}.amazonaws.com/${CONFIG.AWS_S3_BUCKET}/${s3Key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=3600&demo=true`;
  }

  try {
    const command = new GetObjectCommand({
      Bucket: CONFIG.AWS_S3_BUCKET,
      Key: s3Key
    });
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (err: any) {
    console.error('[S3 Error]', err.message);
    return `#error-generating-presigned-url`;
  }
};
