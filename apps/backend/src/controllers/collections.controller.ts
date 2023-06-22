import { NextFunction, Request, Response } from 'express';
import * as collectionService from '@services/collections.service';
import { CONTRACT_ADDR_LENGTH, queryClient } from '@/utils/chainClients';
import { Collection, CollectionProfile, RequestWithOptionalUser, RequestWithUser, updateCollectionDto } from '@architech/types';
import { EditCollectionBodyDto, ImportCollectionBodyDto } from '@/dtos/collections.dto';
import { findAllCollections } from '@/queriers/collection.querier';
import { validate } from 'class-validator';
import { StartImportData } from '@/interfaces/collections.interface';
import { View } from '@/interfaces/views.interface';
import ViewModel from '@/models/views.model';
import CollectionModel from '@/models/collections.model';
import mongoose from 'mongoose';
import { getCollectionAsks } from '@/utils/queries/marketplaceQuery';
import { MARKETPLACE_ADDRESS } from '@/../../../packages/architech-lib/dist';
import { RequestWithImages } from '@/middlewares/fileUploadMiddleware';
import { HttpException } from '@/exceptions/HttpException';

export const getAllCollections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const findAllCollectionsData: Collection[] = await findAllCollections();

    res.status(200).json(findAllCollectionsData);
  } catch (error) {
    next(error);
  }
};

export const getTrendingCollections = async (req: Request, res: Response, next: NextFunction) => {
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  try {
    const trending: Collection[] = await ViewModel.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().valueOf() - SEVEN_DAYS) },
        },
      },
      {
        $group: {
          _id: '$collectionAddress',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json(trending);
  } catch (error) {
    next(error);
  }
};

export const getCollectionByAddress = async (req: RequestWithOptionalUser, res: Response, next: NextFunction) => {
  try {
    const userId: string = req.user?._id;
    const collectionAddress: string = req.params.contractAddr;
    // const collectionData: Collection = await collectionService.findCollectionByAddress(collectionAddress);
    const fullCollection = await collectionService.getFullCollection(collectionAddress);

    if (fullCollection) {
      // Increment view count
      const view: View = {
        collectionAddress: fullCollection.collection.address,
        viewer: userId ? userId : undefined,
      };

      await ViewModel.create(view);
      const updated = await CollectionModel.findByIdAndUpdate(fullCollection.collection._id, { $inc: { total_views: 1 } }, { new: true });
      fullCollection.collection = updated;
      res.status(200).json(fullCollection);
      return;
    } else {
      throw new HttpException(404, 'Collection not found.');
    }
  } catch (error) {
    next(error);
  }
};

//   public getCollectionById = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const collectionId: string = req.params.id;
//       const findOneCollectionData: Collection = await this.collectionService.findCollectionById(collectionId);

//       res.status(200).json({ data: findOneCollectionData, message: 'findOne' });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public createCollection = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const collectionData: CreateCollectionDto = req.body;
//       const createCollectionData: Collection = await this.collectionService.createCollection(collectionData);

//       res.status(201).json({ data: createCollectionData, message: 'created' });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public updateCollection = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const collectionId: string = req.params.id;
//       const collectionData: CreateCollectionDto = req.body;
//       const updateCollectionData: Collection = await this.collectionService.updateCollection(collectionId, collectionData);

//       res.status(200).json({ data: updateCollectionData, message: 'updated' });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public deleteCollection = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const collectionId: string = req.params.id;
//       const deleteCollectionData: Collection = await this.collectionService.deleteCollection(collectionId);

//       res.status(200).json({ data: deleteCollectionData, message: 'deleted' });
//     } catch (error) {
//       next(error);
//     }
//   };
// }

// export default CollectionsController;

export const importCollectionAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contractAddress: string = req.params.contractAddr;

    if (contractAddress.length !== CONTRACT_ADDR_LENGTH || !contractAddress.startsWith(process.env.PREFIX)) {
      res.status(400).send('Invalid contract address.');
      return;
    }
    console.log('Importing ', contractAddress);

    const importResponse = await collectionService.startImportCollection(contractAddress, { hidden: true, categories: [] });

    res.status(200).json(importResponse);
  } catch (error) {
    next(error);
  }
};

