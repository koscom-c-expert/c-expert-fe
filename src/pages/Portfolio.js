import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import Logo from '../assets/logo-on-white.png';
import DownArrow from '../assets/down_arrow.svg';
import {PieChart, Pie, Cell} from 'recharts';
import {User, Plus, X} from 'lucide-react';

// tableData를 기반으로 chartData를 계산하는 함수
const getChartData = (data) => {
    // 각 type별 totalValue 합산
    const typeSums = {};
    data.forEach(item => {
        typeSums[item.type] = (typeSums[item.type] || 0) + item.totalValue;
    });

    // type별 합계를 배열로 변환 후 totalValue 기준 내림차순 정렬, 상위 3개 선택
    const sortedTypes = Object.entries(typeSums)
        .map(([type, totalValue]) => ({ type, totalValue }))
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 3);

    // 상위 3개 totalValue의 총합 (퍼센트 계산용)
    const totalSum = sortedTypes.reduce((sum, item) => sum + item.totalValue, 0);

    // 상위 3개 순서에 따른 고정 색상 배열
    const fixedColors = ["#4A90E2", "#8B6BE2", "#B23F9E"];

    // chartData 생성
    return sortedTypes.map((item, index) => ({
        name: item.type,
        value: item.totalValue,
        percentage: Math.round((item.totalValue / totalSum) * 100),
        color: fixedColors[index]
    }));
};

const addStock = async (userId, ticker, averagePurchasePrice, quantity) => {
    try {
        const response = await fetch('/api/v1/stocks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                ticker,
                averagePurchasePrice,
                quantity
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            data
        };
    } catch (error) {
        console.error('Error adding stock:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '주식 추가 중 오류가 발생했습니다.'
        };
    }
};

function Portfolio() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("Guest");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [tableData, setTableData] = useState([]);


    // 전체 tableData의 totalValue 합계를 계산
    const totalValueSum = tableData.reduce((sum, item) => sum + item.totalValue, 0);

    // chartData state (tableData 변경 시 자동 갱신)
    const [chartData, setChartData] = useState([]);

    const fetchStocks = async () => {
        try {
            const response = await fetch('/api/v1/stocks?userId=testUser');
            const result = await response.json();
            console.log(result);

            if (result.status === 'success' && result.data) {
                const transformedData = result.data.map(item => ({
                    type: "내 주식", // Default classification
                    ticker: item.ticker,
                    avgPrice: item.averagePurchasePrice,
                    quantity: item.quantity,
                    totalValue: item.averagePurchasePrice * item.quantity
                }));

                setTableData(transformedData);
            }
        } catch (error) {
            console.error('Failed to fetch stocks:', error);
        }
    };

    const [userId, setUserId] = useState("testUser");
    const [ticker, setTicker] = useState("");
    const [avgPrice, setAvgPrice] = useState();
    const [quantity, setQuantity] = useState();

    const addNewStock = async () => {
        const result = await addStock(userId, ticker, avgPrice, quantity);
        if (result.success) {
            alert('주식이 성공적으로 추가되었습니다.');
            setIsDialogOpen(false);
            fetchStocks()
        } else {
            alert.error('주식 추가 실패:', result.error);
        }
    }

    useEffect(() => {
        fetchStocks();
    }, []);

    // tableData가 변경될 때마다 chartData 재계산
    useEffect(() => {
        setChartData(getChartData(tableData));
    }, [tableData]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="container mx-auto px-4">
                    <div className="h-16 flex items-center justify-between">
                        {/* Logo and Navigation */}
                        <img src={Logo} alt="Logo" className="h-8 cursor-pointer" onClick={() => navigate("/")}/>
                        <nav className="flex space-x-16 invisible lg:visible">
                            <p onClick={() => navigate("/")} className="flex items-center text-gray-600 hover:text-gray-900 cursor-pointer">
                                홈
                            </p>
                            <p onClick={() => navigate("/portfolio")} className="flex items-center text-gray-900 font-medium cursor-pointer">
                                내 포트폴리오
                            </p>
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
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={120}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={index} fill={entry.color}/>
                                            ))}
                                        </Pie>
                                    </PieChart>
                                    <div
                                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                        <div className="text-sm text-gray-600">총 자산</div>
                                        <div className="text-xl font-bold">{totalValueSum.toLocaleString()}원</div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-1/2 pl-6">
                                {chartData.map((item, index) => (
                                    <div key={index} className="mb-6">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-gray-600">{item.name}</span>
                                        </div>
                                        <div className="flex justify-between text-xl font-bold">
                                            {item.value.toLocaleString()}원
                                            <span className="px-3 py-1 rounded-full text-white text-sm"
                                                  style={{backgroundColor: item.color}}>
                                                {Math.round((item.value / totalValueSum) * 100)}%
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
                                    <td className="px-4 py-2">{row.ticker}</td>
                                    <td className="px-4 py-2">{row.avgPrice.toLocaleString()}원</td>
                                    <td className="px-4 py-2">{row.quantity}주</td>
                                    <td className="px-4 py-2">{row.totalValue.toLocaleString()}원</td>
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
                                    value={ticker}
                                    onChange={(e) => setTicker(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-left">평균매입가</label>
                                    <input
                                        type="text"
                                        placeholder="1,234,567"
                                        className="w-full px-4 py-2 border rounded-lg"
                                        value={avgPrice}
                                        onChange={(e) => setAvgPrice(Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-left">보유 수량</label>
                                    <input
                                        type="text"
                                        placeholder="12"
                                        className="w-full px-4 py-2 border rounded-lg"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
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
                                        onClick={() => addNewStock()}
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