# Authentication Token and Logout Fix - Design Document

## Overview

This bugfix addresses three critical authentication issues that prevent users from maintaining authenticated sessions and properly logging out. The fix ensures session tokens are properly persisted to secure httpOnly cookies, redirect URLs are correctly parsed and used, and logout properly clears authentication state. The approach involves:

1. Verifying session cookie persistence with proper security flags (httpOnly, secure, sameSite)
2. Correctly extracting and using the `next` query parameter for post-login redirects
3. Implementing logout that clears cookies and redirects to home page
4. Ensuring middleware correctly validates session tokens from cookies

## Glossary

- **Bug_Condition (C)**: The condition that triggers the authentication bugs - when session tokens fail to persist, redirects are malformed, or logout doesn't clear cookies
- **Property (P)**: The desired behavior when authentication actions occur - tokens persist securely, redirects work correctly, logout clears state
- **Preservation**: Existing authentication flows (registration, invalid credentials, protected route access) that must remain unchanged
- **Session Cookie**: The httpOnly cookie named `parlour_session` that stores the JWT token
- **JWT Token**: JSON Web Token containing user id (sub), email, and role, signed with AUTH_SECRET
- **signSessionCookie()**: Function in `lib/auth/session.ts` that creates and sets the session cookie
- **clearSessionCookie()**: Function in `lib/auth/session.ts` that deletes the session cookie
- **loginAction()**: Server action in `lib/actions/auth.ts` that authenticates user and sets session
- **logoutAction()**: Server action in `lib/actions/auth.ts` that clears session and redirects
- **middleware**: Next.js middleware in `middleware.ts` that validates session tokens for protected routes

## Bug Details

### Bug Condition

The bugs manifest when:
1. A user successfully logs in but the session token is not saved to cookies
2. A user logs in with a `next` query parameter but the redirect URL is malformed
3. A user clicks logout but the session cookie is not cleared

The `signSessionCookie()` function, `loginAction()` function, and `logoutAction()` function are either not correctly setting cookies, not properly extracting the `next` parameter, or not clearing cookies on logout.

**Formal Specification:**
```
FUNCTION isBugCondition(action, context)
  INPUT: action of type "login" | "logout" | "redirect"
         context of type { hasValidCredentials, nextParam, isLogoutClick }
  OUTPUT: boolean
  
  RETURN (action = "login" AND context.hasValidCredentials AND NOT cookieIsPersisted())
         OR (action = "redirect" AND context.nextParam EXISTS AND redirectURLIsMalformed())
         OR (action = "logout" AND context.isLogoutClick AND NOT cookieIsCleared())
END FUNCTION
```

### Examples

**Example 1: Session Token Not Persisting**
- User enters valid email and password on login form
- User clicks "Sign in" button
- Server validates credentials successfully
- Expected: Session token saved to httpOnly cookie with secure, sameSite, maxAge flags
- Actual: Cookie is not set or not persisted; user appears logged out on page refresh

**Example 2: Malformed Redirect URL**
- User navigates to `/login?next=/account`
- User enters valid credentials and clicks "Sign in"
- Expected: User redirected to `/account` (next parameter extracted and used)
- Actual: User redirected to `/login?next=/account` (query parameter included in redirect)

**Example 3: Logout Not Clearing Cookie**
- User is logged in with valid session cookie
- User clicks "Sign out" button
- Expected: Session cookie is deleted; user redirected to home page; accessing `/user/account` redirects to login
- Actual: Session cookie remains; user can still access protected routes

**Example 4: Edge Case - No Next Parameter**
- User navigates to `/login` (no next parameter)
- User enters valid credentials and clicks "Sign in"
- Expected: User redirected to `/user/account` (default destination)
- Actual: Should work correctly (this is the non-buggy case)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Users accessing protected routes without a valid session token must continue to be redirected to login
- Users accessing admin routes without admin role must continue to be redirected to user account page
- User registration must continue to create account and establish session in one operation
- Invalid credentials must continue to return error messages without creating sessions
- Public routes (home, products) must continue to allow access without authentication
- Middleware must continue to validate JWT tokens from cookies for protected routes

**Scope:**
All inputs that do NOT involve the three bug conditions should be completely unaffected by this fix. This includes:
- Successful login without a `next` parameter (should redirect to `/user/account`)
- Registration flow (should create account and session)
- Invalid credential attempts (should return error, no session created)
- Accessing public routes (should work without authentication)
- Accessing protected routes with valid session (should work as before)

