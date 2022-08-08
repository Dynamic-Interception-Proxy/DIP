class HookEvent {
    #intercepted = false;
    #returnValue = null;
    constructor(data = {}, target = null, that = null) {
        this.data = data;
        this.target = target;
        this.that = that;
        var r = this;
        this.respondWith = function(input) {
          r.#returnValue = input;
          r.#intercepted = true;
        };
    };
    get intercepted() {
        return this.#intercepted;
    };
    get returnValue() {
        return this.#returnValue;
    };
};  

export default HookEvent;