"use client";

/** Skeleton using the new design system shimmer class */

function Bone({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`skeleton-shimmer rounded ${className}`}
      style={style}
    />
  );
}

export function TaskCardSkeleton() {
  return (
    <div
      className="w-full overflow-hidden rounded-md"
      style={{
        background: "var(--mc-panel)",
        border: "1px solid var(--mc-line)",
        padding: "12px 12px 12px 16px",
      }}
    >
      {/* Priority stripe */}
      <div
        className="absolute inset-y-0 left-0 w-[3px] rounded-l-md skeleton-shimmer"
        style={{ position: "relative", width: "100%", marginBottom: 10 }}
      />
      <div className="flex items-center justify-between mb-2.5">
        <Bone style={{ height: 8, width: 48 }} />
        <Bone style={{ height: 22, width: 22, borderRadius: "50%" }} />
      </div>
      <Bone style={{ height: 12, width: "85%", marginBottom: 6 }} />
      <Bone style={{ height: 12, width: "60%" }} />
      <div className="flex items-center gap-1.5 mt-3">
        <Bone style={{ height: 18, width: 40 }} />
        <Bone style={{ height: 18, width: 36 }} />
      </div>
    </div>
  );
}

export function KanbanColumnSkeleton() {
  return (
    <div className="flex flex-col min-w-0">
      <div className="flex items-center gap-2 mb-2.5">
        <Bone style={{ height: 16, width: 3, borderRadius: 2, flexShrink: 0 }} />
        <Bone style={{ height: 10, width: 64 }} />
        <Bone style={{ height: 18, width: 20, marginLeft: "auto" }} />
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function AgentListSkeleton() {
  return (
    <aside
      style={{
        width: "var(--w-left)",
        minWidth: "var(--w-left)",
        background: "var(--mc-panel)",
        borderRight: "1px solid var(--mc-line)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid var(--mc-line)" }}
      >
        <Bone style={{ height: 10, width: 40 }} />
        <Bone style={{ height: 10, width: 56 }} />
      </div>
      <div className="py-2 px-3 space-y-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-3 px-2 py-2">
            <Bone style={{ height: 36, width: 36, borderRadius: "50%", flexShrink: 0 }} />
            <div className="flex-1 space-y-1.5">
              <Bone style={{ height: 10, width: "65%" }} />
              <Bone style={{ height: 8, width: "45%" }} />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export function ActivityFeedSkeleton() {
  return (
    <section
      style={{
        width: "var(--w-right)",
        minWidth: "var(--w-right)",
        background: "var(--mc-panel)",
        borderLeft: "1px solid var(--mc-line)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid var(--mc-line)" }}
      >
        <Bone style={{ height: 10, width: 52 }} />
        <Bone style={{ height: 10, width: 20 }} />
      </div>
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Bone style={{ height: 24, width: 24, borderRadius: "50%", flexShrink: 0, marginTop: 2 }} />
            <div className="flex-1 space-y-1.5 pt-1">
              <div className="flex justify-between gap-2">
                <Bone style={{ height: 10, width: "50%" }} />
                <Bone style={{ height: 10, width: 36 }} />
              </div>
              <Bone style={{ height: 9, width: "80%" }} />
              <Bone style={{ height: 9, width: "60%" }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
