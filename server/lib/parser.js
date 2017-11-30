const TOPIC_TYPES = {
  INVALID: "INVALID",
  BROADCAST: "BROADCAST",
  DEVICE_ATTRIBUTE: "DEVICE_ATTRIBUTE",
  DEVICE_NODE_ATTRIBUTE: "DEVICE_NODE_ATTRIBUTE",
  DEVICE_NODE_PROPERTY: "DEVICE_NODE_PROPERTY",
  DEVICE_NODE_PROPERTY_ATTRIBUTE: "DEVICE_NODE_PROPERTY_ATTRIBUTE",
};
exports.TOPIC_TYPES = TOPIC_TYPES;

const isValidId = id => /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(id);

class TopicParser {
  constructor(baseTopic) {
    this.baseTopic = baseTopic;
  }

  parse(topic, value) {
    if (!topic.startsWith(this.baseTopic)) {
      return { type: TOPIC_TYPES.INVALID };
    }

    const [deviceId, ...rest] = topic.replace(this.baseTopic, "").split("/");
    const { length } = rest;

    if (length === 1 && deviceId === "$broadcast") {
      // General Broadcast
      const level = rest[0];
      if (!isValidId(level)) {
        return {
          type: TOPIC_TYPES.INVALID,
        };
      }
      return {
        type: TOPIC_TYPES.BROADCAST,
        level,
        value,
      };
    } else if (!isValidId(deviceId)) {
      return {
        type: TOPIC_TYPES.INVALID,
      };
    } else if (length >= 1 && rest[0].startsWith("$")) {
      // Device Attribute
      return {
        type: TOPIC_TYPES.DEVICE_ATTRIBUTE,
        deviceId,
        attribute: rest.join("/").substr(1), // Remove $
        value,
      };
    } else if (length >= 2 && rest[1].startsWith("$")) {
      // Device Node Attribute
      const [nodeId, ...attribute] = rest;
      if (!isValidId(nodeId)) {
        return { type: TOPIC_TYPES.INVALID };
      }
      return {
        type: TOPIC_TYPES.DEVICE_NODE_ATTRIBUTE,
        deviceId,
        nodeId,
        attribute: attribute.join("/").substr(1), // Remove $
        value,
      };
    } else if (length >= 3 && rest[2].startsWith("$")) {
      // Node Property Attribute
      const [nodeId, propertyId, ...attribute] = rest;
      if (!isValidId(nodeId) || !isValidId(propertyId)) {
        return { type: TOPIC_TYPES.INVALID };
      }
      return {
        type: TOPIC_TYPES.DEVICE_NODE_PROPERTY_ATTRIBUTE,
        deviceId,
        nodeId,
        propertyId,
        attribute: attribute.join("/").substr(1), // Remove $
        value,
      };
    } else if (length === 2) {
      // Node Property
      const [nodeId, propertyId] = rest;
      if (!isValidId(nodeId) || !isValidId(propertyId)) {
        return { type: TOPIC_TYPES.INVALID };
      }
      return {
        type: TOPIC_TYPES.DEVICE_NODE_PROPERTY,
        deviceId,
        nodeId,
        propertyId,
        value,
      };
    }

    return {
      type: TOPIC_TYPES.INVALID,
    };
  }
}

exports.setup = function (config) {
  return new TopicParser(config.homie.base_topic);
};
