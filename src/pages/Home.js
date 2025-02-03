import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import Logo from '../assets/logo-on-white.png';
import BlackLogo from '../assets/mock-logo-on-black.png';

function Home() {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <header className="bg-white">
                <div className="container mx-auto px-4">
                    <div className="h-16 flex items-center justify-between">
                        {/* Logo and Navigation */}
                        <img src={Logo} alt="Logo" className="h-8 cursor-pointer" onClick={() => navigate("/")}/>
                        <nav className="flex space-x-16 invisible lg:visible">
                            <p onClick={() => navigate("/")} className="flex items-center text-gray-900 font-medium cursor-pointer">
                                홈
                            </p>
                            <p onClick={() => navigate("/portfolio")} className="flex items-center text-gray-600 hover:text-gray-900 cursor-pointer">
                                내 포트폴리오
                            </p>
                        </nav>
                        {/* 무료로 시작하기 */}
                        <div className="flex items-center cursor-pointer rounded-3xl bg-black pt-2 pb-2 pl-4 pr-4">
                            <p className="text-white text-sm font-bold whitespace-nowrap" onClick={() => navigate("/portfolio")}>시작하기</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main
                className={`flex flex-col items-center justify-center`}
                style={{background: 'linear-gradient(180deg, white 0%, black 40px, black 100%)'}}>
                <div
                    className={`flex flex-col items-center justify-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <img src={BlackLogo} className="mt-12 w-[832px]"/>
                    <p className="font-bold text-4xl text-white mt-12">
                        주식 포트폴리오 관리
                    </p>
                    <div className="bg-white w-1 h-40 mt-4 mb-4"/>
                    <p className="font-bold text-4xl text-white">
                        누구보다 스마트하게.
                    </p>
                    <div
                        className="flex items-center cursor-pointer rounded-3xl bg-white pt-2 pb-2 pl-4 pr-4 mt-20 mb-16">
                        <p className="text-black text-sm font-bold" onClick={() => navigate("/portfolio")}>무료로 시작하기</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Home;