import Component from "./Component";

test("can define chain of arbitrary properties", () => {
  const comp = Component();
  expect(comp.a.b.c).toBeDefined();
  expect(comp.one.two).toBeDefined();
});

test("can set value in chain of arbitrary properties", () => {
  const comp = Component();
  const run = () => {
    comp.a.b.c = 100;
    comp.one.two.three = 200;
  };
  expect(run).not.toThrow();
});

test("can write and read values from chain of arbitrary properties", () => {
  const comp = Component();
  comp.a.b.c = 100;
  comp.one.two.three = 200;
  expect(comp.a.b.c()).toBe(100);
  expect(comp.one.two.three()).toBe(200);
});

test("can initialize component with deeply nested object", () => {
  const comp = Component({ a: { b: { c: 100, other: 200 }, side: 300 } });
  expect(comp.a.b.c()).toBe(100);
  expect(comp.a.b.other()).toBe(200);
  expect(comp.a.side()).toBe(300);
});

test("values that are not yet defined have undefined value", () => {
  const comp = Component({ a: { b: { c: 100 } } });
  expect(comp.a.b.c.d()).not.toBeDefined();
  expect(comp.a.madeup()).not.toBeDefined();
  expect(comp.a.nested.fake()).not.toBeDefined();
});

test("values of keys in the middle of the chain are undefined", () => {
  const comp = Component({ a: { b: { c: 100 } } });
  expect(comp.a.b()).not.toBeDefined();
  expect(comp.a()).not.toBeDefined();
});

test("can extend chain by setting object with nested values", () => {
  const comp = Component({ a: { b: { c: 100, other: 200 }, side: 300 } });
  comp.a.b.c.ext = { one: { two: 2, three: 3 } };
  expect(comp.a.b.c.ext.one.two()).toBe(2);
  expect(comp.a.b.c.ext.one.three()).toBe(3);
  expect(comp.a.b.c()).not.toBeDefined();
});

test("can write to intermediate properties in chain", () => {
  const comp = Component({ a: { b: { c: 100, other: 200 }, side: 300 } });
  comp.a.b = "changed";
  expect(comp.a.b()).toBe("changed");
  expect(comp.a.side()).toBeDefined();
});

test("writing to property in the middle of chain, removes values at end of the chain", () => {
  const comp = Component({ a: { b: { c: 100, other: 200 }, side: 300 } });
  comp.a.b = "changed";
  expect(comp.a.b.c()).not.toBeDefined();
  expect(comp.a.b.other()).not.toBeDefined();
  expect(comp.a.side()).toBeDefined();
});

test("writing to property extending chain, removes values at previous end of the chain", () => {
  const comp = Component({ a: { b: { c: 100, other: 200 }, side: 300 } });
  comp.a.b.c.d = "changed";
  expect(comp.a.b.c()).not.toBe(100);
  expect(comp.a.b.other()).toBe(200);
});

test("can overwrite chain values by setting object with same keys and different values at middle of chain", () => {
  const comp = Component({ a: { b: { c: 100, other: 200 }, side: 300 } });
  comp.a.b = { c: 50 };
  expect(comp.a.b.c()).toBe(50);
});

test("overwriting chain with new object removes all key-values not defined in new object", () => {
  const comp = Component({ a: { b: { c: 100, other: 200 }, side: 300 } });
  comp.a.b = { c: 50 };
  expect(comp.a.b.other()).not.toBeDefined();
});
