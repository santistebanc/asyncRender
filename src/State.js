import { Hub } from './Hub'

let dependencies = null
let updates = null
const PREVENT_UPDATES = Symbol()
export const Computed = obj => {
  const hub = Hub()
  const output = function (...args) {
    const deps = []
    const ups = []
    const prevDeps = dependencies
    const prevUps = updates
    dependencies = deps
    updates = ups
    const res = obj(...args)
    dependencies = prevDeps
    updates = prevUps
    if (updates !== PREVENT_UPDATES) ups.forEach(up => up())
    let pushed = false
    deps.forEach(async dep =>
      dep[Symbol.asyncIterator]()
        .return()
        .then(() => {
          if (!pushed) hub.push(output(...args))
          pushed = true
        })
    )
    return res
  }
  Object.defineProperty(output, 'value', { get: () => output() })
  output[Symbol.asyncIterator] = async function* (...args) {
    // const prev = updates
    // updates = PREVENT_UPDATES
    yield output(...args)
    // updates = prev
    for await (const v of hub) yield output(...args)
  }
  return output
}

export const State = obj => {
  const hub = Hub(obj)
  const output = {
    get: () => {
      dependencies?.push(hub)
      return hub.value
    },
    set: newVal => {
      if (updates) {
        hub.value = newVal
        updates?.push(() => hub.push(newVal))
      } else {
        hub.push(newVal)
      }
    },
  }
  Object.defineProperty(output, 'value', { get: output.get, set: output.set })
  output[Symbol.asyncIterator] = async function* () {
    yield output.get()
    for await (const v of hub) yield output.get()
  }
  output[Symbol.toPrimitive] = output.get

  return output
}
