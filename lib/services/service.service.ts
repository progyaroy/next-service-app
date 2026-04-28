import "server-only";

import { connectDB } from "@/lib/db/mongoose";
import { serialize } from "@/lib/db/serialize";
import Service from "@/lib/models/Service";
import Product from "@/lib/models/Product";
import type { IService, IServiceProduct } from "@/lib/models/Service";

export type ServiceDTO = Omit<IService, "toObject" | "save">;

export interface ServiceWithTotalPrice extends ServiceDTO {
  totalPrice: number;
}

class ServiceService {
  async getAllServices(): Promise<ServiceWithTotalPrice[]> {
    await connectDB();
    const services = await Service.find({})
      .sort({ createdAt: -1 })
      .populate("includedProducts.productId", "name price")
      .lean();
    
    return serialize(
      (services as ServiceDTO[]).map((service) => this.calculateTotalPrice(service))
    );
  }

  async getServiceById(id: string): Promise<ServiceWithTotalPrice | null> {
    await connectDB();
    const service = await Service.findById(id)
      .populate("includedProducts.productId", "name price")
      .lean();
    
    if (!service) return null;
    return serialize(this.calculateTotalPrice(service as ServiceDTO));
  }

  async createService(
    name: string,
    description: string,
    basePrice: number,
    includedProducts?: IServiceProduct[]
  ): Promise<ServiceWithTotalPrice> {
    await connectDB();

    // Validate included products exist
    if (includedProducts && includedProducts.length > 0) {
      const productIds = includedProducts.map((p) => p.productId);
      const products = await Product.find({ _id: { $in: productIds } });
      if (products.length !== productIds.length) {
        throw new Error("One or more products not found");
      }
    }

    const service = await Service.create({
      name,
      description,
      basePrice,
      includedProducts: includedProducts || [],
    });

    const populated = await Service.findById(service._id)
      .populate("includedProducts.productId", "name price")
      .lean();

    return serialize(this.calculateTotalPrice(populated as ServiceDTO));
  }

  async updateService(
    id: string,
    updates: Partial<Omit<ServiceDTO, "_id" | "createdAt" | "updatedAt">>
  ): Promise<ServiceWithTotalPrice | null> {
    await connectDB();

    // Validate included products if provided
    if (updates.includedProducts && updates.includedProducts.length > 0) {
      const productIds = updates.includedProducts.map((p) => p.productId);
      const products = await Product.find({ _id: { $in: productIds } });
      if (products.length !== productIds.length) {
        throw new Error("One or more products not found");
      }
    }

    const service = await Service.findByIdAndUpdate(id, updates, { new: true })
      .populate("includedProducts.productId", "name price")
      .lean();

    if (!service) return null;
    return serialize(this.calculateTotalPrice(service as ServiceDTO));
  }

  async deleteService(id: string): Promise<boolean> {
    await connectDB();
    const result = await Service.findByIdAndDelete(id);
    return !!result;
  }

  private calculateTotalPrice(service: ServiceDTO): ServiceWithTotalPrice {
    let productsTotal = 0;

    if (service.includedProducts && service.includedProducts.length > 0) {
      productsTotal = service.includedProducts.reduce((sum, item) => {
        const product = item.productId as any;
        const price = product?.price || 0;
        const quantity = item.quantity || 1;
        return sum + price * quantity;
      }, 0);
    }

    return {
      ...service,
      totalPrice: service.basePrice + productsTotal,
    };
  }
}

export const serviceService = new ServiceService();
