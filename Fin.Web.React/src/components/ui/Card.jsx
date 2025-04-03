import React from "react";
import clsx from "clsx";

export function Card({ className, children }) {
  return (
    <div className={clsx("bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden", className)}>
      {children}
    </div>
  );
}

export function CardContent({ className, children }) {
  return (
    <div className={clsx("p-4", className)}>
      {children}
    </div>
  );
}