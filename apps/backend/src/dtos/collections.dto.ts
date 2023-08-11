import { CollectionProfile, cw721 } from '@architech/types';
import { IsOptional, IsString } from 'class-validator';

export class ImportCollectionBodyDto {
  @IsString()
  public name: string;

  @IsString()
  public hidden: string;

  @IsOptional()
  @IsString()
  public description?: string;

  @IsOptional()
  @IsString()
  public website?: string;

  @IsOptional()
  @IsString()
  public twitter?: string;

  @IsOptional()
  @IsString()
  public telegram?: string;

  @IsOptional()
  @IsString()
  public discord?: string;

  @IsOptional()
  @IsString()
  public categories?: string;
}

export class EditCollectionBodyDto {
  @IsOptional()
  @IsString()
  public name?: string;

  @IsOptional()
  @IsString()
  public hidden?: string;

  @IsOptional()
  @IsString()
  public description?: string;

  @IsOptional()
  @IsString()
  public website?: string;

  @IsOptional()
  @IsString()
  public twitter?: string;

  @IsOptional()
  @IsString()
  public discord?: string;

  @IsOptional()
  @IsString()
  public telegram?: string;

  @IsOptional()
  @IsString()
  public categories?: string;

  // Admin Only Settings
  @IsOptional()
  @IsString()
  public admin_hidden?: string;

  @IsOptional()
  @IsString()
  public featured?: string;

  @IsOptional()
  @IsString()
  public verified?: string;
}
