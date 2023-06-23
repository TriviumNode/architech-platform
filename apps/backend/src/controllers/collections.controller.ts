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
import { findAllCollections } from '@/queriers/collection.querier';
import { validate } from 'class-validator';
import { StartImportData } from '@/interfaces/collections.interface';
import { View } from '@/interfaces/views.interface';
import ViewModel from '@/models/views.model';
import CollectionModel from '@/models/collections.model';
import mongoose from 'mongoose';
import { RequestWithImages } from '@/middlewares/fileUploadMiddleware';
import { HttpException } from '@/exceptions/HttpException';
import { getBatchCollectionDossier, MARKETPLACE_ADDRESS } from '@/../../../packages/architech-lib/dist';

export const collectionsToResponse = async (collections: Collection[]): Promise<GetCollectionResponse[]> => {
  // Get array of cw721 addresses
  const addresses = collections.map(t => t.address);

  try {
    // Query collection dossier from marketplace
    const dossiers = await getBatchCollectionDossier({
      client: queryClient,
      collections: addresses,
      contract: MARKETPLACE_ADDRESS,
    });

    console.log('MATCH?', dossiers[3], collections[3]);

    // Build Collection Responses
    const result: GetCollectionResponse[] = collections.map(function (collection, key) {
      return {
        collection,
        asks: dossiers[key].asks,
        volume: dossiers[key].volume,
      };
    });
    return result;
  } catch (err: any) {
    // Handle query error
    console.error('ERROR QUERYING MARKETPLACE', err);

    // Build result with empty dossier data
    const result: GetCollectionResponse[] = collections.map(function (collection, key) {
      return { collection, asks: [], volume: [] };
    });
    return result;
  }
};

export const getAllCollections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const paginatedCollections: Collection[] = await findAllCollections(page, limit);

    // Generate GetCollectionResponse objects by querying marketplace
    const response = await collectionsToResponse(paginatedCollections);

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

    const collections: Collection[] = trending.map(t => t._id);
    const collectionsResponse = await collectionsToResponse(collections);

    // Append counts
    const response: GetTrendingCollectionResponse = collectionsResponse.map(function (cr, key) {
      return {
        // collection: elm._id,
        // count: elm.count,
        // asks: dossiers[key].asks,
        // volume: dossiers[key].volume,
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

export const getCollectionByAddress = async (req: RequestWithOptionalUser, res: Response, next: NextFunction) => {
  try {
    const userId: string = req.user?._id;
    const collectionAddress: string = req.params.contractAddr;
    // const collectionData: Collection = await collectionService.findCollectionByAddress(collectionAddress);
    const fullCollection = await collectionService.getFullCollection(collectionAddress);

    if (fullCollection) {
      // Increment view count
      const view: View = {
        collectionRef: fullCollection.collection._id,
        viewer: userId ? userId : undefined,
      };
      console.log('adding view', view);
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
    console.log('Admin Importing ', contractAddress);

    const importResponse = await collectionService.importCollection(contractAddress, { name: '', hidden: 'true', categories: '[]' });

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

    const updated: Collection = await collectionService.updateCollection(collectionId, updateCollection);
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
