import { hash } from 'bcrypt';
import { CreateUserDto, UpdateUserDto, UpdateUserImageDto } from '@architech/types';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@architech/types';
import userModel from '@models/users.model';
import { generateNonce, isEmpty } from '@utils/util';

export async function findOrCreateUser(address: string, pubKey: string): Promise<User> {
  if (isEmpty(address)) throw new HttpException(400, 'Address is empty');

  const findUser: User = await userModel.findOne({ address: address });
  if (findUser) return findUser;
  // ### else Create User ###

  const newUser: CreateUserDto = {
    address,
    pubKey,
    nonce: generateNonce(),
  };
  const createdUser: User = await userModel.create(newUser);
  return createdUser;
}

// Internal Use
export async function rotateNonce(userId: string): Promise<User> {
  const newNonce = generateNonce();

  const updateUser: Partial<CreateUserDto> = {
    nonce: newNonce,
  };

  const updatedUser: User = await userModel.findByIdAndUpdate(userId, updateUser);
  return updatedUser;
}
