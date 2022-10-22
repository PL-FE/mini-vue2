import { mergeOpions } from "./utils";

export function initGloalAPI(Vue) {
  // 静态方法
  Vue.options = {};
  Vue.mixin = function (mixin) {
    this.options = mergeOpions(this.options, mixin);
    return this;
  };
}
