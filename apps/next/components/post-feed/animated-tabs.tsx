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
    <motion.div
      className="flex gap-2 bg-zinc-900 border border-zinc-700 rounded-lg p-1"
      layout
      transition={{ duration: 0.0 }}
    >
      {tabs.map((tab) => (
        <ul
          className={clsx(
            "relative cursor-pointer px-2 py-1 font-semibold outline-none transition-colors",
            activeTab === tab ? "text-zinc-900" : "text-zinc-400"
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
              className="absolute inset-0 rounded-lg bg-white"
            />
          ) : null}
          <span className="relative text-inherit">
            {firstLetterUpperCase(tab)}
          </span>
        </ul>
      ))}
    </motion.div>
  );
}
