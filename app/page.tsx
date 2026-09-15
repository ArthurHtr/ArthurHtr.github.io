"use client";
import {useState,useCallback,useEffect} from "react";
import dynamic from "next/dynamic";
import {ArrowRight,ArrowLeft,Pause,Play,RotateCcw,Wheat,X,MoveUpRight} from "lucide-react";
import {stages} from "./data/stages";
import {journey,kilnCases} from "./data/journey";
const Factory=dynamic(()=>import("./components/factory"),{ssr:false,loading:()=> <div className="loading-scene">Preparing your view of the future…</div>});
export default function Home(){
 const [step,setStep]=useState(0),[playing,setPlaying]=useState(true),[free,setFree]=useState(false),[info,setInfo]=useState(false),[busy,setBusy]=useState(false),[reset,setReset]=useState(0);
 const [freeStage,setFreeStage]=useState<number|null>(null);
 const current=journey[step],inside=step>=5&&step<=8&&!free,ended=step===10;
 const ready=useCallback(()=>setBusy(false),[]);
 const navigate=useCallback((next:number)=>{setBusy(true);setStep(Math.max(0,Math.min(10,next)));setPlaying(true);setReset(n=>n+1);},[]);
 useEffect(()=>{const handler=(e:KeyboardEvent)=>{if(info||free||e.target instanceof HTMLButtonElement)return;if(e.key==="ArrowRight"&&!busy){e.preventDefault();navigate(ended?0:step+1);}if(e.key==="ArrowLeft"&&!busy&&step>0){e.preventDefault();navigate(step-1);}};window.addEventListener("keydown",handler);return()=>window.removeEventListener("keydown",handler);},[step,busy,free,info,ended,navigate]);
 function toggleFree(){setFree(v=>!v);setBusy(false);setFreeStage(null);setReset(n=>n+1);}
 return <main className={"tour "+(inside?"inside ":"")+(step===0?"arrival ":"")+(ended?"ending":"")}>
  <header className="tour-header"><a href="#" onClick={e=>{e.preventDefault();setFree(false);navigate(0);}} className="identity" aria-label="Restart the journey"><Wheat size={23}/><span>MALT <i>/</i> FUTURES</span></a><span className="header-caption">AN INDUSTRIAL AI EXPLORATION</span><button className="text-control" onClick={toggleFree}>{free?"Return to journey":"Explore freely"}<MoveUpRight size={15}/></button></header>
  <div className="tour-scene" aria-label="Interactive 3D malting facility">
   <Factory ai={true} selected={free?freeStage:current.stage} cutaway={false} playing={playing} reset={reset} zoom={0} layer={ended} onSelect={setFreeStage} tourStep={free?undefined:step} onSettled={ready}/>
  </div>
  <section className="tour-title" aria-live="polite" aria-atomic="true">
   <p className="eyebrow">{free?"YOUR PERSPECTIVE":step===0?"FROM GRAIN TO INTELLIGENCE":ended?"ONE CONNECTED VALUE CHAIN":String((current.stage??0)+1).padStart(2,"0")+" / 06 — "+stages[current.stage??0].title}</p>
   <h1>{free?"Explore the facility":step===0?<>Inside the future<br/>of <em>malting.</em></>:ended?<>The future is<br/><em>connected.</em></>:inside?<>Inside the <em>kiln.</em></>:current.title}</h1>
   {(step===0||free)&&<p className="title-caption">{free?"Drag to orbit. Scroll or pinch to zoom.":"Follow the journey from grain to intelligence."}</p>}
  </section>
  {inside&&<aside className="kiln-sequence" aria-label="Kiln AI use cases">{kilnCases.map((item,i)=><div key={item.title} className={"case-marker "+(step-5===i?"active":step-5>i?"complete":"")}><span>{String.fromCharCode(65+i)}</span><span>{item.title}</span><i/></div>)}<div className="decision-label">AI decision layer<small>Signals → recommendations → operator approval</small></div></aside>}
  <section className="story-dock" aria-label="Journey navigation">
   <div className="story-copy" key={free?"free":step} aria-live="polite"><span className="story-kicker">{free?"FREE EXPLORATION":current.kicker}</span><h2>{free?(freeStage===null?"Choose a stage to explore.":stages[freeStage].title):current.subtitle}</h2><p>{free?(freeStage===null?"Select a marker on the facility.":stages[freeStage].description):current.text}</p>{inside&&<div className="recommendation"><span>PROPOSED ACTION</span>{kilnCases[step-5].action}</div>}</div>
   <div className="navigation-actions">{!free&&step>0&&<button className="back-button" disabled={busy} onClick={()=>navigate(step-1)} aria-label="Previous scene"><ArrowLeft size={19}/></button>}<button className="next-button" disabled={busy&&!free} aria-busy={busy&&!free} onClick={()=>free?toggleFree():navigate(ended?0:step+1)} aria-label={free?"Return to journey":ended?"Replay journey":step===0?"Start the journey":"Next step"}><span>{free?"Return to journey":ended?"Replay journey":step===0?"Start the journey":"Next step"}</span>{ended?<RotateCcw size={25}/>:<ArrowRight size={29}/>}</button></div>
  </section>
  <footer className="tour-footer"><button className="concept-link" onClick={()=>setInfo(true)}>Inspired by Soufflet & Malt · Concept visualization</button><div className="progress" aria-label={"Journey progress: "+(ended?6:current.stage===null?0:current.stage+1)+" of 6 stages"}>{stages.map((s,i)=><span key={s.short} className={(current.stage===i&&!free?"active ":"")+(ended||(current.stage!==null&&i<current.stage)?"done":"")} title={s.title}/>)}</div><button className="pause-button" aria-label={playing?"Pause animation":"Resume animation"} aria-pressed={!playing} onClick={()=>setPlaying(v=>!v)}>{playing?<Pause size={16}/>:<Play size={16}/>}<span>{playing?"Pause":"Resume"}</span></button></footer>
  {info&&<div className="concept-backdrop" onClick={()=>setInfo(false)}><section className="concept-dialog" role="dialog" aria-modal="true" aria-labelledby="concept-title" onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==="Escape"||e.key==="Tab"){e.preventDefault();if(e.key==="Escape")setInfo(false);}}}><button autoFocus onClick={()=>setInfo(false)} aria-label="Close information"><X size={21}/></button><h2 id="concept-title">A possible future, illustrated.</h2><p>A strategic concept inspired by Soufflet & Malt. This is not a real facility, an official company representation or an operational digital twin.</p><p>The layout, animated flows and AI applications are illustrative. No company performance data is presented. Proposed actions require operator approval and process safeguards.</p></section></div>}
 </main>;
}
