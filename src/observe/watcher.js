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

  update() {
    this.get(); // 重新渲染
  }
}

export default Watcher;
