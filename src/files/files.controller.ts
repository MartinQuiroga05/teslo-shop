import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Get, Param, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/file-filter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/file-namer.helper';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    // limits: { filSize: 1000 }
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  uploadProductImage(@UploadedFile() file: Express.Multer.File){
    if(!file) throw new BadRequestException('Make sure that file is an image');

    const secureUrl = `${this.configService.get('HOST_API')}/files/products/${file.filename}`;

    return {
      secureUrl
    };
  }

  @Get('products/:imageName')
  findProductImage(@Res() res: Response, @Param('imageName') imageName: string){
    const path = this.filesService.getStaticProductImage(imageName);

    res.sendFile(path);
  }
}
