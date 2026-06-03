import mongoose, { Schema, Document, Types } from "mongoose";
import type { MessageType } from "@/lib/types/chat";

interface IUnreadCounter {
  userId: Types.ObjectId;
  count: number;
}

interface ILastMessage {
  messageId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  messageType: MessageType;
  createdAt: Date;
}

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  participantsKey: string;
  unreadCounters: IUnreadCounter[];
  lastMessage: ILastMessage | null;
  lastActivityAt: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const unreadCounterSchema = new Schema<IUnreadCounter>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const lastMessageSchema = new Schema<ILastMessage>(
  {
    messageId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "audio"],
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

const conversationSchema = new Schema<IConversation>(
  {
    participants: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: true,
      validate: {
        validator: (arr: Types.ObjectId[]) => arr.length === 2,
        message: "Conversation must contain exactly two participants",
      },
    },
    participantsKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    unreadCounters: {
      type: [unreadCounterSchema],
      default: [],
      validate: {
        validator: (arr: IUnreadCounter[]) => arr.length === 2,
        message: "Unread counters must contain exactly two participants",
      },
    },
    lastMessage: {
      type: lastMessageSchema,
      default: null,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1, lastActivityAt: -1 });
conversationSchema.index({ participantsKey: 1 }, { unique: true });
conversationSchema.index({ "unreadCounters.userId": 1, lastActivityAt: -1 });

export default
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", conversationSchema);
