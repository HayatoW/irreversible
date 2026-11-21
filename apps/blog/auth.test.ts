import { betterAuth } from "better-auth";
import { expect, test } from "vite-plus/test";
import configureAuth from "./auth.ts";

const baseURL = "http://localhost:6001";
const account = {
  email: "reader@example.com",
  name: "Reader",
  password: "test-only-password",
};

test("blocks public registration while allowing sign-in for provisioned accounts", async () => {
  const url = `${baseURL}/api/auth/sign-up/email`;
  const request = new Request(url, {
    body: JSON.stringify(account),
    headers: { "Content-Type": "application/json", Origin: baseURL },
    method: "POST",
  });
  const auth = betterAuth(
    configureAuth({
      defaults: { baseURL, secret: "test-only-better-auth-secret-for-irreversible" },
      dialect: "sqlite",
      env: {},
      request,
    }),
  );

  const response = await auth.handler(request);
  expect(response.status).toBe(400);
  expect(await response.json()).toMatchObject({ code: "EMAIL_PASSWORD_SIGN_UP_DISABLED" });

  await auth.api.createUser({ body: account });
  const session = await auth.api.signInEmail({ body: account });
  expect(session.user.email).toBe(account.email);
});
