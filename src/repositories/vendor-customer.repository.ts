import { VendorCustomer } from '../models';

export class VendorCustomerRepository {
  async list(where: any = {}) {
    return VendorCustomer.findAll({ where });
  }

  async findById(id: string) {
    return VendorCustomer.findByPk(id);
  }

  async create(data: any) {
    return VendorCustomer.create(data);
  }
}
