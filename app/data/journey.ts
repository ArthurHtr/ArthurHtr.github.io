export const kilnCases=[
 {title:"Energy optimisation",action:"Review the airflow and heat-recovery settings."},
 {title:"Malt quality prediction",action:"Review the drying profile against the batch target."},
 {title:"Predictive maintenance",action:"Inspect the fan showing an emerging vibration pattern."},
 {title:"Autonomous production planning",action:"Review the next batch slot against capacity and demand."},
];
type Scene={stage:number|null;title:string;kicker:string;subtitle:string;text:string};
export const journey:Scene[]=[
 {stage:null,title:"Inside the Future of Malting",kicker:"THE GUIDED JOURNEY · ABOUT ONE MINUTE",subtitle:"Six stages. A new perspective.",text:"Advance at your own pace. Step inside the kiln to discover intelligence in action."},
 {stage:0,title:"Grain intake & storage",kicker:"01 — WHERE THE JOURNEY BEGINS",subtitle:"Visibility starts with the grain.",text:"Every batch begins with visibility — from incoming grain to available stock."},
 {stage:1,title:"Cleaning & quality",kicker:"02 — EVERY GRAIN MATTERS",subtitle:"See deviations earlier.",text:"AI can help detect deviations earlier and support more consistent quality decisions."},
 {stage:2,title:"Steeping",kicker:"03 — AWAKENING THE GRAIN",subtitle:"Make changing conditions actionable.",text:"Process data makes changing conditions visible and actionable."},
 {stage:3,title:"Germination",kicker:"04 — UNLOCKING POTENTIAL",subtitle:"Anticipate the interruption.",text:"AI can help monitor complex conditions and anticipate operational interruptions."},
 {stage:4,title:"Kilning",kicker:"INSIDE THE KILN · A / D",subtitle:"Energy optimisation",text:"Optimise heat and airflow while protecting the target process conditions."},
 {stage:4,title:"Kilning",kicker:"INSIDE THE KILN · B / D",subtitle:"Malt quality prediction",text:"Anticipate quality outcomes before the batch is complete."},
 {stage:4,title:"Kilning",kicker:"INSIDE THE KILN · C / D",subtitle:"Predictive maintenance",text:"Detect early signals of equipment failure and plan intervention before disruption."},
 {stage:4,title:"Kilning",kicker:"INSIDE THE KILN · D / D",subtitle:"Autonomous production planning",text:"Coordinate batches, capacity and priorities through continuously updated recommendations."},
 {stage:5,title:"Packing & distribution",kicker:"06 — READY FOR THE NEXT CHAPTER",subtitle:"Intelligence travels with the malt.",text:"From production to delivery, intelligence extends across the value chain."},
 {stage:null,title:"The future is connected",kicker:"FROM GRAIN TO MALT",subtitle:"Connected, predictive and increasingly autonomous.",text:"From grain to malt, the future of production is connected, predictive and increasingly autonomous. AI is not just a software layer. It is an intelligence layer across the physical value chain."},
];
