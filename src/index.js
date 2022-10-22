import { initGloalAPI } from "./gloablAPI";
import { initMixin } from "./init";
import { initLifecycle } from "./lifecycle";
import { nextTick } from "./observe/watcher";

function Vue(options) {
  this._init(options);
}
initMixin(Vue);
initLifecycle(Vue);
initGloalAPI(Vue);
Vue.prototype.$nextTick = nextTick;

export default Vue;
