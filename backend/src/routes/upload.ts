import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Create uploads directory if it doesn't exist
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Local storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
            'application/pdf',
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    },
});

// Upload single file
router.post(
    '/single',
    authenticate,
    upload.single('file'),
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'No file uploaded' });
                return;
            }

            // In production, this would be the S3 URL
            // For local development, we use the local path
            const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
            const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

            res.json({
                url: fileUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimeType: req.file.mimetype,
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ error: 'Failed to upload file' });
        }
    }
);

// Upload multiple files
router.post(
    '/multiple',
    authenticate,
    upload.array('files', 5),
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const files = req.files as Express.Multer.File[];

            if (!files || files.length === 0) {
                res.status(400).json({ error: 'No files uploaded' });
                return;
            }

            const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;

            const uploadedFiles = files.map(file => ({
                url: `${baseUrl}/uploads/${file.filename}`,
                filename: file.filename,
                originalName: file.originalname,
                size: file.size,
                mimeType: file.mimetype,
            }));

            res.json({ files: uploadedFiles });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ error: 'Failed to upload files' });
        }
    }
);

// Delete file
router.delete('/:filename', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const filePath = path.join(uploadsDir, req.params.filename);

        if (!fs.existsSync(filePath)) {
            res.status(404).json({ error: 'File not found' });
            return;
        }

        fs.unlinkSync(filePath);
        res.json({ message: 'File deleted' });
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

export default router;
