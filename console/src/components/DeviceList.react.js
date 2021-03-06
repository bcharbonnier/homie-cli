import React from "react";
import classnames from "classnames";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";

import ActionButton from "./ActionButton.react";
import NotAvailableWrapper from "./NotAvailableWrapper.react";
import Uptime from "./Uptime.react";

class DeviceList extends React.PureComponent {
  render() {
    const { devices, history } = this.props;

    const deviceList = devices.map(device => (
      <tr key={device.id}>
        <td className="device-online">
          <span
            className={classnames("tag", "is-rounded", {
              "is-danger": device.online === false,
              "is-success": device.online === true,
            })}
          >
            {device.online === true ? "online" : "offline"}
          </span>
        </td>
        <td>
          <div>{device.name}</div>
          <div className="content tag is-small">{device.id}</div>
        </td>
        <td>
          <NotAvailableWrapper condition={device.implementation === "esp8266" && device.online}>
            <progress
              title={`${device["stats/signal"]}%`}
              className="progress is-small is-dark"
              value={device["stats/signal"]}
              max="100"
            />
          </NotAvailableWrapper>
        </td>
        <td>
          <NotAvailableWrapper condition={device.online}>
            <div>{device.localip}</div>
            <div className="content is-small">{device.mac}</div>
          </NotAvailableWrapper>
        </td>
        <td>
          <div className="">{device["fw/name"]}</div>

          <div className="content is-small tag">
            <span className="icon">
              <i
                className={classnames("fa", {
                  "fa-microchip": device.implementation === "esp8266",
                  "fa-desktop": device.implementation !== "esp8266",
                })}
                aria-hidden="true"
              />
            </span>
            <span>{device.implementation}</span>
          </div>
        </td>
        <td className="has-text-centered">{device["fw/version"]}</td>
        <td>
          <NotAvailableWrapper condition={device.online}>
            <Uptime time={device["stats/uptime"]} short />
          </NotAvailableWrapper>
        </td>
        <td>
          <ActionButton
            label={
              <span>
                <span className="icon is-small">
                  <i className="fa fa-info-circle" />
                </span>
                <span>Info</span>
              </span>
            }
            onClick={() => {
              history.push(`/devices/${device.id}`);
            }}
          >
            {device.online === true && (
              <Link key="reset" to={`/devices/${device.id}/reset`} className="dropdown-item">
                <span className="icon is-small">
                  <i className="fa fa-refresh" />
                </span>
                Reset
              </Link>
            )}
            {device.online === false && (
              <Link
                key="delete"
                className="dropdown-item has-text-danger"
                to={`/devices/${device.id}/delete`}
              >
                <span className="icon is-small">
                  <i className="fa fa-trash-o" />
                </span>
                Delete
              </Link>
            )}
            <span key="divider" className="dropdown-divider" />

            <Link to={`/devices/${device.id}`} className="dropdown-item">
              <span className="icon is-small">
                <i className="fa fa-info-circle" />
              </span>
              Info
            </Link>
          </ActionButton>
        </td>
      </tr>
    ));

    return <tbody>{deviceList}</tbody>;
  }
}

export default withRouter(DeviceList);
