import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

const P = {
  bg: "#f2f0eb",
  card: "#ffffff",
  teal: "#e8943a",
  tealDeep: "#b86820",
  tealLight: "#fae0c0",
  rose: "#4db8a8",
  roseDeep: "#2a8a7a",
  roseLight: "#cff0ea",
  text: "#1a1714",
  textLight: "#a89e90",
  textMid: "#6a6058",
  gold: "#f0c000",
  border: "#e0dbd2",
};

const PHRASES = [
  "de laisser les autres choisir à sa place ?",
  "de connaître l'avis de tout le monde ?",
  "d'avoir la validation des autres ?",
  "d'avoir la vision de chacun ?",
];

const Scene1Roulette: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "Qui n'a jamais rêvé" apparaît
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 20], [30, 0], { extrapolateRight: "clamp" });

  // Chaque phrase dure 60 frames, avec 20 frames de transition
  const phraseIndex = Math.floor(frame / 60) % PHRASES.length;
  const phraseFrame = frame % 60;

  // Entrée et sortie de chaque phrase
  const phraseOpacity = interpolate(
    phraseFrame,
    [0, 15, 45, 60],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" }
  );
  const phraseY = interpolate(
    phraseFrame,
    [0, 15, 45, 60],
    [40, 0, 0, -40],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{
      backgroundColor: P.bg,
      fontFamily: "sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "80px 60px",
    }}>

      {/* Titre fixe */}
      <div style={{
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
        textAlign: "center",
        marginBottom: 40,
      }}>
        <p style={{
          fontSize: 64,
          fontWeight: 900,
          color: P.text,
          margin: 0,
          lineHeight: 1.2,
          textTransform: "uppercase",
          letterSpacing: 2,
        }}>QUI N'A JAMAIS RÊVÉ</p>
      </div>

      {/* Ligne séparatrice */}
      <div style={{
        width: 120,
        height: 4,
        backgroundColor: P.teal,
        borderRadius: 999,
        marginBottom: 40,
        opacity: titleOpacity,
      }} />

      {/* Roulette */}
      <div style={{
        overflow: "hidden",
        height: 200,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}>
        {/* Gradient haut */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 60,
          background: `linear-gradient(to bottom, ${P.bg}, transparent)`,
          zIndex: 2,
        }} />
        {/* Gradient bas */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: 60,
          background: `linear-gradient(to top, ${P.bg}, transparent)`,
          zIndex: 2,
        }} />

        <div style={{
          opacity: phraseOpacity,
          transform: `translateY(${phraseY}px)`,
          textAlign: "center",
          padding: "0 20px",
        }}>
          <p style={{
            fontSize: 52,
            fontWeight: 800,
            color: P.teal,
            margin: 0,
            lineHeight: 1.3,
            fontStyle: "italic",
          }}>
            {PHRASES[phraseIndex]}
          </p>
        </div>
      </div>

    </AbsoluteFill>
  );
};

export const OraPromo2: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={900}>
        <Scene1Roulette />
      </Sequence>
    </AbsoluteFill>
  );
};