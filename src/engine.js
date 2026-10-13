/** Pure, deterministic drafting logic. No network, LLM, or persistence. */
const TOPICS = ['general', 'wait', 'communication', 'service', 'quality', 'pricing', 'booking'];
export const topicLabels = {
  en: { general:'Overall experience', wait:'Wait time', communication:'Communication', service:'Customer service', quality:'Quality of work', pricing:'Pricing', booking:'Booking process' },
  ko: { general:'전반적인 경험', wait:'대기 시간', communication:'소통', service:'고객 응대', quality:'작업 품질', pricing:'가격', booking:'예약 과정' }
};
const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

export function analyzeReview(review) {
  const text = clean(review, 5000);
  const topics = [
    ['wait', /\b(wait(?:ed|ing|s)?|late|delay(?:ed)?)\b|대기|기다|늦|지연/i],
    ['communication', /\b(communication|explain(?:ed)?|repl(?:y|ied)|response|respond)\b|설명|소통|답변|연락/i],
    ['booking', /\b(book(?:ing|ed)?|appointment|schedul(?:e|ed|ing))\b|예약|일정/i],
    ['pricing', /\b(pric(?:e|es|ing)|cost|expensive|charge(?:d)?|fee)\b|가격|비용|비싸|요금/i],
    ['quality', /\b(quality|result(?:s)?|workmanship|repair)\b|품질|결과|완성|수리/i],
    ['service', /\b(staff|team|friendly|rude|helpful|service)\b|직원|친절|응대|서비스/i]
  ].filter(([,pattern]) => pattern.test(text)).map(([topic])=>topic);
  const possibleConcern = /\b(but|however|disappoint(?:ed|ing)?|terrible|rude|unhappy|poor|awful|never again|too long|not happy)\b|하지만|그런데|아쉽|불편|실망|불친절|별로/i.test(text);
  const sensitive = /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|(?:\+?\d[\d ()-]{7,}\d)|\b(patient|diagnos(?:is|ed)|medical|treatment|visa|immigration|legal|lawsuit)\b|진료|환자|진단|치료|비자|이민|소송|개인정보/i.test(text);
  const wrongLanguage = /[가-힣]/.test(text);
  return {topics, suggestedTopic:topics[0] || 'general', possibleConcern, sensitive, hasKorean:wrongLanguage};
}

export function validateInput(input) {
  const review = clean(input.review, 5000);
  const rating = Number(input.rating);
  const errors=[];
  if (!review) errors.push('Add a review to work from.');
  if (!Number.isInteger(rating) || rating<1 || rating>5) errors.push('Choose a rating from 1 to 5.');
  if (!['en','ko'].includes(input.language)) errors.push('Choose English or Korean.');
  if (!['warm','professional','brief'].includes(input.tone)) errors.push('Choose a response style.');
  if (!['auto',...TOPICS].includes(input.topic)) errors.push('Choose a supported topic.');
  const contact=clean(input.contact,120);
  if (contact && !/^(?:[^\s@]+@[^\s@]+\.[^\s@]+|https:\/\/[^\s]+)$/i.test(contact)) errors.push('Use a public business email or an https:// contact URL.');
  return errors;
}

