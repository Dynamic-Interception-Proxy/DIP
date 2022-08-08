import * as mime from 'mime';
import * as path from 'path-browserify';
import * as idb from 'idb';
//import * as querystring from 'querystring';
import { P5parse, P5serialize } from 'parse5';
import { parse as jsParse } from 'meriyah';
import { ESgenerate } from 'escodegen';
import * as bare from '@tomphttp/bare-client';
import * as url from 'url';

class DynamicModules {
  mime = mime;
  idb = idb;
  path = path;
  //querystring = querystring;
  url = url;
  meriyah = { parse: jsParse };
  escodegen = { generate: ESgenerate }
  parse5 = { parse: P5parse, serialize: P5serialize };
  bare = bare;

  constructor(ctx) {
    this.ctx = ctx;
  }
}

export default DynamicModules;