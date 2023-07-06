export const getAddresses = (chainId: string) => {
    switch(chainId){
        case 'archway-1':
            return {
                MARKETPLACE_ADDRESS: 'archway1vg04jejq07cxulffmmgjtxs0gfsezx99a2ajtwuakrc8krf354rqgv8t4a',
                CREDIT_ADDRESS: 'archway1dex9s7j726jd3an9vk0g00s9cm608jtznzjueczuzcvs2t9zralqhg4f5h',
                CW721_CODE_ID: 44,
            };
            break;
        case 'constantine-3':
            return {
                MARKETPLACE_ADDRESS: 'archway13f8fv36qm87kaj3hfl9fspyv2p6jusvu92z59z3f0vgs975xjy4qwdg4cg',
                CREDIT_ADDRESS: 'archway16p73xs5u5zusmukpejsnyjfzffqwlqltwqwmthy4ta9twuyxm7cqgy3s03',
                CW721_CODE_ID: 219,
            };
            break;
        case "localnet":
            return {
                MARKETPLACE_ADDRESS: 'archway1nc5tatafv6eyq7llkr2gv50ff9e22mnf70qgjlv737ktmt4eswrqgj33g6',
                CREDIT_ADDRESS: 'archway14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9sy85n2u',
                CW721_CODE_ID: 3,
            };
            break;
        default:
            throw 'Unknown Chain ID';
    }
}