// v6
import { useState, useEffect, useRef, useCallback } from 'react'
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from './lib/firebase'

/* ─── 데이터 ─────────────────────────────────────────── */

const NAV = [
  { label: '소개', id: 'about' },
  { label: '활동', id: 'activities' },
  { label: '프로젝트', id: 'projects' },
  { label: '스킬', id: 'skills' },
  { label: '방명록', id: 'guestbook' },
  { label: '연락처', id: 'contact' },
]

const SHOW_SKILLS = false

type GuestEntry = { id: string; name: string; message: string; date: string }

const ACTIVITIES = [
  {
    title: '33기 이화다우리',
    role: '멘티',
    period: '2023.03 – 2023.06',
    desc: '1명의 선배 멘토와 3명의 후배 멘티들이 팀을 이루어 친목을 다지고, 대학 생활 적응 및 리더십 향상에 도움을 얻을 수 있는 이화여자대학교의 멘토링 활동',
  },
  {
    title: 'EDOC',
    role: '동아리원',
    period: '2024.03 – 2025.02',
    desc: '이화여자대학교 컴퓨터공학과 프로그래밍 동아리',
  },
  {
    title: 'EDOC',
    role: '운영진(총무)',
    period: '2025.03 – 2025.08',
    desc: '이화여자대학교 컴퓨터공학과 프로그래밍 동아리',
  },
  {
    title: '미래인재육성재단 가온회 16기',
    role: '서울경기강원 대표',
    period: '2024.06 – 2025.06',
    desc: '미래인재육성재단의 장학생을 대표하며, 장학생들의 친목과 정보교류에 앞장서는 자치기구',
  },
  {
    title: '몰입캠프',
    role: '참가자',
    period: '2026.07 – 2026.08',
    desc: '학생들이 4주 동안 자율적으로 집중 개발을 경험하는 프로그래밍 캠프',
  },
]

const PROJECTS = [
  {
    title: 'FinMate',
    category: '공모전 · 금융 앱',
    year: '2026',
    desc: '외국인 유학생이 학비 납부·해외송금·계좌 개설·월세보증금 등 상황별 서류를 증빙하면 그만큼 이체 한도가 열리는 핀테크 앱입니다. Gemini 기반 AI 상담으로 개인화된 금융 조언을 제공하며 한국어·영어·중국어·베트남어를 지원합니다.',
    tags: ['Next.js', 'TypeScript', 'Supabase', 'Gemini API'],
    repo: 'https://github.com/7immin/FinMate',
  },
  {
    title: 'ALine',
    category: '몰입캠프 · AR 소셜 앱',
    year: '2026',
    desc: '손 제스처로 허공에 그림을 그려 공유하는 에어 드로잉 SNS입니다. MediaPipe 손 추적과 AR 라운지를 활용했으며, 소셜 피드·채팅·알림과 Supabase 연동을 맡았습니다.',
    tags: ['React Native', 'Supabase', 'MediaPipe', 'AR'],
    repo: 'https://github.com/7immin/ALine',
  },
  {
    title: 'ClickMe & WishMatch',
    category: '몰입캠프 · 실시간 투표 서비스',
    year: '2026',
    desc: '"부먹 vs 찍먹"처럼 반복 투표를 진행하고 결과를 실시간 공유하는 서비스입니다. 프론트엔드를 담당했습니다.',
    tags: ['Next.js', 'TypeScript', 'Supabase', 'Docker'],
    repo: 'https://github.com/7immin/ClickMe-WishMatch',
  },
  {
    title: 'Kit',
    category: '몰입캠프 · 발표 보조 서비스',
    year: '2026',
    desc: '슬라이드 제어, 대본 요약, 타이머, 청중 질문 응답을 하나로 묶은 실시간 발표 보조 서비스입니다. Socket.io 실시간 동기화와 Gemini API 연동을 포함한 백엔드를 담당했습니다.',
    tags: ['Node.js', 'Socket.io', 'React Native', 'Gemini API'],
    repo: 'https://github.com/7immin/Kit',
  },
  {
    title: 'ColorMaster',
    category: '몰입캠프 · 실시간 웹 게임',
    year: '2026',
    desc: '이미지의 평균 RGB 값을 가장 정확하게 예측하는 경쟁형 웹 기반 실시간 멀티플레이 게임입니다. Socket.IO 기반 라운드 동기화와 랭킹·친구 시스템을 백엔드 중심으로 개발했습니다.',
    tags: ['Node.js', 'Express', 'Socket.IO', 'Firebase'],
    repo: 'https://github.com/7immin/ColorMaster',
  },
  {
    title: 'TriAI',
    category: '졸업 프로젝트 · 연구',
    year: '2025 – 2026',
    desc: '멀티모달 딥러닝 기반 지진 PGV 추정 및 위험지도 시각화 연구입니다. 지진파형과 GNSS 변위 데이터를 결합해 PGV 추정 정확도를 높이고, 공간 보간으로 지진 위험지도를 생성했습니다. 깃허브 관리와 지진파형 인코더 모델 설계·학습을 맡았습니다.',
    tags: ['Python', 'EQTransformer', 'Google Colab', '멀티모달 딥러닝'],
    repo: 'https://github.com/7immin/Capstone-TriAI',
  },
]

