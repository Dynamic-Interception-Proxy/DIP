function route(request: Request) {
  var parsed = this.ctx.modules.url.parse(request.url);
  var query = this.ctx.modules.querystring.parse(parsed.query);

  //console.log(query.url)
}

function routePath({ url }: Request) {
  return !(url.toString().substr(location.origin.length, (this.ctx.config.prefix+'route').length).startsWith(this.ctx.config.prefix+'route'));
}

export { route, routePath };