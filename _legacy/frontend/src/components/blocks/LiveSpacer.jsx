import { memo } from "react";

export const LiveSpacer = memo(({ d }) => (
  <div style={{ height: d.height || 80, background: "#0F0F10" }} />
));
