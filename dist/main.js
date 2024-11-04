(()=>{"use strict";const e={randomUUID:"undefined"!=typeof crypto&&crypto.randomUUID&&crypto.randomUUID.bind(crypto)};let o;const t=new Uint8Array(16);function n(){if(!o){if("undefined"==typeof crypto||!crypto.getRandomValues)throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");o=crypto.getRandomValues.bind(crypto)}return o(t)}const r=[];for(let p=0;p<256;++p)r.push((p+256).toString(16).slice(1));console.log(function(o,t,s){if(e.randomUUID&&!t&&!o)return e.randomUUID();const i=(o=o||{}).random||(o.rng||n)();if(i[6]=15&i[6]|64,i[8]=63&i[8]|128,t){s=s||0;for(let e=0;e<16;++e)t[s+e]=i[e];return t}return function(e,o=0){return(r[e[o+0]]+r[e[o+1]]+r[e[o+2]]+r[e[o+3]]+"-"+r[e[o+4]]+r[e[o+5]]+"-"+r[e[o+6]]+r[e[o+7]]+"-"+r[e[o+8]]+r[e[o+9]]+"-"+r[e[o+10]]+r[e[o+11]]+r[e[o+12]]+r[e[o+13]]+r[e[o+14]]+r[e[o+15]]).toLowerCase()}(i)}());const s=document.getElementById("start");let i;function c(e,o){if("speechSynthesis"in window&&i){const t=new SpeechSynthesisUtterance(e);t.voice=i,t.onend=()=>{o&&o()},window.speechSynthesis.speak(t)}else console.log("Text-to-Speech is not supported in this browser.")}if("speechSynthesis"in window?window.speechSynthesis.onvoiceschanged=()=>{const e=window.speechSynthesis.getVoices();i=e.find((e=>"en-US"===e.lang||"en-GB"===e.lang))}:console.log("Text-to-Speech is not supported in this browser."),"SpeechRecognition"in window||"webkitSpeechRecognition"in window){const u=new(window.SpeechRecognition||window.webkitSpeechRecognition);var d=0,l=!1,a={name:"empty",age:"empty",sex:"empty",height:"empty",weight:"empty"};function g(e){if(e.length>0){for(const[o,t]of Object.entries(a))if("empty"===t){a[o]=e;break}Object.values(a).includes("empty")||(u.stop(),l=!0,c(`New record created. ${Object.entries(a).map((([e,o])=>`${e}: ${o}`)).join(", ")}`,(()=>{l=!1,u.start(),d=1})))}}u.lang="en-US",u.continuous=!1,u.onstart=()=>{console.log("Speech recognition started. Speak now."),s.disabled=!0},u.onresult=e=>{const o=e.results[0][0].transcript;return console.log(`Recognized: ${o}`),o.toLowerCase().includes("alexa")&&(console.log("alexa"),console.log("Alexa detected! Performing an action..."),d=1,u.stop(),l=!0,c("Select mode from create, edit or delete.",(()=>{l=!1,u.start()}))),s.disabled=!0,u.stop(),1==d&&(console.log(`Command: ${o}`),o.toLowerCase().includes("create"))?(console.log("Create New Record..."),d=2,u.stop(),l=!0,void c("You selected create. Now fill in each key value.",(()=>{l=!1,u.start()}))):2==d?(console.log(`Fill each field: ${o}`),g(o),void console.log(a)):void 0},u.onend=()=>{console.log("Speech recognition ended."),s.disabled=!0,!1===l&&u.start()},u.onerror=e=>{console.error("Speech recognition error:",e.error),s.disabled=!1},s.onclick=()=>{c("Welcome, say Alexa to start.",(()=>{})),u.start()}}else alert("Sorry, your browser does not support the Web Speech API.")})();