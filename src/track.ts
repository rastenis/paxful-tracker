import * as api from "./api";
export function setup() {}

export async function getRates(payment_currency: string): Promise<number> {
  let btc;
  return new Promise((res, rej) => {
    api.currency
      .btc()
      .then(r => {
        btc = r.price;
        return api.rates.all(payment_currency);
      })
      .then(({ data }) => {
        return res(
          parseFloat(btc) / parseFloat(data.offers[0].fiat_USD_price_per_btc)
        );
      })
      .catch(e => {
        return rej(e);
      });
  });
}
