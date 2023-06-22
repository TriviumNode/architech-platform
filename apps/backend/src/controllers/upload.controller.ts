import { RequestWithUser } from '@architech/types';
import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import path from 'path';

import AWS from 'aws-sdk';
import { HttpException } from '@/exceptions/HttpException';
import { FILEBASE_S3_KEY, FILEBASE_S3_KEY_ID } from '@/config';

const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  accessKeyId: FILEBASE_S3_KEY_ID,
  secretAccessKey: FILEBASE_S3_KEY,
  endpoint: 'https://s3.filebase.com',
  region: 'us-east-1',
  s3ForcePathStyle: true,
});

// fs.readFile('image.png', (err, data) => {
//     if (err) {
//         console.error(err);
//         return;
//     }

//     const params = {
//         Bucket: 'my-ipfs-bucket',
//         Key: 'test/image.png',
//         ContentType: 'image/png',
//         Body: data,
//     };

//     const request = s3.putObject(params);
//     request.on('httpHeaders', (statusCode, headers) => {
//         console.log(`CID: ${headers['x-amz-meta-cid']}`);
//     });
//     request.send();
// });

export const uploadImage = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  console.log(req.file);
  const buffer = req.file.buffer;

  // Create hash using file buffer
  const hash = crypto.createHash('sha256');
  hash.update(buffer);

  // Filename `hash.ext`
  const fileName = `${hash.digest('hex')}${path.extname(req.file.originalname)}`;

  const params = {
    Bucket: 'test-architech',
    Key: `test/${fileName}`,
    ContentType: req.file.mimetype,
    Body: buffer,
    ACL: 'public-read',
  };

  const request = s3.putObject(params);
  request.on('httpHeaders', (statusCode, headers) => {
    console.log(`CID: ${headers['x-amz-meta-cid']}`);
    if (!headers['x-amz-meta-cid']) throw new HttpException(500, 'Unable to fetch IPFS hash.');
    res.status(200).json({
      cid: headers['x-amz-meta-cid'],
    });
  });
  request.send();
  // const { ETag } = (await s3.putObject(params).promise()) as any;
  // console.log(ETag);

  // res.status(200).json({
  //   cid: ETag,
  // });
};
