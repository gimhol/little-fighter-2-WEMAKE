import { LF2 } from "@/LF2/LF2";
import { IBgLayerInfo } from "@/LF2/defines/IBgLayerInfo";
import { MeshBasicMaterial, MeshBasicMaterialParameters } from "three";
import { Keeper } from "./Keeper";
import { MaterialFactory, MaterialKind } from "./factory";

export const MaterialKeeper = new Keeper<string, MeshBasicMaterial>();
export const get_bg_layer_material = (info: IBgLayerInfo, lf2: LF2) => {
  const { file, color } = info;
  return MaterialKeeper.get(`bg_l_${file ?? color}`, () => {
    const texture = file ? lf2.images.find(file)?.pic?.texture : null
    const params: MeshBasicMaterialParameters = {
      transparent: true
    };
    if (texture) params.map = texture;
    else params.color = color;
    return new MeshBasicMaterial(params);
  })
}
