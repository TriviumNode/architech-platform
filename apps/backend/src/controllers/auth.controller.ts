import { NextFunction, Request, Response } from 'express';
import { Collection, CreateUserDto, GetUserProfileResponse, RequestWithUser, Token, User, WalletLoginDto } from '@architech/types';
import { getLoginString, resolveArchId } from '@architech/lib';
import * as authService from '@services/auth.service';
import { encodeSecp256k1Pubkey, encodeSecp256k1Signature, pubkeyToAddress } from '@cosmjs/amino';

import { PubKey, StdSignature, StdSignMsg, verifySignature } from '@tendermint/sig';
import { HttpException } from '@/exceptions/HttpException';
import UserModel from '@/models/users.model';
import { isEmpty } from '@/utils/util';
import TokenModel from '@/models/tokens.model';
import CollectionModel from '@/models/collections.model';
import { rotateNonce } from '@/services/users.service';
import { queryDbCollectionsByCreator } from '@/queriers/collection.querier';
import { findUserFavorites } from '@/services/favorites.service';
import { queryClient } from '@/utils/chainClients';
import { ARCHID_ADDRESS, CHAIN_ID } from '@/config';
import {
  EncodeObject,
  encodePubkey,
  isOfflineDirectSigner,
  makeAuthInfoBytes,
  makeSignBytes,
  makeSignDoc,
  OfflineSigner,
  Registry,
  TxBodyEncodeObject,
} from '@cosmjs/proto-signing';
import { decodeSignature } from '@cosmjs/amino';
import { Int53, Uint53 } from '@cosmjs/math';
import { Secp256k1, sha256, Secp256k1Signature } from '@cosmjs/crypto';
import { fromBase64 } from '@cosmjs/encoding';

export const walletLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pubKey, signature }: WalletLoginDto = req.body;
    if (isEmpty(pubKey)) throw new HttpException(400, 'pubKey is empty');
    if (isEmpty(signature)) throw new HttpException(400, 'signature is empty');

    const stdPubKey: PubKey = JSON.parse(pubKey);
    const address = pubkeyToAddress(stdPubKey, process.env.PREFIX);
    const uint8PubKey = fromBase64(stdPubKey.value);

    const stdSig: StdSignature = {
      pub_key: stdPubKey,
      signature,
    };

    // Get Nonce
    const userData: User = await UserModel.findOne({ address: address });
    if (!userData) throw new HttpException(404, 'User not found');
    const loginString = getLoginString(userData.nonce);
    const base64 = Buffer.from(loginString, 'utf-8').toString('base64');

    // Verify Protobuf Signature
    const registry = new Registry();
    const pubkey = encodePubkey(stdPubKey);
    const txBody: TxBodyEncodeObject = {
      typeUrl: '/cosmos.tx.v1beta1.TxBody',
      value: {
        messages: [],
        memo: '',
      },
    };
    const txBodyBytes = registry.encode(txBody);
    const authInfoBytes = makeAuthInfoBytes([{ pubkey, sequence: 0 }], [{ amount: '0', denom: 'uxion' }], 0, '', '');
    const signDoc = makeSignDoc(txBodyBytes, authInfoBytes, process.env.CHAIN_ID, 0);
    const signBytes = makeSignBytes(signDoc);
    const hashedMessage = sha256(signBytes);

    const decodedSig = decodeSignature(stdSig);

    const SecpSig = Secp256k1Signature.fromFixedLength(decodedSig.signature);
    const valid = await Secp256k1.verifySignature(SecpSig, hashedMessage, uint8PubKey);

    console.log('signature', stdSig);
    console.log('authInfo', Buffer.from(authInfoBytes).toString());
    console.log('body', Buffer.from(txBodyBytes).toString());

    // #############

    // const signMsg: StdSignMsg = {
    //   account_number: '0',
    //   sequence: '0',
    //   // chain_id: '',
    //   chain_id: process.env.CHAIN_ID,
    //   memo: '',
    //   fee: { gas: '0', amount: [] },
    //   msgs: [
    //     {
    //       type: 'sign/MsgSignData',
    //       value: {
    //         signer: address,
    //         data: base64,
    //       },
    //     },
    //   ],
    // };

    // const valid = verifySignature(signMsg, stdSig);

    // ############################
    // ############################
    if (!valid) throw new HttpException(401, 'Failed to verify signature.');

    const archIdPromise = resolveArchId(queryClient, ARCHID_ADDRESS, userData.address);

    // Set cookie
    // const { cookie, findUser } = await authService.walletLogin(userData);
    const { tokenData, findUser } = await authService.walletLogin(userData);
    const ownedTokens: Token[] = await TokenModel.find({ owner: findUser.address });
    const ownedCollections = await queryDbCollectionsByCreator(findUser.address);
    const favorites = await findUserFavorites(userData.address);

    // Rotate nonce
    rotateNonce(userData._id);

    const archId = await archIdPromise;

    const response: GetUserProfileResponse = {
      profile: findUser,
      display_name: archId || findUser.username || findUser.address,
      tokens: ownedTokens || [],
      collections: ownedCollections || [],
      favorites: favorites as any,
    };
    // res.setHeader('Set-Cookie', [cookie]);
    res.cookie('Authorization', tokenData.token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: tokenData.expiresIn,
      domain: '.architech.zone',
    });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const logOut = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const userData: User = req.user;
    const logOutUserData: User = await authService.logout(userData);

    res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
    res.status(200).json({ data: logOutUserData, message: 'logout' });
  } catch (error) {
    next(error);
  }
};

export const checkLogin = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const userData: User = req.user;
    const userAddress: string = req.params.userAddress;
    if (userAddress !== userData.address) res.status(400).send('Authorization not valid for this resource.');
    else {
      const archIdPromise = resolveArchId(queryClient, ARCHID_ADDRESS, userData.address);

      // const createdCollections = await CollectionModel.find({ creator: userAddress });
      const createdCollections = await queryDbCollectionsByCreator(userAddress);
      const ownedTokens = await TokenModel.find({ owner: userAddress }).populate('collectionInfo');
      const favorites = await findUserFavorites(userData.address);

      const archId = await archIdPromise;

      const response: GetUserProfileResponse = {
        profile: userData,
        display_name: archId || userData.username || userData.address,
        collections: createdCollections,
        //@ts-expect-error idfk
        tokens: ownedTokens,
        favorites: favorites as any,
      };
      res.status(200).json(response);
    }
  } catch (error) {
    next(error);
  }
};
