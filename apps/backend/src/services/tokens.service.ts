import { hash } from 'bcrypt';
import { Collection, marketplace, SortOption, Token } from '@architech/types';
import { HttpException } from '@exceptions/HttpException';
import tokenModel, { TokenClass } from '@models/tokens.model';
import { isEmpty, processAverageColor } from '@utils/util';
import { queryClient as client, queryClient } from '@/utils/chainClients';
import sleep from '@/utils/sleep';
import { cw721 } from '@architech/types';
import equal from 'fast-deep-equal';
import { updateCollection } from './collections.service';
import { getAverageColor } from 'fast-average-color-node';
import { getAllNftInfo, getAsk, MARKETPLACE_ADDRESS } from '@architech/lib';
import TokenModel from '@models/tokens.model';
import CollectionModel from '@/models/collections.model';

export async function findAllTokens(): Promise<Token[]> {
  const tokens: Token[] = await tokenModel.find();
  return tokens;
}

const buildOrFilter = (traits: cw721.Trait[]) => {
  const filters = [];
  traits.forEach(t => {
    filters.push({
      traits: {
        $elemMatch: { trait_type: t.trait_type, value: t.value },
      },
    });
  });

  const filter = filters.length
    ? {
        $or: filters,
      }
    : {};
  return filter;
};

export async function findCollectionTokens(
  collectionAddress: string,
  page = 1,
  limit = 30,
  sort: SortOption = 'Name',
  traitFilter: cw721.Trait[] = [],
) {
  if (isEmpty(collectionAddress)) throw new HttpException(400, 'Collection address is empty');

  const byTrait = {};
  traitFilter.forEach(t => {
    if (byTrait[t.trait_type]) {
      byTrait[t.trait_type].push(t);
    } else {
      byTrait[t.trait_type] = [t];
    }
  });
  console.log('byTrait', byTrait);

  const andFilters = [];
  Object.keys(byTrait).forEach(key => {
    const traits = byTrait[key];
    const orFilters = buildOrFilter(traits);
    andFilters.push(orFilters);
  });

  const fullFilter = andFilters.length
    ? {
        $and: andFilters,
      }
    : {};
  console.log('fullFilter', fullFilter);

  // const filter = buildOrFilter(traitFilter);

  let sortFilter;
  switch (sort) {
    case 'Name':
      sortFilter = {
        'metadataExtension.name': 'asc',
      };
      break;
    case 'Most Viewed':
      sortFilter = {
        total_views: 'desc',
      };
      break;
    case 'Recently Created':
      sortFilter = {
        createdAt: -1,
      };
      break;
    default:
      sortFilter = {};
  }
  console.log('sortFilter', sort, sortFilter);
  const { docs }: { docs: any[] } = await tokenModel.paginate(
    {
      collectionAddress: collectionAddress,
      ...fullFilter,
    },
    {
      page,
      limit,
      populate: 'collectionInfo',
      lean: true,
      sort: sortFilter,
    },
  );
  // .populate('collectionInfo');
  if (!docs) throw new HttpException(404, 'No tokens found');

  return docs;
}

export async function findTokensByOwner(owner: string): Promise<Token[]> {
  if (isEmpty(owner)) throw new HttpException(400, 'Owner address is empty');

  const findTokens: Token[] = await tokenModel.find({ owner: owner }).populate('collectionInfo');
  if (!findTokens) throw new HttpException(404, 'No tokens found');

  return findTokens;
}

export async function findCollectionTokenCount(collectionAddress: string): Promise<number> {
  if (isEmpty(collectionAddress)) throw new HttpException(400, 'Collection address is empty');

  const findTokensCount: number = await tokenModel.count({ collectionAddress: collectionAddress });
  return findTokensCount;
}

export async function findTokenIdInCollection(tokenId: string, collectionAddress: string): Promise<Token> {
  if (isEmpty(tokenId)) throw new HttpException(400, 'Token ID is empty');
  if (isEmpty(collectionAddress)) throw new HttpException(400, 'Collection Address is empty');

  const findToken: Token = await tokenModel.findOne({ tokenId: tokenId, collectionAddress: collectionAddress }).populate('collectionInfo');
  if (!findToken) throw new HttpException(404, 'Token not found');

  return findToken;
}

export async function createToken(tokenData: TokenClass): Promise<Token> {
  if (isEmpty(tokenData)) throw new HttpException(400, 'tokenData is empty');

  const findToken: Token = await tokenModel.findOne({ collectionAddress: tokenData.collectionAddress, tokenId: tokenData.tokenId });
  if (findToken) throw new HttpException(409, `This Token ID ${tokenData.tokenId} in collection ${tokenData.collectionAddress} already exists`);
  console.log('Creating token with data ', tokenData);
  const createTokenData = await tokenModel.create(tokenData);
  await createTokenData.populate('collectionInfo');

  return createTokenData as unknown as Token; //why typescript
}

