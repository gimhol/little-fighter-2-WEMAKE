import { Collision } from "../base";
import { handle_stiffness } from "./handle_stiffness";

export function handle_body_goto(collision: Collision): void {
  handle_stiffness(collision);
}
