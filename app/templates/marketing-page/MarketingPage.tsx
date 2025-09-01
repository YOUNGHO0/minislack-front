import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import AppTheme from '../shared-theme/AppTheme';
import Hero from './components/Hero';
import Features from './components/Features';

import Footer from './components/Footer';
import {createTheme, ThemeProvider} from "@mui/material/styles";

export default function MarketingPage(props: { disableCustomTheme?: boolean }) {

    // 테마 오렌지색 적용
    const theme = createTheme({
        palette: {
            primary: {
                main: '#f77915',
            },
        },
    });


    return (

        <AppTheme {...props}>
            <ThemeProvider theme={theme}>
                <CssBaseline enableColorScheme/>
                <Hero/>
                <div>
                    <Features/>
                    <Footer/>
                </div>

            </ThemeProvider>
        </AppTheme>


    );
}
