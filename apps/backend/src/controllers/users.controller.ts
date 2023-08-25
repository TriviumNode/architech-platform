import { NextFunction, Request, Response } from 'express';
import {
  Collection,
  EditUserBodyDto,
  GetUserProfileResponse,
  NonceRequestDto,
  NonceResponseDto,
  RequestWithOptionalUser,
  RequestWithUser,
  Token,
  UpdateUserDto,
  UpdateUserImageDto,
} from '@architech/types';
import { User } from '@architech/types';
import { validate } from 'class-validator';
import { NonceResponse } from '@architech/types';
import { Pubkey, pubkeyToAddress } from '@cosmjs/amino';
import { pubkeyToRawAddress } from '@cosmjs/amino/build/addresses';
import { HttpException } from '@/exceptions/HttpException';
import { validateAddress } from '@/utils/crypto';
import * as userService from '@/services/users.service';
import userModel from '@models/users.model';
import TokenModel from '@/models/tokens.model';
import CollectionModel from '@/models/collections.model';
import { isEmpty } from '@/utils/util';
import { RequestWithImages } from '@/middlewares/fileUploadMiddleware';
import { collectionsToResponse } from '@/queriers/collection.querier';
import { findUserFavorites } from '@/services/favorites.service';
import { ADMINS, resolveArchId } from '@/../../../packages/architech-lib/dist';
import { queryClient } from '@/utils/chainClients';
import { ARCHID_ADDRESS } from '@/config';

// HTTP
// Return user profile only.
// Errors if no user is found.
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId: string = req.params.id;
    if (isEmpty(userId)) throw new HttpException(400, 'UserId is empty');

    const findUser: User = await userModel.findOne({ _id: userId });
    if (!findUser) throw new HttpException(404, 'User not found');

    res.status(200).json(findUser);
  } catch (error) {
    next(error);
  }
};

// HTTP
// Return full user profile including owned tokens and created collections.
// Does not error if user is not found.
export const getUserByAddress = async (req: RequestWithOptionalUser, res: Response, next: NextFunction) => {
  try {
    const userAddr: string = req.params.address;
    const requesterIsUser = req.user ? userAddr === req.user.address : false;
    const isAdmin = req.user ? ADMINS.includes(req.user.address) : false;

    // Get Created Collections. Hide hidden collections unless requester IS (the user OR an Architech Admin)
    const hideHiddenUnlessOwner = requesterIsUser || isAdmin ? {} : { hidden: false, admin_hidden: false };
    const ownedCollections: Collection[] = await CollectionModel.find({
      $or: [{ creator: userAddr }, { admin: userAddr }],
      ...hideHiddenUnlessOwner,
    });
    const fullCollections = await collectionsToResponse(ownedCollections);

    // Get Owned Tokens
    const ownedTokens: Token[] = await TokenModel.find({ owner: userAddr }).populate('collectionInfo');

    // Get Favorites
    const favorites = await findUserFavorites(userAddr);

    // Get User Profile
    const userData: User | undefined = await userModel.findOne({ address: userAddr }).lean();

    // Resolve Arch ID
    const archId = await resolveArchId(queryClient, ARCHID_ADDRESS, userAddr);

    const response: GetUserProfileResponse = {
      profile: userData,
      display_name: archId || userData.username || userAddr,
      tokens: ownedTokens || [],
      collections: fullCollections || [],
      favorites: favorites as any,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// HTTP
// Allow user to update their public profile.
// Errors if user does not exists in DB
export const updateUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const userId: string = req.params.id;
    if (userId !== req.user._id.toString()) throw new HttpException(401, 'Not authorized.');

    const updateData: UpdateUserDto = req.body;
    if (isEmpty(updateData)) throw new HttpException(400, 'userData is empty');

    if (updateData.username) {
      const findUser: User = await userModel.findOne({ username: updateData.username });
      if (findUser && findUser._id != userId)
        throw new HttpException(409, `This username ${updateData.username} is already registered, please choose another username.`);
    }

    const updatedUser: User = await userModel.findOneAndUpdate({ _id: userId }, updateData, { new: true });
    if (!updatedUser) throw new HttpException(404, 'User not found');

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const editUser = async (req: RequestWithImages, res: Response, next: NextFunction) => {
  try {
    const userId: string = req.params.id;

    if (!userId) {
      res.status(400).send('Invalid user ID.');
      return;
    }

    if (req.user._id.toString() !== userId && !ADMINS.includes(req.user.address)) {
      res.status(403).send('Unauthorized');
      return;
    }

    // const profile_image: string | undefined = (req.files.profile || [])[0]?.filename;
    // const banner_image: string | undefined = (req.files.banner || [])[0]?.filename;
    const profile_image = req.images?.profile;

    // validate body contents
    const validator = new EditUserBodyDto();
    validator.username = req.body.username;
    validator.bio = req.body.bio;
    validator.website = req.body.website;
    validator.twitter = req.body.twitter;
    validator.discord = req.body.discord;
    validator.telegram = req.body.telegram;

    // Admin settings
    validator.verified = req.body.verified;

    await validate(validator);

    if (validator.verified !== undefined && !ADMINS.includes(req.user.address)) {
      res.status(403).send('Unauthorized');
      return;
    }

    const userData: Partial<User> = {
      username: validator.username,
      bio: validator.bio,
      website: validator.website,
      twitter: validator.twitter,
      discord: validator.discord,
      telegram: validator.telegram,
      profile_image,
      verified: validator.verified ? validator.verified === 'true' : undefined,
    };

    // Strip undefined fields
    Object.keys(userData).forEach(key => userData[key] === undefined && delete userData[key]);

    const updated = await userModel.findByIdAndUpdate(userId, userData, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// HTTP
// Updates user profile image.
// Requires authentication.
// Errors if user does not exists in DB
export const updateUserImage = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const userId: string = req.params.id;
    if (userId !== req.user._id.toString()) throw new HttpException(401, 'Not authorized.');

    const { filename } = req.file;
    // const metadata = req.body;

    const updateData: UpdateUserImageDto = {
      profile_image: filename,
    };
    const updatedUser: User = await userModel.findOneAndUpdate({ _id: userId }, updateData, { new: true });
    if (!updatedUser) throw new HttpException(404, 'User not found');

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// HTTP
// Returns current logon nonce for a user.
export const getNonce = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address, pubKey }: NonceRequestDto = req.body;

    // Validate address against pubkey
    if (!validateAddress(address, pubKey)) throw new HttpException(400, 'PubKey does not match provided address.');

    // Get nonce (or create new user with nonce)
    const result: NonceResponse = await userService.findOrCreateUser(address, pubKey);

    // validate response
    const validator = new NonceResponseDto();
    validator.address = result.address;
    validator.nonce = result.nonce;

    await validate(validator);

    // return validated data
    res.status(200).json(validator);
  } catch (error) {
    next(error);
  }
};

// export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const userId: string = req.params.id;
//     const deleteUserData: User = await userService.deleteUser(userId);

//     res.status(200).json(deleteUserData);
//   } catch (error) {
//     next(error);
//   }
// };
