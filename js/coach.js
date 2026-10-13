/**
 * ROMI 2.3 — Live Coach
 * Extracted from index.html during the 2.3 refactor.
 *
 * Responsibilities:
 * - contextual learning guidance
 * - local coach knowledge/fallback
 * - ROMI AI API integration
 * - chat persistence and student context
 * - coach dock, voice input and text-to-speech
 * - AI response Markdown rendering
 */

/* ROMI LIVE COACH: real-time support and guidance */
const coachBank={
 diagnostic:{title:'Adaptive diagnostic',work:'Answer slowly and read every option. The test adapts to your answers, so one mistake is not a failure.',tips:['If the question becomes easier, Romi is finding your real level.','Review the explanation after each answer.','Use the writing sample to show what you can really produce.'],support:'You are not supposed to know everything. The goal is to find the best starting point for you.'},
 grammar:{title:'Grammar accuracy',work:'Focus on one structure at a time: subject + verb + complement.',tips:['For he/she/it in simple present, remember the -s.','For past tense, separate regular verbs (-ed) and irregular verbs.','For present perfect, use have/has + past participle.'],support:'Mistakes are useful clues. Every correction tells you exactly what to practice next.'},
 reading:{title:'Reading comprehension',work:'Use a strategy before answering: skim, scan, underline evidence, then choose.',tips:['Skim first for the main idea.','Scan for names, numbers, dates, and key words.','For unknown words, read the sentence before and after.'],support:'You do not need to understand every word to understand the text.'},
 vocabulary:{title:'Vocabulary range',work:'Study the picture, say the word, then write one sentence with it.',tips:['Group words by category.','Use each new word in a personal sentence.','Review difficult words again after 10 minutes.'],support:'Vocabulary grows with repetition. Small daily practice works.'},
 writing:{title:'Writing correction',work:'Check sentence order, punctuation, connectors, and verb tense.',tips:['Write short clear sentences first.','Use connectors: first, then, because, but, finally.','After correction, rewrite your paragraph one more time.'],support:'Your first version is a draft. Good writers revise.'},
 speaking:{title:'Speaking fluency',work:'Speak clearly for 45–60 seconds. Focus on communication first, then accuracy.',tips:['Prepare 5 key words before speaking.','Use connectors to organize your ideas.','Do not stop for every mistake; keep speaking.'],support:'Confidence comes from practice, not perfection.'},
 listening:{title:'Listening comprehension',work:'Listen twice: first for the general idea, second for details.',tips:['Before listening, predict the topic from the title.','During the second listening, focus on key words.','After listening, check why each wrong answer is wrong.'],support:'It is normal to miss information the first time. The second listening is where learning happens.'}
};
function setCoachMessage(skill='diagnostic',status='neutral',detail=''){
 const data=coachBank[skill]||coachBank.diagnostic;
 const icons={good:'✅',review:'🟡',support:'💛',neutral:'🤖',challenge:'🚀'};
 let action=status==='good'?'Great work. Keep going with a slightly harder challenge.':status==='review'?'Good effort. Review this point before moving on.':status==='challenge'?'You are ready for the next challenge.':'I am here to guide your next step.';
 let html=`<b>${icons[status]||'🤖'} ${data.title}</b><br>${action}<br><b>Work on:</b> ${detail||data.work}<br><b>Support:</b> ${data.support}`;
 const main=document.getElementById('coachMainMessage'); if(main) main.innerHTML=html;
 const dock=document.getElementById('coachDockMessage'); if(dock) dock.innerHTML=html;
 const tips=document.getElementById('coachTips'); if(tips) tips.innerHTML=`<div class='tipCard'><b>Priority:</b> ${data.work}</div>`+data.tips.map(t=>`<div class='tipCard'>💡 ${t}</div>`).join('')+`<div class='tipCard'><b>Next step:</b> ${nextCoachStep(skill)}</div>`;
 pulseCoach();
}
function nextCoachStep(skill){
 const map={diagnostic:'Finish the adaptive test and read your recommended focus area.',grammar:'Do two micro-practice questions and explain the rule aloud.',reading:'Open one reading and complete one strategy activity before answering.',vocabulary:'Flip 10 flashcards, then write 5 original sentences.',writing:'Analyze your paragraph, study the correction table, and rewrite it.',speaking:'Record or practice a 45-second answer using three connectors.',listening:'Listen twice, answer, then reveal the script to check evidence.'};
 return map[skill]||map.diagnostic;
}
function manualCoachTip(){const skill=document.getElementById('coachSkill')?.value||'diagnostic';setCoachMessage(skill,'neutral')}
function coachMood(mood){
 const messages={confused:['support','Take a breath. Choose one small task: read the example, then try one question.'],nervous:['support','You can do this. The goal is progress, not perfection. Try one answer and learn from the feedback.'],ready:['challenge','Excellent. Choose a harder level or complete a timed activity.'],proud:['good','Celebrate your progress. Now repeat the activity once more to make it stronger.']};
 const [status,detail]=messages[mood]||messages.ready;setCoachMessage(document.getElementById('coachSkill')?.value||'diagnostic',status,detail)
}
function toggleCoachDock(){const mini=document.getElementById('coachMini'); if(!mini)return; mini.classList.toggle('coachHidden'); mini.querySelector('.coachHead button').textContent=mini.classList.contains('coachHidden')?'Open':'Hide'}
function pulseCoach(){const dock=document.getElementById('coachMini'); if(!dock)return; dock.classList.remove('coachPulse'); void dock.offsetWidth; dock.classList.add('coachPulse')}
function liveWritingCoach(){
 const t=document.getElementById('writingText')?.value||''; if(!t.trim())return;
 const words=t.trim().split(/\s+/).filter(Boolean).length; const connectors=(t.match(/\b(and|but|because|then|after that|first|finally|however|also|although|so)\b/gi)||[]).length;
 let detail=words<30?'Add more details. Try to reach at least 30–40 words.':connectors<2?'Add connectors such as because, but, then, after that, or finally.':'Good development. Now check tense accuracy and punctuation.';
 setCoachMessage('writing',words>=40&&connectors>=2?'good':'review',detail);
}
function initCoach(){setCoachMessage('diagnostic','neutral'); const w=document.getElementById('writingText'); if(w){let coachTimeout; w.addEventListener('input',()=>{clearTimeout(coachTimeout); coachTimeout=setTimeout(liveWritingCoach,450)})}}
// Wrap existing functions so the Live Coach updates after student actions.
window.addEventListener('load',initCoach);
const _oldCheckSmall=checkSmall; checkSmall=function(btn,ok,badge){_oldCheckSmall(btn,ok,badge); setCoachMessage('grammar',ok?'good':'review',ok?'You understood this grammar point. Try another example.':'Review the grammar explanation and compare the correct model sentence.');};
const _oldCheckStrategy=checkStrategy; checkStrategy=function(){_oldCheckStrategy(); const words=(document.getElementById('strategyAnswer')?.value.trim().split(/\s+/).filter(Boolean).length)||0; setCoachMessage('reading',words>=10?'good':'review',words>=10?'Good evidence-based answer. Now answer a reading question.':'Add evidence from the text and write at least 10 words.');};
const _oldSentenceFeedback=sentenceFeedback; sentenceFeedback=function(input){_oldSentenceFeedback(input); const ok=input.value.trim().split(/\s+/).length>=5&&/[.!?]$/.test(input.value.trim()); setCoachMessage('vocabulary',ok?'good':'review',ok?'Good sentence. Try to add one adjective or connector.':'Use at least five words and finish with punctuation.');};
const _oldAnalyzeWriting=analyzeWriting; analyzeWriting=function(){_oldAnalyzeWriting(); const t=document.getElementById('writingText')?.value||''; const issueCount=(document.querySelectorAll('#writingFeedback .correctionTable tr').length-1)||0; setCoachMessage('writing',issueCount>1?'review':'good',issueCount>1?'Study the correction table: mistake, correction, focus, and reason. Then rewrite the paragraph.':'Nice work. Add richer vocabulary or try a higher-level tense.');};
const _oldAddXP=addXP; addXP=function(n,b){_oldAddXP(n,b); if(b&&/Speaking/.test(b))setCoachMessage('speaking','good','You completed a speaking task. Next time, record yourself and check clarity, tense, and connectors.');};
const _oldCheckListening=checkListening; checkListening=function(i){_oldCheckListening(i); const fb=document.getElementById('listenFb'+i)?.textContent||''; const good=/Excellent|Good/.test(fb); setCoachMessage('listening',good?'good':'review',good?'Good listening score. Now reveal the script and underline the evidence.':'Listen again, focus on key words, then check the script for evidence.');};

