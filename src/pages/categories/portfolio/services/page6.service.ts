import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePage, UpdatePage } from 'src/common/dto/page.input';
import { UpdateImage } from 'src/common/dto/site.input';
import { PortfolioPage6 } from 'src/common/entities/page.model';
import { PageDocument } from 'src/common/entities/page.schema';

import {
  pageCreated,
  pageUpdate,
  pageUpdateImage,
} from 'src/common/functions/pages';
import { ListInput } from 'src/common/pagination/dto/list.input';
import { slug } from 'utils/function';

@Injectable()
export class PortfolioPage6Service {
  constructor(
    @InjectModel(PortfolioPage6.name, 'portfolioDB')
    private pageModel: Model<PageDocument>,
  ) {}

  async create(input: CreatePage) {
    const page = await this.pageModel.findOne(
      {
        slug: slug(input.name),
        'data.siteId': input.siteId,
        parentId: input.parentId,
      },
      {},
      { lean: true },
    );

    if (page) {
      // this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new UnprocessableEntityException(
        `Ya tienes una página con este nombre "${input.name}" registrado`,
      );
    }

    const createdDocument = new this.pageModel(pageCreated(input));
    return (await createdDocument.save()).toJSON();
  }

  async update(input: UpdatePage) {
    const page = await this.pageModel.findOne(
      {
        _id: { $ne: input.id },
        slug: slug(input.name),
        'data.siteId': input.siteId,
        parentId: input.parentId,
      },
      {},
      { lean: true },
    );
    if (page) {
      // this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new UnprocessableEntityException(
        `Ya tienes una página con este nombre "${input.name}" registrado`,
      );
    }
    const document = await this.pageModel.findOneAndUpdate(
      { _id: input.id },
      pageUpdate(input),
      { lean: true, new: true },
    );
    if (!document) throw new NotFoundException('Document not found.');

    return document;
  }

  async updateImage(input: UpdateImage) {
    const document = await this.pageModel.findOneAndUpdate(
      { _id: input.id },
      pageUpdateImage(input),
      { lean: true, new: true },
    );
    if (!document) throw new NotFoundException('Document not found.');
    return document;
  }

  async deleteOne(id: string) {
    await this.pageModel.deleteOne({ _id: id });
    return id;
  }

  async deleteMany(ids: string[]) {
    await this.pageModel.deleteMany({ _id: { $in: ids } });
    return ids;
  }

  async deleteManyBySiteId(ids: string[]) {
    await this.pageModel.deleteMany({ 'data.siteId': { $in: ids } });
    return 'pages delete';
  }

  async deleteManyByParentId(ids: string[]) {
    await this.pageModel.deleteMany({ parentId: { $in: ids } });
    return 'pages delete';
  }

  async deleteAll() {
    await this.pageModel.deleteMany();
    return 'pages delete';
  }

  findAll() {
    return this.pageModel.find();
  }

  findByParentId(parentId: string) {
    return this.pageModel.find({ parentId: parentId });
  }

  findBySiteId(siteId: string) {
    return this.pageModel.find({ 'data.siteId': siteId });
  }

  async findOne(id: string) {
    const document = await this.pageModel.findOne(
      { _id: id },
      {},
      { lean: true },
    );
    if (!document) throw new NotFoundException('Document not found.');

    return document;
  }

  async findOneBySlug(slug: string, siteId: string) {
    const document = await this.pageModel.findOne(
      { slug: slug, 'data.siteId': siteId },
      {},
      { lean: true },
    );
    if (!document) throw new NotFoundException('Document not found.');

    return document;
  }

  
  findByParentIdByPagination(paginationQuery: ListInput, parentId: string) {
    const { limit, offset } = paginationQuery;
    return this.pageModel.find({ parentId: parentId }).sort({ 'data.updateDate.lastUpdatedAt': -1 }).skip(offset).limit(limit).exec();
  }



  async findByCursor(paginationQuery: ListInput, parentId: string) {
    const { limit, offset } = paginationQuery;
    const count = await this.pageModel.count({ parentId: parentId });
    const data = await this.pageModel
      .find({ parentId: parentId }, {}, { lean: true })
      .sort({ 'data.updateDate.lastUpdatedAt': -1 })
      .skip(offset)
      .limit(limit)
      .exec();
    return { data, count };
  }
}
