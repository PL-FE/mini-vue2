import { watch } from "rollup";
import Dep from "./observe/dep";
import { observe } from "./observe/index";
import Watcher from "./observe/watcher";

export function initState(vm) {
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }
  if (opts.computed) {
    initComputed(vm);
  }
}

function proxy(vm, taregt, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[taregt][key];
    },
    set(newValue) {
      vm[taregt][key] = newValue;
    },
  });
}

function initData(vm) {
  let data = vm.$options.data;
  data = typeof data === "function" ? data.call(vm) : data;
  vm._data = data;
  observe(data);
  //   将vm._data用vm代理
  for (const key in data) {
    proxy(vm, "_data", key);
  }
}

function initComputed(vm) {
  const computed = vm.$options.computed;
  const watchers = (vm._computedWatchers = {});
  console.log("computed", computed);
  for (const key in computed) {
    const userDef = computed[key];
    const fn = typeof userDef === "function" ? userDef : userDef.get;

    // 直接new的时候会直接执行，加了lazy变成非立即执行
    watchers[key] = new Watcher(vm, fn, { lazy: true });

    defineComputed(vm, key, userDef);
  }
}

function defineComputed(target, key, userDef) {
  const setter = userDef.set || (() => {});
  Object.defineProperty(target, key, {
    get: createProperty(key),
    set: setter,
  });
}

function createProperty(key) {
  // 检测是否要执行getter
  return function () {
    const watcher = this._computedWatchers[key]; // 获取对应属性的 watcher
    if (watcher.dirty) {
      // 如果是脏的，就执行用户的fn
      watcher.evaluate();
    }
    if (Dep.target) {
      // 计算属性出栈后，还有渲染watcher没出，所以应该让计算属性记住渲染watcher
      watcher.depend();
    }
    return watcher.value;
  };
}
