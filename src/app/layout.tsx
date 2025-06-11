import {CssBaseline} from "@mui/material"
import Navbar from "./_components/Navbar"
import Providers from "./providers"
import StoreProvider from "@/app/StoreProvider";
import DataSourceProvider from "@/app/contexts/DataSourceContext";
// Unused imports: useAppDispatch, useEffect, NodeOptions, addNode. Consider removing them.
// import {useAppDispatch} from "@/lib/state/Hooks";
// import {useEffect} from "react";
// import {NodeOptions} from "@/lib/data/osh/Node";
// import {addNode} from "@/lib/state/OSHSlice";
import { LanguageProvider } from "./contexts/LanguageContext";


export default function RootLayout({children,}: {
    children: React.ReactNode
}) {

    return (
        <html lang="en"> {/* The lang attribute here could be dynamic based on i18n state if needed */}
        <body>
        <Providers>
            <StoreProvider>
                <LanguageProvider> {/* LanguageProvider wraps components that need language context */}
                    <CssBaseline/>
                    <DataSourceProvider>
                        <Navbar> {/* Navbar itself might use the language context for a selector */}
                            {children}
                        </Navbar>
                    </DataSourceProvider>
                </LanguageProvider>
            </StoreProvider>
        </Providers>
        </body>
    </html>
 )
}