export const processCollectionTokens = async (collection: Collection, tokenList: string[]) => {
  for (let i = 0; i < tokenList.length; i++) {
    const token_id = tokenList[i];
    console.log('Processing', token_id);

    // Skip if already in database
    const inDb: Token = await tokenModel.findOne({ tokenId: token_id, collectionAddress: collection.address });
    console.log('inDb', inDb);
    if (inDb) continue;

    const {
      info: { extension, token_uri },
      access: { owner },
    } = await getAllNftInfo({
      client,
      contract: collection.address,
      token_id,
    });
    console.log({ extension, token_uri, owner });

    let avgColor = '#232323';
    if (extension.image) {
      let url: string = extension.image as string;
      const isIpfs = url.startsWith('ipfs://');
      if (isIpfs) url = `https://ipfs.filebase.io/ipfs/${url.replace('ipfs://', '')}`;
      try {
        const color = await getAverageColor(url);
        avgColor = color.hex;
      } catch (err: any) {
        console.error(`Error determining average color.\nCollection: ${collection.address}\nToken: ${token_id}`, err);
      }
    }
    console.log('avgColor', avgColor);

    const createTokenData: TokenClass = {
      collectionAddress: collection.address,
      collectionInfo: collection._id,
      tokenId: token_id,
      metadataUri: token_uri,
      metadataExtension: extension,
      owner,
      averageColor: avgColor,
      total_views: 0,
      traits: (extension?.attributes as cw721.Trait[]) || [],
    };
    console.log('createTokenData', createTokenData);
    await createToken(createTokenData);
    await sleep(200);
  }
  processCollectionTraits(collection);
};

export const processCollectionTraits = async (collection: Collection) => {
  const tokens = await findCollectionTokens(collection.address);

  const uniqueTraits: cw721.Trait[] = [];
  const traitTypes: string[] = [];
  tokens.forEach(token => {
    if (!token.metadataExtension.attributes || !token.metadataExtension.attributes.length) return;

    token.metadataExtension.attributes.forEach(attribute => {
      const exists = uniqueTraits.find(trait => attribute.trait_type === trait.trait_type && attribute.value === trait.value);
      if (!exists) uniqueTraits.push(attribute);

      const typeExists = traitTypes.find(type => type === attribute.trait_type);
      if (!typeExists) traitTypes.push(attribute.trait_type);
    });
  });
  const updateCollectionData: Partial<Collection> = {
    traits: uniqueTraits,
    traitTypes,
    uniqueTraits: uniqueTraits.length,
  };

  await updateCollection(collection._id, updateCollectionData);
};

export const ensureToken = async (collectionAddress: string, tokenId: string) => {
  // Check if already imported
  const findToken = await TokenModel.findOne({ collectionAddress, tokenId }).populate('collectionInfo').lean();

  let collection: Collection;
  if (!findToken) {
    // Ensure collection exists for unknown token, collection must be imported first
    collection = await CollectionModel.findOne({ address: collectionAddress }).lean();
    if (!collection) return undefined;
  }

  let ask: marketplace.Ask;
  let owner = findToken?.owner;
  let metadataExtension = findToken?.metadataExtension;
  let metadataUri = findToken?.metadataUri;

  // Get NFT Info
  try {
    const {
      info: { extension, token_uri },
      access,
    } = await getAllNftInfo({ client: queryClient, contract: collectionAddress, token_id: tokenId });
    owner = access.owner;
    metadataExtension = extension;
    metadataUri = token_uri;
  } catch (err: any) {
    // ToDo handle specific errors
    console.error('Error querying token NFT info:', err);

    // If token is unknown and unable to fetch from chain, return no result.
    if (!findToken) return undefined;
  }

  // Get ask from marketplace (if any)
  try {
    const currentAsk = await getAsk({
      client: queryClient,
      collection: collectionAddress,
      contract: MARKETPLACE_ADDRESS,
      token_id: tokenId,
    });
    if (currentAsk) {
      ask = currentAsk;
      if (owner === MARKETPLACE_ADDRESS) owner = currentAsk.seller;
    }
  } catch (err: any) {
    console.error('Error querying token Ask:', err);
  }

  if (!findToken) {
    // Add to DB

    // Get average image color
    let averageColor = '#232323';
    if (metadataExtension.image) {
      try {
        averageColor = await processAverageColor(metadataExtension.image);
      } catch (err: any) {
        console.error(`Error determining average color.\nCollection: ${collectionAddress}\nToken: ${tokenId}`, err);
      }
    }

    const newTokenData: TokenClass = {
      tokenId,
      collectionAddress: collectionAddress,
      collectionInfo: collection._id,
      owner,
      metadataExtension,
      metadataUri,
      traits: metadataExtension.attributes || [],
      averageColor,
      total_views: 0,
    };
    console.log('CREATING NEW TOKEN DOCUMENT');
    const newToken = await TokenModel.create(newTokenData);
    const populated = await newToken.populate('collectionInfo');
    // await newToken.populate('traits');
    return populated;
  } else if (
    !equal(
      {
        ask,
        owner,
        metadataExtension,
        metadataUri,
      },
      {
        ask: findToken.ask,
        owner: findToken.owner,
        metadataExtension: findToken.metadataExtension,
        metadataUri: findToken.metadataUri,
      },
    )
  ) {
    // Update DB
    console.log('Updating token in DB');
    const newTokenData: Partial<Token> = {
      owner,
      metadataExtension,
      metadataUri,
      traits: metadataExtension.attributes,
      ask,
    };

    const updatedToken = await TokenModel.findByIdAndUpdate(findToken._id, newTokenData);
    const populated = updatedToken.populate('collectionInfo');
    console.log('Returning Updated token!');
    return populated;
  } else {
    console.log('Returning DB token');
    return findToken;
  }
};
