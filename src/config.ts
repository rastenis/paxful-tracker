export let config: any;

try {
  config = require("../config.json");
} catch (e) {
  // config = {
  //   paxful: JSON.parse(process.env.paxful),
  // };
}
