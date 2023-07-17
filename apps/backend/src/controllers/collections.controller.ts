import { NextFunction, Request, Response } from 'express';
import * as collectionService from '@services/collections.service';
import { CONTRACT_ADDR_LENGTH, queryClient } from '@/utils/chainClients';
import {
  Collection,
  CollectionProfile,
  GetCollectionResponse,
  GetTrendingCollectionResponse,
  RequestWithOptionalUser,
  RequestWithUser,
  updateCollectionDto,
} from '@architech/types';
import { EditCollectionBodyDto, ImportCollectionBodyDto } from '@/dtos/collections.dto';
import { validate } from 'class-validator';
import { StartImportData } from '@/interfaces/collections.interface';
import { View } from '@/interfaces/views.interface';
import ViewModel from '@/models/views.model';
import CollectionModel from '@/models/collections.model';
import mongoose from 'mongoose';
import { RequestWithImages } from '@/middlewares/fileUploadMiddleware';
import { HttpException } from '@/exceptions/HttpException';
import { collectionsToResponse, queryDbCollectionByAddress, queryDbCollections } from '@/queriers/collection.querier';
import { addCollectionView } from '@/services/view.service';

export const getAllCollections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const response = await queryDbCollections({}, page, limit);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getTrendingCollections = async (req: Request, res: Response, next: NextFunction) => {
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  try {
    const trending = await ViewModel.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().valueOf() - SEVEN_DAYS) },
        },
      },
      {
        $group: {
          _id: '$collectionRef',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
    await CollectionModel.populate(trending, { path: '_id' });
    const raw_collections: Collection[] = trending.slice(0, 10).map(t => t._id);
    const collections = raw_collections.filter(c => c && !c.hidden);

    const collectionsResponse = await collectionsToResponse(collections);

    // Append counts
    const response: GetTrendingCollectionResponse = collectionsResponse.map(function (cr, key) {
      return {
        ...cr,
        count: trending[key].count,
      };
    });
    res.status(200).json(response);

    // const addresses = trending.map(t => t._id.address);
    // try {
    //   const dossiers = await getBatchCollectionDossier({
    //     client: queryClient,
    //     collections: addresses,
    //     contract: MARKETPLACE_ADDRESS,
    //   });
    //   const result: GetTrendingCollectionResponse = trending.map(function (elm, key) {
    //     return { collection: elm._id, count: elm.count, asks: dossiers[key].asks, volume: dossiers[key].volume };
    //   });
    //   res.status(200).json(result);
    // } catch (err: any) {
    //   console.error('ERROR QUERYING MARKETPLACE', err);
    //   res.status(200).json(
    //     trending.map(function (elm, key) {
    //       return { collection: elm._id, count: elm.count, asks: [], volume: [] };
    //     }),
    //   );
    // }
  } catch (error) {
    next(error);
  }
};

export const searchCollections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query: string = req.query.query as string;
    if (!query) throw new HttpException(400, 'No search query. Try `/search?query=foo`');

    const results = await CollectionModel.find({ $text: { $search: query }, hidden: false });
    console.log('search results', results);
    res.status(200).json(results);
    return;
  } catch (error) {
    next(error);
  }
};

export const getCollectionByAddress = async (req: RequestWithOptionalUser, res: Response, next: NextFunction) => {
  try {
    const userId: string = req.user?._id;
    const collectionAddress: string = req.params.contractAddr;
    // const fullCollection = await collectionService.getFullCollection(collectionAddress);
    const fullCollection = await queryDbCollectionByAddress(collectionAddress);

    if (fullCollection) {
      if (
        fullCollection.collection.hidden &&
        fullCollection.collection.creator !== req.user?.address &&
        fullCollection.collection.admin !== req.user?.address
      )
        throw new HttpException(404, 'Collection not found.');

      // Increment view count
      const updated = await addCollectionView({
        collectionRef: fullCollection.collection._id,
        collectionAddress,
        viewerRef: userId ? new mongoose.Types.ObjectId(userId) : undefined,
        viewerIP: (req.headers['x-forwarded-for'] as string) || '0.0.0.0',
      });

      if (updated) {
        fullCollection.collection = updated;
      }
      res.status(200).json(fullCollection);
      return;
    } else {
      throw new HttpException(404, 'Collection not found.');
    }
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

    const updateCollection: Partial<Collection> = {
      collectionProfile: profileData,
      hidden: validator.hidden ? validator.hidden === 'true' : undefined,
      categories: validator.categories ? JSON.parse(validator.categories) : undefined,
    };

    Object.keys(updateCollection).forEach(key => updateCollection[key] === undefined && delete updateCollection[key]);

    const updated: Collection = await collectionService.updateCollection(new mongoose.Types.ObjectId(collectionId), updateCollection);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const importCollection = async (req: RequestWithImages, res: Response, next: NextFunction) => {
  try {
    // Get contract Addr from URL
    const contractAddress: string = req.params.contractAddr;

    // Validate contract address
    if (contractAddress.length !== CONTRACT_ADDR_LENGTH || !contractAddress.startsWith(process.env.PREFIX)) {
      res.status(400).send('Invalid contract address.');
      return;
    }

    // Fetch image filenames provided by middleware
    const profile_image: string | undefined = req.images?.profile;
    const banner_image: string | undefined = req.images?.banner;

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

    const importResponse = await collectionService.importCollection(contractAddress, validator, profile_image, banner_image);

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
