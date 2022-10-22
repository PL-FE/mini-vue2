import { compileToFuntion } from "./compile/index";
import { callHook, mountComponent } from "./lifecycle";
import { initState } from "./state";
import { mergeOpions } from "./utils";

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    // 实例与Vue合并
    // 实例的constructor是Vue,this.constructor.options = Vue.options
    vm.$options = mergeOpions(this.constructor.options, options);
    console.log("vm.$options", vm.$options);
    callHook(vm, "beforeCreate");
    // 初始化状态
    initState(vm);
    callHook(vm, "created");

    if (options.el) {
      vm.$mount("#app");
    }
  };

  Vue.prototype.$mount = function (el) {
    const vm = this;
    el = document.querySelector(el);
    const ops = vm.$options;
    if (!ops.render) {
      // 先看有没有render
      let template; // 是否写了 template，没有写template采用外部
      if (!ops.template && el) {
        // 没有写template，但是写了el
        template = el.outerHTML;
      } else {
        if (el) {
          template = ops.template;
        }
      }
      if (template) {
        const render = compileToFuntion(template);
        ops.render = render;
      }
    }
    ops.render; // 最终拿到render方法
    console.log("ops.render", ops.render);
    mountComponent(vm, el);
  };
}
