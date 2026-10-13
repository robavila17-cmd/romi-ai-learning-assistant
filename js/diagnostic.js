/**
 * ROMI 2.3 — Adaptive Diagnostic Engine
 * Active local diagnostic engine extracted from index.html.
 * Keeps the existing 20-question Grammar + Vocabulary behavior unchanged.
 */

/* ===== ROMI 2.1 LOCAL ADAPTIVE DIAGNOSTIC OVERRIDE ===== */
/* romiLocalCalibrationBank moved to ./data/diagnostic-bank.js */

const romiImportedScoringBank=(romiUploadedDiagnosticBank||[])
  .filter(q=>q.answerStatus==='source_key')
  .map(q=>({
    id:q.id,d:3,level:'A2',skill:q.skill,topic:q.topic,subskill:q.subskill,
    q:q.q,opts:q.opts,a:q.a,
    why:`Correct answer: ${q.answer}. This item comes from the validated A2 answer-key bank.`,
    complexity:q.difficulty||2,source:'validated imported A2 bank'
  }));

const romiLocalAdaptiveBank=[...romiLocalCalibrationBank,...romiImportedScoringBank];

function makeLocalAdaptiveState(){
  return {
    asked:[],total:0,correct:0,history:[],finished:false,lastSkill:'vocabulary',
    maxQuestions:20,minQuestions:14,
    skills:{
      grammar:{rating:2.05,total:0,correct:0,streak:0,trail:[]},
      vocabulary:{rating:2.05,total:0,correct:0,streak:0,trail:[]}
    },
    misses:{}
  };
}
adaptiveState=makeLocalAdaptiveState();

function clampAdaptive(v,min,max){return Math.max(min,Math.min(max,v))}
function ratingToLevel(r){
  if(r<1.55)return'A1';
  if(r<2.55)return'A1+';
  if(r<3.55)return'A2';
  return'A2+';
}
function adaptiveOverallRating(){
  return (adaptiveState.skills.grammar.rating+adaptiveState.skills.vocabulary.rating)/2;
}
function skillStable(skill){
  const s=adaptiveState.skills[skill];
  if(s.total<7||s.trail.length<4)return false;
  const last=s.trail.slice(-4);
  return Math.max(...last)-Math.min(...last)<0.58;
}
function shouldFinishAdaptive(){
  return adaptiveState.total>=adaptiveState.maxQuestions;
}
function chooseAdaptiveSkill(){
  const g=adaptiveState.skills.grammar;
  const v=adaptiveState.skills.vocabulary;
  if(g.total<v.total)return'grammar';
  if(v.total<g.total)return'vocabulary';
  adaptiveState.lastSkill=adaptiveState.lastSkill==='grammar'?'vocabulary':'grammar';
  return adaptiveState.lastSkill;
}
function pickAdaptiveQuestion(){
  const skill=chooseAdaptiveSkill();
  const s=adaptiveState.skills[skill];
  const target=clampAdaptive(Math.round(s.rating),1,4);

  let candidates=romiLocalAdaptiveBank.filter(q=>
    q.skill===skill && q.d===target && !adaptiveState.asked.includes(q.id)
  );
  if(!candidates.length){
    candidates=romiLocalAdaptiveBank.filter(q=>
      q.skill===skill && Math.abs(q.d-target)<=1 && !adaptiveState.asked.includes(q.id)
    );
  }
  if(!candidates.length){
    candidates=romiLocalAdaptiveBank.filter(q=>
      q.skill===skill && !adaptiveState.asked.includes(q.id)
    );
  }
  if(!candidates.length)return null;

  candidates.sort((a,b)=>{
    const da=Math.abs(a.d-s.rating),db=Math.abs(b.d-s.rating);
    if(da!==db)return da-db;
    return Math.random()-.5;
  });
  const shortlist=candidates.slice(0,Math.min(6,candidates.length));
  return shortlist[Math.floor(Math.random()*shortlist.length)];
}
function diagnosticSkillCard(skill,label){
  const s=adaptiveState.skills[skill];
  return `<div class="adaptiveSkillMeter">
    <span>${label}</span>
    <b id="${skill}LiveLevel">${ratingToLevel(s.rating)}</b>
    <small id="${skill}Evidence">${s.total}/7 evidence</small>
    <div class="adaptiveMiniBar"><i id="${skill}MiniBar" style="width:${Math.min(100,s.total/7*100)}%"></i></div>
  </div>`;
}
renderDiagnostic=function(){
  adaptiveState=makeLocalAdaptiveState();
  const area=document.getElementById('diagArea');
  if(!area)return;
  area.innerHTML=`
    <div class='liveBox localDiagnosticBox'>
      <div class="localEngineBanner">
        <div><span class="engineDot"></span><b>ROMI Adaptive Diagnostic</b></div>
        <span>20 questions · A1 to A2+</span>
      </div>
      <h3>Grammar + Vocabulary Adaptive Diagnostic</h3>
      <p>The test starts around A1+ and changes difficulty independently for Grammar and Vocabulary. It can finish early when both estimates become stable.</p>

      <div class="adaptiveSkillGrid">
        ${diagnosticSkillCard('grammar','🧩 Grammar')}
        ${diagnosticSkillCard('vocabulary','🖼️ Vocabulary')}
      </div>

      <div class='adaptiveStatus adaptiveStatusV2'>
        <div><span class='small'>Answered</span><b id='adTotal'>0 / 20</b></div>
        <div><span class='small'>Live accuracy</span><b id='adAcc'>0%</b></div>
        <div><span class='small'>Current skill</span><b id='adCurrentSkill'>—</b></div>
        <div><span class='small'>Overall estimate</span><b id='adEstimate'>Starting…</b></div>
      </div>

      <div id='adaptiveQuestion'></div>
      <div id='adaptiveLive' class='feedback' style='display:none'></div>
      <div id='adaptiveResults' class='adaptiveResultsPanel' style='display:none'></div>
    </div>`;
  showAdaptiveQuestion();
};

