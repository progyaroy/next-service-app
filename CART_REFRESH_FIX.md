# Cart Refresh Issue - Root Cause & Solution

## Problem (Phase 1)
Cart was refreshing on every tab change due to **duplicate event listeners** triggering multiple API calls.

### Root Cause (Phase 1)
Two components were independently listening to the same browser events:
1. **CartContext** - Listened to `visibilitychange` and `focus` events
2. **HeaderNav** - Also listened to `visibilitychange` and `focus` events

## Problem (Phase 2)
After removing duplicate listeners, cart was still refreshing every few seconds due to `visibilitychange` event listener with debouncing.

### Root Cause (Phase 2)
The `visibilitychange` event was being triggered repeatedly, causing unwanted refreshes even when no data changed.

## Final Solution (Industry-Standard Approach)

### Core Principle: Event-Driven Updates Only
**Don't poll or auto-refresh. Only refresh when data actually changes.**

### Changes Made

#### CartContext.tsx
- ✅ Removed ALL automatic refresh triggers (`visibilitychange`, `focus` events)
- ✅ Removed debouncing logic (no longer needed)
- ✅ Removed `useRef` for tracking refresh times
- ✅ Cart now loads **only on component mount**
- ✅ Cart refreshes **only when user performs mutations** (add/remove/update items)

#### HeaderNav.tsx
- ✅ Removed all visibility/focus event listeners
- ✅ Removed `refreshCart()` calls
- ✅ Auth verification runs only on component mount
- ✅ Removed unused `useCart` hook import

#### AddToCartButton.tsx (Already Correct)
- ✅ Calls `refreshCart()` only after successful add action
- ✅ No automatic polling

## Architecture
```
User Action (Add/Remove Item)
    ↓
Server Action (cartService)
    ↓
Success Response
    ↓
refreshCart() called explicitly
    ↓
Cart state updated
```

## Benefits
✅ **Zero unwanted refreshes** - cart only updates on mutations
✅ **Reduced API calls** - only when necessary
✅ **Better performance** - no polling overhead
✅ **Cleaner code** - removed 50+ lines of debouncing logic
✅ **Industry standard** - event-driven updates pattern
✅ **Improved UX** - no flickering or unexpected updates

## Testing
1. ✅ Switch tabs - cart does NOT refresh
2. ✅ Add item to cart - cart refreshes immediately
3. ✅ Remove item - cart refreshes immediately
4. ✅ Update quantity - cart refreshes immediately
5. ✅ Page reload - cart loads fresh data
6. ✅ Login/logout - cart state updates appropriately
