'use client'
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import { useRouter } from "next/navigation";

// 테마 오렌지색 적용
const theme = createTheme({
    palette: {
        primary: {
            main: '#f77915',
        },
    },
});

// StyledBox 정의
const StyledBox = styled('div')(({ theme }) => ({
    alignSelf: 'center',
    width: '100%',
    height: 400,
    marginTop: theme.spacing(8),
    borderRadius: (theme.vars || theme).shape.borderRadius,
    outline: '6px solid',
    outlineColor: 'hsla(30, 100%, 80%, 0.2)',
    border: '1px solid',
    borderColor: (theme.vars || theme).palette.grey[200],
    boxShadow: '0 0 12px 8px hsla(30, 100%, 80%, 0.2)',
    backgroundImage: `url(/images/full.png)`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    [theme.breakpoints.up('sm')]: {
        marginTop: theme.spacing(10),
        height: 700,
    },
}));

export default function Hero() {
    const router = useRouter();

    return (
        <ThemeProvider theme={theme}>
            <Box
                id="hero"
                sx={{
                    width: '100%',
                    backgroundRepeat: 'no-repeat',
                    backgroundImage:
                        'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(30, 100%, 90%), transparent)',
                }}
            >
                <Container
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        pt: { xs: 6, sm: 10 },
                        pb: { xs: 8, sm: 12 },
                    }}
                >
                    <Stack
                        spacing={2}
                        useFlexGap
                        sx={{ alignItems: 'center', width: { xs: '100%', sm: '70%' } }}
                    >
                        <Typography
                            variant="h1"
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: 'center',
                                fontSize: 'clamp(3rem, 10vw, 3.5rem)',
                                fontWeight: 700, // h1 기본 볼드 유지
                            }}
                        >
                            Elive chat&nbsp;
                            <Typography
                                component="span"
                                variant="h1"
                                sx={{
                                    fontSize: 'inherit',
                                    color: 'primary.main',
                                    fontWeight: 700, // 추가: 볼드 유지
                                }}
                            >
                                &nbsp; Enjoy Chatting
                            </Typography>
                        </Typography>

                        <Typography
                            sx={{
                                textAlign: 'center',
                                color: 'text.secondary',
                                width: { sm: '100%', md: '80%' },
                            }}
                        >
                            누구나 쉽게 사람들과 이야기할 수 있는 방을 만들고 관리할 수 있습니다.
                        </Typography>

                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1}
                            useFlexGap
                            sx={{ pt: 2, width: { xs: '100%', sm: '350px' } }}
                        >
                            <Button
                                onClick={() => router.push("/login")}
                                className={"w-full"}
                                variant="contained"
                                color="primary"
                                size="small"
                                style={{color:"white"}}
                                sx={{ minWidth: 'fit-content', fontWeight: 700 }} // 버튼도 굵게
                            >
                                시작하기
                            </Button>
                        </Stack>
                    </Stack>

                    <StyledBox id="image" />
                </Container>
            </Box>
        </ThemeProvider>
    );
}
