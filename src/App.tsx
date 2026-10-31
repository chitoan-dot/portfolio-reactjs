import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type ReactNode, type ChangeEvent, type MouseEvent as ReactMouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { profile } from './data/profile'
import { skills } from './data/skills'
import { projects, type Project, type ProjectCategory } from './data/projects'

type SymbolName = 'code' | 'database' | 'server' | 'layers' | 'rocket' | 'box' | 'mail' | 'github' | 'linkedin' | 'map' | 'send' | 'arrow' | 'close' | 'search' | 'terminal' | 'shield' | 'folder' | 'network' | 'external'

function Icon({ name, size = 20, ...props }: { name: SymbolName; size?: number; className?: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const shapes: Record<SymbolName, ReactNode> = {
    code: <><path d="m8 4-6 6 6 6M16 4l6 6-6 6M14 2l-4 16"/></>,
    database: <><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></>,
    server: <><rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01M11 6.5h7M11 17.5h7"/></>,
    layers: <><path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/></>,
    rocket: <><path d="M4 14c4-1 7-4 8-8 2-2 5-3 9-3 0 4-1 7-3 9-4 1-7 4-8 8l-2-5-4-1ZM14 10h.01M5 19l-2 3M8 22l-1 1"/></>,
    box: <><path d="m12 2 9 5v10l-9 5-9-5V7l9-5ZM3 7l9 5 9-5M12 12v10"/></>,
    mail: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m3 6 9 7 9-7"/></>,
    github: <><path d="M9 19c-4.5 1.5-4.5-2.5-6-3m12 6v-3.8c0-1 .3-1.5.7-2-3-.4-5.7-1.5-5.7-6.2 0-1.3.5-2.4 1.3-3.3-.1-.6-.5-2 .2-3.3 0 0 1.7 0 3.4 1.7a11.4 11.4 0 0 1 6.2 0C18.8 1.4 20.5 1.4 20.5 1.4c.7 1.3.3 2.7.2 3.3.8.9 1.3 2 1.3 3.3 0 4.7-2.7 5.8-5.7 6.2.4.5.7 1 .7 2V22" transform="translate(-1 0) scale(.98)"/></>,
    linkedin: <><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 10v7M7 7v.1M11 17v-7h3v1.4c1.3-2.7 5-1.9 5 1.8V17"/></>,
    map: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    send: <><path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/></>,
    arrow: <><path d="M3 12h18M14 5l7 7-7 7"/></>,
    close: <><path d="M4 4l16 16M20 4 4 20"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></>,
    terminal: <><rect x="2" y="3" width="20" height="18" rx="2"/><path d="m6 8 4 4-4 4M12 16h5"/></>,
    shield: <><path d="m12 2 9 4v5c0 6-3.6 9.5-9 11-5.4-1.5-9-5-9-11V6l9-4ZM8 12l3 3 5-5"/></>,
    folder: <><path d="M3 6h7l2 3h9v11H3V6ZM3 6V4h7l2 2"/></>,
    network: <><circle cx="12" cy="3" r="2"/><circle cx="4" cy="20" r="2"/><circle cx="20" cy="20" r="2"/><path d="M12 5v7M12 12l-8 6M12 12l8 6"/></>,
    external: <><path d="M13 3h8v8M21 3l-10 10M19 14v6H4V5h6"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...common} {...props}>{shapes[name]}</svg>
}

function Background() {
  return <div aria-hidden="true" className="ambient-layer">
    <div className="starscape"/><div className="horizon-light"/><div className="floor-grid"/>
    <div className="ambient-orb ambient-orb-a"/><div className="ambient-orb ambient-orb-b"/>
    <div className="ambient-circuit circuit-left"/><div className="ambient-circuit circuit-right"/>
    <div className="ambient-laser ambient-laser-a"/><div className="ambient-laser ambient-laser-b"/>
  </div>
}

const NAV_SECTION_IDS = ['home', 'about', 'projects', 'contact'] as const
type NavSection = (typeof NAV_SECTION_IDS)[number]

function isNavSection(value: string): value is NavSection {
  return NAV_SECTION_IDS.some(id => id === value)
}

function routeFromHash(): NavSection {
  const hash = window.location.hash.slice(1)
  return isNavSection(hash) ? hash : 'home'
}

/** Browser-native anchor scroll, matching the original Portfolio sample. */
function jumpDirect(_event: ReactMouseEvent<HTMLAnchorElement>, id: NavSection) {
  // Do not preventDefault: href="#..." + CSS smooth scroll handles the motion.
  window.dispatchEvent(new CustomEvent<NavSection>('portfolio:navigate', { detail: id }))
}

function Header({ active }: { active: NavSection }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  return <header className="site-header">
    <div className="header-inner page-wrap">
      <a className="brand" href="#home" onClick={e=>{jumpDirect(e,'home');setMobileOpen(false)}} aria-label="Về đầu trang">
        <strong>{profile.name}</strong><span>DEV PORTFOLIO</span>
      </a>
      <button className="mobile-menu-toggle" onClick={()=>setMobileOpen(v=>!v)} aria-expanded={mobileOpen} aria-label="Bật hoặc tắt menu">☰</button>
      <nav aria-label="Điều hướng chính" className={`site-nav ${mobileOpen ? 'opened' : ''}`}>
        <span className="nav-live-dot" aria-hidden="true"/>
        {NAV_SECTION_IDS.map(item=><a key={item} href={`#${item}`} onClick={e=>{jumpDirect(e, item);setMobileOpen(false)}} aria-current={active===item?'page':undefined} className={active===item?'active':''}>{item.toUpperCase()}</a>)}
      </nav>
      <a className="header-cta" href="#contact" onClick={e=>{jumpDirect(e,'contact');setMobileOpen(false)}}><span className="small-spark">✧</span> LET’S CONNECT <Icon name="arrow" size={15}/></a>
    </div>
  </header>
}

function OctagonCore() {
  const [powered, setPowered] = useState(false)
  return <div className={`reactor-shell ${powered?'powered':''}`}>
    <div className="reactor-halo reactor-halo-cyan"/><div className="reactor-halo reactor-halo-magenta"/>
    <div className="reactor-trace reactor-trace-left"/><div className="reactor-trace reactor-trace-right"/>
    <svg className="reactor-circuit-board" viewBox="0 0 650 590" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <path className="reactor-route reactor-route-cyan" d="M70 110 H155 L207 161 M580 110 H505 L453 161 M65 467 H151 L205 413 M584 467 H503 L451 413"/>
      <path className="reactor-route reactor-route-magenta" d="M33 275 H100 L161 215 M618 275 H552 L491 215 M165 462 H203 M485 462 H448"/>
      <circle className="circuit-node" cx="155" cy="110" r="3"/><circle className="circuit-node" cx="505" cy="110" r="3"/><circle className="circuit-node" cx="150" cy="467" r="3"/><circle className="circuit-node" cx="503" cy="467" r="3"/>
    </svg>
    <button className="reactor-unit" type="button" onClick={()=>setPowered(v=>!v)} aria-pressed={powered} title="Bật/tắt năng lượng neon">
      <span className="octagon octagon-outer"/><span className="octagon octagon-mid"/><span className="octagon octagon-inner"/><span className="octagon octagon-core"/>
      <svg className="reactor-energy-rails" viewBox="0 0 420 420" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="energy-rail-gradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#16edff"/><stop offset=".48" stopColor="#6d73ff"/><stop offset=".77" stopColor="#f541ef"/><stop offset="1" stopColor="#16edff"/></linearGradient>
        </defs>
        <polygon className="energy-rail energy-rail-one" points="125,12 295,12 408,125 408,295 295,408 125,408 12,295 12,125" />
        <polygon className="energy-rail energy-rail-two" points="137,44 283,44 376,137 376,283 283,376 137,376 44,283 44,137" />
        <polygon className="energy-rail energy-rail-three" points="146,66 274,66 354,146 354,274 274,354 146,354 66,274 66,146" />
        <path className="energy-rail-dashes" d="M125 12 H210 M295 408 H210 M12 125 V210 M408 295 V210"/>
      </svg>
      <span className="reactor-depth-glint"/>
      <span className="reactor-center">
  <img
    src="/images/avatar.jpg"
    alt="Ảnh cá nhân"
    className="reactor-avatar"
  />
</span>
      <span className="reactor-scan"/>
    </button>
    <div className="reactor-tag tag-api"><Icon name="server" size={17}/><span><strong>Backend & APIs</strong><small>Spring Boot · Java</small></span></div>
    <div className="reactor-tag tag-db"><Icon name="database" size={17}/><span><strong>Database</strong><small>MySQL · PostgreSQL</small></span></div>
    <div className="reactor-tag tag-design"><Icon name="layers" size={17}/><span><strong>System Design</strong><small>Logic · Security</small></span></div>
    <div className="reactor-tag tag-project"><Icon name="box" size={17}/><span><strong>Real Projects</strong><small>Learn · Build · Improve</small></span></div>
  </div>
}

function StatusPanel() {
  const data = [
    {label:'LOCATION',value:profile.location},
    {label:'STATUS',value:profile.status},
    {label:'FOCUS',value:profile.focus},
    {label:'INTERESTS',value:profile.interests},
  ]
  return <div className="status-panel hud-panel"><div className="panel-title">// SYSTEM PROFILE</div>
    {data.map((item,i)=><div className="status-row" key={item.label}><span className="status-num">0{i+1}</span><div><span className="status-label">{item.label}</span><span className="status-value">{item.label==='STATUS'&&<i className="green-signal"/>}{item.value}</span></div></div>)}
  </div>
}

function Terminal({compact=false}:{compact?:boolean}) {
  const lines = ['$ initializing portfolio...', '> loading developer modules  ✓', '> connecting project data   ✓', '> ready to explore', '> _']
  return <div className={`console-panel hud-panel ${compact?'console-compact':''}`}>
    <div className="console-toolbar"><span className="traffic-lights"><i/><i/><i/></span><span>PORTFOLIO.EXE</span></div>
    <div className="console-body">{lines.map((line,i)=><div key={line} className={i===lines.length-1?'console-prompt':''} style={{animationDelay:`${i*.22}s`}}>{line}</div>)}</div>
  </div>
}

function SocialLinks() {
  const links: Array<{href:string;name:SymbolName;label:string}> = [
    {href:profile.github,name:'github',label:'GitHub'},
    {href:profile.linkedin,name:'linkedin',label:'LinkedIn'},
    {href:profile.email?`mailto:${profile.email}`:'',name:'mail',label:'Email'},
  ]
  return <div className="social-links">{links.map(item=>item.href?<a key={item.label} className="social-icon" href={item.href} target={item.href.startsWith('mailto:')?undefined:'_blank'} rel="noopener noreferrer" aria-label={item.label}><Icon name={item.name} size={19}/></a>:<span key={item.label} className="social-icon muted" title={`${item.label}: chưa cập nhật`} aria-label={`${item.label}: chưa cập nhật`}><Icon name={item.name} size={19}/></span>)}</div>
}

function TechStack() {
  const visible = ['Java','Spring Boot','Python','MySQL','PostgreSQL','React','TypeScript','Docker','Git','PyQt5']
  return <div className="tech-panel hud-panel"><h3><Icon name="network" size={17}/> TECH STACK</h3><div className="tech-grid">
    {visible.map((name,i)=>{const value=skills.find(item=>item.name===name);return <div className="tech-item" key={name} style={{'--skill-accent':value?.color||'#22d3ee'} as CSSProperties}><span className="tech-glyph">{['☕','⬡','Py','♜','◈','⚛','TS','▣','◆','Qt'][i]}</span><span>{name}</span></div>})}
  </div></div>
}

function Hero() {
  return <section id="home" className="home-section page-wrap">
    <div className="hero-scene" aria-hidden="true">
      <div className="scene-wall scene-wall-left"/><div className="scene-wall scene-wall-right"/>
      <div className="scene-skyline"/><div className="scene-floor-reflection"/>
      <div className="scene-sweep scene-sweep-cyan"/><div className="scene-sweep scene-sweep-pink"/>
      <div className="scene-dust"/>
    </div>
    <div className="hero-top">
      <div className="hero-copy"><span className="eyebrow"><i/> &lt; FULL-STACK / BACKEND-FOCUSED /&gt;</span><p className="hello">{profile.eyebrow}</p><h1 className="hero-name-split"><span className="hero-name-line">{profile.name.split('\n')[0]}</span><span className="hero-name-line hero-name-bottom">{profile.name.split('\n')[1] ?? ''}</span></h1><h2>{profile.role}</h2><p className="hero-intro">{profile.intro}</p>
        <div className="hero-buttons"><a className="button-primary" href="#projects" onClick={e=>jumpDirect(e,'projects')}>Xem dự án <Icon name="arrow" size={19}/></a><a className="button-ghost" href="#contact" onClick={e=>jumpDirect(e,'contact')}><Icon name="mail" size={18}/> Liên hệ với tôi</a></div>
        <SocialLinks/>
      </div>
      <OctagonCore/>
      <div className="hero-sidebar"><StatusPanel/><div className="sidebar-caption"><span className="square-pulse"/> DESIGN · DEVELOP · DELIVER</div></div>
    </div>
    <div className="hero-bottom">
      <div className="quick-panel hud-panel"><h3><Icon name="shield" size={17}/> QUICK INFO</h3><dl><div><dt>Role</dt><dd>{profile.role}</dd></div><div><dt>Location</dt><dd>{profile.location}</dd></div><div><dt>Focus</dt><dd>Full-stack · Backend-focused</dd></div><div><dt>Approach</dt><dd>Learn · Build · Improve</dd></div></dl></div>
      <TechStack/>
      <Terminal/>
    </div>
    <a className="scroll-invite" href="#projects" onClick={e=>jumpDirect(e,'projects')}>CUỘN XUỐNG PROJECTS <span>↓</span></a>
  </section>
}

/** New section only: existing Hero, Projects, Contact and effects are preserved. */
function AboutSection() {
  return <section id="about" className="about-section page-wrap">
    <ScrollReveal direction="up" delay={0.06}>
      <div className="section-topline">// 01. DEVELOPER PROFILE</div>
      <div className="section-head"><div><h2>ABOUT ME <span>/</span></h2><p>Đôi nét về bản thân, định hướng và hành trình học lập trình của mình.</p></div><span className="section-counter">PROFILE / FULL-STACK · BACKEND FOCUS</span></div>
    </ScrollReveal>
    <div className="about-layout">
      <ScrollReveal direction="left" className="about-main-reveal" delay={0.1}>
        <article className="about-panel about-description hud-panel">
          <div className="about-panel-label"><Icon name="code" size={17}/> // WHO AM I?</div>
          <h3>Xin chào, mình là <strong>{profile.name}</strong></h3>
          <p>{profile.longIntro}</p>
          <p>Mục tiêu của mình là kết hợp khả năng phát triển ứng dụng đa tầng với nền tảng Backend vững chắc.</p>
          <div className="about-mini-tags"><span>JAVA / SPRING BOOT</span><span>REACT / TYPESCRIPT</span><span>DATABASE</span><span>REST API</span></div>
          {/* <div className="about-cv-row"><span><Icon name="terminal" size={16}/> CV / RESUME</span>{profile.cv ? <a className="about-cv-btn" href={profile.cv} target="_blank" rel="noreferrer">Xem CV <Icon name="external" size={15}/></a> : <span className="about-cv-pending">Chưa thêm file CV — cập nhật trong profile.ts</span>}</div> */}
        </article>
      </ScrollReveal>
      <div className="about-side">
        <ScrollReveal direction="right" delay={0.13}><article className="about-panel about-detail hud-panel"><div className="about-panel-label"><Icon name="layers" size={18}/> EDUCATION / HỌC VẤN</div><h3>Sinh viên CNTT</h3><p>Trường Đại học Giao thông Vận tải TP.HCM</p><p className="education-year">Hiện tại đang là sinh viên năm 3</p></article></ScrollReveal>
        <ScrollReveal direction="right" delay={0.2}><article className="about-panel about-detail hud-panel"><div className="about-panel-label"><Icon name="rocket" size={18}/> CAREER GOAL / ĐỊNH HƯỚNG</div><h3>Full-stack Developer</h3><p>Phát triển ứng dụng ở cả giao diện, nghiệp vụ và dữ liệu; tiếp tục đào sâu Java, Spring Boot và thiết kế Backend.</p></article></ScrollReveal>
      </div>
    </div>
  </section>
}

function PreviewGraphic({project}:{project:Project}) {
  if(project.id===1) return <div className="project-preview transfer-preview" aria-label="Minh họa giao diện phần mềm truyền file UPLOWER">
    <div className="preview-browser"><span/><span/><span/><i>UPLOAD MANAGER</i></div>
    <div className="transfer-side"><span>FILES</span><i/><i/><i/></div><div className="transfer-main"><div className="transfer-file"><Icon name="folder" size={23}/><div><b>project_archive.zip</b><small>Transfer in progress</small></div><em>78%</em></div><div className="transfer-meter"><span/></div><div className="transfer-controls"><i>PAUSE</i><i>RESUME</i><i>STOP</i></div></div>
    <span className="preview-sample-label">ILLUSTRATIVE UI</span>
  </div>
  if(project.id===2) return <div className="project-preview fepa-preview" aria-label="Minh họa giao diện quản lý tài chính cá nhân FEPA">
    <div className="preview-browser"><span/><span/><span/><i>FEPA / PERSONAL FINANCE</i></div>
    <div className="fepa-preview-content">
      <div className="fepa-preview-title">FINANCE OVERVIEW</div>
      <div className="fepa-preview-cards"><div>INCOME <b>↑</b></div><div>EXPENSES <b>↓</b></div><div>BALANCE <b>◈</b></div></div>
      <div className="fepa-preview-chart"><i/><i/><i/><i/><i/><i/><i/><i/></div>
    </div>
    <span className="preview-sample-label">ILLUSTRATIVE UI</span>
  </div>
  return <div className="project-preview db-preview" aria-label="Minh họa sơ đồ quan hệ dữ liệu quản lý đăng ký học phần">
    <div className="preview-browser"><span/><span/><span/><i>COURSE DATABASE SCHEMA</i></div>
    <svg className="db-connectors" viewBox="0 0 420 190" preserveAspectRatio="none" aria-hidden="true"><path d="M125 95H210V48H287M210 95H287M210 95V148H287" fill="none" stroke="#21dcef" strokeDasharray="5 5" strokeWidth="2"/></svg>
    <div className="db-table db-table-main"><strong>STUDENT</strong><span>PK student_id</span><span>name</span><span>email</span></div>
    <div className="db-table db-table-a"><strong>ENROLLMENT</strong><span>FK student_id</span><span>FK course_id</span></div>
    <div className="db-table db-table-b"><strong>COURSE</strong><span>PK course_id</span><span>credits</span></div>
    <span className="preview-sample-label">ILLUSTRATIVE SCHEMA</span>
  </div>
}

function ProjectCard({project,onOpen}:{project:Project;onOpen:(p:Project)=>void}) {
  return <article className="project-card" style={{'--project-accent':project.accent} as CSSProperties}>
    <div className="project-topline"><span className="project-index">0{project.id} / {project.label}</span><span className="project-category">{project.category}</span></div>
    <PreviewGraphic project={project}/>
    <div className="project-body"><span className="project-role">{project.role}</span><h3>{project.title}</h3><p>{project.description}</p><div className="project-tags">{project.tags.slice(0,4).map(tag=><span key={tag}>{tag}</span>)}</div>
      <div className="project-card-bottom"><span className="project-state"><i/>{project.status}</span><button className="details-button" onClick={()=>onOpen(project)}>Xem chi tiết <Icon name="arrow" size={17}/></button></div>
    </div>
  </article>
}


function ProjectDialog({project,onClose}:{project:Project;onClose:()=>void}) {
  const [localVideoUrl,setLocalVideoUrl] = useState<string | null>(null)
  const [videoState,setVideoState] = useState<'loading'|'ready'|'missing'>(project.demoVideo ? 'loading' : 'missing')
  const videoSrc = localVideoUrl || project.demoVideo || ''

  // Revoke temporary browser URLs after preview to avoid a memory leak.
  useEffect(() => () => { if (localVideoUrl) URL.revokeObjectURL(localVideoUrl) }, [localVideoUrl])
  useEffect(() => {
    const onKey = (e:KeyboardEvent) => { if(e.key==='Escape') onClose() }
    document.addEventListener('keydown',onKey)
    const before = document.body.style.overflow
    document.body.style.overflow='hidden'
    return () => {
      document.removeEventListener('keydown',onKey)
      document.body.style.overflow=before
    }
  }, [onClose])

  function previewLocalVideo(event:ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) {
      setVideoState('missing')
      return
    }
    setLocalVideoUrl(URL.createObjectURL(file))
    setVideoState('loading')
    event.target.value = ''
  }

  return createPortal(<div className="dialog-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}>
    <div className="project-dialog hud-panel" role="dialog" aria-modal="true" aria-label={`Chi tiết dự án ${project.title}`}>
      <div className="dialog-head"><span>// PROJECT DETAILS</span><button aria-label="Đóng" autoFocus onClick={onClose}><Icon name="close" size={20}/></button></div>
      <span className="dialog-category">{project.category} / {project.role}</span>
      <h2>{project.title}</h2>

      <div className="demo-video-heading"><h3><span className="video-signal"/> VIDEO DEMO</h3><span>PROJECT SHOWCASE // 0{project.id}</span></div>
      <div className="demo-video-frame">
        {videoSrc && videoState !== 'missing' && <video
          key={videoSrc}
          className={`demo-player ${videoState==='ready' ? 'is-ready' : ''}`}
          controls
          playsInline
          preload="metadata"
          src={videoSrc}
          onLoadedMetadata={()=>setVideoState('ready')}
          onError={()=>setVideoState('missing')}
          aria-label={`Video demo dự án ${project.title}`}
        >Trình duyệt không hỗ trợ phát video này.</video>}
        {videoState !== 'ready' && <div className="demo-video-placeholder" role="status">
          <span className="demo-play-mark" aria-hidden="true">▶</span>
          <strong>{videoState==='loading' ? 'Đang tải video demo...' : 'Chưa có video demo'}</strong>
          <span>{videoState==='loading' ? 'Đang kiểm tra nguồn video.' : 'Chọn một video từ máy để xem thử ở đây.'}</span>
        </div>}
      </div>
      {/* <div className="demo-video-controls">
        <label className="demo-upload-button"> <Icon name="folder" size={16}/> Chọn video xem thử
          <input type="file" accept="video/*" onChange={previewLocalVideo} aria-label="Chọn video demo từ máy"/>
        </label>
        <span>Để hiện video công khai, chép MP4 vào <code>public{project.demoVideo || `/videos/ten-du-an.mp4`}</code></span>
      </div>
      <p className="demo-video-note">Video chọn từ máy chỉ dùng để xem thử, không tự tải lên website.</p> */}

      <p>{project.description}</p>
      <h3>Điểm nổi bật</h3><ul>{project.highlights.map(text=><li key={text}>{text}</li>)}</ul>
      <h3>Tech Stack</h3><div className="project-tags dialog-tags">{project.tags.map(tag=><span key={tag}>{tag}</span>)}</div>
      <div className="dialog-actions">{project.githubUrl&&<a href={project.githubUrl} target="_blank" rel="noreferrer"><Icon name="github" size={17}/> GitHub</a>}{project.demoUrl&&<a href={project.demoUrl} target="_blank" rel="noreferrer"><Icon name="external" size={17}/> Live Demo</a>}{!project.githubUrl&&!project.demoUrl&&<span className="no-links">Chưa cập nhật liên kết GitHub / Demo.</span>}</div>
    </div>
  </div>, document.body)
}