const SKILLS = [
  { group: '언어', items: ['TypeScript', 'JavaScript', 'Python'] },
  { group: '프레임워크', items: ['React / React Native', 'Next.js', 'Node.js / Express', 'Flask'] },
  { group: '인프라 · 데이터', items: ['Supabase', 'Firebase', 'Railway'] },
  { group: '협업 · API', items: ['Socket.io', 'Git/GitHub', 'Gemini API'] },
]

/* ─── 훅 ──────────────────────────────────────────────── */

function useFadeUp() {
  const ref = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

function CountUp({ to, duration = 1800 }: { to: number; duration?: number }) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setValue(to); return }
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      setValue(Math.round(to * (1 - Math.pow(1 - t, 3))))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [to, duration])
  return <>{value.toLocaleString('ko-KR')}</>
}

function useTypewriter(words: string[], speed = 80, pause = 1800) {
  const [display, setDisplay] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    const word = words[wordIdx]
    const delay = deleting ? speed / 2 : charIdx === word.length ? pause : speed
    const t = setTimeout(() => {
      if (!deleting && charIdx < word.length) { setDisplay(word.slice(0, charIdx + 1)); setCharIdx(c => c + 1) }
      else if (!deleting && charIdx === word.length) { setDeleting(true) }
      else if (deleting && charIdx > 0) { setDisplay(word.slice(0, charIdx - 1)); setCharIdx(c => c - 1) }
      else { setDeleting(false); setWordIdx(i => (i + 1) % words.length) }
    }, delay)
    return () => clearTimeout(t)
  }, [words, wordIdx, charIdx, deleting, speed, pause])
  return display
}

/* ─── 공통 스타일 ─────────────────────────────────────── */

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' }
const sans: React.CSSProperties = { fontFamily: 'var(--font-sans)' }

const inputBase: React.CSSProperties = {
  width: '100%',
  background: 'var(--input-surface)',
  border: '1px solid var(--border)',
  padding: '11px 14px',
  color: 'var(--ink)',
  fontSize: 14,
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  transition: 'border-color 0.2s',
}

const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = 'var(--accent)'
}
const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = 'var(--border)'
}

/* ─── 섹션 레이블 ─────────────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
    <span style={{ ...sans, color: 'var(--accent)', fontSize: 16, fontWeight: 700 }}>{'>'}</span>
    <span style={{ ...sans, color: 'var(--accent)', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }}>
      {children}
    </span>
    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--accent-bd) 0%, transparent 100%)' }} />
  </div>
)

/* ─── 방명록 폼 ──────────────────────────────────────── */

const GuestbookForm = () => {
  const [form, setForm] = useState({ name: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'guestbook'), {
        name: form.name,
        message: form.message,
        createdAt: serverTimestamp(),
      })
      setForm({ name: '', message: '' })
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: 10, marginBottom: 36 }}>
      <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
        placeholder="이름" style={inputBase} onFocus={focusStyle} onBlur={blurStyle} />
      <input required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
        placeholder="방명록을 남겨주세요." style={inputBase} onFocus={focusStyle} onBlur={blurStyle} />
      <button type="submit" disabled={submitting} style={{
        ...sans, fontSize: 14, fontWeight: 600, padding: '11px 20px',
        background: submitted ? 'var(--accent-bd)' : 'var(--accent)',
        border: 'none', color: 'var(--bg)',
        cursor: submitting ? 'default' : 'pointer', whiteSpace: 'nowrap', transition: 'opacity 0.2s',
        opacity: submitting ? 0.7 : 1,
      }}>
        {submitted ? '등록됨 ✓' : submitting ? '등록 중...' : '남기기 →'}
      </button>
    </form>
  )
}

