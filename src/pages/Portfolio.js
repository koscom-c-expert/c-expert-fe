import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import Logo from '../assets/logo-on-white.png';
import DownArrow from '../assets/down_arrow.svg';
import {PieChart, Pie, Cell} from 'recharts';
import {Home, User, Plus, X} from 'lucide-react';

function Portfolio() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("Guest");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const data = [
        {name: "트럼프 수혜주", value: 2147783647, percentage: 58, color: "#4A90E2"},
        {name: "트럼프 악재주", value: 147783647, percentage: 24, color: "#8B6BE2"},
        {name: "나머지", value: 47783647, percentage: 18, color: "#B23F9E"}
    ];

    const tableData = [
        {type: "트럼프 수혜주", symbol: "APPL", avgPrice: "12,345원", holding: "67주", totalValue: "1,234,567원"},
        {type: "트럼프 수혜주", symbol: "APPL", avgPrice: "12,345원", holding: "67주", totalValue: "1,234,567원"},
        {type: "트럼프 수혜주", symbol: "APPL", avgPrice: "12,345원", holding: "67주", totalValue: "1,234,567원"}
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="container mx-auto px-4">
                    <div className="h-16 flex items-center justify-between">
                        {/* Logo and Navigation */}
                        <img src={Logo} alt="Logo" className="h-8"/>
                        <nav className="flex space-x-16">
                            <a href="#" className="flex items-center text-gray-600 hover:text-gray-900">
                                홈
                            </a>
                            <a href="#" className="flex items-center text-gray-900 font-medium">
                                내 포트폴리오
                            </a>
                        </nav>
                        {/* User Profile */}
                        <div className="flex flex-row justify-between items-center space-x-2 w-32 cursor-pointer">
                            <div className="flex flex-row items-center">
                                <div
                                    className="w-9 h-9 rounded-3xl content-center"
                                    style={{
                                        background: 'linear-gradient(90deg, #3498DB 0%, #7474C7 100%)'
                                    }}>
                                    <p className="font-bold text-white text-xl">{username.charAt(0)}</p>
                                </div>
                                <span className="truncate ml-2">{username}</span>
                            </div>
                            <img className="size-4" src={DownArrow}/>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Title */}
                <h1 className="text-3xl font-bold mb-8 text-left">내 포트폴리오.</h1>

                {/* Portfolio Overview and Classification */}
                <div className="grid xl:grid-cols-2 gap-8 mb-8 items-start">
                    {/* Portfolio Overview */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-medium mb-6">포트폴리오 개요</h2>
                        <div className="flex">
                            <div className="w-1/2 relative">
                                <div className="w-64 h-64 mx-auto">
                                    <PieChart width={256} height={256}>
                                        <Pie
                                            data={data}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={120}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {data.map((entry, index) => (
                                                <Cell key={index} fill={entry.color}/>
                                            ))}
                                        </Pie>
                                    </PieChart>
                                    <div
                                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                        <div className="text-sm text-gray-600">총 자산</div>
                                        <div className="text-xl font-bold">2,147,783,647원</div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-1/2 pl-6">
                                {data.map((item, index) => (
                                    <div key={index} className="mb-6">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-gray-600">{item.name}</span>
                                        </div>
                                        <div className="flex justify-between text-xl font-bold">
                                            {item.value.toLocaleString()}원
                                            <span className="px-3 py-1 rounded-full text-white text-sm"
                                                  style={{backgroundColor: item.color}}>
                                                {Math.round((item.value / 2147783647) * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Classification */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-medium mb-6">분류하기</h2>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="예시) 금리 인하"
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                            <button
                                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                                AI 분류 시작
                            </button>
                        </div>
                    </div>
                </div>

                {/* Holdings */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-medium">보유 종목 현황</h2>
                        <button
                            onClick={() => setIsDialogOpen(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2"/>
                            종목 추가
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50">
                                <th className="px-4 py-2">분류</th>
                                <th className="px-4 py-2">종목명</th>
                                <th className="px-4 py-2">평균매입가</th>
                                <th className="px-4 py-2">보유수량</th>
                                <th className="px-4 py-2">평가금액</th>
                            </tr>
                            </thead>
                            <tbody>
                            {tableData.map((row, index) => (
                                <tr key={index} className="border-b">
                                    <td className="px-4 py-2">
                      <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                        {row.type}
                      </span>
                                    </td>
                                    <td className="px-4 py-2">{row.symbol}</td>
                                    <td className="px-4 py-2">{row.avgPrice}</td>
                                    <td className="px-4 py-2">{row.holding}</td>
                                    <td className="px-4 py-2">{row.totalValue}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>


            {/* Custom Modal */}
            {isDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-[425px] relative">
                        {/* Header */}
                        <div className="px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-medium">종목 편집</h2>
                            <button
                                onClick={() => setIsDialogOpen(false)}
                                className="rounded-full p-1 hover:bg-gray-100"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-left">종목명</label>
                                <input
                                    type="text"
                                    placeholder="APPL"
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-left">평균매입가</label>
                                    <input
                                        type="text"
                                        placeholder="1,234,567"
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-left">보유 수량</label>
                                    <input
                                        type="text"
                                        placeholder="12"
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-between items-center">
                                <p className="px-4 py-2 text-gray-400 cursor-pointer">제거하기</p>
                                <div className="flex justify-end space-x-2 pt-4">
                                    <button
                                        onClick={() => setIsDialogOpen(false)}
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                    >
                                        취소
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                    >
                                        확인
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Portfolio;