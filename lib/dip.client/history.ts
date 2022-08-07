export default class HistoryProxy {
    proxy:any = {};
    constructor(proxy:any) {
        this.proxy = proxy
    }
    apply(t:any, g:any, a:any) {
        if (a[2]) a[2] = this.proxy.url.encode(a[2], this.proxy.meta.url)
        var t = Reflect.apply(t, g, a)

        this.proxy.Location(this.proxy.url.decode(a[2]))
      
        return t;
    }
}