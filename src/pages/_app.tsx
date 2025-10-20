import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from "next/head";
import { ThemeProvider } from "next-themes";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ThemeProvider attribute="class">
            <Head>
                <title>resumate</title>
            </Head>
            <div>
                <Component {...pageProps} />
            </div>
        </ThemeProvider>
    );
}

export default MyApp;