// v6
import { useState, useEffect, useRef, useCallback } from 'react'

/* ─── 데이터 ─────────────────────────────────────────── */

const NAV = [
  { label: '소개', id: 'about' },
  { label: '활동', id: 'activities' },
  { label: '프로젝트', id: 'projects' },
  { label: '스킬', id: 'skills' },
  { label: '방명록', id: 'guestbook' },
  { label: '연락처', id: 'contact' },
]

type GuestEntry = { id: number; name: string; message: string; date: string }

const INITIAL_MESSAGES: GuestEntry[] = [
  { id: 1, name: 'Park Soobin', message: '정말 멋진 포트폴리오예요! 언젠가 같이 작업해보고 싶어요 :)', date: '2026-08-10' },
  { id: 2, name: 'James L.', message: 'Love the clean design. Your Meridian project is incredibly impressive.', date: '2026-08-11' },
  { id: 3, name: '이현준', message: '디자인 시스템 글 잘 읽었습니다. 많이 배워갑니다!', date: '2026-08-12' },
]

const ACTIVITIES = [
  {
    title: '33기 이화다우리',
    role: '멘티',
    period: '2023.03 — 2023.06',
    desc: '일 4천만 명 이상이 사용하는 검색 결과 페이지 리디자인을 주도했습니다. 12개 제품 팀이 도입한 디자인 시스템을 구축했습니다.',
  },
  {
    title: 'EDOC',
    role: '동아리원',
    period: '2024.03 — 2025.02',
    desc: '카카오톡 웹의 핵심 채팅 인터페이스 컴포넌트를 개발했습니다. 코드 스플리팅과 프리페칭을 통해 초기 로딩 시간을 38% 단축했습니다.',
  },
  {
    title: 'EDOC',
    role: '운영진',
    period: '2025.03 — 2025.08',
    desc: '모바일 퍼스트 상품 페이지를 제작하고 결제 플로우 A/B 테스트를 통해 전환율을 22% 향상시켰습니다.',
  },
  {
    title: '미래인재육성재단 가온회',
    role: '서울경기강원 대표',
    period: '2024.06 — 2025.06',
    desc: '모바일 퍼스트 상품 페이지를 제작하고 결제 플로우 A/B 테스트를 통해 전환율을 22% 향상시켰습니다.',
  },
  {
    title: '몰입캠프',
    role: '참가자',
    period: '2026.07 — 2026.08',
    desc: '모바일 퍼스트 상품 페이지를 제작하고 결제 플로우 A/B 테스트를 통해 전환율을 22% 향상시켰습니다.',
  },
]

const PROJECTS = [
  {
    title: 'Meridian',
    category: '프로덕트 디자인 / 개발',
    year: '2024',
    desc: '분산된 디자인 팀을 위한 실시간 협업 도구입니다. React, WebSockets, 커스텀 CRDT 레이어로 구축했습니다.',
    tags: ['React', 'TypeScript', 'Node.js', 'WebSocket'],
    img: 'photo-1558618666-fcd25c85cd64',
  },
  {
    title: 'Sora Dashboard',
    category: '데이터 시각화',
    year: '2023',
    desc: '이커머스 브랜드를 위한 애널리틱스 대시보드입니다. 하루 200만 건 이상의 이벤트를 처리하고 실시간으로 시각화합니다.',
    tags: ['Next.js', 'D3.js', 'PostgreSQL'],
    img: 'photo-1551288049-bebda4e38f71',
  },
  {
    title: 'Pallete',
    category: '오픈소스',
    year: '2023',
    desc: '색상 접근성 검사기 및 팔레트 생성 도구입니다. GitHub 스타 4천 개 이상, 전 세계 200개 이상의 디자인 시스템에서 사용 중입니다.',
    tags: ['Vue 3', 'WCAG 2.1', 'CLI'],
    img: 'photo-1609921212029-bb5a28e60960',
  },
  {
    title: 'Chroma OS',
    category: '사이드 프로젝트',
    year: '2022',
    desc: '라이브 프리뷰와 AI 자동완성을 지원하는 브라우저 기반 코드 에디터입니다. 14개 언어 문법 강조를 지원합니다.',
    tags: ['Monaco', 'WebAssembly', 'AI'],
    img: 'photo-1537432376769-00f5c2f4c8d2',
  },
]

const SKILLS = [
  { group: '언어', items: ['TypeScript', 'JavaScript', 'Go', 'Python'] },
  { group: '프레임워크', items: ['React', 'Next.js', 'Vue 3', 'Node.js'] },
  { group: '인프라', items: ['AWS', 'Docker', 'Vercel', 'CI/CD'] },
  { group: '도구', items: ['Figma', 'Git', 'PostgreSQL', 'Redis'] },
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
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
    <span style={{ ...sans, color: 'var(--accent)', fontSize: 16, fontWeight: 700 }}>{'>'}</span>
    <span style={{ ...sans, color: 'var(--accent)', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }}>
      {children}
    </span>
    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--accent-bd) 0%, transparent 100%)' }} />
  </div>
)

/* ─── 방명록 폼 ──────────────────────────────────────── */

