import { App } from '../models';

export class AppRepository {
  async list() {
    return App.findAll({ bypassAppFilter: true } as any);
  }

  async findById(id: string) {
    return App.findByPk(id, { bypassAppFilter: true } as any);
  }

  async findBySlug(slug: string) {
    return App.findOne({ where: { slug }, bypassAppFilter: true } as any);
  }

  async findByApiKey(apiKey: string) {
    return App.findOne({ where: { apiKey }, bypassAppFilter: true } as any);
  }

  async findByPackageName(packageName: string) {
    return App.findOne({ where: { packageName }, bypassAppFilter: true } as any);
  }

  async create(data: any) {
    return App.create(data);
  }

  async update(id: string, data: any) {
    const app = await this.findById(id);
    if (!app) return null;
    return app.update(data);
  }

  async delete(id: string) {
    const app = await this.findById(id);
    if (!app) return false;
    await app.destroy();
    return true;
  }
}
