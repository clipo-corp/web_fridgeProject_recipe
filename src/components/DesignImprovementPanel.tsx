import { SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import {
  designImprovementSteps,
  type DesignImprovementStepId,
  useDesignImprovementControls,
} from "../lib/designImprovementSteps";

export function DesignImprovementPanel(): JSX.Element | null {
  const [open, setOpen] = useState(false);
  const {
    disableAll,
    enableAll,
    enabledStepIds,
    resetAll,
    setStepEnabled,
  } = useDesignImprovementControls();
  const enabledCount = enabledStepIds.size;
  const allEnabled = enabledCount === designImprovementSteps.length;
  const panelTitle = useMemo(
    () => `Design steps ${enabledCount}/${designImprovementSteps.length}`,
    [enabledCount],
  );

  if (!import.meta.env.DEV) {
    return null;
  }

  const toggleStep = (id: DesignImprovementStepId): void => {
    setStepEnabled(id, !enabledStepIds.has(id));
  };

  return (
    <aside className={open ? "design-step-panel design-step-panel--open" : "design-step-panel"}>
      <button
        type="button"
        className="design-step-panel__trigger"
        aria-expanded={open}
        aria-controls="design-step-panel-body"
        onClick={() => setOpen((value) => !value)}
      >
        <SlidersHorizontal size={15} aria-hidden="true" />
        <span>{panelTitle}</span>
      </button>

      {open ? (
        <div id="design-step-panel-body" className="design-step-panel__body">
          <div className="design-step-panel__actions">
            <button type="button" onClick={enableAll} disabled={allEnabled}>
              All on
            </button>
            <button type="button" onClick={disableAll} disabled={enabledCount === 0}>
              All off
            </button>
            <button type="button" onClick={resetAll}>
              Reset
            </button>
          </div>

          <div className="design-step-panel__list">
            {designImprovementSteps.map((step) => {
              const enabled = enabledStepIds.has(step.id);

              return (
                <label className="design-step-panel__row" key={step.id}>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => toggleStep(step.id)}
                  />
                  <span className="design-step-panel__index">
                    {String(step.id).padStart(2, "0")}
                  </span>
                  <span className="design-step-panel__title">{step.title}</span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
