import { EventEmitter } from "events";

export class EventBus {
  static #instance: EventEmitter;

  public static get emitter(): EventEmitter {
    if (!EventBus.#instance) {
      EventBus.#instance = new EventEmitter();
    }
    return EventBus.#instance;
  }
}
