import Encode from './url/encode';
import Decode from './url/decode';

class DynamicUrlRewriter {
  encode = Encode;
  decode = Decode;
  
  constructor(ctx: any) {
    this.ctx = ctx;
  }
}

export default DynamicUrlRewriter;