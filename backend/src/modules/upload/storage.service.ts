import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';

export type UploadFolder = 'avatars' | 'backgrounds' | 'attachments';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucketName: string | null;
  private readonly storage: Storage | null;

  constructor(private config: ConfigService) {
    const bucket = this.config.get<string>('GCS_BUCKET_NAME');
    if (bucket) {
      this.bucketName = bucket;
      const gcpSecret = this.config.get<string>('GCP_SERVICE_ACCOUNT');
      const keyBase64 = this.config.get<string>('GCS_SERVICE_ACCOUNT_KEY_BASE64');
      let credentials: { project_id?: string } | null = null;
      if (gcpSecret?.trim()) {
        try {
          const parsed = JSON.parse(gcpSecret.trim()) as { project_id?: string };
          if (parsed.project_id) credentials = parsed;
        } catch {
          this.logger.warn(
            'GCP_SERVICE_ACCOUNT is set but invalid JSON. Using GOOGLE_APPLICATION_CREDENTIALS or default.',
          );
        }
      }
      if (!credentials && keyBase64) {
        try {
          const keyJson = Buffer.from(keyBase64, 'base64').toString('utf8');
          credentials = JSON.parse(keyJson) as { project_id?: string };
        } catch {
          this.logger.warn(
            'GCS_SERVICE_ACCOUNT_KEY_BASE64 is set but invalid. Using GOOGLE_APPLICATION_CREDENTIALS or default.',
          );
        }
      }
      if (credentials) {
        try {
          this.storage = new Storage({
            credentials,
            projectId: credentials.project_id,
          });
          this.logger.log(`Upload: GCS enabled (bucket: ${bucket})`);
        } catch (err) {
          this.bucketName = null;
          this.storage = null;
          this.logger.warn(
            `Upload: GCS disabled — failed to create Storage client. Files will be saved to backend/uploads/. Error: ${err instanceof Error ? err.message : String(err)}`,
          );
          return;
        }
      } else {
        this.storage = new Storage();
        this.logger.log(
          `Upload: GCS enabled (bucket: ${bucket}), using GOOGLE_APPLICATION_CREDENTIALS or default credentials`,
        );
      }
    } else {
      this.bucketName = null;
      this.storage = null;
      this.logger.log(
        'Upload: GCS disabled — GCS_BUCKET_NAME not set. Files will be saved to backend/uploads/',
      );
    }
  }

  isGcsEnabled(): boolean {
    return this.bucketName != null && this.storage != null;
  }

  /**
   * Upload a file buffer to GCS and return the public URL.
   * Throws if GCS is not configured.
   */
  async uploadToGcs(
    buffer: Buffer,
    folder: UploadFolder,
    filename: string,
    mimetype: string,
  ): Promise<string> {
    if (!this.bucketName || !this.storage) {
      throw new Error('GCS is not configured. Set GCS_BUCKET_NAME.');
    }
    const path = `${folder}/${filename}`;
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(path);
    await file.save(buffer, {
      contentType: mimetype,
      metadata: { cacheControl: 'public, max-age=31536000' },
    });
    return `https://storage.googleapis.com/${this.bucketName}/${path}`;
  }
}
