import { isFunction, isObject, isSymbol } from "./utils";

const value = Symbol("value");
const parent = Symbol("parent");
const clear = Symbol("clear");
const sym = Symbol("sym");

const make = (par) => {
  const get = (...args) =>
    isFunction(get[value]) ? get[value](...args) : get[value];
  get[value] = undefined;
  get[parent] = par;

  const proxy = new Proxy(get, {
    get(memo, k) {
      if (k === Symbol.toPrimitive) return () => memo[sym];
      if (k === parent) return memo[parent];
      if (isSymbol(k, "ctx")) {
        const findKey = (m) => {
          if (k in m) return m[k];
          if (m[parent]) return findKey(m[parent]);
        };
        return findKey(memo);
      }
      if (!(k in memo)) memo[k] = make(memo);
      return memo[k];
    },
    set(memo, k, v) {
      if (k === value) {
        memo[value] = v;
        return true;
      }
      if (k === sym) {
        memo[sym] = v;
        return true;
      }
      memo[k] = make(memo);
      if (isObject(v)) {
        Reflect.ownKeys(v).forEach((it) => {
          memo[k][it] = v[it];
        });
      } else {
        const clear = (m) => {
          m[value] = undefined;
          if (m[parent]) clear(m[parent]);
        };
        clear(memo);
        memo[k][value] = isFunction(v) ? withContext(v, proxy) : v;
      }
      return true;
    },
  });
  return proxy;
};

let ctx = {};

const Component = (initial) => {
  const comp = make();
  const id = Symbol("ctx");
  comp[sym] = id;
  if (isObject(initial)) {
    Reflect.ownKeys(initial).forEach((k) => (comp[k] = initial[k]));
  } else {
    comp[value] = () => (ctx?.[id] ? ctx[id]() : initial);
  }
  return comp;
};

export const withContext = (func, val) => {
  return (...args) => {
    const prev = ctx;
    ctx = val;
    const res = func(...args);
    ctx = prev;
    return res;
  };
};

export default Component;
