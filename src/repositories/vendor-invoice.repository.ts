import { VendorInvoice } from '../models';

export class VendorInvoiceRepository {
  async list(where: any = {}) {
    return VendorInvoice.findAll({ where, order: [['invoiceCreatedAt', 'DESC']] });
  }

  async findById(id: string) {
    return VendorInvoice.findByPk(id);
  }

  async create(data: any) {
    return VendorInvoice.create(data);
  }
}
