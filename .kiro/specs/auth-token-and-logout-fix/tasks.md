# Implementation Plan: Authentication Token and Logout Fix

## Phase 1: Exploratory Bug Condition Tests

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Session Token Persistence and Redirect Handling
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bugs exist
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to concrete failing cases to ensure reproducibility
  - Test implementation details from Bug Condition in design:
    - Test Case 1: Login with valid credentials should set session cookie with httpOnly, secure, sameSite, maxAge flags
    - Test Case 2: Login with `?next=/account` should redirect to `/account` (not `/login?next=/account`)
    - Test Case 3: Login without `next` parameter should redirect to `/user/account`
  - The test assertions should match the Expected Behavior Properties from design (2.1, 2.2)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bugs exist)
  - Document counterexamples found to understand root cause:
    - Session cookie not found in response headers after login
    - Redirect URL includes query parameters instead of using them as destination
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2_

- [x] 2. Write bug condition exploration test for logout
  - **Property 1: Bug Condition** - Logout Cookie Clearing
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the logout bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **GOAL**: Surface counterexamples that demonstrate logout doesn't clear cookies
  - **Scoped PBT Approach**: Scope to concrete failing case - logout action should clear session cookie
  - Test implementation details from Bug Condition in design:
    - Test Case 1: Logout should clear the session cookie
    - Test Case 2: After logout, accessing protected routes should redirect to login
  - The test assertions should match the Expected Behavior Property from design (2.3)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the logout bug exists)
  - Document counterexamples found:
    - Session cookie still present after logout action
    - Protected routes still accessible after logout
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.3_

## Phase 2: Preservation Property Tests

- [x] 3. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Buggy Login Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs:
    - Observe: Login without `next` parameter redirects to `/user/account`
    - Observe: Invalid credentials return error without creating session
    - Observe: Registration creates account and establishes session
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - Property: For all valid logins without `next` parameter, redirect destination is `/user/account`
    - Property: For all invalid credential attempts, no session is created and error is returned
    - Property: For all registration attempts with valid email/password, account is created and session established
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.3, 3.4_

- [x] 4. Write preservation property tests for protected routes
  - **Property 2: Preservation** - Protected Route Access Control
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs:
    - Observe: Accessing protected routes without session redirects to login
    - Observe: Accessing admin routes without admin role redirects to user account
    - Observe: Accessing public routes works without authentication
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - Property: For all requests to protected routes without valid session, redirect to login
    - Property: For all requests to admin routes by non-admin users, redirect to user account
    - Property: For all requests to public routes, access is allowed without authentication
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.5_

## Phase 3: Implementation

