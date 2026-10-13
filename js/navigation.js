/**
 * ROMI 2.3 — Application navigation and shell state
 * Extracted from the original monolithic index.html.
 * Keeps routing, sidebar, theme, and app-shell initialization separate.
 */

/* ===== ROMI 2.0 APP NAVIGATION ===== */
const ROMI_APP_ROUTES=[
  'home','diagnostic','practiceHub','progressCenter','grammar','reading','strategies',
  'vocabulary','listening','speaking','writing','coach','knowledgeLibrary','teacher'
];

function markRomiPages(){
  ROMI_APP_ROUTES.forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.classList.add('appPage');
  });

  const skills=document.querySelector('.skillOverview');
  if(skills){
    skills.classList.add('appPage');
    skills.dataset.pageGroup='home';
  }

  const plan=document.getElementById('plan');
  if(plan){
    plan.classList.add('appPage');
    plan.dataset.pageGroup='diagnostic';
  }
}

function normalizeRomiRoute(route){
  route=String(route||'').replace(/^#/,'');
  if(route==='plan')return'diagnostic';
  return ROMI_APP_ROUTES.includes(route)?route:'home';
}

function navigateRomiApp(route,options={}){
  const target=normalizeRomiRoute(route);
  document.body.classList.add('app-ready');

  document.querySelectorAll('.appPage').forEach(el=>{
    const show=el.id===target || el.dataset.pageGroup===target;
    el.classList.toggle('app-active',show);
  });

  document.querySelectorAll('.sideLink').forEach(a=>{
    a.classList.toggle('active',a.dataset.route===target);
  });

  if(!options.skipHash && location.hash!=='#'+target){
    history.replaceState(null,'','#'+target);
  }

  if(window.innerWidth<=900)toggleRomiSidebar(false);

  const active=document.getElementById(target);
  if(active && !options.noScroll){
    window.scrollTo({top:0,behavior:'instant'});
  }

  try{localStorage.setItem('romi_last_route',target)}catch(e){}
}

function toggleSidebarCollapse(){
  document.body.classList.toggle('sidebar-collapsed');
  try{localStorage.setItem('romi_sidebar_collapsed',document.body.classList.contains('sidebar-collapsed')?'1':'0')}catch(e){}
}

function toggleRomiSidebar(open){
  document.body.classList.toggle('sidebar-mobile-open',!!open);
}

function toggleRomiTheme(){
  document.body.classList.toggle('romi-dark');
  try{localStorage.setItem('romi_theme',document.body.classList.contains('romi-dark')?'dark':'light')}catch(e){}
}

function syncSidebarStudent(){
  const el=document.getElementById('sidebarStudentName');
  if(el)el.textContent=romiState?.studentName||'Student';
}

const _romi2RenderVNext=renderVNext;
renderVNext=function(){
  _romi2RenderVNext();
  syncSidebarStudent();
};

function initRomi2App(){
  markRomiPages();

  try{
    if(localStorage.getItem('romi_sidebar_collapsed')==='1' && window.innerWidth>900){
      document.body.classList.add('sidebar-collapsed');
    }
    if(localStorage.getItem('romi_theme')==='dark'){
      document.body.classList.add('romi-dark');
    }
  }catch(e){}

  const initial=location.hash ? normalizeRomiRoute(location.hash) :
    (localStorage.getItem('romi_last_route') || 'home');
  navigateRomiApp(initial,{skipHash:!location.hash,noScroll:true});

  window.addEventListener('hashchange',()=>navigateRomiApp(location.hash,{skipHash:true,noScroll:true}));

  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href^="#"]');
    if(!a)return;
    const id=a.getAttribute('href').slice(1);
    if(ROMI_APP_ROUTES.includes(normalizeRomiRoute(id))){
      e.preventDefault();
      location.hash='#'+normalizeRomiRoute(id);
      navigateRomiApp(id,{skipHash:true});
    }
  });

  syncSidebarStudent();
}

window.addEventListener('load',()=>setTimeout(initRomi2App,120));
