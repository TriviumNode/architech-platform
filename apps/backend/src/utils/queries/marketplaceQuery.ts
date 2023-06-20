import { ArchwayClient, SigningArchwayClient } from '@archwayhq/arch3.js/build';
import { marketplace } from '@architech/types';

type QueryMsg = marketplace.QueryMsg;

export const getAllAsks = async ({ client, contract }: { client: SigningArchwayClient | ArchwayClient; contract: string }) => {
  const query = {
    get_all_asks: {},
  };

  const result = await client.queryContractSmart(contract, query);
  return result;
};

export const getCollectionAsks = async ({
  client,
  contract,
  collection,
}: {
  collection: string;
  client: SigningArchwayClient | ArchwayClient;
  contract: string;
}) => {
  const query: QueryMsg = {
    get_collection_asks: {
      collection,
    },
  };

  const { asks } = await client.queryContractSmart(contract, query);
  return asks;
};

export const getAsk = async ({
  client,
  contract,
  collection,
  token_id,
}: {
  collection: string;
  client: SigningArchwayClient | ArchwayClient;
  contract: string;
  token_id: string;
}) => {
  const query: QueryMsg = {
    ask: {
      collection,
      token_id,
    },
  };

  const { ask } = await client.queryContractSmart(contract, query);
  return ask;
};

// export const getTxHistory = async ({ client, contract }: { client: SigningArchwayClient | ArchwayClient; contract: string }) => {
//   const query: QueryMsg = {
//     get_all_history: {},
//   };

//   const { events } = await client.queryContractSmart(contract, query);
//   return events;
// };
