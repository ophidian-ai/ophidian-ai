"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

type BaseProps = {
  label?: string;
  error?: string;
};

type InputFieldProps = BaseProps &
  InputHTMLAttributes<HTMLInputElement> & {
    multiline?: false;
  };

type TextareaFieldProps = BaseProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    multiline: true;
  };

export type InputProps = InputFieldProps | TextareaFieldProps;

const fieldClasses = [
  "w-full rounded-lg bg-surface border border-surface-border px-4 py-2.5 text-sm text-foreground",
  "placeholder:text-foreground-dim",
  "transition-colors duration-200",
  "focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none",
  "disabled:opacity-50 disabled:cursor-not-allowed",
].join(" ");

const errorFieldClasses =
  "border-red-500/60 focus:border-red-500 focus:ring-red-500";

export const Input = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps
>(function Input(props, ref) {
  const { label, error, className = "", ...rest } = props;
  const isMultiline = "multiline" in rest && rest.multiline;

  const classes = `${fieldClasses} ${error ? errorFieldClasses : ""} ${className}`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium uppercase tracking-wider text-foreground-dim">
          {label}
        </label>
      )}

      {isMultiline ? (
        (() => {
          const { multiline: _, ...textareaProps } = rest as TextareaFieldProps;
          return (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              className={`${classes} min-h-[120px] resize-y`}
              {...textareaProps}
            />
          );
        })()
      ) : (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          className={classes}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
});

export default Input;
