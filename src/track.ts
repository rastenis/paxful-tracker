import * as api from "./api";
import { config } from "./config";
import { notifier, format } from "./notifications";

export function setup() {
  setInterval(() => {
    check();
  }, config.interval);
}

export async function check() {
  console.log("Checking...");

  if (!config?.tracked) {
    console.log("Nothing set up to track.");
    return;
  }

  for (const toTrack of config.tracked) {
    const result = await getMargins(toTrack);

    const firstEntryName = Object.keys(result)[0];

    if (firstEntryName === "all") {
      if (result[firstEntryName] > toTrack.marginThreshold) {
        console.log(`Notifying for ${toTrack.paymentMethod}`);

        notifier.send({
          message: `${toTrack.paymentMethod} is at ${result[firstEntryName]}, which is above ${toTrack.marginThreshold}`,
          title: `${toTrack.paymentMethod} is at ${result[firstEntryName]}`,
          sound: "pushover",
          device: format(config.pushover.devices),
          priority: 1,
        });
      }
      return;
    }

    for (const element of Object.keys(result)) {
      console.log(
        `Checked ${toTrack.paymentMethod} [${element}] and it is at ${result[element]}`
      );

      if (result[element] > toTrack.marginThresholds[element]) {
        console.log(`Notifying for ${toTrack.paymentMethod} [${element}]`);
        notifier.send({
          message: `${toTrack.paymentMethod} [${element}] is at ${result[element]}, which is above ${toTrack.marginThresholds[element]}`,
          title: `${toTrack.paymentMethod} [${element}] is at ${result[element]}`,
          sound: "pushover",
          device: format(config.pushover.devices),
          priority: 1,
        });
      }
    }
  }
}

export async function getMargins(toTrack: any): Promise<any> {
  let margins: any;
  margins = {};

  if (!toTrack.marginThreshold && !toTrack.marginThresholds) {
    console.log("Tracking entry set up improperly.");
    process.exit(1);
  }

  // single
  if (toTrack.marginThreshold) {
    const { data } = await api.rates.all(
      toTrack.paymentMethod,
      "buy",
      toTrack.currency
    );

    return { all: data.offers[0].margin };
  }

  // multi
  for (const min in toTrack.marginThresholds) {
    const { data } = await api.rates.all(
      toTrack.paymentMethod,
      "buy",
      toTrack.currency,
      parseFloat(min) // Denomination
    );

    if (!data) {
      console.error(
        "Failed to get data for ",
        toTrack.paymentMethod,
        "buy",
        toTrack.currency,
        parseFloat(min)
      );
      continue;
    }

    margins[min] = data.offers[0].margin;
  }

  return margins;
}
