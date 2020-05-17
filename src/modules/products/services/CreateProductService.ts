import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Product from '../infra/typeorm/entities/Product';
import IProductsRepository from '../repositories/IProductsRepository';

interface IRequest {
  name: string;
  price: number;
  quantity: number;
}

@injectable()
class CreateProductService {
  constructor(
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
  ) {}

  public async execute({ name, price, quantity }: IRequest): Promise<Product> {
    const existProduct = await this.productsRepository.findByName(name);

    if (existProduct) {
      throw new AppError(`Ja existe um produto com o nome [${name}]`, 400);
    }

    const product = await this.productsRepository.create({
      name,
      quantity,
      price,
    });

    return product;
  }
}

export default CreateProductService;
