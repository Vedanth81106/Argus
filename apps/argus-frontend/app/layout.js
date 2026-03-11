import "./globals.css";

export const metadata = {
    title: "Argus",
    description: "AI-Powered Repository Monitor",
    icons: {
        icon: "/tree.svg",
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <head>
            {/* Google Fonts Preconnect */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

            {/* Combined Google Font Links */}
            <link
                href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Cinzel:wght@400..900&family=Raleway:ital,wght@0,100..900;1,100..900&display=swap"
                rel="stylesheet"
            />
        </head>
        <body className="antialiased bg-background text-foreground">
        {children}
        </body>
        </html>
    );
}