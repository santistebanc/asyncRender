// import { Computed, State } from './State'
// import Tree from './Tree'
// import { run } from './utils'

// const timer = State(0)
// const page = State('main')

// // const app = Tree({
// //   all: () =>
// //     page.value === 'main'
// //       ? {
// //           title: () => page + '-' + timer,
// //           other: { go: 1 },
// //           error: '-',
// //         }
// //       : { title: 'not main', error: 'ERR' },
// // })

// const app = Tree({ title: 'not main', error: 'ERR' })

// // run(app.all.title, v => console.log(v))
// run(app, v => console.log(v.value))

// setTimeout(() => {
//   page.value = 'not'
// }, 2000)

import './concept'
