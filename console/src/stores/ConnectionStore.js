import immutable from "immutable";

import Dispatcher, { dispatch } from "../Dispatcher";
import { MapStore, withNoMutations } from "../lib/Flux";
import WebSocket from "../lib/WebSocket";

import { ActionTypes } from "../Constants";

import * as MessageAction from "../actions/MessageAction";
import * as NotificationAction from "../actions/NotificationAction";

const client = new WebSocket("ws://localhost:5000");

client.on("open", () => {
  dispatch({
    type: ActionTypes.CONNECTION_OPEN,
  });
});

client.on("close", (event) => {
  dispatch({
    type: ActionTypes.CONNECTION_LOST,
  });
});

client.on("error", () => {
  console.warn(`Connection via websocket to ${client.url} not available`);
  dispatch({
    type: ActionTypes.CONNECTION_LOST,
  });
});

client.on("reconnect", () => {
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

client.on("message", (data) => {
  if (data[0] === "mqtt.message") {
    MessageAction.receiveMessage(data[1], data[2]);
  }
});

client.start();

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
    // return false;
  }
}

const instance = new ConnectionStore(Dispatcher);
export default instance;