showAdaptiveQuestion=function(){
  if(shouldFinishAdaptive()){finishAdaptiveDiagnostic();return}
  const q=pickAdaptiveQuestion();
  if(!q){finishAdaptiveDiagnostic();return}

  adaptiveState.active=q;
  adaptiveState.asked.push(q.id);

  const live=document.getElementById('adaptiveLive');
  if(live)live.style.display='none';
  const current=document.getElementById('adCurrentSkill');
  if(current)current.textContent=q.skill==='grammar'?'Grammar':'Vocabulary';

  document.getElementById('adaptiveQuestion').innerHTML=`
    <div class='question adaptiveQuestionV2'>
      <div class="adaptiveQuestionMeta">
        <span class='pill level'>${q.level}</span>
        <span class='pill'>${q.skill==='grammar'?'🧩 Grammar':'🖼️ Vocabulary'}</span>
        <span class='pill'>${q.topic}</span>
      </div>
      <p class="small">Question ${adaptiveState.total+1} · difficulty selected from your ${q.skill} estimate</p>
      <h3>${q.q}</h3>
      ${q.opts.map((o,i)=>`<button class='choiceBtn' onclick='answerAdaptive(${i},this)'><span class="answerLetter">${String.fromCharCode(65+i)}</span>${o}</button>`).join('')}
    </div>`;
  updateAdaptiveStatus();
};

