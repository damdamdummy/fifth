import { useState, useRef, useEffect } from 'react';

type GameState = 'intro' | 'game1' | 'game2' | 'complete';

const playSound = (type: 'start' | 'error' | 'success') => {
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'start') {
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
        } else if (type === 'error') {
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.type = 'sawtooth';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } else if (type === 'success') {
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
            oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        }
    } catch (e) {
        console.log('Audio not available');
    }
};

const AngryEmojis = ({ show }: { show: boolean }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 pointer-events-none flex justify-center items-center z-50">
            <div className="text-8xl animate-angry flex gap-4">
                <span className="wobble">😡</span>
                <span className="wobble" style={{ animationDelay: '0.1s' }}>🤬</span>
                <span className="wobble" style={{ animationDelay: '0.2s' }}>💢</span>
            </div>
        </div>
    );
};


const Confetti = () => {
    const colors = ['#1a1a1a', '#666666', '#999999', '#333333'];
    const confettiPieces = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        size: 10 + Math.random() * 10,
    }));

    return (
        <>
            {confettiPieces.map((piece) => (
                <div
                    key={piece.id}
                    className="confetti"
                    style={{
                        left: `${piece.left}%`,
                        animationDelay: `${piece.delay}s`,
                        backgroundColor: piece.color,
                        width: piece.size,
                        height: piece.size,
                        borderRadius: Math.random() > 0.5 ? '50%' : '0',
                        transform: `rotate(${piece.rotation}deg)`,
                    }}
                />
            ))}
        </>
    );
};


const IntroPopup = ({ onStart }: { onStart: () => void }) => {
    const [showOptions, setShowOptions] = useState(false);

    const handleClick = () => {
        playSound('start');
        setShowOptions(true);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="doodle-border p-8 max-w-sm w-full slide-up doodle-bg">
                <div className="text-center">
                    <p className="text-4xl mb-6 doodle-text text-gray-800 wobble">
                        Oii Sophia
                    </p>

                    {!showOptions ? (
                        <button
                            onClick={handleClick}
                            className="doodle-border px-8 py-4 text-2xl bg-white hover:bg-gray-100 transition-all duration-200 wobble hover:scale-105"
                        >
                            klik sini dong 👆
                        </button>
                    ) : (
                        <div className="space-y-4 fade-in">
                            <p className="text-xl text-gray-600">Ada game untuk kamu...</p>
                            <button
                                onClick={onStart}
                                className="doodle-border px-8 py-4 text-2xl bg-white hover:bg-gray-100 transition-all duration-200 bounce heartbeat"
                            >
                                oke sayangku 💕
                            </button>
                        </div>
                    )}
                </div>

                <div className="absolute -top-4 -right-4 text-4xl">✨</div>
                <div className="absolute -bottom-4 -left-4 text-4xl">💫</div>
            </div>
        </div>
    );
};

