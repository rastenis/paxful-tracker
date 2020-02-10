export function getRates() {
  var xhr = new XMLHttpRequest(),
    secret = "aefij3ldaase_ase23fdAdwjnA2123fFa",
    body =
      "apikey=" +
      "dgsdrij234fsdfgkhr" +
      "&nonce=" +
      Date.now() +
      "&offer_hash=Agq1Bpw7oX9&margin=50";

  var seal = CryptoJS.HmacSHA256(body, secret);

  xhr.open("POST", "https://www.paxful.com/api/offer/list");
  xhr.setRequestHeader("Content-Type", "text/plain");
  xhr.setRequestHeader("Accept", "application/json");
  xhr.send(body + "&apiseal=" + seal);
}
