import immutable from "immutable";

import Dispatcher, { dispatch } from "../Dispatcher";
import { MapStore, withNoMutations } from "../lib/Flux";
import WebSocket from "../lib/WebSocket";

import { ActionTypes } from "../Constants";

const client = new WebSocket("ws://localhost:5000");

client.on("open", () => {
  dispatch({
    type: ActionTypes.CONNECTION_OPEN
  });
});

client.on("close", event => {
  dispatch({
    type: ActionTypes.CONNECTION_LOST
  });
  if (event.code === 1006) {
    // auth error
    client.stop();
  }
});

client.on("message", data => {
  console.log(data);
});

client.start();

function handleConnectionOpen(state) {
  return state.withMutations(map => {
    map.set("connected", true);
    map.set("connecting", false);
    return map;
  });
}

function handleConnectionLost(state) {
  return state.set("connected", false);
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
    this.addAction(
      ActionTypes.SEND_MESSAGE,
      withNoMutations(handleSendMessage)
    );
  }

  getInitialState() {
    return immutable.fromJS({
      connected: false,
      connecting: true
    });
  }

  isConnected() {
    return this.getState().get("connected");
  }

  isConnecting() {
    // return this.getState().get("connecting");
    return false;
  }
}

const instance = new ConnectionStore(Dispatcher);
export default instance;