/* Contextual Romi Live Coach: follows the section the student is using */
function initContextualCoach(){
  const map={
    diagnostic:'diagnostic',grammar:'grammar',reading:'reading',strategies:'reading',
    vocabulary:'vocabulary',writing:'writing',speaking:'speaking',listening:'listening'
  };
  if(!('IntersectionObserver' in window))return;
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible)return;
    const skill=map[visible.target.id];if(!skill)return;
    romiState.lastSkill=skill;romiState.lastTarget=ROMI_SKILL_META[skill]?.href||'#diagnostic';saveRomiState();
    const selector=document.getElementById('coachSkill');if(selector&&[...selector.options].some(o=>o.value===skill))selector.value=skill;
    setCoachMessage(skill,'neutral',recommendationForSkill(skill));
  },{threshold:[.32,.55]});
  Object.keys(map).forEach(id=>{const el=document.getElementById(id);if(el)observer.observe(el)});
}

/* ===== ROMI LIVE COACH+ CONVERSATIONAL ENGINE ===== */
const ROMI_COACH_KB={
  'verb to be':{
    aliases:['verb to be','am is are','was were','to be'],
    simple:'Use the verb to be to describe identity, age, feelings, location, and states.',
    rule:'Present: I am · he/she/it is · you/we/they are. Past: I/he/she/it was · you/we/they were.',
    example:'I am tired today. Yesterday, I was tired too.'
  },
  'simple present':{
    aliases:['simple present','present simple','he she it s','third person s','third-person s'],
    simple:'Use the simple present for routines, habits, facts, and repeated actions.',
    rule:'I/you/we/they + base verb. He/she/it + verb-s or verb-es.',
    example:'I play soccer on Fridays. She plays soccer on Fridays.'
  },
  'simple past':{
    aliases:['simple past','past simple','regular verbs','irregular verbs','did went','past tense'],
    simple:'Use the simple past for finished actions in the past.',
    rule:'Positive: subject + past verb. Negative/question: did + base verb. Regular verbs often use -ed; irregular verbs change form.',
    example:'I visited my aunt yesterday. She went to the park. Did you go?'
  },
  'future will':{
    aliases:['future will','will','future with will'],
    simple:'Use will for predictions, quick decisions, promises, and offers.',
    rule:'Subject + will + base verb.',
    example:'I think it will rain tomorrow. I will help you.'
  },
  'going to':{
    aliases:['going to','future going to','gonna'],
    simple:'Use be going to for plans or predictions based on present evidence.',
    rule:'Subject + am/is/are + going to + base verb.',
    example:'I am going to study tonight. Look at those clouds! It is going to rain.'
  },
  'present perfect':{
    aliases:['present perfect','have has','past participle','ever never just yet since for'],
    simple:'Use the present perfect to connect the past with the present: experiences, recent actions, or situations that continue now.',
    rule:'Subject + have/has + past participle.',
    example:'She has visited Cuenca twice. I have lived here for three years.'
  },
  'will vs going to':{
    aliases:['will and going to','will vs going to','difference between will and going to','will or going to'],
    simple:'Both talk about the future, but they are used for different reasons.',
    rule:'Use will for predictions or decisions made now. Use going to for plans already decided or predictions with visible evidence.',
    example:'I will answer the phone. / I am going to visit my grandmother this weekend.'
  },
  'present perfect vs simple past':{
    aliases:['present perfect vs simple past','present perfect and past simple','difference between present perfect and simple past'],
    simple:'Simple past focuses on a finished past time. Present perfect connects past experience or action to now.',
    rule:'Use simple past with finished time expressions such as yesterday or last year. Use present perfect when the exact finished time is not important or the situation continues.',
    example:'I visited Quito last year. / I have visited Quito three times.'
  },
  'reading':{
    aliases:['reading','main idea','skim','skimming','scan','scanning','context clues','reading strategy'],
    simple:'Strong readers do not translate every word. They choose a strategy based on the question.',
    rule:'Skim for the general idea. Scan for specific information. Use nearby words to infer unknown vocabulary. Return to the text for evidence.',
    example:'If the question asks “When?”, scan for dates and time expressions instead of rereading every sentence.'
  },
  'listening':{
    aliases:['listening','listen','audio','i cannot understand the audio','can’t understand listening'],
    simple:'Listening becomes easier when you separate gist from details.',
    rule:'First listening: identify topic and general idea. Second listening: focus on key words, numbers, names, and target details.',
    example:'Before listening, predict vocabulary from the title. After the first listen, write only the main idea.'
  },
  'speaking':{
    aliases:['speaking','speak','fluency','i am nervous speaking','pronunciation'],
    simple:'For speaking practice, communication comes first. Accuracy can improve after you finish the idea.',
    rule:'Plan 3–5 key words, speak in complete sentences, and use connectors such as first, because, but, then, and finally.',
    example:'First, I usually wake up at 6:00. Then, I have breakfast because school starts early.'
  },
  'writing':{
    aliases:['writing','paragraph','coherence','cohesion','punctuation','word order','connectors'],
    simple:'A clear paragraph needs one main idea, organized sentences, connectors, correct word order, and punctuation.',
    rule:'Start with a clear topic sentence. Add details. Use connectors. Check subject + verb order and tense consistency. Finish each sentence with punctuation.',
    example:'First, I get ready for school. Then, I take the bus because my school is far from home.'
  },
  'vocabulary':{
    aliases:['vocabulary','word','words','remember vocabulary','learn words','flashcards'],
    simple:'Vocabulary is learned better through retrieval and use, not only rereading.',
    rule:'See the word, say it, remember its meaning, and use it in a personal sentence. Review difficult words again later.',
    example:'Word: helmet. Sentence: I wear a helmet when I ride my bike.'
  }
};

