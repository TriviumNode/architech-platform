import axios, { AxiosProgressEvent } from 'axios';
import { Collection, GetUserProfileResponse, NonceRequest, NonceResponse, Token, UpdateUserDto, User, WalletLogin, ImportCollectionRequest, GetTokenResponse, GetCollectionResponse, SortOption, GetTrendingCollectionResponse, GetLatestListingsResponse } from '@architech/types'
import { Pubkey } from '@cosmjs/amino';
import { ImportCollectionData, UpdateProfileData } from '../Interfaces/interfaces';

axios.defaults.withCredentials = true;

export const getApiUrl = (path: string): string => {
    // const url = new URL(path, process.env.REACT_APP_BACKEND_URL);
    // return url.toString();
    return `${process.env.REACT_APP_BACKEND_URL.replace(/\/\s*$/, "")}${path}`;
}


// ### GET
export const search = async(query: string): Promise<Collection[]> => {
    const url = getApiUrl(`/collections/search?query=${query}`)
    const {data} = await axios.get(url)
    return data;
}

export const getCollection = async(contractAddr: string): Promise<GetCollectionResponse> => {
    const url = getApiUrl(`/collections/${contractAddr}`)
    const { data } = await axios.get(url)
    return data;
}

export const getActiveMinters = async(): Promise<GetCollectionResponse[]> => {
  const url = getApiUrl(`/collections/minters/active`)
  const { data } = await axios.get(url)
  return data;
}

export const getEndedMinters = async(): Promise<GetCollectionResponse[]> => {
  const url = getApiUrl(`/collections/minters/ended`)
  const { data } = await axios.get(url)
  return data;
}

export const getTrendingCollections = async(): Promise<GetTrendingCollectionResponse> => {
    const url = getApiUrl(`/collections/trending`)
    const {data}: {data: GetTrendingCollectionResponse} = await axios.get(url)
    return data;
}

export const getFeaturedCollections = async(): Promise<GetTrendingCollectionResponse> => {
  const url = getApiUrl(`/collections/featured`)
  const {data}: {data: GetTrendingCollectionResponse} = await axios.get(url)
  return data;
}

export const getLatestListings = async(): Promise<GetLatestListingsResponse[]> => {
    const url = getApiUrl(`/tokens/latest_listings`)
    const {data}: {data: GetLatestListingsResponse[]} = await axios.get(url)
    return data;
}

export const getTokens = async(contractAddr: string, query?: URLSearchParams, sortBy: SortOption = 'Token ID', page = 1, limit = 32): Promise<Token[]> => {
    const url = getApiUrl(`/tokens/collection/${contractAddr}?page=${page}&limit=${limit}&sort=${sortBy}&${(query || '').toString()}`)
    const {data: tokens} = await axios.get(url)
    return tokens;
}

export const getToken = async(contractAddr: string, tokenId: string): Promise<GetTokenResponse> => {
    const url = getApiUrl(`/tokens/collection/${contractAddr}/${encodeURIComponent(tokenId)}`)
    const {data} = await axios.get(url)
    return data;
}

export const getOwnedTokens = async(ownerAddr: string) => {
    const url = getApiUrl(`/tokens/owner/${ownerAddr}`)
    const {data: tokens} = await axios.get(url)
    return tokens;
}

export const refreshToken = async(contractAddr: string, tokenId: string): Promise<Token> => {
    const url = getApiUrl(`/tokens/refresh/${contractAddr}/${encodeURIComponent(tokenId)}`)
    const {data} = await axios.get(url)
    return data;
}

export const getTokenCount = async(contractAddr: string): Promise<number> => {
    const url = getApiUrl(`/tokens/count/${contractAddr}`)
    const {data} = await axios.get(url)
    return data.tokenCount;
}

export const getUserProfile = async(userAddress: string): Promise<GetUserProfileResponse> => {
    const url = getApiUrl(`/users/address/${userAddress}`)
    const {data}: {data: GetUserProfileResponse} = await axios.get(url, {withCredentials: true})
    return data;
}

export const checkLogin = async(userAddress: string): Promise<GetUserProfileResponse> => {
    const url = getApiUrl(`/auth/check/${userAddress}`)
    const {data}: {data: GetUserProfileResponse} = await axios.get(url, {withCredentials: true})
    return data;
}



