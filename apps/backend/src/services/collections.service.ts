import { hash } from 'bcrypt';
import { HttpException } from '@exceptions/HttpException';
import collectionsModel from '@models/collections.model';
import { isEmpty } from '@utils/util';
import { queryClient as client, queryClient } from '@/utils/chainClients';
import equal from 'fast-deep-equal';
import { findCollectionTokenCount, processCollectionTokens, processCollectionTraits } from './tokens.service';
import { Collection, cw721, GetCollectionResponse, marketplace } from '@architech/types';
import { CreateCollectionData, StartImportData } from '@/interfaces/collections.interface';
import CollectionModel from '@models/collections.model';
import { getAllTokens, getCollectionAsks, getContractInfo, getNftInfo, getNumTokens, getTokenInfo, MARKETPLACE_ADDRESS } from '@architech/lib';
import { ImportCollectionBodyDto } from '@/dtos/collections.dto';
import { isArray, isBoolean } from 'class-validator';
import fetch from 'node-fetch';
import { hashBuffer, saveBuffer } from '@/middlewares/fileUploadMiddleware';
import mime from 'mime-types';

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
    forSale: forSale as marketplace.Ask[],
  };
};

export async function findCollectionByAddress(address: string): Promise<Collection> {
  if (isEmpty(address)) throw new HttpException(400, 'Contract address is empty');
  console.log(address);
  const findCollection: Collection = await collectionsModel.findOne({ address: address });
  console.log(findCollection);
  if (!findCollection) throw new HttpException(404, 'Collection not found');

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
  if (!updateCollectionById) throw new HttpException(404, 'Collection not found');

  return updateCollectionById;
}

export async function updateCollectionTokens(collectionId: string, tokens: string[], totalTokens: number): Promise<Collection> {
  if (isEmpty(tokens)) throw new HttpException(400, 'tokenData is empty');

  const updateCollectionById: Collection = await collectionsModel.findByIdAndUpdate(collectionId, { tokens, totalTokens });
  if (!updateCollectionById) throw new HttpException(404, 'Collection not found');

  return updateCollectionById;
}

export async function deleteCollection(collectionId: string): Promise<Collection> {
  const deleteCollectionById: Collection = await collectionsModel.findByIdAndDelete(collectionId);
  if (!deleteCollectionById) throw new HttpException(404, 'Collection not found');

  return deleteCollectionById;
}

// export const startImportCollection = async (contractAddress: string, importData: StartImportData) => {
//   // Get Collection Info
//   const { name, symbol } = await getContractInfo({ client, contract: contractAddress });
//   const totalTokens = await getNumTokens({ client, contract: contractAddress });
//   const { admin, creator } = await client.getContract(contractAddress);

//   console.log('cw721 stuff', { name, symbol }, { admin, creator });

//   console.log('importData', importData);
//   const newCollection: CreateCollectionData = {
//     address: contractAddress,
//     admin: admin,
//     cw721_name: name,
//     cw721_symbol: symbol,
//     creator: creator,
//     collectionProfile: {
//       name: importData.name,
//       description: importData.description,
//       profile_image: importData.profile_image,
//       banner_image: importData.banner_image,
//       website: importData.website,
//       twitter: importData.twitter,
//       discord: importData.discord,
//     },
//     categories: importData.categories,
//     totalTokens,
//     importComplete: false,
//     traits: [],
//     uniqueTraits: 0,
//     hidden: importData.hidden,
//   };
//   console.log('collectionProfile', newCollection.collectionProfile);
//   const result = await createCollection(newCollection);

//   // Runs in background
//   refreshCollectionTokenList(result._id, result, totalTokens);

//   return result;
// };

// Refresh collection list of token IDs
const refreshCollectionTokenList = async (collectionId: string, collectionData: Collection, numTokens: number) => {
  // Known IDs
  let workingTokens = [...collectionData.tokenIds];
  console.log('workingTokens', workingTokens);

  // Loop while we know less tokens than the total
  while (workingTokens.length < collectionData.totalTokens) {
    const start_after = workingTokens.length ? workingTokens[workingTokens.length - 1] : undefined;

    const tokenResponse = await getAllTokens({
      client,
      contract: collectionData.address,
      start_after,
    });
    console.log('Get Token Page Response', tokenResponse);

    // Add token IDs to known IDs
    workingTokens = [...workingTokens, ...tokenResponse];
  }
  if (workingTokens.length) {
    const updatedCollection = await updateCollectionTokens(collectionId, workingTokens, numTokens);
    processCollectionTokens(collectionData, workingTokens);
    return updatedCollection;
  } else return collectionData;
};

