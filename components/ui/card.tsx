"use client";

import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const cardVariants = cva(
  "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border transition-all",
  {
    variants: {
      variant: {
        default: "shadow-sm",
        glass: "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-xl shadow-purple-500/5",
        academic: "bg-white dark:bg-zinc-950 border-slate-200/60 dark:border-zinc-800/60 shadow-md shadow-slate-200/50 dark:shadow-black/20",
        flat: "border-none shadow-none bg-transparent",
      },
      interactive: {
        true: "hover:shadow-lg hover:-translate-y-1 duration-300 cursor-pointer",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
    },
  }
);

interface CardProps extends React.ComponentProps<"div">, VariantProps<typeof cardVariants> { }

function Card({ className, variant, interactive, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, interactive, className }))}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h4
      data-slot="card-title"
      className={cn("leading-none", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
