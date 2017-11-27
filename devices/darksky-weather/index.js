const { Homie, HomieNode, HomieSetting } = require("homie-device");
const Darksky = require("dark-sky");

let interval;

const apiKey = HomieSetting("apiKey", "DarkSky API key", "string");

const refreshInterval = HomieSetting(
  "refreshInterval",
  "Interval in seconds at which data are refreshed",
  "integer"
).setDefaultValue(60 * 30);

const language = HomieSetting(
  "language",
  "DarkSky API language",
  "string"
).setDefaultValue("fr");

const units = HomieSetting(
  "units",
  "DarkSky API units",
  "string"
).setDefaultValue("ca");

const locations = HomieSetting(
  "locations",
  "List of locations to retrieve weather information for",
  "json"
).setDefaultValue([
  {
    name: "Biot",
    latitude: "43.6297",
    longitude: "7.0938"
  }
]);

const stations = HomieNode("stations", "weather.stations");
locations.get().forEach(station => {
  stations.advertise(station.name);
});

Homie.setup();

Homie.on("connected", async () => {
  const darksky = new Darksky(apiKey.get());

  function refresh() {
    locations.get().forEach(station => {
      Homie.log(`Fetching forecast data for ${station.name}`);

      darksky
        .latitude(station.latitude)
        .longitude(station.longitude)
        .language(language.get())
        .units(units.get())
        .exclude("minutely,hourly")
        .get()
        .then(weather => {
          Homie.log(`Forecast data for ${station.name} retrieved`);
          stations.setProperty(station.name).send(JSON.stringify(weather));
        })
        .catch(error => {
          console.error(error);
        });
    });
  }

  refresh();
  interval = setInterval(refresh, refreshInterval.get() * 1000);
});

Homie.on("disconnected", () => {
  interval = clearInterval(interval);
});
