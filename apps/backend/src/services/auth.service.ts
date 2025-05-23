import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { CreateUserDto } from '@architech/types';
import { HttpException } from '@exceptions/HttpException';
import { User, DataStoredInToken, TokenData } from '@architech/types';
import userModel from '@models/users.model';
import { isEmpty } from '@utils/util';

export async function walletLogin(userData: CreateUserDto) /*: Promise<{ cookie: string; findUser: User }>*/ {
  if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

  const findUser: User = await userModel.findOne({ address: userData.address });
  if (!findUser) throw new HttpException(404, `This address ${userData.address} was not found`);

  const tokenData = createAuthToken(findUser);
  const cookie = createCookie(tokenData);

  // return { cookie, findUser };
  return { tokenData, findUser };
}

// Wtf does this even do
export async function logout(userData: User): Promise<User> {
  if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

  const findUser: User = await userModel.findOne({ address: userData.address });
  if (!findUser) throw new HttpException(404, `This address ${userData.address} was not found`);

  return findUser;
}

export function createAuthToken(user: User): TokenData {
  const dataStoredInToken: DataStoredInToken = { _id: user._id };
  const secretKey: string = SECRET_KEY;
  const expiresIn: number = 24 * 60 * 60 * 1000;

  return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
}

export function createCookie(tokenData: TokenData): string {
  return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
}
