"use client";

import * as React from 'react';
import {useEffect} from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // 변경된 아이콘
import FeedbackIcon from '@mui/icons-material/Feedback';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import {usePathname, useRouter} from "next/navigation";
import axios from "axios";

export default function HomeAppBar() {
    const pathname = usePathname();
    const router = useRouter();

    const pathSegments = pathname.split("/").filter(Boolean);
    const isSpacePath = pathSegments[0] === "space";
    const shouldHideAppBar = isSpacePath && pathSegments.length >= 2;

    const [isLogin, setIsLoggedIn] = React.useState(false);
    const [drawerOpen, setDrawerOpen] = React.useState(false);

    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user`, {withCredentials: true})
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

    const logout = () => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/logout`, {withCredentials: true})
            .then(() => {
                setIsLoggedIn(false);
                router.push("/");
            });
    };

    const toggleDrawer = (open: boolean) => () => {
        setDrawerOpen(open);
    };

    const drawerList = (
        <Box
            sx={{width: 250}}
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
        >
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => router.push("/profile")}>
                        <ListItemIcon><AccountCircleIcon/></ListItemIcon>
                        <ListItemText primary="프로필"/>
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => router.push("/feedback")}>
                        <ListItemIcon><FeedbackIcon/></ListItemIcon>
                        <ListItemText primary="피드백"/>
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider/>
        </Box>
    );

    return (
        <Box>
            <AppBar position="static" style={{background: "#f77915"}}>
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{mr: 2}}
                        onClick={toggleDrawer(true)}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                        EliveChat
                    </Typography>
                    {isLogin
                        ? <Button onClick={logout} color="inherit">Logout</Button>
                        : <Button onClick={() => {
                            router.push(`/login${pathname ? `?redirect=${pathname}` : ""}`);
                        }} color="inherit">Login</Button>
                    }
                </Toolbar>
            </AppBar>
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
            >
                {drawerList}
            </Drawer>
        </Box>
    );
}
