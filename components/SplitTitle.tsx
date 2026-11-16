interface SplitTitleProps {
  lines: string[];
}

/**
 * Per-letter reveal title. Letters are aria-hidden and the full text is
 * exposed once through aria-label so screen readers read it as one heading.
 */
export default function SplitTitle({ lines }: SplitTitleProps) {
  let counter = 0;
  const rows = lines.map((line) =>
    Array.from(line).map((ch) =>
      ch === " " ? { ch, delay: null } : { ch, delay: counter++ * 0.035 }
    )
  );

  return (
    <h2 className="slide-title" aria-label={lines.join(" ")}>
      {rows.map((row, li) => (
        <span className="title-line" aria-hidden="true" key={li}>
          {row.map((c, ci) =>
            c.delay === null ? (
              " "
            ) : (
              <span
                className="char"
                key={ci}
                style={{ transitionDelay: `${c.delay}s` }}
              >
                {c.ch}
              </span>
            )
          )}
        </span>
      ))}
    </h2>
  );
}