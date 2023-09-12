import { HttpException } from '@exceptions/HttpException';
import collectionsModel, { CollectionMinterClass } from '@models/collections.model';

import { isEmpty } from '@utils/util';
import { isContract, queryClient as client, queryClient } from '@/utils/chainClients';

import equal from 'fast-deep-equal';
import { findCollectionTokenCount, findFloor, importUnknownTokens } from './tokens.service';
import { Collection, copyMinter, cw721, GetCollectionResponse, minter, MinterPaymentI, User } from '@architech/types';

import { CreateCollectionData } from '@/interfaces/collections.interface';
import CollectionModel from '@models/collections.model';
import {
  ADMINS,
  getAllTokens,
  getCollectionDossier,
  getConfig,
  getContractInfo,
  getMintStatus,
  getNftInfo,
  getNumTokens,
  resolveArchId,
  resolveIpfs,
} from '@architech/lib';

import { ImportCollectionBodyDto } from '@/dtos/collections.dto';
import { isArray, isBoolean } from 'class-validator';
import fetch from 'node-fetch';
import { hashBuffer, saveBuffer } from '@/middlewares/fileUploadMiddleware';
import mime from 'mime-types';
import mongoose from 'mongoose';
import { ARCHID_ADDRESS, MARKETPLACE_ADDRESS } from '@/config';
import UserModel from '@/models/users.model';

const removeNullUndefined = (obj: any) => Object.entries(obj).reduce((a, [k, v]) => (v == null ? a : ((a[k] = v), a)), {});
const removeId = (obj: any) => Object.entries(obj).reduce((a, [k, v]) => (k == '_id' ? a : ((a[k] = v), a)), {});

export const getFullCollection = async (collectionAddress: string): Promise<GetCollectionResponse> => {
  const collectionData: Collection = await CollectionModel.findOne({ address: collectionAddress });
  if (!collectionData) return undefined;

  const dossier = await getCollectionDossier({
    client: queryClient,
    contract: MARKETPLACE_ADDRESS,
    collection: collectionAddress,
  });

  const creator = collectionData.collectionMinter?.minter_admin || collectionData.creator;
  let display = await resolveArchId(queryClient, ARCHID_ADDRESS, creator);

  if (!display) {
    const user = await UserModel.findOne({ address: creator }).lean();
    if (user && user.username) display = user.username;
  }

  return {
    collection: collectionData,
    asks: dossier.asks,
    volume: dossier.volume,
    full_creator: {
      display,
      address: creator,
    },
    floor: await findFloor(collectionAddress),
  };
};

