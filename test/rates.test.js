const { track } = require("../dist");

test("should fetch rates", async () => {
  let c = await track.getRates("bank-transfer");
  console.log("rate is", c);
  return;
});
