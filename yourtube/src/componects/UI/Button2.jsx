import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import clsx from "clsx";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400 hover:cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-[#000000] text-white hover:bg-[#383636]", // blue
        destructive: "bg-[#dc2626] text-white hover:bg-[#b91c1c]", // red
        secondary: "bg-[#e5e7eb] text-[#111827] hover:bg-[#d1d5db]", // gray
        outline: "border border-[#d1d5db] bg-white text-[#111827] hover:bg-[#f9fafb]", // outline style
        ghost: "bg-transparent text-[#2563eb] hover:bg-[#eff6ff]", // subtle transparent
        link: "text-[#2563eb] underline-offset-4 hover:underline", // link style
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={clsx(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
