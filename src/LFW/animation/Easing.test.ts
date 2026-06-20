import ease_linearity from "../utils/ease_method/ease_linearity";
import Easing from "./Easing"


test("[Easing] linearity, case 0", () => {
  const anim = new Easing(0, 1)
    .set_ease_method(ease_linearity)
    .set_duration(1000);

  anim.start();
  expect(anim.times).toBe(1);
  expect(anim.count).toBe(0);
  expect(anim.done).toBe(false);

  anim.update(500);
  expect(anim.value).toBeCloseTo(0.5, 4);
  expect(anim.done).toBe(false);

  anim.update(250);
  expect(anim.value).toBeCloseTo(0.75, 4);
  expect(anim.done).toBe(false);

  anim.update(250);
  expect(anim.value).toBeCloseTo(1, 4);
  expect(anim.time).toBe(1000);
  expect(anim.times).toBe(1);
  expect(anim.count).toBe(1);
  expect(anim.done).toBe(true);

  anim.start(true);
  expect(anim.times).toBe(1);
  expect(anim.count).toBe(0);
  expect(anim.done).toBe(false);
  anim.update(500);
  expect(anim.value).toBeCloseTo(0.5, 4);
  expect(anim.done).toBe(false);
  anim.update(250);
  expect(anim.value).toBeCloseTo(0.25, 4);
  expect(anim.done).toBe(false);
  anim.update(250);
  expect(anim.value).toBeCloseTo(0, 4);
  expect(anim.times).toBe(1);
  expect(anim.count).toBe(1);
  expect(anim.done).toBe(true);
})