## Hypothesized Root Cause

Based on the bug description and code analysis, the most likely issues are:

1. **Cookie Not Being Set in Response**: The `signSessionCookie()` function may be called but the cookie jar may not be properly flushed to the HTTP response headers. This could happen if the function is called but the response is not properly configured to include Set-Cookie headers.

2. **Incorrect Next Parameter Extraction**: The `next` parameter from FormData may not be properly extracted or validated. The `safeNextPath()` function may be rejecting valid paths or the parameter may not be passed through the form correctly.

3. **Redirect Happening Before Cookie Set**: The `redirect()` call in `loginAction()` may be happening before the cookie is fully set, or the cookie may not be persisted across the redirect boundary.

4. **Logout Not Calling clearSessionCookie()**: The `logoutAction()` function may not be properly calling `clearSessionCookie()` before redirecting, or the function may not be clearing the cookie correctly.

5. **Missing Secure Cookie Flags**: The cookie may be set but without proper security flags (httpOnly, secure, sameSite), making it vulnerable or not persisting correctly in certain contexts.

## Correctness Properties

Property 1: Bug Condition - Session Token Persistence and Redirect Handling

_For any_ login action where valid credentials are provided and a `next` parameter may be present, the fixed loginAction function SHALL set the session token to an httpOnly cookie with secure, sameSite, and maxAge flags, and SHALL redirect to the specified `next` destination (or `/user/account` if no `next` parameter) without including the query parameter in the redirect URL.

**Validates: Requirements 2.1, 2.2**

Property 2: Bug Condition - Logout Cookie Clearing

_For any_ logout action, the fixed logoutAction function SHALL clear the session cookie and redirect to the home page, ensuring the user is no longer authenticated.

**Validates: Requirements 2.3**

Property 3: Preservation - Protected Route Access Without Session

_For any_ request to a protected route without a valid session token, the middleware SHALL continue to redirect to the login page, preserving existing access control behavior.

**Validates: Requirements 3.1**

Property 4: Preservation - Admin Route Access Control

_For any_ request to an admin route by a user without admin role, the middleware SHALL continue to redirect to the user account page, preserving existing role-based access control.

**Validates: Requirements 3.2**

Property 5: Preservation - Registration Flow

_For any_ registration action with valid email and password, the fixed registerAction function SHALL continue to create the account and establish a session in a single operation, preserving the registration workflow.

**Validates: Requirements 3.3**

Property 6: Preservation - Invalid Credentials

_For any_ login action with invalid credentials, the fixed loginAction function SHALL continue to return an error message without creating a session, preserving error handling behavior.

**Validates: Requirements 3.4**

Property 7: Preservation - Public Route Access

_For any_ request to a public route (home, products), the middleware SHALL continue to allow access without requiring authentication, preserving public route behavior.

**Validates: Requirements 3.5**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `lib/auth/session.ts`

**Function**: `signSessionCookie()`

**Specific Changes**:
1. **Verify Cookie Jar Flushing**: Ensure the cookie jar is properly awaited and the Set-Cookie header is included in the response. The current implementation appears correct but may need verification that cookies() is properly awaited.

2. **Verify Security Flags**: Confirm that httpOnly, secure (in production), sameSite, maxAge, and path are all set correctly. Current implementation appears correct.

**File**: `lib/actions/auth.ts`

**Function**: `loginAction()`

**Specific Changes**:
1. **Verify Next Parameter Extraction**: Ensure the `next` parameter is correctly extracted from FormData using `formData.get("next")` and validated with `safeNextPath()`.

2. **Verify Redirect Timing**: Ensure `signSessionCookie()` is called and awaited before `redirect()` is called, so the cookie is set before the redirect happens.

3. **Verify Redirect URL**: Ensure the redirect uses only the path (e.g., `/account`), not the full URL with query parameters.

**Function**: `logoutAction()`

**Specific Changes**:
1. **Verify Cookie Clearing**: Ensure `clearSessionCookie()` is called and awaited before `redirect()` is called.

2. **Verify Redirect Destination**: Ensure logout redirects to `/` (home page) after clearing the cookie.

**File**: `app/(auth)/login/page.tsx` or `components/modules/auth/login/index.tsx`

**Specific Changes**:
1. **Verify Next Parameter Passing**: Ensure the `next` query parameter from the URL is passed to the login form as a hidden input field so it's included in the FormData submitted to loginAction.

