/* ===== ROMI 2.3 PROGRESS CENTER & LEARNING ANALYTICS ===== */
/* Extracted from index.html during Step 7 refactor. */

function renderSkillCards(){
  const grid=document.getElementById('dashSkillGrid'); if(!grid)return;
  grid.innerHTML=Object.entries(ROMI_SKILL_META).map(([key,m])=>{
    const s=romiState.skills[key];const score=s?.score;
    const level=scoreToCEFR(score);const pct=score??0;
    return `<a class="skillCard" href="${m.href}" style="--skillColor:${m.color};text-decoration:none;color:inherit">
      <div class="skillHead"><span class="skillName">${m.icon} ${m.label}</span><span class="skillLevel">${level}</span></div>
      <div class="skillBar"><span style="width:${pct}%"></span></div>
      <div class="mastery">${masteryText(score)}${score!==null&&score!==undefined?' · '+score+'%':''}</div>
    </a>`;
  }).join('');
}
function renderProgressCenter(){
  const box=document.getElementById('progressSkillList'); if(box){
    box.innerHTML=Object.entries(ROMI_SKILL_META).map(([key,m])=>{
      const s=romiState.skills[key];const score=s?.score;const pct=score??0;
      return `<div class="progressSkill"><b>${m.icon} ${m.label}</b><span style="font-weight:950;color:${m.color}">${scoreToCEFR(score)}</span><div><div class="bar"><span style="width:${pct}%"></span></div><div class="small">${masteryText(score)} · ${s?.attempts||0} tracked attempt(s)</div></div></div>`;
    }).join('');
  }
  const recent=document.getElementById('progressRecent'); if(recent){
    recent.innerHTML=romiState.activities.length?romiState.activities.slice(0,6).map(a=>`<div class="activityRow"><span>${ROMI_SKILL_META[a.skill]?.icon||'✨'} ${escapeStateText(a.label)}</span><span class="small">${new Date(a.time).toLocaleDateString()}</span></div>`).join(''):'<div class="emptyState">Complete an activity and it will appear here.</div>';
  }
}
function renderErrorBank(){
  const box=document.getElementById('errorBankList');if(!box)return;
  if(!romiState.errors.length){box.innerHTML='<div class="emptyState">No saved mistakes yet. When Romi finds a specific grammar, writing, listening, or reading error, it will appear here.</div>';return}
  box.innerHTML=romiState.errors.slice(0,12).map(e=>`<div class="errorItem">
    <div class="errorTop"><span class="errorSkill">${escapeStateText(e.skill)}</span><span class="errorCount">Seen ${e.count||1}×</span></div>
    <div class="errorMistake">✕ ${escapeStateText(e.mistake)}</div>
    ${e.correction?`<div class="errorCorrection">✓ ${escapeStateText(e.correction)}</div>`:''}
    <div class="errorWhy">${escapeStateText(e.reason||'Review this pattern before your next attempt.')}</div>
  </div>`).join('');
}
function renderMission(){
  const weak=weakestSkill();
  const title=document.getElementById('missionTitle'),why=document.getElementById('missionWhy'),steps=document.getElementById('missionSteps'),btn=document.getElementById('missionButton');
  const recTitle=document.getElementById('recommendedTitle'),recText=document.getElementById('recommendedText'),recLink=document.getElementById('recommendedLink');
  if(!title||!steps)return;
  if(!weak){
    title.textContent='Find your starting point';
    why.textContent='Complete the adaptive diagnostic so Romi can build your CEFR profile by skill.';
    steps.innerHTML=['Answer the adaptive questions','Write the short diagnostic sample','Read your personalized recommendation'].map((x,i)=>`<div class="missionStep"><span class="missionDot">${i+1}</span>${x}</div>`).join('');
    btn.href='#diagnostic';recTitle.textContent='Adaptive Diagnostic';recText.textContent='The difficulty changes after each answer to find the best starting level.';recLink.href='#diagnostic';
  }else{
    const m=ROMI_SKILL_META[weak],score=romiState.skills[weak].score;
    title.textContent=`Strengthen ${m.label}`;
    why.textContent=`${m.label} is currently your clearest priority (${scoreToCEFR(score)} · ${masteryText(score)}).`;
    steps.innerHTML=[
      recommendationForSkill(weak),
      'Review the feedback and any mistake saved in your Error Bank.',
      'Repeat one similar task and try to improve your accuracy.'
    ].map((x,i)=>`<div class="missionStep"><span class="missionDot">${i+1}</span>${x}</div>`).join('');
    btn.href=m.href;recTitle.textContent=`Next: ${m.label} practice`;recText.textContent=recommendationForSkill(weak);recLink.href=m.href;
  }
}
function renderRecentDashboard(){
  const box=document.getElementById('recentActivity');if(!box)return;
  if(!romiState.activities.length){box.innerHTML='<div class="small">No activity yet. Your most recent practice will appear here.</div>';return}
  box.innerHTML='<b class="small">Recent:</b>'+romiState.activities.slice(0,3).map(a=>`<div class="activityRow"><span>${ROMI_SKILL_META[a.skill]?.icon||'✨'} ${escapeStateText(a.label)}</span><span class="small">${new Date(a.time).toLocaleDateString()}</span></div>`).join('');
}
function renderVNext(){
  const n=document.getElementById('dashStudentName');if(n)n.textContent=romiState.studentName||'Student';
  const inp=document.getElementById('studentNameInput');if(inp&&!inp.matches(':focus'))inp.value=romiState.studentName==='Student'?'':romiState.studentName;
  const overall=document.getElementById('dashOverall');if(overall)overall.textContent=overallCEFR();
  const dx=document.getElementById('dashXP');if(dx)dx.textContent=(romiState.xp||0)+' XP';
  const da=document.getElementById('dashActivities');if(da)da.textContent=romiState.activities.length;
  const de=document.getElementById('dashErrors');if(de)de.textContent=romiState.errors.length+' pattern'+(romiState.errors.length===1?'':'s');
  const profileLevel=document.getElementById('profileLevel');if(profileLevel&&overallCEFR()!=='Not assessed')profileLevel.textContent=overallCEFR();
  const profileNext=document.getElementById('profileNext');const weak=weakestSkill();if(profileNext&&weak)profileNext.textContent=ROMI_SKILL_META[weak].label;
  renderSkillCards();renderProgressCenter();renderErrorBank();renderMission();renderRecentDashboard();
}
function saveStudentName(){
  const v=(document.getElementById('studentNameInput')?.value||'').trim();
  romiState.studentName=v||'Student';saveRomiState();renderVNext();
  setCoachMessage('diagnostic','good',`Welcome, ${romiState.studentName}. Your progress will be saved in this browser.`);
}
function clearErrorBank(){
  romiState.errors=[];saveRomiState();renderVNext();
}
function clearLocalProgress(){
  if(!confirm('Reset Romi progress saved in this browser?'))return;
  localStorage.removeItem(ROMI_STATE_KEY);romiState=defaultRomiState();xp=0;
  const xpEl=document.getElementById('xp');if(xpEl)xpEl.textContent='0 XP';
  const fill=document.getElementById('xpFill');if(fill)fill.style.width='0%';
  const pl=document.getElementById('profileLevel');if(pl)pl.textContent='Not assessed';
  const pn=document.getElementById('profileNext');if(pn)pn.textContent='Start diagnostic';
  renderVNext();setCoachMessage('diagnostic','neutral','Progress was reset. Start with the adaptive diagnostic.');
}

