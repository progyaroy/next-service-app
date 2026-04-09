# Bugfix Requirements Document: Authentication Token and Logout Issues

## Introduction

This bugfix addresses three critical authentication issues in the Next.js application:
1. Session tokens are not being persisted to cookies after successful login
2. The redirect URL after login is malformed, preventing proper navigation to protected pages
3. Logout functionality does not clear the session, leaving users in an authenticated state

These issues prevent users from maintaining authenticated sessions and properly logging out, breaking core authentication workflows.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user successfully logs in with valid credentials THEN the system does not save the session token to cookies, causing the user to appear logged out on page refresh

1.2 WHEN a user logs in with a `next` parameter (e.g., `/login?next=/account`) THEN the system redirects to `http://localhost:3000/login?next=/account` instead of the intended destination page

1.3 WHEN a user clicks the "Sign out" button THEN the system does not clear the session cookie, leaving the user in an authenticated state despite the logout action

### Expected Behavior (Correct)

2.1 WHEN a user successfully logs in with valid credentials THEN the system SHALL save the session token to an httpOnly cookie with proper security settings (secure, sameSite, maxAge)

2.2 WHEN a user logs in with a `next` parameter THEN the system SHALL redirect directly to the specified page (e.g., `/account`) without including the query parameter in the redirect URL

2.3 WHEN a user clicks the "Sign out" button THEN the system SHALL clear the session cookie and redirect to the home page, requiring re-authentication to access protected routes

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user accesses a protected route without a valid session token THEN the system SHALL CONTINUE TO redirect to the login page

3.2 WHEN a user accesses an admin route without admin role THEN the system SHALL CONTINUE TO redirect to the user account page

3.3 WHEN a user registers a new account THEN the system SHALL CONTINUE TO create the account and establish a session in a single operation

3.4 WHEN a user provides invalid credentials THEN the system SHALL CONTINUE TO return an error message without creating a session

3.5 WHEN a user accesses a public route (home, products) THEN the system SHALL CONTINUE TO allow access without requiring authentication
