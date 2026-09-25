"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ElementType = "scene" | "action" | "character" | "dialogue" | "parenthetical" | "transition" | "shot";
type Block = { id:number; type:ElementType; text:string };
type Scene = { id:number; heading:string; body?:string; blocks?:Block[] };
type Language={code:string;name:string;native:string;font:string};
type Project = { title:string; genre:string; logline:string; language:string; scenes:Scene[] };

const languages:Language[]=[{code:"en",name:"English",native:"English",font:"Courier New"},{code:"hi",name:"Hindi",native:"हिन्दी",font:"Noto Sans Devanagari"},{code:"kn",name:"Kannada",native:"ಕನ್ನಡ",font:"Noto Sans Kannada"},{code:"ta",name:"Tamil",native:"தமிழ்",font:"Noto Sans Tamil"},{code:"te",name:"Telugu",native:"తెలుగు",font:"Noto Sans Telugu"},{code:"ml",name:"Malayalam",native:"മലയാളം",font:"Noto Sans Malayalam"},{code:"bn",name:"Bengali",native:"বাংলা",font:"Noto Sans Bengali"},{code:"mr",name:"Marathi",native:"मराठी",font:"Noto Sans Devanagari"},{code:"gu",name:"Gujarati",native:"ગુજરાતી",font:"Noto Sans Gujarati"},{code:"pa",name:"Punjabi",native:"ਪੰਜਾਬੀ",font:"Noto Sans Gurmukhi"},{code:"or",name:"Odia",native:"ଓଡ଼ିଆ",font:"Noto Sans Oriya"},{code:"as",name:"Assamese",native:"অসমীয়া",font:"Noto Sans Bengali"},{code:"ur",name:"Urdu",native:"اردو",font:"Noto Nastaliq Urdu"}];
const starter:Project={title:"Untitled Film",genre:"Feature",logline:"",language:"en",scenes:[{id:1,heading:"INT. APARTMENT — NIGHT",blocks:[
{id:1,type:"scene",text:"INT. APARTMENT — NIGHT"},{id:2,type:"action",text:"A quiet room. The city hums beyond the window."},
{id:3,type:"action",text:"ARJUN, 28, sits alone at the table. He looks at his phone."},{id:4,type:"character",text:"ARJUN"},{id:5,type:"dialogue",text:"We have to talk."}]}]};

const labels:Record<ElementType,string>={scene:"SCENE HEADING",action:"ACTION",character:"CHARACTER",dialogue:"DIALOGUE",parenthetical:"PARENTHETICAL",transition:"TRANSITION",shot:"SHOT"};
const shortcutTypes:Record<string,ElementType>={"1":"scene","2":"action","3":"character","4":"dialogue","5":"parenthetical","6":"transition","7":"shot"};

