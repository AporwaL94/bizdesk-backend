import { VendorShop } from '../models';

export class VendorShopRepository {
  async findByVendorId(vendorId: string) {
    return VendorShop.findOne({ where: { vendorId } });
  }

  async create(data: any) {
    return VendorShop.create(data);
  }
}
