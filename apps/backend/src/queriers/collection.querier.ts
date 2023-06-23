import collectionsModel from '@/models/collections.model';
import TokenModel from '@/models/tokens.model';
import { Collection } from '@architech/types';

export async function findAllCollections(page?: number, limit = 30): Promise<Collection[]> {
  // return await collectionsModel.find();
  const { docs } = await collectionsModel.paginate(
    {
      // collectionAddress: collectionAddress,
      // ...fullFilter,
    },
    {
      page,
      limit,
      // populate: 'collectionInfo',
      lean: true,
      // sort: sortFilter,
    },
  );
  return docs as unknown as Collection[];
}

export async function findCollectionById(collectionId: string): Promise<Collection> {
  return await collectionsModel.findById(collectionId);
}

export async function findCollectionByAddress(collectionAddress: string): Promise<Collection> {
  return await collectionsModel.findOne({ address: collectionAddress });
}

export async function findCollectionsByCreator(creatorAddress: string): Promise<Collection[]> {
  return await collectionsModel.find({ $or: [{ creator: creatorAddress }, { admin: creatorAddress }] });
}
