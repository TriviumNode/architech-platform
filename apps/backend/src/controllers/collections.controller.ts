import { NextFunction, Request, Response } from 'express';
import * as collectionService from '@services/collections.service';
import { CONTRACT_ADDR_LENGTH, isContract } from '@/utils/chainClients';
import { Collection, CollectionProfile, GetTrendingCollectionResponse, RequestWithOptionalUser } from '@architech/types';
import { EditCollectionBodyDto, ImportCollectionBodyDto } from '@/dtos/collections.dto';
import { validate } from 'class-validator';
import ViewModel from '@/models/views.model';
import CollectionModel, { CollectionClass } from '@/models/collections.model';
import mongoose from 'mongoose';
import { RequestWithImages } from '@/middlewares/fileUploadMiddleware';
import { HttpException } from '@/exceptions/HttpException';
import { collectionsToResponse, queryDbCollectionByAddress, queryDbCollections } from '@/queriers/collection.querier';
import { addCollectionView } from '@/services/view.service';
import { ADMINS } from '@/../../../packages/architech-lib/dist';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const TWO_WEEKS = SEVEN_DAYS * 2;

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

export const getAllMinters = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const response = await queryDbCollections({ collectionMinter: { $not: { $type: 'null' } } }, page, limit);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getActiveMinters = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const response = await queryDbCollections({ 'collectionMinter.ended': false }, page, limit);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getEndedMinters = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const response = await queryDbCollections({ 'collectionMinter.ended': true }, page, limit);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getTrendingCollections = async (req: Request, res: Response, next: NextFunction) => {
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
    const collections = raw_collections.filter(c => c && !c.hidden && !c.admin_hidden);

    const collectionsResponse = await collectionsToResponse(collections);

    // Append counts
    const response: GetTrendingCollectionResponse = collectionsResponse.map(function (cr, key) {
      return {
        ...cr,
        count: trending[key].count,
      };
    });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getTrendingFeaturedCollections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trending = await ViewModel.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().valueOf() - TWO_WEEKS) },
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
    const raw_collections: Collection[] = trending.map(t => t._id);
    const collections = raw_collections.filter(c => c && !c.hidden && !c.admin_hidden && c.featured);

    const collectionsResponse = await collectionsToResponse(collections);

    // Append counts
    const response: GetTrendingCollectionResponse = collectionsResponse.map(function (cr, key) {
      return {
        ...cr,
        count: trending[key].count,
      };
    });
    res.status(200).json(response);
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
        (fullCollection.collection.hidden || fullCollection.collection.admin_hidden) &&
        fullCollection.collection.creator !== req.user?.address &&
        fullCollection.collection.admin !== req.user?.address &&
        !ADMINS.includes(req.user?.address || 'fake123')
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

    console.log('BODY', req.body);
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

    // Admin Only Settings
    validator.admin_hidden = req.body.admin_hidden;
    validator.featured = req.body.featured;
    validator.verified = req.body.verified;

    // Verify Input
    await validate(validator);

    // Check if Admin Only settings were changed, and verify if sender is an Admin if so
    if (validator.admin_hidden !== undefined || validator.featured !== undefined || validator.verified !== undefined) {
      if (!ADMINS.includes(req.user.address)) {
        res.status(403).send('Not authorized to change these settings');
        return;
      }
    }

    console.log('collectionId', collectionId);
    // Verify Sender is Collection creator or admin
    // TODO: Allow rewards recipient or metadata owner?
    const collection = await CollectionModel.findById(collectionId).lean();
    if (req.user.address !== collection.creator && req.user.address !== collection.admin && !ADMINS.includes(req.user.address)) {
      res.status(403).send('Not authorized to edit this collection');
      return;
    }

    // Build Profile Object
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
    console.log('Validator', validator);
    const updateCollection: Partial<CollectionClass> = {
      collectionProfile: profileData,
      hidden: validator.hidden ? validator.hidden === 'true' : undefined,
      admin_hidden: validator.admin_hidden ? validator.admin_hidden === 'true' : false,
      featured: validator.featured ? validator.featured === 'true' : undefined,
      verified: validator.verified ? validator.verified === 'true' : undefined,

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
    if (!contractAddress || !isContract(contractAddress)) {
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

    const importResponse = await collectionService.importCollection(contractAddress, validator, req.user, profile_image, banner_image);

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
