import { ArchwayClient, SigningArchwayClient } from '@archwayhq/arch3.js';

export const CONTRACT_ADDR_LENGTH = process.env.PREFIX.length + 59;

export let queryClient: ArchwayClient;

export async function initClients(): Promise<void> {
  if (!process.env.RPC_URL) throw "ENV variable RPC_URL is undefined."
  queryClient = await ArchwayClient.connect(process.env.RPC_URL);
}