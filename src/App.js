import './App.css';
import React, { useState, useEffect} from 'react';

// メインのAppコンポーネント
const App = () => {
    // 現在のリストの状態
    const [list, setList] = useState([10, 5, 20, 15, 25]);
    // 表示用のリスト要素（アニメーション制御用）
    const [displayList, setDisplayList] = useState([]);
    // 選択中の操作
    const [operation, setOperation] = useState(null); // 'sort', 'slice', 'comprehension', 'loop', 'len'
    // スライス操作の入力値
    const [sliceStart, setSliceStart] = useState('');
    const [sliceEnd, setSliceEnd] = useState('');
    const [sliceStep, setSliceStep] = useState('');
    // リスト内包表記の式（簡易版）
    const [comprehensionExpression, setComprehensionExpression] = useState('x * 2');
    // 操作結果
    const [result, setResult] = useState(null);
    // アニメーション中かどうか
    const [isAnimating, setIsAnimating] = useState(false); // アニメーションが実行中かどうか
    // メッセージ表示用
    const [message, setMessage] = useState('');

    // コンポーネントマウント時にリストを初期化
    useEffect(() => {
        // 初期リストの要素をアニメーションなしで表示
        setDisplayList(list.map((value, index) => ({
            id: index,
            value: value,
            isHighlight: false,
            isNew: false,
            position: index, // 初期位置 (ソートロジックのために保持)
            opacity: 1,
            scale: 1,
            color: 'bg-blue-500' // デフォルト色
        })));
    }, [list]); // 'list' is now in the dependency array

    // リスト要素表示用のコンポーネント
    const ListItem = ({ item }) => {
        const baseClasses = `flex items-center justify-center w-12 h-12 m-1 text-white font-bold rounded-lg shadow-lg transform transition-all duration-500 ease-in-out`;
        const highlightClasses = item.isHighlight ? 'ring-4 ring-yellow-400 scale-110' : '';
        const newClasses = item.isNew ? 'animate-pulse bg-green-500' : ''; // 新しい要素は緑色で点滅
        const colorClass = item.color; // カスタムカラー

        return (
            <div
                className={`${baseClasses} ${colorClass} ${highlightClasses} ${newClasses}`}
                style={{
                    opacity: item.opacity,
                    scale: item.scale,
                    zIndex: item.isHighlight ? 10 : 1 // ハイライト中は前面に
                }}
            >
                {item.value}
            </div>
        );
    };

    // リストをリセットする関数
    const resetList = () => {
        const newList = [10, 5, 20, 15, 25];
        setList(newList);
        setDisplayList(newList.map((value, index) => ({
            id: index,
            value: value,
            isHighlight: false,
            isNew: false,
            position: index,
            opacity: 1,
            scale: 1,
            color: 'bg-blue-500'
        })));
        setResult(null);
        setMessage('');
        setIsAnimating(false); // リセット時にアニメーション状態もリセット
    };

    // ソート操作
    const handleSort = async (order) => {
        if (isAnimating) return; // アニメーション中は新しいソートを開始しない
        setIsAnimating(true);
        setResult(null);
        setMessage('ソート中...');

        let currentDisplayList = [...displayList];
        const n = currentDisplayList.length;

        // バブルソートのアニメーション
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - 1 - i; j++) {
                // 比較中の要素をハイライト
                currentDisplayList = currentDisplayList.map((item, idx) => ({
                    ...item,
                    isHighlight: (idx === j || idx === j + 1),
                    color: (idx === j || idx === j + 1) ? 'bg-yellow-500' : 'bg-blue-500',
                    scale: (idx === j || idx === j + 1) ? 1.1 : 1 // 比較時に少し拡大
                }));
                setDisplayList([...currentDisplayList]);
                await new Promise(resolve => setTimeout(resolve, 500)); // 比較アニメーション

                const val1 = currentDisplayList[j].value;
                const val2 = currentDisplayList[j + 1].value;

                let shouldSwap = false;
                if (order === 'asc' && val1 > val2) {
                    shouldSwap = true;
                } else if (order === 'desc' && val1 < val2) {
                    shouldSwap = true;
                }

                if (shouldSwap) {
                    // スワップを強調するアニメーション
                    currentDisplayList[j].color = 'bg-red-500'; // 赤色に変化
                    currentDisplayList[j+1].color = 'bg-red-500';
                    currentDisplayList[j].scale = 1.3; // さらに大きく拡大
                    currentDisplayList[j+1].scale = 1.3;
                    setDisplayList([...currentDisplayList]);
                    await new Promise(resolve => setTimeout(resolve, 300)); // 短いポーズ

                    // 実際の要素もスワップ
                    [currentDisplayList[j], currentDisplayList[j + 1]] = [currentDisplayList[j + 1], currentDisplayList[j]];

                    // position プロパティもスワップ (ソートロジックの内部的な順序を反映)
                    const tempPos = currentDisplayList[j].position;
                    currentDisplayList[j].position = currentDisplayList[j + 1].position;
                    currentDisplayList[j + 1].position = tempPos;

                    // スワップ後、色とスケールをリセットして次の状態へ遷移
                    currentDisplayList[j].scale = 1;
                    currentDisplayList[j+1].scale = 1;
                    currentDisplayList[j].color = 'bg-blue-500';
                    currentDisplayList[j+1].color = 'bg-blue-500';

                    setDisplayList([...currentDisplayList]); // これによりFlexboxが新しい順序で再配置（ジャンプ）
                    await new Promise(resolve => setTimeout(resolve, 700)); // ジャンプ後の表示を待つ
                }

                // ハイライト解除とスケールリセット
                currentDisplayList = currentDisplayList.map(item => ({
                    ...item,
                    isHighlight: false,
                    color: 'bg-blue-500',
                    scale: 1
                }));
                setDisplayList([...currentDisplayList]);
            }
            // ソート済み要素を固定色にする
            currentDisplayList[n - 1 - i].color = 'bg-purple-500';
            setDisplayList([...currentDisplayList]);
        }
        currentDisplayList[0].color = 'bg-purple-500'; // 最後の要素も固定
        setList(currentDisplayList.map(item => item.value)); // 最終的なリストの値を更新
        setDisplayList([...currentDisplayList]);


        setMessage('ソート完了！');
        setIsAnimating(false);
    };

    // スライス操作
    const handleSlice = async () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setResult(null);
        setMessage('スライス中...');

        const start = sliceStart === '' ? 0 : parseInt(sliceStart);
        const end = sliceEnd === '' ? list.length : parseInt(sliceEnd);
        const step = sliceStep === '' ? 1 : parseInt(sliceStep);

        if (isNaN(start) || isNaN(end) || isNaN(step) || step === 0) {
            setMessage('無効な入力です。数値を入力してください。');
            setIsAnimating(false);
            return;
        }

        if (start < 0 || start >= list.length || end < 0 || end > list.length) {
            setMessage('インデックスが範囲外です。');
            setIsAnimating(false);
            return;
        }

        const newDisplayList = displayList.map(item => ({ ...item, isHighlight: false, color: 'bg-blue-500' }));
        setDisplayList([...newDisplayList]);
        await new Promise(resolve => setTimeout(resolve, 300));

        const slicedValues = [];
        const tempHighlightedIndices = [];

        // スライスされる要素を順番にハイライト
        for (let i = start; (step > 0 && i < end) || (step < 0 && i > end); i += step) {
            if (i >= 0 && i < list.length) {
                tempHighlightedIndices.push(i);
                newDisplayList[i].isHighlight = true;
                newDisplayList[i].color = 'bg-yellow-500';
                setDisplayList([...newDisplayList]);
                await new Promise(resolve => setTimeout(resolve, 300));
                slicedValues.push(list[i]);
            }
        }

        // ハイライトを解除し、新しいリストをアニメーションで表示
        const finalDisplayList = displayList.map(item => ({ ...item, isHighlight: false, color: 'bg-blue-500' }));
        setDisplayList([...finalDisplayList]);
        await new Promise(resolve => setTimeout(resolve, 500));

        const newResultList = slicedValues.map((value, index) => ({
            id: `new-${index}`,
            value: value,
            isHighlight: false,
            isNew: true, // 新しい要素としてマーク
            position: index,
            opacity: 0, // 最初は非表示
            scale: 0.5,
            color: 'bg-green-500'
        }));

        setResult(newResultList);
        await new Promise(resolve => setTimeout(resolve, 100)); // DOM更新を待つ

        // 新しいリストの要素をフェードイン＆拡大
        setResult(prev => prev.map(item => ({ ...item, opacity: 1, scale: 1 })));
        await new Promise(resolve => setTimeout(resolve, 700));

        setMessage(`スライス結果: [${slicedValues.join(', ')}]`);
        setIsAnimating(false);
    };

    // リスト内包表記操作
    const handleComprehension = async () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setResult(null);
        setMessage('リスト内包表記を実行中...');

        let newValues = [];
        let currentDisplayList = displayList.map(item => ({ ...item, isHighlight: false, color: 'bg-blue-500' }));
        setDisplayList([...currentDisplayList]);
        await new Promise(resolve => setTimeout(resolve, 300));

        for (let i = 0; i < list.length; i++) {
            const itemValue = list[i];
            // 元の要素をハイライト
            currentDisplayList[i].isHighlight = true;
            currentDisplayList[i].color = 'bg-yellow-500';
            setDisplayList([...currentDisplayList]);
            await new Promise(resolve => setTimeout(resolve, 500));

            let transformedValue;
            try {
                const numValue = parseFloat(itemValue); // Ensure itemValue is a number

                // 簡易的な式評価 (evalの代わりに手動で解析)
                if (comprehensionExpression.includes('*')) {
                    const parts = comprehensionExpression.split('*');
                    const factor = parseFloat(parts[1].trim());
                    transformedValue = numValue * factor;
                } else if (comprehensionExpression.includes('+')) {
                    const parts = comprehensionExpression.split('+');
                    const addend = parseFloat(parts[1].trim());
                    transformedValue = numValue + addend;
                } else if (comprehensionExpression.includes('-')) {
                    const parts = comprehensionExpression.split('-');
                    const subtrahend = parseFloat(parts[1].trim());
                    transformedValue = numValue - subtrahend;
                } else if (comprehensionExpression.includes('/')) {
                    const parts = comprehensionExpression.split('/');
                    const divisor = parseFloat(parts[1].trim());
                    if (divisor === 0) {
                        setMessage('ゼロによる除算はできません。');
                        setIsAnimating(false);
                        return;
                    }
                    transformedValue = numValue / divisor;
                } else if (comprehensionExpression.includes('%')) {
                    // "x % 2 == 0 ? "Even" : "Odd"" のような特定のパターンを処理
                    if (comprehensionExpression.includes('== 0 ? "Even" : "Odd"')) {
                        transformedValue = numValue % 2 === 0 ? "Even" : "Odd";
                    } else {
                        const parts = comprehensionExpression.split('%');
                        const modulus = parseFloat(parts[1].trim());
                        transformedValue = numValue % modulus;
                    }
                } else if (comprehensionExpression.trim() === 'x') {
                    transformedValue = numValue; // x そのものを返す場合
                } else {
                    setMessage('サポートされていない式です。例: x * 2, x + 5, x % 2 == 0 ? "Even" : "Odd"');
                    setIsAnimating(false);
                    return;
                }
            } catch (e) {
                setMessage('式の評価中にエラーが発生しました。');
                setIsAnimating(false);
                return;
            }

            // 新しい要素を生成するアニメーション
            const newItem = {
                id: `comp-${i}`,
                value: transformedValue,
                isHighlight: false,
                isNew: true,
                position: i, // 元の要素の位置に一時的に表示
                opacity: 0, // 最初は非表示
                scale: 0.5,
                color: 'bg-green-500'
            };
            newValues.push(newItem);

            // 新しい要素が元の要素の隣に現れるように表示
            setResult(newValues);
            await new Promise(resolve => setTimeout(resolve, 300));
            // フェードイン＆拡大
            setResult(prev => prev.map((item, idx) => ({
                ...item,
                opacity: 1,
                scale: 1,
                position: idx // 最終的な位置に移動
            })));
            await new Promise(resolve => setTimeout(resolve, 500));

            // 元の要素のハイライト解除
            currentDisplayList[i].isHighlight = false;
            currentDisplayList[i].color = 'bg-blue-500';
            setDisplayList([...currentDisplayList]);
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        setMessage('リスト内包表記完了！');
        setIsAnimating(false);
    };

    // ループ操作
    const handleLoop = async () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setResult(null);
        setMessage('ループ中...');

        let currentDisplayList = displayList.map(item => ({ ...item, isHighlight: false, color: 'bg-blue-500' }));
        setDisplayList([...currentDisplayList]);
        await new Promise(resolve => setTimeout(resolve, 300));

        let loopResult = [];
        for (let i = 0; i < list.length; i++) {
            // 現在の要素をハイライト
            currentDisplayList[i].isHighlight = true;
            currentDisplayList[i].color = 'bg-yellow-500';
            setDisplayList([...currentDisplayList]);
            await new Promise(resolve => setTimeout(resolve, 700)); // ハイライト表示

            loopResult.push(`要素 ${list[i]} を処理しました。`);

            // ハイライト解除
            currentDisplayList[i].isHighlight = false;
            currentDisplayList[i].color = 'bg-blue-500';
            setDisplayList([...currentDisplayList]);
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        setResult(loopResult.join('\n'));
        setMessage('ループ完了！');
        setIsAnimating(false);
    };

    // len()関数操作
    const handleLen = async () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setResult(null);
        setMessage('長さを計測中...');

        // 全要素を短時間ハイライト
        const highlightedList = displayList.map(item => ({ ...item, isHighlight: true, color: 'bg-yellow-500', scale: 1.1 }));
        setDisplayList([...highlightedList]);
        await new Promise(resolve => setTimeout(resolve, 500));

        // ハイライト解除
        const normalList = displayList.map(item => ({ ...item, isHighlight: false, color: 'bg-blue-500', scale: 1 }));
        setDisplayList([...normalList]);
        await new Promise(resolve => setTimeout(resolve, 300));

        setResult(`リストの長さ: ${list.length}`);
        setMessage('計測完了！');
        setIsAnimating(false);
    };

    // 操作選択ボタンのスタイル
    const operationButtonClass = (op) =>
        `p-3 m-2 rounded-lg font-bold shadow-md transition-all duration-300 ${
            operation === op
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white ring-4 ring-pink-300'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`;

    // 実行ボタンのスタイル
    const runButtonClass = `p-4 m-2 rounded-full font-bold text-lg shadow-xl transition-all duration-300 transform ${
        isAnimating ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:scale-105'
    }`;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 font-inter">
            {/* 9:16比率のコンテナ */}
            {/* アプリ全体の高さを固定 */}
            <div className="w-full max-w-sm h-[800px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <header className="p-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white text-center text-2xl font-extrabold shadow-md">
                    Pythonリスト操作デモ
                </header>

                {/* コンテンツエリア: この中でコンテンツが溢れた場合にスクロールする */}
                <div className="flex-grow p-4 flex flex-col items-center justify-start overflow-auto">
                    {/* メッセージと結果表示エリア - 現在のリストの上に移動 */}
                    {message && (
                        <div className="w-full bg-blue-100 text-blue-800 p-3 rounded-lg mb-4 text-center font-medium animate-fade-in">
                            {message}
                        </div>
                    )}
                    {result !== null && (
                        <div className="w-full bg-green-100 text-green-800 p-3 rounded-lg text-center font-medium animate-fade-in mb-4"> {/* mb-4 を追加して下の要素との間に余白 */}
                            <h3 className="text-lg font-semibold text-green-700 mb-2">結果:</h3>
                            {Array.isArray(result) ? (
                                <div className="flex justify-center items-center h-16 relative flex-wrap"> {/* flex-wrap を追加 */}
                                    {result.map(item => (
                                        <ListItem key={item.id} item={item} />
                                    ))}
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap">{result}</p>
                            )}
                        </div>
                    )}

                    {/* 現在のリスト表示エリア */}
                    <div className="w-full bg-gray-50 p-3 rounded-xl shadow-inner mb-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">現在のリスト:</h3>
                        <div className="flex items-center min-h-[4rem] h-auto relative py-2 flex-wrap justify-center">
                            {displayList.map(item => (
                                <ListItem key={item.id} item={item} />
                            ))}
                        </div>
                    </div>

                    {/* 操作選択ボタン */}
                    <div className="grid grid-cols-2 gap-2 w-full mb-4">
                        <button
                            className={operationButtonClass('sort')}
                            onClick={() => setOperation('sort')}
                        >
                            ソート (sort())
                        </button>
                        <button
                            className={operationButtonClass('slice')}
                            onClick={() => setOperation('slice')}
                        >
                            スライス ([:])
                        </button>
                        <button
                            className={operationButtonClass('comprehension')}
                            onClick={() => setOperation('comprehension')}
                        >
                            リスト内包表記
                        </button>
                        <button
                            className={operationButtonClass('loop')}
                            onClick={() => setOperation('loop')}
                        >
                            ループ (for)
                        </button>
                        <button
                            className={operationButtonClass('len')}
                            onClick={() => setOperation('len')}
                        >
                            長さ (len())
                        </button>
                        <button
                            className="p-3 m-2 rounded-lg font-bold shadow-md bg-red-400 text-white hover:bg-red-500 transition-all duration-300"
                            onClick={resetList}
                            disabled={isAnimating}
                        >
                            リストリセット
                        </button>
                    </div>

                    {/* 操作に応じた入力フォームと実行ボタン */}
                    <div className="w-full flex flex-col items-center mb-4 min-h-[120px]"> {/* 最小高さを設定して、ボタン表示時のレイアウトシフトを軽減 */}
                        {operation === 'sort' && (
                            <div className="w-full flex justify-center space-x-2">
                                <button
                                    className={runButtonClass}
                                    onClick={() => handleSort('asc')}
                                    disabled={isAnimating}
                                >
                                    昇順ソート
                                </button>
                                <button
                                    className={runButtonClass}
                                    onClick={() => handleSort('desc')}
                                    disabled={isAnimating}
                                >
                                    降順ソート
                                </button>
                            </div>
                        )}

                        {operation === 'slice' && (
                            <div className="w-full flex flex-col items-center">
                                <div className="flex space-x-2 w-full justify-center mb-2">
                                    <input
                                        type="number"
                                        placeholder="開始 (start)"
                                        className="w-1/3 p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        value={sliceStart}
                                        onChange={(e) => setSliceStart(e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="終了 (end)"
                                        className="w-1/3 p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        value={sliceEnd}
                                        onChange={(e) => setSliceEnd(e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="ステップ (step)"
                                        className="w-1/3 p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        value={sliceStep}
                                        onChange={(e) => setSliceStep(e.target.value)}
                                    />
                                </div>
                                <button
                                    className={runButtonClass}
                                    onClick={handleSlice}
                                    disabled={isAnimating}
                                >
                                    スライス実行
                                </button>
                            </div>
                        )}

                        {operation === 'comprehension' && (
                            <div className="w-full flex flex-col items-center">
                                <input
                                    type="text"
                                    placeholder="例: x * 2"
                                    className="w-full p-2 border rounded-md shadow-sm mb-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={comprehensionExpression}
                                    onChange={(e) => setComprehensionExpression(e.target.value)}
                                />
                                <button
                                    className={runButtonClass}
                                    onClick={handleComprehension}
                                    disabled={isAnimating}
                                >
                                    内包表記実行
                                </button>
                            </div>
                        )}

                        {(operation === 'loop' || operation === 'len') && (
                            <div className="w-full flex justify-center">
                                <button
                                    className={runButtonClass}
                                    onClick={operation === 'loop' ? handleLoop : handleLen}
                                    disabled={isAnimating}
                                >
                                    {operation === 'loop' ? 'ループ実行' : '長さ計測実行'}
                                </button>
                            </div>
                        )}
                    </div> {/* End of dynamic input/button container */}
                </div>
            </div>
        </div>
    );
};

export default App;
