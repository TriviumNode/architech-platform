import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";


export const queryPaymentContractBalance = async ({
  client,
  address,
}:{
  client: CosmWasmClient,
  address: string,
}) => {
  const balance = await client.getBalance(address, 'unois');
  if (!balance) return 0;
  return parseInt(balance.amount) / 10e5;
};