2. **Verify Form Structure**: Ensure the form includes a hidden input with name="next" and value from the URL search params.

**File**: `middleware.ts`

**Specific Changes**:
1. **Verify Token Validation**: Ensure middleware correctly validates JWT tokens from the session cookie for protected routes.

2. **Verify Role Checking**: Ensure middleware correctly checks user role for admin routes.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fixes work correctly and preserve existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate login and logout actions, verify cookie persistence, check redirect URLs, and confirm logout clears cookies. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Login with Valid Credentials Test**: Simulate login with valid email/password, verify session cookie is set with correct flags (will fail on unfixed code if cookie not persisting)
2. **Login with Next Parameter Test**: Simulate login with `?next=/account`, verify redirect goes to `/account` not `/login?next=/account` (will fail on unfixed code if redirect is malformed)
3. **Logout Test**: Simulate logout action, verify session cookie is cleared and user is redirected to home (will fail on unfixed code if cookie not cleared)
4. **Protected Route Access After Logout Test**: Simulate logout then access to `/user/account`, verify redirect to login (will fail on unfixed code if cookie not cleared)

**Expected Counterexamples**:
- Session cookie not found in response headers after login
- Redirect URL includes query parameters instead of using them as destination
- Session cookie still present after logout
- Protected routes still accessible after logout

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed functions produce the expected behavior.

**Pseudocode:**
```
FOR ALL loginInput WHERE validCredentials(loginInput) DO
  result := loginAction_fixed(loginInput)
  ASSERT cookieIsPersisted(result)
  ASSERT cookieHasSecurityFlags(result)
  ASSERT redirectURLIsCorrect(result)
END FOR

FOR ALL logoutInput DO
  result := logoutAction_fixed(logoutInput)
  ASSERT cookieIsCleared(result)
  ASSERT redirectsToHome(result)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed functions produce the same result as the original functions.

**Pseudocode:**
```
FOR ALL loginInput WHERE NOT isBugCondition(loginInput) DO
  ASSERT loginAction_original(loginInput) = loginAction_fixed(loginInput)
END FOR

FOR ALL protectedRouteRequest WHERE NOT isBugCondition(protectedRouteRequest) DO
  ASSERT middleware_original(protectedRouteRequest) = middleware_fixed(protectedRouteRequest)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for valid logins without next parameter, registration, invalid credentials, and protected route access. Then write property-based tests capturing that behavior to ensure it continues after the fix.

**Test Cases**:
1. **Login Without Next Parameter Preservation**: Verify login without `next` parameter redirects to `/user/account` on both original and fixed code
2. **Registration Preservation**: Verify registration creates account and session on both original and fixed code
3. **Invalid Credentials Preservation**: Verify invalid credentials return error without creating session on both original and fixed code
4. **Protected Route Access Preservation**: Verify accessing protected routes with valid session works on both original and fixed code
5. **Public Route Access Preservation**: Verify accessing public routes works without authentication on both original and fixed code

### Unit Tests

- Test `signSessionCookie()` sets cookie with correct flags (httpOnly, secure, sameSite, maxAge, path)
- Test `clearSessionCookie()` removes the session cookie
- Test `loginAction()` with valid credentials sets session and redirects correctly
- Test `loginAction()` with `next` parameter extracts and uses it for redirect
- Test `loginAction()` with invalid credentials returns error without setting session
- Test `logoutAction()` clears cookie and redirects to home
- Test `safeNextPath()` validates paths correctly (rejects invalid paths, accepts valid ones)
- Test middleware validates JWT tokens from cookies for protected routes
- Test middleware checks admin role for admin routes

### Property-Based Tests

- Generate random valid credentials and verify login sets session cookie with correct flags
- Generate random `next` parameters and verify only valid paths are used for redirect
- Generate random invalid credentials and verify no session is created
- Generate random protected route requests with/without valid session and verify access control
- Generate random admin route requests with different roles and verify role-based access
- Generate random public route requests and verify access without authentication

### Integration Tests

- Test full login flow: navigate to login, enter credentials, verify redirect and session persistence
- Test login with next parameter: navigate to `/login?next=/account`, login, verify redirect to `/account`
- Test logout flow: login, navigate to protected route, logout, verify redirect to home and session cleared
- Test protected route access after logout: logout, attempt to access `/user/account`, verify redirect to login
- Test registration flow: register new account, verify account created and session established
- Test admin route access: login as admin, verify access to `/admin`; login as user, verify redirect to `/user/account`
