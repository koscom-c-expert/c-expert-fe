import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import Logo from '../assets/logo-on-white.png';
import DownArrow from '../assets/down_arrow.svg';
import {PieChart, Pie, Cell, Tooltip} from 'recharts';
import {User, Plus, X} from 'lucide-react';

// Add CSS for animations
const styles = {
    '@keyframes slideUp': {
        '0%': {
            opacity: 0,
            transform: 'translateY(20px)'
        },
        '100%': {
            opacity: 1,
            transform: 'translateY(0)'
        }
    },
    '.slide-up-enter': {
        animation: 'slideUp 0.3s ease-out forwards'
    }
};

// Add style tag to document head
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .slide-up-enter {
    animation: slideUp 0.3s ease-out forwards;
  }
`;
document.head.appendChild(styleSheet);

// tableData를 기반으로 chartData를 계산하는 함수
const getChartData = (data) => {
    const generateColor = (index, total) => {
        // Use HSL to generate colors with good spacing and consistent saturation/lightness
        const hue = (index * (360 / Math.max(total, 3))) % 360;
        return `hsl(${hue}, 70%, 45%)`; // 70% saturation, 45% lightness for vibrant but not too bright colors
    };

    // 각 type별 totalValue 합산
    const typeSums = {};
    data.forEach(item => {
        typeSums[item.type] = (typeSums[item.type] || 0) + item.totalValue;
    });

    // type별 합계를 배열로 변환 후 totalValue 기준 내림차순 정렬, 상위 3개 선택
    const sortedTypes = Object.entries(typeSums)
        .map(([type, totalValue]) => ({ type, totalValue }))
        .sort((a, b) => b.totalValue - a.totalValue);

    const fixedColors = ["#4A90E2", "#8B6BE2", "#B23F9E"];
    const totalSum = sortedTypes.reduce((sum, item) => sum + item.totalValue, 0);

    return sortedTypes.map((item, index) => ({
        name: item.type,
        value: item.totalValue,
        percentage: Math.round((item.totalValue / totalSum) * 100),
        color: index < 3 ? fixedColors[index] : generateColor(index - 3, Math.max(sortedTypes.length - 3, 1))
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

const updateStock = async (userId, stockId, ticker, averagePurchasePrice, quantity) => {
    try {
        const response = await fetch('/api/v1/stocks/' + stockId, {
            method: 'PUT',
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
        console.error('Error updating stock:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '주식 수정 중 오류가 발생했습니다.'
        };
    }
};

const deleteStock = async (stockId) => {
    try {
        const response = await fetch('/api/v1/stocks/' + stockId, {
            method: 'DELETE'
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
        console.error('Error deleting stock:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '주식 삭제 중 오류가 발생했습니다.'
        };
    }
};

function Portfolio() {
    const navigate = useNavigate();

    const popularKeyword = "테마";
    const newsKeyword = "트럼프 수혜주";
    const rebalancingCards = [
        {name: "", color: "#FFFFFF"},
        {name: "대폭 축소", color: "#D32F2F"},
        {name: "축소", color: "#F57C00"},
        {name: "유지", color: "#1976D2"},
        {name: "확대", color: "#388E3C"},
        {name: "대폭 확대", color: "#00796B"}
    ];

    // 사용자 아이디 입력
    const [userId, setUserId] = useState("");
    const [isUserDialogOpen, setIsUserDialogOpen] = useState(true);
    const [userIdInput, setUserIdInput] = useState("");

    const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
    const [isUpdateDialog, setIsUpdateDialog] = useState(false);
    const [isKeywordPopupVisible, setIsKeywordPopupVisible] = useState(false);
    const [isNewsPopupVisible, setIsNewsPopupVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [keyword, setKeyword] = useState("");

    const [tableData, setTableData] = useState([]);
    const totalValueSum = tableData.reduce((sum, item) => sum + item.totalValue, 0);
    const [chartData, setChartData] = useState([]);

    // 더보기
    const [showAll, setShowAll] = useState(false);
    const displayData = showAll ? chartData : chartData.slice(0, 3);
    const hasMoreItems = chartData.length > 3;

    // Dialog
    const [stockId, setStockId] = useState();
    const [ticker, setTicker] = useState("");
    const [avgPrice, setAvgPrice] = useState();
    const [quantity, setQuantity] = useState();

    const fetchStocks = async () => {
        try {
            const response = await fetch('/api/v1/stocks?userId=' + userId);
            const result = await response.json();

            if (result.status === 'success' && result.data) {
                const transformedData = result.data.map(item => ({
                    type: "분류 전", // Default classification
                    id: item.id,
                    ticker: item.ticker,
                    avgPrice: item.averagePurchasePrice,
                    quantity: item.quantity,
                    totalValue: item.averagePurchasePrice * item.quantity
                }));

                setTableData(transformedData);
            }
        } catch (error) {
            alert('작업을 처리하는 데 문제가 발생했습니다.');
            console.error('Failed to fetch stocks:', error);

            // mock data
            /*setTableData(
                [
                    {type: "트럼프 수혜주1", ticker: "APP1", avgPrice: 12345, quantity: 67, totalValue: 1234567},
                    {type: "트럼프 악재주2", ticker: "APP2", avgPrice: 11200, quantity: 50, totalValue: 560000},
                    {type: "나머지3", ticker: "APP3", avgPrice: 9870, quantity: 120, totalValue: 1184400},
                    {type: "트럼프 수혜주4", ticker: "APP4", avgPrice: 15230, quantity: 30, totalValue: 456900},
                    {type: "트럼프 악재주5", ticker: "APP5", avgPrice: 8400, quantity: 90, totalValue: 756000},
                    {type: "나머지", ticker: "APP6", avgPrice: 22100, quantity: 15, totalValue: 331500},
                    {type: "트럼프 수혜주", ticker: "APP7", avgPrice: 14500, quantity: 42, totalValue: 609000},
                    {type: "트럼프 악재주", ticker: "APP8", avgPrice: 10700, quantity: 88, totalValue: 941600},
                    {type: "나머지", ticker: "APP9", avgPrice: 7990, quantity: 70, totalValue: 559300},
                    {type: "트럼프 수혜주", ticker: "APP10", avgPrice: 19500, quantity: 25, totalValue: 487500}
                ]
            );*/
        }
    };

    const onClickAddOrModify = async () => {
        if (isUpdateDialog) {
            const result = await updateStock(userId, stockId, ticker, avgPrice, quantity);
            if (result.success) {
                alert('주식을 성공적으로 수정하였습니다.');
                setIsStockDialogOpen(false);
                fetchStocks()
            } else {
                alert('작업을 처리하는 데 문제가 발생했습니다.');
            }
        } else {
            const result = await addStock(userId, ticker, avgPrice, quantity);
            if (result.success) {
                alert('주식을 성공적으로 추가하였습니다.');
                setIsStockDialogOpen(false);
                fetchStocks()
            } else {
                alert('작업을 처리하는 데 문제가 발생했습니다.');
            }
        }
    }

    const onClickDelete = async () => {
        const result = await deleteStock(stockId);
        if (result.success) {
            alert('주식을 성공적으로 삭제하였습니다.');
            setIsStockDialogOpen(false);
            fetchStocks()
        } else {
            alert('작업을 처리하는 데 문제가 발생했습니다.');
        }
    }

    const classify = async (_keyword) => {
        setIsLoading(true);
        setKeyword(_keyword);
        try {
            const response = await fetch('/api/v1/classification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "keyword": _keyword,
                    "userId": userId
                }),
            });
            const result = await response.json();
            if (result.status === 'success' && result.data) {
                // 새로운 tableData 생성
                const updatedTableData = tableData.map(item => {
                    // response.data 배열에서 현재 item과 ticker가 일치하는 항목 찾기
                    const matchingStock = result.data.find(stock => stock.ticker === item.ticker);

                    // 매칭되는 항목이 있으면 type 업데이트, 없으면 기존 데이터 유지
                    if (matchingStock) {
                        return {
                            ...item,
                            type: matchingStock.newCategory,
                            reason: matchingStock.reason
                        };
                    }
                    return item;
                });

                // 상태 업데이트
                setTableData(updatedTableData);
            }
        } catch (error) {
            alert('작업을 처리하는 데 문제가 발생했습니다.');
            console.error('Failed to fetch stocks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateDialog = () => {
        if (userId.length === 0) {
            setIsUserDialogOpen(true);
            return;
        }

        setTicker("");
        setAvgPrice();
        setQuantity();
        setIsUpdateDialog(false);
        setIsStockDialogOpen(true);
    }

    const openUpdateDialog = (stockId, ticker, avgPrice, quantity) => {
        setStockId(stockId);
        setTicker(ticker);
        setAvgPrice(avgPrice);
        setQuantity(quantity);
        setIsUpdateDialog(true);
        setIsStockDialogOpen(true);
    }

    const rebalance = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/v1/rebalance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                    chartData.map(item => ({
                        category: item.name,
                        percentage: item.percentage
                    }))
                ),
            });

            const result = await response.json();
            if (result.status === 'success' && result.data) {
                const levelMapping = {};
                result.data.forEach((item) => {
                    levelMapping[item.category] = item.level;
                });

                // Update chartData with levels from the API response
                const updatedChartData = chartData.map(item => ({
                    ...item,
                    level: levelMapping[item.name] || 0  // Default to 0 if no mapping found
                }));

                setChartData(updatedChartData);
            }
        } catch (error) {
            alert('작업을 처리하는 데 문제가 발생했습니다.');
            console.error('Error adding stock:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const isThereReasonOnTableData = () => {
        return tableData.length >= 1 && tableData[0].reason !== undefined
    }

    const LoadingMessage = () => {
        const [currentEmoji, setCurrentEmoji] = useState(0);
        const emojis = ['🔥', '🍎', '🎈', '💖'];

        useEffect(() => {
            const interval = setInterval(() => {
                setCurrentEmoji((prev) => (prev + 1) % emojis.length);
            }, 500);

            return () => clearInterval(interval);
        }, []);

        return (
            <p className="text-gray-600 text-sm">
                AI 작업 진행 중...{emojis[currentEmoji]}
            </p>
        );
    };

    useEffect(() => {
        const timer1 = setTimeout(() => {
            setIsKeywordPopupVisible(true);
            setIsNewsPopupVisible(true);
        }, 1000);

        return () => {
            clearTimeout(timer1);
        };
    }, []);

    useEffect(() => {
        if (userId.length >= 1) {
            fetchStocks();
        }
    }, [userId]);

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
                        <div className="flex flex-row justify-between items-center space-x-2 w-32 cursor-pointer"
                             onClick={() => setIsUserDialogOpen(true)}>
                            {userId.length >= 1 ?
                                (<div className="flex flex-row items-center">
                                    <div
                                        className="w-9 h-9 rounded-3xl content-center"
                                        style={{
                                            background: 'linear-gradient(90deg, #3498DB 0%, #7474C7 100%)'
                                        }}>
                                        <p className="font-bold text-white text-xl">{userId.charAt(0)}</p>
                                    </div>
                                    <span className="truncate ml-2">{userId}</span>
                                </div>)
                                : (
                                    <p className="text-sm">로그인이 필요합니다</p>
                                )
                            }
                            {userId.length >= 1 && (
                                <img className="size-4" src={DownArrow}/>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Title */}
                <h1 className="text-3xl font-bold mb-8 text-left">내 포트폴리오</h1>

                {/* Portfolio Overview and Classification */}
                {chartData.length >= 1 &&
                    (<div className="grid lg:grid-cols-2 gap-8 mb-8 items-start">
                    {/* Portfolio Overview */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-medium mb-6">포트폴리오 개요</h2>
                            <div className="flex flex-col lg:flex-row">
                                <div className="lg:w-1/2">
                                    <div className="relative w-64 h-64 mx-auto">
                                        <div
                                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-32">
                                            <div className="text-sm text-gray-600">총 자산</div>
                                            <div className="text-xl font-bold">{totalValueSum.toLocaleString()}원</div>
                                        </div>
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
                                            <Tooltip
                                                formatter={(value, name, props) => [
                                                    `${value.toLocaleString()}원 (${props.payload.percentage}%)`,
                                                    props.payload.name
                                                ]}
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                                    transform: 'translate(-50%, -50%)'
                                                }}
                                                itemStyle={{
                                                    color: '#666666'
                                                }}
                                                cursor={false}
                                                position={{ x: 128, y: 128 }}
                                            />
                                        </PieChart>
                                    </div>
                                </div>
                                <div className="lg:w-1/2 lg:pl-6 flex flex-col items-center">
                                    {displayData.map((item, index) => (
                                        <div key={index} className="mb-6 w-full">
                                            <div className="flex items-center mb-1">
                                                <span className="text-gray-600 truncate">{item.name}</span>
                                                {item.level !== undefined && (
                                                    <span className="px-1 py-0.5 ml-1.5 rounded-sm text-white text-xs"
                                                          style={{backgroundColor: rebalancingCards[item.level].color}}>{rebalancingCards[item.level].name}
                                                    </span>
                                                )}
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

                                    {hasMoreItems && (
                                        <div className={`flex flex-row justify-center w-full items-center mb-4 -mt-14 pt-14 cursor-pointer ${showAll ? '' : 'bg-gradient-to-t from-white via-white to-transparent'}`}
                                             onClick={() => setShowAll(!showAll)}>
                                            <img
                                                src={DownArrow}
                                                className={`size-4 transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`}
                                            />
                                        </div>
                                    )}
                                    {chartData.length >= 2 && (
                                        <button
                                            className="text-white font-bold w-full px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-90 whitespace-nowrap"
                                            onClick={() => rebalance()}
                                            style={{
                                                background: 'linear-gradient(-45deg, #3498DB 0%, #7474C7 50%, #A72B75 100%)'
                                            }}>
                                            ✨ AI 추천 리밸런싱
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Classification */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-medium mb-6">분류하기</h2>
                            <div className="flex flex-row">
                                <input
                                    type="text"
                                    placeholder="예시) 절세 계좌에서 살 수 있는 주식 분류"
                                    className="flex-grow px-4 py-2 border rounded-lg"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            classify(keyword);
                                        }
                                    }}
                                />
                                <button
                                    className="text-white font-bold w-36 ml-2 px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-90 whitespace-nowrap"
                                    onClick={() => {
                                        classify(keyword);
                                    }}
                                    style={{
                                        background: 'linear-gradient(-45deg, #3498DB 0%, #7474C7 50%, #A72B75 100%)'
                                    }}>
                                    ✨ AI 분류 시작
                                </button>
                            </div>
                            <div className="mt-2 ms-1 flex flex-row justify-start space-x-1">
                                <span className="px-3 py-1 rounded-full text-white text-sm bg-gray-400 cursor-pointer"
                                      onClick={() => classify("국가별 분류")}>
                                    국가별 분류
                                </span>
                                <span className="px-3 py-1 rounded-full text-white text-sm bg-gray-400 cursor-pointer"
                                      onClick={() => classify("섹터")}>
                                    섹터
                                </span>
                                <span className="px-3 py-1 rounded-full text-white text-sm bg-gray-400 cursor-pointer"
                                      onClick={() => classify("기술주")}>
                                    기술주
                                </span>
                            </div>
                            <p className="text-left mt-4 text-gray-500 italic">📙 AI 분류 팁 - 디테일하게 질문할수록 더욱 좋은 결과를 얻을 수
                                있어요!</p>
                        </div>
                    </div>)
                }

                {/* Holdings */}
                <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-medium">보유 종목 현황</h2>
                        <button
                            onClick={() => openCreateDialog()}
                            className="flex items-center px-4 py-2 text-white rounded-lg"
                            style={{ backgroundColor: '#4A90E2' }}>
                            <Plus className="w-4 h-4 mr-2"/>
                            종목 추가
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto whitespace-nowrap">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50">
                                <th className="px-4 py-2">분류</th>
                                <th className="px-4 py-2">종목명</th>
                                <th className="px-4 py-2">평균매입가</th>
                                <th className="px-4 py-2">보유수량</th>
                                <th className="px-4 py-2">평가금액</th>
                                {isThereReasonOnTableData() && (
                                    <th className="px-4 py-2">판단근거</th>
                                )}
                            </tr>
                            </thead>
                            <tbody>
                            {
                                tableData.length >= 1 ? (
                                    tableData.map((row, index) => (
                                        <tr key={index} className="border-b cursor-pointer"
                                            onClick={() => openUpdateDialog(row.id, row.ticker, row.avgPrice, row.quantity)}>
                                            <td className="px-4 py-2">
                                                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm truncate">
                                                  {row.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 truncate">{row.ticker}</td>
                                            <td className="px-4 py-2 truncate">{row.avgPrice.toLocaleString()}원</td>
                                            <td className="px-4 py-2 truncate">{row.quantity}주</td>
                                            <td className="px-4 py-2 truncate">{row.totalValue.toLocaleString()}원</td>
                                            {isThereReasonOnTableData() && (
                                                <td className="px-4 py-2 truncate">{row.reason}</td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-8 text-gray-500">
                                            보유하고 계신 주식을 추가해주세요.
                                        </td>
                                    </tr>
                                )
                            }
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Custom Modal */}
            {isStockDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-[425px] relative">
                        {/* Header */}
                        <div className="px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-medium">{isUpdateDialog ? `종목 편집` : `종목 추가`}</h2>
                            <button
                                onClick={() => setIsStockDialogOpen(false)}
                                className="rounded-full p-1 hover:bg-gray-100"
                            >
                                <X className="w-4 h-4"/>
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
                                {
                                    isUpdateDialog ? (
                                        <p className="px-4 py-2 text-gray-400 cursor-pointer" onClick={() => onClickDelete()}>
                                            제거하기
                                        </p>
                                    ) : (<p></p>)
                                }
                                <div className="flex justify-end space-x-2 pt-4">
                                    <button
                                        onClick={() => setIsStockDialogOpen(false)}
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                    >
                                        취소
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                        onClick={() => onClickAddOrModify()}
                                    >
                                        확인
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* User id Modal */}
            {isUserDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-[425px] relative">
                        {/* Header */}
                        <div className="px-6 pt-4 flex justify-between items-center">
                            <h2 className="text-xl font-medium">로그인</h2>
                            <button
                                onClick={() => setIsUserDialogOpen(false)}
                                className="rounded-full p-1 hover:bg-gray-100"
                            >
                                <X className="w-4 h-4"/>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-left">사용자 아이디</label>
                                <input
                                    type="text"
                                    placeholder="user1"
                                    className="w-full px-4 py-2 border rounded-lg"
                                    value={userIdInput}
                                    onChange={(e) => setUserIdInput(e.target.value)}
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-between items-center">
                                <p></p>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => setIsUserDialogOpen(false)}
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                    >
                                        취소
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                        onClick={() => {
                                            setUserId(userIdInput);
                                            setIsUserDialogOpen(false);
                                        }}
                                    >
                                        확인
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white pt-8 pl-8 pr-8 pb-5 rounded-lg flex flex-col items-center space-y-2">
                        <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient"
                                style={{
                                    width: '100%',
                                    animation: 'loading 1.5s infinite'
                                }}
                            />
                        </div>
                        <LoadingMessage />
                    </div>
                </div>
            )}

            <div className="fixed flex flex-col items-end bottom-0 right-4 z-40">
                {isNewsPopupVisible && (
                    <div
                        className="w-fit max-w-sm mb-4 bg-red-100 rounded-lg shadow-lg p-4 slide-up-enter cursor-pointer"
                        onClick={() => {
                            classify("트럼프 정책과 관련해서 안정, 주의, 위험으로 분류해줘");
                            setIsNewsPopupVisible(false);
                        }}>
                        <div className="flex justify-between items-start">
                            <div className="pr-8">
                                <p className="font-bold mb-1">
                                    🚨 <span className="text-red-600">주목해야 할 최신 트랜드: '{newsKeyword}'</span>
                                </p>
                                <p className="text-sm text-red-600">
                                    이 카드를 클릭해서 <b>내 포트폴리오가 안전한지 확인</b>해보세요.
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsNewsPopupVisible(false);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="text-red-600 w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                )}

                {isKeywordPopupVisible && (
                    <div
                        className="w-fit max-w-sm mb-4 bg-white rounded-lg shadow-lg p-4 slide-up-enter cursor-pointer"
                        onClick={() => {
                            classify(popularKeyword);
                            setIsKeywordPopupVisible(false);
                        }}>
                        <div className="flex justify-between items-start">
                            <div className="pr-8">
                                <p className="font-bold mb-1">
                                    🔥 <span className="text-gray-600">이번 주 인기 키워드:</span> '{popularKeyword}'
                                </p>
                                <p className="text-sm text-gray-600">
                                    이 카드를 클릭하면 <span className="font-bold">내 포트폴리오 맞춤 분석</span>이 시작됩니다! 🚀
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsKeywordPopupVisible(false);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Portfolio;