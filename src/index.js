import Component from "./Component";

const color = Component(() => "red");

const app = Component({
  [color]: "blue",
  zero: { one: { two: () => color() } },
});

console.log(";;;;;;;;;", app.zero.one.two());
