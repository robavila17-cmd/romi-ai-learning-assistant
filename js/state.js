/* ===== ROMI 2.3 STATE + PROGRESS CORE ===== */
const ROMI_STATE_KEY='romi_vnext_state_1';
const ROMI_SKILL_META={
  grammar:{label:'Grammar',icon:'🧩',color:'#7c3aed',href:'#grammar'},
  reading:{label:'Reading',icon:'📚',color:'#2563eb',href:'#reading'},
  vocabulary:{label:'Vocabulary',icon:'🖼️',color:'#059669',href:'#vocabulary'},
  listening:{label:'Listening',icon:'🎧',color:'#ea580c',href:'#listening'},
  speaking:{label:'Speaking',icon:'🎤',color:'#e11d48',href:'#speaking'},
  writing:{label:'Writing',icon:'✍️',color:'#4f46e5',href:'#writing'}
};
function defaultRomiState(){
  return {
    studentName:'Student',
    xp:0,
    skills:{
      grammar:{score:null,attempts:0,correct:0},
      reading:{score:null,attempts:0,correct:0},
      vocabulary:{score:null,attempts:0,correct:0},
      listening:{score:null,attempts:0,correct:0},
      speaking:{score:null,attempts:0,correct:0},
      writing:{score:null,attempts:0,correct:0}
    },
    errors:[],
    activities:[],
    lastSkill:'diagnostic',
    lastTarget:'#diagnostic',
    diagnosticLevel:null,
    savedAt:null
  };
}
function loadRomiState(){
  try{
    const raw=localStorage.getItem(ROMI_STATE_KEY);
    if(!raw)return defaultRomiState();
    const saved=JSON.parse(raw);
    const base=defaultRomiState();
    return {
      ...base,...saved,
      skills:{...base.skills,...(saved.skills||{})},
      errors:Array.isArray(saved.errors)?saved.errors:[],
      activities:Array.isArray(saved.activities)?saved.activities:[]
    };
  }catch(e){return defaultRomiState()}
}
let romiState=loadRomiState();

function saveRomiState(){
  romiState.savedAt=new Date().toISOString();
  try{localStorage.setItem(ROMI_STATE_KEY,JSON.stringify(romiState))}catch(e){}
}
function escapeStateText(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function scoreToCEFR(score){
  if(score===null||score===undefined||Number.isNaN(score))return '—';
  if(score<40)return 'A1';
  if(score<60)return 'A1+';
  if(score<80)return 'A2';
  return 'A2+';
}
function masteryText(score){
  if(score===null||score===undefined)return 'Not assessed';
  if(score<40)return 'Needs Practice';
  if(score<60)return 'Developing';
  if(score<80)return 'Almost There';
  return 'Mastered';
}
function overallCEFR(){
  const vals=Object.values(romiState.skills).map(s=>s.score).filter(v=>v!==null&&v!==undefined);
  if(!vals.length)return romiState.diagnosticLevel||'Not assessed';
  return scoreToCEFR(vals.reduce((a,b)=>a+b,0)/vals.length);
}
function updateSkillScore(skill,correct,weight=1){
  if(!romiState.skills[skill])return;
  const s=romiState.skills[skill];
  const observed=correct?88:34;
  if(s.score===null||s.score===undefined)s.score=observed;
  else s.score=Math.max(10,Math.min(98,Math.round((s.score*(3-weight)+observed*weight)/3)));
  s.attempts=(s.attempts||0)+1;
  if(correct)s.correct=(s.correct||0)+1;
  romiState.lastSkill=skill;
  romiState.lastTarget=ROMI_SKILL_META[skill]?.href||'#practiceHub';
  saveRomiState();renderVNext();
}
function setSkillScore(skill,score,attempts=1,correct=0){
  if(!romiState.skills[skill])return;
  romiState.skills[skill].score=Math.max(10,Math.min(98,Math.round(score)));
  romiState.skills[skill].attempts=Math.max(romiState.skills[skill].attempts||0,attempts);
  romiState.skills[skill].correct=Math.max(romiState.skills[skill].correct||0,correct);
}
function logActivity(skill,label){
  romiState.activities.unshift({skill,label,time:new Date().toISOString()});
  romiState.activities=romiState.activities.slice(0,12);
  romiState.lastSkill=skill;
  if(ROMI_SKILL_META[skill])romiState.lastTarget=ROMI_SKILL_META[skill].href;
  saveRomiState();
}
function recordError(skill,mistake,correction,reason){
  mistake=String(mistake||'').trim();correction=String(correction||'').trim();reason=String(reason||'').trim();
  if(!mistake)return;
  const key=(skill+'|'+mistake+'|'+correction).toLowerCase();
  const existing=romiState.errors.find(e=>e.key===key);
  if(existing){existing.count=(existing.count||1)+1;existing.reason=reason||existing.reason;existing.time=new Date().toISOString()}
  else romiState.errors.unshift({key,skill,mistake,correction,reason,count:1,time:new Date().toISOString()});
  romiState.errors.sort((a,b)=>(b.count||1)-(a.count||1)||new Date(b.time)-new Date(a.time));
  romiState.errors=romiState.errors.slice(0,30);
  saveRomiState();renderErrorBank();
}
function weakestSkill(){
  const assessed=Object.entries(romiState.skills).filter(([k,v])=>v.score!==null&&v.score!==undefined);
  if(!assessed.length)return null;
  assessed.sort((a,b)=>a[1].score-b[1].score);
  return assessed[0][0];
}
function recommendationForSkill(skill){
  const r={
    grammar:'Complete one grammar micro-lesson, then answer three practice questions.',
    reading:'Open one reading and use a strategy before answering the comprehension questions.',
    vocabulary:'Review picture flashcards, then use five words in original sentences.',
    listening:'Listen once for the main idea, listen again for details, then check the script.',
    speaking:'Speak for 45–60 seconds using at least three connectors.',
    writing:'Write a short paragraph, analyze it, then rewrite it using the correction table.'
  };
  return r[skill]||'Complete the adaptive diagnostic so Romi can personalize your next step.';
}
