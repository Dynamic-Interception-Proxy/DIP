import { DynamicBundle } from '../global/bundle';

const main: ServiceWorkerGlobalScope = self;

(function(self: any) {
  const __dynamic: DynamicBundle = new DynamicBundle();

  self.__dynamic = __dynamic;
  
  importScripts('/dynamic/dynamic.config.js');
  
  return self.Dynamic = class Dynamic {
    constructor() {}
    middleware = __dynamic.middleware;
  
    fetch({ request }: any) {
      if (!!__dynamic.util.path(request)) return fetch(request);
      if (!__dynamic.util.routePath(request)) return __dynamic.util.route(request);

      console.log(request.url)

      return new Response('df', {});
    }
  }
})(self)