import { createBodySignature } from "./offers";
import { request } from "./base";

export async  function userID() {
  const [body, seal] = createBodySignature("");

  const result = await request("user/me", `${body}&apiseal=${seal}`);
  return result;
}