- [x] 5. Fix authentication token and logout issues

  - [x] 5.1 Verify next parameter is passed from login page to form
    - Check `app/(auth)/login/page.tsx` passes `searchParams.next` to Login component
    - Verify Login component receives `nextPath` prop and passes it as hidden input
    - Ensure hidden input has `name="next"` and `value={nextPath}`
    - _Bug_Condition: isBugCondition(action="redirect", context.nextParam EXISTS AND redirectURLIsMalformed())_
    - _Expected_Behavior: expectedBehavior(redirect uses only path, not full URL with query params)_
    - _Preservation: Preservation Requirements 3.1, 3.2, 3.3, 3.4, 3.5_
    - _Requirements: 2.2_

  - [x] 5.2 Verify signSessionCookie() is called and awaited before redirect in loginAction
    - Check `lib/actions/auth.ts` loginAction calls `await signSessionCookie()` before `redirect()`
    - Ensure cookie is fully set before redirect happens
    - Verify redirect uses `next ?? "/user/account"` (path only, no query params)
    - _Bug_Condition: isBugCondition(action="login", context.hasValidCredentials AND NOT cookieIsPersisted())_
    - _Expected_Behavior: expectedBehavior(cookieIsPersisted() AND redirectURLIsCorrect())_
    - _Preservation: Preservation Requirements 3.3, 3.4_
    - _Requirements: 2.1, 2.2_

  - [x] 5.3 Verify clearSessionCookie() is called and awaited before redirect in logoutAction
    - Check `lib/actions/auth.ts` logoutAction calls `await clearSessionCookie()` before `redirect("/")`
    - Ensure cookie is fully cleared before redirect happens
    - Verify redirect destination is "/" (home page)
    - _Bug_Condition: isBugCondition(action="logout", context.isLogoutClick AND NOT cookieIsCleared())_
    - _Expected_Behavior: expectedBehavior(cookieIsCleared() AND redirectsToHome())_
    - _Preservation: Preservation Requirements 3.1, 3.2, 3.5_
    - _Requirements: 2.3_

  - [x] 5.4 Verify session cookie has correct security flags
    - Check `lib/auth/session.ts` signSessionCookie() sets httpOnly, secure, sameSite, maxAge, path
    - Verify httpOnly is true (prevents JavaScript access)
    - Verify secure is true in production (HTTPS only)
    - Verify sameSite is "lax" (CSRF protection)
    - Verify maxAge is 7 days (604800 seconds)
    - Verify path is "/" (available to entire app)
    - _Bug_Condition: isBugCondition(action="login", context.hasValidCredentials AND NOT cookieHasSecurityFlags())_
    - _Expected_Behavior: expectedBehavior(cookieHasSecurityFlags(httpOnly, secure, sameSite, maxAge))_
    - _Preservation: Preservation Requirements 3.1, 3.2, 3.3, 3.4, 3.5_
    - _Requirements: 2.1_

## Phase 4: Fix Verification

- [x] 6. Verify bug condition exploration test now passes
  - **Property 1: Expected Behavior** - Session Token Persistence and Redirect Handling
  - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
  - The test from task 1 encodes the expected behavior
  - When this test passes, it confirms the expected behavior is satisfied
  - Run bug condition exploration test from step 1
  - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
  - Verify all login scenarios work correctly:
    - Login with valid credentials sets session cookie
    - Login with `?next=/account` redirects to `/account`
    - Login without `next` parameter redirects to `/user/account`
  - _Requirements: 2.1, 2.2_

- [x] 7. Verify logout bug condition exploration test now passes
  - **Property 1: Expected Behavior** - Logout Cookie Clearing
  - **IMPORTANT**: Re-run the SAME test from task 2 - do NOT write a new test
  - Run logout bug condition exploration test from step 2
  - **EXPECTED OUTCOME**: Test PASSES (confirms logout bug is fixed)
  - Verify logout scenarios work correctly:
    - Logout clears the session cookie
    - After logout, protected routes redirect to login
  - _Requirements: 2.3_

- [x] 8. Verify preservation tests still pass
  - **Property 2: Preservation** - All Non-Buggy Behaviors
  - **IMPORTANT**: Re-run the SAME tests from tasks 3 and 4 - do NOT write new tests
  - Run preservation property tests from steps 3 and 4
  - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
  - Confirm all tests still pass after fix (no regressions):
    - Login without `next` parameter still redirects to `/user/account`
    - Invalid credentials still return error without creating session
    - Registration still creates account and establishes session
    - Protected routes still redirect to login without valid session
    - Admin routes still redirect to user account for non-admin users
    - Public routes still allow access without authentication
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

## Phase 5: Checkpoint

- [x] 9. Checkpoint - Ensure all tests pass
  - Verify all exploratory tests pass (tasks 6, 7)
  - Verify all preservation tests pass (task 8)
  - Confirm no regressions in existing functionality
  - Test full login flow: navigate to login, enter credentials, verify redirect and session persistence
  - Test login with next parameter: navigate to `/login?next=/account`, login, verify redirect to `/account`
  - Test logout flow: login, navigate to protected route, logout, verify redirect to home and session cleared
  - Test protected route access after logout: logout, attempt to access `/user/account`, verify redirect to login
  - Ensure all tests pass, ask the user if questions arise
