"use client";

import React from "react";
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from "@clerk/themes";

export default function ClerkModal({ children }){
    return(
        <ClerkProvider
            appearance={{
                baseTheme: dark,
                variables: {
                    colorPrimary: "#f43f5e",
                    colorBackground: "#020617",
                    colorInputBackground: "#0a0f2e",
                    colorText: "#f8fafc",
                    colorTextSecondary: "#9ca3af",
                    colorInputText: "#f8fafc",
                    colorDanger: "#f43f5e",
                    fontFamily: "Space Grotesk, sans-serif",
                    borderRadius: "0px",
                },
                elements: {
                    card: {
                        backgroundColor: "#020617",
                        border: "1px solid rgba(124, 58, 237, 0.4)",
                        boxShadow: "0 0 40px rgba(124, 58, 237, 0.15)",
                    },
                    headerTitle: {
                        fontFamily: "Cinzel, serif",
                        background: "linear-gradient(to right, #7c3aed, #f43f5e, #eab308)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontSize: "1.5rem",
                    },
                    headerSubtitle: {
                        color: "#9ca3af",
                    },
                    formFieldInput: {
                        backgroundColor: "#0a0f2e",
                        border: "1px solid rgba(124, 58, 237, 0.3)",
                        color: "#f8fafc",
                        borderRadius: "0px",
                    },
                    formFieldLabel: {
                        color: "#9ca3af",
                    },
                    formButtonPrimary: {
                        backgroundColor: "#000000",
                        border: "1px solid #f8fafc",
                        color: "#f8fafc",
                        fontWeight: "700",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        borderRadius: "0px",
                        transform: "skewX(-12deg)",
                        transition: "all 0.3s",
                    },
                    socialButtonsBlockButton: {
                        backgroundColor: "#0a0f2e",
                        border: "1px solid rgba(124, 58, 237, 0.3)",
                        color: "#f8fafc",
                        borderRadius: "0px",
                    },
                    socialButtonsBlockButtonText: {
                        color: "#f8fafc",
                    },
                    dividerLine: {
                        backgroundColor: "#7c3aed",
                    },
                    dividerText: {
                        color: "#9ca3af",
                    },
                    identityPreviewText: {
                        color: "#f8fafc",
                    },
                    footerActionLink: {
                        color: "#eab308",
                    },
                    footerActionText: {
                        color: "#f8fafc",
                    },
                    footer: {
                        "& + div": { display: "none !important" },
                        "& > div > div:nth-child(2)": { display: "none !important" },
                    },
                    internal_footer_branding: {
                        display: "none !important",
                    },
                    devModeBadge: {
                        display: "none !important",
                    }
                },
            }}
        >
            {children}
        </ClerkProvider>
    );
};