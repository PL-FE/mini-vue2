import { initGloalAPI } from "./gloablAPI";
import { initMixin } from "./init";
import { initLifecycle } from "./lifecycle";
import Watcher, { nextTick } from "./observe/watcher";

function Vue(options) {
  this._init(options);
}
initMixin(Vue);
initLifecycle(Vue);
initGloalAPI(Vue);
Vue.prototype.$nextTick = nextTick;
Vue.prototype.$watch = function (exprorFn, cb) {
  new Watcher(this, exprorFn, { user: true }, cb);
};

export default Vue;
