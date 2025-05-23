import { parseError } from "@architech/lib";
import { GetCollectionResponse, GetTokenResponse } from "@architech/types";
import axios, { Axios, AxiosError } from "axios";
import { getActiveMinters, getApiUrl, getCollection, getEndedMinters, getOwnedTokens, getToken, getTokens, getUserProfile } from "./backend";

export async function allCollectionsLoader({ params }: any) {
    const url = getApiUrl(`/collections`)
    const {data: collections}: {data: GetCollectionResponse[]} = await axios.get(url.toString())
    return { collections };
}

export async function activeMintersLoader({ params }: any): Promise<{ collections: GetCollectionResponse[] }> {
  const collections = await getActiveMinters();
  return { collections };
}

export async function endedMintersLoader({ params }: any): Promise<{ collections: GetCollectionResponse[] }> {
  const collections = await getEndedMinters();
  return { collections };
}

export async function collectionLoader({ params, request }: any) {
  try {
    if (!params.contractAddr) return { collection: undefined }

    const url = getApiUrl(`/collections/${params.contractAddr}`)
    const {data: collection}: {data: GetCollectionResponse} = await axios.get(url)
    return { collection };
  } catch (e: any) {
    throw new Error(parseError(e))
  }
}

// TODO have the backend just do this instead of 2 queries
export async function tokenLoader({ params, request }: any): Promise<{collection: GetCollectionResponse, token: GetTokenResponse}> {
  try {
    const tokenData = await getToken(params.contractAddr, params.tokenId)

    const collectionData = await getCollection(tokenData.token.collectionAddress)
    return { collection: collectionData, token: tokenData };
  } catch (e: any) {
    throw new Error(parseError(e))
  }
}

export async function userProfileloader({ params }: any) {
    let ownedTokens;
    try {
        const userProfile = await getUserProfile(params.userAddress)

        return { userProfile };
    } catch (err: unknown) {
        if (err instanceof AxiosError) {
            if (err.response && err.response.status === 404){
                return { profileData: undefined, ownedTokens }
            }
            else {
                throw err;
            }
        } else {
            throw err;
        }
    }
    
}