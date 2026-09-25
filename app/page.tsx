"use client";

import { useEffect, useMemo, useState } from "react";

type Scene = { id:number; heading:string; body:string };
type Project = { title:string; genre:string; logline:string; scenes:Scene[] };

const starter:Project = {
  title:"Untitled Film",
  genre:"Feature",
  logline:"",
  scenes:[{id:1,heading:"INT. APARTMENT — NIGHT",body:"A quiet room. The city hums beyond the window.\n\nARJUN, 28, sits alone at the table. He looks at his phone.\n\n                         ARJUN\n              We have to talk."}]
};

export default function Home(){
  const [project,setProject]=useState<Project>(starter);
  const [active,setActive]=useState(1);
  const [saved,setSaved]=useState(true);

  useEffect(()=>{ const raw=localStorage.getItem("vasudev-project"); if(raw) setProject(JSON.parse(raw)); },[]);
  useEffect(()=>{ localStorage.setItem("vasudev-project",JSON.stringify(project)); setSaved(true); },[project]);

  const scene=project.scenes.find(s=>s.id===active) ?? project.scenes[0];
  const words=useMemo(()=>project.scenes.reduce((n,s)=>n+s.body.trim().split(/\s+/).filter(Boolean).length,0),[project]);
  const pages=Math.max(1,Math.ceil(words/250));

  function updateScene(patch:Partial<Scene>){
    setSaved(false);
    setProject(p=>({...p,scenes:p.scenes.map(s=>s.id===active?{...s,...patch}:s)}));
  }
  function addScene(){
    const id=Math.max(...project.scenes.map(s=>s.id),0)+1;
    setProject(p=>({...p,scenes:[...p.scenes,{id,heading:"INT. NEW LOCATION — DAY",body:""}]}));
    setActive(id);
    setSaved(false);
  }
  function exportScript(){
    window.print();
  }

  return <main className="shell">
    <header className="topbar">
      <div className="brand"><div className="mark">V</div><div><strong>Vasudev</strong><span>1.0 • Filmmaking Workspace</span></div></div>
      <div className="top-actions"><span className={saved?"saved":"saving"}>{saved?"Saved locally":"Saving…"}</span><button className="ghost" onClick={exportScript}>Export / Print</button><button className="primary" onClick={addScene}>＋ Scene</button></div>
    </header>

    <div className="workspace">
      <aside className="sidebar">
        <div className="project-card">
          <label>PROJECT</label>
          <input value={project.title} onChange={e=>setProject({...project,title:e.target.value})}/>
          <div className="muted">{project.genre} • {project.scenes.length} scenes</div>
        </div>
        <nav>
          <button className="nav active">▤ Screenplay</button>
          <button className="nav">♙ Characters <small>soon</small></button>
          <button className="nav">⌖ Locations <small>soon</small></button>
          <button className="nav">▦ Breakdown <small>soon</small></button>
          <button className="nav">◫ Shot List <small>soon</small></button>
          <button className="nav">▧ Storyboard <small>soon</small></button>
        </nav>
        <div className="side-bottom">
          <div className="stat"><span>Pages</span><b>{pages}</b></div>
          <div className="stat"><span>Words</span><b>{words}</b></div>
        </div>
      </aside>

      <section className="scene-list">
        <div className="section-head"><div><span>SCREENPLAY</span><h2>Scenes</h2></div><button onClick={addScene}>＋</button></div>
        {project.scenes.map(s=><button key={s.id} className={"scene-item "+(s.id===active?"selected":"")} onClick={()=>setActive(s.id)}>
          <span className="scene-no">{String(s.id).padStart(2,"0")}</span><span><b>{s.heading||"Untitled scene"}</b><small>{s.body.slice(0,58)||"Empty scene"}</small></span>
        </button>)}
      </section>

      <section className="editor">
        <div className="editor-head">
          <div><span className="eyebrow">SCENE {String(scene.id).padStart(2,"0")}</span><h1>{scene.heading}</h1></div>
          <div className="editor-meta">1 page estimate</div>
        </div>
        <div className="formatbar">
          <span>FORMAT</span><button>SCENE HEADING</button><button>ACTION</button><button>CHARACTER</button><button>DIALOGUE</button><button>PARENTHETICAL</button>
        </div>
        <div className="paper">
          <input className="heading-input" value={scene.heading} onChange={e=>updateScene({heading:e.target.value.toUpperCase()})} aria-label="Scene heading"/>
          <textarea className="script-text" value={scene.body} onChange={e=>updateScene({body:e.target.value})} spellCheck={false} aria-label="Screenplay text"/>
        </div>
      </section>

      <aside className="inspector">
        <div className="inspector-head"><span>SCENE DETAILS</span><button>•••</button></div>
        <label>SCENE NUMBER</label><div className="field">{String(scene.id).padStart(2,"0")}</div>
        <label>INT / EXT</label><div className="field">INT.</div>
        <label>TIME</label><div className="field">NIGHT</div>
        <label>LOCATION</label><div className="field">Apartment <span>⌄</span></div>
        <div className="divider"/>
        <label>NOTES</label><textarea className="notes" placeholder="Director notes, ideas, continuity…"/>
        <div className="hint"><b>Vasudev workflow</b><p>This scene will later power breakdowns, shot lists and scheduling.</p></div>
      </aside>
    </div>
  </main>
}