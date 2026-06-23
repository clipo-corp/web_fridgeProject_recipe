import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type DesignImprovementStepId =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20;

export type DesignImprovementStep = {
  readonly id: DesignImprovementStepId;
  readonly title: string;
};

export const designImprovementSteps: readonly DesignImprovementStep[] = [
  { id: 1, title: "Header blur/shadow" },
  { id: 2, title: "Brand mark soften" },
  { id: 3, title: "Hero background depth" },
  { id: 4, title: "Hero search focus ring" },
  { id: 5, title: "Sparkles motion" },
  { id: 6, title: "Card visual ratio/zoom" },
  { id: 7, title: "Card body rhythm" },
  { id: 8, title: "Card title 2 lines" },
  { id: 9, title: "Placeholder pattern calm" },
  { id: 10, title: "Carousel controls flow" },
  { id: 11, title: "Filter chip rail layout" },
  { id: 12, title: "Detail sticky close bar" },
  { id: 13, title: "Detail meta pills" },
  { id: 14, title: "Ingredient 2-column fit" },
  { id: 15, title: "Step number tone" },
  { id: 16, title: "Empty icon backing" },
  { id: 17, title: "Home chip border fix" },
  { id: 18, title: "Results search glass" },
  { id: 19, title: "Mobile filter overflow" },
  { id: 20, title: "Eyebrow spacing" },
] as const;

const storageKey = "fk-design-improvement-step-ids";

const allStepIds = designImprovementSteps.map((step) => step.id);

function isDesignImprovementStepId(value: unknown): value is DesignImprovementStepId {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    allStepIds.some((id) => id === value)
  );
}

function readStoredStepIds(): readonly DesignImprovementStepId[] {
  if (typeof window === "undefined") {
    return allStepIds;
  }

  const stored = window.localStorage.getItem(storageKey);
  if (stored === null) {
    return allStepIds;
  }

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return allStepIds;
    }

    const ids = parsed.filter(isDesignImprovementStepId);
    return ids.length > 0 ? ids : allStepIds;
  } catch {
    return allStepIds;
  }
}

export function designStepClassName(id: DesignImprovementStepId): string {
  return `fk-design-step-${String(id).padStart(2, "0")}`;
}

type DesignImprovementContextValue = {
  readonly enabledStepIds: ReadonlySet<DesignImprovementStepId>;
  readonly isStepEnabled: (id: DesignImprovementStepId) => boolean;
  readonly setStepEnabled: (id: DesignImprovementStepId, enabled: boolean) => void;
  readonly enableAll: () => void;
  readonly disableAll: () => void;
  readonly resetAll: () => void;
};

const DesignImprovementContext = createContext<DesignImprovementContextValue | null>(null);

export function DesignImprovementProvider({
  children,
}: {
  readonly children: ReactNode;
}): JSX.Element {
  const [enabledStepIds, setEnabledStepIds] = useState<ReadonlySet<DesignImprovementStepId>>(
    () => new Set(readStoredStepIds()),
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    for (const step of designImprovementSteps) {
      document.documentElement.classList.toggle(
        designStepClassName(step.id),
        enabledStepIds.has(step.id),
      );
    }
  }, [enabledStepIds]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      storageKey,
      JSON.stringify([...enabledStepIds].sort((a, b) => a - b)),
    );
  }, [enabledStepIds]);

  const value = useMemo<DesignImprovementContextValue>(
    () => ({
      enabledStepIds,
      isStepEnabled: (id) => enabledStepIds.has(id),
      setStepEnabled: (id, enabled) => {
        setEnabledStepIds((current) => {
          const next = new Set(current);
          if (enabled) {
            next.add(id);
          } else {
            next.delete(id);
          }
          return next;
        });
      },
      enableAll: () => setEnabledStepIds(new Set(allStepIds)),
      disableAll: () => setEnabledStepIds(new Set()),
      resetAll: () => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(storageKey);
        }
        setEnabledStepIds(new Set(allStepIds));
      },
    }),
    [enabledStepIds],
  );

  return (
    <DesignImprovementContext.Provider value={value}>
      {children}
    </DesignImprovementContext.Provider>
  );
}

export function useDesignImprovementControls(): DesignImprovementContextValue {
  const value = useContext(DesignImprovementContext);
  if (value === null) {
    throw new Error("useDesignImprovementControls must be used within DesignImprovementProvider");
  }
  return value;
}

export function useDesignImprovementStep(id: DesignImprovementStepId): boolean {
  return useDesignImprovementControls().isStepEnabled(id);
}
