import { State } from './State'
import { isAsyncIterable, isObject, isPromise, run } from './utils'

const mem = Symbol('memo')
const st = Symbol('state')
const Tree = obj => {
  let initial = obj
  if (isObject(obj)) {
    initial = {}
    Object.keys(obj).forEach(k => {
      const val = obj[k]
      if (val.value !== undefined) initial[k] = val.value
      if (isAsyncIterable(val))
        return run(val, v => {
          proxy[k] = v
        })
      if (isPromise(val)) return val.then(v => (proxy[k] = v))
      initial[k] = val
    })
  }
  const state = State(initial)

  const proxy = new Proxy(
    {},
    {
      get(memo, k) {
        if (k === Symbol.asyncIterator) return state[Symbol.asyncIterator]
        if (k === mem) return memo
        if (k === st) return state
        if (k === 'value') return state.value
        if (k === Symbol.toPrimitive) return () => state.value

        if (!(k in memo)) memo[k] = Tree(state.value?.[k])
        return memo[k]
      },
      set(memo, k, v) {
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
  return proxy
}

export default Tree