/* Persist XP while preserving all existing XP and Live Coach behavior */
const _vnextAddXP=addXP;
addXP=function(n,b){
  _vnextAddXP(n,b);
  romiState.xp=xp;
  if(b){
    const lower=String(b).toLowerCase();
    let skill=null;
    if(lower.includes('reading'))skill='reading';
    else if(lower.includes('vocabulary'))skill='vocabulary';
    else if(lower.includes('writing'))skill='writing';
    else if(lower.includes('speaking'))skill='speaking';
    else if(lower.includes('listening'))skill='listening';
    else if(lower.includes('grammar'))skill='grammar';
    if(skill)logActivity(skill,b);
  }
  saveRomiState();renderVNext();
};

/* Track grammar and reading accuracy and store wrong-answer patterns */
const _vnextCheckSmall=checkSmall;
checkSmall=function(btn,ok,badge){
  const context=(btn.closest('.question')?.innerText||'').split('\n').filter(Boolean)[0]||'Practice question';
  _vnextCheckSmall(btn,ok,badge);
  const skill=String(badge||'').toLowerCase().includes('reading')?'reading':'grammar';
  updateSkillScore(skill,!!ok);
  if(!ok){
    const correct=[...btn.parentNode.querySelectorAll('button')].find(b=>b!==btn && b.classList.contains('correct'))?.textContent||'Review the model answer';
    recordError(skill,btn.textContent,correct,context);
  }
};

