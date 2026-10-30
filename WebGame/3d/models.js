// Model/grounding fixes (visual only). Rocks sat ~0.08 above ground; fishing spots showed a floating placeholder box.
export function initModels(){const B=window.B3,T=B.THREE,RK=/^(copper|tin|iron|coal|gold|gemrock|glim)$/;const st={rocks:0,fish:0};
 for(const o of B.M.objs){const g=o.grp;if(!g)continue;
  if(RK.test(o.type)){const mr=g.userData.mr;if(mr){mr.forEach(r=>{if(!r.attr)return;const a=r.attr.array;for(let i=r.start;i<r.start+r.count;i++)a[i*3+1]-=.09;r.attr.needsUpdate=true});st.rocks++}else{g.position.y-=.09;st.rocks++}}
  if(o.type.includes('fishing'))g.traverse(m=>{if(m.isMesh&&m.geometry.type==='BoxGeometry'){m.material=m.material.clone();m.material.transparent=true;m.material.opacity=0;m.material.depthWrite=false;st.fish++}})}
 const bx=new T.Box3();
 st.audit=()=>{const bad=[];for(const n of B.npcs){if(!n.g.visible)continue;bx.setFromObject(n.g);const d=bx.min.y-B.hAt(n.g.position.x,n.g.position.z);if(Math.abs(d)>.12&&n.d.kind!=='fireel'&&n.d.kind!=='bat')bad.push([n.d.kind,+d.toFixed(2)])}return bad};
 return st}
