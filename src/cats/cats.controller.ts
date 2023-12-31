import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Get,
  Res,
  UploadedFile,
  UseInterceptors,
  Delete,
  Param,
  NotFoundException,
  Put,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { CatsService } from './cats.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';
import { CreateCatDto } from './dto/create-cat.dto';
import { Response } from 'express';
import * as AdmZip from 'adm-zip';
import { unlinkSync } from 'fs';
import {
  ApiTags,
  ApiResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiBody,
} from '@nestjs/swagger';
import { FileUploadDto } from './dto/file-upload.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const storage = diskStorage({
  destination: './uploads',
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + '-' + Math.round(Math.random() * 1e9) + '.jpg';
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});

@ApiTags('cats')
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: CreateCatDto,
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
    }),
  )
  @ApiBody({
    description: 'Image of Cat',
    type: FileUploadDto,
  })
  async create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 16000000 }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const createCatDto: CreateCatDto = {
      id: uuidv4(),
      path: file.path,
    };
    return this.catsService.create(createCatDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/downloadAll')
  @ApiOkResponse({
    description: 'Operation Successfull.',
    type: FileUploadDto,
  })
  @ApiNotFoundResponse({ description: 'No records exist in DB.' })
  async downloadAll(@Res() res: Response) {
    const filePaths = await this.catsService.findAll();
    if (filePaths === null) {
      throw new NotFoundException('No Cats in DB!');
    }
    const archiveName = 'cats.zip';
    const zip = new AdmZip();

    filePaths.forEach((filePath: string) => {
      zip.addLocalFile(filePath);
    });

    zip.writeZip(archiveName);

    res.download(archiveName, (err: any) => {
      if (err) {
        console.log('Error sending file:', err);
      } else {
        unlinkSync(archiveName);
        console.log('Files sent successfully');
      }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/listAll')
  @ApiOkResponse({
    description: 'Operation Successfull.',
    type: CreateCatDto,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'No records exist in DB.' })
  async findAllIds() {
    const objectIds = await this.catsService.findAllIds();
    if (objectIds === null) {
      throw new NotFoundException('No Cats in DB!');
    }
    return objectIds;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOkResponse({
    description: 'The record with given ID successfully found.',
    type: CreateCatDto,
  })
  @ApiNotFoundResponse({ description: 'The record with given ID not found.' })
  async findById(@Param('id') id: string, @Res() res: Response) {
    const cat = await this.catsService.findById(id);
    if (cat === null) {
      throw new NotFoundException(`Cat with id: ${id} NOT FOUND!`);
    }
    res.download(cat.path, (err: any) => {
      if (err) {
        console.log('Error sending file:', err);
      } else {
        console.log('Files sent successfully');
      }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOkResponse({
    description:
      'The record with given ID successfully found and replaced by the new file.',
    type: CreateCatDto,
  })
  @ApiNotFoundResponse({ description: 'The record with given ID not found.' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
    }),
  )
  async findAndUpdate(
    @Param('id') id: string,
    @Res() res: Response,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 16000000 }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const oldCat = await this.catsService.findById(id);
    if (oldCat === null) {
      throw new NotFoundException(`Cat with id: ${id} NOT FOUND!`);
    }
    unlinkSync(oldCat.path);

    const cat = await this.catsService.findAndUpdate(id, file.path);
    return cat;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  @ApiResponse({
    status: 204,
    description: 'The record has been successfully deleted.',
  })
  @ApiNotFoundResponse({ description: 'The record with given ID not found' })
  async delete(@Param('id') id: string) {
    const cat = await this.catsService.delete(id);
    if (cat === null) {
      throw new NotFoundException(`Cat with id: ${id} NOT FOUND!`);
    }
    unlinkSync(cat.path);
  }
}
