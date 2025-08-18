// Utils
const qs = (s, el=document) => el.querySelector(s)
const qsa = (s, el=document) => [...el.querySelectorAll(s)]

// Preloader
window.addEventListener('load', () => {
  setTimeout(() => qs('#preloader')?.classList.add('hidden'), 400)
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
  const COUNT = 90
  const MAX_DIST = 140

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

    // connections
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
  if(btn){
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
  if(card){
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
  const lineCount = 24
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
    line.style.animation = `move ${6+Math.random()*6}s linear ${Math.random()*2}s infinite alternate`
    frag.appendChild(line)
  }
  el.appendChild(frag)
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

// CTA ripple / hover light
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
  const DURATION = 6000
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
      const d = ch==='\n' ? 40 : 18
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
    card.addEventListener('pointermove', onMove)
    card.addEventListener('pointerleave', reset)
  })
})()
