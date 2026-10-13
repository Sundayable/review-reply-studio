import {buildDrafts} from './engine.js';
const byId=id=>document.getElementById(id);
const form=byId('draft-form'), review=byId('review'), results=byId('results'), status=byId('status');
const draftFields=[byId('draft-one'),byId('draft-two')];
let generated=false, exampleIndex=0;
const examples=[
 {business:'Oak Studio',review:'The team was kind, but I waited longer than expected for my appointment.',rating:3,language:'en'},
 {business:'Oak Studio',review:'Friendly team and a really good experience. Thank you for taking the time to explain everything.',rating:5,language:'en'},
 {business:'Oak Studio',review:'직원분들은 친절했지만 예약 시간보다 오래 기다려서 아쉬웠어요.',rating:3,language:'ko'}
];
const updateCounts=()=>{byId('review-count').textContent=`${review.value.length.toLocaleString()} / 5,000`;for(const field of draftFields)byId(`${field.id}-count`).textContent=`${field.value.length} characters`;};
const say=text=>{status.textContent=text;};
function readInput(){const f=new FormData(form);return {business:f.get('business'),review:f.get('review'),rating:f.get('rating'),language:f.get('language'),tone:f.get('tone'),topic:f.get('topic'),contact:f.get('contact'),privateMode:f.has('privateMode')};}
form.addEventListener('input',()=>{updateCounts();if(generated)byId('stale-note').hidden=false;});
form.addEventListener('change',()=>{if(generated)byId('stale-note').hidden=false;});
byId('example').addEventListener('click',()=>{const ex=examples[exampleIndex++%examples.length];byId('business').value=ex.business;review.value=ex.review;byId('language').value=ex.language;form.querySelector(`input[name="rating"][value="${ex.rating}"]`).checked=true;byId('topic').value='auto';byId('tone').value='warm';byId('contact').value='';byId('private-mode').checked=false;byId('form-error').hidden=true;updateCounts();if(generated)byId('stale-note').hidden=false;say('Example loaded. Create drafts when you’re ready.');});
form.addEventListener('submit',event=>{event.preventDefault();const input=readInput(), r=buildDrafts(input), error=byId('form-error');if(r.errors.length){error.hidden=false;error.textContent=r.errors.join(' ');if(!review.value.trim())review.focus();say('Please check the review settings.');return;}error.hidden=true;byId('empty-state').hidden=true;results.hidden=false;byId('stale-note').hidden=true;generated=true;const notes=byId('draft-notes');notes.replaceChildren();for(const text of r.notes){const p=document.createElement('p');p.textContent=text;notes.append(p);}draftFields.forEach((field,i)=>{field.value=r.drafts[i];field.lang=input.language;});updateCounts();say('Two drafts are ready. Edit them before posting.');if(window.matchMedia('(max-width: 800px)').matches)byId('output-title').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});
draftFields.forEach(field=>field.addEventListener('input',()=>{updateCounts();say('Your edit stays in this browser tab.');}));
document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{const field=byId(button.dataset.copy);try{await navigator.clipboard.writeText(field.value);say('Reply copied. Review it once more before posting.');const old=button.textContent;button.textContent='Copied';setTimeout(()=>{button.textContent=old;},1700);}catch{field.focus();field.select();say('The browser blocked automatic copying. Your reply is selected; press ⌘C or Ctrl+C.');}}));
byId('download').addEventListener('click',()=>{const text=`Review Reply Studio\n\nDraft 1\n${draftFields[0].value}\n\nDraft 2\n${draftFields[1].value}\n\nCheck the facts and remove private details before posting.\n`;const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='review-reply-drafts.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);say('Drafts downloaded to your device.');});
byId('clear').addEventListener('click',()=>{form.reset();draftFields.forEach(field=>field.value='');generated=false;results.hidden=true;byId('empty-state').hidden=false;byId('form-error').hidden=true;byId('draft-notes').replaceChildren();updateCounts();say('Workspace cleared. Nothing was saved by this app.');review.focus();});
updateCounts();
