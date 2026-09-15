import * as T from "three";

/** Illustrative equipment layout, in the same world coordinates as the exterior kiln. */
export function createKilnInterior(){
 const group=new T.Group();group.position.set(13,0,-4.5);
 const mat=(color:number,metalness=.4,roughness=.5)=>new T.MeshStandardMaterial({color,metalness,roughness});
 const steel=mat(0x728d92),dark=mat(0x18333e),cream=mat(0xbac1b4),gold=mat(0xbe9553),grain=mat(0xc7a160,.05,.95);
 const colors=[0xefac64,0x75d2ca,0xe3c477,0x88afce];
 const activeMats=colors.map(color=>new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.25,metalness:.25,roughness:.35}));
 function mesh(geo:T.BufferGeometry,m:T.Material,x:number,y:number,z:number,parent:T.Object3D=group){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 const box=(w:number,h:number,d:number,x:number,y:number,z:number,m:T.Material=steel,p:T.Object3D=group)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z,p);
 const cyl=(r:number,h:number,x:number,y:number,z:number,m:T.Material=steel,p:T.Object3D=group)=>mesh(new T.CylinderGeometry(r,r,h,32),m,x,y,z,p);
 function pipe(a:number[],b:number[],r:number,m:T.Material){const from=new T.Vector3(...a as [number,number,number]),to=new T.Vector3(...b as [number,number,number]);const delta=to.clone().sub(from);const o=mesh(new T.CylinderGeometry(r,r,delta.length(),12),m,...from.add(to).multiplyScalar(.5).toArray() as [number,number,number]);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return o;}
 // A real cutaway floor, low boundary walls, supports and an overhead beam.
 box(5.7,.22,6.8,0,.13,0,steel);box(5.45,.06,6.55,0,.27,0,dark);
 box(5.7,1.2,.12,0,.8,-3.34,cream);box(.12,1.2,6.8,-2.79,.8,0,cream);
 for(const x of [-2.7,2.7])for(const z of [-3.25,3.25])box(.1,3.65,.1,x,1.98,z,steel);
 box(5.5,.11,.11,0,3.78,-3.25,steel);
 const zones=[[-1.4,1.6],[-1.4,-1.6],[1.4,1.6],[1.4,-1.6]];
 const pads=zones.map(([x,z],i)=>{box(2.45,.035,2.65,x,.315,z,dark);const edges=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(2.45,.05,2.65)),new T.LineBasicMaterial({color:colors[i],transparent:true,opacity:.3}));edges.position.set(x,.36,z);group.add(edges);return edges;});
 // A: heat exchanger, inlet plenum, valves and warm-air ducts.
 box(1.25,1.2,.8,-1.6,1,2.05,dark);
 for(let j=0;j<9;j++)box(1.24,.045,.87,-1.6,.5+j*.12,2.05,steel);
 cyl(.37,.85,-1.2,.8,1,activeMats[0]);pipe([-1.2,1.3,1],[-1.2,2,1],.14,steel);pipe([-1.2,2,1],[0,2,1],.14,steel);
 for(let j=0;j<3;j++)box(.07,.07,.55,-1.95+j*.32,1.65,2.05,activeMats[0]);
 // B: grain bed with a sensor gantry and sampling unit.
 box(1.9,.35,1.8,-1.4,.52,-1.45,steel);box(1.75,.06,1.65,-1.4,.73,-1.45,grain);
 for(const x of [-2.3,-.5])box(.08,1.45,.08,x,1.15,-1.45,steel);
 box(1.9,.12,.2,-1.4,1.88,-1.45,steel);
 const scan=box(1.7,.025,.04,-1.4,.81,-1.45,activeMats[1]);
 box(.3,.3,.4,-1.4,1.67,-1.45,activeMats[1]);
 for(let j=0;j<45;j++){const s=mesh(new T.IcosahedronGeometry(.045,0),grain,-2.15+(j%9)*.18,.79,-2.08+Math.floor(j/9)*.29);s.scale.z=1.7;}
 // C: two industrial fans, their motors and vibration sensors.
 const fans:T.Group[]=[];
 for(const z of [1.05,2.35]){
  box(1.6,.18,.9,1.4,.45,z,steel);
  const housing=mesh(new T.TorusGeometry(.46,.095,8,40),steel,1.35,1.16,z+.19);
  const rotor=new T.Group();rotor.position.copy(housing.position);group.add(rotor);
  for(let b=0;b<5;b++){const blade=box(.14,.42,.06,0,.24,0,cream,rotor);const pivot=new T.Group();rotor.remove(blade);pivot.add(blade);pivot.rotation.z=b*Math.PI*2/5;rotor.add(pivot);}
  fans.push(rotor);const motor=cyl(.2,.65,1.35,1.16,z-.2,dark);motor.rotation.x=Math.PI/2;
  box(.16,.12,.12,1.92,.7,z,activeMats[2]);
 }
 // D: operator planning console. The screen proposes a schedule; it does not enact it.
 box(1.8,.65,.65,1.4,.7,-1.9,dark);box(1.9,.08,.85,1.4,1.08,-1.9,steel);
 box(1.7,.85,.1,1.4,1.55,-2.15,dark);
 const schedule:T.Mesh[]=[];
 for(let r=0;r<3;r++){box(1.45,.012,.015,1.4,1.78-r*.23,-2.088,steel);schedule.push(box(.55+r*.16,.095,.025,1.02+r*.14,1.73-r*.23,-2.07,activeMats[3]));}
 box(.3,.04,.18,1.95,1.15,-1.65,gold);
 // Centre: a physical operator pedestal with a restrained data halo.
 cyl(.32,.7,0,.7,0,dark);const core=cyl(.38,.12,0,1.1,0,activeMats[1]);
 const halo=mesh(new T.TorusGeometry(.57,.018,6,60),activeMats[1],0,1.3,0);halo.rotation.x=Math.PI/2;
 const flowCurves=zones.map(([x,z])=>new T.CatmullRomCurve3([new T.Vector3(x,1.3,z),new T.Vector3(x*.5,2.3,z*.5),new T.Vector3(0,1.4,0)]));
 const flowLines=flowCurves.map((curve,i)=>{const line=new T.Line(new T.BufferGeometry().setFromPoints(curve.getPoints(40)),new T.LineBasicMaterial({color:colors[i],transparent:true,opacity:.4}));group.add(line);return line;});
 const particles=flowCurves.map((curve,i)=>{const geo=new T.BufferGeometry();geo.setAttribute("position",new T.BufferAttribute(new Float32Array(36),3));const points=new T.Points(geo,new T.PointsMaterial({color:colors[i],size:.075,depthWrite:false}));points.frustumCulled=false;group.add(points);return {curve,points};});
 const warm=new T.BufferGeometry();warm.setAttribute("position",new T.BufferAttribute(new Float32Array(180),3));const warmPoints=new T.Points(warm,new T.PointsMaterial({color:0xf2b16a,size:.065,transparent:true,opacity:.7,depthWrite:false}));warmPoints.frustumCulled=false;group.add(warmPoints);
 const labels=[...zones.map(([x,z],i)=>({text:["A · Heat & airflow","B · Quality sensing","C · Fans & motors","D · Batch planning"][i],position:new T.Vector3(x+13,2.4,z-4.5)})),{text:"AI decision layer",position:new T.Vector3(13,1.85,-4.5)}];
 function tick(time:number,active:number){
  activeMats.forEach((m,i)=>{m.emissiveIntensity=i===active?.7:.12;});
  pads.forEach((p,i)=>{(p.material as T.LineBasicMaterial).opacity=i===active?.9:.2;});
  flowLines.forEach((p,i)=>{(p.material as T.LineBasicMaterial).opacity=i===active?.85:.2;});
  fans.forEach((fan,i)=>fan.rotation.z=time*(i===0?2:2.3));scan.position.z=-1.5+Math.sin(time)*.7;halo.rotation.z=time*.3;core.scale.setScalar(1+Math.sin(time*2)*.025);
  particles.forEach(({curve,points},i)=>{const pos=points.geometry.attributes.position;for(let j=0;j<12;j++){const p=curve.getPoint((time*.2+j/12)%1);pos.setXYZ(j,p.x,p.y,p.z);}pos.needsUpdate=true;(points.material as T.PointsMaterial).opacity=active===i?1:.25;});
  for(let i=0;i<60;i++){const f=(time*.22+i/60)%1;warm.attributes.position.setXYZ(i,-1.6+Math.sin(i*11)*.4,.5+f*1.4,1.6+Math.cos(i*9)*.5);}warm.attributes.position.needsUpdate=true;
  schedule.forEach((s,i)=>{s.scale.x=active===3?1+Math.sin(time*.6+i)*.12:1;});
 }
 return {group,tick,labels};
}
