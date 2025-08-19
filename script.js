// Utils
const qs = (s, el=document) => el.querySelector(s)
const qsa = (s, el=document) => [...el.querySelectorAll(s)]
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Mobile Menu Toggle
;(function mobileMenu() {
  const toggle = qs('.mobile-menu-toggle')
  const nav = qs('.main-nav')
  const navLinks = qsa('.main-nav a')
  
  if (!toggle || !nav) return
  
  function toggleMenu() {
    const expanded = toggle.getAttribute('aria-expanded') === 'true'
    toggle.setAttribute('aria-expanded', !expanded)
    nav.classList.toggle('open')
    document.body.classList.toggle('menu-open')
    
    // Prevent scrolling when menu is open
    document.body.style.overflow = expanded ? '' : 'hidden'
  }
  
  toggle.addEventListener('click', toggleMenu)
  
  // Close menu when link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('open')) {
        toggleMenu()
      }
    })
  })
  
  // Close menu on resize if device gets larger
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && nav.classList.contains('open')) {
      toggle.setAttribute('aria-expanded', 'false')
      nav.classList.remove('open')
      document.body.classList.remove('menu-open')
      document.body.style.overflow = ''
    }
  })
})()


// Preloader (fade then remove from DOM)
window.addEventListener('load', () => {
  const pre = qs('#preloader')
  if(!pre) return
  const hide = () => {
    pre.classList.add('hidden')
    const onEnd = () => { pre.remove(); pre.removeEventListener('transitionend', onEnd) }
    pre.addEventListener('transitionend', onEnd)
  }
  setTimeout(hide, 400)
})

// Year in footer (optional span#year)
const yEl = qs('#year'); if (yEl) yEl.textContent = new Date().getFullYear()

// Background particles on canvas
;(function particles(){
  const canvas = qs('#bg-canvas')
  if(!canvas) return
  const ctx = canvas.getContext('2d')
  let w, h, ratio = window.devicePixelRatio || 1
  const P = []
  const COUNT = prefersReducedMotion ? 28 : 90
  const MAX_DIST = prefersReducedMotion ? 100 : 140

  function resize(){
    w = canvas.width = Math.floor(innerWidth * ratio)
    h = canvas.height = Math.floor(innerHeight * ratio)
  }

  function reset(p){
    p.x = Math.random() * w
    p.y = Math.random() * h
    p.vx = (Math.random() - .5) * .35 * ratio
    p.vy = (Math.random() - .5) * .35 * ratio
    p.r = (Math.random() * 1.4 + .6) * ratio
  }

  function init(){
    resize()
    P.length = 0
    for(let i=0;i<COUNT;i++){
      const p = {}
      reset(p)
      P.push(p)
    }
    loop()
  }

  function loop(){
    ctx.clearRect(0,0,w,h)
    // grid glow
    ctx.fillStyle = 'rgba(57,255,20,0.03)'
    for(let y=0;y<h;y+= 40*ratio){
      ctx.fillRect(0,y, w, 1*ratio)
    }

    // particles
    for(const p of P){
      p.x += p.vx; p.y += p.vy
      if(p.x<0||p.x>w||p.y<0||p.y>h) reset(p)
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2)
      ctx.fillStyle = 'rgba(57,255,20,0.7)'
      ctx.shadowColor = '#39FF14'
      ctx.shadowBlur = 8*ratio
      ctx.fill()
    }

    // connections (skip for reduced motion)
    if(!prefersReducedMotion){
      ctx.shadowBlur = 0
      for(let i=0;i<P.length;i++){
        for(let j=i+1;j<P.length;j++){
          const a=P[i], b=P[j]
          const dx=a.x-b.x, dy=a.y-b.y
          const d = Math.hypot(dx,dy)
          if(d < MAX_DIST*ratio){
            const o = 1 - d/(MAX_DIST*ratio)
            ctx.strokeStyle = `rgba(57,255,20,${o*0.25})`
            ctx.lineWidth = 1*ratio
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke()
          }
        }
      }
    }

    requestAnimationFrame(loop)
  }

  window.addEventListener('resize', resize)
  init()
})()