let romiCoachSession={lastTopic:'',lastIntent:'',lastAnswer:'',currentSkill:'diagnostic'};

function coachNormalize(t){
  return String(t||'').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[’]/g,"'")
    .replace(/\s+/g,' ').trim();
}

function detectCoachTopic(question){
  const q=coachNormalize(question);
  // More specific comparisons first
  const priority=['will vs going to','present perfect vs simple past','present perfect','simple past','simple present','verb to be','future will','going to','reading','listening','speaking','writing','vocabulary'];
  for(const key of priority){
    const item=ROMI_COACH_KB[key];
    if(item.aliases.some(a=>q.includes(coachNormalize(a)))) return key;
  }
  const contextual=romiState?.lastSkill;
  if(contextual && ROMI_COACH_KB[contextual]) return contextual;
  return romiCoachSession.lastTopic||'';
}

function detectCoachIntent(question){
  const q=coachNormalize(question);
  if(/\b(hi|hello|hey|good morning|good afternoon)\b/.test(q))return'greeting';
  if(/what should i (study|practice|work on)|what do i need|next step|recommend|priority/.test(q))return'recommend';
  if(/how am i doing|my level|my progress|how good|am i improving|progress/.test(q))return'progress';
  if(/why.*(wrong|mistake)|last mistake|explain my mistake|what did i do wrong/.test(q))return'mistake';
  if(/correct my|check my|my writing|feedback on my|analyze my/.test(q))return'feedback';
  if(/example|sentence with|show me a sentence/.test(q))return'example';
  if(/hint|clue|help me answer|give me a clue/.test(q))return'hint';
  if(/simpler|simple way|explain again|i don't understand|i dont understand|confused/.test(q))return'simplify';
  if(/difference|compare|versus| vs /.test(q))return'compare';
  if(/why do|why does|why is|why are|why use/.test(q))return'why';
  if(/what is|what are|how do|how does|when do|when should|rule/.test(q))return'explain';
  if(/nervous|afraid|scared|hard|difficult|frustrated|give up/.test(q))return'support';
  return'general';
}

function currentErrorForCoach(){
  return (romiState?.errors||[])[0]||null;
}

function coachProfileSummary(){
  const assessed=Object.entries(romiState.skills||{}).filter(([k,v])=>v.score!==null&&v.score!==undefined);
  if(!assessed.length)return'You have not completed enough tracked practice yet. Start with the adaptive diagnostic.';
  assessed.sort((a,b)=>b[1].score-a[1].score);
  const best=assessed[0], weak=[...assessed].sort((a,b)=>a[1].score-b[1].score)[0];
  return `Your strongest tracked skill is <b>${ROMI_SKILL_META[best[0]].label}</b> (${scoreToCEFR(best[1].score)} · ${masteryText(best[1].score)}). Your current priority is <b>${ROMI_SKILL_META[weak[0]].label}</b> (${scoreToCEFR(weak[1].score)} · ${masteryText(weak[1].score)}).`;
}

function coachPersonalizedRecommendation(){
  const weak=weakestSkill();
  if(!weak)return`Start with the adaptive diagnostic. It will help me estimate your starting point before I recommend practice.`;
  const s=romiState.skills[weak];
  const err=(romiState.errors||[]).find(e=>e.skill===weak);
  let answer=`Based on your saved progress, I recommend <b>${ROMI_SKILL_META[weak].label}</b> first. Your current tracked level there is <b>${scoreToCEFR(s.score)}</b> (${masteryText(s.score)}). ${recommendationForSkill(weak)}`;
  if(err)answer+=`<div class="coachFeedbackCard"><b>Why this is personal:</b> I have seen this pattern ${err.count||1} time(s): <span class="coachRule">${escapeStateText(err.mistake)}</span> → <b>${escapeStateText(err.correction||'review')}</b>.</div>`;
  return answer;
}

function coachExplainMistake(){
  const err=currentErrorForCoach();
  if(!err)return`I do not have a saved mistake to explain yet. Complete a grammar, writing, reading, vocabulary, or listening activity, and I will save useful correction patterns in your Error Bank.`;
  return `Your most important recent pattern is:<div class="coachFeedbackCard"><b>Your answer:</b> ${escapeStateText(err.mistake)}<br><b>Better form:</b> ${escapeStateText(err.correction||'Review the correct form')}<br><b>Why:</b> ${escapeStateText(err.reason||'This pattern needs review.')}<br><b>I have seen it:</b> ${err.count||1} time(s).</div>Try one new example using the corrected pattern before you move on.`;
}

function coachWritingFeedback(){
  const area=document.getElementById('writingText');
  const text=area?.value?.trim()||'';
  if(!text)return`Go to <b>Writing</b>, type or paste your paragraph, then ask me “Check my writing.” I can use the local correction rules and your Error Bank to give specific feedback.`;
  const result=makeCorrections(text);
  const words=text.split(/\s+/).filter(Boolean).length;
  const connectors=(text.match(/\b(and|but|because|then|after that|first|finally|however|also|although|so)\b/gi)||[]).length;
  let response=`I checked the writing currently in your Writing box. You wrote <b>${words} words</b> and used <b>${connectors} connector(s)</b>. `;
  if(!result.issues.length){
    response+=`I did not detect a major rule-based error. Your next challenge is to improve vocabulary range and add one more detail.`;
  }else{
    const top=result.issues.slice(0,3);
    response+=`I found ${result.issues.length} correction point(s). Focus on these first:`;
    response+=top.map((x,i)=>`<div class="coachFeedbackCard"><b>${i+1}. ${escapeStateText(x.mistake)}</b> → <b>${escapeStateText(x.correction)}</b><br>${escapeStateText(x.reason)}</div>`).join('');
    response+=`After correcting them, rewrite the paragraph once.`;
  }
  return response;
}

function coachHint(topic){
  const kb=ROMI_COACH_KB[topic];
  if(!kb)return`Look for the tense signal, identify the subject, and decide what form of the verb you need. Try the question once more before checking the answer.`;
  const hintMap={
    'simple present':'First find the subject. If it is he, she, or it, ask yourself whether the main verb needs -s or -es.',
    'simple past':'Look for a finished past-time signal such as yesterday or last week. In a positive sentence, use the past form; after did, use the base verb.',
    'present perfect':'Look for have/has. Then check that the next verb is a past participle.',
    'going to':'Check that you have the correct form of be before going to.',
    'future will':'After will, the verb stays in the base form.',
    'verb to be':'Match the subject first: I → am; he/she/it → is; you/we/they → are.',
    'reading':'Read the question first. Then scan only for the key information you need.',
    'listening':'Predict 3–5 words you might hear before you press Listen again.',
    'writing':'Check one thing at a time: capital letter → subject + verb → tense → punctuation.',
    'speaking':'Write only 3–5 key words, not a full script. Then speak around those ideas.'
  };
  return `<b>Hint:</b> ${hintMap[topic]||kb.rule} I will not give you the full answer yet—try once more.`;
}

function coachSupport(){
  const name=romiState.studentName&&romiState.studentName!=='Student'?romiState.studentName:'';
  const weak=weakestSkill();
  let msg=`${name?name+', ':''}do one small step, not the whole lesson at once. Read the example, try one item, and use the feedback.`;
  if(weak)msg+=` Right now, your priority is ${ROMI_SKILL_META[weak].label}, so it is normal if that part feels harder than your other skills.`;
  return msg;
}

function buildCoachAnswer(question){
  const q=coachNormalize(question);
  const intent=detectCoachIntent(question);
  let topic=detectCoachTopic(question);
  romiCoachSession.lastIntent=intent;
  if(topic)romiCoachSession.lastTopic=topic;

  if(intent==='greeting'){
    return `Hi ${romiState.studentName&&romiState.studentName!=='Student'?escapeStateText(romiState.studentName):'there'}! 👋 I’m ready. You can ask me about grammar, your mistakes, your level, what to study next, or ask for an example or hint.`;
  }

  if(intent==='recommend')return coachPersonalizedRecommendation();
  if(intent==='progress')return coachProfileSummary();
  if(intent==='mistake')return coachExplainMistake();
  if(intent==='feedback')return coachWritingFeedback();
  if(intent==='support')return coachSupport();

  // Dedicated comparisons
  if(q.includes('will')&&q.includes('going to'))topic='will vs going to';
  if(q.includes('present perfect')&&(q.includes('simple past')||q.includes('past simple')))topic='present perfect vs simple past';

  const kb=topic?ROMI_COACH_KB[topic]:null;

  if(intent==='hint')return coachHint(topic);

  if(intent==='example'){
    if(kb)return `<b>${escapeStateText(topic.charAt(0).toUpperCase()+topic.slice(1))} example:</b><span class="coachExample">${escapeStateText(kb.example)}</span><br>Now create one similar sentence of your own.`;
    return `Tell me the grammar point or skill you want an example for—for example: “Give me a simple past example.”`;
  }

  if(intent==='simplify'){
    if(kb)return `<b>Simple version:</b> ${escapeStateText(kb.simple)}<span class="coachExample">${escapeStateText(kb.example)}</span>`;
    const last=romiCoachSession.lastTopic;
    if(last&&ROMI_COACH_KB[last])return `<b>Simple version:</b> ${escapeStateText(ROMI_COACH_KB[last].simple)}<span class="coachExample">${escapeStateText(ROMI_COACH_KB[last].example)}</span>`;
    return `Tell me what part you want me to explain more simply. You can say: “Explain simple past more simply.”`;
  }

  if(intent==='why'||intent==='compare'||intent==='explain'){
    if(kb)return `<b>${escapeStateText(topic.charAt(0).toUpperCase()+topic.slice(1))}</b><br>${escapeStateText(kb.simple)}<br><span class="coachRule">Rule:</span> ${escapeStateText(kb.rule)}<span class="coachExample">${escapeStateText(kb.example)}</span>`;
  }

  // Specific form questions
  if(/\bwhy.*has\b|\bwhen.*has\b|\buse has\b/.test(q)){
    return `<b>Use <i>has</i> with he, she, and it in the present perfect.</b><br><span class="coachRule">Rule:</span> he/she/it + has + past participle.<span class="coachExample">She has finished her homework. He has visited Cuenca.</span>Use <i>have</i> with I, you, we, and they.`;
  }
  if(/why.*(do|does)|difference.*do.*does/.test(q)){
    return `<b>Do vs does:</b> use <i>does</i> with he, she, and it; use <i>do</i> with I, you, we, and they.<span class="coachExample">Do they play soccer? / Does she play soccer?</span>After do/does, keep the main verb in the base form.`;
  }
  if(/why.*did.*went|did went|did.*go/.test(q)){
    return `<b>After <i>did</i>, use the base verb.</b> “Did went” is incorrect because <i>did</i> already carries the past meaning.<span class="coachExample">Incorrect: Did you went? → Correct: Did you go?</span>`;
  }

  // Use current context if no explicit topic
  const current=romiState.lastSkill;
  if(current&&ROMI_COACH_KB[current]){
    const c=ROMI_COACH_KB[current];
    return `I think you are asking while working on <b>${ROMI_SKILL_META[current]?.label||current}</b>. ${escapeStateText(c.simple)}<br><span class="coachRule">Key rule:</span> ${escapeStateText(c.rule)}<br><br>If you want something more specific, ask “Why…?”, “Give me an example”, or “Give me a hint”.`;
  }

  return `I can help with this if you make the question a little more specific. Try asking about <b>verb to be, simple present, simple past, will, going to, present perfect, reading, listening, speaking, vocabulary, or writing</b>. You can also ask “What should I work on?” or “Why is my last mistake wrong?”`;
}

function appendCoachChat(role,html,save=true){
  const win=document.getElementById('coachChatWindow');if(!win)return;
  const msg=document.createElement('div');
  msg.className='chatMsg '+role;
  const avatar=role==='user'?'You':'R';
  msg.innerHTML=`<div class="chatAvatar">${avatar}</div><div class="chatBubble">${html}<span class="chatTime">${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span></div>`;
  win.appendChild(msg);win.scrollTop=win.scrollHeight;
  if(save){
    romiState.coachChat=Array.isArray(romiState.coachChat)?romiState.coachChat:[];
    romiState.coachChat.push({role,html,time:new Date().toISOString()});
    romiState.coachChat=romiState.coachChat.slice(-24);
    saveRomiState();
  }
}

function showCoachTyping(){
  const win=document.getElementById('coachChatWindow');if(!win)return null;
  const d=document.createElement('div');d.className='chatMsg romi';d.id='coachTypingMsg';
  d.innerHTML=`<div class="chatAvatar">R</div><div class="chatBubble"><span class="coachTyping"><i></i><i></i><i></i></span></div>`;
  win.appendChild(d);win.scrollTop=win.scrollHeight;return d;
}

const ROMI_AI_ENDPOINT='https://romi-api2.vercel.app/api/romi';

function stripCoachHtml(value){
  const d=document.createElement('div');
  d.innerHTML=String(value||'');
  return (d.textContent||d.innerText||'').trim();
}

function formatCoachAIText(value){
  let safe=escapeStateText(String(value||''));
  safe=safe.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
  safe=safe.replace(/\n{2,}/g,'<br><br>').replace(/\n/g,'<br>');
  return safe;
}

function coachAPIProfile(){
  const levelFor=(skill)=>{
    const score=romiState?.skills?.[skill]?.score;
    return scoreToCEFR(score);
  };
  return {
    name: romiState.studentName || 'Student',
    overallLevel: overallCEFR(),
    grammar: levelFor('grammar'),
    reading: levelFor('reading'),
    listening: levelFor('listening'),
    speaking: levelFor('speaking'),
    writing: levelFor('writing'),
    vocabulary: levelFor('vocabulary'),
    currentSkill: romiState.lastSkill || 'General English',
    currentTopic: romiCoachSession.lastTopic || romiState.lastSkill || 'General English',
    errors: (romiState.errors||[]).slice(0,6).map(e=>({
      skill:e.skill,
      mistake:e.mistake,
      correction:e.correction,
      reason:e.reason,
      count:e.count||1
    }))
  };
}

function coachAPIConversation(){
  return (romiState.coachChat||[])
    .slice(-6)
    .map(m=>({
      role:m.role==='user'?'user':'assistant',
      content:stripCoachHtml(m.html)
    }))
    .filter(m=>m.content);
}

function setCoachAIStatus(text,mode='ready'){
  const el=document.getElementById('coachAIStatus');
  if(!el)return;
  const labels={
    ready:'AI Coach Ready',
    thinking:'Romi is thinking…',
    connected:'AI Coach Connected',
    fallback:'Local Backup Active'
  };
  el.innerHTML=`<span class="statusDot"></span> ${labels[mode]||text||'AI Coach Ready'}`;
}

async function askRomiAI(question){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),20000);
  try{
    const response=await fetch(ROMI_AI_ENDPOINT,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        question,
        profile:coachAPIProfile(),
        conversation:coachAPIConversation()
      }),
      signal:controller.signal
    });

    let data={};
    try{data=await response.json()}catch(e){}

    if(!response.ok){
      const message=data?.details?.error?.message || data?.error || `HTTP ${response.status}`;
      throw new Error(message);
    }

    if(!data.answer)throw new Error('The AI service returned an empty answer.');
    return data.answer;
  }finally{
    clearTimeout(timeout);
  }
}

