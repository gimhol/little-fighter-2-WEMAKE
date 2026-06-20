import { MersenneTwister } from "./MersenneTwister"

test("MersenneTwister", () => {
  const mt = new MersenneTwister(0)
  expect(mt.int()).toBe(2357136044)
  expect(mt.int()).toBe(2546248239)
  expect(mt.int()).toBe(3071714933)
  expect(mt.int()).toBe(3626093760)
  expect(mt.int()).toBe(2588848963)
  expect(mt.int()).toBe(3684848379)
  expect(mt.int()).toBe(2340255427)
  expect(mt.int()).toBe(3638918503)
})