import { getBatchCollectionDossier, MARKETPLACE_ADDRESS } from '@/../../../packages/architech-lib/dist';
import collectionsModel from '@/models/collections.model';
import TokenModel from '@/models/tokens.model';
import { queryClient } from '@/utils/chainClients';
import { Collection, GetCollectionResponse } from '@architech/types';

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

export async function queryDbCollections(query = {}, page?: number, limit = 30): Promise<GetCollectionResponse[]> {
  const { docs } = await collectionsModel.paginate(query, {
    page,
    limit,
    lean: true,
    // sort: sortFilter,
  });
  const response = await collectionsToResponse(docs as unknown as Collection[]);
  return response;
}

export async function queryDbCollectionById(collectionId: string): Promise<GetCollectionResponse> {
  const collection = await collectionsModel.findById(collectionId);
  return (await collectionsToResponse([collection]))[0];
}

export async function queryDbCollectionByAddress(collectionAddress: string): Promise<GetCollectionResponse> {
  const collection = await collectionsModel.findOne({ address: collectionAddress });
  return (await collectionsToResponse([collection]))[0];
}

export async function queryDbCollectionsByCreator(creatorAddress: string): Promise<GetCollectionResponse[]> {
  const collections = await collectionsModel.find({ $or: [{ creator: creatorAddress }, { admin: creatorAddress }] });
  return await collectionsToResponse(collections);
}
