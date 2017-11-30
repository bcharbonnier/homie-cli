const { setup, TOPIC_TYPES } = require("../parser");

let parser;
beforeEach(() => {
  parser = setup({ homie: { base_topic: "homie/" } });
});

describe("invalid", () => {
  it("should detect invalid base topic", () => {
    const message = parser.parse("not-homie/my-device/$homie", "2.1.0");
    expect(message).toEqual({
      type: TOPIC_TYPES.INVALID,
    });
  });

  it("should detect invalid deviceId", () => {
    const message = parser.parse("homie/myDevice/$homie", "2.1.0");
    expect(message).toEqual({
      type: TOPIC_TYPES.INVALID,
    });
  });

  it("should detect invalid nodeId", () => {
    const message = parser.parse("homie/my-device/WRONG%node/$name", "Broken Node");
    expect(message).toEqual({
      type: TOPIC_TYPES.INVALID,
    });
  });

  it("should detect invalid propperty", () => {
    const message = parser.parse("homie/my-device/my-node/Prop3rty", "value");
    expect(message).toEqual({
      type: TOPIC_TYPES.INVALID,
    });
  });
});

describe("devices", () => {
  it("should detect device short attribute topic", () => {
    const message = parser.parse("homie/my-device/$homie", "2.1.0");
    expect(message).toEqual({
      type: TOPIC_TYPES.DEVICE_ATTRIBUTE,
      deviceId: "my-device",
      attribute: "homie",
      value: "2.1.0",
    });
  });

  it("should detect device long attribute topic", () => {
    const message = parser.parse("homie/my-device/$stats/signal", "78");
    expect(message).toEqual({
      type: TOPIC_TYPES.DEVICE_ATTRIBUTE,
      deviceId: "my-device",
      attribute: "stats/signal",
      value: "78",
    });
  });
});

describe("nodes", () => {
  it("should detect short node attributes", () => {
    const message = parser.parse("homie/my-device/my-node/$name", "Super Node");
    expect(message).toEqual({
      type: TOPIC_TYPES.DEVICE_NODE_ATTRIBUTE,
      deviceId: "my-device",
      nodeId: "my-node",
      attribute: "name",
      value: "Super Node",
    });
  });

  it("should detect long node attributes", () => {
    const message = parser.parse("homie/my-device/my-node/$attr/long", "value");
    expect(message).toEqual({
      type: TOPIC_TYPES.DEVICE_NODE_ATTRIBUTE,
      deviceId: "my-device",
      nodeId: "my-node",
      attribute: "attr/long",
      value: "value",
    });
  });
});

describe("properties", () => {
  it("should detect property attributes", () => {
    const message = parser.parse("homie/my-device/my-node/my-prop/$name", "Super Prop");
    expect(message).toEqual({
      type: TOPIC_TYPES.DEVICE_NODE_PROPERTY_ATTRIBUTE,
      deviceId: "my-device",
      nodeId: "my-node",
      propertyId: "my-prop",
      attribute: "name",
      value: "Super Prop",
    });
  });

  it("should detect property value", () => {
    const message = parser.parse("homie/my-device/my-node/my-prop", "value");
    expect(message).toEqual({
      type: TOPIC_TYPES.DEVICE_NODE_PROPERTY,
      deviceId: "my-device",
      nodeId: "my-node",
      propertyId: "my-prop",
      value: "value",
    });
  });
});
