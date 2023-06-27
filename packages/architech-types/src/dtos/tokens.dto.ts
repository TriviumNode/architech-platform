import { IsArray, IsBoolean, IsEmail, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { cw721 } from '../contracts';
import { ITokenModel } from '../interfaces/tokens.interface';

export class UpdateTokenDto {
  @IsOptional() @IsString()
  public metadataUri?: string;

  @IsOptional() @IsObject()
  public metadataExtension?: cw721.Metadata;
}

export class CreateTokenDto implements ITokenModel {
  @IsString()
  public tokenId: string;

  @IsString()
  public collectionAddress: string;

  @IsString()
  public collectionInfo: string;

  @IsOptional() @IsString()
  public metadataUri?: string;

  @IsOptional() @IsObject()
  public metadataExtension?: cw721.Metadata;

  @IsString()
  public owner: string;

  @IsString()
  public averageColor: string;

  @IsNumber()
  public total_views: number;

  traits: cw721.Trait[];
}


