"use client";

import { motion } from "motion/react";
import clsx from "clsx";

interface AnimatedTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

//TODO: Fix the layout shift that happens on re-render of page

export default function AnimatedTabs({
  tabs,
  activeTab,
  onTabChange,
}: AnimatedTabsProps) {
  function firstLetterUpperCase(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return (
    <div className="flex gap-2 bg-zinc-950 border border-zinc-900 rounded-lg p-2">
      {tabs.map((tab) => (
        <motion.ul
          layout
          className={clsx(
            "relative cursor-pointer px-2 py-1 font-open-runde outline-none transition-colors",
            activeTab === tab ? "text-zinc-950" : "text-zinc-400"
          )}
          tabIndex={0}
          key={tab}
          onFocus={() => onTabChange(tab)}
          onMouseOver={() => onTabChange(tab)}
          onMouseLeave={() => onTabChange(tab)}
        >
          {activeTab === tab ? (
            <motion.div
              layoutId="tab-indicator"
              className="absolute inset-0 rounded-lg bg-zinc-100"
            />
          ) : null}
          <span className="relative text-inherit">
            {firstLetterUpperCase(tab)}
          </span>
        </motion.ul>
      ))}
    </div>
  );
}
