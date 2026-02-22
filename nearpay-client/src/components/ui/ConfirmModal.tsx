"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false,
    isLoading = false,
}: ModalProps) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:bg-muted p-1 rounded-md transition-colors"
                        disabled={isLoading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-muted-foreground text-sm">
                        {description}
                    </p>
                </div>

                <div className="flex items-center justify-end gap-3 p-4 border-t border-border bg-slate-50 rounded-b-xl">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={isDestructive ? "bg-red-600 hover:bg-red-700 text-white border-transparent" : ""}
                    >
                        {isLoading ? "Loading..." : confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
