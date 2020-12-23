import { request, createBodySignature } from "./base";
import * as crypto from "crypto";
import { config } from "../config";

export async function list() {
  const [body, seal] = createBodySignature(``);

  return request("payment-method/list", `${body}&apiseal=${seal}`);
}