// Contact form -> WhatsApp
;(function contactToWhatsApp(){
  const form = qs('#contact-form')
  if(!form) return
  const nameEl = qs('#ct-name')
  const emailEl = qs('#ct-email')
  const subjectEl = qs('#ct-subject')
  const messageEl = qs('#ct-message')
  const submitBtn = qs('#ct-submit')
  form.addEventListener('submit', (e)=>{
    e.preventDefault()
    const name = nameEl?.value.trim()||''
    const email = emailEl?.value.trim()||''
    const subject = subjectEl?.value.trim()||''
    const message = messageEl?.value.trim()||''
    if(!name || !email || !message){
      showToast('Por favor, preencha Nome, E-mail e Mensagem.', 'error')
      form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake')
      return
    }
    submitBtn?.classList.add('loading')
    const lines = [
      subject ? `Assunto: ${subject}` : null,
      `Nome: ${name}`,
      `E-mail: ${email}`,
      '',
      message
    ].filter(Boolean)
    const text = encodeURIComponent(lines.join('\n'))
    const url = `https://wa.me/5516993311282?text=${text}`
    window.open(url, '_blank')
    setTimeout(()=> submitBtn?.classList.remove('loading'), 800)
    showToast('Abrindo conversa no WhatsApp...')
  })
})()

