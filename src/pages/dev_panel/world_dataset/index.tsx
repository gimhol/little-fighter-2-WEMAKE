import { Button } from "@/Component/Buttons/Button";
import Combine from "@/Component/Combine";
import { Cross } from "@/Component/Icons/Cross";
import { InputNumber } from "@/Component/Input";
import Titled from "@/Component/Titled";
import { IWorldDataset, LF2, world_dataset_field_map } from "@/LF2";
import { download } from "@/Utils/download";
import { useEffect, useState } from "react";
import { useImmer } from "use-immer";
import csses from "./index.module.scss";

interface IWorldDatasetProps extends React.HTMLAttributes<HTMLDivElement> {
  lf2?: LF2 | null;
}
export function WorldDataset(props: IWorldDatasetProps) {
  const { lf2 } = props;

  const [dwds, set_dwds] = useImmer<Partial<IWorldDataset>>({})
  const [cwds, set_cwds] = useImmer<Partial<IWorldDataset>>({})
  const [ready, set_ready] = useState(false)

  useEffect(() => {
    if (!lf2?.world) return;
    if (!ready) return;
    Object.assign(lf2.world, cwds)
  }, [ready, cwds, lf2])

  useEffect(() => {
    if (!lf2?.world) return;
    set_dwds(d => {
      for (const [k] of world_dataset_field_map) {
        const key = k as keyof IWorldDataset;
        d[key] = lf2.world[key]
      }
    })
    set_cwds(d => {
      for (const [k] of world_dataset_field_map) {
        const key = k as keyof IWorldDataset;
        d[key] = lf2.world[key]
      }
    })
    set_ready(true);
  }, [lf2, set_dwds, set_cwds])


  const dump = () => {
    const json_blob = new Blob([
      JSON.stringify(
        {
          __is_world_dataset__: true,
          ...lf2?.world.dump_dataset(),
        }
      )], {
      type: 'application/json;charset=utf-8'
    })
    download(URL.createObjectURL(json_blob), 'world.wdataset.json')
  }
  return (
    <div className={csses.world_dataset}>
      {world_dataset_field_map.values()?.map((v) => {
        const { title, desc = title, type, key, step } = v;
        return (
          <Titled float_label={title} title={desc} key={v.key}>
            <Combine>
              <InputNumber
                precision={type === 'float' ? 2 : 0}
                min={v.min}
                max={v.max}
                step={step}
                className={csses.num_input}
                value={cwds[v.key]}
                onChange={(v) => { set_cwds(d => { d[key] = v }) }} />
              <Button
                title="重置"
                onClick={(_) => set_cwds(d => { d[key] = dwds[key] })}>
                <Cross />
              </Button>
            </Combine>
          </Titled>
        );
      })}
      <Button disabled={!ready} onClick={(e) => { e.preventDefault(); e.stopPropagation(); dump() }}>
        Dump
      </Button>
      <Button disabled={!ready} onClick={(e) => { e.preventDefault(); e.stopPropagation(); set_cwds(dwds) }}>
        Reset
      </Button>
    </div>
  )
}