(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('rollup')) :
  typeof define === 'function' && define.amd ? define(['rollup'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  var strats = {};
  var LIFECYCLE = ["beforeCreate", "created"];
  LIFECYCLE.forEach(function (hook) {
    strats[hook] = function (p, c) {
      if (c) {
        // 如果儿子有 父亲有，他们拼在一起
        if (p) {
          return p.concat(c);
        } else {
          return [c]; // 儿子有 父亲没有 将儿子包装成数组
        }
      } else {
        return p; // 儿子没有则用父亲的
      }
    };
  });

  function mergeOpions(parent, child) {
    var options = [];
    for (var key in parent) {
      mergeFiled(key);
    }
    for (var _key in child) {
      if (!parent.hasOwnProperty(_key)) {
        mergeFiled(_key);
      }
    }
    function mergeFiled(key) {
      if (strats[key]) {
        options[key] = strats[key](parent[key], child[key]);
      } else {
        options[key] = child[key] || parent[key];
      }
    }
    return options;
  }

  function initGloalAPI(Vue) {
    // 静态方法
    Vue.options = {};
    Vue.mixin = function (mixin) {
      this.options = mergeOpions(this.options, mixin);
      return this;
    };
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var ncname = "[a-zA-Z][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 匹配到的分组是一个开始标签名，如 <div 或带命名空间的 <div:xxx，注意不带 > 符号
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配的是结束标签，如 </div>
  // 匹配属性，第一个分组是属性的 key，第二个分组是 = 号，第三、四、五分组是属性的 value 值
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  var startTagClose = /^\s*(\/?)>/; // 匹配开始标签的 > 符号或自闭和标签，如 <div> 中的 > 或 <br />
  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配 {{}} 表达式，如 {{ name }}

  // vue3 采用的不是正则
  // 对模板进行编译
  function parseHTML(html) {
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var stack = [];
    var currentParent;
    var root;
    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }
    function start(tag, attrs) {
      var node = createASTElement(tag, attrs);
      if (!root) {
        root = node;
      }
      if (currentParent) {
        node.parent = currentParent;
        currentParent.children.push(node);
      }
      stack.push(node);
      currentParent = node;
    }
    function chars(text) {
      text = text.replace(/\s/g, "");
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }
    function end(tag) {
      stack.pop(); // 弹出最后一个
      currentParent = stack[stack.length - 1];
    }
    function advance(n) {
      html = html.substring(n);
    }
    function parseStartTag() {
      var start = html.match(startTagOpen);
      if (start) {
        var match = {
          tagName: start[1],
          // 标签名
          attrs: []
        };
        advance(start[0].length);
        var attr, _end;
        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
        }
        _end && advance(_end[0].length);
        return match;
      }
    }
    while (html) {
      var textEnd = html.indexOf("<");
      if (textEnd === 0) {
        var startTagMatch = parseStartTag();
        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }
        var endtagMatch = html.match(endTag);
        if (endtagMatch) {
          advance(endtagMatch[0].length);
          end(endtagMatch[1]);
          continue;
        }
      }
      if (textEnd > 0) {
        var text = html.substring(0, textEnd); // 文本内容
        if (text) {
          advance(text.length);
          chars(text);
        }
      }
    }
    return root;
  }

  function genProps(attrs) {
    var str = ""; // {name,value}
    for (var index = 0; index < attrs.length; index++) {
      var attr = attrs[index];
      if (attr.name === "style") {
        (function () {
          // color:red => {color:'red'}
          var obj = {};
          attr.value.split(";").forEach(function (item) {
            var _item$split = item.split(":"),
              _item$split2 = _slicedToArray(_item$split, 2),
              key = _item$split2[0],
              value = _item$split2[1];
            obj[key] = value;
          });
          attr.value = obj;
        })();
      }
      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ","); // a:b,c:d
    }

    return "{".concat(str.slice(0, -1), "}");
  }
  function gen(node) {
    if (node.type === 1) {
      // 如果是元素
      return codegen(node);
    } else {
      // 文本
      var text = node.text;
      if (!defaultTagRE.test(text)) {
        // 不是普通文本，即是模板文本时
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        // 普通文本
        var tokens = [];
        var match;
        defaultTagRE.lastIndex = 0;
        var lastIndex = 0;
        while (match = defaultTagRE.exec(text)) {
          var index = match.index;
          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }
          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }
        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return "_v(".concat(tokens.join("+"), ")");
      }
    }
  }
  function genChildren(children) {
    return children.map(function (child) {
      return gen(child);
    }).join(",");
  }
  function codegen(ast) {
    var children = genChildren(ast.children);
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : "null").concat(ast.children.length ? ",".concat(children) : "", ")");
    return code;
  }
  function compileToFuntion(template) {
    // 1. 将 template 转换成语法树
    // 2. 生成 render 方法，执行后返回的结果是虚拟 DOM
    var ast = parseHTML(template);
    var code = codegen(ast);

    // let obj = { a: 1 };
    // with (obj) {
    //   console.log("a", a);
    // }
    code = "with(this){return ".concat(code, "}");
    // function render() {
    //   with (this) {
    //     return _c(
    //       "div",
    //       { id: "app", style: { color: "red", background: "yellow" } },
    //       _c(
    //         "div",
    //         { style: { color: "green" } },
    //         _v(_s(name) + "HHH" + _s(age))
    //       ),
    //       _c("span", null, _v("World"))
    //     );
    //   }
    // }
    // render.call(vm) // 调用
    var render = new Function(code);
    return render;
  }

  var id$1 = 0;
  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);
      this.id = id$1++; // 属性的 Dep 要收集 Watcher
      this.subs = []; // 存放当前属性对应的 Watcher
    }
    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // 需要去除重复 Watcher,当前时单向关系， dep 记住 watcher
        // this.subs.push(Dep.target); // 这段代码在 Dep.target.addDep 实现了
        // 代码旅程 dep.js (depend) => watcher.js (addDep)=> dep.js (addSub)
        // 目的是为了 在 watcher.js (addDep) 中去重
        Dep.target.addDep(this); // 让 watcher记住 dep
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);
    return Dep;
  }();
  Dep.target = null;

  // 能记住多个watcher
  var stack = [];
  function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
  }
  function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  var id = 0;
  // 不同实例有不同的 watcher

  // 每个属性有一个 dep ，属性是被观察者，watcher 是观察者
  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, fn, options) {
      _classCallCheck(this, Watcher);
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
      this.lazy = options.lazy;
      this.dirty = this.lazy;
      this.dirty ? null : this.get();
      this.value;
      this.vm = vm;
    }
    _createClass(Watcher, [{
      key: "addDep",
      value: function addDep(dep) {
        // 一个组件对应多个属性，重复的属性也不用记录
        var id = dep.id;
        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this);
        }
      }
    }, {
      key: "evaluate",
      value: function evaluate() {
        this.value = this.get();
        this.dirty = false;
      }
    }, {
      key: "get",
      value: function get() {
        // 需要给每个属性增加dep,目前就时收集 Watcher
        pushTarget(this); // Dep.target = this 的增强;
        var value = this.getter.call(this.vm);
        popTarget(); // Dep.target = null 的增强;
        return value;
      }
    }, {
      key: "run",
      value: function run() {
        this.get();
      }
    }, {
      key: "depend",
      value: function depend() {
        var i = this.deps.length;
        // 因为开始有2个watcher  1渲染watcher 2计算属性watcher
        // 当计算属性出栈后，只剩下渲染watcher，所以让计算属性依赖的属性都去记住这个渲染wacther，用于重新渲染
        while (i--) {
          this.deps[i].depend(); // 让计算属性 watcher 也收集渲染watcher
        }
      }
    }, {
      key: "update",
      value: function update() {
        if (this.lazy) {
          this.dirty = true;
        } else {
          // this.get(); // 重新渲染 => 变成异步
          queueWatcher(this);
        }
      }
    }]);
    return Watcher;
  }();
  var queue = [];
  var has = {};
  var pending = false; // 防抖

  function flushSchedulerQueue() {
    var fulshQueue = queue.slice();
    queue = [];
    has = {};
    pending = false;
    fulshQueue.forEach(function (q) {
      return q.run();
    }); // 过程中有新的 可以继续放进去 queue
  }

  function queueWatcher(watcher) {
    var id = watcher.id;
    if (!has[id]) {
      queue.push(watcher);
      has[id] = true;
      if (!pending) {
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
  }
  var callbacks = [];
  var waiting = false;
  function flushCallbacks() {
    var cbs = callbacks.slice(0);
    waiting = false;
    callbacks = [];
    cbs.forEach(function (cb) {
      return cb();
    });
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
  var timerFunc;
  if (Promise) {
    timerFunc = function timerFunc() {
      Promise.resolve().then(flushCallbacks);
    };
  } else if (MutationObserver) {
    var observe$1 = new MutationObserver(flushCallbacks);
    var textNode = observe$1.createTextNode(1);
    observe$1.observe(textNode, {
      characterData: true
    });
    timerFunc = function timerFunc() {
      textNode.textContent = 2;
    };
  } else if (setTmmediate) {
    timerFunc = function timerFunc() {
      setTmmediate(flushCallbacks);
    };
  } else {
    timerFunc = function timerFunc() {
      setTimeout(flushCallbacks);
    };
  }
  function nextTick(cb) {
    callbacks.push(cb);
    if (!waiting) {
      timerFunc();
      waiting = true;
    }
  }

  // h() _c
  function createElementVNode(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    if (data == null) {
      data = {};
    }
    var key = data.key;
    if (key) {
      delete data.key;
    }
    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }
    return vnode(vm, tag, key, data, children);
  }

  // _v()
  function createTextVNode(vm, text) {
    return vnode(vm, null, null, null, null, text);
  }

  // vdom 描述dom元素，增加一些自定义属性
  function vnode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
    };
  }

  function createElm(vnode) {
    var tag = vnode.tag,
      data = vnode.data,
      children = vnode.children,
      text = vnode.text;
    if (typeof tag === "string") {
      vnode.el = document.createElement(tag);
      patchProps(vnode.el, data);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }
    return vnode.el;
  }
  function patchProps(el, props) {
    for (var key in props) {
      if (key === "style") {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(key, props[key]);
      }
    }
  }
  function patch(oldVNode, vnode) {
    var isRealElement = oldVNode.nodeType;
    if (isRealElement) {
      var elm = oldVNode;
      var parentElm = elm.parentNode;
      var newElm = createElm(vnode);
      parentElm.insertBefore(newElm, elm.nextsibling);
      parentElm.removeChild(elm);
      return newElm;
    }
  }
  function initLifecycle(Vue) {
    Vue.prototype._update = function (vnode) {
      var vm = this;
      var el = vm.$el; // 相比 $options.$el 处理过的el
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
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    // _v(text)
    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._s = function (value) {
      // 转字符串
      if (_typeof(value) !== "object") {
        return value;
      }
      return JSON.stringify(value);
    };
  }
  function mountComponent(vm, el) {
    vm.$el = el;
    // 1 调用render产生虚拟节点
    // 2 根据虚拟dom产生真实dom
    // 3 插入到el
    //   vm._render(); // vm.$options.render(),返回虚拟节点
    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    };
    new Watcher(vm, updateComponent, true);
  }

  // vue 核心流程
  // 1 创造响应式数据
  // 2 模板转换成 ast
  // 3 将 ast 转成 render 函数
  // 4 后续每次数据更新可以只执行 render 函数，无需再转换

  function callHook(vm, hook) {
    var handlers = vm.$options[hook];
    if (handlers) {
      handlers.forEach(function (handler) {
        return handler.call(vm);
      });
    }
  }

  var oldArrayProto = Array.prototype; // 获取数组原型

  var newArrayProto = Object.create(oldArrayProto);
  var methods = ["push", "pop", "shift", "unshift", "sort", "splice", "reverse"];
  methods.forEach(function (method) {
    newArrayProto[method] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var result = oldArrayProto[method].apply(this, args); // 内部调用原来的方法
      var inserted;
      switch (method) {
        case "push":
        case "unshift":
          inserted = args;
          break;
        case "unshift":
          inserted = args.slice(2);
          break;
      }
      if (inserted) {
        this.__ob__.observeArray(inserted);
      }
      this.__ob__.dep.notify();
      return result;
    };
  });

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);
      // 给每个对象都增加收集功能
      this.dep = new Dep();

      // Object.defineProperty 只能劫持已经存在的属性
      // data.__ob__ = this; 给数据加了辨识，如果数据有了ob，说明被观察过了
      Object.defineProperty(data, "__ob__", {
        value: this,
        enumerable: false // 不可枚举，防止无限递归
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
    _createClass(Observe, [{
      key: "walk",
      value: function walk(data) {
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        // 劫持数组内的对象
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);
    return Observe;
  }(); // 深层次会递归，不存在的监控不到，存在的要重写方法。
  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var current = value[i];
      current.__ob__ && current.__ob__.dep.depend();
      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
  }
  function defineReactive(target, key, value) {
    var childOb = observe(value); //递归劫持对象
    var dep = new Dep(); // 每一个属性都有一个 dep
    Object.defineProperty(target, key, {
      get: function get() {
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
      set: function set(newValue) {
        if (newValue === value) {
          return;
        }
        value = newValue;
        dep.notify();
      }
    });
  }
  function observe(data) {
    if (_typeof(data) !== "object" || data == null) {
      return; //只对对象劫持
    }

    if (data.__ob__ instanceof Observe) {
      return data.__ob__;
    }

    // 如果对象被劫持过了，就不劫持了，可以增添一个实例
    return new Observe(data);
  }

  function initState(vm) {
    var opts = vm.$options;
    if (opts.data) {
      initData(vm);
    }
    if (opts.computed) {
      initComputed(vm);
    }
  }
  function proxy(vm, taregt, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[taregt][key];
      },
      set: function set(newValue) {
        vm[taregt][key] = newValue;
      }
    });
  }
  function initData(vm) {
    var data = vm.$options.data;
    data = typeof data === "function" ? data.call(vm) : data;
    vm._data = data;
    observe(data);
    //   将vm._data用vm代理
    for (var key in data) {
      proxy(vm, "_data", key);
    }
  }
  function initComputed(vm) {
    var computed = vm.$options.computed;
    var watchers = vm._computedWatchers = {};
    console.log("computed", computed);
    for (var key in computed) {
      var userDef = computed[key];
      var fn = typeof userDef === "function" ? userDef : userDef.get;

      // 直接new的时候会直接执行，加了lazy变成非立即执行
      watchers[key] = new Watcher(vm, fn, {
        lazy: true
      });
      defineComputed(vm, key, userDef);
    }
  }
  function defineComputed(target, key, userDef) {
    var setter = userDef.set || function () {};
    Object.defineProperty(target, key, {
      get: createProperty(key),
      set: setter
    });
  }
  function createProperty(key) {
    // 检测是否要执行getter
    return function () {
      var watcher = this._computedWatchers[key]; // 获取对应属性的 watcher
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

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
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
      var vm = this;
      el = document.querySelector(el);
      var ops = vm.$options;
      if (!ops.render) {
        // 先看有没有render
        var template; // 是否写了 template，没有写template采用外部
        if (!ops.template && el) {
          // 没有写template，但是写了el
          template = el.outerHTML;
        } else {
          if (el) {
            template = ops.template;
          }
        }
        if (template) {
          var render = compileToFuntion(template);
          ops.render = render;
        }
      }
      ops.render; // 最终拿到render方法
      console.log("ops.render", ops.render);
      mountComponent(vm, el);
    };
  }

  function Vue(options) {
    this._init(options);
  }
  initMixin(Vue);
  initLifecycle(Vue);
  initGloalAPI(Vue);
  Vue.prototype.$nextTick = nextTick;

  return Vue;

}));
//# sourceMappingURL=vue.js.map
