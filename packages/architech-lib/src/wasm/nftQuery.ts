import { cw2981, cw721 } from "@architech/types";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";

export const getContractInfo = async ({
    client,
    contract,
}:{
    client: CosmWasmClient,
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
    client: CosmWasmClient,
    contract: string,
    token_id: string,
}): Promise<{token_uri?: string | null, extension?: cw721.Metadata | null}> => {
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
    client: CosmWasmClient,
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

export const getRoyalty = async ({
    client,
    contract,
    token_id,
    sale_price,
}:{
    client: CosmWasmClient,
    contract: string,
    token_id: string,
    sale_price: string;
}) => {
    const extension_msg: cw2981.Cw2981QueryMsg = {
        royalty_info: {
            sale_price,
            token_id
        }
    };
    const query: cw721.QueryMsg = {
        extension: {
            msg: extension_msg
        },
    }

    const result = await client.queryContractSmart(contract, query);
    return result;
}

// export const checkRoyalty = async ({
//     client,
//     contract,
// }:{
//     client: CosmWasmClient,
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
    client: CosmWasmClient,
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

export const getNumTokens = async ({ client, contract }: { client: CosmWasmClient; contract: string }) => {
    const query: cw721.QueryMsg = {
      num_tokens: {},
    };
  
    const result: cw721.NumTokensResponse = await client.queryContractSmart(contract, query);
    return result.count;
  };

export const getAllTokens = async ({
    client,
    contract,
    start_after,
    limit = 1000,
  }: {
    client: CosmWasmClient;
    contract: string;
    start_after?: string;
    limit?: number;
  }) => {
    const query: cw721.QueryMsg = {
      all_tokens: {
        limit,
        start_after,
      },
    };
  
    const result = await client.queryContractSmart(contract, query);
    return result.tokens;
  };