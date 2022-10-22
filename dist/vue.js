(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

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
    console.log("attrs", attrs);
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
        console.log("text", text);
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
      this.get();
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
      key: "get",
      value: function get() {
        // 需要给每个属性增加dep,目前就时收集 Watcher
        Dep.target = this;
        this.getter();
        Dep.target = null;
      }
    }, {
      key: "update",
      value: function update() {
        this.get(); // 重新渲染
      }
    }]);
    return Watcher;
  }();

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
    var watcher = new Watcher(vm, updateComponent, true);
    console.log("watcher", watcher);
  }

  // vue 核心流程
  // 1 创造响应式数据
  // 2 模板转换成 ast
  // 3 将 ast 转成 render 函数
  // 4 后续每次数据更新可以只执行 render 函数，无需再转换

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
      return result;
    };
  });

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);
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
  }();
  function defineReactive(target, key, value) {
    observe(value); //递归劫持对象
    var dep = new Dep(); // 每一个属性都有一个 dep
    Object.defineProperty(target, key, {
      get: function get() {
        if (Dep.target) {
          dep.depend(); // 属性搜集watch
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

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options;

      // 初始化状态
      initState(vm);
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

  return Vue;

}));
//# sourceMappingURL=vue.js.map
