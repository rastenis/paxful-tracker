import { createBodySignature } from "./base";
import { request } from "./base";

export async function username() {
  const [body, seal] = createBodySignature("");

  const result = await request("user/me", `${body}&apiseal=${seal}`);
  return result;
}
