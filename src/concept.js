import { isFunction, isObject } from './utils'

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
          Object.keys(v).forEach(it => {
            memo[k][it] = v[it]
          })
        } else {
          Object.keys(memo[k].memo).forEach(it => {
            delete memo[k].memo[it]
            memo[k].value = undefined
          })
          memo[k].value = isFunction(v) ? v : () => v
          propagate()
        }
        return true
      },
    }
  )
  return proxy
}

const $ = make()

// $.one.two.three = 3

$.one = { two: { three: { four: () => 4 } } }

// $.one.two.three = 3
// $.one = 1
// $.one.two.three.aka = 2

console.log($.one.two())
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
