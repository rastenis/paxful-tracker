import { request, createBodySignature } from "./base";

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
