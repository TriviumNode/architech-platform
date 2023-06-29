import { ArchwayClient } from "@archwayhq/arch3.js";

export let QueryClient: ArchwayClient;

export async function initClients(): Promise<void> {
  if (!process.env.REACT_APP_RPC_URL) throw new Error('ENV variable REACT_APP_RPC_URL is undefined.');
  QueryClient = await ArchwayClient.connect(process.env.REACT_APP_RPC_URL);
}