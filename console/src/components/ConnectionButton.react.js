import React from "react";

import { Container } from "flux/utils";
import classnames from "classnames";

import ConnectionStore from "../stores/ConnectionStore";
import MQTTStore from "../stores/MQTTStore";

class ConnectionButton extends React.Component {
  static getStores() {
    return [ConnectionStore, MQTTStore];
  }

  static calculateState() {
    return {
      connected: ConnectionStore.isConnected(),
      connecting: ConnectionStore.isConnecting(),
      mqttConnected: MQTTStore.isConnected(),
    };
  }

  render() {
    const { connected, connecting, mqttConnected } = this.state;
    const text = connected ? "Connected" : "Disconnected";
    return (
      <a
        className={classnames("button", {
          "is-loading": connecting,
          "is-dark": !connected,
          "is-success": connected && mqttConnected,
          "is-warning": connected && !mqttConnected,
        })}
        title={!mqttConnected && "The underlying connection to MQTT broker has been lost"}
      >
        {!mqttConnected
          ? [
              <span key="icon" className="icon is-small">
                <i className="fa fa-exclamation-triangle" />
              </span>,
              <span key="text">{text}</span>,
            ]
          : text}
      </a>
    );
  }
}

const container = Container.create(ConnectionButton);
export default container;
