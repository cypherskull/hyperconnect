import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

const bucketName = process.env.S3_BUCKET_NAME || 'hyperconnect-uploads';

// Multer-S3 storage configuration
export const s3Upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: bucketName,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const filename = `${uuidv4()}${ext}`;
            cb(null, `uploads/${filename}`);
        },
    }),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    },
});

// Local storage for development
export const localStorage = multer({
    storage: multer.diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const filename = `${uuidv4()}${ext}`;
            cb(null, filename);
        },
    }),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});

export const deleteFromS3 = async (key: string): Promise<void> => {
    const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
    });
    await s3Client.send(command);
};

export { s3Client, bucketName };
