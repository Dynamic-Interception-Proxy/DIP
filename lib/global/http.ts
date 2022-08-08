import Request from './http/request';
import Response from './http/response';

class DynamicHttp {
  Request = Request;
  Response = Response;
  
  constructor(ctx: any) {
    this.ctx = ctx;
  }
}

export default DynamicHttp;