answerAdaptive=function(i,btn){
  const q=adaptiveState.active;
  if(!q||adaptiveState.finished)return;
  const ok=i===q.a;
  const s=adaptiveState.skills[q.skill];

  [...btn.parentNode.querySelectorAll('.choiceBtn')].forEach((b,idx)=>{
    b.disabled=true;
    if(idx===q.a)b.classList.add('correct');
  });
  if(!ok)btn.classList.add('wrong');

  adaptiveState.total++;
  s.total++;
  if(ok){
    adaptiveState.correct++;
    s.correct++;
    s.streak=Math.max(1,s.streak+1);
  }else{
    s.streak=Math.min(-1,s.streak-1);
  }

  const challengeGap=q.d-s.rating;
  let delta;
  if(ok){
    delta=.22+Math.max(0,challengeGap)*.14;
    if(s.streak>=2)delta+=.10;
  }else{
    delta=-.27-Math.max(0,-challengeGap)*.12;
    if(s.streak<=-2)delta-=.10;
  }
  s.rating=clampAdaptive(s.rating+delta,1,4);
  s.trail.push(s.rating);

  if(!ok){
    const key=`${q.skill} · ${q.topic} · ${q.subskill}`;
    adaptiveState.misses[key]=(adaptiveState.misses[key]||0)+1;
    if(typeof recordError==='function'){
      recordError(q.skill,q.opts[i],q.opts[q.a],q.why);
    }
  }

  adaptiveState.history.push({
    id:q.id,skill:q.skill,topic:q.topic,subskill:q.subskill,
    level:q.level,d:q.d,ok,why:q.why,selected:i,correctIndex:q.a
  });

  if(typeof updateSkillScore==='function')updateSkillScore(q.skill,ok,1.10);

  const overall=ratingToLevel(adaptiveOverallRating());
  const nextLevel=ratingToLevel(s.rating);
  const nextMessage=ok
    ? `Your ${q.skill} estimate is now ${nextLevel}.`
    : `ROMI will keep the next ${q.skill} item near ${nextLevel} to confirm your level.`;

  const live=document.getElementById('adaptiveLive');
  live.style.display='block';
  live.className='feedback '+(ok?'ok':'warn');
  live.innerHTML=`
    <h3>${ok?'✅ Correct':'🟡 Review this skill'}</h3>
    <p><b>Why:</b> ${q.why}</p>
    <p><b>Adaptive decision:</b> ${nextMessage}</p>
    <button class='btn small' onclick="${shouldFinishAdaptive()?'finishAdaptiveDiagnostic()':'showAdaptiveQuestion()'}">
      ${shouldFinishAdaptive()?'See my results':'Next adaptive question'}
    </button>`;

  const estimate=document.getElementById('adEstimate');
  if(estimate)estimate.textContent=overall;
  updateAdaptiveStatus();

  if(typeof setCoachMessage==='function'){
    setCoachMessage('diagnostic',ok?'good':'review',
      ok?`Correct. Your ${q.skill} challenge may increase.`:`Review ${q.topic}. ROMI is adjusting the next ${q.skill} item.`);
  }
  if(ok)addXP(4,'Diagnostic Starter');
};

updateAdaptiveStatus=function(){
  const acc=adaptiveState.total?Math.round(100*adaptiveState.correct/adaptiveState.total):0;
  const total=document.getElementById('adTotal');
  const accuracy=document.getElementById('adAcc');
  if(total)total.textContent=adaptiveState.total+' / '+adaptiveState.maxQuestions;
  if(accuracy)accuracy.textContent=acc+'%';

  ['grammar','vocabulary'].forEach(skill=>{
    const s=adaptiveState.skills[skill];
    const level=document.getElementById(skill+'LiveLevel');
    const evidence=document.getElementById(skill+'Evidence');
    const bar=document.getElementById(skill+'MiniBar');
    if(level)level.textContent=ratingToLevel(s.rating);
    if(evidence)evidence.textContent=`${s.total}/7 evidence`;
    if(bar)bar.style.width=Math.min(100,s.total/7*100)+'%';
  });
};

resetDiagnostic=function(){
  const wt=document.getElementById('diagWriting');
  if(wt)wt.value='';
  const fb=document.getElementById('diagFeedback');
  if(fb)fb.style.display='none';
  renderDiagnostic();
};

function weakestDiagnosticFocus(){
  const misses=Object.entries(adaptiveState.misses).sort((a,b)=>b[1]-a[1]);
  if(misses.length)return misses[0][0];
  const g=adaptiveState.skills.grammar,v=adaptiveState.skills.vocabulary;
  return g.rating<=v.rating?'grammar · consolidate lower-confidence topics':'vocabulary · broaden vocabulary in context';
}
function writingLocalIndicators(){
  const text=document.getElementById('diagWriting')?.value.trim()||'';
  if(!text)return{words:0,connectors:0,past:0,future:0,pp:0,note:'No writing sample submitted.'};
  const words=text.split(/\s+/).filter(Boolean).length;
  const connectors=(text.match(/\b(and|but|because|then|after that|first|finally|however|also|although|so)\b/gi)||[]).length;
  const past=(text.match(/\b(went|played|visited|was|were|had|did|made|studied|saw|ate|read|worked|watched|bought|came|got|took)\b/gi)||[]).length;
  const future=(text.match(/\b(will|going to|am going to|is going to|are going to)\b/gi)||[]).length;
  const pp=(text.match(/\b(have|has)\s+\w+(ed|en)\b/gi)||[]).length;
  return{words,connectors,past,future,pp,note:'Writing is an informal indicator and does not change the Grammar/Vocabulary CEFR score.'};
}


