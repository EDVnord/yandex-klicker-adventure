import { useState, useEffect, useRef } from 'react';
import { type Lang } from '@/i18n';

interface Props {
  lang: Lang;
  onSuccess: () => void;
  onFail: () => void;
}

const CHALLENGE_SEC = 4;
const BLINK_POSITIONS = [
  { top: '20%', left: '20%' },
  { top: '20%', left: '65%' },
  { top: '55%', left: '15%' },
  { top: '55%', left: '60%' },
  { top: '35%', left: '40%' },
];

export default function AntiCheatChallenge({ lang, onSuccess, onFail }: Props) {
  const [timeLeft, setTimeLeft] = useState(CHALLENGE_SEC);
  const [targetIdx, setTargetIdx] = useState(() => Math.floor(Math.random() * BLINK_POSITIONS.length));
  const [phase, setPhase] = useState<'waiting' | 'blink' | 'done'>('waiting');
  const [blinkVisible, setBlinkVisible] = useState(false);
  const solvedRef = useRef(false);

  // Короткая пауза, потом появляется кнопка
  useEffect(() => {
    const t = setTimeout(() => {
      setPhase('blink');
      setBlinkVisible(true);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  // Таймер обратного отсчёта
  useEffect(() => {
    if (phase !== 'blink') return;
    const iv = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(iv);
          if (!solvedRef.current) {
            setPhase('done');
            onFail();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [phase, onFail]);

  // Мигание кнопки
  useEffect(() => {
    if (phase !== 'blink') return;
    const iv = setInterval(() => {
      setBlinkVisible(v => !v);
    }, 400);
    return () => clearInterval(iv);
  }, [phase]);

  const handleHit = () => {
    if (solvedRef.current || phase !== 'blink') return;
    solvedRef.current = true;
    setPhase('done');
    onSuccess();
  };

  const pos = BLINK_POSITIONS[targetIdx];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.92)' }}>
      <div className="w-full max-w-sm px-4">

        {/* Заголовок */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🤖</div>
          <div className="font-game text-2xl text-white mb-2">
            {lang === 'ru' ? 'ТЫ ЧЕЛОВЕК?' : 'ARE YOU HUMAN?'}
          </div>
          <p className="text-sm font-bold" style={{ color: '#4a5768' }}>
            {lang === 'ru'
              ? 'Подозрительная активность! Нажми на мигающую кнопку'
              : 'Suspicious activity! Tap the blinking button'}
          </p>
        </div>

        {/* Арена */}
        <div className="relative mx-auto rounded-lg overflow-hidden"
          style={{
            width: '100%',
            height: 200,
            background: '#0a0f1a',
            border: '2px solid #E61919',
            boxShadow: '0 0 30px rgba(230,25,25,0.3)',
          }}>

          {/* Таймер-полоска */}
          <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: '#1C2333' }}>
            <div style={{
              height: '100%',
              background: timeLeft > 2 ? '#69F0AE' : '#E61919',
              width: `${(timeLeft / CHALLENGE_SEC) * 100}%`,
              transition: 'width 1s linear, background 0.3s',
              boxShadow: `0 0 8px ${timeLeft > 2 ? '#69F0AE' : '#E61919'}`,
            }} />
          </div>

          {/* Таймер цифра */}
          <div className="absolute top-3 right-3 font-game text-2xl"
            style={{ color: timeLeft > 2 ? '#69F0AE' : '#E61919' }}>
            {timeLeft}
          </div>

          {/* Мигающая кнопка */}
          {phase === 'blink' && (
            <button
              onClick={handleHit}
              style={{
                position: 'absolute',
                top: pos.top,
                left: pos.left,
                transform: 'translate(-50%, -50%)',
                opacity: blinkVisible ? 1 : 0,
                transition: 'opacity 0.15s',
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #69F0AE, #1A6BFF)',
                border: '3px solid #fff',
                boxShadow: '0 0 20px #69F0AE, 0 0 40px #1A6BFF88',
                cursor: 'pointer',
                fontSize: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              👆
            </button>
          )}

          {phase === 'waiting' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="font-game text-lg" style={{ color: '#4a5768' }}>
                {lang === 'ru' ? 'Готовься...' : 'Get ready...'}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs font-bold mt-4" style={{ color: '#2D3A50' }}>
          {lang === 'ru'
            ? 'Если не успеешь — монеты за последние 30 секунд сгорят'
            : 'Fail — and coins from last 30 seconds will be burned'}
        </p>
      </div>
    </div>
  );
}
