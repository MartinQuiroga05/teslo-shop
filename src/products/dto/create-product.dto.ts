import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateProductDto {
   
    @ApiProperty({
        description: 'Product title (unique)',
        nullable: false,
        minLength: 1
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    price?: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @IsPositive()
    stock?: number;

    @ApiProperty()
    @IsString({each: true})
    @IsArray()
    sizes: string[];

    @ApiProperty()
    @IsIn(['men','women','kid','unisex'])
    gender: string;

    @ApiProperty()
    @IsString({each: true})
    @IsOptional()
    @IsArray()
    tags?: string[];
    
    @ApiProperty()
    @IsString({each: true})
    @IsOptional()
    @IsArray()
    images?: string[];
}
