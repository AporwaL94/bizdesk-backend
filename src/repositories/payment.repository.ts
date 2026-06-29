import { Payment, Vendor, ActivationKey } from '../models';

export class PaymentRepository {
  async list(where: any = {}, bypassFilter = false) {
    return Payment.findAll({
      where,
      order: [['paidAt', 'DESC']],
      include: [
        { model: Vendor, as: 'vendor' },
        { model: ActivationKey, as: 'activationKey' }
      ],
      ...(bypassFilter ? { bypassAppFilter: true } : {})
    } as any);
  }

  async findById(id: string, bypassFilter = false) {
    return Payment.findByPk(id, {
      include: [
        { model: Vendor, as: 'vendor' },
        { model: ActivationKey, as: 'activationKey' }
      ],
      ...(bypassFilter ? { bypassAppFilter: true } : {})
    } as any);
  }

  async create(data: any) {
    return Payment.create(data);
  }
}
