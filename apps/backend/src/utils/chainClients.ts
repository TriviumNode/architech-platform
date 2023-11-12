import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';

export const CONTRACT_ADDR_LENGTH = process.env.PREFIX.length + 59;

export const isContract = (addr: string) => {
  return addr.startsWith(process.env.PREFIX) && addr.length === CONTRACT_ADDR_LENGTH;
};

export let queryClient: CosmWasmClient;

export async function initClients(): Promise<void> {
  if (!process.env.RPC_URL) throw 'ENV variable RPC_URL is undefined.';
  queryClient = await CosmWasmClient.connect(process.env.RPC_URL);
  console.log('RPC_URLRPC_URLRPC_URLRPC_URLRPC_URL', process.env.RPC_URL);
}
