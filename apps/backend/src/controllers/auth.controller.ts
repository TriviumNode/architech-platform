import { NextFunction, Request, Response } from 'express';
import { Collection, CreateUserDto, GetUserProfileResponse, RequestWithUser, Token, User, WalletLoginDto } from '@architech/types';
import { getLoginString } from '@architech/lib';
import * as authService from '@services/auth.service';
import { pubkeyToAddress } from '@cosmjs/amino';

import { PubKey, StdSignature, StdSignMsg, verifySignature } from '@tendermint/sig';
import { HttpException } from '@/exceptions/HttpException';
import UserModel from '@/models/users.model';
import { isEmpty } from '@/utils/util';
import TokenModel from '@/models/tokens.model';
import CollectionModel from '@/models/collections.model';

// export const signUp = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const userData: CreateUserDto = req.body;
//     const signUpUserData: User = await this.authService.signup(userData);

//     res.status(201).json({ data: signUpUserData, message: 'signup' });
//   } catch (error) {
//     next(error);
//   }
// };

// export const logIn = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const userData: CreateUserDto = req.body;
//     const { cookie, findUser } = await this.authService.login(userData);

//     res.setHeader('Set-Cookie', [cookie]);
//     res.status(200).json({ data: findUser, message: 'login' });
//   } catch (error) {
//     next(error);
//   }
// };

export const walletLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pubKey, signature }: WalletLoginDto = req.body;
    if (isEmpty(pubKey)) throw new HttpException(400, 'pubKey is empty');
    if (isEmpty(signature)) throw new HttpException(400, 'signature is empty');

    const stdPubKey: PubKey = JSON.parse(pubKey);
    const address = pubkeyToAddress(stdPubKey, process.env.PREFIX);

    // Validate Signature
    const userData: User = await UserModel.findOne({ address: address });
    if (!userData) throw new HttpException(409, 'User not found');

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

    // Set cookie
    // const { cookie, findUser } = await authService.walletLogin(userData);
    const { tokenData, findUser } = await authService.walletLogin(userData);
    const ownedTokens: Token[] = await TokenModel.find({ owner: findUser.address });
    const ownedCollections: Collection[] = await CollectionModel.find({ creator: findUser.address });

    const response: GetUserProfileResponse = {
      profile: findUser,
      tokens: ownedTokens || [],
      collections: ownedCollections || [],
    };
    // res.setHeader('Set-Cookie', [cookie]);
    res.cookie('Authorization', tokenData.token, { httpOnly: true, sameSite: 'strict', secure: false, maxAge: tokenData.expiresIn });
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
