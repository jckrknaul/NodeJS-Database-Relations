/* eslint-disable array-callback-return */
import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateProductService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({
    customer_id,
    products,
  }: IRequest): Promise<Order | undefined> {
    const findCustomer = await this.customersRepository.findById(customer_id);

    if (!findCustomer) {
      throw new AppError(`Cliente [${customer_id}] não encontrado!`, 400);
    }

    const findProducts = await this.productsRepository.findAllById(products);

    if (findProducts.length === 0) {
      throw new AppError(`Não encontrado o produto [${products}] !`, 400);
    }

    // eslint-disable-next-line array-callback-return
    products.map(prodNew => {
      // eslint-disable-next-line consistent-return
      const filteredProd = findProducts.filter((prodBD, _) => {
        if (prodNew.id === prodBD.id && prodNew.quantity > prodBD.quantity) {
          return prodBD;
        }
      });

      if (filteredProd.length > 0) {
        throw new AppError(
          `Produto [${filteredProd[0].id}] com quantidade insuficiente`,
          400,
        );
      }
    });

    await this.productsRepository.updateQuantity(products);

    const finalResulProd = findProducts.map(findProd => {
      const prod = products.filter((p, _) => p.id === findProd.id);

      return {
        product_id: findProd.id,
        price: findProd.price,
        quantity: prod[0].quantity,
      };
    });

    const order = await this.ordersRepository.create({
      customer: findCustomer,
      products: finalResulProd,
    });

    return order;
  }
}

export default CreateProductService;
