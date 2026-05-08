import type { ReactNode } from 'react';

interface SceneFrameProps {
  eyebrow: string;
  title: string;
  summary: string;
  children: ReactNode;
}

export function SceneFrame({ eyebrow, title, summary, children }: SceneFrameProps) {
  return (
    <section className="scene-frame" aria-labelledby="scene-title">
      <div className="scene-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="scene-title">{title}</h2>
        <p>{summary}</p>
      </div>
      <div className="scene-surface">{children}</div>
    </section>
  );
}
