"use client";

import { PlusSignIcon, SidebarLeftIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, type ReactNode } from "react";

export interface NavItem {
  label: string;
  icon?: React.ReactNode;
}

export interface MacOSSidebarProps {
  items: NavItem[];
  defaultOpen?: boolean;
  selectedIndex?: number;
  onSelect?: (index: number) => void;
  header?: React.ReactNode;
  children?: ReactNode;
  className?: string;
}

export function MacOSSidebar({
  items,
  defaultOpen = true,
  selectedIndex = 0,
  onSelect,
  header,
  children,
  className = "",
}: MacOSSidebarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  return (
    <div
      className={`flex h-full relative w-full sm:min-w-[480px] overflow-hidden ${className}`}
    >
      <motion.div
        animate={{
          width: isOpen ? 240 : 64,
        }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
        className={`shrink-0 flex flex-col items-start transition-colors duration-900 ease-out border-r border-to-border ${
          isOpen ? "bg-to-panel" : "bg-transparent"
        }`}
      >
        <div
          className={`flex items-center w-full min-h-14 ${
            isOpen ? "justify-between" : "justify-center"
          } text-to-muted px-4 shrink-0 border-b border-transparent`}
        >
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {header}
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            layout
            className="shrink-0 flex items-center justify-center"
          >
            <HugeiconsIcon
              icon={SidebarLeftIcon}
              className="size-5 cursor-pointer hover:text-to-text transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            />
          </motion.div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex flex-col gap-1 mt-2 px-3 w-full relative z-10 whitespace-nowrap overflow-y-auto"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {items.map((item, index) => {
                const isActive = selectedIndex === index;
                return (
                  <div
                    key={item.label}
                    className="relative cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onClick={() => onSelect?.(index)}
                  >
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 z-0 bg-to-blue/10 border border-to-blue/40 rounded-lg"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        />
                      )}
                    </AnimatePresence>
                    <div
                      className={`relative z-10 flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                        isActive
                          ? "text-to-blue font-medium"
                          : "text-to-muted"
                      }`}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      <span className="tracking-tight truncate">{item.label}</span>
                    </div>
                    <AnimatePresence>
                      {hoveredIndex === index && !isActive && (
                        <motion.span
                          layoutId="sidebar-hover-bg"
                          className="absolute inset-0 z-0 bg-to-panel2 rounded-lg"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 30,
                          }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="flex-1 w-full h-full min-h-full overflow-hidden flex flex-col z-0">
        {children}
      </div>
    </div>
  );
}
