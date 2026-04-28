import mongoose, { Schema, Document, Types } from "mongoose";

export type CartItemType = "product" | "service";

export interface ICartItem {
  itemId: Types.ObjectId;
  itemType: CartItemType;
  quantity: number;
  snapshotPrice: number;
  snapshotData?: Record<string, any>;
  addedAt: Date;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    itemType: {
      type: String,
      enum: ["product", "service"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    snapshotPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    snapshotData: {
      type: Schema.Types.Mixed,
      default: {},
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Cart || mongoose.model<ICart>("Cart", cartSchema);
