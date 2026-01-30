import clsx from "clsx";
import React from "react";

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, ...rest } = props;
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50",
        className
      )}
      {...rest}
    />
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      className={clsx(
        "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black",
        className
      )}
      {...rest}
    />
  );
}

export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  const { className, ...rest } = props;
  return (
    <label className={clsx("text-sm font-medium", className)} {...rest} />
  );
}

export function Card({
  title,
  children,
  right,
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {title && (
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div className="text-sm font-semibold">{title}</div>
          {right}
        </div>
      )}
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}
