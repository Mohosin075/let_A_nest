import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';
import ApiError from '../../errors/ApiError';

const fileUploadHandler = () => {
  // 1️⃣ Storage in memory for easy Sharp processing
  const storage = multer.memoryStorage();

  // 2️⃣ File filter
  const filterFilter = async (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    try {
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const allowedMediaTypes = ['video/mp4', 'audio/mpeg'];
      const allowedDocTypes = ['application/pdf'];

      // ✅ All image-type fields (including your new ones)
      const imageFields = [
        'image',
        'license',
        'signature',
        'businessProfile',
        'photos',
        'coverPhotos',
      ];

      if (imageFields.includes(file.fieldname)) {
        if (allowedImageTypes.includes(file.mimetype)) return cb(null, true);
        return cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            'Only .jpeg, .png, .jpg files are supported',
          ),
        );
      }

      if (file.fieldname === 'media' || file.fieldname === 'clips') {
        if (allowedMediaTypes.includes(file.mimetype)) return cb(null, true);
        return cb(
          new ApiError(StatusCodes.BAD_REQUEST, 'Only .mp4, .mp3 files are supported'),
        );
      }

      if (file.fieldname === 'doc') {
        if (allowedDocTypes.includes(file.mimetype)) return cb(null, true);
        return cb(new ApiError(StatusCodes.BAD_REQUEST, 'Only .pdf is supported'));
      }

      return cb(new ApiError(StatusCodes.BAD_REQUEST, 'This file field is not supported'));
    } catch {
      cb(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'File validation failed'));
    }
  };

  // 3️⃣ Multer setup with new fields
  const upload = multer({
    storage,
    fileFilter: filterFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB per file
      files: 20, // total max
    },
  }).fields([
    { name: 'image', maxCount: 5 },
    { name: 'photos', maxCount: 10 },      // 🆕 multiple gallery photos
    { name: 'coverPhotos', maxCount: 3 },  // 🆕 cover images
    { name: 'media', maxCount: 3 },
    { name: 'doc', maxCount: 3 },
    { name: 'clips', maxCount: 3 },
  ]);

  // 4️⃣ Sharp image optimization
  const processImages = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.files) return next();

    try {
      const imageFields = [
        'image',
        'license',
        'signature',
        'businessProfile',
        'photos',
        'coverPhotos',
      ];

      for (const field of imageFields) {
        const files = (req.files as Record<string, Express.Multer.File[]>)[field];
        if (!files) continue;

        for (const file of files) {
          if (!file.mimetype.startsWith('image')) continue;

          // Resize & compress (keeps aspect ratio)
          const optimizedBuffer = await sharp(file.buffer)
            .resize({ width: 1024 })
            .jpeg({ quality: 80 })
            .toBuffer();

          file.buffer = optimizedBuffer;
        }
      }

      next();
    } catch {
      next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Image processing failed'));
    }
  };

  // 5️⃣ Combined middleware
  return (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, err => {
      if (err) return next(err);
      processImages(req, res, next);
    });
  };
};

export default fileUploadHandler;