// ### POST
export const requestNonce = async(address: string, pubKey: Pubkey): Promise<NonceResponse> => {
    const request: NonceRequest = {
        address, pubKey: JSON.stringify(pubKey)
    }

    const {data}: {data: NonceResponse} = await axios.post(getApiUrl(`/auth/nonce`), request, {withCredentials: true, });
    return data
}

export const walletLogin = async(pubKey: string, signature: string): Promise<GetUserProfileResponse> => {
    const url = getApiUrl(`/auth/wallet`);
    const loginData: WalletLogin = {
        pubKey, signature
    }

    const {data}: {data: GetUserProfileResponse} = await axios(
        url,
        {
            method: 'POST',
            withCredentials: true,
            data: JSON.stringify(loginData),
            headers: {'Content-Type': 'application/json'}
        }
    )
    return data
}

export const updateProfile = async(userId: string, updateData: UpdateUserDto): Promise<User> => {
    const url = getApiUrl(`/users/profile/${userId}`);


    // const {data}: {data: User} = await axios.post(url, updateData, { withCredentials: true });
    const {data}: {data: User} = await axios(
        url,
        {
            method: 'POST',
            withCredentials: true,
            data: JSON.stringify(updateData),
            headers: {'Content-Type': 'application/json'}
        }
    )
    return data;
}

export const updateProfileImage = async(userId: string, file: File): Promise<User> => {
    const url = getApiUrl(`/users/image/${userId}`);

    const formData = new FormData();
    formData.append('file', file);

    const {data}: {data: User} = await axios(
        url,
        {
            method: 'POST',
            withCredentials: true,
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data"
            },
        }
    )
    return data;
}

export const importCollection = async(address: string, request: ImportCollectionData): Promise<Collection> => {
    const url = getApiUrl(`/collections/import/${address}`);
    const formData = new FormData();
    formData.append('name', request.name);
    formData.append('description', request.description);
    formData.append('hidden', request.hidden.toString());
    formData.append('categories', JSON.stringify(request.categories));

    // Images
    if (request.profileImage)
        formData.append('profile', request.profileImage);
    if (request.bannerImage)
        formData.append('banner', request.bannerImage);
    if (request.description)

    // Socials
    if (request.website)
        formData.append('website', request.website);
    if (request.twitter)
        formData.append('twitter', request.twitter);
    if (request.discord)
        formData.append('discord', request.discord);
    if (request.telegram)
        formData.append('telegram', request.telegram);

    const {data}: {data: Collection} = await axios(
        url,
        {
            method: 'POST',
            withCredentials: true,
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data"
            },
        }
    )
    return data;
}

export const editCollection = async(collectionId: string, request: Partial<ImportCollectionData>): Promise<Collection> => {
    const url = getApiUrl(`/collections/edit/${collectionId}`);

    const formData = new FormData();
    if (request.name)
        formData.append('name', request.name);
    if (request.description)
        formData.append('description', request.description);
    if (typeof request.hidden === 'boolean')
        formData.append('hidden', request.hidden.toString());
    if (request.categories && request.categories.length)
        formData.append('categories', JSON.stringify(request.categories));

    // Images
    if (request.profileImage)
        formData.append('profile', request.profileImage);
    if (request.bannerImage)
        formData.append('banner', request.bannerImage);

    // Socials
    if (request.website)
        formData.append('website', request.website);
    if (request.twitter)
        formData.append('twitter', request.twitter);
    if (request.discord)
        formData.append('discord', request.discord);
    if (request.telegram)
        formData.append('telegram', request.telegram);

    // Admin Settings
    if (typeof request.admin_hidden === 'boolean')
      formData.append('admin_hidden', request.admin_hidden.toString());

    if (typeof request.featured === 'boolean')
      formData.append('featured', request.featured.toString());

    if (typeof request.verified === 'boolean')
      formData.append('verified', request.verified.toString());
    
    console.log('Edit Request', request)
    try {
        const {data}: {data: Collection} = await axios(
            url,
            {
                method: 'POST',
                withCredentials: true,
                data: formData,
                headers: {
                    "Content-Type": "multipart/form-data"
                },
            }
        )
        return data;
        } catch(err: any) {
            const {response} = err;
            throw response.data || err;
        }
}

