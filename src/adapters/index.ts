import type { SourceAdapter, SourceId } from "../types.js";
import { bestshopAdapter } from "./bestshop.js";
import { ctitvAdapter } from "./ctitv.js";
import { setnAdapter } from "./setn.js";

export const adapters: Record<SourceId, SourceAdapter> = {
  setn: setnAdapter,
  ctitv: ctitvAdapter,
  bestshop: bestshopAdapter,
};

export function getAdapter(source: SourceId): SourceAdapter {
  return adapters[source];
}
