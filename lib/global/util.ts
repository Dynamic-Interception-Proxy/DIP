import { route, routePath } from './util/route';
import path from './util/path';

class DynamicUtil {
  route = route;
  routePath = routePath;
  path = path;
  
  constructor(ctx: any) {
    this.ctx = ctx;
  }
}

export default DynamicUtil;