/* ─── 프로젝트 카드 ──────────────────────────────────── */

const ProjectCard = ({ project, delay = 0 }: { project: typeof PROJECTS[0]; delay?: number }) => {
  const ref = useFadeUp()
  const hasRepo = Boolean(project.repo)
  return (
    <a ref={ref as React.RefObject<HTMLAnchorElement>}
      href={hasRepo ? project.repo : undefined}
      target={hasRepo ? '_blank' : undefined}
      rel={hasRepo ? 'noopener noreferrer' : undefined}
      onClick={e => { if (!hasRepo) e.preventDefault() }}
      className="fade-up card-hover"
      style={{ transitionDelay: `${delay}ms`, border: '1px solid var(--border)', background: 'var(--bg-2)', overflow: 'hidden', cursor: hasRepo ? 'pointer' : 'default', textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div style={{ padding: '20px 22px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <div style={{ ...sans, fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>{project.category}</div>
          <div style={{ ...sans, fontSize: 12, color: 'var(--ink-3)', fontWeight: 500 }}>{project.year}</div>
        </div>
        <h3 style={{ ...sans, fontSize: 17, fontWeight: 600, color: 'var(--heading)', marginBottom: 8 }}>{project.title}</h3>
        <p style={{ ...sans, fontSize: 13, lineHeight: 1.7, color: 'var(--ink-2)', marginBottom: 14 }}>{project.desc}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {project.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      </div>
    </a>
  )
}

/* ─── 활동 행 ────────────────────────────────────────── */

const ActivityRow = ({ activity, delay }: { activity: typeof ACTIVITIES[0]; delay: number }) => {
  const ref = useFadeUp()
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="fade-up activity-row"
      style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 40, padding: '28px 0', borderTop: '1px solid var(--border)', transitionDelay: `${delay}ms` }}>
      <div>
        <div style={{ ...sans, fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>{activity.period}</div>
        <div style={{ ...sans, fontSize: 14, color: 'var(--accent)', fontWeight: 600 }}>{activity.title}</div>
      </div>
      <div>
        <div style={{ ...sans, fontSize: 15, color: 'var(--heading)', fontWeight: 600, marginBottom: 8, whiteSpace: 'pre-line' }}>{activity.desc}</div>
        <div style={{ ...sans, fontSize: 14, lineHeight: 1.75, color: 'var(--ink-2)', whiteSpace: 'pre-line' }}>{activity.role}</div>
      </div>
    </div>
  )
}

/* ─── 스킬 카드 ──────────────────────────────────────── */

const SkillCard = ({ group, items, delay }: { group: string; items: string[]; delay: number }) => {
  const ref = useFadeUp()
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="fade-up"
      style={{ border: '1px solid var(--border)', padding: 24, background: 'var(--bg-2)', transitionDelay: `${delay}ms` }}>
      <div style={{ ...sans, fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
        {group}
      </div>
      <ul style={{ listStyle: 'none' }}>
        {items.map(skill => (
          <li key={skill} style={{ ...sans, fontSize: 14, color: 'var(--ink-2)', padding: '7px 0', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border-2)' }}>
            <span style={{ color: 'var(--accent)', fontSize: 10 }}>▸</span>{skill}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ─── 메인 앱 ────────────────────────────────────────── */

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
  )
  const [activeSection, setActiveSection] = useState('about')
  const [menuOpen, setMenuOpen] = useState(false)
  const [messages, setMessages] = useState<GuestEntry[]>([])
  const [scrolled, setScrolled] = useState(false)
  const sectionsRef = useRef<Record<string, HTMLElement | null>>({})

  const typed = useTypewriter(['백엔드 개발자', '풀스택 개발자', 'AI 엔지니어'])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    try { localStorage.setItem('theme', next) } catch { /* storage unavailable: choice lasts this visit only */ }
  }

  const setRef = useCallback((id: string) => (el: HTMLElement | null) => {
    sectionsRef.current[id] = el
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => {
      let saved: string | null = null
      try { saved = localStorage.getItem('theme') } catch { /* ignore */ }
      if (!saved) setTheme(e.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id) }),
      { rootMargin: '-40% 0px -55% 0px' }
    )
    Object.values(sectionsRef.current).forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'guestbook'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => {
        const data = doc.data()
        const createdAt = data.createdAt as Timestamp | null
        return {
          id: doc.id,
          name: data.name,
          message: data.message,
          date: createdAt ? createdAt.toDate().toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        }
      }))
    })
    return unsubscribe
  }, [])

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', transition: 'background 0.3s, color 0.3s' }}>

      {/* ── 네비게이션 ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? 'var(--nav-bg)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        transition: 'background 0.3s, border-color 0.3s',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <a href="#about" style={{ ...sans, color: 'var(--accent)', fontSize: 15, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.02em', position: 'absolute', left: 24 }}>
            KM<span style={{ opacity: 0.45, fontWeight: 400 }}>.dev</span>
          </a>

          <ul style={{ display: 'flex', gap: 32, listStyle: 'none', alignItems: 'center' }}>
            {NAV.filter(({ id }) => SHOW_SKILLS || id !== 'skills').map(({ label, id }) => (
              <li key={id}>
                <a href={`#${id}`} style={{
                  ...sans, fontSize: 13, textDecoration: 'none', fontWeight: 500,
                  color: activeSection === id ? 'var(--accent)' : 'var(--ink-2)',
                  borderBottom: activeSection === id ? '1px solid var(--accent)' : '1px solid transparent',
                  paddingBottom: 2, transition: 'color 0.2s',
                }}>
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <button onClick={toggleTheme} className="theme-btn" title="테마 전환"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, padding: 0, position: 'absolute', right: 24 }}>
            {theme === 'dark'
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── 히어로 ── */}
        <section id="about" ref={setRef('about')} style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 680, paddingTop: 80, textAlign: 'center' }}>
            <div style={{ ...sans, fontSize: 14, color: 'var(--ink-2)', marginBottom: 14 }}>
              안녕하세요, 저는
            </div>

            <h1 style={{ ...sans, fontSize: 'clamp(44px, 7vw, 92px)', fontWeight: 700, color: 'var(--heading)', lineHeight: 1.05, marginBottom: 20, letterSpacing: '-0.03em' }}>
              김민<span style={{ color: 'var(--accent)' }}>.</span>
            </h1>

            <div style={{ ...sans, fontSize: 'clamp(16px, 2.2vw, 24px)', fontWeight: 600, color: 'var(--accent)', marginBottom: 32, minHeight: '1.5em' }}>
              {typed}<span className="cursor" />
            </div>

            <p style={{ ...sans, fontSize: 16, lineHeight: 1.85, color: 'var(--ink-2)', marginBottom: 48 }}>
              이화여자대학교 소프트웨어학부 컴퓨터공학전공 (2023.03 – 현재).
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 80 }}>
              <a href="#contact" style={{
                ...sans, fontSize: 14, fontWeight: 600, textDecoration: 'none',
                padding: '13px 30px', background: 'var(--accent)', color: 'var(--bg)',
                transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}>
                연락하기 →
              </a>
              <a href="#projects" style={{
                ...sans, fontSize: 14, fontWeight: 500, textDecoration: 'none',
                padding: '13px 30px', border: '1px solid var(--accent-bd)', color: 'var(--accent)',
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-bg)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                작업 보기
              </a>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', borderTop: '1px solid var(--border)' }}>
              {[
                { value: 1, label: '수상' },
                { value: 0, label: '자격증'},
                { value: 59894840, label: '장학금' },
              ].map(({ value, label }, i) => (
                <div key={label} style={{ padding: '22px 36px', borderRight: i < 3 ? '1px solid var(--border)' : 'none', textAlign: 'center' }}>
                  <div style={{ ...sans, fontSize: 26, fontWeight: 700, color: 'var(--accent)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}><CountUp to={value} /></div>
                  <div style={{ ...sans, fontSize: 12, color: 'var(--ink-3)', marginTop: 5 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 활동 ── */}
        <section id="activities" ref={setRef('activities')} style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px' }}>
          <SectionLabel>활동</SectionLabel>
          {ACTIVITIES.map((activity, i) => <ActivityRow key={i} activity={activity} delay={i * 80} />)}
          <div style={{ borderTop: '1px solid var(--border)' }} />
        </section>

        {/* ── 프로젝트 ── */}
        <section id="projects" ref={setRef('projects')} style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px' }}>
          <SectionLabel>주요 프로젝트</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {PROJECTS.map((p, i) => <ProjectCard key={i} project={p} delay={i * 80} />)}
          </div>
        </section>

        {/* ── 스킬 ── */}
        {SHOW_SKILLS && (
          <section id="skills" ref={setRef('skills')} style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px' }}>
            <SectionLabel>스킬</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              {SKILLS.map(({ group, items }, gi) => <SkillCard key={group} group={group} items={items} delay={gi * 60} />)}
            </div>
          </section>
        )}

        {/* ── 방명록 ── */}
        <section id="guestbook" ref={setRef('guestbook')} style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px' }}>
          <SectionLabel>방명록</SectionLabel>
          <p style={{ ...sans, fontSize: 14, color: 'var(--ink-2)', marginBottom: 24 }}>
            방문해주셔서 감사합니다. 자유롭게 메시지 남겨주세요!
          </p>
          <GuestbookForm />
          <div>
            {messages.length === 0 && (
              <p style={{ ...sans, fontSize: 14, color: 'var(--ink-3)', padding: '18px 0', borderTop: '1px solid var(--border-2)' }}>
                아직 방명록이 없습니다. 첫 메시지를 남겨주세요!
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={msg.id}
                style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 24, padding: '18px 0', borderTop: '1px solid var(--border-2)' }}>
                <div>
                  <div style={{ ...sans, fontSize: 14, color: 'var(--heading)', fontWeight: 600 }}>{msg.name}</div>
                  <div style={{ ...sans, fontSize: 12, color: 'var(--ink-3)', marginTop: 3 }}>{msg.date}</div>
                </div>
                <div style={{ ...sans, fontSize: 14, lineHeight: 1.7, color: 'var(--ink-2)' }}>{msg.message}</div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border-2)' }} />
          </div>
        </section>

        {/* ── 연락처 ── */}
        <section id="contact" ref={setRef('contact')} style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px' }}>
          <SectionLabel>연락처</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
            <div>
              <h2 style={{ ...sans, fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 700, color: 'var(--heading)', lineHeight: 1.2, marginBottom: 18, letterSpacing: '-0.02em' }}>
                함께 만들어봐요<span style={{ color: 'var(--accent)' }}>.</span>
              </h2>
              <p style={{ ...sans, fontSize: 14, lineHeight: 1.85, color: 'var(--ink-2)' }}>
                정규직, 계약직, 흥미로운 사이드 프로젝트 모두 열려 있습니다.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: '이메일', value: 'kim.min.cse@gmail.com', href: 'mailto:kim.min.cse@gmail.com' },
                { label: 'GitHub', value: 'github.com/7immin', href: 'https://github.com/7immin' },
                { label: 'LinkedIn', value: 'linkedin.com/in/7immin', href: 'https://linkedin.com/in/7immin' },
              ].map(({ label, value, href }) => (
                <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="card-hover"
                  style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '18px 22px', border: '1px solid var(--border)', background: 'var(--bg-2)', textDecoration: 'none' }}>
                  <span style={{ ...sans, fontSize: 13, fontWeight: 600, color: 'var(--accent)', width: 68, flexShrink: 0 }}>{label}</span>
                  <span style={{ ...sans, fontSize: 14, color: 'var(--ink-2)', flex: 1 }}>{value}</span>
                  <span style={{ ...sans, fontSize: 14, color: 'var(--accent)' }}>→</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── 푸터 ── */}
        <footer style={{ maxWidth: 1100, margin: '0 auto', padding: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ ...sans, fontSize: 13, color: 'var(--ink-3)' }}>© {new Date().getFullYear()} 김민. All rights reserved.</span>
          <span style={{ ...sans, fontSize: 13, color: 'var(--ink-3)' }}>Built with React + TypeScript</span>
        </footer>
      </div>
    </div>
  )
}
