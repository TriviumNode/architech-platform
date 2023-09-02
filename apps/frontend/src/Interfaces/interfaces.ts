import { ContractMetadata, ContractPremium } from "@archwayhq/arch3.js/build";
import { CodeDetails, Contract } from "@cosmjs/cosmwasm-stargate";

export interface ImportCollectionData {
    name: string;
    description: string;
    hidden: boolean;
    admin_hidden?: boolean;
    featured?: boolean;
    verified?: boolean;
    dark_banner?: boolean;
    profileImage?: File;
    bannerImage?: File;
    twitter?: string;
    telegram?: string;
    discord?: string;
    website?: string;
    categories: string[];
}

export interface UpdateProfileData {
    username: string;
    bio: string;
    website: string;
    twitter: string;
    discord: string;
    telegram: string;
    profileImage: File | undefined;    
}

export type DevInfo = {
  contract: Contract;
  code: CodeDetails;
  metadata: ContractMetadata | undefined;
  premium: ContractPremium | undefined;
}