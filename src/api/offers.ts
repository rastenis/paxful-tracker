import { request } from "./base";
import * as crypto from "crypto";
import { config } from "../config";

export async function all(
  payment_method: string,
  offer_type: string = "buy",
  currency_code: string = "USD",
  min?: number
) {
  const hmac = crypto.createHmac("sha256", config.secret);
  const body = `apikey=${
    config.key
  }&nonce=${Date.now()}&offer_type=${offer_type}&payment_method=${payment_method}&currency_code=${currency_code}${
    min ? "&fiat_min=" + min : ""
  }`;

  hmac.update(body);
  
  return request("offer/all", `${body}&apiseal=${hmac.digest("hex")}`);
}

export async function self(offer_type: string = "buy") {
  const hmac = crypto.createHmac("sha256", config.secret);
  const body = `apikey=${
    config.key
  }&nonce=${Date.now()}&active=false&offer_type=${offer_type}`;

  hmac.update(body);

  const result = await request("offer/list", `${body}&apiseal=${hmac.digest("hex")}`);
  return result;
}

export async function update(offer_hash: string, margin: number) {
  const hmac = crypto.createHmac("sha256", config.secret);
  const body = `apikey=${
    config.key
  }&nonce=${Date.now()}&offer_hash=${offer_hash}&margin=${margin}`;

  hmac.update(body);

  const result = await request("offer/update-price", `${body}&apiseal=${hmac.digest("hex")}`);
  return result;
}