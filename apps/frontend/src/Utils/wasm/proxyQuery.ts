import { ArchwayClient, SigningArchwayClient } from "@archwayhq/arch3.js/build"


export const queryPaymentContractBalance = async ({
  client,
  address,
}:{
  client: ArchwayClient | SigningArchwayClient,
  address: string,
}) => {
  const balance = await client.getBalance(address, 'unois');
  if (!balance) return 0;
  return parseInt(balance.amount) / 10e5;
};