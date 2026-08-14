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
  const shownFace = exploded ? "boom" : face;

  return (
    <div className={`nug-stage ${exploded ? "is-boom" : ""}`}>
      <div
        className={`nug-bob color-${color}`}
        style={{ transform: `scale(${exploded ? 0.2 : scale})` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="nug-body" src="/nugget.jpg" alt="Your Nugget" />
        <svg className="nug-fit" viewBox="0 0 100 100" aria-hidden>
          {color === "spider" && !exploded ? <SpiderSuit /> : null}
          <g className={`nug-face-g face-${shownFace}`} transform="translate(50 51)">
            <FaceMark
              face={shownFace}
              hideEyes={
                (accessory === "shades" || color === "spider") && !exploded
              }
            />
          </g>
          {color === "spider" && !exploded ? <SpiderEyes /> : null}
          {!exploded ? <AccessoryMark kind={accessory} /> : null}
        </svg>
      </div>
      {exploded ? <p className="nug-boom-label">BOOM</p> : null}
    </div>
  );
}

function FaceMark({ face, hideEyes = false }: { face: string; hideEyes?: boolean }) {
  if (face === "boom") {
    return (
      <>
        <path d="M-16-10 L-8-2 M-8-10 L-16-2" stroke="#3a2414" strokeWidth="2.2" />
        <path d="M8-10 L16-2 M16-10 L8-2" stroke="#3a2414" strokeWidth="2.2" />
        <path d="M-7 8 Q0 3 7 8" fill="none" stroke="#3a2414" strokeWidth="2" />
      </>
    );
  }
  if (face === "hearts") {
    return (
      <>
        {hideEyes ? null : (
          <>
            <path className="nug-heart" d="M-18-8 c0-4 6-6 8-2 c2-4 8-2 8 2 c0 5-8 9-8 9 s-8-4-8-9z" />
            <path className="nug-heart" d="M2-8 c0-4 6-6 8-2 c2-4 8-2 8 2 c0 5-8 9-8 9 s-8-4-8-9z" />
          </>
        )}
        <ellipse className="nug-mouth" cx="0" cy="10" rx="4.5" ry="3" />
      </>
    );
  }
  if (face === "cool") {
    return (
      <>
        {hideEyes ? null : (
          <>
            <rect x="-22" y="-8" width="18" height="7" rx="2.5" />
            <rect x="4" y="-8" width="18" height="7" rx="2.5" />
            <rect x="-5" y="-6" width="10" height="2.4" />
          </>
        )}
        <path d="M-8 9 Q0 15 8 9" fill="none" stroke="#3a2414" strokeWidth="2" />
      </>
    );
  }
  if (face === "sleepy") {
    return (
      <>
        {hideEyes ? null : (
          <>
            <path d="M-20-4 Q-13-9 -6-4" fill="none" stroke="#3a2414" strokeWidth="2.2" />
            <path d="M6-4 Q13-9 20-4" fill="none" stroke="#3a2414" strokeWidth="2.2" />
          </>
        )}
        <ellipse className="nug-mouth" cx="0" cy="11" rx="3.2" ry="1.8" />
      </>
    );
  }
  if (face === "wink") {
    return (
      <>
        {hideEyes ? null : <ellipse className="nug-eye" cx="-12" cy="-4" rx="4.2" ry="5.2" />}
        {hideEyes ? null : (
          <path d="M7-4 Q14-9 21-4" fill="none" stroke="#3a2414" strokeWidth="2.2" />
        )}
        <ellipse className="nug-mouth" cx="1" cy="10" rx="5" ry="3.2" />
      </>
    );
  }
  if (face === "sparkle") {
    return (
      <>
        {hideEyes ? null : (
          <>
            <ellipse className="nug-eye" cx="-12" cy="-4" rx="4.2" ry="5.2" />
            <ellipse className="nug-eye" cx="12" cy="-4" rx="4.2" ry="5.2" />
            <path className="nug-spark" d="M0-16 l1.2 3.4 3.4 1.2-3.4 1.2-1.2 3.4-1.2-3.4-3.4-1.2 3.4-1.2z" />
          </>
        )}
        <ellipse className="nug-mouth" cx="0" cy="10" rx="5.4" ry="3.6" />
      </>
    );
  }
  return (
    <>
      {hideEyes ? null : (
        <>
          <ellipse className="nug-eye" cx="-12" cy="-4" rx="4.2" ry="5.2" />
          <ellipse className="nug-eye" cx="12" cy="-4" rx="4.2" ry="5.2" />
        </>
      )}
      <ellipse className="nug-mouth" cx="0" cy="10" rx="5" ry="3.2" />
    </>
  );
}

function SpiderSuit() {
  return (
    <g className="nug-spider">
      <ellipse cx="28" cy="62" rx="16" ry="22" fill="#1e3a8a" opacity="0.78" />
      <ellipse cx="72" cy="62" rx="16" ry="22" fill="#1e3a8a" opacity="0.78" />
      <g stroke="#120e0b" strokeWidth="0.7" fill="none" opacity="0.72">
        <path d="M50 24 L50 78" />
        <path d="M32 32 Q50 38 68 32" />
        <path d="M28 44 Q50 50 72 44" />
        <path d="M30 56 Q50 62 70 56" />
        <path d="M34 68 Q50 72 66 68" />
        <path d="M38 28 L28 40 L24 56 L32 72" />
        <path d="M62 28 L72 40 L76 56 L68 72" />
        <path d="M46 26 L36 36 L30 50" />
        <path d="M54 26 L64 36 L70 50" />
      </g>
    </g>
  );
}

function SpiderEyes() {
  return (
    <g transform="translate(50 48)">
      <ellipse cx="-11" cy="0" rx="10" ry="7.5" fill="#f6ecdc" stroke="#120e0b" strokeWidth="1.3" />
      <ellipse cx="11" cy="0" rx="10" ry="7.5" fill="#f6ecdc" stroke="#120e0b" strokeWidth="1.3" />
      <ellipse cx="-13" cy="-1.5" rx="3" ry="2" fill="#120e0b" opacity="0.18" />
      <ellipse cx="9" cy="-1.5" rx="3" ry="2" fill="#120e0b" opacity="0.18" />
    </g>
  );
}

function AccessoryMark({ kind }: { kind: NuggetAccessory }) {
  if (kind === "none") return null;
  if (kind === "crown") {
    return (
      <g transform="translate(50 22)">
        <path
          d="M-18 11 L-18 -3 L-9 4 L0 -11 L9 4 L18 -3 L18 11 Z"
          fill="#ffd48a"
          stroke="#8a5a14"
          strokeWidth="1.4"
        />
        <rect x="-18.5" y="9" width="37" height="4.2" rx="1.2" fill="#e0b15a" stroke="#8a5a14" strokeWidth="0.8" />
        <circle cx="-12" cy="4" r="2.6" fill="#e23b4a" stroke="#7a1822" strokeWidth="0.5" />
        <circle cx="0" cy="1" r="3.1" fill="#3d8bff" stroke="#1a3f8a" strokeWidth="0.5" />
        <circle cx="12" cy="4" r="2.6" fill="#3dce78" stroke="#1a6b3c" strokeWidth="0.5" />
        <circle cx="-12" cy="3.1" r="0.8" fill="#fff" opacity="0.75" />
        <circle cx="0" cy="0" r="0.9" fill="#fff" opacity="0.75" />
        <circle cx="12" cy="3.1" r="0.8" fill="#fff" opacity="0.75" />
      </g>
    );
  }
  if (kind === "chef") {
    return (
      <g transform="translate(50 17)">
        <ellipse cx="0" cy="-8" rx="15" ry="11" fill="#f6ecdc" stroke="#c9b8a2" strokeWidth="0.7" />
        <rect x="-12" y="-3" width="24" height="11" rx="3" fill="#f6ecdc" />
        <rect x="-15" y="7" width="30" height="4.5" rx="1.6" fill="#e8d8c4" stroke="#c9b8a2" strokeWidth="0.6" />
      </g>
    );
  }
  if (kind === "sprout") {
    return (
      <g transform="translate(50 16)">
        <path d="M0 12 C0 4 0 -2 0 -11" stroke="#3d6b3a" strokeWidth="2" fill="none" />
        <ellipse cx="-6" cy="-9" rx="6" ry="3.6" fill="#7dcea0" transform="rotate(-30 -6 -9)" />
        <ellipse cx="6" cy="-10" rx="6" ry="3.6" fill="#5bbf86" transform="rotate(26 6 -10)" />
      </g>
    );
  }
  if (kind === "bow") {
    return (
      <g transform="translate(66 32)">
        <ellipse cx="-6" cy="0" rx="6" ry="4.2" fill="#e35d7a" />
        <ellipse cx="6" cy="0" rx="6" ry="4.2" fill="#e35d7a" />
        <circle cx="0" cy="0" r="2.4" fill="#ff8aa3" />
      </g>
    );
  }
  if (kind === "shades") {
    return (
      <g transform="translate(50 47)">
        <rect x="-23" y="-8" width="20" height="12" rx="3.5" fill="#1a1208" />
        <rect x="3" y="-8" width="20" height="12" rx="3.5" fill="#1a1208" />
        <rect x="-4" y="-3.2" width="8" height="2.4" fill="#1a1208" />
        <rect x="-21" y="-5" width="9" height="3.2" rx="1" fill="#7dcea0" opacity="0.28" />
        <rect x="5" y="-5" width="9" height="3.2" rx="1" fill="#7dcea0" opacity="0.28" />
      </g>
    );
  }
  if (kind === "bandana") {
    return (
      <g transform="translate(50 33)">
        <path
          d="M-22 1 Q0 -8 22 1 L18 8 Q0 2 -18 8 Z"
          fill="#c23b2e"
          stroke="#8d261c"
          strokeWidth="0.6"
        />
        <path d="M17 5 L26 13 L15 10 Z" fill="#c23b2e" />
      </g>
    );
  }
  return null;
}
