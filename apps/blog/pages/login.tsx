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

  const [, signInAction] = useActionState(async () => {
    await AuthClient.signIn.email(
      {
        email,
        password,
      },
      {
        onError: () => {},
        onRequest: () => {},
        onSuccess: () => {
          router.flushAll();
          void router.visit("/playground", { replace: true });
        },
      },
    );

    return null;
  }, null);

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
                <Input
                  className="w-48"
                  name="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={fbs("email", "login: placeholder")}
                  type="email"
                  value={email}
                />
                <Input
                  className="w-48"
                  name="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={fbs("password", "login: placeholder")}
                  type="password"
                  value={password}
                />
                <div>
                  <AsyncButton type="submit" variant="outline">
                    <fbt desc="Sign in button">Sign In</fbt>{" "}
                  </AsyncButton>
                </div>
              </VStack>
            </Stack>
          </Card>
        </Stack>
      </VStack>
    </Section>
  );
}
