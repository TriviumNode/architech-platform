import { ArchwayClient, SigningArchwayClient } from '@archwayhq/arch3.js/build';
import { cw721 } from '@architech/types';

interface AllNftInfoResponse {
  access: cw721.OwnerOfResponse;
  info: NftInfoResponse;
}

interface NftInfoResponse {
  extension: cw721.Metadata | cw721.Empty;
  token_uri?: string | null;
}

export const getContractInfo = async ({
  client,
  contract,
}: {
  client: SigningArchwayClient | ArchwayClient;
  contract: string;
}): Promise<cw721.ContractInfoResponse> => {
  const query: cw721.QueryMsg = {
    contract_info: {},
  };

  const result = await client.queryContractSmart(contract, query);
  return result;
};

export const getNftInfo = async ({
  client,
  contract,
  token_id,
}: {
  client: SigningArchwayClient | ArchwayClient;
  contract: string;
  token_id: string;
}): Promise<NftInfoResponse> => {
  const query: cw721.QueryMsg = {
    nft_info: {
      token_id,
    },
  };

  const result = await client.queryContractSmart(contract, query);
  return result;
};

export const getAllNftInfo = async ({
  client,
  contract,
  token_id,
  include_expired,
}: {
  client: SigningArchwayClient | ArchwayClient;
  contract: string;
  token_id: string;
  include_expired?: boolean;
}): Promise<AllNftInfoResponse> => {
  const query: cw721.QueryMsg = {
    all_nft_info: {
      token_id,
      include_expired,
    },
  };

  const result = await client.queryContractSmart(contract, query);
  return result;
};

export const getOwnedTokens = async ({
  client,
  contract,
  owner,
  start_after,
  limit,
}: {
  client: SigningArchwayClient | ArchwayClient;
  contract: string;
  owner: string;
  start_after?: string;
  limit?: number;
}) => {
  const query: cw721.QueryMsg = {
    tokens: {
      owner,
      start_after,
      limit,
    },
  };

  const result = await client.queryContractSmart(contract, query);
  return result.tokens;
};

export const getNumTokens = async ({ client, contract }: { client: SigningArchwayClient | ArchwayClient; contract: string }) => {
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
  client: SigningArchwayClient | ArchwayClient;
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
