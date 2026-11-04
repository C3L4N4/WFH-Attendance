import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';

export class UpdateEmployeeDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    fullName?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    department?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    position?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}