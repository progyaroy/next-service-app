"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/mongoose";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";

async function checkAdminAccess() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/");
  }
  return user;
}

function getFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (value instanceof File) return "";
  return String(value ?? "").trim();
}

// Category Actions
export async function createCategory(prevState: any, formData: FormData) {
  await checkAdminAccess();
  
  const name = getFormValue(formData, "name");
  const description = getFormValue(formData, "description");

  if (!name) {
    return { error: "Category name is required" };
  }

  try {
    await connectDB();
    const category = await Category.create({ name, description });
    return { success: true, data: category };
  } catch (error: any) {
    if (error.code === 11000) {
      return { error: "Category already exists" };
    }
    return { error: "Failed to create category" };
  }
}

export async function updateCategory(id: string, prevState: any, formData: FormData) {
  await checkAdminAccess();
  
  const name = getFormValue(formData, "name");
  const description = getFormValue(formData, "description");

  if (!name) {
    return { error: "Category name is required" };
  }

  try {
    await connectDB();
    const category = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );
    return { success: true, data: category };
  } catch (error) {
    return { error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  await checkAdminAccess();

  try {
    await connectDB();
    await Category.findByIdAndDelete(id);
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete category" };
  }
}

// Product Actions
export async function createProduct(prevState: any, formData: FormData) {
  await checkAdminAccess();
  
  const name = getFormValue(formData, "name");
  const description = getFormValue(formData, "description");
  const price = parseFloat(getFormValue(formData, "price") || "0");
  const category = getFormValue(formData, "category");
  const stock = parseInt(getFormValue(formData, "stock") || "0");

  if (!name || !description || !category || price <= 0 || stock < 0) {
    return { error: "All fields are required and valid" };
  }

  try {
    await connectDB();
    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
    });
    return { success: true, data: product };
  } catch (error) {
    return { error: "Failed to create product" };
  }
}

export async function updateProduct(id: string, prevState: any, formData: FormData) {
  await checkAdminAccess();
  
  const name = getFormValue(formData, "name");
  const description = getFormValue(formData, "description");
  const price = parseFloat(getFormValue(formData, "price") || "0");
  const category = getFormValue(formData, "category");
  const stock = parseInt(getFormValue(formData, "stock") || "0");

  if (!name || !description || !category || price <= 0 || stock < 0) {
    return { error: "All fields are required and valid" };
  }

  try {
    await connectDB();
    const product = await Product.findByIdAndUpdate(
      id,
      { name, description, price, category, stock },
      { new: true }
    );
    return { success: true, data: product };
  } catch (error) {
    return { error: "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  await checkAdminAccess();

  try {
    await connectDB();
    await Product.findByIdAndDelete(id);
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete product" };
  }
}
