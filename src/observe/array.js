const oldArrayProto = Array.prototype; // 获取数组原型

export const newArrayProto = Object.create(oldArrayProto);

const methods = [
  "push",
  "pop",
  "shift",
  "unshift",
  "sort",
  "splice",
  "reverse",
];

methods.forEach((method) => {
  newArrayProto[method] = function (...args) {
    const result = oldArrayProto[method].apply(this, args); // 内部调用原来的方法
    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "unshift":
        inserted = args.slice(2);
        break;

      default:
        break;
    }

    if (inserted) {
      this.__ob__.observeArray(inserted);
    }
    this.__ob__.dep.notify();
    return result;
  };
});
