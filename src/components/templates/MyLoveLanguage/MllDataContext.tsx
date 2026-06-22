import { createContext, useContext } from "react";
import { SITE_DATA } from "./siteData";

// This context allows the editor wrapper to override SITE_DATA values with
// live customData from the web editor, without modifying any scene files.
export type MllData = typeof SITE_DATA;

export const MllDataContext = createContext<MllData>(SITE_DATA);

export function useMllData(): MllData {
  return useContext(MllDataContext);
}
