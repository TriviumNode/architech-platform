export type Feature = 'RANDOMMINT' | 'COPYMINT'

export type ChainConfig = {
  CREDIT_ADDRESS: string;
  MARKETPLACE_ADDRESS: string;
  NFT_FACTORY_ADDRESS: string;
  CW721_CODE_ID: number;
  ARCHID_ADDRESS: string;
  DISABLED_FEATURES: Feature[];

  NOIS_PROXY: string;
  NOIS_PAYMENT_CONTRACT: string;
}

export const getAddresses = (chainId: string): ChainConfig => {
    switch(chainId){
        case 'archway-1':
            return {
                CREDIT_ADDRESS: 'archway1dex9s7j726jd3an9vk0g00s9cm608jtznzjueczuzcvs2t9zralqhg4f5h',
                MARKETPLACE_ADDRESS: 'archway1vg04jejq07cxulffmmgjtxs0gfsezx99a2ajtwuakrc8krf354rqgv8t4a',
                NFT_FACTORY_ADDRESS: 'archway1974a8z4w0ph48nfexf5jt2nqxvmyzz3n9gahfv62d6yalr9fsm3qhln996',
                CW721_CODE_ID: 44,
                ARCHID_ADDRESS: 'archway1275jwjpktae4y4y0cdq274a2m0jnpekhttnfuljm6n59wnpyd62qppqxq0',
                DISABLED_FEATURES: ['RANDOMMINT'],

                // Nois Contracts
                NOIS_PROXY: 'archway10f3aasgsnpv84ymjyld50jayc4ecu267sdpjamauwm8nvxlzex9qj4dkwr',
                NOIS_PAYMENT_CONTRACT: 'nois1rf3qhpwrs6zy0hun9qua56har9jrfau97c006czg7mjmhq7c09uqa2l7rg',
            };
            break;
        case 'constantine-3':
            return {
                CREDIT_ADDRESS: 'archway1xmlcasxa8xs9saz2avk9t4pcjyf6h94skhwdhm6vsqrsvhmvq96qnxvhku',
                MARKETPLACE_ADDRESS: 'archway13f8fv36qm87kaj3hfl9fspyv2p6jusvu92z59z3f0vgs975xjy4qwdg4cg',
                NFT_FACTORY_ADDRESS: 'archway14g4uv5lzmln30jqg8wutz396gqhdtf2v3vuf0yfarlaqxaqzuy7qy42plc',
                CW721_CODE_ID: 219,
                ARCHID_ADDRESS: 'archway1lr8rstt40s697hqpedv2nvt27f4cuccqwvly9gnvuszxmcevrlns60xw4r',
                DISABLED_FEATURES: [],

                NOIS_PROXY: 'archway1agttusk2xyffuuq2f5cefkatavrv2ywt8005pf3w05pcfsy2kuyqf93vqk',
                NOIS_PAYMENT_CONTRACT: 'nois1lzswfaf7v4wyypfrnc0czsdcm4u0mavpfffx3d9uhqwgt84pq3wqm8e508',
            };
            break;
        case "localnet":
            return {
                CREDIT_ADDRESS: 'archway149alhnfurwl2lmuxzvgve2e2ruqntvmkkml5y0d88v8rzym0edvqmjtxa8',
                MARKETPLACE_ADDRESS: 'archway1887lhu29pqq68cm7kp9zrusxyg4zk0c79wty584k2upv6nek5z3s72zd3t',
                NFT_FACTORY_ADDRESS: 'archway18q6pjutl59j5s2ex080hmak2kct0flwl5k9v7u2q6997hxta8dtqrk7vh7',
                CW721_CODE_ID: 638,
                ARCHID_ADDRESS: '',
                DISABLED_FEATURES: [],

                NOIS_PAYMENT_CONTRACT: '',
                NOIS_PROXY: '',
            };
            break;
        default:
            throw 'Unknown Chain ID';
    }
}