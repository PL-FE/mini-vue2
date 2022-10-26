import { initGloalAPI } from "./gloablAPI";
import { initMixin } from "./init";
import { initLifecycle } from "./lifecycle";
import { initStateMixin } from "./state";

function Vue(options) {
  this._init(options);
}

initMixin(Vue); // 扩展init
initLifecycle(Vue); // vm._update vm.render
initGloalAPI(Vue); // 全局API
initStateMixin(Vue); // 实现了 nextTick $watch

export default Vue;