/* Track reading strategy practice */
const _vnextCheckStrategy=checkStrategy;
checkStrategy=function(){
  const words=(document.getElementById('strategyAnswer')?.value.trim().split(/\s+/).filter(Boolean).length)||0;
  _vnextCheckStrategy();
  updateSkillScore('reading',words>=10);
  if(words<10)recordError('reading','Answer too short','Use at least 10 words with evidence','Reading strategy answers need enough detail to show evidence from the text.');
};

/* Track vocabulary sentence quality */
const _vnextSentenceFeedback=sentenceFeedback;
sentenceFeedback=function(input){
  const text=input.value.trim();const ok=text.split(/\s+/).filter(Boolean).length>=5&&/[.!?]$/.test(text);
  _vnextSentenceFeedback(input);updateSkillScore('vocabulary',ok);
  if(!ok)recordError('vocabulary',text||'Incomplete sentence','Write at least 5 words and finish with punctuation','Use the vocabulary word in a complete sentence.');
};

/* Track listening outcomes using existing instant feedback */
const _vnextCheckListening=checkListening;
checkListening=function(i){
  _vnextCheckListening(i);
  const fb=document.getElementById('listenFb'+i)?.textContent||'';
  const good=/Excellent|Good|correct/i.test(fb)&&!/not|review|try/i.test(fb);
  updateSkillScore('listening',good);
  if(!good)recordError('listening','Listening detail missed','Listen again for key words, then check the script','Use the first listening for gist and the second for details.');
};

/* Writing: save specific mistakes/corrections to the Error Bank */
const _vnextAnalyzeWriting=analyzeWriting;
analyzeWriting=function(){
  const text=document.getElementById('writingText')?.value||'';
  const result=text.trim()?makeCorrections(text):{issues:[]};
  _vnextAnalyzeWriting();
  if(!text.trim())return;
  const issueCount=result.issues.length;
  updateSkillScore('writing',issueCount<=1,1.2);
  result.issues.slice(0,8).forEach(it=>recordError('writing',it.mistake,it.correction,it.reason||it.issue));
  logActivity('writing',issueCount?`Writing analysis: ${issueCount} correction point(s)`:'Writing analysis: clear draft');
};

/* Speaking completion is already signaled through XP badges */
const _vnextAddXP2=addXP;
addXP=function(n,b){
  _vnextAddXP2(n,b);
  if(b&&/Speaking Brave Student/i.test(b)){
    updateSkillScore('speaking',true);
    logActivity('speaking','Completed a timed speaking task');
  }
};

/* Diagnostic state/progress integration moved to ./js/diagnostic.js */

/* Contextual Live Coach moved to ./js/coach.js */

function initVNext(){
  xp=Number(romiState.xp||0);
  const xpEl=document.getElementById('xp');if(xpEl)xpEl.textContent=xp+' XP';
  const fill=document.getElementById('xpFill');if(fill)fill.style.width=Math.min(100,xp%100)+'%';
  renderVNext();initContextualCoach();
  window.addEventListener('beforeunload',saveRomiState);
}
window.addEventListener('load',initVNext);
