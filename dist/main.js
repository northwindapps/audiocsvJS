(()=>{"use strict";const e={randomUUID:"undefined"!=typeof crypto&&crypto.randomUUID&&crypto.randomUUID.bind(crypto)};let o;const t=new Uint8Array(16);function n(){if(!o){if("undefined"==typeof crypto||!crypto.getRandomValues)throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");o=crypto.getRandomValues.bind(crypto)}return o(t)}const s=[];for(let w=0;w<256;++w)s.push((w+256).toString(16).slice(1));console.log(function(o,t,c){if(e.randomUUID&&!t&&!o)return e.randomUUID();const r=(o=o||{}).random||(o.rng||n)();if(r[6]=15&r[6]|64,r[8]=63&r[8]|128,t){c=c||0;for(let e=0;e<16;++e)t[c+e]=r[e];return t}return function(e,o=0){return(s[e[o+0]]+s[e[o+1]]+s[e[o+2]]+s[e[o+3]]+"-"+s[e[o+4]]+s[e[o+5]]+"-"+s[e[o+6]]+s[e[o+7]]+"-"+s[e[o+8]]+s[e[o+9]]+"-"+s[e[o+10]]+s[e[o+11]]+s[e[o+12]]+s[e[o+13]]+s[e[o+14]]+s[e[o+15]]).toLowerCase()}(r)}());const c=document.getElementById("uploadArea"),r=document.getElementById("fileInput");var i="",d={};function l(e){const o={};return e.forEach((e=>{o[e]="empty"})),o}function a(e){for(const o of e)"text/csv"===o.type||o.name.endsWith(".csv")?u(o):console.log("Not a CSV file:",o.name)}function u(e){const o=new FileReader;o.onload=function(e){const o=e.target.result,t=o.split("\n")[0].split(",").filter((e=>""!==e.trim()));console.log("CSV Header:",t),console.log("Number of Columns:",t.length),d=l(t),i=o},o.readAsText(e)}c.addEventListener("click",(()=>r.click())),c.addEventListener("dragover",(e=>{e.preventDefault(),c.classList.add("dragging")})),c.addEventListener("dragleave",(()=>{c.classList.remove("dragging")})),c.addEventListener("drop",(e=>{e.preventDefault(),c.classList.remove("dragging"),a(e.dataTransfer.files)})),r.addEventListener("change",(e=>{a(e.target.files)})),document.getElementById("downloadButton").addEventListener("click",(function(){!function(e,o="file.csv"){const t=new Blob([e],{type:"text/csv"}),n=URL.createObjectURL(t),s=document.createElement("a");s.href=n,s.download=o,document.body.appendChild(s),s.click(),document.body.removeChild(s)}(i,"data.csv")}));const p=document.getElementById("start");let g;function f(e,o){if("speechSynthesis"in window&&g){const t=new SpeechSynthesisUtterance(e);t.voice=g,t.onend=()=>{o&&o()},window.speechSynthesis.speak(t)}else console.log("Text-to-Speech is not supported in this browser.")}if("speechSynthesis"in window?window.speechSynthesis.onvoiceschanged=()=>{const e=window.speechSynthesis.getVoices();g=e.find((e=>"en-US"===e.lang||"en-GB"===e.lang))}:console.log("Text-to-Speech is not supported in this browser."),"SpeechRecognition"in window||"webkitSpeechRecognition"in window){const y=new(window.SpeechRecognition||window.webkitSpeechRecognition);var m=0,h=!1;function v(e){if(e.length>0){for(const[o,t]of Object.entries(d))if("empty"===t){d[o]=e;break}Object.values(d).includes("empty")||(y.stop(),h=!0,f(`New record created. ${Object.entries(d).map((([e,o])=>`${e}: ${o}`)).join(", ")}`,(()=>{h=!1,y.start(),m=1})),function(e){const o=e.join(",")+"\n";""!==i&&(i+=o,console.log("Updated CSV Content:"),console.log(i))}(Object.values(d)))}}y.lang="en-US",y.continuous=!1,y.onstart=()=>{console.log("Speech recognition started. Speak now."),p.disabled=!0},y.onresult=e=>{const o=e.results[0][0].transcript;return console.log(`Recognized: ${o}`),o.toLowerCase().includes("alexa")&&(console.log("alexa"),console.log("Alexa detected! Performing an action..."),m=1,y.stop(),h=!0,f("Select mode from create, edit or delete.",(()=>{h=!1,y.start()}))),p.disabled=!0,y.stop(),1==m&&(console.log(`Command: ${o}`),o.toLowerCase().includes("create"))?(console.log("Create New Record..."),d=l(Object.keys(d)),m=2,y.stop(),h=!0,void f("You selected create. Now fill in each key value.",(()=>{h=!1,y.start()}))):2==m?(console.log(`Fill each field: ${o}`),v(o),void console.log(d)):void 0},y.onend=()=>{console.log("Speech recognition ended."),p.disabled=!0,!1===h&&y.start()},y.onerror=e=>{console.error("Speech recognition error:",e.error),p.disabled=!1},p.onclick=()=>{f("Welcome, say Alexa to start.",(()=>{})),y.start()}}else alert("Sorry, your browser does not support the Web Speech API.")})();