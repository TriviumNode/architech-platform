import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";

export const resolveArchId = async(client: CosmWasmClient, contract: string, address: string): Promise<string> => {
    if (!address || !address.length || !contract || !contract.length) return;
    try {
        const query = {
            resolve_address: {
              address
            }
        };
        const {names} = await client.queryContractSmart(contract, query)
        if (names.length > 1) console.log('ARCHID Response has Multiple Names:', names)
        return names[0]
    } catch (err: any) {
        console.error('Error resolving ArchID:', err)
    }
}