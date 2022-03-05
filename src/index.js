import Component from "./Component";
import { Context } from "./Context";

const color = Context("red");

const app = Component({
  [color]: "blue",
  zero: { one: { two: () => color() } },
});

console.log(app.zero.one.two());
