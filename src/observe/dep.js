let id = 0;
class Dep {
  constructor() {
    this.id = id++; // 属性的 Dep 要收集 Watcher
    this.subs = []; // 存放当前属性对应的 Watcher
  }

  depend() {
    // 需要去除重复 Watcher,当前时单向关系， dep 记住 watcher
    // this.subs.push(Dep.target); // 这段代码在 Dep.target.addDep 实现了
    // 代码旅程 dep.js (depend) => watcher.js (addDep)=> dep.js (addSub)
    // 目的是为了 在 watcher.js (addDep) 中去重
    Dep.target.addDep(this); // 让 watcher记住 dep
  }

  addSub(watcher) {
    this.subs.push(watcher);
  }

  notify() {
    this.subs.forEach((watcher) => watcher.update());
  }
}
Dep.target = null;

export default Dep;
