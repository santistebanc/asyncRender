import { Hub } from './Hub'

export function isFunction(obj) {
  return typeof obj === 'function'
}

export function isObject(obj) {
  return typeof obj === 'object' && obj !== null
}

export function isPromise(obj) {
  return obj && Object.prototype.toString.call(obj) === '[object Promise]'
}

export function isAsyncIterable(obj) {
  return !!obj?.[Symbol.asyncIterator]
}

export async function* asAsyncIter(val) {
  return val
}

export const run = (obj, func) => {
  const hub = Hub()
  ;(async () => {
    let index = 0
    const iter = obj[Symbol.asyncIterator]()
    while (!hub.done) {
      const { done, value } = await iter.next()
      const res = func
        ? func(value, { index: index++, done: done || hub.done, iter, hub })
        : value
      if (done) hub.resolve(res)
      hub.push(res, done)
    }
  })()
  return hub
}

export const map = async function* (iter, func) {
  let index = 0
  for await (const value of iter) {
    yield func(value, { index: index++, iter })
  }
}