export const editProfile = async(address: string, request: Partial<UpdateProfileData>): Promise<User> => {
    const url = getApiUrl(`/users/edit/${address}`);

    const formData = new FormData();

    if (request.username)
        formData.append('username', request.username);
    if (request.bio)
        formData.append('bio', request.bio);

    // Images
    if (request.profileImage)
        formData.append('profile', request.profileImage);

    // Socials
    if (request.website)
        formData.append('website', request.website);
    if (request.twitter)
        formData.append('twitter', request.twitter);
    if (request.discord)
        formData.append('discord', request.discord);
    if (request.telegram)
        formData.append('telegram', request.telegram);
    
    const {data}: {data: User} = await axios(
        url,
        {
            method: 'POST',
            withCredentials: true,
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data"
            },
        }
    )
    return data;
}

export const updateCollectionImage = async(collectionId: string, file: File): Promise<Collection> => {
    const url = getApiUrl(`/collections/image/${collectionId}`);

    const formData = new FormData();
    formData.append('file', file);

    const {data}: {data: Collection} = await axios(
        url,
        {
            method: 'POST',
            withCredentials: true,
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data"
            },
        }
    )
    return data;
}

export const updateCollectionBanner = async(collectionId: string, file: File): Promise<Collection> => {
    const url = getApiUrl(`/collections/banner/${collectionId}`);

    const formData = new FormData();
    formData.append('file', file);

    const {data}: {data: Collection} = await axios(
        url,
        {
            method: 'POST',
            withCredentials: true,
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data"
            },
        }
    )
    return data;
}

export const uploadImage = async(file: File): Promise<any> => {
    if (!file) throw new Error('No File to upload!')
    const url = getApiUrl(`/upload`);

    const formData = new FormData();
    formData.append('image', file);

    const {data}: {data: {cid: string}} = await axios(
        url,
        {
            method: 'POST',
            withCredentials: true,
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data"
            },
        }
    )
    return data.cid;
}

export const uploadBatch = async(files: File[], onUploadProgress?: (progressEvent: AxiosProgressEvent)=>void): Promise<any> => {
    const url = getApiUrl(`/upload/batch`);

    const formData = new FormData();
    files.forEach(file=>{
        formData.append('images', file);
    });

    const {data}: {data: {cid: string}} = await axios(
        url,
        {
            method: 'POST',
            withCredentials: true,
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data"
            },
            onUploadProgress
        }
    )
    return data;
}

export const refreshCollection = async(collectionAddress: string): Promise<Collection> => {
    const url = getApiUrl(`/collections/refresh/${collectionAddress}`);
    const {data}: {data: Collection} = await axios(
        url,
        {
            method: 'POST',
            withCredentials: true,
            data: {},
            headers: {
                "Content-Type": "application/json"
            },
        }
    )
    return data;
}



export const addFavorite = async(tokenId: string): Promise<any> => {
    const url = getApiUrl(`/tokens/favorite/${encodeURIComponent(tokenId)}`);
    const {data} = await axios(
        url,
        {
            method: 'POST',
            withCredentials: true,
        }
    )
    return data;
}

export const removeFavorite = async(tokenId: string): Promise<any> => {
    const url = getApiUrl(`/tokens/favorite/${encodeURIComponent(tokenId)}`);
    const {data} = await axios(
        url,
        {
            method: 'DELETE',
            withCredentials: true,
        }
    )
    return data;
}

export const purgeCollection = async(collectionAddress: string): Promise<any> => {
    const url = getApiUrl(`/admin/purge_collection/${collectionAddress}`);
    const response = await axios(
        url,
        {
            method: 'POST',
            withCredentials: true,
            data: {},
            headers: {
                "Content-Type": "application/json"
            },
        }
    )
    return response;
}

export const purgeTokens = async(collectionAddress: string): Promise<any> => {
    const url = getApiUrl(`/admin/purge_tokens/${collectionAddress}`);
    const response = await axios(
        url,
        {
            method: 'POST',
            withCredentials: true,
            data: {},
            headers: {
                "Content-Type": "application/json"
            },
        }
    )
    console.log('Purge Tokens Response', response);
    return response;
}