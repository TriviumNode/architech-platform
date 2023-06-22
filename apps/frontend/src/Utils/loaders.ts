import axios, { Axios, AxiosError } from "axios";
import { getApiUrl, getCollection, getOwnedTokens, getToken, getTokens, getUserProfile } from "./backend";

export async function allCollectionsLoader({ params }: any) {
    const url = getApiUrl(`/collections`)
    const {data: collections} = await axios.get(url.toString())
    return { collections };
}

export async function collectionLoader({ params, request }: any) {
    if (!params.contractAddr) return { collection: undefined }

    const url = getApiUrl(`/collections/${params.contractAddr}`)
    const {data: collection} = await axios.get(url)
    return { collection };
}

// TODO have the backend just do this instead of 2 queries
export async function tokenLoader({ params, request }: any) {
    // const url = getApiUrl(`/collections/${params.contractAddr}`)
    // const {data: collection} = await axios.get(url)
    const tokenData = await getToken(params.contractAddr, params.tokenId)

    const collectionData = await getCollection(tokenData.token.collectionAddress)
    return { collection: collectionData, token: tokenData };
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