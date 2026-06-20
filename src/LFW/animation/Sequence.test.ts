import { Delay } from "./Delay";
import Easing from "./Easing";
import { Sequence } from "./Sequence";
import { Sine } from "./Sine";

test('Animation: Sequence case 0', () => {
  const anim = new Sequence(
    new Easing(0, 0).set_duration(1500),
    new Sine(-1, 2, 0.5).set_duration(500),
    new Easing(1, 1).set_duration(1500),
  )
  anim.start(true)
  anim.update(1500);
  expect(anim.value).toBe(1);
})
test('Animation: Sequence case 2', () => {
  const anim = new Sequence(
    new Delay(0).set_duration(1000),
    new Easing(0, 1).set_duration(1000),
    new Delay(1).set_duration(250),
  )
  anim.start(false)
  anim.update(99999);

  anim.start(true)
  anim.update(750);
  expect(anim.anims[1].time).toBe(500);
})
test('Animation: Sequence case 3', () => {
  const anim = new Sequence(
    new Delay(0).set_duration(1000),
    new Easing(0, 1).set_duration(1000),
    new Delay(1).set_duration(250),
  ).set_times(2)
  anim.start()
  anim.update(2000);
  expect(anim.done).toBe(false);
  anim.update(250);
  expect(anim.done).toBe(false);
  anim.update(500);
  expect(anim.done).toBe(false);
  anim.update(1500);
  expect(anim.done).toBe(false);
  anim.update(249);
  expect(anim.done).toBe(false);
  anim.update(1);
  expect(anim.done).toBe(true);
})
test('Animation: Sequence case 4', () => {
  const anim = new Sequence(
    new Delay(0).set_duration(1000),
    new Easing(0, 1).set_duration(1000),
    new Delay(1).set_duration(250),
  ).set_times(2).set_reverse(true)
  anim.start()
  expect(anim.time).toBe(2250);
  expect(anim.duration).toBe(2250);
  expect(anim.count).toBe(0);
  anim.update(2000);
  expect(anim.done).toBe(false);
  anim.update(250);
  expect(anim.count).toBe(1);
  expect(anim.done).toBe(false);

  anim.update(1);
  expect(anim.count).toBe(1);
  expect(anim.done).toBe(false);

  anim.update(499);
  expect(anim.count).toBe(1);
  expect(anim.done).toBe(false);

  anim.update(1500);
  expect(anim.done).toBe(false);
  anim.update(249);
  expect(anim.done).toBe(false);
  anim.update(1);
  expect(anim.done).toBe(true);
})