import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from './s3Client.js';

export const generateUploadUrl = async (key) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ContentType: 'application/pdf',
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return url;
};
