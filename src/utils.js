const strats = {};
const LIFECYCLE = ["beforeCreate", "created"];
LIFECYCLE.forEach((hook) => {
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

export function mergeOpions(parent, child) {
  const options = [];
  for (const key in parent) {
    mergeFiled(key);
  }
  for (const key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeFiled(key);
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
