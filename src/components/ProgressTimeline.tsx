import type { SceneDefinition } from './GuidedWalkthrough.js';

interface ProgressTimelineProps {
  scenes: readonly SceneDefinition[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function ProgressTimeline({ scenes, activeIndex, onSelect }: ProgressTimelineProps) {
  return (
    <nav className="timeline" aria-label="Walkthrough scenes">
      {scenes.map((scene, index) => (
        <button
          type="button"
          key={scene.id}
          className={index === activeIndex ? 'timeline-step active' : 'timeline-step'}
          aria-current={index === activeIndex ? 'step' : undefined}
          onClick={() => onSelect(index)}
          data-testid={`scene-tab-${index + 1}`}
        >
          <span>{String(index + 1).padStart(2, '0')}</span>
          {scene.shortTitle}
        </button>
      ))}
    </nav>
  );
}
