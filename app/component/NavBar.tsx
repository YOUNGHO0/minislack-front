'use client';
import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, User } from 'lucide-react';

const ImprovedNavbar = () => {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const router = useRouter();

    const pathname = usePathname();
    const segments = pathname.split("/"); // ['', 'space', '671', 'main', '110']
    const isExactDepth = segments.length === 4; // ['', 'space', '671', 'main']

    const basePath = segments.length >= 3 ? `/${segments[1]}/${segments[2]}` : "/";

    const menuItems = [
        { id: 'home', icon: Home, label: '홈', path: '' },
        { id: 'profile', icon: User, label: '프로필', path: 'profile' }
    ];

    const handleClick = (id: string, path: string) => {
        setActiveMenu(id);
        router.push(`${basePath}/${path}`);
    };

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="bg-neutral-500 border-neutral-600 lg:order-first hidden lg:flex lg:flex-col p-1 lg:left-0 lg:top-0 lg:h-full lg:w-15  border-r shadow-sm z-50">
                <div className="flex flex-col items-center pt-4 gap-3">
                    {menuItems.map(({ id, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => handleClick(id, id === 'home' ? '' : id)}
                            className={`p-3 rounded-lg transition-all duration-200 group  ${
                                activeMenu === id
                                    ? 'transition-transform duration-200 stroke-transparent bg-blue-50 text-blue-600 shadow-md'
                                    : 'text-white hover:bg-gray-50 hover:text-white-900'
                            }`}
                        >
                            <Icon
                                className={`w-5 h-5 transition-transform  duration-200 ${
                                    activeMenu === id ? 'scale-110' : 'group-hover:scale-105'
                                }`}
                            />
                        </button>
                    ))}
                </div>
                <div className="flex-1" />
            </nav>

            {/* Mobile Navigation - 보여줄 경로 깊이만 허용 */}
            {isExactDepth && (
                <nav className="lg:hidden fixed bottom-0 left-0 right-0  border-t border-gray-200 shadow-lg pt-1 z-30">
                    <div className="flex items-center justify-around">
                        {menuItems.map(({ id, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => handleClick(id, id === 'home' ? '' : id)}
                                className={`relative flex flex-col-reverse items-center p-2 rounded-lg transition-all duration-200 ${
                                    activeMenu === id
                                        ? 'text-blue-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <span className={`text-xs mt-1 font-medium ${
                                    activeMenu === id ? 'text-blue-600' : 'text-gray-500'
                                }`}>
                                </span>
                                <Icon
                                    className={`w-5 h-5 transition-transform duration-200 ${
                                        activeMenu === id ? 'scale-110' : ''
                                    }`}
                                />
                                {activeMenu === id && (
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </nav>
            )}
        </>
    );
};

export default ImprovedNavbar;
