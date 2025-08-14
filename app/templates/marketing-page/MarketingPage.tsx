import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppTheme from '../shared-theme/AppTheme';
import Hero from './components/Hero';
import LogoCollection from './components/LogoCollection';
import Highlights from './components/Highlights';
import Pricing from './components/Pricing';
import Features from './components/Features';
import Testimonials from './components/Testimonials';

import Footer from './components/Footer';
import FAQ from "@/app/templates/marketing-page/components/FAQ";
import {createTheme, styled, ThemeProvider} from "@mui/material/styles";

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
      <CssBaseline enableColorScheme />
      <Hero />
      <div>
        <Features />
        <Footer />
      </div>

        </ThemeProvider>
    </AppTheme>


  );
}
