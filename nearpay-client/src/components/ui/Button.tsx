import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50";

        const variants = {
            primary: "bg-primary-600 text-white hover:bg-primary-500 shadow-sm",
            secondary: "bg-primary-50 text-primary-900 hover:bg-primary-100",
            outline: "border border-border bg-white hover:bg-muted text-foreground",
            ghost: "hover:bg-muted text-foreground",
        };

        const sizes = {
            sm: "h-9 px-3 text-sm",
            md: "h-10 px-4 py-2 text-sm",
            lg: "h-11 px-8 text-base",
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";
