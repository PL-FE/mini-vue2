const ncname = `[a-zA-Z][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配到的分组是一个开始标签名，如 <div 或带命名空间的 <div:xxx，注意不带 > 符号
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配的是结束标签，如 </div>
// 匹配属性，第一个分组是属性的 key，第二个分组是 = 号，第三、四、五分组是属性的 value 值
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const startTagClose = /^\s*(\/?)>/; // 匹配开始标签的 > 符号或自闭和标签，如 <div> 中的 > 或 <br />
export const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配 {{}} 表达式，如 {{ name }}

// vue3 采用的不是正则
// 对模板进行编译
export function parseHTML(html) {
  const ELEMENT_TYPE = 1;
  const TEXT_TYPE = 3;
  const stack = [];
  let currentParent;
  let root;

  function createASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null,
    };
  }

  function start(tag, attrs) {
    const node = createASTElement(tag, attrs);
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
    text &&
      currentParent.children.push({
        type: TEXT_TYPE,
        text,
        parent: currentParent,
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
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1], // 标签名
        attrs: [],
      };
      advance(start[0].length);

      let attr, end;
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        advance(attr[0].length);
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] || true,
        });
      }
      end && advance(end[0].length);
      return match;
    }
  }

  while (html) {
    const textEnd = html.indexOf("<");
    if (textEnd === 0) {
      const startTagMatch = parseStartTag();
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }
      const endtagMatch = html.match(endTag);
      if (endtagMatch) {
        advance(endtagMatch[0].length);
        end(endtagMatch[1]);
        continue;
      }
    }

    if (textEnd > 0) {
      let text = html.substring(0, textEnd); // 文本内容
      if (text) {
        advance(text.length);
        chars(text);
      }
    }
  }

  return root;
}