const Game1 = ({ onComplete }: { onComplete: () => void }) => {
    const [input, setInput] = useState('');
    const [shake, setShake] = useState(false);
    const [showAngry, setShowAngry] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const targetText = 'saya Sophia bersumpah hanya mencintai seorang Adam';
    const targetTextLower = targetText.toLowerCase();

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInput(value);


        if (value.toLowerCase() === targetTextLower) {
            playSound('success');
            setShowSuccess(true);
            setTimeout(() => {
                onComplete();
            }, 1500);
        } else {
            // kalau typo
            const currentLength = value.length;
            if (currentLength > 0 && currentLength <= targetTextLower.length) {
                const expectedChar = targetTextLower[currentLength - 1];
                if (value[currentLength - 1].toLowerCase() !== expectedChar) {
                    // Wrong character typed!
                    setShake(true);
                    setShowAngry(true);
                    playSound('error');
                    setTimeout(() => {
                        setShake(false);
                        setShowAngry(false);
                    }, 500);
                }
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <AngryEmojis show={showAngry} />

            {showSuccess && <Confetti />}

            <div className="doodle-border p-6 max-w-md w-full slide-up">
                <h2 className="text-3xl text-center mb-2 doodle-text">
                    Game 1 😒
                </h2>
                <p className="text-xl text-center mb-6 text-gray-600">
                    "Type This Please"
                </p>

                {!showSuccess ? (
                    <>
                        <p className="text-lg text-center mb-4 text-gray-700">
                            Ayo ketik ulang kalimat di bawah ini. Persis. Ga boleh Salah:
                        </p>

                        <div className="bg-gray-100 p-4 rounded-lg mb-4 text-center">
                            <p className="text-lg font-bold text-gray-800">
                                "saya Sophia bersumpah hanya mencintai seorang Adam"
                            </p>
                        </div>

                        <input
                            type="text"
                            value={input}
                            onChange={handleInput}
                            placeholder="Ketik di sini..."
                            className={`w-full p-4 text-xl border-3 border-gray-800 rounded-lg text-center ${shake ? 'shake input-error' : ''}`}
                            autoFocus
                        />

                        <p className="text-sm text-center mt-4 text-gray-500">
                            {input.length}/{targetText.length} karakter
                        </p>
                    </>
                ) : (
                    <div className="text-center py-8 fade-in">
                        <p className="text-4xl mb-4">OK lah😌 lanjut…</p>
                        <p className="text-2xl text-gray-600">Loading game selanjutnya...</p>
                    </div>
                )}
            </div>

            {/* Decorative elements */}
            <div className="absolute top-10 left-10 text-6xl opacity-30 wobble">✏️</div>
            <div className="absolute bottom-10 right-10 text-6xl opacity-30 wobble" style={{ animationDelay: '0.5s' }}>📝</div>
        </div>
    );
};

// Game 2: Drag the Heart
const Game2 = ({ onComplete }: { onComplete: () => void }) => {
    const [hearts, setHearts] = useState([
        { id: 1, color: 'white', x: 0, y: 0, placed: false },
        { id: 2, color: 'black', x: 0, y: 0, placed: false },
    ]);
    const [adamHearts, setAdamHearts] = useState(0);
    const [sophiaHearts, setSophiaHearts] = useState(2);
    const [dragging, setDragging] = useState<number | null>(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [showSuccess, setShowSuccess] = useState(false);
    const [dodgeDirection, setDodgeDirection] = useState<'left' | 'right' | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent, heartId: number) => {
        const heart = hearts.find(h => h.id === heartId);
        if (!heart || heart.color === 'white' || heart.placed) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        setDragging(heartId);
        setDragStart({ x: clientX, y: clientY });
    };

    const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (dragging === null) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const deltaX = clientX - dragStart.x;
        const deltaY = clientY - dragStart.y;

        // Ragebait: if dragged too fast (large delta), heart dodges!
        if (Math.abs(deltaX) > 100 || Math.abs(deltaY) > 100) {
            setDodgeDirection(deltaX > 0 ? 'right' : 'left');
            playSound('error');
            setTimeout(() => {
                setDodgeDirection(null);
                setDragging(null);
                setDragStart({ x: 0, y: 0 });
            }, 300);
            return;
        }

        setHearts(prev => prev.map(h =>
            h.id === dragging ? { ...h, x: deltaX, y: deltaY } : h
        ));
    };

    const handleDragEnd = () => {
        if (dragging === null) return;

        const heart = hearts.find(h => h.id === dragging);
        if (!heart || heart.color !== 'black') return;

        // Check if dropped on Adam's area (right side of screen)
        const container = containerRef.current;
        if (container) {
            const rect = container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;

            // If dropped on right side (Adam's side)
            if (heart.x > 50) {
                playSound('success');
                setShowSuccess(true);
                setAdamHearts(1);
                setSophiaHearts(1);
                setTimeout(() => {
                    onComplete();
                }, 2000);
            } else {
                // Reset position
                setHearts(prev => prev.map(h =>
                    h.id === dragging ? { ...h, x: 0, y: 0 } : h
                ));
            }
        }

        setDragging(null);
        setDragStart({ x: 0, y: 0 });
    };

    return (
        <div
            ref={containerRef}
            className="min-h-screen flex flex-col items-center justify-center p-4"
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
        >
            <AngryEmojis show={dodgeDirection !== null} />
            {showSuccess && <Confetti />}

            <div className="doodle-border p-6 max-w-lg w-full slide-up">
                <h2 className="text-3xl text-center mb-2 doodle-text">
                    Game 2 💕
                </h2>
                <p className="text-xl text-center mb-6 text-gray-600">
                    "Drag the Heart"
                </p>

                {!showSuccess ? (
                    <>
                        <p className="text-lg text-center mb-6 text-gray-700">
                            Hatiku sudah kukasih. Sekarang… berikan hatimu untukku 😤❤️
                        </p>

                        {/* Images container */}
                        <div className="flex justify-around items-center mb-8">
                            {/* Sophia */}
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 bg-gray-200 rounded-full border-4 border-gray-800 flex items-center justify-center text-4xl mb-2">
                                    👧
                                </div>
                                <p className="text-xl font-bold">Sophia</p>
                                <p className="text-2xl">
                                    {Array(sophiaHearts).fill('❤️').join(' ')}
                                </p>
                            </div>

                            {/* Arrow */}
                            <div className="text-4xl bounce">➡️</div>

                            {/* Adam */}
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 bg-gray-200 rounded-full border-4 border-gray-800 flex items-center justify-center text-4xl mb-2">
                                    👦
                                </div>
                                <p className="text-xl font-bold">Adam</p>
                                <p className="text-2xl">
                                    {Array(adamHearts).fill('❤️').join('')}
                                    {adamHearts === 0 && <span className="text-gray-400">-_-</span>}
                                </p>
                            </div>
                        </div>

                        {/* Draggable hearts */}
                        <div className="flex justify-center gap-8">
                            {hearts.map(heart => (
                                <div
                                    key={heart.id}
                                    className={`draggable text-5xl transition-transform ${dodgeDirection ? (dodgeDirection === 'left' ? 'dodge-left' : 'dodge-right') : ''}`}
                                    style={{
                                        transform: dragging === heart.id ? `translate(${heart.x}px, ${heart.y}px)` : undefined,
                                        opacity: heart.placed ? 0.3 : 1,
                                        cursor: heart.color === 'white' || heart.placed ? 'default' : 'grab',
                                    }}
                                    onMouseDown={(e) => handleDragStart(e, heart.id)}
                                    onTouchStart={(e) => handleDragStart(e, heart.id)}
                                >
                                    {heart.color === 'white' ? '🤍' : '🖤'}
                                </div>
                            ))}
                        </div>

                        <p className="text-center mt-6 text-gray-500 text-sm">
                            ⚠️ Tarik hati hitam ke arah Adam (kanan)!
                        </p>
                    </>
                ) : (
                    <div className="text-center py-8 fade-in">
                        <p className="text-4xl mb-4">💕💕</p>
                        <p className="text-2xl text-gray-700">
                            Hatiku buat kamu, hatimu buat aku…
                        </p>
                        <p className="text-xl text-gray-500 mt-4">
                            Loading ucapan akhir...
                        </p>
                    </div>
                )}
            </div>

            {/* Decorative elements */}
            <div className="absolute top-10 right-10 text-6xl opacity-30 wobble">💖</div>
            <div className="absolute bottom-10 left-10 text-6xl opacity-30 wobble" style={{ animationDelay: '0.5s' }}>💘</div>
        </div>
    );
};

