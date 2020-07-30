# paxful-tracker

A tool for receiving notifications based on custom flags from Paxful.

## Features

- Track the margin rates of various payment methods accepted by Paxful
- Receive Pushover notifications when your configured thresholds are reached.

## Setup

```bash
# Pull the repo
$ git clone https://github.com/Scharkee/paxful-tracker.git

# Install packages & build
$ pnpm i

# configure config.json

# Run the tracker
$ pnpm run track
```

A config.json file has to be in the root directory of the tracker. **Warning**, the margin values are internal and only represent the degree to which the buyer is overvaluing his currency when purchasing the tracked currency via the matching PAYMENT_METHOD.

```javascript
{
  "key": "PAXFUL_API_KEY",
  "secret": "PAXFUL_API_SECRET",
  "tracked": [
    // example of a multi-threshold payment method tracking configuration
    {
      "paymentMethod": "PAYMENT_METHOD",
      "currency": "CURRENCY_CODE",
      "marginThresholds": { // Applicable margin thresholds per denomination of the selected payment method
        "50": 99,
        "100": 99,
        "200": 99
      },
      "adjustedMarginsMin": { // smallest allowed margin for auto-adjusting
        "50": 64,
        "100": 59,
        "200": 54
      }
    },
    // example of a single threshold payment method tracking configuration
    {
      "paymentMethod": "PAYMENT_METHOD",
      "currency": "CURRENCY_CODE",
      "marginThreshold": 99,
      "adjustedMarginMin": 64
    }
  ],
  "interval": 3600000, // interval for checking in milliseconds
  "pushover": {
    "user": "PUSHOVER_USER",
    "token": "PUSHOVER_TOKEN",
    "devices": ["device1", "device2"] // array of device names that will be notified
  }
}
```

The tracker will send out notifications to the listed devices once the margin for any specific denomination of any payment method goes above the configured value threshold.

### Support

Submit bugs and feature requests through the project's issue tracker:

[![Issues](http://img.shields.io/github/issues/Scharkee/paxful-tracker.svg)](https://github.com/Scharkee/paxful-tracker/issues)

### License

MIT
