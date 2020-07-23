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

  for (const toTrack of config.tracked) {
    const result = await getMargins(toTrack);

    for (const element of Object.keys(result)) {
      console.log(
        `Checked ${toTrack.paymentMethod} [${element}] and it is at ${result[element]}`
      );

      if (element == "all") {
        if (result[element] > toTrack.marginThreshold) {
          console.log(`Notifying for ${toTrack.paymentMethod}`);

          notifier.send({
            message: `${toTrack.paymentMethod} is at ${result[element]}, which is above ${toTrack.marginThreshold}`,
            title: `${toTrack.paymentMethod} is at ${result[element]}`,
            sound: "pushover",
            device: format(config.pushover.devices),
            priority: 1,
          });
        }
      } else if (result[element] > toTrack.marginThresholds[element]) {
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
  // single
  if (toTrack.marginThreshold) {
    const { data } = await api.rates.all(
      toTrack.paymentMethod,
      "buy",
      toTrack.currency
    );

    return { all: data.offers[0].margin };
  } else {
    // multi
    for (const min of toTrack.marginThresholds) {
      const { data } = await api.rates.all(
        toTrack.paymentMethod,
        "buy",
        toTrack.currency,
        min
      );

      margins[min] = data.offers[0].margin;
    }

    return margins;
  }
}
