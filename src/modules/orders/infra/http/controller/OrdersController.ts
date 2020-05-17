import { Request, Response } from 'express';

import { container } from 'tsyringe';

import CreateOrderService from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';

import { classToClass } from 'class-transformer';

export default class OrdersController {
  public async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const findOrderService = container.resolve(FindOrderService);

    const orders = await findOrderService.execute({ id });

    return response.json(classToClass(orders));
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const data = request.body;
    const { customer_id, products } = data;

    const createOrders = container.resolve(CreateOrderService);

    const order = await createOrders.execute({
      customer_id,
      products,
    });

    return response.json(classToClass(order));
  }
}
