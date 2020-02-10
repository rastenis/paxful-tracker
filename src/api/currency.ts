import { request } from "./base";

export async function btc() {
  return request("currency/btc");
}
