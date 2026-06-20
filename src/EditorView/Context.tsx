import React from "react";
import type { IZip } from "../LFW/ditto/zip/IZip";

export const shared_ctx = React.createContext<{ zip?: IZip }>({});