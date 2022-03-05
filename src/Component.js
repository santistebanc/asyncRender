import { withContext } from './Context'
import { isFunction, isObject, isSymbol } from './utils'

const make = del => {
  const memo = {}
  let value
  const propagate = () => {
    del?.()
    value = { ...memo }
  }
  const proxy = new Proxy(
    (...args) => (isFunction(value) ? value(...args) : value),
    {
      get(_, k) {
        if (k === Symbol.toPrimitive) return () => value
        if (k === 'memo') return memo
        if (k === 'value') return value
        if (!(k in memo)) {
          memo[k] = make(propagate)
        }
        return memo[k]
      },
      set(_, k, v) {
        if (k === 'value') {
          value = v
          return true
        }
        if (!(k in memo)) {
          memo[k] = make(propagate)
        }
        if (isObject(v)) {
          Reflect.ownKeys(v).forEach(it => {
            memo[k][it] = v[it]
          })
        } else {
          Reflect.ownKeys(memo[k].memo).forEach(it => {
            delete memo[k].memo[it]
            memo[k].value = undefined
          })
          if (isSymbol(k, 'ctx')) {
            Object.keys(memo).forEach(m => {
              if (!(k in memo[m].memo)) {
                memo[m].memo[k] = make()
                memo[m].memo[k].value = v
              }
            })
          }
          console.log('.....memo', memo)
          memo[k].value = isFunction(v) ? withContext(v, memo) : () => v
          propagate()
        }
        return true
      },
    }
  )
  return proxy
}

const Component = initial => {
  const comp = make()
  Reflect.ownKeys(initial).forEach(k => (comp[k] = initial[k]))
  return comp
}

export default Component
