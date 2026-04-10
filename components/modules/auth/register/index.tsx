"use client";

import {
  BackLink,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  Form,
  FormAlert,
  FormField,
  FormFooterText,
  TextInput,
  TextLink,
} from "@/components/ui";
import { useActionState } from "react";
import { registerAction, type AuthFormState } from "@/lib/actions/auth";

const initial: AuthFormState = {};

export default function Register() {
  const [state, formAction, pending] = useActionState(registerAction, initial);

  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <BackLink href="/" />
      <Card>
        <CardTitle>Create account</CardTitle>
        <CardDescription>
          Passwords are hashed on the server; you&apos;ll be signed in after registering.
        </CardDescription>
        <CardContent>
          <Form action={formAction}>
            <FormField id="register-email" label="Email">
              <TextInput
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={pending}
              />
            </FormField>

            <FormField
              id="register-password"
              label="Password"
              description="At least 8 characters."
            >
              <TextInput
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                disabled={pending}
              />
            </FormField>

            <FormField id="register-confirm" label="Confirm password">
              <TextInput
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                disabled={pending}
              />
            </FormField>

            <FormAlert>{state.error}</FormAlert>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={pending}
            >
              {pending ? "Creating account…" : "Create account"}
            </Button>

            <FormFooterText>
              Already registered? <TextLink href="/login">Sign in</TextLink>
            </FormFooterText>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
