import "server-only";

import { connectDB } from "@/lib/db/mongoose";
import { serialize } from "@/lib/db/serialize";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import type { IProduct } from "@/lib/models/Product";
import type { ICategory } from "@/lib/models/Category";

export type ProductDTO = Omit<IProduct, "toObject" | "save">;
export type CategoryDTO = Omit<ICategory, "toObject" | "save">;

class ProductService {
  async getAllProducts(): Promise<ProductDTO[]> {
    await connectDB();
    const products = await Product.find({}).sort({ createdAt: -1 }).populate("category", "name").lean();
    return serialize(products as ProductDTO[]);
  }

  async getProductsByCategory(category: string): Promise<ProductDTO[]> {
    await connectDB();
    const products = await Product.find({ category }).sort({ createdAt: -1 }).lean();
    return serialize(products as ProductDTO[]);
  }

  async getProductById(id: string): Promise<ProductDTO | null> {
    await connectDB();
    const product = await Product.findById(id).populate("category", "name").lean();
    return serialize(product as ProductDTO | null);
  }

  async createProduct(
    name: string,
    description: string,
    price: number,
    categoryId: string,
    stock: number,
    image?: string
  ): Promise<ProductDTO> {
    await connectDB();
    const product = await Product.create({
      name,
      description,
      price,
      category: categoryId,
      stock,
      image,
    });
    return serialize(product.toObject() as ProductDTO);
  }

  async updateProduct(
    id: string,
    updates: any
  ): Promise<ProductDTO | null> {
    await connectDB();
    const product = await Product.findByIdAndUpdate(id, updates, { new: true }).lean();
    return serialize(product as ProductDTO | null);
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
    return serialize(categories as CategoryDTO[]);
  }

  async getCategoryById(id: string): Promise<CategoryDTO | null> {
    await connectDB();
    const category = await Category.findById(id).lean();
    return serialize(category as CategoryDTO | null);
  }

  async createCategory(name: string, description?: string): Promise<CategoryDTO> {
    await connectDB();
    const category = await Category.create({
      name,
      description,
    });
    return serialize(category.toObject() as CategoryDTO);
  }

  async updateCategory(
    id: string,
    updates: Partial<Omit<CategoryDTO, "_id" | "createdAt">>
  ): Promise<CategoryDTO | null> {
    await connectDB();
    const category = await Category.findByIdAndUpdate(id, updates, { new: true }).lean();
    return serialize(category as CategoryDTO | null);
  }

  async deleteCategory(id: string): Promise<boolean> {
    await connectDB();
    const result = await Category.findByIdAndDelete(id);
    return !!result;
  }
}

export const productService = new ProductService();
export const categoryService = new CategoryService();
