import immutable from "immutable";

import Dispatcher from "../Dispatcher";
import { MapStore } from "../lib/Flux";
import { ActionTypes } from "../Constants";
import { uuid } from "../utils/Crypto";

function handleMessageReceived(state, {
  topic, message, error, deleted,
}) {
  const messages = state.get("messages") || immutable.OrderedSet();
  const log = {
    id: uuid(),
    message,
    topic,
    date: new Date(),
    deleted,
  };
  if (error) {
    log.error = error;
  }
  return state.set("messages", messages.add(log));
}

function handleConnection(state) {
  return state.set("connected", true);
}

function handleDisconnection(state) {
  return state.set("connected", false);
}

class MQTTStore extends MapStore {
  initialize() {
    this.addAction(ActionTypes.MQTT_MESSAGE_RECEIVED, handleMessageReceived);
    this.addAction(ActionTypes.MQTT_CONNECTED, handleConnection);
    this.addAction(ActionTypes.MQTT_DISCONNECTED, handleDisconnection);
  }

  getInitialState() {
    return immutable.fromJS({ connected: true });
  }

  getMessages() {
    return this.getState().get("messages", immutable.Set());
  }

  isConnected() {
    return this.getState().get("connected");
  }
}

const instance = new MQTTStore(Dispatcher);
export default instance;
