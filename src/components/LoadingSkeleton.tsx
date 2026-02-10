"use client";

import { useDarkMode } from "@/context/DarkModeContext";

export function TaskCardSkeleton() {
  const { isDarkMode } = useDarkMode();

  return (
    <div
      className={`w-full rounded-lg border p-3 space-y-3 animate-pulse ${
        isDarkMode
          ? "border-gray-700 bg-gray-750"
          : "border-gray-200 bg-gray-100"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={`flex-1 h-5 rounded ${
            isDarkMode ? "bg-gray-700" : "bg-gray-200"
          }`}
        />
        <div
          className={`h-5 w-16 rounded-full ${
            isDarkMode ? "bg-gray-700" : "bg-gray-200"
          }`}
        />
      </div>
      <div className="space-y-2">
        <div
          className={`h-3 rounded ${
            isDarkMode ? "bg-gray-700" : "bg-gray-200"
          }`}
        />
        <div
          className={`h-3 w-3/4 rounded ${
            isDarkMode ? "bg-gray-700" : "bg-gray-200"
          }`}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          <div
            className={`h-5 w-5 rounded ${
              isDarkMode ? "bg-gray-700" : "bg-gray-200"
            }`}
          />
          <div
            className={`h-5 w-5 rounded ${
              isDarkMode ? "bg-gray-700" : "bg-gray-200"
            }`}
          />
        </div>
        <div
          className={`h-3 w-12 rounded ${
            isDarkMode ? "bg-gray-700" : "bg-gray-200"
          }`}
        />
      </div>
    </div>
  );
}

export function KanbanColumnSkeleton() {
  const { isDarkMode } = useDarkMode();

  return (
    <div
      className={`rounded-lg border flex flex-col ${
        isDarkMode
          ? "border-gray-700 bg-gray-800"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div
        className={`px-3 py-2 border-b flex items-center justify-between animate-pulse ${
          isDarkMode ? "border-gray-700 bg-gray-750" : "border-gray-200 bg-white"
        }`}
      >
        <div
          className={`h-4 w-24 rounded ${
            isDarkMode ? "bg-gray-700" : "bg-gray-200"
          }`}
        />
        <div
          className={`h-5 w-6 rounded-full ${
            isDarkMode ? "bg-gray-700" : "bg-gray-200"
          }`}
        />
      </div>
      <div className="p-2 space-y-2">
        {[1, 2, 3].map((i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function AgentListSkeleton() {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r ${
      isDarkMode
        ? "border-gray-700 bg-gray-800"
        : "border-gray-200 bg-white"
    }`}>
      <div className="p-4 space-y-2">
        <div
          className={`h-5 w-20 rounded ${
            isDarkMode ? "bg-gray-700" : "bg-gray-200"
          }`}
        />
        <div
          className={`h-3 w-32 rounded ${
            isDarkMode ? "bg-gray-700" : "bg-gray-200"
          }`}
        />
      </div>
      <div className="px-2 pb-4 space-y-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-md px-3 py-2 animate-pulse`}
          >
            <div
              className={`h-10 w-10 rounded-full flex-shrink-0 ${
                isDarkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
            <div className="min-w-0 flex-1 space-y-2">
              <div
                className={`h-4 w-24 rounded ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              />
              <div
                className={`h-3 w-20 rounded ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityFeedSkeleton() {
  const { isDarkMode } = useDarkMode();

  return (
    <section className={`w-full xl:w-96 shrink-0 border-t xl:border-t-0 xl:border-l ${
      isDarkMode
        ? "border-gray-700 bg-gray-800"
        : "border-gray-200 bg-white"
    }`}>
      <div className={`p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
        <div className="space-y-2">
          <div
            className={`h-5 w-20 rounded ${
              isDarkMode ? "bg-gray-700" : "bg-gray-200"
            }`}
          />
          <div
            className={`h-3 w-32 rounded ${
              isDarkMode ? "bg-gray-700" : "bg-gray-200"
            }`}
          />
        </div>
      </div>
      <div className="px-4 py-3 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse space-y-2">
            <div
              className={`h-3 w-20 rounded ${
                isDarkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
            <div className="space-y-2">
              <div
                className={`h-4 w-full rounded ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              />
              <div
                className={`h-3 w-3/4 rounded ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
