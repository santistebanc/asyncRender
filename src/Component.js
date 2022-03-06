import { withContext } from "./Context";
import { isFunction, isObject, isSymbol } from "./utils";

const make = (del) => {
  const get = (...args) =>
    isFunction(get.value) ? withContext(get.value, get)(...args) : get.value;
  get.value = undefined;

  const propagate = () => {
    del?.();
    get.value = undefined;
  };

  return new Proxy(get, {
    get(memo, k) {
      if (k === Symbol.toPrimitive) return () => memo.value;
      if (!(k in memo)) memo[k] = make(propagate);
      return memo[k];
    },
    set(memo, k, v) {
      if (k === "value") {
        memo.value = v;
        return true;
      }
      memo[k] = make(propagate);
      if (isObject(v)) {
        Reflect.ownKeys(v).forEach((it) => {
          memo[k][it] = v[it];
        });
      } else {
        //TODO: find more performant solution for inheriting ctx
        if (isSymbol(k, "ctx")) {
          Object.keys(memo).forEach((m) => {
            if (!(k in memo[m].memo)) {
              memo[m][k] = v;
            }
          });
        }
        memo[k].value = v;
        propagate();
      }
      return true;
    },
  });
};

const Component = (initial) => {
  const comp = make();
  if (initial) Reflect.ownKeys(initial).forEach((k) => (comp[k] = initial[k]));
  return comp;
};

export default Component;
