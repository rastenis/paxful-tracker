import { request } from "./base";
import * as crypto from "crypto";
import { config } from "../config";

export async function all(payment_method: string, offer_type: string = "buy") {
  const hmac = crypto.createHmac("sha256", config.secret);
  const body = `apikey=${
    config.key
  }&nonce=${Date.now()}&offer_type=${offer_type}&payment_method=${payment_method}`;
  hmac.update(body);

  return request("offer/all", `${body}&apiseal=${hmac.digest("hex")}`);
}
