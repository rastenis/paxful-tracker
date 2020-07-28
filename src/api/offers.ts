import { request } from "./base";
import * as crypto from "crypto";
import { config } from "../config";

export async function all(
  payment_method: string,
  offer_type: string = "buy",
  currency_code: string = "USD",
  min?: number
) {
  const [body, seal] = createBodySignature(
    `offer_type=${offer_type}&payment_method=${payment_method}&currency_code=${currency_code}${
      min ? "&fiat_min=" + min : ""
    }`
  );

  return request("offer/all", `${body}&apiseal=${seal}`);
}

export async function self(offer_type: string = "sell") {
  const [body, seal] = createBodySignature(
    `active=true&offer_type=${offer_type}`
  );

  const result = await request("offer/list", `${body}&apiseal=${seal}`);
  return result;
}

export async function update(offer_hash: string, margin: number) {
  const [body, seal] = createBodySignature(
    `offer_hash=${offer_hash}&margin=${margin}`
  );

  const result = await request("offer/update-price", `${body}&apiseal=${seal}`);
  return result;
}

/**
 * Creates a signature and returns both the body and the signature.
 * @param bodyAppend the body that is appended to the nonce and api key.
 */
export function createBodySignature(bodyAppend: string): [any, any] {
  const hmac = crypto.createHmac("sha256", config.secret);
  
  let body: string;
  if(bodyAppend != "") {
    body = `apikey=${config.key}&nonce=${Date.now()}&${bodyAppend}`;
  } else {
    body = `apikey=${config.key}&nonce=${Date.now()}`;
  } 

  hmac.update(body);

  return [body, hmac.digest("hex")];
}
