import * as api from "./api";
import { config } from "./config";
import { notifier, format } from "./notifications";
import async from "async";

export function setup() {
  setInterval(() => {
    check();
  }, config.interval);
}

export function check() {
  console.log("Checking...");

  config.tracked.forEach(toTrack => {
    getMargins(toTrack)
      .then(r => {
        Object.keys(r).forEach(element => {
          console.log(
            `Checked ${toTrack.paymentMethod} [${element}] and it is at ${r[element]}`
          );

          if (element == "all") {
            if (r[element] > toTrack.marginThreshold) {
              console.log(`Notifying for ${toTrack.paymentMethod}`);

              notifier.send({
                message: `${toTrack.paymentMethod} is at ${r[element]}, which is above ${toTrack.marginThreshold}`,
                title: `${toTrack.paymentMethod} is at ${r[element]}`,
                sound: "pushover",
                device: format(config.pushover.devices),
                priority: 1
              });
            }
          } else if (r[element] > toTrack.marginThresholds[element]) {
            console.log(`Notifying for ${toTrack.paymentMethod} [${element}]`);
            notifier.send({
              message: `${toTrack.paymentMethod} [${element}] is at ${r[element]}, which is above ${toTrack.marginThresholds[element]}`,
              title: `${toTrack.paymentMethod} [${element}] is at ${r[element]}`,
              sound: "pushover",
              device: format(config.pushover.devices),
              priority: 1
            });
          }
        });
      })
      .catch(e => {
        console.error("Could not track ", toTrack, e);
      });
  });
}

export async function getMargins(toTrack: any): Promise<any> {
  let margins: any;
  return new Promise((res, rej) => {
    margins = {};
    // single
    if (toTrack.marginThreshold) {
      api.rates
        .all(toTrack.paymentMethod, "buy", toTrack.currency)
        .then(({ data }) => {
          return res({ all: data.offers[0].margin });
        })
        .catch(e => {
          return rej(e);
        });
    } else {
      // multi
      async.eachSeries(
        Object.keys(toTrack.marginThresholds),
        (min, cb) => {
          api.rates
            .all(toTrack.paymentMethod, "buy", toTrack.currency, min)
            .then(({ data }) => {
              margins[min] = data.offers[0].margin;
              return cb();
            })
            .catch(e => {
              return cb(e);
            });
        },
        () => {
          return res(margins);
        }
      );
    }
  });
}
