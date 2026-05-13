import { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GLOBAL STYLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const GCSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Bebas+Neue&family=JetBrains+Mono:wght@400;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{width:100%;min-height:100%;overflow-x:hidden}
body{font-family:'Outfit',system-ui,sans-serif}
input[type=number]{-moz-appearance:textfield}
input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
input,button,textarea,select{font-family:inherit}
textarea{resize:vertical}
mark{background:rgba(0,212,170,0.2);color:inherit;border-radius:3px;padding:0 2px}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-thumb{background:rgba(0,212,170,0.3);border-radius:4px}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
.fade-up{animation:fadeUp .3s ease forwards}
.scale-in{animation:scaleIn .22s ease forwards}
.btn{transition:all .15s ease;cursor:pointer;border:none;outline:none}
.btn:hover{opacity:.85;transform:translateY(-1px)}
.btn:active{transform:translateY(1px)}
`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THEME
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const TH = (d) => d ? {
  bg:"#07090F", card:"#0E1525", sub:"#111B2E", sub2:"#16223A",
  border:"rgba(255,255,255,0.07)", text:"#E2E8F0", muted:"rgba(226,232,240,0.38)",
  acc:"#00D4AA", acc2:"#3B82F6", hdr:"rgba(7,9,15,0.92)", inp:"rgba(255,255,255,0.05)"
} : {
  bg:"#EFF2F7", card:"#FFFFFF", sub:"#F1F5F9", sub2:"#E8EDF5",
  border:"rgba(0,0,0,0.08)", text:"#111827", muted:"rgba(17,24,39,0.45)",
  acc:"#00A896", acc2:"#2563EB", hdr:"rgba(239,242,247,0.92)", inp:"rgba(0,0,0,0.04)"
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CGPA STAGE DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STAGES = [
  {id:0,label:"1st",full:"First Stage",arabic:"المرحلة الأولى",color:"#60A5FA",weight:5,subjects:[{en:"Anatomy",ar:"التشريح",u:8},{en:"Medical Biology",ar:"الاحياء الطبية",u:6},{en:"Medical Chemistry",ar:"الكيمياء الطبية",u:6},{en:"Medical Physics",ar:"الفيزياء الطبية",u:6},{en:"English Language",ar:"اللغة الانكليزية",u:4},{en:"Computer Science",ar:"الحاسبات",u:3},{en:"Medical Terminology",ar:"المصطلحات الطبية",u:2},{en:"Basics of Medicine",ar:"اساسيات الطب",u:2},{en:"Democracy & Human Rights",ar:"الديمقراطية وحقوق الانسان",u:2}]},
  {id:1,label:"2nd",full:"Second Stage",arabic:"المرحلة الثانية",color:"#A78BFA",weight:5,subjects:[{en:"Physiology",ar:"فسلجة",u:13},{en:"Anatomy",ar:"التشريح",u:10},{en:"Biochemistry",ar:"الكيمياء الحياتية",u:8},{en:"Histology",ar:"الانسجة",u:6},{en:"Embryology",ar:"الاجنة",u:2},{en:"Baath Party Crimes",ar:"جرائم حزب البعث",u:2}]},
  {id:2,label:"3rd",full:"Third Stage",arabic:"المرحلة الثالثة",color:"#F87171",weight:5,subjects:[{en:"Pathology",ar:"الامراض",u:11},{en:"Microbiology",ar:"الجراثيم",u:9},{en:"Pharmacology",ar:"الادوية",u:8},{en:"Parasitology",ar:"الطفيليات",u:5},{en:"Internal Medicine",ar:"الطب الباطني",u:5},{en:"Community Medicine",ar:"طب الاسرة والمجتمع",u:3},{en:"Surgery",ar:"الجراحة",u:2}]},
  {id:3,label:"4th",full:"Fourth Stage",arabic:"المرحلة الرابعة",color:"#FBBF24",weight:20,subjects:[{en:"Medicine",ar:"الطب الباطني",u:13},{en:"Surgery",ar:"الجراحة",u:11},{en:"Community Medicine",ar:"طب الاسرة والمجتمع",u:11},{en:"Obstetrics",ar:"التوليد",u:6},{en:"Forensic Medicine",ar:"الطب العدلي",u:6},{en:"Pediatrics",ar:"طب الاطفال",u:2},{en:"Medical Ethics",ar:"اخلاقيات المهنة",u:2},{en:"Psychology",ar:"علم النفس",u:2}]},
  {id:4,label:"5th",full:"Fifth Stage",arabic:"المرحلة الخامسة",color:"#34D399",weight:25,subjects:[{en:"Internal Medicine",ar:"الطب الباطني",u:7},{en:"Minor Surgery",ar:"جراحات فرعية",u:6},{en:"Gynecology",ar:"النسائية",u:5.5},{en:"Pediatrics",ar:"طب الاطفال",u:5.5},{en:"Psychiatry",ar:"الطب النفسي",u:4.5},{en:"Orthopedics",ar:"الكسور",u:4.5},{en:"Dermatology",ar:"الامراض الجلدية",u:3.5},{en:"Radiology",ar:"الاشعة",u:3},{en:"ENT",ar:"الانف والاذن والحنجرة",u:3},{en:"Ophthalmology",ar:"العيون",u:3}]},
  {id:5,label:"6th",full:"Sixth Stage",arabic:"المرحلة السادسة",color:"#22D3EE",weight:40,subjects:[{en:"Internal Medicine (Rotation)",ar:"طب باطني",u:12},{en:"Surgery (Rotation)",ar:"جراحة",u:12},{en:"Gynecology (Rotation)",ar:"نسائية",u:12},{en:"Pediatrics (Rotation)",ar:"طب الاطفال",u:12}]},
];
const TOTAL_UNITS = STAGES.reduce((a,s)=>a+s.subjects.reduce((b,x)=>b+x.u,0),0);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const classify=(g)=>{if(g==null||g===0)return null;if(g>=90)return{label:"Excellent",ar:"امتياز",color:"#10B981"};if(g>=80)return{label:"Very Good",ar:"جيد جداً",color:"#60A5FA"};if(g>=70)return{label:"Good",ar:"جيد",color:"#A78BFA"};if(g>=60)return{label:"Medium",ar:"متوسط",color:"#FBBF24"};if(g>=50)return{label:"Acceptable",ar:"مقبول",color:"#F97316"};return{label:"Fail",ar:"راسب",color:"#EF4444"};};
const gc=(g)=>{if(g==null)return"#888";if(g>=90)return"#10B981";if(g>=80)return"#60A5FA";if(g>=70)return"#A78BFA";if(g>=60)return"#FBBF24";if(g>=50)return"#F97316";return"#EF4444";};
const diffC=(d)=>({Easy:"#10B981",Medium:"#FBBF24",Hard:"#EF4444"}[d]||"#888");
const fmtTime=(s)=>`${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;
const shuffle=(a)=>[...a].sort(()=>Math.random()-.5);
const WD=(g,u,total,w)=>g==null||total===0?null:(g/100)*(u/total)*w;
const hlStem=(t)=>t?.replace(/(most likely|next best step|most appropriate|best initial|diagnosis|which of the following|first-line|what is the)/gi,"<mark>$1</mark>")||t;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SAMPLE FALLBACK QUESTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SAMPLE_QS = [
  {id:"q1",system:"Cardiology",subject:"Internal Medicine",difficulty:"Medium",text:"Which ECG finding is most specific for prior MI?",options:["ST elevation","ST depression","T wave inversion","Prolonged QT interval","Pathological Q wave"],correctAnswer:"Pathological Q wave",explanation:"Pathological Q waves indicate transmural infarction.",educationalObjective:"Recognize ECG signs of prior MI.",tags:["ECG","MI"],hint:"Think about permanent changes.",imageUrl:null,type:"single"},
  {id:"q2",system:"Respiratory",subject:"Internal Medicine",difficulty:"Medium",text:"A 60-year-old patient presents with pleuritic chest pain and a pericardial rub that has persisted for 4 weeks and fever following MI.",options:["Recurrent MI","Pulmonary embolism","Ventricular aneurysm","Infectious pericarditis","Dressler's syndrome"],correctAnswer:"Dressler's syndrome",explanation:"Dressler's syndrome is post-MI pericarditis.",educationalObjective:"Differentiate early from late post-MI pericarditis.",tags:["MI","Pericarditis"],hint:"Timing is key.",imageUrl:null,type:"single"},
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CGPA CALCULATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CGPAView({dark}) {
  const C=TH(dark);
  const [grades,setGrades]=useState({});
  const [activeStage,setActiveStage]=useState(0);
  const [targetAvg,setTargetAvg]=useState(85);
  const [tab,setTab]=useState("grades");

  useEffect(()=>{const saved=localStorage.getItem("cgpa-v20");if(saved)try{const p=JSON.parse(saved);if(p.grades)setGrades(p.grades);if(p.targetAvg)setTargetAvg(p.targetAvg);}catch(e){}},[]);
  useEffect(()=>{localStorage.setItem("cgpa-v20",JSON.stringify({grades,targetAvg}));},[grades,targetAvg]);

  const setGrade=useCallback((sid,idx,raw)=>{const key=`${sid}-${idx}`;setGrades(prev=>{if(raw===""||raw==null){const n={...prev};delete n[key];return n;}const v=parseFloat(raw);return isNaN(v)?prev:{...prev,[key]:Math.min(100,Math.max(0,v))};});},[]);

  const metrics=useMemo(()=>{
    let scoreSum=0,completedWeight=0,gradedU=0,completedWD=0;
    const perStage=STAGES.map(stage=>{
      let sW=0,sU=0;const tot=stage.subjects.reduce((a,s)=>a+s.u,0);let totalWD=0;
      stage.subjects.forEach((sub,i)=>{const g=grades[`${stage.id}-${i}`];if(g!=null){sW+=g*sub.u;sU+=sub.u;const w=WD(g,sub.u,tot,stage.weight);if(w!=null)totalWD+=w;}});
      const avg=sU>0?sW/sU:null,complete=tot>0&&sU===tot;
      if(complete&&avg!=null){scoreSum+=avg*stage.weight;completedWeight+=stage.weight;completedWD+=totalWD;}
      gradedU+=sU;
      return{avg,gradedU:sU,totalU:tot,pct:tot>0?sU/tot:0,complete,weight:stage.weight,totalWD};
    });
    const remainW=100-completedWeight;
    const needed=remainW>0?(targetAvg*100-scoreSum)/remainW:null;
    return{perStage,gradedU,completedWeight,remainW,needed,completedWD};
  },[grades,targetAvg]);

  const stage=STAGES[activeStage],sm=metrics.perStage[activeStage];
  const stageTot=stage.subjects.reduce((a,s)=>a+s.u,0);
  const radarData=stage.subjects.map((sub,i)=>({s:sub.en.length>10?sub.en.slice(0,10)+"…":sub.en,g:grades[`${stage.id}-${i}`]??0}));
  const barData=STAGES.map((s,i)=>({label:s.label,avg:metrics.perStage[i].avg??0,color:s.color}));
  const allGraded=STAGES.flatMap((s,si)=>s.subjects.map((sub,i)=>{const g=grades[`${s.id}-${i}`];return g!=null?{en:sub.en,ar:sub.ar,g,u:sub.u,stage:s.label,color:s.color}:null;}).filter(Boolean));
  const best=allGraded.length?allGraded.reduce((a,b)=>b.g>a.g?b:a):null;
  const worst=allGraded.length?allGraded.reduce((a,b)=>b.g<a.g?b:a):null;
  const failing=allGraded.filter(x=>x.g<50);

  return(
    <div style={{minHeight:"100dvh",background:C.bg,color:C.text}}>
      {/* Metrics strip */}
      <div style={{padding:"20px 28px",borderBottom:`1px solid ${C.border}`,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16}}>
        <div style={{background:`linear-gradient(135deg,rgba(0,212,170,.12),rgba(59,130,246,.06))`,border:"1px solid rgba(0,212,170,0.25)",borderRadius:18,padding:"18px 22px"}}><div style={{fontSize:10,color:"#00D4AA",fontWeight:700,letterSpacing:2}}>STAGE DEGREE SUM</div><div style={{fontSize:56,lineHeight:1,fontFamily:"'Bebas Neue'",color:"#00D4AA"}}>{metrics.completedWD.toFixed(2)}</div><div style={{fontSize:10,color:C.muted,fontFamily:"'JetBrains Mono'"}}>/100</div></div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:"18px 22px"}}><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:2}}>REMAINING WEIGHT</div><div style={{fontSize:48,lineHeight:1,fontFamily:"'Bebas Neue'",color:"#60A5FA"}}>{metrics.remainW.toFixed(0)}</div><div style={{fontSize:10,color:C.muted}}>to reach 100%</div></div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:"18px 22px"}}><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:2}}>CURRENT STAGE CLASS</div><div style={{fontSize:24,fontWeight:800,color:classify(sm.avg)?.color??C.muted}}>{classify(sm.avg)?.label??"—"}</div><div style={{fontSize:16,color:classify(sm.avg)?.color??C.muted,direction:"rtl",textAlign:"left",opacity:.8}}>{classify(sm.avg)?.ar??"أدخل الدرجات"}</div></div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:"18px 22px"}}><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:2}}>UNITS GRADED</div><div style={{fontSize:28,fontWeight:800,fontFamily:"'JetBrains Mono'"}}>{metrics.gradedU%1===0?metrics.gradedU:metrics.gradedU.toFixed(1)}<span style={{fontSize:13,color:C.muted,fontWeight:400}}> / {TOTAL_UNITS}</span></div><div style={{height:5,background:dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)",borderRadius:3,marginTop:10,overflow:"hidden"}}><div style={{height:"100%",background:"linear-gradient(90deg,#00D4AA,#3B82F6)",width:`${(metrics.gradedU/TOTAL_UNITS)*100}%`}}/></div></div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:"18px 22px"}}><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:2}}>TARGET AVERAGE</div><input type="number" min={50} max={100} step={0.5} value={targetAvg} onChange={e=>setTargetAvg(parseFloat(e.target.value)||0)} style={{width:"100%",background:"transparent",border:"none",outline:"none",fontSize:32,fontFamily:"'Bebas Neue'",letterSpacing:2,color:C.text}}/>{metrics.needed!=null&&<div style={{fontSize:11,fontWeight:700,marginTop:4,color:metrics.needed<0?"#10B981":metrics.needed>100?"#EF4444":"#FBBF24"}}>{metrics.needed<0?"✓ Target achieved!":metrics.needed>100?"✗ Not achievable":`Need ${metrics.needed.toFixed(1)} avg remaining`}</div>}</div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:4,padding:"12px 28px",borderBottom:`1px solid ${C.border}`}}>
        {[["grades","Grades"],["details","Visual Fingerprint"],["insights","Insights"]].map(([k,l])=><button key={k} className="btn" onClick={()=>setTab(k)} style={{padding:"8px 18px",borderRadius:10,background:tab===k?(dark?"rgba(255,255,255,.1)":"rgba(0,0,0,.08)"):"transparent",color:tab===k?C.text:C.muted,fontWeight:600,fontSize:12}}>{l}</button>)}
      </div>

      {tab==="grades"&&(
        <div style={{display:"grid",gridTemplateColumns:"220px 1fr",minHeight:"calc(100dvh - 280px)"}}>
          {/* شريط المراحل الجانبي */}
          <div style={{borderRight:`1px solid ${C.border}`,padding:16,display:"flex",flexDirection:"column",gap:4,overflowY:"auto"}}>
            {STAGES.map((s,idx)=>{const sp=metrics.perStage[idx],act=activeStage===idx;return(<button key={idx} className="btn" onClick={()=>setActiveStage(idx)} style={{width:"100%",textAlign:"left",padding:"11px 13px",borderRadius:11,background:act?`${s.color}15`:"transparent",borderLeft:`3px solid ${act?s.color:"transparent"}`,opacity:act?1:.5}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:13,fontWeight:700,color:act?s.color:C.text,fontFamily:"'Bebas Neue'",letterSpacing:1.5}}>{s.full}</div><div style={{fontSize:9,color:C.muted,fontFamily:"'JetBrains Mono'"}}>{s.weight}% Weight</div></div><div style={{textAlign:"right"}}>{sp.avg!=null?(<><div style={{fontSize:17,fontWeight:900,fontFamily:"'Bebas Neue'",color:gc(sp.avg)}}>{sp.avg.toFixed(1)}</div><div style={{fontSize:9,color:C.muted,fontFamily:"'JetBrains Mono'"}}>{sp.complete?`+${s.weight}/${s.weight}`:`0/${s.weight}`}</div></>):(<div style={{fontSize:17,fontFamily:"'Bebas Neue'",color:C.muted}}>—</div>)}</div></div>{sp.gradedU>0&&<div style={{height:2,background:dark?"rgba(255,255,255,.06)":"rgba(0,0,0,.08)",borderRadius:1,marginTop:7}}><div style={{height:"100%",background:s.color,width:`${sp.pct*100}%`}}/></div>}</button>);})}
          </div>

          {/* المحتوى الرئيسي */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 360px"}}>
            <div className="fade-up" style={{padding:28,borderRight:`1px solid ${C.border}`,overflowY:"auto"}}>
              {/* عنوان المرحلة في المنتصف */}
              <div style={{textAlign:"center",marginBottom:24}}>
                <div style={{display:"inline-block",background:`${stage.color}20`,borderRadius:60,padding:"8px 24px",marginBottom:12}}>
                  <span style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:3,color:stage.color}}>{stage.full}</span>
                </div>
                <div style={{fontSize:14,color:C.muted,marginTop:4}}>{stage.arabic} — {stage.weight}% من المعدل التراكمي</div>
                {sm.avg!=null && (
                  <div style={{marginTop:12}}>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:42,lineHeight:1,color:gc(sm.avg),letterSpacing:2}}>{sm.avg.toFixed(2)}</div>
                    <div style={{fontSize:12,color:classify(sm.avg)?.color,fontWeight:700,marginTop:4}}>{classify(sm.avg)?.label} · {classify(sm.avg)?.ar}</div>
                  </div>
                )}
              </div>

              {/* جدول المواد بأعمدة ثابتة */}
              <div style={{display:"grid", gridTemplateColumns:"60px 1fr 100px 100px 80px", gap:"8px 12px", alignItems:"center"}}>
                {stage.subjects.map((sub,i)=>{
                  const g=grades[`${stage.id}-${i}`];
                  const cls=classify(g);
                  const gco=gc(g);
                  const wd=WD(g,sub.u,stageTot,stage.weight);
                  return(
                    <Fragment key={i}>
                      <div style={{textAlign:"center",background:`${stage.color}20`,borderRadius:8,padding:"4px 0",fontSize:14,fontWeight:700,color:stage.color}}>{sub.u}</div>
                      <div>
                        <div style={{fontWeight:600}}>{sub.en}</div>
                        <div style={{fontSize:12,color:C.muted,marginTop:2,textAlign:"right",direction:"rtl"}}>{sub.ar}</div>
                      </div>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:12,background:wd!=null?"rgba(251,191,36,0.12)":"transparent",padding:"4px 8px",borderRadius:12,textAlign:"center",minWidth:80}}>
                        {wd!=null ? wd.toFixed(5) : ""}
                      </div>
                      <div style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:12,background:cls?`${cls.color}18`:"transparent",color:cls?.color||C.muted,textAlign:"center"}}>
                        {cls?.label || ""}
                      </div>
                      <input type="number" min={0} max={100} step={0.5} placeholder="—" value={g??""} onChange={e=>setGrade(stage.id,i,e.target.value)} style={{width:70,height:38,textAlign:"center",borderRadius:10,background:dark?"rgba(255,255,255,.05)":"rgba(0,0,0,.05)",border:`1.5px solid ${g!=null?gco+"60":C.border}`,color:g!=null?gco:C.text,fontSize:14,fontWeight:800,fontFamily:"'JetBrains Mono'",outline:"none"}}/>
                    </Fragment>
                  );
                })}
              </div>
              {sm.totalWD>0&&<div style={{marginTop:18,textAlign:"right",borderTop:`1px solid ${C.border}`,paddingTop:14}}><div style={{fontSize:11,color:C.muted,letterSpacing:1}}>Stage Weighted Degree</div><div style={{fontFamily:"'Bebas Neue'",fontSize:32,color:"#FBBF24"}}>{sm.totalWD.toFixed(5)}</div><div style={{fontSize:10,color:C.muted}}>Max = {stage.weight}</div></div>}
            </div>

            {/* الشريط الجانبي الأيمن */}
            <div style={{padding:28,display:"flex",flexDirection:"column",gap:22,overflowY:"auto"}}>
              <div><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:2}}>STAGE RADAR</div><ResponsiveContainer width="100%" height={240}><RadarChart data={radarData} margin={{top:8,right:8,bottom:8,left:8}}><PolarGrid stroke={dark?"rgba(255,255,255,.07)":"rgba(0,0,0,.1)"}/><PolarAngleAxis dataKey="s" tick={{fontSize:9,fill:C.muted}}/><Radar dataKey="g" stroke={stage.color} fill={stage.color} fillOpacity={.18} strokeWidth={2}/><Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10}} formatter={v=>[v||"—","Grade"]}/></RadarChart></ResponsiveContainer></div>
              <div style={{background:C.sub,borderRadius:14,padding:16}}><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:2}}>STAGE BREAKDOWN</div>{(()=>{const items=stage.subjects.map((s,i)=>({...s,g:grades[`${stage.id}-${i}`]})).filter(s=>s.g!=null);if(!items.length)return<div style={{fontSize:12,color:C.muted,fontStyle:"italic"}}>Enter grades to see breakdown</div>;const b=items.reduce((a,x)=>x.g>a.g?x:a),w=items.reduce((a,x)=>x.g<a.g?x:a);return(<div style={{display:"flex",flexDirection:"column",gap:9}}>{[["↑ Best",b.en,"#10B981"],["↓ Weakest",w.en,"#FBBF24"],["Graded",`${items.length}/${stage.subjects.length}`,C.text],["Classification",classify(sm.avg)?.label??"",classify(sm.avg)?.color??C.muted]].map(([l,v,c])=><div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:12,gap:8}}><span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:700}}>{v}</span></div>)}</div>);})()}</div>
              <div><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:2}}>ALL STAGES</div><ResponsiveContainer width="100%" height={120}><BarChart data={barData} margin={{top:0,right:0,bottom:0,left:-20}}><CartesianGrid strokeDasharray="3 3" stroke={dark?"rgba(255,255,255,.05)":"rgba(0,0,0,.07)"} vertical={false}/><XAxis dataKey="label" tick={{fontSize:10,fill:C.muted}} axisLine={false} tickLine={false}/><YAxis domain={[0,100]} tick={{fontSize:9,fill:C.muted}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10}} formatter={v=>[v?v.toFixed(1):"—","Avg"]}/><Bar dataKey="avg" radius={[5,5,0,0]}>{barData.map((_,i)=><Cell key={i} fill={STAGES[i].color} fillOpacity={activeStage===i?1:.35}/>)}</Bar></BarChart></ResponsiveContainer></div>
            </div>
          </div>
        </div>
      )}

      {tab==="details"&&(
        <div className="fade-up" style={{padding:32}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:30,letterSpacing:4,marginBottom:6}}>VISUAL FINGERPRINT</div>
          <div style={{fontSize:12,color:C.muted,marginBottom:22}}>Each block represents one subject — width proportional to credit units, color reflects grade. Click any block to navigate.</div>
          <div style={{display:"flex",gap:18,marginBottom:24,flexWrap:"wrap"}}>{[["≥90 Excellent","#10B981"],["≥80 Very Good","#60A5FA"],["≥70 Good","#A78BFA"],["≥60 Medium","#FBBF24"],["≥50 Acceptable","#F97316"],["<50 Fail","#EF4444"],["Not entered",dark?"rgba(255,255,255,.08)":"rgba(0,0,0,.06)"]].map(([l,c])=>(<div key={l} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:C.muted}}><div style={{width:10,height:10,borderRadius:3,background:c}}/>{l}</div>))}</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {STAGES.map((s,si)=>{const sp=metrics.perStage[si];return(
              <div key={si} style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:110,flexShrink:0,textAlign:"right",fontFamily:"'Bebas Neue'",fontSize:13,letterSpacing:2,color:s.color}}>
                  <div>{s.full}</div><div style={{fontSize:9,color:C.muted,fontFamily:"'JetBrains Mono'"}}>{s.weight}% wt</div>
                </div>
                <div style={{display:"flex",gap:3,flex:1,overflowX:"auto",paddingBottom:3}}>
                  {s.subjects.map((sub,i)=>{
                    const g=grades[`${s.id}-${i}`];
                    const gco=g!=null?gc(g):null;
                    const w=Math.max(28,sub.u*15);
                    return(
                      <div key={i} title={`${sub.en} (${sub.u}u)${g!=null?`: ${g}`:""}`} onClick={()=>{setActiveStage(si);setTab("grades");}} style={{width:w,height:46,borderRadius:7,flexShrink:0,background:gco||(dark?"rgba(255,255,255,.05)":"rgba(0,0,0,.06)"),border:`1px solid ${gco?gco+"40":C.border}`,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,transition:"transform .14s",opacity:g!=null?.92:.4}} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform=""}>
                        {g!=null&&<span style={{fontSize:10,fontWeight:900,color:"white",fontFamily:"'JetBrains Mono'",textShadow:"0 1px 4px rgba(0,0,0,.7)"}}>{g}</span>}
                        <span style={{fontSize:7,color:g!=null?"rgba(255,255,255,.7)":C.muted,textAlign:"center",lineHeight:1.2,maxWidth:w-6,overflow:"hidden"}}>{sub.en.length>Math.floor(w/5)?sub.en.slice(0,Math.floor(w/5))+"…":sub.en}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{width:68,flexShrink:0,textAlign:"center",background:sp.avg!=null?`${gc(sp.avg)}18`:C.sub,border:`1px solid ${sp.avg!=null?gc(sp.avg)+"40":C.border}`,borderRadius:9,padding:"7px 9px"}}>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:sp.avg!=null?gc(sp.avg):C.muted}}>{sp.avg?.toFixed(1)??"—"}</div>
                  <div style={{fontSize:8,color:C.muted,fontWeight:600}}>AVG</div>
                </div>
              </div>
            );})}
          </div>
        </div>
      )}

      {tab==="insights"&&(
        <div className="fade-up" style={{padding:32,display:"grid",gridTemplateColumns:"1fr 1fr",gap:22}}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:26}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:2}}>ACADEMIC PROFILE</div>
            {allGraded.length===0?<div style={{fontSize:13,color:C.muted,fontStyle:"italic"}}>Enter grades to generate insights.</div>:
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {[["🏆 Highest",best,"#10B981"],["📉 Lowest",worst,"#FBBF24"]].map(([l,item,c])=>item&&<div key={l} style={{padding:"13px 15px",borderRadius:13,background:C.sub}}><div style={{fontSize:10,color:C.muted,letterSpacing:1.5}}>{l.toUpperCase()}</div><div style={{fontSize:13,fontWeight:700,color:c}}>{item.en} — {item.g}</div><div style={{fontSize:11,color:C.muted}}>{item.stage} · {item.u} units</div></div>)}
              {failing.length>0&&<div style={{padding:"13px 15px",borderRadius:13,background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.25)"}}><div style={{fontSize:10,color:"#EF4444",fontWeight:700}}>⚠ FAILING</div><div style={{fontSize:12,color:"#EF4444"}}>{failing.map(x=>x.en).join(", ")}</div></div>}
              <div style={{padding:"13px 15px",borderRadius:13,background:C.sub}}><div style={{fontSize:10,color:C.muted,letterSpacing:1.5}}>SUBJECTS ENTERED</div><div style={{fontSize:13,fontWeight:700}}>{allGraded.length} of {STAGES.reduce((a,s)=>a+s.subjects.length,0)} ({((allGraded.length/STAGES.reduce((a,s)=>a+s.subjects.length,0))*100).toFixed(0)}%)</div></div>
            </div>}
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:26}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:2}}>TARGET CALCULATOR</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}>{[50,60,70,80,90,95].map(v=><button key={v} className="btn" onClick={()=>setTargetAvg(v)} style={{padding:"7px 14px",borderRadius:9,border:`1px solid ${targetAvg===v?gc(v)+"80":C.border}`,background:targetAvg===v?`${gc(v)}15`:"transparent",color:targetAvg===v?gc(v):C.muted,fontWeight:700,fontSize:14,fontFamily:"'JetBrains Mono'"}}>{v}</button>)}</div>
            <div style={{padding:18,borderRadius:14,marginBottom:16,background:metrics.needed==null?C.sub:metrics.needed<0?"rgba(16,185,129,.1)":metrics.needed>100?"rgba(239,68,68,.1)":"rgba(251,191,36,.1)",border:`1px solid ${metrics.needed==null?C.border:metrics.needed<0?"rgba(16,185,129,.3)":metrics.needed>100?"rgba(239,68,68,.3)":"rgba(251,191,36,.3)"}`}}>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:2}}>NEEDED IN REMAINING {metrics.remainW.toFixed(0)}% WEIGHT</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:52,letterSpacing:3,color:metrics.needed==null?C.muted:metrics.needed<0?"#10B981":metrics.needed>100?"#EF4444":"#FBBF24"}}>{metrics.needed==null?"——":metrics.needed<0?"ACHIEVED ✓":metrics.needed>100?"IMPOSSIBLE":metrics.needed.toFixed(2)}</div>
            </div>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:2}}>PER-STAGE PROGRESS</div>
            {STAGES.map((s,i)=>{const sp=metrics.perStage[i];return(
              <div key={i} style={{marginBottom:9}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span>{s.full} <span style={{opacity:.5}}>({s.weight}%)</span></span><span style={{color:sp.avg!=null?gc(sp.avg):C.muted,fontFamily:"'JetBrains Mono'",fontWeight:700}}>{sp.avg!=null?`${sp.avg.toFixed(1)}%`:"—"}</span></div>
                <div style={{height:5,background:dark?"rgba(255,255,255,.07)":"rgba(0,0,0,.07)",borderRadius:3}}><div style={{height:"100%",borderRadius:3,background:sp.avg!=null?gc(sp.avg):C.border,width:`${sp.pct*100}%`}}/></div>
              </div>
            );})}
          </div>
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LIBRARY COMPONENT (Qbank)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Library({ questions, bankQuestionsList, previousExamsList, onStart, dark }) {
  const C = TH(dark);
  const [source, setSource] = useState("all");
  const [selectedSystem, setSelectedSystem] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PER = 12;

  const currentQuestions = useMemo(() => {
    if (source === "bank") return bankQuestionsList;
    if (source === "previous") return previousExamsList;
    return questions;
  }, [source, questions, bankQuestionsList, previousExamsList]);

  const systemStats = useMemo(() => {
    const stats = { all: currentQuestions.length };
    currentQuestions.forEach(q => {
      const sys = q.system || "General";
      stats[sys] = (stats[sys] || 0) + 1;
    });
    return stats;
  }, [currentQuestions]);

  const systemList = useMemo(() => {
    const systems = new Set(currentQuestions.map(q => q.system || "General"));
    return Array.from(systems).sort();
  }, [currentQuestions]);

  const filteredBySystem = useMemo(() => {
    if (selectedSystem === "all") return currentQuestions;
    return currentQuestions.filter(q => (q.system || "General") === selectedSystem);
  }, [currentQuestions, selectedSystem]);

  const filtered = useMemo(() => {
    if (!search) return filteredBySystem;
    const term = search.toLowerCase();
    return filteredBySystem.filter(q =>
      q.text?.toLowerCase().includes(term) ||
      q.system?.toLowerCase().includes(term) ||
      q.subject?.toLowerCase().includes(term) ||
      q.tags?.some(t => t.toLowerCase().includes(term))
    );
  }, [filteredBySystem, search]);

  const paged = filtered.slice(page * PER, (page + 1) * PER);
  const pages = Math.ceil(filtered.length / PER);

  return (
    <div className="fade-up" style={{ minHeight: "100dvh", background: C.bg, color: C.text, padding: "32px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 42, letterSpacing: 4, color: C.acc, marginBottom: 8 }}>QUESTION LIBRARY</h1>
        <p style={{ color: C.muted, fontSize: 14 }}>Browse and start a practice session from {currentQuestions.length} questions.</p>
      </div>

      {/* أزرار المصدر */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 24 }}>
        <button onClick={() => { setSource("all"); setSelectedSystem("all"); setPage(0); }} style={{ padding: "8px 20px", borderRadius: 40, background: source === "all" ? `linear-gradient(135deg, ${C.acc}, ${C.acc2})` : C.inp, color: source === "all" ? "white" : C.text, border: `1px solid ${source === "all" ? "transparent" : C.border}`, cursor: "pointer", fontWeight: 600 }}>📚 All Questions ({questions.length})</button>
        <button onClick={() => { setSource("bank"); setSelectedSystem("all"); setPage(0); }} style={{ padding: "8px 20px", borderRadius: 40, background: source === "bank" ? `linear-gradient(135deg, ${C.acc}, ${C.acc2})` : C.inp, color: source === "bank" ? "white" : C.text, border: `1px solid ${source === "bank" ? "transparent" : C.border}`, cursor: "pointer", fontWeight: 600 }}>📖 Bank Questions ({bankQuestionsList.length})</button>
        <button onClick={() => { setSource("previous"); setSelectedSystem("all"); setPage(0); }} style={{ padding: "8px 20px", borderRadius: 40, background: source === "previous" ? `linear-gradient(135deg, ${C.acc}, ${C.acc2})` : C.inp, color: source === "previous" ? "white" : C.text, border: `1px solid ${source === "previous" ? "transparent" : C.border}`, cursor: "pointer", fontWeight: 600 }}>📝 Previous Exams ({previousExamsList.length})</button>
      </div>

      {/* أزرار الأنظمة */}
      {source !== "previous" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 32 }}>
          <button onClick={() => setSelectedSystem("all")} style={{ padding: "6px 16px", borderRadius: 40, background: selectedSystem === "all" ? C.acc : C.inp, color: selectedSystem === "all" ? "white" : C.text, border: `1px solid ${C.border}`, cursor: "pointer" }}>All Systems ({systemStats.all})</button>
          {systemList.filter(sys => sys !== "Previous Exams").map(sys => (
            <button key={sys} onClick={() => setSelectedSystem(sys)} style={{ padding: "6px 16px", borderRadius: 40, background: selectedSystem === sys ? C.acc : C.inp, color: selectedSystem === sys ? "white" : C.text, border: `1px solid ${C.border}`, cursor: "pointer" }}>{sys} ({systemStats[sys]})</button>
          ))}
        </div>
      )}

      {/* زر بدء الجلسة في المنتصف */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <button onClick={onStart} className="btn" style={{ padding: "12px 32px", borderRadius: 40, background: `linear-gradient(135deg, ${C.acc}, ${C.acc2})`, color: "white", fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>🚀 START NEW SESSION</button>
      </div>

      {/* شريط البحث */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 300 }}>
          <input type="text" placeholder="Search questions..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} style={{ width: "100%", padding: "10px 16px 10px 40px", borderRadius: 40, border: `1px solid ${C.border}`, background: C.inp, color: C.text, fontSize: 13, outline: "none" }} />
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: C.muted }}>🔍</span>
        </div>
      </div>

      {/* قائمة الأسئلة */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, color: C.acc }}>QUESTIONS <span style={{ color: C.muted }}>({filtered.length})</span></div><div style={{ fontSize: 12, color: C.muted }}>Page {page + 1}/{pages}</div></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {paged.map((q, idx) => (
            <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 14, background: C.sub }}>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, fontWeight: 700, color: C.acc, minWidth: 36 }}>Q{page * PER + idx + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.text}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 11, color: C.muted }}><span>📚 {q.system || "General"}</span><span>📖 {q.subject || "—"}</span>{q.difficulty && <span style={{ color: diffC(q.difficulty), fontWeight: 600 }}>{q.difficulty}</span>}</div>
              </div>
              <div style={{ fontSize: 11, color: C.muted }}>{q.options?.length || 0} opts</div>
            </div>
          ))}
        </div>
        {pages > 1 && <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}><button className="btn" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: "6px 14px", borderRadius: 40, border: `1px solid ${C.border}`, background: C.inp, opacity: page === 0 ? 0.4 : 1 }}>← Prev</button><span style={{ padding: "6px 12px", fontSize: 13, color: C.muted }}>{page + 1} / {pages}</span><button className="btn" onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page === pages - 1} style={{ padding: "6px 14px", borderRadius: 40, border: `1px solid ${C.border}`, background: C.inp, opacity: page === pages - 1 ? 0.4 : 1 }}>Next →</button></div>}
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SESSION CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SessionConfig({questions, onStart, onBack, dark}) {
  const C=TH(dark);
  const allSystems=[...new Set(questions.map(q=>q.system||"General"))].sort();
  const allDiffs=["Easy","Medium","Hard"];
  const [name,setName]=useState("Custom Session");
  const [mode,setMode]=useState("study");
  const [systems,setSystems]=useState(new Set(allSystems));
  const [diffs,setDiffs]=useState(new Set(allDiffs));
  const [count,setCount]=useState(Math.min(10,questions.length));
  const [randomize,setRandomize]=useState(true);
  const [timeLimit,setTimeLimit]=useState(60);
  const available=questions.filter(q=>systems.has(q.system||"General")&&diffs.has(q.difficulty||"Medium"));
  const finalCount=Math.min(count,available.length);
  const toggleSet=(set,setFn,val)=>setFn(prev=>{const n=new Set(prev);n.has(val)?n.delete(val):n.add(val);return n;});
  const handleStart=()=>{
    let qs=available.slice();
    if(randomize)qs=shuffle(qs);
    qs=qs.slice(0,finalCount);
    if(!qs.length) alert("No questions match your filters.");
    else onStart({name,mode,timeLimit:timeLimit*60,questions:qs,startTime:Date.now()});
  };
  return (
    <div className="fade-up" style={{padding:"32px 24px",maxWidth:800,margin:"0 auto",background:C.bg,color:C.text,minHeight:"100dvh"}}>
      <div style={{display:"flex",gap:16,marginBottom:28}}><button onClick={onBack} className="btn" style={{padding:"8px 16px",borderRadius:12,border:`1px solid ${C.border}`,background:C.inp}}>← Library</button><h2 style={{fontFamily:"'Bebas Neue'",fontSize:32,color:C.acc}}>SESSION SETUP</h2></div>
      <div style={{background:C.card,borderRadius:24,border:`1px solid ${C.border}`,padding:24,display:"flex",flexDirection:"column",gap:24}}>
        <div><label style={{fontSize:11,fontWeight:700,letterSpacing:1,color:C.muted}}>SESSION NAME</label><input value={name} onChange={e=>setName(e.target.value)} style={{width:"100%",marginTop:6,padding:"10px 14px",borderRadius:12,border:`1px solid ${C.border}`,background:C.inp}}/></div>
        <div><label>MODE</label><div style={{display:"flex",gap:8,marginTop:6}}>{["study","timed","review"].map(m=><button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"10px",borderRadius:12,border:`1.5px solid ${mode===m?C.acc:C.border}`,background:mode===m?`${C.acc}10`:C.inp,color:mode===m?C.acc:C.text,fontWeight:600}}>{m==="study"?"📖 Study":m==="timed"?"⏱ Timed":"📋 Review"}</button>)}</div></div>
        {mode==="timed"&&<div><label>Time (min)</label><div style={{display:"flex",gap:6}}>{[15,30,45,60,90].map(t=><button key={t} onClick={()=>setTimeLimit(t)} style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${timeLimit===t?C.acc:C.border}`,background:timeLimit===t?`${C.acc}10`:C.inp}}>{t}m</button>)}</div></div>}
        <div><label>Systems</label><div style={{display:"flex",flexWrap:"wrap",gap:6}}><button onClick={()=>setSystems(new Set(allSystems))} style={{padding:"4px 10px",borderRadius:20,border:`1px solid ${C.acc}`}}>All</button>{allSystems.map(s=><button key={s} onClick={()=>toggleSet(systems,setSystems,s)} style={{padding:"4px 10px",borderRadius:20,border:`1px solid ${systems.has(s)?C.acc:C.border}`,background:systems.has(s)?`${C.acc}20`:C.inp}}>{s}</button>)}</div></div>
        <div><label>Difficulty</label><div style={{display:"flex",gap:6}}>{allDiffs.map(d=><button key={d} onClick={()=>toggleSet(diffs,setDiffs,d)} style={{flex:1,padding:"6px",borderRadius:12,border:`1.5px solid ${diffs.has(d)?diffC(d):C.border}`,background:diffs.has(d)?`${diffC(d)}15`:C.inp,color:diffs.has(d)?diffC(d):C.text}}>{d}</button>)}</div></div>
        <div><label>Questions ({finalCount}/{available.length})</label><input type="range" min={1} max={available.length||1} value={count} onChange={e=>setCount(Number(e.target.value))} style={{width:"100%",accentColor:C.acc}}/></div>
        <div style={{display:"flex",gap:8}}><button onClick={()=>setRandomize(r=>!r)} style={{width:36,height:20,borderRadius:20,background:randomize?C.acc:C.border,position:"relative"}}><div style={{width:16,height:16,borderRadius:"50%",background:"white",position:"absolute",top:2,left:randomize?18:2,transition:"left 0.2s"}}/></button><span>Randomize order</span></div>
        <button onClick={handleStart} style={{padding:"14px",borderRadius:40,background:`linear-gradient(135deg,${C.acc},${C.acc2})`,color:"white",fontWeight:700}}>BEGIN SESSION</button>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ACTIVE SESSION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ActiveSession({config, onEnd, dark}) {
  const C=TH(dark);
  const {questions,mode,timeLimit,name}=config;
  const [cur,setCur]=useState(0);
  const [answers,setAnswers]=useState({});
  const [marked,setMarked]=useState({});
  const [notes,setNotes]=useState({});
  const [selected,setSelected]=useState(null);
  const [submitted,setSubmitted]=useState(false);
  const [timeLeft,setTimeLeft]=useState(timeLimit||3600);
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const q=questions[cur];
  const isStudy=mode==="study";
  const isTimed=mode==="timed";

  useEffect(()=>{const prev=answers[q?.id]; setSelected(prev?.selected||null); setSubmitted(!!prev);},[cur,q?.id]);
  useEffect(()=>{if(!isTimed||timeLeft<=0)return;const t=setInterval(()=>setTimeLeft(p=>{if(p<=1){clearInterval(t);onEnd({...config,answers,marked,notes,elapsed:timeLimit});return 0;}return p-1;}),1000);return()=>clearInterval(t);},[isTimed,timeLeft]);

  const handleSelect=(opt)=>{if(!submitted) setSelected(opt);};
  const handleSubmit=()=>{if(!selected)return;setAnswers(a=>({...a,[q.id]:{selected,correct:selected===q.correctAnswer}}));setSubmitted(true);};
  const handleNext=()=>{if(cur+1<questions.length)setCur(c=>c+1);else onEnd({...config,answers,marked,notes,elapsed:timeLimit-timeLeft});};
  const progress=Math.round((Object.keys(answers).length/questions.length)*100);
  const timerColor=timeLeft<60?"#EF4444":timeLeft<300?"#FBBF24":C.acc;

  return (
    <div style={{minHeight:"100dvh",background:C.bg,color:C.text}}>
      <div style={{position:"sticky",top:0,zIndex:20,background:C.hdr,backdropFilter:"blur(16px)",borderBottom:`1px solid ${C.border}`,padding:"12px 20px",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div><button onClick={()=>onEnd({...config,answers,marked,notes,elapsed:timeLimit-timeLeft})} style={{padding:"6px 12px",borderRadius:10,border:`1px solid ${C.border}`,background:C.inp}}>← Exit</button><span style={{marginLeft:12}}>{name} ({Object.keys(answers).length} answered)</span></div>
        <div style={{display:"flex",gap:12}}>{isTimed&&<div style={{fontFamily:"'JetBrains Mono'",fontSize:22,fontWeight:700,color:timerColor}}>⏱ {fmtTime(timeLeft)}</div>}<button onClick={()=>setSidebarOpen(o=>!o)} style={{padding:"6px 12px",borderRadius:10,border:`1px solid ${C.border}`,background:C.inp}}>📋 {sidebarOpen?"Hide":"Show"}</button></div>
      </div>
      <div style={{display:"flex",minHeight:"calc(100vh - 64px)"}}>
        {sidebarOpen&&<div style={{width:260,borderRight:`1px solid ${C.border}`,padding:16,overflowY:"auto"}}><div style={{marginBottom:16}}>{Object.keys(answers).length}/{questions.length} ({progress}%)</div><div style={{height:4,background:C.border,borderRadius:2,marginBottom:20}}><div style={{width:`${progress}%`,height:4,background:`linear-gradient(90deg,${C.acc},${C.acc2})`,borderRadius:2}}/></div><div>{questions.map((qItem,idx)=>{let status="";if(idx===cur)status="active";else if(answers[qItem.id])status=answers[qItem.id].correct?"correct":"wrong";else if(marked[qItem.id])status="marked";return(<div key={qItem.id} onClick={()=>setCur(idx)} style={{padding:"8px 12px",borderRadius:12,background:idx===cur?`${C.acc}15`:"transparent",border:`1px solid ${idx===cur?C.acc+"40":"transparent"}`,cursor:"pointer",display:"flex",gap:10,marginBottom:6}}><div style={{width:24,height:24,borderRadius:6,background:status==="correct"?"#10B981":status==="wrong"?"#EF4444":status==="marked"?"#FBBF24":C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"white"}}>{idx+1}</div><div style={{flex:1,fontSize:12,overflow:"hidden",whiteSpace:"nowrap"}}>{qItem.text.substring(0,40)}…</div></div>);})}</div></div>}
        <div className="fade-up" style={{flex:1,padding:24,maxWidth:800,margin:"0 auto"}}>
          <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}><span style={{fontFamily:"'JetBrains Mono'",fontSize:14,fontWeight:700,color:C.acc}}>Q{cur+1}/{questions.length}</span><span style={{background:`${C.acc}20`,padding:"2px 10px",borderRadius:20,fontSize:12}}>{q.system}</span><span style={{background:`${C.acc2}20`,padding:"2px 10px",borderRadius:20}}>{q.subject}</span><span style={{background:`${diffC(q.difficulty)}20`,padding:"2px 10px",borderRadius:20,color:diffC(q.difficulty)}}>{q.difficulty}</span><button onClick={()=>setMarked(m=>({...m,[q.id]:!m[q.id]}))} style={{marginLeft:"auto",padding:"6px 12px",borderRadius:20,border:`1px solid ${marked[q.id]?"#FBBF24":C.border}`,background:marked[q.id]?"#FBBF2410":C.inp}}>{marked[q.id]?"★ Marked":"☆ Mark"}</button></div>
          <div style={{background:C.card,borderRadius:24,border:`1px solid ${C.border}`,padding:24,marginBottom:24,fontSize:16}} dangerouslySetInnerHTML={{__html:hlStem(q.text)}}/>
          <div style={{marginBottom:24}}>{q.options.map((opt,idx)=>{const letter=String.fromCharCode(65+idx);const isSelected=selected===opt;const isCorrect=opt===q.correctAnswer;let variant="default";if(submitted&&isCorrect)variant="correct";else if(submitted&&isSelected&&!isCorrect)variant="wrong";else if(isSelected)variant="selected";const style={borderColor:variant==="correct"?"#10B981":variant==="wrong"?"#EF4444":variant==="selected"?C.acc:C.border,background:variant==="correct"?"#10B98110":variant==="wrong"?"#EF444410":variant==="selected"?`${C.acc}10`:C.sub,padding:"12px 18px",borderRadius:16,border:"1.5px solid",display:"flex",gap:14,alignItems:"center",cursor:submitted?"default":"pointer",marginBottom:10};return(<div key={opt} onClick={()=>handleSelect(opt)} style={style}><div style={{width:28,height:28,borderRadius:14,background:variant==="correct"?"#10B981":variant==="wrong"?"#EF4444":variant==="selected"?C.acc:C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"white"}}>{letter}</div><div style={{flex:1}}>{opt}</div>{submitted&&isCorrect&&<span>✓</span>}{submitted&&isSelected&&!isCorrect&&<span>✗</span>}</div>);})}</div>
          <div style={{display:"flex",gap:12,justifyContent:"space-between"}}><div><button onClick={()=>setCur(c=>Math.max(0,c-1))} disabled={cur===0} style={{padding:"8px 18px",borderRadius:40,border:`1px solid ${C.border}`,background:C.inp,opacity:cur===0?0.4:1}}>← Previous</button>{!submitted?<button onClick={handleSubmit} disabled={!selected} style={{marginLeft:8,padding:"8px 24px",borderRadius:40,background:selected?`linear-gradient(135deg,${C.acc},${C.acc2})`:"rgba(0,212,170,0.3)",color:"white"}}>Submit</button>:<button onClick={handleNext} style={{marginLeft:8,padding:"8px 24px",borderRadius:40,background:`linear-gradient(135deg,${C.acc},${C.acc2})`,color:"white"}}>{cur===questions.length-1?"Finish →":"Next →"}</button>}</div><div>{submitted&&<span>{answers[q.id]?.correct?"✓ Correct":"✗ Incorrect"}</span>}</div></div>
          {submitted&&isStudy&&q.explanation&&<div style={{background:C.sub2,borderRadius:20,padding:20,marginTop:20}}><div style={{fontWeight:700,color:C.acc,marginBottom:8}}>🔍 EXPLANATION</div><div>{q.explanation}</div>{q.educationalObjective&&<div style={{marginTop:8,fontSize:12,color:C.muted}}>🎯 {q.educationalObjective}</div>}<textarea placeholder="Notes" value={notes[q.id]||""} onChange={e=>setNotes(n=>({...n,[q.id]:e.target.value}))} style={{width:"100%",marginTop:12,padding:"8px",borderRadius:12,border:`1px solid ${C.border}`,background:C.inp}} rows={2}/></div>}
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SESSION REVIEW
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SessionReview({result, onExit, onRetry, dark}) {
  const C=TH(dark);
  const {questions,answers,marked,notes,name,mode,elapsed}=result;
  const [expanded,setExpanded]=useState(null);
  const correct=Object.values(answers).filter(a=>a.correct).length;
  const score=Math.round((correct/questions.length)*100);
  const scoreColor=gc(score);
  return (
    <div className="fade-up" style={{padding:28,maxWidth:900,margin:"0 auto",background:C.bg,color:C.text,minHeight:"100dvh"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:28}}><div><h2 style={{fontFamily:"'Bebas Neue'",fontSize:36,color:C.acc}}>Session Complete</h2><div>{name} · {mode} mode · {fmtTime(elapsed||0)}</div></div><div><button onClick={onRetry} style={{padding:"8px 20px",borderRadius:40,border:`1px solid ${C.acc}`,background:"transparent",color:C.acc}}>↻ Retry</button><button onClick={onExit} style={{marginLeft:8,padding:"8px 20px",borderRadius:40,border:`1px solid ${C.border}`,background:C.inp}}>← Library</button></div></div>
      <div style={{background:C.card,borderRadius:24,border:`1px solid ${C.border}`,padding:24,textAlign:"center",marginBottom:24}}><div style={{width:100,height:100,borderRadius:"50%",border:`4px solid ${scoreColor}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}><div style={{fontSize:40,fontFamily:"'Bebas Neue'",color:scoreColor}}>{score}%</div></div><div style={{fontSize:18,fontWeight:700,color:scoreColor}}>{classify(score)?.label}</div><div style={{display:"flex",justifyContent:"center",gap:24,marginTop:20}}><div><div style={{fontSize:28,fontWeight:700,color:"#10B981"}}>{correct}</div><div>Correct</div></div><div><div style={{fontSize:28,fontWeight:700,color:"#EF4444"}}>{questions.length-correct}</div><div>Incorrect/Skipped</div></div><div><div style={{fontSize:28,fontWeight:700,color:"#FBBF24"}}>{Object.values(marked).filter(v=>v).length}</div><div>Marked</div></div></div></div>
      <div><h3 style={{marginBottom:16}}>Detailed Review</h3>{questions.map((q,idx)=>{const a=answers[q.id];const isExpanded=expanded===idx;return(<div key={q.id} style={{background:C.sub,borderRadius:16,marginBottom:10,overflow:"hidden",border:`1px solid ${C.border}`}}><div onClick={()=>setExpanded(isExpanded?null:idx)} style={{padding:"14px 18px",display:"flex",gap:12,cursor:"pointer"}}><span>{a?.correct?"✅":a?"❌":"⏺"}</span><div style={{flex:1}}>Q{idx+1}. {q.text.substring(0,100)}…</div><span>{isExpanded?"▲":"▼"}</span></div>{isExpanded&&<div style={{padding:"12px 18px",borderTop:`1px solid ${C.border}`,background:C.card}}><div><strong>Your answer:</strong> {a?.selected||"Not answered"}</div><div><strong>Correct:</strong> {q.correctAnswer}</div>{q.explanation&&<div style={{marginTop:8,padding:10,background:C.sub,borderRadius:12}}>{q.explanation}</div>}{notes[q.id]&&<div style={{marginTop:8,fontSize:12,color:C.acc}}>📝 {notes[q.id]}</div>}</div>}</div>);})}</div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QBANK APP (تحميل الأسئلة من public/data/)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function QbankApp({dark}) {
  const [view,setView]=useState("library");
  const [allQuestions,setAllQuestions]=useState([]);
  const [bankQuestions,setBankQuestions]=useState([]);
  const [prevExams,setPrevExams]=useState([]);
  const [loading,setLoading]=useState(true);
  const [sessionConfig,setSessionConfig]=useState(null);
  const [sessionResult,setSessionResult]=useState(null);

  useEffect(()=>{
    const load=async()=>{
      const systemFiles=["previous-exams","cardiology","gastroenterology","nephrology","hepatology","pulmonology","endocrinology","rheumatology","neurology","infectious"];
      const bankQs=[];
      let prevQs=[];

      for(const file of systemFiles){
        try{
          const res=await fetch(`/data/${file}.json`);
          if(res.ok){
            const data=await res.json();
            if(Array.isArray(data)) bankQs.push(...data);
          }else{ console.warn(`${file}.json not found`); }
        }catch(e){ console.error(`Error loading ${file}.json`,e); }
      }

      try{
        const prevRes=await fetch("/data/previous-exams.json");
        if(prevRes.ok){
          const data=await prevRes.json();
          if(Array.isArray(data)) prevQs=data;
        }else{ console.warn("previous-exams.json not found"); }
      }catch(e){ console.error("Error loading previous-exams.json",e); }

      setBankQuestions(bankQs);
      setPrevExams(prevQs);
      setAllQuestions([...bankQs,...prevQs]);
      setLoading(false);
    };
    load();
  },[]);

  if(loading) return <div style={{minHeight:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",color:TH(dark).text}}>Loading questions...</div>;

  return (
    <>
      {view==="library" && <Library questions={allQuestions} bankQuestionsList={bankQuestions} previousExamsList={prevExams} onStart={()=>setView("config")} dark={dark}/>}
      {view==="config" && <SessionConfig questions={allQuestions} onStart={cfg=>{setSessionConfig(cfg); setView("session");}} onBack={()=>setView("library")} dark={dark}/>}
      {view==="session" && sessionConfig && <ActiveSession config={sessionConfig} onEnd={res=>{setSessionResult(res); setView("review");}} dark={dark}/>}
      {view==="review" && sessionResult && <SessionReview result={sessionResult} onExit={()=>setView("library")} onRetry={()=>setView("config")} dark={dark}/>}
    </>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROOT APP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function App() {
  const [tab, setTab] = useState("cgpa");
  const [dark, setDark] = useState(true);
  const C = TH(dark);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <style>{GCSS}</style>
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: C.hdr, backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#00D4AA,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontFamily: "'Bebas Neue'", color: "white" }}>M</div>
          <div onClick={() => window.open("https://t.me/ddxo2", "_blank", "noopener,noreferrer")} style={{ cursor: "pointer", userSelect: "none" }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: 2 }}>MedIQ Pro</div>
            <div style={{ fontSize: 9, color: C.muted, fontFamily: "'JetBrains Mono'" }}>WARITH AL-ANBIYAA · HAIDER EMAD</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", flex: 1 }}>
          <div style={{ display: "flex", gap: 12, background: "transparent", borderRadius: 40, padding: "4px" }}>
            <button onClick={() => setTab("cgpa")} style={{ padding: "8px 24px", borderRadius: 40, border: "none", fontWeight: 700, fontSize: "15px", letterSpacing: "0.5px", cursor: "pointer", transition: "all 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1)", background: tab === "cgpa" ? `linear-gradient(135deg, ${C.acc}, ${C.acc2})` : "transparent", color: tab === "cgpa" ? "white" : C.text, boxShadow: tab === "cgpa" ? "0 4px 12px rgba(0,212,170,0.3)" : "none", transform: tab === "cgpa" ? "scale(1.02)" : "scale(1)", }} onMouseEnter={(e) => { if (tab !== "cgpa") e.currentTarget.style.background = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"; }} onMouseLeave={(e) => { if (tab !== "cgpa") e.currentTarget.style.background = "transparent"; }}>📊 CGPA</button>
            <button onClick={() => setTab("qbank")} style={{ padding: "8px 24px", borderRadius: 40, border: "none", fontWeight: 700, fontSize: "15px", letterSpacing: "0.5px", cursor: "pointer", transition: "all 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1)", background: tab === "qbank" ? `linear-gradient(135deg, ${C.acc}, ${C.acc2})` : "transparent", color: tab === "qbank" ? "white" : C.text, boxShadow: tab === "qbank" ? "0 4px 12px rgba(0,212,170,0.3)" : "none", transform: tab === "qbank" ? "scale(1.02)" : "scale(1)", }} onMouseEnter={(e) => { if (tab !== "qbank") e.currentTarget.style.background = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"; }} onMouseLeave={(e) => { if (tab !== "qbank") e.currentTarget.style.background = "transparent"; }}>📚 Qbank</button>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", flex: 1 }}>
          <button onClick={() => setDark(!dark)} style={{ padding: "6px 16px", borderRadius: 20, border: `1px solid ${C.border}`, background: "transparent", fontSize: 12, fontWeight: 600, color: C.text, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>{dark ? "☀️ Light" : "🌙 Dark"}</button>
        </div>
      </div>
      {tab === "cgpa" ? <CGPAView dark={dark} /> : <QbankApp dark={dark} />}
    </div>
  );
}