function nextType(t:ElementType):ElementType{return t==="scene"?"action":t==="action"?"character":t==="character"?"dialogue":t==="parenthetical"?"dialogue":t==="dialogue"?"action":"action"}
function detect(text:string,current:ElementType):ElementType{
 const s=text.trim();
 if(/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s/i.test(s))return"scene";
 if(/^(CUT TO:|FADE OUT\.?|FADE IN:|DISSOLVE TO:|SMASH CUT TO:)\s*$/i.test(s))return"transition";
 if(/^\(.*\)$/.test(s))return"parenthetical";
 if(current==="action"&&/^[A-Z][A-Z0-9 .,'’'&-]{1,32}$/.test(s)&&s.length<=32)return"character";
 return current;
}
function migrateScene(s:Scene):Scene{
 if(s.blocks?.length)return s;
 const blocks:Block[]=[];let id=1;let afterCharacter=false;
 for(const raw of(s.body||"").split(/\n/)){const text=raw.trim();if(!text){afterCharacter=false;continue}
  let type:ElementType="action";
  if(/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s/i.test(text))type="scene";
  else if(/^\(.*\)$/.test(text))type="parenthetical";
  else if(/^[A-Z][A-Z0-9 .'-]{1,28}$/.test(text)&&text.length<=28)type="character";
  else if(afterCharacter)type="dialogue";
  blocks.push({id:id++,type,text:["scene","character","transition","shot"].includes(type)?text.toUpperCase():text});afterCharacter=type==="character";
 }
 if(!blocks.length)blocks.push({id:1,type:"action",text:""});
 return{...s,heading:blocks.find(b=>b.type==="scene")?.text||s.heading,blocks};
}

export default function Home(){
 const[project,setProject]=useState<Project>(starter),[active,setActive]=useState(1),[saved,setSaved]=useState(true),[focused,setFocused]=useState<number|null>(1);
 const activeRef=useRef<number|null>(null);
 useEffect(()=>{const raw=localStorage.getItem("vasudev-project");if(raw)try{const p=JSON.parse(raw)as Project;setProject({...p,language:p.language||"en",scenes:p.scenes.map(migrateScene)})}catch{}},[]);
 useEffect(()=>{localStorage.setItem("vasudev-project",JSON.stringify(project));setSaved(true)},[project]);
 const scene=migrateScene(project.scenes.find(s=>s.id===active)??project.scenes[0]);
 const words=useMemo(()=>project.scenes.reduce((n,s)=>n+(s.blocks||migrateScene(s).blocks||[]).reduce((m,b)=>m+b.text.trim().split(/\s+/).filter(Boolean).length,0),0),[project]);
 const pages=Math.max(1,Math.ceil(words/250));
 function updateBlocks(blocks:Block[]){setSaved(false);const heading=blocks.find(b=>b.type==="scene")?.text||scene.heading;setProject(p=>({...p,scenes:p.scenes.map(s=>s.id===active?{...s,heading,blocks,body:undefined}:s)}))}
 function formatBlockText(type:ElementType,text:string){if(type==="parenthetical"){const inner=text.trim().replace(/^\(|\)$/g,"");return inner?`(${inner})`:""}return ["scene","character","transition","shot"].includes(type)?text.toUpperCase():text}
 function updateBlock(id:number,text:string){updateBlocks(scene.blocks!.map(b=>b.id===id?{...b,text:formatBlockText(b.type,text)}:b))}
 function focusBlock(id:number){requestAnimationFrame(()=>{const el=document.getElementById("block-"+id) as HTMLTextAreaElement|null;el?.focus();if(el){el.selectionStart=el.value.length;el.selectionEnd=el.value.length}})}
 function insertBlock(afterId:number,type:ElementType){const id=Math.max(...scene.blocks!.map(b=>b.id),0)+1,index=scene.blocks!.findIndex(b=>b.id===afterId),blocks=[...scene.blocks!];blocks.splice(index+1,0,{id,type,text:""});updateBlocks(blocks);focusBlock(id)}
 function key(e:React.KeyboardEvent<HTMLTextAreaElement>,b:Block){
  if((e.metaKey||e.ctrlKey)&&shortcutTypes[e.key]){e.preventDefault();setType(b.id,shortcutTypes[e.key]);return}
  if(e.key==="Tab"){e.preventDefault();setType(b.id,nextType(b.type));return}
  if(e.key==="Enter"&&!e.shiftKey){
   e.preventDefault();
   const detected=detect(b.text,b.type);
   if(detected!==b.type){const updated=scene.blocks!.map(x=>x.id===b.id?{...x,type:detected,text:["scene","character","transition","shot"].includes(detected)?x.text.toUpperCase():x.text}:x);updateBlocks(updated);insertBlock(b.id,nextType(detected));return}
   insertBlock(b.id,nextType(b.type));return
  }
  if(e.key==="Backspace"&&!b.text&&scene.blocks!.length>1){e.preventDefault();const i=scene.blocks!.findIndex(x=>x.id===b.id),prev=scene.blocks![Math.max(0,i-1)];updateBlocks(scene.blocks!.filter(x=>x.id!==b.id));focusBlock(prev.id)}
 }
 function setType(id:number,type:ElementType){updateBlocks(scene.blocks!.map(b=>b.id===id?{...b,type,text:formatBlockText(type,b.text)}:b));focusBlock(id)}
 function addScene(){const id=Math.max(...project.scenes.map(s=>s.id),0)+1,blocks=[{id:id*100+1,type:"scene" as ElementType,text:"INT. NEW LOCATION — DAY"},{id:id*100+2,type:"action" as ElementType,text:""}];setProject(p=>({...p,scenes:[...p.scenes,{id,heading:blocks[0].text,blocks}]}));setActive(id);setSaved(false);activeRef.current=id}
 return <main className="shell"><header className="topbar"><div className="brand"><div className="mark">V</div><div><strong>Vasudev</strong><span>1.0 • Filmmaking Workspace</span></div></div><div className="top-actions"><span className={saved?"saved":"saving"}>{saved?"Saved locally":"Saving…"}</span><button className="ghost" onClick={()=>window.print()}>Export / Print</button><button className="primary" onClick={addScene}>＋ Scene</button></div></header>
 <div className="workspace"><aside className="sidebar"><div className="project-card"><label>PROJECT</label><input value={project.title} onChange={e=>setProject({...project,title:e.target.value})}/><div className="muted">{project.genre} • {project.scenes.length} scenes</div><label className="language-label">SCREENPLAY LANGUAGE</label><select className="language-select" value={project.language||"en"} onChange={e=>setProject({...project,language:e.target.value})}>{languages.map(l=><option key={l.code} value={l.code}>{l.native} — {l.name}</option>)}</select></div><nav><button className="nav active">▤ Screenplay</button><button className="nav">♙ Characters <small>soon</small></button><button className="nav">⌖ Locations <small>soon</small></button><button className="nav">▦ Breakdown <small>soon</small></button><button className="nav">◫ Shot List <small>soon</small></button><button className="nav">▧ Storyboard <small>soon</small></button></nav><div className="side-bottom"><div className="stat"><span>Pages</span><b>{pages}</b></div><div className="stat"><span>Words</span><b>{words}</b></div></div></aside>
 <section className="scene-list"><div className="section-head"><div><span>SCREENPLAY</span><h2>Scenes</h2></div><button onClick={addScene}>＋</button></div>{project.scenes.map(s=><button key={s.id} className={"scene-item "+(s.id===active?"selected":"")} onClick={()=>setActive(s.id)}><span className="scene-no">{String(s.id).padStart(2,"0")}</span><span><b>{migrateScene(s).heading||"Untitled scene"}</b><small>{(migrateScene(s).blocks||[])[1]?.text||"Empty scene"}</small></span></button>)}</section>
 <section className="editor"><div className="editor-head"><div><span className="eyebrow">SCENE {String(scene.id).padStart(2,"0")}</span><h1>{scene.heading}</h1></div><div className="editor-meta">Industry screenplay format</div></div>
 <div className="formatbar"><span>ELEMENT</span>{(Object.keys(labels)as ElementType[]).map(t=><button key={t} className={scene.blocks?.find(b=>b.id===focused)?.type===t?"active":""} onMouseDown={e=>e.preventDefault()} onClick={()=>{const el=document.activeElement as HTMLTextAreaElement;const id=Number(el?.id?.replace("block-",""));if(id)setType(id,t)}}><kbd>{Object.keys(labels).indexOf(t)+1}</kbd>{labels[t]}</button>)}</div>
 <div className="paper"><div className={"paper-page lang-"+(project.language||"en")}><div className="page-header"><span>{project.title.toUpperCase()}</span><span>SCREENPLAY</span></div><div className="script-flow">{scene.blocks!.map(b=><div key={b.id} className={"script-block "+b.type}><textarea id={"block-"+b.id} value={b.text} placeholder={b.type==="action"?"Action...":labels[b.type]} onFocus={()=>setFocused(b.id)} onChange={e=>updateBlock(b.id,e.target.value)} onKeyDown={e=>key(e,b)} onInput={e=>{const el=e.currentTarget;el.style.height="auto";el.style.height=el.scrollHeight+"px"}} spellCheck={false} rows={1} aria-label={labels[b.type]}/></div>)}</div><div className="page-number">1</div></div></div>
 <div className="language-hint">Writing language: <b>{languages.find(l=>l.code===project.language)?.native||"English"}</b> • Unicode screenplay text supported</div><div className="editor-footer">ENTER → smart next element • TAB → cycle • Ctrl/Cmd + 1–7 → element shortcuts • Shift+Enter → new line</div></section>
 <aside className="inspector"><div className="inspector-head"><span>SCENE DETAILS</span><button>•••</button></div><label>SCENE NUMBER</label><div className="field">{String(scene.id).padStart(2,"0")}</div><label>INT / EXT</label><div className="field">{scene.heading.match(/^(INT\.|EXT\.|INT\/EXT\.?)/i)?.[1]?.toUpperCase()||"INT."}</div><label>TIME</label><div className="field">{scene.heading.match(/(?:—|-)\s*([^—-]+)$/)?.[1]?.trim()||"DAY"}</div><label>LOCATION</label><div className="field">{scene.heading.replace(/^(INT\.|EXT\.|INT\/EXT\.?)\s*/i,"").replace(/\s*(—|-)\s*[^—-]+$/,"")||"Location"}</div><div className="divider"/><label>NOTES</label><textarea className="notes" placeholder="Director notes, ideas, continuity…"/><div className="hint"><b>Smart formatting</b><p>Type INT./EXT. and press Enter to create a scene heading. Type a short ALL-CAPS name and press Enter to create a character cue. Vasudev then moves into dialogue automatically.</p></div></aside></div></main>
}