/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";

import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { serialize } from "@/lib/db/serialize";
import User from "@/lib/models/User";
import Conversation from "@/lib/models/Conversation";
import Message from "@/lib/models/Message";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors/AppError";
import type {
  ChatMessage,
  ChatUser,
  ConversationSummary,
  MessagePage,
  MessageType,
  SendMessageResult,
  UserSearchResult,
} from "@/lib/types/chat";

function toObjectId(value: string, field: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(value)) {
    throw new ValidationError(`Invalid ${field}`);
  }
  return new Types.ObjectId(value);
}

function normalizeSearchTerm(value: string): string {
  return value.trim().toLowerCase();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildParticipantsKey(a: string, b: string): string {
  return [a, b].sort().join(":");
}

function buildPreview(content: string): string {
  return content.length > 140 ? `${content.slice(0, 137)}...` : content;
}

class ChatService {
  async searchUsers(
    currentUserId: string,
    query: string,
    page: number,
    limit: number
  ): Promise<UserSearchResult> {
    await connectDB();

    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(Math.floor(limit), 1), 20) : 10;
    const currentObjectId = toObjectId(currentUserId, "user id");

    const normalized = normalizeSearchTerm(query);
    if (!normalized) {
      return {
        users: [],
        page: safePage,
        limit: safeLimit,
        total: 0,
        hasMore: false,
      };
    }

    const prefix = `^${escapeRegex(normalized)}`;
    const skip = (safePage - 1) * safeLimit;

    // Support existing users that do not have username fields persisted yet by
    // deriving a searchable fallback username from the email local-part.
    const [users, totalResult] = await Promise.all([
      User.aggregate([
        {
          $match: {
            _id: { $ne: currentObjectId },
          },
        },
        {
          $addFields: {
            usernameEffectiveLower: {
              $toLower: {
                $ifNull: [
                  "$usernameLower",
                  {
                    $arrayElemAt: [{ $split: ["$email", "@"] }, 0],
                  },
                ],
              },
            },
            nameEffectiveLower: {
              $toLower: {
                $ifNull: ["$nameLower", { $ifNull: ["$name", ""] }],
              },
            },
          },
        },
        {
          $match: {
            $or: [
              { usernameEffectiveLower: { $regex: prefix } },
              { nameEffectiveLower: { $regex: prefix } },
            ],
          },
        },
        { $sort: { usernameEffectiveLower: 1, _id: 1 } },
        { $skip: skip },
        { $limit: safeLimit },
        {
          $project: {
            _id: 1,
            email: 1,
            username: 1,
            name: 1,
          },
        },
      ]),
      User.aggregate([
        {
          $match: {
            _id: { $ne: currentObjectId },
          },
        },
        {
          $addFields: {
            usernameEffectiveLower: {
              $toLower: {
                $ifNull: [
                  "$usernameLower",
                  {
                    $arrayElemAt: [{ $split: ["$email", "@"] }, 0],
                  },
                ],
              },
            },
            nameEffectiveLower: {
              $toLower: {
                $ifNull: ["$nameLower", { $ifNull: ["$name", ""] }],
              },
            },
          },
        },
        {
          $match: {
            $or: [
              { usernameEffectiveLower: { $regex: prefix } },
              { nameEffectiveLower: { $regex: prefix } },
            ],
          },
        },
        { $count: "total" },
      ]),
    ]);

    const total = totalResult[0]?.total ?? 0;
    const mapped = users.map((user: any) => this.mapUser(user));

    return {
      users: serialize(mapped),
      page: safePage,
      limit: safeLimit,
      total,
      hasMore: skip + mapped.length < total,
    };
  }

  async getOrCreateConversation(currentUserId: string, participantId: string): Promise<ConversationSummary> {
    await connectDB();

    if (currentUserId === participantId) {
      throw new ValidationError("You cannot start a conversation with yourself", "INVALID_PARTICIPANT");
    }

    const currentObjectId = toObjectId(currentUserId, "user id");
    const participantObjectId = toObjectId(participantId, "participant id");

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentObjectId).select("_id").lean(),
      User.findById(participantObjectId).select("_id").lean(),
    ]);

    if (!currentUser || !targetUser) {
      throw new NotFoundError("User");
    }

    const participantsKey = buildParticipantsKey(currentUserId, participantId);

    const conversation = await Conversation.findOneAndUpdate(
      { participantsKey },
      {
        $setOnInsert: {
          participants: [currentObjectId, participantObjectId],
          participantsKey,
          unreadCounters: [
            { userId: currentObjectId, count: 0 },
            { userId: participantObjectId, count: 0 },
          ],
          lastActivityAt: new Date(),
          createdBy: currentObjectId,
        },
      },
      {
        new: true,
        upsert: true,
      }
    ).lean();

    if (!conversation) {
      throw new ValidationError("Failed to create conversation", "CONVERSATION_CREATE_FAILED");
    }

    return this.mapConversation(conversation as any, currentUserId);
  }

  async getConversationById(conversationId: string, currentUserId: string): Promise<ConversationSummary> {
    await connectDB();

    const conversationObjectId = toObjectId(conversationId, "conversation id");
    const currentObjectId = toObjectId(currentUserId, "user id");

    const conversation = await Conversation.findOne({
      _id: conversationObjectId,
      participants: currentObjectId,
    }).lean();

    if (!conversation) {
      throw new NotFoundError("Conversation");
    }

    return this.mapConversation(conversation as any, currentUserId);
  }

  async listConversations(currentUserId: string, limit: number): Promise<ConversationSummary[]> {
    await connectDB();

    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(Math.floor(limit), 1), 50) : 20;
    const currentObjectId = toObjectId(currentUserId, "user id");

    const conversations = await Conversation.find({ participants: currentObjectId })
      .sort({ lastActivityAt: -1, _id: -1 })
      .limit(safeLimit)
      .lean();

    const result = await Promise.all(
      conversations.map((conversation: any) => this.mapConversation(conversation, currentUserId))
    );

    return serialize(result);
  }

  async getMessages(
    conversationId: string,
    currentUserId: string,
    cursor: string | null,
    limit: number
  ): Promise<MessagePage> {
    await connectDB();

    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(Math.floor(limit), 1), 50) : 25;
    const conversationObjectId = toObjectId(conversationId, "conversation id");
    const currentObjectId = toObjectId(currentUserId, "user id");

    const conversation = await Conversation.findOne({
      _id: conversationObjectId,
      participants: currentObjectId,
    })
      .select("_id")
      .lean();

    if (!conversation) {
      throw new AuthorizationError("You do not have access to this conversation", "CHAT_FORBIDDEN");
    }

    const query: Record<string, any> = {
      conversationId: conversationObjectId,
    };

    if (cursor) {
      const cursorObjectId = toObjectId(cursor, "cursor");
      const cursorMessage = await Message.findById(cursorObjectId)
        .select("_id createdAt conversationId")
        .lean();

      if (!cursorMessage || String(cursorMessage.conversationId) !== String(conversationObjectId)) {
        throw new ValidationError("Invalid cursor", "INVALID_CURSOR");
      }

      query.$or = [
        { createdAt: { $lt: cursorMessage.createdAt } },
        {
          createdAt: cursorMessage.createdAt,
          _id: { $lt: cursorObjectId },
        },
      ];
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(safeLimit + 1)
      .lean();

    const hasMore = messages.length > safeLimit;
    const currentPage = hasMore ? messages.slice(0, safeLimit) : messages;
    const ordered = currentPage.reverse();

    const mapped = ordered.map((message: any) => this.mapMessage(message));
    const nextCursor = hasMore ? String(currentPage[currentPage.length - 1]._id) : null;

    return serialize({
      conversationId,
      messages: mapped,
      nextCursor,
    });
  }

  async sendMessage(params: {
    senderId: string;
    conversationId?: string;
    recipientId?: string;
    content: string;
    messageType?: MessageType;
  }): Promise<SendMessageResult> {
    await connectDB();

    const senderObjectId = toObjectId(params.senderId, "sender id");
    const content = params.content?.trim();

    if (!content) {
      throw new ValidationError("Message content is required", "MESSAGE_CONTENT_REQUIRED");
    }

    if (content.length > 2000) {
      throw new ValidationError("Message is too long", "MESSAGE_TOO_LONG");
    }

    if (!params.conversationId && !params.recipientId) {
      throw new ValidationError(
        "Either conversationId or recipientId is required",
        "MESSAGE_TARGET_REQUIRED"
      );
    }

    let conversation: any = null;

    if (params.conversationId) {
      const conversationObjectId = toObjectId(params.conversationId, "conversation id");
      conversation = await Conversation.findOne({
        _id: conversationObjectId,
        participants: senderObjectId,
      });

      if (!conversation) {
        throw new AuthorizationError("You do not have access to this conversation", "CHAT_FORBIDDEN");
      }
    } else {
      conversation = await this.getOrCreateConversationRaw(params.senderId, params.recipientId!);
    }

    const messageType = params.messageType ?? "text";

    // Persist first, then broadcast from callers to avoid sending messages that fail to persist.
    const message = await Message.create({
      conversationId: conversation._id,
      senderId: senderObjectId,
      content,
      messageType,
      status: "sent",
    });

    const recipientIds = conversation.participants
      .map((id: Types.ObjectId) => String(id))
      .filter((id: string) => id !== params.senderId);

    const unreadCounters = (conversation.unreadCounters ?? []).map((counter: any) => ({
      userId: String(counter.userId),
      count: Number(counter.count || 0),
    }));

    const updatedUnreadCounters = unreadCounters.map((counter: { userId: string; count: number }) => {
      if (counter.userId === params.senderId) {
        return { ...counter, count: 0 };
      }
      if (recipientIds.includes(counter.userId)) {
        return { ...counter, count: counter.count + 1 };
      }
      return counter;
    });

    conversation.lastMessage = {
      messageId: message._id,
      senderId: senderObjectId,
      content: buildPreview(content),
      messageType,
      createdAt: message.createdAt,
    };
    conversation.lastActivityAt = message.createdAt;
    conversation.unreadCounters = updatedUnreadCounters.map((counter: { userId: string; count: number }) => ({
      userId: toObjectId(counter.userId, "user id"),
      count: counter.count,
    }));

    await conversation.save();

    const conversationSummary = await this.mapConversation(conversation.toObject(), params.senderId);

    return {
      conversation: conversationSummary,
      message: this.mapMessage(message.toObject()),
    };
  }

  async markConversationRead(conversationId: string, currentUserId: string): Promise<void> {
    await connectDB();

    const conversationObjectId = toObjectId(conversationId, "conversation id");
    const userObjectId = toObjectId(currentUserId, "user id");

    const conversation = await Conversation.findOne({
      _id: conversationObjectId,
      participants: userObjectId,
    });

    if (!conversation) {
      throw new AuthorizationError("You do not have access to this conversation", "CHAT_FORBIDDEN");
    }

    const unreadCounters = conversation.unreadCounters || [];
    conversation.unreadCounters = unreadCounters.map((counter: any) => {
      if (String(counter.userId) === currentUserId) {
        return {
          userId: counter.userId,
          count: 0,
        };
      }
      return counter;
    });

    await conversation.save();
  }

  private async getOrCreateConversationRaw(currentUserId: string, participantId: string) {
    if (currentUserId === participantId) {
      throw new ValidationError("You cannot send a message to yourself", "INVALID_RECIPIENT");
    }

    const currentObjectId = toObjectId(currentUserId, "user id");
    const participantObjectId = toObjectId(participantId, "recipient id");

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentObjectId).select("_id").lean(),
      User.findById(participantObjectId).select("_id").lean(),
    ]);

    if (!currentUser || !targetUser) {
      throw new NotFoundError("User");
    }

    const participantsKey = buildParticipantsKey(currentUserId, participantId);

    const conversation = await Conversation.findOneAndUpdate(
      { participantsKey },
      {
        $setOnInsert: {
          participants: [currentObjectId, participantObjectId],
          participantsKey,
          unreadCounters: [
            { userId: currentObjectId, count: 0 },
            { userId: participantObjectId, count: 0 },
          ],
          lastActivityAt: new Date(),
          createdBy: currentObjectId,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    if (!conversation) {
      throw new ValidationError("Failed to create conversation", "CONVERSATION_CREATE_FAILED");
    }

    return conversation;
  }

  private mapUser(user: any): ChatUser {
    return {
      id: String(user._id),
      email: user.email,
      username: user.username || user.email.split("@")[0],
      name: user.name || user.email.split("@")[0],
    };
  }

  private async mapConversation(conversation: any, currentUserId: string): Promise<ConversationSummary> {
    const participantIds = (conversation.participants || []).map((id: Types.ObjectId) => String(id));
    const users = await User.find({ _id: { $in: participantIds } })
      .select("_id email username name")
      .lean();

    const usersById = new Map(users.map((user: any) => [String(user._id), this.mapUser(user)]));
    const participants = participantIds
      .map((id: string) => usersById.get(id))
      .filter((item: ChatUser | undefined): item is ChatUser => Boolean(item));

    const unreadCounter = (conversation.unreadCounters || []).find(
      (counter: any) => String(counter.userId) === currentUserId
    );

    return {
      id: String(conversation._id),
      participants,
      lastMessage: conversation.lastMessage
        ? {
            id: String(conversation.lastMessage.messageId),
            senderId: String(conversation.lastMessage.senderId),
            content: conversation.lastMessage.content,
            messageType: conversation.lastMessage.messageType,
            createdAt: new Date(conversation.lastMessage.createdAt).toISOString(),
          }
        : null,
      unreadCount: Number(unreadCounter?.count || 0),
      lastActivityAt: new Date(conversation.lastActivityAt || conversation.createdAt).toISOString(),
      createdAt: new Date(conversation.createdAt).toISOString(),
      updatedAt: new Date(conversation.updatedAt).toISOString(),
    };
  }

  private mapMessage(message: any): ChatMessage {
    return {
      id: String(message._id),
      conversationId: String(message.conversationId),
      senderId: String(message.senderId),
      content: message.content,
      messageType: message.messageType,
      status: message.status,
      createdAt: new Date(message.createdAt).toISOString(),
      updatedAt: new Date(message.updatedAt).toISOString(),
    };
  }
}

const chatService = new ChatService();

export default chatService;
