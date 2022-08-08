import DynamicModules from './modules';
import DynamicRewrites from './rewrite';
//import DynamicUtil from './util';
import DynamicUrlRewriter from './url';
//import DynamicMeta from './meta';
//import DynamicHttp from './http';

class DynamicBundle {
  //util = new DynamicUtil(this);
  //http = new DynamicHttp(this);
  //meta = new DynamicMeta(this);
  modules = new DynamicModules(this);
  rewrite = new DynamicRewrites(this);
  url = new DynamicUrlRewriter(this);
  
  constructor() {};
}

export { DynamicBundle, DynamicModules, DynamicRewrites, DynamicUtil };