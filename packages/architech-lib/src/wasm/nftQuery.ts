import { cw721 } from "@architech/types";
import type { ArchwayClient, SigningArchwayClient } from "@archwayhq/arch3.js/build";

export const getContractInfo = async ({
    client,
    contract,
}:{
    client: SigningArchwayClient | ArchwayClient,
    contract: string,
}) => {
    const query: cw721.QueryMsg = {
        contract_info: {}
    };

    const result = await client.queryContractSmart(contract, query);
    return result;
}

export const getNftInfo = async ({
    client,
    contract,
    token_id
}:{
    client: SigningArchwayClient | ArchwayClient,
    contract: string,
    token_id: string,
}) => {
    const query: cw721.QueryMsg = {
        nft_info: {
            token_id
        }
    };

    const result = await client.queryContractSmart(contract, query);
    return result;
}

export const getAllNftInfo = async ({
    client,
    contract,
    token_id,
    include_expired
}:{
    client: SigningArchwayClient | ArchwayClient,
    contract: string,
    token_id: string,
    include_expired?: boolean;
}) => {
    const query: cw721.QueryMsg = {
        all_nft_info: {
            token_id,
            include_expired
        }
    };

    const result = await client.queryContractSmart(contract, query);
    return result;
}

// export const getRoyalty = async ({
//     client,
//     contract,
//     token_id,
//     sale_price,
// }:{
//     client: SigningArchwayClient | ArchwayClient,
//     contract: string,
//     token_id: string,
//     sale_price: string;
// }) => {
//     const query: cw721.Cw2981QueryMsg = {
//         royalty_info: {
//             sale_price,
//             token_id
//         }
//     };

//     const result = await client.queryContractSmart(contract, query);
//     return result;
// }

// export const checkRoyalty = async ({
//     client,
//     contract,
// }:{
//     client: SigningArchwayClient | ArchwayClient,
//     contract: string,
// }) => {
//     const query: cw721.Cw2981QueryMsg = {
//         check_royalties: {
//         }
//     };

//     const result = await client.queryContractSmart(contract, query);
//     return result;
// }

export const getOwnedTokens = async ({
    client,
    contract,
    owner,
    start_after,
    limit,
}:{
    client: SigningArchwayClient | ArchwayClient,
    contract: string,
    owner: string,
    start_after?: string;
    limit?: number;
}) => {
    const query: cw721.QueryMsg = {
        tokens: {
            owner,
            start_after,
            limit,
        }
    };

    const result = await client.queryContractSmart(contract, query);
    return result.tokens;
}