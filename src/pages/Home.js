import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import Logo from '../assets/logo-on-white.png';
import DownArrow from '../assets/down_arrow.svg';
import {PieChart, Pie, Cell} from 'recharts';
import {User, Plus, X} from 'lucide-react';

function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="container mx-auto px-4">
                    <div className="h-16 flex items-center justify-between">
                        {/* Logo and Navigation */}
                        <img src={Logo} alt="Logo" className="h-8 cursor-pointer" onClick={() => navigate("/")}/>
                        <nav className="flex space-x-16">
                            <p onClick={() => navigate("/")} className="flex items-center text-gray-900 font-medium cursor-pointer">
                                홈
                            </p>
                            <p onClick={() => navigate("/portfolio")} className="flex items-center text-gray-600 hover:text-gray-900 cursor-pointer">
                                내 포트폴리오
                            </p>
                        </nav>
                        {/* 무료로 시작하기 */}
                        <div className="flex items-center cursor-pointer rounded-3xl bg-black pt-2 pb-2 pl-4 pr-4">
                            <p className="text-white text-sm font-bold">무료로 시작하기</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
            </main>
        </div>
    );
}

export default Home;