import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUser } from 'src/common/dto/user.input';
import { PetUser } from 'src/common/entities/user.model';
import { UserDocument } from 'src/common/entities/user.schema';
import * as bcrypt from 'bcrypt';

import { userCreated } from 'src/common/functions/users';
import { ListInput } from 'src/common/pagination/dto/list.input';

@Injectable()
export class PetUserService {
  constructor(
    @InjectModel(PetUser.name, 'petDB')
    private userModel: Model<UserDocument>,
  ) {}

  async create(input: CreateUser) {
    const createdDocument = new this.userModel(
     await userCreated(input),
    );
    return (await createdDocument.save()).toJSON();
  }

  // async update(input: UpdateUser) {
  //   const document = await this.siteModel.findOneAndUpdate(siteUpdate(input));
  //   if (!document) throw new NotFoundException('Document not found.');

  //   return document;
  // }
  // async updateDB(input: UpdateDB) {
  //   const document = await this.siteModel.findOneAndUpdate(siteDBUpdate(input));
  //   if (!document) throw new NotFoundException('Document not found.');

  //   return document;
  // }
  // async updateImage(input: UpdateImage) {
  //   const document = await this.siteModel.findOneAndUpdate(
  //     siteImageUpdate(input),
  //   );
  //   if (!document) throw new NotFoundException('Document not found.');

  //   return document;
  // }

  async deleteOne(id: string) {
    await this.userModel.deleteOne({ _id: id });
    return id;
  }

  async deleteMany(ids: string[]) {
    this.userModel.deleteMany({ _id: { $in: ids } });
    return ids;
  }

  async deleteManyBySiteId(ids: string[]) {
    this.userModel.deleteMany({ 'data.siteId': { $in: ids } });
    return 'users delete';
  }

  async deleteAll() {
    this.userModel.deleteMany();
    return 'users deleted';
  }

  findAll() {
    return this.userModel.find();
  }

  findBySiteId(siteId: string) {
    return this.userModel.find({ 'data.siteId': siteId });
  }

  async findOne(id: string) {
    const document = await this.userModel.findOne({ _id: id });
    if (!document) throw new NotFoundException('Document not found.');

    return document;
  }

  async findOneByEmail(email: string, siteId: string) {
    const document = await this.userModel.findOne({
      email: email,
      'data.siteId': siteId,
    });
    if (!document) throw new NotFoundException('Document not found.');

    return document;
  }

  // async findByCursor(paginationQuery: ListInput) {
  //   const { limit, offset } = paginationQuery;
  //   const count = await this.siteModel.count();

  //   const data = await this.siteModel
  //     .find({}, {}, { lean: true })
  //     .sort({ 'data.updateDate.lastUpdatedAt': -1 })
  //     .skip(offset)
  //     .limit(limit)
  //     .exec();
  //   return { data, count };
  // }
}
