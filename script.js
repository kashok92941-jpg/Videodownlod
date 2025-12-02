// Basic frontend-only player + local auth
document.addEventListener('DOMContentLoaded', ()=>{

  const playBtn = document.getElementById('playBtn');
  const embedBtn = document.getElementById('embedBtn');
  const urlInput = document.getElementById('videoUrl');
  const playerArea = document.getElementById('playerArea');
  const fileInput = document.getElementById('fileInput');
  const localPlayer = document.getElementById('localPlayer');

  const btnLogin = document.getElementById('btnLogin');
  const btnSignup = document.getElementById('btnSignup');
  const authModal = document.getElementById('authModal');
  const authTitle = document.getElementById('authTitle');
  const authName = document.getElementById('authName');
  const authEmail = document.getElementById('authEmail');
  const authPass = document.getElementById('authPass');
  const authSubmit = document.getElementById('authSubmit');
  const authClose = document.getElementById('authClose');
  const authStatus = document.getElementById('authStatus');

  // auth buttons
  btnLogin.addEventListener('click', ()=> openAuth('login'));
  btnSignup.addEventListener('click', ()=> openAuth('signup'));
  authClose.addEventListener('click', ()=> closeAuth());

  function openAuth(mode){
    authModal.classList.add('show'); authModal.setAttribute('aria-hidden','false');
    if(mode==='login'){ authTitle.textContent='Login'; authName.style.display='none'; authSubmit.textContent='Login'; }
    else { authTitle.textContent='Signup'; authName.style.display='block'; authSubmit.textContent='Signup'; }
    authSubmit.onclick = ()=> handleAuth(mode);
  }
  function closeAuth(){ authModal.classList.remove('show'); authModal.setAttribute('aria-hidden','true'); authStatus.textContent=''; authName.value=''; authEmail.value=''; authPass.value=''; }

  function handleAuth(mode){
    const name = authName.value.trim(); const email = authEmail.value.trim(); const pass = authPass.value;
    if(mode==='signup'){
      if(!name||!email||!pass){ authStatus.textContent='सभी फील्ड भरें'; return; }
      const users = JSON.parse(localStorage.getItem('hd_users')||'[]');
      if(users.find(u=>u.email===email)){ authStatus.textContent='Email already used'; return; }
      users.push({name,email,password:pass});
      localStorage.setItem('hd_users', JSON.stringify(users));
      localStorage.setItem('hd_user', JSON.stringify({name,email})); closeAuth(); alert('Signup successful');
    } else {
      const users = JSON.parse(localStorage.getItem('hd_users')||'[]');
      const found = users.find(u=>u.email===email && u.password===pass);
      if(!found){ authStatus.textContent='Invalid credentials'; return; }
      localStorage.setItem('hd_user', JSON.stringify({name:found.name,email:found.email})); closeAuth(); alert('Login successful');
    }
  }

  // player helpers
  function extractYouTubeId(url){
    try{ const u = new URL(url); if(u.hostname.includes('youtu.be')) return u.pathname.slice(1); if(u.hostname.includes('youtube.com')) return u.searchParams.get('v'); }catch(e){} return null;
  }
  function extractVimeoId(url){
    try{ const u = new URL(url); if(u.hostname.includes('vimeo.com')){ const p = u.pathname.split('/').filter(Boolean); return p.pop(); } }catch(e){} return null;
  }
  function isDirectVideo(url){ return url.match(/\.(mp4|webm|ogg)(\?.*)?$/i); }

  function clearPlayer(){ playerArea.innerHTML=''; playerArea.style.display='none'; }
  function showPlayer(src, isDirect=false){
    clearPlayer(); playerArea.style.display='block';
    if(isDirect){
      const v = document.createElement('video'); v.controls=true; v.src=src; v.setAttribute('playsinline',''); playerArea.appendChild(v); return;
    }
    const iframe = document.createElement('iframe'); iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'; iframe.allowFullscreen=true; iframe.src = src; iframe.style.width='100%'; iframe.style.height='360px';
    playerArea.appendChild(iframe);
  }

  playBtn.addEventListener('click', ()=>{
    const url = urlInput.value.trim(); if(!url){ alert('URL डालें'); return; }
    const yt = extractYouTubeId(url); const vm = extractVimeoId(url);
    if(yt){ showPlayer('https://www.youtube.com/embed/'+encodeURIComponent(yt)+'?rel=0&modestbranding=1'); return; }
    if(vm){ showPlayer('https://player.vimeo.com/video/'+encodeURIComponent(vm)); return; }
    if(isDirectVideo(url)){ showPlayer(url, true); return; }
    if(url.includes('instagram.com')){ showPlayer(url + 'embed'); return; }
    if(url.includes('facebook.com')||url.includes('fb.watch')){ showPlayer('https://www.facebook.com/plugins/video.php?href=' + encodeURIComponent(url) + '&show_text=0'); return; }
    try{ showPlayer(url); }catch(e){ alert('Embed blocked or unsupported URL'); }
  });

  embedBtn.addEventListener('click', ()=>{ const url = urlInput.value.trim(); if(!url){ alert('URL डालें'); return; } showPlayer(url); });

  // local file preview
  fileInput.addEventListener('change', (ev)=>{
    const f = ev.target.files[0]; if(!f) return;
    localPlayer.innerHTML = '';
    const url = URL.createObjectURL(f);
    const v = document.createElement('video'); v.controls=true; v.src=url; v.style.width='100%'; localPlayer.appendChild(v);
  });

});
