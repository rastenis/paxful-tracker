const { api } = require("../dist");

test("should fetch payment methods", async () => {
  let c = await api.paymentMethods.list();
  console.table(c.data.methods);
  return;
});
