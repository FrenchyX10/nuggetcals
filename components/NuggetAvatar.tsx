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
          <g className={`nug-face-g face-${shownFace}`} transform="translate(50 51)">
            <FaceMark face={shownFace} hideEyes={accessory === "shades" && !exploded} />
          </g>
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

function AccessoryMark({ kind }: { kind: NuggetAccessory }) {
  if (kind === "none") return null;
  if (kind === "crown") {
    return (
      <g transform="translate(50 27)">
        <path
          d="M-14 8 L-14 -2 L-7 4 L0 -6 L7 4 L14 -2 L14 8 Z"
          fill="#f0b45a"
          stroke="#c9842a"
          strokeWidth="1"
        />
        <circle cx="-14" cy="-3" r="1.8" fill="#ffd48a" />
        <circle cx="0" cy="-7" r="2" fill="#ff8a3d" />
        <circle cx="14" cy="-3" r="1.8" fill="#ffd48a" />
      </g>
    );
  }
  if (kind === "chef") {
    return (
      <g transform="translate(50 24)">
        <ellipse cx="0" cy="-6" rx="13" ry="9" fill="#f6ecdc" />
        <rect x="-11" y="-2" width="22" height="10" rx="3" fill="#f6ecdc" />
        <rect x="-13" y="7" width="26" height="4" rx="1.5" fill="#e8d8c4" />
      </g>
    );
  }
  if (kind === "sprout") {
    return (
      <g transform="translate(50 26)">
        <path d="M0 10 C0 2 0 -2 0 -8" stroke="#3d6b3a" strokeWidth="1.8" fill="none" />
        <ellipse cx="-5" cy="-6" rx="5" ry="3.2" fill="#7dcea0" transform="rotate(-28)" />
        <ellipse cx="5" cy="-7" rx="5" ry="3.2" fill="#5bbf86" transform="rotate(24)" />
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
      <g transform="translate(50 41)">
        <path
          d="M-22 1 Q0 -9 22 1 L18 9 Q0 3 -18 9 Z"
          fill="#c23b2e"
          stroke="#8d261c"
          strokeWidth="0.6"
        />
        <path d="M17 6 L26 14 L15 11 Z" fill="#c23b2e" />
      </g>
    );
  }
  return null;
}