async function sendCoachQuestion(questionOverride){
  const input=document.getElementById('coachQuestionInput');
  const q=String(questionOverride??input?.value??'').trim();
  if(!q)return;

  appendCoachChat('user',escapeStateText(q));
  if(input)input.value='';

  const typing=showCoachTyping();
  setCoachAIStatus('', 'thinking');

  try{
    const aiAnswer=await askRomiAI(q);
    typing?.remove();

    const formatted=formatCoachAIText(aiAnswer);
    romiCoachSession.lastAnswer=formatted;
    appendCoachChat('romi',formatted);
    setCoachAIStatus('', 'connected');
  }catch(error){
    console.warn('ROMI AI unavailable. Using local coach.',error);
    typing?.remove();

    const localAnswer=buildCoachAnswer(q);
    romiCoachSession.lastAnswer=localAnswer;
    appendCoachChat(
      'romi',
      `${localAnswer}<div class="coachFeedbackCard"><b>Connection note:</b> I used my local backup because the AI service could not be reached.</div>`
    );
    setCoachAIStatus('', 'fallback');
  }

  updateCoachPlusInsights();
}

function askRomiPreset(q){
  location.hash='coach';
  setTimeout(()=>sendCoachQuestion(q),120);
}

function coachInputKey(e){
  if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendCoachQuestion()}
}

