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
  HiddenInput,
  TextInput,
  TextLink,
} from "@/components/ui";
import { useLogin } from "./useLogin";

export type LoginProps = {
  nextPath?: string;
};

export default function Login({ nextPath }: LoginProps) {
  const [state, formAction, pending] = useLogin();

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

            <FormAlert>{state.error}</FormAlert>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={pending}
            >
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
