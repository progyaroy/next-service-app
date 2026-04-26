"use client";

import {
  BackLink,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  Checkbox,
  Form,
  FormAlert,
  FormField,
  FormFooterText,
  HiddenInput,
  Label,
  TextInput,
  TextLink,
} from "@/components/ui";
import { useActionState, useEffect, useRef } from "react";
import { loginAction, type AuthFormState } from "@/lib/actions/auth";

export type LoginProps = {
  nextPath?: string;
};

export default function Login({ nextPath }: LoginProps) {
  const initial: AuthFormState = {};
  const [state, formAction, pending] = useActionState(loginAction, initial);
  const prevPending = useRef(false);

  useEffect(() => {
    // pending: true → false with no error means login succeeded and server is redirecting.
    // Dispatch auth-changed so CartContext re-fetches with the new session.
    if (prevPending.current && !pending && !state.error) {
      window.dispatchEvent(new Event("auth-changed"));
    }
    prevPending.current = pending;
  }, [pending, state.error]);

  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <BackLink href="/" />
      <Card>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Session stored in a secure cookie — not in browser storage.
        </CardDescription>
        <CardContent>
          <Form action={formAction}>
            {nextPath ? <HiddenInput name="next" value={nextPath} /> : null}

            <FormField id="login-email" label="Email">
              <TextInput
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={pending}
              />
            </FormField>

            <FormField id="login-password" label="Password">
              <TextInput
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={pending}
              />
            </FormField>

            <div className="flex items-center gap-2">
              <Checkbox id="remember-me" name="rememberMe" disabled={pending} />
              <Label htmlFor="remember-me" className="cursor-pointer text-sm">
                Remember me for 30 days
              </Label>
            </div>

            <FormAlert>{state.error}</FormAlert>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={pending}>
              {pending ? "Signing in…" : "Sign in"}
            </Button>

            <FormFooterText>
              No account? <TextLink href="/register">Register</TextLink>
            </FormFooterText>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
