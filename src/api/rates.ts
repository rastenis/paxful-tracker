import axios from "axios";
import * as crypto from "crypto";
import { config } from "../config";

export async function getRates(
  payment_method: string,
  offer_type: string = "buy"
) {
  const hmac = crypto.createHmac("sha256", config.secret);
  const body = `apikey=${
    config.key
  }&nonce=${Date.now()}&offer_type=${offer_type}&payment_method=${payment_method}`;
  hmac.update(body);

  return axios({
    method: "POST",
    url: "https://paxful.com/api/offer/all",
    data: `${body}&apiseal=${hmac.digest("hex")}`,
    headers: { "Content-Type": "text/plain", Accept: "application/json" }
  });
}
