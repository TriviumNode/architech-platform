import { SigningArchwayClient, ArchwayClient } from "@archwayhq/arch3.js/build";

export const resolveArchId = async(client: ArchwayClient | SigningArchwayClient, contract: string, address: string): Promise<string> => {
    if (!address || !address.length || !contract || !contract.length) return;
    try {
        const query = {
            resolve_address: {
              address
            }
        };
        const {names} = await client.queryContractSmart(contract, query)
        console.log('ARCHID Response', names)
        return names[0]
    } catch (err: any) {
        console.error('Error resolving ArchID:', err)
    }
}