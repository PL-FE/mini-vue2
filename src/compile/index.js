import { parseHTML, defaultTagRE } from "./parent";

function genProps(attrs) {
  let str = ""; // {name,value}
  for (let index = 0; index < attrs.length; index++) {
    const attr = attrs[index];
    if (attr.name === "style") {
      // color:red => {color:'red'}
      let obj = {};
      attr.value.split(";").forEach((item) => {
        let [key, value] = item.split(":");
        obj[key] = value;
      });
      attr.value = obj;
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`; // a:b,c:d
  }
  return `{${str.slice(0, -1)}}`;
}

function gen(node) {
  if (node.type === 1) {
    // 如果是元素
    return codegen(node);
  } else {
    // 文本
    const text = node.text;
    if (!defaultTagRE.test(text)) {
      // 不是普通文本，即是模板文本时
      return `_v(${JSON.stringify(text)})`;
    } else {
      // 普通文本
      let tokens = [];
      let match;
      defaultTagRE.lastIndex = 0;
      let lastIndex = 0;
      while ((match = defaultTagRE.exec(text))) {
        let index = match.index;
        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }
        tokens.push(`_s(${match[1].trim()})`);
        lastIndex = index + match[0].length;
      }
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      }
      return `_v(${tokens.join("+")})`;
    }
  }
}

function genChildren(children) {
  return children.map((child) => gen(child)).join(",");
}

function codegen(ast) {
  const children = genChildren(ast.children);
  let code = `_c('${ast.tag}',${
    ast.attrs.length > 0 ? genProps(ast.attrs) : "null"
  }${ast.children.length ? `,${children}` : ""})`;
  return code;
}

export function compileToFuntion(template) {
  // 1. 将 template 转换成语法树
  // 2. 生成 render 方法，执行后返回的结果是虚拟 DOM
  const ast = parseHTML(template);
  let code = codegen(ast);

  // let obj = { a: 1 };
  // with (obj) {
  //   console.log("a", a);
  // }
  code = `with(this){return ${code}}`;
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
  const render = new Function(code);
  return render;
}
