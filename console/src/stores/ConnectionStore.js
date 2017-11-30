import immutable from "immutable";
import io from "socket.io-client";

import Dispatcher, { dispatch } from "../Dispatcher";
import { MapStore, withNoMutations } from "../lib/Flux";

import { ActionTypes } from "../Constants";

import * as MessageAction from "../actions/MessageAction";
import * as NotificationAction from "../actions/NotificationAction";

const client = io("ws://localhost:5000", {
  autoConnect: false,
});

client.on("connect", () => {
  dispatch({
    type: ActionTypes.CONNECTION_OPEN,
  });
});

client.on("disconnect", () => {
  dispatch({
    type: ActionTypes.CONNECTION_LOST,
  });
});

client.on("reconnect_error", () => {
  dispatch({
    type: ActionTypes.CONNECTION_LOST,
  });
});

client.on("reconnecting", () => {
  dispatch({
    type: ActionTypes.CONNECTION_RECONNECT,
  });
});

client.on("reconnect_failed", () => {
  NotificationAction.error(`All attempts to reconnect to the server have failed.
Please check your network connection`);
  dispatch({
    type: ActionTypes.CONNECTION_LOST,
  });
});

client.on("mqtt.message", MessageAction.receiveMessage);
client.on("device.update", (deviceId, attribute, value) => {
  dispatch({
    type: ActionTypes.DEVICE_PROPERTY_UPDATE,
    deviceId,
    attribute,
    value,
  });
});
client.on("devices.update", (devices) => {
  dispatch({
    type: ActionTypes.LOAD_DEVICES_SUCCESS,
    devices,
  });
});

client.connect();

function handleConnectionOpen(state) {
  return state.withMutations((map) => {
    map.set("connected", true);
    map.set("connecting", false);
    return map;
  });
}

function handleConnectionLost(state) {
  return state.withMutations((map) => {
    map.set("connected", false);
    map.set("connecting", false);
    return map;
  });
}

function handleReconnect(state) {
  return state.set("connecting", true);
}

function handleSendMessage({ topic, message, options }) {
  options = options || { retain: false };
  // client.send();
}

class ConnectionStore extends MapStore {
  initialize() {
    this.addAction(ActionTypes.CONNECTION_OPEN, handleConnectionOpen);
    this.addAction(ActionTypes.CONNECTION_LOST, handleConnectionLost);
    this.addAction(ActionTypes.CONNECTION_RECONNECT, handleReconnect);
    this.addAction(ActionTypes.SEND_MESSAGE, withNoMutations(handleSendMessage));
  }

  getInitialState() {
    return immutable.fromJS({
      connected: false,
      connecting: true,
    });
  }

  isConnected() {
    return this.getState().get("connected");
  }

  isConnecting() {
    return this.getState().get("connecting");
  }
}

const instance = new ConnectionStore(Dispatcher);
export default instance;
