import Dep from "./dep";

let id = 0;
// 不同实例有不同的 watcher

// 每个属性有一个 dep ，属性是被观察者，watcher 是观察者
class Watcher {
  constructor(vm, fn, options) {
    this.id = id++;
    this.getter = fn;
    this.renderWatch = options;
    /**
     * watch为什么要记住 dep
     * 实现计算属性及清理工作要用到
     * 组件卸载的时候，从dep删除自己，也就是说视图更新与我无关
     */
    this.deps = [];
    this.depsId = new Set();
    this.get();
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

  get() {
    // 需要给每个属性增加dep,目前就时收集 Watcher
    Dep.target = this;
    this.getter();
    Dep.target = null;
  }

  run() {
    this.get();
  }

  update() {
    // this.get(); // 重新渲染 => 变成异步
    queueWatcher(this);
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
