import mongoose, { Schema, Document, Types } from "mongoose";

export interface IServiceProduct {
  productId: Types.ObjectId;
  quantity: number;
}

export interface IService extends Document {
  name: string;
  description: string;
  basePrice: number;
  includedProducts: IServiceProduct[];
  createdAt: Date;
  updatedAt: Date;
}

const serviceProductSchema = new Schema<IServiceProduct>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  { _id: false }
);

const serviceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    includedProducts: {
      type: [serviceProductSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Service || mongoose.model<IService>("Service", serviceSchema);
