import { NextFunction, Request, Response } from 'express';
import { Collection, CreateUserDto, GetUserProfileResponse, RequestWithUser, Token, User, WalletLoginDto } from '@architech/types';
import { getLoginString, resolveArchId } from '@architech/lib';
import * as authService from '@services/auth.service';
import { pubkeyToAddress } from '@cosmjs/amino';

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

export const walletLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pubKey, signature }: WalletLoginDto = req.body;
    if (isEmpty(pubKey)) throw new HttpException(400, 'pubKey is empty');
    if (isEmpty(signature)) throw new HttpException(400, 'signature is empty');

    const stdPubKey: PubKey = JSON.parse(pubKey);
    const address = pubkeyToAddress(stdPubKey, process.env.PREFIX);

    // Validate Signature
    const userData: User = await UserModel.findOne({ address: address });
    if (!userData) throw new HttpException(404, 'User not found');

    const loginString = getLoginString(userData.nonce);
    const base64 = Buffer.from(loginString, 'utf-8').toString('base64');

    const signMsg: StdSignMsg = {
      account_number: '0',
      sequence: '0',
      chain_id: '',
      memo: '',
      fee: { gas: '0', amount: [] },
      msgs: [
        {
          type: 'sign/MsgSignData',
          value: {
            signer: address,
            data: base64,
          },
        },
      ],
    };

    const stdSig: StdSignature = {
      pub_key: stdPubKey,
      signature,
    };

    const valid = verifySignature(signMsg, stdSig);
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
