import { Vendor, ActivationKey, Payment, VendorShop } from '../models';

export class VendorRepository {
  async list(where: any = {}, bypassFilter = false) {
    return Vendor.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        { model: ActivationKey, as: 'activationKey' },
        { model: Payment, as: 'payments' }
      ],
      ...(bypassFilter ? { bypassAppFilter: true } : {})
    } as any);
  }

  async findById(id: string, bypassFilter = false) {
    return Vendor.findByPk(id, {
      include: [
        { model: ActivationKey, as: 'activationKey' },
        { model: Payment, as: 'payments', separate: true, order: [['paidAt', 'DESC']] },
        { model: VendorShop, as: 'shop' }
      ],
      ...(bypassFilter ? { bypassAppFilter: true } : {})
    } as any);
  }

  async findByDeviceId(deviceId: string, bypassFilter = false) {
    return Vendor.findOne({
      where: { deviceId },
      ...(bypassFilter ? { bypassAppFilter: true } : {})
    } as any);
  }

  async create(data: any) {
    return Vendor.create(data);
  }

  async update(id: string, data: any, bypassFilter = false) {
    const vendor = await this.findById(id, bypassFilter);
    if (!vendor) return null;
    return vendor.update(data);
  }
}
