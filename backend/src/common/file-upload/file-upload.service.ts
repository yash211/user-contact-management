import { Injectable, BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

@Injectable()
export class FileUploadService {
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  getStorageConfig(folder: string) {
    return {
      storage: diskStorage({
        destination: `./uploads/${folder}`,
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
          return cb(new BadRequestException('Invalid file type. Only images are allowed.'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: this.maxFileSize,
      },
    };
  }

  validateFile(file: UploadedFile): void {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images are allowed.');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File size too large. Maximum size is 5MB.');
    }
  }

  getFileUrl(filename: string, folder: string): string {
    return `/uploads/${folder}/${filename}`;
  }

  async deleteFile(filename: string, folder: string): Promise<void> {
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      const filePath = path.join(process.cwd(), 'uploads', folder, filename);
      await fs.unlink(filePath);
    } catch (error) {
      // File might not exist, ignore error
    }
  }
}
