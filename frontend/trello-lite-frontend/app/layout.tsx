import "./globals.css";
import { AuthProvider } from "@/src/context/AuthContext";
import { ProjectProvider } from "@/src/context/ProjectContext";
import { TaskProvider } from "@/src/context/TaskContext";

import { ThemeProvider } from "@/src/context/ThemeContext";

// ... existing code ...

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
            rel="stylesheet"
        />
        <body>
        <ThemeProvider>
            <AuthProvider>
                <ProjectProvider>
                    <TaskProvider>{children}</TaskProvider>
                </ProjectProvider>
            </AuthProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