// Internal Use
// Refreshes collection if needed
export const refreshCollection = async (contract: string) => {
  console.log('Trying Refresh for', contract);
  const knownCollectionData = await findCollectionByAddress(contract);
  console.log('Known Total Tokens', knownCollectionData.totalTokens);

  // Query collection info from chain
  const numTokens = await getNumTokens({ client, contract });
  const { admin } = await client.getContract(contract);

  // Get processed tokens from DB
  const processedTokens = await findCollectionTokenCount(contract);
  console.log('Processed Tokens', processedTokens);

  // Check if update is needed
  if (
    !equal(knownCollectionData.totalTokens, numTokens) ||
    !equal(knownCollectionData.admin, admin) ||
    !equal(knownCollectionData.totalTokens, knownCollectionData.tokenIds.length) ||
    knownCollectionData.tokenIds.length < numTokens ||
    processedTokens < numTokens ||
    !knownCollectionData.collectionProfile.profile_image
  ) {
    console.log('Refreshing!');

    // ensure pfp
    let pfp = knownCollectionData.collectionProfile.profile_image;
    console.log('Existing PFP', pfp);
    if (!pfp && knownCollectionData.tokenIds.length) {
      console.log('Ensuring PFP');
      const ensured = await getEnsuredPfp(contract, knownCollectionData.tokenIds);
      pfp = ensured ? ensured : pfp;
    }

    // Save admin, total, and pfp
    const updateData: Partial<Collection> = {
      admin,
      totalTokens: numTokens,
      collectionProfile: {
        profile_image: pfp,
      },
    };
    const updatedCollection = await updateCollection(knownCollectionData._id, updateData);

    // Start refreshing tokens
    refreshCollectionTokenList(updatedCollection._id, updatedCollection, numTokens);

    // Return updated data
    return updatedCollection;
  } else {
    // No differences found, but lets update trait stats async
    processCollectionTraits(knownCollectionData);
  }

  // Return what we already know if nothing else was returned
  return knownCollectionData;
};

export const importCollection = async (
  contractAddress: string,
  importBody: ImportCollectionBodyDto,
  profile_image?: string,
  banner_image?: string,
) => {
  console.log('Starting import of', contractAddress);
  console.log('Import Body', importBody);

  // Query collection info from chain
  const { name: cw721_name, symbol: cw721_symbol } = await getContractInfo({ client, contract: contractAddress });
  const totalTokens = await getNumTokens({ client, contract: contractAddress });
  const { admin, creator } = await client.getContract(contractAddress);
  const tokenIdList = await getAllTokens({ client, contract: contractAddress });
  console.log('cw721 stuff', { cw721_name, cw721_symbol, admin, creator, tokenIdList });

  // Ensure profile image
  if (!profile_image) {
    try {
      profile_image = await getEnsuredPfp(contractAddress, tokenIdList);
    } catch {}
  }

  // Try to parse categories
  let categories = [];
  try {
    const tryCat = JSON.parse(importBody.categories);
    if (isArray(tryCat)) {
      const invalid = tryCat.some(function myfunction(item) {
        // checking the type of every item and if it is object it returns true.
        return typeof item !== 'string';
      });
      console.log('invalid', invalid);
      if (!invalid) categories = tryCat;
    }
  } catch {}

  // Try to parse hidden
  let hidden = false;
  try {
    const tryHidden = JSON.parse(importBody.hidden);
    if (isBoolean(tryHidden)) {
      hidden = tryHidden;
    }
  } catch {}

  const newCollection: CreateCollectionData = {
    address: contractAddress,
    admin: admin,
    cw721_name,
    cw721_symbol,
    creator: creator,
    collectionProfile: {
      name: importBody.name || cw721_name,
      description: importBody.description,
      profile_image: profile_image,
      banner_image: banner_image,
      website: importBody.website,
      twitter: importBody.twitter,
      discord: importBody.discord,
      telegram: importBody.telegram,
    },
    categories: categories,
    totalTokens,
    importComplete: false,
    traits: [],
    uniqueTraits: 0,
    hidden: hidden,
    tokenIds: tokenIdList,
  };
  console.log('collectionProfile', newCollection.collectionProfile);
  const result = await createCollection(newCollection);

  // Runs in background
  refreshCollectionTokenList(result._id, result, totalTokens);

  return result;
};

const getEnsuredPfp = async (collection: string, tokenList: string[]) => {
  try {
    // Get random token's image to use as profile image
    const random_token = tokenList[Math.floor(Math.random() * tokenList.length)];
    const tokenInfo = await getNftInfo({ client, contract: collection, token_id: random_token });
    const imageUrl = tokenInfo.extension?.image;
    if (!imageUrl) throw new Error(); //break

    // Download image URL and save locally
    // TODO handle IPFS
    const res = await fetch(imageUrl);
    const contentType = res.headers.get('Content-Type');
    const extension = mime.extension(contentType);

    const buffer = Buffer.from(await res.arrayBuffer());
    const hash = hashBuffer(buffer);

    const fileName = `${hash}.${extension}`;
    saveBuffer(buffer, fileName);
    return fileName;
  } catch {}
};
