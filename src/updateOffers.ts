import * as api from "./api";
import { IOffer } from "./track";

let username: string = null;

// process offer margin list received from Paxful
export async function updateOffer(
  offers: IOffer[],
  offerDescription: any
): Promise<number> {
  // no margin range == offer control disabled
  if (!offerDescription.adjustedMarginsMin?.[offers[0].denomination]) {
    return;
  }

  if (username == null) {
    const currentUser = await api.user.username();
    username = currentUser.data.username;
  }

  let marginMin: number, marginMax: number;
  marginMin =
    offers[0].denomination == "all"
      ? offerDescription.adjustedMarginMin
      : offerDescription.adjustedMarginsMin[offers[0].denomination];
  marginMax =
    offers[0].denomination == "all"
      ? offerDescription.adjustedMarginMax
      : offerDescription.adjustedMarginsMax[offers[0].denomination];

  const sortedOffers = offers.sort(
    (offer1, offer2) => offer1.margin - offer2.margin
  );

  // check if paymentMethod and denomination match
  const result = await api.offers.self();
  const myOffers = result.data.offers;

  for (const element of myOffers) {
    if (offers[0].payment_method_slug != element.payment_method_slug) {
      return;
    }

    if (offers[0].denomination != "all") {
      const denomNumber = parseFloat(offers[0].denomination);
      const fiatMin = parseFloat(element.fiat_amount_range_min);
      const fiatMax = parseFloat(element.fiat_amount_range_max);

      //////////////////////////
      // GUESS: fiat_min is in interval [fiat_amount_range_min; fiat_amount_range_max]
      //////////////////////////
      if (denomNumber > fiatMax || denomNumber < fiatMin) {
        return;
      }
    }

    // find largest margin which would be first in the list and in the given range
    let newMargin: number;

    for (let i = 0; i < sortedOffers.length; i++) {
      // exclude self posted offers from comparison
      if (sortedOffers[i].offer_owner_username == username) {
        continue;
      }

      if (sortedOffers[i].margin >= marginMin) {
        newMargin = Math.max(marginMin, offers[i].margin - 0.01);
        break;
      }
    }

    // apply new margin to matched offer
    const updateResult = await api.offers.update(element.offer_id, newMargin);
    const success: boolean = updateResult.data.success;

    if (!success) {
      console.error("Offer update unsuccessful: API error");
      return -1;
    } else {
      return newMargin;
    }
  }

  return -1;
}
