"use client";

import type { Activity } from "@/types";
import { timeAgo } from "@/lib/time";

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <section className="w-full xl:w-96 shrink-0 border-t xl:border-t-0 xl:border-l border-gray-200 bg-white">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-900">Activity</h2>
        <p className="text-xs text-gray-500 mt-1">Recent events across the squad</p>
      </div>
      <ul className="px-4 pb-4 space-y-3">
        {activities.length === 0 ? (
          <li className="text-xs text-gray-400">No activity yet</li>
        ) : (
          activities.map((a) => (
            <li key={a._id} className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-gray-700">{a.type}</span>
                <span className="text-xs text-gray-500">{timeAgo(a.createdAt)}</span>
              </div>
              <div className="mt-1 text-sm text-gray-900">{a.message}</div>
              <div className="mt-1 text-xs text-gray-500">by {a.agentId}</div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
