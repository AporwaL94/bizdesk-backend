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

    const price = Number(product.price ?? 0);
    const costPrice = product.costPrice ?? null;
    const stock = Number(product.stock ?? 0);
    const expiryDate = parseDate(product.expiryDate);
    const remoteUpdatedAt = parseDate(product.updatedAt);

    const existing = await VendorProduct.findOne({ where: { vendorId, localId } });
    if (existing) {
      const isSame =
        existing.name === product.name &&
        existing.barcode === (product.barcode ?? null) &&
        Number(existing.price) === price &&
        (existing.costPrice === null ? null : Number(existing.costPrice)) === costPrice &&
        Number(existing.stock) === stock &&
        existing.category === (product.category ?? null) &&
        (existing.expiryDate?.getTime() ?? null) === (expiryDate?.getTime() ?? null) &&
        existing.imageUrl === (product.imageUrl ?? null) &&
        existing.brand === (product.brand ?? null);

      if (isSame) {
        continue;
      }

      await existing.update({
        name: product.name,
        barcode: product.barcode ?? null,
        price,
        costPrice,
        stock,
        category: product.category ?? null,
        expiryDate,
        imageUrl: product.imageUrl ?? null,
        brand: product.brand ?? null,
        remoteUpdatedAt
      });
    } else {
      await VendorProduct.create({
        vendorId,
        localId,
        name: product.name,
        barcode: product.barcode ?? null,
        price,
        costPrice,
        stock,
        category: product.category ?? null,
        expiryDate,
        imageUrl: product.imageUrl ?? null,
        brand: product.brand ?? null,
        remoteUpdatedAt
      });
    }
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

    const totalAmount = Number(invoice.totalAmount ?? 0);
    const customerName = invoice.customerName ?? null;
    const customerPhone = invoice.customerPhone ?? invoice.customerMobile ?? null;
    const remoteUpdatedAt = parseDate(invoice.updatedAt);

    const existing = await VendorInvoice.findOne({ where: { vendorId, localId } });
    if (existing) {
      const isSame =
        existing.invoiceNumber === invoice.invoiceNumber &&
        Number(existing.totalAmount) === totalAmount &&
        existing.customerName === customerName &&
        existing.customerPhone === customerPhone &&
        (existing.invoiceCreatedAt?.getTime() ?? null) === (invoiceCreatedAt?.getTime() ?? null) &&
        JSON.stringify(existing.items) === JSON.stringify(parsedItems);

      if (isSame) {
        continue;
      }

      await existing.update({
        invoiceNumber: invoice.invoiceNumber,
        totalAmount,
        customerName,
        customerPhone,
        items: Array.isArray(parsedItems) ? parsedItems : [],
        invoiceCreatedAt,
        remoteUpdatedAt
      });
    } else {
      await VendorInvoice.create({
        vendorId,
        localId,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount,
        customerName,
        customerPhone,
        items: Array.isArray(parsedItems) ? parsedItems : [],
        invoiceCreatedAt,
        remoteUpdatedAt
      });
    }
  }
}

async function upsertShop(vendorId: string, shop?: Record<string, unknown>) {
  if (!shop) {
    return;
  }

  const shopName = (shop.shopName ?? shop.name ?? null) as string | null;
  const address = (shop.address ?? shop.addressLine1 ?? null) as string | null;
  const phone = (shop.phone ?? shop.phoneNumber ?? null) as string | null;
  const whatsappNumber = (shop.whatsappNumber ?? null) as string | null;
  const upiId = (shop.upiId ?? null) as string | null;
  const gstin = (shop.gstin ?? null) as string | null;
  const logoUrl = (shop.logoUrl ?? null) as string | null;
  const footerMessage = (shop.footerMessage ?? shop.footerText ?? null) as string | null;
  const remoteUpdatedAt = parseDate(shop.updatedAt as string | undefined);

  const existing = await VendorShop.findOne({ where: { vendorId } });
  if (existing) {
    const isSame =
      existing.shopName === shopName &&
      existing.address === address &&
      existing.phone === phone &&
      existing.whatsappNumber === whatsappNumber &&
      existing.upiId === upiId &&
      existing.gstin === gstin &&
      existing.logoUrl === logoUrl &&
      existing.footerMessage === footerMessage;

    if (isSame) {
      return;
    }

    await existing.update({
      shopName,
      address,
      phone,
      whatsappNumber,
      upiId,
      gstin,
      logoUrl,
      footerMessage,
      remoteUpdatedAt
    });
  } else {
    await VendorShop.create({
      vendorId,
      shopName,
      address,
      phone,
      whatsappNumber,
      upiId,
      gstin,
      logoUrl,
      footerMessage,
      remoteUpdatedAt
    });
  }
}

async function upsertCustomers(vendorId: string, customers: CustomerPayload[] = []) {
  for (const customer of customers) {
    const localId = customer.localId ?? customer.id;
    if (!localId || !customer.name) {
      continue;
    }

    const name = customer.name;
    const mobile = customer.mobile ?? null;
    const address = customer.address ?? null;
    const customerCreatedAt = parseDate(customer.createdAt);
    const remoteUpdatedAt = parseDate(customer.updatedAt);

    const existing = await VendorCustomer.findOne({ where: { vendorId, localId } });
    if (existing) {
      const isSame =
        existing.name === name &&
        existing.mobile === mobile &&
        existing.address === address &&
        (existing.customerCreatedAt?.getTime() ?? null) === (customerCreatedAt?.getTime() ?? null);

      if (isSame) {
        continue;
      }

      await existing.update({
        name,
        mobile,
        address,
        customerCreatedAt,
        remoteUpdatedAt
      });
    } else {
      await VendorCustomer.create({
        vendorId,
        localId,
        name,
        mobile,
        address,
        customerCreatedAt,
        remoteUpdatedAt
      });
    }
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