function askFromDock(){
  const input=document.getElementById('coachDockInput');
  const q=input?.value?.trim();if(!q)return;
  if(input)input.value='';
  location.hash='coach';
  setTimeout(()=>sendCoachQuestion(q),120);
}

function clearCoachChat(){
  romiState.coachChat=[];saveRomiState();
  const win=document.getElementById('coachChatWindow');if(win)win.innerHTML='';
  seedCoachConversation();
}

function seedCoachConversation(){
  const win=document.getElementById('coachChatWindow');if(!win)return;
  if(Array.isArray(romiState.coachChat)&&romiState.coachChat.length){
    romiState.coachChat.forEach(m=>appendCoachChat(m.role,m.html,false));
    return;
  }
  const name=romiState.studentName&&romiState.studentName!=='Student'?escapeStateText(romiState.studentName):'there';
  appendCoachChat('romi',`Hi ${name}! 👋 I’m Romi Live Coach+. I’m connected to the ROMI AI service, so you can ask me open-ended questions about English, your mistakes, your progress, or what you should practice next.`,true);
}

function updateCoachPlusInsights(){
  const n=document.getElementById('coachStudentName');if(n)n.textContent=romiState.studentName||'Student';
  const weak=weakestSkill();
  const priority=document.getElementById('coachPriority');
  if(priority)priority.innerHTML=weak?`${ROMI_SKILL_META[weak].icon} <b>${ROMI_SKILL_META[weak].label}</b> · ${scoreToCEFR(romiState.skills[weak].score)} · ${masteryText(romiState.skills[weak].score)}`:'Complete the diagnostic first.';
  const pattern=document.getElementById('coachRecentPattern');
  const err=currentErrorForCoach();
  if(pattern)pattern.innerHTML=err?`${escapeStateText(err.mistake)} → <b>${escapeStateText(err.correction||'review')}</b> · seen ${err.count||1}×`:'No repeated error yet.';
  const context=document.getElementById('coachCurrentContext');
  const s=romiState.lastSkill||'diagnostic';
  if(context)context.textContent=ROMI_SKILL_META[s]?.label||s.charAt(0).toUpperCase()+s.slice(1);
}

