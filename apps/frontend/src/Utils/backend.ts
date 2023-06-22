import axios from 'axios';
import { Collection, GetUserProfileResponse, NonceRequest, NonceResponse, Token, UpdateUserDto, User, WalletLogin, ImportCollectionRequest, GetTokenResponse, GetCollectionResponse } from '@architech/types'
import { Pubkey } from '@cosmjs/amino';
import { ImportCollectionData, UpdateProfileData } from '../Interfaces/interfaces';

axios.defaults.withCredentials = true;

export const getApiUrl = (path: string): string => {
    // const url = new URL(path, process.env.REACT_APP_BACKEND_URL);
    // return url.toString();
    return `${process.env.REACT_APP_BACKEND_URL.replace(/\/\s*$/, "")}${path}`;
}

// ### GET
export const getCollection = async(contractAddr: string): Promise<GetCollectionResponse> => {
    const url = getApiUrl(`/collections/${contractAddr}`)
    const { data } = await axios.get(url)
    return data;
}

export const getTokens = async(contractAddr: string) => {
    const url = getApiUrl(`/tokens/collection/${contractAddr}`)
    const {data: tokens} = await axios.get(url)
    return tokens;
}

export const getToken = async(contractAddr: string, tokenId: string): Promise<GetTokenResponse> => {
    const url = getApiUrl(`/tokens/collection/${contractAddr}/${tokenId}`)
    const {data} = await axios.get(url)
    return data;
}

export const getOwnedTokens = async(ownerAddr: string) => {
    const url = getApiUrl(`/tokens/owner/${ownerAddr}`)
    const {data: tokens} = await axios.get(url)
    return tokens;
}

export const refreshToken = async(contractAddr: string, tokenId: string): Promise<Token> => {
    const url = getApiUrl(`/tokens/refresh/${contractAddr}/${tokenId}`)
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

    // const response = await fetch(url, {
    //     method: "POST", // *GET, POST, PUT, DELETE, etc.
    //     // credentials: "include", // include, *same-origin, omit
    //     headers: {
    //         "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(loginData), // body data type must match "Content-Type" header
    // })
    // return response.json()
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

    // const response = await fetch(url, {
    //     method: "POST", // *GET, POST, PUT, DELETE, etc.
    //     // credentials: "include", // include, *same-origin, omit
    //     mode: 'cors',
    //     headers: {
    //         "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(updateData), // body data type must match "Content-Type" header
    // })
    // return response.json()
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

// export const importCollection = async(collectionAddress: string): Promise<Collection> => {
//     const url = getApiUrl(`/collections/import/${collectionAddress}`);

//     const {data}: {data: Collection} = await axios(
//         url,
//         {
//             method: 'POST',
//             withCredentials: true,
//             headers: {'Content-Type': 'application/json'}
//         }
//     )
//     return data;
// }

export const importCollection = async(address: string, request: ImportCollectionData): Promise<Collection> => {
    const url = getApiUrl(`/collections/import/${address}`);
    console.log('REQUEST', request);
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

    console.log(formData)

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

export const editCollection = async(address: string, request: Partial<ImportCollectionData>): Promise<Collection> => {
    const url = getApiUrl(`/collections/edit/${address}`);

    console.log('form!!!!', request)

    const formData = new FormData();

    if (request.name)
        formData.append('name', request.name);
    if (request.description)
        formData.append('description', request.description);
    if (request.hidden)
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
    
    console.log(formData)

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

export const editProfile = async(address: string, request: Partial<UpdateProfileData>): Promise<User> => {
    const url = getApiUrl(`/users/edit/${address}`);

    console.log('form!!!!', request)

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
    
    console.log(formData)

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
    console.log(data);
    return data.cid;
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