export const editCollection = async (req: RequestWithImages, res: Response, next: NextFunction) => {
  try {
    const collectionId: string = req.params.id;

    if (!collectionId) {
      res.status(400).send('Invalid collection ID.');
      return;
    }

    const profile_image: string | undefined = req.images?.profile;
    const banner_image: string | undefined = req.images?.banner;
    // const { profile: profile_image, banner: banner_image } = req.images;
    console.log({ profile: profile_image, banner: banner_image });

    // validate body contents
    const validator = new EditCollectionBodyDto();
    validator.name = req.body.name;
    validator.description = req.body.description;
    validator.categories = req.body.categories;
    validator.hidden = req.body.hidden;
    validator.website = req.body.website;
    validator.twitter = req.body.twitter;
    validator.discord = req.body.discord;
    validator.telegram = req.body.telegram;

    await validate(validator);

    const profileData: Partial<CollectionProfile> = {
      name: validator.name,
      description: validator.description,
      website: validator.website,
      twitter: validator.twitter,
      discord: validator.discord,
      telegram: validator.telegram,
      profile_image,
      banner_image,
    };

    // Strip undefined fields
    Object.keys(profileData).forEach(key => profileData[key] === undefined && delete profileData[key]);
    console.log('EDIT DATA', profileData);

    const updateCollection: Partial<Collection> = {
      collectionProfile: profileData,
      hidden: validator.hidden ? validator.hidden === 'true' : undefined,
      categories: validator.categories ? JSON.parse(validator.categories) : undefined,
    };

    Object.keys(updateCollection).forEach(key => updateCollection[key] === undefined && delete updateCollection[key]);
    console.log('UPDATE DATA', updateCollection);

    // const updated = await CollectionModel.findByIdAndUpdate(
    //   collectionId,
    //   { collectionProfile: { ...profileData }, hidden: validator.hidden },
    //   { new: true },
    // );

    const updated: Collection = await collectionService.updateCollection(collectionId, updateCollection);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const importCollection = async (req: RequestWithImages, res: Response, next: NextFunction) => {
  try {
    const contractAddress: string = req.params.contractAddr;

    if (contractAddress.length !== CONTRACT_ADDR_LENGTH || !contractAddress.startsWith(process.env.PREFIX)) {
      res.status(400).send('Invalid contract address.');
      return;
    }
    console.log('SAVED IMAGES', req.images);
    const profile_image: string | undefined = req.images.profile;
    const banner_image: string | undefined = req.images.banner;

    // validate body contents
    const validator = new ImportCollectionBodyDto();
    validator.name = req.body.name;
    validator.description = req.body.description;
    validator.categories = req.body.categories;
    validator.hidden = req.body.hidden;

    validator.website = req.body.website;
    validator.twitter = req.body.twitter;
    validator.discord = req.body.discord;
    validator.telegram = req.body.telegram;

    await validate(validator);

    const importData: StartImportData = {
      name: validator.name,
      description: validator.description,
      categories: JSON.parse(validator.categories),
      hidden: validator.hidden === 'true',
      website: validator.website,
      twitter: validator.twitter,
      discord: validator.discord,
      telegram: validator.telegram,
      profile_image,
      banner_image,
    };

    const importResponse = await collectionService.startImportCollection(contractAddress, importData);

    res.status(200).json(importResponse);
  } catch (error) {
    next(error);
  }
};

export const refreshCollection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contractAddress: string = req.params.contractAddr;
    if (contractAddress.length !== CONTRACT_ADDR_LENGTH || !contractAddress.startsWith(process.env.PREFIX)) {
      res.status(400).send('Invalid contract address.');
      return;
    }
    const refreshResponse = await collectionService.refreshCollection(contractAddress);

    res.status(200).json(refreshResponse);
  } catch (error) {
    next(error);
  }
};
