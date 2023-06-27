import CollectionModel from '@/models/collections.model';
import TokenModel from '@/models/tokens.model';
import ViewModel, { ViewClass } from '@/models/views.model';
import mongoose from 'mongoose';

export const addTokenView = async ({
  collectionRef,
  collectionAddress,
  tokenRef,
  tokenId,
  viewerRef,
  viewerIP,
}: {
  collectionRef: mongoose.Types.ObjectId;
  collectionAddress: string;
  tokenRef: mongoose.Types.ObjectId;
  tokenId: string;
  viewerRef?: mongoose.Types.ObjectId;
  viewerIP: string;
}) => {
  const view: ViewClass = {
    collectionRef,
    collectionAddress,
    tokenRef,
    tokenId,
    viewerRef,
    viewerIP,
  };

  await ViewModel.create(view);
  const updatedToken = await TokenModel.findByIdAndUpdate(tokenRef, { $inc: { total_views: 1 } }, { new: true });
  await updatedToken.populate('collectionInfo');
  return updatedToken;
};

export const addCollectionView = async ({
  collectionRef,
  collectionAddress,
  viewerRef,
  viewerIP,
}: {
  collectionRef: mongoose.Types.ObjectId;
  collectionAddress: string;
  viewerRef?: mongoose.Types.ObjectId;
  viewerIP: string;
}) => {
  const view: ViewClass = {
    collectionRef,
    collectionAddress,
    viewerRef,
    viewerIP,
  };

  await ViewModel.create(view);
  const updatedCollection = await CollectionModel.findByIdAndUpdate(collectionRef, { $inc: { total_views: 1 } }, { new: true });
  return updatedCollection;
};
