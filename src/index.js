import { Computed, State } from './State'
import Tree from './Tree'
import { run } from './utils'

const timer = State(0)
const page = State('main')

const app = Tree({
  title: Computed(() => page + '-' + timer),
  other: Tree({ go: 1 }),
})

run(app.other, v => console.log(v))
