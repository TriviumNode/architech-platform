import { ArchwayClient, SigningArchwayClient } from '@archwayhq/arch3.js';

export const CONTRACT_ADDR_LENGTH = process.env.PREFIX.length + 59;

export const isContract = (addr: string) => {
  return addr.startsWith(process.env.PREFIX) && addr.length === CONTRACT_ADDR_LENGTH;
};

export let queryClient: ArchwayClient;

export async function initClients(): Promise<void> {
  if (!process.env.RPC_URL) throw 'ENV variable RPC_URL is undefined.';
  queryClient = await ArchwayClient.connect(process.env.RPC_URL);
  console.log('RPC_URLRPC_URLRPC_URLRPC_URLRPC_URL', process.env.RPC_URL);
}
