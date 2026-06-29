import { ActivationKey, Vendor } from '../models';

export class ActivationKeyRepository {
  async list(where: any = {}, bypassFilter = false) {
    return ActivationKey.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Vendor, as: 'vendor' }
      ],
      ...(bypassFilter ? { bypassAppFilter: true } : {})
    } as any);
  }

  async findById(id: string, bypassFilter = false) {
    return ActivationKey.findByPk(id, {
      include: [{ model: Vendor, as: 'vendor' }],
      ...(bypassFilter ? { bypassAppFilter: true } : {})
    } as any);
  }

  async findByKey(key: string, bypassFilter = false) {
    return ActivationKey.findOne({
      where: { key },
      ...(bypassFilter ? { bypassAppFilter: true } : {})
    } as any);
  }

  async create(data: any) {
    return ActivationKey.create(data);
  }

  async update(id: string, data: any, bypassFilter = false) {
    const keyRecord = await this.findById(id, bypassFilter);
    if (!keyRecord) return null;
    return keyRecord.update(data);
  }

  async delete(id: string, bypassFilter = false) {
    const keyRecord = await this.findById(id, bypassFilter);
    if (!keyRecord) return false;
    await keyRecord.destroy();
    return true;
  }
}
