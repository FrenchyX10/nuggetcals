import type { NuggetAccessory, NuggetColor, NuggetFace } from "@/lib/nugget";

export function NuggetAvatar({
  color,
  face,
  accessory,
  scale,
  exploded,
}: {
  color: NuggetColor;
  face: NuggetFace;
  accessory: NuggetAccessory;
  scale: number;
  exploded: boolean;
}) {
  return (
    <div className={`nug-stage ${exploded ? "is-boom" : ""}`}>
      <div
        className={`nug-bob color-${color}`}
        style={{ transform: `scale(${exploded ? 0.2 : scale})` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="nug-body" src="/nugget.jpg" alt="Your Nugget" />
        <svg className={`nug-face face-${exploded ? "boom" : face}`} viewBox="0 0 120 90" aria-hidden>
          {exploded ? (
            <>
              <text x="28" y="52" fontSize="28">
                x
              </text>
              <text x="78" y="52" fontSize="28">
                x
              </text>
              <path d="M48 68 Q60 58 72 68" fill="none" stroke="#3a2414" strokeWidth="4" />
            </>
          ) : face === "hearts" ? (
            <>
              <text x="22" y="48" fontSize="26">
                ♥
              </text>
              <text x="72" y="48" fontSize="26">
                ♥
              </text>
              <ellipse className="nug-mouth" cx="60" cy="66" rx="8" ry="5" />
            </>
          ) : face === "cool" ? (
            <>
              <rect x="18" y="34" width="34" height="12" rx="4" />
              <rect x="68" y="34" width="34" height="12" rx="4" />
              <rect x="50" y="38" width="20" height="4" />
              <path d="M46 66 Q60 76 74 66" fill="none" stroke="#3a2414" strokeWidth="4" />
            </>
          ) : face === "sleepy" ? (
            <>
              <path d="M24 44 Q36 36 48 44" fill="none" stroke="#3a2414" strokeWidth="4" />
              <path d="M72 44 Q84 36 96 44" fill="none" stroke="#3a2414" strokeWidth="4" />
              <ellipse className="nug-mouth" cx="60" cy="68" rx="6" ry="3" />
            </>
          ) : face === "wink" ? (
            <>
              <ellipse className="nug-eye" cx="38" cy="40" rx="8" ry="10" />
              <path d="M70 42 Q82 34 94 42" fill="none" stroke="#3a2414" strokeWidth="4" />
              <ellipse className="nug-mouth" cx="62" cy="66" rx="9" ry="6" />
            </>
          ) : face === "sparkle" ? (
            <>
              <ellipse className="nug-eye" cx="38" cy="40" rx="8" ry="10" />
              <ellipse className="nug-eye" cx="82" cy="40" rx="8" ry="10" />
              <text x="52" y="30" fontSize="14">
                ✦
              </text>
              <ellipse className="nug-mouth" cx="60" cy="66" rx="10" ry="7" />
            </>
          ) : (
            <>
              <ellipse className="nug-eye" cx="38" cy="40" rx="8" ry="10" />
              <ellipse className="nug-eye" cx="82" cy="40" rx="8" ry="10" />
              <ellipse className="nug-mouth" cx="60" cy="66" rx="9" ry="6" />
            </>
          )}
        </svg>
        {accessory !== "none" && !exploded ? (
          <div className={`nug-acc acc-${accessory}`} aria-hidden>
            {accessory === "bow" ? "🎀" : null}
            {accessory === "chef" ? "🧢" : null}
            {accessory === "shades" ? "🕶️" : null}
            {accessory === "crown" ? "👑" : null}
            {accessory === "sprout" ? "🌱" : null}
            {accessory === "bandana" ? "🧣" : null}
          </div>
        ) : null}
      </div>
      {exploded ? <p className="nug-boom-label">BOOM</p> : null}
    </div>
  );
}
