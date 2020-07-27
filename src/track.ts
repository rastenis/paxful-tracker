import * as api from "./api";
import { config } from "./config";
import { notifier, format } from "./notifications";
import { updateOffer } from "./updateOffers";

export function setup() {
  setInterval(() => {
    check();
  }, config.interval);
}

export async function check() {
  console.log("Checking...");

  if (!config.tracked) {
    console.log("Nothing set up to track.");
    return;
  }

  for (const toTrack of config.tracked) {
    const allOfferValues = [];
    const result = await getMargins(toTrack, allOfferValues);

    const firstEntryName = Object.keys(result)[0];

    // single
    if (firstEntryName === "all") {
      console.log(
        `Checked ${toTrack.paymentMethod} [${firstEntryName}] and it is at ${result[firstEntryName]}`
      );
      if (result[firstEntryName] > toTrack.marginThreshold) {
        console.log(`Notifying for ${toTrack.paymentMethod}`);

        notifier.send({
          message: `${toTrack.paymentMethod} is at ${result[firstEntryName]}, which is above ${toTrack.marginThreshold}`,
          title: `${toTrack.paymentMethod} is at ${result[firstEntryName]}`,
          sound: "pushover",
          device: format(config.pushover.devices),
          priority: 1
        });
      }

      // try to update current offers and notify if changes were made
      const updatedOfferValue = await updateOffer(allOfferValues, toTrack);
      if (updatedOfferValue != -1) {
        console.log(
          `Notifying updated offer for ${toTrack.paymentMethod}, now at ${updatedOfferValue}`
        );

        notifier.send({
          message: `${toTrack.paymentMethod} offer was updated, now at ${updatedOfferValue}`,
          title: `${toTrack.paymentMethod} updated to ${updatedOfferValue}`,
          sound: "pushover",
          device: format(config.pushover.devices),
          priority: 1
        });
      }
      return;
    }

    // multi
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
          priority: 1
        });
      }

      // try to update current offers and notify if changes were made
      const updatedOfferValue = await updateOffer(
        allOfferValues[element],
        toTrack,
        element
      );
      if (updatedOfferValue != -1) {
        console.log(
          `Notifying updated offer for ${toTrack.paymentMethod} [${element}], now at ${updatedOfferValue}`
        );

        notifier.send({
          message: `${toTrack.paymentMethod} [${element}] offer was updated, now at ${updatedOfferValue}`,
          title: `${toTrack.paymentMethod} [${element}] updated to ${updatedOfferValue}`,
          sound: "pushover",
          device: format(config.pushover.devices),
          priority: 1
        });
      }
    }
  }
}

export async function getMargins(
  toTrack: any,
  allOfferValues: any
): Promise<any> {
  const margins: any = {};

  if (!toTrack.marginThreshold && !toTrack.marginThresholds) {
    console.error("Tracking entry set up improperly.");
    process.exit(1);
  }

  // single
  if (toTrack.marginThreshold) {
    const { data } = await api.offers.all(
      toTrack.paymentMethod,
      "buy",
      toTrack.currency
    );

    if (!data) {
      console.error(
        "Failed to get data for ",
        toTrack.paymentMethod,
        "buy",
        toTrack.currency
      );
      return;
    }

    data.offers.forEach((element) => {
      allOfferValues.push(element.margin);
    });

    return { all: data.offers[0].margin };
  }

  // multi
  for (const min in toTrack.marginThresholds) {
    const { data } = await api.offers.all(
      toTrack.paymentMethod,
      "buy",
      toTrack.currency,
      parseFloat(min) // Denomination
    );

    if (!data || !data.offers[0]) {
      console.error(
        "Failed to get data for ",
        toTrack.paymentMethod,
        "buy",
        toTrack.currency,
        parseFloat(min)
      );
      continue;
    }

    allOfferValues[min] = [];
    data.offers.forEach((element) => {
      allOfferValues[min].push(element.margin);
    });

    margins[min] = data.offers[0].margin;
  }

  return margins;
}
