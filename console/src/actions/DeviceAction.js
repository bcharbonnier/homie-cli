import { dispatch } from "../Dispatcher";
import { ActionTypes } from "../Constants";

export function deleteDevice(deviceId) {
  return fetch(`/api/devices/${deviceId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (response.status !== 200) {
        console.error(response.statusText);
        dispatch({
          type: ActionTypes.DEVICE_DELETE_FAILURE,
          deviceId,
        });
        return {};
      }
      return response.json();
    })
    .then(({ devices, device }) => {
      dispatch({
        type: ActionTypes.DEVICE_DELETE_SUCCESS,
        devices,
        device, // TODO: display de notification of successful deletion
      });
    });
}

export const filterList = (text) => {
  dispatch({
    type: ActionTypes.DEVICE_FILTER,
    text,
  });
};
