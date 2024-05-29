import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
    @IsOptional()
    @IsPositive()
    @Type(() => Number ) // Transform data - Like --> enableImplicitConversion: true
    limit?: number;

    @IsOptional()
    @Type(() => Number)
    @Min(0)
    offset?: number;
}