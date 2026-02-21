import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { DocumentTag } from './entities/document-tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(DocumentTag)
    private tagRepository: Repository<DocumentTag>,
  ) {}

  async create(createDto: CreateTagDto, userId: string) {
    const existingTag = await this.tagRepository.findOne({
      where: { name: createDto.name },
    });

    if (existingTag) {
      throw new Error('Tag with this name already exists');
    }

    const tag = this.tagRepository.create(createDto);

    return this.tagRepository.save(tag);
  }

  async findAll(query?: { keyword?: string; status?: string }, page: number = 1, pageSize: number = 10) {
    const where: any = {};

    if (query?.keyword) {
      where.name = Like(`%${query.keyword}%`);
    }

    const [items, total] = await this.tagRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    const tag = await this.tagRepository.findOne({
      where: { id },
      relations: ['documents'],
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async update(id: string, updateDto: UpdateTagDto) {
    const tag = await this.findOne(id);

    if (updateDto.name && updateDto.name !== tag.name) {
      const existingTag = await this.tagRepository.findOne({
        where: { name: updateDto.name },
      });
      if (existingTag) {
        throw new Error('Tag with this name already exists');
      }
    }

    const updated = this.tagRepository.merge(tag, updateDto);
    return this.tagRepository.save(updated);
  }

  async remove(id: string) {
    const tag = await this.findOne(id);
    await this.tagRepository.remove(tag);
    return { message: 'Tag deleted successfully' };
  }
}
