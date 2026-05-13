import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

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
@keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes sc{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
@keyframes pu{0%,100%{opacity:1}50%{opacity:.4}}
.fu{animation:fu .3s ease forwards}
.fi{animation:fi .22s ease forwards}
.sc{animation:sc .25s ease forwards}
.pu{animation:pu 1.4s ease infinite}
.btn{transition:all .15s ease;cursor:pointer;border:none;outline:none}
.btn:hover{opacity:.85}
.btn:active{transform:scale(.98)}
.opt{transition:all .15s ease;cursor:pointer}
.opt:hover:not(.locked){transform:translateX(3px)}
.sq{transition:background .12s ease;cursor:pointer}
.sq:hover{filter:brightness(1.1)}
@media(max-width:900px){.sl{flex-direction:column!important}.sc-col{width:100%!important;max-height:220px!important;border-right:none!important;border-bottom:1px solid var(--br)!important}}
@media(max-width:640px){.hide-sm{display:none!important}.full-sm{width:100%!important}}
`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THEME
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const TH = (d) => d ? {
  bg:"#07090F",card:"#0E1525",sub:"#111B2E",sub2:"#16223A",
  border:"rgba(255,255,255,0.07)",text:"#E2E8F0",muted:"rgba(226,232,240,0.38)",
  acc:"#00D4AA",acc2:"#3B82F6",hdr:"rgba(7,9,15,0.92)",inp:"rgba(255,255,255,0.05)"
} : {
  bg:"#EFF2F7",card:"#FFFFFF",sub:"#F1F5F9",sub2:"#E8EDF5",
  border:"rgba(0,0,0,0.08)",text:"#111827",muted:"rgba(17,24,39,0.45)",
  acc:"#00A896",acc2:"#2563EB",hdr:"rgba(239,242,247,0.92)",inp:"rgba(0,0,0,0.04)"
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
// SAMPLE QUESTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SAMPLE_QS = [
  {id:"q1",system:"Cardiovascular",subject:"Internal Medicine",difficulty:"Medium",text:"A 55-year-old man with hypertension presents with crushing chest pain radiating to his left arm for 2 hours. ECG shows ST-segment elevation in leads II, III, and aVF. What is the most appropriate immediate management?",options:["IV heparin + coronary angiography within 72h","Emergency percutaneous coronary intervention (PCI)","Thrombolytics and transfer to ICU","Aspirin + clopidogrel and observe","Emergency CABG"],correctAnswer:"Emergency percutaneous coronary intervention (PCI)",explanation:"This patient has an inferior STEMI (ST elevation in II, III, aVF). Primary PCI is the preferred reperfusion strategy when achievable within 90 minutes of first medical contact. It has superior outcomes vs thrombolytics in mortality, reinfarction, and stroke.",educationalObjective:"Know the preferred reperfusion strategy for STEMI and the 90-minute door-to-balloon time target.",tags:["STEMI","ACS","PCI"],hint:"Think about the preferred reperfusion method and time targets.",imageUrl:null,type:"single"},
  {id:"q2",system:"Respiratory",subject:"Internal Medicine",difficulty:"Easy",text:"A 28-year-old woman presents with episodic wheezing, shortness of breath, and chest tightness worse at night and with exercise. She has allergic rhinitis. Spirometry shows FEV1/FVC of 0.68 with a 15% improvement after bronchodilator. What is the most likely diagnosis?",options:["COPD","Bronchiectasis","Asthma","Vocal cord dysfunction","Pulmonary embolism"],correctAnswer:"Asthma",explanation:"Asthma is characterized by reversible airflow obstruction (FEV1/FVC <0.7) with ≥12% improvement after bronchodilator. Nocturnal and exercise-induced symptoms with atopic background strongly support this diagnosis.",educationalObjective:"Understand spirometric criteria for asthma including reversibility testing.",tags:["Asthma","Spirometry","Reversibility"],hint:"Note the reversibility after bronchodilator — the key distinguishing feature.",imageUrl:null,type:"single"},
  {id:"q3",system:"Renal",subject:"Internal Medicine",difficulty:"Hard",text:"A 42-year-old diabetic on lisinopril presents with creatinine 2.3 mg/dL (baseline 1.0), K+ 5.8 mEq/L, and urine protein/creatinine ratio 3.2. Renal ultrasound shows normal-sized kidneys. What is the most appropriate next step?",options:["Stop lisinopril and switch to ARB","Add spironolactone","Increase lisinopril dose","Start hemodialysis","Renal biopsy"],correctAnswer:"Stop lisinopril and switch to ARB",explanation:"This patient has AKI with hyperkalemia on an ACE inhibitor. Stop the ACE inhibitor. However, since proteinuria indicates diabetic nephropathy, continuing RAAS blockade is important — switching to an ARB maintains renoprotection while changing the agent.",educationalObjective:"Manage ACE inhibitor-induced AKI and hyperkalemia in diabetic nephropathy.",tags:["AKI","Diabetic nephropathy","ACE inhibitor","Hyperkalemia"],hint:"Consider the cause of AKI and the need for continued RAAS blockade.",imageUrl:null,type:"single"},
  {id:"q4",system:"Neurology",subject:"Internal Medicine",difficulty:"Medium",text:"A 68-year-old man suddenly develops inability to produce fluent speech but can comprehend commands normally. His speech is effortful and telegraphic. Which type of aphasia does this represent, and which artery is most likely affected?",options:["Wernicke's aphasia; posterior MCA","Broca's aphasia; anterior MCA","Global aphasia; complete MCA occlusion","Conduction aphasia; arcuate fasciculus","Transcortical motor aphasia; ACA"],correctAnswer:"Broca's aphasia; anterior MCA",explanation:"Broca's (expressive) aphasia is characterized by non-fluent, effortful speech with preserved comprehension. It results from damage to Broca's area in the dominant inferior frontal gyrus, supplied by the superior branch of the left MCA.",educationalObjective:"Localize aphasia syndromes to their neuroanatomical correlates and vascular territories.",tags:["Aphasia","Stroke","MCA","Broca"],hint:"Focus on the preserved comprehension — this is key to localization.",imageUrl:null,type:"single"},
  {id:"q5",system:"Endocrinology",subject:"Internal Medicine",difficulty:"Medium",text:"A 35-year-old woman has moon facies, central obesity, and violaceous striae. Elevated 24h urinary free cortisol. Low-dose dexamethasone suppression test shows no suppression. High-dose dexamethasone suppression test shows 60% cortisol suppression. What is the most likely cause?",options:["Adrenal adenoma","Adrenal carcinoma","Ectopic ACTH secretion","ACTH-secreting pituitary adenoma","Exogenous steroid use"],correctAnswer:"ACTH-secreting pituitary adenoma",explanation:"Cortisol suppression >50% on high-dose dexamethasone points to a pituitary source (Cushing's disease), as pituitary corticotrophs retain some feedback sensitivity. Adrenal tumors and ectopic ACTH do not suppress on high-dose testing.",educationalObjective:"Differentiate causes of Cushing's syndrome using the dexamethasone suppression test protocol.",tags:["Cushing's","Cortisol","Pituitary","DST"],hint:"High-dose DST distinguishes pituitary from ectopic/adrenal sources.",imageUrl:null,type:"single"},
  {id:"q6",system:"Gastroenterology",subject:"Surgery",difficulty:"Medium",text:"A 45-year-old woman has acute right upper quadrant pain radiating to the right shoulder, nausea, and fever 38.5°C after a fatty meal. Murphy's sign is positive. Ultrasound shows gallbladder wall thickening, pericholecystic fluid, and gallstones. What is the most appropriate management?",options:["IV antibiotics alone and outpatient follow-up","Emergency ERCP","Urgent laparoscopic cholecystectomy","Percutaneous cholecystostomy","Oral ursodeoxycholic acid"],correctAnswer:"Urgent laparoscopic cholecystectomy",explanation:"This is acute cholecystitis. Guidelines recommend early laparoscopic cholecystectomy within 24–72 hours, which reduces hospital stay, conversion rates, and complications compared to delayed surgery.",educationalObjective:"Know the timing and preferred approach for acute cholecystitis management.",tags:["Cholecystitis","Cholecystectomy","Murphy's sign"],hint:"Consider current surgical guidelines for acute cholecystitis timing.",imageUrl:null,type:"single"},
  {id:"q7",system:"Hematology",subject:"Internal Medicine",difficulty:"Hard",text:"A 25-year-old vegan woman presents with fatigue and pallor. CBC: Hgb 8.2 g/dL, MCV 105 fL, platelets 85K, WBC 2.8K. Smear shows hypersegmented neutrophils. Serum B12 is 95 pg/mL. What is the most important next step before treatment?",options:["Start B12 injections immediately","Start folic acid supplementation","Bone marrow biopsy","Check serum methylmalonic acid and homocysteine","Order anti-intrinsic factor antibodies"],correctAnswer:"Check serum methylmalonic acid and homocysteine",explanation:"Before treating, confirm B12 deficiency with methylmalonic acid (MMA) and homocysteine — both elevated in B12 deficiency but only homocysteine rises in folate deficiency. This prevents giving folate to a B12-deficient patient (masking hematology while neurological damage progresses).",educationalObjective:"Understand the diagnostic workup to differentiate B12 from folate deficiency before treatment.",tags:["B12 deficiency","Megaloblastic anemia","MMA","Homocysteine"],hint:"What confirms B12 deficiency and distinguishes it from folate deficiency?",imageUrl:null,type:"single"},
  {id:"q8",system:"Musculoskeletal",subject:"Surgery",difficulty:"Easy",text:"A 28-year-old man cannot bear weight on his right ankle after a motor vehicle accident. X-ray is negative for fracture. He has point tenderness at the lateral malleolus with a positive anterior drawer test and increased talar tilt. What structure is most likely injured?",options:["Deltoid ligament","Posterior talofibular ligament (PTFL)","Anterior talofibular ligament (ATFL)","Calcaneofibular ligament (CFL)","Syndesmotic ligament"],correctAnswer:"Anterior talofibular ligament (ATFL)",explanation:"The ATFL is the most commonly injured ankle ligament, occurring with inversion injury. A positive anterior drawer test specifically tests ATFL integrity. The PTFL is only injured in severe dislocations, and deltoid injuries occur with eversion.",educationalObjective:"Identify anatomy and clinical tests for lateral ankle ligament injuries.",tags:["Ankle sprain","ATFL","Anterior drawer","Ligament"],hint:"Most common ankle ligament injury — inversion mechanism.",imageUrl:null,type:"single"},
  {id:"q9",system:"Pharmacology",subject:"Internal Medicine",difficulty:"Medium",text:"A 67-year-old man with heart failure (EF 35%) is started on a new medication. Two weeks later he has bradycardia, first-degree AV block, nightmares, and depression. Which drug is most likely responsible?",options:["Carvedilol","Bisoprolol","Metoprolol succinate","Propranolol","Nebivolol"],correctAnswer:"Propranolol",explanation:"Propranolol is a non-selective, lipophilic beta-blocker that crosses the BBB, causing CNS effects like nightmares and depression. Critically, non-selective beta-blockers like propranolol are NOT evidence-based for HFrEF — only carvedilol, bisoprolol, and metoprolol succinate have proven benefit.",educationalObjective:"Know evidence-based beta-blockers for HF and CNS side effects of lipophilic agents.",tags:["Beta-blockers","Heart failure","Propranolol","CNS effects"],hint:"Which beta-blocker crosses the BBB AND is not indicated in HF?",imageUrl:null,type:"single"},
  {id:"q10",system:"Microbiology",subject:"Internal Medicine",difficulty:"Hard",text:"A 32-year-old HIV-positive man (CD4 45/μL) has 3 weeks of headache, confusion, and fever. CSF: elevated opening pressure, India ink positive, cryptococcal antigen 1:512, WBC 20 (lymphocytes), protein 55 mg/dL, glucose 35 (serum 90). What is the first-line treatment?",options:["Fluconazole 400mg daily × 8 weeks","Liposomal amphotericin B alone × 2 weeks","Amphotericin B + flucytosine × ≥2 weeks, then fluconazole","Voriconazole × 6 weeks","IV ceftriaxone + vancomycin empirically"],correctAnswer:"Amphotericin B + flucytosine × ≥2 weeks, then fluconazole",explanation:"Cryptococcal meningitis in HIV uses a 3-phase approach: Induction (Amphotericin B + flucytosine × 2 weeks) → Consolidation (fluconazole 400mg × 8 weeks) → Maintenance (fluconazole 200mg until CD4 >100 for 6+ months on ART).",educationalObjective:"Know the 3-phase treatment protocol for cryptococcal meningitis in HIV.",tags:["Cryptococcus","HIV","Meningitis","Amphotericin B"],hint:"Three phases: induction, consolidation, maintenance.",imageUrl:null,type:"single"},
];

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
// CGPA CALCULATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CGPAView({dark}) {
  const C=TH(dark);
  const [grades,setGrades]=useState({});
  const [activeStage,setActiveStage]=useState(0);
  const [targetAvg,setTargetAvg]=useState(85);
  const [tab,setTab]=useState("grades");

  useEffect(()=>{(async()=>{try{const r=await window.storage.get("cgpa-v20");if(r?.value){const p=JSON.parse(r.value);if(p.grades)setGrades(p.grades);if(p.targetAvg)setTargetAvg(p.targetAvg)}}catch{}})()},[]);
  useEffect(()=>{window.storage.set("cgpa-v20",JSON.stringify({grades,targetAvg})).catch(()=>{});},[grades,targetAvg]);

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
    return{perStage,gradedU,completedWeight,remainW,needed:remainW>0?(targetAvg*100-scoreSum)/remainW:null,completedWD};
  },[grades,targetAvg]);

  const stage=STAGES[activeStage],sm=metrics.perStage[activeStage];
  const stageTot=stage.subjects.reduce((a,s)=>a+s.u,0);
  const allGraded=STAGES.flatMap((s,si)=>s.subjects.map((sub,i)=>{const g=grades[`${s.id}-${i}`];return g!=null?{en:sub.en,ar:sub.ar,g,u:sub.u,stage:s.label,color:s.color}:null;}).filter(Boolean));
  const radarData=stage.subjects.map((sub,i)=>({s:sub.en.length>10?sub.en.slice(0,10)+"…":sub.en,g:grades[`${stage.id}-${i}`]??0}));
  const barData=STAGES.map((s,i)=>({label:s.label,avg:metrics.perStage[i].avg??0,color:s.color}));

  const S={position:"sticky",top:0,zIndex:50,background:C.hdr,backdropFilter:"blur(16px)",borderBottom:`1px solid ${C.border}`,padding:"0 28px",display:"flex",alignItems:"center",justifyContent:"space-between",height:64,gap:12,flexWrap:"wrap"};
  const Ms={padding:"20px 28px",borderBottom:`1px solid ${C.border}`,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16};
  const Mc=(accent,grad)=>({background:grad||C.card,border:`1px solid ${accent?accent+"30":C.border}`,borderRadius:18,padding:"18px 22px"});
  const Lbl={fontSize:10,fontWeight:700,letterSpacing:2,marginBottom:6};
  const Num={fontSize:48,lineHeight:1,fontFamily:"'Bebas Neue'",letterSpacing:2};

  return(
    <div style={{minHeight:"100dvh",background:C.bg,color:C.text,"--br":C.border}}>
      {/* METRICS BAR */}
      <div style={Ms}>
        <div style={Mc("#00D4AA","linear-gradient(135deg,rgba(0,212,170,.12),rgba(59,130,246,.06))")}>
          <div style={{...Lbl,color:"#00D4AA"}}>STAGE DEGREE SUM</div>
          <div style={{...Num,color:"#00D4AA"}}>{metrics.completedWD.toFixed(2)}</div>
          <div style={{fontSize:10,color:C.muted,marginTop:6,fontFamily:"'JetBrains Mono'"}}>/ 100</div>
        </div>
        <div style={Mc()}>
          <div style={{...Lbl,color:C.muted}}>REMAINING WEIGHT</div>
          <div style={{...Num,color:"#60A5FA"}}>{metrics.remainW.toFixed(0)}</div>
          <div style={{fontSize:10,color:C.muted,marginTop:6}}>to reach 100%</div>
        </div>
        <div style={Mc()}>
          <div style={{...Lbl,color:C.muted}}>CURRENT STAGE CLASS</div>
          <div style={{fontSize:22,fontWeight:800,color:classify(sm.avg)?.color??C.muted,lineHeight:1.2}}>{classify(sm.avg)?.label??"—"}</div>
          <div style={{fontSize:15,color:classify(sm.avg)?.color??C.muted,marginTop:4,opacity:.8,direction:"rtl",textAlign:"left"}}>{classify(sm.avg)?.ar??"أدخل الدرجات"}</div>
        </div>
        <div style={Mc()}>
          <div style={{...Lbl,color:C.muted}}>UNITS GRADED</div>
          <div style={{fontSize:26,fontWeight:800,fontFamily:"'JetBrains Mono'"}}>{metrics.gradedU%1===0?metrics.gradedU:metrics.gradedU.toFixed(1)}<span style={{fontSize:13,color:C.muted,fontWeight:400}}> / {TOTAL_UNITS}</span></div>
          <div style={{height:5,background:dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)",borderRadius:3,marginTop:10,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,background:"linear-gradient(90deg,#00D4AA,#3B82F6)",width:`${(metrics.gradedU/TOTAL_UNITS)*100}%`,transition:"width .6s ease"}}/></div>
        </div>
        <div style={Mc()}>
          <div style={{...Lbl,color:C.muted}}>TARGET AVERAGE</div>
          <input type="number" min={50} max={100} step={0.5} value={targetAvg} onChange={e=>setTargetAvg(parseFloat(e.target.value)||0)} style={{width:"100%",background:"transparent",border:"none",outline:"none",fontSize:32,fontFamily:"'Bebas Neue'",letterSpacing:2,color:C.text}}/>
          {metrics.needed!=null&&<div style={{fontSize:11,fontWeight:700,marginTop:4,color:metrics.needed<0?"#10B981":metrics.needed>100?"#EF4444":"#FBBF24"}}>{metrics.needed<0?"✓ Target achieved!":metrics.needed>100?"✗ Not achievable":`Need ${metrics.needed.toFixed(1)} avg remaining`}</div>}
        </div>
      </div>
      {/* TAB BAR */}
      <div style={{display:"flex",gap:4,padding:"12px 28px",borderBottom:`1px solid ${C.border}`}}>
        {[["grades","Grades"],["details","Visual Fingerprint"],["insights","Insights"]].map(([k,l])=>(
          <button key={k} className="btn" onClick={()=>setTab(k)} style={{padding:"8px 18px",borderRadius:10,background:tab===k?(dark?"rgba(255,255,255,.1)":"rgba(0,0,0,.08)"):"transparent",color:tab===k?C.text:C.muted,fontWeight:600,fontSize:12,letterSpacing:.5}}>
            {l}
          </button>
        ))}
      </div>
      {/* GRADES TAB */}
      {tab==="grades"&&(
        <div style={{display:"grid",gridTemplateColumns:"220px 1fr",minHeight:"calc(100dvh - 280px)"}}>
          {/* Stage sidebar */}
          <div style={{borderRight:`1px solid ${C.border}`,padding:16,display:"flex",flexDirection:"column",gap:4,overflowY:"auto"}}>
            {STAGES.map((s,idx)=>{const sp=metrics.perStage[idx],act=activeStage===idx;return(
              <button key={idx} className="btn" onClick={()=>setActiveStage(idx)} style={{width:"100%",textAlign:"left",padding:"11px 13px",borderRadius:11,background:act?`${s.color}15`:"transparent",borderLeft:`3px solid ${act?s.color:"transparent"}`,opacity:act?1:.5}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:13,fontWeight:700,color:act?s.color:C.text,fontFamily:"'Bebas Neue'",letterSpacing:1.5}}>{s.full}</div><div style={{fontSize:9,color:C.muted,fontFamily:"'JetBrains Mono'",marginTop:1}}>{s.weight}% Weight</div></div>
                  <div style={{textAlign:"right"}}>{sp.avg!=null?(<><div style={{fontSize:17,fontWeight:900,fontFamily:"'Bebas Neue'",color:gc(sp.avg),letterSpacing:1}}>{sp.avg.toFixed(1)}</div><div style={{fontSize:9,color:C.muted,fontFamily:"'JetBrains Mono'"}}>{sp.complete?`+${s.weight}/${s.weight}`:`0/${s.weight}`}</div></>):(<div style={{fontSize:17,fontFamily:"'Bebas Neue'",color:C.muted}}>—</div>)}</div>
                </div>
                {sp.gradedU>0&&<div style={{height:2,background:dark?"rgba(255,255,255,.06)":"rgba(0,0,0,.08)",borderRadius:1,marginTop:7,overflow:"hidden"}}><div style={{height:"100%",background:s.color,width:`${sp.pct*100}%`,transition:"width .4s"}}/></div>}
              </button>
            );})}
          </div>
          {/* Content + charts */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 360px"}}>
            <div className="fu" style={{padding:28,borderRight:`1px solid ${C.border}`,overflowY:"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:12}}>
                <div><div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:3,color:stage.color}}>{stage.full}</div><div style={{fontSize:13,color:C.muted,direction:"rtl",textAlign:"left",marginTop:2}}>{stage.arabic} — {stage.weight}% من المعدل التراكمي</div></div>
                <div style={{textAlign:"right"}}>{sm.avg!=null?(<><div style={{fontFamily:"'Bebas Neue'",fontSize:50,lineHeight:1,color:gc(sm.avg),letterSpacing:2}}>{sm.avg.toFixed(2)}</div><div style={{fontSize:11,color:classify(sm.avg)?.color,fontWeight:700,marginTop:2}}>{classify(sm.avg)?.label} · {classify(sm.avg)?.ar}</div></>):(<div style={{fontFamily:"'Bebas Neue'",fontSize:40,color:C.muted}}>——</div>)}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                {stage.subjects.map((sub,i)=>{const key=`${stage.id}-${i}`;const g=grades[key];const cls=classify(g);const gco=gc(g);const wd=WD(g,sub.u,stageTot,stage.weight);return(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:11,padding:"10px 13px",borderRadius:11,background:g!=null?`${gco}08`:"transparent",transition:"background .15s"}}>
                    <div style={{width:34,height:21,borderRadius:6,background:`${stage.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:stage.color,fontFamily:"'JetBrains Mono'",flexShrink:0}}>{sub.u}</div>
                    <div style={{flex:1,minWidth:100}}><div style={{fontSize:13,fontWeight:600}}>{sub.en}</div><div style={{fontSize:10,color:C.muted,direction:"rtl",textAlign:"left",marginTop:1}}>{sub.ar}</div></div>
                    {wd!=null&&<div style={{fontSize:11,fontWeight:600,fontFamily:"'JetBrains Mono'",color:"#FBBF24",background:"rgba(251,191,36,.12)",padding:"2px 9px",borderRadius:20,minWidth:86,textAlign:"center"}}>{wd.toFixed(5)}</div>}
                    {cls&&<div style={{fontSize:9,fontWeight:700,padding:"3px 7px",borderRadius:6,background:`${cls.color}18`,color:cls.color,letterSpacing:.5,flexShrink:0}}>{cls.label}</div>}
                    <input type="number" min={0} max={100} step={0.5} placeholder="—" value={g??""} onChange={e=>setGrade(stage.id,i,e.target.value)} style={{width:65,height:36,textAlign:"center",borderRadius:9,background:dark?"rgba(255,255,255,.05)":"rgba(0,0,0,.05)",border:`1.5px solid ${g!=null?gco+"60":C.border}`,color:g!=null?gco:C.text,fontSize:14,fontWeight:800,fontFamily:"'JetBrains Mono'",outline:"none",transition:"all .2s"}}/>
                  </div>
                );})}
              </div>
              {sm.totalWD>0&&<div style={{marginTop:18,textAlign:"right",borderTop:`1px solid ${C.border}`,paddingTop:14}}><div style={{fontSize:11,color:C.muted,letterSpacing:1}}>Stage Weighted Degree</div><div style={{fontFamily:"'Bebas Neue'",fontSize:32,letterSpacing:2,color:"#FBBF24"}}>{sm.totalWD.toFixed(5)}</div><div style={{fontSize:10,color:C.muted}}>Max = {stage.weight}</div></div>}
            </div>
            <div style={{padding:28,display:"flex",flexDirection:"column",gap:22,overflowY:"auto"}}>
              <div><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:2,marginBottom:14}}>STAGE RADAR</div>
                <ResponsiveContainer width="100%" height={240}><RadarChart data={radarData} margin={{top:8,right:8,bottom:8,left:8}}><PolarGrid stroke={dark?"rgba(255,255,255,.07)":"rgba(0,0,0,.1)"}/><PolarAngleAxis dataKey="s" tick={{fontSize:9,fill:C.muted}}/><Radar dataKey="g" stroke={stage.color} fill={stage.color} fillOpacity={.18} strokeWidth={2}/><Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,fontSize:12}} formatter={v=>[v||"—","Grade"]}/></RadarChart></ResponsiveContainer>
              </div>
              <div style={{background:C.sub,borderRadius:14,padding:16}}>
                <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:2,marginBottom:12}}>STAGE BREAKDOWN</div>
                {(()=>{const items=stage.subjects.map((s,i)=>({...s,g:grades[`${stage.id}-${i}`]})).filter(s=>s.g!=null);if(!items.length)return<div style={{fontSize:12,color:C.muted,fontStyle:"italic"}}>Enter grades to see breakdown</div>;const b=items.reduce((a,x)=>x.g>a.g?x:a),w=items.reduce((a,x)=>x.g<a.g?x:a);return(<div style={{display:"flex",flexDirection:"column",gap:9}}>{[["↑ Best",b.en,"#10B981"],["↓ Weakest",w.en,"#FBBF24"],["Graded",`${items.length}/${stage.subjects.length}`,C.text],["Classification",classify(sm.avg)?.label??"",classify(sm.avg)?.color??C.muted]].map(([l,v,c])=><div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:12,gap:8}}><span style={{color:C.muted}}>{l}</span><span style={{color:c,fontWeight:700,textAlign:"right"}}>{v}</span></div>)}</div>);})()}
              </div>
              <div><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:2,marginBottom:10}}>ALL STAGES</div>
                <ResponsiveContainer width="100%" height={120}><BarChart data={barData} margin={{top:0,right:0,bottom:0,left:-20}}><CartesianGrid strokeDasharray="3 3" stroke={dark?"rgba(255,255,255,.05)":"rgba(0,0,0,.07)"} vertical={false}/><XAxis dataKey="label" tick={{fontSize:10,fill:C.muted}} axisLine={false} tickLine={false}/><YAxis domain={[0,100]} tick={{fontSize:9,fill:C.muted}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,fontSize:11}} formatter={v=>[v?v.toFixed(1):"—","Avg"]}/><Bar dataKey="avg" radius={[5,5,0,0]}>{barData.map((_,i)=><Cell key={i} fill={STAGES[i].color} fillOpacity={activeStage===i?1:.35}/>)}</Bar></BarChart></ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* DETAILS TAB */}
      {tab==="details"&&(
        <div className="fu" style={{padding:32}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:30,letterSpacing:4,marginBottom:6}}>VISUAL FINGERPRINT</div>
          <div style={{fontSize:12,color:C.muted,marginBottom:22,maxWidth:600}}>Each block represents one subject — width proportional to credit units, color reflects grade. Click any block to navigate.</div>
          <div style={{display:"flex",gap:18,marginBottom:24,flexWrap:"wrap"}}>{[["≥90 Excellent","#10B981"],["≥80 Very Good","#60A5FA"],["≥70 Good","#A78BFA"],["≥60 Medium","#FBBF24"],["≥50 Acceptable","#F97316"],["<50 Fail","#EF4444"],["Not entered",dark?"rgba(255,255,255,.08)":"rgba(0,0,0,.06)"]].map(([l,c])=>(<div key={l} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:C.muted}}><div style={{width:10,height:10,borderRadius:3,background:c,flexShrink:0}}/>{l}</div>))}</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {STAGES.map((s,si)=>{const sp=metrics.perStage[si];return(<div key={si} style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:110,flexShrink:0,textAlign:"right",fontFamily:"'Bebas Neue'",fontSize:13,letterSpacing:2,color:s.color}}><div>{s.full}</div><div style={{fontSize:9,color:C.muted,fontFamily:"'JetBrains Mono'"}}>{s.weight}% wt</div></div>
              <div style={{display:"flex",gap:3,flex:1,overflowX:"auto",paddingBottom:3}}>
                {s.subjects.map((sub,i)=>{const g=grades[`${s.id}-${i}`];const gco=g!=null?gc(g):null;const w=Math.max(28,sub.u*15);return(<div key={i} title={`${sub.en} (${sub.u}u)${g!=null?`: ${g}`:""}`} onClick={()=>{setActiveStage(si);setTab("grades");}} style={{width:w,height:46,borderRadius:7,flexShrink:0,background:gco||( dark?"rgba(255,255,255,.05)":"rgba(0,0,0,.06)"),border:`1px solid ${gco?gco+"40":C.border}`,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,transition:"transform .14s",opacity:g!=null?.92:.4}} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform=""}>{g!=null&&<span style={{fontSize:10,fontWeight:900,color:"white",fontFamily:"'JetBrains Mono'",textShadow:"0 1px 4px rgba(0,0,0,.7)"}}>{g}</span>}<span style={{fontSize:7,color:g!=null?"rgba(255,255,255,.7)":C.muted,textAlign:"center",lineHeight:1.2,maxWidth:w-6,overflow:"hidden"}}>{sub.en.length>Math.floor(w/5)?sub.en.slice(0,Math.floor(w/5))+"…":sub.en}</span></div>);})}
              </div>
              <div style={{width:68,flexShrink:0,textAlign:"center",background:sp.avg!=null?`${gc(sp.avg)}18`:C.sub,border:`1px solid ${sp.avg!=null?gc(sp.avg)+"40":C.border}`,borderRadius:9,padding:"7px 9px"}}><div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:sp.avg!=null?gc(sp.avg):C.muted}}>{sp.avg?.toFixed(1)??"—"}</div><div style={{fontSize:8,color:C.muted,fontWeight:600}}>AVG</div></div>
            </div>);})}
          </div>
        </div>
      )}
      {/* INSIGHTS TAB */}
      {tab==="insights"&&(
        <div className="fu" style={{padding:32,display:"grid",gridTemplateColumns:"1fr 1fr",gap:22}}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:26}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:2,marginBottom:18}}>ACADEMIC PROFILE</div>
            {allGraded.length===0?<div style={{fontSize:13,color:C.muted,fontStyle:"italic"}}>Enter grades to generate insights.</div>:(
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {[["🏆 Highest",allGraded.reduce((a,b)=>b.g>a.g?b:a),"#10B981"],["📉 Lowest",allGraded.reduce((a,b)=>b.g<a.g?b:a),"#FBBF24"]].map(([l,item,c])=>(
                  <div key={l} style={{padding:"13px 15px",borderRadius:13,background:C.sub,display:"flex",gap:12}}>
                    <div style={{flex:1}}><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1.5,marginBottom:3}}>{l.toUpperCase()}</div><div style={{fontSize:13,fontWeight:700,color:c}}>{item.en} — {item.g}</div><div style={{fontSize:11,color:C.muted}}>{item.stage} · {item.u} units</div></div>
                  </div>
                ))}
                {allGraded.filter(x=>x.g<50).length>0&&<div style={{padding:"13px 15px",borderRadius:13,background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.25)"}}><div style={{fontSize:10,color:"#EF4444",fontWeight:700,letterSpacing:1.5,marginBottom:3}}>⚠ FAILING</div><div style={{fontSize:12,color:"#EF4444"}}>{allGraded.filter(x=>x.g<50).map(x=>x.en).join(", ")}</div></div>}
                <div style={{padding:"13px 15px",borderRadius:13,background:C.sub}}><div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1.5,marginBottom:3}}>SUBJECTS ENTERED</div><div style={{fontSize:13,fontWeight:700}}>{allGraded.length} of {STAGES.reduce((a,s)=>a+s.subjects.length,0)} ({((allGraded.length/STAGES.reduce((a,s)=>a+s.subjects.length,0))*100).toFixed(0)}%)</div></div>
              </div>
            )}
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:26}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:2,marginBottom:16}}>TARGET CALCULATOR</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}>{[50,60,70,80,90,95].map(v=>(<button key={v} className="btn" onClick={()=>setTargetAvg(v)} style={{padding:"7px 14px",borderRadius:9,border:`1px solid ${targetAvg===v?gc(v)+"80":C.border}`,background:targetAvg===v?`${gc(v)}15`:"transparent",color:targetAvg===v?gc(v):C.muted,fontWeight:700,fontSize:14,fontFamily:"'JetBrains Mono'"}}>{v}</button>))}</div>
            <div style={{padding:18,borderRadius:14,marginBottom:16,background:metrics.needed==null?C.sub:metrics.needed<0?"rgba(16,185,129,.1)":metrics.needed>100?"rgba(239,68,68,.1)":"rgba(251,191,36,.1)",border:`1px solid ${metrics.needed==null?C.border:metrics.needed<0?"rgba(16,185,129,.3)":metrics.needed>100?"rgba(239,68,68,.3)":"rgba(251,191,36,.3)"}`}}>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:2,marginBottom:6}}>NEEDED IN REMAINING {metrics.remainW.toFixed(0)}% WEIGHT</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:52,letterSpacing:3,lineHeight:1,color:metrics.needed==null?C.muted:metrics.needed<0?"#10B981":metrics.needed>100?"#EF4444":"#FBBF24"}}>{metrics.needed==null?"——":metrics.needed<0?"ACHIEVED ✓":metrics.needed>100?"IMPOSSIBLE":metrics.needed.toFixed(2)}</div>
            </div>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:2,marginBottom:12}}>PER-STAGE PROGRESS</div>
            {STAGES.map((s,i)=>{const sp=metrics.perStage[i];return(<div key={i} style={{marginBottom:9}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color:C.text,fontWeight:600}}>{s.full} <span style={{opacity:.5}}>({s.weight}%)</span></span><span style={{color:sp.avg!=null?gc(sp.avg):C.muted,fontFamily:"'JetBrains Mono'",fontWeight:700}}>{sp.avg!=null?`${sp.avg.toFixed(1)}%`:"—"}</span></div><div style={{height:5,background:dark?"rgba(255,255,255,.07)":"rgba(0,0,0,.07)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,background:sp.avg!=null?gc(sp.avg):C.border,width:`${sp.pct*100}%`,transition:"width .5s"}}/></div></div>);})}
          </div>
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QBANK: LIBRARY SCREEN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Library({questions, onUpload, onStart, dark}) {
  const C=TH(dark);
  const [dragOver,setDragOver]=useState(false);
  const [search,setSearch]=useState("");
  const [page,setPage]=useState(0);
  const fileRef=useRef();
  const PER=10;

  const parseFile=(file)=>{
    if(!file?.name?.endsWith(".json")){alert("Please upload a .json file");return;}
    const r=new FileReader();
    r.onload=(e)=>{
      try{
        const data=JSON.parse(e.target.result);
        const qs=Array.isArray(data)?data:(data.questions||[]);
        if(!qs.length)throw new Error("No questions found");
        if(!qs.every(q=>q.text&&q.options&&q.correctAnswer))throw new Error("Questions must have: text, options, correctAnswer");
        onUpload(qs);
        alert(`✓ ${qs.length} questions loaded successfully!`);
      }catch(err){alert("Error: "+err.message);}
    };
    r.onerror=()=>alert("Error reading file");
    r.readAsText(file);
  };

  const handleDrop=(e)=>{e.preventDefault();setDragOver(false);parseFile(e.dataTransfer.files[0]);};
  const handleFile=(e)=>parseFile(e.target.files[0]);

  const downloadTemplate=()=>{
    const tmpl=JSON.stringify([{id:"q001",system:"Cardiology",subject:"Internal Medicine",difficulty:"Medium",text:"A 55-year-old man presents with chest pain. What is the most likely diagnosis?",options:["Angina","STEMI","NSTEMI","Pericarditis","Aortic dissection"],correctAnswer:"STEMI",explanation:"Detailed explanation here...",educationalObjective:"Recognize STEMI presentation.",tags:["STEMI","ACS"],hint:"Look at the ECG findings.",imageUrl:null,type:"single"}],null,2);
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([tmpl],{type:"application/json"}));
    a.download="qbank-template.json";
    document.body.appendChild(a);a.click();document.body.removeChild(a);
  };

  const systems=useMemo(()=>{const m={};questions.forEach(q=>{m[q.system||"General"]=(m[q.system||"General"]||0)+1;});return m;},[questions]);
  const diffs=useMemo(()=>{const m={Easy:0,Medium:0,Hard:0};questions.forEach(q=>{if(m[q.difficulty]!=null)m[q.difficulty]++;});return m;},[questions]);
  const filtered=useMemo(()=>questions.filter(q=>{if(!search)return true;const s=search.toLowerCase();return q.text?.toLowerCase().includes(s)||q.system?.toLowerCase().includes(s)||q.subject?.toLowerCase().includes(s)||q.tags?.some(t=>t.toLowerCase().includes(s));}),[questions,search]);
  const paged=filtered.slice(page*PER,(page+1)*PER);
  const pages=Math.ceil(filtered.length/PER);

  const Card={background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:"20px 22px"};

  return(
    <div className="fu" style={{minHeight:"100dvh",background:C.bg,color:C.text,padding:"32px 28px",maxWidth:1100,margin:"0 auto"}}>
      {/* Header */}
      <div style={{marginBottom:28}}>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:38,letterSpacing:4,color:C.acc,lineHeight:1}}>QUESTION LIBRARY</div>
        <div style={{fontSize:13,color:C.muted,marginTop:4}}>Upload your JSON question bank or use the built-in sample questions to start practicing.</div>
      </div>

      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:28}}>
        <div style={{...Card,textAlign:"center"}}><div style={{fontFamily:"'Bebas Neue'",fontSize:42,color:C.acc,letterSpacing:2}}>{questions.length}</div><div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:1.5}}>TOTAL QUESTIONS</div></div>
        <div style={{...Card,textAlign:"center"}}><div style={{fontFamily:"'Bebas Neue'",fontSize:42,color:"#60A5FA",letterSpacing:2}}>{Object.keys(systems).length}</div><div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:1.5}}>SYSTEMS</div></div>
        {[["Easy","#10B981"],["Medium","#FBBF24"],["Hard","#EF4444"]].map(([d,c])=>(
          <div key={d} style={{...Card,textAlign:"center"}}><div style={{fontFamily:"'Bebas Neue'",fontSize:42,color:c,letterSpacing:2}}>{diffs[d]}</div><div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:1.5}}>{d.toUpperCase()}</div></div>
        ))}
      </div>

      {/* Upload zone */}
      <div style={{...Card,marginBottom:28}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
          <div style={{fontSize:12,color:C.muted,fontWeight:700,letterSpacing:2}}>UPLOAD QUESTION FILE</div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn" onClick={downloadTemplate} style={{padding:"8px 16px",borderRadius:10,border:`1px solid ${C.border}`,background:C.inp,color:C.muted,fontSize:12,fontWeight:600}}>↓ Download Template</button>
            <button className="btn" onClick={()=>onUpload(SAMPLE_QS)} style={{padding:"8px 16px",borderRadius:10,border:`1px solid rgba(0,212,170,.3)`,background:"rgba(0,212,170,.08)",color:C.acc,fontSize:12,fontWeight:600}}>Use Sample Questions ({SAMPLE_QS.length})</button>
          </div>
        </div>
        <div onDrop={handleDrop} onDragOver={(e)=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${dragOver?C.acc:C.border}`,borderRadius:14,padding:"36px 24px",textAlign:"center",cursor:"pointer",background:dragOver?"rgba(0,212,170,.05)":C.sub,transition:"all .2s"}}>
          <div style={{fontSize:32,marginBottom:10}}>📂</div>
          <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:4}}>Drop your JSON file here or click to upload</div>
          <div style={{fontSize:12,color:C.muted}}>Supports .json files with array of questions or {"{ questions: [...] }"}</div>
          <input ref={fileRef} type="file" accept=".json" onChange={handleFile} style={{display:"none"}}/>
        </div>
        <div style={{marginTop:14,padding:12,borderRadius:10,background:C.sub,fontSize:11,color:C.muted,fontFamily:"'JetBrains Mono'"}}>
          <span style={{color:C.acc,fontWeight:700}}>Required fields per question:</span> id · text · options · correctAnswer<br/>
          <span style={{color:C.acc,fontWeight:700}}>Optional:</span> system · subject · difficulty · explanation · educationalObjective · tags · hint · imageUrl · type
        </div>
      </div>

      {/* Question list */}
      {questions.length>0&&(
        <div style={{...Card,marginBottom:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
            <div style={{fontSize:12,color:C.muted,fontWeight:700,letterSpacing:2}}>QUESTION BROWSER ({filtered.length})</div>
            <input value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}} placeholder="Search questions, systems, tags..." style={{padding:"8px 14px",borderRadius:10,border:`1px solid ${C.border}`,background:C.inp,color:C.text,fontSize:13,outline:"none",width:260}}/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {paged.map((q,i)=>(
              <div key={q.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 13px",borderRadius:10,background:C.sub,cursor:"default"}}>
                <div style={{fontSize:11,fontFamily:"'JetBrains Mono'",color:C.acc,fontWeight:700,minWidth:36}}>Q{page*PER+i+1}</div>
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.text}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{q.system||"—"} · {q.subject||"—"}</div></div>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  {q.difficulty&&<span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:6,background:`${diffC(q.difficulty)}18`,color:diffC(q.difficulty)}}>{q.difficulty}</span>}
                  <span style={{fontSize:11,color:C.muted,fontFamily:"'JetBrains Mono'"}}>{q.options?.length||0} opts</span>
                </div>
              </div>
            ))}
          </div>
          {pages>1&&(
            <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:14}}>
              <button className="btn" onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${C.border}`,background:C.inp,color:C.text,opacity:page===0?.4:1}}>←</button>
              <span style={{padding:"6px 12px",fontSize:13,color:C.muted,fontFamily:"'JetBrains Mono'"}}>{page+1}/{pages}</span>
              <button className="btn" onClick={()=>setPage(p=>Math.min(pages-1,p+1))} disabled={page===pages-1} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${C.border}`,background:C.inp,color:C.text,opacity:page===pages-1?.4:1}}>→</button>
            </div>
          )}
        </div>
      )}

      {/* Start button */}
      {questions.length>0&&(
        <button className="btn" onClick={onStart} style={{width:"100%",padding:"18px",borderRadius:16,background:"linear-gradient(135deg,#00D4AA,#3B82F6)",color:"white",fontSize:16,fontWeight:800,fontFamily:"'Bebas Neue'",letterSpacing:2,marginBottom:24}}>
          START NEW SESSION → {questions.length} QUESTIONS AVAILABLE
        </button>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QBANK: SESSION CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SessionConfig({questions, onStart, onBack, dark}) {
  const C=TH(dark);
  const allSystems=[...new Set(questions.map(q=>q.system||"General"))].sort();
  const allDiffs=["Easy","Medium","Hard"];
  const [name,setName]=useState("Practice Session");
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
    if(!qs.length){alert("No questions match your filters.");return;}
    onStart({name,mode,timeLimit:timeLimit*60,questions:qs,startTime:Date.now()});
  };

  const Card={background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:"22px 24px",marginBottom:16};
  const ChipBase={padding:"7px 14px",borderRadius:10,border:`1px solid`,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .15s"};

  return(
    <div className="fu" style={{minHeight:"100dvh",background:C.bg,color:C.text,padding:"32px 28px",maxWidth:820,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:28}}>
        <button className="btn" onClick={onBack} style={{padding:"9px 16px",borderRadius:10,border:`1px solid ${C.border}`,background:C.inp,color:C.text,fontSize:13,fontWeight:600}}>← Library</button>
        <div><div style={{fontFamily:"'Bebas Neue'",fontSize:34,letterSpacing:4,color:C.acc}}>SESSION SETUP</div><div style={{fontSize:12,color:C.muted}}>{available.length} questions match your filters</div></div>
      </div>

      <div style={Card}>
        <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:2,marginBottom:10}}>SESSION NAME</div>
        <input value={name} onChange={e=>setName(e.target.value)} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,background:C.inp,color:C.text,fontSize:14,outline:"none"}}/>
      </div>

      <div style={Card}>
        <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:2,marginBottom:12}}>SESSION MODE</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[["study","📖 Study Mode","Immediate feedback after each answer"],["timed","⏱ Timed Exam","Race against the clock, review at end"],["review","📋 Review Mode","No timer, review answers at end"]].map(([v,l,desc])=>(
            <button key={v} className="btn" onClick={()=>setMode(v)} style={{flex:"1 1 160px",padding:"12px 14px",borderRadius:12,border:`1.5px solid ${mode===v?C.acc:C.border}`,background:mode===v?"rgba(0,212,170,.08)":C.inp,color:mode===v?C.acc:C.text,textAlign:"left"}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:3}}>{l}</div>
              <div style={{fontSize:11,color:C.muted,fontWeight:400}}>{desc}</div>
            </button>
          ))}
        </div>
        {mode==="timed"&&(
          <div style={{marginTop:14}}>
            <div style={{fontSize:11,color:C.muted,fontWeight:600,marginBottom:8}}>TIMER DURATION</div>
            <div style={{display:"flex",gap:8}}>{[15,30,45,60,90,120].map(m=><button key={m} className="btn" onClick={()=>setTimeLimit(m)} style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${timeLimit===m?C.acc:C.border}`,background:timeLimit===m?"rgba(0,212,170,.1)":C.inp,color:timeLimit===m?C.acc:C.muted,fontWeight:700,fontFamily:"'JetBrains Mono'"}}>{m}m</button>)}</div>
          </div>
        )}
      </div>

      <div style={Card}>
        <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:2,marginBottom:12}}>FILTER BY SYSTEM</div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          <button className="btn" onClick={()=>setSystems(new Set(allSystems))} style={{...ChipBase,borderColor:systems.size===allSystems.length?C.acc:C.border,background:systems.size===allSystems.length?"rgba(0,212,170,.1)":C.inp,color:systems.size===allSystems.length?C.acc:C.muted}}>All Systems</button>
          {allSystems.map(s=><button key={s} className="btn" onClick={()=>toggleSet(systems,setSystems,s)} style={{...ChipBase,borderColor:systems.has(s)?C.acc:C.border,background:systems.has(s)?"rgba(0,212,170,.1)":C.inp,color:systems.has(s)?C.acc:C.muted}}>{s}</button>)}
        </div>
      </div>

      <div style={Card}>
        <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:2,marginBottom:12}}>FILTER BY DIFFICULTY</div>
        <div style={{display:"flex",gap:8}}>
          {allDiffs.map(d=><button key={d} className="btn" onClick={()=>toggleSet(diffs,setDiffs,d)} style={{flex:1,padding:"10px 14px",borderRadius:10,border:`1.5px solid ${diffs.has(d)?diffC(d):C.border}`,background:diffs.has(d)?`${diffC(d)}12`:C.inp,color:diffs.has(d)?diffC(d):C.muted,fontWeight:700,fontSize:13}}>{d}</button>)}
        </div>
      </div>

      <div style={Card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:2}}>NUMBER OF QUESTIONS</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:24,color:C.acc,letterSpacing:2}}>{finalCount}</div>
        </div>
        <input type="range" min={1} max={available.length||1} value={count} onChange={e=>setCount(Number(e.target.value))} style={{width:"100%",accentColor:C.acc}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginTop:4}}><span>1</span><span>{available.length} available</span></div>
        <div style={{marginTop:14,display:"flex",alignItems:"center",gap:10}}>
          <button className="btn" onClick={()=>setRandomize(r=>!r)} style={{width:36,height:20,borderRadius:10,background:randomize?C.acc:C.border,position:"relative",transition:"background .2s"}}>
            <div style={{position:"absolute",top:2,left:randomize?18:2,width:16,height:16,borderRadius:"50%",background:"white",transition:"left .2s"}}/>
          </button>
          <span style={{fontSize:13,color:C.text,fontWeight:500}}>Randomize question order</span>
        </div>
      </div>

      <button className="btn" onClick={handleStart} style={{width:"100%",padding:"18px",borderRadius:16,background:`linear-gradient(135deg,${C.acc},${C.acc2})`,color:"white",fontSize:16,fontWeight:800,fontFamily:"'Bebas Neue'",letterSpacing:2}}>
        BEGIN SESSION — {finalCount} QUESTIONS {mode==="timed"?`· ${timeLimit} MIN`:""}
      </button>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QBANK: ACTIVE SESSION
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
  const [showHint,setShowHint]=useState(false);
  const [showNote,setShowNote]=useState(false);
  const [timeLeft,setTimeLeft]=useState(timeLimit||3600);
  const [sidebarOpen,setSidebarOpen]=useState(true);

  const q=questions[cur];
  const isStudy=mode==="study";
  const isTimed=mode==="timed";

  useEffect(()=>{
    const prev=answers[q?.id];
    setSelected(prev?.selected||null);
    setSubmitted(!!prev);
    setShowHint(false);
    setShowNote(false);
  },[cur,q?.id]);

  useEffect(()=>{
    if(mode!=="timed"||timeLeft<=0)return;
    const t=setInterval(()=>setTimeLeft(p=>{if(p<=1){clearInterval(t);handleEnd();return 0;}return p-1;}),1000);
    return()=>clearInterval(t);
  },[mode,timeLeft]);

  const handleSelect=(opt)=>{if(submitted)return;setSelected(opt);};

  const handleSubmit=()=>{
    if(!selected)return;
    const correct=selected===q.correctAnswer;
    setAnswers(prev=>({...prev,[q.id]:{selected,correct,questionId:q.id}}));
    setSubmitted(true);
  };

  const handleNext=()=>{
    if(cur<questions.length-1){setCur(c=>c+1);}
    else{handleEnd();}
  };

  const handleEnd=()=>{
    const elapsed=timeLimit-(timeLeft||0);
    onEnd({...config,answers,marked,notes,elapsed:mode==="timed"?elapsed:timeLimit-timeLeft,endTime:Date.now()});
  };

  const progress=Math.round((Object.keys(answers).length/questions.length)*100);
  const timerColor=timeLeft<300?"#EF4444":timeLeft<600?"#FBBF24":C.acc;

  const statusDot=(qItem)=>{
    const a=answers[qItem.id];
    if(qItem.id===q?.id)return{bg:C.acc,pulse:true};
    if(a)return{bg:a.correct?"#10B981":"#EF4444",pulse:false};
    if(marked[qItem.id])return{bg:"#FBBF24",pulse:false};
    return{bg:C.border,pulse:false};
  };

  const optStyle=(opt)=>{
    const base={display:"flex",alignItems:"flex-start",gap:12,padding:"13px 16px",borderRadius:12,border:`1.5px solid`,marginBottom:8,transition:"all .15s",cursor:submitted?"default":"pointer"};
    if(!submitted&&selected===opt)return{...base,borderColor:C.acc,background:"rgba(0,212,170,.08)",color:C.text};
    if(!submitted)return{...base,borderColor:C.border,background:C.sub,color:C.text};
    if(opt===q.correctAnswer)return{...base,borderColor:"#10B981",background:"rgba(16,185,129,.1)",color:C.text};
    if(opt===selected&&opt!==q.correctAnswer)return{...base,borderColor:"#EF4444",background:"rgba(239,68,68,.1)",color:C.text};
    return{...base,borderColor:C.border,background:C.sub,color:C.muted};
  };

  return(
    <div style={{minHeight:"100dvh",background:C.bg,color:C.text,"--br":C.border}}>
      {/* Header */}
      <div style={{position:"sticky",top:0,zIndex:50,background:C.hdr,backdropFilter:"blur(16px)",borderBottom:`1px solid ${C.border}`,padding:"0 20px",height:60,display:"flex",alignItems:"center",gap:14}}>
        <button className="btn" onClick={()=>{if(window.confirm("End session?"))handleEnd();}} style={{padding:"7px 14px",borderRadius:9,border:`1px solid ${C.border}`,background:C.inp,color:C.text,fontSize:12,fontWeight:600,flexShrink:0}}>← End</button>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</div>
          <div style={{fontSize:11,color:C.muted}}>{Object.keys(answers).length}/{questions.length} answered · {progress}%</div>
        </div>
        <div style={{height:4,flex:1,borderRadius:2,background:C.border,overflow:"hidden",maxWidth:200}}>
          <div style={{height:"100%",background:`linear-gradient(90deg,${C.acc},${C.acc2})`,width:`${progress}%`,transition:"width .4s",borderRadius:2}}/>
        </div>
        {mode!=="study"&&(
          <div style={{display:"flex",alignItems:"center",gap:6,fontFamily:"'JetBrains Mono'",fontSize:15,fontWeight:700,color:timerColor,flexShrink:0}}>
            ⏱ {fmtTime(timeLeft)}
          </div>
        )}
        <button className="btn" onClick={()=>setSidebarOpen(s=>!s)} style={{padding:"7px 10px",borderRadius:9,border:`1px solid ${C.border}`,background:C.inp,color:C.text,fontSize:12}} title="Toggle sidebar">☰</button>
      </div>

      {/* Main layout */}
      <div className="sl" style={{display:"flex",minHeight:"calc(100dvh - 60px)"}}>
        {/* Sidebar */}
        {sidebarOpen&&(
          <div className="sc-col" style={{width:200,borderRight:`1px solid ${C.border}`,padding:12,overflowY:"auto",flexShrink:0}}>
            <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:2,marginBottom:10,paddingLeft:4}}>QUESTIONS</div>
            {questions.map((qItem,idx)=>{const dot=statusDot(qItem);return(
              <div key={qItem.id} className="sq" onClick={()=>setCur(idx)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:9,marginBottom:3,background:cur===idx?`${C.acc}12`:"transparent",border:`1px solid ${cur===idx?C.acc+"40":"transparent"}`}}>
                <div className={dot.pulse?"pu":""} style={{width:8,height:8,borderRadius:"50%",background:dot.bg,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:600,fontFamily:"'JetBrains Mono'",color:cur===idx?C.acc:C.text}}>Q{idx+1}</div>
                  <div style={{fontSize:9,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{qItem.system||"—"}</div>
                </div>
                {marked[qItem.id]&&<span style={{fontSize:9,color:"#FBBF24"}}>★</span>}
              </div>
            );})}
          </div>
        )}

        {/* Question area */}
        <div className="fu" key={cur} style={{flex:1,padding:"28px",overflowY:"auto",maxWidth:800}}>
          {/* Question header */}
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,flexWrap:"wrap"}}>
            <div style={{fontFamily:"'JetBrains Mono'",fontSize:12,color:C.muted}}>Q{cur+1}/{questions.length}</div>
            {q.system&&<span style={{fontSize:11,padding:"3px 10px",borderRadius:20,background:`${C.acc}18`,color:C.acc,fontWeight:600}}>{q.system}</span>}
            {q.subject&&<span style={{fontSize:11,padding:"3px 10px",borderRadius:20,background:`${C.acc2}18`,color:C.acc2,fontWeight:600}}>{q.subject}</span>}
            {q.difficulty&&<span style={{fontSize:11,padding:"3px 10px",borderRadius:20,background:`${diffC(q.difficulty)}18`,color:diffC(q.difficulty),fontWeight:700}}>{q.difficulty}</span>}
            <div style={{marginLeft:"auto",display:"flex",gap:6}}>
              <button className="btn" onClick={()=>setMarked(m=>({...m,[q.id]:!m[q.id]}))} style={{padding:"5px 11px",borderRadius:8,border:`1px solid ${marked[q.id]?"#FBBF24":""+C.border}`,background:marked[q.id]?"rgba(251,191,36,.12)":C.inp,color:marked[q.id]?"#FBBF24":C.muted,fontSize:11,fontWeight:600}}>
                {marked[q.id]?"★ Marked":"☆ Mark"}
              </button>
            </div>
          </div>

          {/* Question stem */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"22px 24px",marginBottom:20,lineHeight:1.75,fontSize:15,fontWeight:500}} dangerouslySetInnerHTML={{__html:hlStem(q.text)}}/>

          {/* Image */}
          {q.imageUrl&&<img src={q.imageUrl} alt="Question media" style={{maxWidth:"100%",borderRadius:12,marginBottom:16,maxHeight:300,objectFit:"contain"}}/>}

          {/* Options */}
          <div style={{marginBottom:16}}>
            {q.options.map((opt,i)=>(
              <div key={opt} className={`opt${submitted?" locked":""}`} style={optStyle(opt)} onClick={()=>handleSelect(opt)}>
                <div style={{width:22,height:22,borderRadius:6,background:`${submitted?(opt===q.correctAnswer?"#10B981":opt===selected&&opt!==q.correctAnswer?"#EF4444":C.border):selected===opt?C.acc:C.border}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:submitted?(opt===q.correctAnswer?"#10B981":opt===selected?"#EF4444":C.muted):selected===opt?C.acc:C.muted,flexShrink:0}}>
                  {String.fromCharCode(65+i)}
                </div>
                <div style={{flex:1,fontSize:14,lineHeight:1.5}}>{opt}</div>
                {submitted&&opt===q.correctAnswer&&<span style={{color:"#10B981",fontSize:16,flexShrink:0}}>✓</span>}
                {submitted&&opt===selected&&opt!==q.correctAnswer&&<span style={{color:"#EF4444",fontSize:16,flexShrink:0}}>✗</span>}
              </div>
            ))}
          </div>

          {/* Hint */}
          {q.hint&&!submitted&&(
            <button className="btn" onClick={()=>setShowHint(s=>!s)} style={{padding:"8px 14px",borderRadius:10,border:`1px solid ${C.border}`,background:C.inp,color:C.muted,fontSize:12,marginBottom:12}}>
              💡 {showHint?"Hide hint":"Show hint"}
            </button>
          )}
          {showHint&&q.hint&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(251,191,36,.1)",border:"1px solid rgba(251,191,36,.3)",fontSize:13,color:"#FBBF24",marginBottom:12}}>{q.hint}</div>}

          {/* Actions */}
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            <button className="btn" onClick={()=>setCur(c=>Math.max(0,c-1))} disabled={cur===0} style={{padding:"10px 18px",borderRadius:10,border:`1px solid ${C.border}`,background:C.inp,color:C.text,fontSize:13,fontWeight:600,opacity:cur===0?.4:1}}>← Previous</button>
            {!submitted?(
              <button className="btn" onClick={handleSubmit} disabled={!selected} style={{flex:1,padding:"10px 18px",borderRadius:10,background:selected?`linear-gradient(135deg,${C.acc},${C.acc2})`:"rgba(0,212,170,.2)",color:"white",fontSize:13,fontWeight:700,opacity:selected?1:.5}}>Submit Answer</button>
            ):(
              <button className="btn" onClick={handleNext} style={{flex:1,padding:"10px 18px",borderRadius:10,background:`linear-gradient(135deg,${C.acc},${C.acc2})`,color:"white",fontSize:13,fontWeight:700}}>
                {cur===questions.length-1?"Finish Session →":"Next Question →"}
              </button>
            )}
          </div>

          {/* Notes toggle */}
          <button className="btn" onClick={()=>setShowNote(s=>!s)} style={{padding:"7px 13px",borderRadius:9,border:`1px solid ${C.border}`,background:notes[q.id]?"rgba(0,212,170,.08)":C.inp,color:notes[q.id]?C.acc:C.muted,fontSize:12,marginBottom:showNote?8:0}}>
            📝 {notes[q.id]?"Notes (saved)":"Add notes"}
          </button>
          {showNote&&<textarea value={notes[q.id]||""} onChange={e=>setNotes(n=>({...n,[q.id]:e.target.value}))} placeholder="Write your notes here..." rows={3} style={{width:"100%",padding:"10px 13px",borderRadius:10,border:`1px solid ${C.border}`,background:C.inp,color:C.text,fontSize:13,outline:"none",marginTop:0,marginBottom:12}}/>}

          {/* Explanation — Study mode only */}
          {submitted&&isStudy&&(
            <div className="sc" style={{padding:"20px 22px",borderRadius:14,background:C.card,border:`2px solid ${answers[q.id]?.correct?"#10B981":"#EF4444"}40`,marginTop:4}}>
              <div style={{fontSize:12,color:answers[q.id]?.correct?"#10B981":"#EF4444",fontWeight:700,letterSpacing:1.5,marginBottom:10}}>
                {answers[q.id]?.correct?"✓ CORRECT!":"✗ INCORRECT"}
              </div>
              {q.explanation&&<><div style={{fontSize:12,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:6}}>EXPLANATION</div><div style={{fontSize:14,lineHeight:1.75,color:C.text,marginBottom:12}}>{q.explanation}</div></>}
              {q.educationalObjective&&<div style={{padding:"10px 13px",borderRadius:9,background:C.sub,fontSize:12,color:C.muted}}><span style={{color:C.acc,fontWeight:700}}>🎯 Objective: </span>{q.educationalObjective}</div>}
              {q.tags?.length>0&&<div style={{marginTop:10,display:"flex",gap:5,flexWrap:"wrap"}}>{q.tags.map(t=><span key={t} style={{fontSize:11,padding:"2px 9px",borderRadius:20,background:`${C.acc}18`,color:C.acc}}>{t}</span>)}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QBANK: SESSION REVIEW
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SessionReview({result, onExit, onRetry, dark}) {
  const C=TH(dark);
  const {questions,answers,marked,notes,name,mode,elapsed}=result;
  const [expandedQ,setExpandedQ]=useState(null);
  const [filterState,setFilterState]=useState("all");

  const correct=Object.values(answers).filter(a=>a.correct).length;
  const incorrect=Object.values(answers).filter(a=>!a.correct).length;
  const skipped=questions.length-Object.keys(answers).length;
  const score=questions.length>0?Math.round((correct/questions.length)*100):0;
  const scoreColor=gc(score);

  const sysStat=useMemo(()=>{const m={};questions.forEach(q=>{const s=q.system||"General";if(!m[s])m[s]={total:0,correct:0};m[s].total++;if(answers[q.id]?.correct)m[s].correct++;});return Object.entries(m).map(([s,v])=>({system:s,total:v.total,correct:v.correct,pct:Math.round((v.correct/v.total)*100)}));},[questions,answers]);

  const filteredQs=questions.filter(q=>{const a=answers[q.id];if(filterState==="correct")return a?.correct;if(filterState==="incorrect")return a&&!a.correct;if(filterState==="skipped")return!a;if(filterState==="marked")return marked[q.id];return true;});

  const Card={background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:"22px 24px",marginBottom:16};

  return(
    <div className="fu" style={{minHeight:"100dvh",background:C.bg,color:C.text,padding:"32px 28px",maxWidth:960,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:28,flexWrap:"wrap"}}>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:36,letterSpacing:4,color:C.acc}}>SESSION COMPLETE</div>
          <div style={{fontSize:13,color:C.muted}}>{name} · {mode.charAt(0).toUpperCase()+mode.slice(1)} Mode · {fmtTime(elapsed||0)} elapsed</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn" onClick={onRetry} style={{padding:"10px 20px",borderRadius:12,border:`1px solid ${C.acc}40`,background:"rgba(0,212,170,.08)",color:C.acc,fontWeight:700}}>Retry Session</button>
          <button className="btn" onClick={onExit} style={{padding:"10px 20px",borderRadius:12,border:`1px solid ${C.border}`,background:C.inp,color:C.text,fontWeight:600}}>← Library</button>
        </div>
      </div>

      {/* Score + Stats */}
      <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:16,marginBottom:16,alignItems:"stretch"}}>
        <div style={{...Card,textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minWidth:160}}>
          <div style={{width:100,height:100,borderRadius:"50%",border:`5px solid ${scoreColor}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:36,color:scoreColor,letterSpacing:2}}>{score}%</div>
          </div>
          <div style={{fontSize:16,fontWeight:800,color:scoreColor}}>{classify(score)?.label||"—"}</div>
          <div style={{fontSize:13,color:C.muted,direction:"rtl"}}>{classify(score)?.ar||""}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
          {[["✓ Correct",correct,"#10B981"],["✗ Incorrect",incorrect,"#EF4444"],["— Skipped",skipped,"#888"],[`★ Marked`,Object.values(marked).filter(v=>v).length,"#FBBF24"]].map(([l,v,c])=>(
            <div key={l} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 18px",textAlign:"center"}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:32,color:c,letterSpacing:1}}>{v}</div>
              <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:1}}>{l.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* System breakdown */}
      {sysStat.length>0&&(
        <div style={Card}>
          <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:2,marginBottom:14}}>SYSTEM BREAKDOWN</div>
          {sysStat.map(s=>(
            <div key={s.system} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                <span style={{fontWeight:600}}>{s.system}</span>
                <span style={{fontFamily:"'JetBrains Mono'",color:gc(s.pct)}}>{s.correct}/{s.total} ({s.pct}%)</span>
              </div>
              <div style={{height:6,borderRadius:3,background:dark?"rgba(255,255,255,.07)":"rgba(0,0,0,.07)",overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:3,background:gc(s.pct),width:`${s.pct}%`,transition:"width .6s"}}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Question review */}
      <div style={Card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
          <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:2}}>QUESTION REVIEW ({filteredQs.length})</div>
          <div style={{display:"flex",gap:6}}>
            {[["all","All"],["correct","Correct"],["incorrect","Incorrect"],["skipped","Skipped"],["marked","Marked"]].map(([v,l])=>(
              <button key={v} className="btn" onClick={()=>setFilterState(v)} style={{padding:"5px 11px",borderRadius:8,border:`1px solid ${filterState===v?C.acc:C.border}`,background:filterState===v?"rgba(0,212,170,.1)":C.inp,color:filterState===v?C.acc:C.muted,fontSize:11,fontWeight:600}}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {filteredQs.map((q,idx)=>{const a=answers[q.id];const expanded=expandedQ===q.id;return(
            <div key={q.id} style={{borderRadius:11,border:`1px solid ${a?.correct?"#10B981"+(dark?"30":"50"):a?"#EF4444"+(dark?"30":"50"):C.border}`,overflow:"hidden"}}>
              <div onClick={()=>setExpandedQ(expanded?null:q.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",cursor:"pointer",background:expanded?C.sub:"transparent"}}>
                <span style={{fontSize:14,flexShrink:0}}>{a?.correct?"✓":a?"✗":"—"}</span>
                <div style={{flex:1,minWidth:0,fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.text}</div>
                {q.difficulty&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:6,background:`${diffC(q.difficulty)}18`,color:diffC(q.difficulty),fontWeight:700,flexShrink:0}}>{q.difficulty}</span>}
                {marked[q.id]&&<span style={{color:"#FBBF24",flexShrink:0}}>★</span>}
                <span style={{color:C.muted,fontSize:12,flexShrink:0}}>{expanded?"▲":"▼"}</span>
              </div>
              {expanded&&(
                <div style={{padding:"14px 16px",borderTop:`1px solid ${C.border}`,background:C.sub}}>
                  {a&&<div style={{marginBottom:10}}><span style={{fontSize:11,color:C.muted,fontWeight:600}}>Your answer: </span><span style={{color:a.correct?"#10B981":"#EF4444",fontWeight:700}}>{a.selected}</span></div>}
                  {!a&&<div style={{marginBottom:10,fontSize:12,color:C.muted,fontStyle:"italic"}}>Not answered</div>}
                  <div style={{marginBottom:10}}><span style={{fontSize:11,color:C.muted,fontWeight:600}}>Correct answer: </span><span style={{color:"#10B981",fontWeight:700}}>{q.correctAnswer}</span></div>
                  {q.explanation&&<div style={{fontSize:13,lineHeight:1.7,color:C.text,marginBottom:8}}>{q.explanation}</div>}
                  {q.educationalObjective&&<div style={{fontSize:12,color:C.muted,padding:"8px 12px",borderRadius:8,background:C.card}}><span style={{color:C.acc,fontWeight:700}}>🎯 </span>{q.educationalObjective}</div>}
                  {notes[q.id]&&<div style={{marginTop:8,fontSize:12,color:C.text,padding:"8px 12px",borderRadius:8,background:"rgba(0,212,170,.08)",border:`1px solid ${C.acc}30`}}><span style={{color:C.acc,fontWeight:700}}>📝 Your note: </span>{notes[q.id]}</div>}
                </div>
              )}
            </div>
          );})}
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QBANK APP (view manager)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function QbankApp({dark}) {
  const [view,setView]=useState("library");
  const [questions,setQuestions]=useState(SAMPLE_QS);
  const [sessionConfig,setSessionConfig]=useState(null);
  const [sessionResult,setSessionResult]=useState(null);

  useEffect(()=>{
    (async()=>{try{const r=await window.storage.get("qbank-library");if(r?.value){const qs=JSON.parse(r.value);if(qs?.length)setQuestions(qs);}}catch{}})();
  },[]);

  const handleUpload=async(qs)=>{
    setQuestions(qs);
    try{await window.storage.set("qbank-library",JSON.stringify(qs));}catch{}
  };

  const handleStart=(cfg)=>{setSessionConfig(cfg);setView("session");};
  const handleEnd=(result)=>{setSessionResult(result);setView("review");};

  return(
    <>
      {view==="library"&&<Library questions={questions} onUpload={handleUpload} onStart={()=>setView("config")} dark={dark}/>}
      {view==="config"&&<SessionConfig questions={questions} onStart={handleStart} onBack={()=>setView("library")} dark={dark}/>}
      {view==="session"&&sessionConfig&&<ActiveSession config={sessionConfig} onEnd={handleEnd} dark={dark}/>}
      {view==="review"&&sessionResult&&<SessionReview result={sessionResult} onExit={()=>setView("library")} onRetry={()=>setView("config")} dark={dark}/>}
    </>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROOT APP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function App() {
  const [tab,setTab]=useState("qbank");
  const [dark,setDark]=useState(true);
  const C=TH(dark);

  return(
    <div style={{minHeight:"100dvh",background:C.bg,color:C.text,fontFamily:"'Outfit',system-ui,sans-serif"}}>
      <style>{GCSS}</style>
      {/* Global nav */}
      <div style={{position:"sticky",top:0,zIndex:100,background:C.hdr,backdropFilter:"blur(20px)",borderBottom:`1px solid ${C.border}`,padding:"0 24px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",gap:14}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#00D4AA,#3B82F6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontFamily:"'Bebas Neue'",color:"white",letterSpacing:1,flexShrink:0}}>M</div>
          <div onClick={()=>window.open("https://t.me/ddxo2","_blank","noopener,noreferrer")} style={{cursor:"pointer",userSelect:"none"}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:17,letterSpacing:3,lineHeight:1}}>MedIQ Pro</div>
            <div style={{fontSize:9,color:C.muted,fontFamily:"'JetBrains Mono'",letterSpacing:1.5,fontWeight:700}}>WARITH AL-ANBIYAA · DEV: HAIDER EMAD</div>
          </div>
        </div>
        <div style={{display:"flex",gap:4}}>
          {[["cgpa","📊 CGPA"],["qbank","📚 Qbank"]].map(([k,l])=>(
            <button key={k} className="btn" onClick={()=>setTab(k)} style={{padding:"8px 18px",borderRadius:10,background:tab===k?(dark?"rgba(255,255,255,.1)":"rgba(0,0,0,.08)"):"transparent",color:tab===k?C.text:C.muted,fontWeight:600,fontSize:13,border:"none"}}>
              {l}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn" onClick={()=>setDark(d=>!d)} style={{padding:"7px 14px",borderRadius:9,border:`1px solid ${C.border}`,background:C.inp,color:C.text,fontSize:12,fontWeight:600}}>
            {dark?"☀ Light":"☾ Dark"}
          </button>
        </div>
      </div>
      {tab==="cgpa"?<CGPAView dark={dark}/>:<QbankApp dark={dark}/>}
    </div>
  );
}