import { Test, TestingModule } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import * as streamBuffers from 'stream-buffers';
import { createReadStream } from 'fs';
import { Cat } from './schemas/cat.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { getMockRes } from '@jest-mock/express';
import * as fs from 'fs';
import { NotFoundException } from '@nestjs/common';

const fileToBuffer = (filename) => {
  const readStream = createReadStream(filename);
  const chunks = [];
  return new Promise((resolve, reject) => {
    readStream.on('error', (err) => {
      reject(err);
    });

    readStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    readStream.on('close', () => {
      resolve(Buffer.concat(chunks));
    });
  });
};

describe('CatsController', () => {
  let catsController: CatsController;
  let catsService: CatsService;
  let imageFile: Express.Multer.File;
  const cat = {
    id: '123',
    path: './somePath/someFile.jpeg',
  };
  const { res, mockClear } = getMockRes();

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CatsController],
      providers: [
        {
          provide: getModelToken(Cat.name),
          useValue: Model,
        },
        CatsService,
      ],
    }).compile();

    const imageBuffer = (await fileToBuffer(
      './test/test-image.jpeg',
    )) as Buffer;

    const myReadableStreamBuffer = new streamBuffers.ReadableStreamBuffer({
      frequency: 10, // in milliseconds.
      chunkSize: 2048, // in bytes.
    });
    myReadableStreamBuffer.put(imageBuffer);
    imageFile = {
      buffer: imageBuffer,
      fieldname: 'file',
      originalname: 'cat.jpeg',
      encoding: '8bit',
      mimetype: 'image/jpeg',
      destination: './uploads',
      filename: 'randomName.jpeg',
      path: 'uploads/randomName.jpeg',
      size: 955578,
      stream: myReadableStreamBuffer,
    };

    mockClear();

    catsController = app.get<CatsController>(CatsController);
    catsService = app.get<CatsService>(CatsService);
  });

  describe('Post Cat Image', () => {
    it('should add new image to DB', async () => {
      const promise = Promise.resolve(cat);
      jest.spyOn(catsService, 'create').mockImplementation(() => promise);
      expect(await catsController.create(imageFile)).toBe(cat);
    });
  });
  describe('Get All Cat Images', () => {
    it('should download all images in DB', async () => {
      const promise = Promise.resolve(['./test/test-image.jpeg']);
      jest.spyOn(catsService, 'findAll').mockImplementation(() => promise);
      await catsController.downloadAll(res);
      expect(res.download).toBeCalled();
    });
    it('should throw an error if no images are in the DB', async () => {
      const promise = Promise.resolve(null);
      jest.spyOn(catsService, 'findAll').mockImplementation(() => promise);
      try {
        await catsController.downloadAll(res);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });
  describe('List All Cat Objects', () => {
    it('should return array of Cat Objects', async () => {
      const promise = Promise.resolve([cat]);
      jest.spyOn(catsService, 'findAllIds').mockImplementation(() => promise);
      expect(Array.isArray(await catsController.findAllIds())).toBe(true);
    });
    it('should throw an error if no images are in the DB', async () => {
      const promise = Promise.resolve(null);
      jest.spyOn(catsService, 'findAllIds').mockImplementation(() => promise);
      try {
        await catsController.findAllIds();
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });
  describe('Get Cat Image By Id', () => {
    it('should find image by Id', async () => {
      const promise = Promise.resolve(cat);
      jest.spyOn(catsService, 'findById').mockImplementation(() => promise);
      await catsController.findById('123', res);
      expect(res.download).toBeCalled();
    });
    it('should throw an error if requested resource is not in DB', async () => {
      const promise = Promise.resolve(null);
      jest.spyOn(catsService, 'findById').mockImplementation(() => promise);
      try {
        await catsController.findById('123', res);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });
  describe('Replace Cat Image', () => {
    it('should replace image at given Id with new provided image', async () => {
      jest.spyOn(fs, 'unlinkSync').mockImplementation();
      const promise = Promise.resolve(cat);
      jest.spyOn(catsService, 'findById').mockImplementation(() => promise);
      jest
        .spyOn(catsService, 'findAndUpdate')
        .mockImplementation(() => promise);
      expect(await catsController.findAndUpdate('123', res, imageFile)).toBe(
        cat,
      );
    });
    it('should throw an error if requested resource is not in DB', async () => {
      jest.spyOn(fs, 'unlinkSync').mockImplementation();
      const promise = Promise.resolve(null);
      jest.spyOn(catsService, 'findById').mockImplementation(() => promise);
      jest
        .spyOn(catsService, 'findAndUpdate')
        .mockImplementation(() => promise);
      try {
        await catsController.findAndUpdate('123', res, imageFile);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });
  describe('Delete Cat Image', () => {
    it('should delete image from DB', async () => {
      jest.spyOn(fs, 'unlinkSync').mockImplementation();
      const promise = Promise.resolve(cat);
      jest.spyOn(catsService, 'delete').mockImplementation(() => promise);
      await catsController.delete('123');
      expect(fs.unlinkSync).toBeCalled();
    });
    it('should throw an error if requested resource is not in DB', async () => {
      jest.spyOn(fs, 'unlinkSync').mockImplementation();
      const promise = Promise.resolve(null);
      jest.spyOn(catsService, 'delete').mockImplementation(() => promise);
      try {
        await catsController.delete('123');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
