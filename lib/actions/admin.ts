"use server";

import { redirect } from "next/navigation";
import { productService, categoryService } from "@/lib/services/product.service";

function getFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (value instanceof File) return "";
  return String(value ?? "").trim();
}

// Category Actions
export async function createCategory(prevState: any, formData: FormData) {
  const name = getFormValue(formData, "name");
  const description = getFormValue(formData, "description");

  if (!name) {
    return { error: "Category name is required" };
  }

  try {
    await categoryService.createCategory(name, description);
  } catch (error: any) {
    if (error.code === 11000) {
      return { error: "Category already exists" };
    }
    console.error("Create category error:", error);
    return { error: "Failed to create category" };
  }
  
  redirect("/admin/categories");
}

export async function updateCategory(id: string, prevState: any, formData: FormData) {
  const name = getFormValue(formData, "name");
  const description = getFormValue(formData, "description");

  if (!name) {
    return { error: "Category name is required" };
  }

  try {
    const result = await categoryService.updateCategory(id, { name, description });
    if (!result) {
      return { error: "Category not found" };
    }
  } catch (error) {
    console.error("Update category error:", error);
    return { error: "Failed to update category" };
  }
  
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  try {
    await categoryService.deleteCategory(id);
  } catch (error) {
    console.error("Delete category error:", error);
    return { error: "Failed to delete category" };
  }
  
  redirect("/admin/categories");
}

// Product Actions
export async function createProduct(prevState: any, formData: FormData) {
  const name = getFormValue(formData, "name");
  const description = getFormValue(formData, "description");
  const price = parseFloat(getFormValue(formData, "price") || "0");
  const categoryId = getFormValue(formData, "category");
  const stock = parseInt(getFormValue(formData, "stock") || "0");

  if (!name || !description || !categoryId || price <= 0 || stock < 0) {
    return { error: "All fields are required and valid" };
  }

  try {
    await productService.createProduct(
      name,
      description,
      price,
      categoryId,
      stock
    );
  } catch (error) {
    console.error("Create product error:", error);
    return { error: "Failed to create product" };
  }
  
  redirect("/admin/products");
}

export async function updateProduct(id: string, prevState: any, formData: FormData) {
  const name = getFormValue(formData, "name");
  const description = getFormValue(formData, "description");
  const price = parseFloat(getFormValue(formData, "price") || "0");
  const categoryId = getFormValue(formData, "category");
  const stock = parseInt(getFormValue(formData, "stock") || "0");

  if (!name || !description || !categoryId || price <= 0 || stock < 0) {
    return { error: "All fields are required and valid" };
  }

  try {
    const result = await productService.updateProduct(id, {
      name,
      description,
      price,
      category: categoryId,
      stock,
    });
    if (!result) {
      return { error: "Product not found" };
    }
  } catch (error) {
    console.error("Update product error:", error);
    return { error: "Failed to update product" };
  }
  
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  try {
    await productService.deleteProduct(id);
  } catch (error) {
    console.error("Delete product error:", error);
    return { error: "Failed to delete product" };
  }
  
  redirect("/admin/products");
}

// Service Actions
import { serviceService } from "@/lib/services/service.service";

function getFormArrayValue(formData: FormData, key: string): string[] {
  const values = formData.getAll(key);
  return values
    .filter((v) => !(v instanceof File))
    .map((v) => String(v).trim())
    .filter(Boolean);
}

export async function createService(prevState: any, formData: FormData) {
  const name = getFormValue(formData, "name");
  const description = getFormValue(formData, "description");
  const basePrice = parseFloat(getFormValue(formData, "basePrice") || "0");
  const productIds = getFormArrayValue(formData, "includedProducts");

  if (!name || !description || basePrice <= 0) {
    return { error: "Service name, description, and base price are required" };
  }

  try {
    const includedProducts = productIds.map((productId) => ({
      productId,
      quantity: 1,
    }));

    await serviceService.createService(
      name,
      description,
      basePrice,
      includedProducts.length > 0 ? includedProducts : undefined
    );
  } catch (error) {
    console.error("Create service error:", error);
    return { error: "Failed to create service" };
  }

  redirect("/admin/services");
}

export async function updateService(id: string, prevState: any, formData: FormData) {
  const name = getFormValue(formData, "name");
  const description = getFormValue(formData, "description");
  const basePrice = parseFloat(getFormValue(formData, "basePrice") || "0");
  const productIds = getFormArrayValue(formData, "includedProducts");

  if (!name || !description || basePrice <= 0) {
    return { error: "Service name, description, and base price are required" };
  }

  try {
    const includedProducts = productIds.map((productId) => ({
      productId,
      quantity: 1,
    }));

    const result = await serviceService.updateService(id, {
      name,
      description,
      basePrice,
      includedProducts,
    });

    if (!result) {
      return { error: "Service not found" };
    }
  } catch (error) {
    console.error("Update service error:", error);
    return { error: "Failed to update service" };
  }

  redirect("/admin/services");
}

export async function deleteService(id: string) {
  try {
    await serviceService.deleteService(id);
  } catch (error) {
    console.error("Delete service error:", error);
    return { error: "Failed to delete service" };
  }

  redirect("/admin/services");
}
