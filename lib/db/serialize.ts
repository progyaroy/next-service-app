import mongoose from "mongoose";

type Serializable =
  | string
  | number
  | boolean
  | null
  | Serializable[]
  | { [key: string]: Serializable };

const serializeMongo = (data: unknown): Serializable => {
  if (data === null || data === undefined) return null;

  // Handle ObjectId
  if (data instanceof mongoose.Types.ObjectId) {
    return data.toString();
  }

  // Handle Date
  if (data instanceof Date) {
    return data.toISOString();
  }

  // Handle Array
  if (Array.isArray(data)) {
    return data.map((item) => serializeMongo(item));
  }

  // Handle Object
  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const result: Record<string, Serializable> = {};

    for (const key in obj) {
      const value = obj[key];
      
      if (value === null || value === undefined) {
        result[key] = null;
      } else if (value instanceof mongoose.Types.ObjectId) {
        result[key] = value.toString();
      } else if (value instanceof Date) {
        result[key] = value.toISOString();
      } else if (Array.isArray(value)) {
        result[key] = serializeMongo(value);
      } else if (typeof value === "object") {
        result[key] = serializeMongo(value);
      } else {
        result[key] = value as Serializable;
      }
    }

    return result;
  }

  return data as Serializable;
};

export const serialize = <T>(data: T): T => {
  return serializeMongo(data) as T;
};
