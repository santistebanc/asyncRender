import { Deferred } from './Deferred'

export const Hub = initial => {
  let listeners = new Set()
  const deferred = Deferred()
  deferred.value = initial
  deferred.push = (newVal, last) => {
    deferred.value = newVal
    if (last) deferred.resolve()
    listeners.forEach(lis => {
      listeners.delete(lis)
      lis.resolve()
    })
  }
  deferred[Symbol.asyncIterator] = () => {
    let nextUpdate = Deferred()
    listeners.add(nextUpdate)
    return {
      next() {
        return Deferred(async resolve => {
          const update = await nextUpdate
          if (!deferred.done) {
            nextUpdate = Deferred()
            listeners.add(nextUpdate)
          }
          resolve({ value: deferred.value, done: deferred.done })
        })
      },
      return() {
        return Deferred(async resolve => {
          deferred.resolve()
          const update = await nextUpdate
          resolve({ value: deferred.value, done: true })
        })
      },
    }
  }
  return deferred
}