function diagnosticTopicStats(){
  const map={};
  adaptiveState.history.forEach(h=>{
    const key=`${h.skill}|${h.topic}`;
    if(!map[key])map[key]={skill:h.skill,topic:h.topic,total:0,correct:0,wrong:0};
    map[key].total++;
    if(h.ok)map[key].correct++; else map[key].wrong++;
  });
  return Object.values(map);
}

function diagnosticStrengths(){
  return diagnosticTopicStats()
    .filter(x=>x.correct>0 && x.wrong===0)
    .sort((a,b)=>b.correct-a.correct)
    .slice(0,3);
}

function diagnosticPriorities(){
  const missed=diagnosticTopicStats()
    .filter(x=>x.wrong>0)
    .sort((a,b)=>b.wrong-a.wrong || a.correct-b.correct);
  if(missed.length)return missed.slice(0,3);

  const g=adaptiveState.skills.grammar;
  const v=adaptiveState.skills.vocabulary;
  return [{
    skill:g.rating<=v.rating?'grammar':'vocabulary',
    topic:g.rating<=v.rating?'Mixed grammar review':'Vocabulary in context',
    wrong:0,total:0,correct:0
  }];
}

function levelStudyRecommendation(skill,level){
  const plans={
    grammar:{
      'A1':'Verb to be, articles, pronouns, and basic present simple.',
      'A1+':'Present simple questions/negatives, past be, can, and basic sentence patterns.',
      'A2':'Simple past, past continuous, comparatives, future forms, first conditional, and present perfect.',
      'A2+':'Present perfect vs past, passive voice, second conditional, relative clauses, and more complex structures.'
    },
    vocabulary:{
      'A1':'Family, school, food, places, weather, and daily routines.',
      'A1+':'House, clothes, transport, hobbies, jobs, and common collocations.',
      'A2':'Travel, health, shopping, personality, environment, and vocabulary in context.',
      'A2+':'Phrasal verbs, word formation, collocations, feelings, work, and precise contextual vocabulary.'
    }
  };
  return plans[skill]?.[level]||'Mixed review and contextual practice.';
}

function buildPersonalizedStudyPlan(grammarLevel,vocabularyLevel){
  const priorities=diagnosticPriorities();
  const p1=priorities[0];
  const p2=priorities[1];

  return `
    <div class="studyPlanHeader">
      <div>
        <div class="pageEyebrow">YOUR NEXT LEARNING PATH</div>
        <h3>Personalized Study Plan</h3>
        <p class="small">Follow this sequence before taking the diagnostic again.</p>
      </div>
      <span class="planDuration">7–10 days</span>
    </div>

    <div class="studyPlanTimeline">
      <div class="studyPlanStep">
        <span class="planStepNumber">1</span>
        <div><b>Review your first priority</b>
        <p>${p1.skill==='grammar'?'🧩 Grammar':'🖼️ Vocabulary'} · ${p1.topic}</p>
        <small>Complete one explanation and 6–8 focused practice items.</small></div>
      </div>

      <div class="studyPlanStep">
        <span class="planStepNumber">2</span>
        <div><b>Strengthen Grammar</b>
        <p>${levelStudyRecommendation('grammar',grammarLevel)}</p>
        <small>Two short sessions of 10–15 minutes.</small></div>
      </div>

      <div class="studyPlanStep">
        <span class="planStepNumber">3</span>
        <div><b>Strengthen Vocabulary</b>
        <p>${levelStudyRecommendation('vocabulary',vocabularyLevel)}</p>
        <small>Use flashcards, then write five original sentences.</small></div>
      </div>

      <div class="studyPlanStep">
        <span class="planStepNumber">4</span>
        <div><b>${p2?`Review your second priority: ${p2.topic}`:'Mixed challenge'}</b>
        <p>${p2?`Practice ${p2.skill} in a new context.`:'Combine Grammar and Vocabulary in one mixed practice session.'}</p>
        <small>Do not repeat the same questions from the diagnostic.</small></div>
      </div>

      <div class="studyPlanStep">
        <span class="planStepNumber">5</span>
        <div><b>Check your progress</b>
        <p>Complete a mixed practice and review the Error Bank.</p>
        <small>Then repeat the diagnostic after several days to compare your profile.</small></div>
      </div>
    </div>
  `;
}

