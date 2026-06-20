/**
 * Texture Wrapping Modes
 * @remarks {@link ClampToEdge} is the _default_ value and behaver for Wrapping Mapping.
 * @see {@link https://threejs.org/docs/index.html#api/en/constants/Textures | Texture Constants}
 */
export enum TextureWrapping {
  /** With {@link RepeatWrapping} the texture will simply repeat to infinity. */
  Repeat = 1000,

  /**
   * With {@link ClampToEdge} the last pixel of the texture stretches to the edge of the mesh.
   * @remarks This is the _default_ value and behaver for Wrapping Mapping.
   */
  ClampToEdge = 1001,

  /** With {@link MirroredRepeat} the texture will repeats to infinity, mirroring on each repeat. */
  MirroredRepeat = 1002
}

