import { observe } from "./observe/index";

export function initState(vm) {
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
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
