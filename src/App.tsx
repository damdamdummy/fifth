import { useEffect, useState, useRef } from "react";
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
} from "firebase/firestore";
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from "firebase/auth";
import { db, auth } from "./firebase";

const MESSAGES_PER_PAGE = 3;

interface Message {
    id: string;
    name: string;
    text: string;
    timestamp: number;
}

function App() {
    const [loaded, setLoaded] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [page, setPage] = useState(1);
    const [senderName, setSenderName] = useState("");
    const [messageText, setMessageText] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [loggingIn, setLoggingIn] = useState(false);
    const [musicStarted, setMusicStarted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const handleFirstTouch = () => {
            if (!musicStarted && audioRef.current) {
                audioRef.current.volume = 0.18;
                audioRef.current.play().catch(() => { });
                setMusicStarted(true);
            }
        };
        window.addEventListener("click", handleFirstTouch, { once: true });
        window.addEventListener("touchstart", handleFirstTouch, { once: true });
        return () => {
            window.removeEventListener("click", handleFirstTouch);
            window.removeEventListener("touchstart", handleFirstTouch);
        };
    }, [musicStarted]);

    useEffect(() => {
        setLoaded(true);
        fetchMessages();
        const unsub = onAuthStateChanged(auth, (user) => {
            setIsAdmin(!!user && user.email === "zettttto@outlook.com");
        });
        return () => unsub();
    }, []);

    const fetchMessages = async () => {
        try {
            const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
            const snap = await getDocs(q);
            const msgs: Message[] = snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<Message, "id">),
            }));
            setMessages(msgs);
        } catch (e) {
            console.error("Failed to fetch messages", e);
        }
    };

    const handleSend = async () => {
        if (!messageText.trim()) return;
        setSending(true);
        try {
            await addDoc(collection(db, "messages"), {
                name: senderName.trim() || "anonymous",
                text: messageText.trim(),
                timestamp: Date.now(),
            });
            setMessageText("");
            setSenderName("");
            setSent(true);
            setTimeout(() => setSent(false), 3000);
            fetchMessages();
        } catch (e) {
            console.error("Failed to send message", e);
        }
        setSending(false);
    };

    const handleLogin = async () => {
        setLoggingIn(true);
        setLoginError("");
        try {
            await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
            setShowLoginModal(false);
            setLoginEmail("");
            setLoginPassword("");
        } catch (e: any) {
            setLoginError("Login failed. Check credentials.");
        }
        setLoggingIn(false);
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    const totalPages = Math.ceil(messages.length / MESSAGES_PER_PAGE);
    const pagedMessages = messages.slice(
        (page - 1) * MESSAGES_PER_PAGE,
        page * MESSAGES_PER_PAGE
    );

    return (
        <main className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
            <audio ref={audioRef} loop src="assets/bgsong.mp3" />


            <div
                className="absolute inset-0 pointer-events-none opacity-[0.15]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />


            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <svg className="absolute w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M-10,20 Q30,15 50,25 T90,15 T130,30" stroke="white" strokeWidth="0.3" fill="none" className="opacity-40" />
                    <path d="M-5,60 Q25,55 45,65 T85,50 T125,70" stroke="white" strokeWidth="0.2" fill="none" className="opacity-30" />
                    <path d="M-15,85 Q20,80 40,90 T80,75 T120,95" stroke="white" strokeWidth="0.25" fill="none" className="opacity-35" />
                    <path d="M60,5 Q80,10 100,5 T140,15" stroke="white" strokeWidth="0.2" fill="none" className="opacity-25" />
                    <path d="M-20,45 Q10,40 30,50 T70,35 T110,55" stroke="white" strokeWidth="0.15" fill="none" className="opacity-20" />
                </svg>
            </div>

            {/* Admin corner button */}
            <div className="absolute top-4 right-4 z-50">
                {isAdmin ? (
                    <button
                        onClick={handleLogout}
                        className="text-white/30 text-xs tracking-widest uppercase hover:text-white/60 transition-colors"
                    >
                        logout
                    </button>
                ) : (
                    <button
                        onClick={() => setShowLoginModal(true)}
                        className="text-white/10 text-xs tracking-widest uppercase hover:text-white/30 transition-colors"
                    >
                        .
                    </button>
                )}
            </div>

            {/* Login Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div
                        className="bg-[#f5f5f5] p-8 w-full max-w-sm relative"
                        style={{
                            clipPath: 'polygon(0% 1%, 4% 0%, 9% 2%, 16% 0%, 23% 3%, 31% 1%, 38% 0%, 100% 0%, 100% 100%, 62% 98%, 54% 100%, 0% 100%)',
                        }}
                    >
                        <button
                            onClick={() => { setShowLoginModal(false); setLoginError(""); }}
                            className="absolute top-4 right-6 text-black/40 hover:text-black text-lg"
                        >×</button>
                        <p className="text-black/40 text-xs tracking-[0.3em] uppercase mb-4">Adam Access</p>
                        <input
                            type="email"
                            placeholder="Email"
                            value={loginEmail}
                            onChange={e => setLoginEmail(e.target.value)}
                            className="w-full border-b border-black/20 bg-transparent text-black text-sm py-2 mb-4 outline-none placeholder-black/30 focus:border-black transition-colors"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={loginPassword}
                            onChange={e => setLoginPassword(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleLogin()}
                            className="w-full border-b border-black/20 bg-transparent text-black text-sm py-2 mb-4 outline-none placeholder-black/30 focus:border-black transition-colors"
                        />
                        {loginError && <p className="text-red-500 text-xs mb-3">{loginError}</p>}
                        <button
                            onClick={handleLogin}
                            disabled={loggingIn}
                            className="w-full py-2 bg-black text-white text-xs tracking-widest uppercase hover:bg-black/80 transition-colors disabled:opacity-50"
                        >
                            {loggingIn ? "..." : "Enter"}
                        </button>
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="relative z-10 min-h-screen flex flex-col">

                {/* <header className="relative">
                    <div
                        className="absolute top-0 left-0 w-[85%] h-16 bg-white skew-x-[-12deg] -translate-x-4"
                        style={{ transform: 'skewX(-12deg) translateX(-20px)' }}
                    />
                    <div className="relative z-10 px-6 py-4 flex items-center justify-between">
                        <span className="text-black font-bold tracking-widest text-sm uppercase">
                            延蔵 (Adam)
                        </span>

                    </div>
                </header> */}

                {/* Profile section */}
                <div className="flex-1 flex items-center justify-center px-4 py-8 ">
                    <div className="max-w-4xl w-full">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

                            {/* Profile picture */}
                            <div
                                className={`relative transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                            >
                                {/* Top-left overlay */}
                                <img
                                    src="assets/image.png"
                                    alt=""
                                    className="absolute -top-4 -right-4 w-30 h-30 object-contain z-20"
                                />

                                {/* Bottom-right overlay */}
                                <img
                                    src="assets/spider.png"
                                    alt=""
                                    className="absolute -bottom-4 -left-4 w-16 h-16 object-contain z-20"
                                />

                                {/* Torn paper + image */}
                                <div
                                    className="relative w-full"
                                    style={{
                                        clipPath: 'polygon(0% 2%, 3% 0%, 8% 3%, 15% 1%, 22% 4%, 30% 0%, 38% 2%, 45% 0%, 52% 3%, 60% 1%, 68% 4%, 75% 0%, 82% 2%, 90% 1%, 95% 3%, 100% 0%, 100% 98%, 97% 100%, 92% 97%, 85% 100%, 78% 98%, 70% 100%, 62% 97%, 55% 100%, 48% 98%, 40% 100%, 32% 97%, 25% 100%, 18% 98%, 10% 100%, 5% 97%, 0% 100%)',
                                        transform: 'rotate(0deg)',
                                    }}
                                >
                                    <div className="aspect-[3/4] overflow-hidden">
                                        <img
                                            src="assets/sm.png"
                                            alt="Profile portrait"
                                            className="w-full h-full object-cover grayscale contrast-125"
                                        />
                                        <div
                                            className="absolute inset-0 pointer-events-none opacity-30"
                                            style={{
                                                backgroundImage: `radial-gradient(circle, black 1px, transparent 1px)`,
                                                backgroundSize: '4px 4px',
                                            }}
                                        />
                                        {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                            <svg width="120" height="120" viewBox="0 0 100 100" className="opacity-80">
                                                <polygon points="50,5 61,40 98,40 68,62 79,98 50,75 21,98 32,62 2,40 39,40" fill="black" />
                                            </svg>
                                        </div> */}
                                    </div>
                                </div>
                            </div>

                            {/* Profile info + message form */}
                            <div className={`transition-all duration-1000 delay-300 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                <div
                                    className="relative bg-[#f5f5f5] p-8 lg:p-10"
                                    style={{
                                        clipPath: 'polygon(0% 1%, 4% 0%, 9% 2%, 16% 0%, 23% 3%, 31% 1%, 38% 0%, 45% 2%, 53% 0%, 61% 3%, 69% 1%, 76% 0%, 83% 2%, 91% 0%, 97% 1%, 100% 0%, 100% 99%, 96% 100%, 91% 98%, 84% 100%, 77% 99%, 69% 100%, 62% 98%, 54% 100%, 47% 99%, 39% 100%, 31% 98%, 24% 100%, 17% 99%, 9% 100%, 3% 98%, 0% 100%)',
                                    }}
                                >

                                    <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-black mt-0 mb-0 leading-tight text-right">ADAM</h1>
                                    {/* <div className="w-2 h-px bg-black mb-6" /> */}
                                    <p className="text-black/50 text-sm lg:text-base leading-relaxed mb-1 max-w-md italic text-right ">
                                        "my mask speaks louder than my name."
                                    </p>
                                    {/* <div className="flex flex-wrap gap-2 mb-1 flex items-center justify-center mt-2">
                                        {['Of legal Age', 'INTJ 6w5', 'Low social battery'].map((tag, i) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 border border-black/20 text-black/60 text-xs tracking-wider lowercase"
                                                style={{ animationDelay: `${i * 100}ms` }}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div> */}


                                </div>


                                {/* Brush stroke divider */}
                                {/* <div className="relative -mt-1">
                                    <svg viewBox="0 0 400 30" className="w-full" preserveAspectRatio="none">
                                        <path
                                            d="M0,18 C20,12 40,22 70,15 C100,8 130,20 160,14 C190,8 220,19 250,13 C280,7 310,18 340,12 C365,8 385,16 400,14 L400,30 L0,30 Z"
                                            fill="#0a0a0a"
                                        />
                                        <path
                                            d="M0,20 C15,16 30,24 55,17 C75,12 95,22 120,16 C145,10 165,21 190,15 C215,9 235,20 260,14 C285,8 305,19 330,13 C355,8 375,18 400,15"
                                            fill="none"
                                            stroke="#0a0a0a"
                                            strokeWidth="6"
                                            strokeLinecap="round"
                                        />
                                        <path d="M60,14 C62,10 64,8 63,12" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M180,12 C183,7 185,5 184,10" fill="none" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" />
                                        <path d="M310,11 C313,6 316,4 314,9" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </div> */}

                                {/* Anonymous message form  */}
                                <div
                                    className="px-8 lg:px-10 pb-8 lg:pb-10 pt-4 -mt-5"
                                    style={{
                                        backgroundColor: '#0a0a0a',
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                                        backgroundBlendMode: 'overlay',
                                    }}
                                >
                                    {/* <img
                                        src="assets/spiderweb2.png"
                                        alt="decor"
                                        className="block -mt-2 mx-auto mb-4 w-14 h-14 opacity-80"
                                    /> */}

                                    <p className="text-white/60 mt-12 text-xs tracking-[0.3em] uppercase mb-6">
                                        got something to say?
                                    </p>

                                    <input
                                        type="text"
                                        placeholder="your name (optional)"
                                        value={senderName}
                                        onChange={e => setSenderName(e.target.value)}
                                        maxLength={40}
                                        className="w-full border-b border-white/20 bg-transparent text-white text-sm py-2 mb-4 outline-none placeholder-white/20 focus:border-white/60 transition-colors"
                                    />
                                    <textarea
                                        placeholder="your message"
                                        value={messageText}
                                        onChange={e => setMessageText(e.target.value)}
                                        maxLength={300}
                                        rows={3}
                                        className="w-full border-b border-white/20 bg-transparent text-white text-sm py-2 mb-6 outline-none placeholder-white/20 focus:border-white/60 transition-colors resize-none"
                                    />

                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={handleSend}
                                            disabled={sending || !messageText.trim()}
                                            className="px-6 py-2 bg-white text-black text-xs tracking-widest uppercase hover:bg-white/80 transition-colors disabled:opacity-30"
                                        >
                                            {sending ? "sending..." : "send"}
                                        </button>
                                        {sent && (
                                            <span className="text-white/30 text-xs tracking-wider animate-pulse">
                                                message sent ✓
                                            </span>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Messages section */}
                        {messages.length > 0 && (
                            <div className={`mt-12 transition-all duration-1000 delay-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                <div className="flex items-center gap-4 mb-6">
                                    <p className="text-white/20 text-xs tracking-[0.3em] uppercase">
                                        messages
                                    </p>
                                    <div className="flex-1 h-px bg-white/10" />
                                    <p className="text-white/20 text-xs">
                                        {messages.length} total
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {pagedMessages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className="relative bg-white/5 border border-white/10 p-5"
                                            style={{
                                                clipPath: 'polygon(0% 0%, 97% 0%, 100% 3%, 100% 100%, 3% 100%, 0% 97%)',
                                            }}
                                        >
                                            {/* Sender name */}
                                            <p className={`text-white/40 text-xs tracking-widest uppercase mb-2 ${!isAdmin ? 'blur-sm select-none' : ''}`}>
                                                {msg.name || "anonymous"}
                                            </p>

                                            {/* Message text */}
                                            <p className={`text-white/70 text-sm leading-relaxed ${!isAdmin ? 'blur-sm select-none' : ''}`}>
                                                {msg.text}
                                            </p>

                                            {/* Timestamp — only visible to admin */}
                                            {isAdmin && (
                                                <p className="text-white/20 text-xs mt-3">
                                                    {new Date(msg.timestamp).toLocaleDateString('en-US', {
                                                        month: 'short', day: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            )}

                                            {/* Lock icon for guests */}
                                            {!isAdmin && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
                                                        <rect x="3" y="11" width="18" height="11" rx="2" />
                                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-3 mt-6">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="text-white/30 text-xs tracking-widest uppercase hover:text-white/60 transition-colors disabled:opacity-20"
                                        >
                                            ← prev
                                        </button>
                                        <span className="text-white/20 text-xs">
                                            {page} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="text-white/30 text-xs tracking-widest uppercase hover:text-white/60 transition-colors disabled:opacity-20"
                                        >
                                            next →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <footer className="relative py-6 px-6">
                    <div className="relative z-10 flex items-center justify-between">
                        <span className="text-white/40 text-xs tracking-widest">© 2026 Adam</span>
                        <span className="text-white/30 text-xs">All Rights Reserved</span>
                    </div>
                </footer>
            </div>
        </main>
    );
}

export default App;
