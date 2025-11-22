import React, { useRef } from "react";
import { Button, IButtonProps } from "../../Component/Buttons/Button";
import { IZip } from "@/LF2/ditto/zip/IZip";
export interface IAudioButtonProps extends IButtonProps {
  zip?: IZip;
  path?: string;
}
export function AudioButton(props: IAudioButtonProps) {
  const { zip, path } = props;
  
  const on_toggle_play = () => {
    if (!path || !zip) return;
    zip.file(path)?.blob_url().then((url) => {
      const audio = new Audio(url);
      audio.play()
    }).catch((e) => {
    })
  }
  return (
    <Button onClick={on_toggle_play}>
      Play
    </Button>
  );
}
