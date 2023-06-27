export const getFee = (gas: number) => {
  const fee = gas * parseFloat(process.env.GAS_PRICE || '1');
  return {
    amount: [{ denom: process.env.GAS_DENOM || 'uconst', amount: fee.toString() }],
    gas: gas.toString(),
  };
};
