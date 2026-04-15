import React from "react";
import { Composition } from "remotion";
import { OraPromo } from "./OraPromo";
import { OraPromo2 } from "./OraPromo2";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="OraPromo"
        component={OraPromo}
        durationInFrames={1360}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="OraPromo2"
        component={OraPromo2}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};