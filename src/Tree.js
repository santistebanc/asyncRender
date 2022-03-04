import { Computed, State } from './State'
import { isAsyncIterable, isFunction, isObject, isPromise, run } from './utils'

const Component = obj => {
  let initial = obj

  if (isAsyncIterable(obj)) {
    initial = obj.value
    run(obj, v => {
      state.value = v
    })
  } else if (isFunction(obj)) {
    const comp = Computed(obj)
    initial = comp.value
    run(comp, v => {
      state.value = v
    })
  } else if (isObject(obj)) {
    initial = {}
    Object.keys(obj).forEach(k => {
      const val = obj[k]
      if (isAsyncIterable(val))
        return run(val, v => {
          proxy[k] = v
        })
      if (isPromise(val)) return val.then(v => (proxy[k] = v))
      if (val.value !== undefined) initial[k] = val.value
      initial[k] = val
    })
  }

  const state = State(initial)
  return state
}

const mem = Symbol('memo')
const st = Symbol('state')
const Tree = obj => {
  const memo = {}

  const proxy = new Proxy(
    {},
    {
      get(_, k) {
        if (k === Symbol.asyncIterator) return state[Symbol.asyncIterator]
        if (k === mem) return memo
        if (k === st) return state
        if (k === 'value') return obj
        if (k === Symbol.toPrimitive) return () => obj

        if (!(k in memo)) memo[k] = Tree(obj?.[k])
        return memo[k]
      },
      set(_, k, v) {
        if (k === mem) return true
        if (k === st) return true

        const val = proxy[k]

        Object.keys(val[mem]).forEach(i => {
          const tree = Tree()
          tree[st] = val[i][st]
          val[i] = v?.[i]
          val[mem][i] = tree
        })

        val[st].set(v)
        return true
      },
    }
  )
  const state = State(proxy)
  return proxy
}

export default Tree