function ProjectsSection() {
  const selected = projects
  const [filter,setFilter]=useState<'All'|ProjectCategory>('All')
  const [search,setSearch]=useState('')
  const [current,setCurrent]=useState<Project|null>(null)
  const categories: Array<'All'|ProjectCategory> = ['All','Software','Frontend','Database']
  const shown = selected.filter(p=>(filter==='All'||p.category===filter)&&[p.title,p.description,p.role,p.tags.join(' ')].join(' ').toLowerCase().includes(search.toLowerCase()))
  return <section id="projects" className="projects-section page-wrap">
    <ScrollReveal direction="left" delay={0.06}>
      <div className="section-topline">// 02. SELECTED WORK</div>
      <div className="section-head"><div><h2>PROJECTS <span>/</span></h2><p>Ba đồ án mình tham gia, từ Frontend đến Database và phần mềm Client–Server.</p></div><span className="section-counter">03 / FEATURED WORK</span></div>
    </ScrollReveal>
    <ScrollReveal direction="up" delay={0.1}>
      <div className="project-toolbar"><div className="project-filter" role="group" aria-label="Lọc dự án">{categories.map(cat=><button key={cat} className={filter===cat?'selected':''} aria-pressed={filter===cat} onClick={()=>setFilter(cat)}>{cat==='All'?'All':cat} <span>{cat==='All'?selected.length:selected.filter(p=>p.category===cat).length}</span></button>)}</div><label className="project-search"><Icon name="search" size={17}/><input aria-label="Tìm kiếm dự án" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm dự án..."/></label></div>
    </ScrollReveal>
    <div className="project-grid">{shown.map((project,index)=><ScrollReveal key={project.id} className="project-reveal-item" direction={index%2===0?'left':'right'} delay={index*.09}><ProjectCard project={project} onOpen={setCurrent}/></ScrollReveal>)}</div>
    {shown.length===0&&<div className="empty-projects">Không tìm thấy dự án phù hợp. Hãy thử bộ lọc khác.</div>}
    {current&&<ProjectDialog key={current.id} project={current} onClose={()=>setCurrent(null)}/>}
  </section>
}

