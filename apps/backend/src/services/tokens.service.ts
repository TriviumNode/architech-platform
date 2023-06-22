import { hash } from 'bcrypt';
import { Collection, CreateTokenDto, Token, UpdateTokenDto } from '@architech/types';
import { HttpException } from '@exceptions/HttpException';
import tokenModel from '@models/tokens.model';
import { isEmpty } from '@utils/util';
import { queryClient as client } from '@/utils/chainClients';
import { getAllNftInfo } from '@/utils/queries/cw721Query';
import sleep from '@/utils/sleep';
import { cw721 } from '@architech/types';
import equal from 'fast-deep-equal';
import { updateCollection } from './collections.service';
import { getAverageColor } from 'fast-average-color-node';

export async function findAllTokens(): Promise<Token[]> {
  const tokens: Token[] = await tokenModel.find();
  return tokens;
}

export async function findCollectionTokens(collectionAddress: string): Promise<Token[]> {
  if (isEmpty(collectionAddress)) throw new HttpException(400, 'Collection address is empty');

  const findTokens: Token[] = await tokenModel.find({ collectionAddress: collectionAddress }).populate('collectionInfo');
  if (!findTokens) throw new HttpException(404, 'No tokens found');

  return findTokens;
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

async function findTokenById(databaseId: string): Promise<Token> {
  if (isEmpty(databaseId)) throw new HttpException(400, 'databaseId is empty');

  const findToken: Token = await tokenModel.findOne({ _id: databaseId });
  if (!findToken) throw new HttpException(404, "Token doesn't exist");

  return findToken;
}

export async function findTokenIdInCollection(tokenId: string, collectionAddress: string): Promise<Token> {
  if (isEmpty(tokenId)) throw new HttpException(400, 'Token ID is empty');
  if (isEmpty(collectionAddress)) throw new HttpException(400, 'Collection Address is empty');

  const findToken: Token = await tokenModel.findOne({ tokenId: tokenId, collectionAddress: collectionAddress }).populate('collectionInfo');
  if (!findToken) throw new HttpException(404, 'Token not found');

  return findToken;
}

export async function createToken(tokenData: CreateTokenDto): Promise<Token> {
  if (isEmpty(tokenData)) throw new HttpException(400, 'tokenData is empty');

  const findToken: Token = await tokenModel.findOne({ collectionAddress: tokenData.collectionAddress, tokenId: tokenData.tokenId });
  if (findToken) throw new HttpException(409, `This Token ID ${tokenData.tokenId} in collection ${tokenData.collectionAddress} already exists`);

  const createTokenData = await tokenModel.create(tokenData);
  await createTokenData.populate('collectionInfo');

  return createTokenData as unknown as Token; //why typescript
}

async function updateToken(databaseId: string, tokenData: Partial<UpdateTokenDto>): Promise<Token> {
  if (isEmpty(tokenData)) throw new HttpException(400, 'tokenData is empty');

  const updateTokenById = await tokenModel.findByIdAndUpdate(databaseId, { ...tokenData });
  if (!updateTokenById) throw new HttpException(404, 'Token not found');
  await updateTokenById.populate('collectionInfo');

  return updateTokenById as unknown as Token;
}

async function deleteToken(databaseId: string): Promise<Token> {
  const deleteTokenById: Token = await tokenModel.findByIdAndDelete(databaseId);
  if (!deleteTokenById) throw new HttpException(404, "Token doesn't exist");

  return deleteTokenById;
}

export const refreshToken = async (token_id: string, collectionAddress: string) => {
  const tokenData = await findTokenIdInCollection(token_id, collectionAddress);
  const {
    info: { extension, token_uri },
    access: { owner },
  } = await getAllNftInfo({
    client,
    contract: collectionAddress,
    token_id,
  });
  if (!equal(extension, tokenData.metadataExtension) || !equal(token_uri, tokenData.metadataUri) || !equal(owner, tokenData.owner)) {
    const updatedData: Partial<CreateTokenDto> = {
      metadataExtension: extension,
      metadataUri: token_uri,
      owner,
    };
    const updatedToken = await updateToken(tokenData._id, updatedData);
    console.log(updatedData, 'ajkabhjkabahj');
    return updatedToken;
  } else {
    return tokenData;
  }
};

export const processCollectionTokens = async (collection: Collection, tokenList: string[]) => {
  for (let i = 0; i < tokenList.length; i++) {
    const token_id = tokenList[i];

    // Skip if already in database
    const inDb: Token = await tokenModel.findOne({ tokenId: token_id, collectionAddress: collection.address });
    if (inDb) continue;

    const {
      info: { extension, token_uri },
      access: { owner },
    } = await getAllNftInfo({
      client,
      contract: collection.address,
      token_id,
    });
    console.log(extension);

    let avgColor = '#232323';
    if (extension.image) {
      let url: string = extension.image as string;
      const isIpfs = url.startsWith('ipfs://');
      if (isIpfs) url = `https://ipfs.filebase.io/ipfs/${url.replace('ipfs://', '')}`;
      try {
        const color = await getAverageColor(url);
        console.log(color);
        avgColor = color.hex;
      } catch (err: any) {
        console.error(`Error determining average color.\nCollection: ${collection.address}\nToken: ${token_id}`, err);
      }
    }

    const createTokenData: CreateTokenDto = {
      collectionAddress: collection.address,
      collectionInfo: collection._id,
      tokenId: token_id,
      metadataUri: token_uri,
      metadataExtension: extension,
      owner,
      averageColor: avgColor,
      total_views: 0,
    };
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
  console.log(traitTypes);
  console.log(traitTypes);
  console.log(traitTypes);
  console.log(traitTypes);
  console.log(traitTypes);
  console.log(traitTypes);
  console.log(traitTypes);
  console.log(traitTypes);
  console.log(traitTypes);
  console.log(traitTypes);
  console.log(traitTypes);
  console.log(traitTypes);
  console.log(traitTypes);
  console.log(traitTypes);
  console.log(traitTypes);
  console.log(traitTypes);
  console.log(traitTypes);
  console.log(traitTypes);
  console.log(traitTypes);
  console.log(traitTypes);
  console.log(traitTypes);
  console.log(traitTypes);
  console.log(traitTypes);
  console.log(traitTypes);

  const updateCollectionData: Partial<Collection> = {
    traits: uniqueTraits,
    traitTypes,
    uniqueTraits: uniqueTraits.length,
  };

  await updateCollection(collection._id, updateCollectionData);
};
