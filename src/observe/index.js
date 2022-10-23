import { newArrayProto } from "./array";
import Dep from "./dep";

class Observe {
  constructor(data) {
    // 给每个对象都增加收集功能
    this.dep = new Dep();

    // Object.defineProperty 只能劫持已经存在的属性
    // data.__ob__ = this; 给数据加了辨识，如果数据有了ob，说明被观察过了
    Object.defineProperty(data, "__ob__", {
      value: this,
      enumerable: false, // 不可枚举，防止无限递归
    });
    if (Array.isArray(data)) {
      // 因为数组很少用 list[887]下标，所以为了节省性能，使用数组劫持来进行响应式,
      // 重新给七个变异方法，push\unshift\pop\shift\reverse\splice
      data.__proto__ = newArrayProto;
      this.observeArray(data);
    } else {
      this.walk(data);
    }
  }
  walk(data) {
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
  }

  observeArray(data) {
    // 劫持数组内的对象
    data.forEach((item) => observe(item));
  }
}

// 深层次会递归，不存在的监控不到，存在的要重写方法。
function dependArray(value) {
  for (let i = 0; i < value.length; i++) {
    const current = value[i];
    current.__ob__ && current.__ob__.dep.depend();
    if (Array.isArray(current)) {
      dependArray(current);
    }
  }
}

function defineReactive(target, key, value) {
  const childOb = observe(value); //递归劫持对象
  const dep = new Dep(); // 每一个属性都有一个 dep
  Object.defineProperty(target, key, {
    get() {
      if (Dep.target) {
        dep.depend(); // 属性搜集watch
        if (childOb) {
          childOb.dep.depend(); // 让数组和对象本身也实现依赖收集
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value;
    },
    set(newValue) {
      if (newValue === value) {
        return;
      }
      value = newValue;
      dep.notify();
    },
  });
}
export function observe(data) {
  if (typeof data !== "object" || data == null) {
    return; //只对对象劫持
  }
  if (data.__ob__ instanceof Observe) {
    return data.__ob__;
  }

  // 如果对象被劫持过了，就不劫持了，可以增添一个实例
  return new Observe(data);
}