export async function findCollectionByAddress(address: string): Promise<Collection> {
  if (isEmpty(address)) throw new HttpException(400, 'Contract address is empty');
  const findCollection: Collection = await collectionsModel.findOne({ address: address }).lean();
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

export async function updateCollection(collectionId: mongoose.Types.ObjectId, collectionData: Partial<Collection>): Promise<Collection> {
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

  const updateCollectionById: Collection = await collectionsModel.findByIdAndUpdate(collectionId, collectionData, { new: true });
  if (!updateCollectionById) throw new HttpException(404, 'Collection not found');

  return updateCollectionById;
}

export async function updateCollectionTokens(collectionId: string, tokenIds: string[], totalTokens: number): Promise<Collection> {
  if (isEmpty(tokenIds)) throw new HttpException(400, 'tokenData is empty');

  const updateCollectionById: Collection = await collectionsModel.findByIdAndUpdate(collectionId, { tokenIds, totalTokens }, { new: true });
  if (!updateCollectionById) throw new HttpException(404, 'Collection not found');

  return updateCollectionById;
}

export async function deleteCollection(collectionId: string): Promise<Collection> {
  const deleteCollectionById: Collection = await collectionsModel.findByIdAndDelete(collectionId);
  if (!deleteCollectionById) throw new HttpException(404, 'Collection not found');

  return deleteCollectionById;
}

// Refresh collection list of token IDs
const refreshCollectionTokenList = async (collectionId: string, collectionData: Collection, numTokens: number) => {
  let workingTokens = [];

  // Loop while we know less tokens than the total
  while (workingTokens.length < numTokens) {
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
    importUnknownTokens(collectionData, workingTokens);

    return updatedCollection;
  } else return collectionData;
};

// Internal Use
// Refreshes collection only if needed
export const refreshCollection = async (contract: string) => {
  const knownCollectionData = await findCollectionByAddress(contract);

  // Query collection info from chain
  const numTokensOnChain = await getNumTokens({ client, contract });
  const { admin, creator } = await client.getContract(contract);

  // Get processed tokens from DB
  const numTokensInDB = await findCollectionTokenCount(contract);

  // Check for minter info
  const { minter } = await getMinterInfo(creator);

  // Cleanup undefined fields for comparison
  const cleanNewMinter = removeNullUndefined(minter || {});
  const cleanOldMinter = removeId(removeNullUndefined(knownCollectionData.collectionMinter || {}));

  // ##################################
  // # Refresh tokens async if needed #
  // ##################################
  if (
    !equal(knownCollectionData.totalTokens, numTokensOnChain) ||
    !equal(knownCollectionData.totalTokens, knownCollectionData.tokenIds.length) ||
    knownCollectionData.tokenIds.length < numTokensOnChain ||
    numTokensInDB < numTokensOnChain
  ) {
    console.log('Updating token list for collection', contract);
    refreshCollectionTokenList(knownCollectionData._id.toString(), knownCollectionData, numTokensOnChain);
  }

  // ###############################
  // # Update other info if needed #
  // ###############################
  if (
    !equal(knownCollectionData.admin, admin) ||
    !equal(cleanOldMinter, cleanNewMinter) ||
    !equal(knownCollectionData.totalTokens, numTokensOnChain) ||
    !knownCollectionData.collectionProfile.profile_image
  ) {
    // Ensure pfp
    let pfp = knownCollectionData.collectionProfile.profile_image;
    if (!pfp && knownCollectionData.tokenIds.length) {
      const ensured = await getEnsuredPfp(contract, knownCollectionData.tokenIds);
      pfp = ensured ? ensured : pfp;
    }

    // Save admin, total, and pfp
    const updateData: Partial<Collection> = {
      admin,
      totalTokens: numTokensOnChain,
      collectionProfile: {
        profile_image: pfp,
      },
      collectionMinter: minter,
    };
    const updatedCollection = await updateCollection(knownCollectionData._id, updateData);

    // Return updated data
    return updatedCollection;
  }

  // Else: Return what we already know
  return knownCollectionData;
};

export const importCollection = async (
  contractAddress: string,
  importBody: ImportCollectionBodyDto,
  user: User,
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

  // Check if there is an Architech minter contract for this collection
  const minterResponse = await getMinterInfo(creator);

  // Only allow creator to import
  if (
    user.address !== admin &&
    user.address !== creator &&
    user.address !== minterResponse.minter?.beneficiary &&
    user.address !== minterResponse.minter?.minter_admin &&
    // Allow Architech admins to import anything
    !ADMINS.includes(user.address)
  )
    throw new HttpException(403, 'Collections can only be imported by the collection creator or admin.');

  // Ensure profile image
  if (!profile_image) {
    try {
      console.log('Ensuring PFP', tokenIdList);
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
    creator: minterResponse.actual_creator || creator,
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
    hidden: hidden,
    tokenIds: tokenIdList,
    collectionMinter: minterResponse.minter,
  };
  console.log('collectionProfile', newCollection.collectionProfile);
  const result = await createCollection(newCollection);

  // Runs in background
  refreshCollectionTokenList(result._id.toString(), result, totalTokens);

  return result;
};

const getEnsuredPfp = async (collection: string, tokenList: string[]) => {
  try {
    // Get random token's image to use as profile image
    let random_token = tokenList[Math.floor(Math.random() * tokenList.length)];
    console.log('Random ID', random_token);
    if (!random_token) random_token = tokenList[0];
    const tokenInfo = await getNftInfo({ client, contract: collection, token_id: random_token });
    const imageUrl = tokenInfo.extension?.image;
    if (!imageUrl) throw new Error(); //break

    // Download image URL and save locally
    // TODO handle IPFS
    const res = await fetch(resolveIpfs(imageUrl));
    const contentType = res.headers.get('Content-Type');
    const extension = mime.extension(contentType);

    const buffer = Buffer.from(await res.arrayBuffer());
    const hash = hashBuffer(buffer);

    const fileName = `${hash}.${extension}`;
    saveBuffer(buffer, fileName);
    return fileName;
  } catch (err) {
    console.error('Failed to ensure PFP', err);
  }
};

const getMinterInfo = async (creator: string) => {
  if (isContract(creator)) {
    try {
      // This query will fail allowing us to identify the contract
      const invalidQuery = {
        show_me_some_identification: {},
      };
      await queryClient.queryContractSmart(creator, invalidQuery);
    } catch (e) {
      try {
        // Extract the QueryMsg enum including package name
        const LOOKFOR = 'Error parsing into type ';
        const LOOKFOR2 = ': unknown variant';

        if (e.toString().includes(LOOKFOR)) {
          const index = e.toString().indexOf(LOOKFOR);
          const index2 = e.toString().indexOf(LOOKFOR2);
          const subStr = e.toString().slice(index + LOOKFOR.length, index2);

          // Handle random minter
          if (subStr === 'random_minter::msg::QueryMsg') {
            // Get minter config
            const { config }: { config: minter.Config } = await getConfig({ client: queryClient, contract: creator });
            const { remaining } = await getMintStatus({ client: queryClient, contract: creator });
            console.log('Minter Config', config);
            const payment: MinterPaymentI = config.price
              ? {
                  //@ts-expect-error idk
                  type: config.price.native_payment ? 'NATIVE' : 'CW20',
                  //@ts-expect-error idk
                  denom: config.price.native_payment?.denom,
                  //@ts-expect-error idk
                  token: config.price.cw20_payment?.token,
                  //@ts-expect-error idk
                  amount: config.price.native_payment?.amount || config.price.cw20_payment?.amount,
                }
              : undefined;

            // Determine if ended
            let ended = false;
            if (remaining === 0) ended = true;

            const whitelist_payment: MinterPaymentI = config.wl_price
              ? {
                  //@ts-expect-error idk
                  type: config.wl_price.native_payment ? 'NATIVE' : 'CW20',
                  //@ts-expect-error idk
                  denom: config.wl_price.native_payment?.denom,
                  //@ts-expect-error idk
                  token: config.wl_price.cw20_payment?.token,
                  //@ts-expect-error idk
                  amount: config.wl_price.native_payment?.amount || config.wl_price.cw20_payment?.amount,
                }
              : undefined;

            // Set Random minter data
            const minter: CollectionMinterClass = {
              minter_address: creator,
              minter_type: 'RANDOM',
              minter_admin: config.admin,
              beneficiary: config.beneficiary,
              launch_time: config.launch_time ? (parseInt(config.launch_time) / 1000000000).toString() : undefined,
              whitelist_launch_time: config.whitelist_launch_time ? (parseInt(config.whitelist_launch_time) / 1000000000).toString() : undefined,
              end_time: undefined,
              payment,
              whitelist_payment,
              mint_limit: config.mint_limit,
              max_copies: undefined,
              ended,
            };
            const actual_creator = config.admin;
            return { minter, actual_creator };
          }

          // Handle copy minter
          else if (subStr === 'copy_minter::msg::QueryMsg') {
            // Get minter config
            const { config }: { config: copyMinter.Config } = await getConfig({ client: queryClient, contract: creator });
            const { minted, max_copies } = (await getMintStatus({
              client: queryClient,
              contract: creator,
            })) as unknown as copyMinter.GetMintStatusResponse;

            const payment: MinterPaymentI = config.mint_price
              ? {
                  //@ts-expect-error idk
                  type: config.mint_price.native_payment ? 'NATIVE' : 'CW20',
                  //@ts-expect-error idk
                  denom: config.mint_price.native_payment?.denom,
                  //@ts-expect-error idk
                  token: config.mint_price.cw20_payment?.token,
                  //@ts-expect-error idk
                  amount: config.mint_price.native_payment?.amount || config.mint_price.cw20_payment?.amount || '0',
                }
              : undefined;

            const whitelist_payment: MinterPaymentI = config.wl_mint_price
              ? {
                  //@ts-expect-error idk
                  type: config.wl_mint_price.native_payment ? 'NATIVE' : 'CW20',
                  //@ts-expect-error idk
                  denom: config.wl_mint_price.native_payment?.denom,
                  //@ts-expect-error idk
                  token: config.wl_mint_price.cw20_payment?.token,
                  //@ts-expect-error idk
                  amount: config.wl_mint_price.native_payment?.amount || config.wl_mint_price.cw20_payment?.amount,
                }
              : undefined;

            // Determine if ended
            let ended = false;
            if (max_copies && minted >= max_copies) ended = true;
            if (config.end_time && new Date(parseInt(config.end_time) / 1000000000).valueOf() < new Date().valueOf()) ended = true;
            // Set minter data
            const minter: CollectionMinterClass = {
              minter_address: creator,
              minter_type: 'COPY',
              minter_admin: config.minter_admin as string,
              beneficiary: config.beneficiary,
              launch_time: config.launch_time ? (parseInt(config.launch_time) / 1000000000).toString() : undefined,
              whitelist_launch_time: config.whitelist_launch_time ? (parseInt(config.whitelist_launch_time) / 1000000000).toString() : undefined,
              end_time: config.end_time ? (parseInt(config.end_time) / 1000000000).toString() : undefined,
              payment,
              whitelist_payment,
              mint_limit: config.mint_limit,
              max_copies: config.max_copies,
              ended,
            };
            const actual_creator = config.minter_admin;
            return { minter, actual_creator };
          }
        }
      } catch (error) {
        console.error('Error getting minter info:', error);
      }
    }
  }
  return { minter: undefined, actual_creator: creator };
};

// Add an array of traits to a collection's document if they are not already added
export const addTraits = async (collectionAddress: string, traits: cw721.Trait[]) => {
  const collection = await CollectionModel.findOne({ address: collectionAddress }).lean();
  if (!collection) {
    throw new Error(
      `Unable to add trait to collection not in database!\n
       Collection Address: ${collectionAddress}\n
       Traits: ${JSON.stringify(traits, undefined, 2)}`,
    );
  }

  const newTraits: cw721.Trait[] = [...collection.traits];
  const traitTypes: string[] = [...collection.traitTypes];

  for (const trait of traits) {
    if (newTraits.find(t => t.trait_type === trait.trait_type && t.value === trait.value)) continue;
    if (!traitTypes.includes(trait.trait_type)) traitTypes.push(trait.trait_type);
    newTraits.push(trait);
  }

  const updateCollectionData: Partial<Collection> = { traits, traitTypes };

  return await updateCollection(collection._id, updateCollectionData);
};

export const addTokenId = async (collectionAddress: string, tokenId: string) => {
  await CollectionModel.updateOne({ address: collectionAddress }, { $addToSet: { tokenIds: tokenId } });
};
