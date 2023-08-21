import { RequestWithUser } from '@architech/types';
import { Response, NextFunction, Request } from 'express';
import crypto from 'crypto';
import path from 'path';

import AWS from 'aws-sdk';
import { HttpException } from '@/exceptions/HttpException';
import { FILEBASE_BUCKET, FILEBASE_S3_KEY, FILEBASE_S3_KEY_ID } from '@/config';
import promiseConcurrency from 'promise-concurrency';

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
  console.log('Upload req.file', req.file);
  if (!req.file) {
    res.status(400).send('No files uploaded');
    return;
  }
  const buffer = req.file.buffer;

  // Create hash using file buffer
  const hash = crypto.createHash('sha256');
  hash.update(buffer);

  // Filename `hash.ext`
  const fileName = `${hash.digest('hex')}${path.extname(req.file.originalname)}`;

  const params = {
    Bucket: FILEBASE_BUCKET,
    Key: `uploads/${fileName}`,
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

const processFile = async (file: any, index: number, responses: any[]) => {
  console.log('Uploading', file.originalname);

  const cid = await s3Upload(file);
  responses[index] = {
    cid,
    fileName: file.originalname,
  };
};

export const uploadImageBatch = async (req: Request, res: Response, next: NextFunction) => {
  const responses: {
    cid: string;
    fileName: string;
  }[] = [];
  //@ts-expect-error no type for file fields
  const queue = req.files.images.map((f: File, i: number) => () => processFile(f, i, responses));

  // Upload 5 at a time
  await promiseConcurrency(queue, 5);

  res.status(200).json(responses);
};

export const asyncUpload = (params: any): Promise<string> => {
  return new Promise(resolve => {
    const request = s3.putObject(params);
    request.on('httpHeaders', (statusCode, headers) => {
      // console.log(`CID: ${headers['x-amz-meta-cid']}`);
      if (!headers['x-amz-meta-cid']) throw new HttpException(500, 'Unable to fetch IPFS hash.');
      resolve(headers['x-amz-meta-cid']);
    });
    request.send();
  });
};

const s3Upload = async (file: any): Promise<string> => {
  const buffer = file.buffer;

  // Create hash using file buffer
  const hash = crypto.createHash('sha256');
  hash.update(buffer);

  // Filename `hash.ext`
  const fileName = `${hash.digest('hex')}${path.extname(file.originalname)}`;

  const params = {
    Bucket: FILEBASE_BUCKET,
    Key: `uploads/${fileName}`,
    ContentType: file.mimetype,
    Body: buffer,
    ACL: 'public-read',
  };
  return await asyncUpload(params);

  // const request = s3.putObject(params);
  // request.on('httpHeaders', (statusCode, headers) => {
  //   console.log(`CID: ${headers['x-amz-meta-cid']}`);
  //   if (!headers['x-amz-meta-cid']) throw new HttpException(500, 'Unable to fetch IPFS hash.');
  //   return headers['x-amz-meta-cid'];
  // });
  // request.send();
};
