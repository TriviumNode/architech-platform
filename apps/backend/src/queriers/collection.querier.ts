import { getBatchCollectionDossier, getMintStatus, resolveArchId } from '@architech/lib';
import collectionsModel from '@/models/collections.model';
import TokenModel from '@/models/tokens.model';
import { queryClient } from '@/utils/chainClients';
import { Collection, copyMinter, GetCollectionResponse } from '@architech/types';
import { ARCHID_ADDRESS, MARKETPLACE_ADDRESS } from '@/config';
import UserModel from '@/models/users.model';
import { refreshCollection } from '@/services/collections.service';

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

    // Build Collection Responses
    // const result: GetCollectionResponse[] = collections.map(function (collection, key) {
    const result: GetCollectionResponse[] = [];
    for (let i = 0; i < collections.length; i++) {
      const collection = collections[i];
      const c = collection.collectionMinter?.minter_admin || collection.creator;
      const user = await UserModel.findOne({ address: c }).lean();

      let display = user?.username || c;

      if (collections.length === 1) {
        const archId = await resolveArchId(queryClient, ARCHID_ADDRESS, c);
        if (archId) display = archId;
      }

      result.push({
        collection,
        asks: dossiers[i].asks,
        volume: dossiers[i].volume,
        full_creator: {
          address: c,
          display,
        },
      });
    }
    return result;
  } catch (err: any) {
    // Handle query error
    console.error('ERROR QUERYING MARKETPLACE', err);

    // Build result with empty dossier data
    // const result: GetCollectionResponse[] = collections.map(function (collection, key) {
    const result: GetCollectionResponse[] = [];
    for (let i = 0; i < collections.length; i++) {
      const collection = collections[i];
      const c = collection.collectionMinter?.minter_admin || collection.creator;
      const user = await UserModel.findOne({ address: c }).lean();
      result.push({ collection, asks: [], volume: [], full_creator: { address: c, display: user.username || c } });
    }
    return result;
  }
};

export async function queryDbCollections(query: any = {}, page = 1, limit = 30): Promise<GetCollectionResponse[]> {
  console.log('Query Start', page, limit);
  const hideHidden = { hidden: false };
  const { docs } = await collectionsModel.paginate(
    { ...hideHidden, ...query },
    {
      page,
      limit,
      lean: true,
      // sort: sortFilter,
    },
  );
  console.log('Query End');
  const response = await collectionsToResponse(docs as unknown as Collection[]);
  return response;
}

export async function queryDbCollectionById(collectionId: string): Promise<GetCollectionResponse> {
  const collection = await collectionsModel.findById(collectionId);
  return (await collectionsToResponse([collection]))[0];
}

export async function queryDbCollectionByAddress(collectionAddress: string): Promise<GetCollectionResponse> {
  let collection = (await collectionsModel.findOne({ address: collectionAddress }).lean()) as Collection;

  // Check if active minter has ended
  if (!!collection.collectionMinter && !collection.collectionMinter.ended) {
    console.log('Minter seems to be active');

    // Refresh if past end time
    if (collection.collectionMinter.end_time && new Date(parseInt(collection.collectionMinter.end_time) * 1000).valueOf() < new Date().valueOf()) {
      console.log('Minter is past end time');
      collection = await refreshCollection(collection.address);
    }
    // Otherwise query minter status and refresh if sold out
    else {
      try {
        const minterStatus = await getMintStatus({
          client: queryClient,
          contract: collection.collectionMinter.minter_address,
        });
        //@ts-expect-error Different minter types but checking them both
        if (minterStatus.remaining === 0 || (minterStatus.max_copies && minterStatus.minted >= minterStatus.max_copies)) {
          console.log('Minter is sold out');
          collection = await refreshCollection(collection.address);
        }
      } catch (error) {
        console.error('Failed to query Mint Status:', error.toString());
      }
    }
  }

  return (await collectionsToResponse([collection]))[0];
}

export async function queryDbCollectionsByCreator(creatorAddress: string): Promise<GetCollectionResponse[]> {
  const collections = await collectionsModel.find({ $or: [{ creator: creatorAddress }, { admin: creatorAddress }] });
  return await collectionsToResponse(collections);
}
