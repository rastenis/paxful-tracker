import * as api from "./api";
import { format, notifier } from "./notifications";
import { config } from "./config";
import { IOffer } from "./track";

const requestList = {};

// only add offers to the list that require a lower margin
export function addNewRequest(offer: IOffer ) {
    if(requestList[offer.offer_id] && offer.margin >= requestList[offer.offer_id].margin)
        return;

    // only update request if margin is lower than saved
    requestList[offer.offer_id] = offer;
}

export async function processRequests() {
    for(const offer_id in requestList) {
        const offer: IOffer = requestList[offer_id];

        try {
            // apply new margin to matched offer
            const updateResult = await api.offers.update(offer_id, offer.margin);
            const success: boolean = updateResult.data?.success;
      
            if (!success) {
              console.error("Offer update unsuccessful: API error");
              if(updateResult.error.message) 
                console.error(updateResult.error.message);
              return;
            } else {
                showOfferUpdateNotification(offer);
            }
          } catch(exception) {
            console.error("Offer update unsuccessful");
            console.error(exception);
            return;
          }
    }
}

function showOfferUpdateNotification(offer: IOffer) {
    console.log(
        `Notifying updated offer for ${offer.payment_method_slug} [${offer.denomination}], now at ${offer.margin}`
    );

    notifier.send({
        message: `${offer.payment_method_slug} [${offer.denomination}] offer was updated, now at ${offer.margin}`,
        title: `${offer.payment_method_slug} [${offer.denomination}] updated to ${offer.margin}`,
        sound: "pushover",
        device: format(config.pushover.devices),
        priority: 1
    });
}