export function buildDrafts(input) {
  const errors=validateInput(input);
  if(errors.length) return {errors,drafts:[],notes:[]};
  const review=clean(input.review,5000), business=clean(input.business,80), contact=clean(input.contact,120);
  const rating=Number(input.rating), lang=input.language, tone=input.tone, a=analyzeReview(review);
  const topic=input.topic==='auto'?a.suggestedTopic:input.topic;
  const hasConcern = rating<=3 || a.possibleConcern;
  const privateMode=Boolean(input.privateMode);
  const notes=[];
  if (rating>=4 && a.possibleConcern) notes.push(lang==='ko'?'평점은 높지만 불편 사항이 보여 중립적으로 답변했어요.':'The rating is high, but the review may include a concern. The draft uses a neutral response.');
  if (a.sensitive || privateMode) notes.push(lang==='ko'?'민감한 내용이 있을 수 있어요. 방문 여부, 개인 정보, 사건이나 진료 내용을 확인해 주지 마세요.':'Keep sensitive details private. Do not confirm a customer relationship, visit, case, or treatment.');
  if (input.topic==='auto' && topic!=='general') notes.push(lang==='ko'?`감지된 주제: ${topicLabels.ko[topic]}. 맞는지 확인해 주세요.`:`Suggested topic: ${topicLabels.en[topic]}. Check it matches the review.`);
  const concernEN={general:'I’m sorry to hear the experience fell short.',wait:'I’m sorry the wait affected your experience.',communication:'I’m sorry the communication fell short.',service:'I’m sorry the service fell short of your expectations.',quality:'I’m sorry the quality of the work did not meet your expectations.',pricing:'Thank you for raising your concerns about pricing.',booking:'I’m sorry the booking process was frustrating.'};
  const positiveEN={general:'We’re glad you had a positive experience.',wait:'We’re glad the timing worked well for you.',communication:'We’re glad the communication was helpful.',service:'It’s good to hear the team made a positive impression.',quality:'We’re glad you were happy with the work.',pricing:'We appreciate you sharing your thoughts on value.',booking:'We’re glad booking was straightforward.'};
  const concernKO={general:'기대하신 경험을 드리지 못해 아쉽고 죄송해요.',wait:'기다리시는 동안 불편을 겪으셨다니 죄송해요.',communication:'소통 과정에서 불편을 겪으셨다니 죄송해요.',service:'응대가 기대에 미치지 못했다니 죄송해요.',quality:'결과가 기대에 미치지 못했다니 죄송해요.',pricing:'가격에 대한 의견 남겨주셔서 감사해요.',booking:'예약 과정에서 불편을 겪으셨다니 죄송해요.'};
  const positiveKO={general:'좋은 경험이었다니 기뻐요.',wait:'대기 시간에 만족하셨다니 다행이에요.',communication:'안내가 도움이 되었다니 기뻐요.',service:'직원 응대가 좋은 기억으로 남았다니 기뻐요.',quality:'결과에 만족하셨다니 기뻐요.',pricing:'가격에 대한 의견 감사해요.',booking:'예약이 수월하셨다니 다행이에요.'};
  // Topic detection does not infer satisfaction with a specific detail. Positive
  // reviews therefore acknowledge the whole experience, not an inferred topic.
  let body, alternative;
  if(lang==='en') {
    const thanks=tone==='professional'?'Thank you for taking the time to share your feedback.':tone==='brief'?'Thank you for the feedback.':'Thanks for taking the time to leave a review.';
    const follow=contact?`Please contact us at ${contact} so we can understand more.`:'Please reach out to our team so we can understand more.';
    if(privateMode || a.sensitive) {
      body=`${thanks} We take feedback seriously. To protect everyone’s privacy, we don’t discuss personal details here. ${contact?`You can reach our team at ${contact}.`:'Please contact our team directly if you’d like to discuss a concern.'}`;
      alternative=`Thank you for sharing your perspective. We welcome feedback through our private contact channels. ${contact?`Please reach out at ${contact}.`:'Our team is available to listen directly.'}`;
    } else if(hasConcern) {
      body=`${thanks} ${concernEN[topic]} ${follow}`;
      alternative=`Thank you for letting us know. We’d appreciate the chance to understand your concerns about ${topic==='general'?'the experience':topicLabels.en[topic].toLowerCase()}. ${contact?`Please get in touch at ${contact}.`:'Please get in touch with our team directly.'}`;
    } else {
      body=`${thanks} ${positiveEN.general}${tone==='brief'?'':' Your feedback means a lot to our team.'}`;
      alternative='Thank you for sharing this. We appreciate your kind words and the time you took to write them.';
    }
  } else {
    const thanks=tone==='professional'?'시간 내어 의견 남겨주셔서 감사합니다.':tone==='brief'?'의견 남겨주셔서 감사해요.':'시간 내어 리뷰 남겨주셔서 감사해요.';
    const follow=contact?`자세한 이야기를 들을 수 있도록 ${contact}(으)로 연락 부탁드려요.`:'자세한 이야기를 들을 수 있도록 저희 팀에 직접 연락 부탁드려요.';
    if(privateMode || a.sensitive) {
      body=`${thanks} 개인정보 보호를 위해 공개된 공간에서는 개별 내용을 말씀드리기 어려워요. ${follow}`;
      alternative=`의견 남겨주셔서 감사해요. 개별적인 이야기는 비공개 채널에서 듣고 싶어요. ${contact?`${contact}(으)로 연락 부탁드려요.`:'저희 팀에 직접 연락 부탁드려요.'}`;
    } else if(hasConcern) {
      body=`${thanks} ${concernKO[topic]} ${follow}`;
      alternative=`의견 남겨주셔서 감사해요. ${topic==='general'?'어떤 점이 아쉬우셨는지':topicLabels.ko[topic]+'에 대해'} 자세히 듣고 싶어요. ${follow}`;
    } else {
      body=`${thanks} ${positiveKO.general}${tone==='brief'?'':' 남겨주신 말씀이 저희 팀에 큰 힘이 돼요.'}`;
      alternative='좋은 말씀 남겨주셔서 감사해요. 시간 내어 경험을 나눠주셔서 기뻐요.';
    }
    if(tone==='professional') {
      const formal=s=>s.replaceAll('감사해요.','감사합니다.').replaceAll('죄송해요.','죄송합니다.').replaceAll('기뻐요.','기쁩니다.').replaceAll('다행이에요.','다행입니다.').replaceAll('싶어요.','싶습니다.').replaceAll('부탁드려요.','부탁드립니다.').replaceAll('어려워요.','어렵습니다.').replaceAll('돼요.','됩니다.');
      body=formal(body); alternative=formal(alternative);
    }
  }
  const sign=business?`\n\n${business}`:'';
  return {errors:[],drafts:[body+sign,alternative+sign],notes,topic,hasConcern,privateMode:privateMode||a.sensitive};
}
