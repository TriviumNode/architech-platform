import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  public address: string;

  @IsString()
  public pubKey: string;

  @IsString()
  public nonce: string;

  @IsOptional() @IsBoolean()
  public firstLogin?: boolean;

  @IsOptional() @IsString()
  public username?: string;

  @IsOptional() @IsString()
  public bio?: string;

  @IsOptional() @IsString()
  public profile_image?: string;
}

export class UpdateUserDto {
  @IsOptional() @IsString()
  public username?: string;

  @IsOptional() @IsString()
  public bio?: string;
}

export class UpdateUserImageDto {
  @IsOptional() @IsString()
  public profile_image: string;
}

export class NonceRequestDto {
  @IsString()
  public address: string;

  @IsString()
  public pubKey: string;
}

export class NonceResponseDto {
  @IsString()
  public address: string;

  @IsString()
  public nonce: string;
}

export class WalletLoginDto {
  @IsString()
  public pubKey: string;

  @IsString()
  public signature: string;
}

export class EditUserBodyDto {
  @IsOptional()
  @IsString()
  public username?: string;

  @IsOptional()
  @IsString()
  public bio?: string;

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
  public verified?: string;
}