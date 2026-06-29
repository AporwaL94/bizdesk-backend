import { VendorProduct } from '../models';

export class VendorProductRepository {
  async list(where: any = {}) {
    return VendorProduct.findAll({ where });
  }

  async findById(id: string) {
    return VendorProduct.findByPk(id);
  }

  async create(data: any) {
    return VendorProduct.create(data);
  }
}
