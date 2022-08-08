if (!self.__DIP) importScripts('/dip/dip.config.js');

import Message from '../dip.client/message.ts';
import Window from '../dip.client/window.ts';
import Reflect from '../dip.client/reflect.ts';

import Encoding from '../encoding.ts';
import Url from '../rewrite/url.ts';

(function(self:any) {
  let encoding;

  switch(self.__DIP.config.encoding) {
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

  self.__DIP.encodeURL = encoding.encode;
  self.__DIP.decodeURL = encoding.decode;
  self.__DIP.URL = new URL((self.__DIP.decodeURL((location.pathname).split(self.__DIP.config.prefix)[1])+(location.search+location.hash)))

  self.__DIP.location = self.__DIP.URL;

  self.__DIP.url = new Url(self.__DIP);

  Message(self);
  Reflect(self);
  Window(self);

  self.importScripts = new Proxy(self.importScripts, {
    apply(t, g, a) {
      a.forEach((arg, i) => a[i] = self.__DIP.url.encode(arg, self.__DIP.URL))
      console.log(a, 'importScripts');
      return Reflect.apply(t, g, a);
    }
  })

})