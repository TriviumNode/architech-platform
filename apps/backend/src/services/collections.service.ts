import { hash } from 'bcrypt';
import { HttpException } from '@exceptions/HttpException';
import collectionsModel from '@models/collections.model';
import { isEmpty } from '@utils/util';
import { getAllTokens, getContractInfo, getNumTokens } from '@/utils/queries/cw721Query';
import { queryClient as client, queryClient } from '@/utils/chainClients';
import equal from 'fast-deep-equal';
import { findCollectionTokenCount, processCollectionTokens, processCollectionTraits } from './tokens.service';
import { Collection, GetCollectionResponse } from '@architech/types';
import { CreateCollectionData, StartImportData } from '@/interfaces/collections.interface';
import CollectionModel from '@models/collections.model';
import { MARKETPLACE_ADDRESS } from '@architech/lib';
import { getCollectionAsks } from '@/utils/queries/marketplaceQuery';

export const getFullCollection = async (collectionAddress: string): Promise<GetCollectionResponse> => {
  const collectionData: Collection = await CollectionModel.findOne({ address: collectionAddress });
  if (!collectionData) return undefined;

  const forSale = await getCollectionAsks({
    client: queryClient,
    contract: MARKETPLACE_ADDRESS,
    collection: collectionAddress,
  });

  return {
    collection: collectionData,
    forSale,
  };
};

export async function findCollectionByAddress(address: string): Promise<Collection> {
  if (isEmpty(address)) throw new HttpException(400, 'Contract address is empty');
  console.log(address);
  const findCollection: Collection = await collectionsModel.findOne({ address: address });
  console.log(findCollection);
  if (!findCollection) throw new HttpException(409, 'Collection not found');

  return findCollection;
}

export async function createCollection(collectionData: CreateCollectionData): Promise<Collection> {
  if (isEmpty(collectionData)) throw new HttpException(400, 'collectionData is empty');

  const findCollection: Collection = await collectionsModel.findOne({ address: collectionData.address });
  if (findCollection) throw new HttpException(409, `This collection ${collectionData.address} already exists`);

  const createCollectionData: Collection = await collectionsModel.create({ ...collectionData });

  return createCollectionData;
}

export async function updateCollection(collectionId: string, collectionData: Partial<Collection>): Promise<Collection> {
  if (isEmpty(collectionData)) throw new HttpException(400, 'collectionData is empty');

  // if (collectionData.address) {
  const findCollection: Collection = await collectionsModel.findOne({ _id: collectionId }).lean();
  if (collectionData.address && findCollection && findCollection._id !== collectionId)
    throw new HttpException(409, `This address ${collectionData.address} already exists`);
  // }

  // This can be done better, eventually...
  if (collectionData.collectionProfile) {
    collectionData.collectionProfile = { ...findCollection.collectionProfile, ...collectionData.collectionProfile };
  }
  console.log('collectionData', collectionData);

  const updateCollectionById: Collection = await collectionsModel.findByIdAndUpdate(collectionId, collectionData);
  if (!updateCollectionById) throw new HttpException(409, 'Collection not found');

  return updateCollectionById;
}

export async function updateCollectionTokens(collectionId: string, tokens: string[], totalTokens: number): Promise<Collection> {
  if (isEmpty(tokens)) throw new HttpException(400, 'tokenData is empty');

  const updateCollectionById: Collection = await collectionsModel.findByIdAndUpdate(collectionId, { tokens, totalTokens });
  if (!updateCollectionById) throw new HttpException(409, 'Collection not found');

  return updateCollectionById;
}

export async function deleteCollection(collectionId: string): Promise<Collection> {
  const deleteCollectionById: Collection = await collectionsModel.findByIdAndDelete(collectionId);
  if (!deleteCollectionById) throw new HttpException(409, 'Collection not found');

  return deleteCollectionById;
}

export const startImportCollection = async (contractAddress: string, importData: StartImportData) => {
  // Get Collection Info
  const { name, symbol } = await getContractInfo({ client, contract: contractAddress });
  const totalTokens = await getNumTokens({ client, contract: contractAddress });
  const { admin, creator } = await client.getContract(contractAddress);

  console.log('cw721 stuff', { name, symbol }, { admin, creator });

  console.log('importData', importData);
  const newCollection: CreateCollectionData = {
    address: contractAddress,
    admin: admin,
    cw721_name: name,
    cw721_symbol: symbol,
    creator: creator,
    collectionProfile: {
      name: importData.name,
      description: importData.description,
      profile_image: importData.profile_image,
      banner_image: importData.banner_image,
      website: importData.website,
      twitter: importData.twitter,
      discord: importData.discord,
    },
    categories: importData.categories,
    totalTokens,
    importComplete: false,
    traits: [],
    uniqueTraits: 0,
    hidden: importData.hidden,
  };
  console.log('collectionProfile', newCollection.collectionProfile);
  const result = await createCollection(newCollection);

  // Runs in background
  processCollection(result._id, result, totalTokens);

  return result;
};

const processCollection = async (collectionId: string, collectionData: Collection, numTokens: number) => {
  let workingTokens = [...collectionData.tokenIds];
  console.log('workingTokens', workingTokens);
  while (workingTokens.length < collectionData.totalTokens) {
    const start_after = workingTokens.length ? workingTokens[workingTokens.length - 1] : undefined;

    const tokenResponse = await getAllTokens({
      client,
      contract: collectionData.address,
      start_after,
    });
    console.log('tokenResponse', tokenResponse);

    workingTokens = [...workingTokens, ...tokenResponse];
    await updateCollectionTokens(collectionId, workingTokens, numTokens);
  }
  console.log('COLLECTION ADDR FOR TOKEN PROCES', collectionData.address);
  processCollectionTokens(collectionData, workingTokens);
};

export const refreshCollection = async (contract: string) => {
  const collectionData = await findCollectionByAddress(contract);
  console.log('totalTokens', collectionData.totalTokens);

  const numTokens = await getNumTokens({ client, contract });
  console.log('numTokens', numTokens);

  const processedTokens = await findCollectionTokenCount(contract);
  console.log('processedTokens', processedTokens);

  const { admin, creator } = await client.getContract(contract);

  // TODO rework this entire function
  if (
    !equal(collectionData.totalTokens, numTokens) ||
    !equal(collectionData.admin, admin) ||
    collectionData.tokenIds.length < numTokens ||
    processedTokens < numTokens
  ) {
    console.log('Refreshing!');
    collectionData.admin = admin;
    collectionData.totalTokens = numTokens;
    processCollection(collectionData._id, collectionData, numTokens);
  } else {
    processCollectionTraits(collectionData);
  }

  return collectionData;
};
