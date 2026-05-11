import { useState, useRef, useEffect } from 'react';

type GameState = 'intro' | 'game1' | 'game2' | 'complete';

let bgAudioContext: AudioContext | null = null;
let bgLoopTimeout: ReturnType<typeof setTimeout> | null = null;
let bgPlaying = false;

const playBackgroundMusic = () => {
    if (bgPlaying) return;
    bgPlaying = true;

    const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 293.66, 261.63];
    const noteDuration = 0.55;
    const loopDuration = notes.length * noteDuration * 1000;

    const playLoop = () => {
        if (!bgPlaying) return;
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            bgAudioContext = ctx;


            const masterGain = ctx.createGain();
            masterGain.connect(ctx.destination);
            masterGain.gain.setValueAtTime(0, ctx.currentTime);
            masterGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.3);

            notes.forEach((freq, i) => {
                const startTime = ctx.currentTime + i * noteDuration;


                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(masterGain);
                osc.frequency.setValueAtTime(freq, startTime);
                osc.type = 'sine';
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.6, startTime + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration * 0.85);
                osc.start(startTime);
                osc.stop(startTime + noteDuration);


                const harmOsc = ctx.createOscillator();
                const harmGain = ctx.createGain();
                harmOsc.connect(harmGain);
                harmGain.connect(masterGain);
                harmOsc.frequency.setValueAtTime(freq / 2, startTime);
                harmOsc.type = 'triangle';
                harmGain.gain.setValueAtTime(0, startTime);
                harmGain.gain.linearRampToValueAtTime(0.2, startTime + 0.04);
                harmGain.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration * 0.7);
                harmOsc.start(startTime);
                harmOsc.stop(startTime + noteDuration);
            });


            bgLoopTimeout = setTimeout(() => {
                try { ctx.close(); } catch (e) { }
                playLoop();
            }, loopDuration - 100);
        } catch (e) {
            console.log('Audio not available');
        }
    };

    playLoop();
};

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