function ContactSection() {
  const [form,setForm]=useState({name:'',email:'',message:''})
  const [message,setMessage]=useState('')
  function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!profile.email){setMessage('Bạn cần thêm email của mình vào src/data/profile.ts trước khi dùng form.');return};const subject=encodeURIComponent(`Portfolio — Tin nhắn từ ${form.name}`);const content=encodeURIComponent(`From: ${form.name} (${form.email})\n\n${form.message}`);window.location.href=`mailto:${profile.email}?subject=${subject}&body=${content}`;setMessage('Ứng dụng email sẽ mở cùng nội dung đã điền. Form không tự gửi thư.')}
  const items:Array<{icon:SymbolName,label:string,text:string,href?:string}>=[{icon:'mail',label:'Email',text:profile.email||'Chưa cập nhật',href:profile.email?`mailto:${profile.email}`:undefined},{icon:'linkedin',label:'LinkedIn',text:profile.linkedin||'Chưa cập nhật',href:profile.linkedin||undefined},{icon:'github',label:'GitHub',text:profile.github||'Chưa cập nhật',href:profile.github||undefined},{icon:'map',label:'Location',text:profile.location},{icon:'shield',label:'Focus',text:profile.focus}]
  return <section id="contact" className="contact-section page-wrap">
    <ScrollReveal direction="right" delay={0.05}>
      <div className="section-topline">// 03. GET IN TOUCH</div>
      <h2>CONTACT <span>/</span></h2>
      <p className="contact-intro">Có câu hỏi, cơ hội hợp tác hoặc muốn kết nối? Hãy gửi cho mình một tin nhắn nhé!</p>
    </ScrollReveal>
    <div className="contact-columns">
      <ScrollReveal className="contact-reveal-item" direction="left" delay={0.1}>
        <div className="contact-info hud-panel"><div className="corner-mark">CONTACT_CHANNELS</div>{items.map(item=><div className="contact-info-row" key={item.label}><span className="contact-icon"><Icon name={item.icon} size={21}/></span><div><b>{item.label}</b>{item.href?<a href={item.href} target={item.href.startsWith('mailto:')?undefined:'_blank'} rel="noopener noreferrer">{item.text}</a>:<span>{item.text}</span>}</div></div>)}</div>
      </ScrollReveal>
      <ScrollReveal className="contact-reveal-item" direction="right" delay={0.18}>
        <form onSubmit={submit} className="contact-form hud-panel"><div className="form-heading"><span>GỬI TIN NHẮN CHO MÌNH</span><Icon name="send" size={19}/></div><div className="input-row"><label>Họ và tên<input required minLength={2} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Nhập họ và tên" autoComplete="name"/></label><label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Nhập email" autoComplete="email"/></label></div><label>Nội dung<textarea required minLength={5} rows={5} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Viết tin nhắn..."/></label><button className="button-primary submit-button" type="submit"><Icon name="send" size={17}/> Mở ứng dụng email</button><p className="form-hint" role="status">{message||'Form dùng mailto, không lưu tin nhắn và không tự động gửi email.'}</p></form>
      </ScrollReveal>
    </div>
  </section>
}

