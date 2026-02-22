import React from "react";

interface AvatarProps {
    src?: string;
    alt?: string;
    initials?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ src, alt, initials, className = "", size = 'md' }: AvatarProps) {

    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
    };

    return (
        <div className={`relative flex items-center justify-center shrink-0 overflow-hidden rounded-full bg-primary-100 text-primary-900 ${sizeClasses[size]} ${className}`}>
            {src ? (
                <img
                    src={src}
                    alt={alt || "Avatar"}
                    className="aspect-square h-full w-full object-cover"
                />
            ) : (
                <span className="font-medium uppercase">{initials || "U"}</span>
            )}
        </div>
    );
}