const ProgressBar = ({ currentStep }: { currentStep: number }) => {
    const totalSteps = 2;

    return (
        <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2].map((step) => (
                <div key={step} className="flex items-center">
                    <div
                        className={`step-dot w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 transition-all duration-300 ${step <= currentStep
                            ? 'bg-yellow-500 border-yellow-500 text-white scale-110'
                            : 'bg-white border-gray-300 text-gray-400'
                            }`}
                        id={`dot${step}`}
                    >
                        {step}
                    </div>
                    {step < totalSteps && (
                        <div className={`w-8 h-0.5 mx-1 ${step < currentStep ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                    )}
                </div>
            ))}
        </div>
    );
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

    const handleStart = () => {
        playSound('start');
        playBackgroundMusic(); // Play background music after clicking "oke sayangku"
        onStart();
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
                            <img src="assets/cat5.gif" alt="" width="20%" className="mx-auto" />
                            <button
                                onClick={handleStart}
                                className="doodle-border px-8 py-4 text-2xl bg-white hover:bg-gray-100 transition-all duration-200 bounce heartbeat"
                            >
                                gass?
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

    const targetText = 'saya Sophia bersumpah hanya mencintai Adam seorang';
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
                <ProgressBar currentStep={1} />

                <h2 className="text-3xl text-center mb-2 doodle-text">
                    Janji Suci 😂
                </h2>

                <br />

                {!showSuccess ? (
                    <>
                        <p className="text-lg text-center mb-4 text-gray-700">
                            Ayo ketik ulang kalimat di bawah ini:
                        </p>

                        <div className="bg-gray-100 p-4 rounded-lg mb-4 text-center">
                            <p className="text-lg font-bold text-gray-800">
                                "saya Sophia bersumpah hanya mencintai Adam seorang"
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

                    </div>
                )}
            </div>


            <img
                src="assets/cat1.gif"
                alt=""
                className="absolute top-10 left-10 w-14 h-14 opacity-30 wobble"
            />

            <img
                src="assets/cat2.gif"
                alt=""
                className="absolute bottom-10 right-10 w-14 h-14 opacity-30 wobble"
                style={{ animationDelay: '0.5s' }}
            />

            <img
                src="assets/cat3.gif"
                alt=""
                className="absolute top-24 right-32 w-12 h-12 opacity-25 wobble"
                style={{ animationDelay: '1s' }}
            />

            <img
                src="assets/cat4.gif"
                alt=""
                className="absolute top-1/2 left-16 w-16 h-16 opacity-20 wobble"
                style={{ animationDelay: '1.5s' }}
            />
        </div>
    );
};

// Game 2: Slide the Heart — knob slider from Sophia to Adam
const Game2 = ({ onComplete }: { onComplete: () => void }) => {
    const railRef = useRef<HTMLDivElement>(null);
    const knobRef = useRef<HTMLDivElement>(null);

    const [pct, setPct] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [heartDropped, setHeartDropped] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [hint, setHint] = useState('');
    const [ngelak, setNgelak] = useState(false);
    const [showAngryNgelak, setShowAngryNgelak] = useState(false);

    const prevPctRef = useRef(0);
    const ngelakCooldownRef = useRef(false);
    const pctRef = useRef(0);
    const draggingRef = useRef(false);
    const heartDroppedRef = useRef(false);

    // Keep refs in sync
    useEffect(() => { pctRef.current = pct; }, [pct]);
    useEffect(() => { draggingRef.current = isDragging; }, [isDragging]);
    useEffect(() => { heartDroppedRef.current = heartDropped; }, [heartDropped]);

    const clamp = (v: number) => Math.max(0, Math.min(1, v));

    const applyPct = (rawPct: number) => {
        if (heartDroppedRef.current) return;
        const newPct = clamp(rawPct);

        // Ngelak check: too fast
        const speed = Math.abs(newPct - prevPctRef.current);
        if (speed > 0.07 && !ngelakCooldownRef.current && newPct < 0.92) {
            ngelakCooldownRef.current = true;
            const bouncePct = clamp(newPct - 0.08);
            setPct(bouncePct);
            pctRef.current = bouncePct;
            setHint('😤 Pelan-pelan dong! Jangan kasar!');
            setNgelak(true);
            setShowAngryNgelak(true);
            playSound('error');
            setTimeout(() => {
                setNgelak(false);
                setShowAngryNgelak(false);
                ngelakCooldownRef.current = false;
            }, 600);
            prevPctRef.current = bouncePct;
            return;
        }

        prevPctRef.current = newPct;
        setPct(newPct);

        if (newPct < 0.3) setHint('ayo yang…');
        else if (newPct < 0.7) setHint('teruskan…');
        else if (newPct < 0.95) setHint('🥺 hampir sampai…');

        if (newPct >= 1 && !heartDroppedRef.current) {
            heartDroppedRef.current = true;
            setHeartDropped(true);
            setHint('🎉 Makasih hatinya~');
            playSound('success');
            setShowSuccess(true);
            setTimeout(() => onComplete(), 1800);
        }
    };

    const getPct = (clientX: number) => {
        const rail = railRef.current;
        if (!rail) return 0;
        const rect = rail.getBoundingClientRect();
        return (clientX - rect.left) / rect.width;
    };

    // Mouse events
    const onKnobMouseDown = (e: React.MouseEvent) => {
        if (heartDropped) return;
        e.preventDefault();
        setIsDragging(true);
    };
    const onMouseMove = (e: MouseEvent) => {
        if (!draggingRef.current || heartDroppedRef.current) return;
        applyPct(getPct(e.clientX));
    };
    const onMouseUp = () => setIsDragging(false);

    // Touch events
    const onKnobTouchStart = (e: React.TouchEvent) => {
        if (heartDropped) return;
        e.preventDefault();
        setIsDragging(true);
    };
    const onTouchMove = (e: TouchEvent) => {
        if (!draggingRef.current || heartDroppedRef.current) return;
        e.preventDefault();
        applyPct(getPct(e.touches[0].clientX));
    };
    const onTouchEnd = () => setIsDragging(false);

    // Rail click
    const onRailClick = (e: React.MouseEvent) => {
        if (heartDropped) return;
        applyPct(getPct(e.clientX));
    };

    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, []);

    const knobLeft = `calc(${pct * 100}% - 22px)`;

    const sophiaWhiteOpacity = Math.max(0, 1 - pct * 1.1);

    const adamBrokenOpacity = Math.max(0, 1 - pct * 2.5);
    const adamWhiteOpacity = pct > 0.6 ? Math.min(1, (pct - 0.6) / 0.4) : 0;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <AngryEmojis show={showAngryNgelak} />
            {showSuccess && <Confetti />}

            <div className="relative doodle-border p-6 max-w-lg w-full slide-up">
                <img
                    src="assets/shy.png"
                    alt=""
                    className="absolute -top-5 -left-5 w-14 h-14 opacity-100 wobble"
                    style={{ animationDelay: '0s' }}
                />

                <img
                    src="assets/shy.png"
                    alt=""
                    className="absolute -top-5 -right-5 w-14 h-14 opacity-100 wobble"
                    style={{ animationDelay: '1s' }}
                />

                <img
                    src="assets/shy.png"
                    alt=""
                    className="absolute -bottom-5 -left-5 w-14 h-14 opacity-100 wobble"
                    style={{ animationDelay: '2s' }}
                />

                <img
                    src="assets/shy.png"
                    alt=""
                    className="absolute -bottom-5 -right-5 w-14 h-14 opacity-100 wobble"
                    style={{ animationDelay: '3s' }}
                />

                <ProgressBar currentStep={2} />

                <h2 className="text-3xl text-center mb-1 doodle-text">
                    You have my heart
                </h2>
                <p className="text-sm text-center mb-4 text-gray-400 italic">
                    can I have yours too?
                </p>

                {!showSuccess ? (
                    <>
                        {/* Characters + Slider inline */}
                        <div className="flex items-center justify-center gap-4 mb-6">

                            {/* Sophia */}
                            <div className="flex flex-col items-center min-w-[72px]">
                                <div className="w-20 h-20 rounded-full border-4 border-gray-800 overflow-hidden mb-1">
                                    <img
                                        src="assets/sop.jpg"
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <p className="font-bold text-gray-800 text-sm">Sophia</p>
                                {/* Black heart stays, white heart fades out as you slide */}
                                <div className="flex gap-1 mt-1 text-2xl">
                                    <span>🖤</span>
                                    {/* <span
                                        className="transition-opacity duration-150"
                                        style={{ opacity: sophiaWhiteOpacity }}
                                    >🤍</span> */}
                                </div>
                            </div>

                            {/* Slider */}
                            <div className="flex-1 max-w-[200px] px-1">
                                <div
                                    ref={railRef}
                                    onClick={onRailClick}
                                    style={{
                                        position: 'relative',
                                        height: '14px',
                                        background: '#e5e7eb',
                                        borderRadius: '999px',
                                        border: '2px solid #9ca3af',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {/* Fill */}
                                    <div style={{
                                        position: 'absolute',
                                        left: 0, top: 0,
                                        height: '100%',
                                        width: `${pct * 100}%`,
                                        background: 'linear-gradient(90deg, #d1d5db, #6b7280)',
                                        borderRadius: '999px',
                                        transition: ngelak ? 'none' : 'width 0.05s',
                                    }} />

                                    {/* Knob — white heart 🤍 */}
                                    <div
                                        ref={knobRef}
                                        onMouseDown={onKnobMouseDown}
                                        onTouchStart={onKnobTouchStart}
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: knobLeft,
                                            transform: 'translateY(-50%)',
                                            width: '44px',
                                            height: '44px',
                                            background: '#fff',
                                            borderRadius: '50%',
                                            border: '2px solid #9ca3af',
                                            boxShadow: isDragging
                                                ? '0 0 0 3px #d1d5db, 0 4px 12px rgba(0,0,0,0.2)'
                                                : '0 2px 8px rgba(0,0,0,0.15)',
                                            cursor: heartDropped ? 'default' : (isDragging ? 'grabbing' : 'grab'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '22px',
                                            userSelect: 'none',
                                            touchAction: 'none',
                                            transition: ngelak
                                                ? 'left 0.15s cubic-bezier(0.34,1.56,0.64,1)'
                                                : 'left 0.05s',
                                            zIndex: 10,
                                        }}
                                    >
                                        🤍
                                    </div>
                                </div>
                            </div>

                            {/* Adam */}
                            <div className="flex flex-col items-center min-w-[72px]">
                                <div
                                    className={`w-20 h-20 rounded-full border-4 overflow-hidden mb-1 transition-all duration-300 ${heartDropped
                                        ? 'border-yellow-500 bg-yellow-100'
                                        : 'border-dashed border-gray-400 bg-gray-100'
                                        }`}
                                >
                                    <img
                                        src="assets/dam.jpg"
                                        alt="Target"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <p className="font-bold text-gray-800 text-sm">Adam</p>

                                <div className="relative text-2xl mt-1 w-8 h-8 flex items-center justify-center">
                                    <span
                                        className="absolute transition-opacity duration-150"
                                        style={{ opacity: heartDropped ? 0 : adamBrokenOpacity }}
                                    >💔</span>
                                    <span
                                        className="absolute transition-opacity duration-150"
                                        style={{ opacity: heartDropped ? 1 : adamWhiteOpacity }}
                                    >🤍</span>
                                </div>
                            </div>
                        </div>

                        {/* Hint */}
                        <p className="text-center text-sm text-gray-500 min-h-6 transition-all duration-200">
                            {hint}
                        </p>
                    </>
                ) : (
                    <div className="text-center py-8 fade-in">
                        <p className="text-5xl mb-4">🤍💕</p>
                        <p className="text-xl text-gray-500 mt-2">Hatiku untukmu, hatimu untukku…</p>

                    </div>
                )}
            </div>
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
                    Pimensip Sayang
                </h2>

                <div className="border-t-2 border-dashed border-gray-400 my-6"></div>

                <div className="space-y-4 text-xl text-gray-700">
                    <p className="text-center">
                        Selamat tanggal 12
                    </p>
                    <p className="text-center">
                        Maaf kalau yang kubikin kali ini tidak sesuai harapan hahah
                    </p>

                    <p className="text-center text-sm font-bold">
                        Dan lanjutannya...
                    </p>

                    <p className="text-center text-2xl pulse">
                        di chat aja yaaa emuahh
                    </p>
                </div>

            </div>

            {/* Decorative doodles */}
            {/* <div className="absolute top-10 left-10 text-6xl opacity-30 wobble">🎈</div>
            <div className="absolute top-10 right-10 text-6xl opacity-30 wobble" style={{ animationDelay: '0.3s' }}>🎁</div>
            <div className="absolute bottom-10 left-10 text-6xl opacity-30 wobble" style={{ animationDelay: '0.6s' }}>🌟</div>
            <div className="absolute bottom-10 right-10 text-6xl opacity-30 wobble" style={{ animationDelay: '0.9s' }}>💝</div> */}
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
