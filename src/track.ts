import * as api from "./api";
import { config } from "./config";
import { notifier, format } from "./notifications";
import { updateOffer } from "./updateOffers";

export interface IOffer {
  offer_id: string,
  margin: number,
  payment_method_slug: string,
  denomination: string,
  offer_owner_username: string
}

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

    // getMargins returns IOffer array instead of number array for easier offer id filtering
    const allOffers = await getOffers(toTrack);

    // single
    if(toTrack.marginThreshold) {
      console.log(
        `Checked ${toTrack.paymentMethod} [${allOffers[0].denomination}] and it is at ${allOffers[0].margin}`
      );
      if (allOffers[0].margin > toTrack.marginThreshold) {
        console.log(`Notifying for ${toTrack.paymentMethod}`);

        notifier.send({
          message: `${toTrack.paymentMethod} is at ${allOffers[0].margin}, which is above ${toTrack.marginThreshold}`,
          title: `${toTrack.paymentMethod} is at ${allOffers[0].margin}`,
          sound: "pushover",
          device: format(config.pushover.devices),
          priority: 1
        });
      }

      // try to update current offers and notify if changes were made
      const updatedOfferValue = await updateOffer(allOffers, toTrack);
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
    for(const offerList of allOffers) {
      console.log(
        `Checked ${toTrack.paymentMethod} [${offerList[0].denomination}] and it is at ${offerList[0].margin}`
      );

      if (offerList[0].margin > toTrack.marginThresholds[offerList[0].denomination]) {
        console.log(`Notifying for ${toTrack.paymentMethod} [${offerList[0].denomination}]`);
        notifier.send({
          message: `${toTrack.paymentMethod} [${offerList[0].denomination}] is at ${offerList[0].margin}, which is above ${toTrack.marginThresholds[offerList[0].denomination]}`,
          title: `${toTrack.paymentMethod} [${offerList[0].denomination}] is at ${offerList[0].margin}`,
          sound: "pushover",
          device: format(config.pushover.devices),
          priority: 1
        });
      }

      // try to update current offers and notify if changes were made
      const updatedOfferValue = await updateOffer(
        offerList,
        toTrack
      );
      if (updatedOfferValue != -1) {
        console.log(
          `Notifying updated offer for ${toTrack.paymentMethod} [${offerList[0].denomination}], now at ${updatedOfferValue}`
        );

        notifier.send({
          message: `${toTrack.paymentMethod} [${offerList[0].denomination}] offer was updated, now at ${updatedOfferValue}`,
          title: `${toTrack.paymentMethod} [${offerList[0].denomination}] updated to ${updatedOfferValue}`,
          sound: "pushover",
          device: format(config.pushover.devices),
          priority: 1
        });
      }
    }
  }
}

export async function getOffers(
  toTrack: any
): Promise<any> {
  const offers: any = [];

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

    data.offers.forEach(element => {
      const offer: IOffer = {
        "offer_id": element.offer_id, 
        "margin": element.margin, 
        "payment_method_slug": toTrack.paymentMethod,
        "denomination": "all",
        "offer_owner_username": element.offer_owner_username
      };
      offers.push(offer);
    });

    return offers;
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

    offers.push([]);
    data.offers.forEach(element => {
      const offer: IOffer = {
        "offer_id": element.offer_id, 
        "margin": element.margin, 
        "payment_method_slug": toTrack.paymentMethod,
        "denomination": min,
        "offer_owner_username": element.offer_owner_username
      };
      offers[offers.length -1].push(offer);
    });
  }

  return offers;
}
