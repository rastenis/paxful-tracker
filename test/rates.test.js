const { api } = require("../dist");

test("should work", () => {
  api.rates
    .getRates()
    .then(r => {
      console.log(r.data.data.offers);
      return;
    })
    .catch(e => {
      console.error(e);
      throw "";
    });
});
