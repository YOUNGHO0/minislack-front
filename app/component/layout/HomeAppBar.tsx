"use client";

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import {usePathname, useRouter} from "next/navigation";
import axios from "axios";
import {useEffect} from "react";

export default function HomeAppBar() {
    const pathname = usePathname();
    const router = useRouter();
    // 경로가 숨김 경로이거나 2단계 이상이면 AppBar 숨김
    const pathSegments = pathname.split("/").filter(Boolean); // 빈 문자열 제거
    const isSpacePath = pathSegments[0] === "space";
    const shouldHideAppBar = isSpacePath && pathSegments.length >= 2;
    const [isLogin,setIsLoggedIn] = React.useState(false);

    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user`, { withCredentials: true })
            .then(response => {
                if (response.status === 200) {
                    setIsLoggedIn(true);
                }
            })
            .catch(error => {
                if (error.response?.status === 401) {
                    setIsLoggedIn(false);
                }
            });
    }, []);


    if (shouldHideAppBar) {
        return null;
    }

    const logout = ()=>{
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/logout`, {withCredentials:true})
            .then(()=> setIsLoggedIn(false));
    }



    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        EChat
                    </Typography>
                    {isLogin ===true ? <Button onClick={logout} color="inherit">Logout</Button> : <Button onClick={()=>{router.push(`/login${pathname ? `?redirect=${pathname}` : "" }`)}} color="inherit">Login</Button>}
                </Toolbar>
            </AppBar>
        </Box>
    );
}
