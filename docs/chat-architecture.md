# Chat Module Architecture Decisions

## Database design

### Conversations collection

Conversation documents are intentionally lightweight and do not embed full message history. This allows each conversation document to stay small and fast to read for list views.

Stored fields:

- participants (exactly two user IDs for one-to-one chat)
- participantsKey (sorted deterministic key like `userA:userB`)
- unreadCounters (per participant unread count)
- lastMessage snapshot (content preview, sender, type, timestamp)
- lastActivityAt
- createdBy
- createdAt / updatedAt

Indexes:

- unique index on participantsKey prevents duplicate one-to-one conversations
- index on participants + lastActivityAt supports conversation list sorting
- index on unreadCounters.userId + lastActivityAt supports unread-focused list queries

### Messages collection

Messages are stored in a separate collection for write scalability and pagination efficiency.

Stored fields:

- conversationId
- senderId
- content
- messageType (text, image, file, audio)
- status
- createdAt / updatedAt

Indexes:

- conversationId + createdAt + _id descending for cursor pagination
- conversationId + senderId + createdAt for sender-oriented queries

## Search strategy

User search uses normalized lowercase fields (`usernameLower`, `nameLower`) with anchored prefix regex. Anchored prefix queries can leverage indexes better than infix wildcard patterns, reducing collection scans on growth.

The query excludes the authenticated user and supports page/limit pagination for user directory browsing.

## Conversation uniqueness

To prevent duplicates, the service creates a deterministic `participantsKey` from sorted user IDs and upserts on that key. The unique index guarantees only one conversation can exist for the same two users even with concurrent requests.

## Messaging consistency model

Message flow follows `Persist First -> Broadcast Second`:

1. Validate and authorize
2. Persist message to MongoDB
3. Update conversation metadata and unread counts
4. Broadcast socket event

This avoids broadcasting messages that might fail to persist, which would otherwise create ghost messages across clients.

## Real-time architecture

Socket.io server maintains user presence through `userId -> Set<socketId>` mapping. This supports:

- reconnect handling
- multiple browser tabs per user
- stale socket cleanup on disconnect

Events implemented:

- connection
- disconnection
- send_message
- receive_message
- user_online
- user_offline

## State management decisions

- Server state (conversations, messages, search results): React Query
- Client state (selected conversation, draft, socket connectivity, online map): Zustand store scoped to chat feature

This separation keeps cacheable network state in React Query while preserving fast local UI interactions in lightweight client state.

## Pagination decision

Message history uses cursor pagination (`createdAt + _id`) instead of skip/limit. Cursor pagination remains performant on large message collections because it uses indexed range scans and avoids increasing offset costs.
