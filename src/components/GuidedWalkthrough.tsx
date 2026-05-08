import { useEffect, useMemo, useState } from 'react';
import { AdminInputScene } from './AdminInputScene.js';
import { ApiPayloadScene } from './ApiPayloadScene.js';
import { CodeDiffScene } from './CodeDiffScene.js';
import { GraphDemoScene } from './GraphDemoScene.js';
import { ObservedSignalScene } from './ObservedSignalScene.js';
import { ProgressTimeline } from './ProgressTimeline.js';
import { PublicUiScene } from './PublicUiScene.js';
import { TestResultsScene } from './TestResultsScene.js';

export interface SceneDefinition {
  id: string;
  shortTitle: string;
  render: () => JSX.Element;
}

const SCENE_DURATION_MS = 4200;

export function GuidedWalkthrough() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const scenes: SceneDefinition[] = useMemo(() => [
    { id: 'signal', shortTitle: 'Signal', render: () => <ObservedSignalScene /> },
    { id: 'source-data', shortTitle: 'Input', render: () => <AdminInputScene /> },
    { id: 'api-payload', shortTitle: 'Boundary', render: () => <ApiPayloadScene /> },
    { id: 'public-before', shortTitle: 'Before UI', render: () => <PublicUiScene mode="before" /> },
    { id: 'code-change', shortTitle: 'Fix', render: () => <CodeDiffScene /> },
    { id: 'public-after', shortTitle: 'After UI', render: () => <PublicUiScene mode="after" /> },
    { id: 'graph-demo', shortTitle: 'Graph', render: () => <GraphDemoScene /> },
    { id: 'regression-tests', shortTitle: 'Tests + AI', render: () => <TestResultsScene /> },
  ], []);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % scenes.length);
    }, SCENE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [activeIndex, isPlaying, scenes.length]);

  const selectScene = (index: number) => {
    setActiveIndex(index);
    setIsPlaying(false);
  };

  const goPrevious = () => {
    setActiveIndex((current) => (current - 1 + scenes.length) % scenes.length);
    setIsPlaying(false);
  };

  const goNext = () => {
    setActiveIndex((current) => (current + 1) % scenes.length);
    setIsPlaying(false);
  };

  const restart = () => {
    setActiveIndex(0);
    setIsPlaying(true);
  };

  return (
    <div className="walkthrough-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">README-driven frontend case study</p>
          <h1>Public locality rendering should not require perfect raw data</h1>
          <p>
            An anonymized, synthetic walkthrough of a tiny careers-filter inconsistency,
            the deterministic boundary fix, and a graph view that makes one-off aberrations visible.
          </p>
        </div>
        <div className="hero-card">
          <strong>{String(activeIndex + 1).padStart(2, '0')} / {String(scenes.length).padStart(2, '0')}</strong>
          <span>{isPlaying ? 'Autoplaying' : 'Paused for review'}</span>
        </div>
      </header>

      <ProgressTimeline scenes={scenes} activeIndex={activeIndex} onSelect={selectScene} />

      <div className="scene-host" data-scene-id={scenes[activeIndex].id}>
        {scenes[activeIndex].render()}
      </div>

      <footer className="controls" aria-label="Walkthrough controls">
        <button type="button" onClick={() => setIsPlaying((value) => !value)}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button type="button" onClick={goPrevious}>Previous</button>
        <button type="button" onClick={goNext}>Next</button>
        <button type="button" onClick={restart}>Restart</button>
      </footer>
    </div>
  );
}
