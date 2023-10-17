import { getAddresses } from "@architech/lib";
import { ArchwayClient } from "@archwayhq/arch3.js";
import { toast } from "react-toastify";

export const { CREDIT_ADDRESS, MARKETPLACE_ADDRESS, CW721_CODE_ID, NFT_FACTORY_ADDRESS, DISABLED_FEATURES, NOIS_PROXY, NOIS_PAYMENT_CONTRACT, RANDOMNESS_COST } = getAddresses(process.env.REACT_APP_CHAIN_ID)

export let QueryClient: ArchwayClient;
export let NoisQueryClient: ArchwayClient;

export async function initClients(): Promise<void> {
  if (!process.env.REACT_APP_RPC_URL) throw new Error('ENV variable REACT_APP_RPC_URL is undefined.');
  if (!process.env.REACT_APP_NOIS_RPC_URL) throw new Error('ENV variable REACT_APP_NOIS_RPC_URL is undefined.');
  QueryClient = await ArchwayClient.connect(process.env.REACT_APP_RPC_URL);
  NoisQueryClient = await ArchwayClient.connect(process.env.REACT_APP_NOIS_RPC_URL);
}