const GuestbookForm = ({ onSubmit }: { onSubmit: (e: GuestEntry) => void }) => {
  const [form, setForm] = useState({ name: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ id: Date.now(), name: form.name, message: form.message, date: new Date().toISOString().slice(0, 10) })
    setForm({ name: '', message: '' })
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 10, marginBottom: 36 }}>
      <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
        placeholder="이름" style={inputBase} onFocus={focusStyle} onBlur={blurStyle} />
      <input required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
        placeholder="메시지를 남겨주세요..." style={inputBase} onFocus={focusStyle} onBlur={blurStyle} />
      <button type="submit" style={{
        ...sans, fontSize: 14, fontWeight: 600, padding: '11px 20px',
        background: submitted ? 'var(--accent-bd)' : 'var(--accent)',
        border: 'none', color: 'var(--bg)',
        cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity 0.2s',
      }}>
        {submitted ? '등록됨 ✓' : '남기기 →'}
      </button>
    </form>
  )
}

/* ─── 연락처 폼 ──────────────────────────────────────── */

const ContactForm = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const fields = [
    { key: 'name', label: '이름', placeholder: '홍길동', type: 'text' },
    { key: 'email', label: '이메일', placeholder: 'your@email.com', type: 'email' },
    { key: 'message', label: '메시지', placeholder: '프로젝트에 대해 알려주세요...', type: 'textarea' },
  ]

  return sent ? (
    <div style={{ border: '1px solid var(--accent-bd)', padding: 40, background: 'var(--accent-bg)' }}>
      <div style={{ ...sans, color: 'var(--accent)', marginBottom: 8, fontSize: 17, fontWeight: 600 }}>
        메시지 전송 완료<span className="cursor" />
      </div>
      <p style={{ ...sans, color: 'var(--ink-2)', fontSize: 14 }}>
        24시간 이내에 답변드리겠습니다.
      </p>
    </div>
  ) : (
    <form onSubmit={e => { e.preventDefault(); setSent(true) }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {fields.map(({ key, label, placeholder, type }) => (
        <div key={key}>
          <div style={{ ...sans, color: 'var(--accent)', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
            {label}
          </div>
          {type === 'textarea'
            ? <textarea rows={4} required value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                style={{ ...inputBase, resize: 'none', display: 'block' }} placeholder={placeholder}
                onFocus={focusStyle} onBlur={blurStyle} />
            : <input type={type} required value={form[key as 'name' | 'email']}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                style={inputBase} placeholder={placeholder}
                onFocus={focusStyle} onBlur={blurStyle} />
          }
        </div>
      ))}
      <button type="submit" style={{
        ...sans, fontSize: 14, fontWeight: 600, padding: '12px 28px', alignSelf: 'flex-start',
        background: 'var(--accent)', border: 'none',
        color: 'var(--bg)', cursor: 'pointer', transition: 'opacity 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}>
        메시지 보내기 →
      </button>
    </form>
  )
}

/* ─── 프로젝트 카드 ──────────────────────────────────── */

const ProjectCard = ({ project, delay = 0 }: { project: typeof PROJECTS[0]; delay?: number }) => {
  const ref = useFadeUp()
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>}
      className="fade-up card-hover"
      style={{ transitionDelay: `${delay}ms`, border: '1px solid var(--border)', background: 'var(--bg-2)', overflow: 'hidden', cursor: 'pointer' }}>
      <div style={{ overflow: 'hidden', height: 200, position: 'relative' }}>
        <img
          src={`https://images.unsplash.com/photo-${project.img}?w=720&h=400&fit=crop&auto=format`}
          alt={project.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(25%) brightness(0.7)', transition: 'transform 0.5s, filter 0.5s' }}
          onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'scale(1.05)'; el.style.filter = 'grayscale(5%) brightness(0.85)' }}
          onMouseLeave={e => { const el = e.currentTarget; el.style.transform = 'scale(1)'; el.style.filter = 'grayscale(25%) brightness(0.7)' }}
        />
        <div style={{ position: 'absolute', top: 12, right: 12, ...sans, fontSize: 12, fontWeight: 600, color: 'var(--accent)', background: 'rgba(0,0,0,0.65)', padding: '3px 8px', border: '1px solid var(--accent-bd)' }}>
          {project.year}
        </div>
      </div>
      <div style={{ padding: '20px 22px 24px' }}>
        <div style={{ ...sans, fontSize: 12, color: 'var(--accent)', marginBottom: 6, fontWeight: 500 }}>{project.category}</div>
        <h3 style={{ ...sans, fontSize: 17, fontWeight: 600, color: 'var(--heading)', marginBottom: 8 }}>{project.title}</h3>
        <p style={{ ...sans, fontSize: 13, lineHeight: 1.7, color: 'var(--ink-2)', marginBottom: 14 }}>{project.desc}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {project.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      </div>
    </div>
  )
}

/* ─── 활동 행 ────────────────────────────────────────── */

const ActivityRow = ({ activity, delay }: { activity: typeof ACTIVITIES[0]; delay: number }) => {
  const ref = useFadeUp()
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="fade-up"
      style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 40, padding: '28px 0', borderTop: '1px solid var(--border)', transitionDelay: `${delay}ms` }}>
      <div>
        <div style={{ ...sans, fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>{activity.period}</div>
        <div style={{ ...sans, fontSize: 14, color: 'var(--accent)', fontWeight: 600 }}>{activity.title}</div>
      </div>
      <div>
        <div style={{ ...sans, fontSize: 15, color: 'var(--heading)', fontWeight: 600, marginBottom: 8 }}>{activity.role}</div>
        <div style={{ ...sans, fontSize: 14, lineHeight: 1.75, color: 'var(--ink-2)' }}>{activity.desc}</div>
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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [activeSection, setActiveSection] = useState('about')
  const [menuOpen, setMenuOpen] = useState(false)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [scrolled, setScrolled] = useState(false)
  const sectionsRef = useRef<Record<string, HTMLElement | null>>({})

  const typed = useTypewriter(['프론트엔드 엔지니어', '프로덕트 빌더', 'UI/UX 엔지니어', '오픈소스 기여자'])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const setRef = useCallback((id: string) => (el: HTMLElement | null) => {
    sectionsRef.current[id] = el
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

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
            {NAV.map(({ label, id }) => (
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
              소개
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
                { value: '7년+', label: '경력' },
                { value: '40+', label: '프로젝트' },
                { value: '12', label: '오픈소스' },
                { value: '1', label: '수상' },
              ].map(({ value, label }, i) => (
                <div key={label} style={{ padding: '22px 36px', borderRight: i < 3 ? '1px solid var(--border)' : 'none', textAlign: 'center' }}>
                  <div style={{ ...sans, fontSize: 26, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{value}</div>
                  <div style={{ ...sans, fontSize: 12, color: 'var(--ink-3)', marginTop: 5 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 활동 ── */}
        <section id="activities" ref={setRef('activities')} style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px' }}>
          <SectionLabel>활동</SectionLabel>
          {ACTIVITIES.map((activity, i) => <ActivityRow key={i} activity={activity} delay={i * 80} />)}
          <div style={{ borderTop: '1px solid var(--border)' }} />
        </section>

        {/* ── 프로젝트 ── */}
        <section id="projects" ref={setRef('projects')} style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px' }}>
          <SectionLabel>주요 프로젝트</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {PROJECTS.map((p, i) => <ProjectCard key={i} project={p} delay={i * 80} />)}
          </div>
        </section>

        {/* ── 스킬 ── */}
        <section id="skills" ref={setRef('skills')} style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px' }}>
          <SectionLabel>스킬</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {SKILLS.map(({ group, items }, gi) => <SkillCard key={group} group={group} items={items} delay={gi * 60} />)}
          </div>
        </section>

        {/* ── 방명록 ── */}
        <section id="guestbook" ref={setRef('guestbook')} style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px' }}>
          <SectionLabel>방명록</SectionLabel>
          <p style={{ ...sans, fontSize: 14, color: 'var(--ink-2)', marginBottom: 24 }}>
            방문해주셔서 감사합니다. 짧은 메시지 남겨주세요 :)
          </p>
          <GuestbookForm onSubmit={entry => setMessages(prev => [entry, ...prev])} />
          <div>
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
        <section id="contact" ref={setRef('contact')} style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px' }}>
          <SectionLabel>연락처</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80 }}>
            <div>
              <h2 style={{ ...sans, fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 700, color: 'var(--heading)', lineHeight: 1.2, marginBottom: 18, letterSpacing: '-0.02em' }}>
                함께 만들어봐요<span style={{ color: 'var(--accent)' }}>.</span>
              </h2>
              <p style={{ ...sans, fontSize: 14, lineHeight: 1.85, color: 'var(--ink-2)', marginBottom: 36 }}>
                정규직, 계약직, 흥미로운 사이드 프로젝트 모두 열려 있습니다.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: '이메일', value: 'kim.min.cse@gmail.com', href: 'mailto:junho.kim@email.com' },
                  { label: 'GitHub', value: 'github.com/7immin', href: '#' },
                  { label: 'LinkedIn', value: 'linkedin.com/in/7immin', href: '#' },
                ].map(({ label, value, href }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ ...sans, fontSize: 13, fontWeight: 600, color: 'var(--accent)', width: 68, flexShrink: 0 }}>{label}</span>
                    <a href={href} style={{ ...sans, fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none', borderBottom: '1px solid var(--border)', paddingBottom: 1, transition: 'color 0.2s, border-color 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-2)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
                      {value}
                    </a>
                  </div>
                ))}
              </div>
            </div>
            <ContactForm />
          </div>
        </section>

        {/* ── 푸터 ── */}
        <footer style={{ maxWidth: 1100, margin: '0 auto', padding: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ ...sans, fontSize: 13, color: 'var(--ink-3)' }}>© {new Date().getFullYear()} 김민</span>
          <span style={{ ...sans, fontSize: 13, color: 'var(--ink-3)' }}>Built with React + TypeScript</span>
        </footer>
      </div>
    </div>
  )
}
