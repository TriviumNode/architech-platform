import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { HttpException } from '@/exceptions/HttpException';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // const fileBuffer = fs.readFileSync('uploads/file.');
    // const hash = crypto.createHash('sha256');

    // hash.update(file.buffer);
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});

const memStorage = multer.memoryStorage();

export const upload = multer({
  storage: memStorage,
  limits: {
    // fieldNameSize: 255,
    fileSize: 3 * 1000000, //~3mb
    files: 2,
  },
  fileFilter: function (req, file, callback) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.svg' && ext !== '.webp') {
      return callback(new HttpException(400, `Only images are allowed. Got: ${ext}`));
    }
    callback(null, true);
  },
});

export const upload5mb = multer({
  storage: memStorage,
  limits: {
    // fieldNameSize: 255,
    fileSize: 5 * 1000000, //~5mb
    files: 2,
  },
  fileFilter: function (req, file, callback) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.svg' && ext !== '.webp') {
      return callback(new HttpException(400, `Only images are allowed. Got: ${ext}`));
    }
    callback(null, true);
  },
});

export const uploadBatch = multer({
  storage: memStorage,
  limits: {
    // fieldNameSize: 255,
    fileSize: 5 * 1000000, //~5mb
    files: 500,
  },
  fileFilter: function (req, file, callback) {
    const ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.svg' && ext !== '.webp') {
      return callback(new Error('Only images are allowed'));
    }
    callback(null, true);
  },
});