function Footer() {return <footer className="page-footer"><div className="page-wrap footer-inner"><div className="footer-brand">{profile.name}<span> / FULL-STACK DEVELOPER</span></div><span>CRAFTED WITH REACT + VITE · CYBERPUNK EDITION</span><a href="#home" onClick={e=>jumpDirect(e,'home')}>BACK TO HOME ←</a></div></footer>}

/** ScrollProgressBar and ScrollReveal adapted from the original Portfolio's code. */
function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100
        setScrollProgress(Math.max(0, Math.min(100, currentProgress)))
      } else {
        setScrollProgress(0)
      }
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[100] pointer-events-none bg-black/20">
      <div
        className="h-full transition-all duration-150 ease-out"
        style={{
          width: `${scrollProgress}%`,
          background: 'linear-gradient(90deg, #7c3aed, #22d3ee, #ec4899)',
          boxShadow: '0 0 10px #22d3ee, 0 0 20px #7c3aed'
        }}
      />
    </div>
  )
}

function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  className = ''
}: {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'zoom' | 'flip';
  delay?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollDir, setScrollDir] = useState<'down' | 'up'>('down')
  const ref = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScrollDir = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY.current + 5) {
        setScrollDir('down')
      } else if (currentScrollY < lastScrollY.current - 5) {
        setScrollDir('up')
      }
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScrollDir, { passive: true })
    return () => window.removeEventListener('scroll', handleScrollDir)
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      setIsVisible(true)
      return
    }
    // Logic gốc: xuất hiện theo vị trí viewport; rời khung nhìn có thể chạy lại.
    const observer = new IntersectionObserver(
      ([entry]) => { setIsVisible(entry.isIntersecting) },
      { threshold: 0.12, rootMargin: '-20px 0px -20px 0px' }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const getTransform = () => {
    if (isVisible) return 'none'

    switch (direction) {
      case 'left':
        return 'translateX(-120px) scale(0.95)'
      case 'right':
        return 'translateX(120px) scale(0.95)'
      case 'zoom':
        return 'scale(0.82)'
      case 'up':
        return scrollDir === 'down' ? 'translateY(80px) scale(0.96)' : 'translateY(-80px) scale(0.96)'
      case 'down':
        return scrollDir === 'down' ? 'translateY(-80px) scale(0.96)' : 'translateY(80px) scale(0.96)'
      default:
        return 'translateX(-120px) scale(0.95)'
    }
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        filter: isVisible ? 'blur(0px)' : 'blur(10px)',
        transform: getTransform(),
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, filter 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
      }}
    >
      {children}
    </div>
  )
}


