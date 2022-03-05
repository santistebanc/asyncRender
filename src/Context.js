let ctx = {}
export const Context = defaultVal => {
  const con = () => (ctx?.[con.sym] ? ctx[con.sym]() : con.defaultValue)
  con.sym = Symbol('ctx')
  con.defaultValue = defaultVal
  con[Symbol.toPrimitive] = () => con.sym
  return con
}

export const withContext = (func, val) => {
  return (...args) => {
    const prev = ctx
    ctx = val
    const res = func(...args)
    ctx = prev
    return res
  }
}