// Contact UI polish: auto-resize and ripple on CTA
;(function contactUi(){
  const ta = qs('#ct-message')
  if(ta){
    const fit = ()=>{ ta.style.height='auto'; ta.style.height = Math.min(320, ta.scrollHeight) + 'px' }
    ta.addEventListener('input', fit); fit()
  }
  const btn = qs('#ct-submit')
  if(btn && !prefersReducedMotion){
    btn.addEventListener('mousemove', (e)=>{
      const r = btn.getBoundingClientRect()
      const x = ((e.clientX - r.left)/r.width*100).toFixed(2)+"%"
      const y = ((e.clientY - r.top)/r.height*100).toFixed(2)+"%"
      btn.style.setProperty('--rx', x)
      btn.style.setProperty('--ry', y)
    })
    btn.addEventListener('mousedown', ()=>{
      btn.classList.add('is-rippling');
      setTimeout(()=> btn.classList.remove('is-rippling'), 300)
    })
  }

  // Tilt effect on the contact card
  const card = qs('.contact-form')
  if(card && !prefersReducedMotion){
    const clamp = (n,min,max)=>Math.max(min,Math.min(max,n))
    card.addEventListener('mousemove', (e)=>{
      const r = card.getBoundingClientRect()
      const rx = (e.clientY - r.top - r.height/2) / r.height
      const ry = (e.clientX - r.left - r.width/2) / r.width
      const tiltX = clamp(-rx*6,-6,6)
      const tiltY = clamp( ry*6,-6,6)
      card.style.transform = `translateY(-2px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
    })
    card.addEventListener('mouseleave', ()=>{
      card.style.transform = 'translateY(0) rotateX(0) rotateY(0)'
    })
  }

  // IntersectionObserver to reveal contact elements
  const els = qsa('.contact [data-animate]')
  if(els.length){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target) } })
    }, { threshold: 0.15 })
    els.forEach(el=> io.observe(el))
  }
})()

// Toast utility
function showToast(message, type){
  let t = qs('.toast')
  if(!t){
    t = document.createElement('div')
    t.className = 'toast'
    t.setAttribute('role','status')
    t.setAttribute('aria-live','polite')
    document.body.appendChild(t)
  }
  t.textContent = message
  t.classList.toggle('error', type==='error')
  t.classList.add('show')
  clearTimeout(showToast._to)
  showToast._to = setTimeout(()=> t.classList.remove('show'), 1800)
}

// Hero Plexus simple animated lines (CSS driven fallback)
;(function plexus(){
  const el = qs('#plexus')
  if(!el) return
  const lineCount = prefersReducedMotion ? 12 : 24
  const frag = document.createDocumentFragment()
  for(let i=0;i<lineCount;i++){
    const line = document.createElement('span')
    line.style.position='absolute'
    line.style.left = Math.random()*100+'%'
    line.style.top = Math.random()*100+'%'
    line.style.width = (40+Math.random()*160)+'px'
    line.style.height='1px'
    line.style.background='linear-gradient(90deg, rgba(57,255,20,0), rgba(57,255,20,.6), rgba(0,212,255,.0))'
    line.style.filter='drop-shadow(0 0 6px rgba(57,255,20,.8))'
    if(!prefersReducedMotion){
      line.style.animation = `move ${6+Math.random()*6}s linear ${Math.random()*2}s infinite alternate`
    }
    frag.appendChild(line)
  }
  el.appendChild(frag)
})()

// Subtle parallax for hero content
;(function heroParallax(){
  const hero = qs('.hero')
  const inner = qs('.hero-inner')
  const plexus = qs('#plexus')
  if(!hero || !inner) return
  if(prefersReducedMotion) return
  let ticking = false
  function onScroll(){
    if(ticking) return
    ticking = true
    requestAnimationFrame(()=>{
      const rect = hero.getBoundingClientRect()
      const viewH = innerHeight || document.documentElement.clientHeight
      const inView = rect.top < viewH && rect.bottom > 0
      if(inView){
        const p = (Math.min(Math.max(-rect.top, 0), rect.height)) / rect.height // 0..1
        inner.style.transform = `translateY(${p * -8}px)`
        if(plexus){
          plexus.style.transform = `translate3d(0, ${p * -16}px, 0)`
        }
      }
      ticking = false
    })
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})()

// Scroll reveal
;(function reveal(){
  const items = qsa('[data-animate]')
  if(!('IntersectionObserver' in window)){
    items.forEach(i=>i.classList.add('in'))
    return
  }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const delay = e.target.getAttribute('data-delay') || 0
        setTimeout(()=> e.target.classList.add('in'), Number(delay))
        if(e.target.classList.contains('flow')){
          // Ativa linhas com leve sequência
          const lines = qsa('.pulse-line', e.target)
          lines.forEach((p,i)=> setTimeout(()=>p.classList.add('active'), i*350))
          // Stagger em labels
          const labels = qsa('.node-label', e.target)
          labels.forEach((l,i)=> l.style.transitionDelay = `${120 + i*120}ms`)
        }
        io.unobserve(e.target)
      }
    })
  }, {threshold: .18})
  items.forEach(i=>io.observe(i))
})()

// CTA ripple / hover light (skip on reduced motion)
if(!prefersReducedMotion){
  qsa('.cta').forEach(btn=>{
    btn.addEventListener('pointermove', (e)=>{
      const rect = e.currentTarget.getBoundingClientRect()
      const rx = ((e.clientX - rect.left)/rect.width*100).toFixed(2)+'%'
      const ry = ((e.clientY - rect.top)/rect.height*100).toFixed(2)+'%'
      e.currentTarget.style.setProperty('--rx', rx)
      e.currentTarget.style.setProperty('--ry', ry)
    })
    btn.addEventListener('click', (e)=>{
      e.currentTarget.classList.remove('is-rippling')
      void e.currentTarget.offsetWidth
      e.currentTarget.classList.add('is-rippling')
    })
  })
}

// Carousel com autoplay, pausa, swipe e dots
;(function carousel(){
  const root = qs('.carousel')
  if(!root) return
  const track = qs('.track', root)
  const slides = qsa('.slide', track)
  const prev = qs('.prev', root)
  const next = qs('.next', root)
  // cria progress bar e dots dinamicamente
  let progress = qs('.progress', root)
  if(!progress){
    progress = document.createElement('div')
    progress.className = 'progress'
    progress.innerHTML = '<div class="bar"></div>'
    root.appendChild(progress)
  }
  let dotsWrap = qs('.dots', root)
  if(!dotsWrap){
    dotsWrap = document.createElement('div')
    dotsWrap.className = 'dots'
    root.appendChild(dotsWrap)
  }
  dotsWrap.innerHTML = ''
  const dots = slides.map((_,i)=>{
    const b = document.createElement('button')
    b.className = 'dot'
    b.setAttribute('aria-label', `Ir para depoimento ${i+1}`)
    b.addEventListener('click', ()=>{ go(i); restartCycle() })
    dotsWrap.appendChild(b)
    return b
  })

  let idx = 0
  let paused = false
  let dragging = false
  let startX = 0
  let currentX = 0
  let startTransform = 0
  const DURATION = prefersReducedMotion ? 8000 : 6000
  let startTime = performance.now()

  function setActive(){
    slides.forEach((s,i)=> s.classList.toggle('active', i===idx))
    dots.forEach((d,i)=> d.classList.toggle('active', i===idx))
  }

  function go(i){
    idx = (i + slides.length) % slides.length
    track.style.transition = dragging ? 'none' : 'transform .6s cubic-bezier(.22,.61,.36,1)'
    track.style.transform = `translateX(-${idx*100}%)`
    setActive()
  }

  function restartCycle(){
    startTime = performance.now()
  }

  // autoplay com barra de progresso
  const bar = qs('.bar', progress)
  function loop(ts){
    if(!paused && !dragging){
      const elapsed = ts - startTime
      const t = Math.min(elapsed / DURATION, 1)
      bar.style.width = `${t*100}%`
      if(t >= 1){
        go(idx+1)
        restartCycle()
      }
    }
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)

  // controles
  prev.addEventListener('click', ()=>{ go(idx-1); restartCycle() })
  next.addEventListener('click', ()=>{ go(idx+1); restartCycle() })

  root.addEventListener('mouseenter', ()=>{ paused = true })
  root.addEventListener('mouseleave', ()=>{ paused = false; restartCycle() })

  // swipe / drag
  function onPointerDown(e){
    // não iniciar drag sobre controles ou dots
    if (e.target.closest('.nav') || e.target.closest('.dot')) return
    // apenas botão principal / toques
    if (e.button !== undefined && e.button !== 0) return
    dragging = true
    startX = e.clientX
    currentX = startX
    const m = /translateX\(-?(\d+)/.exec(getComputedStyle(track).transform)
    startTransform = -idx * 100
    track.style.transition = 'none'
    try { root.setPointerCapture(e.pointerId) } catch(_){}
    e.preventDefault()
  }
  function onPointerMove(e){
    if(!dragging) return
    currentX = e.clientX
    const dx = currentX - startX
    const percent = dx / root.clientWidth * 100
    track.style.transform = `translateX(calc(${startTransform}% + ${-percent}%))`
  }
  function onPointerUp(){
    if(!dragging) return
    dragging = false
    const dx = currentX - startX
    const threshold = root.clientWidth * 0.2
    if(Math.abs(dx) > threshold){
      go(idx + (dx<0 ? 1 : -1))
    } else {
      go(idx)
    }
    restartCycle()
  }
  root.addEventListener('pointerdown', onPointerDown)
  root.addEventListener('pointermove', onPointerMove)
  root.addEventListener('pointerup', onPointerUp)
  root.addEventListener('pointercancel', onPointerUp)

  // teclado (setas)
  document.addEventListener('keydown', (e)=>{
    // só quando o carousel está no viewport
    const rect = root.getBoundingClientRect()
    const inView = rect.top < innerHeight && rect.bottom > 0
    if(!inView) return
    if(e.key === 'ArrowLeft'){ go(idx-1); restartCycle() }
    if(e.key === 'ArrowRight'){ go(idx+1); restartCycle() }
  })

  // init
  go(0)
})()

// Typewriter for code demo
;(function typer(){
  const el = qs('#code-demo')
  if(!el) return
  const txt = el.textContent
  el.textContent = ''
  let i = 0
  function step(){
    el.textContent += txt[i]
    i++
    if(i < txt.length){
      const ch = txt[i-1]
      const d = prefersReducedMotion ? 0 : (ch==='\n' ? 40 : 18)
      setTimeout(step, d)
    }
  }
  // delay until reveal
  setTimeout(step, 400)
})()

// Feature cards: pointer tilt + sheen
;(function cardsTilt(){
  const cards = qsa('#features .card')
  if(!cards.length) return
  const maxX = 6, maxY = 6
  cards.forEach(card=>{
    let raf = null
    function onMove(e){
      const r = card.getBoundingClientRect()
      const px = (e.clientX - r.left)/r.width - 0.5
      const py = (e.clientY - r.top)/r.height - 0.5
      const rx = (-py * maxX).toFixed(2)
      const ry = (px * maxY).toFixed(2)
      if(raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(()=>{
        card.style.transform = `translateY(-2px) rotateX(${rx}deg) rotateY(${ry}deg)`
        card.style.setProperty('--rx', `${(px+0.5)*100}%`)
        card.style.setProperty('--ry', `${(py+0.5)*100}%`)
      })
    }
    function reset(){
      card.style.transform = ''
    }
    if(!prefersReducedMotion){
      card.addEventListener('pointermove', onMove)
      card.addEventListener('pointerleave', reset)
    }
  })
})()

// Internationalization (i18n)
;(function i18n(){
  const dict = {
    pt: {
      'nav.features':'Recursos',
      'nav.how':'Como funciona',
      'nav.testimonials':'Clientes',
      'nav.contact':'Contato',
      'nav.start':'Comece Agora',
      'hero.headline':'O Futuro das Transações. Conectado.',
      'hero.subhead':'Integre nosso gateway de pagamento com segurança de ponta e processe transações na velocidade da luz.',
      'hero.cta':'Comece Agora',
      'hero.docs':'Ver Documentação',
      'features.title':'Por que NexusPay',
      'features.cards.security.title':'Segurança de Nível Superior',
      'features.cards.security.text':'Criptografia avançada, detecção de fraude em tempo real e conformidade total com PCI DSS.',
      'features.cards.speed.title':'Velocidade de Transação',
      'features.cards.speed.text':'Arquitetura de baixa latência para autorizações e liquidações em milissegundos.',
      'features.cards.integrations.title':'Integração Fácil',
      'features.cards.integrations.text':'SDKs claros e APIs REST/GraphQL com exemplos prontos e sandbox de testes.',
      'features.cards.fees.title':'Taxas Transparentes',
      'features.cards.fees.text':'Sem surpresas: preços claros, relatórios detalhados e otimização de custos.',
      'how.title':'Como Funciona',
      'how.diagram.checkout':'Checkout',
      'how.diagram.nexus':'NexusPay',
      'how.diagram.bank':'Banco',
      'testimonials.title':'O que dizem nossos clientes',
      'testimonials.1.text':'“Aumentamos a taxa de aprovação em 14% com a NexusPay. Integração simples e performance incrível.”',
      'testimonials.1.author':'Marina Alves — CTO, LumenShop',
      'testimonials.2.text':'“Suporte impecável e uma plataforma robusta. A latência caiu drasticamente.”',
      'testimonials.2.author':'Rafael Costa — Head de Pagamentos, VelozBank',
      'testimonials.3.text':'“Transparência nas taxas e dashboards completos. Decisão fácil para nosso time.”',
      'testimonials.3.author':'Ana Ribeiro — CFO, NovaMarket',
      'cta.title':'Pronto para acelerar seus pagamentos?',
      'cta.text':'Integre o NexusPay hoje mesmo e ofereça a melhor experiência para seus clientes.',
      'cta.docs':'Ver Documentação',
      'contact.title':'Entre em Contato',
      'contact.subtitle':'Envie uma mensagem e retornaremos rapidamente pelo WhatsApp.',
      'contact.form.name':'Seu nome',
      'contact.form.namePlaceholder':'Seu nome',
      'contact.form.email':'E-mail',
      'contact.form.emailPlaceholder':'voce@exemplo.com',
      'contact.form.subject':'Assunto',
      'contact.form.subjectPlaceholder':'Assunto (opcional)',
      'contact.form.message':'Mensagem',
      'contact.form.messagePlaceholder':'Conte como podemos ajudar',
      'contact.form.submit':'Enviar',
      'footer.terms':'Termos',
      'footer.privacy':'Privacidade',
      'footer.status':'Status',
      'footer.copyright':' 2023 NexusPay. Todos os direitos reservados.'
    },
    en: {
      'nav.features':'Features',
      'nav.how':'How it works',
      'nav.testimonials':'Customers',
      'nav.contact':'Contact',
      'nav.start':'Get Started',
      'hero.headline':'The Future of Transactions. Connected.',
      'hero.subhead':'Integrate our payment gateway with top-tier security and process transactions at the speed of light.',
      'hero.cta':'Get Started',
      'hero.docs':'See Docs',
      'features.title':'Why NexusPay',
      'features.cards.security.title':'Enterprise-grade Security',
      'features.cards.security.text':'Advanced encryption, real-time fraud detection, and full PCI DSS compliance.',
      'features.cards.speed.title':'Transaction Speed',
      'features.cards.speed.text':'Low-latency architecture for millisecond authorizations and settlements.',
      'features.cards.integrations.title':'Easy Integration',
      'features.cards.integrations.text':'Clear SDKs and REST/GraphQL APIs with ready examples and sandbox.',
      'features.cards.fees.title':'Transparent Fees',
      'features.cards.fees.text':'No surprises: clear pricing, detailed reports, and cost optimization.',
      'how.title':'How It Works',
      'how.diagram.checkout':'Checkout',
      'how.diagram.nexus':'NexusPay',
      'how.diagram.bank':'Bank',
      'testimonials.title':'What our customers say',
      'testimonials.1.text':'“We increased approval rate by 14% with NexusPay. Simple integration and amazing performance.”',
      'testimonials.1.author':'Marina Alves — CTO, LumenShop',
      'testimonials.2.text':'“Impeccable support and a robust platform. Latency dropped drastically.”',
      'testimonials.2.author':'Rafael Costa — Head of Payments, VelozBank',
      'testimonials.3.text':'“Transparent fees and complete dashboards. An easy decision for our team.”',
      'testimonials.3.author':'Ana Ribeiro — CFO, NovaMarket',
      'cta.title':'Ready to accelerate your payments?',
      'cta.text':'Integrate NexusPay today and deliver the best experience to your customers.',
      'cta.docs':'See Docs',
      'contact.title':'Get in touch',
      'contact.subtitle':'Send a message and we will quickly reply via WhatsApp.',
      'contact.form.name':'Your name',
      'contact.form.namePlaceholder':'Your name',
      'contact.form.email':'Email',
      'contact.form.emailPlaceholder':'you@example.com',
      'contact.form.subject':'Subject',
      'contact.form.subjectPlaceholder':'Subject (optional)',
      'contact.form.message':'Message',
      'contact.form.messagePlaceholder':'Tell us how we can help',
      'contact.form.submit':'Send',
      'footer.terms':'Terms',
      'footer.privacy':'Privacy',
      'footer.status':'Status',
      'footer.copyright':' 2023 NexusPay. All rights reserved.'
    },
    es: {
      'nav.features':'Recursos',
      'nav.how':'Cómo funciona',
      'nav.testimonials':'Clientes',
      'nav.contact':'Contacto',
      'nav.start':'Comenzar',
      'hero.headline':'El futuro de las transacciones. Conectado.',
      'hero.subhead':'Integra nuestro gateway de pago con seguridad de primer nivel y procesa transacciones a la velocidad de la luz.',
      'hero.cta':'Comenzar',
      'hero.docs':'Ver Documentación',
      'features.title':'Por qué NexusPay',
      'features.cards.security.title':'Seguridad de nivel superior',
      'features.cards.security.text':'Cifrado avanzado, detección de fraude en tiempo real y cumplimiento total de PCI DSS.',
      'features.cards.speed.title':'Velocidad de transacción',
      'features.cards.speed.text':'Arquitectura de baja latencia para autorizaciones y liquidaciones en milisegundos.',
      'features.cards.integrations.title':'Integración fácil',
      'features.cards.integrations.text':'SDKs claros y APIs REST/GraphQL con ejemplos listos y sandbox de pruebas.',
      'features.cards.fees.title':'Tarifas transparentes',
      'features.cards.fees.text':'Sin sorpresas: precios claros, informes detallados y optimización de costos.',
      'how.title':'Cómo funciona',
      'how.diagram.checkout':'Checkout',
      'how.diagram.nexus':'NexusPay',
      'how.diagram.bank':'Banco',
      'testimonials.title':'Qué dicen nuestros clientes',
      'testimonials.1.text':'“Aumentamos la tasa de aprobación en 14% con NexusPay. Integración simple y rendimiento increíble.”',
      'testimonials.1.author':'Marina Alves — CTO, LumenShop',
      'testimonials.2.text':'“Soporte impecable y una plataforma robusta. La latencia cayó drásticamente.”',
      'testimonials.2.author':'Rafael Costa — Head de Pagos, VelozBank',
      'testimonials.3.text':'“Transparencia en tarifas y paneles completos. Decisión fácil para nuestro equipo.”',
      'testimonials.3.author':'Ana Ribeiro — CFO, NovaMarket',
      'cta.title':'¿Listo para acelerar tus pagos?',
      'cta.text':'Integra NexusPay hoy y ofrece la mejor experiencia a tus clientes.',
      'cta.docs':'Ver Documentación',
      'contact.title':'Ponte en contacto',
      'contact.subtitle':'Envíanos un mensaje y responderemos rápidamente por WhatsApp.',
      'contact.form.name':'Tu nombre',
      'contact.form.namePlaceholder':'Tu nombre',
      'contact.form.email':'Correo electrónico',
      'contact.form.emailPlaceholder':'tu@ejemplo.com',
      'contact.form.subject':'Asunto',
      'contact.form.subjectPlaceholder':'Asunto (opcional)',
      'contact.form.message':'Mensaje',
      'contact.form.messagePlaceholder':'Cuéntanos cómo podemos ayudar',
      'contact.form.submit':'Enviar',
      'footer.terms':'Términos',
      'footer.privacy':'Privacidad',
      'footer.status':'Estado',
      'footer.copyright':' 2023 NexusPay. Todos los derechos reservados.'
    }
  }

  const htmlEl = document.documentElement
  const keyEls = () => qsa('[data-i18n]')
  const phEls = () => qsa('[data-i18n-placeholder]')

  function applyTranslations(lang){
    const table = dict[lang] || dict.pt
    keyEls().forEach(el=>{
      const key = el.getAttribute('data-i18n')
      if(table[key] !== undefined){
        el.textContent = table[key]
      }
    })
    phEls().forEach(el=>{
      const key = el.getAttribute('data-i18n-placeholder')
      if(table[key] !== undefined){
        el.setAttribute('placeholder', table[key])
      }
    })
    htmlEl.setAttribute('lang', lang)
  }

  function setActive(lang){
    qsa('.lang-switcher .lang').forEach(btn=>{
      btn.classList.toggle('active', btn.getAttribute('data-lang')===lang)
    })
  }

  function setLang(lang){
    localStorage.setItem('lang', lang)
    applyTranslations(lang)
    setActive(lang)
  }

  // Initialize
  const saved = localStorage.getItem('lang')
  const browser = (navigator.language || 'pt').slice(0,2)
  const initial = saved && dict[saved] ? saved : (dict[browser] ? browser : 'pt')
  applyTranslations(initial)
  setActive(initial)
  htmlEl.setAttribute('lang', initial)

  // Events
  qsa('.lang-switcher .lang').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const lang = btn.getAttribute('data-lang')
      if(!dict[lang]) return
      setLang(lang)
      // close mobile menu if open
      const toggle = qs('.mobile-menu-toggle')
      const nav = qs('.main-nav')
      const isOpen = nav && nav.classList.contains('open')
      if(isOpen){
        toggle?.setAttribute('aria-expanded', 'false')
        nav.classList.remove('open')
        document.body.classList.remove('menu-open')
        document.body.style.overflow = ''
      }
    })
  })
})()
