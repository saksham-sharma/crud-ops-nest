/* istanbul ignore file */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cat } from './schemas/cat.schema';
import { CreateCatDto } from './dto/create-cat.dto';
import * as nodePath from 'path';

@Injectable()
export class CatsService {
  constructor(@InjectModel(Cat.name) private catModel: Model<Cat>) {}

  async create(createCatDto: CreateCatDto): Promise<Cat> {
    const createdCat = new this.catModel(createCatDto);
    return createdCat.save();
  }

  async findAll(): Promise<string[]> {
    const cats = await this.catModel.find().exec();
    if (cats.length === 0) {
      return null;
    }
    return cats.map((cat) => {
      return nodePath.resolve(cat.path);
    });
  }

  async findAllIds(): Promise<Cat[]> {
    const cats = await this.catModel.find().exec();
    if (cats.length === 0) {
      return null;
    }
    return cats;
  }

  async findById(id: string): Promise<Cat> {
    const cat = await this.catModel.findOne({ id }).exec();
    if (!cat) {
      return null;
    }
    return cat;
  }

  async findAndUpdate(id: string, newPath: string): Promise<Cat> {
    const cat = await this.catModel
      .findOneAndUpdate({ id }, { path: newPath }, { new: true })
      .exec();
    if (!cat) {
      return null;
    }
    return cat;
  }

  async delete(id: string): Promise<Cat> {
    return this.catModel.findOneAndDelete({ id }).exec();
  }
}
