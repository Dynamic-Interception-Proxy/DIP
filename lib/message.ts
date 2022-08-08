export default class Message {
  constructor(origin) {
    this.__origin = origin;
  }
  get origin() {
    return this.__origin;
  }
}