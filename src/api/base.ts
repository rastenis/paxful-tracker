import axios from "axios";
import * as crypto from "crypto";
import { config } from "../config";

export async function request(path: string, data?: string): Promise<any> {
  const result = await axios({
    method: "POST",
    url: "https://paxful.com/api/" + path,
    data: data,
    headers: { "Content-Type": "text/plain", Accept: "application/json" }
  });

  if (result.data.status === "error") {
    console.error(result.data.error?.message ?? result.data);
    throw new Error(result.data);
  }

  return result.data;
}

/**
 * Creates a signature and returns both the body and the signature.
 * @param bodyAppend the body that is appended to the nonce and api key.
 */
export function createBodySignature(bodyAppend: string): [any, any] {
  const hmac = crypto.createHmac("sha256", config.secret);

  let body: string;
  if (bodyAppend != "") {
    body = `apikey=${config.key}&nonce=${Date.now()}&${bodyAppend}`;
  } else {
    body = `apikey=${config.key}&nonce=${Date.now()}`;
  }

  hmac.update(body);

  return [body, hmac.digest("hex")];
}