/** Website một trang: người xem cuộn từ Home → Projects → Contact theo chiều dọc. */
export default function App() {
  const [active, setActive] = useState<NavSection>(() => routeFromHash())

  useEffect(() => {
    let raf = 0
    let targetAfterClick: NavSection | null = null
    const sectionEls = NAV_SECTION_IDS.map(id => document.getElementById(id))
    const syncActive = () => {
      raf = 0
      const header = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 83
      const probe = header + Math.min(window.innerHeight * 0.22, 185)
      const atPageBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8
      if (targetAfterClick) {
        const destination = document.getElementById(targetAfterClick)
        // Avoid flashing intermediate menu items while the browser smoothly scrolls.
        if (destination && (Math.abs(destination.getBoundingClientRect().top - header) < 100 || (atPageBottom && targetAfterClick === 'contact'))) {
          targetAfterClick = null
        } else {
          return
        }
      }
      let current: NavSection = 'home'
      for (let i = 0; i < NAV_SECTION_IDS.length; i++) {
        if (sectionEls[i] && sectionEls[i]!.getBoundingClientRect().top <= probe) current = NAV_SECTION_IDS[i]
      }
      if (atPageBottom) current = 'contact'
      setActive(prev => prev === current ? prev : current)
    }
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(syncActive) }
    const onNavigate = (event: Event) => {
      targetAfterClick = (event as CustomEvent<NavSection>).detail
      setActive(targetAfterClick)
    }
    const onHistory = () => {
      targetAfterClick = routeFromHash()
      setActive(targetAfterClick)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.addEventListener('portfolio:navigate', onNavigate)
    window.addEventListener('popstate', onHistory)
    window.addEventListener('hashchange', onHistory)
    if (window.location.hash) {
      window.requestAnimationFrame(() => {
        document.getElementById(routeFromHash())?.scrollIntoView({ behavior: 'instant', block: 'start' })
        targetAfterClick = null
        syncActive()
      })
    } else syncActive()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('portfolio:navigate', onNavigate)
      window.removeEventListener('popstate', onHistory)
      window.removeEventListener('hashchange', onHistory)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  return <>
    <ScrollProgressBar/>
    <Background/>
    <Header active={active}/>
    <main className="vertical-stage" aria-label="Portfolio nội dung">
      <Hero/>
      <AboutSection/>
      <ProjectsSection/>
      <ContactSection/>
    </main>
    <ScrollReveal direction="zoom" delay={0.1}>
      <Footer/>
    </ScrollReveal>
  </>
}
