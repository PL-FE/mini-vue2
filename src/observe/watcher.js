import Dep, { popTarget, pushTarget } from "./dep";

let id = 0;
// 不同实例有不同的 watcher

// 每个属性有一个 dep ，属性是被观察者，watcher 是观察者
class Watcher {
  constructor(vm, exprOrFn, options, cb) {
    this.id = id++;
    this.renderWatcher = options;
    if (typeof exprOrFn === "string") {
      this.getter = function () {
        return vm[exprOrFn];
      };
    } else {
      this.getter = exprOrFn;
    }
    /**
     * watch为什么要记住 dep
     * 实现计算属性及清理工作要用到
     * 组件卸载的时候，从dep删除自己，也就是说视图更新与我无关
     */
    this.deps = [];
    this.depsId = new Set();
    this.lazy = options.lazy;
    this.cb = cb;
    this.dirty = this.lazy;
    this.value = this.lazy ? null : this.get();
    this.vm = vm;
    this.user = options.user; // 是否是用户自己
  }

  addDep(dep) {
    // 一个组件对应多个属性，重复的属性也不用记录
    const id = dep.id;
    if (!this.depsId.has(id)) {
      this.deps.push(dep);
      this.depsId.add(id);
      dep.addSub(this);
    }
  }

  evaluate() {
    this.value = this.get();
    this.dirty = false;
  }

  get() {
    // 需要给每个属性增加dep,目前就时收集 Watcher
    pushTarget(this); // Dep.target = this 的增强;
    const value = this.getter.call(this.vm);
    popTarget(); // Dep.target = null 的增强;
    return value;
  }

  run() {
    const oldValue = this.value;
    const newValue = this.get();
    this.value = newValue;
    if (this.user) {
      this.cb.call(this.vm, newValue, oldValue);
    }
  }

  depend() {
    let i = this.deps.length;
    // 因为开始有2个watcher  1渲染watcher 2计算属性watcher
    // 当计算属性出栈后，只剩下渲染watcher，所以让计算属性依赖的属性都去记住这个渲染wacther，用于重新渲染
    while (i--) {
      this.deps[i].depend(); // 让计算属性 watcher 也收集渲染watcher
    }
  }

  update() {
    if (this.lazy) {
      this.dirty = true;
    } else {
      // this.get(); // 重新渲染 => 变成异步
      queueWatcher(this);
    }
  }
}

let queue = [];
let has = {};
let pending = false; // 防抖

function flushSchedulerQueue() {
  const fulshQueue = queue.slice();
  queue = [];
  has = {};
  pending = false;
  fulshQueue.forEach((q) => q.run()); // 过程中有新的 可以继续放进去 queue
}

function queueWatcher(watcher) {
  const id = watcher.id;
  if (!has[id]) {
    queue.push(watcher);
    has[id] = true;
    if (!pending) {
      nextTick(flushSchedulerQueue);
      pending = true;
    }
  }
}

let callbacks = [];
let waiting = false;
function flushCallbacks() {
  let cbs = callbacks.slice(0);
  waiting = false;
  callbacks = [];
  cbs.forEach((cb) => cb());
}

/**
 * nextTick
 * 不是创建异步任务，而是维护到异步队列中
 * nextTick 没有直接使用某个 api ，采用优雅降级
 * 1 内部先采用 Promise(ie不兼容) 微任务是本轮渲染前执行
 * 2 MutationObserver(h5的api)
 * 3 setImmediate (ie独有)
 * 4 setTimeout
 */
let timerFunc;
if (Promise) {
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks);
  };
} else if (MutationObserver) {
  const observe = new MutationObserver(flushCallbacks);
  const textNode = observe.createTextNode(1);
  observe.observe(textNode, {
    characterData: true,
  });
  timerFunc = () => {
    textNode.textContent = 2;
  };
} else if (setTmmediate) {
  timerFunc = () => {
    setTmmediate(flushCallbacks);
  };
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks);
  };
}

export function nextTick(cb) {
  callbacks.push(cb);
  if (!waiting) {
    timerFunc();
    waiting = true;
  }
}

export default Watcher;
