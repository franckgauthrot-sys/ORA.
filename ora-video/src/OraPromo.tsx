import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
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

// ─── SCÈNE 1 : Logo avec effet miroir ───
const Scene1Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const logoOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const reflectOpacity = interpolate(frame, [10, 30], [0, 0.25], { extrapolateRight: "clamp" });
  const taglineOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateRight: "clamp" });
  const taglineY = interpolate(frame, [15, 30], [20, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg, alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <div style={{ alignItems: "center", display: "flex", flexDirection: "column" }}>
        <div style={{ transform: `scale(${interpolate(logoScale, [0, 1], [0.3, 1])})`, opacity: logoOpacity }}>
          <span style={{ fontSize: 160, fontWeight: 900, color: P.text, letterSpacing: -6, display: "block" }}>
            ORA<span style={{ color: P.teal }}>.</span>
          </span>
        </div>

        <div style={{
          transform: "scaleY(-1)",
          opacity: reflectOpacity,
          marginTop: -20,
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)",
        }}>
          <span style={{ fontSize: 160, fontWeight: 900, color: P.text, letterSpacing: -6, display: "block" }}>
            ORA<span style={{ color: P.teal }}>.</span>
          </span>
        </div>

        <div style={{ width: 400, height: 1, backgroundColor: P.border, opacity: reflectOpacity * 4, marginTop: -60, marginBottom: 80 }} />

        <div style={{
  opacity: taglineOpacity,
  transform: `translateY(${taglineY}px)`,
  textAlign: "center",
  marginTop: 40,
}}>
          <span style={{ fontSize: 32, color: P.textLight, letterSpacing: 10, fontWeight: 800 }}>MIROIR COLLECTIF</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── SCÈNE 2 : Dilemme classique avec vote ───
const Scene2Vote: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardSpring = spring({ frame, fps, config: { damping: 14, stiffness: 70 } });
  const cardY = interpolate(cardSpring, [0, 1], [100, 0]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

  const btnPress = interpolate(frame, [30, 45, 55, 70], [1, 0.92, 0.92, 1], { extrapolateRight: "clamp" });
  const btnShadow = interpolate(frame, [30, 45, 55, 70], [8, 2, 2, 8], { extrapolateRight: "clamp" });
  const btnBrightness = interpolate(frame, [30, 45, 55, 70], [1, 0.85, 0.85, 1], { extrapolateRight: "clamp" });

  const showDots = frame >= 80 && frame < 130;
  const dot1 = Math.abs(Math.sin((frame - 80) * 0.3)) * (frame > 85 ? 1 : 0);
  const dot2 = Math.abs(Math.sin((frame - 90) * 0.3)) * (frame > 95 ? 1 : 0);
  const dot3 = Math.abs(Math.sin((frame - 100) * 0.3)) * (frame > 105 ? 1 : 0);

  const showResult = frame >= 130;
  const barSpring = spring({ frame: frame - 130, fps, config: { damping: 12 } });
  const barA = interpolate(barSpring, [0, 1], [0, 62]);
  const barB = interpolate(barSpring, [0, 1], [0, 38]);
  const resultOpacity = interpolate(frame, [130, 145], [0, 1], { extrapolateRight: "clamp" });

  const textOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const textY = interpolate(frame, [0, 20], [20, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg, fontFamily: "sans-serif", padding: "60px 60px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center" }}>

      <div style={{ textAlign: "center", opacity: textOpacity, transform: `translateY(${textY}px)`, marginBottom: 150 }}>
        <p style={{ fontSize: 52, fontWeight: 900, color: P.text, lineHeight: 1.5, margin: 0, textTransform: "uppercase", letterSpacing: 2 }}>PARTICIPE</p>
        <p style={{ fontSize: 52, fontWeight: 900, color: P.gold, lineHeight: 1.5, margin: 0, textTransform: "uppercase", letterSpacing: 2 }}>AUX DILEMMES DES AUTRES.</p>
      </div>

      <div style={{
        backgroundColor: P.card,
        borderRadius: 36,
        padding: 48,
        border: `3px solid ${P.border}`,
        transform: `translateY(${cardY}px)`,
        opacity: cardOpacity,
        boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
      }}>
        <p style={{ fontSize: 38, fontWeight: 800, color: P.text, lineHeight: 1.3, margin: "0 0 40px 0" }}>
            "Je suis en couple depuis 5 ans. Mon ex me recontacte. Je réponds ou pas ?"
        </p>

        {!showDots && !showResult && (
          <div style={{ display: "flex", gap: 20 }}>
            {[
              { label: "Je réponds", bg: P.roseLight, color: P.roseDeep, press: true },
              { label: "Je l'ignore", bg: P.tealLight, color: P.tealDeep, press: false },
            ].map((opt, i) => (
              <div key={i} style={{
                flex: 1,
                backgroundColor: opt.bg,
                borderRadius: 24,
                padding: "28px 20px",
                textAlign: "center",
                transform: opt.press ? `scale(${btnPress})` : "scale(1)",
                boxShadow: opt.press ? `0 ${btnShadow}px 20px rgba(0,0,0,0.1)` : "0 8px 20px rgba(0,0,0,0.1)",
                filter: opt.press ? `brightness(${btnBrightness})` : "brightness(1)",
              }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: opt.color }}>{opt.label}</span>
              </div>
            ))}
          </div>
        )}

        {showDots && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontSize: 30, color: P.textMid, marginBottom: 24, fontWeight: 600 }}>Calcul des votes…</p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
              {[dot1, dot2, dot3].map((d, i) => (
                <div key={i} style={{
                  width: 16, height: 16, borderRadius: "50%",
                  backgroundColor: P.rose,
                  transform: `translateY(${-d * 24}px)`,
                  opacity: 0.6 + d * 0.4,
                }} />
              ))}
            </div>
          </div>
        )}

        {showResult && (
          <div style={{ opacity: resultOpacity }}>
            {[
              { label: "Je réponds", pct: Math.round(barA), color: P.rose, deep: P.roseDeep, track: P.roseLight, voted: true },
              { label: "Je l'ignore", pct: Math.round(barB), color: P.teal, deep: P.tealDeep, track: P.tealLight, voted: false },
            ].map((opt, i) => (
              <div key={i} style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {opt.voted && (
                      <div style={{ backgroundColor: opt.color, borderRadius: 8, padding: "2px 10px" }}>
                        <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>✓ MON VOTE</span>
                      </div>
                    )}
                    <span style={{ fontSize: 30, fontWeight: 700, color: opt.deep }}>{opt.label}</span>
                  </div>
                  <span style={{ fontSize: 36, fontWeight: 900, color: opt.deep }}>{opt.pct}%</span>
                </div>
                <div style={{ height: 16, borderRadius: 999, backgroundColor: opt.track, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${opt.pct}%`, backgroundColor: opt.color, borderRadius: 999 }} />
                </div>
              </div>
            ))}
            <p style={{ textAlign: "center", color: P.textLight, fontSize: 24, marginTop: 16 }}>1 247 votes</p>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ─── SCÈNE 3 : Dilemme Parfait ───
const Scene3Perfect: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardSpring = spring({ frame, fps, config: { damping: 14, stiffness: 70 } });
  const cardY = interpolate(cardSpring, [0, 1], [100, 0]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

  const btnPress = interpolate(frame, [15, 30, 40, 55], [1, 0.92, 0.92, 1], { extrapolateRight: "clamp" });
  const btnShadow = interpolate(frame, [15, 30, 40, 55], [8, 2, 2, 8], { extrapolateRight: "clamp" });
  const btnBrightness = interpolate(frame, [15, 30, 40, 55], [1, 0.85, 0.85, 1], { extrapolateRight: "clamp" });

  const showDots = frame >= 65 && frame < 115;
  const dot1 = Math.abs(Math.sin((frame - 65) * 0.3)) * (frame > 70 ? 1 : 0);
  const dot2 = Math.abs(Math.sin((frame - 72) * 0.3)) * (frame > 77 ? 1 : 0);
  const dot3 = Math.abs(Math.sin((frame - 79) * 0.3)) * (frame > 84 ? 1 : 0);

  const showBar = frame >= 115;
  const barFrame = frame - 115;

  const barPos = (() => {
    if (barFrame < 15) return interpolate(barFrame, [0, 15], [50, 80]);
    if (barFrame < 39) return interpolate(barFrame, [15, 39], [80, 20]);
    if (barFrame < 54) return interpolate(barFrame, [39, 54], [20, 70]);
    if (barFrame < 72) return interpolate(barFrame, [54, 72], [70, 30]);
    if (barFrame < 84) return interpolate(barFrame, [72, 84], [30, 60]);
    if (barFrame < 96) return interpolate(barFrame, [84, 96], [60, 40]);
    return interpolate(barFrame, [96, 117], [40, 51], { extrapolateRight: "clamp" });
  })();

  const barColor = (() => {
    const score = Math.abs(barPos - 50);
    if (score <= 2) return P.gold;
    if (score <= 10) return "#d4a800";
    return barPos > 50 ? P.rose : P.teal;
  })();

  const isPerfect = showBar && Math.abs(barPos - 50) <= 2 && frame > 230;
  const glowOpacity = isPerfect ? Math.abs(Math.sin((frame - 230) * 0.08)) * 0.7 + 0.2 : 0;
  const borderColor = isPerfect ? `rgba(240,192,0,${0.5 + Math.abs(Math.sin((frame - 230) * 0.08)) * 0.5})` : P.border;

  const badgeOpacity = interpolate(frame, [235, 255], [0, 1], { extrapolateRight: "clamp" });
  const badgeScale = spring({ frame: frame - 235, fps, config: { damping: 10 } });

  const textOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const textY = interpolate(frame, [0, 20], [20, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg, fontFamily: "sans-serif", padding: "60px 60px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center" }}>

      <div style={{ textAlign: "center", opacity: textOpacity, transform: `translateY(${textY}px)`, marginBottom: 150 }}>
        <p style={{ fontSize: 52, fontWeight: 900, color: P.text, lineHeight: 1.5, margin: 0, textTransform: "uppercase", letterSpacing: 2 }}>VOTE</p>
        <p style={{ fontSize: 52, fontWeight: 900, color: P.gold, lineHeight: 1.5, margin: 0, textTransform: "uppercase", letterSpacing: 2 }}>POUR LES DILEMMES PARFAITS.</p>
      </div>

      <div style={{
        backgroundColor: P.card,
        borderRadius: 36,
        padding: 48,
        border: `${isPerfect ? 4 : 3}px solid ${borderColor}`,
        transform: `translateY(${cardY}px)`,
        opacity: cardOpacity,
        boxShadow: isPerfect ? `0 0 60px rgba(240,192,0,${glowOpacity}), 0 8px 40px rgba(0,0,0,0.08)` : "0 8px 40px rgba(0,0,0,0.08)",
      }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ backgroundColor: "#fff0d0", borderRadius: 20, padding: "6px 20px", display: "inline-block" }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: "#c07800" }}>🎯 DILEMME PARFAIT</span>
          </div>
        </div>

        <p style={{ fontSize: 36, fontWeight: 800, color: P.text, lineHeight: 1.3, margin: "0 0 36px 0" }}>
          "Tu préfères pouvoir lire dans les pensées ou être invisible ?"
        </p>

        {!showDots && !showBar && (
          <div style={{ display: "flex", gap: 20 }}>
            {[
              { label: "Lire les pensées", bg: P.roseLight, color: P.roseDeep, press: false },
              { label: "Être invisible", bg: P.tealLight, color: P.tealDeep, press: true },
            ].map((opt, i) => (
              <div key={i} style={{
                flex: 1,
                backgroundColor: opt.bg,
                borderRadius: 24,
                padding: "28px 20px",
                textAlign: "center",
                transform: opt.press ? `scale(${btnPress})` : "scale(1)",
                boxShadow: opt.press ? `0 ${btnShadow}px 20px rgba(0,0,0,0.1)` : "0 8px 20px rgba(0,0,0,0.1)",
                filter: opt.press ? `brightness(${btnBrightness})` : "brightness(1)",
              }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: opt.color }}>{opt.label}</span>
              </div>
            ))}
          </div>
        )}

        {showDots && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontSize: 30, color: P.textMid, marginBottom: 24, fontWeight: 600 }}>Calcul des votes…</p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
              {[dot1, dot2, dot3].map((d, i) => (
                <div key={i} style={{
                  width: 16, height: 16, borderRadius: "50%",
                  backgroundColor: P.rose,
                  transform: `translateY(${-d * 24}px)`,
                  opacity: 0.6 + d * 0.4,
                }} />
              ))}
            </div>
          </div>
        )}

        {showBar && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: P.roseDeep }}>Lire les pensées</span>              
            <span style={{ fontSize: 32, fontWeight: 900, color: P.roseDeep }}>{Math.round(100 - barPos)}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ backgroundColor: P.teal, borderRadius: 8, padding: "2px 10px" }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>✓ MON VOTE</span>
                </div>
              <span style={{ fontSize: 28, fontWeight: 700, color: P.tealDeep }}>Être invisible</span>            
              </div>
              <span style={{ fontSize: 32, fontWeight: 900, color: P.tealDeep }}>{Math.round(barPos)}%</span>
            </div>

            <div style={{ position: "relative", marginBottom: 12 }}>
              <div style={{
                position: "absolute",
                top: -28,
                left: `${barPos}%`,
                transform: "translateX(-50%)",
                width: 48, height: 48, borderRadius: "50%",
                backgroundColor: barColor,
                boxShadow: `0 4px 20px ${barColor}80`,
                zIndex: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {isPerfect && <span style={{ fontSize: 20 }}>🎯</span>}
              </div>

              <div style={{ height: 16, borderRadius: 999, backgroundColor: "#f0ece6", overflow: "hidden", marginTop: 24, position: "relative" }}>
                <div style={{
                  position: "absolute", height: "100%", backgroundColor: barColor, borderRadius: 999,
                  left: barPos > 50 ? "50%" : `${barPos}%`,
                  right: barPos <= 50 ? "50%" : `${100 - barPos}%`,
                }} />
                <div style={{ position: "absolute", left: "50%", top: 0, width: 2, height: "100%", backgroundColor: "#c0b8b0", zIndex: 2 }} />
              </div>
            </div>

            <p style={{ textAlign: "center", color: P.textLight, fontSize: 24, marginTop: 20 }}>1 000 votes</p>

            {isPerfect && (
              <div style={{
                textAlign: "center", marginTop: 16,
                opacity: badgeOpacity,
                transform: `scale(${interpolate(badgeScale, [0, 1], [0.5, 1])})`,
              }}>
                <div style={{ backgroundColor: P.gold, borderRadius: 30, padding: "10px 32px", display: "inline-block" }}>
                  <span style={{ fontSize: 28, fontWeight: 900, color: "#7a5800" }}>🎯 DILEMME PARFAIT !</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
// ─── SCÈNE 4 : Poster un dilemme ───
const Scene4Post: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const textY = interpolate(frame, [0, 20], [20, 0], { extrapolateRight: "clamp" });

  const cardSpring = spring({ frame, fps, config: { damping: 14, stiffness: 70 } });
  const cardY = interpolate(cardSpring, [0, 1], [60, 0]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

  const amourActive = frame >= 25;
  const amourScale = interpolate(frame, [25, 35], [1, 1.05], { extrapolateRight: "clamp" });

  const questionText = "Mon ex me recontacte après 2 ans de silence...";
  const questionDisplayed = questionText.slice(0, Math.floor(interpolate(frame, [60, 100], [0, questionText.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));

  const optAText = "Je réponds";
  const optADisplayed = optAText.slice(0, Math.floor(interpolate(frame, [105, 125], [0, optAText.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));

  const optBText = "Je l'ignore";
  const optBDisplayed = optBText.slice(0, Math.floor(interpolate(frame, [130, 150], [0, optBText.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));

  const publishOpacity = interpolate(frame, [160, 175], [0, 1], { extrapolateRight: "clamp" });
  const publishPress = interpolate(frame, [185, 197, 207, 220], [1, 0.92, 0.92, 1], { extrapolateRight: "clamp" });

  const showSuccess = frame >= 225;
  const successOpacity = interpolate(frame, [225, 245], [0, 1], { extrapolateRight: "clamp" });
  const successScale = spring({ frame: frame - 300, fps, config: { damping: 10 } });

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg, fontFamily: "sans-serif", padding: "60px 60px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center" }}>

      <div style={{ textAlign: "center", opacity: textOpacity, transform: `translateY(${textY}px)`, marginBottom: 48 }}>
        <p style={{ fontSize: 52, fontWeight: 900, color: P.text, lineHeight: 1.5, margin: 0, textTransform: "uppercase", letterSpacing: 2 }}>PROPOSE TES</p>
        <p style={{ fontSize: 52, fontWeight: 900, color: P.gold, lineHeight: 1.5, margin: 0, textTransform: "uppercase", letterSpacing: 2 }}>PROPRES DILEMMES.</p>
      </div>

      {!showSuccess ? (
        <div style={{
          backgroundColor: P.card,
          borderRadius: 36,
          padding: 40,
          border: `3px solid ${P.border}`,
          transform: `translateY(${cardY}px)`,
          opacity: cardOpacity,
          boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
        }}>
          <p style={{ fontSize: 36, fontWeight: 900, color: P.text, margin: "0 0 24px 0" }}>Ton dilemme</p>

          <div style={{ backgroundColor: P.bg, borderRadius: 16, padding: "16px 20px", marginBottom: 24, border: `1.5px solid ${P.border}` }}>
            <span style={{ fontSize: 20, color: P.textLight }}>💡 Donne assez de contexte pour que les autres comprennent au mieux ton dilemme.</span>
          </div>

          <p style={{ fontSize: 18, fontWeight: 800, color: P.textLight, letterSpacing: 3, margin: "0 0 12px 0" }}>TYPE</p>
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <div style={{ backgroundColor: P.bg, borderRadius: 10, padding: "8px 16px", border: `1.5px solid ${P.border}` }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: P.textMid }}>🎯 DILEMME PARFAIT</span>
            </div>
          </div>

          <p style={{ fontSize: 18, fontWeight: 800, color: P.textLight, letterSpacing: 3, margin: "0 0 12px 0" }}>CATÉGORIES</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
            {[
              { id: "amour", label: "Amour", bg: "#fae0c0", text: "#b86820" },
              { id: "carriere", label: "Carrière", bg: "#d0e0f4", text: "#2e5898" },
              { id: "social", label: "Vie sociale", bg: "#cff0ea", text: "#2a8a7a" },
              { id: "argent", label: "Argent", bg: "#eef4c0", text: "#6a8010" },
              { id: "famille", label: "Famille", bg: "#e0daf4", text: "#5848a8" },
            ].map((cat) => {
              const active = amourActive && cat.id === "amour";
              return (
                <div key={cat.id} style={{
                  backgroundColor: active ? cat.bg : P.bg,
                  borderRadius: 10,
                  padding: "8px 16px",
                  border: `1.5px solid ${active ? cat.text : P.border}`,
                  transform: active ? `scale(${amourScale})` : "scale(1)",
                }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: active ? cat.text : P.textMid }}>{cat.label.toUpperCase()}</span>
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: 18, fontWeight: 800, color: P.textLight, letterSpacing: 3, margin: "0 0 10px 0" }}>LE DILEMME</p>
          <div style={{ backgroundColor: P.bg, borderRadius: 14, padding: "16px 20px", border: `1.5px solid ${questionDisplayed ? P.teal : P.border}`, marginBottom: 16, minHeight: 70 }}>
            <span style={{ fontSize: 22, color: questionDisplayed ? P.text : P.textLight }}>
              {questionDisplayed || "Décris ta situation avec du contexte..."}
            </span>
          </div>

          <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: P.roseDeep, letterSpacing: 3, margin: "0 0 8px 0" }}>OPTION A</p>
              <div style={{ backgroundColor: P.bg, borderRadius: 14, padding: "14px 18px", border: `1.5px solid ${optADisplayed ? P.rose : P.border}` }}>
                <span style={{ fontSize: 22, color: optADisplayed ? P.roseDeep : P.textLight }}>{optADisplayed || "Option A"}</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: P.tealDeep, letterSpacing: 3, margin: "0 0 8px 0" }}>OPTION B</p>
              <div style={{ backgroundColor: P.bg, borderRadius: 14, padding: "14px 18px", border: `1.5px solid ${optBDisplayed ? P.teal : P.border}` }}>
                <span style={{ fontSize: 22, color: optBDisplayed ? P.tealDeep : P.textLight }}>{optBDisplayed || "Option B"}</span>
              </div>
            </div>
          </div>

          <div style={{ opacity: publishOpacity, transform: `scale(${publishPress})` }}>
            <div style={{
              backgroundColor: optBDisplayed ? P.teal : P.border,
              borderRadius: 18,
              padding: "20px",
              textAlign: "center",
            }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: optBDisplayed ? "#fff" : P.textLight }}>Publier mon dilemme →</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          backgroundColor: P.card,
          borderRadius: 36,
          padding: 60,
          border: `3px solid ${P.border}`,
          boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
          opacity: successOpacity,
          transform: `scale(${interpolate(successScale, [0, 1], [0.8, 1])})`,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}>
          <div style={{
            width: 100, height: 100, borderRadius: "50%",
            backgroundColor: P.rose,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 52, color: "#fff", fontWeight: 900 }}>✓</span>
          </div>
          <p style={{ fontSize: 64, fontWeight: 900, color: P.text, margin: 0 }}>Posté !</p>
          <p style={{ fontSize: 28, color: P.textLight, margin: 0, fontWeight: 600 }}>Retour au feed…</p>
        </div>
      )}

    </AbsoluteFill>
  );
};

// ─── SCÈNE 5 : Badges ───
const Scene5Badges: React.FC = () => {
  const frame = useCurrentFrame();

  const textOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const textY = interpolate(frame, [0, 20], [20, 0], { extrapolateRight: "clamp" });
  const screenOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });
  const screenY = interpolate(frame, [10, 30], [40, 0], { extrapolateRight: "clamp" });

  const badges = [
  { icon: "🗳️", label: "PREMIER VOTE", earned: true, delay: 15 },
  { icon: "🔥", label: "SÉRIE X3", earned: true, delay: 25 },
  { icon: "⭐", label: "TOP VOTEUR", earned: true, delay: 35 },
  { icon: "💎", label: "MEGA VOTEUR", earned: false, delay: 45 },
  { icon: "✍️", label: "POSTEUR", earned: true, delay: 55 },
  { icon: "📝", label: "NARRATEUR", earned: false, delay: 65 },
  { icon: "🎯", label: "DILEMME PARFAIT", earned: true, delay: 75 },
  { icon: "💫", label: "MAÎTRE DU 50/50", earned: false, delay: 85 },
  { icon: "🌟", label: "POPULAIRE", earned: true, delay: 95 },
  { icon: "🚀", label: "VIRAL", earned: false, delay: 105 },
  { icon: "👑", label: "LÉGENDE", earned: false, delay: 115 },
  { icon: "🎭", label: "CONTEUR", earned: false, delay: 125 },
];

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg, fontFamily: "sans-serif", padding: "60px 60px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ textAlign: "center", opacity: textOpacity, transform: `translateY(${textY}px)`, marginBottom: 150 }}>
        <p style={{ fontSize: 52, fontWeight: 900, color: P.text, lineHeight: 1.5, margin: 0, textTransform: "uppercase", letterSpacing: 2 }}>COLLECTIONNE</p>
        <p style={{ fontSize: 52, fontWeight: 900, color: P.gold, lineHeight: 1.5, margin: 0, textTransform: "uppercase", letterSpacing: 2 }}>LES BADGES.</p>
      </div>

      <div style={{
        backgroundColor: P.card,
        borderRadius: 36,
        padding: 36,
        border: `3px solid ${P.border}`,
        boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
        opacity: screenOpacity,
        transform: `translateY(${screenY}px)`,
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          {badges.map((b, i) => {
            const badgeOpacity = interpolate(frame, [b.delay, b.delay + 15], [0, 1], { extrapolateRight: "clamp" });
            const badgeY = interpolate(frame, [b.delay, b.delay + 15], [20, 0], { extrapolateRight: "clamp" });
            return (
              <div key={i} style={{
                width: "30%",
                backgroundColor: b.earned ? P.card : P.bg,
                borderRadius: 18,
                border: `2px solid ${b.earned ? P.teal : P.border}`,
                padding: "16px 10px",
                textAlign: "center",
                opacity: badgeOpacity * (b.earned ? 1 : 0.45),
                transform: `translateY(${badgeY}px)`,
                boxShadow: b.earned ? "0 4px 12px rgba(0,0,0,0.06)" : "none",
              }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>{b.earned ? b.icon : "🔒"}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: b.earned ? P.text : P.textLight, letterSpacing: 0.3 }}>{b.label}</div>
                {b.earned && (
                  <div style={{ backgroundColor: P.roseLight, borderRadius: 8, padding: "3px 8px", marginTop: 6, display: "inline-block" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: P.roseDeep }}>DÉBLOQUÉ ✓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── SCÈNE 6 : CTA Download ───
const Scene6Download: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
  const logoScale = interpolate(logoSpring, [0, 1], [0.5, 1]);
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  const textOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });
  const textY = interpolate(frame, [20, 40], [20, 0], { extrapolateRight: "clamp" });

  const appStoreOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" });
  const appStoreY = interpolate(frame, [50, 70], [30, 0], { extrapolateRight: "clamp" });

  const googleOpacity = interpolate(frame, [70, 90], [0, 1], { extrapolateRight: "clamp" });
  const googleY = interpolate(frame, [70, 90], [30, 0], { extrapolateRight: "clamp" });

  const taglineOpacity = interpolate(frame, [100, 120], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg, fontFamily: "sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px" }}>

      {/* Logo */}
      <div style={{
        transform: `scale(${logoScale})`,
        opacity: logoOpacity,
        textAlign: "center",
        marginBottom: 40,
      }}>
        <span style={{ fontSize: 140, fontWeight: 900, color: P.text, letterSpacing: -6 }}>
          ORA<span style={{ color: P.teal }}>.</span>
        </span>
      </div>

      {/* Texte */}
      <div style={{
        opacity: textOpacity,
        transform: `translateY(${textY}px)`,
        textAlign: "center",
        marginBottom: 60,
      }}>
        <p style={{ fontSize: 52, fontWeight: 900, color: P.text, margin: 0, textTransform: "uppercase", letterSpacing: 2, lineHeight: 1.4 }}>TÉLÉCHARGE</p>
        <p style={{ fontSize: 52, fontWeight: 900, color: P.gold, margin: 0, textTransform: "uppercase", letterSpacing: 2, lineHeight: 1.4 }}>GRATUITEMENT.</p>
      </div>

      {/* App Store */}
<div style={{
  opacity: appStoreOpacity,
  transform: `translateY(${appStoreY}px)`,
  width: "100%",
  marginBottom: 20,
}}>
  <div style={{
    backgroundColor: P.text,
    borderRadius: 24,
    padding: "28px 40px",
    display: "flex",
    alignItems: "center",
    gap: 20,
  }}>
    <div style={{
      width: 60, height: 60,
      backgroundColor: "#fff",
      borderRadius: 14,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 36,
    }}>🍎</div>
    <div>
      <p style={{ fontSize: 20, color: "#ffffff80", margin: 0, fontWeight: 600 }}>DISPONIBLE SUR</p>
      <p style={{ fontSize: 36, color: "#fff", margin: 0, fontWeight: 900 }}>App Store</p>
    </div>
  </div>
</div>

{/* Google Play */}
<div style={{
  opacity: googleOpacity,
  transform: `translateY(${googleY}px)`,
  width: "100%",
  marginBottom: 48,
}}>
  <div style={{
    backgroundColor: P.card,
    borderRadius: 24,
    padding: "28px 40px",
    display: "flex",
    alignItems: "center",
    gap: 20,
    border: `3px solid ${P.border}`,
  }}>
    <div style={{
      width: 60, height: 60,
      background: "linear-gradient(135deg, #00d2ff, #00b894, #fdcb6e, #e17055)",
      borderRadius: 14,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 36,
    }}>▶</div>
    <div>
      <p style={{ fontSize: 20, color: P.textLight, margin: 0, fontWeight: 600 }}>BIENTÔT SUR</p>
      <p style={{ fontSize: 36, color: P.text, margin: 0, fontWeight: 900 }}>Google Play</p>
    </div>
  </div>
</div>

      {/* Tagline */}
      <div style={{ opacity: taglineOpacity, textAlign: "center" }}>
        <p style={{ fontSize: 28, color: P.textLight, margin: 0, fontWeight: 700, letterSpacing: 1 }}>
          POSE TES DILEMMES. VOIS CE QUE LES GENS PENSENT.
        </p>
      </div>

    </AbsoluteFill>
  );
};

export const OraPromo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={80}>
        <Scene1Logo />
      </Sequence>
      <Sequence from={80} durationInFrames={200}>
        <Scene2Vote />
      </Sequence>
      <Sequence from={280} durationInFrames={290}>
        <Scene3Perfect />
      </Sequence>
      <Sequence from={570} durationInFrames={280}>
        <Scene4Post />
      </Sequence>
      <Sequence from={850} durationInFrames={160}>
        <Scene5Badges />
      </Sequence>
      <Sequence from={1010} durationInFrames={210}>
        <Scene6Download />
      </Sequence>
    </AbsoluteFill>
  );
};