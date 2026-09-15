"use client";
import {useEffect,useRef,useState} from "react";
import * as T from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {RoomEnvironment} from "three/addons/environments/RoomEnvironment.js";
import {stages} from "../data/stages";
import {createKilnInterior} from "./kiln-interior";

type Props={ai:boolean;selected:number|null;cutaway:boolean;playing:boolean;reset:number;zoom:number;layer:boolean;onSelect:(i:number)=>void;tourStep?:number;onSettled?:()=>void};
export default function Factory(props:Props){
 const host=useRef<HTMLDivElement>(null),labels=useRef<(HTMLButtonElement|null)[]>([]),zoneLabels=useRef<(HTMLDivElement|null)[]>([]),live=useRef(props);
 const [error,setError]=useState(false),[loaded,setLoaded]=useState(false),[retry,setRetry]=useState(0);
 live.current=props;
 useEffect(()=>{if(error)props.onSettled?.();},[error,props.tourStep,props.reset,props.onSettled]);
 useEffect(()=>{
  if(!host.current)return; const mount=host.current;
  let renderer:T.WebGLRenderer;
  try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});}catch{setError(true);return;}
  setError(false);setLoaded(false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.7));renderer.setClearColor(0x000000,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
  mount.appendChild(renderer.domElement);
  const scene=new T.Scene();const camera=new T.PerspectiveCamera(35,1,.1,220);
  const basePos=new T.Vector3(39,32,43); camera.position.copy(basePos);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,0,0);controls.enableDamping=true;controls.dampingFactor=.07;controls.minDistance=15;controls.maxDistance=95;controls.minPolarAngle=.22;controls.maxPolarAngle=Math.PI*.47;controls.enablePan=true;controls.panSpeed=.6;controls.rotateSpeed=.65;
  const pmrem=new T.PMREMGenerator(renderer); const room=new RoomEnvironment();const env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
  scene.add(new T.HemisphereLight(0xcce7ed,0x5c6053,1.2));
  const sun=new T.DirectionalLight(0xffe0aa,4);sun.position.set(-16,30,14);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-32,right:32,top:25,bottom:-25,near:.1,far:85});sun.shadow.bias=-.0004;sun.shadow.normalBias=.07;sun.shadow.radius=3;scene.add(sun);
  const rim=new T.DirectionalLight(0x83cce7,2);rim.position.set(12,16,-20);scene.add(rim);
  const plant=new T.Group();scene.add(plant);
  const materials:Record<string,T.MeshStandardMaterial>={};
  function mat(name:string,color:number,metalness=.1,roughness=.7){const m=new T.MeshStandardMaterial({color,metalness,roughness});materials[name]=m;return m;}
  const concrete=mat("concrete",0x87908b,.08,.95),slab=mat("slab",0x546461,.15,.88),road=mat("road",0x304145,.05,.95),cream=mat("cream",0xd5ceba,.18,.65),silver=mat("silver",0xb5c0bc,.62,.32),steel=mat("steel",0x738b8a,.6,.38),dark=mat("dark",0x243e48,.35,.55),gold=mat("gold",0xb59963,.42,.5),grain=mat("grain",0xd1ac62,.05,.9),green=mat("green",0x738662,.05,.8),glass=mat("glass",0x456f7e,.55,.2),rubber=mat("rubber",0x18272a,.1,.8),white=mat("white",0xd3dad1,.1,.7),cyan=mat("cyan",0x67cccb,.3,.35),orange=mat("orange",0xe39855,.2,.5);
  cyan.emissive.set(0x408884);cyan.emissiveIntensity=.4;
  function mesh(geometry:T.BufferGeometry,material:T.Material,x:number,y:number,z:number,parent:T.Object3D=plant){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function box(w:number,h:number,d:number,x:number,y:number,z:number,m:T.Material=cream,p:T.Object3D=plant){return mesh(new T.BoxGeometry(w,h,d),m,x,y,z,p);}
  function cyl(r:number,h:number,x:number,y:number,z:number,m:T.Material=silver,rt?:number,p:T.Object3D=plant){return mesh(new T.CylinderGeometry(rt??r,r,h,32),m,x,y,z,p);}
  function pipe(a:number[],b:number[],r=.075,m:T.Material=steel,p:T.Object3D=plant){const start=new T.Vector3(...a as [number,number,number]),end=new T.Vector3(...b as [number,number,number]);const delta=end.clone().sub(start);const obj=mesh(new T.CylinderGeometry(r,r,delta.length(),8),m,...start.clone().add(end).multiplyScalar(.5).toArray() as [number,number,number],p);obj.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return obj;}
  const roofs:T.Object3D[]=[];const rotors:T.Object3D[]=[];
  function edge(x:number,z:number,w:number,d:number,y=.08,m:T.Material=gold){box(w,.025,.055,x,y,z-d/2,m);box(w,.025,.055,x,y,z+d/2,m);box(.055,.025,d,x-w/2,y,z,m);box(.055,.025,d,x+w/2,y,z,m);}
  function rail(x:number,z:number,w:number,d:number,y:number){for(let a=-w/2;a<=w/2;a+=1){pipe([x+a,y,z-d/2],[x+a,y+.65,z-d/2],.025);pipe([x+a,y,z+d/2],[x+a,y+.65,z+d/2],.025);}pipe([x-w/2,y+.65,z-d/2],[x+w/2,y+.65,z-d/2],.025,gold);pipe([x-w/2,y+.65,z+d/2],[x+w/2,y+.65,z+d/2],.025,gold);}
  function textLabel(text:string,x:number,y:number,z:number,width=4,color="#f0e5ca"){const c=document.createElement("canvas");c.width=512;c.height=80;const ctx=c.getContext("2d")!;ctx.fillStyle=color;ctx.font="500 32px Arial";ctx.textAlign="center";ctx.fillText(text,256,52);const texture=new T.CanvasTexture(c);const s=new T.Mesh(new T.PlaneGeometry(width,width*80/512),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:T.DoubleSide}));s.position.set(x,y,z);plant.add(s);return s;}
  // Raised architectural site model, roads and planted margins.
  box(39,.7,25,0,-.6,0,slab);box(38.5,.15,24.5,0,-.19,0,concrete);
  box(37,.04,3.6,0,-.08,9.5,road);box(3.5,.04,21,-17,-.07,0,road);box(35,.04,2.4,0,-.07,-10,road);box(3,.04,20,17.5,-.07,0,road);
  for(let i=-16;i<=17;i+=2.5){box(1,.02,.05,i,-.04,9.5,white);box(.06,.02,.6,i,-.04,11.1,cream);}
  for(let i=-8;i<9;i+=2)box(.06,.02,.75,-17,-.04,i,white);
  edge(0,0,38.5,24.5,-.05,steel);
  // Facade ribs are actual geometry, making structures legible from every angle.
  function building(x:number,z:number,w:number,d:number,h:number,roofMat:T.Material=dark){box(w,.2,d,x,.1,z,concrete);box(w,h,d,x,h/2+.2,z,cream);const roof=box(w+.16,.13,d+.16,x,h+.27,z,roofMat);roofs.push(roof);for(let i=-w/2+.3;i<w/2;i+=.6){box(.04,h-.35,.025,x+i,h/2+.2,z+d/2+.016,steel);box(.04,h-.35,.025,x+i,h/2+.2,z-d/2-.016,steel);}for(let i=-d/2+.3;i<d/2;i+=.6){box(.025,h-.35,.04,x+w/2+.016,h/2+.2,z+i,steel);}return roof;}
  // 01. Six corrugated barley silos with cones, ladders and overhead gantry.
  for(let row=0;row<2;row++)for(let col=0;col<3;col++){
   const x=-14.5+col*2.25,z=3+row*2.5,h=5.4+(col===1?.45:0);
   cyl(1, .45,x,.25,z,concrete);cyl(.93,h,x,h/2+.5,z,silver);cyl(.95,.8,x,h+.9,z,silver,.07);
   for(let j=.8;j<h+.4;j+=.35){const ring=mesh(new T.TorusGeometry(.943,.014,4,32),steel,x,j,z);ring.rotation.x=Math.PI/2;}
   for(let j=.5;j<h+.7;j+=.35)pipe([x-.18,j,z+1],[x+.18,j,z+1],.018,dark);
   pipe([x-.18,.5,z+1],[x-.18,h+.7,z+1],.022,dark);pipe([x+.18,.5,z+1],[x+.18,h+.7,z+1],.022,dark);
   pipe([x,h+.65,z],[x,h+1.2,z],.085);cyl(.22,.15,x,h+1.3,z,dark);
  }
  box(7,.22,.7,-12.2,7.65,4.25,steel);rail(-12.2,4.25,7,.7,7.75);
  for(const x of [-15,-9.2]){pipe([x,.1,4.25],[x,7.65,4.25],.08,dark);}
  pipe([-12.2,7.75,4.25],[-10,7.75,-5],.14,gold);pipe([-10,7.75,-5],[-10,3.2,-5],.14,gold);
  building(-13,-.25,4.8,2.3,1.8);box(3,.1,2.1,-13,.04,-.25,dark);
  // 02. Cleaning tower and laboratory.
  building(-10,-5,4.5,4.6,3.8);box(2.2,2.5,2.4,-10,5.1,-5,cream);roofs.push(box(2.4,.12,2.6,-10,6.4,-5,dark));
  for(let i=0;i<3;i++){cyl(.35,1.4,-11.3+i*.85,4.65,-3.2,silver);cyl(.35,.45,-11.3+i*.85,3.75,-3.2,silver,.07);}
  box(3.4,.9,.045,-10,2.3,-2.67,glass);for(let x=-11.4;x<-8.5;x+=.7)box(.04,.9,.075,x,2.3,-2.64,cream);
  textLabel("QUALITY LAB",-10,1.38,-2.65,2.6);
  // 03. Open steeping tanks: water disks, pipework and platforms.
  box(6,.2,6,-2.5,.1,-5,concrete);
  for(let row=0;row<2;row++)for(let col=0;col<2;col++){
   const x=-3.8+col*2.6,z=-6.4+row*2.8;
   cyl(1.06,2.7,x,1.55,z,silver);cyl(.97,.06,x,2.94,z,glass);
   const rim=mesh(new T.TorusGeometry(1.06,.09,6,32),steel,x,3,z);rim.rotation.x=Math.PI/2;
   for(let a=0;a<4;a++){let ang=a*Math.PI/2;pipe([x+Math.cos(ang)*.83,.1,z+Math.sin(ang)*.83],[x+Math.cos(ang)*.83,1,z+Math.sin(ang)*.83],.06,dark);}
   pipe([x,3.15,z],[x,3.7,z],.055);pipe([x,3.7,z],[-2.5,3.7,z],.055);cyl(.22,.1,x,3.15,z,cream);
  }
  box(.65,.15,6.2,-2.5,2.9,-5,steel);rail(-2.5,-5,.65,6.2,3);pipe([-2.5,3.7,-7],[-2.5,3.7,-1],.09,silver);
  // 04. Germination halls with grain beds, turners and partially glazed roofs.
  for(let j=0;j<3;j++){
   const z=-7.2+j*2.3;
   box(6.1,.3,1.95,5,.2,z,concrete);box(5.65,.12,1.52,5,.45,z,grain);
   box(6.1,1.2,.15,5,1.1,z-.95,cream);box(6.1,1.2,.15,5,1.1,z+.95,cream);box(.15,1.3,2.05,2,1.1,z,cream);box(.15,1.3,2.05,8,1.1,z,cream);
   for(let x=2.5;x<8;x+=1.1){pipe([x,1.8,z-1],[x,2.5,z],.035,steel);pipe([x,2.5,z],[x,1.8,z+1],.035,steel);}
   const r1=box(6.3,.06,1.22,5,2.17,z-.51,silver);r1.rotation.x=.55;
   const r2=box(6.3,.06,1.22,5,2.17,z+.51,glass);r2.rotation.x=-.55;roofs.push(r1,r2);
   const turner=new T.Group();plant.add(turner);turner.position.set(4.3,1,z);box(.4,.3,2.1,0,.45,0,gold,turner);for(let k=-.7;k<.9;k+=.35)cyl(.065,.8,0,0,k,steel,undefined,turner);rotors.push(turner);
  }
  for(let j=0;j<3;j++){cyl(.36,1.7,8.65,.9,-7+j*2.2,silver);pipe([8,.8,-7+j*2.2],[8.65,.8,-7+j*2.2],.2);}
  // 05. Kiln house, heat recovery, ducts, chimneys and solar array.
  const kilnStart=plant.children.length;
  const kilnRoof=building(13,-4.5,5.7,6.8,3.8,gold);
  for(let i=0;i<3;i++){let x=11.1+i*1.8;cyl(.46,2.1,x,4.9,-6.4,silver);cyl(.58,.18,x,6.04,-6.4,dark);pipe([x,3.9,-4.5],[x,4.6,-4.5],.3);cyl(.55,.1,x,4.65,-4.5,dark);}
  box(1.9,2.4,3,16.65,1.3,-4.3,steel);for(let i=0;i<9;i++)box(1.94,.035,3.04,16.65,.3+i*.25,-4.3,dark);
  pipe([14.8,2.6,-4.3],[16.65,2.6,-4.3],.22,orange);pipe([16.65,2.6,-4.3],[16.65,1,-.8],.16,orange);
  textLabel("KILNING",13,2.5,-1.075,3);
  const kilnShell=plant.children.slice(kilnStart);
  const kilnRoofBase=kilnRoof.position.y;
  // 06. Dispatch warehouse, loading docks, pallet stacks and bulk tanker.
  building(10.8,5.2,9.4,4.5,3.15,dark);
  for(let x=7.4;x<=14.4;x+=2.3){box(1.5,1.8,.09,x,1.15,7.5,dark);for(let j=.5;j<1.9;j+=.2)box(1.43,.025,.04,x,j,7.56,steel);box(1.8,.15,.8,x,.2,7.85,steel);}
  for(let x=7.2;x<15;x+=1.2)for(let z=3.4;z<6.9;z+=1.15){const p=box(.95,.035,.88,x,3.55,z,glass);p.rotation.x=-.2;roofs.push(p);}
  textLabel("MALT / DISPATCH",10.8,2.65,7.5,5);
  for(let j=0;j<3;j++)for(let k=0;k<2;k++){box(.8,.12,.65,6+j*.95,.14,8+k*.75,gold);box(.7,.55,.57,6+j*.95,.48,8+k*.75,cream);}
  function truck(x:number,z:number,color:T.Material=cream,tanker=false){const g=new T.Group();g.position.set(x,0,z);plant.add(g);box(1.1,.7,1,0,.62,0,color,g);box(1,.37,.035,0,.85,.515,glass,g);box(1.13,.12,.12,0,.28,.56,steel,g);box(.2,.1,.05,-.38,.45,.54,white,g);box(.2,.1,.05,.38,.45,.54,white,g);box(1,.18,3.6,0,.3,-1.4,dark,g);if(tanker){const t=cyl(.53,2.4,0,.95,-1.55,silver,undefined,g);t.rotation.x=Math.PI/2;}else box(1.15,1.03,2.5,0,1,-1.65,color,g);for(let zz of [0,-1.5,-2.5])for(let xx of [-.59,.59]){const wh=cyl(.25,.14,xx,.28,zz,rubber,undefined,g);wh.rotation.z=Math.PI/2;const hub=cyl(.12,.15,xx,.28,zz,silver,undefined,g);hub.rotation.z=Math.PI/2;}return g;}
  truck(11.4,10.5,cream,true);const movingTruck=truck(-17,5,white);movingTruck.rotation.y=Math.PI;
  truck(14.3,10.9,dark);
  // The control room forms the visual center of the connected facility.
  building(.3,4,4.8,3.6,1.9,dark);box(4.85,1.08,.06,.3,1.15,5.82,glass);box(.06,1.08,3.6,2.74,1.15,4,glass);
  for(let x=-1.8;x<2.7;x+=.65)box(.035,1.1,.1,x,1.15,5.85,steel);
  textLabel("OPERATIONS",.3,.32,5.86,3.2);
  // Pipe bridges, conveyors and utilities unite the plant.
  const grainPoints=[[-13,1.2,4],[-13,1.2,-1],[-10,1.2,-1],[-10,1.2,-5],[-2.5,1.2,-5],[-2.5,1.2,-.5],[5,1.2,-.5],[5,1.2,-5],[13,1.2,-5],[13,1.2,1],[11,1.2,1],[11,1.2,6]];
  for(let i=1;i<grainPoints.length;i++){
   const a=grainPoints[i-1],b=grainPoints[i];pipe(a,b,.1,gold);const mid=a.map((v,k)=>(v+b[k])/2);if(i%2===1){pipe([mid[0],0,mid[2]],mid,.05,steel);}
  }
  pipe([-9,3.3,-.8],[10,3.3,-.8],.095,silver);pipe([-9,3.6,-.8],[10,3.6,-.8],.045,orange);for(let x=-9;x<11;x+=3)pipe([x,0,-.8],[x,3.7,-.8],.04,steel);
  // Boundary landscape: ordered groves, low hedges, lighting and retaining wall.
  function tree(x:number,z:number,s=1){cyl(.06,1,x,.5,z,gold);const crown=mesh(new T.IcosahedronGeometry(.5*s,1),green,x,1.3*s,z);crown.scale.y=1.6;}
  for(let i=-14;i<=15;i+=2.6)tree(i,-11.5,.75+(Math.sin(i)*.1));for(let z=-8;z<10;z+=2.2)tree(18.3,z,.65);
  for(let x=-7;x<=3;x+=1.2)tree(x,7.4,.65);
  box(7,.15,1.8,-2,.08,8,green);
  for(let i=-12;i<18;i+=6){pipe([i,0,11.8],[i,2.5,11.8],.035,dark);box(.22,.08,.5,i,2.53,11.8,cream);}
  // Ground contour and gentle base glow.
  const ground=mesh(new T.PlaneGeometry(150,150),new T.ShadowMaterial({color:0x000000,opacity:.24}),0,-1.02,0,scene);ground.rotation.x=-Math.PI/2;
  const glowRing=mesh(new T.RingGeometry(23,23.025,120),new T.MeshBasicMaterial({color:0x536d70,transparent:true,opacity:.24,side:T.DoubleSide}),0,-.98,0,scene);glowRing.rotation.x=-Math.PI/2;

  // Intelligence: elevated data paths converge at a central control node.
  const dataGroup=new T.Group();plant.add(dataGroup);const center=new T.Vector3(.3,4.5,4);
  const lines:T.CatmullRomCurve3[]=[];const aiMat=new T.LineBasicMaterial({color:0x42d5d2,transparent:true,opacity:.65,depthTest:false});
  stages.forEach(s=>{const dest=new T.Vector3(s.position[0],s.height*.7,s.position[1]);const mid=center.clone().lerp(dest,.5);mid.y+=3;const curve=new T.CatmullRomCurve3([center.clone(),mid,dest]);lines.push(curve);const line=new T.Line(new T.BufferGeometry().setFromPoints(curve.getPoints(40)),aiMat);dataGroup.add(line);const ring=mesh(new T.TorusGeometry(.55,.035,6,40),cyan,dest.x,.16,dest.z,dataGroup);ring.rotation.x=Math.PI/2;});
  const nucleus=mesh(new T.IcosahedronGeometry(.36,1),cyan,center.x,center.y,center.z,dataGroup);
  const halo=mesh(new T.TorusGeometry(.75,.018,4,60),cyan,center.x,center.y,center.z,dataGroup);halo.rotation.x=Math.PI/2;
  const halo2=mesh(new T.TorusGeometry(1,.012,4,60),cyan,center.x,center.y,center.z,dataGroup);halo2.rotation.x=Math.PI/2;
  const dataCount=48,dataPositions=new Float32Array(dataCount*3);const dataGeometry=new T.BufferGeometry();dataGeometry.setAttribute("position",new T.BufferAttribute(dataPositions,3));dataGroup.add(new T.Points(dataGeometry,new T.PointsMaterial({color:0x9ee6df,size:.11,transparent:true,opacity:.9,depthWrite:false})));
  const pathCurve=new T.CatmullRomCurve3(grainPoints.map(p=>new T.Vector3(...p as [number,number,number])),false,"catmullrom",.05);
  const grainPositions=new Float32Array(210*3),grainGeo=new T.BufferGeometry();grainGeo.setAttribute("position",new T.BufferAttribute(grainPositions,3));plant.add(new T.Points(grainGeo,new T.PointsMaterial({color:0xf7ca7a,size:.075,depthWrite:false})));
  const energyCurve=new T.CatmullRomCurve3([new T.Vector3(16.6,1.6,-4),new T.Vector3(16.6,1.6,-.8),new T.Vector3(5,1.6,-.8),new T.Vector3(-2.5,1.6,-5)]);const energyPositions=new Float32Array(24*3),energyGeo=new T.BufferGeometry();energyGeo.setAttribute("position",new T.BufferAttribute(energyPositions,3));dataGroup.add(new T.Points(energyGeo,new T.PointsMaterial({color:0xf7a265,size:.1,depthWrite:false})));
  const steamGeo=new T.BufferGeometry(),steamPositions=new Float32Array(35*3);steamGeo.setAttribute("position",new T.BufferAttribute(steamPositions,3));plant.add(new T.Points(steamGeo,new T.PointsMaterial({color:0xc8dbd9,size:.2,opacity:.23,transparent:true,depthWrite:false})));

  const interior=createKilnInterior();plant.add(interior.group);interior.group.visible=false;
  const outsideObjects=plant.children.filter(o=>o!==interior.group&&!kilnShell.includes(o));
  const stageHalo=mesh(new T.RingGeometry(2.8,2.87,72),new T.MeshBasicMaterial({color:0xe2be7c,transparent:true,opacity:.75,side:T.DoubleSide,depthWrite:false}),0,.04,0,scene);stageHalo.rotation.x=-Math.PI/2;
  const kilnRoofMaterial=gold.clone();kilnRoofMaterial.transparent=true;kilnRoof.material=kilnRoofMaterial;
  let width=1,height=1,resizeNeeded=true;
  function resize(){width=mount.clientWidth;height=Math.max(1,mount.clientHeight);renderer.setSize(width,height);camera.aspect=width/height;basePos.set(39,32,43).multiplyScalar(Math.min(1.45,Math.max(1,1.2/camera.aspect)));camera.updateProjectionMatrix();resizeNeeded=true;}
  const observer=new ResizeObserver(resize);observer.observe(mount);resize();
  let cancelled=false,frame=0,elapsed=0,lastTime=performance.now(),lastKey="",lastZoom=0,openness=0,wasInside=false;
  type Shot={position:T.Vector3;look:T.Vector3;duration:number;open:number};
  let shots:Shot[]=[],shotTime=0,fromPos=camera.position.clone(),fromLook=controls.target.clone(),fromOpen=0;
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const vec=(a:number[])=>new T.Vector3(...a as [number,number,number]);
  function beginShot(){shotTime=0;fromPos.copy(camera.position);fromLook.copy(controls.target);fromOpen=openness;}
  function onLost(e:Event){e.preventDefault();setError(true);live.current.onSettled?.();}
  renderer.domElement.addEventListener("webglcontextlost",onLost);
  function animate(time:number){if(cancelled)return;frame=requestAnimationFrame(animate);const dt=Math.max(0,Math.min((time-lastTime)/1000,.05));lastTime=time;const p=live.current;
   if(p.playing&&!reduced)elapsed+=dt;
   const guided=p.tourStep!==undefined,inside=guided&&p.tourStep!>=5&&p.tourStep!<=8;
   const key=String(p.tourStep)+":"+p.selected+":"+p.reset;
   controls.enabled=!guided;controls.minDistance=guided?3:12;controls.maxDistance=120;
   if(key!==lastKey||resizeNeeded){
    const keepInteriorView=inside&&wasInside&&!resizeNeeded;
    wasInside=inside;
    lastKey=key;resizeNeeded=false;shots=[];
    const add=(position:number[]|T.Vector3,look:number[],duration:number,open:number)=>shots.push({position:position instanceof T.Vector3?position.clone():vec(position),look:vec(look),duration,open});
    const narrow=Math.max(1,Math.min(1.55,1.1/camera.aspect));
    if(inside){
     if(openness<.5){add([28,18,15],[13,1.6,-4.5],1.15,0);add([28,18,15],[13,1.6,-4.5],.65,1);}
     // All four use cases share one cutaway composition. Advancing changes
     // the highlighted zone and explanation, without moving the camera.
     if(!keepInteriorView){
      const offset=vec([8,9,11]).multiplyScalar(narrow);
      add(vec([13,1,-4.5]).add(offset),[13,1,-4.5],1.35,1);
     }
    }else{
     if(openness>.05)add([28,18,15],[13,1.6,-4.5],1.15,0);
     if(p.selected!==null){const s=stages[p.selected];const offset=vec(p.selected===0?[19,14,19]:[17,16,23]).multiplyScalar(narrow);
      add(vec([s.position[0],1.4,s.position[1]]).add(offset),[s.position[0],1.4,s.position[1]],1.4,0);
     }else add(basePos,[0,0,0],1.7,0);
    }
    if(shots.length)beginShot();else p.onSettled?.();
   }
   if(shots.length&&(p.playing||reduced)){const shot=shots[0];shotTime+=dt;const t=reduced?1:Math.min(1,shotTime/shot.duration),ease=t*t*(3-2*t);camera.position.lerpVectors(fromPos,shot.position,ease);controls.target.lerpVectors(fromLook,shot.look,ease);openness=T.MathUtils.lerp(fromOpen,shot.open,ease);if(t===1){shots.shift();if(shots.length)beginShot();else p.onSettled?.();}}
   if(p.zoom!==lastZoom){camera.position.sub(controls.target).multiplyScalar(Math.pow(.83,p.zoom-lastZoom)).add(controls.target);lastZoom=p.zoom;}
   roofs.forEach(r=>{r.visible=!p.cutaway;});
   kilnShell.forEach(o=>{o.visible=openness<.55;});
   kilnRoof.visible=openness<.95;kilnRoof.position.y=kilnRoofBase+openness*3;kilnRoofMaterial.opacity=1-openness;
   interior.group.visible=openness>.05;interior.tick(elapsed,inside?p.tourStep!-5:0);
   outsideObjects.forEach(o=>{o.visible=openness<.97;});
   dataGroup.visible=p.ai&&openness<.1&&(!guided||p.tourStep===0||p.tourStep===10);aiMat.opacity=p.layer?.9:.4;
   stageHalo.visible=p.selected!==null&&openness<.1;if(p.selected!==null){stageHalo.position.x=stages[p.selected].position[0];stageHalo.position.z=stages[p.selected].position[1];}
   nucleus.rotation.y=elapsed*.5;halo.rotation.z=elapsed*.2;halo2.scale.setScalar(1+Math.sin(elapsed*1.4)*.08);
   for(let i=0;i<dataCount;i++){const point=lines[i%lines.length].getPoint((elapsed*.12+i/dataCount)%1);dataPositions.set(point.toArray(),i*3);}dataGeometry.attributes.position.needsUpdate=true;
   for(let i=0;i<210;i++){const point=pathCurve.getPoint((elapsed*.026+i/210)%1);grainPositions[i*3]=point.x+Math.sin(i*17)*.09;grainPositions[i*3+1]=point.y+.15+Math.sin(i*3)*.05;grainPositions[i*3+2]=point.z+Math.cos(i*7)*.07;}grainGeo.attributes.position.needsUpdate=true;
   for(let i=0;i<24;i++){const point=energyCurve.getPoint((elapsed*.12+i/24)%1);energyPositions.set(point.toArray(),i*3);}energyGeo.attributes.position.needsUpdate=true;
   for(let i=0;i<35;i++){const f=(elapsed*.12+i/35)%1;steamPositions[i*3]=11.1+(i%3)*1.8+Math.sin(i*3+f)*f*.8;steamPositions[i*3+1]=6.1+f*2.7;steamPositions[i*3+2]=-6.4+f*.8;}steamGeo.attributes.position.needsUpdate=true;
   rotors.forEach((r,i)=>{r.position.x=5+Math.sin(elapsed*.14+i)*1.6;});movingTruck.position.z=5-Math.sin(elapsed*.06)*3;
   controls.update();renderer.render(scene,camera);
   interior.labels.forEach((label,i)=>{const el=zoneLabels.current[i];if(!el)return;const v=label.position.clone().project(camera);el.style.left=((v.x*.5+.5)*width)+"px";el.style.top=((-v.y*.5+.5)*height)+"px";el.style.visibility=openness>.9&&v.z<1?"visible":"hidden";});
   stages.forEach((s,i)=>{const el=labels.current[i];if(!el)return;const v=new T.Vector3(s.position[0],s.height,s.position[1]).project(camera);el.style.left=((v.x*.5+.5)*width)+"px";el.style.top=((-v.y*.5+.5)*height)+"px";el.style.visibility=(inside||(guided&&p.selected!==i)||v.z>1||v.z< -1||v.x< -1.1||v.x>1.1||v.y< -1.1||v.y>1.1)?"hidden":"visible";el.style.opacity=p.selected!==null&&p.selected!==i?"0.45":"1";});
  }
  frame=requestAnimationFrame(animate);setLoaded(true);
  return()=>{cancelled=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();renderer.domElement.removeEventListener("webglcontextlost",onLost);scene.traverse(obj=>{if(obj instanceof T.Mesh||obj instanceof T.Line||obj instanceof T.Points){obj.geometry?.dispose();const mats=Array.isArray(obj.material)?obj.material:[obj.material];mats.forEach(m=>{if("map"in m)(m as T.MeshBasicMaterial).map?.dispose();m.dispose();});}});env.dispose();renderer.dispose();renderer.domElement.remove();};
 },[retry]);
 return <><div className="canvas-mount" ref={host}/>{!loaded&&!error&&<div className="loading-scene"><span className="loading-ring"/><p>Preparing your view of the future…</p></div>}{error?<div className="fallback-scene"><h2>The malting journey</h2><p>The 3D view needs browser graphics acceleration. You can still follow the complete story using the Next arrow below.</p><button onClick={()=>{setError(false);setRetry(n=>n+1);}}>Retry 3D view</button></div>:<div className="hotspots">{stages.map((s,i)=><button key={s.short} ref={el=>{labels.current[i]=el;}} className={"hotspot "+(props.selected===i?"selected":"")} aria-label={"Explore "+s.title} disabled={props.tourStep!==undefined} onClick={()=>props.onSelect(i)}><span className="hotspot-number">0{i+1}</span><span className="hotspot-name">{s.short}</span></button>)}</div>}{props.tourStep!==undefined&&props.tourStep>=5&&props.tourStep<=8&&<div className="zone-labels" aria-hidden="true">{["A · Heat & airflow","B · Quality sensing","C · Fans & motors","D · Batch planning","AI decision layer"].map((name,i)=><div key={name} ref={el=>{zoneLabels.current[i]=el;}} className={"zone-label "+(i===4?"core":props.tourStep!-5===i?"active":"")}>{name}</div>)}</div>}</>;
}
