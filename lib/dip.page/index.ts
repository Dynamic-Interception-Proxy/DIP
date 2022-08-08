import Encoding from '../encoding.ts';

let encoding;

switch(window.__DIP.config.encoding) {
  case "xor":
    encoding = Encoding.xor;
    break;
  case "plain":
    encoding = Encoding.plain;
    break;
  case "base64":
    encoding = Encoding.base64;
    break;
  case "shuffle":
  default:
    encoding = Encoding.plain;
    break;
}

window.__DIP.encodeURL = encoding.encode;
window.__DIP.decodeURL = encoding.decode;