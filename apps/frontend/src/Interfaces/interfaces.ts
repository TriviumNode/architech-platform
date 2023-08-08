export interface ImportCollectionData {
    name: string;
    description: string;
    hidden: boolean;
    admin_hidden?: boolean;
    featured?: boolean;
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