import { hash } from 'bcrypt';
import { Collection, marketplace, SortOption, Token } from '@architech/types';
import { HttpException } from '@exceptions/HttpException';
import tokenModel, { TokenClass } from '@models/tokens.model';
import { isEmpty, processAverageColor } from '@utils/util';
import { queryClient as client, queryClient } from '@/utils/chainClients';
import sleep from '@/utils/sleep';
import { cw721 } from '@architech/types';
import equal from 'fast-deep-equal';
import { addTokenId, addTraits, refreshCollection, updateCollection } from './collections.service';
import { getAverageColor } from 'fast-average-color-node';
import { getAllNftInfo, getAsk } from '@architech/lib';
import TokenModel from '@models/tokens.model';
import CollectionModel from '@/models/collections.model';
import { MARKETPLACE_ADDRESS } from '@/config';

const saleOnlyFilter = { ask: { $exists: true, $not: { $type: 'null' } } };

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
  sort: SortOption = 'Token ID',
  traitFilter: cw721.Trait[] = [],
  saleOnly = false,
) {
  if (isEmpty(collectionAddress)) throw new HttpException(400, 'Collection address is empty');

  // ###############################
  // # Create trait filter queries #
  // ###############################

  /* Traits are seperated into categories by trait_type
    { 
      $trait_type: cw721.Trait[];
    }
  */
  const byTrait = {};
  traitFilter.forEach(t => {
    if (byTrait[t.trait_type]) {
      byTrait[t.trait_type].push(t);
    } else {
      byTrait[t.trait_type] = [t];
    }
  });

  // trait_type categories are filtered with $OR
  // Nfts with ANY of the traits in the category are matched
  // These $OR matches are then matches in $AND
  // Matched NFTs will contain a trait from each of the $OR categories
  const andFilters = [];
  Object.keys(byTrait).forEach(key => {
    // Get trait_type category
    const traits = byTrait[key];
    // create $OR filter
    const orFilters = buildOrFilter(traits);
    // Add $OR filter to $AND filter
    andFilters.push(orFilters);
  });

  // Filter for sale NFTs
  const saleFilter = saleOnly ? saleOnlyFilter : {};

  const fullFilter = andFilters.length
    ? {
        $and: andFilters,
        ...saleFilter,
      }
    : {
        ...saleFilter,
      };

  let sortFilter;
  let numericOrdering = false;
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
    case 'Token ID':
      sortFilter = {
        tokenId: 'asc',
      };
      break;
    case 'Lowest Price':
      sortFilter = {
        ask: 'desc',
        'ask.price': 1,
      };
      numericOrdering = true;
      break;
    case 'Highest Price':
      sortFilter = {
        'ask.price': -1,
      };
      numericOrdering = true;
      break;
    default:
      sortFilter = {};
  }

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
      collation: { locale: 'en_US', numericOrdering },
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

export const processCollectionTokens = async (collection: Collection, tokenList: string[]) => {
  for (let i = 0; i < tokenList.length; i++) {
    const token_id = tokenList[i];
    console.log('Processing', token_id, 'on', collection.address);

    await ensureToken(collection.address, token_id);
    await sleep(250);
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
  };

  await updateCollection(collection._id, updateCollectionData);
};

// Imports a token if it does not exist. Updates existing tokens if needed.
export const ensureToken = async (collectionAddress: string, tokenId: string) => {
  // Check if already imported
  const findToken = await TokenModel.findOne({ collectionAddress, tokenId }).populate('collectionInfo').lean();

  let collection: Collection;
  if (!findToken) {
    // Ensure collection exists for unknown token, collection must be imported first
    collection = await CollectionModel.findOne({ address: collectionAddress }).lean();
    if (!collection) {
      console.log(`Skipping import of token ID '${tokenId}' for unknown collection '${collectionAddress}'`);
      return undefined;
    }
  }

  let owner = findToken?.owner;
  let metadataExtension = findToken?.metadataExtension;
  let metadataUri = findToken?.metadataUri;
  let ask: marketplace.Ask;

  // Get NFT Info (owner and metadata)
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

  // ################################
  // # Add Token to DB if Not Found #
  // ################################
  if (!findToken) {
    // Get average image color
    let averageColor = '#232323';
    if (metadataExtension.image) {
      try {
        averageColor = await processAverageColor(metadataExtension.image);
      } catch (err: any) {
        console.error(
          `\nError determining average color.\nCollection: ${collectionAddress}\nToken: ${tokenId}\nImage: ${metadataExtension.image}\nErr:`,
          err,
        );
      }
    }

    // Cleanup Attributes
    const cleanAttributes = [];
    if (metadataExtension.attributes)
      metadataExtension.attributes.forEach(a => {
        if ((!a.trait_type || a.trait_type === '') && (!a.value || a.value === '')) return;
        cleanAttributes.push({
          trait_type: a.trait_type || '',
          value: a.value || '',
          display_type: a.display_type,
        });
      });

    const newTokenData: TokenClass = {
      tokenId,
      collectionAddress,
      collectionInfo: collection._id,
      owner,
      metadataExtension: {
        ...metadataExtension,
        attributes: cleanAttributes,
      },
      metadataUri,
      traits: cleanAttributes,
      averageColor,
      total_views: 0,
    };

    // Add Token ID to Collection Document
    await addTokenId(collectionAddress, tokenId);

    // Add traits to collection document
    await addTraits(collectionAddress, cleanAttributes);

    // Create Token Document, redundant after refresh but fuck it it upserts
    console.log('Creating new token document for', tokenId, 'on', collectionAddress);
    const newToken = await TokenModel.findOneAndUpdate({ tokenId, collectionAddress }, newTokenData, { upsert: true, new: true })
      .populate('collectionInfo') // fresh shit we updated above
      .lean();

    return newToken;
  }

  // ###################################
  // # Update Existing Token if Needed #
  // ###################################
  if (
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
    console.log('Updating token in DB for', tokenId, 'on', collectionAddress);
    const handleAsk = ask ? { ask } : { $unset: { ask: '' } };
    const newTokenData: Partial<Token> = {
      owner,
      metadataExtension,
      metadataUri,
      traits: metadataExtension.attributes,
      ...handleAsk,
    };

    const updatedToken = await TokenModel.findByIdAndUpdate(findToken._id, newTokenData, { new: true });
    const populated = updatedToken.populate('collectionInfo');
    console.log('Returning Updated token!');
    return populated;
  } else {
    return findToken;
  }
};

export const ensureMultiple = async (collectionAddress: string, tokenIds: string[]) => {
  for (const tokenId of tokenIds) {
    await ensureToken(collectionAddress, tokenId);
  }
};
