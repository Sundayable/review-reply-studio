import test from 'node:test';
import assert from 'node:assert/strict';
import {buildDrafts,analyzeReview,validateInput} from '../src/engine.js';
const base={business:'Oak Studio',review:'The team was kind, but I waited longer than expected.',rating:3,language:'en',tone:'warm',topic:'auto',contact:'',privateMode:false};
test('a mixed review acknowledges a wait without inventing remediation',()=>{
 const r=buildDrafts(base);assert.equal(r.topic,'wait');assert.match(r.drafts[0],/wait affected/);assert.doesNotMatch(r.drafts.join(' '),/refund|discount|fixed|trained|promise/i);
});
test('a high rating with a concern gets a neutral reply and a note',()=>{const r=buildDrafts({...base,rating:5});assert.equal(r.hasConcern,true);assert.ok(r.notes.some(x=>x.includes('rating is high')));assert.doesNotMatch(r.drafts[0],/glad/)});
test('review text cannot inject HTML or reproduce a private email or phone',()=>{const secret='<img src=x onerror=alert(1)> My email is customer@example.com and phone 604-555-1234';const r=buildDrafts({...base,review:secret});assert.equal(r.privateMode,true);assert.doesNotMatch(r.drafts.join(''),/customer@example|604|<img/)});
test('sensitive business review does not confirm a relationship',()=>{const r=buildDrafts({...base,rating:5,review:'My medical treatment was excellent'});assert.equal(r.privateMode,true);assert.doesNotMatch(r.drafts.join(''),/your treatment|your visit|our patient|glad/i)});
test('Korean drafts support a professional style',()=>{const r=buildDrafts({...base,review:'직원은 친절했지만 기다리는 시간이 길었어요',language:'ko',tone:'professional'});assert.equal(r.topic,'wait');assert.match(r.drafts[0],/감사합니다|죄송합니다/);assert.doesNotMatch(r.drafts[0],/refund|sorry|thank/i)});
test('empty review and invalid rating are rejected',()=>{assert.ok(validateInput({...base,review:' ',rating:8}).length>=2);assert.equal(buildDrafts({...base,review:''}).drafts.length,0)});
test('unsupported selectors and unsafe contact URL are rejected',()=>{for(const change of [{language:'xx'},{tone:'invent'},{topic:'unknown'},{contact:'javascript:alert(1)'}])assert.ok(buildDrafts({...base,...change}).errors.length)});
test('positive review does not infer sentiment about a detected topic',()=>{const r=buildDrafts({...base,rating:5,review:'I booked an appointment and the result was good.'});assert.doesNotMatch(r.drafts[0],/booking was straightforward/);assert.match(r.drafts[0],/positive experience/)});
test('only a supplied public business contact is added',()=>{const r=buildDrafts({...base,contact:'hello@example.com'});assert.match(r.drafts[0],/hello@example\.com/);assert.equal(r.drafts.length,2)});
test('manual topic overrides a suggestion, private mode always wins',()=>{assert.equal(buildDrafts({...base,topic:'quality'}).topic,'quality');assert.equal(buildDrafts({...base,privateMode:true}).privateMode,true)});
test('multilingual review is recognized and missing topics fall back safely',()=>{assert.equal(analyzeReview('정말 좋아요').hasKorean,true);assert.equal(analyzeReview('Great!').suggestedTopic,'general')});