function coachMoodPlus(mood){
  const q={
    confused:'I am confused. Can you explain what I should do next in a simple way?',
    nervous:'I feel nervous about English.',
    ready:'I am ready. What challenge should I do next?',
    proud:'I did well. What should I do now?'
  }[mood];
  sendCoachQuestion(q);
}

function readLastCoachAnswer(){
  if(!('speechSynthesis' in window)){alert('Text-to-speech is not available in this browser.');return}
  const tmp=document.createElement('div');tmp.innerHTML=romiCoachSession.lastAnswer||'Ask Romi a question first.';
  const utter=new SpeechSynthesisUtterance(tmp.textContent);
  utter.lang='en-US';utter.rate=.92;
  speechSynthesis.cancel();speechSynthesis.speak(utter);
}

function startCoachVoiceInput(){
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Recognition){alert('Speech recognition is not available in this browser. You can type your question instead.');return}
  const r=new Recognition();r.lang='en-US';r.interimResults=false;r.maxAlternatives=1;
  const btn=document.getElementById('coachMicBtn');if(btn)btn.textContent='🎙️ Listening...';
  r.onresult=e=>{
    const text=e.results[0][0].transcript;
    const input=document.getElementById('coachQuestionInput');if(input)input.value=text;
    sendCoachQuestion(text);
  };
  r.onerror=()=>{if(btn)btn.textContent='🎤 Speak'};
  r.onend=()=>{if(btn)btn.textContent='🎤 Speak'};
  r.start();
}

