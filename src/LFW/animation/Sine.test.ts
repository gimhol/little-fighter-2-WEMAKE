import { Sine } from "./Sine"

test('sine', () => {
  const sine = new Sine(-1, 2, 0.5).set_duration(500);

  expect(sine.value).toBeCloseTo(0)
  sine.update(500);
  expect(sine.value).toBeCloseTo(1)

  sine.end()
  sine.start(true)

  expect(sine.value).toBeCloseTo(1)
  sine.update(500);
  expect(sine.value).toBeCloseTo(0)
})

test('sine 2', () => {
  const sine = new Sine(0, 1, 1)
    .set_duration(3000)
    .set_offset(-250);

  expect(sine.value).toBeCloseTo(0)
  sine.update(500);
  expect(sine.value).toBeCloseTo(1)
  sine.update(500);
  expect(sine.value).toBeCloseTo(0)
  sine.update(500);
  expect(sine.value).toBeCloseTo(1)

  // sine.end()
  // sine.start(true)

  // expect(sine.value).toBeCloseTo(1)
  // sine.update(500);
  // expect(sine.value).toBeCloseTo(0)
})

