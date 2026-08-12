import {
  HttpClient,
  HttpEventType
} from "./chunk-FJCNOP4D.js";
import "./chunk-AGX4JAZV.js";
import {
  Injectable,
  setClassMetadata,
  ɵɵdefineInjectable,
  ɵɵinject
} from "./chunk-SXMDN6KF.js";
import "./chunk-D3G2OPNT.js";
import "./chunk-LVZZ6TEX.js";
import {
  delay,
  repeatWhen,
  retryWhen,
  takeWhile,
  tap
} from "./chunk-52B5GR3Z.js";
import {
  Observable
} from "./chunk-U44CO7MJ.js";

// node_modules/ngx-sse-client/fesm2022/ngx-sse-client.mjs
var defaultSseOptions = {
  keepAlive: true,
  reconnectionDelay: 3e3,
  responseType: "event"
};
var defaultRequestOptions = {
  observe: "events",
  reportProgress: true,
  responseType: "text"
};
var SseClientSubscriber = class _SseClientSubscriber {
  httpClient;
  sseOptions;
  httpClientOptions;
  url;
  method;
  static SEPARATOR = ":";
  progress = 0;
  chunk = "";
  constructor(httpClient, sseOptions, httpClientOptions, url, method) {
    this.httpClient = httpClient;
    this.sseOptions = sseOptions;
    this.httpClientOptions = httpClientOptions;
    this.url = url;
    this.method = method;
  }
  createObservable() {
    return new Observable((observer) => {
      const subscription = this.subscribeStreamRequest(this.url, this.sseOptions, this.httpClientOptions, this.method, observer);
      return () => subscription.unsubscribe();
    });
  }
  subscribeStreamRequest(url, options, requestOptions, method, observer) {
    return this.httpClient.request(method, url, requestOptions).pipe(repeatWhen((completed) => this.repeatWhen(completed, options.keepAlive, options.reconnectionDelay))).pipe(retryWhen((error) => this.retryWhen(error, options.keepAlive, options.reconnectionDelay, observer))).subscribe((event) => this.parseStreamEvent(event, observer));
  }
  repeatWhen(completed, keepAlive, reconnectionDelay) {
    return completed.pipe(takeWhile(() => keepAlive)).pipe(delay(reconnectionDelay));
  }
  retryWhen(attempts, keepAlive, reconnectionDelay, observer) {
    return attempts.pipe(tap((error) => this.threatRequestError(error, observer))).pipe(takeWhile(() => keepAlive)).pipe(delay(reconnectionDelay));
  }
  threatRequestError(event, observer) {
    this.dispatchStreamData(this.errorEvent(event), observer);
    if (!this.isValidStatus(event.status)) {
      observer.error(event);
    }
  }
  isValidStatus(status) {
    return status !== void 0 && status !== null && status <= 299;
  }
  parseStreamEvent(event, observer) {
    if (event.type === HttpEventType.Sent) {
      this.progress = 0;
      return;
    }
    if (event.type === HttpEventType.DownloadProgress) {
      this.onStreamProgress(event.partialText, observer);
      return;
    }
    if (event.type === HttpEventType.Response) {
      this.onStreamCompleted(event, observer);
      return;
    }
  }
  onStreamProgress(data, observer) {
    data = data.substring(this.progress);
    this.progress += data.length;
    data.split(/(\r\n|\r|\n){2}/g).forEach((part) => this.parseEventData(part, observer));
  }
  onStreamCompleted(response, observer) {
    this.onStreamProgress(response.body, observer);
    this.dispatchStreamData(this.parseEventChunk(this.chunk), observer);
    this.chunk = "";
    this.progress = 0;
    this.dispatchStreamData(this.errorEvent(), observer);
  }
  parseEventData(part, observer) {
    if (part.trim().length === 0) {
      this.dispatchStreamData(this.parseEventChunk(this.chunk), observer);
      this.chunk = "";
    } else {
      this.chunk += part;
    }
  }
  parseEventChunk(chunk) {
    if (!chunk || chunk.length === 0)
      return;
    const chunkEvent = {
      id: void 0,
      data: "",
      event: "message"
    };
    chunk.split(/\n|\r\n|\r/).forEach((line) => this.parseChunkLine(line.trim(), chunkEvent));
    return this.messageEvent(chunkEvent.event, {
      lastEventId: chunkEvent.id,
      data: chunkEvent.data
    });
  }
  parseChunkLine(line, event) {
    const index = line.indexOf(_SseClientSubscriber.SEPARATOR);
    if (index <= 0)
      return;
    const field = line.substring(0, index);
    if (Object.keys(event).findIndex((key) => key === field) === -1)
      return;
    let data = line.substring(index + 1).replace(/^\s/, "");
    if (field === "data")
      data = event.data + data;
    event[field] = data;
  }
  dispatchStreamData(event, observer) {
    if (!this.validEvent(event))
      return;
    if (this.sseOptions.responseType === "event") {
      observer.next(event);
    } else {
      observer.next(event.data);
    }
  }
  validEvent(event) {
    if (!event)
      return false;
    if (event.type === "error" && this.sseOptions.responseType !== "event")
      return false;
    if (event.type !== "error" && (!event.data || !event.data.length))
      return false;
    return true;
  }
  messageEvent(type, options) {
    return new MessageEvent(type, options);
  }
  errorEvent(error) {
    let eventData;
    if (error && error.status > 0) {
      eventData = {
        error,
        message: error.message
      };
      if (!this.isValidStatus(error.status)) {
        eventData["status"] = error.status;
        eventData["statusText"] = error.statusText;
      }
    }
    return new ErrorEvent("error", eventData);
  }
};
var SseClient = class _SseClient {
  httpClient;
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  stream(url, options, requestOptions, method = "GET") {
    var sseOptions = Object.assign({}, defaultSseOptions, options);
    var httpClientOptions = Object.assign({}, requestOptions, defaultRequestOptions);
    return new SseClientSubscriber(this.httpClient, sseOptions, httpClientOptions, url, method).createObservable();
  }
  static ɵfac = function SseClient_Factory(t) {
    return new (t || _SseClient)(ɵɵinject(HttpClient));
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _SseClient,
    factory: _SseClient.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SseClient, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{
    type: HttpClient
  }], null);
})();
export {
  SseClient,
  defaultRequestOptions,
  defaultSseOptions
};
//# sourceMappingURL=ngx-sse-client.js.map
