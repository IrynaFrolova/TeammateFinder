export const DICT = {
  games: ['Valorant','CS2','Dota2','LoL','Fortnite','WoW','Chess','BoardGames','Hiking','Photography','Drawing'],
  levels: ['Beginner','Intermediate','Pro'],
  langs: ['EN','DE','RU'],
  platforms: ['PC','PS5','Xbox','Switch','Mobile'],
  times: ['Mornings','Evenings','Weekends'],
  quickTags: ['EU','NA','Asia','DuoQ','Stack','Casual','Ranked','Voice','NoVoice','Coach','Beginner','Pro']
};

export const initialPosts = [
  {id:'p1', title:'VALORANT duo – EU evenings', game:'Valorant', level:'Intermediate', lang:'EN', platform:'PC', time:'Evenings', tags:['EU','DuoQ','Ranked','Voice'], desc:'Gold/Plat flex, looking for calm duo. Prefer Sentinel/Controller. Discord voice a must.', author:{name:'Ava', avatar:''}, createdAt: new Date(Date.now()-1000*60*60*4).toISOString()},
  {id:'p2', title:'Chess rapid 10+0 buddy', game:'Chess', level:'Beginner', lang:'DE', platform:'Mobile', time:'Weekends', tags:['EU','Casual'], desc:'Learning openings, want friendly rapid sessions and study. Lichess.', author:{name:'Ben'}, createdAt: new Date(Date.now()-1000*60*60*26).toISOString()},
  {id:'p3', title:'CS2 stack 3/5 – Mirage nuke', game:'CS2', level:'Pro', lang:'EN', platform:'PC', time:'Evenings', tags:['EU','Stack','Ranked','Voice'], desc:'Faceit 5k+, need anchor + IGL backup. Schedule 19:00–22:00 CET.', author:{name:'Nova'}, createdAt: new Date(Date.now()-1000*60*60*1).toISOString()},
  {id:'p4', title:'Hiking group Berlin – Sunday', game:'Hiking', level:'Intermediate', lang:'EN', platform:'Mobile', time:'Weekends', tags:['EU','Casual'], desc:'Spreewald trail 12km. Friendly pace, bring water. Meeting at Hbf.', author:{name:'Marta'}, createdAt: new Date(Date.now()-1000*60*60*72).toISOString()},
  {id:'p5', title:'Dota2 offlane duo', game:'Dota2', level:'Intermediate', lang:'RU', platform:'PC', time:'Mornings', tags:['EU','DuoQ','Ranked','NoVoice'], desc:'I play pos3. Prefer calm gameplay, ping me in TG.', author:{name:'Ilya'}, createdAt: new Date(Date.now()-1000*60*60*12).toISOString()},
  {id:'p6', title:'Photography walk – golden hour', game:'Photography', level:'Beginner', lang:'EN', platform:'Mobile', time:'Evenings', tags:['EU','Casual'], desc:'Sony a6000, practice portraits in Kreuzberg. Beginners welcome.', author:{name:'Lena'}, createdAt: new Date(Date.now()-1000*60*30).toISOString()},
];
