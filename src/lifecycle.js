import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom/index";

function createElm(vnode) {
  const { tag, data, children, text } = vnode;
  if (typeof tag === "string") {
    vnode.el = document.createElement(tag);
    patchProps(vnode.el, data);

    children.forEach((child) => {
      vnode.el.appendChild(createElm(child));
    });
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

function patchProps(el, props) {
  for (const key in props) {
    if (key === "style") {
      for (const styleName in props.style) {
        el.style[styleName] = props.style[styleName];
      }
    } else {
      el.setAttribute(key, props[key]);
    }
  }
}

function patch(oldVNode, vnode) {
  const isRealElement = oldVNode.nodeType;
  if (isRealElement) {
    const elm = oldVNode;
    const parentElm = elm.parentNode;
    const newElm = createElm(vnode);
    parentElm.insertBefore(newElm, elm.nextsibling);
    parentElm.removeChild(elm);
    return newElm;
  } else {
    // diff
  }
}

export function initLifecycle(Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this;
    const el = vm.$el; // 相比 $options.$el 处理过的el
    // 初始化和更新
    vm.$el = patch(el, vnode);
  };
  Vue.prototype._render = function () {
    // 重点
    // 视图中的属性从实例中取值，属性和属兔绑定的地方！！
    return this.$options.render.call(this);
  };
  // _c('div',{},...children)
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments);
  };
  // _v(text)
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments);
  };
  Vue.prototype._s = function (value) {
    // 转字符串
    if (typeof value !== "object") {
      return value;
    }
    return JSON.stringify(value);
  };
}

export function mountComponent(vm, el) {
  vm.$el = el;
  // 1 调用render产生虚拟节点
  // 2 根据虚拟dom产生真实dom
  // 3 插入到el
  //   vm._render(); // vm.$options.render(),返回虚拟节点
  const updateComponent = () => {
    vm._update(vm._render());
  };

  const watcher = new Watcher(vm, updateComponent, true);
  console.log("watcher", watcher);
}

// vue 核心流程
// 1 创造响应式数据
// 2 模板转换成 ast
// 3 将 ast 转成 render 函数
// 4 后续每次数据更新可以只执行 render 函数，无需再转换
