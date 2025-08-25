import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: 
          "bg-gray-800 text-white shadow-lg hover:bg-gray-700 hover:shadow-xl hover:scale-105 focus-visible:ring-gray-600 border border-gray-700 transition-all duration-300 [&_svg]:text-white",
        outline:
          "border-2 border-gray-800 bg-transparent text-gray-800 hover:bg-gray-800 hover:text-white hover:shadow-lg hover:scale-105 focus-visible:ring-gray-600 transition-all duration-300 [&_svg]:text-gray-800 hover:[&_svg]:text-white",
        ghost:
          "bg-transparent text-gray-800 hover:bg-gray-800/10 hover:scale-105 focus-visible:ring-gray-600 transition-all duration-300 [&_svg]:text-gray-800",
        white:
          "bg-white text-gray-800 shadow-lg hover:bg-gray-50 hover:shadow-xl hover:scale-105 focus-visible:ring-gray-600 border border-gray-200 transition-all duration-300 [&_svg]:text-gray-800",
        destructive:
          "bg-red-600 text-white shadow-lg hover:bg-red-700 hover:shadow-xl hover:scale-105 focus-visible:ring-red-500 transition-all duration-300 [&_svg]:text-white",
      },
      size: {
        sm: "h-8 px-3 text-xs gap-1",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };