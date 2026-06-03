import { describe, expect, it } from "vitest";
import {
  parseConversationCreatePayload,
  parsePositiveInt,
  parseSendMessagePayload,
} from "@/lib/schemas/chat";

describe("chat schema parsers", () => {
  it("parses send message payload with conversation target", () => {
    const parsed = parseSendMessagePayload({
      conversationId: "abc123",
      content: "hello",
      messageType: "text",
    });

    expect(parsed.conversationId).toBe("abc123");
    expect(parsed.content).toBe("hello");
    expect(parsed.messageType).toBe("text");
  });

  it("parses send message payload with recipient target", () => {
    const parsed = parseSendMessagePayload({
      recipientId: "user123",
      content: "hi there",
    });

    expect(parsed.recipientId).toBe("user123");
    expect(parsed.content).toBe("hi there");
  });

  it("parses conversation create payload", () => {
    const parsed = parseConversationCreatePayload({ participantId: "user-1" });
    expect(parsed.participantId).toBe("user-1");
  });

  it("parses positive int with fallback", () => {
    expect(parsePositiveInt(null, 10)).toBe(10);
    expect(parsePositiveInt("5", 10)).toBe(5);
  });
});
