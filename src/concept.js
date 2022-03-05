import { isFunction, isObject, isSymbol } from './utils'

const make = del => {
  const id = Symbol('ctx')
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
        if (k === Symbol.toPrimitive) return () => id
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
              console.log('m', m, memo[m].memo)
            })
          }
          memo[k].value = isFunction(v)
            ? (...args) => {
                console.log('......Object.keys(memo)', memo)
                // const prev = $
                // $ = make()
                // Reflect.ownKeys(memo).forEach(k => {
                //   if (isSymbol(k, 'ctx')) $[k] = memo[k]
                // })
                const res = v(...args)
                // $ = prev
                return res
              }
            : () => v
          console.log('mmmm', memo)
          propagate()
        }
        return true
      },
    }
  )
  return proxy
}

let $ = make()

$.one.two = 2
$.one[$.val] = 'vvv'

console.log($.one.two[$.val]())

// console.log($.one.two())

// const sum = () => $.one() + $.two()

// const log = () => console.log(sum())

// const main = () => {
//   $.one = () => 100 - 99
//   $.two = 2
//   $.other.no = false
//   $.other = { yes: true }
//   $(() => {
//     $.two = 3
//     $(log)
//   })
//   $(log)
// }

// $(main)

// const Todo = (title, done = false) => ({ title, done })
// $.todos = [Todo('play game'), Todo('pet dog')]
// $.todos.add = title => $.todos.push(Todo(title))
// $.todos.clear = () => ($.todos = [])

// $(() => console.log($.todos.map(todo=>todo.title())
