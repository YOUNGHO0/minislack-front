import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import MuiChip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import EdgesensorHighRoundedIcon from '@mui/icons-material/EdgesensorHighRounded';
import ViewQuiltRoundedIcon from '@mui/icons-material/ViewQuiltRounded';

const items = [
    {
        icon: <ViewQuiltRoundedIcon />,
        title: '멀티 채널 채팅',
        description: '관심 주제에 대한 채널을 만들 수 있습니다.',
        image: `url(/images/main.png)`,
    },
    {
        icon: <EdgesensorHighRoundedIcon />,
        title: '초대 코드 생성',
        description: '초대 코드를 생성해 해당 코드를 입력해야 참가 가능한 방을 생성합니다.',
        image: `url(/images/createRoom.png)`,
    },
    {
        icon: <DevicesRoundedIcon />,
        title: '사용자 멘션',
        description: '채팅에 참여한 사용자를 쉽게 멘션할 수 있습니다',
        image: `url(/images/mention.png)`,
    },
];

interface ChipProps {
    selected?: boolean;
}

const Chip = styled(MuiChip)<ChipProps>(({ theme }) => ({
    variants: [
        {
            props: ({ selected }) => !!selected,
            style: {
                background:
                    'linear-gradient(to bottom right, hsl(210, 98%, 48%), hsl(210, 98%, 35%))',
                color: 'hsl(0, 0%, 100%)',
                borderColor: (theme.vars || theme).palette.primary.light,
                '& .MuiChip-label': {
                    color: 'hsl(0, 0%, 100%)',
                },
            },
        },
    ],
}));

interface MobileLayoutProps {
    selectedItemIndex: number;
    handleItemClick: (index: number) => void;
    selectedFeature: (typeof items)[0];
}

export function MobileLayout({
                                 selectedItemIndex,
                                 handleItemClick,
                                 selectedFeature,
                             }: MobileLayoutProps) {
    if (!items[selectedItemIndex]) {
        return null;
    }

    return (
        <Box
            sx={{
                display: { xs: 'flex', sm: 'none' },
                flexDirection: 'column',
                gap: 2,
            }}
        >
            <Box sx={{ display: 'flex', gap: 2, overflow: 'auto' }}>
                {items.map(({ title }, index) => (
                    <Chip
                        size="medium"
                        key={index}
                        label={title}
                        onClick={() => handleItemClick(index)}
                        selected={selectedItemIndex === index}
                    />
                ))}
            </Box>
            <Card
                variant="outlined"
                sx={{
                    backgroundColor: '#fff', // 다크모드에서도 흰색 유지
                }}
            >
                <Box
                    sx={{
                        mb: 2,
                        minHeight: 280,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundImage: items[selectedItemIndex].image,
                        backgroundColor: '#fff', // 이미지 영역도 흰색 유지
                    }}
                />
                <Box sx={{ px: 2, pb: 2 }}>
                    <Typography
                        gutterBottom
                        sx={{ color: 'text.primary', fontWeight: 'medium' }}
                    >
                        {selectedFeature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                        {selectedFeature.description}
                    </Typography>
                </Box>
            </Card>
        </Box>
    );
}

export default function Features() {
    const [selectedItemIndex, setSelectedItemIndex] = React.useState(0);

    const handleItemClick = (index: number) => {
        setSelectedItemIndex(index);
    };

    const selectedFeature = items[selectedItemIndex];

    return (
        <Container id="features" sx={{ py: { xs: 8, sm: 16 }  }}>
            <Box sx={{ width: { sm: '100%', md: '60%' } }}>
                <Typography
                    component="h2"
                    variant="h4"
                    gutterBottom
                    sx={{ color: 'text.primary' }}
                >
                    기능
                </Typography>
                <Typography
                    variant="body1"
                    sx={{ color: 'text.secondary', mb: { xs: 2, sm: 4 } }}
                />
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row-reverse' },
                    gap: 2,
                }}
            >
                <div>
                    <Box
                        sx={{
                            display: { xs: 'none', sm: 'flex' },
                            flexDirection: 'column',
                            gap: 2,
                            height: '100%',
                        }}
                    >
                        {items.map(({ icon, title, description }, index) => (
                            <Box
                                key={index}
                                component={Button}
                                onClick={() => handleItemClick(index)}
                                sx={[
                                    (theme) => ({
                                        p: 2,
                                        height: '100%',
                                        width: '100%',
                                        '&:hover': {
                                            backgroundColor: (theme.vars || theme).palette.action.hover,
                                        },
                                    }),
                                    selectedItemIndex === index && {
                                        backgroundColor: 'action.selected',
                                    },
                                ]}
                            >
                                <Box
                                    sx={[
                                        {
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'left',
                                            gap: 1,
                                            textAlign: 'left',
                                            textTransform: 'none',
                                            color: 'text.secondary',
                                        },
                                        selectedItemIndex === index && {
                                            color: 'text.primary',
                                        },
                                    ]}
                                >
                                    {icon}
                                    <Typography variant="h6">{title}</Typography>
                                    <Typography variant="body2">{description}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                    <MobileLayout
                        selectedItemIndex={selectedItemIndex}
                        handleItemClick={handleItemClick}
                        selectedFeature={selectedFeature}
                    />
                </div>
                <Box
                    sx={{
                        display: { xs: 'none', sm: 'flex' },
                        width: { xs: '100%', md: '70%' },
                        height: 500,
                    }}
                >
                    <Card
                        variant="outlined"
                        sx={{
                            height: '100%',
                            width: '100%',
                            display: { xs: 'none', sm: 'flex' },
                            pointerEvents: 'none',
                            backgroundColor: '#fff', // 다크모드에서도 흰색 유지
                        }}
                    >
                        <Box
                            sx={{
                                m: 'auto',
                                width: 500,
                                height: 500,
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                backgroundImage: items[selectedItemIndex].image,
                                backgroundColor: '#fff', // 이미지 영역도 흰색 유지
                            }}
                        />
                    </Card>
                </Box>
            </Box>
        </Container>
    );
}
