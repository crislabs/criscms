import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { PetSite, ListPetSite, Site } from 'src/common/entities/site.model';
import {
  CreateSite,
  UpdateAdminSite,
  UpdateDB,
  UpdateImage,
  UpdateSite,
} from 'src/common/dto/site.input';
import ConnectionArgs, {
  getPagingParameters,
} from 'src/common/pagination/relay/connection.args';
import { connectionFromArraySlice } from 'graphql-relay';
import { PetSiteService } from './category.service';
// import { PetPage0Service } from 'src/pages/categories/pet/services/page0.service';
import { page0 } from 'src/common/functions/pages';
import { PetPage0 } from 'src/common/entities/page.model';

// import { PetArticleService } from 'src/articles/categories/pet/category.service';
import { PetUser } from 'src/common/entities/user.model';
import { PetProduct } from 'src/common/entities/product.model';
import { PetArticle } from 'src/common/entities/article.model';
// import { PetUserService } from 'src/users/categories/pet/category.service';
// import { PetProductService } from 'src/products/categories/pet/category.service';
import { ListInput } from 'src/common/pagination/dto/list.input';
import { PetPage0Service } from 'src/pages/categories/pet/services/page0.service';
import { PetUserService } from 'src/users/categories/pet/category.service';
import { PetProductService } from 'src/products/categories/pet/category.service';
import { PetArticleService } from 'src/articles/categories/pet/category.service';
import { PetAdoptionService } from 'src/adoptions/categories/pet/category.service';
import { PetAdoption } from 'src/common/entities/adoption.model';
import { PetCommentService } from 'src/comments/categories/pet/category.service';
import { PetTeamService } from 'src/teams/categories/pet/category.service';
import { PetTeam } from 'src/common/entities/team.model';

@Resolver(() => PetSite)
export class PetSiteResolver {
  constructor(
    private readonly siteService: PetSiteService,
    private readonly pageService: PetPage0Service,
    private readonly userService: PetUserService,
    private readonly commentService: PetCommentService,
    private readonly productService: PetProductService,
    private readonly adoptionService: PetAdoptionService,
    private readonly articleService: PetArticleService,
    private readonly teamService: PetTeamService,
  ) {}

  @Mutation(() => PetSite, { name: 'petCreateSite' })
  async create(@Args('input') input: CreateSite) {
    const document = await this.siteService.create(input);
    this.pageService.create(page0(document._id.toString(), input.uid));
    return document;
  }

  @Mutation(() => PetSite, { name: 'petUpdateSite' })
  update(@Args('input') input: UpdateSite) {
    return this.siteService.update(input);
  }

  @Mutation(() => PetSite, { name: 'petUpdateDbSite' })
  updateDB(@Args('input') input: UpdateDB) {
    return this.siteService.updateDB(input);
  }

  @Mutation(() => PetSite, { name: 'petUpdateAdminSite' })
  updateAdminDB(@Args('input') input: UpdateAdminSite) {
    return this.siteService.updateAdmin(input);
  }

  @Mutation(() => PetSite, { name: 'petUpdateImageSite' })
  updateImage(@Args('input') input: UpdateImage) {
    return this.siteService.updateImage(input);
  }

  @Mutation(() => String, { name: 'petDeleteSite' })
  deleteOne(@Args('id', { type: () => String }) id: string) {
    this.pageService.deleteManyBySiteId([id]);
    this.userService.deleteManyBySiteId([id]);
    this.commentService.deleteManyBySiteId([id]);
    this.productService.deleteManyBySiteId([id]);
    this.adoptionService.deleteManyBySiteId([id]);
    this.articleService.deleteManyBySiteId([id]);
    this.teamService.deleteManyBySiteId([id]);
    return this.siteService.deleteOne(id);
  }

  @Mutation(() => [String], { name: 'petDeleteSites' })
  deleteMany(@Args('ids', { type: () => [String] }) ids: string[]) {
    this.pageService.deleteManyBySiteId(ids);
    this.userService.deleteManyBySiteId(ids);
    this.commentService.deleteManyBySiteId(ids);
    this.productService.deleteManyBySiteId(ids);
    this.adoptionService.deleteManyBySiteId(ids);
    this.articleService.deleteManyBySiteId(ids);
    this.teamService.deleteManyBySiteId(ids);
    return this.siteService.deleteMany(ids);
  }

  @Mutation(() => String, { name: 'petDeleteAllSites' })
  deleteAll() {
    this.pageService.deleteAll();
    this.userService.deleteAll()
    this.commentService.deleteAll()
    this.productService.deleteAll();
    this.adoptionService.deleteAll();
    this.articleService.deleteAll();
    this.teamService.deleteAll();
    return this.siteService.deleteAll();
  }

  @Query(() => PetSite, { name: 'petGetSite' })
  async findOne(@Args('id') id: string) {
    return await this.siteService.findOne(id);
  }

  @Query(() => [PetSite], { name: 'petGetSites' })
  findAll() {
    return this.siteService.findAll();
  }

  @Query(() => [PetSite], { name: 'petGetSitesByPagination' })
  findByParentIdByPagination(
    @Args('listInput') listInput: ListInput
  ) {
    return this.siteService.findByParentIdByPagination(listInput);
  }

  @Query(() => ListPetSite, { name: 'petGetSitesWithCursor' })
  async petGetSitesWithCursor(
    @Args('args') args: ConnectionArgs,
  ): Promise<ListPetSite> {
    const { limit, offset } = getPagingParameters(args);
    const { data, count } = await this.siteService.findByCursor({
      limit,
      offset,
    });
    const page = connectionFromArraySlice(data, args, {
      arrayLength: count,
      sliceStart: offset || 0,
    });
    return { page, pageData: { count, limit, offset } };
  }

  @ResolveField('pages', () => [PetPage0], { nullable: 'itemsAndList' })
  getPage0(@Parent() { _id }: PetSite) {
    return this.pageService.findByParentId(_id.toString());
  }

  @ResolveField('users', () => [PetUser], { nullable: 'itemsAndList' })
  getUsers(@Parent() { _id }: PetSite) {
    return this.userService.findBySiteId(_id.toString());
  }

  @ResolveField('products', () => [PetProduct], { nullable: 'itemsAndList' })
  getProducts(@Parent() { _id }: PetSite) {
    return this.productService.findBySiteId(_id.toString());
  }
  
  @ResolveField('adoptions', () => [PetAdoption], { nullable: 'itemsAndList' })
  getAdoptions(@Parent() { _id }: PetSite) {
    return this.adoptionService.findBySiteId(_id.toString());
  }

  @ResolveField('articles', () => [PetArticle], { nullable: 'itemsAndList' })
  getArticles(@Parent() { _id }: PetSite) {
    return this.articleService.findBySiteId(_id.toString());
  }
  @ResolveField('team', () => [PetTeam], { nullable: 'itemsAndList' })
  getTeam(@Parent() { _id }: PetSite) {
    return this.teamService.findBySiteId(_id.toString());
  }
}
