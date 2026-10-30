import { test } from 'node:test';
import assert from 'node:assert/strict';
import { courseUrl } from '../src/lib/courseUrl.ts';

test('forwards seven normalized tags without changing the destination', () => {
 const tags = {utm_source:'observe',utm_medium:'owned',utm_campaign:'card',utm_content:'<sample>&+',utm_term:'a b',a2_ref:'sheet',experiment_id:'one'};
 const input = new URLSearchParams(Object.fromEntries(Object.entries(tags).map(([k,v])=>[k,` ${v} `])));
 const url = new URL(courseUrl(`?${input}`));
 assert.equal(url.origin+url.pathname,'https://audiencetwo.com/second-audience');
 assert.deepEqual(Object.fromEntries(url.searchParams),tags);
});
test('direct visits remain unattributed',()=>assert.equal(courseUrl(''),'https://audiencetwo.com/second-audience'));
test('omits blank oversized repeated and arbitrary keys',()=>{
 const url = new URL(courseUrl('?utm_source=%20&utm_medium='+ 'x'.repeat(257)+'&a2_ref=a&a2_ref=b&email=private&redirect=https://bad.test&experiment_id=valid'));
 assert.deepEqual(Object.fromEntries(url.searchParams),{experiment_id:'valid'});
});
test('accepts exactly 256 characters',()=>assert.equal(new URL(courseUrl('?utm_term='+ 'x'.repeat(256))).searchParams.get('utm_term')?.length,256));
