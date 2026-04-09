import "server-only";

import { connectDB } from "@/lib/db/mongoose";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import type { IProduct } from "@/lib/models/Product";
import type { ICategory } from "@/lib/models/Category";

export type ProductDTO = Omit<IProduct, "toObject" | "save">;
export type CategoryDTO = Omit<ICategory, "toObject" | "save">;

class ProductService {
  async getAllProducts(): Promise<ProductDTO[]> {
    await connectDB();
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    return products as ProductDTO[];
  }

  async getProductsByCategory(category: string): Promise<ProductDTO[]> {
    await connectDB();
    const products = await Product.find({ category }).sort({ createdAt: -1 }).lean();
    return products as ProductDTO[];
  }

  async getProductById(id: string): Promise<ProductDTO | null> {
    await connectDB();
    const product = await Product.findById(id).lean();
    return product as ProductDTO | null;
  }

  async createProduct(
    name: string,
    description: string,
    price: number,
    category: string,
    stock: number,
    image?: string
  ): Promise<ProductDTO> {
    await connectDB();
    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      image,
    });
    return product.toObject() as ProductDTO;
  }

  async updateProduct(
    id: string,
    updates: Partial<Omit<ProductDTO, "_id" | "createdAt">>
  ): Promise<ProductDTO | null> {
    await connectDB();
    const product = await Product.findByIdAndUpdate(id, updates, { new: true }).lean();
    return product as ProductDTO | null;
  }

  async deleteProduct(id: string): Promise<boolean> {
    await connectDB();
    const result = await Product.findByIdAndDelete(id);
    return !!result;
  }
}

class CategoryService {
  async getAllCategories(): Promise<CategoryDTO[]> {
    await connectDB();
    const categories = await Category.find({}).sort({ createdAt: -1 }).lean();
    return categories as CategoryDTO[];
  }

  async getCategoryById(id: string): Promise<CategoryDTO | null> {
    await connectDB();
    const category = await Category.findById(id).lean();
    return category as CategoryDTO | null;
  }

  async createCategory(name: string, description?: string): Promise<CategoryDTO> {
    await connectDB();
    const category = await Category.create({
      name,
      description,
    });
    return category.toObject() as CategoryDTO;
  }

  async updateCategory(
    id: string,
    updates: Partial<Omit<CategoryDTO, "_id" | "createdAt">>
  ): Promise<CategoryDTO | null> {
    await connectDB();
    const category = await Category.findByIdAndUpdate(id, updates, { new: true }).lean();
    return category as CategoryDTO | null;
  }

  async deleteCategory(id: string): Promise<boolean> {
    await connectDB();
    const result = await Category.findByIdAndDelete(id);
    return !!result;
  }
}

export const productService = new ProductService();
export const categoryService = new CategoryService();
