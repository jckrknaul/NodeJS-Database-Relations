import { getRepository, Repository } from 'typeorm';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Order from '../entities/Order';

class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>;

  constructor() {
    this.ormRepository = getRepository(Order);
  }

  public async create({
    customer,
    products,
  }: ICreateOrderDTO): Promise<Order | undefined> {
    const order = this.ormRepository.create({
      customer_id: customer.id,
      order_products: products,
    });

    await this.ormRepository.save(order);

    const RefreshOrder = this.findById(order.id);

    return RefreshOrder;
  }

  public async findById(id: string): Promise<Order | undefined> {
    const findOrder = await this.ormRepository.findOne({
      where: { id },
    });

    return findOrder;
  }
}

export default OrdersRepository;