/* Extend VNext render and context tracking for coach personalization */
const _coachPlusRenderVNext=renderVNext;
renderVNext=function(){
  _coachPlusRenderVNext();
  updateCoachPlusInsights();
};

const _coachPlusSetCoachMessage=setCoachMessage;
setCoachMessage=function(skill='diagnostic',status='neutral',detail=''){
  romiCoachSession.currentSkill=skill;
  romiState.lastSkill=skill;
  _coachPlusSetCoachMessage(skill,status,detail);
  updateCoachPlusInsights();
};

function initCoachPlus(){
  romiState.coachChat=Array.isArray(romiState.coachChat)?romiState.coachChat:[];
  seedCoachConversation();
  updateCoachPlusInsights();
}
window.addEventListener('load',()=>setTimeout(initCoachPlus,80));

/* Render common Markdown from Groq into clean student-friendly HTML */
function mdInlineRomi(text){
  let s=escapeStateText(String(text||''));
  s=s.replace(/`([^`]+)`/g,'<span class="romiMdCode">$1</span>');
  s=s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  s=s.replace(/\*([^*]+)\*/g,'<em>$1</em>');
  return s;
}

function isMdTableSeparator(line){
  const cleaned=String(line||'').trim();
  return cleaned.includes('|') && /^[\s|:\-]+$/.test(cleaned);
}

function tableCells(line){
  return String(line||'').trim().replace(/^\|/,'').replace(/\|$/,'').split('|').map(x=>x.trim());
}

formatCoachAIText=function(value){
  const lines=String(value||'').replace(/\r/g,'').split('\n');
  let out='',i=0,listType=null;

  const closeList=()=>{
    if(listType){out+=listType==='ul'?'</ul>':'</ol>';listType=null}
  };

  while(i<lines.length){
    const raw=lines[i];
    const line=raw.trim();

    if(!line){closeList();i++;continue}

    // Markdown table
    if(line.includes('|') && i+1<lines.length && isMdTableSeparator(lines[i+1])){
      closeList();
      const headers=tableCells(line);
      i+=2;
      const rows=[];
      while(i<lines.length && lines[i].trim().includes('|') && lines[i].trim()){
        rows.push(tableCells(lines[i]));
        i++;
      }
      out+='<div class="romiMdTableWrap"><table class="romiMdTable"><thead><tr>'+
        headers.map(h=>'<th>'+mdInlineRomi(h)+'</th>').join('')+
        '</tr></thead><tbody>'+
        rows.map(r=>'<tr>'+r.map(c=>'<td>'+mdInlineRomi(c)+'</td>').join('')+'</tr>').join('')+
        '</tbody></table></div>';
      continue;
    }

    const heading=line.match(/^#{1,5}\s+(.+)/);
    if(heading){
      closeList();
      out+='<div class="romiMdHeading">'+mdInlineRomi(heading[1])+'</div>';
      i++;continue;
    }

    const bullet=line.match(/^[-•]\s+(.+)/);
    if(bullet){
      if(listType!=='ul'){closeList();out+='<ul class="romiMdList">';listType='ul'}
      out+='<li>'+mdInlineRomi(bullet[1])+'</li>';
      i++;continue;
    }

    const numbered=line.match(/^\d+[.)]\s+(.+)/);
    if(numbered){
      if(listType!=='ol'){closeList();out+='<ol class="romiMdList">';listType='ol'}
      out+='<li>'+mdInlineRomi(numbered[1])+'</li>';
      i++;continue;
    }

    closeList();
    const looksRule=/^(rule|structure|remember|why|tip|example|common mistake|your turn)\s*:/i.test(line);
    out+=(looksRule?'<div class="romiMdRule">':'<div class="romiMdP">')+mdInlineRomi(line)+'</div>';
    i++;
  }
  closeList();
  return out;
};