// Final Message Component
const FinalMessage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <Confetti />

            <div className="doodle-border p-8 max-w-md w-full slide-up">
                <h2 className="text-4xl text-center mb-6 doodle-text">
                    🎉 Selamat! 🎉
                </h2>

                <div className="space-y-4 text-xl text-gray-700">
                    <p className="text-center text-2xl font-bold mb-6">
                        Selamat monthsary ke-5! 🎂
                    </p>

                    <p className="text-center">
                        Kita emang sempet putus sebulan,
                    </p>

                    <p className="text-center">
                        tapi sekarang udah sebulan balikan
                    </p>

                    <p className="text-center">
                        dan masih aja ribut lucu tiap hari 😂
                    </p>

                    <div className="border-t-2 border-dashed border-gray-400 my-6"></div>

                    <p className="text-center text-2xl font-bold">
                        Dan lanjutannya...
                    </p>

                    <p className="text-center text-3xl pulse">
                        di chat aja 💬
                    </p>
                </div>

                <div className="text-center mt-8">
                    <p className="text-6xl bounce">💕🤍🖤</p>
                    <p className="text-xl mt-4 text-gray-600">- Adam buat Sophia -</p>
                </div>
            </div>

            {/* Decorative doodles */}
            <div className="absolute top-10 left-10 text-6xl opacity-30 wobble">🎈</div>
            <div className="absolute top-10 right-10 text-6xl opacity-30 wobble" style={{ animationDelay: '0.3s' }}>🎁</div>
            <div className="absolute bottom-10 left-10 text-6xl opacity-30 wobble" style={{ animationDelay: '0.6s' }}>🌟</div>
            <div className="absolute bottom-10 right-10 text-6xl opacity-30 wobble" style={{ animationDelay: '0.9s' }}>💝</div>
        </div>
    );
};

// Main App Component
function App() {
    const [gameState, setGameState] = useState<GameState>('intro');

    const startGame = () => {
        playSound('start');
        setTimeout(() => {
            setGameState('game1');
        }, 500);
    };

    const completeGame1 = () => {
        setGameState('game2');
    };

    const completeGame2 = () => {
        setGameState('complete');
    };

    return (
        <div className="min-h-screen">
            {gameState === 'intro' && (
                <IntroPopup onStart={startGame} />
            )}

            {gameState === 'game1' && (
                <Game1 onComplete={completeGame1} />
            )}

            {gameState === 'game2' && (
                <Game2 onComplete={completeGame2} />
            )}

            {gameState === 'complete' && (
                <FinalMessage />
            )}
        </div>
    );
}

export default App;
