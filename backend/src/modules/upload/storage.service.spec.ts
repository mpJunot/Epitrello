import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
import { Storage } from '@google-cloud/storage';

const mockBucket = {
  file: jest.fn().mockReturnValue({
    save: jest.fn().mockResolvedValue(undefined),
  }),
};
const mockStorageInstance = {
  bucket: jest.fn().mockReturnValue(mockBucket),
};

jest.mock('@google-cloud/storage', () => ({
  Storage: jest.fn().mockImplementation(() => mockStorageInstance),
}));

describe('StorageService', () => {
  let configGet: jest.Mock;

  const createService = async (config: Record<string, string | undefined>) => {
    configGet = jest.fn((key: string) => config[key]);
    const module = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: ConfigService, useValue: { get: configGet } },
      ],
    }).compile();
    return module.get<StorageService>(StorageService);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should disable GCS when GCS_BUCKET_NAME is not set', async () => {
      const service = await createService({ GCS_BUCKET_NAME: undefined });
      expect(service.isGcsEnabled()).toBe(false);
    });

    it('should disable GCS when GCS_BUCKET_NAME is empty string', async () => {
      const service = await createService({ GCS_BUCKET_NAME: '' });
      expect(service.isGcsEnabled()).toBe(false);
    });

    it('should fallback to default Storage when GCP_SERVICE_ACCOUNT is invalid JSON', async () => {
      const service = await createService({
        GCS_BUCKET_NAME: 'my-bucket',
        GCP_SERVICE_ACCOUNT: 'not-valid-json',
      });
      expect(service.isGcsEnabled()).toBe(true);
      expect(Storage).toHaveBeenCalledWith();
    });

    it('should fallback to default Storage when GCP_SERVICE_ACCOUNT has no project_id', async () => {
      const service = await createService({
        GCS_BUCKET_NAME: 'my-bucket',
        GCP_SERVICE_ACCOUNT: JSON.stringify({ type: 'service_account' }),
      });
      expect(service.isGcsEnabled()).toBe(true);
      expect(Storage).toHaveBeenCalledWith();
    });

    it('should enable GCS with GCS_SERVICE_ACCOUNT_KEY_BASE64 when GCP_SERVICE_ACCOUNT not set', async () => {
      const key = { project_id: 'proj-base64', type: 'service_account' };
      const base64 = Buffer.from(JSON.stringify(key)).toString('base64');
      const service = await createService({
        GCS_BUCKET_NAME: 'my-bucket',
        GCS_SERVICE_ACCOUNT_KEY_BASE64: base64,
      });
      expect(service.isGcsEnabled()).toBe(true);
      expect(Storage).toHaveBeenCalledWith({
        credentials: key,
        projectId: 'proj-base64',
      });
    });

    it('should prefer GCP_SERVICE_ACCOUNT over GCS_SERVICE_ACCOUNT_KEY_BASE64', async () => {
      const gcpKey = JSON.stringify({ project_id: 'from-gcp', type: 'service_account' });
      const base64Key = Buffer.from(JSON.stringify({ project_id: 'from-base64' })).toString('base64');
      const service = await createService({
        GCS_BUCKET_NAME: 'my-bucket',
        GCP_SERVICE_ACCOUNT: gcpKey,
        GCS_SERVICE_ACCOUNT_KEY_BASE64: base64Key,
      });
      expect(service.isGcsEnabled()).toBe(true);
      expect(Storage).toHaveBeenCalledWith({
        credentials: JSON.parse(gcpKey),
        projectId: 'from-gcp',
      });
    });

    it('should fallback to default Storage when GCS_SERVICE_ACCOUNT_KEY_BASE64 is invalid', async () => {
      const service = await createService({
        GCS_BUCKET_NAME: 'my-bucket',
        GCS_SERVICE_ACCOUNT_KEY_BASE64: 'not-valid-base64-json!!!',
      });
      expect(service.isGcsEnabled()).toBe(true);
      expect(Storage).toHaveBeenCalledWith();
    });

    it('should disable GCS when Storage constructor throws with credentials', async () => {
      (Storage as unknown as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Auth failed');
      });
      const key = JSON.stringify({ project_id: 'p', type: 'service_account' });
      const service = await createService({
        GCS_BUCKET_NAME: 'my-bucket',
        GCP_SERVICE_ACCOUNT: key,
      });
      expect(service.isGcsEnabled()).toBe(false);
    });
  });

  describe('isGcsEnabled', () => {
    it('should return true when bucket and storage are set', async () => {
      const service = await createService({ GCS_BUCKET_NAME: 'b' });
      expect(service.isGcsEnabled()).toBe(true);
    });

    it('should return false when bucket is not set', async () => {
      const service = await createService({});
      expect(service.isGcsEnabled()).toBe(false);
    });
  });

  describe('uploadToGcs', () => {
    it('should throw when GCS is not configured', async () => {
      const service = await createService({});
      await expect(
        service.uploadToGcs(Buffer.from('x'), 'avatars', 'f.jpg', 'image/jpeg'),
      ).rejects.toThrow('GCS is not configured. Set GCS_BUCKET_NAME.');
    });

    it('should upload to attachments folder', async () => {
      const service = await createService({ GCS_BUCKET_NAME: 'b' });
      await service.uploadToGcs(Buffer.from('x'), 'attachments', 'a1.pdf', 'application/pdf');
      expect(mockBucket.file).toHaveBeenCalledWith('attachments/a1.pdf');
    });
  });
});
