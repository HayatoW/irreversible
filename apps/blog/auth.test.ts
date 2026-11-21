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
  const post = (path: string, body: object) =>
    new Request(`${baseURL}/api/auth/${path}`, {
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json", Origin: baseURL },
      method: "POST",
    });
  const request = post("sign-up/email", account);
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
  const signIn = await auth.handler(
    post("sign-in/email", { email: account.email, password: account.password }),
  );
  expect(signIn.status).toBe(200);
  const cookie = signIn.headers
    .getSetCookie()
    .map((value) => value.split(";", 1)[0])
    .join("; ");
  expect(cookie).not.toBe("");
  const session = await auth.handler(
    new Request(`${baseURL}/api/auth/get-session`, { headers: { Cookie: cookie } }),
  );
  expect(session.status).toBe(200);
  expect(await session.json()).toMatchObject({ user: { email: account.email } });
});
