type Serializable =
  | string
  | number
  | boolean
  | null
  | Serializable[]
  | { [key: string]: Serializable };

const serializeMongo = (data: unknown): Serializable => {
  if (data === null || data === undefined) return null;

  if (Array.isArray(data)) {
    return data.map((item) => serializeMongo(item));
  }

  if (typeof data === "object") {
    const obj = data as Record<string, any>;

    const result: Record<string, Serializable> = {};

    for (const key in obj) {
      if (key === "_id") {
        result[key] = obj[key]?.toString();
      } else if (obj[key] instanceof Date) {
        result[key] = obj[key].toISOString();
      } else {
        result[key] = serializeMongo(obj[key]);
      }
    }

    return result;
  }

  return data as Serializable;
};

export const serialize = <T>(data: T): T => {
  return serializeMongo(data) as T;
};