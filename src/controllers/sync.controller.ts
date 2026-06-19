import { Request, Response } from 'express';
import { Vendor, VendorCustomer, VendorInvoice, VendorProduct, VendorShop } from '../models';
import { catchAsync } from '../utils/catch-async';

type ProductPayload = {
  localId?: string;
  id?: string;
  name?: string;
  barcode?: string;
  price?: number;
  costPrice?: number;
  stock?: number;
  category?: string;
  expiryDate?: string;
  imageUrl?: string;
  brand?: string;
  updatedAt?: string;
};

type InvoicePayload = {
  localId?: string;
  id?: string;
  invoiceNumber?: string;
  totalAmount?: number;
  customerName?: string;
  customerPhone?: string;
  customerMobile?: string;
  items?: object[];
  invoiceCreatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

type CustomerPayload = {
  localId?: string;
  id?: string;
  name?: string;
  mobile?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
};

function parseDate(value?: string | null) {
  if (!value) return null;
  let dateStr = value.trim();
  if (
    !dateStr.endsWith('Z') &&
    !/\+\d{2}:?\d{2}$/.test(dateStr) &&
    !/-\d{2}:?\d{2}$/.test(dateStr)
  ) {
    dateStr = dateStr + '+05:30';
  }
  return new Date(dateStr);
}

async function upsertProducts(vendorId: string, products: ProductPayload[] = []) {
  for (const product of products) {
    const localId = product.localId ?? product.id;
    if (!localId || !product.name) {
      continue;
    }

    await VendorProduct.upsert({
      vendorId,
      localId,
      name: product.name,
      barcode: product.barcode ?? null,
      price: Number(product.price ?? 0),
      costPrice: product.costPrice ?? null,
      stock: Number(product.stock ?? 0),
      category: product.category ?? null,
      expiryDate: parseDate(product.expiryDate),
      imageUrl: product.imageUrl ?? null,
      brand: product.brand ?? null,
      remoteUpdatedAt: parseDate(product.updatedAt)
    });
  }
}

async function upsertInvoices(vendorId: string, invoices: InvoicePayload[] = []) {
  for (const invoice of invoices) {
    const localId = invoice.localId ?? invoice.id;
    const invoiceCreatedAt = parseDate(invoice.invoiceCreatedAt ?? invoice.createdAt);
    if (!localId || !invoice.invoiceNumber || !invoiceCreatedAt) {
      continue;
    }

    let parsedItems = invoice.items ?? [];
    if (typeof parsedItems === 'string') {
      try {
        parsedItems = JSON.parse(parsedItems);
      } catch {
        parsedItems = [];
      }
    }

    await VendorInvoice.upsert({
      vendorId,
      localId,
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: Number(invoice.totalAmount ?? 0),
      customerName: invoice.customerName ?? null,
      customerPhone: invoice.customerPhone ?? invoice.customerMobile ?? null,
      items: Array.isArray(parsedItems) ? parsedItems : [],
      invoiceCreatedAt,
      remoteUpdatedAt: parseDate(invoice.updatedAt)
    });
  }
}

async function upsertShop(vendorId: string, shop?: Record<string, unknown>) {
  if (!shop) {
    return;
  }

  await VendorShop.upsert({
    vendorId,
    shopName: (shop.shopName ?? shop.name ?? null) as string | null,
    address: (shop.address ?? shop.addressLine1 ?? null) as string | null,
    phone: (shop.phone ?? shop.phoneNumber ?? null) as string | null,
    whatsappNumber: (shop.whatsappNumber ?? null) as string | null,
    upiId: (shop.upiId ?? null) as string | null,
    gstin: (shop.gstin ?? null) as string | null,
    logoUrl: (shop.logoUrl ?? null) as string | null,
    footerMessage: (shop.footerMessage ?? shop.footerText ?? null) as string | null,
    remoteUpdatedAt: parseDate(shop.updatedAt as string | undefined)
  });
}

async function upsertCustomers(vendorId: string, customers: CustomerPayload[] = []) {
  for (const customer of customers) {
    const localId = customer.localId ?? customer.id;
    if (!localId || !customer.name) {
      continue;
    }

    await VendorCustomer.upsert({
      vendorId,
      localId,
      name: customer.name,
      mobile: customer.mobile ?? null,
      address: customer.address ?? null,
      customerCreatedAt: parseDate(customer.createdAt),
      remoteUpdatedAt: parseDate(customer.updatedAt)
    });
  }
}

async function markSynced(vendor: Vendor) {
  await vendor.update({ lastSyncAt: new Date() });
}

export const pushSync = catchAsync(async (req: Request, res: Response) => {
  const vendor = res.locals.vendor as Vendor;
  await upsertProducts(vendor.id, req.body.products);
  await upsertInvoices(vendor.id, req.body.invoices);
  await upsertCustomers(vendor.id, req.body.customers);
  await upsertShop(vendor.id, req.body.shop);
  await markSynced(vendor);
  res.json({ ok: true, syncedAt: vendor.lastSyncAt ?? new Date() });
});

export const pullSync = catchAsync(async (_req: Request, res: Response) => {
  const vendor = res.locals.vendor as Vendor;
  const [products, invoices, customers, shop] = await Promise.all([
    VendorProduct.findAll({ where: { vendorId: vendor.id }, order: [['updatedAt', 'DESC']] }),
    VendorInvoice.findAll({ where: { vendorId: vendor.id }, order: [['invoiceCreatedAt', 'DESC']] }),
    VendorCustomer.findAll({ where: { vendorId: vendor.id }, order: [['name', 'ASC']] }),
    VendorShop.findOne({ where: { vendorId: vendor.id } })
  ]);

  res.json({ products, invoices, customers, shop });
});

export const pushProducts = catchAsync(async (req: Request, res: Response) => {
  const vendor = res.locals.vendor as Vendor;
  await upsertProducts(vendor.id, req.body.products ?? req.body);
  await markSynced(vendor);
  res.json({ ok: true, syncedAt: new Date() });
});

export const pushInvoices = catchAsync(async (req: Request, res: Response) => {
  const vendor = res.locals.vendor as Vendor;
  await upsertInvoices(vendor.id, req.body.invoices ?? req.body);
  await markSynced(vendor);
  res.json({ ok: true, syncedAt: new Date() });
});

export const pushShop = catchAsync(async (req: Request, res: Response) => {
  const vendor = res.locals.vendor as Vendor;
  await upsertShop(vendor.id, req.body.shop ?? req.body);
  await markSynced(vendor);
  res.json({ ok: true, syncedAt: new Date() });
});

export const pushCustomers = catchAsync(async (req: Request, res: Response) => {
  const vendor = res.locals.vendor as Vendor;
  await upsertCustomers(vendor.id, req.body.customers ?? req.body);
  await markSynced(vendor);
  res.json({ ok: true, syncedAt: new Date() });
});

export const syncStatus = catchAsync(async (_req: Request, res: Response) => {
  const vendor = res.locals.vendor as Vendor;
  const [productCount, invoiceCount, customerCount] = await Promise.all([
    VendorProduct.count({ where: { vendorId: vendor.id } }),
    VendorInvoice.count({ where: { vendorId: vendor.id } }),
    VendorCustomer.count({ where: { vendorId: vendor.id } })
  ]);

  res.json({
    lastSync: vendor.lastSyncAt,
    productCount,
    invoiceCount,
    customerCount,
    pendingRecords: 0
  });
});
