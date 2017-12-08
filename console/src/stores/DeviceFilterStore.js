import Dispatcher from "../Dispatcher";
import { MapStore } from "../lib/Flux";
import { ActionTypes } from "../Constants";

import DeviceStore from "./DeviceStore";

function isMatching(device, text) {
  const toMatch = text.toLowerCase();
  return (
    device.name.toLowerCase().includes(toMatch) ||
    device.id.startsWith(toMatch) ||
    device["fw/name"].includes(toMatch)
  );
}

function handleDeviceSync(state) {
  return state.set(
    "devices",
    DeviceStore.getDevices().filter(device => isMatching(device, this.getState().get("filter", "")))
  );
}

function handleDeviceFilter(state, { text }) {
  return state.withMutations((map) => {
    map.set("filter", text);
    map.set("devices", DeviceStore.getDevices().filter(device => isMatching(device, text)));
  });
}

class DeviceFilterStore extends MapStore {
  initialize() {
    this.syncWith([DeviceStore], handleDeviceSync);
    this.addAction(ActionTypes.DEVICE_FILTER, handleDeviceFilter);
  }

  getDevices() {
    return this.getState().get("devices", DeviceStore.getDevices());
  }

  get filter() {
    return this.getState().get("filter", "");
  }
}

const instance = new DeviceFilterStore(Dispatcher);
export default instance;
