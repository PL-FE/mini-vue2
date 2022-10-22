// h() _c
export function createElementVNode(vm, tag, data = {}, ...children) {
  if (data == null) {
    data = {};
  }
  const key = data.key;
  if (key) {
    delete data.key;
  }
  return vnode(vm, tag, key, data, children);
}

// _v()
export function createTextVNode(vm, text) {
  return vnode(vm, null, null, null, null, text);
}

// vdom 描述dom元素，增加一些自定义属性
function vnode(vm, tag, key, data, children, text) {
  return {
    vm,
    tag,
    key,
    data,
    children,
    text,
  };
}
