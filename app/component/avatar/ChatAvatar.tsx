import {Avatar} from "@radix-ui/themes";

// 🎨 사용할 Radix 컬러 팔레트
const avatarColors = [
    "gray",
    "red",
    "blue",
    "green",
    "violet",
    "sky",
    "crimson",
    "plum",
    "teal",
    "indigo",
] as const;

type AvatarColor = (typeof avatarColors)[number];

// 이름 기반 해시 → 색상 선택
function getColorFromName(name: string | undefined): AvatarColor {
    if (!name) return "gray";
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % avatarColors.length;
    return avatarColors[index];
}

type ChatAvatarProps = {
    name?: string;
    size?: "1" | "2" | "3" | "4";   // Radix Avatar가 제공하는 사이즈
    variant?: "solid" | "soft";     // Avatar variant
    className?: string;             // Tailwind 같은 커스텀 클래스
    fallback?: string;              // 기본 fallback 문자
};

export default function ChatAvatar({
                                       name,
                                       size = "2",
                                       variant = "solid",
                                       className,
                                   }: ChatAvatarProps) {
    const color = getColorFromName(name);

    return (
        <Avatar
            size={size}
            variant={variant}
            color={color}
            fallback={name?.[0] || "U"}
            className={className}
        />
    );
}
