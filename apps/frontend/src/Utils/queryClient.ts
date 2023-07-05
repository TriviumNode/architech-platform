import { getAddresses } from "@architech/lib";
import { ArchwayClient } from "@archwayhq/arch3.js";
import { toast } from "react-toastify";

export const { CREDIT_ADDRESS, MARKETPLACE_ADDRESS, CW721_CODE_ID } = getAddresses(process.env.REACT_APP_CHAIN_ID)
console.log('frontend addresses', { CREDIT_ADDRESS, MARKETPLACE_ADDRESS, CW721_CODE_ID })

export let QueryClient: ArchwayClient;

export async function initClients(): Promise<void> {
  if (!process.env.REACT_APP_RPC_URL) throw new Error('ENV variable REACT_APP_RPC_URL is undefined.');
  QueryClient = await ArchwayClient.connect(process.env.REACT_APP_RPC_URL);
}