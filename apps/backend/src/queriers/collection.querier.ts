import collectionsModel from '@/models/collections.model';
import TokenModel from '@/models/tokens.model';
import { Collection } from '@architech/types';

export async function findAllCollections(): Promise<Collection[]> {
  return await collectionsModel.find();
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