finishAdaptiveDiagnostic=function(){
  if(adaptiveState.finished)return;
  if(adaptiveState.total<adaptiveState.maxQuestions){
    const live=document.getElementById('adaptiveLive');
    if(live){
      live.style.display='block';
      live.className='feedback warn';
      live.innerHTML=`<b>Keep going.</b> Complete all ${adaptiveState.maxQuestions} questions to unlock your results.`;
    }
    return;
  }

  adaptiveState.finished=true;

  const g=adaptiveState.skills.grammar;
  const v=adaptiveState.skills.vocabulary;
  const grammarLevel=ratingToLevel(g.rating);
  const vocabularyLevel=ratingToLevel(v.rating);
  const overallLevel=ratingToLevel(adaptiveOverallRating());
  const weak=weakestDiagnosticFocus();
  const w=writingLocalIndicators();
  const strengths=diagnosticStrengths();
  const priorities=diagnosticPriorities();

  const pl=document.getElementById('profileLevel');
  const pn=document.getElementById('profileNext');
  if(pl)pl.textContent=overallLevel;
  if(pn)pn.textContent=priorities[0]?.topic||weak;

  const evidence=adaptiveState.history.map((h,idx)=>`
    <li><b>${idx+1}. ${h.skill==='grammar'?'Grammar':'Vocabulary'} · ${h.level} · ${h.topic}</b>
    — ${h.ok?'✓ correct':'review needed'}</li>`).join('');

  const strengthsHtml=strengths.length
    ? strengths.map(x=>`<span class="resultChip goodChip">✓ ${x.topic}</span>`).join('')
    : '<span class="resultChip">Keep practicing to build clear strengths.</span>';

  const prioritiesHtml=priorities.map(x=>
    `<span class="resultChip focusChip">→ ${x.skill==='grammar'?'Grammar':'Vocabulary'}: ${x.topic}</span>`
  ).join('');

  const aq=document.getElementById('adaptiveQuestion');
  if(aq)aq.style.display='none';

  const live=document.getElementById('adaptiveLive');
  if(live)live.style.display='none';

  const results=document.getElementById('adaptiveResults');
  if(results){
    results.style.display='block';
    results.innerHTML=`
      <div class="diagnosticResultHero">
        <div>
          <div class="pageEyebrow">ADAPTIVE DIAGNOSTIC COMPLETE</div>
          <h2>Your English profile</h2>
          <p>You completed all 20 questions. ROMI used your performance in Grammar and Vocabulary to create the profile below.</p>
        </div>
        <div class="overallResultBadge">
          <span>Overall</span>
          <b>${overallLevel}</b>
        </div>
      </div>

      <div class="diagnosticResultsGrid diagnosticResultsLarge">
        <div class="resultLevelCard">
          <span>🧩 Grammar</span>
          <b>${grammarLevel}</b>
          <small>${g.correct}/${g.total} correct</small>
          <div class="resultBar"><i style="width:${Math.round(g.correct/g.total*100)}%"></i></div>
        </div>
        <div class="resultLevelCard">
          <span>🖼️ Vocabulary</span>
          <b>${vocabularyLevel}</b>
          <small>${v.correct}/${v.total} correct</small>
          <div class="resultBar"><i style="width:${Math.round(v.correct/v.total*100)}%"></i></div>
        </div>
        <div class="resultLevelCard">
          <span>🎯 Total performance</span>
          <b>${adaptiveState.correct}/20</b>
          <small>${Math.round(adaptiveState.correct/20*100)}% correct</small>
          <div class="resultBar"><i style="width:${Math.round(adaptiveState.correct/20*100)}%"></i></div>
        </div>
      </div>

      <div class="diagnosticInsightGrid">
        <div class="resultInsightCard">
          <h3>🌟 Strengths</h3>
          <div class="resultChipWrap">${strengthsHtml}</div>
        </div>
        <div class="resultInsightCard">
          <h3>🎯 Priorities</h3>
          <div class="resultChipWrap">${prioritiesHtml}</div>
        </div>
      </div>

      ${w.words?`
      <div class="writingIndicatorBox">
        <b>✍️ Writing observation</b>
        <p>${w.words} words · ${w.connectors} connectors · ${w.past} past forms · ${w.future} future forms · ${w.pp} present-perfect attempts.</p>
        <p class="small">${w.note}</p>
      </div>`:''}

      <div class="diagnosticStudyPlan">
        ${buildPersonalizedStudyPlan(grammarLevel,vocabularyLevel)}
      </div>

      <details class="diagnosticEvidence">
        <summary><b>See the 20-question evidence</b></summary>
        <ul>${evidence}</ul>
      </details>

      <div class="resultActions">
        <button class="btn" onclick="location.hash='practiceHub'">Start practicing</button>
        <button class="btn secondary" onclick="location.hash='progressCenter'">View my progress</button>
        <button class="btn secondary" onclick="resetDiagnostic()">Retake diagnostic</button>
      </div>
    `;
    setTimeout(()=>results.scrollIntoView({behavior:'smooth',block:'start'}),100);
  }

  if(typeof makePlan==='function')makePlan(overallLevel,priorities[0]?.topic||weak);
  if(typeof makeTeacherReport==='function')makeTeacherReport(overallLevel,adaptiveState.correct,w.words,priorities[0]?.topic||weak);

  const ratingScore=r=>Math.round(clampAdaptive(20+r*18,25,94));
  if(typeof setSkillScore==='function'){
    setSkillScore('grammar',ratingScore(g.rating),g.total,g.correct);
    setSkillScore('vocabulary',ratingScore(v.rating),v.total,v.correct);
    if(w.words){
      const punctuation=(document.getElementById('diagWriting').value.match(/[.!?]/g)||[]).length;
      setSkillScore('writing',Math.min(92,28+Math.min(w.words,45)*.8+w.connectors*6+punctuation*3),1,1);
    }
  }

  if(typeof romiState!=='undefined'){
    romiState.diagnosticLevel=overallLevel;
    romiState.lastSkill=g.rating<=v.rating?'grammar':'vocabulary';
    if(typeof logActivity==='function'){
      logActivity('grammar',`Adaptive diagnostic · ${grammarLevel}`);
      logActivity('vocabulary',`Adaptive diagnostic · ${vocabularyLevel}`);
    }
    if(typeof saveRomiState==='function')saveRomiState();
    if(typeof renderSkillCards==='function')renderSkillCards();
    if(typeof renderProgressCenter==='function')renderProgressCenter();
    if(typeof renderMission==='function')renderMission();
  }

  if(typeof setCoachMessage==='function'){
    setCoachMessage('diagnostic','challenge',`Overall ${overallLevel}. Grammar ${grammarLevel}. Vocabulary ${vocabularyLevel}. Priority: ${priorities[0]?.topic||weak}.`);
  }
  addXP(20,'Diagnostic Starter');
};

scoreDiagnostic=function(){
  if(adaptiveState.total<adaptiveState.maxQuestions){
    const fb=document.getElementById('diagFeedback');
    if(fb){
      fb.style.display='block';
      fb.className='feedback warn';
      fb.innerHTML=`<b>Complete the diagnostic first.</b> You have answered ${adaptiveState.total} of ${adaptiveState.maxQuestions} questions.`;
    }
    return;
  }
  finishAdaptiveDiagnostic();
};

window.addEventListener('load',()=>setTimeout(()=>{
  if(location.hash==='#diagnostic' || document.getElementById('diagArea')){
    renderDiagnostic();
  }
},220));
