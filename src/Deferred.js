export const Deferred = func => {
  let resolve
  let reject
  const output = new Promise((res, rej) => {
    resolve = res
    reject = rej
    func?.(res, rej)
  })
  output.done = false
  output.resolve = v => {
    output.done = true
    resolve(v)
  }
  output.reject = v => {
    output.done = true
    reject(v)
  }
  return output
}
