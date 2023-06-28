import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

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
});

export const upload5mb = multer({
  storage: memStorage,
  limits: {
    // fieldNameSize: 255,
    fileSize: 5 * 1000000, //~3mb
    files: 2,
  },
});
