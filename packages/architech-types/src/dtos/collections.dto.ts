import { cw721 } from '@architech/types';
import { IsArray, IsBoolean, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';
import { ImportCollectionRequest } from '../interfaces/collections.interface';

export class updateCollectionDto {
  @IsOptional() @IsString()
  public name?: string;

  @IsOptional() @IsString()
  public description?: string;

  @IsOptional() @IsString()
  public website?: string;

  @IsOptional() @IsString()
  public twitter?: string;

  @IsOptional() @IsString()
  public discord?: string;

  @IsOptional() @IsString()
  public telegram?: string;
}

export class ImportCollectionDto implements ImportCollectionRequest {
  @IsString()
  public address: string;

  @IsOptional() @IsString()
  public name?: string;

  @IsOptional() @IsString()
  public description?: string;

  @IsOptional() @IsString()
  public discord?: string;

  @IsOptional() @IsString()
  public twitter?: string;

  @IsOptional() @IsString()
  public website?: string;

  @IsOptional() @IsString()
  public telegram?: string;
}
