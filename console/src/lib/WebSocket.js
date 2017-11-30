import EventEmitter from "eventemitter3";

export default class WebSocket extends EventEmitter {
  stopped = false;
  retry = 0;
  maxRetry = 5;
  constructor(url) {
    super();
    this.url = url;
  }

  start() {
    this.stopped = false;
    this.ws = new window.WebSocket(this.url);

    this.ws.onopen = (event) => {
      this.emit("open", event);
    };

    this.ws.onclose = (event) => {
      this.emit("close", event);
      if (!this.stopped) {
        this.emit("reconnect", { count: this.retry });
        setTimeout(() => {
          if (this.retry < this.maxRetry) {
            this.start();
            this.retry = this.retry + 1;
          } else {
            this.retry = 0;
            this.stopped = true;
            this.emit("reconnect_failed");
          }
        }, 2000);
      }
    };

    this.ws.onerror = (error) => {
      this.emit("error", error);
    };

    this.ws.onmessage = (event) => {
      this.emit("message", JSON.parse(event.data));
    };
  }

  stop() {
    if (this.ws) this.ws.close();
    this.retry = 0;
    this.stopped = true;
  }

  send(message) {
    this.ws.send(message);
  }
}
