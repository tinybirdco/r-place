const A=function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const l of s.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&r(l)}).observe(document,{childList:!0,subtree:!0});function t(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerpolicy&&(s.referrerPolicy=o.referrerpolicy),o.crossorigin==="use-credentials"?s.credentials="include":o.crossorigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(o){if(o.ep)return;o.ep=!0;const s=t(o);fetch(o.href,s)}};A();const y="";alert("go to https://ui.tinybird.co/tokens fill your public_read_token in your local .env file");const w="https://api.tinybird.co",x=1e3,b=500,n=document.getElementById("board"),a=n.getContext("2d"),k=document.getElementById("colorpicker"),u=document.getElementById("datepicker"),f=document.getElementById("remove-datepicker");let h=[],g=!1,c=!0;const v=function({x:e,y:i,color:t}){a.beginPath(),a.fillStyle=t,a.fillRect(e,i,1,1),a.fill()},d=function({dateStart:e,dateEnd:i}={}){const t=e?`?start_date=${e}`:i?`?historic_date=${i}`:"";fetch(`${w}/v0/pipes/get_snapshot.json${t}`,{method:"GET",headers:new Headers({Authorization:`Bearer ${y}`,Accept:"application/json","Content-Type":"application/json"})}).then(function(r){return r.json()}).then(function({data:r}){r.forEach(function(o){v(o)})})},P=function(e){const i=e.map(t=>({...t,date:$()})).reduce((t,r)=>`${t}
${JSON.stringify(r)}`,"");fetch(`${w}/v0/events?name=pixels_table`,{method:"POST",headers:new Headers({Authorization:`Bearer ${y}`,Accept:"application/json","Content-Type":"application/json"}),body:i})},N=function(){n.width=x,n.height=b,n.style.width=`${x}px`,n.style.height=`${b}px`,d()},O=function(e,i){let t=e.getBoundingClientRect();return{x:Math.floor(i.clientX-t.left),y:Math.floor(i.clientY-t.top),color:k.value}},$=function(e=0){const t=p=>p<10?`0${p}`:p,r=new Date(Date.now()-e*1e3),o=t(r.getUTCDate()),s=t(r.getUTCMonth()+1),l=t(r.getUTCFullYear()),I=t(r.getUTCHours()),B=t(r.getUTCMinutes()),S=t(r.getUTCSeconds()),E=`${l}-${s}-${o}`,_=`${I}:${B}:${S}`;return`${E} ${_}`},C=function(e){g=!0,m(e)},T=function(){g=!1,P(h),h=[]},m=function(e){if(g){const i=O(n,e);h.push(i),v(i)}};n.onmousedown=c?C:()=>{};n.ontouchstart=c?C:()=>{};n.ontouchmove=c?m:()=>{};n.onmousemove=c?m:()=>{};n.ontouchend=c?T:()=>{};n.onmouseup=c?T:()=>{};window.setInterval(function(){c&&d({dateStart:$(10)})},1e3);k.oninput=function(){const e=document.getElementById("color-box");e.style.backgroundColor=this.value};u.oninput=function(){f.style="display: inline",n.style="cursor: not-allowed",c=!1,a.clearRect(0,0,n.width,n.height);const e=u.value;d({dateEnd:e.replace("T"," ").concat(":00")})};f.onclick=function(){f.style="display: none",n.style="cursor: crosshair",c=!0,u.value=null,a.clearRect(0,0,n.width,n.height),d({})};N();