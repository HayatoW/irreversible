import Stack, { VStack } from "@nkzw/stack";
import { useRouter, useShared } from "@void/react";
import { fbs } from "fbtee";
import { useActionState, useEffect, useState } from "react";
import type { SharedData } from "../src/lib/shared.ts";
import { AsyncButton } from "../src/ui/Button.tsx";
import Card from "../src/ui/Card.tsx";
import H2 from "../src/ui/H2.tsx";
import Input from "../src/ui/Input.tsx";
import Section from "../src/ui/Section.tsx";
import AuthClient from "../src/user/AuthClient.tsx";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { auth } = useShared<SharedData>();

  const [signInFailed, signInAction, isSigningIn] = useActionState(async () => {
    try {
      const { error } = await AuthClient.signIn.email({ email, password });
      if (error) {
        return true;
      }
    } catch {
      return true;
    }

    router.flushAll();
    void router.visit("/playground", { replace: true });
    return false;
  }, false);

  useEffect(() => {
    if (auth.user) {
      router.flushAll();
      void router.visit("/playground", { replace: true });
    }
  }, [auth.user, router]);

  if (auth.user) {
    return null;
  }

  return (
    <Section>
      <VStack center gap={16}>
        <H2 className="pl-5">
          <fbt desc="Sign in button">Sign In</fbt>
        </H2>
        <Stack gap={32} wrap>
          <Card className="w-84">
            <Stack gap vertical>
              <VStack action={signInAction} as="form" gap={12}>
                <label className="sr-only" htmlFor="login-email">
                  <fbt desc="Sign in email label">Email</fbt>
                </label>
                <Input
                  autoComplete="username"
                  className="w-48"
                  id="login-email"
                  name="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={fbs("email", "login: placeholder")}
                  required
                  type="email"
                  value={email}
                />
                <label className="sr-only" htmlFor="login-password">
                  <fbt desc="Sign in password label">Password</fbt>
                </label>
                <Input
                  autoComplete="current-password"
                  className="w-48"
                  id="login-password"
                  name="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={fbs("password", "login: placeholder")}
                  required
                  type="password"
                  value={password}
                />
                <div>
                  <AsyncButton type="submit" variant="outline">
                    <fbt desc="Sign in button">Sign In</fbt>{" "}
                  </AsyncButton>
                  <p className="text-sm text-red-700 not-empty:mt-3 dark:text-red-400" role="alert">
                    {signInFailed && !isSigningIn && (
                      <fbt desc="Error after a failed sign in">
                        Could not sign in. Check your email and password, then try again.
                      </fbt>
                    )}
                  </p>
                </div>
              </VStack>
            </Stack>
          </Card>
        </Stack>
      </VStack>
    </Section>
  );
}
