import {CssBaseline} from "@mui/material"
import Navbar from "./_components/Navbar"
import Providers from "./providers"
import StoreProvider from "@/app/StoreProvider";
import DataSourceProvider from "@/app/contexts/DataSourceContext";
import {useAppDispatch} from "@/lib/state/Hooks";
import {useEffect} from "react";
import {NodeOptions} from "@/lib/data/osh/Node";
import {addNode} from "@/lib/state/OSHSlice";
import { LanguageProvider } from "./contexts/LanguageContext";


export default function RootLayout({children,}: {
    children: React.ReactNode
}) {

    return (
        <html lang="en">
        <body>
        <Providers>
            <StoreProvider>
                <LanguageProvider>
                    <CssBaseline/>
                    <DataSourceProvider>
                        <Navbar>
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
