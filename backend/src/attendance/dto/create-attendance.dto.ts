import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAttendanceDto {
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}
