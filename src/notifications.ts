import * as Push from "pushover-notifications";
import { config } from "./config";

export interface IPushoverObject {
  message: string;
  title: string;
  url?: string;
  sound: string;
  device: string;
  priority?: number;
}

export const notifier = {
  send: async function (PushoverObject: IPushoverObject): Promise<void> {
    push.send(PushoverObject);
    return;
  },
  error: function (error) {
    console.error("Failed to send notification:", error);
  },
};

// definitions
const push = new Push({
  user: config.pushover.user,
  token: config.pushover.token,
  onerror: notifier.error,
});

export function format(r: string[]): string {
  return r.toString().replace("[", "").replace("]", "");
}
