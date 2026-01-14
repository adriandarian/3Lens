(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function t(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(r){if(r.ep)return;r.ep=!0;const o=t(r);fetch(r.href,o)}})();/**
* @vue/shared v3.5.26
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function xu(n){const e=Object.create(null);for(const t of n.split(","))e[t]=1;return t=>t in e}const Tt={},ps=[],Qn=()=>{},wp=()=>!1,Qa=n=>n.charCodeAt(0)===111&&n.charCodeAt(1)===110&&(n.charCodeAt(2)>122||n.charCodeAt(2)<97),bu=n=>n.startsWith("onUpdate:"),ln=Object.assign,yu=(n,e)=>{const t=n.indexOf(e);t>-1&&n.splice(t,1)},T0=Object.prototype.hasOwnProperty,xt=(n,e)=>T0.call(n,e),et=Array.isArray,ms=n=>el(n)==="[object Map]",Mp=n=>el(n)==="[object Set]",tt=n=>typeof n=="function",jt=n=>typeof n=="string",nr=n=>typeof n=="symbol",Nt=n=>n!==null&&typeof n=="object",Ep=n=>(Nt(n)||tt(n))&&tt(n.then)&&tt(n.catch),Sp=Object.prototype.toString,el=n=>Sp.call(n),C0=n=>el(n).slice(8,-1),Tp=n=>el(n)==="[object Object]",tl=n=>jt(n)&&n!=="NaN"&&n[0]!=="-"&&""+parseInt(n,10)===n,no=xu(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),nl=n=>{const e=Object.create(null);return t=>e[t]||(e[t]=n(t))},A0=/-\w/g,Ji=nl(n=>n.replace(A0,e=>e.slice(1).toUpperCase())),P0=/\B([A-Z])/g,Ar=nl(n=>n.replace(P0,"-$1").toLowerCase()),Cp=nl(n=>n.charAt(0).toUpperCase()+n.slice(1)),Kl=nl(n=>n?`on${Cp(n)}`:""),Ki=(n,e)=>!Object.is(n,e),$l=(n,...e)=>{for(let t=0;t<n.length;t++)n[t](...e)},Ap=(n,e,t,i=!1)=>{Object.defineProperty(n,e,{configurable:!0,enumerable:!1,writable:i,value:t})},R0=n=>{const e=parseFloat(n);return isNaN(e)?n:e};let ad;const il=()=>ad||(ad=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function wu(n){if(et(n)){const e={};for(let t=0;t<n.length;t++){const i=n[t],r=jt(i)?U0(i):wu(i);if(r)for(const o in r)e[o]=r[o]}return e}else if(jt(n)||Nt(n))return n}const L0=/;(?![^(]*\))/g,I0=/:([^]+)/,D0=/\/\*[^]*?\*\//g;function U0(n){const e={};return n.replace(D0,"").split(L0).forEach(t=>{if(t){const i=t.split(I0);i.length>1&&(e[i[0].trim()]=i[1].trim())}}),e}function Mu(n){let e="";if(jt(n))e=n;else if(et(n))for(let t=0;t<n.length;t++){const i=Mu(n[t]);i&&(e+=i+" ")}else if(Nt(n))for(const t in n)n[t]&&(e+=t+" ");return e.trim()}const N0="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",O0=xu(N0);function Pp(n){return!!n||n===""}const Rp=n=>!!(n&&n.__v_isRef===!0),Ta=n=>jt(n)?n:n==null?"":et(n)||Nt(n)&&(n.toString===Sp||!tt(n.toString))?Rp(n)?Ta(n.value):JSON.stringify(n,Lp,2):String(n),Lp=(n,e)=>Rp(e)?Lp(n,e.value):ms(e)?{[`Map(${e.size})`]:[...e.entries()].reduce((t,[i,r],o)=>(t[Zl(i,o)+" =>"]=r,t),{})}:Mp(e)?{[`Set(${e.size})`]:[...e.values()].map(t=>Zl(t))}:nr(e)?Zl(e):Nt(e)&&!et(e)&&!Tp(e)?String(e):e,Zl=(n,e="")=>{var t;return nr(n)?`Symbol(${(t=n.description)!=null?t:e})`:n};/**
* @vue/reactivity v3.5.26
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let on;class F0{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.parent=on,!e&&on&&(this.index=(on.scopes||(on.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let e,t;if(this.scopes)for(e=0,t=this.scopes.length;e<t;e++)this.scopes[e].pause();for(e=0,t=this.effects.length;e<t;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let e,t;if(this.scopes)for(e=0,t=this.scopes.length;e<t;e++)this.scopes[e].resume();for(e=0,t=this.effects.length;e<t;e++)this.effects[e].resume()}}run(e){if(this._active){const t=on;try{return on=this,e()}finally{on=t}}}on(){++this._on===1&&(this.prevScope=on,on=this)}off(){this._on>0&&--this._on===0&&(on=this.prevScope,this.prevScope=void 0)}stop(e){if(this._active){this._active=!1;let t,i;for(t=0,i=this.effects.length;t<i;t++)this.effects[t].stop();for(this.effects.length=0,t=0,i=this.cleanups.length;t<i;t++)this.cleanups[t]();if(this.cleanups.length=0,this.scopes){for(t=0,i=this.scopes.length;t<i;t++)this.scopes[t].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){const r=this.parent.scopes.pop();r&&r!==this&&(this.parent.scopes[this.index]=r,r.index=this.index)}this.parent=void 0}}}function Eu(){return on}function Ip(n,e=!1){on&&on.cleanups.push(n)}let St;const Jl=new WeakSet;class Dp{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,on&&on.active&&on.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,Jl.has(this)&&(Jl.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||Np(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,ld(this),Op(this);const e=St,t=Xn;St=this,Xn=!0;try{return this.fn()}finally{Fp(this),St=e,Xn=t,this.flags&=-3}}stop(){if(this.flags&1){for(let e=this.deps;e;e=e.nextDep)Cu(e);this.deps=this.depsTail=void 0,ld(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?Jl.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){Xc(this)&&this.run()}get dirty(){return Xc(this)}}let Up=0,io,ro;function Np(n,e=!1){if(n.flags|=8,e){n.next=ro,ro=n;return}n.next=io,io=n}function Su(){Up++}function Tu(){if(--Up>0)return;if(ro){let e=ro;for(ro=void 0;e;){const t=e.next;e.next=void 0,e.flags&=-9,e=t}}let n;for(;io;){let e=io;for(io=void 0;e;){const t=e.next;if(e.next=void 0,e.flags&=-9,e.flags&1)try{e.trigger()}catch(i){n||(n=i)}e=t}}if(n)throw n}function Op(n){for(let e=n.deps;e;e=e.nextDep)e.version=-1,e.prevActiveLink=e.dep.activeLink,e.dep.activeLink=e}function Fp(n){let e,t=n.depsTail,i=t;for(;i;){const r=i.prevDep;i.version===-1?(i===t&&(t=r),Cu(i),B0(i)):e=i,i.dep.activeLink=i.prevActiveLink,i.prevActiveLink=void 0,i=r}n.deps=e,n.depsTail=t}function Xc(n){for(let e=n.deps;e;e=e.nextDep)if(e.dep.version!==e.version||e.dep.computed&&(Bp(e.dep.computed)||e.dep.version!==e.version))return!0;return!!n._dirty}function Bp(n){if(n.flags&4&&!(n.flags&16)||(n.flags&=-17,n.globalVersion===vo)||(n.globalVersion=vo,!n.isSSR&&n.flags&128&&(!n.deps&&!n._dirty||!Xc(n))))return;n.flags|=2;const e=n.dep,t=St,i=Xn;St=n,Xn=!0;try{Op(n);const r=n.fn(n._value);(e.version===0||Ki(r,n._value))&&(n.flags|=128,n._value=r,e.version++)}catch(r){throw e.version++,r}finally{St=t,Xn=i,Fp(n),n.flags&=-3}}function Cu(n,e=!1){const{dep:t,prevSub:i,nextSub:r}=n;if(i&&(i.nextSub=r,n.prevSub=void 0),r&&(r.prevSub=i,n.nextSub=void 0),t.subs===n&&(t.subs=i,!i&&t.computed)){t.computed.flags&=-5;for(let o=t.computed.deps;o;o=o.nextDep)Cu(o,!0)}!e&&!--t.sc&&t.map&&t.map.delete(t.key)}function B0(n){const{prevDep:e,nextDep:t}=n;e&&(e.nextDep=t,n.prevDep=void 0),t&&(t.prevDep=e,n.nextDep=void 0)}let Xn=!0;const kp=[];function wi(){kp.push(Xn),Xn=!1}function Mi(){const n=kp.pop();Xn=n===void 0?!0:n}function ld(n){const{cleanup:e}=n;if(n.cleanup=void 0,e){const t=St;St=void 0;try{e()}finally{St=t}}}let vo=0;class k0{constructor(e,t){this.sub=e,this.dep=t,this.version=t.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class Au{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(e){if(!St||!Xn||St===this.computed)return;let t=this.activeLink;if(t===void 0||t.sub!==St)t=this.activeLink=new k0(St,this),St.deps?(t.prevDep=St.depsTail,St.depsTail.nextDep=t,St.depsTail=t):St.deps=St.depsTail=t,Vp(t);else if(t.version===-1&&(t.version=this.version,t.nextDep)){const i=t.nextDep;i.prevDep=t.prevDep,t.prevDep&&(t.prevDep.nextDep=i),t.prevDep=St.depsTail,t.nextDep=void 0,St.depsTail.nextDep=t,St.depsTail=t,St.deps===t&&(St.deps=i)}return t}trigger(e){this.version++,vo++,this.notify(e)}notify(e){Su();try{for(let t=this.subs;t;t=t.prevSub)t.sub.notify()&&t.sub.dep.notify()}finally{Tu()}}}function Vp(n){if(n.dep.sc++,n.sub.flags&4){const e=n.dep.computed;if(e&&!n.dep.subs){e.flags|=20;for(let i=e.deps;i;i=i.nextDep)Vp(i)}const t=n.dep.subs;t!==n&&(n.prevSub=t,t&&(t.nextSub=n)),n.dep.subs=n}}const Da=new WeakMap,br=Symbol(""),qc=Symbol(""),_o=Symbol("");function an(n,e,t){if(Xn&&St){let i=Da.get(n);i||Da.set(n,i=new Map);let r=i.get(t);r||(i.set(t,r=new Au),r.map=i,r.key=t),r.track()}}function bi(n,e,t,i,r,o){const a=Da.get(n);if(!a){vo++;return}const c=h=>{h&&h.trigger()};if(Su(),e==="clear")a.forEach(c);else{const h=et(n),d=h&&tl(t);if(h&&t==="length"){const f=Number(i);a.forEach((m,_)=>{(_==="length"||_===_o||!nr(_)&&_>=f)&&c(m)})}else switch((t!==void 0||a.has(void 0))&&c(a.get(t)),d&&c(a.get(_o)),e){case"add":h?d&&c(a.get("length")):(c(a.get(br)),ms(n)&&c(a.get(qc)));break;case"delete":h||(c(a.get(br)),ms(n)&&c(a.get(qc)));break;case"set":ms(n)&&c(a.get(br));break}}Tu()}function V0(n,e){const t=Da.get(n);return t&&t.get(e)}function Wr(n){const e=_t(n);return e===n?e:(an(e,"iterate",_o),zn(n)?e:e.map(Ei))}function Pu(n){return an(n=_t(n),"iterate",_o),n}function zi(n,e){return Qi(n)?gs(n)?xo(Ei(e)):xo(e):Ei(e)}const z0={__proto__:null,[Symbol.iterator](){return Ql(this,Symbol.iterator,n=>zi(this,n))},concat(...n){return Wr(this).concat(...n.map(e=>et(e)?Wr(e):e))},entries(){return Ql(this,"entries",n=>(n[1]=zi(this,n[1]),n))},every(n,e){return hi(this,"every",n,e,void 0,arguments)},filter(n,e){return hi(this,"filter",n,e,t=>t.map(i=>zi(this,i)),arguments)},find(n,e){return hi(this,"find",n,e,t=>zi(this,t),arguments)},findIndex(n,e){return hi(this,"findIndex",n,e,void 0,arguments)},findLast(n,e){return hi(this,"findLast",n,e,t=>zi(this,t),arguments)},findLastIndex(n,e){return hi(this,"findLastIndex",n,e,void 0,arguments)},forEach(n,e){return hi(this,"forEach",n,e,void 0,arguments)},includes(...n){return ec(this,"includes",n)},indexOf(...n){return ec(this,"indexOf",n)},join(n){return Wr(this).join(n)},lastIndexOf(...n){return ec(this,"lastIndexOf",n)},map(n,e){return hi(this,"map",n,e,void 0,arguments)},pop(){return Ys(this,"pop")},push(...n){return Ys(this,"push",n)},reduce(n,...e){return cd(this,"reduce",n,e)},reduceRight(n,...e){return cd(this,"reduceRight",n,e)},shift(){return Ys(this,"shift")},some(n,e){return hi(this,"some",n,e,void 0,arguments)},splice(...n){return Ys(this,"splice",n)},toReversed(){return Wr(this).toReversed()},toSorted(n){return Wr(this).toSorted(n)},toSpliced(...n){return Wr(this).toSpliced(...n)},unshift(...n){return Ys(this,"unshift",n)},values(){return Ql(this,"values",n=>zi(this,n))}};function Ql(n,e,t){const i=Pu(n),r=i[e]();return i!==n&&!zn(n)&&(r._next=r.next,r.next=()=>{const o=r._next();return o.done||(o.value=t(o.value)),o}),r}const H0=Array.prototype;function hi(n,e,t,i,r,o){const a=Pu(n),c=a!==n&&!zn(n),h=a[e];if(h!==H0[e]){const m=h.apply(n,o);return c?Ei(m):m}let d=t;a!==n&&(c?d=function(m,_){return t.call(this,zi(n,m),_,n)}:t.length>2&&(d=function(m,_){return t.call(this,m,_,n)}));const f=h.call(a,d,i);return c&&r?r(f):f}function cd(n,e,t,i){const r=Pu(n);let o=t;return r!==n&&(zn(n)?t.length>3&&(o=function(a,c,h){return t.call(this,a,c,h,n)}):o=function(a,c,h){return t.call(this,a,zi(n,c),h,n)}),r[e](o,...i)}function ec(n,e,t){const i=_t(n);an(i,"iterate",_o);const r=i[e](...t);return(r===-1||r===!1)&&sl(t[0])?(t[0]=_t(t[0]),i[e](...t)):r}function Ys(n,e,t=[]){wi(),Su();const i=_t(n)[e].apply(n,t);return Tu(),Mi(),i}const G0=xu("__proto__,__v_isRef,__isVue"),zp=new Set(Object.getOwnPropertyNames(Symbol).filter(n=>n!=="arguments"&&n!=="caller").map(n=>Symbol[n]).filter(nr));function W0(n){nr(n)||(n=String(n));const e=_t(this);return an(e,"has",n),e.hasOwnProperty(n)}class Hp{constructor(e=!1,t=!1){this._isReadonly=e,this._isShallow=t}get(e,t,i){if(t==="__v_skip")return e.__v_skip;const r=this._isReadonly,o=this._isShallow;if(t==="__v_isReactive")return!r;if(t==="__v_isReadonly")return r;if(t==="__v_isShallow")return o;if(t==="__v_raw")return i===(r?o?ex:Xp:o?jp:Wp).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(i)?e:void 0;const a=et(e);if(!r){let h;if(a&&(h=z0[t]))return h;if(t==="hasOwnProperty")return W0}const c=Reflect.get(e,t,Wt(e)?e:i);if((nr(t)?zp.has(t):G0(t))||(r||an(e,"get",t),o))return c;if(Wt(c)){const h=a&&tl(t)?c:c.value;return r&&Nt(h)?Ua(h):h}return Nt(c)?r?Ua(c):rl(c):c}}class Gp extends Hp{constructor(e=!1){super(!1,e)}set(e,t,i,r){let o=e[t];const a=et(e)&&tl(t);if(!this._isShallow){const d=Qi(o);if(!zn(i)&&!Qi(i)&&(o=_t(o),i=_t(i)),!a&&Wt(o)&&!Wt(i))return d||(o.value=i),!0}const c=a?Number(t)<e.length:xt(e,t),h=Reflect.set(e,t,i,Wt(e)?e:r);return e===_t(r)&&(c?Ki(i,o)&&bi(e,"set",t,i):bi(e,"add",t,i)),h}deleteProperty(e,t){const i=xt(e,t);e[t];const r=Reflect.deleteProperty(e,t);return r&&i&&bi(e,"delete",t,void 0),r}has(e,t){const i=Reflect.has(e,t);return(!nr(t)||!zp.has(t))&&an(e,"has",t),i}ownKeys(e){return an(e,"iterate",et(e)?"length":br),Reflect.ownKeys(e)}}class j0 extends Hp{constructor(e=!1){super(!0,e)}set(e,t){return!0}deleteProperty(e,t){return!0}}const X0=new Gp,q0=new j0,Y0=new Gp(!0);const Yc=n=>n,Xo=n=>Reflect.getPrototypeOf(n);function K0(n,e,t){return function(...i){const r=this.__v_raw,o=_t(r),a=ms(o),c=n==="entries"||n===Symbol.iterator&&a,h=n==="keys"&&a,d=r[n](...i),f=t?Yc:e?xo:Ei;return!e&&an(o,"iterate",h?qc:br),{next(){const{value:m,done:_}=d.next();return _?{value:m,done:_}:{value:c?[f(m[0]),f(m[1])]:f(m),done:_}},[Symbol.iterator](){return this}}}}function qo(n){return function(...e){return n==="delete"?!1:n==="clear"?void 0:this}}function $0(n,e){const t={get(r){const o=this.__v_raw,a=_t(o),c=_t(r);n||(Ki(r,c)&&an(a,"get",r),an(a,"get",c));const{has:h}=Xo(a),d=e?Yc:n?xo:Ei;if(h.call(a,r))return d(o.get(r));if(h.call(a,c))return d(o.get(c));o!==a&&o.get(r)},get size(){const r=this.__v_raw;return!n&&an(_t(r),"iterate",br),r.size},has(r){const o=this.__v_raw,a=_t(o),c=_t(r);return n||(Ki(r,c)&&an(a,"has",r),an(a,"has",c)),r===c?o.has(r):o.has(r)||o.has(c)},forEach(r,o){const a=this,c=a.__v_raw,h=_t(c),d=e?Yc:n?xo:Ei;return!n&&an(h,"iterate",br),c.forEach((f,m)=>r.call(o,d(f),d(m),a))}};return ln(t,n?{add:qo("add"),set:qo("set"),delete:qo("delete"),clear:qo("clear")}:{add(r){!e&&!zn(r)&&!Qi(r)&&(r=_t(r));const o=_t(this);return Xo(o).has.call(o,r)||(o.add(r),bi(o,"add",r,r)),this},set(r,o){!e&&!zn(o)&&!Qi(o)&&(o=_t(o));const a=_t(this),{has:c,get:h}=Xo(a);let d=c.call(a,r);d||(r=_t(r),d=c.call(a,r));const f=h.call(a,r);return a.set(r,o),d?Ki(o,f)&&bi(a,"set",r,o):bi(a,"add",r,o),this},delete(r){const o=_t(this),{has:a,get:c}=Xo(o);let h=a.call(o,r);h||(r=_t(r),h=a.call(o,r)),c&&c.call(o,r);const d=o.delete(r);return h&&bi(o,"delete",r,void 0),d},clear(){const r=_t(this),o=r.size!==0,a=r.clear();return o&&bi(r,"clear",void 0,void 0),a}}),["keys","values","entries",Symbol.iterator].forEach(r=>{t[r]=K0(r,n,e)}),t}function Ru(n,e){const t=$0(n,e);return(i,r,o)=>r==="__v_isReactive"?!n:r==="__v_isReadonly"?n:r==="__v_raw"?i:Reflect.get(xt(t,r)&&r in i?t:i,r,o)}const Z0={get:Ru(!1,!1)},J0={get:Ru(!1,!0)},Q0={get:Ru(!0,!1)};const Wp=new WeakMap,jp=new WeakMap,Xp=new WeakMap,ex=new WeakMap;function tx(n){switch(n){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function nx(n){return n.__v_skip||!Object.isExtensible(n)?0:tx(C0(n))}function rl(n){return Qi(n)?n:Lu(n,!1,X0,Z0,Wp)}function ix(n){return Lu(n,!1,Y0,J0,jp)}function Ua(n){return Lu(n,!0,q0,Q0,Xp)}function Lu(n,e,t,i,r){if(!Nt(n)||n.__v_raw&&!(e&&n.__v_isReactive))return n;const o=nx(n);if(o===0)return n;const a=r.get(n);if(a)return a;const c=new Proxy(n,o===2?i:t);return r.set(n,c),c}function gs(n){return Qi(n)?gs(n.__v_raw):!!(n&&n.__v_isReactive)}function Qi(n){return!!(n&&n.__v_isReadonly)}function zn(n){return!!(n&&n.__v_isShallow)}function sl(n){return n?!!n.__v_raw:!1}function _t(n){const e=n&&n.__v_raw;return e?_t(e):n}function rx(n){return!xt(n,"__v_skip")&&Object.isExtensible(n)&&Ap(n,"__v_skip",!0),n}const Ei=n=>Nt(n)?rl(n):n,xo=n=>Nt(n)?Ua(n):n;function Wt(n){return n?n.__v_isRef===!0:!1}function Ot(n){return qp(n,!1)}function Kc(n){return qp(n,!0)}function qp(n,e){return Wt(n)?n:new sx(n,e)}class sx{constructor(e,t){this.dep=new Au,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=t?e:_t(e),this._value=t?e:Ei(e),this.__v_isShallow=t}get value(){return this.dep.track(),this._value}set value(e){const t=this._rawValue,i=this.__v_isShallow||zn(e)||Qi(e);e=i?e:_t(e),Ki(e,t)&&(this._rawValue=e,this._value=i?e:Ei(e),this.dep.trigger())}}function st(n){return Wt(n)?n.value:n}function ox(n){return tt(n)?n():st(n)}const ax={get:(n,e,t)=>e==="__v_raw"?n:st(Reflect.get(n,e,t)),set:(n,e,t,i)=>{const r=n[e];return Wt(r)&&!Wt(t)?(r.value=t,!0):Reflect.set(n,e,t,i)}};function Yp(n){return gs(n)?n:new Proxy(n,ax)}function Kp(n){const e=et(n)?new Array(n.length):{};for(const t in n)e[t]=cx(n,t);return e}class lx{constructor(e,t,i){this._object=e,this._key=t,this._defaultValue=i,this.__v_isRef=!0,this._value=void 0,this._raw=_t(e);let r=!0,o=e;if(!et(e)||!tl(String(t)))do r=!sl(o)||zn(o);while(r&&(o=o.__v_raw));this._shallow=r}get value(){let e=this._object[this._key];return this._shallow&&(e=st(e)),this._value=e===void 0?this._defaultValue:e}set value(e){if(this._shallow&&Wt(this._raw[this._key])){const t=this._object[this._key];if(Wt(t)){t.value=e;return}}this._object[this._key]=e}get dep(){return V0(this._raw,this._key)}}function cx(n,e,t){return new lx(n,e,t)}class ux{constructor(e,t,i){this.fn=e,this.setter=t,this._value=void 0,this.dep=new Au(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=vo-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!t,this.isSSR=i}notify(){if(this.flags|=16,!(this.flags&8)&&St!==this)return Np(this,!0),!0}get value(){const e=this.dep.track();return Bp(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}}function hx(n,e,t=!1){let i,r;return tt(n)?i=n:(i=n.get,r=n.set),new ux(i,r,t)}const Yo={},Na=new WeakMap;let gr;function dx(n,e=!1,t=gr){if(t){let i=Na.get(t);i||Na.set(t,i=[]),i.push(n)}}function fx(n,e,t=Tt){const{immediate:i,deep:r,once:o,scheduler:a,augmentJob:c,call:h}=t,d=S=>r?S:zn(S)||r===!1||r===0?ji(S,1):ji(S);let f,m,_,x,y=!1,w=!1;if(Wt(n)?(m=()=>n.value,y=zn(n)):gs(n)?(m=()=>d(n),y=!0):et(n)?(w=!0,y=n.some(S=>gs(S)||zn(S)),m=()=>n.map(S=>{if(Wt(S))return S.value;if(gs(S))return d(S);if(tt(S))return h?h(S,2):S()})):tt(n)?e?m=h?()=>h(n,2):n:m=()=>{if(_){wi();try{_()}finally{Mi()}}const S=gr;gr=f;try{return h?h(n,3,[x]):n(x)}finally{gr=S}}:m=Qn,e&&r){const S=m,F=r===!0?1/0:r;m=()=>ji(S(),F)}const v=Eu(),g=()=>{f.stop(),v&&v.active&&yu(v.effects,f)};if(o&&e){const S=e;e=(...F)=>{S(...F),g()}}let R=w?new Array(n.length).fill(Yo):Yo;const E=S=>{if(!(!(f.flags&1)||!f.dirty&&!S))if(e){const F=f.run();if(r||y||(w?F.some((L,I)=>Ki(L,R[I])):Ki(F,R))){_&&_();const L=gr;gr=f;try{const I=[F,R===Yo?void 0:w&&R[0]===Yo?[]:R,x];R=F,h?h(e,3,I):e(...I)}finally{gr=L}}}else f.run()};return c&&c(E),f=new Dp(m),f.scheduler=a?()=>a(E,!1):E,x=S=>dx(S,!1,f),_=f.onStop=()=>{const S=Na.get(f);if(S){if(h)h(S,4);else for(const F of S)F();Na.delete(f)}},e?i?E(!0):R=f.run():a?a(E.bind(null,!0),!0):f.run(),g.pause=f.pause.bind(f),g.resume=f.resume.bind(f),g.stop=g,g}function ji(n,e=1/0,t){if(e<=0||!Nt(n)||n.__v_skip||(t=t||new Map,(t.get(n)||0)>=e))return n;if(t.set(n,e),e--,Wt(n))ji(n.value,e,t);else if(et(n))for(let i=0;i<n.length;i++)ji(n[i],e,t);else if(Mp(n)||ms(n))n.forEach(i=>{ji(i,e,t)});else if(Tp(n)){for(const i in n)ji(n[i],e,t);for(const i of Object.getOwnPropertySymbols(n))Object.prototype.propertyIsEnumerable.call(n,i)&&ji(n[i],e,t)}return n}/**
* @vue/runtime-core v3.5.26
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function Co(n,e,t,i){try{return i?n(...i):n()}catch(r){ol(r,e,t)}}function ni(n,e,t,i){if(tt(n)){const r=Co(n,e,t,i);return r&&Ep(r)&&r.catch(o=>{ol(o,e,t)}),r}if(et(n)){const r=[];for(let o=0;o<n.length;o++)r.push(ni(n[o],e,t,i));return r}}function ol(n,e,t,i=!0){const r=e?e.vnode:null,{errorHandler:o,throwUnhandledErrorInProduction:a}=e&&e.appContext.config||Tt;if(e){let c=e.parent;const h=e.proxy,d=`https://vuejs.org/error-reference/#runtime-${t}`;for(;c;){const f=c.ec;if(f){for(let m=0;m<f.length;m++)if(f[m](n,h,d)===!1)return}c=c.parent}if(o){wi(),Co(o,null,10,[n,h,d]),Mi();return}}px(n,t,r,i,a)}function px(n,e,t,i=!0,r=!1){if(r)throw n;console.error(n)}const fn=[];let Yn=-1;const vs=[];let Hi=null,us=0;const $p=Promise.resolve();let Oa=null;function mx(n){const e=Oa||$p;return n?e.then(this?n.bind(this):n):e}function gx(n){let e=Yn+1,t=fn.length;for(;e<t;){const i=e+t>>>1,r=fn[i],o=bo(r);o<n||o===n&&r.flags&2?e=i+1:t=i}return e}function Iu(n){if(!(n.flags&1)){const e=bo(n),t=fn[fn.length-1];!t||!(n.flags&2)&&e>=bo(t)?fn.push(n):fn.splice(gx(e),0,n),n.flags|=1,Zp()}}function Zp(){Oa||(Oa=$p.then(Qp))}function vx(n){et(n)?vs.push(...n):Hi&&n.id===-1?Hi.splice(us+1,0,n):n.flags&1||(vs.push(n),n.flags|=1),Zp()}function ud(n,e,t=Yn+1){for(;t<fn.length;t++){const i=fn[t];if(i&&i.flags&2){if(n&&i.id!==n.uid)continue;fn.splice(t,1),t--,i.flags&4&&(i.flags&=-2),i(),i.flags&4||(i.flags&=-2)}}}function Jp(n){if(vs.length){const e=[...new Set(vs)].sort((t,i)=>bo(t)-bo(i));if(vs.length=0,Hi){Hi.push(...e);return}for(Hi=e,us=0;us<Hi.length;us++){const t=Hi[us];t.flags&4&&(t.flags&=-2),t.flags&8||t(),t.flags&=-2}Hi=null,us=0}}const bo=n=>n.id==null?n.flags&2?-1:1/0:n.id;function Qp(n){try{for(Yn=0;Yn<fn.length;Yn++){const e=fn[Yn];e&&!(e.flags&8)&&(e.flags&4&&(e.flags&=-2),Co(e,e.i,e.i?15:14),e.flags&4||(e.flags&=-2))}}finally{for(;Yn<fn.length;Yn++){const e=fn[Yn];e&&(e.flags&=-2)}Yn=-1,fn.length=0,Jp(),Oa=null,(fn.length||vs.length)&&Qp()}}let Jn=null,em=null;function Fa(n){const e=Jn;return Jn=n,em=n&&n.type.__scopeId||null,e}function _x(n,e=Jn,t){if(!e||n._n)return n;const i=(...r)=>{i._d&&bd(-1);const o=Fa(e);let a;try{a=n(...r)}finally{Fa(o),i._d&&bd(1)}return a};return i._n=!0,i._c=!0,i._d=!0,i}function ur(n,e,t,i){const r=n.dirs,o=e&&e.dirs;for(let a=0;a<r.length;a++){const c=r[a];o&&(c.oldValue=o[a].value);let h=c.dir[i];h&&(wi(),ni(h,t,8,[n.el,c,n,e]),Mi())}}function xx(n,e){if(pn){let t=pn.provides;const i=pn.parent&&pn.parent.provides;i===t&&(t=pn.provides=Object.create(i)),t[n]=e}}function so(n,e,t=!1){const i=Am();if(i||_s){let r=_s?_s._context.provides:i?i.parent==null||i.ce?i.vnode.appContext&&i.vnode.appContext.provides:i.parent.provides:void 0;if(r&&n in r)return r[n];if(arguments.length>1)return t&&tt(e)?e.call(i&&i.proxy):e}}const bx=Symbol.for("v-scx"),yx=()=>so(bx);function Ba(n,e){return Du(n,null,e)}function yr(n,e,t){return Du(n,e,t)}function Du(n,e,t=Tt){const{immediate:i,deep:r,flush:o,once:a}=t,c=ln({},t),h=e&&i||!e&&o!=="post";let d;if(wo){if(o==="sync"){const x=yx();d=x.__watcherHandles||(x.__watcherHandles=[])}else if(!h){const x=()=>{};return x.stop=Qn,x.resume=Qn,x.pause=Qn,x}}const f=pn;c.call=(x,y,w)=>ni(x,f,y,w);let m=!1;o==="post"?c.scheduler=x=>{Tn(x,f&&f.suspense)}:o!=="sync"&&(m=!0,c.scheduler=(x,y)=>{y?x():Iu(x)}),c.augmentJob=x=>{e&&(x.flags|=4),m&&(x.flags|=2,f&&(x.id=f.uid,x.i=f))};const _=fx(n,e,c);return wo&&(d?d.push(_):h&&_()),_}function wx(n,e,t){const i=this.proxy,r=jt(n)?n.includes(".")?tm(i,n):()=>i[n]:n.bind(i,i);let o;tt(e)?o=e:(o=e.handler,t=e);const a=Po(this),c=Du(r,o.bind(i),t);return a(),c}function tm(n,e){const t=e.split(".");return()=>{let i=n;for(let r=0;r<t.length&&i;r++)i=i[t[r]];return i}}const Mx=Symbol("_vte"),Ex=n=>n.__isTeleport,Sx=Symbol("_leaveCb");function Uu(n,e){n.shapeFlag&6&&n.component?(n.transition=e,Uu(n.component.subTree,e)):n.shapeFlag&128?(n.ssContent.transition=e.clone(n.ssContent),n.ssFallback.transition=e.clone(n.ssFallback)):n.transition=e}function ri(n,e){return tt(n)?ln({name:n.name},e,{setup:n}):n}function nm(n){n.ids=[n.ids[0]+n.ids[2]+++"-",0,0]}const ka=new WeakMap;function oo(n,e,t,i,r=!1){if(et(n)){n.forEach((y,w)=>oo(y,e&&(et(e)?e[w]:e),t,i,r));return}if(ao(i)&&!r){i.shapeFlag&512&&i.type.__asyncResolved&&i.component.subTree.component&&oo(n,e,t,i.component.subTree);return}const o=i.shapeFlag&4?ku(i.component):i.el,a=r?null:o,{i:c,r:h}=n,d=e&&e.r,f=c.refs===Tt?c.refs={}:c.refs,m=c.setupState,_=_t(m),x=m===Tt?wp:y=>xt(_,y);if(d!=null&&d!==h){if(hd(e),jt(d))f[d]=null,x(d)&&(m[d]=null);else if(Wt(d)){d.value=null;const y=e;y.k&&(f[y.k]=null)}}if(tt(h))Co(h,c,12,[a,f]);else{const y=jt(h),w=Wt(h);if(y||w){const v=()=>{if(n.f){const g=y?x(h)?m[h]:f[h]:h.value;if(r)et(g)&&yu(g,o);else if(et(g))g.includes(o)||g.push(o);else if(y)f[h]=[o],x(h)&&(m[h]=f[h]);else{const R=[o];h.value=R,n.k&&(f[n.k]=R)}}else y?(f[h]=a,x(h)&&(m[h]=a)):w&&(h.value=a,n.k&&(f[n.k]=a))};if(a){const g=()=>{v(),ka.delete(n)};g.id=-1,ka.set(n,g),Tn(g,t)}else hd(n),v()}}}function hd(n){const e=ka.get(n);e&&(e.flags|=8,ka.delete(n))}il().requestIdleCallback;il().cancelIdleCallback;const ao=n=>!!n.type.__asyncLoader,im=n=>n.type.__isKeepAlive;function Tx(n,e){rm(n,"a",e)}function Cx(n,e){rm(n,"da",e)}function rm(n,e,t=pn){const i=n.__wdc||(n.__wdc=()=>{let r=t;for(;r;){if(r.isDeactivated)return;r=r.parent}return n()});if(al(e,i,t),t){let r=t.parent;for(;r&&r.parent;)im(r.parent.vnode)&&Ax(i,e,t,r),r=r.parent}}function Ax(n,e,t,i){const r=al(e,n,i,!0);Ao(()=>{yu(i[e],r)},t)}function al(n,e,t=pn,i=!1){if(t){const r=t[n]||(t[n]=[]),o=e.__weh||(e.__weh=(...a)=>{wi();const c=Po(t),h=ni(e,t,n,a);return c(),Mi(),h});return i?r.unshift(o):r.push(o),o}}const Ti=n=>(e,t=pn)=>{(!wo||n==="sp")&&al(n,(...i)=>e(...i),t)},Px=Ti("bm"),sm=Ti("m"),Rx=Ti("bu"),Lx=Ti("u"),Ix=Ti("bum"),Ao=Ti("um"),Dx=Ti("sp"),Ux=Ti("rtg"),Nx=Ti("rtc");function Ox(n,e=pn){al("ec",n,e)}const Fx=Symbol.for("v-ndc"),$c=n=>n?Pm(n)?ku(n):$c(n.parent):null,lo=ln(Object.create(null),{$:n=>n,$el:n=>n.vnode.el,$data:n=>n.data,$props:n=>n.props,$attrs:n=>n.attrs,$slots:n=>n.slots,$refs:n=>n.refs,$parent:n=>$c(n.parent),$root:n=>$c(n.root),$host:n=>n.ce,$emit:n=>n.emit,$options:n=>lm(n),$forceUpdate:n=>n.f||(n.f=()=>{Iu(n.update)}),$nextTick:n=>n.n||(n.n=mx.bind(n.proxy)),$watch:n=>wx.bind(n)}),tc=(n,e)=>n!==Tt&&!n.__isScriptSetup&&xt(n,e),Bx={get({_:n},e){if(e==="__v_skip")return!0;const{ctx:t,setupState:i,data:r,props:o,accessCache:a,type:c,appContext:h}=n;if(e[0]!=="$"){const _=a[e];if(_!==void 0)switch(_){case 1:return i[e];case 2:return r[e];case 4:return t[e];case 3:return o[e]}else{if(tc(i,e))return a[e]=1,i[e];if(r!==Tt&&xt(r,e))return a[e]=2,r[e];if(xt(o,e))return a[e]=3,o[e];if(t!==Tt&&xt(t,e))return a[e]=4,t[e];Zc&&(a[e]=0)}}const d=lo[e];let f,m;if(d)return e==="$attrs"&&an(n.attrs,"get",""),d(n);if((f=c.__cssModules)&&(f=f[e]))return f;if(t!==Tt&&xt(t,e))return a[e]=4,t[e];if(m=h.config.globalProperties,xt(m,e))return m[e]},set({_:n},e,t){const{data:i,setupState:r,ctx:o}=n;return tc(r,e)?(r[e]=t,!0):i!==Tt&&xt(i,e)?(i[e]=t,!0):xt(n.props,e)||e[0]==="$"&&e.slice(1)in n?!1:(o[e]=t,!0)},has({_:{data:n,setupState:e,accessCache:t,ctx:i,appContext:r,props:o,type:a}},c){let h;return!!(t[c]||n!==Tt&&c[0]!=="$"&&xt(n,c)||tc(e,c)||xt(o,c)||xt(i,c)||xt(lo,c)||xt(r.config.globalProperties,c)||(h=a.__cssModules)&&h[c])},defineProperty(n,e,t){return t.get!=null?n._.accessCache[e]=0:xt(t,"value")&&this.set(n,e,t.value,null),Reflect.defineProperty(n,e,t)}};function kx(){return om().slots}function Vx(){return om().attrs}function om(n){const e=Am();return e.setupContext||(e.setupContext=Lm(e))}function dd(n){return et(n)?n.reduce((e,t)=>(e[t]=null,e),{}):n}let Zc=!0;function zx(n){const e=lm(n),t=n.proxy,i=n.ctx;Zc=!1,e.beforeCreate&&fd(e.beforeCreate,n,"bc");const{data:r,computed:o,methods:a,watch:c,provide:h,inject:d,created:f,beforeMount:m,mounted:_,beforeUpdate:x,updated:y,activated:w,deactivated:v,beforeDestroy:g,beforeUnmount:R,destroyed:E,unmounted:S,render:F,renderTracked:L,renderTriggered:I,errorCaptured:P,serverPrefetch:M,expose:b,inheritAttrs:N,components:H,directives:ae,filters:V}=e;if(d&&Hx(d,i,null),a)for(const ee in a){const K=a[ee];tt(K)&&(i[ee]=K.bind(t))}if(r){const ee=r.call(t,t);Nt(ee)&&(n.data=rl(ee))}if(Zc=!0,o)for(const ee in o){const K=o[ee],ue=tt(K)?K.bind(t,t):tt(K.get)?K.get.bind(t,t):Qn,de=!tt(K)&&tt(K.set)?K.set.bind(t):Qn,we=$n({get:ue,set:de});Object.defineProperty(i,ee,{enumerable:!0,configurable:!0,get:()=>we.value,set:be=>we.value=be})}if(c)for(const ee in c)am(c[ee],i,t,ee);if(h){const ee=tt(h)?h.call(t):h;Reflect.ownKeys(ee).forEach(K=>{xx(K,ee[K])})}f&&fd(f,n,"c");function q(ee,K){et(K)?K.forEach(ue=>ee(ue.bind(t))):K&&ee(K.bind(t))}if(q(Px,m),q(sm,_),q(Rx,x),q(Lx,y),q(Tx,w),q(Cx,v),q(Ox,P),q(Nx,L),q(Ux,I),q(Ix,R),q(Ao,S),q(Dx,M),et(b))if(b.length){const ee=n.exposed||(n.exposed={});b.forEach(K=>{Object.defineProperty(ee,K,{get:()=>t[K],set:ue=>t[K]=ue,enumerable:!0})})}else n.exposed||(n.exposed={});F&&n.render===Qn&&(n.render=F),N!=null&&(n.inheritAttrs=N),H&&(n.components=H),ae&&(n.directives=ae),M&&nm(n)}function Hx(n,e,t=Qn){et(n)&&(n=Jc(n));for(const i in n){const r=n[i];let o;Nt(r)?"default"in r?o=so(r.from||i,r.default,!0):o=so(r.from||i):o=so(r),Wt(o)?Object.defineProperty(e,i,{enumerable:!0,configurable:!0,get:()=>o.value,set:a=>o.value=a}):e[i]=o}}function fd(n,e,t){ni(et(n)?n.map(i=>i.bind(e.proxy)):n.bind(e.proxy),e,t)}function am(n,e,t,i){let r=i.includes(".")?tm(t,i):()=>t[i];if(jt(n)){const o=e[n];tt(o)&&yr(r,o)}else if(tt(n))yr(r,n.bind(t));else if(Nt(n))if(et(n))n.forEach(o=>am(o,e,t,i));else{const o=tt(n.handler)?n.handler.bind(t):e[n.handler];tt(o)&&yr(r,o,n)}}function lm(n){const e=n.type,{mixins:t,extends:i}=e,{mixins:r,optionsCache:o,config:{optionMergeStrategies:a}}=n.appContext,c=o.get(e);let h;return c?h=c:!r.length&&!t&&!i?h=e:(h={},r.length&&r.forEach(d=>Va(h,d,a,!0)),Va(h,e,a)),Nt(e)&&o.set(e,h),h}function Va(n,e,t,i=!1){const{mixins:r,extends:o}=e;o&&Va(n,o,t,!0),r&&r.forEach(a=>Va(n,a,t,!0));for(const a in e)if(!(i&&a==="expose")){const c=Gx[a]||t&&t[a];n[a]=c?c(n[a],e[a]):e[a]}return n}const Gx={data:pd,props:md,emits:md,methods:eo,computed:eo,beforeCreate:hn,created:hn,beforeMount:hn,mounted:hn,beforeUpdate:hn,updated:hn,beforeDestroy:hn,beforeUnmount:hn,destroyed:hn,unmounted:hn,activated:hn,deactivated:hn,errorCaptured:hn,serverPrefetch:hn,components:eo,directives:eo,watch:jx,provide:pd,inject:Wx};function pd(n,e){return e?n?function(){return ln(tt(n)?n.call(this,this):n,tt(e)?e.call(this,this):e)}:e:n}function Wx(n,e){return eo(Jc(n),Jc(e))}function Jc(n){if(et(n)){const e={};for(let t=0;t<n.length;t++)e[n[t]]=n[t];return e}return n}function hn(n,e){return n?[...new Set([].concat(n,e))]:e}function eo(n,e){return n?ln(Object.create(null),n,e):e}function md(n,e){return n?et(n)&&et(e)?[...new Set([...n,...e])]:ln(Object.create(null),dd(n),dd(e??{})):e}function jx(n,e){if(!n)return e;if(!e)return n;const t=ln(Object.create(null),n);for(const i in e)t[i]=hn(n[i],e[i]);return t}function cm(){return{app:null,config:{isNativeTag:wp,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let Xx=0;function qx(n,e){return function(i,r=null){tt(i)||(i=ln({},i)),r!=null&&!Nt(r)&&(r=null);const o=cm(),a=new WeakSet,c=[];let h=!1;const d=o.app={_uid:Xx++,_component:i,_props:r,_container:null,_context:o,_instance:null,version:Mb,get config(){return o.config},set config(f){},use(f,...m){return a.has(f)||(f&&tt(f.install)?(a.add(f),f.install(d,...m)):tt(f)&&(a.add(f),f(d,...m))),d},mixin(f){return o.mixins.includes(f)||o.mixins.push(f),d},component(f,m){return m?(o.components[f]=m,d):o.components[f]},directive(f,m){return m?(o.directives[f]=m,d):o.directives[f]},mount(f,m,_){if(!h){const x=d._ceVNode||Ft(i,r);return x.appContext=o,_===!0?_="svg":_===!1&&(_=void 0),n(x,f,_),h=!0,d._container=f,f.__vue_app__=d,ku(x.component)}},onUnmount(f){c.push(f)},unmount(){h&&(ni(c,d._instance,16),n(null,d._container),delete d._container.__vue_app__)},provide(f,m){return o.provides[f]=m,d},runWithContext(f){const m=_s;_s=d;try{return f()}finally{_s=m}}};return d}}let _s=null;const Yx=(n,e)=>e==="modelValue"||e==="model-value"?n.modelModifiers:n[`${e}Modifiers`]||n[`${Ji(e)}Modifiers`]||n[`${Ar(e)}Modifiers`];function Kx(n,e,...t){if(n.isUnmounted)return;const i=n.vnode.props||Tt;let r=t;const o=e.startsWith("update:"),a=o&&Yx(i,e.slice(7));a&&(a.trim&&(r=t.map(f=>jt(f)?f.trim():f)),a.number&&(r=t.map(R0)));let c,h=i[c=Kl(e)]||i[c=Kl(Ji(e))];!h&&o&&(h=i[c=Kl(Ar(e))]),h&&ni(h,n,6,r);const d=i[c+"Once"];if(d){if(!n.emitted)n.emitted={};else if(n.emitted[c])return;n.emitted[c]=!0,ni(d,n,6,r)}}const $x=new WeakMap;function um(n,e,t=!1){const i=t?$x:e.emitsCache,r=i.get(n);if(r!==void 0)return r;const o=n.emits;let a={},c=!1;if(!tt(n)){const h=d=>{const f=um(d,e,!0);f&&(c=!0,ln(a,f))};!t&&e.mixins.length&&e.mixins.forEach(h),n.extends&&h(n.extends),n.mixins&&n.mixins.forEach(h)}return!o&&!c?(Nt(n)&&i.set(n,null),null):(et(o)?o.forEach(h=>a[h]=null):ln(a,o),Nt(n)&&i.set(n,a),a)}function ll(n,e){return!n||!Qa(e)?!1:(e=e.slice(2).replace(/Once$/,""),xt(n,e[0].toLowerCase()+e.slice(1))||xt(n,Ar(e))||xt(n,e))}function gd(n){const{type:e,vnode:t,proxy:i,withProxy:r,propsOptions:[o],slots:a,attrs:c,emit:h,render:d,renderCache:f,props:m,data:_,setupState:x,ctx:y,inheritAttrs:w}=n,v=Fa(n);let g,R;try{if(t.shapeFlag&4){const S=r||i,F=S;g=Kn(d.call(F,S,f,m,x,_,y)),R=c}else{const S=e;g=Kn(S.length>1?S(m,{attrs:c,slots:a,emit:h}):S(m,null)),R=e.props?c:Zx(c)}}catch(S){co.length=0,ol(S,n,1),g=Ft(er)}let E=g;if(R&&w!==!1){const S=Object.keys(R),{shapeFlag:F}=E;S.length&&F&7&&(o&&S.some(bu)&&(R=Jx(R,o)),E=ys(E,R,!1,!0))}return t.dirs&&(E=ys(E,null,!1,!0),E.dirs=E.dirs?E.dirs.concat(t.dirs):t.dirs),t.transition&&Uu(E,t.transition),g=E,Fa(v),g}const Zx=n=>{let e;for(const t in n)(t==="class"||t==="style"||Qa(t))&&((e||(e={}))[t]=n[t]);return e},Jx=(n,e)=>{const t={};for(const i in n)(!bu(i)||!(i.slice(9)in e))&&(t[i]=n[i]);return t};function Qx(n,e,t){const{props:i,children:r,component:o}=n,{props:a,children:c,patchFlag:h}=e,d=o.emitsOptions;if(e.dirs||e.transition)return!0;if(t&&h>=0){if(h&1024)return!0;if(h&16)return i?vd(i,a,d):!!a;if(h&8){const f=e.dynamicProps;for(let m=0;m<f.length;m++){const _=f[m];if(a[_]!==i[_]&&!ll(d,_))return!0}}}else return(r||c)&&(!c||!c.$stable)?!0:i===a?!1:i?a?vd(i,a,d):!0:!!a;return!1}function vd(n,e,t){const i=Object.keys(e);if(i.length!==Object.keys(n).length)return!0;for(let r=0;r<i.length;r++){const o=i[r];if(e[o]!==n[o]&&!ll(t,o))return!0}return!1}function eb({vnode:n,parent:e},t){for(;e;){const i=e.subTree;if(i.suspense&&i.suspense.activeBranch===n&&(i.el=n.el),i===n)(n=e.vnode).el=t,e=e.parent;else break}}const hm={},dm=()=>Object.create(hm),fm=n=>Object.getPrototypeOf(n)===hm;function tb(n,e,t,i=!1){const r={},o=dm();n.propsDefaults=Object.create(null),pm(n,e,r,o);for(const a in n.propsOptions[0])a in r||(r[a]=void 0);t?n.props=i?r:ix(r):n.type.props?n.props=r:n.props=o,n.attrs=o}function nb(n,e,t,i){const{props:r,attrs:o,vnode:{patchFlag:a}}=n,c=_t(r),[h]=n.propsOptions;let d=!1;if((i||a>0)&&!(a&16)){if(a&8){const f=n.vnode.dynamicProps;for(let m=0;m<f.length;m++){let _=f[m];if(ll(n.emitsOptions,_))continue;const x=e[_];if(h)if(xt(o,_))x!==o[_]&&(o[_]=x,d=!0);else{const y=Ji(_);r[y]=Qc(h,c,y,x,n,!1)}else x!==o[_]&&(o[_]=x,d=!0)}}}else{pm(n,e,r,o)&&(d=!0);let f;for(const m in c)(!e||!xt(e,m)&&((f=Ar(m))===m||!xt(e,f)))&&(h?t&&(t[m]!==void 0||t[f]!==void 0)&&(r[m]=Qc(h,c,m,void 0,n,!0)):delete r[m]);if(o!==c)for(const m in o)(!e||!xt(e,m))&&(delete o[m],d=!0)}d&&bi(n.attrs,"set","")}function pm(n,e,t,i){const[r,o]=n.propsOptions;let a=!1,c;if(e)for(let h in e){if(no(h))continue;const d=e[h];let f;r&&xt(r,f=Ji(h))?!o||!o.includes(f)?t[f]=d:(c||(c={}))[f]=d:ll(n.emitsOptions,h)||(!(h in i)||d!==i[h])&&(i[h]=d,a=!0)}if(o){const h=_t(t),d=c||Tt;for(let f=0;f<o.length;f++){const m=o[f];t[m]=Qc(r,h,m,d[m],n,!xt(d,m))}}return a}function Qc(n,e,t,i,r,o){const a=n[t];if(a!=null){const c=xt(a,"default");if(c&&i===void 0){const h=a.default;if(a.type!==Function&&!a.skipFactory&&tt(h)){const{propsDefaults:d}=r;if(t in d)i=d[t];else{const f=Po(r);i=d[t]=h.call(null,e),f()}}else i=h;r.ce&&r.ce._setProp(t,i)}a[0]&&(o&&!c?i=!1:a[1]&&(i===""||i===Ar(t))&&(i=!0))}return i}const ib=new WeakMap;function mm(n,e,t=!1){const i=t?ib:e.propsCache,r=i.get(n);if(r)return r;const o=n.props,a={},c=[];let h=!1;if(!tt(n)){const f=m=>{h=!0;const[_,x]=mm(m,e,!0);ln(a,_),x&&c.push(...x)};!t&&e.mixins.length&&e.mixins.forEach(f),n.extends&&f(n.extends),n.mixins&&n.mixins.forEach(f)}if(!o&&!h)return Nt(n)&&i.set(n,ps),ps;if(et(o))for(let f=0;f<o.length;f++){const m=Ji(o[f]);_d(m)&&(a[m]=Tt)}else if(o)for(const f in o){const m=Ji(f);if(_d(m)){const _=o[f],x=a[m]=et(_)||tt(_)?{type:_}:ln({},_),y=x.type;let w=!1,v=!0;if(et(y))for(let g=0;g<y.length;++g){const R=y[g],E=tt(R)&&R.name;if(E==="Boolean"){w=!0;break}else E==="String"&&(v=!1)}else w=tt(y)&&y.name==="Boolean";x[0]=w,x[1]=v,(w||xt(x,"default"))&&c.push(m)}}const d=[a,c];return Nt(n)&&i.set(n,d),d}function _d(n){return n[0]!=="$"&&!no(n)}const Nu=n=>n==="_"||n==="_ctx"||n==="$stable",Ou=n=>et(n)?n.map(Kn):[Kn(n)],rb=(n,e,t)=>{if(e._n)return e;const i=_x((...r)=>Ou(e(...r)),t);return i._c=!1,i},gm=(n,e,t)=>{const i=n._ctx;for(const r in n){if(Nu(r))continue;const o=n[r];if(tt(o))e[r]=rb(r,o,i);else if(o!=null){const a=Ou(o);e[r]=()=>a}}},vm=(n,e)=>{const t=Ou(e);n.slots.default=()=>t},_m=(n,e,t)=>{for(const i in e)(t||!Nu(i))&&(n[i]=e[i])},sb=(n,e,t)=>{const i=n.slots=dm();if(n.vnode.shapeFlag&32){const r=e._;r?(_m(i,e,t),t&&Ap(i,"_",r,!0)):gm(e,i)}else e&&vm(n,e)},ob=(n,e,t)=>{const{vnode:i,slots:r}=n;let o=!0,a=Tt;if(i.shapeFlag&32){const c=e._;c?t&&c===1?o=!1:_m(r,e,t):(o=!e.$stable,gm(e,r)),a=e}else e&&(vm(n,e),a={default:1});if(o)for(const c in r)!Nu(c)&&a[c]==null&&delete r[c]},Tn=hb;function ab(n){return lb(n)}function lb(n,e){const t=il();t.__VUE__=!0;const{insert:i,remove:r,patchProp:o,createElement:a,createText:c,createComment:h,setText:d,setElementText:f,parentNode:m,nextSibling:_,setScopeId:x=Qn,insertStaticContent:y}=n,w=(T,O,G,Q=null,Z=null,oe=null,me=void 0,D=null,A=!!O.dynamicChildren)=>{if(T===O)return;T&&!Ks(T,O)&&(Q=Ue(T),be(T,Z,oe,!0),T=null),O.patchFlag===-2&&(A=!1,O.dynamicChildren=null);const{type:z,ref:ne,shapeFlag:te}=O;switch(z){case cl:v(T,O,G,Q);break;case er:g(T,O,G,Q);break;case ic:T==null&&R(O,G,Q,me);break;case Nn:H(T,O,G,Q,Z,oe,me,D,A);break;default:te&1?F(T,O,G,Q,Z,oe,me,D,A):te&6?ae(T,O,G,Q,Z,oe,me,D,A):(te&64||te&128)&&z.process(T,O,G,Q,Z,oe,me,D,A,B)}ne!=null&&Z?oo(ne,T&&T.ref,oe,O||T,!O):ne==null&&T&&T.ref!=null&&oo(T.ref,null,oe,T,!0)},v=(T,O,G,Q)=>{if(T==null)i(O.el=c(O.children),G,Q);else{const Z=O.el=T.el;O.children!==T.children&&d(Z,O.children)}},g=(T,O,G,Q)=>{T==null?i(O.el=h(O.children||""),G,Q):O.el=T.el},R=(T,O,G,Q)=>{[T.el,T.anchor]=y(T.children,O,G,Q,T.el,T.anchor)},E=({el:T,anchor:O},G,Q)=>{let Z;for(;T&&T!==O;)Z=_(T),i(T,G,Q),T=Z;i(O,G,Q)},S=({el:T,anchor:O})=>{let G;for(;T&&T!==O;)G=_(T),r(T),T=G;r(O)},F=(T,O,G,Q,Z,oe,me,D,A)=>{if(O.type==="svg"?me="svg":O.type==="math"&&(me="mathml"),T==null)L(O,G,Q,Z,oe,me,D,A);else{const z=T.el&&T.el._isVueCE?T.el:null;try{z&&z._beginPatch(),M(T,O,Z,oe,me,D,A)}finally{z&&z._endPatch()}}},L=(T,O,G,Q,Z,oe,me,D)=>{let A,z;const{props:ne,shapeFlag:te,transition:se,dirs:ye}=T;if(A=T.el=a(T.type,oe,ne&&ne.is,ne),te&8?f(A,T.children):te&16&&P(T.children,A,null,Q,Z,nc(T,oe),me,D),ye&&ur(T,null,Q,"created"),I(A,T,T.scopeId,me,Q),ne){for(const Ee in ne)Ee!=="value"&&!no(Ee)&&o(A,Ee,null,ne[Ee],oe,Q);"value"in ne&&o(A,"value",null,ne.value,oe),(z=ne.onVnodeBeforeMount)&&qn(z,Q,T)}ye&&ur(T,null,Q,"beforeMount");const xe=cb(Z,se);xe&&se.beforeEnter(A),i(A,O,G),((z=ne&&ne.onVnodeMounted)||xe||ye)&&Tn(()=>{z&&qn(z,Q,T),xe&&se.enter(A),ye&&ur(T,null,Q,"mounted")},Z)},I=(T,O,G,Q,Z)=>{if(G&&x(T,G),Q)for(let oe=0;oe<Q.length;oe++)x(T,Q[oe]);if(Z){let oe=Z.subTree;if(O===oe||wm(oe.type)&&(oe.ssContent===O||oe.ssFallback===O)){const me=Z.vnode;I(T,me,me.scopeId,me.slotScopeIds,Z.parent)}}},P=(T,O,G,Q,Z,oe,me,D,A=0)=>{for(let z=A;z<T.length;z++){const ne=T[z]=D?Gi(T[z]):Kn(T[z]);w(null,ne,O,G,Q,Z,oe,me,D)}},M=(T,O,G,Q,Z,oe,me)=>{const D=O.el=T.el;let{patchFlag:A,dynamicChildren:z,dirs:ne}=O;A|=T.patchFlag&16;const te=T.props||Tt,se=O.props||Tt;let ye;if(G&&hr(G,!1),(ye=se.onVnodeBeforeUpdate)&&qn(ye,G,O,T),ne&&ur(O,T,G,"beforeUpdate"),G&&hr(G,!0),(te.innerHTML&&se.innerHTML==null||te.textContent&&se.textContent==null)&&f(D,""),z?b(T.dynamicChildren,z,D,G,Q,nc(O,Z),oe):me||K(T,O,D,null,G,Q,nc(O,Z),oe,!1),A>0){if(A&16)N(D,te,se,G,Z);else if(A&2&&te.class!==se.class&&o(D,"class",null,se.class,Z),A&4&&o(D,"style",te.style,se.style,Z),A&8){const xe=O.dynamicProps;for(let Ee=0;Ee<xe.length;Ee++){const Ae=xe[Ee],Ve=te[Ae],_e=se[Ae];(_e!==Ve||Ae==="value")&&o(D,Ae,Ve,_e,Z,G)}}A&1&&T.children!==O.children&&f(D,O.children)}else!me&&z==null&&N(D,te,se,G,Z);((ye=se.onVnodeUpdated)||ne)&&Tn(()=>{ye&&qn(ye,G,O,T),ne&&ur(O,T,G,"updated")},Q)},b=(T,O,G,Q,Z,oe,me)=>{for(let D=0;D<O.length;D++){const A=T[D],z=O[D],ne=A.el&&(A.type===Nn||!Ks(A,z)||A.shapeFlag&198)?m(A.el):G;w(A,z,ne,null,Q,Z,oe,me,!0)}},N=(T,O,G,Q,Z)=>{if(O!==G){if(O!==Tt)for(const oe in O)!no(oe)&&!(oe in G)&&o(T,oe,O[oe],null,Z,Q);for(const oe in G){if(no(oe))continue;const me=G[oe],D=O[oe];me!==D&&oe!=="value"&&o(T,oe,D,me,Z,Q)}"value"in G&&o(T,"value",O.value,G.value,Z)}},H=(T,O,G,Q,Z,oe,me,D,A)=>{const z=O.el=T?T.el:c(""),ne=O.anchor=T?T.anchor:c("");let{patchFlag:te,dynamicChildren:se,slotScopeIds:ye}=O;ye&&(D=D?D.concat(ye):ye),T==null?(i(z,G,Q),i(ne,G,Q),P(O.children||[],G,ne,Z,oe,me,D,A)):te>0&&te&64&&se&&T.dynamicChildren&&T.dynamicChildren.length===se.length?(b(T.dynamicChildren,se,G,Z,oe,me,D),(O.key!=null||Z&&O===Z.subTree)&&xm(T,O,!0)):K(T,O,G,ne,Z,oe,me,D,A)},ae=(T,O,G,Q,Z,oe,me,D,A)=>{O.slotScopeIds=D,T==null?O.shapeFlag&512?Z.ctx.activate(O,G,Q,me,A):V(O,G,Q,Z,oe,me,A):J(T,O,A)},V=(T,O,G,Q,Z,oe,me)=>{const D=T.component=_b(T,Q,Z);if(im(T)&&(D.ctx.renderer=B),xb(D,!1,me),D.asyncDep){if(Z&&Z.registerDep(D,q,me),!T.el){const A=D.subTree=Ft(er);g(null,A,O,G),T.placeholder=A.el}}else q(D,T,O,G,Z,oe,me)},J=(T,O,G)=>{const Q=O.component=T.component;if(Qx(T,O,G))if(Q.asyncDep&&!Q.asyncResolved){ee(Q,O,G);return}else Q.next=O,Q.update();else O.el=T.el,Q.vnode=O},q=(T,O,G,Q,Z,oe,me)=>{const D=()=>{if(T.isMounted){let{next:te,bu:se,u:ye,parent:xe,vnode:Ee}=T;{const We=bm(T);if(We){te&&(te.el=Ee.el,ee(T,te,me)),We.asyncDep.then(()=>{T.isUnmounted||D()});return}}let Ae=te,Ve;hr(T,!1),te?(te.el=Ee.el,ee(T,te,me)):te=Ee,se&&$l(se),(Ve=te.props&&te.props.onVnodeBeforeUpdate)&&qn(Ve,xe,te,Ee),hr(T,!0);const _e=gd(T),Je=T.subTree;T.subTree=_e,w(Je,_e,m(Je.el),Ue(Je),T,Z,oe),te.el=_e.el,Ae===null&&eb(T,_e.el),ye&&Tn(ye,Z),(Ve=te.props&&te.props.onVnodeUpdated)&&Tn(()=>qn(Ve,xe,te,Ee),Z)}else{let te;const{el:se,props:ye}=O,{bm:xe,m:Ee,parent:Ae,root:Ve,type:_e}=T,Je=ao(O);hr(T,!1),xe&&$l(xe),!Je&&(te=ye&&ye.onVnodeBeforeMount)&&qn(te,Ae,O),hr(T,!0);{Ve.ce&&Ve.ce._def.shadowRoot!==!1&&Ve.ce._injectChildStyle(_e);const We=T.subTree=gd(T);w(null,We,G,Q,T,Z,oe),O.el=We.el}if(Ee&&Tn(Ee,Z),!Je&&(te=ye&&ye.onVnodeMounted)){const We=O;Tn(()=>qn(te,Ae,We),Z)}(O.shapeFlag&256||Ae&&ao(Ae.vnode)&&Ae.vnode.shapeFlag&256)&&T.a&&Tn(T.a,Z),T.isMounted=!0,O=G=Q=null}};T.scope.on();const A=T.effect=new Dp(D);T.scope.off();const z=T.update=A.run.bind(A),ne=T.job=A.runIfDirty.bind(A);ne.i=T,ne.id=T.uid,A.scheduler=()=>Iu(ne),hr(T,!0),z()},ee=(T,O,G)=>{O.component=T;const Q=T.vnode.props;T.vnode=O,T.next=null,nb(T,O.props,Q,G),ob(T,O.children,G),wi(),ud(T),Mi()},K=(T,O,G,Q,Z,oe,me,D,A=!1)=>{const z=T&&T.children,ne=T?T.shapeFlag:0,te=O.children,{patchFlag:se,shapeFlag:ye}=O;if(se>0){if(se&128){de(z,te,G,Q,Z,oe,me,D,A);return}else if(se&256){ue(z,te,G,Q,Z,oe,me,D,A);return}}ye&8?(ne&16&&Ie(z,Z,oe),te!==z&&f(G,te)):ne&16?ye&16?de(z,te,G,Q,Z,oe,me,D,A):Ie(z,Z,oe,!0):(ne&8&&f(G,""),ye&16&&P(te,G,Q,Z,oe,me,D,A))},ue=(T,O,G,Q,Z,oe,me,D,A)=>{T=T||ps,O=O||ps;const z=T.length,ne=O.length,te=Math.min(z,ne);let se;for(se=0;se<te;se++){const ye=O[se]=A?Gi(O[se]):Kn(O[se]);w(T[se],ye,G,null,Z,oe,me,D,A)}z>ne?Ie(T,Z,oe,!0,!1,te):P(O,G,Q,Z,oe,me,D,A,te)},de=(T,O,G,Q,Z,oe,me,D,A)=>{let z=0;const ne=O.length;let te=T.length-1,se=ne-1;for(;z<=te&&z<=se;){const ye=T[z],xe=O[z]=A?Gi(O[z]):Kn(O[z]);if(Ks(ye,xe))w(ye,xe,G,null,Z,oe,me,D,A);else break;z++}for(;z<=te&&z<=se;){const ye=T[te],xe=O[se]=A?Gi(O[se]):Kn(O[se]);if(Ks(ye,xe))w(ye,xe,G,null,Z,oe,me,D,A);else break;te--,se--}if(z>te){if(z<=se){const ye=se+1,xe=ye<ne?O[ye].el:Q;for(;z<=se;)w(null,O[z]=A?Gi(O[z]):Kn(O[z]),G,xe,Z,oe,me,D,A),z++}}else if(z>se)for(;z<=te;)be(T[z],Z,oe,!0),z++;else{const ye=z,xe=z,Ee=new Map;for(z=xe;z<=se;z++){const Ce=O[z]=A?Gi(O[z]):Kn(O[z]);Ce.key!=null&&Ee.set(Ce.key,z)}let Ae,Ve=0;const _e=se-xe+1;let Je=!1,We=0;const Ge=new Array(_e);for(z=0;z<_e;z++)Ge[z]=0;for(z=ye;z<=te;z++){const Ce=T[z];if(Ve>=_e){be(Ce,Z,oe,!0);continue}let X;if(Ce.key!=null)X=Ee.get(Ce.key);else for(Ae=xe;Ae<=se;Ae++)if(Ge[Ae-xe]===0&&Ks(Ce,O[Ae])){X=Ae;break}X===void 0?be(Ce,Z,oe,!0):(Ge[X-xe]=z+1,X>=We?We=X:Je=!0,w(Ce,O[X],G,null,Z,oe,me,D,A),Ve++)}const ze=Je?ub(Ge):ps;for(Ae=ze.length-1,z=_e-1;z>=0;z--){const Ce=xe+z,X=O[Ce],ve=O[Ce+1],De=Ce+1<ne?ve.el||ym(ve):Q;Ge[z]===0?w(null,X,G,De,Z,oe,me,D,A):Je&&(Ae<0||z!==ze[Ae]?we(X,G,De,2):Ae--)}}},we=(T,O,G,Q,Z=null)=>{const{el:oe,type:me,transition:D,children:A,shapeFlag:z}=T;if(z&6){we(T.component.subTree,O,G,Q);return}if(z&128){T.suspense.move(O,G,Q);return}if(z&64){me.move(T,O,G,B);return}if(me===Nn){i(oe,O,G);for(let te=0;te<A.length;te++)we(A[te],O,G,Q);i(T.anchor,O,G);return}if(me===ic){E(T,O,G);return}if(Q!==2&&z&1&&D)if(Q===0)D.beforeEnter(oe),i(oe,O,G),Tn(()=>D.enter(oe),Z);else{const{leave:te,delayLeave:se,afterLeave:ye}=D,xe=()=>{T.ctx.isUnmounted?r(oe):i(oe,O,G)},Ee=()=>{oe._isLeaving&&oe[Sx](!0),te(oe,()=>{xe(),ye&&ye()})};se?se(oe,xe,Ee):Ee()}else i(oe,O,G)},be=(T,O,G,Q=!1,Z=!1)=>{const{type:oe,props:me,ref:D,children:A,dynamicChildren:z,shapeFlag:ne,patchFlag:te,dirs:se,cacheIndex:ye}=T;if(te===-2&&(Z=!1),D!=null&&(wi(),oo(D,null,G,T,!0),Mi()),ye!=null&&(O.renderCache[ye]=void 0),ne&256){O.ctx.deactivate(T);return}const xe=ne&1&&se,Ee=!ao(T);let Ae;if(Ee&&(Ae=me&&me.onVnodeBeforeUnmount)&&qn(Ae,O,T),ne&6)Me(T.component,G,Q);else{if(ne&128){T.suspense.unmount(G,Q);return}xe&&ur(T,null,O,"beforeUnmount"),ne&64?T.type.remove(T,O,G,B,Q):z&&!z.hasOnce&&(oe!==Nn||te>0&&te&64)?Ie(z,O,G,!1,!0):(oe===Nn&&te&384||!Z&&ne&16)&&Ie(A,O,G),Q&&fe(T)}(Ee&&(Ae=me&&me.onVnodeUnmounted)||xe)&&Tn(()=>{Ae&&qn(Ae,O,T),xe&&ur(T,null,O,"unmounted")},G)},fe=T=>{const{type:O,el:G,anchor:Q,transition:Z}=T;if(O===Nn){ce(G,Q);return}if(O===ic){S(T);return}const oe=()=>{r(G),Z&&!Z.persisted&&Z.afterLeave&&Z.afterLeave()};if(T.shapeFlag&1&&Z&&!Z.persisted){const{leave:me,delayLeave:D}=Z,A=()=>me(G,oe);D?D(T.el,oe,A):A()}else oe()},ce=(T,O)=>{let G;for(;T!==O;)G=_(T),r(T),T=G;r(O)},Me=(T,O,G)=>{const{bum:Q,scope:Z,job:oe,subTree:me,um:D,m:A,a:z}=T;xd(A),xd(z),Q&&$l(Q),Z.stop(),oe&&(oe.flags|=8,be(me,T,O,G)),D&&Tn(D,O),Tn(()=>{T.isUnmounted=!0},O)},Ie=(T,O,G,Q=!1,Z=!1,oe=0)=>{for(let me=oe;me<T.length;me++)be(T[me],O,G,Q,Z)},Ue=T=>{if(T.shapeFlag&6)return Ue(T.component.subTree);if(T.shapeFlag&128)return T.suspense.next();const O=_(T.anchor||T.el),G=O&&O[Mx];return G?_(G):O};let ge=!1;const U=(T,O,G)=>{let Q;T==null?O._vnode&&(be(O._vnode,null,null,!0),Q=O._vnode.component):w(O._vnode||null,T,O,null,null,null,G),O._vnode=T,ge||(ge=!0,ud(Q),Jp(),ge=!1)},B={p:w,um:be,m:we,r:fe,mt:V,mc:P,pc:K,pbc:b,n:Ue,o:n};return{render:U,hydrate:void 0,createApp:qx(U)}}function nc({type:n,props:e},t){return t==="svg"&&n==="foreignObject"||t==="mathml"&&n==="annotation-xml"&&e&&e.encoding&&e.encoding.includes("html")?void 0:t}function hr({effect:n,job:e},t){t?(n.flags|=32,e.flags|=4):(n.flags&=-33,e.flags&=-5)}function cb(n,e){return(!n||n&&!n.pendingBranch)&&e&&!e.persisted}function xm(n,e,t=!1){const i=n.children,r=e.children;if(et(i)&&et(r))for(let o=0;o<i.length;o++){const a=i[o];let c=r[o];c.shapeFlag&1&&!c.dynamicChildren&&((c.patchFlag<=0||c.patchFlag===32)&&(c=r[o]=Gi(r[o]),c.el=a.el),!t&&c.patchFlag!==-2&&xm(a,c)),c.type===cl&&(c.patchFlag!==-1?c.el=a.el:c.__elIndex=o+(n.type===Nn?1:0)),c.type===er&&!c.el&&(c.el=a.el)}}function ub(n){const e=n.slice(),t=[0];let i,r,o,a,c;const h=n.length;for(i=0;i<h;i++){const d=n[i];if(d!==0){if(r=t[t.length-1],n[r]<d){e[i]=r,t.push(i);continue}for(o=0,a=t.length-1;o<a;)c=o+a>>1,n[t[c]]<d?o=c+1:a=c;d<n[t[o]]&&(o>0&&(e[i]=t[o-1]),t[o]=i)}}for(o=t.length,a=t[o-1];o-- >0;)t[o]=a,a=e[a];return t}function bm(n){const e=n.subTree.component;if(e)return e.asyncDep&&!e.asyncResolved?e:bm(e)}function xd(n){if(n)for(let e=0;e<n.length;e++)n[e].flags|=8}function ym(n){if(n.placeholder)return n.placeholder;const e=n.component;return e?ym(e.subTree):null}const wm=n=>n.__isSuspense;function hb(n,e){e&&e.pendingBranch?et(n)?e.effects.push(...n):e.effects.push(n):vx(n)}const Nn=Symbol.for("v-fgt"),cl=Symbol.for("v-txt"),er=Symbol.for("v-cmt"),ic=Symbol.for("v-stc"),co=[];let An=null;function Gt(n=!1){co.push(An=n?null:[])}function db(){co.pop(),An=co[co.length-1]||null}let yo=1;function bd(n,e=!1){yo+=n,n<0&&An&&e&&(An.hasOnce=!0)}function Mm(n){return n.dynamicChildren=yo>0?An||ps:null,db(),yo>0&&An&&An.push(n),n}function en(n,e,t,i,r,o){return Mm(gt(n,e,t,i,r,o,!0))}function Em(n,e,t,i,r){return Mm(Ft(n,e,t,i,r,!0))}function Sm(n){return n?n.__v_isVNode===!0:!1}function Ks(n,e){return n.type===e.type&&n.key===e.key}const Tm=({key:n})=>n??null,Ca=({ref:n,ref_key:e,ref_for:t})=>(typeof n=="number"&&(n=""+n),n!=null?jt(n)||Wt(n)||tt(n)?{i:Jn,r:n,k:e,f:!!t}:n:null);function gt(n,e=null,t=null,i=0,r=null,o=n===Nn?0:1,a=!1,c=!1){const h={__v_isVNode:!0,__v_skip:!0,type:n,props:e,key:e&&Tm(e),ref:e&&Ca(e),scopeId:em,slotScopeIds:null,children:t,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:o,patchFlag:i,dynamicProps:r,dynamicChildren:null,appContext:null,ctx:Jn};return c?(Bu(h,t),o&128&&n.normalize(h)):t&&(h.shapeFlag|=jt(t)?8:16),yo>0&&!a&&An&&(h.patchFlag>0||o&6)&&h.patchFlag!==32&&An.push(h),h}const Ft=fb;function fb(n,e=null,t=null,i=0,r=null,o=!1){if((!n||n===Fx)&&(n=er),Sm(n)){const c=ys(n,e,!0);return t&&Bu(c,t),yo>0&&!o&&An&&(c.shapeFlag&6?An[An.indexOf(n)]=c:An.push(c)),c.patchFlag=-2,c}if(wb(n)&&(n=n.__vccOpts),e){e=pb(e);let{class:c,style:h}=e;c&&!jt(c)&&(e.class=Mu(c)),Nt(h)&&(sl(h)&&!et(h)&&(h=ln({},h)),e.style=wu(h))}const a=jt(n)?1:wm(n)?128:Ex(n)?64:Nt(n)?4:tt(n)?2:0;return gt(n,e,t,i,r,a,o,!0)}function pb(n){return n?sl(n)||fm(n)?ln({},n):n:null}function ys(n,e,t=!1,i=!1){const{props:r,ref:o,patchFlag:a,children:c,transition:h}=n,d=e?Cm(r||{},e):r,f={__v_isVNode:!0,__v_skip:!0,type:n.type,props:d,key:d&&Tm(d),ref:e&&e.ref?t&&o?et(o)?o.concat(Ca(e)):[o,Ca(e)]:Ca(e):o,scopeId:n.scopeId,slotScopeIds:n.slotScopeIds,children:c,target:n.target,targetStart:n.targetStart,targetAnchor:n.targetAnchor,staticCount:n.staticCount,shapeFlag:n.shapeFlag,patchFlag:e&&n.type!==Nn?a===-1?16:a|16:a,dynamicProps:n.dynamicProps,dynamicChildren:n.dynamicChildren,appContext:n.appContext,dirs:n.dirs,transition:h,component:n.component,suspense:n.suspense,ssContent:n.ssContent&&ys(n.ssContent),ssFallback:n.ssFallback&&ys(n.ssFallback),placeholder:n.placeholder,el:n.el,anchor:n.anchor,ctx:n.ctx,ce:n.ce};return h&&i&&Uu(f,h.clone(f)),f}function mb(n=" ",e=0){return Ft(cl,null,n,e)}function Fu(n="",e=!1){return e?(Gt(),Em(er,null,n)):Ft(er,null,n)}function Kn(n){return n==null||typeof n=="boolean"?Ft(er):et(n)?Ft(Nn,null,n.slice()):Sm(n)?Gi(n):Ft(cl,null,String(n))}function Gi(n){return n.el===null&&n.patchFlag!==-1||n.memo?n:ys(n)}function Bu(n,e){let t=0;const{shapeFlag:i}=n;if(e==null)e=null;else if(et(e))t=16;else if(typeof e=="object")if(i&65){const r=e.default;r&&(r._c&&(r._d=!1),Bu(n,r()),r._c&&(r._d=!0));return}else{t=32;const r=e._;!r&&!fm(e)?e._ctx=Jn:r===3&&Jn&&(Jn.slots._===1?e._=1:(e._=2,n.patchFlag|=1024))}else tt(e)?(e={default:e,_ctx:Jn},t=32):(e=String(e),i&64?(t=16,e=[mb(e)]):t=8);n.children=e,n.shapeFlag|=t}function Cm(...n){const e={};for(let t=0;t<n.length;t++){const i=n[t];for(const r in i)if(r==="class")e.class!==i.class&&(e.class=Mu([e.class,i.class]));else if(r==="style")e.style=wu([e.style,i.style]);else if(Qa(r)){const o=e[r],a=i[r];a&&o!==a&&!(et(o)&&o.includes(a))&&(e[r]=o?[].concat(o,a):a)}else r!==""&&(e[r]=i[r])}return e}function qn(n,e,t,i=null){ni(n,e,7,[t,i])}const gb=cm();let vb=0;function _b(n,e,t){const i=n.type,r=(e?e.appContext:n.appContext)||gb,o={uid:vb++,vnode:n,type:i,parent:e,appContext:r,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new F0(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:e?e.provides:Object.create(r.provides),ids:e?e.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:mm(i,r),emitsOptions:um(i,r),emit:null,emitted:null,propsDefaults:Tt,inheritAttrs:i.inheritAttrs,ctx:Tt,data:Tt,props:Tt,attrs:Tt,slots:Tt,refs:Tt,setupState:Tt,setupContext:null,suspense:t,suspenseId:t?t.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return o.ctx={_:o},o.root=e?e.root:o,o.emit=Kx.bind(null,o),n.ce&&n.ce(o),o}let pn=null;const Am=()=>pn||Jn;let za,eu;{const n=il(),e=(t,i)=>{let r;return(r=n[t])||(r=n[t]=[]),r.push(i),o=>{r.length>1?r.forEach(a=>a(o)):r[0](o)}};za=e("__VUE_INSTANCE_SETTERS__",t=>pn=t),eu=e("__VUE_SSR_SETTERS__",t=>wo=t)}const Po=n=>{const e=pn;return za(n),n.scope.on(),()=>{n.scope.off(),za(e)}},yd=()=>{pn&&pn.scope.off(),za(null)};function Pm(n){return n.vnode.shapeFlag&4}let wo=!1;function xb(n,e=!1,t=!1){e&&eu(e);const{props:i,children:r}=n.vnode,o=Pm(n);tb(n,i,o,e),sb(n,r,t||e);const a=o?bb(n,e):void 0;return e&&eu(!1),a}function bb(n,e){const t=n.type;n.accessCache=Object.create(null),n.proxy=new Proxy(n.ctx,Bx);const{setup:i}=t;if(i){wi();const r=n.setupContext=i.length>1?Lm(n):null,o=Po(n),a=Co(i,n,0,[n.props,r]),c=Ep(a);if(Mi(),o(),(c||n.sp)&&!ao(n)&&nm(n),c){if(a.then(yd,yd),e)return a.then(h=>{wd(n,h)}).catch(h=>{ol(h,n,0)});n.asyncDep=a}else wd(n,a)}else Rm(n)}function wd(n,e,t){tt(e)?n.type.__ssrInlineRender?n.ssrRender=e:n.render=e:Nt(e)&&(n.setupState=Yp(e)),Rm(n)}function Rm(n,e,t){const i=n.type;n.render||(n.render=i.render||Qn);{const r=Po(n);wi();try{zx(n)}finally{Mi(),r()}}}const yb={get(n,e){return an(n,"get",""),n[e]}};function Lm(n){const e=t=>{n.exposed=t||{}};return{attrs:new Proxy(n.attrs,yb),slots:n.slots,emit:n.emit,expose:e}}function ku(n){return n.exposed?n.exposeProxy||(n.exposeProxy=new Proxy(Yp(rx(n.exposed)),{get(e,t){if(t in e)return e[t];if(t in lo)return lo[t](n)},has(e,t){return t in e||t in lo}})):n.proxy}function wb(n){return tt(n)&&"__vccOpts"in n}const $n=(n,e)=>hx(n,e,wo),Mb="3.5.26";/**
* @vue/runtime-dom v3.5.26
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let tu;const Md=typeof window<"u"&&window.trustedTypes;if(Md)try{tu=Md.createPolicy("vue",{createHTML:n=>n})}catch{}const Im=tu?n=>tu.createHTML(n):n=>n,Eb="http://www.w3.org/2000/svg",Sb="http://www.w3.org/1998/Math/MathML",_i=typeof document<"u"?document:null,Ed=_i&&_i.createElement("template"),Tb={insert:(n,e,t)=>{e.insertBefore(n,t||null)},remove:n=>{const e=n.parentNode;e&&e.removeChild(n)},createElement:(n,e,t,i)=>{const r=e==="svg"?_i.createElementNS(Eb,n):e==="mathml"?_i.createElementNS(Sb,n):t?_i.createElement(n,{is:t}):_i.createElement(n);return n==="select"&&i&&i.multiple!=null&&r.setAttribute("multiple",i.multiple),r},createText:n=>_i.createTextNode(n),createComment:n=>_i.createComment(n),setText:(n,e)=>{n.nodeValue=e},setElementText:(n,e)=>{n.textContent=e},parentNode:n=>n.parentNode,nextSibling:n=>n.nextSibling,querySelector:n=>_i.querySelector(n),setScopeId(n,e){n.setAttribute(e,"")},insertStaticContent(n,e,t,i,r,o){const a=t?t.previousSibling:e.lastChild;if(r&&(r===o||r.nextSibling))for(;e.insertBefore(r.cloneNode(!0),t),!(r===o||!(r=r.nextSibling)););else{Ed.innerHTML=Im(i==="svg"?`<svg>${n}</svg>`:i==="mathml"?`<math>${n}</math>`:n);const c=Ed.content;if(i==="svg"||i==="mathml"){const h=c.firstChild;for(;h.firstChild;)c.appendChild(h.firstChild);c.removeChild(h)}e.insertBefore(c,t)}return[a?a.nextSibling:e.firstChild,t?t.previousSibling:e.lastChild]}},Cb=Symbol("_vtc");function Ab(n,e,t){const i=n[Cb];i&&(e=(e?[e,...i]:[...i]).join(" ")),e==null?n.removeAttribute("class"):t?n.setAttribute("class",e):n.className=e}const Sd=Symbol("_vod"),Pb=Symbol("_vsh"),Rb=Symbol(""),Lb=/(?:^|;)\s*display\s*:/;function Ib(n,e,t){const i=n.style,r=jt(t);let o=!1;if(t&&!r){if(e)if(jt(e))for(const a of e.split(";")){const c=a.slice(0,a.indexOf(":")).trim();t[c]==null&&Aa(i,c,"")}else for(const a in e)t[a]==null&&Aa(i,a,"");for(const a in t)a==="display"&&(o=!0),Aa(i,a,t[a])}else if(r){if(e!==t){const a=i[Rb];a&&(t+=";"+a),i.cssText=t,o=Lb.test(t)}}else e&&n.removeAttribute("style");Sd in n&&(n[Sd]=o?i.display:"",n[Pb]&&(i.display="none"))}const Td=/\s*!important$/;function Aa(n,e,t){if(et(t))t.forEach(i=>Aa(n,e,i));else if(t==null&&(t=""),e.startsWith("--"))n.setProperty(e,t);else{const i=Db(n,e);Td.test(t)?n.setProperty(Ar(i),t.replace(Td,""),"important"):n[i]=t}}const Cd=["Webkit","Moz","ms"],rc={};function Db(n,e){const t=rc[e];if(t)return t;let i=Ji(e);if(i!=="filter"&&i in n)return rc[e]=i;i=Cp(i);for(let r=0;r<Cd.length;r++){const o=Cd[r]+i;if(o in n)return rc[e]=o}return e}const Ad="http://www.w3.org/1999/xlink";function Pd(n,e,t,i,r,o=O0(e)){i&&e.startsWith("xlink:")?t==null?n.removeAttributeNS(Ad,e.slice(6,e.length)):n.setAttributeNS(Ad,e,t):t==null||o&&!Pp(t)?n.removeAttribute(e):n.setAttribute(e,o?"":nr(t)?String(t):t)}function Rd(n,e,t,i,r){if(e==="innerHTML"||e==="textContent"){t!=null&&(n[e]=e==="innerHTML"?Im(t):t);return}const o=n.tagName;if(e==="value"&&o!=="PROGRESS"&&!o.includes("-")){const c=o==="OPTION"?n.getAttribute("value")||"":n.value,h=t==null?n.type==="checkbox"?"on":"":String(t);(c!==h||!("_value"in n))&&(n.value=h),t==null&&n.removeAttribute(e),n._value=t;return}let a=!1;if(t===""||t==null){const c=typeof n[e];c==="boolean"?t=Pp(t):t==null&&c==="string"?(t="",a=!0):c==="number"&&(t=0,a=!0)}try{n[e]=t}catch{}a&&n.removeAttribute(r||e)}function Ub(n,e,t,i){n.addEventListener(e,t,i)}function Nb(n,e,t,i){n.removeEventListener(e,t,i)}const Ld=Symbol("_vei");function Ob(n,e,t,i,r=null){const o=n[Ld]||(n[Ld]={}),a=o[e];if(i&&a)a.value=i;else{const[c,h]=Fb(e);if(i){const d=o[e]=Vb(i,r);Ub(n,c,d,h)}else a&&(Nb(n,c,a,h),o[e]=void 0)}}const Id=/(?:Once|Passive|Capture)$/;function Fb(n){let e;if(Id.test(n)){e={};let i;for(;i=n.match(Id);)n=n.slice(0,n.length-i[0].length),e[i[0].toLowerCase()]=!0}return[n[2]===":"?n.slice(3):Ar(n.slice(2)),e]}let sc=0;const Bb=Promise.resolve(),kb=()=>sc||(Bb.then(()=>sc=0),sc=Date.now());function Vb(n,e){const t=i=>{if(!i._vts)i._vts=Date.now();else if(i._vts<=t.attached)return;ni(zb(i,t.value),e,5,[i])};return t.value=n,t.attached=kb(),t}function zb(n,e){if(et(e)){const t=n.stopImmediatePropagation;return n.stopImmediatePropagation=()=>{t.call(n),n._stopped=!0},e.map(i=>r=>!r._stopped&&i&&i(r))}else return e}const Dd=n=>n.charCodeAt(0)===111&&n.charCodeAt(1)===110&&n.charCodeAt(2)>96&&n.charCodeAt(2)<123,Hb=(n,e,t,i,r,o)=>{const a=r==="svg";e==="class"?Ab(n,i,a):e==="style"?Ib(n,t,i):Qa(e)?bu(e)||Ob(n,e,t,i,o):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):Gb(n,e,i,a))?(Rd(n,e,i),!n.tagName.includes("-")&&(e==="value"||e==="checked"||e==="selected")&&Pd(n,e,i,a,o,e!=="value")):n._isVueCE&&(/[A-Z]/.test(e)||!jt(i))?Rd(n,Ji(e),i,o,e):(e==="true-value"?n._trueValue=i:e==="false-value"&&(n._falseValue=i),Pd(n,e,i,a))};function Gb(n,e,t,i){if(i)return!!(e==="innerHTML"||e==="textContent"||e in n&&Dd(e)&&tt(t));if(e==="spellcheck"||e==="draggable"||e==="translate"||e==="autocorrect"||e==="sandbox"&&n.tagName==="IFRAME"||e==="form"||e==="list"&&n.tagName==="INPUT"||e==="type"&&n.tagName==="TEXTAREA")return!1;if(e==="width"||e==="height"){const r=n.tagName;if(r==="IMG"||r==="VIDEO"||r==="CANVAS"||r==="SOURCE")return!1}return Dd(e)&&jt(t)?!1:e in n}const Wb=ln({patchProp:Hb},Tb);let Ud;function Dm(){return Ud||(Ud=ab(Wb))}const jb=(...n)=>{Dm().render(...n)},Xb=(...n)=>{const e=Dm().createApp(...n),{mount:t}=e;return e.mount=i=>{const r=Yb(i);if(!r)return;const o=e._component;!tt(o)&&!o.render&&!o.template&&(o.template=r.innerHTML),r.nodeType===1&&(r.textContent="");const a=t(r,!1,qb(r));return r instanceof Element&&(r.removeAttribute("v-cloak"),r.setAttribute("data-v-app","")),a},e};function qb(n){if(n instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&n instanceof MathMLElement)return"mathml"}function Yb(n){return jt(n)?document.querySelector(n):n}/**
 * @license
 * Copyright 2010-2023 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const ul="160",jr={ROTATE:0,DOLLY:1,PAN:2},Wi={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Kb=0,Nd=1,$b=2,Um=1,Zb=2,vi=3,tr=0,vn=1,Fn=2,$i=0,xs=1,nu=2,Od=3,Fd=4,Jb=5,_r=100,Qb=101,ey=102,Bd=103,kd=104,ty=200,ny=201,iy=202,ry=203,iu=204,ru=205,sy=206,oy=207,ay=208,ly=209,cy=210,uy=211,hy=212,dy=213,fy=214,py=0,my=1,gy=2,Ha=3,vy=4,_y=5,xy=6,by=7,Nm=0,yy=1,wy=2,Zi=0,My=1,Ey=2,Sy=3,Ty=4,Cy=5,Ay=6,Om=300,ws=301,Ms=302,su=303,ou=304,hl=306,Ga=1e3,Bn=1001,Wa=1002,$t=1003,au=1004,Pa=1005,Cn=1006,Fm=1007,Es=1008,ei=1009,Py=1010,Ry=1011,Vu=1012,Bm=1013,Xi=1014,qi=1015,Ss=1016,km=1017,Vm=1018,wr=1020,Ly=1021,kn=1023,Iy=1024,Dy=1025,Mr=1026,Ts=1027,Uy=1028,zm=1029,Ny=1030,Hm=1031,Gm=1033,oc=33776,ac=33777,lc=33778,cc=33779,Vd=35840,zd=35841,Hd=35842,Gd=35843,Wm=36196,Wd=37492,jd=37496,Xd=37808,qd=37809,Yd=37810,Kd=37811,$d=37812,Zd=37813,Jd=37814,Qd=37815,ef=37816,tf=37817,nf=37818,rf=37819,sf=37820,of=37821,uc=36492,af=36494,lf=36495,Oy=36283,cf=36284,uf=36285,hf=36286,Fy=2300,By=2301,jm=3e3,Er=3001,ky=3200,Vy=3201,zy=0,Hy=1,Vn="",Qt="srgb",Si="srgb-linear",zu="display-p3",dl="display-p3-linear",ja="linear",Ct="srgb",Xa="rec709",qa="p3",Xr=7680,df=519,Gy=512,Wy=513,jy=514,Xm=515,Xy=516,qy=517,Yy=518,Ky=519,lu=35044,ff="300 es",cu=1035,yi=2e3,Ya=2001;class Pr{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const r=this._listeners[e];if(r!==void 0){const o=r.indexOf(t);o!==-1&&r.splice(o,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const i=this._listeners[e.type];if(i!==void 0){e.target=this;const r=i.slice(0);for(let o=0,a=r.length;o<a;o++)r[o].call(this,e);e.target=null}}}const rn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let pf=1234567;const uo=Math.PI/180,Mo=180/Math.PI;function ti(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(rn[n&255]+rn[n>>8&255]+rn[n>>16&255]+rn[n>>24&255]+"-"+rn[e&255]+rn[e>>8&255]+"-"+rn[e>>16&15|64]+rn[e>>24&255]+"-"+rn[t&63|128]+rn[t>>8&255]+"-"+rn[t>>16&255]+rn[t>>24&255]+rn[i&255]+rn[i>>8&255]+rn[i>>16&255]+rn[i>>24&255]).toLowerCase()}function zt(n,e,t){return Math.max(e,Math.min(t,n))}function Hu(n,e){return(n%e+e)%e}function $y(n,e,t,i,r){return i+(n-e)*(r-i)/(t-e)}function Zy(n,e,t){return n!==e?(t-n)/(e-n):0}function ho(n,e,t){return(1-t)*n+t*e}function Jy(n,e,t,i){return ho(n,e,1-Math.exp(-t*i))}function Qy(n,e=1){return e-Math.abs(Hu(n,e*2)-e)}function ew(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function tw(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function nw(n,e){return n+Math.floor(Math.random()*(e-n+1))}function iw(n,e){return n+Math.random()*(e-n)}function rw(n){return n*(.5-Math.random())}function sw(n){n!==void 0&&(pf=n);let e=pf+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function ow(n){return n*uo}function aw(n){return n*Mo}function uu(n){return(n&n-1)===0&&n!==0}function lw(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function Ka(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function cw(n,e,t,i,r){const o=Math.cos,a=Math.sin,c=o(t/2),h=a(t/2),d=o((e+i)/2),f=a((e+i)/2),m=o((e-i)/2),_=a((e-i)/2),x=o((i-e)/2),y=a((i-e)/2);switch(r){case"XYX":n.set(c*f,h*m,h*_,c*d);break;case"YZY":n.set(h*_,c*f,h*m,c*d);break;case"ZXZ":n.set(h*m,h*_,c*f,c*d);break;case"XZX":n.set(c*f,h*y,h*x,c*d);break;case"YXY":n.set(h*x,c*f,h*y,c*d);break;case"ZYZ":n.set(h*y,h*x,c*f,c*d);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+r)}}function Zn(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function bt(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}const hu={DEG2RAD:uo,RAD2DEG:Mo,generateUUID:ti,clamp:zt,euclideanModulo:Hu,mapLinear:$y,inverseLerp:Zy,lerp:ho,damp:Jy,pingpong:Qy,smoothstep:ew,smootherstep:tw,randInt:nw,randFloat:iw,randFloatSpread:rw,seededRandom:sw,degToRad:ow,radToDeg:aw,isPowerOfTwo:uu,ceilPowerOfTwo:lw,floorPowerOfTwo:Ka,setQuaternionFromProperEuler:cw,normalize:bt,denormalize:Zn};class Oe{constructor(e=0,t=0){Oe.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6],this.y=r[1]*t+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(zt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),r=Math.sin(t),o=this.x-e.x,a=this.y-e.y;return this.x=o*i-a*r+e.x,this.y=o*r+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class ot{constructor(e,t,i,r,o,a,c,h,d){ot.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,r,o,a,c,h,d)}set(e,t,i,r,o,a,c,h,d){const f=this.elements;return f[0]=e,f[1]=r,f[2]=c,f[3]=t,f[4]=o,f[5]=h,f[6]=i,f[7]=a,f[8]=d,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,r=t.elements,o=this.elements,a=i[0],c=i[3],h=i[6],d=i[1],f=i[4],m=i[7],_=i[2],x=i[5],y=i[8],w=r[0],v=r[3],g=r[6],R=r[1],E=r[4],S=r[7],F=r[2],L=r[5],I=r[8];return o[0]=a*w+c*R+h*F,o[3]=a*v+c*E+h*L,o[6]=a*g+c*S+h*I,o[1]=d*w+f*R+m*F,o[4]=d*v+f*E+m*L,o[7]=d*g+f*S+m*I,o[2]=_*w+x*R+y*F,o[5]=_*v+x*E+y*L,o[8]=_*g+x*S+y*I,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],r=e[2],o=e[3],a=e[4],c=e[5],h=e[6],d=e[7],f=e[8];return t*a*f-t*c*d-i*o*f+i*c*h+r*o*d-r*a*h}invert(){const e=this.elements,t=e[0],i=e[1],r=e[2],o=e[3],a=e[4],c=e[5],h=e[6],d=e[7],f=e[8],m=f*a-c*d,_=c*h-f*o,x=d*o-a*h,y=t*m+i*_+r*x;if(y===0)return this.set(0,0,0,0,0,0,0,0,0);const w=1/y;return e[0]=m*w,e[1]=(r*d-f*i)*w,e[2]=(c*i-r*a)*w,e[3]=_*w,e[4]=(f*t-r*h)*w,e[5]=(r*o-c*t)*w,e[6]=x*w,e[7]=(i*h-d*t)*w,e[8]=(a*t-i*o)*w,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,r,o,a,c){const h=Math.cos(o),d=Math.sin(o);return this.set(i*h,i*d,-i*(h*a+d*c)+a+e,-r*d,r*h,-r*(-d*a+h*c)+c+t,0,0,1),this}scale(e,t){return this.premultiply(hc.makeScale(e,t)),this}rotate(e){return this.premultiply(hc.makeRotation(-e)),this}translate(e,t){return this.premultiply(hc.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let r=0;r<9;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const hc=new ot;function qm(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function $a(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function uw(){const n=$a("canvas");return n.style.display="block",n}const mf={};function fo(n){n in mf||(mf[n]=!0,console.warn(n))}const gf=new ot().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),vf=new ot().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Ko={[Si]:{transfer:ja,primaries:Xa,toReference:n=>n,fromReference:n=>n},[Qt]:{transfer:Ct,primaries:Xa,toReference:n=>n.convertSRGBToLinear(),fromReference:n=>n.convertLinearToSRGB()},[dl]:{transfer:ja,primaries:qa,toReference:n=>n.applyMatrix3(vf),fromReference:n=>n.applyMatrix3(gf)},[zu]:{transfer:Ct,primaries:qa,toReference:n=>n.convertSRGBToLinear().applyMatrix3(vf),fromReference:n=>n.applyMatrix3(gf).convertLinearToSRGB()}},hw=new Set([Si,dl]),wt={enabled:!0,_workingColorSpace:Si,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(n){if(!hw.has(n))throw new Error(`Unsupported working color space, "${n}".`);this._workingColorSpace=n},convert:function(n,e,t){if(this.enabled===!1||e===t||!e||!t)return n;const i=Ko[e].toReference,r=Ko[t].fromReference;return r(i(n))},fromWorkingColorSpace:function(n,e){return this.convert(n,this._workingColorSpace,e)},toWorkingColorSpace:function(n,e){return this.convert(n,e,this._workingColorSpace)},getPrimaries:function(n){return Ko[n].primaries},getTransfer:function(n){return n===Vn?ja:Ko[n].transfer}};function bs(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function dc(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let qr;class Ym{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{qr===void 0&&(qr=$a("canvas")),qr.width=e.width,qr.height=e.height;const i=qr.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=qr}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=$a("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const r=i.getImageData(0,0,e.width,e.height),o=r.data;for(let a=0;a<o.length;a++)o[a]=bs(o[a]/255)*255;return i.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(bs(t[i]/255)*255):t[i]=bs(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let dw=0;class Km{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:dw++}),this.uuid=ti(),this.data=e,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let o;if(Array.isArray(r)){o=[];for(let a=0,c=r.length;a<c;a++)r[a].isDataTexture?o.push(fc(r[a].image)):o.push(fc(r[a]))}else o=fc(r);i.url=o}return t||(e.images[this.uuid]=i),i}}function fc(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Ym.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let fw=0;class tn extends Pr{constructor(e=tn.DEFAULT_IMAGE,t=tn.DEFAULT_MAPPING,i=Bn,r=Bn,o=Cn,a=Es,c=kn,h=ei,d=tn.DEFAULT_ANISOTROPY,f=Vn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:fw++}),this.uuid=ti(),this.name="",this.source=new Km(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=o,this.minFilter=a,this.anisotropy=d,this.format=c,this.internalFormat=null,this.type=h,this.offset=new Oe(0,0),this.repeat=new Oe(1,1),this.center=new Oe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ot,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof f=="string"?this.colorSpace=f:(fo("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=f===Er?Qt:Vn),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Om)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ga:e.x=e.x-Math.floor(e.x);break;case Bn:e.x=e.x<0?0:1;break;case Wa:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ga:e.y=e.y-Math.floor(e.y);break;case Bn:e.y=e.y<0?0:1;break;case Wa:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return fo("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===Qt?Er:jm}set encoding(e){fo("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=e===Er?Qt:Vn}}tn.DEFAULT_IMAGE=null;tn.DEFAULT_MAPPING=Om;tn.DEFAULT_ANISOTROPY=1;class It{constructor(e=0,t=0,i=0,r=1){It.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,r){return this.x=e,this.y=t,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,r=this.z,o=this.w,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*r+a[12]*o,this.y=a[1]*t+a[5]*i+a[9]*r+a[13]*o,this.z=a[2]*t+a[6]*i+a[10]*r+a[14]*o,this.w=a[3]*t+a[7]*i+a[11]*r+a[15]*o,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,r,o;const h=e.elements,d=h[0],f=h[4],m=h[8],_=h[1],x=h[5],y=h[9],w=h[2],v=h[6],g=h[10];if(Math.abs(f-_)<.01&&Math.abs(m-w)<.01&&Math.abs(y-v)<.01){if(Math.abs(f+_)<.1&&Math.abs(m+w)<.1&&Math.abs(y+v)<.1&&Math.abs(d+x+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const E=(d+1)/2,S=(x+1)/2,F=(g+1)/2,L=(f+_)/4,I=(m+w)/4,P=(y+v)/4;return E>S&&E>F?E<.01?(i=0,r=.707106781,o=.707106781):(i=Math.sqrt(E),r=L/i,o=I/i):S>F?S<.01?(i=.707106781,r=0,o=.707106781):(r=Math.sqrt(S),i=L/r,o=P/r):F<.01?(i=.707106781,r=.707106781,o=0):(o=Math.sqrt(F),i=I/o,r=P/o),this.set(i,r,o,t),this}let R=Math.sqrt((v-y)*(v-y)+(m-w)*(m-w)+(_-f)*(_-f));return Math.abs(R)<.001&&(R=1),this.x=(v-y)/R,this.y=(m-w)/R,this.z=(_-f)/R,this.w=Math.acos((d+x+g-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class pw extends Pr{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new It(0,0,e,t),this.scissorTest=!1,this.viewport=new It(0,0,e,t);const r={width:e,height:t,depth:1};i.encoding!==void 0&&(fo("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),i.colorSpace=i.encoding===Er?Qt:Vn),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Cn,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},i),this.texture=new tn(r,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=i.generateMipmaps,this.texture.internalFormat=i.internalFormat,this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}setSize(e,t,i=1){(this.width!==e||this.height!==t||this.depth!==i)&&(this.width=e,this.height=t,this.depth=i,this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=i,this.dispose()),this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Km(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ii extends pw{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class $m extends tn{constructor(e=null,t=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=$t,this.minFilter=$t,this.wrapR=Bn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class mw extends tn{constructor(e=null,t=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=$t,this.minFilter=$t,this.wrapR=Bn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Tr{constructor(e=0,t=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=r}static slerpFlat(e,t,i,r,o,a,c){let h=i[r+0],d=i[r+1],f=i[r+2],m=i[r+3];const _=o[a+0],x=o[a+1],y=o[a+2],w=o[a+3];if(c===0){e[t+0]=h,e[t+1]=d,e[t+2]=f,e[t+3]=m;return}if(c===1){e[t+0]=_,e[t+1]=x,e[t+2]=y,e[t+3]=w;return}if(m!==w||h!==_||d!==x||f!==y){let v=1-c;const g=h*_+d*x+f*y+m*w,R=g>=0?1:-1,E=1-g*g;if(E>Number.EPSILON){const F=Math.sqrt(E),L=Math.atan2(F,g*R);v=Math.sin(v*L)/F,c=Math.sin(c*L)/F}const S=c*R;if(h=h*v+_*S,d=d*v+x*S,f=f*v+y*S,m=m*v+w*S,v===1-c){const F=1/Math.sqrt(h*h+d*d+f*f+m*m);h*=F,d*=F,f*=F,m*=F}}e[t]=h,e[t+1]=d,e[t+2]=f,e[t+3]=m}static multiplyQuaternionsFlat(e,t,i,r,o,a){const c=i[r],h=i[r+1],d=i[r+2],f=i[r+3],m=o[a],_=o[a+1],x=o[a+2],y=o[a+3];return e[t]=c*y+f*m+h*x-d*_,e[t+1]=h*y+f*_+d*m-c*x,e[t+2]=d*y+f*x+c*_-h*m,e[t+3]=f*y-c*m-h*_-d*x,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,r){return this._x=e,this._y=t,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,r=e._y,o=e._z,a=e._order,c=Math.cos,h=Math.sin,d=c(i/2),f=c(r/2),m=c(o/2),_=h(i/2),x=h(r/2),y=h(o/2);switch(a){case"XYZ":this._x=_*f*m+d*x*y,this._y=d*x*m-_*f*y,this._z=d*f*y+_*x*m,this._w=d*f*m-_*x*y;break;case"YXZ":this._x=_*f*m+d*x*y,this._y=d*x*m-_*f*y,this._z=d*f*y-_*x*m,this._w=d*f*m+_*x*y;break;case"ZXY":this._x=_*f*m-d*x*y,this._y=d*x*m+_*f*y,this._z=d*f*y+_*x*m,this._w=d*f*m-_*x*y;break;case"ZYX":this._x=_*f*m-d*x*y,this._y=d*x*m+_*f*y,this._z=d*f*y-_*x*m,this._w=d*f*m+_*x*y;break;case"YZX":this._x=_*f*m+d*x*y,this._y=d*x*m+_*f*y,this._z=d*f*y-_*x*m,this._w=d*f*m-_*x*y;break;case"XZY":this._x=_*f*m-d*x*y,this._y=d*x*m-_*f*y,this._z=d*f*y+_*x*m,this._w=d*f*m+_*x*y;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],r=t[4],o=t[8],a=t[1],c=t[5],h=t[9],d=t[2],f=t[6],m=t[10],_=i+c+m;if(_>0){const x=.5/Math.sqrt(_+1);this._w=.25/x,this._x=(f-h)*x,this._y=(o-d)*x,this._z=(a-r)*x}else if(i>c&&i>m){const x=2*Math.sqrt(1+i-c-m);this._w=(f-h)/x,this._x=.25*x,this._y=(r+a)/x,this._z=(o+d)/x}else if(c>m){const x=2*Math.sqrt(1+c-i-m);this._w=(o-d)/x,this._x=(r+a)/x,this._y=.25*x,this._z=(h+f)/x}else{const x=2*Math.sqrt(1+m-i-c);this._w=(a-r)/x,this._x=(o+d)/x,this._y=(h+f)/x,this._z=.25*x}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(zt(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const r=Math.min(1,t/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,r=e._y,o=e._z,a=e._w,c=t._x,h=t._y,d=t._z,f=t._w;return this._x=i*f+a*c+r*d-o*h,this._y=r*f+a*h+o*c-i*d,this._z=o*f+a*d+i*h-r*c,this._w=a*f-i*c-r*h-o*d,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const i=this._x,r=this._y,o=this._z,a=this._w;let c=a*e._w+i*e._x+r*e._y+o*e._z;if(c<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,c=-c):this.copy(e),c>=1)return this._w=a,this._x=i,this._y=r,this._z=o,this;const h=1-c*c;if(h<=Number.EPSILON){const x=1-t;return this._w=x*a+t*this._w,this._x=x*i+t*this._x,this._y=x*r+t*this._y,this._z=x*o+t*this._z,this.normalize(),this}const d=Math.sqrt(h),f=Math.atan2(d,c),m=Math.sin((1-t)*f)/d,_=Math.sin(t*f)/d;return this._w=a*m+this._w*_,this._x=i*m+this._x*_,this._y=r*m+this._y*_,this._z=o*m+this._z*_,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=Math.random(),t=Math.sqrt(1-e),i=Math.sqrt(e),r=2*Math.PI*Math.random(),o=2*Math.PI*Math.random();return this.set(t*Math.cos(r),i*Math.sin(o),i*Math.cos(o),t*Math.sin(r))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class ${constructor(e=0,t=0,i=0){$.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(_f.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(_f.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,r=this.z,o=e.elements;return this.x=o[0]*t+o[3]*i+o[6]*r,this.y=o[1]*t+o[4]*i+o[7]*r,this.z=o[2]*t+o[5]*i+o[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,r=this.z,o=e.elements,a=1/(o[3]*t+o[7]*i+o[11]*r+o[15]);return this.x=(o[0]*t+o[4]*i+o[8]*r+o[12])*a,this.y=(o[1]*t+o[5]*i+o[9]*r+o[13])*a,this.z=(o[2]*t+o[6]*i+o[10]*r+o[14])*a,this}applyQuaternion(e){const t=this.x,i=this.y,r=this.z,o=e.x,a=e.y,c=e.z,h=e.w,d=2*(a*r-c*i),f=2*(c*t-o*r),m=2*(o*i-a*t);return this.x=t+h*d+a*m-c*f,this.y=i+h*f+c*d-o*m,this.z=r+h*m+o*f-a*d,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,r=this.z,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*r,this.y=o[1]*t+o[5]*i+o[9]*r,this.z=o[2]*t+o[6]*i+o[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,r=e.y,o=e.z,a=t.x,c=t.y,h=t.z;return this.x=r*h-o*c,this.y=o*a-i*h,this.z=i*c-r*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return pc.copy(this).projectOnVector(e),this.sub(pc)}reflect(e){return this.sub(pc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(zt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return t*t+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const r=Math.sin(t)*e;return this.x=r*Math.sin(i),this.y=Math.cos(t)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=(Math.random()-.5)*2,t=Math.random()*Math.PI*2,i=Math.sqrt(1-e**2);return this.x=i*Math.cos(t),this.y=i*Math.sin(t),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const pc=new $,_f=new Tr;class Rr{constructor(e=new $(1/0,1/0,1/0),t=new $(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Hn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Hn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=Hn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const o=i.getAttribute("position");if(t===!0&&o!==void 0&&e.isInstancedMesh!==!0)for(let a=0,c=o.count;a<c;a++)e.isMesh===!0?e.getVertexPosition(a,Hn):Hn.fromBufferAttribute(o,a),Hn.applyMatrix4(e.matrixWorld),this.expandByPoint(Hn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),$o.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),$o.copy(i.boundingBox)),$o.applyMatrix4(e.matrixWorld),this.union($o)}const r=e.children;for(let o=0,a=r.length;o<a;o++)this.expandByObject(r[o],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,Hn),Hn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter($s),Zo.subVectors(this.max,$s),Yr.subVectors(e.a,$s),Kr.subVectors(e.b,$s),$r.subVectors(e.c,$s),Ni.subVectors(Kr,Yr),Oi.subVectors($r,Kr),dr.subVectors(Yr,$r);let t=[0,-Ni.z,Ni.y,0,-Oi.z,Oi.y,0,-dr.z,dr.y,Ni.z,0,-Ni.x,Oi.z,0,-Oi.x,dr.z,0,-dr.x,-Ni.y,Ni.x,0,-Oi.y,Oi.x,0,-dr.y,dr.x,0];return!mc(t,Yr,Kr,$r,Zo)||(t=[1,0,0,0,1,0,0,0,1],!mc(t,Yr,Kr,$r,Zo))?!1:(Jo.crossVectors(Ni,Oi),t=[Jo.x,Jo.y,Jo.z],mc(t,Yr,Kr,$r,Zo))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Hn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Hn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(di[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),di[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),di[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),di[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),di[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),di[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),di[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),di[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(di),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const di=[new $,new $,new $,new $,new $,new $,new $,new $],Hn=new $,$o=new Rr,Yr=new $,Kr=new $,$r=new $,Ni=new $,Oi=new $,dr=new $,$s=new $,Zo=new $,Jo=new $,fr=new $;function mc(n,e,t,i,r){for(let o=0,a=n.length-3;o<=a;o+=3){fr.fromArray(n,o);const c=r.x*Math.abs(fr.x)+r.y*Math.abs(fr.y)+r.z*Math.abs(fr.z),h=e.dot(fr),d=t.dot(fr),f=i.dot(fr);if(Math.max(-Math.max(h,d,f),Math.min(h,d,f))>c)return!1}return!0}const gw=new Rr,Zs=new $,gc=new $;class fl{constructor(e=new $,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):gw.setFromPoints(e).getCenter(i);let r=0;for(let o=0,a=e.length;o<a;o++)r=Math.max(r,i.distanceToSquared(e[o]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Zs.subVectors(e,this.center);const t=Zs.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),r=(i-this.radius)*.5;this.center.addScaledVector(Zs,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(gc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Zs.copy(e.center).add(gc)),this.expandByPoint(Zs.copy(e.center).sub(gc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const fi=new $,vc=new $,Qo=new $,Fi=new $,_c=new $,ea=new $,xc=new $;class Zm{constructor(e=new $,t=new $(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,fi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=fi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(fi.copy(this.origin).addScaledVector(this.direction,t),fi.distanceToSquared(e))}distanceSqToSegment(e,t,i,r){vc.copy(e).add(t).multiplyScalar(.5),Qo.copy(t).sub(e).normalize(),Fi.copy(this.origin).sub(vc);const o=e.distanceTo(t)*.5,a=-this.direction.dot(Qo),c=Fi.dot(this.direction),h=-Fi.dot(Qo),d=Fi.lengthSq(),f=Math.abs(1-a*a);let m,_,x,y;if(f>0)if(m=a*h-c,_=a*c-h,y=o*f,m>=0)if(_>=-y)if(_<=y){const w=1/f;m*=w,_*=w,x=m*(m+a*_+2*c)+_*(a*m+_+2*h)+d}else _=o,m=Math.max(0,-(a*_+c)),x=-m*m+_*(_+2*h)+d;else _=-o,m=Math.max(0,-(a*_+c)),x=-m*m+_*(_+2*h)+d;else _<=-y?(m=Math.max(0,-(-a*o+c)),_=m>0?-o:Math.min(Math.max(-o,-h),o),x=-m*m+_*(_+2*h)+d):_<=y?(m=0,_=Math.min(Math.max(-o,-h),o),x=_*(_+2*h)+d):(m=Math.max(0,-(a*o+c)),_=m>0?o:Math.min(Math.max(-o,-h),o),x=-m*m+_*(_+2*h)+d);else _=a>0?-o:o,m=Math.max(0,-(a*_+c)),x=-m*m+_*(_+2*h)+d;return i&&i.copy(this.origin).addScaledVector(this.direction,m),r&&r.copy(vc).addScaledVector(Qo,_),x}intersectSphere(e,t){fi.subVectors(e.center,this.origin);const i=fi.dot(this.direction),r=fi.dot(fi)-i*i,o=e.radius*e.radius;if(r>o)return null;const a=Math.sqrt(o-r),c=i-a,h=i+a;return h<0?null:c<0?this.at(h,t):this.at(c,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,r,o,a,c,h;const d=1/this.direction.x,f=1/this.direction.y,m=1/this.direction.z,_=this.origin;return d>=0?(i=(e.min.x-_.x)*d,r=(e.max.x-_.x)*d):(i=(e.max.x-_.x)*d,r=(e.min.x-_.x)*d),f>=0?(o=(e.min.y-_.y)*f,a=(e.max.y-_.y)*f):(o=(e.max.y-_.y)*f,a=(e.min.y-_.y)*f),i>a||o>r||((o>i||isNaN(i))&&(i=o),(a<r||isNaN(r))&&(r=a),m>=0?(c=(e.min.z-_.z)*m,h=(e.max.z-_.z)*m):(c=(e.max.z-_.z)*m,h=(e.min.z-_.z)*m),i>h||c>r)||((c>i||i!==i)&&(i=c),(h<r||r!==r)&&(r=h),r<0)?null:this.at(i>=0?i:r,t)}intersectsBox(e){return this.intersectBox(e,fi)!==null}intersectTriangle(e,t,i,r,o){_c.subVectors(t,e),ea.subVectors(i,e),xc.crossVectors(_c,ea);let a=this.direction.dot(xc),c;if(a>0){if(r)return null;c=1}else if(a<0)c=-1,a=-a;else return null;Fi.subVectors(this.origin,e);const h=c*this.direction.dot(ea.crossVectors(Fi,ea));if(h<0)return null;const d=c*this.direction.dot(_c.cross(Fi));if(d<0||h+d>a)return null;const f=-c*Fi.dot(xc);return f<0?null:this.at(f/a,o)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ut{constructor(e,t,i,r,o,a,c,h,d,f,m,_,x,y,w,v){Ut.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,r,o,a,c,h,d,f,m,_,x,y,w,v)}set(e,t,i,r,o,a,c,h,d,f,m,_,x,y,w,v){const g=this.elements;return g[0]=e,g[4]=t,g[8]=i,g[12]=r,g[1]=o,g[5]=a,g[9]=c,g[13]=h,g[2]=d,g[6]=f,g[10]=m,g[14]=_,g[3]=x,g[7]=y,g[11]=w,g[15]=v,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ut().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,i=e.elements,r=1/Zr.setFromMatrixColumn(e,0).length(),o=1/Zr.setFromMatrixColumn(e,1).length(),a=1/Zr.setFromMatrixColumn(e,2).length();return t[0]=i[0]*r,t[1]=i[1]*r,t[2]=i[2]*r,t[3]=0,t[4]=i[4]*o,t[5]=i[5]*o,t[6]=i[6]*o,t[7]=0,t[8]=i[8]*a,t[9]=i[9]*a,t[10]=i[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,r=e.y,o=e.z,a=Math.cos(i),c=Math.sin(i),h=Math.cos(r),d=Math.sin(r),f=Math.cos(o),m=Math.sin(o);if(e.order==="XYZ"){const _=a*f,x=a*m,y=c*f,w=c*m;t[0]=h*f,t[4]=-h*m,t[8]=d,t[1]=x+y*d,t[5]=_-w*d,t[9]=-c*h,t[2]=w-_*d,t[6]=y+x*d,t[10]=a*h}else if(e.order==="YXZ"){const _=h*f,x=h*m,y=d*f,w=d*m;t[0]=_+w*c,t[4]=y*c-x,t[8]=a*d,t[1]=a*m,t[5]=a*f,t[9]=-c,t[2]=x*c-y,t[6]=w+_*c,t[10]=a*h}else if(e.order==="ZXY"){const _=h*f,x=h*m,y=d*f,w=d*m;t[0]=_-w*c,t[4]=-a*m,t[8]=y+x*c,t[1]=x+y*c,t[5]=a*f,t[9]=w-_*c,t[2]=-a*d,t[6]=c,t[10]=a*h}else if(e.order==="ZYX"){const _=a*f,x=a*m,y=c*f,w=c*m;t[0]=h*f,t[4]=y*d-x,t[8]=_*d+w,t[1]=h*m,t[5]=w*d+_,t[9]=x*d-y,t[2]=-d,t[6]=c*h,t[10]=a*h}else if(e.order==="YZX"){const _=a*h,x=a*d,y=c*h,w=c*d;t[0]=h*f,t[4]=w-_*m,t[8]=y*m+x,t[1]=m,t[5]=a*f,t[9]=-c*f,t[2]=-d*f,t[6]=x*m+y,t[10]=_-w*m}else if(e.order==="XZY"){const _=a*h,x=a*d,y=c*h,w=c*d;t[0]=h*f,t[4]=-m,t[8]=d*f,t[1]=_*m+w,t[5]=a*f,t[9]=x*m-y,t[2]=y*m-x,t[6]=c*f,t[10]=w*m+_}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(vw,e,_w)}lookAt(e,t,i){const r=this.elements;return En.subVectors(e,t),En.lengthSq()===0&&(En.z=1),En.normalize(),Bi.crossVectors(i,En),Bi.lengthSq()===0&&(Math.abs(i.z)===1?En.x+=1e-4:En.z+=1e-4,En.normalize(),Bi.crossVectors(i,En)),Bi.normalize(),ta.crossVectors(En,Bi),r[0]=Bi.x,r[4]=ta.x,r[8]=En.x,r[1]=Bi.y,r[5]=ta.y,r[9]=En.y,r[2]=Bi.z,r[6]=ta.z,r[10]=En.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,r=t.elements,o=this.elements,a=i[0],c=i[4],h=i[8],d=i[12],f=i[1],m=i[5],_=i[9],x=i[13],y=i[2],w=i[6],v=i[10],g=i[14],R=i[3],E=i[7],S=i[11],F=i[15],L=r[0],I=r[4],P=r[8],M=r[12],b=r[1],N=r[5],H=r[9],ae=r[13],V=r[2],J=r[6],q=r[10],ee=r[14],K=r[3],ue=r[7],de=r[11],we=r[15];return o[0]=a*L+c*b+h*V+d*K,o[4]=a*I+c*N+h*J+d*ue,o[8]=a*P+c*H+h*q+d*de,o[12]=a*M+c*ae+h*ee+d*we,o[1]=f*L+m*b+_*V+x*K,o[5]=f*I+m*N+_*J+x*ue,o[9]=f*P+m*H+_*q+x*de,o[13]=f*M+m*ae+_*ee+x*we,o[2]=y*L+w*b+v*V+g*K,o[6]=y*I+w*N+v*J+g*ue,o[10]=y*P+w*H+v*q+g*de,o[14]=y*M+w*ae+v*ee+g*we,o[3]=R*L+E*b+S*V+F*K,o[7]=R*I+E*N+S*J+F*ue,o[11]=R*P+E*H+S*q+F*de,o[15]=R*M+E*ae+S*ee+F*we,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],r=e[8],o=e[12],a=e[1],c=e[5],h=e[9],d=e[13],f=e[2],m=e[6],_=e[10],x=e[14],y=e[3],w=e[7],v=e[11],g=e[15];return y*(+o*h*m-r*d*m-o*c*_+i*d*_+r*c*x-i*h*x)+w*(+t*h*x-t*d*_+o*a*_-r*a*x+r*d*f-o*h*f)+v*(+t*d*m-t*c*x-o*a*m+i*a*x+o*c*f-i*d*f)+g*(-r*c*f-t*h*m+t*c*_+r*a*m-i*a*_+i*h*f)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],r=e[2],o=e[3],a=e[4],c=e[5],h=e[6],d=e[7],f=e[8],m=e[9],_=e[10],x=e[11],y=e[12],w=e[13],v=e[14],g=e[15],R=m*v*d-w*_*d+w*h*x-c*v*x-m*h*g+c*_*g,E=y*_*d-f*v*d-y*h*x+a*v*x+f*h*g-a*_*g,S=f*w*d-y*m*d+y*c*x-a*w*x-f*c*g+a*m*g,F=y*m*h-f*w*h-y*c*_+a*w*_+f*c*v-a*m*v,L=t*R+i*E+r*S+o*F;if(L===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const I=1/L;return e[0]=R*I,e[1]=(w*_*o-m*v*o-w*r*x+i*v*x+m*r*g-i*_*g)*I,e[2]=(c*v*o-w*h*o+w*r*d-i*v*d-c*r*g+i*h*g)*I,e[3]=(m*h*o-c*_*o-m*r*d+i*_*d+c*r*x-i*h*x)*I,e[4]=E*I,e[5]=(f*v*o-y*_*o+y*r*x-t*v*x-f*r*g+t*_*g)*I,e[6]=(y*h*o-a*v*o-y*r*d+t*v*d+a*r*g-t*h*g)*I,e[7]=(a*_*o-f*h*o+f*r*d-t*_*d-a*r*x+t*h*x)*I,e[8]=S*I,e[9]=(y*m*o-f*w*o-y*i*x+t*w*x+f*i*g-t*m*g)*I,e[10]=(a*w*o-y*c*o+y*i*d-t*w*d-a*i*g+t*c*g)*I,e[11]=(f*c*o-a*m*o-f*i*d+t*m*d+a*i*x-t*c*x)*I,e[12]=F*I,e[13]=(f*w*r-y*m*r+y*i*_-t*w*_-f*i*v+t*m*v)*I,e[14]=(y*c*r-a*w*r-y*i*h+t*w*h+a*i*v-t*c*v)*I,e[15]=(a*m*r-f*c*r+f*i*h-t*m*h-a*i*_+t*c*_)*I,this}scale(e){const t=this.elements,i=e.x,r=e.y,o=e.z;return t[0]*=i,t[4]*=r,t[8]*=o,t[1]*=i,t[5]*=r,t[9]*=o,t[2]*=i,t[6]*=r,t[10]*=o,t[3]*=i,t[7]*=r,t[11]*=o,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,r))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),r=Math.sin(t),o=1-i,a=e.x,c=e.y,h=e.z,d=o*a,f=o*c;return this.set(d*a+i,d*c-r*h,d*h+r*c,0,d*c+r*h,f*c+i,f*h-r*a,0,d*h-r*c,f*h+r*a,o*h*h+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,r,o,a){return this.set(1,i,o,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,i){const r=this.elements,o=t._x,a=t._y,c=t._z,h=t._w,d=o+o,f=a+a,m=c+c,_=o*d,x=o*f,y=o*m,w=a*f,v=a*m,g=c*m,R=h*d,E=h*f,S=h*m,F=i.x,L=i.y,I=i.z;return r[0]=(1-(w+g))*F,r[1]=(x+S)*F,r[2]=(y-E)*F,r[3]=0,r[4]=(x-S)*L,r[5]=(1-(_+g))*L,r[6]=(v+R)*L,r[7]=0,r[8]=(y+E)*I,r[9]=(v-R)*I,r[10]=(1-(_+w))*I,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,i){const r=this.elements;let o=Zr.set(r[0],r[1],r[2]).length();const a=Zr.set(r[4],r[5],r[6]).length(),c=Zr.set(r[8],r[9],r[10]).length();this.determinant()<0&&(o=-o),e.x=r[12],e.y=r[13],e.z=r[14],Gn.copy(this);const d=1/o,f=1/a,m=1/c;return Gn.elements[0]*=d,Gn.elements[1]*=d,Gn.elements[2]*=d,Gn.elements[4]*=f,Gn.elements[5]*=f,Gn.elements[6]*=f,Gn.elements[8]*=m,Gn.elements[9]*=m,Gn.elements[10]*=m,t.setFromRotationMatrix(Gn),i.x=o,i.y=a,i.z=c,this}makePerspective(e,t,i,r,o,a,c=yi){const h=this.elements,d=2*o/(t-e),f=2*o/(i-r),m=(t+e)/(t-e),_=(i+r)/(i-r);let x,y;if(c===yi)x=-(a+o)/(a-o),y=-2*a*o/(a-o);else if(c===Ya)x=-a/(a-o),y=-a*o/(a-o);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+c);return h[0]=d,h[4]=0,h[8]=m,h[12]=0,h[1]=0,h[5]=f,h[9]=_,h[13]=0,h[2]=0,h[6]=0,h[10]=x,h[14]=y,h[3]=0,h[7]=0,h[11]=-1,h[15]=0,this}makeOrthographic(e,t,i,r,o,a,c=yi){const h=this.elements,d=1/(t-e),f=1/(i-r),m=1/(a-o),_=(t+e)*d,x=(i+r)*f;let y,w;if(c===yi)y=(a+o)*m,w=-2*m;else if(c===Ya)y=o*m,w=-1*m;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+c);return h[0]=2*d,h[4]=0,h[8]=0,h[12]=-_,h[1]=0,h[5]=2*f,h[9]=0,h[13]=-x,h[2]=0,h[6]=0,h[10]=w,h[14]=-y,h[3]=0,h[7]=0,h[11]=0,h[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let r=0;r<16;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const Zr=new $,Gn=new Ut,vw=new $(0,0,0),_w=new $(1,1,1),Bi=new $,ta=new $,En=new $,xf=new Ut,bf=new Tr;class pl{constructor(e=0,t=0,i=0,r=pl.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,r=this._order){return this._x=e,this._y=t,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const r=e.elements,o=r[0],a=r[4],c=r[8],h=r[1],d=r[5],f=r[9],m=r[2],_=r[6],x=r[10];switch(t){case"XYZ":this._y=Math.asin(zt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-f,x),this._z=Math.atan2(-a,o)):(this._x=Math.atan2(_,d),this._z=0);break;case"YXZ":this._x=Math.asin(-zt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(c,x),this._z=Math.atan2(h,d)):(this._y=Math.atan2(-m,o),this._z=0);break;case"ZXY":this._x=Math.asin(zt(_,-1,1)),Math.abs(_)<.9999999?(this._y=Math.atan2(-m,x),this._z=Math.atan2(-a,d)):(this._y=0,this._z=Math.atan2(h,o));break;case"ZYX":this._y=Math.asin(-zt(m,-1,1)),Math.abs(m)<.9999999?(this._x=Math.atan2(_,x),this._z=Math.atan2(h,o)):(this._x=0,this._z=Math.atan2(-a,d));break;case"YZX":this._z=Math.asin(zt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(-f,d),this._y=Math.atan2(-m,o)):(this._x=0,this._y=Math.atan2(c,x));break;case"XZY":this._z=Math.asin(-zt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(_,d),this._y=Math.atan2(c,o)):(this._x=Math.atan2(-f,x),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return xf.makeRotationFromQuaternion(e),this.setFromRotationMatrix(xf,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return bf.setFromEuler(this),this.setFromQuaternion(bf,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}pl.DEFAULT_ORDER="XYZ";class Jm{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let xw=0;const yf=new $,Jr=new Tr,pi=new Ut,na=new $,Js=new $,bw=new $,yw=new Tr,wf=new $(1,0,0),Mf=new $(0,1,0),Ef=new $(0,0,1),ww={type:"added"},Mw={type:"removed"};class Rn extends Pr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:xw++}),this.uuid=ti(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Rn.DEFAULT_UP.clone();const e=new $,t=new pl,i=new Tr,r=new $(1,1,1);function o(){i.setFromEuler(t,!1)}function a(){t.setFromQuaternion(i,void 0,!1)}t._onChange(o),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new Ut},normalMatrix:{value:new ot}}),this.matrix=new Ut,this.matrixWorld=new Ut,this.matrixAutoUpdate=Rn.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Rn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Jm,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Jr.setFromAxisAngle(e,t),this.quaternion.multiply(Jr),this}rotateOnWorldAxis(e,t){return Jr.setFromAxisAngle(e,t),this.quaternion.premultiply(Jr),this}rotateX(e){return this.rotateOnAxis(wf,e)}rotateY(e){return this.rotateOnAxis(Mf,e)}rotateZ(e){return this.rotateOnAxis(Ef,e)}translateOnAxis(e,t){return yf.copy(e).applyQuaternion(this.quaternion),this.position.add(yf.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(wf,e)}translateY(e){return this.translateOnAxis(Mf,e)}translateZ(e){return this.translateOnAxis(Ef,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(pi.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?na.copy(e):na.set(e,t,i);const r=this.parent;this.updateWorldMatrix(!0,!1),Js.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?pi.lookAt(Js,na,this.up):pi.lookAt(na,Js,this.up),this.quaternion.setFromRotationMatrix(pi),r&&(pi.extractRotation(r.matrixWorld),Jr.setFromRotationMatrix(pi),this.quaternion.premultiply(Jr.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(ww)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Mw)),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),pi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),pi.multiply(e.parent.matrixWorld)),e.applyMatrix4(pi),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,r=this.children.length;i<r;i++){const a=this.children[i].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Js,e,bw),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Js,yw,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,r=t.length;i<r;i++){const o=t[i];(o.matrixWorldAutoUpdate===!0||e===!0)&&o.updateMatrixWorld(e)}}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.matrixWorldAutoUpdate===!0&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){const r=this.children;for(let o=0,a=r.length;o<a;o++){const c=r[o];c.matrixWorldAutoUpdate===!0&&c.updateWorldMatrix(!1,!0)}}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(c=>({boxInitialized:c.boxInitialized,boxMin:c.box.min.toArray(),boxMax:c.box.max.toArray(),sphereInitialized:c.sphereInitialized,sphereRadius:c.sphere.radius,sphereCenter:c.sphere.center.toArray()})),r.maxGeometryCount=this._maxGeometryCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function o(c,h){return c[h.uuid]===void 0&&(c[h.uuid]=h.toJSON(e)),h.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=o(e.geometries,this.geometry);const c=this.geometry.parameters;if(c!==void 0&&c.shapes!==void 0){const h=c.shapes;if(Array.isArray(h))for(let d=0,f=h.length;d<f;d++){const m=h[d];o(e.shapes,m)}else o(e.shapes,h)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(o(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const c=[];for(let h=0,d=this.material.length;h<d;h++)c.push(o(e.materials,this.material[h]));r.material=c}else r.material=o(e.materials,this.material);if(this.children.length>0){r.children=[];for(let c=0;c<this.children.length;c++)r.children.push(this.children[c].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let c=0;c<this.animations.length;c++){const h=this.animations[c];r.animations.push(o(e.animations,h))}}if(t){const c=a(e.geometries),h=a(e.materials),d=a(e.textures),f=a(e.images),m=a(e.shapes),_=a(e.skeletons),x=a(e.animations),y=a(e.nodes);c.length>0&&(i.geometries=c),h.length>0&&(i.materials=h),d.length>0&&(i.textures=d),f.length>0&&(i.images=f),m.length>0&&(i.shapes=m),_.length>0&&(i.skeletons=_),x.length>0&&(i.animations=x),y.length>0&&(i.nodes=y)}return i.object=r,i;function a(c){const h=[];for(const d in c){const f=c[d];delete f.metadata,h.push(f)}return h}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const r=e.children[i];this.add(r.clone())}return this}}Rn.DEFAULT_UP=new $(0,1,0);Rn.DEFAULT_MATRIX_AUTO_UPDATE=!0;Rn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Wn=new $,mi=new $,bc=new $,gi=new $,Qr=new $,es=new $,Sf=new $,yc=new $,wc=new $,Mc=new $;let ia=!1;class On{constructor(e=new $,t=new $,i=new $){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,r){r.subVectors(i,t),Wn.subVectors(e,t),r.cross(Wn);const o=r.lengthSq();return o>0?r.multiplyScalar(1/Math.sqrt(o)):r.set(0,0,0)}static getBarycoord(e,t,i,r,o){Wn.subVectors(r,t),mi.subVectors(i,t),bc.subVectors(e,t);const a=Wn.dot(Wn),c=Wn.dot(mi),h=Wn.dot(bc),d=mi.dot(mi),f=mi.dot(bc),m=a*d-c*c;if(m===0)return o.set(0,0,0),null;const _=1/m,x=(d*h-c*f)*_,y=(a*f-c*h)*_;return o.set(1-x-y,y,x)}static containsPoint(e,t,i,r){return this.getBarycoord(e,t,i,r,gi)===null?!1:gi.x>=0&&gi.y>=0&&gi.x+gi.y<=1}static getUV(e,t,i,r,o,a,c,h){return ia===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),ia=!0),this.getInterpolation(e,t,i,r,o,a,c,h)}static getInterpolation(e,t,i,r,o,a,c,h){return this.getBarycoord(e,t,i,r,gi)===null?(h.x=0,h.y=0,"z"in h&&(h.z=0),"w"in h&&(h.w=0),null):(h.setScalar(0),h.addScaledVector(o,gi.x),h.addScaledVector(a,gi.y),h.addScaledVector(c,gi.z),h)}static isFrontFacing(e,t,i,r){return Wn.subVectors(i,t),mi.subVectors(e,t),Wn.cross(mi).dot(r)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,r){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,i,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Wn.subVectors(this.c,this.b),mi.subVectors(this.a,this.b),Wn.cross(mi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return On.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return On.getBarycoord(e,this.a,this.b,this.c,t)}getUV(e,t,i,r,o){return ia===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),ia=!0),On.getInterpolation(e,this.a,this.b,this.c,t,i,r,o)}getInterpolation(e,t,i,r,o){return On.getInterpolation(e,this.a,this.b,this.c,t,i,r,o)}containsPoint(e){return On.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return On.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,r=this.b,o=this.c;let a,c;Qr.subVectors(r,i),es.subVectors(o,i),yc.subVectors(e,i);const h=Qr.dot(yc),d=es.dot(yc);if(h<=0&&d<=0)return t.copy(i);wc.subVectors(e,r);const f=Qr.dot(wc),m=es.dot(wc);if(f>=0&&m<=f)return t.copy(r);const _=h*m-f*d;if(_<=0&&h>=0&&f<=0)return a=h/(h-f),t.copy(i).addScaledVector(Qr,a);Mc.subVectors(e,o);const x=Qr.dot(Mc),y=es.dot(Mc);if(y>=0&&x<=y)return t.copy(o);const w=x*d-h*y;if(w<=0&&d>=0&&y<=0)return c=d/(d-y),t.copy(i).addScaledVector(es,c);const v=f*y-x*m;if(v<=0&&m-f>=0&&x-y>=0)return Sf.subVectors(o,r),c=(m-f)/(m-f+(x-y)),t.copy(r).addScaledVector(Sf,c);const g=1/(v+w+_);return a=w*g,c=_*g,t.copy(i).addScaledVector(Qr,a).addScaledVector(es,c)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Qm={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ki={h:0,s:0,l:0},ra={h:0,s:0,l:0};function Ec(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class lt{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Qt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,wt.toWorkingColorSpace(this,t),this}setRGB(e,t,i,r=wt.workingColorSpace){return this.r=e,this.g=t,this.b=i,wt.toWorkingColorSpace(this,r),this}setHSL(e,t,i,r=wt.workingColorSpace){if(e=Hu(e,1),t=zt(t,0,1),i=zt(i,0,1),t===0)this.r=this.g=this.b=i;else{const o=i<=.5?i*(1+t):i+t-i*t,a=2*i-o;this.r=Ec(a,o,e+1/3),this.g=Ec(a,o,e),this.b=Ec(a,o,e-1/3)}return wt.toWorkingColorSpace(this,r),this}setStyle(e,t=Qt){function i(o){o!==void 0&&parseFloat(o)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let o;const a=r[1],c=r[2];switch(a){case"rgb":case"rgba":if(o=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(c))return i(o[4]),this.setRGB(Math.min(255,parseInt(o[1],10))/255,Math.min(255,parseInt(o[2],10))/255,Math.min(255,parseInt(o[3],10))/255,t);if(o=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(c))return i(o[4]),this.setRGB(Math.min(100,parseInt(o[1],10))/100,Math.min(100,parseInt(o[2],10))/100,Math.min(100,parseInt(o[3],10))/100,t);break;case"hsl":case"hsla":if(o=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(c))return i(o[4]),this.setHSL(parseFloat(o[1])/360,parseFloat(o[2])/100,parseFloat(o[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const o=r[1],a=o.length;if(a===3)return this.setRGB(parseInt(o.charAt(0),16)/15,parseInt(o.charAt(1),16)/15,parseInt(o.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(o,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Qt){const i=Qm[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=bs(e.r),this.g=bs(e.g),this.b=bs(e.b),this}copyLinearToSRGB(e){return this.r=dc(e.r),this.g=dc(e.g),this.b=dc(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Qt){return wt.fromWorkingColorSpace(sn.copy(this),e),Math.round(zt(sn.r*255,0,255))*65536+Math.round(zt(sn.g*255,0,255))*256+Math.round(zt(sn.b*255,0,255))}getHexString(e=Qt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=wt.workingColorSpace){wt.fromWorkingColorSpace(sn.copy(this),t);const i=sn.r,r=sn.g,o=sn.b,a=Math.max(i,r,o),c=Math.min(i,r,o);let h,d;const f=(c+a)/2;if(c===a)h=0,d=0;else{const m=a-c;switch(d=f<=.5?m/(a+c):m/(2-a-c),a){case i:h=(r-o)/m+(r<o?6:0);break;case r:h=(o-i)/m+2;break;case o:h=(i-r)/m+4;break}h/=6}return e.h=h,e.s=d,e.l=f,e}getRGB(e,t=wt.workingColorSpace){return wt.fromWorkingColorSpace(sn.copy(this),t),e.r=sn.r,e.g=sn.g,e.b=sn.b,e}getStyle(e=Qt){wt.fromWorkingColorSpace(sn.copy(this),e);const t=sn.r,i=sn.g,r=sn.b;return e!==Qt?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,t,i){return this.getHSL(ki),this.setHSL(ki.h+e,ki.s+t,ki.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(ki),e.getHSL(ra);const i=ho(ki.h,ra.h,t),r=ho(ki.s,ra.s,t),o=ho(ki.l,ra.l,t);return this.setHSL(i,r,o),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,r=this.b,o=e.elements;return this.r=o[0]*t+o[3]*i+o[6]*r,this.g=o[1]*t+o[4]*i+o[7]*r,this.b=o[2]*t+o[5]*i+o[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const sn=new lt;lt.NAMES=Qm;let Ew=0;class ml extends Pr{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ew++}),this.uuid=ti(),this.name="",this.type="Material",this.blending=xs,this.side=tr,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=iu,this.blendDst=ru,this.blendEquation=_r,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new lt(0,0,0),this.blendAlpha=0,this.depthFunc=Ha,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=df,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Xr,this.stencilZFail=Xr,this.stencilZPass=Xr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==xs&&(i.blending=this.blending),this.side!==tr&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==iu&&(i.blendSrc=this.blendSrc),this.blendDst!==ru&&(i.blendDst=this.blendDst),this.blendEquation!==_r&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==Ha&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==df&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Xr&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Xr&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Xr&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(o){const a=[];for(const c in o){const h=o[c];delete h.metadata,a.push(h)}return a}if(t){const o=r(e.textures),a=r(e.images);o.length>0&&(i.textures=o),a.length>0&&(i.images=a)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const r=t.length;i=new Array(r);for(let o=0;o!==r;++o)i[o]=t[o].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Gu extends ml{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new lt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Nm,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const kt=new $,sa=new Oe;class mn{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=lu,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=qi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let r=0,o=this.itemSize;r<o;r++)this.array[e+r]=t.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)sa.fromBufferAttribute(this,t),sa.applyMatrix3(e),this.setXY(t,sa.x,sa.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)kt.fromBufferAttribute(this,t),kt.applyMatrix3(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)kt.fromBufferAttribute(this,t),kt.applyMatrix4(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)kt.fromBufferAttribute(this,t),kt.applyNormalMatrix(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)kt.fromBufferAttribute(this,t),kt.transformDirection(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Zn(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=bt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Zn(t,this.array)),t}setX(e,t){return this.normalized&&(t=bt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Zn(t,this.array)),t}setY(e,t){return this.normalized&&(t=bt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Zn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=bt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Zn(t,this.array)),t}setW(e,t){return this.normalized&&(t=bt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=bt(t,this.array),i=bt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,r){return e*=this.itemSize,this.normalized&&(t=bt(t,this.array),i=bt(i,this.array),r=bt(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,t,i,r,o){return e*=this.itemSize,this.normalized&&(t=bt(t,this.array),i=bt(i,this.array),r=bt(r,this.array),o=bt(o,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=o,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==lu&&(e.usage=this.usage),e}}class eg extends mn{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class tg extends mn{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class Sr extends mn{constructor(e,t,i){super(new Float32Array(e),t,i)}}let Sw=0;const Un=new Ut,Sc=new Rn,ts=new $,Sn=new Rr,Qs=new Rr,Kt=new $;class ir extends Pr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Sw++}),this.uuid=ti(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(qm(e)?tg:eg)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const o=new ot().getNormalMatrix(e);i.applyNormalMatrix(o),i.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Un.makeRotationFromQuaternion(e),this.applyMatrix4(Un),this}rotateX(e){return Un.makeRotationX(e),this.applyMatrix4(Un),this}rotateY(e){return Un.makeRotationY(e),this.applyMatrix4(Un),this}rotateZ(e){return Un.makeRotationZ(e),this.applyMatrix4(Un),this}translate(e,t,i){return Un.makeTranslation(e,t,i),this.applyMatrix4(Un),this}scale(e,t,i){return Un.makeScale(e,t,i),this.applyMatrix4(Un),this}lookAt(e){return Sc.lookAt(e),Sc.updateMatrix(),this.applyMatrix4(Sc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ts).negate(),this.translate(ts.x,ts.y,ts.z),this}setFromPoints(e){const t=[];for(let i=0,r=e.length;i<r;i++){const o=e[i];t.push(o.x,o.y,o.z||0)}return this.setAttribute("position",new Sr(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Rr);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new $(-1/0,-1/0,-1/0),new $(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,r=t.length;i<r;i++){const o=t[i];Sn.setFromBufferAttribute(o),this.morphTargetsRelative?(Kt.addVectors(this.boundingBox.min,Sn.min),this.boundingBox.expandByPoint(Kt),Kt.addVectors(this.boundingBox.max,Sn.max),this.boundingBox.expandByPoint(Kt)):(this.boundingBox.expandByPoint(Sn.min),this.boundingBox.expandByPoint(Sn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new fl);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new $,1/0);return}if(e){const i=this.boundingSphere.center;if(Sn.setFromBufferAttribute(e),t)for(let o=0,a=t.length;o<a;o++){const c=t[o];Qs.setFromBufferAttribute(c),this.morphTargetsRelative?(Kt.addVectors(Sn.min,Qs.min),Sn.expandByPoint(Kt),Kt.addVectors(Sn.max,Qs.max),Sn.expandByPoint(Kt)):(Sn.expandByPoint(Qs.min),Sn.expandByPoint(Qs.max))}Sn.getCenter(i);let r=0;for(let o=0,a=e.count;o<a;o++)Kt.fromBufferAttribute(e,o),r=Math.max(r,i.distanceToSquared(Kt));if(t)for(let o=0,a=t.length;o<a;o++){const c=t[o],h=this.morphTargetsRelative;for(let d=0,f=c.count;d<f;d++)Kt.fromBufferAttribute(c,d),h&&(ts.fromBufferAttribute(e,d),Kt.add(ts)),r=Math.max(r,i.distanceToSquared(Kt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=e.array,r=t.position.array,o=t.normal.array,a=t.uv.array,c=r.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new mn(new Float32Array(4*c),4));const h=this.getAttribute("tangent").array,d=[],f=[];for(let b=0;b<c;b++)d[b]=new $,f[b]=new $;const m=new $,_=new $,x=new $,y=new Oe,w=new Oe,v=new Oe,g=new $,R=new $;function E(b,N,H){m.fromArray(r,b*3),_.fromArray(r,N*3),x.fromArray(r,H*3),y.fromArray(a,b*2),w.fromArray(a,N*2),v.fromArray(a,H*2),_.sub(m),x.sub(m),w.sub(y),v.sub(y);const ae=1/(w.x*v.y-v.x*w.y);isFinite(ae)&&(g.copy(_).multiplyScalar(v.y).addScaledVector(x,-w.y).multiplyScalar(ae),R.copy(x).multiplyScalar(w.x).addScaledVector(_,-v.x).multiplyScalar(ae),d[b].add(g),d[N].add(g),d[H].add(g),f[b].add(R),f[N].add(R),f[H].add(R))}let S=this.groups;S.length===0&&(S=[{start:0,count:i.length}]);for(let b=0,N=S.length;b<N;++b){const H=S[b],ae=H.start,V=H.count;for(let J=ae,q=ae+V;J<q;J+=3)E(i[J+0],i[J+1],i[J+2])}const F=new $,L=new $,I=new $,P=new $;function M(b){I.fromArray(o,b*3),P.copy(I);const N=d[b];F.copy(N),F.sub(I.multiplyScalar(I.dot(N))).normalize(),L.crossVectors(P,N);const ae=L.dot(f[b])<0?-1:1;h[b*4]=F.x,h[b*4+1]=F.y,h[b*4+2]=F.z,h[b*4+3]=ae}for(let b=0,N=S.length;b<N;++b){const H=S[b],ae=H.start,V=H.count;for(let J=ae,q=ae+V;J<q;J+=3)M(i[J+0]),M(i[J+1]),M(i[J+2])}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new mn(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let _=0,x=i.count;_<x;_++)i.setXYZ(_,0,0,0);const r=new $,o=new $,a=new $,c=new $,h=new $,d=new $,f=new $,m=new $;if(e)for(let _=0,x=e.count;_<x;_+=3){const y=e.getX(_+0),w=e.getX(_+1),v=e.getX(_+2);r.fromBufferAttribute(t,y),o.fromBufferAttribute(t,w),a.fromBufferAttribute(t,v),f.subVectors(a,o),m.subVectors(r,o),f.cross(m),c.fromBufferAttribute(i,y),h.fromBufferAttribute(i,w),d.fromBufferAttribute(i,v),c.add(f),h.add(f),d.add(f),i.setXYZ(y,c.x,c.y,c.z),i.setXYZ(w,h.x,h.y,h.z),i.setXYZ(v,d.x,d.y,d.z)}else for(let _=0,x=t.count;_<x;_+=3)r.fromBufferAttribute(t,_+0),o.fromBufferAttribute(t,_+1),a.fromBufferAttribute(t,_+2),f.subVectors(a,o),m.subVectors(r,o),f.cross(m),i.setXYZ(_+0,f.x,f.y,f.z),i.setXYZ(_+1,f.x,f.y,f.z),i.setXYZ(_+2,f.x,f.y,f.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Kt.fromBufferAttribute(e,t),Kt.normalize(),e.setXYZ(t,Kt.x,Kt.y,Kt.z)}toNonIndexed(){function e(c,h){const d=c.array,f=c.itemSize,m=c.normalized,_=new d.constructor(h.length*f);let x=0,y=0;for(let w=0,v=h.length;w<v;w++){c.isInterleavedBufferAttribute?x=h[w]*c.data.stride+c.offset:x=h[w]*f;for(let g=0;g<f;g++)_[y++]=d[x++]}return new mn(_,f,m)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new ir,i=this.index.array,r=this.attributes;for(const c in r){const h=r[c],d=e(h,i);t.setAttribute(c,d)}const o=this.morphAttributes;for(const c in o){const h=[],d=o[c];for(let f=0,m=d.length;f<m;f++){const _=d[f],x=e(_,i);h.push(x)}t.morphAttributes[c]=h}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let c=0,h=a.length;c<h;c++){const d=a[c];t.addGroup(d.start,d.count,d.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const h=this.parameters;for(const d in h)h[d]!==void 0&&(e[d]=h[d]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const h in i){const d=i[h];e.data.attributes[h]=d.toJSON(e.data)}const r={};let o=!1;for(const h in this.morphAttributes){const d=this.morphAttributes[h],f=[];for(let m=0,_=d.length;m<_;m++){const x=d[m];f.push(x.toJSON(e.data))}f.length>0&&(r[h]=f,o=!0)}o&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const c=this.boundingSphere;return c!==null&&(e.data.boundingSphere={center:c.center.toArray(),radius:c.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone(t));const r=e.attributes;for(const d in r){const f=r[d];this.setAttribute(d,f.clone(t))}const o=e.morphAttributes;for(const d in o){const f=[],m=o[d];for(let _=0,x=m.length;_<x;_++)f.push(m[_].clone(t));this.morphAttributes[d]=f}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let d=0,f=a.length;d<f;d++){const m=a[d];this.addGroup(m.start,m.count,m.materialIndex)}const c=e.boundingBox;c!==null&&(this.boundingBox=c.clone());const h=e.boundingSphere;return h!==null&&(this.boundingSphere=h.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Tf=new Ut,pr=new Zm,oa=new fl,Cf=new $,ns=new $,is=new $,rs=new $,Tc=new $,aa=new $,la=new Oe,ca=new Oe,ua=new Oe,Af=new $,Pf=new $,Rf=new $,ha=new $,da=new $;class gn extends Rn{constructor(e=new ir,t=new Gu){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let o=0,a=r.length;o<a;o++){const c=r[o].name||String(o);this.morphTargetInfluences.push(0),this.morphTargetDictionary[c]=o}}}}getVertexPosition(e,t){const i=this.geometry,r=i.attributes.position,o=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(r,e);const c=this.morphTargetInfluences;if(o&&c){aa.set(0,0,0);for(let h=0,d=o.length;h<d;h++){const f=c[h],m=o[h];f!==0&&(Tc.fromBufferAttribute(m,e),a?aa.addScaledVector(Tc,f):aa.addScaledVector(Tc.sub(t),f))}t.add(aa)}return t}raycast(e,t){const i=this.geometry,r=this.material,o=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),oa.copy(i.boundingSphere),oa.applyMatrix4(o),pr.copy(e.ray).recast(e.near),!(oa.containsPoint(pr.origin)===!1&&(pr.intersectSphere(oa,Cf)===null||pr.origin.distanceToSquared(Cf)>(e.far-e.near)**2))&&(Tf.copy(o).invert(),pr.copy(e.ray).applyMatrix4(Tf),!(i.boundingBox!==null&&pr.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,pr)))}_computeIntersections(e,t,i){let r;const o=this.geometry,a=this.material,c=o.index,h=o.attributes.position,d=o.attributes.uv,f=o.attributes.uv1,m=o.attributes.normal,_=o.groups,x=o.drawRange;if(c!==null)if(Array.isArray(a))for(let y=0,w=_.length;y<w;y++){const v=_[y],g=a[v.materialIndex],R=Math.max(v.start,x.start),E=Math.min(c.count,Math.min(v.start+v.count,x.start+x.count));for(let S=R,F=E;S<F;S+=3){const L=c.getX(S),I=c.getX(S+1),P=c.getX(S+2);r=fa(this,g,e,i,d,f,m,L,I,P),r&&(r.faceIndex=Math.floor(S/3),r.face.materialIndex=v.materialIndex,t.push(r))}}else{const y=Math.max(0,x.start),w=Math.min(c.count,x.start+x.count);for(let v=y,g=w;v<g;v+=3){const R=c.getX(v),E=c.getX(v+1),S=c.getX(v+2);r=fa(this,a,e,i,d,f,m,R,E,S),r&&(r.faceIndex=Math.floor(v/3),t.push(r))}}else if(h!==void 0)if(Array.isArray(a))for(let y=0,w=_.length;y<w;y++){const v=_[y],g=a[v.materialIndex],R=Math.max(v.start,x.start),E=Math.min(h.count,Math.min(v.start+v.count,x.start+x.count));for(let S=R,F=E;S<F;S+=3){const L=S,I=S+1,P=S+2;r=fa(this,g,e,i,d,f,m,L,I,P),r&&(r.faceIndex=Math.floor(S/3),r.face.materialIndex=v.materialIndex,t.push(r))}}else{const y=Math.max(0,x.start),w=Math.min(h.count,x.start+x.count);for(let v=y,g=w;v<g;v+=3){const R=v,E=v+1,S=v+2;r=fa(this,a,e,i,d,f,m,R,E,S),r&&(r.faceIndex=Math.floor(v/3),t.push(r))}}}}function Tw(n,e,t,i,r,o,a,c){let h;if(e.side===vn?h=i.intersectTriangle(a,o,r,!0,c):h=i.intersectTriangle(r,o,a,e.side===tr,c),h===null)return null;da.copy(c),da.applyMatrix4(n.matrixWorld);const d=t.ray.origin.distanceTo(da);return d<t.near||d>t.far?null:{distance:d,point:da.clone(),object:n}}function fa(n,e,t,i,r,o,a,c,h,d){n.getVertexPosition(c,ns),n.getVertexPosition(h,is),n.getVertexPosition(d,rs);const f=Tw(n,e,t,i,ns,is,rs,ha);if(f){r&&(la.fromBufferAttribute(r,c),ca.fromBufferAttribute(r,h),ua.fromBufferAttribute(r,d),f.uv=On.getInterpolation(ha,ns,is,rs,la,ca,ua,new Oe)),o&&(la.fromBufferAttribute(o,c),ca.fromBufferAttribute(o,h),ua.fromBufferAttribute(o,d),f.uv1=On.getInterpolation(ha,ns,is,rs,la,ca,ua,new Oe),f.uv2=f.uv1),a&&(Af.fromBufferAttribute(a,c),Pf.fromBufferAttribute(a,h),Rf.fromBufferAttribute(a,d),f.normal=On.getInterpolation(ha,ns,is,rs,Af,Pf,Rf,new $),f.normal.dot(i.direction)>0&&f.normal.multiplyScalar(-1));const m={a:c,b:h,c:d,normal:new $,materialIndex:0};On.getNormal(ns,is,rs,m.normal),f.face=m}return f}class As extends ir{constructor(e=1,t=1,i=1,r=1,o=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:r,heightSegments:o,depthSegments:a};const c=this;r=Math.floor(r),o=Math.floor(o),a=Math.floor(a);const h=[],d=[],f=[],m=[];let _=0,x=0;y("z","y","x",-1,-1,i,t,e,a,o,0),y("z","y","x",1,-1,i,t,-e,a,o,1),y("x","z","y",1,1,e,i,t,r,a,2),y("x","z","y",1,-1,e,i,-t,r,a,3),y("x","y","z",1,-1,e,t,i,r,o,4),y("x","y","z",-1,-1,e,t,-i,r,o,5),this.setIndex(h),this.setAttribute("position",new Sr(d,3)),this.setAttribute("normal",new Sr(f,3)),this.setAttribute("uv",new Sr(m,2));function y(w,v,g,R,E,S,F,L,I,P,M){const b=S/I,N=F/P,H=S/2,ae=F/2,V=L/2,J=I+1,q=P+1;let ee=0,K=0;const ue=new $;for(let de=0;de<q;de++){const we=de*N-ae;for(let be=0;be<J;be++){const fe=be*b-H;ue[w]=fe*R,ue[v]=we*E,ue[g]=V,d.push(ue.x,ue.y,ue.z),ue[w]=0,ue[v]=0,ue[g]=L>0?1:-1,f.push(ue.x,ue.y,ue.z),m.push(be/I),m.push(1-de/P),ee+=1}}for(let de=0;de<P;de++)for(let we=0;we<I;we++){const be=_+we+J*de,fe=_+we+J*(de+1),ce=_+(we+1)+J*(de+1),Me=_+(we+1)+J*de;h.push(be,fe,Me),h.push(fe,ce,Me),K+=6}c.addGroup(x,K,M),x+=K,_+=ee}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new As(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Cs(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const r=n[t][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=r.clone():Array.isArray(r)?e[t][i]=r.slice():e[t][i]=r}}return e}function dn(n){const e={};for(let t=0;t<n.length;t++){const i=Cs(n[t]);for(const r in i)e[r]=i[r]}return e}function Cw(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function ng(n){return n.getRenderTarget()===null?n.outputColorSpace:wt.workingColorSpace}const gl={clone:Cs,merge:dn};var Aw=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Pw=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class wn extends ml{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Aw,this.fragmentShader=Pw,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Cs(e.uniforms),this.uniformsGroups=Cw(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const r in this.uniforms){const a=this.uniforms[r].value;a&&a.isTexture?t.uniforms[r]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[r]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[r]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[r]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[r]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[r]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[r]={type:"m4",value:a.toArray()}:t.uniforms[r]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class ig extends Rn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ut,this.projectionMatrix=new Ut,this.projectionMatrixInverse=new Ut,this.coordinateSystem=yi}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}class Ht extends ig{constructor(e=50,t=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Mo*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(uo*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Mo*2*Math.atan(Math.tan(uo*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,t,i,r,o,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=o,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(uo*.5*this.fov)/this.zoom,i=2*t,r=this.aspect*i,o=-.5*r;const a=this.view;if(this.view!==null&&this.view.enabled){const h=a.fullWidth,d=a.fullHeight;o+=a.offsetX*r/h,t-=a.offsetY*i/d,r*=a.width/h,i*=a.height/d}const c=this.filmOffset;c!==0&&(o+=e*c/this.getFilmWidth()),this.projectionMatrix.makePerspective(o,o+r,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const ss=-90,os=1;class Rw extends Rn{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new Ht(ss,os,e,t);r.layers=this.layers,this.add(r);const o=new Ht(ss,os,e,t);o.layers=this.layers,this.add(o);const a=new Ht(ss,os,e,t);a.layers=this.layers,this.add(a);const c=new Ht(ss,os,e,t);c.layers=this.layers,this.add(c);const h=new Ht(ss,os,e,t);h.layers=this.layers,this.add(h);const d=new Ht(ss,os,e,t);d.layers=this.layers,this.add(d)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,r,o,a,c,h]=t;for(const d of t)this.remove(d);if(e===yi)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),o.up.set(0,0,-1),o.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),c.up.set(0,1,0),c.lookAt(0,0,1),h.up.set(0,1,0),h.lookAt(0,0,-1);else if(e===Ya)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),o.up.set(0,0,1),o.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),c.up.set(0,-1,0),c.lookAt(0,0,1),h.up.set(0,-1,0),h.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const d of t)this.add(d),d.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[o,a,c,h,d,f]=this.children,m=e.getRenderTarget(),_=e.getActiveCubeFace(),x=e.getActiveMipmapLevel(),y=e.xr.enabled;e.xr.enabled=!1;const w=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(t,o),e.setRenderTarget(i,1,r),e.render(t,a),e.setRenderTarget(i,2,r),e.render(t,c),e.setRenderTarget(i,3,r),e.render(t,h),e.setRenderTarget(i,4,r),e.render(t,d),i.texture.generateMipmaps=w,e.setRenderTarget(i,5,r),e.render(t,f),e.setRenderTarget(m,_,x),e.xr.enabled=y,i.texture.needsPMREMUpdate=!0}}class rg extends tn{constructor(e,t,i,r,o,a,c,h,d,f){e=e!==void 0?e:[],t=t!==void 0?t:ws,super(e,t,i,r,o,a,c,h,d,f),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Lw extends ii{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];t.encoding!==void 0&&(fo("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),t.colorSpace=t.encoding===Er?Qt:Vn),this.texture=new rg(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Cn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new As(5,5,5),o=new wn({name:"CubemapFromEquirect",uniforms:Cs(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:vn,blending:$i});o.uniforms.tEquirect.value=t;const a=new gn(r,o),c=t.minFilter;return t.minFilter===Es&&(t.minFilter=Cn),new Rw(1,10,this).update(e,a),t.minFilter=c,a.geometry.dispose(),a.material.dispose(),this}clear(e,t,i,r){const o=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,r);e.setRenderTarget(o)}}const Cc=new $,Iw=new $,Dw=new ot;class xi{constructor(e=new $(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,r){return this.normal.set(e,t,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const r=Cc.subVectors(i,t).cross(Iw.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(Cc),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const o=-(e.start.dot(this.normal)+this.constant)/r;return o<0||o>1?null:t.copy(e.start).addScaledVector(i,o)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||Dw.getNormalMatrix(e),r=this.coplanarPoint(Cc).applyMatrix4(e),o=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(o),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const mr=new fl,pa=new $;class sg{constructor(e=new xi,t=new xi,i=new xi,r=new xi,o=new xi,a=new xi){this.planes=[e,t,i,r,o,a]}set(e,t,i,r,o,a){const c=this.planes;return c[0].copy(e),c[1].copy(t),c[2].copy(i),c[3].copy(r),c[4].copy(o),c[5].copy(a),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=yi){const i=this.planes,r=e.elements,o=r[0],a=r[1],c=r[2],h=r[3],d=r[4],f=r[5],m=r[6],_=r[7],x=r[8],y=r[9],w=r[10],v=r[11],g=r[12],R=r[13],E=r[14],S=r[15];if(i[0].setComponents(h-o,_-d,v-x,S-g).normalize(),i[1].setComponents(h+o,_+d,v+x,S+g).normalize(),i[2].setComponents(h+a,_+f,v+y,S+R).normalize(),i[3].setComponents(h-a,_-f,v-y,S-R).normalize(),i[4].setComponents(h-c,_-m,v-w,S-E).normalize(),t===yi)i[5].setComponents(h+c,_+m,v+w,S+E).normalize();else if(t===Ya)i[5].setComponents(c,m,w,E).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),mr.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),mr.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(mr)}intersectsSprite(e){return mr.center.set(0,0,0),mr.radius=.7071067811865476,mr.applyMatrix4(e.matrixWorld),this.intersectsSphere(mr)}intersectsSphere(e){const t=this.planes,i=e.center,r=-e.radius;for(let o=0;o<6;o++)if(t[o].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const r=t[i];if(pa.x=r.normal.x>0?e.max.x:e.min.x,pa.y=r.normal.y>0?e.max.y:e.min.y,pa.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(pa)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function og(){let n=null,e=!1,t=null,i=null;function r(o,a){t(o,a),i=n.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(r),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(o){t=o},setContext:function(o){n=o}}}function Uw(n,e){const t=e.isWebGL2,i=new WeakMap;function r(d,f){const m=d.array,_=d.usage,x=m.byteLength,y=n.createBuffer();n.bindBuffer(f,y),n.bufferData(f,m,_),d.onUploadCallback();let w;if(m instanceof Float32Array)w=n.FLOAT;else if(m instanceof Uint16Array)if(d.isFloat16BufferAttribute)if(t)w=n.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else w=n.UNSIGNED_SHORT;else if(m instanceof Int16Array)w=n.SHORT;else if(m instanceof Uint32Array)w=n.UNSIGNED_INT;else if(m instanceof Int32Array)w=n.INT;else if(m instanceof Int8Array)w=n.BYTE;else if(m instanceof Uint8Array)w=n.UNSIGNED_BYTE;else if(m instanceof Uint8ClampedArray)w=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+m);return{buffer:y,type:w,bytesPerElement:m.BYTES_PER_ELEMENT,version:d.version,size:x}}function o(d,f,m){const _=f.array,x=f._updateRange,y=f.updateRanges;if(n.bindBuffer(m,d),x.count===-1&&y.length===0&&n.bufferSubData(m,0,_),y.length!==0){for(let w=0,v=y.length;w<v;w++){const g=y[w];t?n.bufferSubData(m,g.start*_.BYTES_PER_ELEMENT,_,g.start,g.count):n.bufferSubData(m,g.start*_.BYTES_PER_ELEMENT,_.subarray(g.start,g.start+g.count))}f.clearUpdateRanges()}x.count!==-1&&(t?n.bufferSubData(m,x.offset*_.BYTES_PER_ELEMENT,_,x.offset,x.count):n.bufferSubData(m,x.offset*_.BYTES_PER_ELEMENT,_.subarray(x.offset,x.offset+x.count)),x.count=-1),f.onUploadCallback()}function a(d){return d.isInterleavedBufferAttribute&&(d=d.data),i.get(d)}function c(d){d.isInterleavedBufferAttribute&&(d=d.data);const f=i.get(d);f&&(n.deleteBuffer(f.buffer),i.delete(d))}function h(d,f){if(d.isGLBufferAttribute){const _=i.get(d);(!_||_.version<d.version)&&i.set(d,{buffer:d.buffer,type:d.type,bytesPerElement:d.elementSize,version:d.version});return}d.isInterleavedBufferAttribute&&(d=d.data);const m=i.get(d);if(m===void 0)i.set(d,r(d,f));else if(m.version<d.version){if(m.size!==d.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");o(m.buffer,d,f),m.version=d.version}}return{get:a,remove:c,update:h}}class Ps extends ir{constructor(e=1,t=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:r};const o=e/2,a=t/2,c=Math.floor(i),h=Math.floor(r),d=c+1,f=h+1,m=e/c,_=t/h,x=[],y=[],w=[],v=[];for(let g=0;g<f;g++){const R=g*_-a;for(let E=0;E<d;E++){const S=E*m-o;y.push(S,-R,0),w.push(0,0,1),v.push(E/c),v.push(1-g/h)}}for(let g=0;g<h;g++)for(let R=0;R<c;R++){const E=R+d*g,S=R+d*(g+1),F=R+1+d*(g+1),L=R+1+d*g;x.push(E,S,L),x.push(S,F,L)}this.setIndex(x),this.setAttribute("position",new Sr(y,3)),this.setAttribute("normal",new Sr(w,3)),this.setAttribute("uv",new Sr(v,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ps(e.width,e.height,e.widthSegments,e.heightSegments)}}var Nw=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Ow=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Fw=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Bw=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,kw=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,Vw=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,zw=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Hw=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Gw=`#ifdef USE_BATCHING
	attribute float batchId;
	uniform highp sampler2D batchingTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Ww=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,jw=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Xw=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,qw=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Yw=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Kw=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,$w=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#pragma unroll_loop_start
	for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
		plane = clippingPlanes[ i ];
		if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
	}
	#pragma unroll_loop_end
	#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
		bool clipped = true;
		#pragma unroll_loop_start
		for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
		}
		#pragma unroll_loop_end
		if ( clipped ) discard;
	#endif
#endif`,Zw=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Jw=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Qw=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,eM=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,tM=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,nM=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,iM=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,rM=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,sM=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,oM=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,aM=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,lM=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,cM=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,uM=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,hM="gl_FragColor = linearToOutputTexel( gl_FragColor );",dM=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}`,fM=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,pM=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,mM=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,gM=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,vM=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,_M=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,xM=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,bM=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,yM=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,wM=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,MM=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,EM=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,SM=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,TM=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,CM=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,AM=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,PM=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,RM=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,LM=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,IM=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,DM=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,UM=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,NM=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,OM=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,FM=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,BM=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,kM=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,VM=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,zM=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,HM=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,GM=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,WM=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,jM=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,XM=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,qM=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,YM=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,KM=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,$M=`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,ZM=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,JM=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,QM=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,eE=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,tE=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,nE=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,iE=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,rE=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,sE=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,oE=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,aE=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,lE=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,cE=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,uE=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,hE=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dE=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,fE=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,pE=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,mE=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,gE=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,vE=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,_E=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,xE=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,bE=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,yE=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,wE=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,ME=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,EE=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,SE=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,TE=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,CE=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color *= toneMappingExposure;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	return color;
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,AE=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,PE=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,RE=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,LE=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,IE=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,DE=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const UE=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,NE=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,OE=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,FE=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,BE=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,kE=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,VE=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,zE=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,HE=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,GE=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,WE=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,jE=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,XE=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,qE=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,YE=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,KE=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,$E=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ZE=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,JE=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,QE=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,eS=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,tS=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,nS=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,iS=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,rS=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,sS=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,oS=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,aS=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,lS=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,cS=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,uS=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,hS=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,dS=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,fS=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,rt={alphahash_fragment:Nw,alphahash_pars_fragment:Ow,alphamap_fragment:Fw,alphamap_pars_fragment:Bw,alphatest_fragment:kw,alphatest_pars_fragment:Vw,aomap_fragment:zw,aomap_pars_fragment:Hw,batching_pars_vertex:Gw,batching_vertex:Ww,begin_vertex:jw,beginnormal_vertex:Xw,bsdfs:qw,iridescence_fragment:Yw,bumpmap_pars_fragment:Kw,clipping_planes_fragment:$w,clipping_planes_pars_fragment:Zw,clipping_planes_pars_vertex:Jw,clipping_planes_vertex:Qw,color_fragment:eM,color_pars_fragment:tM,color_pars_vertex:nM,color_vertex:iM,common:rM,cube_uv_reflection_fragment:sM,defaultnormal_vertex:oM,displacementmap_pars_vertex:aM,displacementmap_vertex:lM,emissivemap_fragment:cM,emissivemap_pars_fragment:uM,colorspace_fragment:hM,colorspace_pars_fragment:dM,envmap_fragment:fM,envmap_common_pars_fragment:pM,envmap_pars_fragment:mM,envmap_pars_vertex:gM,envmap_physical_pars_fragment:AM,envmap_vertex:vM,fog_vertex:_M,fog_pars_vertex:xM,fog_fragment:bM,fog_pars_fragment:yM,gradientmap_pars_fragment:wM,lightmap_fragment:MM,lightmap_pars_fragment:EM,lights_lambert_fragment:SM,lights_lambert_pars_fragment:TM,lights_pars_begin:CM,lights_toon_fragment:PM,lights_toon_pars_fragment:RM,lights_phong_fragment:LM,lights_phong_pars_fragment:IM,lights_physical_fragment:DM,lights_physical_pars_fragment:UM,lights_fragment_begin:NM,lights_fragment_maps:OM,lights_fragment_end:FM,logdepthbuf_fragment:BM,logdepthbuf_pars_fragment:kM,logdepthbuf_pars_vertex:VM,logdepthbuf_vertex:zM,map_fragment:HM,map_pars_fragment:GM,map_particle_fragment:WM,map_particle_pars_fragment:jM,metalnessmap_fragment:XM,metalnessmap_pars_fragment:qM,morphcolor_vertex:YM,morphnormal_vertex:KM,morphtarget_pars_vertex:$M,morphtarget_vertex:ZM,normal_fragment_begin:JM,normal_fragment_maps:QM,normal_pars_fragment:eE,normal_pars_vertex:tE,normal_vertex:nE,normalmap_pars_fragment:iE,clearcoat_normal_fragment_begin:rE,clearcoat_normal_fragment_maps:sE,clearcoat_pars_fragment:oE,iridescence_pars_fragment:aE,opaque_fragment:lE,packing:cE,premultiplied_alpha_fragment:uE,project_vertex:hE,dithering_fragment:dE,dithering_pars_fragment:fE,roughnessmap_fragment:pE,roughnessmap_pars_fragment:mE,shadowmap_pars_fragment:gE,shadowmap_pars_vertex:vE,shadowmap_vertex:_E,shadowmask_pars_fragment:xE,skinbase_vertex:bE,skinning_pars_vertex:yE,skinning_vertex:wE,skinnormal_vertex:ME,specularmap_fragment:EE,specularmap_pars_fragment:SE,tonemapping_fragment:TE,tonemapping_pars_fragment:CE,transmission_fragment:AE,transmission_pars_fragment:PE,uv_pars_fragment:RE,uv_pars_vertex:LE,uv_vertex:IE,worldpos_vertex:DE,background_vert:UE,background_frag:NE,backgroundCube_vert:OE,backgroundCube_frag:FE,cube_vert:BE,cube_frag:kE,depth_vert:VE,depth_frag:zE,distanceRGBA_vert:HE,distanceRGBA_frag:GE,equirect_vert:WE,equirect_frag:jE,linedashed_vert:XE,linedashed_frag:qE,meshbasic_vert:YE,meshbasic_frag:KE,meshlambert_vert:$E,meshlambert_frag:ZE,meshmatcap_vert:JE,meshmatcap_frag:QE,meshnormal_vert:eS,meshnormal_frag:tS,meshphong_vert:nS,meshphong_frag:iS,meshphysical_vert:rS,meshphysical_frag:sS,meshtoon_vert:oS,meshtoon_frag:aS,points_vert:lS,points_frag:cS,shadow_vert:uS,shadow_frag:hS,sprite_vert:dS,sprite_frag:fS},Pe={common:{diffuse:{value:new lt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ot},alphaMap:{value:null},alphaMapTransform:{value:new ot},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ot}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ot}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ot}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ot},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ot},normalScale:{value:new Oe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ot},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ot}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ot}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ot}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new lt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new lt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ot},alphaTest:{value:0},uvTransform:{value:new ot}},sprite:{diffuse:{value:new lt(16777215)},opacity:{value:1},center:{value:new Oe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ot},alphaMap:{value:null},alphaMapTransform:{value:new ot},alphaTest:{value:0}}},jn={basic:{uniforms:dn([Pe.common,Pe.specularmap,Pe.envmap,Pe.aomap,Pe.lightmap,Pe.fog]),vertexShader:rt.meshbasic_vert,fragmentShader:rt.meshbasic_frag},lambert:{uniforms:dn([Pe.common,Pe.specularmap,Pe.envmap,Pe.aomap,Pe.lightmap,Pe.emissivemap,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,Pe.fog,Pe.lights,{emissive:{value:new lt(0)}}]),vertexShader:rt.meshlambert_vert,fragmentShader:rt.meshlambert_frag},phong:{uniforms:dn([Pe.common,Pe.specularmap,Pe.envmap,Pe.aomap,Pe.lightmap,Pe.emissivemap,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,Pe.fog,Pe.lights,{emissive:{value:new lt(0)},specular:{value:new lt(1118481)},shininess:{value:30}}]),vertexShader:rt.meshphong_vert,fragmentShader:rt.meshphong_frag},standard:{uniforms:dn([Pe.common,Pe.envmap,Pe.aomap,Pe.lightmap,Pe.emissivemap,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,Pe.roughnessmap,Pe.metalnessmap,Pe.fog,Pe.lights,{emissive:{value:new lt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:rt.meshphysical_vert,fragmentShader:rt.meshphysical_frag},toon:{uniforms:dn([Pe.common,Pe.aomap,Pe.lightmap,Pe.emissivemap,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,Pe.gradientmap,Pe.fog,Pe.lights,{emissive:{value:new lt(0)}}]),vertexShader:rt.meshtoon_vert,fragmentShader:rt.meshtoon_frag},matcap:{uniforms:dn([Pe.common,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,Pe.fog,{matcap:{value:null}}]),vertexShader:rt.meshmatcap_vert,fragmentShader:rt.meshmatcap_frag},points:{uniforms:dn([Pe.points,Pe.fog]),vertexShader:rt.points_vert,fragmentShader:rt.points_frag},dashed:{uniforms:dn([Pe.common,Pe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:rt.linedashed_vert,fragmentShader:rt.linedashed_frag},depth:{uniforms:dn([Pe.common,Pe.displacementmap]),vertexShader:rt.depth_vert,fragmentShader:rt.depth_frag},normal:{uniforms:dn([Pe.common,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,{opacity:{value:1}}]),vertexShader:rt.meshnormal_vert,fragmentShader:rt.meshnormal_frag},sprite:{uniforms:dn([Pe.sprite,Pe.fog]),vertexShader:rt.sprite_vert,fragmentShader:rt.sprite_frag},background:{uniforms:{uvTransform:{value:new ot},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:rt.background_vert,fragmentShader:rt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:rt.backgroundCube_vert,fragmentShader:rt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:rt.cube_vert,fragmentShader:rt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:rt.equirect_vert,fragmentShader:rt.equirect_frag},distanceRGBA:{uniforms:dn([Pe.common,Pe.displacementmap,{referencePosition:{value:new $},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:rt.distanceRGBA_vert,fragmentShader:rt.distanceRGBA_frag},shadow:{uniforms:dn([Pe.lights,Pe.fog,{color:{value:new lt(0)},opacity:{value:1}}]),vertexShader:rt.shadow_vert,fragmentShader:rt.shadow_frag}};jn.physical={uniforms:dn([jn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ot},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ot},clearcoatNormalScale:{value:new Oe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ot},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ot},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ot},sheen:{value:0},sheenColor:{value:new lt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ot},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ot},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ot},transmissionSamplerSize:{value:new Oe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ot},attenuationDistance:{value:0},attenuationColor:{value:new lt(0)},specularColor:{value:new lt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ot},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ot},anisotropyVector:{value:new Oe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ot}}]),vertexShader:rt.meshphysical_vert,fragmentShader:rt.meshphysical_frag};const ma={r:0,b:0,g:0};function pS(n,e,t,i,r,o,a){const c=new lt(0);let h=o===!0?0:1,d,f,m=null,_=0,x=null;function y(v,g){let R=!1,E=g.isScene===!0?g.background:null;E&&E.isTexture&&(E=(g.backgroundBlurriness>0?t:e).get(E)),E===null?w(c,h):E&&E.isColor&&(w(E,1),R=!0);const S=n.xr.getEnvironmentBlendMode();S==="additive"?i.buffers.color.setClear(0,0,0,1,a):S==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,a),(n.autoClear||R)&&n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil),E&&(E.isCubeTexture||E.mapping===hl)?(f===void 0&&(f=new gn(new As(1,1,1),new wn({name:"BackgroundCubeMaterial",uniforms:Cs(jn.backgroundCube.uniforms),vertexShader:jn.backgroundCube.vertexShader,fragmentShader:jn.backgroundCube.fragmentShader,side:vn,depthTest:!1,depthWrite:!1,fog:!1})),f.geometry.deleteAttribute("normal"),f.geometry.deleteAttribute("uv"),f.onBeforeRender=function(F,L,I){this.matrixWorld.copyPosition(I.matrixWorld)},Object.defineProperty(f.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(f)),f.material.uniforms.envMap.value=E,f.material.uniforms.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,f.material.uniforms.backgroundBlurriness.value=g.backgroundBlurriness,f.material.uniforms.backgroundIntensity.value=g.backgroundIntensity,f.material.toneMapped=wt.getTransfer(E.colorSpace)!==Ct,(m!==E||_!==E.version||x!==n.toneMapping)&&(f.material.needsUpdate=!0,m=E,_=E.version,x=n.toneMapping),f.layers.enableAll(),v.unshift(f,f.geometry,f.material,0,0,null)):E&&E.isTexture&&(d===void 0&&(d=new gn(new Ps(2,2),new wn({name:"BackgroundMaterial",uniforms:Cs(jn.background.uniforms),vertexShader:jn.background.vertexShader,fragmentShader:jn.background.fragmentShader,side:tr,depthTest:!1,depthWrite:!1,fog:!1})),d.geometry.deleteAttribute("normal"),Object.defineProperty(d.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(d)),d.material.uniforms.t2D.value=E,d.material.uniforms.backgroundIntensity.value=g.backgroundIntensity,d.material.toneMapped=wt.getTransfer(E.colorSpace)!==Ct,E.matrixAutoUpdate===!0&&E.updateMatrix(),d.material.uniforms.uvTransform.value.copy(E.matrix),(m!==E||_!==E.version||x!==n.toneMapping)&&(d.material.needsUpdate=!0,m=E,_=E.version,x=n.toneMapping),d.layers.enableAll(),v.unshift(d,d.geometry,d.material,0,0,null))}function w(v,g){v.getRGB(ma,ng(n)),i.buffers.color.setClear(ma.r,ma.g,ma.b,g,a)}return{getClearColor:function(){return c},setClearColor:function(v,g=1){c.set(v),h=g,w(c,h)},getClearAlpha:function(){return h},setClearAlpha:function(v){h=v,w(c,h)},render:y}}function mS(n,e,t,i){const r=n.getParameter(n.MAX_VERTEX_ATTRIBS),o=i.isWebGL2?null:e.get("OES_vertex_array_object"),a=i.isWebGL2||o!==null,c={},h=v(null);let d=h,f=!1;function m(V,J,q,ee,K){let ue=!1;if(a){const de=w(ee,q,J);d!==de&&(d=de,x(d.object)),ue=g(V,ee,q,K),ue&&R(V,ee,q,K)}else{const de=J.wireframe===!0;(d.geometry!==ee.id||d.program!==q.id||d.wireframe!==de)&&(d.geometry=ee.id,d.program=q.id,d.wireframe=de,ue=!0)}K!==null&&t.update(K,n.ELEMENT_ARRAY_BUFFER),(ue||f)&&(f=!1,P(V,J,q,ee),K!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,t.get(K).buffer))}function _(){return i.isWebGL2?n.createVertexArray():o.createVertexArrayOES()}function x(V){return i.isWebGL2?n.bindVertexArray(V):o.bindVertexArrayOES(V)}function y(V){return i.isWebGL2?n.deleteVertexArray(V):o.deleteVertexArrayOES(V)}function w(V,J,q){const ee=q.wireframe===!0;let K=c[V.id];K===void 0&&(K={},c[V.id]=K);let ue=K[J.id];ue===void 0&&(ue={},K[J.id]=ue);let de=ue[ee];return de===void 0&&(de=v(_()),ue[ee]=de),de}function v(V){const J=[],q=[],ee=[];for(let K=0;K<r;K++)J[K]=0,q[K]=0,ee[K]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:J,enabledAttributes:q,attributeDivisors:ee,object:V,attributes:{},index:null}}function g(V,J,q,ee){const K=d.attributes,ue=J.attributes;let de=0;const we=q.getAttributes();for(const be in we)if(we[be].location>=0){const ce=K[be];let Me=ue[be];if(Me===void 0&&(be==="instanceMatrix"&&V.instanceMatrix&&(Me=V.instanceMatrix),be==="instanceColor"&&V.instanceColor&&(Me=V.instanceColor)),ce===void 0||ce.attribute!==Me||Me&&ce.data!==Me.data)return!0;de++}return d.attributesNum!==de||d.index!==ee}function R(V,J,q,ee){const K={},ue=J.attributes;let de=0;const we=q.getAttributes();for(const be in we)if(we[be].location>=0){let ce=ue[be];ce===void 0&&(be==="instanceMatrix"&&V.instanceMatrix&&(ce=V.instanceMatrix),be==="instanceColor"&&V.instanceColor&&(ce=V.instanceColor));const Me={};Me.attribute=ce,ce&&ce.data&&(Me.data=ce.data),K[be]=Me,de++}d.attributes=K,d.attributesNum=de,d.index=ee}function E(){const V=d.newAttributes;for(let J=0,q=V.length;J<q;J++)V[J]=0}function S(V){F(V,0)}function F(V,J){const q=d.newAttributes,ee=d.enabledAttributes,K=d.attributeDivisors;q[V]=1,ee[V]===0&&(n.enableVertexAttribArray(V),ee[V]=1),K[V]!==J&&((i.isWebGL2?n:e.get("ANGLE_instanced_arrays"))[i.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](V,J),K[V]=J)}function L(){const V=d.newAttributes,J=d.enabledAttributes;for(let q=0,ee=J.length;q<ee;q++)J[q]!==V[q]&&(n.disableVertexAttribArray(q),J[q]=0)}function I(V,J,q,ee,K,ue,de){de===!0?n.vertexAttribIPointer(V,J,q,K,ue):n.vertexAttribPointer(V,J,q,ee,K,ue)}function P(V,J,q,ee){if(i.isWebGL2===!1&&(V.isInstancedMesh||ee.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;E();const K=ee.attributes,ue=q.getAttributes(),de=J.defaultAttributeValues;for(const we in ue){const be=ue[we];if(be.location>=0){let fe=K[we];if(fe===void 0&&(we==="instanceMatrix"&&V.instanceMatrix&&(fe=V.instanceMatrix),we==="instanceColor"&&V.instanceColor&&(fe=V.instanceColor)),fe!==void 0){const ce=fe.normalized,Me=fe.itemSize,Ie=t.get(fe);if(Ie===void 0)continue;const Ue=Ie.buffer,ge=Ie.type,U=Ie.bytesPerElement,B=i.isWebGL2===!0&&(ge===n.INT||ge===n.UNSIGNED_INT||fe.gpuType===Bm);if(fe.isInterleavedBufferAttribute){const W=fe.data,T=W.stride,O=fe.offset;if(W.isInstancedInterleavedBuffer){for(let G=0;G<be.locationSize;G++)F(be.location+G,W.meshPerAttribute);V.isInstancedMesh!==!0&&ee._maxInstanceCount===void 0&&(ee._maxInstanceCount=W.meshPerAttribute*W.count)}else for(let G=0;G<be.locationSize;G++)S(be.location+G);n.bindBuffer(n.ARRAY_BUFFER,Ue);for(let G=0;G<be.locationSize;G++)I(be.location+G,Me/be.locationSize,ge,ce,T*U,(O+Me/be.locationSize*G)*U,B)}else{if(fe.isInstancedBufferAttribute){for(let W=0;W<be.locationSize;W++)F(be.location+W,fe.meshPerAttribute);V.isInstancedMesh!==!0&&ee._maxInstanceCount===void 0&&(ee._maxInstanceCount=fe.meshPerAttribute*fe.count)}else for(let W=0;W<be.locationSize;W++)S(be.location+W);n.bindBuffer(n.ARRAY_BUFFER,Ue);for(let W=0;W<be.locationSize;W++)I(be.location+W,Me/be.locationSize,ge,ce,Me*U,Me/be.locationSize*W*U,B)}}else if(de!==void 0){const ce=de[we];if(ce!==void 0)switch(ce.length){case 2:n.vertexAttrib2fv(be.location,ce);break;case 3:n.vertexAttrib3fv(be.location,ce);break;case 4:n.vertexAttrib4fv(be.location,ce);break;default:n.vertexAttrib1fv(be.location,ce)}}}}L()}function M(){H();for(const V in c){const J=c[V];for(const q in J){const ee=J[q];for(const K in ee)y(ee[K].object),delete ee[K];delete J[q]}delete c[V]}}function b(V){if(c[V.id]===void 0)return;const J=c[V.id];for(const q in J){const ee=J[q];for(const K in ee)y(ee[K].object),delete ee[K];delete J[q]}delete c[V.id]}function N(V){for(const J in c){const q=c[J];if(q[V.id]===void 0)continue;const ee=q[V.id];for(const K in ee)y(ee[K].object),delete ee[K];delete q[V.id]}}function H(){ae(),f=!0,d!==h&&(d=h,x(d.object))}function ae(){h.geometry=null,h.program=null,h.wireframe=!1}return{setup:m,reset:H,resetDefaultState:ae,dispose:M,releaseStatesOfGeometry:b,releaseStatesOfProgram:N,initAttributes:E,enableAttribute:S,disableUnusedAttributes:L}}function gS(n,e,t,i){const r=i.isWebGL2;let o;function a(f){o=f}function c(f,m){n.drawArrays(o,f,m),t.update(m,o,1)}function h(f,m,_){if(_===0)return;let x,y;if(r)x=n,y="drawArraysInstanced";else if(x=e.get("ANGLE_instanced_arrays"),y="drawArraysInstancedANGLE",x===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}x[y](o,f,m,_),t.update(m,o,_)}function d(f,m,_){if(_===0)return;const x=e.get("WEBGL_multi_draw");if(x===null)for(let y=0;y<_;y++)this.render(f[y],m[y]);else{x.multiDrawArraysWEBGL(o,f,0,m,0,_);let y=0;for(let w=0;w<_;w++)y+=m[w];t.update(y,o,1)}}this.setMode=a,this.render=c,this.renderInstances=h,this.renderMultiDraw=d}function vS(n,e,t){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const I=e.get("EXT_texture_filter_anisotropic");i=n.getParameter(I.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(I){if(I==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";I="mediump"}return I==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}const a=typeof WebGL2RenderingContext<"u"&&n.constructor.name==="WebGL2RenderingContext";let c=t.precision!==void 0?t.precision:"highp";const h=o(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const d=a||e.has("WEBGL_draw_buffers"),f=t.logarithmicDepthBuffer===!0,m=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),_=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=n.getParameter(n.MAX_TEXTURE_SIZE),y=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),w=n.getParameter(n.MAX_VERTEX_ATTRIBS),v=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),g=n.getParameter(n.MAX_VARYING_VECTORS),R=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),E=_>0,S=a||e.has("OES_texture_float"),F=E&&S,L=a?n.getParameter(n.MAX_SAMPLES):0;return{isWebGL2:a,drawBuffers:d,getMaxAnisotropy:r,getMaxPrecision:o,precision:c,logarithmicDepthBuffer:f,maxTextures:m,maxVertexTextures:_,maxTextureSize:x,maxCubemapSize:y,maxAttributes:w,maxVertexUniforms:v,maxVaryings:g,maxFragmentUniforms:R,vertexTextures:E,floatFragmentTextures:S,floatVertexTextures:F,maxSamples:L}}function _S(n){const e=this;let t=null,i=0,r=!1,o=!1;const a=new xi,c=new ot,h={value:null,needsUpdate:!1};this.uniform=h,this.numPlanes=0,this.numIntersection=0,this.init=function(m,_){const x=m.length!==0||_||i!==0||r;return r=_,i=m.length,x},this.beginShadows=function(){o=!0,f(null)},this.endShadows=function(){o=!1},this.setGlobalState=function(m,_){t=f(m,_,0)},this.setState=function(m,_,x){const y=m.clippingPlanes,w=m.clipIntersection,v=m.clipShadows,g=n.get(m);if(!r||y===null||y.length===0||o&&!v)o?f(null):d();else{const R=o?0:i,E=R*4;let S=g.clippingState||null;h.value=S,S=f(y,_,E,x);for(let F=0;F!==E;++F)S[F]=t[F];g.clippingState=S,this.numIntersection=w?this.numPlanes:0,this.numPlanes+=R}};function d(){h.value!==t&&(h.value=t,h.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function f(m,_,x,y){const w=m!==null?m.length:0;let v=null;if(w!==0){if(v=h.value,y!==!0||v===null){const g=x+w*4,R=_.matrixWorldInverse;c.getNormalMatrix(R),(v===null||v.length<g)&&(v=new Float32Array(g));for(let E=0,S=x;E!==w;++E,S+=4)a.copy(m[E]).applyMatrix4(R,c),a.normal.toArray(v,S),v[S+3]=a.constant}h.value=v,h.needsUpdate=!0}return e.numPlanes=w,e.numIntersection=0,v}}function xS(n){let e=new WeakMap;function t(a,c){return c===su?a.mapping=ws:c===ou&&(a.mapping=Ms),a}function i(a){if(a&&a.isTexture){const c=a.mapping;if(c===su||c===ou)if(e.has(a)){const h=e.get(a).texture;return t(h,a.mapping)}else{const h=a.image;if(h&&h.height>0){const d=new Lw(h.height/2);return d.fromEquirectangularTexture(n,a),e.set(a,d),a.addEventListener("dispose",r),t(d.texture,a.mapping)}else return null}}return a}function r(a){const c=a.target;c.removeEventListener("dispose",r);const h=e.get(c);h!==void 0&&(e.delete(c),h.dispose())}function o(){e=new WeakMap}return{get:i,dispose:o}}class Yi extends ig{constructor(e=-1,t=1,i=1,r=-1,o=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=r,this.near=o,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,r,o,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=o,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let o=i-e,a=i+e,c=r+t,h=r-t;if(this.view!==null&&this.view.enabled){const d=(this.right-this.left)/this.view.fullWidth/this.zoom,f=(this.top-this.bottom)/this.view.fullHeight/this.zoom;o+=d*this.view.offsetX,a=o+d*this.view.width,c-=f*this.view.offsetY,h=c-f*this.view.height}this.projectionMatrix.makeOrthographic(o,a,c,h,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const hs=4,Lf=[.125,.215,.35,.446,.526,.582],xr=20,Ac=new Yi,If=new lt;let Pc=null,Rc=0,Lc=0;const vr=(1+Math.sqrt(5))/2,as=1/vr,Df=[new $(1,1,1),new $(-1,1,1),new $(1,1,-1),new $(-1,1,-1),new $(0,vr,as),new $(0,vr,-as),new $(as,0,vr),new $(-as,0,vr),new $(vr,as,0),new $(-vr,as,0)];class Uf{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,r=100){Pc=this._renderer.getRenderTarget(),Rc=this._renderer.getActiveCubeFace(),Lc=this._renderer.getActiveMipmapLevel(),this._setSize(256);const o=this._allocateTargets();return o.depthBuffer=!0,this._sceneToCubeUV(e,i,r,o),t>0&&this._blur(o,0,0,t),this._applyPMREM(o),this._cleanup(o),o}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ff(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Of(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Pc,Rc,Lc),e.scissorTest=!1,ga(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ws||e.mapping===Ms?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Pc=this._renderer.getRenderTarget(),Rc=this._renderer.getActiveCubeFace(),Lc=this._renderer.getActiveMipmapLevel();const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Cn,minFilter:Cn,generateMipmaps:!1,type:Ss,format:kn,colorSpace:Si,depthBuffer:!1},r=Nf(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Nf(e,t,i);const{_lodMax:o}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=bS(o)),this._blurMaterial=yS(o,e,t)}return r}_compileMaterial(e){const t=new gn(this._lodPlanes[0],e);this._renderer.compile(t,Ac)}_sceneToCubeUV(e,t,i,r){const c=new Ht(90,1,t,i),h=[1,-1,1,1,1,1],d=[1,1,1,-1,-1,-1],f=this._renderer,m=f.autoClear,_=f.toneMapping;f.getClearColor(If),f.toneMapping=Zi,f.autoClear=!1;const x=new Gu({name:"PMREM.Background",side:vn,depthWrite:!1,depthTest:!1}),y=new gn(new As,x);let w=!1;const v=e.background;v?v.isColor&&(x.color.copy(v),e.background=null,w=!0):(x.color.copy(If),w=!0);for(let g=0;g<6;g++){const R=g%3;R===0?(c.up.set(0,h[g],0),c.lookAt(d[g],0,0)):R===1?(c.up.set(0,0,h[g]),c.lookAt(0,d[g],0)):(c.up.set(0,h[g],0),c.lookAt(0,0,d[g]));const E=this._cubeSize;ga(r,R*E,g>2?E:0,E,E),f.setRenderTarget(r),w&&f.render(y,c),f.render(e,c)}y.geometry.dispose(),y.material.dispose(),f.toneMapping=_,f.autoClear=m,e.background=v}_textureToCubeUV(e,t){const i=this._renderer,r=e.mapping===ws||e.mapping===Ms;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ff()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Of());const o=r?this._cubemapMaterial:this._equirectMaterial,a=new gn(this._lodPlanes[0],o),c=o.uniforms;c.envMap.value=e;const h=this._cubeSize;ga(t,0,0,3*h,2*h),i.setRenderTarget(t),i.render(a,Ac)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;for(let r=1;r<this._lodPlanes.length;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Df[(r-1)%Df.length];this._blur(e,r-1,r,o,a)}t.autoClear=i}_blur(e,t,i,r,o){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,i,r,"latitudinal",o),this._halfBlur(a,e,i,i,r,"longitudinal",o)}_halfBlur(e,t,i,r,o,a,c){const h=this._renderer,d=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const f=3,m=new gn(this._lodPlanes[r],d),_=d.uniforms,x=this._sizeLods[i]-1,y=isFinite(o)?Math.PI/(2*x):2*Math.PI/(2*xr-1),w=o/y,v=isFinite(o)?1+Math.floor(f*w):xr;v>xr&&console.warn(`sigmaRadians, ${o}, is too large and will clip, as it requested ${v} samples when the maximum is set to ${xr}`);const g=[];let R=0;for(let I=0;I<xr;++I){const P=I/w,M=Math.exp(-P*P/2);g.push(M),I===0?R+=M:I<v&&(R+=2*M)}for(let I=0;I<g.length;I++)g[I]=g[I]/R;_.envMap.value=e.texture,_.samples.value=v,_.weights.value=g,_.latitudinal.value=a==="latitudinal",c&&(_.poleAxis.value=c);const{_lodMax:E}=this;_.dTheta.value=y,_.mipInt.value=E-i;const S=this._sizeLods[r],F=3*S*(r>E-hs?r-E+hs:0),L=4*(this._cubeSize-S);ga(t,F,L,3*S,2*S),h.setRenderTarget(t),h.render(m,Ac)}}function bS(n){const e=[],t=[],i=[];let r=n;const o=n-hs+1+Lf.length;for(let a=0;a<o;a++){const c=Math.pow(2,r);t.push(c);let h=1/c;a>n-hs?h=Lf[a-n+hs-1]:a===0&&(h=0),i.push(h);const d=1/(c-2),f=-d,m=1+d,_=[f,f,m,f,m,m,f,f,m,m,f,m],x=6,y=6,w=3,v=2,g=1,R=new Float32Array(w*y*x),E=new Float32Array(v*y*x),S=new Float32Array(g*y*x);for(let L=0;L<x;L++){const I=L%3*2/3-1,P=L>2?0:-1,M=[I,P,0,I+2/3,P,0,I+2/3,P+1,0,I,P,0,I+2/3,P+1,0,I,P+1,0];R.set(M,w*y*L),E.set(_,v*y*L);const b=[L,L,L,L,L,L];S.set(b,g*y*L)}const F=new ir;F.setAttribute("position",new mn(R,w)),F.setAttribute("uv",new mn(E,v)),F.setAttribute("faceIndex",new mn(S,g)),e.push(F),r>hs&&r--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function Nf(n,e,t){const i=new ii(n,e,t);return i.texture.mapping=hl,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function ga(n,e,t,i,r){n.viewport.set(e,t,i,r),n.scissor.set(e,t,i,r)}function yS(n,e,t){const i=new Float32Array(xr),r=new $(0,1,0);return new wn({name:"SphericalGaussianBlur",defines:{n:xr,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:Wu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:$i,depthTest:!1,depthWrite:!1})}function Of(){return new wn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Wu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:$i,depthTest:!1,depthWrite:!1})}function Ff(){return new wn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Wu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:$i,depthTest:!1,depthWrite:!1})}function Wu(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function wS(n){let e=new WeakMap,t=null;function i(c){if(c&&c.isTexture){const h=c.mapping,d=h===su||h===ou,f=h===ws||h===Ms;if(d||f)if(c.isRenderTargetTexture&&c.needsPMREMUpdate===!0){c.needsPMREMUpdate=!1;let m=e.get(c);return t===null&&(t=new Uf(n)),m=d?t.fromEquirectangular(c,m):t.fromCubemap(c,m),e.set(c,m),m.texture}else{if(e.has(c))return e.get(c).texture;{const m=c.image;if(d&&m&&m.height>0||f&&m&&r(m)){t===null&&(t=new Uf(n));const _=d?t.fromEquirectangular(c):t.fromCubemap(c);return e.set(c,_),c.addEventListener("dispose",o),_.texture}else return null}}}return c}function r(c){let h=0;const d=6;for(let f=0;f<d;f++)c[f]!==void 0&&h++;return h===d}function o(c){const h=c.target;h.removeEventListener("dispose",o);const d=e.get(h);d!==void 0&&(e.delete(h),d.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:a}}function MS(n){const e={};function t(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=n.getExtension(i)}return e[i]=r,r}return{has:function(i){return t(i)!==null},init:function(i){i.isWebGL2?(t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance")):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(i){const r=t(i);return r===null&&console.warn("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function ES(n,e,t,i){const r={},o=new WeakMap;function a(m){const _=m.target;_.index!==null&&e.remove(_.index);for(const y in _.attributes)e.remove(_.attributes[y]);for(const y in _.morphAttributes){const w=_.morphAttributes[y];for(let v=0,g=w.length;v<g;v++)e.remove(w[v])}_.removeEventListener("dispose",a),delete r[_.id];const x=o.get(_);x&&(e.remove(x),o.delete(_)),i.releaseStatesOfGeometry(_),_.isInstancedBufferGeometry===!0&&delete _._maxInstanceCount,t.memory.geometries--}function c(m,_){return r[_.id]===!0||(_.addEventListener("dispose",a),r[_.id]=!0,t.memory.geometries++),_}function h(m){const _=m.attributes;for(const y in _)e.update(_[y],n.ARRAY_BUFFER);const x=m.morphAttributes;for(const y in x){const w=x[y];for(let v=0,g=w.length;v<g;v++)e.update(w[v],n.ARRAY_BUFFER)}}function d(m){const _=[],x=m.index,y=m.attributes.position;let w=0;if(x!==null){const R=x.array;w=x.version;for(let E=0,S=R.length;E<S;E+=3){const F=R[E+0],L=R[E+1],I=R[E+2];_.push(F,L,L,I,I,F)}}else if(y!==void 0){const R=y.array;w=y.version;for(let E=0,S=R.length/3-1;E<S;E+=3){const F=E+0,L=E+1,I=E+2;_.push(F,L,L,I,I,F)}}else return;const v=new(qm(_)?tg:eg)(_,1);v.version=w;const g=o.get(m);g&&e.remove(g),o.set(m,v)}function f(m){const _=o.get(m);if(_){const x=m.index;x!==null&&_.version<x.version&&d(m)}else d(m);return o.get(m)}return{get:c,update:h,getWireframeAttribute:f}}function SS(n,e,t,i){const r=i.isWebGL2;let o;function a(x){o=x}let c,h;function d(x){c=x.type,h=x.bytesPerElement}function f(x,y){n.drawElements(o,y,c,x*h),t.update(y,o,1)}function m(x,y,w){if(w===0)return;let v,g;if(r)v=n,g="drawElementsInstanced";else if(v=e.get("ANGLE_instanced_arrays"),g="drawElementsInstancedANGLE",v===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}v[g](o,y,c,x*h,w),t.update(y,o,w)}function _(x,y,w){if(w===0)return;const v=e.get("WEBGL_multi_draw");if(v===null)for(let g=0;g<w;g++)this.render(x[g]/h,y[g]);else{v.multiDrawElementsWEBGL(o,y,0,c,x,0,w);let g=0;for(let R=0;R<w;R++)g+=y[R];t.update(g,o,1)}}this.setMode=a,this.setIndex=d,this.render=f,this.renderInstances=m,this.renderMultiDraw=_}function TS(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(o,a,c){switch(t.calls++,a){case n.TRIANGLES:t.triangles+=c*(o/3);break;case n.LINES:t.lines+=c*(o/2);break;case n.LINE_STRIP:t.lines+=c*(o-1);break;case n.LINE_LOOP:t.lines+=c*o;break;case n.POINTS:t.points+=c*o;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:i}}function CS(n,e){return n[0]-e[0]}function AS(n,e){return Math.abs(e[1])-Math.abs(n[1])}function PS(n,e,t){const i={},r=new Float32Array(8),o=new WeakMap,a=new It,c=[];for(let d=0;d<8;d++)c[d]=[d,0];function h(d,f,m){const _=d.morphTargetInfluences;if(e.isWebGL2===!0){const y=f.morphAttributes.position||f.morphAttributes.normal||f.morphAttributes.color,w=y!==void 0?y.length:0;let v=o.get(f);if(v===void 0||v.count!==w){let J=function(){ae.dispose(),o.delete(f),f.removeEventListener("dispose",J)};var x=J;v!==void 0&&v.texture.dispose();const E=f.morphAttributes.position!==void 0,S=f.morphAttributes.normal!==void 0,F=f.morphAttributes.color!==void 0,L=f.morphAttributes.position||[],I=f.morphAttributes.normal||[],P=f.morphAttributes.color||[];let M=0;E===!0&&(M=1),S===!0&&(M=2),F===!0&&(M=3);let b=f.attributes.position.count*M,N=1;b>e.maxTextureSize&&(N=Math.ceil(b/e.maxTextureSize),b=e.maxTextureSize);const H=new Float32Array(b*N*4*w),ae=new $m(H,b,N,w);ae.type=qi,ae.needsUpdate=!0;const V=M*4;for(let q=0;q<w;q++){const ee=L[q],K=I[q],ue=P[q],de=b*N*4*q;for(let we=0;we<ee.count;we++){const be=we*V;E===!0&&(a.fromBufferAttribute(ee,we),H[de+be+0]=a.x,H[de+be+1]=a.y,H[de+be+2]=a.z,H[de+be+3]=0),S===!0&&(a.fromBufferAttribute(K,we),H[de+be+4]=a.x,H[de+be+5]=a.y,H[de+be+6]=a.z,H[de+be+7]=0),F===!0&&(a.fromBufferAttribute(ue,we),H[de+be+8]=a.x,H[de+be+9]=a.y,H[de+be+10]=a.z,H[de+be+11]=ue.itemSize===4?a.w:1)}}v={count:w,texture:ae,size:new Oe(b,N)},o.set(f,v),f.addEventListener("dispose",J)}let g=0;for(let E=0;E<_.length;E++)g+=_[E];const R=f.morphTargetsRelative?1:1-g;m.getUniforms().setValue(n,"morphTargetBaseInfluence",R),m.getUniforms().setValue(n,"morphTargetInfluences",_),m.getUniforms().setValue(n,"morphTargetsTexture",v.texture,t),m.getUniforms().setValue(n,"morphTargetsTextureSize",v.size)}else{const y=_===void 0?0:_.length;let w=i[f.id];if(w===void 0||w.length!==y){w=[];for(let S=0;S<y;S++)w[S]=[S,0];i[f.id]=w}for(let S=0;S<y;S++){const F=w[S];F[0]=S,F[1]=_[S]}w.sort(AS);for(let S=0;S<8;S++)S<y&&w[S][1]?(c[S][0]=w[S][0],c[S][1]=w[S][1]):(c[S][0]=Number.MAX_SAFE_INTEGER,c[S][1]=0);c.sort(CS);const v=f.morphAttributes.position,g=f.morphAttributes.normal;let R=0;for(let S=0;S<8;S++){const F=c[S],L=F[0],I=F[1];L!==Number.MAX_SAFE_INTEGER&&I?(v&&f.getAttribute("morphTarget"+S)!==v[L]&&f.setAttribute("morphTarget"+S,v[L]),g&&f.getAttribute("morphNormal"+S)!==g[L]&&f.setAttribute("morphNormal"+S,g[L]),r[S]=I,R+=I):(v&&f.hasAttribute("morphTarget"+S)===!0&&f.deleteAttribute("morphTarget"+S),g&&f.hasAttribute("morphNormal"+S)===!0&&f.deleteAttribute("morphNormal"+S),r[S]=0)}const E=f.morphTargetsRelative?1:1-R;m.getUniforms().setValue(n,"morphTargetBaseInfluence",E),m.getUniforms().setValue(n,"morphTargetInfluences",r)}}return{update:h}}function RS(n,e,t,i){let r=new WeakMap;function o(h){const d=i.render.frame,f=h.geometry,m=e.get(h,f);if(r.get(m)!==d&&(e.update(m),r.set(m,d)),h.isInstancedMesh&&(h.hasEventListener("dispose",c)===!1&&h.addEventListener("dispose",c),r.get(h)!==d&&(t.update(h.instanceMatrix,n.ARRAY_BUFFER),h.instanceColor!==null&&t.update(h.instanceColor,n.ARRAY_BUFFER),r.set(h,d))),h.isSkinnedMesh){const _=h.skeleton;r.get(_)!==d&&(_.update(),r.set(_,d))}return m}function a(){r=new WeakMap}function c(h){const d=h.target;d.removeEventListener("dispose",c),t.remove(d.instanceMatrix),d.instanceColor!==null&&t.remove(d.instanceColor)}return{update:o,dispose:a}}class ag extends tn{constructor(e,t,i,r,o,a,c,h,d,f){if(f=f!==void 0?f:Mr,f!==Mr&&f!==Ts)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&f===Mr&&(i=Xi),i===void 0&&f===Ts&&(i=wr),super(null,r,o,a,c,h,f,i,d),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=c!==void 0?c:$t,this.minFilter=h!==void 0?h:$t,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const lg=new tn,cg=new ag(1,1);cg.compareFunction=Xm;const ug=new $m,hg=new mw,dg=new rg,Bf=[],kf=[],Vf=new Float32Array(16),zf=new Float32Array(9),Hf=new Float32Array(4);function Rs(n,e,t){const i=n[0];if(i<=0||i>0)return n;const r=e*t;let o=Bf[r];if(o===void 0&&(o=new Float32Array(r),Bf[r]=o),e!==0){i.toArray(o,0);for(let a=1,c=0;a!==e;++a)c+=t,n[a].toArray(o,c)}return o}function Xt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function qt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function vl(n,e){let t=kf[e];t===void 0&&(t=new Int32Array(e),kf[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function LS(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function IS(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;n.uniform2fv(this.addr,e),qt(t,e)}}function DS(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Xt(t,e))return;n.uniform3fv(this.addr,e),qt(t,e)}}function US(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;n.uniform4fv(this.addr,e),qt(t,e)}}function NS(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;Hf.set(i),n.uniformMatrix2fv(this.addr,!1,Hf),qt(t,i)}}function OS(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;zf.set(i),n.uniformMatrix3fv(this.addr,!1,zf),qt(t,i)}}function FS(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;Vf.set(i),n.uniformMatrix4fv(this.addr,!1,Vf),qt(t,i)}}function BS(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function kS(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;n.uniform2iv(this.addr,e),qt(t,e)}}function VS(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Xt(t,e))return;n.uniform3iv(this.addr,e),qt(t,e)}}function zS(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;n.uniform4iv(this.addr,e),qt(t,e)}}function HS(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function GS(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;n.uniform2uiv(this.addr,e),qt(t,e)}}function WS(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Xt(t,e))return;n.uniform3uiv(this.addr,e),qt(t,e)}}function jS(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;n.uniform4uiv(this.addr,e),qt(t,e)}}function XS(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r);const o=this.type===n.SAMPLER_2D_SHADOW?cg:lg;t.setTexture2D(e||o,r)}function qS(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture3D(e||hg,r)}function YS(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTextureCube(e||dg,r)}function KS(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture2DArray(e||ug,r)}function $S(n){switch(n){case 5126:return LS;case 35664:return IS;case 35665:return DS;case 35666:return US;case 35674:return NS;case 35675:return OS;case 35676:return FS;case 5124:case 35670:return BS;case 35667:case 35671:return kS;case 35668:case 35672:return VS;case 35669:case 35673:return zS;case 5125:return HS;case 36294:return GS;case 36295:return WS;case 36296:return jS;case 35678:case 36198:case 36298:case 36306:case 35682:return XS;case 35679:case 36299:case 36307:return qS;case 35680:case 36300:case 36308:case 36293:return YS;case 36289:case 36303:case 36311:case 36292:return KS}}function ZS(n,e){n.uniform1fv(this.addr,e)}function JS(n,e){const t=Rs(e,this.size,2);n.uniform2fv(this.addr,t)}function QS(n,e){const t=Rs(e,this.size,3);n.uniform3fv(this.addr,t)}function eT(n,e){const t=Rs(e,this.size,4);n.uniform4fv(this.addr,t)}function tT(n,e){const t=Rs(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function nT(n,e){const t=Rs(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function iT(n,e){const t=Rs(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function rT(n,e){n.uniform1iv(this.addr,e)}function sT(n,e){n.uniform2iv(this.addr,e)}function oT(n,e){n.uniform3iv(this.addr,e)}function aT(n,e){n.uniform4iv(this.addr,e)}function lT(n,e){n.uniform1uiv(this.addr,e)}function cT(n,e){n.uniform2uiv(this.addr,e)}function uT(n,e){n.uniform3uiv(this.addr,e)}function hT(n,e){n.uniform4uiv(this.addr,e)}function dT(n,e,t){const i=this.cache,r=e.length,o=vl(t,r);Xt(i,o)||(n.uniform1iv(this.addr,o),qt(i,o));for(let a=0;a!==r;++a)t.setTexture2D(e[a]||lg,o[a])}function fT(n,e,t){const i=this.cache,r=e.length,o=vl(t,r);Xt(i,o)||(n.uniform1iv(this.addr,o),qt(i,o));for(let a=0;a!==r;++a)t.setTexture3D(e[a]||hg,o[a])}function pT(n,e,t){const i=this.cache,r=e.length,o=vl(t,r);Xt(i,o)||(n.uniform1iv(this.addr,o),qt(i,o));for(let a=0;a!==r;++a)t.setTextureCube(e[a]||dg,o[a])}function mT(n,e,t){const i=this.cache,r=e.length,o=vl(t,r);Xt(i,o)||(n.uniform1iv(this.addr,o),qt(i,o));for(let a=0;a!==r;++a)t.setTexture2DArray(e[a]||ug,o[a])}function gT(n){switch(n){case 5126:return ZS;case 35664:return JS;case 35665:return QS;case 35666:return eT;case 35674:return tT;case 35675:return nT;case 35676:return iT;case 5124:case 35670:return rT;case 35667:case 35671:return sT;case 35668:case 35672:return oT;case 35669:case 35673:return aT;case 5125:return lT;case 36294:return cT;case 36295:return uT;case 36296:return hT;case 35678:case 36198:case 36298:case 36306:case 35682:return dT;case 35679:case 36299:case 36307:return fT;case 35680:case 36300:case 36308:case 36293:return pT;case 36289:case 36303:case 36311:case 36292:return mT}}class vT{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=$S(t.type)}}class _T{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=gT(t.type)}}class xT{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const r=this.seq;for(let o=0,a=r.length;o!==a;++o){const c=r[o];c.setValue(e,t[c.id],i)}}}const Ic=/(\w+)(\])?(\[|\.)?/g;function Gf(n,e){n.seq.push(e),n.map[e.id]=e}function bT(n,e,t){const i=n.name,r=i.length;for(Ic.lastIndex=0;;){const o=Ic.exec(i),a=Ic.lastIndex;let c=o[1];const h=o[2]==="]",d=o[3];if(h&&(c=c|0),d===void 0||d==="["&&a+2===r){Gf(t,d===void 0?new vT(c,n,e):new _T(c,n,e));break}else{let m=t.map[c];m===void 0&&(m=new xT(c),Gf(t,m)),t=m}}}class Ra{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){const o=e.getActiveUniform(t,r),a=e.getUniformLocation(t,o.name);bT(o,a,this)}}setValue(e,t,i,r){const o=this.map[t];o!==void 0&&o.setValue(e,i,r)}setOptional(e,t,i){const r=t[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,t,i,r){for(let o=0,a=t.length;o!==a;++o){const c=t[o],h=i[c.id];h.needsUpdate!==!1&&c.setValue(e,h.value,r)}}static seqWithValue(e,t){const i=[];for(let r=0,o=e.length;r!==o;++r){const a=e[r];a.id in t&&i.push(a)}return i}}function Wf(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const yT=37297;let wT=0;function MT(n,e){const t=n.split(`
`),i=[],r=Math.max(e-6,0),o=Math.min(e+6,t.length);for(let a=r;a<o;a++){const c=a+1;i.push(`${c===e?">":" "} ${c}: ${t[a]}`)}return i.join(`
`)}function ET(n){const e=wt.getPrimaries(wt.workingColorSpace),t=wt.getPrimaries(n);let i;switch(e===t?i="":e===qa&&t===Xa?i="LinearDisplayP3ToLinearSRGB":e===Xa&&t===qa&&(i="LinearSRGBToLinearDisplayP3"),n){case Si:case dl:return[i,"LinearTransferOETF"];case Qt:case zu:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",n),[i,"LinearTransferOETF"]}}function jf(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),r=n.getShaderInfoLog(e).trim();if(i&&r==="")return"";const o=/ERROR: 0:(\d+)/.exec(r);if(o){const a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+MT(n.getShaderSource(e),a)}else return r}function ST(n,e){const t=ET(e);return`vec4 ${n}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function TT(n,e){let t;switch(e){case My:t="Linear";break;case Ey:t="Reinhard";break;case Sy:t="OptimizedCineon";break;case Ty:t="ACESFilmic";break;case Ay:t="AgX";break;case Cy:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function CT(n){return[n.extensionDerivatives||n.envMapCubeUVHeight||n.bumpMap||n.normalMapTangentSpace||n.clearcoatNormalMap||n.flatShading||n.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(n.extensionFragDepth||n.logarithmicDepthBuffer)&&n.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",n.extensionDrawBuffers&&n.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(n.extensionShaderTextureLOD||n.envMap||n.transmission)&&n.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(ds).join(`
`)}function AT(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":""].filter(ds).join(`
`)}function PT(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function RT(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){const o=n.getActiveAttrib(e,r),a=o.name;let c=1;o.type===n.FLOAT_MAT2&&(c=2),o.type===n.FLOAT_MAT3&&(c=3),o.type===n.FLOAT_MAT4&&(c=4),t[a]={type:o.type,location:n.getAttribLocation(e,a),locationSize:c}}return t}function ds(n){return n!==""}function Xf(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function qf(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const LT=/^[ \t]*#include +<([\w\d./]+)>/gm;function du(n){return n.replace(LT,DT)}const IT=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function DT(n,e){let t=rt[e];if(t===void 0){const i=IT.get(e);if(i!==void 0)t=rt[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return du(t)}const UT=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Yf(n){return n.replace(UT,NT)}function NT(n,e,t,i){let r="";for(let o=parseInt(e);o<parseInt(t);o++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+o+" ]").replace(/UNROLLED_LOOP_INDEX/g,o);return r}function Kf(n){let e="precision "+n.precision+` float;
precision `+n.precision+" int;";return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function OT(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===Um?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===Zb?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===vi&&(e="SHADOWMAP_TYPE_VSM"),e}function FT(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case ws:case Ms:e="ENVMAP_TYPE_CUBE";break;case hl:e="ENVMAP_TYPE_CUBE_UV";break}return e}function BT(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case Ms:e="ENVMAP_MODE_REFRACTION";break}return e}function kT(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case Nm:e="ENVMAP_BLENDING_MULTIPLY";break;case yy:e="ENVMAP_BLENDING_MIX";break;case wy:e="ENVMAP_BLENDING_ADD";break}return e}function VT(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:i,maxMip:t}}function zT(n,e,t,i){const r=n.getContext(),o=t.defines;let a=t.vertexShader,c=t.fragmentShader;const h=OT(t),d=FT(t),f=BT(t),m=kT(t),_=VT(t),x=t.isWebGL2?"":CT(t),y=AT(t),w=PT(o),v=r.createProgram();let g,R,E=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,w].filter(ds).join(`
`),g.length>0&&(g+=`
`),R=[x,"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,w].filter(ds).join(`
`),R.length>0&&(R+=`
`)):(g=[Kf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,w,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+f:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+h:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ds).join(`
`),R=[x,Kf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,w,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+d:"",t.envMap?"#define "+f:"",t.envMap?"#define "+m:"",_?"#define CUBEUV_TEXEL_WIDTH "+_.texelWidth:"",_?"#define CUBEUV_TEXEL_HEIGHT "+_.texelHeight:"",_?"#define CUBEUV_MAX_MIP "+_.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+h:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Zi?"#define TONE_MAPPING":"",t.toneMapping!==Zi?rt.tonemapping_pars_fragment:"",t.toneMapping!==Zi?TT("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",rt.colorspace_pars_fragment,ST("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(ds).join(`
`)),a=du(a),a=Xf(a,t),a=qf(a,t),c=du(c),c=Xf(c,t),c=qf(c,t),a=Yf(a),c=Yf(c),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(E=`#version 300 es
`,g=[y,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,R=["precision mediump sampler2DArray;","#define varying in",t.glslVersion===ff?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===ff?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+R);const S=E+g+a,F=E+R+c,L=Wf(r,r.VERTEX_SHADER,S),I=Wf(r,r.FRAGMENT_SHADER,F);r.attachShader(v,L),r.attachShader(v,I),t.index0AttributeName!==void 0?r.bindAttribLocation(v,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(v,0,"position"),r.linkProgram(v);function P(H){if(n.debug.checkShaderErrors){const ae=r.getProgramInfoLog(v).trim(),V=r.getShaderInfoLog(L).trim(),J=r.getShaderInfoLog(I).trim();let q=!0,ee=!0;if(r.getProgramParameter(v,r.LINK_STATUS)===!1)if(q=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(r,v,L,I);else{const K=jf(r,L,"vertex"),ue=jf(r,I,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(v,r.VALIDATE_STATUS)+`

Program Info Log: `+ae+`
`+K+`
`+ue)}else ae!==""?console.warn("THREE.WebGLProgram: Program Info Log:",ae):(V===""||J==="")&&(ee=!1);ee&&(H.diagnostics={runnable:q,programLog:ae,vertexShader:{log:V,prefix:g},fragmentShader:{log:J,prefix:R}})}r.deleteShader(L),r.deleteShader(I),M=new Ra(r,v),b=RT(r,v)}let M;this.getUniforms=function(){return M===void 0&&P(this),M};let b;this.getAttributes=function(){return b===void 0&&P(this),b};let N=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return N===!1&&(N=r.getProgramParameter(v,yT)),N},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=wT++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=L,this.fragmentShader=I,this}let HT=0;class GT{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(t),o=this._getShaderStage(i),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(o)===!1&&(a.add(o),o.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new WT(e),t.set(e,i)),i}}class WT{constructor(e){this.id=HT++,this.code=e,this.usedTimes=0}}function jT(n,e,t,i,r,o,a){const c=new Jm,h=new GT,d=[],f=r.isWebGL2,m=r.logarithmicDepthBuffer,_=r.vertexTextures;let x=r.precision;const y={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function w(M){return M===0?"uv":`uv${M}`}function v(M,b,N,H,ae){const V=H.fog,J=ae.geometry,q=M.isMeshStandardMaterial?H.environment:null,ee=(M.isMeshStandardMaterial?t:e).get(M.envMap||q),K=ee&&ee.mapping===hl?ee.image.height:null,ue=y[M.type];M.precision!==null&&(x=r.getMaxPrecision(M.precision),x!==M.precision&&console.warn("THREE.WebGLProgram.getParameters:",M.precision,"not supported, using",x,"instead."));const de=J.morphAttributes.position||J.morphAttributes.normal||J.morphAttributes.color,we=de!==void 0?de.length:0;let be=0;J.morphAttributes.position!==void 0&&(be=1),J.morphAttributes.normal!==void 0&&(be=2),J.morphAttributes.color!==void 0&&(be=3);let fe,ce,Me,Ie;if(ue){const Pt=jn[ue];fe=Pt.vertexShader,ce=Pt.fragmentShader}else fe=M.vertexShader,ce=M.fragmentShader,h.update(M),Me=h.getVertexShaderID(M),Ie=h.getFragmentShaderID(M);const Ue=n.getRenderTarget(),ge=ae.isInstancedMesh===!0,U=ae.isBatchedMesh===!0,B=!!M.map,W=!!M.matcap,T=!!ee,O=!!M.aoMap,G=!!M.lightMap,Q=!!M.bumpMap,Z=!!M.normalMap,oe=!!M.displacementMap,me=!!M.emissiveMap,D=!!M.metalnessMap,A=!!M.roughnessMap,z=M.anisotropy>0,ne=M.clearcoat>0,te=M.iridescence>0,se=M.sheen>0,ye=M.transmission>0,xe=z&&!!M.anisotropyMap,Ee=ne&&!!M.clearcoatMap,Ae=ne&&!!M.clearcoatNormalMap,Ve=ne&&!!M.clearcoatRoughnessMap,_e=te&&!!M.iridescenceMap,Je=te&&!!M.iridescenceThicknessMap,We=se&&!!M.sheenColorMap,Ge=se&&!!M.sheenRoughnessMap,ze=!!M.specularMap,Ce=!!M.specularColorMap,X=!!M.specularIntensityMap,ve=ye&&!!M.transmissionMap,De=ye&&!!M.thicknessMap,Ne=!!M.gradientMap,Se=!!M.alphaMap,Y=M.alphaTest>0,Re=!!M.alphaHash,Le=!!M.extensions,He=!!J.attributes.uv1,ke=!!J.attributes.uv2,ct=!!J.attributes.uv3;let ut=Zi;return M.toneMapped&&(Ue===null||Ue.isXRRenderTarget===!0)&&(ut=n.toneMapping),{isWebGL2:f,shaderID:ue,shaderType:M.type,shaderName:M.name,vertexShader:fe,fragmentShader:ce,defines:M.defines,customVertexShaderID:Me,customFragmentShaderID:Ie,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:x,batching:U,instancing:ge,instancingColor:ge&&ae.instanceColor!==null,supportsVertexTextures:_,outputColorSpace:Ue===null?n.outputColorSpace:Ue.isXRRenderTarget===!0?Ue.texture.colorSpace:Si,map:B,matcap:W,envMap:T,envMapMode:T&&ee.mapping,envMapCubeUVHeight:K,aoMap:O,lightMap:G,bumpMap:Q,normalMap:Z,displacementMap:_&&oe,emissiveMap:me,normalMapObjectSpace:Z&&M.normalMapType===Hy,normalMapTangentSpace:Z&&M.normalMapType===zy,metalnessMap:D,roughnessMap:A,anisotropy:z,anisotropyMap:xe,clearcoat:ne,clearcoatMap:Ee,clearcoatNormalMap:Ae,clearcoatRoughnessMap:Ve,iridescence:te,iridescenceMap:_e,iridescenceThicknessMap:Je,sheen:se,sheenColorMap:We,sheenRoughnessMap:Ge,specularMap:ze,specularColorMap:Ce,specularIntensityMap:X,transmission:ye,transmissionMap:ve,thicknessMap:De,gradientMap:Ne,opaque:M.transparent===!1&&M.blending===xs,alphaMap:Se,alphaTest:Y,alphaHash:Re,combine:M.combine,mapUv:B&&w(M.map.channel),aoMapUv:O&&w(M.aoMap.channel),lightMapUv:G&&w(M.lightMap.channel),bumpMapUv:Q&&w(M.bumpMap.channel),normalMapUv:Z&&w(M.normalMap.channel),displacementMapUv:oe&&w(M.displacementMap.channel),emissiveMapUv:me&&w(M.emissiveMap.channel),metalnessMapUv:D&&w(M.metalnessMap.channel),roughnessMapUv:A&&w(M.roughnessMap.channel),anisotropyMapUv:xe&&w(M.anisotropyMap.channel),clearcoatMapUv:Ee&&w(M.clearcoatMap.channel),clearcoatNormalMapUv:Ae&&w(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ve&&w(M.clearcoatRoughnessMap.channel),iridescenceMapUv:_e&&w(M.iridescenceMap.channel),iridescenceThicknessMapUv:Je&&w(M.iridescenceThicknessMap.channel),sheenColorMapUv:We&&w(M.sheenColorMap.channel),sheenRoughnessMapUv:Ge&&w(M.sheenRoughnessMap.channel),specularMapUv:ze&&w(M.specularMap.channel),specularColorMapUv:Ce&&w(M.specularColorMap.channel),specularIntensityMapUv:X&&w(M.specularIntensityMap.channel),transmissionMapUv:ve&&w(M.transmissionMap.channel),thicknessMapUv:De&&w(M.thicknessMap.channel),alphaMapUv:Se&&w(M.alphaMap.channel),vertexTangents:!!J.attributes.tangent&&(Z||z),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!J.attributes.color&&J.attributes.color.itemSize===4,vertexUv1s:He,vertexUv2s:ke,vertexUv3s:ct,pointsUvs:ae.isPoints===!0&&!!J.attributes.uv&&(B||Se),fog:!!V,useFog:M.fog===!0,fogExp2:V&&V.isFogExp2,flatShading:M.flatShading===!0,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:m,skinning:ae.isSkinnedMesh===!0,morphTargets:J.morphAttributes.position!==void 0,morphNormals:J.morphAttributes.normal!==void 0,morphColors:J.morphAttributes.color!==void 0,morphTargetsCount:we,morphTextureStride:be,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:M.dithering,shadowMapEnabled:n.shadowMap.enabled&&N.length>0,shadowMapType:n.shadowMap.type,toneMapping:ut,useLegacyLights:n._useLegacyLights,decodeVideoTexture:B&&M.map.isVideoTexture===!0&&wt.getTransfer(M.map.colorSpace)===Ct,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===Fn,flipSided:M.side===vn,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionDerivatives:Le&&M.extensions.derivatives===!0,extensionFragDepth:Le&&M.extensions.fragDepth===!0,extensionDrawBuffers:Le&&M.extensions.drawBuffers===!0,extensionShaderTextureLOD:Le&&M.extensions.shaderTextureLOD===!0,extensionClipCullDistance:Le&&M.extensions.clipCullDistance&&i.has("WEBGL_clip_cull_distance"),rendererExtensionFragDepth:f||i.has("EXT_frag_depth"),rendererExtensionDrawBuffers:f||i.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:f||i.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()}}function g(M){const b=[];if(M.shaderID?b.push(M.shaderID):(b.push(M.customVertexShaderID),b.push(M.customFragmentShaderID)),M.defines!==void 0)for(const N in M.defines)b.push(N),b.push(M.defines[N]);return M.isRawShaderMaterial===!1&&(R(b,M),E(b,M),b.push(n.outputColorSpace)),b.push(M.customProgramCacheKey),b.join()}function R(M,b){M.push(b.precision),M.push(b.outputColorSpace),M.push(b.envMapMode),M.push(b.envMapCubeUVHeight),M.push(b.mapUv),M.push(b.alphaMapUv),M.push(b.lightMapUv),M.push(b.aoMapUv),M.push(b.bumpMapUv),M.push(b.normalMapUv),M.push(b.displacementMapUv),M.push(b.emissiveMapUv),M.push(b.metalnessMapUv),M.push(b.roughnessMapUv),M.push(b.anisotropyMapUv),M.push(b.clearcoatMapUv),M.push(b.clearcoatNormalMapUv),M.push(b.clearcoatRoughnessMapUv),M.push(b.iridescenceMapUv),M.push(b.iridescenceThicknessMapUv),M.push(b.sheenColorMapUv),M.push(b.sheenRoughnessMapUv),M.push(b.specularMapUv),M.push(b.specularColorMapUv),M.push(b.specularIntensityMapUv),M.push(b.transmissionMapUv),M.push(b.thicknessMapUv),M.push(b.combine),M.push(b.fogExp2),M.push(b.sizeAttenuation),M.push(b.morphTargetsCount),M.push(b.morphAttributeCount),M.push(b.numDirLights),M.push(b.numPointLights),M.push(b.numSpotLights),M.push(b.numSpotLightMaps),M.push(b.numHemiLights),M.push(b.numRectAreaLights),M.push(b.numDirLightShadows),M.push(b.numPointLightShadows),M.push(b.numSpotLightShadows),M.push(b.numSpotLightShadowsWithMaps),M.push(b.numLightProbes),M.push(b.shadowMapType),M.push(b.toneMapping),M.push(b.numClippingPlanes),M.push(b.numClipIntersection),M.push(b.depthPacking)}function E(M,b){c.disableAll(),b.isWebGL2&&c.enable(0),b.supportsVertexTextures&&c.enable(1),b.instancing&&c.enable(2),b.instancingColor&&c.enable(3),b.matcap&&c.enable(4),b.envMap&&c.enable(5),b.normalMapObjectSpace&&c.enable(6),b.normalMapTangentSpace&&c.enable(7),b.clearcoat&&c.enable(8),b.iridescence&&c.enable(9),b.alphaTest&&c.enable(10),b.vertexColors&&c.enable(11),b.vertexAlphas&&c.enable(12),b.vertexUv1s&&c.enable(13),b.vertexUv2s&&c.enable(14),b.vertexUv3s&&c.enable(15),b.vertexTangents&&c.enable(16),b.anisotropy&&c.enable(17),b.alphaHash&&c.enable(18),b.batching&&c.enable(19),M.push(c.mask),c.disableAll(),b.fog&&c.enable(0),b.useFog&&c.enable(1),b.flatShading&&c.enable(2),b.logarithmicDepthBuffer&&c.enable(3),b.skinning&&c.enable(4),b.morphTargets&&c.enable(5),b.morphNormals&&c.enable(6),b.morphColors&&c.enable(7),b.premultipliedAlpha&&c.enable(8),b.shadowMapEnabled&&c.enable(9),b.useLegacyLights&&c.enable(10),b.doubleSided&&c.enable(11),b.flipSided&&c.enable(12),b.useDepthPacking&&c.enable(13),b.dithering&&c.enable(14),b.transmission&&c.enable(15),b.sheen&&c.enable(16),b.opaque&&c.enable(17),b.pointsUvs&&c.enable(18),b.decodeVideoTexture&&c.enable(19),M.push(c.mask)}function S(M){const b=y[M.type];let N;if(b){const H=jn[b];N=gl.clone(H.uniforms)}else N=M.uniforms;return N}function F(M,b){let N;for(let H=0,ae=d.length;H<ae;H++){const V=d[H];if(V.cacheKey===b){N=V,++N.usedTimes;break}}return N===void 0&&(N=new zT(n,b,M,o),d.push(N)),N}function L(M){if(--M.usedTimes===0){const b=d.indexOf(M);d[b]=d[d.length-1],d.pop(),M.destroy()}}function I(M){h.remove(M)}function P(){h.dispose()}return{getParameters:v,getProgramCacheKey:g,getUniforms:S,acquireProgram:F,releaseProgram:L,releaseShaderCache:I,programs:d,dispose:P}}function XT(){let n=new WeakMap;function e(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function t(o){n.delete(o)}function i(o,a,c){n.get(o)[a]=c}function r(){n=new WeakMap}return{get:e,remove:t,update:i,dispose:r}}function qT(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function $f(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function Zf(){const n=[];let e=0;const t=[],i=[],r=[];function o(){e=0,t.length=0,i.length=0,r.length=0}function a(m,_,x,y,w,v){let g=n[e];return g===void 0?(g={id:m.id,object:m,geometry:_,material:x,groupOrder:y,renderOrder:m.renderOrder,z:w,group:v},n[e]=g):(g.id=m.id,g.object=m,g.geometry=_,g.material=x,g.groupOrder=y,g.renderOrder=m.renderOrder,g.z=w,g.group=v),e++,g}function c(m,_,x,y,w,v){const g=a(m,_,x,y,w,v);x.transmission>0?i.push(g):x.transparent===!0?r.push(g):t.push(g)}function h(m,_,x,y,w,v){const g=a(m,_,x,y,w,v);x.transmission>0?i.unshift(g):x.transparent===!0?r.unshift(g):t.unshift(g)}function d(m,_){t.length>1&&t.sort(m||qT),i.length>1&&i.sort(_||$f),r.length>1&&r.sort(_||$f)}function f(){for(let m=e,_=n.length;m<_;m++){const x=n[m];if(x.id===null)break;x.id=null,x.object=null,x.geometry=null,x.material=null,x.group=null}}return{opaque:t,transmissive:i,transparent:r,init:o,push:c,unshift:h,finish:f,sort:d}}function YT(){let n=new WeakMap;function e(i,r){const o=n.get(i);let a;return o===void 0?(a=new Zf,n.set(i,[a])):r>=o.length?(a=new Zf,o.push(a)):a=o[r],a}function t(){n=new WeakMap}return{get:e,dispose:t}}function KT(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new $,color:new lt};break;case"SpotLight":t={position:new $,direction:new $,color:new lt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new $,color:new lt,distance:0,decay:0};break;case"HemisphereLight":t={direction:new $,skyColor:new lt,groundColor:new lt};break;case"RectAreaLight":t={color:new lt,position:new $,halfWidth:new $,halfHeight:new $};break}return n[e.id]=t,t}}}function $T(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let ZT=0;function JT(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function QT(n,e){const t=new KT,i=$T(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let f=0;f<9;f++)r.probe.push(new $);const o=new $,a=new Ut,c=new Ut;function h(f,m){let _=0,x=0,y=0;for(let H=0;H<9;H++)r.probe[H].set(0,0,0);let w=0,v=0,g=0,R=0,E=0,S=0,F=0,L=0,I=0,P=0,M=0;f.sort(JT);const b=m===!0?Math.PI:1;for(let H=0,ae=f.length;H<ae;H++){const V=f[H],J=V.color,q=V.intensity,ee=V.distance,K=V.shadow&&V.shadow.map?V.shadow.map.texture:null;if(V.isAmbientLight)_+=J.r*q*b,x+=J.g*q*b,y+=J.b*q*b;else if(V.isLightProbe){for(let ue=0;ue<9;ue++)r.probe[ue].addScaledVector(V.sh.coefficients[ue],q);M++}else if(V.isDirectionalLight){const ue=t.get(V);if(ue.color.copy(V.color).multiplyScalar(V.intensity*b),V.castShadow){const de=V.shadow,we=i.get(V);we.shadowBias=de.bias,we.shadowNormalBias=de.normalBias,we.shadowRadius=de.radius,we.shadowMapSize=de.mapSize,r.directionalShadow[w]=we,r.directionalShadowMap[w]=K,r.directionalShadowMatrix[w]=V.shadow.matrix,S++}r.directional[w]=ue,w++}else if(V.isSpotLight){const ue=t.get(V);ue.position.setFromMatrixPosition(V.matrixWorld),ue.color.copy(J).multiplyScalar(q*b),ue.distance=ee,ue.coneCos=Math.cos(V.angle),ue.penumbraCos=Math.cos(V.angle*(1-V.penumbra)),ue.decay=V.decay,r.spot[g]=ue;const de=V.shadow;if(V.map&&(r.spotLightMap[I]=V.map,I++,de.updateMatrices(V),V.castShadow&&P++),r.spotLightMatrix[g]=de.matrix,V.castShadow){const we=i.get(V);we.shadowBias=de.bias,we.shadowNormalBias=de.normalBias,we.shadowRadius=de.radius,we.shadowMapSize=de.mapSize,r.spotShadow[g]=we,r.spotShadowMap[g]=K,L++}g++}else if(V.isRectAreaLight){const ue=t.get(V);ue.color.copy(J).multiplyScalar(q),ue.halfWidth.set(V.width*.5,0,0),ue.halfHeight.set(0,V.height*.5,0),r.rectArea[R]=ue,R++}else if(V.isPointLight){const ue=t.get(V);if(ue.color.copy(V.color).multiplyScalar(V.intensity*b),ue.distance=V.distance,ue.decay=V.decay,V.castShadow){const de=V.shadow,we=i.get(V);we.shadowBias=de.bias,we.shadowNormalBias=de.normalBias,we.shadowRadius=de.radius,we.shadowMapSize=de.mapSize,we.shadowCameraNear=de.camera.near,we.shadowCameraFar=de.camera.far,r.pointShadow[v]=we,r.pointShadowMap[v]=K,r.pointShadowMatrix[v]=V.shadow.matrix,F++}r.point[v]=ue,v++}else if(V.isHemisphereLight){const ue=t.get(V);ue.skyColor.copy(V.color).multiplyScalar(q*b),ue.groundColor.copy(V.groundColor).multiplyScalar(q*b),r.hemi[E]=ue,E++}}R>0&&(e.isWebGL2?n.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=Pe.LTC_FLOAT_1,r.rectAreaLTC2=Pe.LTC_FLOAT_2):(r.rectAreaLTC1=Pe.LTC_HALF_1,r.rectAreaLTC2=Pe.LTC_HALF_2):n.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=Pe.LTC_FLOAT_1,r.rectAreaLTC2=Pe.LTC_FLOAT_2):n.has("OES_texture_half_float_linear")===!0?(r.rectAreaLTC1=Pe.LTC_HALF_1,r.rectAreaLTC2=Pe.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),r.ambient[0]=_,r.ambient[1]=x,r.ambient[2]=y;const N=r.hash;(N.directionalLength!==w||N.pointLength!==v||N.spotLength!==g||N.rectAreaLength!==R||N.hemiLength!==E||N.numDirectionalShadows!==S||N.numPointShadows!==F||N.numSpotShadows!==L||N.numSpotMaps!==I||N.numLightProbes!==M)&&(r.directional.length=w,r.spot.length=g,r.rectArea.length=R,r.point.length=v,r.hemi.length=E,r.directionalShadow.length=S,r.directionalShadowMap.length=S,r.pointShadow.length=F,r.pointShadowMap.length=F,r.spotShadow.length=L,r.spotShadowMap.length=L,r.directionalShadowMatrix.length=S,r.pointShadowMatrix.length=F,r.spotLightMatrix.length=L+I-P,r.spotLightMap.length=I,r.numSpotLightShadowsWithMaps=P,r.numLightProbes=M,N.directionalLength=w,N.pointLength=v,N.spotLength=g,N.rectAreaLength=R,N.hemiLength=E,N.numDirectionalShadows=S,N.numPointShadows=F,N.numSpotShadows=L,N.numSpotMaps=I,N.numLightProbes=M,r.version=ZT++)}function d(f,m){let _=0,x=0,y=0,w=0,v=0;const g=m.matrixWorldInverse;for(let R=0,E=f.length;R<E;R++){const S=f[R];if(S.isDirectionalLight){const F=r.directional[_];F.direction.setFromMatrixPosition(S.matrixWorld),o.setFromMatrixPosition(S.target.matrixWorld),F.direction.sub(o),F.direction.transformDirection(g),_++}else if(S.isSpotLight){const F=r.spot[y];F.position.setFromMatrixPosition(S.matrixWorld),F.position.applyMatrix4(g),F.direction.setFromMatrixPosition(S.matrixWorld),o.setFromMatrixPosition(S.target.matrixWorld),F.direction.sub(o),F.direction.transformDirection(g),y++}else if(S.isRectAreaLight){const F=r.rectArea[w];F.position.setFromMatrixPosition(S.matrixWorld),F.position.applyMatrix4(g),c.identity(),a.copy(S.matrixWorld),a.premultiply(g),c.extractRotation(a),F.halfWidth.set(S.width*.5,0,0),F.halfHeight.set(0,S.height*.5,0),F.halfWidth.applyMatrix4(c),F.halfHeight.applyMatrix4(c),w++}else if(S.isPointLight){const F=r.point[x];F.position.setFromMatrixPosition(S.matrixWorld),F.position.applyMatrix4(g),x++}else if(S.isHemisphereLight){const F=r.hemi[v];F.direction.setFromMatrixPosition(S.matrixWorld),F.direction.transformDirection(g),v++}}}return{setup:h,setupView:d,state:r}}function Jf(n,e){const t=new QT(n,e),i=[],r=[];function o(){i.length=0,r.length=0}function a(m){i.push(m)}function c(m){r.push(m)}function h(m){t.setup(i,m)}function d(m){t.setupView(i,m)}return{init:o,state:{lightsArray:i,shadowsArray:r,lights:t},setupLights:h,setupLightsView:d,pushLight:a,pushShadow:c}}function e1(n,e){let t=new WeakMap;function i(o,a=0){const c=t.get(o);let h;return c===void 0?(h=new Jf(n,e),t.set(o,[h])):a>=c.length?(h=new Jf(n,e),c.push(h)):h=c[a],h}function r(){t=new WeakMap}return{get:i,dispose:r}}class fg extends ml{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=ky,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class t1 extends ml{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const n1=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,i1=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function r1(n,e,t){let i=new sg;const r=new Oe,o=new Oe,a=new It,c=new fg({depthPacking:Vy}),h=new t1,d={},f=t.maxTextureSize,m={[tr]:vn,[vn]:tr,[Fn]:Fn},_=new wn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Oe},radius:{value:4}},vertexShader:n1,fragmentShader:i1}),x=_.clone();x.defines.HORIZONTAL_PASS=1;const y=new ir;y.setAttribute("position",new mn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const w=new gn(y,_),v=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Um;let g=this.type;this.render=function(L,I,P){if(v.enabled===!1||v.autoUpdate===!1&&v.needsUpdate===!1||L.length===0)return;const M=n.getRenderTarget(),b=n.getActiveCubeFace(),N=n.getActiveMipmapLevel(),H=n.state;H.setBlending($i),H.buffers.color.setClear(1,1,1,1),H.buffers.depth.setTest(!0),H.setScissorTest(!1);const ae=g!==vi&&this.type===vi,V=g===vi&&this.type!==vi;for(let J=0,q=L.length;J<q;J++){const ee=L[J],K=ee.shadow;if(K===void 0){console.warn("THREE.WebGLShadowMap:",ee,"has no shadow.");continue}if(K.autoUpdate===!1&&K.needsUpdate===!1)continue;r.copy(K.mapSize);const ue=K.getFrameExtents();if(r.multiply(ue),o.copy(K.mapSize),(r.x>f||r.y>f)&&(r.x>f&&(o.x=Math.floor(f/ue.x),r.x=o.x*ue.x,K.mapSize.x=o.x),r.y>f&&(o.y=Math.floor(f/ue.y),r.y=o.y*ue.y,K.mapSize.y=o.y)),K.map===null||ae===!0||V===!0){const we=this.type!==vi?{minFilter:$t,magFilter:$t}:{};K.map!==null&&K.map.dispose(),K.map=new ii(r.x,r.y,we),K.map.texture.name=ee.name+".shadowMap",K.camera.updateProjectionMatrix()}n.setRenderTarget(K.map),n.clear();const de=K.getViewportCount();for(let we=0;we<de;we++){const be=K.getViewport(we);a.set(o.x*be.x,o.y*be.y,o.x*be.z,o.y*be.w),H.viewport(a),K.updateMatrices(ee,we),i=K.getFrustum(),S(I,P,K.camera,ee,this.type)}K.isPointLightShadow!==!0&&this.type===vi&&R(K,P),K.needsUpdate=!1}g=this.type,v.needsUpdate=!1,n.setRenderTarget(M,b,N)};function R(L,I){const P=e.update(w);_.defines.VSM_SAMPLES!==L.blurSamples&&(_.defines.VSM_SAMPLES=L.blurSamples,x.defines.VSM_SAMPLES=L.blurSamples,_.needsUpdate=!0,x.needsUpdate=!0),L.mapPass===null&&(L.mapPass=new ii(r.x,r.y)),_.uniforms.shadow_pass.value=L.map.texture,_.uniforms.resolution.value=L.mapSize,_.uniforms.radius.value=L.radius,n.setRenderTarget(L.mapPass),n.clear(),n.renderBufferDirect(I,null,P,_,w,null),x.uniforms.shadow_pass.value=L.mapPass.texture,x.uniforms.resolution.value=L.mapSize,x.uniforms.radius.value=L.radius,n.setRenderTarget(L.map),n.clear(),n.renderBufferDirect(I,null,P,x,w,null)}function E(L,I,P,M){let b=null;const N=P.isPointLight===!0?L.customDistanceMaterial:L.customDepthMaterial;if(N!==void 0)b=N;else if(b=P.isPointLight===!0?h:c,n.localClippingEnabled&&I.clipShadows===!0&&Array.isArray(I.clippingPlanes)&&I.clippingPlanes.length!==0||I.displacementMap&&I.displacementScale!==0||I.alphaMap&&I.alphaTest>0||I.map&&I.alphaTest>0){const H=b.uuid,ae=I.uuid;let V=d[H];V===void 0&&(V={},d[H]=V);let J=V[ae];J===void 0&&(J=b.clone(),V[ae]=J,I.addEventListener("dispose",F)),b=J}if(b.visible=I.visible,b.wireframe=I.wireframe,M===vi?b.side=I.shadowSide!==null?I.shadowSide:I.side:b.side=I.shadowSide!==null?I.shadowSide:m[I.side],b.alphaMap=I.alphaMap,b.alphaTest=I.alphaTest,b.map=I.map,b.clipShadows=I.clipShadows,b.clippingPlanes=I.clippingPlanes,b.clipIntersection=I.clipIntersection,b.displacementMap=I.displacementMap,b.displacementScale=I.displacementScale,b.displacementBias=I.displacementBias,b.wireframeLinewidth=I.wireframeLinewidth,b.linewidth=I.linewidth,P.isPointLight===!0&&b.isMeshDistanceMaterial===!0){const H=n.properties.get(b);H.light=P}return b}function S(L,I,P,M,b){if(L.visible===!1)return;if(L.layers.test(I.layers)&&(L.isMesh||L.isLine||L.isPoints)&&(L.castShadow||L.receiveShadow&&b===vi)&&(!L.frustumCulled||i.intersectsObject(L))){L.modelViewMatrix.multiplyMatrices(P.matrixWorldInverse,L.matrixWorld);const ae=e.update(L),V=L.material;if(Array.isArray(V)){const J=ae.groups;for(let q=0,ee=J.length;q<ee;q++){const K=J[q],ue=V[K.materialIndex];if(ue&&ue.visible){const de=E(L,ue,M,b);L.onBeforeShadow(n,L,I,P,ae,de,K),n.renderBufferDirect(P,null,ae,de,L,K),L.onAfterShadow(n,L,I,P,ae,de,K)}}}else if(V.visible){const J=E(L,V,M,b);L.onBeforeShadow(n,L,I,P,ae,J,null),n.renderBufferDirect(P,null,ae,J,L,null),L.onAfterShadow(n,L,I,P,ae,J,null)}}const H=L.children;for(let ae=0,V=H.length;ae<V;ae++)S(H[ae],I,P,M,b)}function F(L){L.target.removeEventListener("dispose",F);for(const P in d){const M=d[P],b=L.target.uuid;b in M&&(M[b].dispose(),delete M[b])}}}function s1(n,e,t){const i=t.isWebGL2;function r(){let Y=!1;const Re=new It;let Le=null;const He=new It(0,0,0,0);return{setMask:function(ke){Le!==ke&&!Y&&(n.colorMask(ke,ke,ke,ke),Le=ke)},setLocked:function(ke){Y=ke},setClear:function(ke,ct,ut,dt,Pt){Pt===!0&&(ke*=dt,ct*=dt,ut*=dt),Re.set(ke,ct,ut,dt),He.equals(Re)===!1&&(n.clearColor(ke,ct,ut,dt),He.copy(Re))},reset:function(){Y=!1,Le=null,He.set(-1,0,0,0)}}}function o(){let Y=!1,Re=null,Le=null,He=null;return{setTest:function(ke){ke?U(n.DEPTH_TEST):B(n.DEPTH_TEST)},setMask:function(ke){Re!==ke&&!Y&&(n.depthMask(ke),Re=ke)},setFunc:function(ke){if(Le!==ke){switch(ke){case py:n.depthFunc(n.NEVER);break;case my:n.depthFunc(n.ALWAYS);break;case gy:n.depthFunc(n.LESS);break;case Ha:n.depthFunc(n.LEQUAL);break;case vy:n.depthFunc(n.EQUAL);break;case _y:n.depthFunc(n.GEQUAL);break;case xy:n.depthFunc(n.GREATER);break;case by:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}Le=ke}},setLocked:function(ke){Y=ke},setClear:function(ke){He!==ke&&(n.clearDepth(ke),He=ke)},reset:function(){Y=!1,Re=null,Le=null,He=null}}}function a(){let Y=!1,Re=null,Le=null,He=null,ke=null,ct=null,ut=null,dt=null,Pt=null;return{setTest:function(ft){Y||(ft?U(n.STENCIL_TEST):B(n.STENCIL_TEST))},setMask:function(ft){Re!==ft&&!Y&&(n.stencilMask(ft),Re=ft)},setFunc:function(ft,Zt,nn){(Le!==ft||He!==Zt||ke!==nn)&&(n.stencilFunc(ft,Zt,nn),Le=ft,He=Zt,ke=nn)},setOp:function(ft,Zt,nn){(ct!==ft||ut!==Zt||dt!==nn)&&(n.stencilOp(ft,Zt,nn),ct=ft,ut=Zt,dt=nn)},setLocked:function(ft){Y=ft},setClear:function(ft){Pt!==ft&&(n.clearStencil(ft),Pt=ft)},reset:function(){Y=!1,Re=null,Le=null,He=null,ke=null,ct=null,ut=null,dt=null,Pt=null}}}const c=new r,h=new o,d=new a,f=new WeakMap,m=new WeakMap;let _={},x={},y=new WeakMap,w=[],v=null,g=!1,R=null,E=null,S=null,F=null,L=null,I=null,P=null,M=new lt(0,0,0),b=0,N=!1,H=null,ae=null,V=null,J=null,q=null;const ee=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let K=!1,ue=0;const de=n.getParameter(n.VERSION);de.indexOf("WebGL")!==-1?(ue=parseFloat(/^WebGL (\d)/.exec(de)[1]),K=ue>=1):de.indexOf("OpenGL ES")!==-1&&(ue=parseFloat(/^OpenGL ES (\d)/.exec(de)[1]),K=ue>=2);let we=null,be={};const fe=n.getParameter(n.SCISSOR_BOX),ce=n.getParameter(n.VIEWPORT),Me=new It().fromArray(fe),Ie=new It().fromArray(ce);function Ue(Y,Re,Le,He){const ke=new Uint8Array(4),ct=n.createTexture();n.bindTexture(Y,ct),n.texParameteri(Y,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(Y,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let ut=0;ut<Le;ut++)i&&(Y===n.TEXTURE_3D||Y===n.TEXTURE_2D_ARRAY)?n.texImage3D(Re,0,n.RGBA,1,1,He,0,n.RGBA,n.UNSIGNED_BYTE,ke):n.texImage2D(Re+ut,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,ke);return ct}const ge={};ge[n.TEXTURE_2D]=Ue(n.TEXTURE_2D,n.TEXTURE_2D,1),ge[n.TEXTURE_CUBE_MAP]=Ue(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),i&&(ge[n.TEXTURE_2D_ARRAY]=Ue(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),ge[n.TEXTURE_3D]=Ue(n.TEXTURE_3D,n.TEXTURE_3D,1,1)),c.setClear(0,0,0,1),h.setClear(1),d.setClear(0),U(n.DEPTH_TEST),h.setFunc(Ha),me(!1),D(Nd),U(n.CULL_FACE),Z($i);function U(Y){_[Y]!==!0&&(n.enable(Y),_[Y]=!0)}function B(Y){_[Y]!==!1&&(n.disable(Y),_[Y]=!1)}function W(Y,Re){return x[Y]!==Re?(n.bindFramebuffer(Y,Re),x[Y]=Re,i&&(Y===n.DRAW_FRAMEBUFFER&&(x[n.FRAMEBUFFER]=Re),Y===n.FRAMEBUFFER&&(x[n.DRAW_FRAMEBUFFER]=Re)),!0):!1}function T(Y,Re){let Le=w,He=!1;if(Y)if(Le=y.get(Re),Le===void 0&&(Le=[],y.set(Re,Le)),Y.isWebGLMultipleRenderTargets){const ke=Y.texture;if(Le.length!==ke.length||Le[0]!==n.COLOR_ATTACHMENT0){for(let ct=0,ut=ke.length;ct<ut;ct++)Le[ct]=n.COLOR_ATTACHMENT0+ct;Le.length=ke.length,He=!0}}else Le[0]!==n.COLOR_ATTACHMENT0&&(Le[0]=n.COLOR_ATTACHMENT0,He=!0);else Le[0]!==n.BACK&&(Le[0]=n.BACK,He=!0);He&&(t.isWebGL2?n.drawBuffers(Le):e.get("WEBGL_draw_buffers").drawBuffersWEBGL(Le))}function O(Y){return v!==Y?(n.useProgram(Y),v=Y,!0):!1}const G={[_r]:n.FUNC_ADD,[Qb]:n.FUNC_SUBTRACT,[ey]:n.FUNC_REVERSE_SUBTRACT};if(i)G[Bd]=n.MIN,G[kd]=n.MAX;else{const Y=e.get("EXT_blend_minmax");Y!==null&&(G[Bd]=Y.MIN_EXT,G[kd]=Y.MAX_EXT)}const Q={[ty]:n.ZERO,[ny]:n.ONE,[iy]:n.SRC_COLOR,[iu]:n.SRC_ALPHA,[cy]:n.SRC_ALPHA_SATURATE,[ay]:n.DST_COLOR,[sy]:n.DST_ALPHA,[ry]:n.ONE_MINUS_SRC_COLOR,[ru]:n.ONE_MINUS_SRC_ALPHA,[ly]:n.ONE_MINUS_DST_COLOR,[oy]:n.ONE_MINUS_DST_ALPHA,[uy]:n.CONSTANT_COLOR,[hy]:n.ONE_MINUS_CONSTANT_COLOR,[dy]:n.CONSTANT_ALPHA,[fy]:n.ONE_MINUS_CONSTANT_ALPHA};function Z(Y,Re,Le,He,ke,ct,ut,dt,Pt,ft){if(Y===$i){g===!0&&(B(n.BLEND),g=!1);return}if(g===!1&&(U(n.BLEND),g=!0),Y!==Jb){if(Y!==R||ft!==N){if((E!==_r||L!==_r)&&(n.blendEquation(n.FUNC_ADD),E=_r,L=_r),ft)switch(Y){case xs:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case nu:n.blendFunc(n.ONE,n.ONE);break;case Od:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Fd:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",Y);break}else switch(Y){case xs:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case nu:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case Od:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Fd:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",Y);break}S=null,F=null,I=null,P=null,M.set(0,0,0),b=0,R=Y,N=ft}return}ke=ke||Re,ct=ct||Le,ut=ut||He,(Re!==E||ke!==L)&&(n.blendEquationSeparate(G[Re],G[ke]),E=Re,L=ke),(Le!==S||He!==F||ct!==I||ut!==P)&&(n.blendFuncSeparate(Q[Le],Q[He],Q[ct],Q[ut]),S=Le,F=He,I=ct,P=ut),(dt.equals(M)===!1||Pt!==b)&&(n.blendColor(dt.r,dt.g,dt.b,Pt),M.copy(dt),b=Pt),R=Y,N=!1}function oe(Y,Re){Y.side===Fn?B(n.CULL_FACE):U(n.CULL_FACE);let Le=Y.side===vn;Re&&(Le=!Le),me(Le),Y.blending===xs&&Y.transparent===!1?Z($i):Z(Y.blending,Y.blendEquation,Y.blendSrc,Y.blendDst,Y.blendEquationAlpha,Y.blendSrcAlpha,Y.blendDstAlpha,Y.blendColor,Y.blendAlpha,Y.premultipliedAlpha),h.setFunc(Y.depthFunc),h.setTest(Y.depthTest),h.setMask(Y.depthWrite),c.setMask(Y.colorWrite);const He=Y.stencilWrite;d.setTest(He),He&&(d.setMask(Y.stencilWriteMask),d.setFunc(Y.stencilFunc,Y.stencilRef,Y.stencilFuncMask),d.setOp(Y.stencilFail,Y.stencilZFail,Y.stencilZPass)),z(Y.polygonOffset,Y.polygonOffsetFactor,Y.polygonOffsetUnits),Y.alphaToCoverage===!0?U(n.SAMPLE_ALPHA_TO_COVERAGE):B(n.SAMPLE_ALPHA_TO_COVERAGE)}function me(Y){H!==Y&&(Y?n.frontFace(n.CW):n.frontFace(n.CCW),H=Y)}function D(Y){Y!==Kb?(U(n.CULL_FACE),Y!==ae&&(Y===Nd?n.cullFace(n.BACK):Y===$b?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):B(n.CULL_FACE),ae=Y}function A(Y){Y!==V&&(K&&n.lineWidth(Y),V=Y)}function z(Y,Re,Le){Y?(U(n.POLYGON_OFFSET_FILL),(J!==Re||q!==Le)&&(n.polygonOffset(Re,Le),J=Re,q=Le)):B(n.POLYGON_OFFSET_FILL)}function ne(Y){Y?U(n.SCISSOR_TEST):B(n.SCISSOR_TEST)}function te(Y){Y===void 0&&(Y=n.TEXTURE0+ee-1),we!==Y&&(n.activeTexture(Y),we=Y)}function se(Y,Re,Le){Le===void 0&&(we===null?Le=n.TEXTURE0+ee-1:Le=we);let He=be[Le];He===void 0&&(He={type:void 0,texture:void 0},be[Le]=He),(He.type!==Y||He.texture!==Re)&&(we!==Le&&(n.activeTexture(Le),we=Le),n.bindTexture(Y,Re||ge[Y]),He.type=Y,He.texture=Re)}function ye(){const Y=be[we];Y!==void 0&&Y.type!==void 0&&(n.bindTexture(Y.type,null),Y.type=void 0,Y.texture=void 0)}function xe(){try{n.compressedTexImage2D.apply(n,arguments)}catch(Y){console.error("THREE.WebGLState:",Y)}}function Ee(){try{n.compressedTexImage3D.apply(n,arguments)}catch(Y){console.error("THREE.WebGLState:",Y)}}function Ae(){try{n.texSubImage2D.apply(n,arguments)}catch(Y){console.error("THREE.WebGLState:",Y)}}function Ve(){try{n.texSubImage3D.apply(n,arguments)}catch(Y){console.error("THREE.WebGLState:",Y)}}function _e(){try{n.compressedTexSubImage2D.apply(n,arguments)}catch(Y){console.error("THREE.WebGLState:",Y)}}function Je(){try{n.compressedTexSubImage3D.apply(n,arguments)}catch(Y){console.error("THREE.WebGLState:",Y)}}function We(){try{n.texStorage2D.apply(n,arguments)}catch(Y){console.error("THREE.WebGLState:",Y)}}function Ge(){try{n.texStorage3D.apply(n,arguments)}catch(Y){console.error("THREE.WebGLState:",Y)}}function ze(){try{n.texImage2D.apply(n,arguments)}catch(Y){console.error("THREE.WebGLState:",Y)}}function Ce(){try{n.texImage3D.apply(n,arguments)}catch(Y){console.error("THREE.WebGLState:",Y)}}function X(Y){Me.equals(Y)===!1&&(n.scissor(Y.x,Y.y,Y.z,Y.w),Me.copy(Y))}function ve(Y){Ie.equals(Y)===!1&&(n.viewport(Y.x,Y.y,Y.z,Y.w),Ie.copy(Y))}function De(Y,Re){let Le=m.get(Re);Le===void 0&&(Le=new WeakMap,m.set(Re,Le));let He=Le.get(Y);He===void 0&&(He=n.getUniformBlockIndex(Re,Y.name),Le.set(Y,He))}function Ne(Y,Re){const He=m.get(Re).get(Y);f.get(Re)!==He&&(n.uniformBlockBinding(Re,He,Y.__bindingPointIndex),f.set(Re,He))}function Se(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),i===!0&&(n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null)),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),_={},we=null,be={},x={},y=new WeakMap,w=[],v=null,g=!1,R=null,E=null,S=null,F=null,L=null,I=null,P=null,M=new lt(0,0,0),b=0,N=!1,H=null,ae=null,V=null,J=null,q=null,Me.set(0,0,n.canvas.width,n.canvas.height),Ie.set(0,0,n.canvas.width,n.canvas.height),c.reset(),h.reset(),d.reset()}return{buffers:{color:c,depth:h,stencil:d},enable:U,disable:B,bindFramebuffer:W,drawBuffers:T,useProgram:O,setBlending:Z,setMaterial:oe,setFlipSided:me,setCullFace:D,setLineWidth:A,setPolygonOffset:z,setScissorTest:ne,activeTexture:te,bindTexture:se,unbindTexture:ye,compressedTexImage2D:xe,compressedTexImage3D:Ee,texImage2D:ze,texImage3D:Ce,updateUBOMapping:De,uniformBlockBinding:Ne,texStorage2D:We,texStorage3D:Ge,texSubImage2D:Ae,texSubImage3D:Ve,compressedTexSubImage2D:_e,compressedTexSubImage3D:Je,scissor:X,viewport:ve,reset:Se}}function o1(n,e,t,i,r,o,a){const c=r.isWebGL2,h=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,d=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),f=new WeakMap;let m;const _=new WeakMap;let x=!1;try{x=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(D,A){return x?new OffscreenCanvas(D,A):$a("canvas")}function w(D,A,z,ne){let te=1;if((D.width>ne||D.height>ne)&&(te=ne/Math.max(D.width,D.height)),te<1||A===!0)if(typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&D instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&D instanceof ImageBitmap){const se=A?Ka:Math.floor,ye=se(te*D.width),xe=se(te*D.height);m===void 0&&(m=y(ye,xe));const Ee=z?y(ye,xe):m;return Ee.width=ye,Ee.height=xe,Ee.getContext("2d").drawImage(D,0,0,ye,xe),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+D.width+"x"+D.height+") to ("+ye+"x"+xe+")."),Ee}else return"data"in D&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+D.width+"x"+D.height+")."),D;return D}function v(D){return uu(D.width)&&uu(D.height)}function g(D){return c?!1:D.wrapS!==Bn||D.wrapT!==Bn||D.minFilter!==$t&&D.minFilter!==Cn}function R(D,A){return D.generateMipmaps&&A&&D.minFilter!==$t&&D.minFilter!==Cn}function E(D){n.generateMipmap(D)}function S(D,A,z,ne,te=!1){if(c===!1)return A;if(D!==null){if(n[D]!==void 0)return n[D];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+D+"'")}let se=A;if(A===n.RED&&(z===n.FLOAT&&(se=n.R32F),z===n.HALF_FLOAT&&(se=n.R16F),z===n.UNSIGNED_BYTE&&(se=n.R8)),A===n.RED_INTEGER&&(z===n.UNSIGNED_BYTE&&(se=n.R8UI),z===n.UNSIGNED_SHORT&&(se=n.R16UI),z===n.UNSIGNED_INT&&(se=n.R32UI),z===n.BYTE&&(se=n.R8I),z===n.SHORT&&(se=n.R16I),z===n.INT&&(se=n.R32I)),A===n.RG&&(z===n.FLOAT&&(se=n.RG32F),z===n.HALF_FLOAT&&(se=n.RG16F),z===n.UNSIGNED_BYTE&&(se=n.RG8)),A===n.RGBA){const ye=te?ja:wt.getTransfer(ne);z===n.FLOAT&&(se=n.RGBA32F),z===n.HALF_FLOAT&&(se=n.RGBA16F),z===n.UNSIGNED_BYTE&&(se=ye===Ct?n.SRGB8_ALPHA8:n.RGBA8),z===n.UNSIGNED_SHORT_4_4_4_4&&(se=n.RGBA4),z===n.UNSIGNED_SHORT_5_5_5_1&&(se=n.RGB5_A1)}return(se===n.R16F||se===n.R32F||se===n.RG16F||se===n.RG32F||se===n.RGBA16F||se===n.RGBA32F)&&e.get("EXT_color_buffer_float"),se}function F(D,A,z){return R(D,z)===!0||D.isFramebufferTexture&&D.minFilter!==$t&&D.minFilter!==Cn?Math.log2(Math.max(A.width,A.height))+1:D.mipmaps!==void 0&&D.mipmaps.length>0?D.mipmaps.length:D.isCompressedTexture&&Array.isArray(D.image)?A.mipmaps.length:1}function L(D){return D===$t||D===au||D===Pa?n.NEAREST:n.LINEAR}function I(D){const A=D.target;A.removeEventListener("dispose",I),M(A),A.isVideoTexture&&f.delete(A)}function P(D){const A=D.target;A.removeEventListener("dispose",P),N(A)}function M(D){const A=i.get(D);if(A.__webglInit===void 0)return;const z=D.source,ne=_.get(z);if(ne){const te=ne[A.__cacheKey];te.usedTimes--,te.usedTimes===0&&b(D),Object.keys(ne).length===0&&_.delete(z)}i.remove(D)}function b(D){const A=i.get(D);n.deleteTexture(A.__webglTexture);const z=D.source,ne=_.get(z);delete ne[A.__cacheKey],a.memory.textures--}function N(D){const A=D.texture,z=i.get(D),ne=i.get(A);if(ne.__webglTexture!==void 0&&(n.deleteTexture(ne.__webglTexture),a.memory.textures--),D.depthTexture&&D.depthTexture.dispose(),D.isWebGLCubeRenderTarget)for(let te=0;te<6;te++){if(Array.isArray(z.__webglFramebuffer[te]))for(let se=0;se<z.__webglFramebuffer[te].length;se++)n.deleteFramebuffer(z.__webglFramebuffer[te][se]);else n.deleteFramebuffer(z.__webglFramebuffer[te]);z.__webglDepthbuffer&&n.deleteRenderbuffer(z.__webglDepthbuffer[te])}else{if(Array.isArray(z.__webglFramebuffer))for(let te=0;te<z.__webglFramebuffer.length;te++)n.deleteFramebuffer(z.__webglFramebuffer[te]);else n.deleteFramebuffer(z.__webglFramebuffer);if(z.__webglDepthbuffer&&n.deleteRenderbuffer(z.__webglDepthbuffer),z.__webglMultisampledFramebuffer&&n.deleteFramebuffer(z.__webglMultisampledFramebuffer),z.__webglColorRenderbuffer)for(let te=0;te<z.__webglColorRenderbuffer.length;te++)z.__webglColorRenderbuffer[te]&&n.deleteRenderbuffer(z.__webglColorRenderbuffer[te]);z.__webglDepthRenderbuffer&&n.deleteRenderbuffer(z.__webglDepthRenderbuffer)}if(D.isWebGLMultipleRenderTargets)for(let te=0,se=A.length;te<se;te++){const ye=i.get(A[te]);ye.__webglTexture&&(n.deleteTexture(ye.__webglTexture),a.memory.textures--),i.remove(A[te])}i.remove(A),i.remove(D)}let H=0;function ae(){H=0}function V(){const D=H;return D>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+D+" texture units while this GPU supports only "+r.maxTextures),H+=1,D}function J(D){const A=[];return A.push(D.wrapS),A.push(D.wrapT),A.push(D.wrapR||0),A.push(D.magFilter),A.push(D.minFilter),A.push(D.anisotropy),A.push(D.internalFormat),A.push(D.format),A.push(D.type),A.push(D.generateMipmaps),A.push(D.premultiplyAlpha),A.push(D.flipY),A.push(D.unpackAlignment),A.push(D.colorSpace),A.join()}function q(D,A){const z=i.get(D);if(D.isVideoTexture&&oe(D),D.isRenderTargetTexture===!1&&D.version>0&&z.__version!==D.version){const ne=D.image;if(ne===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(ne.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Me(z,D,A);return}}t.bindTexture(n.TEXTURE_2D,z.__webglTexture,n.TEXTURE0+A)}function ee(D,A){const z=i.get(D);if(D.version>0&&z.__version!==D.version){Me(z,D,A);return}t.bindTexture(n.TEXTURE_2D_ARRAY,z.__webglTexture,n.TEXTURE0+A)}function K(D,A){const z=i.get(D);if(D.version>0&&z.__version!==D.version){Me(z,D,A);return}t.bindTexture(n.TEXTURE_3D,z.__webglTexture,n.TEXTURE0+A)}function ue(D,A){const z=i.get(D);if(D.version>0&&z.__version!==D.version){Ie(z,D,A);return}t.bindTexture(n.TEXTURE_CUBE_MAP,z.__webglTexture,n.TEXTURE0+A)}const de={[Ga]:n.REPEAT,[Bn]:n.CLAMP_TO_EDGE,[Wa]:n.MIRRORED_REPEAT},we={[$t]:n.NEAREST,[au]:n.NEAREST_MIPMAP_NEAREST,[Pa]:n.NEAREST_MIPMAP_LINEAR,[Cn]:n.LINEAR,[Fm]:n.LINEAR_MIPMAP_NEAREST,[Es]:n.LINEAR_MIPMAP_LINEAR},be={[Gy]:n.NEVER,[Ky]:n.ALWAYS,[Wy]:n.LESS,[Xm]:n.LEQUAL,[jy]:n.EQUAL,[Yy]:n.GEQUAL,[Xy]:n.GREATER,[qy]:n.NOTEQUAL};function fe(D,A,z){if(z?(n.texParameteri(D,n.TEXTURE_WRAP_S,de[A.wrapS]),n.texParameteri(D,n.TEXTURE_WRAP_T,de[A.wrapT]),(D===n.TEXTURE_3D||D===n.TEXTURE_2D_ARRAY)&&n.texParameteri(D,n.TEXTURE_WRAP_R,de[A.wrapR]),n.texParameteri(D,n.TEXTURE_MAG_FILTER,we[A.magFilter]),n.texParameteri(D,n.TEXTURE_MIN_FILTER,we[A.minFilter])):(n.texParameteri(D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),(D===n.TEXTURE_3D||D===n.TEXTURE_2D_ARRAY)&&n.texParameteri(D,n.TEXTURE_WRAP_R,n.CLAMP_TO_EDGE),(A.wrapS!==Bn||A.wrapT!==Bn)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),n.texParameteri(D,n.TEXTURE_MAG_FILTER,L(A.magFilter)),n.texParameteri(D,n.TEXTURE_MIN_FILTER,L(A.minFilter)),A.minFilter!==$t&&A.minFilter!==Cn&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),A.compareFunction&&(n.texParameteri(D,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(D,n.TEXTURE_COMPARE_FUNC,be[A.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){const ne=e.get("EXT_texture_filter_anisotropic");if(A.magFilter===$t||A.minFilter!==Pa&&A.minFilter!==Es||A.type===qi&&e.has("OES_texture_float_linear")===!1||c===!1&&A.type===Ss&&e.has("OES_texture_half_float_linear")===!1)return;(A.anisotropy>1||i.get(A).__currentAnisotropy)&&(n.texParameterf(D,ne.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(A.anisotropy,r.getMaxAnisotropy())),i.get(A).__currentAnisotropy=A.anisotropy)}}function ce(D,A){let z=!1;D.__webglInit===void 0&&(D.__webglInit=!0,A.addEventListener("dispose",I));const ne=A.source;let te=_.get(ne);te===void 0&&(te={},_.set(ne,te));const se=J(A);if(se!==D.__cacheKey){te[se]===void 0&&(te[se]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,z=!0),te[se].usedTimes++;const ye=te[D.__cacheKey];ye!==void 0&&(te[D.__cacheKey].usedTimes--,ye.usedTimes===0&&b(A)),D.__cacheKey=se,D.__webglTexture=te[se].texture}return z}function Me(D,A,z){let ne=n.TEXTURE_2D;(A.isDataArrayTexture||A.isCompressedArrayTexture)&&(ne=n.TEXTURE_2D_ARRAY),A.isData3DTexture&&(ne=n.TEXTURE_3D);const te=ce(D,A),se=A.source;t.bindTexture(ne,D.__webglTexture,n.TEXTURE0+z);const ye=i.get(se);if(se.version!==ye.__version||te===!0){t.activeTexture(n.TEXTURE0+z);const xe=wt.getPrimaries(wt.workingColorSpace),Ee=A.colorSpace===Vn?null:wt.getPrimaries(A.colorSpace),Ae=A.colorSpace===Vn||xe===Ee?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,A.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,A.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,A.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ae);const Ve=g(A)&&v(A.image)===!1;let _e=w(A.image,Ve,!1,r.maxTextureSize);_e=me(A,_e);const Je=v(_e)||c,We=o.convert(A.format,A.colorSpace);let Ge=o.convert(A.type),ze=S(A.internalFormat,We,Ge,A.colorSpace,A.isVideoTexture);fe(ne,A,Je);let Ce;const X=A.mipmaps,ve=c&&A.isVideoTexture!==!0&&ze!==Wm,De=ye.__version===void 0||te===!0,Ne=F(A,_e,Je);if(A.isDepthTexture)ze=n.DEPTH_COMPONENT,c?A.type===qi?ze=n.DEPTH_COMPONENT32F:A.type===Xi?ze=n.DEPTH_COMPONENT24:A.type===wr?ze=n.DEPTH24_STENCIL8:ze=n.DEPTH_COMPONENT16:A.type===qi&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),A.format===Mr&&ze===n.DEPTH_COMPONENT&&A.type!==Vu&&A.type!==Xi&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),A.type=Xi,Ge=o.convert(A.type)),A.format===Ts&&ze===n.DEPTH_COMPONENT&&(ze=n.DEPTH_STENCIL,A.type!==wr&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),A.type=wr,Ge=o.convert(A.type))),De&&(ve?t.texStorage2D(n.TEXTURE_2D,1,ze,_e.width,_e.height):t.texImage2D(n.TEXTURE_2D,0,ze,_e.width,_e.height,0,We,Ge,null));else if(A.isDataTexture)if(X.length>0&&Je){ve&&De&&t.texStorage2D(n.TEXTURE_2D,Ne,ze,X[0].width,X[0].height);for(let Se=0,Y=X.length;Se<Y;Se++)Ce=X[Se],ve?t.texSubImage2D(n.TEXTURE_2D,Se,0,0,Ce.width,Ce.height,We,Ge,Ce.data):t.texImage2D(n.TEXTURE_2D,Se,ze,Ce.width,Ce.height,0,We,Ge,Ce.data);A.generateMipmaps=!1}else ve?(De&&t.texStorage2D(n.TEXTURE_2D,Ne,ze,_e.width,_e.height),t.texSubImage2D(n.TEXTURE_2D,0,0,0,_e.width,_e.height,We,Ge,_e.data)):t.texImage2D(n.TEXTURE_2D,0,ze,_e.width,_e.height,0,We,Ge,_e.data);else if(A.isCompressedTexture)if(A.isCompressedArrayTexture){ve&&De&&t.texStorage3D(n.TEXTURE_2D_ARRAY,Ne,ze,X[0].width,X[0].height,_e.depth);for(let Se=0,Y=X.length;Se<Y;Se++)Ce=X[Se],A.format!==kn?We!==null?ve?t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Se,0,0,0,Ce.width,Ce.height,_e.depth,We,Ce.data,0,0):t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,Se,ze,Ce.width,Ce.height,_e.depth,0,Ce.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ve?t.texSubImage3D(n.TEXTURE_2D_ARRAY,Se,0,0,0,Ce.width,Ce.height,_e.depth,We,Ge,Ce.data):t.texImage3D(n.TEXTURE_2D_ARRAY,Se,ze,Ce.width,Ce.height,_e.depth,0,We,Ge,Ce.data)}else{ve&&De&&t.texStorage2D(n.TEXTURE_2D,Ne,ze,X[0].width,X[0].height);for(let Se=0,Y=X.length;Se<Y;Se++)Ce=X[Se],A.format!==kn?We!==null?ve?t.compressedTexSubImage2D(n.TEXTURE_2D,Se,0,0,Ce.width,Ce.height,We,Ce.data):t.compressedTexImage2D(n.TEXTURE_2D,Se,ze,Ce.width,Ce.height,0,Ce.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ve?t.texSubImage2D(n.TEXTURE_2D,Se,0,0,Ce.width,Ce.height,We,Ge,Ce.data):t.texImage2D(n.TEXTURE_2D,Se,ze,Ce.width,Ce.height,0,We,Ge,Ce.data)}else if(A.isDataArrayTexture)ve?(De&&t.texStorage3D(n.TEXTURE_2D_ARRAY,Ne,ze,_e.width,_e.height,_e.depth),t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,_e.width,_e.height,_e.depth,We,Ge,_e.data)):t.texImage3D(n.TEXTURE_2D_ARRAY,0,ze,_e.width,_e.height,_e.depth,0,We,Ge,_e.data);else if(A.isData3DTexture)ve?(De&&t.texStorage3D(n.TEXTURE_3D,Ne,ze,_e.width,_e.height,_e.depth),t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,_e.width,_e.height,_e.depth,We,Ge,_e.data)):t.texImage3D(n.TEXTURE_3D,0,ze,_e.width,_e.height,_e.depth,0,We,Ge,_e.data);else if(A.isFramebufferTexture){if(De)if(ve)t.texStorage2D(n.TEXTURE_2D,Ne,ze,_e.width,_e.height);else{let Se=_e.width,Y=_e.height;for(let Re=0;Re<Ne;Re++)t.texImage2D(n.TEXTURE_2D,Re,ze,Se,Y,0,We,Ge,null),Se>>=1,Y>>=1}}else if(X.length>0&&Je){ve&&De&&t.texStorage2D(n.TEXTURE_2D,Ne,ze,X[0].width,X[0].height);for(let Se=0,Y=X.length;Se<Y;Se++)Ce=X[Se],ve?t.texSubImage2D(n.TEXTURE_2D,Se,0,0,We,Ge,Ce):t.texImage2D(n.TEXTURE_2D,Se,ze,We,Ge,Ce);A.generateMipmaps=!1}else ve?(De&&t.texStorage2D(n.TEXTURE_2D,Ne,ze,_e.width,_e.height),t.texSubImage2D(n.TEXTURE_2D,0,0,0,We,Ge,_e)):t.texImage2D(n.TEXTURE_2D,0,ze,We,Ge,_e);R(A,Je)&&E(ne),ye.__version=se.version,A.onUpdate&&A.onUpdate(A)}D.__version=A.version}function Ie(D,A,z){if(A.image.length!==6)return;const ne=ce(D,A),te=A.source;t.bindTexture(n.TEXTURE_CUBE_MAP,D.__webglTexture,n.TEXTURE0+z);const se=i.get(te);if(te.version!==se.__version||ne===!0){t.activeTexture(n.TEXTURE0+z);const ye=wt.getPrimaries(wt.workingColorSpace),xe=A.colorSpace===Vn?null:wt.getPrimaries(A.colorSpace),Ee=A.colorSpace===Vn||ye===xe?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,A.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,A.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,A.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ee);const Ae=A.isCompressedTexture||A.image[0].isCompressedTexture,Ve=A.image[0]&&A.image[0].isDataTexture,_e=[];for(let Se=0;Se<6;Se++)!Ae&&!Ve?_e[Se]=w(A.image[Se],!1,!0,r.maxCubemapSize):_e[Se]=Ve?A.image[Se].image:A.image[Se],_e[Se]=me(A,_e[Se]);const Je=_e[0],We=v(Je)||c,Ge=o.convert(A.format,A.colorSpace),ze=o.convert(A.type),Ce=S(A.internalFormat,Ge,ze,A.colorSpace),X=c&&A.isVideoTexture!==!0,ve=se.__version===void 0||ne===!0;let De=F(A,Je,We);fe(n.TEXTURE_CUBE_MAP,A,We);let Ne;if(Ae){X&&ve&&t.texStorage2D(n.TEXTURE_CUBE_MAP,De,Ce,Je.width,Je.height);for(let Se=0;Se<6;Se++){Ne=_e[Se].mipmaps;for(let Y=0;Y<Ne.length;Y++){const Re=Ne[Y];A.format!==kn?Ge!==null?X?t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Y,0,0,Re.width,Re.height,Ge,Re.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Y,Ce,Re.width,Re.height,0,Re.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):X?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Y,0,0,Re.width,Re.height,Ge,ze,Re.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Y,Ce,Re.width,Re.height,0,Ge,ze,Re.data)}}}else{Ne=A.mipmaps,X&&ve&&(Ne.length>0&&De++,t.texStorage2D(n.TEXTURE_CUBE_MAP,De,Ce,_e[0].width,_e[0].height));for(let Se=0;Se<6;Se++)if(Ve){X?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Se,0,0,0,_e[Se].width,_e[Se].height,Ge,ze,_e[Se].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Se,0,Ce,_e[Se].width,_e[Se].height,0,Ge,ze,_e[Se].data);for(let Y=0;Y<Ne.length;Y++){const Le=Ne[Y].image[Se].image;X?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Y+1,0,0,Le.width,Le.height,Ge,ze,Le.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Y+1,Ce,Le.width,Le.height,0,Ge,ze,Le.data)}}else{X?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Se,0,0,0,Ge,ze,_e[Se]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Se,0,Ce,Ge,ze,_e[Se]);for(let Y=0;Y<Ne.length;Y++){const Re=Ne[Y];X?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Y+1,0,0,Ge,ze,Re.image[Se]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Y+1,Ce,Ge,ze,Re.image[Se])}}}R(A,We)&&E(n.TEXTURE_CUBE_MAP),se.__version=te.version,A.onUpdate&&A.onUpdate(A)}D.__version=A.version}function Ue(D,A,z,ne,te,se){const ye=o.convert(z.format,z.colorSpace),xe=o.convert(z.type),Ee=S(z.internalFormat,ye,xe,z.colorSpace);if(!i.get(A).__hasExternalTextures){const Ve=Math.max(1,A.width>>se),_e=Math.max(1,A.height>>se);te===n.TEXTURE_3D||te===n.TEXTURE_2D_ARRAY?t.texImage3D(te,se,Ee,Ve,_e,A.depth,0,ye,xe,null):t.texImage2D(te,se,Ee,Ve,_e,0,ye,xe,null)}t.bindFramebuffer(n.FRAMEBUFFER,D),Z(A)?h.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ne,te,i.get(z).__webglTexture,0,Q(A)):(te===n.TEXTURE_2D||te>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&te<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,ne,te,i.get(z).__webglTexture,se),t.bindFramebuffer(n.FRAMEBUFFER,null)}function ge(D,A,z){if(n.bindRenderbuffer(n.RENDERBUFFER,D),A.depthBuffer&&!A.stencilBuffer){let ne=c===!0?n.DEPTH_COMPONENT24:n.DEPTH_COMPONENT16;if(z||Z(A)){const te=A.depthTexture;te&&te.isDepthTexture&&(te.type===qi?ne=n.DEPTH_COMPONENT32F:te.type===Xi&&(ne=n.DEPTH_COMPONENT24));const se=Q(A);Z(A)?h.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,se,ne,A.width,A.height):n.renderbufferStorageMultisample(n.RENDERBUFFER,se,ne,A.width,A.height)}else n.renderbufferStorage(n.RENDERBUFFER,ne,A.width,A.height);n.framebufferRenderbuffer(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.RENDERBUFFER,D)}else if(A.depthBuffer&&A.stencilBuffer){const ne=Q(A);z&&Z(A)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,ne,n.DEPTH24_STENCIL8,A.width,A.height):Z(A)?h.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,ne,n.DEPTH24_STENCIL8,A.width,A.height):n.renderbufferStorage(n.RENDERBUFFER,n.DEPTH_STENCIL,A.width,A.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.RENDERBUFFER,D)}else{const ne=A.isWebGLMultipleRenderTargets===!0?A.texture:[A.texture];for(let te=0;te<ne.length;te++){const se=ne[te],ye=o.convert(se.format,se.colorSpace),xe=o.convert(se.type),Ee=S(se.internalFormat,ye,xe,se.colorSpace),Ae=Q(A);z&&Z(A)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ae,Ee,A.width,A.height):Z(A)?h.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ae,Ee,A.width,A.height):n.renderbufferStorage(n.RENDERBUFFER,Ee,A.width,A.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function U(D,A){if(A&&A.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,D),!(A.depthTexture&&A.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(A.depthTexture).__webglTexture||A.depthTexture.image.width!==A.width||A.depthTexture.image.height!==A.height)&&(A.depthTexture.image.width=A.width,A.depthTexture.image.height=A.height,A.depthTexture.needsUpdate=!0),q(A.depthTexture,0);const ne=i.get(A.depthTexture).__webglTexture,te=Q(A);if(A.depthTexture.format===Mr)Z(A)?h.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,ne,0,te):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,ne,0);else if(A.depthTexture.format===Ts)Z(A)?h.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,ne,0,te):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,ne,0);else throw new Error("Unknown depthTexture format")}function B(D){const A=i.get(D),z=D.isWebGLCubeRenderTarget===!0;if(D.depthTexture&&!A.__autoAllocateDepthBuffer){if(z)throw new Error("target.depthTexture not supported in Cube render targets");U(A.__webglFramebuffer,D)}else if(z){A.__webglDepthbuffer=[];for(let ne=0;ne<6;ne++)t.bindFramebuffer(n.FRAMEBUFFER,A.__webglFramebuffer[ne]),A.__webglDepthbuffer[ne]=n.createRenderbuffer(),ge(A.__webglDepthbuffer[ne],D,!1)}else t.bindFramebuffer(n.FRAMEBUFFER,A.__webglFramebuffer),A.__webglDepthbuffer=n.createRenderbuffer(),ge(A.__webglDepthbuffer,D,!1);t.bindFramebuffer(n.FRAMEBUFFER,null)}function W(D,A,z){const ne=i.get(D);A!==void 0&&Ue(ne.__webglFramebuffer,D,D.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),z!==void 0&&B(D)}function T(D){const A=D.texture,z=i.get(D),ne=i.get(A);D.addEventListener("dispose",P),D.isWebGLMultipleRenderTargets!==!0&&(ne.__webglTexture===void 0&&(ne.__webglTexture=n.createTexture()),ne.__version=A.version,a.memory.textures++);const te=D.isWebGLCubeRenderTarget===!0,se=D.isWebGLMultipleRenderTargets===!0,ye=v(D)||c;if(te){z.__webglFramebuffer=[];for(let xe=0;xe<6;xe++)if(c&&A.mipmaps&&A.mipmaps.length>0){z.__webglFramebuffer[xe]=[];for(let Ee=0;Ee<A.mipmaps.length;Ee++)z.__webglFramebuffer[xe][Ee]=n.createFramebuffer()}else z.__webglFramebuffer[xe]=n.createFramebuffer()}else{if(c&&A.mipmaps&&A.mipmaps.length>0){z.__webglFramebuffer=[];for(let xe=0;xe<A.mipmaps.length;xe++)z.__webglFramebuffer[xe]=n.createFramebuffer()}else z.__webglFramebuffer=n.createFramebuffer();if(se)if(r.drawBuffers){const xe=D.texture;for(let Ee=0,Ae=xe.length;Ee<Ae;Ee++){const Ve=i.get(xe[Ee]);Ve.__webglTexture===void 0&&(Ve.__webglTexture=n.createTexture(),a.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(c&&D.samples>0&&Z(D)===!1){const xe=se?A:[A];z.__webglMultisampledFramebuffer=n.createFramebuffer(),z.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let Ee=0;Ee<xe.length;Ee++){const Ae=xe[Ee];z.__webglColorRenderbuffer[Ee]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,z.__webglColorRenderbuffer[Ee]);const Ve=o.convert(Ae.format,Ae.colorSpace),_e=o.convert(Ae.type),Je=S(Ae.internalFormat,Ve,_e,Ae.colorSpace,D.isXRRenderTarget===!0),We=Q(D);n.renderbufferStorageMultisample(n.RENDERBUFFER,We,Je,D.width,D.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ee,n.RENDERBUFFER,z.__webglColorRenderbuffer[Ee])}n.bindRenderbuffer(n.RENDERBUFFER,null),D.depthBuffer&&(z.__webglDepthRenderbuffer=n.createRenderbuffer(),ge(z.__webglDepthRenderbuffer,D,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(te){t.bindTexture(n.TEXTURE_CUBE_MAP,ne.__webglTexture),fe(n.TEXTURE_CUBE_MAP,A,ye);for(let xe=0;xe<6;xe++)if(c&&A.mipmaps&&A.mipmaps.length>0)for(let Ee=0;Ee<A.mipmaps.length;Ee++)Ue(z.__webglFramebuffer[xe][Ee],D,A,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+xe,Ee);else Ue(z.__webglFramebuffer[xe],D,A,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0);R(A,ye)&&E(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(se){const xe=D.texture;for(let Ee=0,Ae=xe.length;Ee<Ae;Ee++){const Ve=xe[Ee],_e=i.get(Ve);t.bindTexture(n.TEXTURE_2D,_e.__webglTexture),fe(n.TEXTURE_2D,Ve,ye),Ue(z.__webglFramebuffer,D,Ve,n.COLOR_ATTACHMENT0+Ee,n.TEXTURE_2D,0),R(Ve,ye)&&E(n.TEXTURE_2D)}t.unbindTexture()}else{let xe=n.TEXTURE_2D;if((D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(c?xe=D.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(xe,ne.__webglTexture),fe(xe,A,ye),c&&A.mipmaps&&A.mipmaps.length>0)for(let Ee=0;Ee<A.mipmaps.length;Ee++)Ue(z.__webglFramebuffer[Ee],D,A,n.COLOR_ATTACHMENT0,xe,Ee);else Ue(z.__webglFramebuffer,D,A,n.COLOR_ATTACHMENT0,xe,0);R(A,ye)&&E(xe),t.unbindTexture()}D.depthBuffer&&B(D)}function O(D){const A=v(D)||c,z=D.isWebGLMultipleRenderTargets===!0?D.texture:[D.texture];for(let ne=0,te=z.length;ne<te;ne++){const se=z[ne];if(R(se,A)){const ye=D.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:n.TEXTURE_2D,xe=i.get(se).__webglTexture;t.bindTexture(ye,xe),E(ye),t.unbindTexture()}}}function G(D){if(c&&D.samples>0&&Z(D)===!1){const A=D.isWebGLMultipleRenderTargets?D.texture:[D.texture],z=D.width,ne=D.height;let te=n.COLOR_BUFFER_BIT;const se=[],ye=D.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,xe=i.get(D),Ee=D.isWebGLMultipleRenderTargets===!0;if(Ee)for(let Ae=0;Ae<A.length;Ae++)t.bindFramebuffer(n.FRAMEBUFFER,xe.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ae,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,xe.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ae,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,xe.__webglMultisampledFramebuffer),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,xe.__webglFramebuffer);for(let Ae=0;Ae<A.length;Ae++){se.push(n.COLOR_ATTACHMENT0+Ae),D.depthBuffer&&se.push(ye);const Ve=xe.__ignoreDepthValues!==void 0?xe.__ignoreDepthValues:!1;if(Ve===!1&&(D.depthBuffer&&(te|=n.DEPTH_BUFFER_BIT),D.stencilBuffer&&(te|=n.STENCIL_BUFFER_BIT)),Ee&&n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,xe.__webglColorRenderbuffer[Ae]),Ve===!0&&(n.invalidateFramebuffer(n.READ_FRAMEBUFFER,[ye]),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[ye])),Ee){const _e=i.get(A[Ae]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,_e,0)}n.blitFramebuffer(0,0,z,ne,0,0,z,ne,te,n.NEAREST),d&&n.invalidateFramebuffer(n.READ_FRAMEBUFFER,se)}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),Ee)for(let Ae=0;Ae<A.length;Ae++){t.bindFramebuffer(n.FRAMEBUFFER,xe.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ae,n.RENDERBUFFER,xe.__webglColorRenderbuffer[Ae]);const Ve=i.get(A[Ae]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,xe.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ae,n.TEXTURE_2D,Ve,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,xe.__webglMultisampledFramebuffer)}}function Q(D){return Math.min(r.maxSamples,D.samples)}function Z(D){const A=i.get(D);return c&&D.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&A.__useRenderToTexture!==!1}function oe(D){const A=a.render.frame;f.get(D)!==A&&(f.set(D,A),D.update())}function me(D,A){const z=D.colorSpace,ne=D.format,te=D.type;return D.isCompressedTexture===!0||D.isVideoTexture===!0||D.format===cu||z!==Si&&z!==Vn&&(wt.getTransfer(z)===Ct?c===!1?e.has("EXT_sRGB")===!0&&ne===kn?(D.format=cu,D.minFilter=Cn,D.generateMipmaps=!1):A=Ym.sRGBToLinear(A):(ne!==kn||te!==ei)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",z)),A}this.allocateTextureUnit=V,this.resetTextureUnits=ae,this.setTexture2D=q,this.setTexture2DArray=ee,this.setTexture3D=K,this.setTextureCube=ue,this.rebindTextures=W,this.setupRenderTarget=T,this.updateRenderTargetMipmap=O,this.updateMultisampleRenderTarget=G,this.setupDepthRenderbuffer=B,this.setupFrameBufferTexture=Ue,this.useMultisampledRTT=Z}function a1(n,e,t){const i=t.isWebGL2;function r(o,a=Vn){let c;const h=wt.getTransfer(a);if(o===ei)return n.UNSIGNED_BYTE;if(o===km)return n.UNSIGNED_SHORT_4_4_4_4;if(o===Vm)return n.UNSIGNED_SHORT_5_5_5_1;if(o===Py)return n.BYTE;if(o===Ry)return n.SHORT;if(o===Vu)return n.UNSIGNED_SHORT;if(o===Bm)return n.INT;if(o===Xi)return n.UNSIGNED_INT;if(o===qi)return n.FLOAT;if(o===Ss)return i?n.HALF_FLOAT:(c=e.get("OES_texture_half_float"),c!==null?c.HALF_FLOAT_OES:null);if(o===Ly)return n.ALPHA;if(o===kn)return n.RGBA;if(o===Iy)return n.LUMINANCE;if(o===Dy)return n.LUMINANCE_ALPHA;if(o===Mr)return n.DEPTH_COMPONENT;if(o===Ts)return n.DEPTH_STENCIL;if(o===cu)return c=e.get("EXT_sRGB"),c!==null?c.SRGB_ALPHA_EXT:null;if(o===Uy)return n.RED;if(o===zm)return n.RED_INTEGER;if(o===Ny)return n.RG;if(o===Hm)return n.RG_INTEGER;if(o===Gm)return n.RGBA_INTEGER;if(o===oc||o===ac||o===lc||o===cc)if(h===Ct)if(c=e.get("WEBGL_compressed_texture_s3tc_srgb"),c!==null){if(o===oc)return c.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(o===ac)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(o===lc)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(o===cc)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(c=e.get("WEBGL_compressed_texture_s3tc"),c!==null){if(o===oc)return c.COMPRESSED_RGB_S3TC_DXT1_EXT;if(o===ac)return c.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(o===lc)return c.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(o===cc)return c.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(o===Vd||o===zd||o===Hd||o===Gd)if(c=e.get("WEBGL_compressed_texture_pvrtc"),c!==null){if(o===Vd)return c.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(o===zd)return c.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(o===Hd)return c.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(o===Gd)return c.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(o===Wm)return c=e.get("WEBGL_compressed_texture_etc1"),c!==null?c.COMPRESSED_RGB_ETC1_WEBGL:null;if(o===Wd||o===jd)if(c=e.get("WEBGL_compressed_texture_etc"),c!==null){if(o===Wd)return h===Ct?c.COMPRESSED_SRGB8_ETC2:c.COMPRESSED_RGB8_ETC2;if(o===jd)return h===Ct?c.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:c.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(o===Xd||o===qd||o===Yd||o===Kd||o===$d||o===Zd||o===Jd||o===Qd||o===ef||o===tf||o===nf||o===rf||o===sf||o===of)if(c=e.get("WEBGL_compressed_texture_astc"),c!==null){if(o===Xd)return h===Ct?c.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:c.COMPRESSED_RGBA_ASTC_4x4_KHR;if(o===qd)return h===Ct?c.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:c.COMPRESSED_RGBA_ASTC_5x4_KHR;if(o===Yd)return h===Ct?c.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:c.COMPRESSED_RGBA_ASTC_5x5_KHR;if(o===Kd)return h===Ct?c.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:c.COMPRESSED_RGBA_ASTC_6x5_KHR;if(o===$d)return h===Ct?c.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:c.COMPRESSED_RGBA_ASTC_6x6_KHR;if(o===Zd)return h===Ct?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:c.COMPRESSED_RGBA_ASTC_8x5_KHR;if(o===Jd)return h===Ct?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:c.COMPRESSED_RGBA_ASTC_8x6_KHR;if(o===Qd)return h===Ct?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:c.COMPRESSED_RGBA_ASTC_8x8_KHR;if(o===ef)return h===Ct?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:c.COMPRESSED_RGBA_ASTC_10x5_KHR;if(o===tf)return h===Ct?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:c.COMPRESSED_RGBA_ASTC_10x6_KHR;if(o===nf)return h===Ct?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:c.COMPRESSED_RGBA_ASTC_10x8_KHR;if(o===rf)return h===Ct?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:c.COMPRESSED_RGBA_ASTC_10x10_KHR;if(o===sf)return h===Ct?c.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:c.COMPRESSED_RGBA_ASTC_12x10_KHR;if(o===of)return h===Ct?c.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:c.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(o===uc||o===af||o===lf)if(c=e.get("EXT_texture_compression_bptc"),c!==null){if(o===uc)return h===Ct?c.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:c.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(o===af)return c.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(o===lf)return c.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(o===Oy||o===cf||o===uf||o===hf)if(c=e.get("EXT_texture_compression_rgtc"),c!==null){if(o===uc)return c.COMPRESSED_RED_RGTC1_EXT;if(o===cf)return c.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(o===uf)return c.COMPRESSED_RED_GREEN_RGTC2_EXT;if(o===hf)return c.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return o===wr?i?n.UNSIGNED_INT_24_8:(c=e.get("WEBGL_depth_texture"),c!==null?c.UNSIGNED_INT_24_8_WEBGL:null):n[o]!==void 0?n[o]:null}return{convert:r}}class l1 extends Ht{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class va extends Rn{constructor(){super(),this.isGroup=!0,this.type="Group"}}const c1={type:"move"};class Dc{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new va,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new va,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new $,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new $),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new va,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new $,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new $),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let r=null,o=null,a=null;const c=this._targetRay,h=this._grip,d=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(d&&e.hand){a=!0;for(const w of e.hand.values()){const v=t.getJointPose(w,i),g=this._getHandJoint(d,w);v!==null&&(g.matrix.fromArray(v.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=v.radius),g.visible=v!==null}const f=d.joints["index-finger-tip"],m=d.joints["thumb-tip"],_=f.position.distanceTo(m.position),x=.02,y=.005;d.inputState.pinching&&_>x+y?(d.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!d.inputState.pinching&&_<=x-y&&(d.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else h!==null&&e.gripSpace&&(o=t.getPose(e.gripSpace,i),o!==null&&(h.matrix.fromArray(o.transform.matrix),h.matrix.decompose(h.position,h.rotation,h.scale),h.matrixWorldNeedsUpdate=!0,o.linearVelocity?(h.hasLinearVelocity=!0,h.linearVelocity.copy(o.linearVelocity)):h.hasLinearVelocity=!1,o.angularVelocity?(h.hasAngularVelocity=!0,h.angularVelocity.copy(o.angularVelocity)):h.hasAngularVelocity=!1));c!==null&&(r=t.getPose(e.targetRaySpace,i),r===null&&o!==null&&(r=o),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,this.dispatchEvent(c1)))}return c!==null&&(c.visible=r!==null),h!==null&&(h.visible=o!==null),d!==null&&(d.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new va;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}class u1 extends Pr{constructor(e,t){super();const i=this;let r=null,o=1,a=null,c="local-floor",h=1,d=null,f=null,m=null,_=null,x=null,y=null;const w=t.getContextAttributes();let v=null,g=null;const R=[],E=[],S=new Oe;let F=null;const L=new Ht;L.layers.enable(1),L.viewport=new It;const I=new Ht;I.layers.enable(2),I.viewport=new It;const P=[L,I],M=new l1;M.layers.enable(1),M.layers.enable(2);let b=null,N=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(fe){let ce=R[fe];return ce===void 0&&(ce=new Dc,R[fe]=ce),ce.getTargetRaySpace()},this.getControllerGrip=function(fe){let ce=R[fe];return ce===void 0&&(ce=new Dc,R[fe]=ce),ce.getGripSpace()},this.getHand=function(fe){let ce=R[fe];return ce===void 0&&(ce=new Dc,R[fe]=ce),ce.getHandSpace()};function H(fe){const ce=E.indexOf(fe.inputSource);if(ce===-1)return;const Me=R[ce];Me!==void 0&&(Me.update(fe.inputSource,fe.frame,d||a),Me.dispatchEvent({type:fe.type,data:fe.inputSource}))}function ae(){r.removeEventListener("select",H),r.removeEventListener("selectstart",H),r.removeEventListener("selectend",H),r.removeEventListener("squeeze",H),r.removeEventListener("squeezestart",H),r.removeEventListener("squeezeend",H),r.removeEventListener("end",ae),r.removeEventListener("inputsourceschange",V);for(let fe=0;fe<R.length;fe++){const ce=E[fe];ce!==null&&(E[fe]=null,R[fe].disconnect(ce))}b=null,N=null,e.setRenderTarget(v),x=null,_=null,m=null,r=null,g=null,be.stop(),i.isPresenting=!1,e.setPixelRatio(F),e.setSize(S.width,S.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(fe){o=fe,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(fe){c=fe,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return d||a},this.setReferenceSpace=function(fe){d=fe},this.getBaseLayer=function(){return _!==null?_:x},this.getBinding=function(){return m},this.getFrame=function(){return y},this.getSession=function(){return r},this.setSession=async function(fe){if(r=fe,r!==null){if(v=e.getRenderTarget(),r.addEventListener("select",H),r.addEventListener("selectstart",H),r.addEventListener("selectend",H),r.addEventListener("squeeze",H),r.addEventListener("squeezestart",H),r.addEventListener("squeezeend",H),r.addEventListener("end",ae),r.addEventListener("inputsourceschange",V),w.xrCompatible!==!0&&await t.makeXRCompatible(),F=e.getPixelRatio(),e.getSize(S),r.renderState.layers===void 0||e.capabilities.isWebGL2===!1){const ce={antialias:r.renderState.layers===void 0?w.antialias:!0,alpha:!0,depth:w.depth,stencil:w.stencil,framebufferScaleFactor:o};x=new XRWebGLLayer(r,t,ce),r.updateRenderState({baseLayer:x}),e.setPixelRatio(1),e.setSize(x.framebufferWidth,x.framebufferHeight,!1),g=new ii(x.framebufferWidth,x.framebufferHeight,{format:kn,type:ei,colorSpace:e.outputColorSpace,stencilBuffer:w.stencil})}else{let ce=null,Me=null,Ie=null;w.depth&&(Ie=w.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ce=w.stencil?Ts:Mr,Me=w.stencil?wr:Xi);const Ue={colorFormat:t.RGBA8,depthFormat:Ie,scaleFactor:o};m=new XRWebGLBinding(r,t),_=m.createProjectionLayer(Ue),r.updateRenderState({layers:[_]}),e.setPixelRatio(1),e.setSize(_.textureWidth,_.textureHeight,!1),g=new ii(_.textureWidth,_.textureHeight,{format:kn,type:ei,depthTexture:new ag(_.textureWidth,_.textureHeight,Me,void 0,void 0,void 0,void 0,void 0,void 0,ce),stencilBuffer:w.stencil,colorSpace:e.outputColorSpace,samples:w.antialias?4:0});const ge=e.properties.get(g);ge.__ignoreDepthValues=_.ignoreDepthValues}g.isXRRenderTarget=!0,this.setFoveation(h),d=null,a=await r.requestReferenceSpace(c),be.setContext(r),be.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode};function V(fe){for(let ce=0;ce<fe.removed.length;ce++){const Me=fe.removed[ce],Ie=E.indexOf(Me);Ie>=0&&(E[Ie]=null,R[Ie].disconnect(Me))}for(let ce=0;ce<fe.added.length;ce++){const Me=fe.added[ce];let Ie=E.indexOf(Me);if(Ie===-1){for(let ge=0;ge<R.length;ge++)if(ge>=E.length){E.push(Me),Ie=ge;break}else if(E[ge]===null){E[ge]=Me,Ie=ge;break}if(Ie===-1)break}const Ue=R[Ie];Ue&&Ue.connect(Me)}}const J=new $,q=new $;function ee(fe,ce,Me){J.setFromMatrixPosition(ce.matrixWorld),q.setFromMatrixPosition(Me.matrixWorld);const Ie=J.distanceTo(q),Ue=ce.projectionMatrix.elements,ge=Me.projectionMatrix.elements,U=Ue[14]/(Ue[10]-1),B=Ue[14]/(Ue[10]+1),W=(Ue[9]+1)/Ue[5],T=(Ue[9]-1)/Ue[5],O=(Ue[8]-1)/Ue[0],G=(ge[8]+1)/ge[0],Q=U*O,Z=U*G,oe=Ie/(-O+G),me=oe*-O;ce.matrixWorld.decompose(fe.position,fe.quaternion,fe.scale),fe.translateX(me),fe.translateZ(oe),fe.matrixWorld.compose(fe.position,fe.quaternion,fe.scale),fe.matrixWorldInverse.copy(fe.matrixWorld).invert();const D=U+oe,A=B+oe,z=Q-me,ne=Z+(Ie-me),te=W*B/A*D,se=T*B/A*D;fe.projectionMatrix.makePerspective(z,ne,te,se,D,A),fe.projectionMatrixInverse.copy(fe.projectionMatrix).invert()}function K(fe,ce){ce===null?fe.matrixWorld.copy(fe.matrix):fe.matrixWorld.multiplyMatrices(ce.matrixWorld,fe.matrix),fe.matrixWorldInverse.copy(fe.matrixWorld).invert()}this.updateCamera=function(fe){if(r===null)return;M.near=I.near=L.near=fe.near,M.far=I.far=L.far=fe.far,(b!==M.near||N!==M.far)&&(r.updateRenderState({depthNear:M.near,depthFar:M.far}),b=M.near,N=M.far);const ce=fe.parent,Me=M.cameras;K(M,ce);for(let Ie=0;Ie<Me.length;Ie++)K(Me[Ie],ce);Me.length===2?ee(M,L,I):M.projectionMatrix.copy(L.projectionMatrix),ue(fe,M,ce)};function ue(fe,ce,Me){Me===null?fe.matrix.copy(ce.matrixWorld):(fe.matrix.copy(Me.matrixWorld),fe.matrix.invert(),fe.matrix.multiply(ce.matrixWorld)),fe.matrix.decompose(fe.position,fe.quaternion,fe.scale),fe.updateMatrixWorld(!0),fe.projectionMatrix.copy(ce.projectionMatrix),fe.projectionMatrixInverse.copy(ce.projectionMatrixInverse),fe.isPerspectiveCamera&&(fe.fov=Mo*2*Math.atan(1/fe.projectionMatrix.elements[5]),fe.zoom=1)}this.getCamera=function(){return M},this.getFoveation=function(){if(!(_===null&&x===null))return h},this.setFoveation=function(fe){h=fe,_!==null&&(_.fixedFoveation=fe),x!==null&&x.fixedFoveation!==void 0&&(x.fixedFoveation=fe)};let de=null;function we(fe,ce){if(f=ce.getViewerPose(d||a),y=ce,f!==null){const Me=f.views;x!==null&&(e.setRenderTargetFramebuffer(g,x.framebuffer),e.setRenderTarget(g));let Ie=!1;Me.length!==M.cameras.length&&(M.cameras.length=0,Ie=!0);for(let Ue=0;Ue<Me.length;Ue++){const ge=Me[Ue];let U=null;if(x!==null)U=x.getViewport(ge);else{const W=m.getViewSubImage(_,ge);U=W.viewport,Ue===0&&(e.setRenderTargetTextures(g,W.colorTexture,_.ignoreDepthValues?void 0:W.depthStencilTexture),e.setRenderTarget(g))}let B=P[Ue];B===void 0&&(B=new Ht,B.layers.enable(Ue),B.viewport=new It,P[Ue]=B),B.matrix.fromArray(ge.transform.matrix),B.matrix.decompose(B.position,B.quaternion,B.scale),B.projectionMatrix.fromArray(ge.projectionMatrix),B.projectionMatrixInverse.copy(B.projectionMatrix).invert(),B.viewport.set(U.x,U.y,U.width,U.height),Ue===0&&(M.matrix.copy(B.matrix),M.matrix.decompose(M.position,M.quaternion,M.scale)),Ie===!0&&M.cameras.push(B)}}for(let Me=0;Me<R.length;Me++){const Ie=E[Me],Ue=R[Me];Ie!==null&&Ue!==void 0&&Ue.update(Ie,ce,d||a)}de&&de(fe,ce),ce.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:ce}),y=null}const be=new og;be.setAnimationLoop(we),this.setAnimationLoop=function(fe){de=fe},this.dispose=function(){}}}function h1(n,e){function t(v,g){v.matrixAutoUpdate===!0&&v.updateMatrix(),g.value.copy(v.matrix)}function i(v,g){g.color.getRGB(v.fogColor.value,ng(n)),g.isFog?(v.fogNear.value=g.near,v.fogFar.value=g.far):g.isFogExp2&&(v.fogDensity.value=g.density)}function r(v,g,R,E,S){g.isMeshBasicMaterial||g.isMeshLambertMaterial?o(v,g):g.isMeshToonMaterial?(o(v,g),m(v,g)):g.isMeshPhongMaterial?(o(v,g),f(v,g)):g.isMeshStandardMaterial?(o(v,g),_(v,g),g.isMeshPhysicalMaterial&&x(v,g,S)):g.isMeshMatcapMaterial?(o(v,g),y(v,g)):g.isMeshDepthMaterial?o(v,g):g.isMeshDistanceMaterial?(o(v,g),w(v,g)):g.isMeshNormalMaterial?o(v,g):g.isLineBasicMaterial?(a(v,g),g.isLineDashedMaterial&&c(v,g)):g.isPointsMaterial?h(v,g,R,E):g.isSpriteMaterial?d(v,g):g.isShadowMaterial?(v.color.value.copy(g.color),v.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function o(v,g){v.opacity.value=g.opacity,g.color&&v.diffuse.value.copy(g.color),g.emissive&&v.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(v.map.value=g.map,t(g.map,v.mapTransform)),g.alphaMap&&(v.alphaMap.value=g.alphaMap,t(g.alphaMap,v.alphaMapTransform)),g.bumpMap&&(v.bumpMap.value=g.bumpMap,t(g.bumpMap,v.bumpMapTransform),v.bumpScale.value=g.bumpScale,g.side===vn&&(v.bumpScale.value*=-1)),g.normalMap&&(v.normalMap.value=g.normalMap,t(g.normalMap,v.normalMapTransform),v.normalScale.value.copy(g.normalScale),g.side===vn&&v.normalScale.value.negate()),g.displacementMap&&(v.displacementMap.value=g.displacementMap,t(g.displacementMap,v.displacementMapTransform),v.displacementScale.value=g.displacementScale,v.displacementBias.value=g.displacementBias),g.emissiveMap&&(v.emissiveMap.value=g.emissiveMap,t(g.emissiveMap,v.emissiveMapTransform)),g.specularMap&&(v.specularMap.value=g.specularMap,t(g.specularMap,v.specularMapTransform)),g.alphaTest>0&&(v.alphaTest.value=g.alphaTest);const R=e.get(g).envMap;if(R&&(v.envMap.value=R,v.flipEnvMap.value=R.isCubeTexture&&R.isRenderTargetTexture===!1?-1:1,v.reflectivity.value=g.reflectivity,v.ior.value=g.ior,v.refractionRatio.value=g.refractionRatio),g.lightMap){v.lightMap.value=g.lightMap;const E=n._useLegacyLights===!0?Math.PI:1;v.lightMapIntensity.value=g.lightMapIntensity*E,t(g.lightMap,v.lightMapTransform)}g.aoMap&&(v.aoMap.value=g.aoMap,v.aoMapIntensity.value=g.aoMapIntensity,t(g.aoMap,v.aoMapTransform))}function a(v,g){v.diffuse.value.copy(g.color),v.opacity.value=g.opacity,g.map&&(v.map.value=g.map,t(g.map,v.mapTransform))}function c(v,g){v.dashSize.value=g.dashSize,v.totalSize.value=g.dashSize+g.gapSize,v.scale.value=g.scale}function h(v,g,R,E){v.diffuse.value.copy(g.color),v.opacity.value=g.opacity,v.size.value=g.size*R,v.scale.value=E*.5,g.map&&(v.map.value=g.map,t(g.map,v.uvTransform)),g.alphaMap&&(v.alphaMap.value=g.alphaMap,t(g.alphaMap,v.alphaMapTransform)),g.alphaTest>0&&(v.alphaTest.value=g.alphaTest)}function d(v,g){v.diffuse.value.copy(g.color),v.opacity.value=g.opacity,v.rotation.value=g.rotation,g.map&&(v.map.value=g.map,t(g.map,v.mapTransform)),g.alphaMap&&(v.alphaMap.value=g.alphaMap,t(g.alphaMap,v.alphaMapTransform)),g.alphaTest>0&&(v.alphaTest.value=g.alphaTest)}function f(v,g){v.specular.value.copy(g.specular),v.shininess.value=Math.max(g.shininess,1e-4)}function m(v,g){g.gradientMap&&(v.gradientMap.value=g.gradientMap)}function _(v,g){v.metalness.value=g.metalness,g.metalnessMap&&(v.metalnessMap.value=g.metalnessMap,t(g.metalnessMap,v.metalnessMapTransform)),v.roughness.value=g.roughness,g.roughnessMap&&(v.roughnessMap.value=g.roughnessMap,t(g.roughnessMap,v.roughnessMapTransform)),e.get(g).envMap&&(v.envMapIntensity.value=g.envMapIntensity)}function x(v,g,R){v.ior.value=g.ior,g.sheen>0&&(v.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),v.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(v.sheenColorMap.value=g.sheenColorMap,t(g.sheenColorMap,v.sheenColorMapTransform)),g.sheenRoughnessMap&&(v.sheenRoughnessMap.value=g.sheenRoughnessMap,t(g.sheenRoughnessMap,v.sheenRoughnessMapTransform))),g.clearcoat>0&&(v.clearcoat.value=g.clearcoat,v.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(v.clearcoatMap.value=g.clearcoatMap,t(g.clearcoatMap,v.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(v.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,t(g.clearcoatRoughnessMap,v.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(v.clearcoatNormalMap.value=g.clearcoatNormalMap,t(g.clearcoatNormalMap,v.clearcoatNormalMapTransform),v.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===vn&&v.clearcoatNormalScale.value.negate())),g.iridescence>0&&(v.iridescence.value=g.iridescence,v.iridescenceIOR.value=g.iridescenceIOR,v.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],v.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(v.iridescenceMap.value=g.iridescenceMap,t(g.iridescenceMap,v.iridescenceMapTransform)),g.iridescenceThicknessMap&&(v.iridescenceThicknessMap.value=g.iridescenceThicknessMap,t(g.iridescenceThicknessMap,v.iridescenceThicknessMapTransform))),g.transmission>0&&(v.transmission.value=g.transmission,v.transmissionSamplerMap.value=R.texture,v.transmissionSamplerSize.value.set(R.width,R.height),g.transmissionMap&&(v.transmissionMap.value=g.transmissionMap,t(g.transmissionMap,v.transmissionMapTransform)),v.thickness.value=g.thickness,g.thicknessMap&&(v.thicknessMap.value=g.thicknessMap,t(g.thicknessMap,v.thicknessMapTransform)),v.attenuationDistance.value=g.attenuationDistance,v.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(v.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(v.anisotropyMap.value=g.anisotropyMap,t(g.anisotropyMap,v.anisotropyMapTransform))),v.specularIntensity.value=g.specularIntensity,v.specularColor.value.copy(g.specularColor),g.specularColorMap&&(v.specularColorMap.value=g.specularColorMap,t(g.specularColorMap,v.specularColorMapTransform)),g.specularIntensityMap&&(v.specularIntensityMap.value=g.specularIntensityMap,t(g.specularIntensityMap,v.specularIntensityMapTransform))}function y(v,g){g.matcap&&(v.matcap.value=g.matcap)}function w(v,g){const R=e.get(g).light;v.referencePosition.value.setFromMatrixPosition(R.matrixWorld),v.nearDistance.value=R.shadow.camera.near,v.farDistance.value=R.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function d1(n,e,t,i){let r={},o={},a=[];const c=t.isWebGL2?n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS):0;function h(R,E){const S=E.program;i.uniformBlockBinding(R,S)}function d(R,E){let S=r[R.id];S===void 0&&(y(R),S=f(R),r[R.id]=S,R.addEventListener("dispose",v));const F=E.program;i.updateUBOMapping(R,F);const L=e.render.frame;o[R.id]!==L&&(_(R),o[R.id]=L)}function f(R){const E=m();R.__bindingPointIndex=E;const S=n.createBuffer(),F=R.__size,L=R.usage;return n.bindBuffer(n.UNIFORM_BUFFER,S),n.bufferData(n.UNIFORM_BUFFER,F,L),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,E,S),S}function m(){for(let R=0;R<c;R++)if(a.indexOf(R)===-1)return a.push(R),R;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function _(R){const E=r[R.id],S=R.uniforms,F=R.__cache;n.bindBuffer(n.UNIFORM_BUFFER,E);for(let L=0,I=S.length;L<I;L++){const P=Array.isArray(S[L])?S[L]:[S[L]];for(let M=0,b=P.length;M<b;M++){const N=P[M];if(x(N,L,M,F)===!0){const H=N.__offset,ae=Array.isArray(N.value)?N.value:[N.value];let V=0;for(let J=0;J<ae.length;J++){const q=ae[J],ee=w(q);typeof q=="number"||typeof q=="boolean"?(N.__data[0]=q,n.bufferSubData(n.UNIFORM_BUFFER,H+V,N.__data)):q.isMatrix3?(N.__data[0]=q.elements[0],N.__data[1]=q.elements[1],N.__data[2]=q.elements[2],N.__data[3]=0,N.__data[4]=q.elements[3],N.__data[5]=q.elements[4],N.__data[6]=q.elements[5],N.__data[7]=0,N.__data[8]=q.elements[6],N.__data[9]=q.elements[7],N.__data[10]=q.elements[8],N.__data[11]=0):(q.toArray(N.__data,V),V+=ee.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,H,N.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function x(R,E,S,F){const L=R.value,I=E+"_"+S;if(F[I]===void 0)return typeof L=="number"||typeof L=="boolean"?F[I]=L:F[I]=L.clone(),!0;{const P=F[I];if(typeof L=="number"||typeof L=="boolean"){if(P!==L)return F[I]=L,!0}else if(P.equals(L)===!1)return P.copy(L),!0}return!1}function y(R){const E=R.uniforms;let S=0;const F=16;for(let I=0,P=E.length;I<P;I++){const M=Array.isArray(E[I])?E[I]:[E[I]];for(let b=0,N=M.length;b<N;b++){const H=M[b],ae=Array.isArray(H.value)?H.value:[H.value];for(let V=0,J=ae.length;V<J;V++){const q=ae[V],ee=w(q),K=S%F;K!==0&&F-K<ee.boundary&&(S+=F-K),H.__data=new Float32Array(ee.storage/Float32Array.BYTES_PER_ELEMENT),H.__offset=S,S+=ee.storage}}}const L=S%F;return L>0&&(S+=F-L),R.__size=S,R.__cache={},this}function w(R){const E={boundary:0,storage:0};return typeof R=="number"||typeof R=="boolean"?(E.boundary=4,E.storage=4):R.isVector2?(E.boundary=8,E.storage=8):R.isVector3||R.isColor?(E.boundary=16,E.storage=12):R.isVector4?(E.boundary=16,E.storage=16):R.isMatrix3?(E.boundary=48,E.storage=48):R.isMatrix4?(E.boundary=64,E.storage=64):R.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",R),E}function v(R){const E=R.target;E.removeEventListener("dispose",v);const S=a.indexOf(E.__bindingPointIndex);a.splice(S,1),n.deleteBuffer(r[E.id]),delete r[E.id],delete o[E.id]}function g(){for(const R in r)n.deleteBuffer(r[R]);a=[],r={},o={}}return{bind:h,update:d,dispose:g}}class pg{constructor(e={}){const{canvas:t=uw(),context:i=null,depth:r=!0,stencil:o=!0,alpha:a=!1,antialias:c=!1,premultipliedAlpha:h=!0,preserveDrawingBuffer:d=!1,powerPreference:f="default",failIfMajorPerformanceCaveat:m=!1}=e;this.isWebGLRenderer=!0;let _;i!==null?_=i.getContextAttributes().alpha:_=a;const x=new Uint32Array(4),y=new Int32Array(4);let w=null,v=null;const g=[],R=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Qt,this._useLegacyLights=!1,this.toneMapping=Zi,this.toneMappingExposure=1;const E=this;let S=!1,F=0,L=0,I=null,P=-1,M=null;const b=new It,N=new It;let H=null;const ae=new lt(0);let V=0,J=t.width,q=t.height,ee=1,K=null,ue=null;const de=new It(0,0,J,q),we=new It(0,0,J,q);let be=!1;const fe=new sg;let ce=!1,Me=!1,Ie=null;const Ue=new Ut,ge=new Oe,U=new $,B={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function W(){return I===null?ee:1}let T=i;function O(k,re){for(let he=0;he<k.length;he++){const pe=k[he],le=t.getContext(pe,re);if(le!==null)return le}return null}try{const k={alpha:!0,depth:r,stencil:o,antialias:c,premultipliedAlpha:h,preserveDrawingBuffer:d,powerPreference:f,failIfMajorPerformanceCaveat:m};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${ul}`),t.addEventListener("webglcontextlost",Se,!1),t.addEventListener("webglcontextrestored",Y,!1),t.addEventListener("webglcontextcreationerror",Re,!1),T===null){const re=["webgl2","webgl","experimental-webgl"];if(E.isWebGL1Renderer===!0&&re.shift(),T=O(re,k),T===null)throw O(re)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&T instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),T.getShaderPrecisionFormat===void 0&&(T.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(k){throw console.error("THREE.WebGLRenderer: "+k.message),k}let G,Q,Z,oe,me,D,A,z,ne,te,se,ye,xe,Ee,Ae,Ve,_e,Je,We,Ge,ze,Ce,X,ve;function De(){G=new MS(T),Q=new vS(T,G,e),G.init(Q),Ce=new a1(T,G,Q),Z=new s1(T,G,Q),oe=new TS(T),me=new XT,D=new o1(T,G,Z,me,Q,Ce,oe),A=new xS(E),z=new wS(E),ne=new Uw(T,Q),X=new mS(T,G,ne,Q),te=new ES(T,ne,oe,X),se=new RS(T,te,ne,oe),We=new PS(T,Q,D),Ve=new _S(me),ye=new jT(E,A,z,G,Q,X,Ve),xe=new h1(E,me),Ee=new YT,Ae=new e1(G,Q),Je=new pS(E,A,z,Z,se,_,h),_e=new r1(E,se,Q),ve=new d1(T,oe,Q,Z),Ge=new gS(T,G,oe,Q),ze=new SS(T,G,oe,Q),oe.programs=ye.programs,E.capabilities=Q,E.extensions=G,E.properties=me,E.renderLists=Ee,E.shadowMap=_e,E.state=Z,E.info=oe}De();const Ne=new u1(E,T);this.xr=Ne,this.getContext=function(){return T},this.getContextAttributes=function(){return T.getContextAttributes()},this.forceContextLoss=function(){const k=G.get("WEBGL_lose_context");k&&k.loseContext()},this.forceContextRestore=function(){const k=G.get("WEBGL_lose_context");k&&k.restoreContext()},this.getPixelRatio=function(){return ee},this.setPixelRatio=function(k){k!==void 0&&(ee=k,this.setSize(J,q,!1))},this.getSize=function(k){return k.set(J,q)},this.setSize=function(k,re,he=!0){if(Ne.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}J=k,q=re,t.width=Math.floor(k*ee),t.height=Math.floor(re*ee),he===!0&&(t.style.width=k+"px",t.style.height=re+"px"),this.setViewport(0,0,k,re)},this.getDrawingBufferSize=function(k){return k.set(J*ee,q*ee).floor()},this.setDrawingBufferSize=function(k,re,he){J=k,q=re,ee=he,t.width=Math.floor(k*he),t.height=Math.floor(re*he),this.setViewport(0,0,k,re)},this.getCurrentViewport=function(k){return k.copy(b)},this.getViewport=function(k){return k.copy(de)},this.setViewport=function(k,re,he,pe){k.isVector4?de.set(k.x,k.y,k.z,k.w):de.set(k,re,he,pe),Z.viewport(b.copy(de).multiplyScalar(ee).floor())},this.getScissor=function(k){return k.copy(we)},this.setScissor=function(k,re,he,pe){k.isVector4?we.set(k.x,k.y,k.z,k.w):we.set(k,re,he,pe),Z.scissor(N.copy(we).multiplyScalar(ee).floor())},this.getScissorTest=function(){return be},this.setScissorTest=function(k){Z.setScissorTest(be=k)},this.setOpaqueSort=function(k){K=k},this.setTransparentSort=function(k){ue=k},this.getClearColor=function(k){return k.copy(Je.getClearColor())},this.setClearColor=function(){Je.setClearColor.apply(Je,arguments)},this.getClearAlpha=function(){return Je.getClearAlpha()},this.setClearAlpha=function(){Je.setClearAlpha.apply(Je,arguments)},this.clear=function(k=!0,re=!0,he=!0){let pe=0;if(k){let le=!1;if(I!==null){const Fe=I.texture.format;le=Fe===Gm||Fe===Hm||Fe===zm}if(le){const Fe=I.texture.type,Be=Fe===ei||Fe===Xi||Fe===Vu||Fe===wr||Fe===km||Fe===Vm,je=Je.getClearColor(),qe=Je.getClearAlpha(),nt=je.r,Ze=je.g,Qe=je.b;Be?(x[0]=nt,x[1]=Ze,x[2]=Qe,x[3]=qe,T.clearBufferuiv(T.COLOR,0,x)):(y[0]=nt,y[1]=Ze,y[2]=Qe,y[3]=qe,T.clearBufferiv(T.COLOR,0,y))}else pe|=T.COLOR_BUFFER_BIT}re&&(pe|=T.DEPTH_BUFFER_BIT),he&&(pe|=T.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),T.clear(pe)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",Se,!1),t.removeEventListener("webglcontextrestored",Y,!1),t.removeEventListener("webglcontextcreationerror",Re,!1),Ee.dispose(),Ae.dispose(),me.dispose(),A.dispose(),z.dispose(),se.dispose(),X.dispose(),ve.dispose(),ye.dispose(),Ne.dispose(),Ne.removeEventListener("sessionstart",Pt),Ne.removeEventListener("sessionend",ft),Ie&&(Ie.dispose(),Ie=null),Zt.stop()};function Se(k){k.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),S=!0}function Y(){console.log("THREE.WebGLRenderer: Context Restored."),S=!1;const k=oe.autoReset,re=_e.enabled,he=_e.autoUpdate,pe=_e.needsUpdate,le=_e.type;De(),oe.autoReset=k,_e.enabled=re,_e.autoUpdate=he,_e.needsUpdate=pe,_e.type=le}function Re(k){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",k.statusMessage)}function Le(k){const re=k.target;re.removeEventListener("dispose",Le),He(re)}function He(k){ke(k),me.remove(k)}function ke(k){const re=me.get(k).programs;re!==void 0&&(re.forEach(function(he){ye.releaseProgram(he)}),k.isShaderMaterial&&ye.releaseShaderCache(k))}this.renderBufferDirect=function(k,re,he,pe,le,Fe){re===null&&(re=B);const Be=le.isMesh&&le.matrixWorld.determinant()<0,je=yl(k,re,he,pe,le);Z.setMaterial(pe,Be);let qe=he.index,nt=1;if(pe.wireframe===!0){if(qe=te.getWireframeAttribute(he),qe===void 0)return;nt=2}const Ze=he.drawRange,Qe=he.attributes.position;let Mt=Ze.start*nt,cn=(Ze.start+Ze.count)*nt;Fe!==null&&(Mt=Math.max(Mt,Fe.start*nt),cn=Math.min(cn,(Fe.start+Fe.count)*nt)),qe!==null?(Mt=Math.max(Mt,0),cn=Math.min(cn,qe.count)):Qe!=null&&(Mt=Math.max(Mt,0),cn=Math.min(cn,Qe.count));const Bt=cn-Mt;if(Bt<0||Bt===1/0)return;X.setup(le,pe,je,he,qe);let Ln,Et=Ge;if(qe!==null&&(Ln=ne.get(qe),Et=ze,Et.setIndex(Ln)),le.isMesh)pe.wireframe===!0?(Z.setLineWidth(pe.wireframeLinewidth*W()),Et.setMode(T.LINES)):Et.setMode(T.TRIANGLES);else if(le.isLine){let it=pe.linewidth;it===void 0&&(it=1),Z.setLineWidth(it*W()),le.isLineSegments?Et.setMode(T.LINES):le.isLineLoop?Et.setMode(T.LINE_LOOP):Et.setMode(T.LINE_STRIP)}else le.isPoints?Et.setMode(T.POINTS):le.isSprite&&Et.setMode(T.TRIANGLES);if(le.isBatchedMesh)Et.renderMultiDraw(le._multiDrawStarts,le._multiDrawCounts,le._multiDrawCount);else if(le.isInstancedMesh)Et.renderInstances(Mt,Bt,le.count);else if(he.isInstancedBufferGeometry){const it=he._maxInstanceCount!==void 0?he._maxInstanceCount:1/0,Ur=Math.min(he.instanceCount,it);Et.renderInstances(Mt,Bt,Ur)}else Et.render(Mt,Bt)};function ct(k,re,he){k.transparent===!0&&k.side===Fn&&k.forceSinglePass===!1?(k.side=vn,k.needsUpdate=!0,Dr(k,re,he),k.side=tr,k.needsUpdate=!0,Dr(k,re,he),k.side=Fn):Dr(k,re,he)}this.compile=function(k,re,he=null){he===null&&(he=k),v=Ae.get(he),v.init(),R.push(v),he.traverseVisible(function(le){le.isLight&&le.layers.test(re.layers)&&(v.pushLight(le),le.castShadow&&v.pushShadow(le))}),k!==he&&k.traverseVisible(function(le){le.isLight&&le.layers.test(re.layers)&&(v.pushLight(le),le.castShadow&&v.pushShadow(le))}),v.setupLights(E._useLegacyLights);const pe=new Set;return k.traverse(function(le){const Fe=le.material;if(Fe)if(Array.isArray(Fe))for(let Be=0;Be<Fe.length;Be++){const je=Fe[Be];ct(je,he,le),pe.add(je)}else ct(Fe,he,le),pe.add(Fe)}),R.pop(),v=null,pe},this.compileAsync=function(k,re,he=null){const pe=this.compile(k,re,he);return new Promise(le=>{function Fe(){if(pe.forEach(function(Be){me.get(Be).currentProgram.isReady()&&pe.delete(Be)}),pe.size===0){le(k);return}setTimeout(Fe,10)}G.get("KHR_parallel_shader_compile")!==null?Fe():setTimeout(Fe,10)})};let ut=null;function dt(k){ut&&ut(k)}function Pt(){Zt.stop()}function ft(){Zt.start()}const Zt=new og;Zt.setAnimationLoop(dt),typeof self<"u"&&Zt.setContext(self),this.setAnimationLoop=function(k){ut=k,Ne.setAnimationLoop(k),k===null?Zt.stop():Zt.start()},Ne.addEventListener("sessionstart",Pt),Ne.addEventListener("sessionend",ft),this.render=function(k,re){if(re!==void 0&&re.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(S===!0)return;k.matrixWorldAutoUpdate===!0&&k.updateMatrixWorld(),re.parent===null&&re.matrixWorldAutoUpdate===!0&&re.updateMatrixWorld(),Ne.enabled===!0&&Ne.isPresenting===!0&&(Ne.cameraAutoUpdate===!0&&Ne.updateCamera(re),re=Ne.getCamera()),k.isScene===!0&&k.onBeforeRender(E,k,re,I),v=Ae.get(k,R.length),v.init(),R.push(v),Ue.multiplyMatrices(re.projectionMatrix,re.matrixWorldInverse),fe.setFromProjectionMatrix(Ue),Me=this.localClippingEnabled,ce=Ve.init(this.clippingPlanes,Me),w=Ee.get(k,g.length),w.init(),g.push(w),nn(k,re,0,E.sortObjects),w.finish(),E.sortObjects===!0&&w.sort(K,ue),this.info.render.frame++,ce===!0&&Ve.beginShadows();const he=v.state.shadowsArray;if(_e.render(he,k,re),ce===!0&&Ve.endShadows(),this.info.autoReset===!0&&this.info.reset(),Je.render(w,k),v.setupLights(E._useLegacyLights),re.isArrayCamera){const pe=re.cameras;for(let le=0,Fe=pe.length;le<Fe;le++){const Be=pe[le];Is(w,k,Be,Be.viewport)}}else Is(w,k,re);I!==null&&(D.updateMultisampleRenderTarget(I),D.updateRenderTargetMipmap(I)),k.isScene===!0&&k.onAfterRender(E,k,re),X.resetDefaultState(),P=-1,M=null,R.pop(),R.length>0?v=R[R.length-1]:v=null,g.pop(),g.length>0?w=g[g.length-1]:w=null};function nn(k,re,he,pe){if(k.visible===!1)return;if(k.layers.test(re.layers)){if(k.isGroup)he=k.renderOrder;else if(k.isLOD)k.autoUpdate===!0&&k.update(re);else if(k.isLight)v.pushLight(k),k.castShadow&&v.pushShadow(k);else if(k.isSprite){if(!k.frustumCulled||fe.intersectsSprite(k)){pe&&U.setFromMatrixPosition(k.matrixWorld).applyMatrix4(Ue);const Be=se.update(k),je=k.material;je.visible&&w.push(k,Be,je,he,U.z,null)}}else if((k.isMesh||k.isLine||k.isPoints)&&(!k.frustumCulled||fe.intersectsObject(k))){const Be=se.update(k),je=k.material;if(pe&&(k.boundingSphere!==void 0?(k.boundingSphere===null&&k.computeBoundingSphere(),U.copy(k.boundingSphere.center)):(Be.boundingSphere===null&&Be.computeBoundingSphere(),U.copy(Be.boundingSphere.center)),U.applyMatrix4(k.matrixWorld).applyMatrix4(Ue)),Array.isArray(je)){const qe=Be.groups;for(let nt=0,Ze=qe.length;nt<Ze;nt++){const Qe=qe[nt],Mt=je[Qe.materialIndex];Mt&&Mt.visible&&w.push(k,Be,Mt,he,U.z,Qe)}}else je.visible&&w.push(k,Be,je,he,U.z,null)}}const Fe=k.children;for(let Be=0,je=Fe.length;Be<je;Be++)nn(Fe[Be],re,he,pe)}function Is(k,re,he,pe){const le=k.opaque,Fe=k.transmissive,Be=k.transparent;v.setupLightsView(he),ce===!0&&Ve.setGlobalState(E.clippingPlanes,he),Fe.length>0&&Lr(le,Fe,re,he),pe&&Z.viewport(b.copy(pe)),le.length>0&&Ci(le,re,he),Fe.length>0&&Ci(Fe,re,he),Be.length>0&&Ci(Be,re,he),Z.buffers.depth.setTest(!0),Z.buffers.depth.setMask(!0),Z.buffers.color.setMask(!0),Z.setPolygonOffset(!1)}function Lr(k,re,he,pe){if((he.isScene===!0?he.overrideMaterial:null)!==null)return;const Fe=Q.isWebGL2;Ie===null&&(Ie=new ii(1,1,{generateMipmaps:!0,type:G.has("EXT_color_buffer_half_float")?Ss:ei,minFilter:Es,samples:Fe?4:0})),E.getDrawingBufferSize(ge),Fe?Ie.setSize(ge.x,ge.y):Ie.setSize(Ka(ge.x),Ka(ge.y));const Be=E.getRenderTarget();E.setRenderTarget(Ie),E.getClearColor(ae),V=E.getClearAlpha(),V<1&&E.setClearColor(16777215,.5),E.clear();const je=E.toneMapping;E.toneMapping=Zi,Ci(k,he,pe),D.updateMultisampleRenderTarget(Ie),D.updateRenderTargetMipmap(Ie);let qe=!1;for(let nt=0,Ze=re.length;nt<Ze;nt++){const Qe=re[nt],Mt=Qe.object,cn=Qe.geometry,Bt=Qe.material,Ln=Qe.group;if(Bt.side===Fn&&Mt.layers.test(pe.layers)){const Et=Bt.side;Bt.side=vn,Bt.needsUpdate=!0,Ir(Mt,he,pe,cn,Bt,Ln),Bt.side=Et,Bt.needsUpdate=!0,qe=!0}}qe===!0&&(D.updateMultisampleRenderTarget(Ie),D.updateRenderTargetMipmap(Ie)),E.setRenderTarget(Be),E.setClearColor(ae,V),E.toneMapping=je}function Ci(k,re,he){const pe=re.isScene===!0?re.overrideMaterial:null;for(let le=0,Fe=k.length;le<Fe;le++){const Be=k[le],je=Be.object,qe=Be.geometry,nt=pe===null?Be.material:pe,Ze=Be.group;je.layers.test(he.layers)&&Ir(je,re,he,qe,nt,Ze)}}function Ir(k,re,he,pe,le,Fe){k.onBeforeRender(E,re,he,pe,le,Fe),k.modelViewMatrix.multiplyMatrices(he.matrixWorldInverse,k.matrixWorld),k.normalMatrix.getNormalMatrix(k.modelViewMatrix),le.onBeforeRender(E,re,he,pe,k,Fe),le.transparent===!0&&le.side===Fn&&le.forceSinglePass===!1?(le.side=vn,le.needsUpdate=!0,E.renderBufferDirect(he,re,pe,le,k,Fe),le.side=tr,le.needsUpdate=!0,E.renderBufferDirect(he,re,pe,le,k,Fe),le.side=Fn):E.renderBufferDirect(he,re,pe,le,k,Fe),k.onAfterRender(E,re,he,pe,le,Fe)}function Dr(k,re,he){re.isScene!==!0&&(re=B);const pe=me.get(k),le=v.state.lights,Fe=v.state.shadowsArray,Be=le.state.version,je=ye.getParameters(k,le.state,Fe,re,he),qe=ye.getProgramCacheKey(je);let nt=pe.programs;pe.environment=k.isMeshStandardMaterial?re.environment:null,pe.fog=re.fog,pe.envMap=(k.isMeshStandardMaterial?z:A).get(k.envMap||pe.environment),nt===void 0&&(k.addEventListener("dispose",Le),nt=new Map,pe.programs=nt);let Ze=nt.get(qe);if(Ze!==void 0){if(pe.currentProgram===Ze&&pe.lightsStateVersion===Be)return Do(k,je),Ze}else je.uniforms=ye.getUniforms(k),k.onBuild(he,je,E),k.onBeforeCompile(je,E),Ze=ye.acquireProgram(je,qe),nt.set(qe,Ze),pe.uniforms=je.uniforms;const Qe=pe.uniforms;return(!k.isShaderMaterial&&!k.isRawShaderMaterial||k.clipping===!0)&&(Qe.clippingPlanes=Ve.uniform),Do(k,je),pe.needsLights=wl(k),pe.lightsStateVersion=Be,pe.needsLights&&(Qe.ambientLightColor.value=le.state.ambient,Qe.lightProbe.value=le.state.probe,Qe.directionalLights.value=le.state.directional,Qe.directionalLightShadows.value=le.state.directionalShadow,Qe.spotLights.value=le.state.spot,Qe.spotLightShadows.value=le.state.spotShadow,Qe.rectAreaLights.value=le.state.rectArea,Qe.ltc_1.value=le.state.rectAreaLTC1,Qe.ltc_2.value=le.state.rectAreaLTC2,Qe.pointLights.value=le.state.point,Qe.pointLightShadows.value=le.state.pointShadow,Qe.hemisphereLights.value=le.state.hemi,Qe.directionalShadowMap.value=le.state.directionalShadowMap,Qe.directionalShadowMatrix.value=le.state.directionalShadowMatrix,Qe.spotShadowMap.value=le.state.spotShadowMap,Qe.spotLightMatrix.value=le.state.spotLightMatrix,Qe.spotLightMap.value=le.state.spotLightMap,Qe.pointShadowMap.value=le.state.pointShadowMap,Qe.pointShadowMatrix.value=le.state.pointShadowMatrix),pe.currentProgram=Ze,pe.uniformsList=null,Ze}function Io(k){if(k.uniformsList===null){const re=k.currentProgram.getUniforms();k.uniformsList=Ra.seqWithValue(re.seq,k.uniforms)}return k.uniformsList}function Do(k,re){const he=me.get(k);he.outputColorSpace=re.outputColorSpace,he.batching=re.batching,he.instancing=re.instancing,he.instancingColor=re.instancingColor,he.skinning=re.skinning,he.morphTargets=re.morphTargets,he.morphNormals=re.morphNormals,he.morphColors=re.morphColors,he.morphTargetsCount=re.morphTargetsCount,he.numClippingPlanes=re.numClippingPlanes,he.numIntersection=re.numClipIntersection,he.vertexAlphas=re.vertexAlphas,he.vertexTangents=re.vertexTangents,he.toneMapping=re.toneMapping}function yl(k,re,he,pe,le){re.isScene!==!0&&(re=B),D.resetTextureUnits();const Fe=re.fog,Be=pe.isMeshStandardMaterial?re.environment:null,je=I===null?E.outputColorSpace:I.isXRRenderTarget===!0?I.texture.colorSpace:Si,qe=(pe.isMeshStandardMaterial?z:A).get(pe.envMap||Be),nt=pe.vertexColors===!0&&!!he.attributes.color&&he.attributes.color.itemSize===4,Ze=!!he.attributes.tangent&&(!!pe.normalMap||pe.anisotropy>0),Qe=!!he.morphAttributes.position,Mt=!!he.morphAttributes.normal,cn=!!he.morphAttributes.color;let Bt=Zi;pe.toneMapped&&(I===null||I.isXRRenderTarget===!0)&&(Bt=E.toneMapping);const Ln=he.morphAttributes.position||he.morphAttributes.normal||he.morphAttributes.color,Et=Ln!==void 0?Ln.length:0,it=me.get(pe),Ur=v.state.lights;if(ce===!0&&(Me===!0||k!==M)){const _n=k===M&&pe.id===P;Ve.setState(pe,k,_n)}let Rt=!1;pe.version===it.__version?(it.needsLights&&it.lightsStateVersion!==Ur.state.version||it.outputColorSpace!==je||le.isBatchedMesh&&it.batching===!1||!le.isBatchedMesh&&it.batching===!0||le.isInstancedMesh&&it.instancing===!1||!le.isInstancedMesh&&it.instancing===!0||le.isSkinnedMesh&&it.skinning===!1||!le.isSkinnedMesh&&it.skinning===!0||le.isInstancedMesh&&it.instancingColor===!0&&le.instanceColor===null||le.isInstancedMesh&&it.instancingColor===!1&&le.instanceColor!==null||it.envMap!==qe||pe.fog===!0&&it.fog!==Fe||it.numClippingPlanes!==void 0&&(it.numClippingPlanes!==Ve.numPlanes||it.numIntersection!==Ve.numIntersection)||it.vertexAlphas!==nt||it.vertexTangents!==Ze||it.morphTargets!==Qe||it.morphNormals!==Mt||it.morphColors!==cn||it.toneMapping!==Bt||Q.isWebGL2===!0&&it.morphTargetsCount!==Et)&&(Rt=!0):(Rt=!0,it.__version=pe.version);let Mn=it.currentProgram;Rt===!0&&(Mn=Dr(pe,re,le));let Uo=!1,Ai=!1,Nr=!1;const Yt=Mn.getUniforms(),oi=it.uniforms;if(Z.useProgram(Mn.program)&&(Uo=!0,Ai=!0,Nr=!0),pe.id!==P&&(P=pe.id,Ai=!0),Uo||M!==k){Yt.setValue(T,"projectionMatrix",k.projectionMatrix),Yt.setValue(T,"viewMatrix",k.matrixWorldInverse);const _n=Yt.map.cameraPosition;_n!==void 0&&_n.setValue(T,U.setFromMatrixPosition(k.matrixWorld)),Q.logarithmicDepthBuffer&&Yt.setValue(T,"logDepthBufFC",2/(Math.log(k.far+1)/Math.LN2)),(pe.isMeshPhongMaterial||pe.isMeshToonMaterial||pe.isMeshLambertMaterial||pe.isMeshBasicMaterial||pe.isMeshStandardMaterial||pe.isShaderMaterial)&&Yt.setValue(T,"isOrthographic",k.isOrthographicCamera===!0),M!==k&&(M=k,Ai=!0,Nr=!0)}if(le.isSkinnedMesh){Yt.setOptional(T,le,"bindMatrix"),Yt.setOptional(T,le,"bindMatrixInverse");const _n=le.skeleton;_n&&(Q.floatVertexTextures?(_n.boneTexture===null&&_n.computeBoneTexture(),Yt.setValue(T,"boneTexture",_n.boneTexture,D)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}le.isBatchedMesh&&(Yt.setOptional(T,le,"batchingTexture"),Yt.setValue(T,"batchingTexture",le._matricesTexture,D));const Us=he.morphAttributes;if((Us.position!==void 0||Us.normal!==void 0||Us.color!==void 0&&Q.isWebGL2===!0)&&We.update(le,he,Mn),(Ai||it.receiveShadow!==le.receiveShadow)&&(it.receiveShadow=le.receiveShadow,Yt.setValue(T,"receiveShadow",le.receiveShadow)),pe.isMeshGouraudMaterial&&pe.envMap!==null&&(oi.envMap.value=qe,oi.flipEnvMap.value=qe.isCubeTexture&&qe.isRenderTargetTexture===!1?-1:1),Ai&&(Yt.setValue(T,"toneMappingExposure",E.toneMappingExposure),it.needsLights&&Ds(oi,Nr),Fe&&pe.fog===!0&&xe.refreshFogUniforms(oi,Fe),xe.refreshMaterialUniforms(oi,pe,ee,q,Ie),Ra.upload(T,Io(it),oi,D)),pe.isShaderMaterial&&pe.uniformsNeedUpdate===!0&&(Ra.upload(T,Io(it),oi,D),pe.uniformsNeedUpdate=!1),pe.isSpriteMaterial&&Yt.setValue(T,"center",le.center),Yt.setValue(T,"modelViewMatrix",le.modelViewMatrix),Yt.setValue(T,"normalMatrix",le.normalMatrix),Yt.setValue(T,"modelMatrix",le.matrixWorld),pe.isShaderMaterial||pe.isRawShaderMaterial){const _n=pe.uniformsGroups;for(let Or=0,Ml=_n.length;Or<Ml;Or++)if(Q.isWebGL2){const No=_n[Or];ve.update(No,Mn),ve.bind(No,Mn)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return Mn}function Ds(k,re){k.ambientLightColor.needsUpdate=re,k.lightProbe.needsUpdate=re,k.directionalLights.needsUpdate=re,k.directionalLightShadows.needsUpdate=re,k.pointLights.needsUpdate=re,k.pointLightShadows.needsUpdate=re,k.spotLights.needsUpdate=re,k.spotLightShadows.needsUpdate=re,k.rectAreaLights.needsUpdate=re,k.hemisphereLights.needsUpdate=re}function wl(k){return k.isMeshLambertMaterial||k.isMeshToonMaterial||k.isMeshPhongMaterial||k.isMeshStandardMaterial||k.isShadowMaterial||k.isShaderMaterial&&k.lights===!0}this.getActiveCubeFace=function(){return F},this.getActiveMipmapLevel=function(){return L},this.getRenderTarget=function(){return I},this.setRenderTargetTextures=function(k,re,he){me.get(k.texture).__webglTexture=re,me.get(k.depthTexture).__webglTexture=he;const pe=me.get(k);pe.__hasExternalTextures=!0,pe.__hasExternalTextures&&(pe.__autoAllocateDepthBuffer=he===void 0,pe.__autoAllocateDepthBuffer||G.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),pe.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(k,re){const he=me.get(k);he.__webglFramebuffer=re,he.__useDefaultFramebuffer=re===void 0},this.setRenderTarget=function(k,re=0,he=0){I=k,F=re,L=he;let pe=!0,le=null,Fe=!1,Be=!1;if(k){const qe=me.get(k);qe.__useDefaultFramebuffer!==void 0?(Z.bindFramebuffer(T.FRAMEBUFFER,null),pe=!1):qe.__webglFramebuffer===void 0?D.setupRenderTarget(k):qe.__hasExternalTextures&&D.rebindTextures(k,me.get(k.texture).__webglTexture,me.get(k.depthTexture).__webglTexture);const nt=k.texture;(nt.isData3DTexture||nt.isDataArrayTexture||nt.isCompressedArrayTexture)&&(Be=!0);const Ze=me.get(k).__webglFramebuffer;k.isWebGLCubeRenderTarget?(Array.isArray(Ze[re])?le=Ze[re][he]:le=Ze[re],Fe=!0):Q.isWebGL2&&k.samples>0&&D.useMultisampledRTT(k)===!1?le=me.get(k).__webglMultisampledFramebuffer:Array.isArray(Ze)?le=Ze[he]:le=Ze,b.copy(k.viewport),N.copy(k.scissor),H=k.scissorTest}else b.copy(de).multiplyScalar(ee).floor(),N.copy(we).multiplyScalar(ee).floor(),H=be;if(Z.bindFramebuffer(T.FRAMEBUFFER,le)&&Q.drawBuffers&&pe&&Z.drawBuffers(k,le),Z.viewport(b),Z.scissor(N),Z.setScissorTest(H),Fe){const qe=me.get(k.texture);T.framebufferTexture2D(T.FRAMEBUFFER,T.COLOR_ATTACHMENT0,T.TEXTURE_CUBE_MAP_POSITIVE_X+re,qe.__webglTexture,he)}else if(Be){const qe=me.get(k.texture),nt=re||0;T.framebufferTextureLayer(T.FRAMEBUFFER,T.COLOR_ATTACHMENT0,qe.__webglTexture,he||0,nt)}P=-1},this.readRenderTargetPixels=function(k,re,he,pe,le,Fe,Be){if(!(k&&k.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let je=me.get(k).__webglFramebuffer;if(k.isWebGLCubeRenderTarget&&Be!==void 0&&(je=je[Be]),je){Z.bindFramebuffer(T.FRAMEBUFFER,je);try{const qe=k.texture,nt=qe.format,Ze=qe.type;if(nt!==kn&&Ce.convert(nt)!==T.getParameter(T.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}const Qe=Ze===Ss&&(G.has("EXT_color_buffer_half_float")||Q.isWebGL2&&G.has("EXT_color_buffer_float"));if(Ze!==ei&&Ce.convert(Ze)!==T.getParameter(T.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Ze===qi&&(Q.isWebGL2||G.has("OES_texture_float")||G.has("WEBGL_color_buffer_float")))&&!Qe){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}re>=0&&re<=k.width-pe&&he>=0&&he<=k.height-le&&T.readPixels(re,he,pe,le,Ce.convert(nt),Ce.convert(Ze),Fe)}finally{const qe=I!==null?me.get(I).__webglFramebuffer:null;Z.bindFramebuffer(T.FRAMEBUFFER,qe)}}},this.copyFramebufferToTexture=function(k,re,he=0){const pe=Math.pow(2,-he),le=Math.floor(re.image.width*pe),Fe=Math.floor(re.image.height*pe);D.setTexture2D(re,0),T.copyTexSubImage2D(T.TEXTURE_2D,he,0,0,k.x,k.y,le,Fe),Z.unbindTexture()},this.copyTextureToTexture=function(k,re,he,pe=0){const le=re.image.width,Fe=re.image.height,Be=Ce.convert(he.format),je=Ce.convert(he.type);D.setTexture2D(he,0),T.pixelStorei(T.UNPACK_FLIP_Y_WEBGL,he.flipY),T.pixelStorei(T.UNPACK_PREMULTIPLY_ALPHA_WEBGL,he.premultiplyAlpha),T.pixelStorei(T.UNPACK_ALIGNMENT,he.unpackAlignment),re.isDataTexture?T.texSubImage2D(T.TEXTURE_2D,pe,k.x,k.y,le,Fe,Be,je,re.image.data):re.isCompressedTexture?T.compressedTexSubImage2D(T.TEXTURE_2D,pe,k.x,k.y,re.mipmaps[0].width,re.mipmaps[0].height,Be,re.mipmaps[0].data):T.texSubImage2D(T.TEXTURE_2D,pe,k.x,k.y,Be,je,re.image),pe===0&&he.generateMipmaps&&T.generateMipmap(T.TEXTURE_2D),Z.unbindTexture()},this.copyTextureToTexture3D=function(k,re,he,pe,le=0){if(E.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}const Fe=k.max.x-k.min.x+1,Be=k.max.y-k.min.y+1,je=k.max.z-k.min.z+1,qe=Ce.convert(pe.format),nt=Ce.convert(pe.type);let Ze;if(pe.isData3DTexture)D.setTexture3D(pe,0),Ze=T.TEXTURE_3D;else if(pe.isDataArrayTexture||pe.isCompressedArrayTexture)D.setTexture2DArray(pe,0),Ze=T.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}T.pixelStorei(T.UNPACK_FLIP_Y_WEBGL,pe.flipY),T.pixelStorei(T.UNPACK_PREMULTIPLY_ALPHA_WEBGL,pe.premultiplyAlpha),T.pixelStorei(T.UNPACK_ALIGNMENT,pe.unpackAlignment);const Qe=T.getParameter(T.UNPACK_ROW_LENGTH),Mt=T.getParameter(T.UNPACK_IMAGE_HEIGHT),cn=T.getParameter(T.UNPACK_SKIP_PIXELS),Bt=T.getParameter(T.UNPACK_SKIP_ROWS),Ln=T.getParameter(T.UNPACK_SKIP_IMAGES),Et=he.isCompressedTexture?he.mipmaps[le]:he.image;T.pixelStorei(T.UNPACK_ROW_LENGTH,Et.width),T.pixelStorei(T.UNPACK_IMAGE_HEIGHT,Et.height),T.pixelStorei(T.UNPACK_SKIP_PIXELS,k.min.x),T.pixelStorei(T.UNPACK_SKIP_ROWS,k.min.y),T.pixelStorei(T.UNPACK_SKIP_IMAGES,k.min.z),he.isDataTexture||he.isData3DTexture?T.texSubImage3D(Ze,le,re.x,re.y,re.z,Fe,Be,je,qe,nt,Et.data):he.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),T.compressedTexSubImage3D(Ze,le,re.x,re.y,re.z,Fe,Be,je,qe,Et.data)):T.texSubImage3D(Ze,le,re.x,re.y,re.z,Fe,Be,je,qe,nt,Et),T.pixelStorei(T.UNPACK_ROW_LENGTH,Qe),T.pixelStorei(T.UNPACK_IMAGE_HEIGHT,Mt),T.pixelStorei(T.UNPACK_SKIP_PIXELS,cn),T.pixelStorei(T.UNPACK_SKIP_ROWS,Bt),T.pixelStorei(T.UNPACK_SKIP_IMAGES,Ln),le===0&&pe.generateMipmaps&&T.generateMipmap(Ze),Z.unbindTexture()},this.initTexture=function(k){k.isCubeTexture?D.setTextureCube(k,0):k.isData3DTexture?D.setTexture3D(k,0):k.isDataArrayTexture||k.isCompressedArrayTexture?D.setTexture2DArray(k,0):D.setTexture2D(k,0),Z.unbindTexture()},this.resetState=function(){F=0,L=0,I=null,Z.reset(),X.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return yi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=e===zu?"display-p3":"srgb",t.unpackColorSpace=wt.workingColorSpace===dl?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===Qt?Er:jm}set outputEncoding(e){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=e===Er?Qt:Si}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(e){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=e}}class f1 extends pg{}f1.prototype.isWebGL1Renderer=!0;class fu extends Rn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t}}class p1{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=lu,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.version=0,this.uuid=ti()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.InterleavedBuffer: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let r=0,o=this.stride;r<o;r++)this.array[e+r]=t.array[i+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=ti()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=ti()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const un=new $;class Za{constructor(e,t,i,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)un.fromBufferAttribute(this,t),un.applyMatrix4(e),this.setXYZ(t,un.x,un.y,un.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)un.fromBufferAttribute(this,t),un.applyNormalMatrix(e),this.setXYZ(t,un.x,un.y,un.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)un.fromBufferAttribute(this,t),un.transformDirection(e),this.setXYZ(t,un.x,un.y,un.z);return this}setX(e,t){return this.normalized&&(t=bt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=bt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=bt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=bt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Zn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Zn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Zn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Zn(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=bt(t,this.array),i=bt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=bt(t,this.array),i=bt(i,this.array),r=bt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this}setXYZW(e,t,i,r,o){return e=e*this.data.stride+this.offset,this.normalized&&(t=bt(t,this.array),i=bt(i,this.array),r=bt(r,this.array),o=bt(o,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this.data.array[e+3]=o,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const r=i*this.data.stride+this.offset;for(let o=0;o<this.itemSize;o++)t.push(this.data.array[r+o])}return new mn(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Za(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const r=i*this.data.stride+this.offset;for(let o=0;o<this.itemSize;o++)t.push(this.data.array[r+o])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class Qf extends tn{constructor(e,t){super({width:e,height:t}),this.isFramebufferTexture=!0,this.magFilter=$t,this.minFilter=$t,this.generateMipmaps=!1,this.needsUpdate=!0}}class Uc extends tn{constructor(e,t,i,r,o,a,c,h,d,f,m,_){super(null,a,c,h,d,f,r,o,m,_),this.isCompressedTexture=!0,this.image={width:t,height:i},this.mipmaps=e,this.flipY=!1,this.generateMipmaps=!1}}class si{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let i,r=this.getPoint(0),o=0;t.push(0);for(let a=1;a<=e;a++)i=this.getPoint(a/e),o+=i.distanceTo(r),t.push(o),r=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const i=this.getLengths();let r=0;const o=i.length;let a;t?a=t:a=e*i[o-1];let c=0,h=o-1,d;for(;c<=h;)if(r=Math.floor(c+(h-c)/2),d=i[r]-a,d<0)c=r+1;else if(d>0)h=r-1;else{h=r;break}if(r=h,i[r]===a)return r/(o-1);const f=i[r],_=i[r+1]-f,x=(a-f)/_;return(r+x)/(o-1)}getTangent(e,t){let r=e-1e-4,o=e+1e-4;r<0&&(r=0),o>1&&(o=1);const a=this.getPoint(r),c=this.getPoint(o),h=t||(a.isVector2?new Oe:new $);return h.copy(c).sub(a).normalize(),h}getTangentAt(e,t){const i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t){const i=new $,r=[],o=[],a=[],c=new $,h=new Ut;for(let x=0;x<=e;x++){const y=x/e;r[x]=this.getTangentAt(y,new $)}o[0]=new $,a[0]=new $;let d=Number.MAX_VALUE;const f=Math.abs(r[0].x),m=Math.abs(r[0].y),_=Math.abs(r[0].z);f<=d&&(d=f,i.set(1,0,0)),m<=d&&(d=m,i.set(0,1,0)),_<=d&&i.set(0,0,1),c.crossVectors(r[0],i).normalize(),o[0].crossVectors(r[0],c),a[0].crossVectors(r[0],o[0]);for(let x=1;x<=e;x++){if(o[x]=o[x-1].clone(),a[x]=a[x-1].clone(),c.crossVectors(r[x-1],r[x]),c.length()>Number.EPSILON){c.normalize();const y=Math.acos(zt(r[x-1].dot(r[x]),-1,1));o[x].applyMatrix4(h.makeRotationAxis(c,y))}a[x].crossVectors(r[x],o[x])}if(t===!0){let x=Math.acos(zt(o[0].dot(o[e]),-1,1));x/=e,r[0].dot(c.crossVectors(o[0],o[e]))>0&&(x=-x);for(let y=1;y<=e;y++)o[y].applyMatrix4(h.makeRotationAxis(r[y],x*y)),a[y].crossVectors(r[y],o[y])}return{tangents:r,normals:o,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class ju extends si{constructor(e=0,t=0,i=1,r=1,o=0,a=Math.PI*2,c=!1,h=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=r,this.aStartAngle=o,this.aEndAngle=a,this.aClockwise=c,this.aRotation=h}getPoint(e,t){const i=t||new Oe,r=Math.PI*2;let o=this.aEndAngle-this.aStartAngle;const a=Math.abs(o)<Number.EPSILON;for(;o<0;)o+=r;for(;o>r;)o-=r;o<Number.EPSILON&&(a?o=0:o=r),this.aClockwise===!0&&!a&&(o===r?o=-r:o=o-r);const c=this.aStartAngle+e*o;let h=this.aX+this.xRadius*Math.cos(c),d=this.aY+this.yRadius*Math.sin(c);if(this.aRotation!==0){const f=Math.cos(this.aRotation),m=Math.sin(this.aRotation),_=h-this.aX,x=d-this.aY;h=_*f-x*m+this.aX,d=_*m+x*f+this.aY}return i.set(h,d)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class m1 extends ju{constructor(e,t,i,r,o,a){super(e,t,i,i,r,o,a),this.isArcCurve=!0,this.type="ArcCurve"}}function Xu(){let n=0,e=0,t=0,i=0;function r(o,a,c,h){n=o,e=c,t=-3*o+3*a-2*c-h,i=2*o-2*a+c+h}return{initCatmullRom:function(o,a,c,h,d){r(a,c,d*(c-o),d*(h-a))},initNonuniformCatmullRom:function(o,a,c,h,d,f,m){let _=(a-o)/d-(c-o)/(d+f)+(c-a)/f,x=(c-a)/f-(h-a)/(f+m)+(h-c)/m;_*=f,x*=f,r(a,c,_,x)},calc:function(o){const a=o*o,c=a*o;return n+e*o+t*a+i*c}}}const _a=new $,Nc=new Xu,Oc=new Xu,Fc=new Xu;class g1 extends si{constructor(e=[],t=!1,i="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=r}getPoint(e,t=new $){const i=t,r=this.points,o=r.length,a=(o-(this.closed?0:1))*e;let c=Math.floor(a),h=a-c;this.closed?c+=c>0?0:(Math.floor(Math.abs(c)/o)+1)*o:h===0&&c===o-1&&(c=o-2,h=1);let d,f;this.closed||c>0?d=r[(c-1)%o]:(_a.subVectors(r[0],r[1]).add(r[0]),d=_a);const m=r[c%o],_=r[(c+1)%o];if(this.closed||c+2<o?f=r[(c+2)%o]:(_a.subVectors(r[o-1],r[o-2]).add(r[o-1]),f=_a),this.curveType==="centripetal"||this.curveType==="chordal"){const x=this.curveType==="chordal"?.5:.25;let y=Math.pow(d.distanceToSquared(m),x),w=Math.pow(m.distanceToSquared(_),x),v=Math.pow(_.distanceToSquared(f),x);w<1e-4&&(w=1),y<1e-4&&(y=w),v<1e-4&&(v=w),Nc.initNonuniformCatmullRom(d.x,m.x,_.x,f.x,y,w,v),Oc.initNonuniformCatmullRom(d.y,m.y,_.y,f.y,y,w,v),Fc.initNonuniformCatmullRom(d.z,m.z,_.z,f.z,y,w,v)}else this.curveType==="catmullrom"&&(Nc.initCatmullRom(d.x,m.x,_.x,f.x,this.tension),Oc.initCatmullRom(d.y,m.y,_.y,f.y,this.tension),Fc.initCatmullRom(d.z,m.z,_.z,f.z,this.tension));return i.set(Nc.calc(h),Oc.calc(h),Fc.calc(h)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const r=e.points[t];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const r=this.points[t];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const r=e.points[t];this.points.push(new $().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function ep(n,e,t,i,r){const o=(i-e)*.5,a=(r-t)*.5,c=n*n,h=n*c;return(2*t-2*i+o+a)*h+(-3*t+3*i-2*o-a)*c+o*n+t}function v1(n,e){const t=1-n;return t*t*e}function _1(n,e){return 2*(1-n)*n*e}function x1(n,e){return n*n*e}function po(n,e,t,i){return v1(n,e)+_1(n,t)+x1(n,i)}function b1(n,e){const t=1-n;return t*t*t*e}function y1(n,e){const t=1-n;return 3*t*t*n*e}function w1(n,e){return 3*(1-n)*n*n*e}function M1(n,e){return n*n*n*e}function mo(n,e,t,i,r){return b1(n,e)+y1(n,t)+w1(n,i)+M1(n,r)}class mg extends si{constructor(e=new Oe,t=new Oe,i=new Oe,r=new Oe){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new Oe){const i=t,r=this.v0,o=this.v1,a=this.v2,c=this.v3;return i.set(mo(e,r.x,o.x,a.x,c.x),mo(e,r.y,o.y,a.y,c.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class E1 extends si{constructor(e=new $,t=new $,i=new $,r=new $){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new $){const i=t,r=this.v0,o=this.v1,a=this.v2,c=this.v3;return i.set(mo(e,r.x,o.x,a.x,c.x),mo(e,r.y,o.y,a.y,c.y),mo(e,r.z,o.z,a.z,c.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class gg extends si{constructor(e=new Oe,t=new Oe){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Oe){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Oe){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class S1 extends si{constructor(e=new $,t=new $){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new $){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new $){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class vg extends si{constructor(e=new Oe,t=new Oe,i=new Oe){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new Oe){const i=t,r=this.v0,o=this.v1,a=this.v2;return i.set(po(e,r.x,o.x,a.x),po(e,r.y,o.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class T1 extends si{constructor(e=new $,t=new $,i=new $){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new $){const i=t,r=this.v0,o=this.v1,a=this.v2;return i.set(po(e,r.x,o.x,a.x),po(e,r.y,o.y,a.y),po(e,r.z,o.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class _g extends si{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Oe){const i=t,r=this.points,o=(r.length-1)*e,a=Math.floor(o),c=o-a,h=r[a===0?a:a-1],d=r[a],f=r[a>r.length-2?r.length-1:a+1],m=r[a>r.length-3?r.length-1:a+2];return i.set(ep(c,h.x,d.x,f.x,m.x),ep(c,h.y,d.y,f.y,m.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const r=e.points[t];this.points.push(r.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const r=this.points[t];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const r=e.points[t];this.points.push(new Oe().fromArray(r))}return this}}var tp=Object.freeze({__proto__:null,ArcCurve:m1,CatmullRomCurve3:g1,CubicBezierCurve:mg,CubicBezierCurve3:E1,EllipseCurve:ju,LineCurve:gg,LineCurve3:S1,QuadraticBezierCurve:vg,QuadraticBezierCurve3:T1,SplineCurve:_g});class C1 extends si{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new tp[i](t,e))}return this}getPoint(e,t){const i=e*this.getLength(),r=this.getCurveLengths();let o=0;for(;o<r.length;){if(r[o]>=i){const a=r[o]-i,c=this.curves[o],h=c.getLength(),d=h===0?0:1-a/h;return c.getPointAt(d,t)}o++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let i=0,r=this.curves.length;i<r;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let i;for(let r=0,o=this.curves;r<o.length;r++){const a=o[r],c=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,h=a.getPoints(c);for(let d=0;d<h.length;d++){const f=h[d];i&&i.equals(f)||(t.push(f),i=f)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){const r=e.curves[t];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){const r=this.curves[t];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){const r=e.curves[t];this.curves.push(new tp[r.type]().fromJSON(r))}return this}}class pu extends C1{constructor(e){super(),this.type="Path",this.currentPoint=new Oe,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const i=new gg(this.currentPoint.clone(),new Oe(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,r){const o=new vg(this.currentPoint.clone(),new Oe(e,t),new Oe(i,r));return this.curves.push(o),this.currentPoint.set(i,r),this}bezierCurveTo(e,t,i,r,o,a){const c=new mg(this.currentPoint.clone(),new Oe(e,t),new Oe(i,r),new Oe(o,a));return this.curves.push(c),this.currentPoint.set(o,a),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),i=new _g(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,r,o,a){const c=this.currentPoint.x,h=this.currentPoint.y;return this.absarc(e+c,t+h,i,r,o,a),this}absarc(e,t,i,r,o,a){return this.absellipse(e,t,i,i,r,o,a),this}ellipse(e,t,i,r,o,a,c,h){const d=this.currentPoint.x,f=this.currentPoint.y;return this.absellipse(e+d,t+f,i,r,o,a,c,h),this}absellipse(e,t,i,r,o,a,c,h){const d=new ju(e,t,i,r,o,a,c,h);if(this.curves.length>0){const m=d.getPoint(0);m.equals(this.currentPoint)||this.lineTo(m.x,m.y)}this.curves.push(d);const f=d.getPoint(1);return this.currentPoint.copy(f),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class Bc extends pu{constructor(e){super(e),this.uuid=ti(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let i=0,r=this.holes.length;i<r;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){const r=e.holes[t];this.holes.push(r.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){const r=this.holes[t];e.holes.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){const r=e.holes[t];this.holes.push(new pu().fromJSON(r))}return this}}const A1={triangulate:function(n,e,t=2){const i=e&&e.length,r=i?e[0]*t:n.length;let o=xg(n,0,r,t,!0);const a=[];if(!o||o.next===o.prev)return a;let c,h,d,f,m,_,x;if(i&&(o=D1(n,e,o,t)),n.length>80*t){c=d=n[0],h=f=n[1];for(let y=t;y<r;y+=t)m=n[y],_=n[y+1],m<c&&(c=m),_<h&&(h=_),m>d&&(d=m),_>f&&(f=_);x=Math.max(d-c,f-h),x=x!==0?32767/x:0}return Eo(o,a,t,c,h,x,0),a}};function xg(n,e,t,i,r){let o,a;if(r===W1(n,e,t,i)>0)for(o=e;o<t;o+=i)a=np(o,n[o],n[o+1],a);else for(o=t-i;o>=e;o-=i)a=np(o,n[o],n[o+1],a);return a&&_l(a,a.next)&&(To(a),a=a.next),a}function Cr(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(_l(t,t.next)||Dt(t.prev,t,t.next)===0)){if(To(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function Eo(n,e,t,i,r,o,a){if(!n)return;!a&&o&&B1(n,i,r,o);let c=n,h,d;for(;n.prev!==n.next;){if(h=n.prev,d=n.next,o?R1(n,i,r,o):P1(n)){e.push(h.i/t|0),e.push(n.i/t|0),e.push(d.i/t|0),To(n),n=d.next,c=d.next;continue}if(n=d,n===c){a?a===1?(n=L1(Cr(n),e,t),Eo(n,e,t,i,r,o,2)):a===2&&I1(n,e,t,i,r,o):Eo(Cr(n),e,t,i,r,o,1);break}}}function P1(n){const e=n.prev,t=n,i=n.next;if(Dt(e,t,i)>=0)return!1;const r=e.x,o=t.x,a=i.x,c=e.y,h=t.y,d=i.y,f=r<o?r<a?r:a:o<a?o:a,m=c<h?c<d?c:d:h<d?h:d,_=r>o?r>a?r:a:o>a?o:a,x=c>h?c>d?c:d:h>d?h:d;let y=i.next;for(;y!==e;){if(y.x>=f&&y.x<=_&&y.y>=m&&y.y<=x&&fs(r,c,o,h,a,d,y.x,y.y)&&Dt(y.prev,y,y.next)>=0)return!1;y=y.next}return!0}function R1(n,e,t,i){const r=n.prev,o=n,a=n.next;if(Dt(r,o,a)>=0)return!1;const c=r.x,h=o.x,d=a.x,f=r.y,m=o.y,_=a.y,x=c<h?c<d?c:d:h<d?h:d,y=f<m?f<_?f:_:m<_?m:_,w=c>h?c>d?c:d:h>d?h:d,v=f>m?f>_?f:_:m>_?m:_,g=mu(x,y,e,t,i),R=mu(w,v,e,t,i);let E=n.prevZ,S=n.nextZ;for(;E&&E.z>=g&&S&&S.z<=R;){if(E.x>=x&&E.x<=w&&E.y>=y&&E.y<=v&&E!==r&&E!==a&&fs(c,f,h,m,d,_,E.x,E.y)&&Dt(E.prev,E,E.next)>=0||(E=E.prevZ,S.x>=x&&S.x<=w&&S.y>=y&&S.y<=v&&S!==r&&S!==a&&fs(c,f,h,m,d,_,S.x,S.y)&&Dt(S.prev,S,S.next)>=0))return!1;S=S.nextZ}for(;E&&E.z>=g;){if(E.x>=x&&E.x<=w&&E.y>=y&&E.y<=v&&E!==r&&E!==a&&fs(c,f,h,m,d,_,E.x,E.y)&&Dt(E.prev,E,E.next)>=0)return!1;E=E.prevZ}for(;S&&S.z<=R;){if(S.x>=x&&S.x<=w&&S.y>=y&&S.y<=v&&S!==r&&S!==a&&fs(c,f,h,m,d,_,S.x,S.y)&&Dt(S.prev,S,S.next)>=0)return!1;S=S.nextZ}return!0}function L1(n,e,t){let i=n;do{const r=i.prev,o=i.next.next;!_l(r,o)&&bg(r,i,i.next,o)&&So(r,o)&&So(o,r)&&(e.push(r.i/t|0),e.push(i.i/t|0),e.push(o.i/t|0),To(i),To(i.next),i=n=o),i=i.next}while(i!==n);return Cr(i)}function I1(n,e,t,i,r,o){let a=n;do{let c=a.next.next;for(;c!==a.prev;){if(a.i!==c.i&&z1(a,c)){let h=yg(a,c);a=Cr(a,a.next),h=Cr(h,h.next),Eo(a,e,t,i,r,o,0),Eo(h,e,t,i,r,o,0);return}c=c.next}a=a.next}while(a!==n)}function D1(n,e,t,i){const r=[];let o,a,c,h,d;for(o=0,a=e.length;o<a;o++)c=e[o]*i,h=o<a-1?e[o+1]*i:n.length,d=xg(n,c,h,i,!1),d===d.next&&(d.steiner=!0),r.push(V1(d));for(r.sort(U1),o=0;o<r.length;o++)t=N1(r[o],t);return t}function U1(n,e){return n.x-e.x}function N1(n,e){const t=O1(n,e);if(!t)return e;const i=yg(t,n);return Cr(i,i.next),Cr(t,t.next)}function O1(n,e){let t=e,i=-1/0,r;const o=n.x,a=n.y;do{if(a<=t.y&&a>=t.next.y&&t.next.y!==t.y){const _=t.x+(a-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(_<=o&&_>i&&(i=_,r=t.x<t.next.x?t:t.next,_===o))return r}t=t.next}while(t!==e);if(!r)return null;const c=r,h=r.x,d=r.y;let f=1/0,m;t=r;do o>=t.x&&t.x>=h&&o!==t.x&&fs(a<d?o:i,a,h,d,a<d?i:o,a,t.x,t.y)&&(m=Math.abs(a-t.y)/(o-t.x),So(t,n)&&(m<f||m===f&&(t.x>r.x||t.x===r.x&&F1(r,t)))&&(r=t,f=m)),t=t.next;while(t!==c);return r}function F1(n,e){return Dt(n.prev,n,e.prev)<0&&Dt(e.next,n,n.next)<0}function B1(n,e,t,i){let r=n;do r.z===0&&(r.z=mu(r.x,r.y,e,t,i)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==n);r.prevZ.nextZ=null,r.prevZ=null,k1(r)}function k1(n){let e,t,i,r,o,a,c,h,d=1;do{for(t=n,n=null,o=null,a=0;t;){for(a++,i=t,c=0,e=0;e<d&&(c++,i=i.nextZ,!!i);e++);for(h=d;c>0||h>0&&i;)c!==0&&(h===0||!i||t.z<=i.z)?(r=t,t=t.nextZ,c--):(r=i,i=i.nextZ,h--),o?o.nextZ=r:n=r,r.prevZ=o,o=r;t=i}o.nextZ=null,d*=2}while(a>1);return n}function mu(n,e,t,i,r){return n=(n-t)*r|0,e=(e-i)*r|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function V1(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function fs(n,e,t,i,r,o,a,c){return(r-a)*(e-c)>=(n-a)*(o-c)&&(n-a)*(i-c)>=(t-a)*(e-c)&&(t-a)*(o-c)>=(r-a)*(i-c)}function z1(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!H1(n,e)&&(So(n,e)&&So(e,n)&&G1(n,e)&&(Dt(n.prev,n,e.prev)||Dt(n,e.prev,e))||_l(n,e)&&Dt(n.prev,n,n.next)>0&&Dt(e.prev,e,e.next)>0)}function Dt(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function _l(n,e){return n.x===e.x&&n.y===e.y}function bg(n,e,t,i){const r=ba(Dt(n,e,t)),o=ba(Dt(n,e,i)),a=ba(Dt(t,i,n)),c=ba(Dt(t,i,e));return!!(r!==o&&a!==c||r===0&&xa(n,t,e)||o===0&&xa(n,i,e)||a===0&&xa(t,n,i)||c===0&&xa(t,e,i))}function xa(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function ba(n){return n>0?1:n<0?-1:0}function H1(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&bg(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function So(n,e){return Dt(n.prev,n,n.next)<0?Dt(n,e,n.next)>=0&&Dt(n,n.prev,e)>=0:Dt(n,e,n.prev)<0||Dt(n,n.next,e)<0}function G1(n,e){let t=n,i=!1;const r=(n.x+e.x)/2,o=(n.y+e.y)/2;do t.y>o!=t.next.y>o&&t.next.y!==t.y&&r<(t.next.x-t.x)*(o-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function yg(n,e){const t=new gu(n.i,n.x,n.y),i=new gu(e.i,e.x,e.y),r=n.next,o=e.prev;return n.next=e,e.prev=n,t.next=r,r.prev=t,i.next=t,t.prev=i,o.next=i,i.prev=o,i}function np(n,e,t,i){const r=new gu(n,e,t);return i?(r.next=i.next,r.prev=i,i.next.prev=r,i.next=r):(r.prev=r,r.next=r),r}function To(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function gu(n,e,t){this.i=n,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function W1(n,e,t,i){let r=0;for(let o=e,a=t-i;o<t;o+=i)r+=(n[a]-n[o])*(n[o+1]+n[a+1]),a=o;return r}class qu{static area(e){const t=e.length;let i=0;for(let r=t-1,o=0;o<t;r=o++)i+=e[r].x*e[o].y-e[o].x*e[r].y;return i*.5}static isClockWise(e){return qu.area(e)<0}static triangulateShape(e,t){const i=[],r=[],o=[];ip(e),rp(i,e);let a=e.length;t.forEach(ip);for(let h=0;h<t.length;h++)r.push(a),a+=t[h].length,rp(i,t[h]);const c=A1.triangulate(i,r);for(let h=0;h<c.length;h+=3)o.push(c.slice(h,h+3));return o}}function ip(n){const e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function rp(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}class kc extends wn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class j1{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=sp(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=sp();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function sp(){return(typeof performance>"u"?Date:performance).now()}const Yu="\\[\\]\\.:\\/",X1=new RegExp("["+Yu+"]","g"),Ku="[^"+Yu+"]",q1="[^"+Yu.replace("\\.","")+"]",Y1=/((?:WC+[\/:])*)/.source.replace("WC",Ku),K1=/(WCOD+)?/.source.replace("WCOD",q1),$1=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Ku),Z1=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Ku),J1=new RegExp("^"+Y1+K1+$1+Z1+"$"),Q1=["material","materials","bones","map"];class eC{constructor(e,t,i){const r=i||mt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();const i=this._targetGroup.nCachedObjects_,r=this._bindings[i];r!==void 0&&r.getValue(e,t)}setValue(e,t){const i=this._bindings;for(let r=this._targetGroup.nCachedObjects_,o=i.length;r!==o;++r)i[r].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}}class mt{constructor(e,t,i){this.path=t,this.parsedPath=i||mt.parseTrackName(t),this.node=mt.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new mt.Composite(e,t,i):new mt(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(X1,"")}static parseTrackName(e){const t=J1.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=i.nodeName&&i.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){const o=i.nodeName.substring(r+1);Q1.indexOf(o)!==-1&&(i.nodeName=i.nodeName.substring(0,r),i.objectName=o)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){const i=function(o){for(let a=0;a<o.length;a++){const c=o[a];if(c.name===t||c.uuid===t)return c;const h=i(c.children);if(h)return h}return null},r=i(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const i=this.resolvedProperty;for(let r=0,o=i.length;r!==o;++r)e[t++]=i[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const i=this.resolvedProperty;for(let r=0,o=i.length;r!==o;++r)i[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const i=this.resolvedProperty;for(let r=0,o=i.length;r!==o;++r)i[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const i=this.resolvedProperty;for(let r=0,o=i.length;r!==o;++r)i[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,i=t.objectName,r=t.propertyName;let o=t.propertyIndex;if(e||(e=mt.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let d=t.objectIndex;switch(i){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let f=0;f<e.length;f++)if(e[f].name===d){d=f;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(d!==void 0){if(e[d]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[d]}}const a=e[r];if(a===void 0){const d=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+d+"."+r+" but it wasn't found.",e);return}let c=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?c=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(c=this.Versioning.MatrixWorldNeedsUpdate);let h=this.BindingType.Direct;if(o!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[o]!==void 0&&(o=e.morphTargetDictionary[o])}h=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=o}else a.fromArray!==void 0&&a.toArray!==void 0?(h=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(h=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=r;this.getValue=this.GetterByBindingType[h],this.setValue=this.SetterByBindingTypeAndVersioning[h][c]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}mt.Composite=eC;mt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};mt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};mt.prototype.GetterByBindingType=[mt.prototype._getValue_direct,mt.prototype._getValue_array,mt.prototype._getValue_arrayElement,mt.prototype._getValue_toArray];mt.prototype.SetterByBindingTypeAndVersioning=[[mt.prototype._setValue_direct,mt.prototype._setValue_direct_setNeedsUpdate,mt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[mt.prototype._setValue_array,mt.prototype._setValue_array_setNeedsUpdate,mt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[mt.prototype._setValue_arrayElement,mt.prototype._setValue_arrayElement_setNeedsUpdate,mt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[mt.prototype._setValue_fromArray,mt.prototype._setValue_fromArray_setNeedsUpdate,mt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class $u{constructor(e){this.value=e}clone(){return new $u(this.value.clone===void 0?this.value:this.value.clone())}}class op{constructor(e=1,t=0,i=0){return this.radius=e,this.phi=t,this.theta=i,this}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(zt(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}const ap=new Oe;class tC{constructor(e=new Oe(1/0,1/0),t=new Oe(-1/0,-1/0)){this.isBox2=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=ap.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=1/0,this.max.x=this.max.y=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y}getCenter(e){return this.isEmpty()?e.set(0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y)}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,ap).distanceTo(e)}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const lp=new $,ya=new $;class nC{constructor(e=new $,t=new $){this.start=e,this.end=t}set(e,t){return this.start.copy(e),this.end.copy(t),this}copy(e){return this.start.copy(e.start),this.end.copy(e.end),this}getCenter(e){return e.addVectors(this.start,this.end).multiplyScalar(.5)}delta(e){return e.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(e,t){return this.delta(t).multiplyScalar(e).add(this.start)}closestPointToPointParameter(e,t){lp.subVectors(e,this.start),ya.subVectors(this.end,this.start);const i=ya.dot(ya);let o=ya.dot(lp)/i;return t&&(o=zt(o,0,1)),o}closestPointToPoint(e,t,i){const r=this.closestPointToPointParameter(e,t);return this.delta(i).multiplyScalar(r).add(this.start)}applyMatrix4(e){return this.start.applyMatrix4(e),this.end.applyMatrix4(e),this}equals(e){return e.start.equals(this.start)&&e.end.equals(this.end)}clone(){return new this.constructor().copy(this)}}class iC{constructor(){this.type="ShapePath",this.color=new lt,this.subPaths=[],this.currentPath=null}moveTo(e,t){return this.currentPath=new pu,this.subPaths.push(this.currentPath),this.currentPath.moveTo(e,t),this}lineTo(e,t){return this.currentPath.lineTo(e,t),this}quadraticCurveTo(e,t,i,r){return this.currentPath.quadraticCurveTo(e,t,i,r),this}bezierCurveTo(e,t,i,r,o,a){return this.currentPath.bezierCurveTo(e,t,i,r,o,a),this}splineThru(e){return this.currentPath.splineThru(e),this}toShapes(e){function t(g){const R=[];for(let E=0,S=g.length;E<S;E++){const F=g[E],L=new Bc;L.curves=F.curves,R.push(L)}return R}function i(g,R){const E=R.length;let S=!1;for(let F=E-1,L=0;L<E;F=L++){let I=R[F],P=R[L],M=P.x-I.x,b=P.y-I.y;if(Math.abs(b)>Number.EPSILON){if(b<0&&(I=R[L],M=-M,P=R[F],b=-b),g.y<I.y||g.y>P.y)continue;if(g.y===I.y){if(g.x===I.x)return!0}else{const N=b*(g.x-I.x)-M*(g.y-I.y);if(N===0)return!0;if(N<0)continue;S=!S}}else{if(g.y!==I.y)continue;if(P.x<=g.x&&g.x<=I.x||I.x<=g.x&&g.x<=P.x)return!0}}return S}const r=qu.isClockWise,o=this.subPaths;if(o.length===0)return[];let a,c,h;const d=[];if(o.length===1)return c=o[0],h=new Bc,h.curves=c.curves,d.push(h),d;let f=!r(o[0].getPoints());f=e?!f:f;const m=[],_=[];let x=[],y=0,w;_[y]=void 0,x[y]=[];for(let g=0,R=o.length;g<R;g++)c=o[g],w=c.getPoints(),a=r(w),a=e?!a:a,a?(!f&&_[y]&&y++,_[y]={s:new Bc,p:w},_[y].s.curves=c.curves,f&&y++,x[y]=[]):x[y].push({h:c,p:w[0]});if(!_[0])return t(o);if(_.length>1){let g=!1,R=0;for(let E=0,S=_.length;E<S;E++)m[E]=[];for(let E=0,S=_.length;E<S;E++){const F=x[E];for(let L=0;L<F.length;L++){const I=F[L];let P=!0;for(let M=0;M<_.length;M++)i(I.p,_[M].p)&&(E!==M&&R++,P?(P=!1,m[M].push(I)):g=!0);P&&m[E].push(I)}}R>0&&g===!1&&(x=m)}let v;for(let g=0,R=_.length;g<R;g++){h=_[g].s,d.push(h),v=x[g];for(let E=0,S=v.length;E<S;E++)h.holes.push(v[E].h)}return d}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:ul}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=ul);function wg(n){return Eu()?(Ip(n),!0):!1}function Zu(){const n=new Set,e=o=>{n.delete(o)};return{on:o=>{n.add(o);const a=()=>e(o);return wg(a),{off:a}},off:e,trigger:(...o)=>Promise.all(Array.from(n).map(a=>a(...o))),clear:()=>{n.clear()}}}const rC=typeof window<"u"&&typeof document<"u";typeof WorkerGlobalScope<"u"&&globalThis instanceof WorkerGlobalScope;const sC=rC?window:void 0;function oC(n,e={}){const{immediate:t=!0,fpsLimit:i=void 0,window:r=sC,once:o=!1}=e,a=Kc(!1),c=$n(()=>i?1e3/ox(i):null);let h=0,d=null;function f(x){if(!a.value||!r)return;h||(h=x);const y=x-h;if(c.value&&y<c.value){d=r.requestAnimationFrame(f);return}if(h=x,n({delta:y,timestamp:x}),o){a.value=!1,d=null;return}d=r.requestAnimationFrame(f)}function m(){!a.value&&r&&(a.value=!0,h=0,d=r.requestAnimationFrame(f))}function _(){a.value=!1,d!=null&&r&&(r.cancelAnimationFrame(d),d=null)}return t&&m(),wg(_),{isActive:Ua(a),pause:_,resume:m}}Ot({});function Ju(){const n=so("useTres");if(!n)throw new Error("useTresContext must be used together with useTresContextProvider");return n}const Mg=Zu(),Eg=Zu(),Qu=Zu(),go=new j1;let La=0,Ia=0;const{pause:aC,resume:cp,isActive:lC}=oC(()=>{Mg.trigger({delta:La,elapsed:Ia,clock:go}),Eg.trigger({delta:La,elapsed:Ia,clock:go}),Qu.trigger({delta:La,elapsed:Ia,clock:go})},{immediate:!1});Qu.on(()=>{La=go.getDelta(),Ia=go.getElapsedTime()});let up=!1;const Ls=()=>(up||(up=!0,cp()),{onBeforeLoop:Mg.on,onLoop:Eg.on,onAfterLoop:Qu.on,pause:aC,resume:cp,isActive:lC});rl({sceneGraph:null});var cC=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},hp={exports:{}};/*! Tweakpane 3.1.10 (c) 2016 cocopon, licensed under the MIT license. */(function(n,e){(function(t,i){i(e)})(cC,function(t){class i{constructor(s){const[l,p]=s.split("-"),C=l.split(".");this.major=parseInt(C[0],10),this.minor=parseInt(C[1],10),this.patch=parseInt(C[2],10),this.prerelease=p??null}toString(){const s=[this.major,this.minor,this.patch].join(".");return this.prerelease!==null?[s,this.prerelease].join("-"):s}}class r{constructor(s){this.controller_=s}get element(){return this.controller_.view.element}get disabled(){return this.controller_.viewProps.get("disabled")}set disabled(s){this.controller_.viewProps.set("disabled",s)}get hidden(){return this.controller_.viewProps.get("hidden")}set hidden(s){this.controller_.viewProps.set("hidden",s)}dispose(){this.controller_.viewProps.set("disposed",!0)}}class o{constructor(s){this.target=s}}class a extends o{constructor(s,l,p,C){super(s),this.value=l,this.presetKey=p,this.last=C??!0}}class c extends o{constructor(s,l,p){super(s),this.value=l,this.presetKey=p}}class h extends o{constructor(s,l){super(s),this.expanded=l}}class d extends o{constructor(s,l){super(s),this.index=l}}function f(u){return u}function m(u){return u==null}function _(u,s){if(u.length!==s.length)return!1;for(let l=0;l<u.length;l++)if(u[l]!==s[l])return!1;return!0}function x(u,s){let l=u;do{const p=Object.getOwnPropertyDescriptor(l,s);if(p&&(p.set!==void 0||p.writable===!0))return!0;l=Object.getPrototypeOf(l)}while(l!==null);return!1}const y={alreadydisposed:()=>"View has been already disposed",invalidparams:u=>`Invalid parameters for '${u.name}'`,nomatchingcontroller:u=>`No matching controller for '${u.key}'`,nomatchingview:u=>`No matching view for '${JSON.stringify(u.params)}'`,notbindable:()=>"Value is not bindable",propertynotfound:u=>`Property '${u.name}' not found`,shouldneverhappen:()=>"This error should never happen"};class w{static alreadyDisposed(){return new w({type:"alreadydisposed"})}static notBindable(){return new w({type:"notbindable"})}static propertyNotFound(s){return new w({type:"propertynotfound",context:{name:s}})}static shouldNeverHappen(){return new w({type:"shouldneverhappen"})}constructor(s){var l;this.message=(l=y[s.type](s.context))!==null&&l!==void 0?l:"Unexpected error",this.name=this.constructor.name,this.stack=new Error(this.message).stack,this.type=s.type}}class v{constructor(s,l,p){this.obj_=s,this.key_=l,this.presetKey_=p??l}static isBindable(s){return!(s===null||typeof s!="object"&&typeof s!="function")}get key(){return this.key_}get presetKey(){return this.presetKey_}read(){return this.obj_[this.key_]}write(s){this.obj_[this.key_]=s}writeProperty(s,l){const p=this.read();if(!v.isBindable(p))throw w.notBindable();if(!(s in p))throw w.propertyNotFound(s);p[s]=l}}class g extends r{get label(){return this.controller_.props.get("label")}set label(s){this.controller_.props.set("label",s)}get title(){var s;return(s=this.controller_.valueController.props.get("title"))!==null&&s!==void 0?s:""}set title(s){this.controller_.valueController.props.set("title",s)}on(s,l){const p=l.bind(this);return this.controller_.valueController.emitter.on(s,()=>{p(new o(this))}),this}}class R{constructor(){this.observers_={}}on(s,l){let p=this.observers_[s];return p||(p=this.observers_[s]=[]),p.push({handler:l}),this}off(s,l){const p=this.observers_[s];return p&&(this.observers_[s]=p.filter(C=>C.handler!==l)),this}emit(s,l){const p=this.observers_[s];p&&p.forEach(C=>{C.handler(l)})}}const E="tp";function S(u){return(l,p)=>[E,"-",u,"v",l?`_${l}`:"",p?`-${p}`:""].join("")}function F(u,s){return l=>s(u(l))}function L(u){return u.rawValue}function I(u,s){u.emitter.on("change",F(L,s)),s(u.rawValue)}function P(u,s,l){I(u.value(s),l)}function M(u,s,l){l?u.classList.add(s):u.classList.remove(s)}function b(u,s){return l=>{M(u,s,l)}}function N(u,s){I(u,l=>{s.textContent=l??""})}const H=S("btn");class ae{constructor(s,l){this.element=s.createElement("div"),this.element.classList.add(H()),l.viewProps.bindClassModifiers(this.element);const p=s.createElement("button");p.classList.add(H("b")),l.viewProps.bindDisabled(p),this.element.appendChild(p),this.buttonElement=p;const C=s.createElement("div");C.classList.add(H("t")),N(l.props.value("title"),C),this.buttonElement.appendChild(C)}}class V{constructor(s,l){this.emitter=new R,this.onClick_=this.onClick_.bind(this),this.props=l.props,this.viewProps=l.viewProps,this.view=new ae(s,{props:this.props,viewProps:this.viewProps}),this.view.buttonElement.addEventListener("click",this.onClick_)}onClick_(){this.emitter.emit("click",{sender:this})}}class J{constructor(s,l){var p;this.constraint_=l==null?void 0:l.constraint,this.equals_=(p=l==null?void 0:l.equals)!==null&&p!==void 0?p:(C,j)=>C===j,this.emitter=new R,this.rawValue_=s}get constraint(){return this.constraint_}get rawValue(){return this.rawValue_}set rawValue(s){this.setRawValue(s,{forceEmit:!1,last:!0})}setRawValue(s,l){const p=l??{forceEmit:!1,last:!0},C=this.constraint_?this.constraint_.constrain(s):s,j=this.rawValue_;this.equals_(j,C)&&!p.forceEmit||(this.emitter.emit("beforechange",{sender:this}),this.rawValue_=C,this.emitter.emit("change",{options:p,previousRawValue:j,rawValue:C,sender:this}))}}class q{constructor(s){this.emitter=new R,this.value_=s}get rawValue(){return this.value_}set rawValue(s){this.setRawValue(s,{forceEmit:!1,last:!0})}setRawValue(s,l){const p=l??{forceEmit:!1,last:!0},C=this.value_;C===s&&!p.forceEmit||(this.emitter.emit("beforechange",{sender:this}),this.value_=s,this.emitter.emit("change",{options:p,previousRawValue:C,rawValue:this.value_,sender:this}))}}function ee(u,s){const l=s==null?void 0:s.constraint,p=s==null?void 0:s.equals;return!l&&!p?new q(u):new J(u,s)}class K{constructor(s){this.emitter=new R,this.valMap_=s;for(const l in this.valMap_)this.valMap_[l].emitter.on("change",()=>{this.emitter.emit("change",{key:l,sender:this})})}static createCore(s){return Object.keys(s).reduce((p,C)=>Object.assign(p,{[C]:ee(s[C])}),{})}static fromObject(s){const l=this.createCore(s);return new K(l)}get(s){return this.valMap_[s].rawValue}set(s,l){this.valMap_[s].rawValue=l}value(s){return this.valMap_[s]}}function ue(u,s){const p=Object.keys(s).reduce((C,j)=>{if(C===void 0)return;const ie=s[j],Te=ie(u[j]);return Te.succeeded?Object.assign(Object.assign({},C),{[j]:Te.value}):void 0},{});return p}function de(u,s){return u.reduce((l,p)=>{if(l===void 0)return;const C=s(p);if(!(!C.succeeded||C.value===void 0))return[...l,C.value]},[])}function we(u){return u===null?!1:typeof u=="object"}function be(u){return s=>l=>{if(!s&&l===void 0)return{succeeded:!1,value:void 0};if(s&&l===void 0)return{succeeded:!0,value:void 0};const p=u(l);return p!==void 0?{succeeded:!0,value:p}:{succeeded:!1,value:void 0}}}function fe(u){return{custom:s=>be(s)(u),boolean:be(s=>typeof s=="boolean"?s:void 0)(u),number:be(s=>typeof s=="number"?s:void 0)(u),string:be(s=>typeof s=="string"?s:void 0)(u),function:be(s=>typeof s=="function"?s:void 0)(u),constant:s=>be(l=>l===s?s:void 0)(u),raw:be(s=>s)(u),object:s=>be(l=>{if(we(l))return ue(l,s)})(u),array:s=>be(l=>{if(Array.isArray(l))return de(l,s)})(u)}}const ce={optional:fe(!0),required:fe(!1)};function Me(u,s){const l=ce.required.object(s)(u);return l.succeeded?l.value:void 0}function Ie(u){console.warn([`Missing '${u.key}' of ${u.target} in ${u.place}.`,"Please rebuild plugins with the latest core package."].join(" "))}function Ue(u){return u&&u.parentElement&&u.parentElement.removeChild(u),null}class ge{constructor(s){this.value_=s}static create(s){return[new ge(s),(l,p)=>{s.setRawValue(l,p)}]}get emitter(){return this.value_.emitter}get rawValue(){return this.value_.rawValue}}const U=S("");function B(u,s){return b(u,U(void 0,s))}class W extends K{constructor(s){var l;super(s),this.onDisabledChange_=this.onDisabledChange_.bind(this),this.onParentChange_=this.onParentChange_.bind(this),this.onParentGlobalDisabledChange_=this.onParentGlobalDisabledChange_.bind(this),[this.globalDisabled_,this.setGlobalDisabled_]=ge.create(ee(this.getGlobalDisabled_())),this.value("disabled").emitter.on("change",this.onDisabledChange_),this.value("parent").emitter.on("change",this.onParentChange_),(l=this.get("parent"))===null||l===void 0||l.globalDisabled.emitter.on("change",this.onParentGlobalDisabledChange_)}static create(s){var l,p,C;const j=s??{};return new W(K.createCore({disabled:(l=j.disabled)!==null&&l!==void 0?l:!1,disposed:!1,hidden:(p=j.hidden)!==null&&p!==void 0?p:!1,parent:(C=j.parent)!==null&&C!==void 0?C:null}))}get globalDisabled(){return this.globalDisabled_}bindClassModifiers(s){I(this.globalDisabled_,B(s,"disabled")),P(this,"hidden",B(s,"hidden"))}bindDisabled(s){I(this.globalDisabled_,l=>{s.disabled=l})}bindTabIndex(s){I(this.globalDisabled_,l=>{s.tabIndex=l?-1:0})}handleDispose(s){this.value("disposed").emitter.on("change",l=>{l&&s()})}getGlobalDisabled_(){const s=this.get("parent");return(s?s.globalDisabled.rawValue:!1)||this.get("disabled")}updateGlobalDisabled_(){this.setGlobalDisabled_(this.getGlobalDisabled_())}onDisabledChange_(){this.updateGlobalDisabled_()}onParentGlobalDisabledChange_(){this.updateGlobalDisabled_()}onParentChange_(s){var l;const p=s.previousRawValue;p==null||p.globalDisabled.emitter.off("change",this.onParentGlobalDisabledChange_),(l=this.get("parent"))===null||l===void 0||l.globalDisabled.emitter.on("change",this.onParentGlobalDisabledChange_),this.updateGlobalDisabled_()}}function T(){return["veryfirst","first","last","verylast"]}const O=S(""),G={veryfirst:"vfst",first:"fst",last:"lst",verylast:"vlst"};class Q{constructor(s){this.parent_=null,this.blade=s.blade,this.view=s.view,this.viewProps=s.viewProps;const l=this.view.element;this.blade.value("positions").emitter.on("change",()=>{T().forEach(p=>{l.classList.remove(O(void 0,G[p]))}),this.blade.get("positions").forEach(p=>{l.classList.add(O(void 0,G[p]))})}),this.viewProps.handleDispose(()=>{Ue(l)})}get parent(){return this.parent_}set parent(s){if(this.parent_=s,!("parent"in this.viewProps.valMap_)){Ie({key:"parent",target:W.name,place:"BladeController.parent"});return}this.viewProps.set("parent",this.parent_?this.parent_.viewProps:null)}}const Z="http://www.w3.org/2000/svg";function oe(u){u.offsetHeight}function me(u,s){const l=u.style.transition;u.style.transition="none",s(),u.style.transition=l}function D(u){return u.ontouchstart!==void 0}function A(){return globalThis}function z(){return A().document}function ne(u){const s=u.ownerDocument.defaultView;return s&&"document"in s?u.getContext("2d",{willReadFrequently:!0}):null}const te={check:'<path d="M2 8l4 4l8 -8"/>',dropdown:'<path d="M5 7h6l-3 3 z"/>',p2dpad:'<path d="M8 4v8"/><path d="M4 8h8"/><circle cx="12" cy="12" r="1.2"/>'};function se(u,s){const l=u.createElementNS(Z,"svg");return l.innerHTML=te[s],l}function ye(u,s,l){u.insertBefore(s,u.children[l])}function xe(u){u.parentElement&&u.parentElement.removeChild(u)}function Ee(u){for(;u.children.length>0;)u.removeChild(u.children[0])}function Ae(u){for(;u.childNodes.length>0;)u.removeChild(u.childNodes[0])}function Ve(u){return u.relatedTarget?u.relatedTarget:"explicitOriginalTarget"in u?u.explicitOriginalTarget:null}const _e=S("lbl");function Je(u,s){const l=u.createDocumentFragment();return s.split(`
`).map(C=>u.createTextNode(C)).forEach((C,j)=>{j>0&&l.appendChild(u.createElement("br")),l.appendChild(C)}),l}class We{constructor(s,l){this.element=s.createElement("div"),this.element.classList.add(_e()),l.viewProps.bindClassModifiers(this.element);const p=s.createElement("div");p.classList.add(_e("l")),P(l.props,"label",j=>{m(j)?this.element.classList.add(_e(void 0,"nol")):(this.element.classList.remove(_e(void 0,"nol")),Ae(p),p.appendChild(Je(s,j)))}),this.element.appendChild(p),this.labelElement=p;const C=s.createElement("div");C.classList.add(_e("v")),this.element.appendChild(C),this.valueElement=C}}class Ge extends Q{constructor(s,l){const p=l.valueController.viewProps;super(Object.assign(Object.assign({},l),{view:new We(s,{props:l.props,viewProps:p}),viewProps:p})),this.props=l.props,this.valueController=l.valueController,this.view.valueElement.appendChild(this.valueController.view.element)}}const ze={id:"button",type:"blade",accept(u){const s=ce,l=Me(u,{title:s.required.string,view:s.required.constant("button"),label:s.optional.string});return l?{params:l}:null},controller(u){return new Ge(u.document,{blade:u.blade,props:K.fromObject({label:u.params.label}),valueController:new V(u.document,{props:K.fromObject({title:u.params.title}),viewProps:u.viewProps})})},api(u){return!(u.controller instanceof Ge)||!(u.controller.valueController instanceof V)?null:new g(u.controller)}};class Ce extends Q{constructor(s){super(s),this.value=s.value}}function X(){return new K({positions:ee([],{equals:_})})}class ve extends K{constructor(s){super(s)}static create(s){const l={completed:!0,expanded:s,expandedHeight:null,shouldFixHeight:!1,temporaryExpanded:null},p=K.createCore(l);return new ve(p)}get styleExpanded(){var s;return(s=this.get("temporaryExpanded"))!==null&&s!==void 0?s:this.get("expanded")}get styleHeight(){if(!this.styleExpanded)return"0";const s=this.get("expandedHeight");return this.get("shouldFixHeight")&&!m(s)?`${s}px`:"auto"}bindExpandedClass(s,l){const p=()=>{this.styleExpanded?s.classList.add(l):s.classList.remove(l)};P(this,"expanded",p),P(this,"temporaryExpanded",p)}cleanUpTransition(){this.set("shouldFixHeight",!1),this.set("expandedHeight",null),this.set("completed",!0)}}function De(u,s){let l=0;return me(s,()=>{u.set("expandedHeight",null),u.set("temporaryExpanded",!0),oe(s),l=s.clientHeight,u.set("temporaryExpanded",null),oe(s)}),l}function Ne(u,s){s.style.height=u.styleHeight}function Se(u,s){u.value("expanded").emitter.on("beforechange",()=>{if(u.set("completed",!1),m(u.get("expandedHeight"))){const l=De(u,s);l>0&&u.set("expandedHeight",l)}u.set("shouldFixHeight",!0),oe(s)}),u.emitter.on("change",()=>{Ne(u,s)}),Ne(u,s),s.addEventListener("transitionend",l=>{l.propertyName==="height"&&u.cleanUpTransition()})}class Y extends r{constructor(s,l){super(s),this.rackApi_=l}}function Re(u,s){return u.addBlade(Object.assign(Object.assign({},s),{view:"button"}))}function Le(u,s){return u.addBlade(Object.assign(Object.assign({},s),{view:"folder"}))}function He(u,s){const l=s??{};return u.addBlade(Object.assign(Object.assign({},l),{view:"separator"}))}function ke(u,s){return u.addBlade(Object.assign(Object.assign({},s),{view:"tab"}))}class ct{constructor(s){this.emitter=new R,this.items_=[],this.cache_=new Set,this.onSubListAdd_=this.onSubListAdd_.bind(this),this.onSubListRemove_=this.onSubListRemove_.bind(this),this.extract_=s}get items(){return this.items_}allItems(){return Array.from(this.cache_)}find(s){for(const l of this.allItems())if(s(l))return l;return null}includes(s){return this.cache_.has(s)}add(s,l){if(this.includes(s))throw w.shouldNeverHappen();const p=l!==void 0?l:this.items_.length;this.items_.splice(p,0,s),this.cache_.add(s);const C=this.extract_(s);C&&(C.emitter.on("add",this.onSubListAdd_),C.emitter.on("remove",this.onSubListRemove_),C.allItems().forEach(j=>{this.cache_.add(j)})),this.emitter.emit("add",{index:p,item:s,root:this,target:this})}remove(s){const l=this.items_.indexOf(s);if(l<0)return;this.items_.splice(l,1),this.cache_.delete(s);const p=this.extract_(s);p&&(p.emitter.off("add",this.onSubListAdd_),p.emitter.off("remove",this.onSubListRemove_)),this.emitter.emit("remove",{index:l,item:s,root:this,target:this})}onSubListAdd_(s){this.cache_.add(s.item),this.emitter.emit("add",{index:s.index,item:s.item,root:this,target:s.target})}onSubListRemove_(s){this.cache_.delete(s.item),this.emitter.emit("remove",{index:s.index,item:s.item,root:this,target:s.target})}}class ut extends r{constructor(s){super(s),this.onBindingChange_=this.onBindingChange_.bind(this),this.emitter_=new R,this.controller_.binding.emitter.on("change",this.onBindingChange_)}get label(){return this.controller_.props.get("label")}set label(s){this.controller_.props.set("label",s)}on(s,l){const p=l.bind(this);return this.emitter_.on(s,C=>{p(C.event)}),this}refresh(){this.controller_.binding.read()}onBindingChange_(s){const l=s.sender.target.read();this.emitter_.emit("change",{event:new a(this,l,this.controller_.binding.target.presetKey,s.options.last)})}}class dt extends Ge{constructor(s,l){super(s,l),this.binding=l.binding}}class Pt extends r{constructor(s){super(s),this.onBindingUpdate_=this.onBindingUpdate_.bind(this),this.emitter_=new R,this.controller_.binding.emitter.on("update",this.onBindingUpdate_)}get label(){return this.controller_.props.get("label")}set label(s){this.controller_.props.set("label",s)}on(s,l){const p=l.bind(this);return this.emitter_.on(s,C=>{p(C.event)}),this}refresh(){this.controller_.binding.read()}onBindingUpdate_(s){const l=s.sender.target.read();this.emitter_.emit("update",{event:new c(this,l,this.controller_.binding.target.presetKey)})}}class ft extends Ge{constructor(s,l){super(s,l),this.binding=l.binding,this.viewProps.bindDisabled(this.binding.ticker),this.viewProps.handleDispose(()=>{this.binding.dispose()})}}function Zt(u){return u instanceof Lr?u.apiSet_:u instanceof Y?u.rackApi_.apiSet_:null}function nn(u,s){const l=u.find(p=>p.controller_===s);if(!l)throw w.shouldNeverHappen();return l}function Is(u,s,l){if(!v.isBindable(u))throw w.notBindable();return new v(u,s,l)}class Lr extends r{constructor(s,l){super(s),this.onRackAdd_=this.onRackAdd_.bind(this),this.onRackRemove_=this.onRackRemove_.bind(this),this.onRackInputChange_=this.onRackInputChange_.bind(this),this.onRackMonitorUpdate_=this.onRackMonitorUpdate_.bind(this),this.emitter_=new R,this.apiSet_=new ct(Zt),this.pool_=l;const p=this.controller_.rack;p.emitter.on("add",this.onRackAdd_),p.emitter.on("remove",this.onRackRemove_),p.emitter.on("inputchange",this.onRackInputChange_),p.emitter.on("monitorupdate",this.onRackMonitorUpdate_),p.children.forEach(C=>{this.setUpApi_(C)})}get children(){return this.controller_.rack.children.map(s=>nn(this.apiSet_,s))}addInput(s,l,p){const C=p??{},j=this.controller_.view.element.ownerDocument,ie=this.pool_.createInput(j,Is(s,l,C.presetKey),C),Te=new ut(ie);return this.add(Te,C.index)}addMonitor(s,l,p){const C=p??{},j=this.controller_.view.element.ownerDocument,ie=this.pool_.createMonitor(j,Is(s,l),C),Te=new Pt(ie);return this.add(Te,C.index)}addFolder(s){return Le(this,s)}addButton(s){return Re(this,s)}addSeparator(s){return He(this,s)}addTab(s){return ke(this,s)}add(s,l){this.controller_.rack.add(s.controller_,l);const p=this.apiSet_.find(C=>C.controller_===s.controller_);return p&&this.apiSet_.remove(p),this.apiSet_.add(s),s}remove(s){this.controller_.rack.remove(s.controller_)}addBlade(s){const l=this.controller_.view.element.ownerDocument,p=this.pool_.createBlade(l,s),C=this.pool_.createBladeApi(p);return this.add(C,s.index)}on(s,l){const p=l.bind(this);return this.emitter_.on(s,C=>{p(C.event)}),this}setUpApi_(s){this.apiSet_.find(p=>p.controller_===s)||this.apiSet_.add(this.pool_.createBladeApi(s))}onRackAdd_(s){this.setUpApi_(s.bladeController)}onRackRemove_(s){if(s.isRoot){const l=nn(this.apiSet_,s.bladeController);this.apiSet_.remove(l)}}onRackInputChange_(s){const l=s.bladeController;if(l instanceof dt){const p=nn(this.apiSet_,l),C=l.binding;this.emitter_.emit("change",{event:new a(p,C.target.read(),C.target.presetKey,s.options.last)})}else if(l instanceof Ce){const p=nn(this.apiSet_,l);this.emitter_.emit("change",{event:new a(p,l.value.rawValue,void 0,s.options.last)})}}onRackMonitorUpdate_(s){if(!(s.bladeController instanceof ft))throw w.shouldNeverHappen();const l=nn(this.apiSet_,s.bladeController),p=s.bladeController.binding;this.emitter_.emit("update",{event:new c(l,p.target.read(),p.target.presetKey)})}}class Ci extends Y{constructor(s,l){super(s,new Lr(s.rackController,l)),this.emitter_=new R,this.controller_.foldable.value("expanded").emitter.on("change",p=>{this.emitter_.emit("fold",{event:new h(this,p.sender.rawValue)})}),this.rackApi_.on("change",p=>{this.emitter_.emit("change",{event:p})}),this.rackApi_.on("update",p=>{this.emitter_.emit("update",{event:p})})}get expanded(){return this.controller_.foldable.get("expanded")}set expanded(s){this.controller_.foldable.set("expanded",s)}get title(){return this.controller_.props.get("title")}set title(s){this.controller_.props.set("title",s)}get children(){return this.rackApi_.children}addInput(s,l,p){return this.rackApi_.addInput(s,l,p)}addMonitor(s,l,p){return this.rackApi_.addMonitor(s,l,p)}addFolder(s){return this.rackApi_.addFolder(s)}addButton(s){return this.rackApi_.addButton(s)}addSeparator(s){return this.rackApi_.addSeparator(s)}addTab(s){return this.rackApi_.addTab(s)}add(s,l){return this.rackApi_.add(s,l)}remove(s){this.rackApi_.remove(s)}addBlade(s){return this.rackApi_.addBlade(s)}on(s,l){const p=l.bind(this);return this.emitter_.on(s,C=>{p(C.event)}),this}}class Ir extends Q{constructor(s){super({blade:s.blade,view:s.view,viewProps:s.rackController.viewProps}),this.rackController=s.rackController}}class Dr{constructor(s,l){const p=S(l.viewName);this.element=s.createElement("div"),this.element.classList.add(p()),l.viewProps.bindClassModifiers(this.element)}}function Io(u,s){for(let l=0;l<u.length;l++){const p=u[l];if(p instanceof dt&&p.binding===s)return p}return null}function Do(u,s){for(let l=0;l<u.length;l++){const p=u[l];if(p instanceof ft&&p.binding===s)return p}return null}function yl(u,s){for(let l=0;l<u.length;l++){const p=u[l];if(p instanceof Ce&&p.value===s)return p}return null}function Ds(u){return u instanceof re?u.rack:u instanceof Ir?u.rackController.rack:null}function wl(u){const s=Ds(u);return s?s.bcSet_:null}class k{constructor(s){var l,p;this.onBladePositionsChange_=this.onBladePositionsChange_.bind(this),this.onSetAdd_=this.onSetAdd_.bind(this),this.onSetRemove_=this.onSetRemove_.bind(this),this.onChildDispose_=this.onChildDispose_.bind(this),this.onChildPositionsChange_=this.onChildPositionsChange_.bind(this),this.onChildInputChange_=this.onChildInputChange_.bind(this),this.onChildMonitorUpdate_=this.onChildMonitorUpdate_.bind(this),this.onChildValueChange_=this.onChildValueChange_.bind(this),this.onChildViewPropsChange_=this.onChildViewPropsChange_.bind(this),this.onDescendantLayout_=this.onDescendantLayout_.bind(this),this.onDescendantInputChange_=this.onDescendantInputChange_.bind(this),this.onDescendantMonitorUpdate_=this.onDescendantMonitorUpdate_.bind(this),this.emitter=new R,this.blade_=(l=s.blade)!==null&&l!==void 0?l:null,(p=this.blade_)===null||p===void 0||p.value("positions").emitter.on("change",this.onBladePositionsChange_),this.viewProps=s.viewProps,this.bcSet_=new ct(wl),this.bcSet_.emitter.on("add",this.onSetAdd_),this.bcSet_.emitter.on("remove",this.onSetRemove_)}get children(){return this.bcSet_.items}add(s,l){var p;(p=s.parent)===null||p===void 0||p.remove(s),x(s,"parent")?s.parent=this:(s.parent_=this,Ie({key:"parent",target:"BladeController",place:"BladeRack.add"})),this.bcSet_.add(s,l)}remove(s){x(s,"parent")?s.parent=null:(s.parent_=null,Ie({key:"parent",target:"BladeController",place:"BladeRack.remove"})),this.bcSet_.remove(s)}find(s){return this.bcSet_.allItems().filter(l=>l instanceof s)}onSetAdd_(s){this.updatePositions_();const l=s.target===s.root;if(this.emitter.emit("add",{bladeController:s.item,index:s.index,isRoot:l,sender:this}),!l)return;const p=s.item;if(p.viewProps.emitter.on("change",this.onChildViewPropsChange_),p.blade.value("positions").emitter.on("change",this.onChildPositionsChange_),p.viewProps.handleDispose(this.onChildDispose_),p instanceof dt)p.binding.emitter.on("change",this.onChildInputChange_);else if(p instanceof ft)p.binding.emitter.on("update",this.onChildMonitorUpdate_);else if(p instanceof Ce)p.value.emitter.on("change",this.onChildValueChange_);else{const C=Ds(p);if(C){const j=C.emitter;j.on("layout",this.onDescendantLayout_),j.on("inputchange",this.onDescendantInputChange_),j.on("monitorupdate",this.onDescendantMonitorUpdate_)}}}onSetRemove_(s){this.updatePositions_();const l=s.target===s.root;if(this.emitter.emit("remove",{bladeController:s.item,isRoot:l,sender:this}),!l)return;const p=s.item;if(p instanceof dt)p.binding.emitter.off("change",this.onChildInputChange_);else if(p instanceof ft)p.binding.emitter.off("update",this.onChildMonitorUpdate_);else if(p instanceof Ce)p.value.emitter.off("change",this.onChildValueChange_);else{const C=Ds(p);if(C){const j=C.emitter;j.off("layout",this.onDescendantLayout_),j.off("inputchange",this.onDescendantInputChange_),j.off("monitorupdate",this.onDescendantMonitorUpdate_)}}}updatePositions_(){const s=this.bcSet_.items.filter(C=>!C.viewProps.get("hidden")),l=s[0],p=s[s.length-1];this.bcSet_.items.forEach(C=>{const j=[];C===l&&(j.push("first"),(!this.blade_||this.blade_.get("positions").includes("veryfirst"))&&j.push("veryfirst")),C===p&&(j.push("last"),(!this.blade_||this.blade_.get("positions").includes("verylast"))&&j.push("verylast")),C.blade.set("positions",j)})}onChildPositionsChange_(){this.updatePositions_(),this.emitter.emit("layout",{sender:this})}onChildViewPropsChange_(s){this.updatePositions_(),this.emitter.emit("layout",{sender:this})}onChildDispose_(){this.bcSet_.items.filter(l=>l.viewProps.get("disposed")).forEach(l=>{this.bcSet_.remove(l)})}onChildInputChange_(s){const l=Io(this.find(dt),s.sender);if(!l)throw w.alreadyDisposed();this.emitter.emit("inputchange",{bladeController:l,options:s.options,sender:this})}onChildMonitorUpdate_(s){const l=Do(this.find(ft),s.sender);if(!l)throw w.alreadyDisposed();this.emitter.emit("monitorupdate",{bladeController:l,sender:this})}onChildValueChange_(s){const l=yl(this.find(Ce),s.sender);if(!l)throw w.alreadyDisposed();this.emitter.emit("inputchange",{bladeController:l,options:s.options,sender:this})}onDescendantLayout_(s){this.updatePositions_(),this.emitter.emit("layout",{sender:this})}onDescendantInputChange_(s){this.emitter.emit("inputchange",{bladeController:s.bladeController,options:s.options,sender:this})}onDescendantMonitorUpdate_(s){this.emitter.emit("monitorupdate",{bladeController:s.bladeController,sender:this})}onBladePositionsChange_(){this.updatePositions_()}}class re extends Q{constructor(s,l){super(Object.assign(Object.assign({},l),{view:new Dr(s,{viewName:"brk",viewProps:l.viewProps})})),this.onRackAdd_=this.onRackAdd_.bind(this),this.onRackRemove_=this.onRackRemove_.bind(this);const p=new k({blade:l.root?void 0:l.blade,viewProps:l.viewProps});p.emitter.on("add",this.onRackAdd_),p.emitter.on("remove",this.onRackRemove_),this.rack=p,this.viewProps.handleDispose(()=>{for(let C=this.rack.children.length-1;C>=0;C--)this.rack.children[C].viewProps.set("disposed",!0)})}onRackAdd_(s){s.isRoot&&ye(this.view.element,s.bladeController.view.element,s.index)}onRackRemove_(s){s.isRoot&&xe(s.bladeController.view.element)}}const he=S("cnt");class pe{constructor(s,l){var p;this.className_=S((p=l.viewName)!==null&&p!==void 0?p:"fld"),this.element=s.createElement("div"),this.element.classList.add(this.className_(),he()),l.viewProps.bindClassModifiers(this.element),this.foldable_=l.foldable,this.foldable_.bindExpandedClass(this.element,this.className_(void 0,"expanded")),P(this.foldable_,"completed",b(this.element,this.className_(void 0,"cpl")));const C=s.createElement("button");C.classList.add(this.className_("b")),P(l.props,"title",Ye=>{m(Ye)?this.element.classList.add(this.className_(void 0,"not")):this.element.classList.remove(this.className_(void 0,"not"))}),l.viewProps.bindDisabled(C),this.element.appendChild(C),this.buttonElement=C;const j=s.createElement("div");j.classList.add(this.className_("i")),this.element.appendChild(j);const ie=s.createElement("div");ie.classList.add(this.className_("t")),N(l.props.value("title"),ie),this.buttonElement.appendChild(ie),this.titleElement=ie;const Te=s.createElement("div");Te.classList.add(this.className_("m")),this.buttonElement.appendChild(Te);const Xe=l.containerElement;Xe.classList.add(this.className_("c")),this.element.appendChild(Xe),this.containerElement=Xe}}class le extends Ir{constructor(s,l){var p;const C=ve.create((p=l.expanded)!==null&&p!==void 0?p:!0),j=new re(s,{blade:l.blade,root:l.root,viewProps:l.viewProps});super(Object.assign(Object.assign({},l),{rackController:j,view:new pe(s,{containerElement:j.view.element,foldable:C,props:l.props,viewName:l.root?"rot":void 0,viewProps:l.viewProps})})),this.onTitleClick_=this.onTitleClick_.bind(this),this.props=l.props,this.foldable=C,Se(this.foldable,this.view.containerElement),this.rackController.rack.emitter.on("add",()=>{this.foldable.cleanUpTransition()}),this.rackController.rack.emitter.on("remove",()=>{this.foldable.cleanUpTransition()}),this.view.buttonElement.addEventListener("click",this.onTitleClick_)}get document(){return this.view.element.ownerDocument}onTitleClick_(){this.foldable.set("expanded",!this.foldable.get("expanded"))}}const Fe={id:"folder",type:"blade",accept(u){const s=ce,l=Me(u,{title:s.required.string,view:s.required.constant("folder"),expanded:s.optional.boolean});return l?{params:l}:null},controller(u){return new le(u.document,{blade:u.blade,expanded:u.params.expanded,props:K.fromObject({title:u.params.title}),viewProps:u.viewProps})},api(u){return u.controller instanceof le?new Ci(u.controller,u.pool):null}};class Be extends Ce{constructor(s,l){const p=l.valueController.viewProps;super(Object.assign(Object.assign({},l),{value:l.valueController.value,view:new We(s,{props:l.props,viewProps:p}),viewProps:p})),this.props=l.props,this.valueController=l.valueController,this.view.valueElement.appendChild(this.valueController.view.element)}}class je extends r{}const qe=S("spr");class nt{constructor(s,l){this.element=s.createElement("div"),this.element.classList.add(qe()),l.viewProps.bindClassModifiers(this.element);const p=s.createElement("hr");p.classList.add(qe("r")),this.element.appendChild(p)}}class Ze extends Q{constructor(s,l){super(Object.assign(Object.assign({},l),{view:new nt(s,{viewProps:l.viewProps})}))}}const Qe={id:"separator",type:"blade",accept(u){const l=Me(u,{view:ce.required.constant("separator")});return l?{params:l}:null},controller(u){return new Ze(u.document,{blade:u.blade,viewProps:u.viewProps})},api(u){return u.controller instanceof Ze?new je(u.controller):null}},Mt=S("tbi");class cn{constructor(s,l){this.element=s.createElement("div"),this.element.classList.add(Mt()),l.viewProps.bindClassModifiers(this.element),P(l.props,"selected",j=>{j?this.element.classList.add(Mt(void 0,"sel")):this.element.classList.remove(Mt(void 0,"sel"))});const p=s.createElement("button");p.classList.add(Mt("b")),l.viewProps.bindDisabled(p),this.element.appendChild(p),this.buttonElement=p;const C=s.createElement("div");C.classList.add(Mt("t")),N(l.props.value("title"),C),this.buttonElement.appendChild(C),this.titleElement=C}}class Bt{constructor(s,l){this.emitter=new R,this.onClick_=this.onClick_.bind(this),this.props=l.props,this.viewProps=l.viewProps,this.view=new cn(s,{props:l.props,viewProps:l.viewProps}),this.view.buttonElement.addEventListener("click",this.onClick_)}onClick_(){this.emitter.emit("click",{sender:this})}}class Ln{constructor(s,l){this.onItemClick_=this.onItemClick_.bind(this),this.ic_=new Bt(s,{props:l.itemProps,viewProps:W.create()}),this.ic_.emitter.on("click",this.onItemClick_),this.cc_=new re(s,{blade:X(),viewProps:W.create()}),this.props=l.props,P(this.props,"selected",p=>{this.itemController.props.set("selected",p),this.contentController.viewProps.set("hidden",!p)})}get itemController(){return this.ic_}get contentController(){return this.cc_}onItemClick_(){this.props.set("selected",!0)}}class Et{constructor(s,l){this.controller_=s,this.rackApi_=l}get title(){var s;return(s=this.controller_.itemController.props.get("title"))!==null&&s!==void 0?s:""}set title(s){this.controller_.itemController.props.set("title",s)}get selected(){return this.controller_.props.get("selected")}set selected(s){this.controller_.props.set("selected",s)}get children(){return this.rackApi_.children}addButton(s){return this.rackApi_.addButton(s)}addFolder(s){return this.rackApi_.addFolder(s)}addSeparator(s){return this.rackApi_.addSeparator(s)}addTab(s){return this.rackApi_.addTab(s)}add(s,l){this.rackApi_.add(s,l)}remove(s){this.rackApi_.remove(s)}addInput(s,l,p){return this.rackApi_.addInput(s,l,p)}addMonitor(s,l,p){return this.rackApi_.addMonitor(s,l,p)}addBlade(s){return this.rackApi_.addBlade(s)}}class it extends Y{constructor(s,l){super(s,new Lr(s.rackController,l)),this.onPageAdd_=this.onPageAdd_.bind(this),this.onPageRemove_=this.onPageRemove_.bind(this),this.onSelect_=this.onSelect_.bind(this),this.emitter_=new R,this.pageApiMap_=new Map,this.rackApi_.on("change",p=>{this.emitter_.emit("change",{event:p})}),this.rackApi_.on("update",p=>{this.emitter_.emit("update",{event:p})}),this.controller_.tab.selectedIndex.emitter.on("change",this.onSelect_),this.controller_.pageSet.emitter.on("add",this.onPageAdd_),this.controller_.pageSet.emitter.on("remove",this.onPageRemove_),this.controller_.pageSet.items.forEach(p=>{this.setUpPageApi_(p)})}get pages(){return this.controller_.pageSet.items.map(s=>{const l=this.pageApiMap_.get(s);if(!l)throw w.shouldNeverHappen();return l})}addPage(s){const l=this.controller_.view.element.ownerDocument,p=new Ln(l,{itemProps:K.fromObject({selected:!1,title:s.title}),props:K.fromObject({selected:!1})});this.controller_.add(p,s.index);const C=this.pageApiMap_.get(p);if(!C)throw w.shouldNeverHappen();return C}removePage(s){this.controller_.remove(s)}on(s,l){const p=l.bind(this);return this.emitter_.on(s,C=>{p(C.event)}),this}setUpPageApi_(s){const l=this.rackApi_.apiSet_.find(C=>C.controller_===s.contentController);if(!l)throw w.shouldNeverHappen();const p=new Et(s,l);this.pageApiMap_.set(s,p)}onPageAdd_(s){this.setUpPageApi_(s.item)}onPageRemove_(s){if(!this.pageApiMap_.get(s.item))throw w.shouldNeverHappen();this.pageApiMap_.delete(s.item)}onSelect_(s){this.emitter_.emit("select",{event:new d(this,s.rawValue)})}}const Ur=-1;class Rt{constructor(){this.onItemSelectedChange_=this.onItemSelectedChange_.bind(this),this.empty=ee(!0),this.selectedIndex=ee(Ur),this.items_=[]}add(s,l){const p=l??this.items_.length;this.items_.splice(p,0,s),s.emitter.on("change",this.onItemSelectedChange_),this.keepSelection_()}remove(s){const l=this.items_.indexOf(s);l<0||(this.items_.splice(l,1),s.emitter.off("change",this.onItemSelectedChange_),this.keepSelection_())}keepSelection_(){if(this.items_.length===0){this.selectedIndex.rawValue=Ur,this.empty.rawValue=!0;return}const s=this.items_.findIndex(l=>l.rawValue);s<0?(this.items_.forEach((l,p)=>{l.rawValue=p===0}),this.selectedIndex.rawValue=0):(this.items_.forEach((l,p)=>{l.rawValue=p===s}),this.selectedIndex.rawValue=s),this.empty.rawValue=!1}onItemSelectedChange_(s){if(s.rawValue){const l=this.items_.findIndex(p=>p===s.sender);this.items_.forEach((p,C)=>{p.rawValue=C===l}),this.selectedIndex.rawValue=l}else this.keepSelection_()}}const Mn=S("tab");class Uo{constructor(s,l){this.element=s.createElement("div"),this.element.classList.add(Mn(),he()),l.viewProps.bindClassModifiers(this.element),I(l.empty,b(this.element,Mn(void 0,"nop")));const p=s.createElement("div");p.classList.add(Mn("t")),this.element.appendChild(p),this.itemsElement=p;const C=s.createElement("div");C.classList.add(Mn("i")),this.element.appendChild(C);const j=l.contentsElement;j.classList.add(Mn("c")),this.element.appendChild(j),this.contentsElement=j}}class Ai extends Ir{constructor(s,l){const p=new re(s,{blade:l.blade,viewProps:l.viewProps}),C=new Rt;super({blade:l.blade,rackController:p,view:new Uo(s,{contentsElement:p.view.element,empty:C.empty,viewProps:l.viewProps})}),this.onPageAdd_=this.onPageAdd_.bind(this),this.onPageRemove_=this.onPageRemove_.bind(this),this.pageSet_=new ct(()=>null),this.pageSet_.emitter.on("add",this.onPageAdd_),this.pageSet_.emitter.on("remove",this.onPageRemove_),this.tab=C}get pageSet(){return this.pageSet_}add(s,l){this.pageSet_.add(s,l)}remove(s){this.pageSet_.remove(this.pageSet_.items[s])}onPageAdd_(s){const l=s.item;ye(this.view.itemsElement,l.itemController.view.element,s.index),l.itemController.viewProps.set("parent",this.viewProps),this.rackController.rack.add(l.contentController,s.index),this.tab.add(l.props.value("selected"))}onPageRemove_(s){const l=s.item;xe(l.itemController.view.element),l.itemController.viewProps.set("parent",null),this.rackController.rack.remove(l.contentController),this.tab.remove(l.props.value("selected"))}}const Nr={id:"tab",type:"blade",accept(u){const s=ce,l=Me(u,{pages:s.required.array(s.required.object({title:s.required.string})),view:s.required.constant("tab")});return!l||l.pages.length===0?null:{params:l}},controller(u){const s=new Ai(u.document,{blade:u.blade,viewProps:u.viewProps});return u.params.pages.forEach(l=>{const p=new Ln(u.document,{itemProps:K.fromObject({selected:!1,title:l.title}),props:K.fromObject({selected:!1})});s.add(p)}),s},api(u){return u.controller instanceof Ai?new it(u.controller,u.pool):null}};function Yt(u,s){const l=u.accept(s.params);if(!l)return null;const p=ce.optional.boolean(s.params.disabled).value,C=ce.optional.boolean(s.params.hidden).value;return u.controller({blade:X(),document:s.document,params:Object.assign(Object.assign({},l.params),{disabled:p,hidden:C}),viewProps:W.create({disabled:p,hidden:C})})}class oi{constructor(){this.disabled=!1,this.emitter=new R}dispose(){}tick(){this.disabled||this.emitter.emit("tick",{sender:this})}}class Us{constructor(s,l){this.disabled_=!1,this.timerId_=null,this.onTick_=this.onTick_.bind(this),this.doc_=s,this.emitter=new R,this.interval_=l,this.setTimer_()}get disabled(){return this.disabled_}set disabled(s){this.disabled_=s,this.disabled_?this.clearTimer_():this.setTimer_()}dispose(){this.clearTimer_()}clearTimer_(){if(this.timerId_===null)return;const s=this.doc_.defaultView;s&&s.clearInterval(this.timerId_),this.timerId_=null}setTimer_(){if(this.clearTimer_(),this.interval_<=0)return;const s=this.doc_.defaultView;s&&(this.timerId_=s.setInterval(this.onTick_,this.interval_))}onTick_(){this.disabled_||this.emitter.emit("tick",{sender:this})}}class _n{constructor(s){this.onValueChange_=this.onValueChange_.bind(this),this.reader=s.reader,this.writer=s.writer,this.emitter=new R,this.value=s.value,this.value.emitter.on("change",this.onValueChange_),this.target=s.target,this.read()}read(){const s=this.target.read();s!==void 0&&(this.value.rawValue=this.reader(s))}write_(s){this.writer(this.target,s)}onValueChange_(s){this.write_(s.rawValue),this.emitter.emit("change",{options:s.options,rawValue:s.rawValue,sender:this})}}function Or(u,s){for(;u.length<s;)u.push(void 0)}function Ml(u){const s=[];return Or(s,u),ee(s)}function No(u){const s=u.indexOf(void 0);return s<0?u:u.slice(0,s)}function Ug(u,s){const l=[...No(u),s];return l.length>u.length?l.splice(0,l.length-u.length):Or(l,u.length),l}class Ng{constructor(s){this.onTick_=this.onTick_.bind(this),this.reader_=s.reader,this.target=s.target,this.emitter=new R,this.value=s.value,this.ticker=s.ticker,this.ticker.emitter.on("tick",this.onTick_),this.read()}dispose(){this.ticker.dispose()}read(){const s=this.target.read();if(s===void 0)return;const l=this.value.rawValue,p=this.reader_(s);this.value.rawValue=Ug(l,p),this.emitter.emit("update",{rawValue:p,sender:this})}onTick_(s){this.read()}}class Ns{constructor(s){this.constraints=s}constrain(s){return this.constraints.reduce((l,p)=>p.constrain(l),s)}}function ai(u,s){if(u instanceof s)return u;if(u instanceof Ns){const l=u.constraints.reduce((p,C)=>p||(C instanceof s?C:null),null);if(l)return l}return null}class Fr{constructor(s){this.values=K.fromObject({max:s.max,min:s.min})}constrain(s){const l=this.values.get("max"),p=this.values.get("min");return Math.min(Math.max(s,p),l)}}class Os{constructor(s){this.values=K.fromObject({options:s})}get options(){return this.values.get("options")}constrain(s){const l=this.values.get("options");return l.length===0||l.filter(C=>C.value===s).length>0?s:l[0].value}}class rh{constructor(s){this.values=K.fromObject({max:s.max,min:s.min})}get maxValue(){return this.values.get("max")}get minValue(){return this.values.get("min")}constrain(s){const l=this.values.get("max"),p=this.values.get("min");let C=s;return m(p)||(C=Math.max(C,p)),m(l)||(C=Math.min(C,l)),C}}class Oo{constructor(s,l=0){this.step=s,this.origin=l}constrain(s){const l=this.origin%this.step,p=Math.round((s-l)/this.step);return l+p*this.step}}const El=S("lst");class Og{constructor(s,l){this.onValueChange_=this.onValueChange_.bind(this),this.props_=l.props,this.element=s.createElement("div"),this.element.classList.add(El()),l.viewProps.bindClassModifiers(this.element);const p=s.createElement("select");p.classList.add(El("s")),l.viewProps.bindDisabled(p),this.element.appendChild(p),this.selectElement=p;const C=s.createElement("div");C.classList.add(El("m")),C.appendChild(se(s,"dropdown")),this.element.appendChild(C),l.value.emitter.on("change",this.onValueChange_),this.value_=l.value,P(this.props_,"options",j=>{Ee(this.selectElement),j.forEach(ie=>{const Te=s.createElement("option");Te.textContent=ie.text,this.selectElement.appendChild(Te)}),this.update_()})}update_(){const s=this.props_.get("options").map(l=>l.value);this.selectElement.selectedIndex=s.indexOf(this.value_.rawValue)}onValueChange_(){this.update_()}}class Fs{constructor(s,l){this.onSelectChange_=this.onSelectChange_.bind(this),this.props=l.props,this.value=l.value,this.viewProps=l.viewProps,this.view=new Og(s,{props:this.props,value:this.value,viewProps:this.viewProps}),this.view.selectElement.addEventListener("change",this.onSelectChange_)}onSelectChange_(s){const l=s.currentTarget;this.value.rawValue=this.props.get("options")[l.selectedIndex].value}}const sh=S("pop");class Fg{constructor(s,l){this.element=s.createElement("div"),this.element.classList.add(sh()),l.viewProps.bindClassModifiers(this.element),I(l.shows,b(this.element,sh(void 0,"v")))}}class oh{constructor(s,l){this.shows=ee(!1),this.viewProps=l.viewProps,this.view=new Fg(s,{shows:this.shows,viewProps:this.viewProps})}}const ah=S("txt");class Bg{constructor(s,l){this.onChange_=this.onChange_.bind(this),this.element=s.createElement("div"),this.element.classList.add(ah()),l.viewProps.bindClassModifiers(this.element),this.props_=l.props,this.props_.emitter.on("change",this.onChange_);const p=s.createElement("input");p.classList.add(ah("i")),p.type="text",l.viewProps.bindDisabled(p),this.element.appendChild(p),this.inputElement=p,l.value.emitter.on("change",this.onChange_),this.value_=l.value,this.refresh()}refresh(){const s=this.props_.get("formatter");this.inputElement.value=s(this.value_.rawValue)}onChange_(){this.refresh()}}class Fo{constructor(s,l){this.onInputChange_=this.onInputChange_.bind(this),this.parser_=l.parser,this.props=l.props,this.value=l.value,this.viewProps=l.viewProps,this.view=new Bg(s,{props:l.props,value:this.value,viewProps:this.viewProps}),this.view.inputElement.addEventListener("change",this.onInputChange_)}onInputChange_(s){const p=s.currentTarget.value,C=this.parser_(p);m(C)||(this.value.rawValue=C),this.view.refresh()}}function kg(u){return String(u)}function lh(u){return u==="false"?!1:!!u}function ch(u){return kg(u)}class Vg{constructor(s){this.text=s}evaluate(){return Number(this.text)}toString(){return this.text}}const zg={"**":(u,s)=>Math.pow(u,s),"*":(u,s)=>u*s,"/":(u,s)=>u/s,"%":(u,s)=>u%s,"+":(u,s)=>u+s,"-":(u,s)=>u-s,"<<":(u,s)=>u<<s,">>":(u,s)=>u>>s,">>>":(u,s)=>u>>>s,"&":(u,s)=>u&s,"^":(u,s)=>u^s,"|":(u,s)=>u|s};class Hg{constructor(s,l,p){this.left=l,this.operator=s,this.right=p}evaluate(){const s=zg[this.operator];if(!s)throw new Error(`unexpected binary operator: '${this.operator}`);return s(this.left.evaluate(),this.right.evaluate())}toString(){return["b(",this.left.toString(),this.operator,this.right.toString(),")"].join(" ")}}const Gg={"+":u=>u,"-":u=>-u,"~":u=>~u};class Wg{constructor(s,l){this.operator=s,this.expression=l}evaluate(){const s=Gg[this.operator];if(!s)throw new Error(`unexpected unary operator: '${this.operator}`);return s(this.expression.evaluate())}toString(){return["u(",this.operator,this.expression.toString(),")"].join(" ")}}function Sl(u){return(s,l)=>{for(let p=0;p<u.length;p++){const C=u[p](s,l);if(C!=="")return C}return""}}function Bs(u,s){var l;const p=u.substr(s).match(/^\s+/);return(l=p&&p[0])!==null&&l!==void 0?l:""}function jg(u,s){const l=u.substr(s,1);return l.match(/^[1-9]$/)?l:""}function ks(u,s){var l;const p=u.substr(s).match(/^[0-9]+/);return(l=p&&p[0])!==null&&l!==void 0?l:""}function Xg(u,s){const l=ks(u,s);if(l!=="")return l;const p=u.substr(s,1);if(s+=1,p!=="-"&&p!=="+")return"";const C=ks(u,s);return C===""?"":p+C}function Tl(u,s){const l=u.substr(s,1);if(s+=1,l.toLowerCase()!=="e")return"";const p=Xg(u,s);return p===""?"":l+p}function uh(u,s){const l=u.substr(s,1);if(l==="0")return l;const p=jg(u,s);return s+=p.length,p===""?"":p+ks(u,s)}function qg(u,s){const l=uh(u,s);if(s+=l.length,l==="")return"";const p=u.substr(s,1);if(s+=p.length,p!==".")return"";const C=ks(u,s);return s+=C.length,l+p+C+Tl(u,s)}function Yg(u,s){const l=u.substr(s,1);if(s+=l.length,l!==".")return"";const p=ks(u,s);return s+=p.length,p===""?"":l+p+Tl(u,s)}function Kg(u,s){const l=uh(u,s);return s+=l.length,l===""?"":l+Tl(u,s)}const $g=Sl([qg,Yg,Kg]);function Zg(u,s){var l;const p=u.substr(s).match(/^[01]+/);return(l=p&&p[0])!==null&&l!==void 0?l:""}function Jg(u,s){const l=u.substr(s,2);if(s+=l.length,l.toLowerCase()!=="0b")return"";const p=Zg(u,s);return p===""?"":l+p}function Qg(u,s){var l;const p=u.substr(s).match(/^[0-7]+/);return(l=p&&p[0])!==null&&l!==void 0?l:""}function ev(u,s){const l=u.substr(s,2);if(s+=l.length,l.toLowerCase()!=="0o")return"";const p=Qg(u,s);return p===""?"":l+p}function tv(u,s){var l;const p=u.substr(s).match(/^[0-9a-f]+/i);return(l=p&&p[0])!==null&&l!==void 0?l:""}function nv(u,s){const l=u.substr(s,2);if(s+=l.length,l.toLowerCase()!=="0x")return"";const p=tv(u,s);return p===""?"":l+p}const iv=Sl([Jg,ev,nv]),rv=Sl([iv,$g]);function sv(u,s){const l=rv(u,s);return s+=l.length,l===""?null:{evaluable:new Vg(l),cursor:s}}function ov(u,s){const l=u.substr(s,1);if(s+=l.length,l!=="(")return null;const p=dh(u,s);if(!p)return null;s=p.cursor,s+=Bs(u,s).length;const C=u.substr(s,1);return s+=C.length,C!==")"?null:{evaluable:p.evaluable,cursor:s}}function av(u,s){var l;return(l=sv(u,s))!==null&&l!==void 0?l:ov(u,s)}function hh(u,s){const l=av(u,s);if(l)return l;const p=u.substr(s,1);if(s+=p.length,p!=="+"&&p!=="-"&&p!=="~")return null;const C=hh(u,s);return C?(s=C.cursor,{cursor:s,evaluable:new Wg(p,C.evaluable)}):null}function lv(u,s,l){l+=Bs(s,l).length;const p=u.filter(C=>s.startsWith(C,l))[0];return p?(l+=p.length,l+=Bs(s,l).length,{cursor:l,operator:p}):null}function cv(u,s){return(l,p)=>{const C=u(l,p);if(!C)return null;p=C.cursor;let j=C.evaluable;for(;;){const ie=lv(s,l,p);if(!ie)break;p=ie.cursor;const Te=u(l,p);if(!Te)return null;p=Te.cursor,j=new Hg(ie.operator,j,Te.evaluable)}return j?{cursor:p,evaluable:j}:null}}const uv=[["**"],["*","/","%"],["+","-"],["<<",">>>",">>"],["&"],["^"],["|"]].reduce((u,s)=>cv(u,s),hh);function dh(u,s){return s+=Bs(u,s).length,uv(u,s)}function hv(u){const s=dh(u,0);return!s||s.cursor+Bs(u,s.cursor).length!==u.length?null:s.evaluable}function li(u){var s;const l=hv(u);return(s=l==null?void 0:l.evaluate())!==null&&s!==void 0?s:null}function fh(u){if(typeof u=="number")return u;if(typeof u=="string"){const s=li(u);if(!m(s))return s}return 0}function dv(u){return String(u)}function Jt(u){return s=>s.toFixed(Math.max(Math.min(u,20),0))}const fv=Jt(0);function Bo(u){return fv(u)+"%"}function ph(u){return String(u)}function Cl(u){return u}function Vs({primary:u,secondary:s,forward:l,backward:p}){let C=!1;function j(ie){C||(C=!0,ie(),C=!1)}u.emitter.on("change",ie=>{j(()=>{s.setRawValue(l(u,s),ie.options)})}),s.emitter.on("change",ie=>{j(()=>{u.setRawValue(p(u,s),ie.options)}),j(()=>{s.setRawValue(l(u,s),ie.options)})}),j(()=>{s.setRawValue(l(u,s),{forceEmit:!1,last:!0})})}function xn(u,s){const l=u*(s.altKey?.1:1)*(s.shiftKey?10:1);return s.upKey?+l:s.downKey?-l:0}function zs(u){return{altKey:u.altKey,downKey:u.key==="ArrowDown",shiftKey:u.shiftKey,upKey:u.key==="ArrowUp"}}function ci(u){return{altKey:u.altKey,downKey:u.key==="ArrowLeft",shiftKey:u.shiftKey,upKey:u.key==="ArrowRight"}}function pv(u){return u==="ArrowUp"||u==="ArrowDown"}function mh(u){return pv(u)||u==="ArrowLeft"||u==="ArrowRight"}function Al(u,s){var l,p;const C=s.ownerDocument.defaultView,j=s.getBoundingClientRect();return{x:u.pageX-(((l=C&&C.scrollX)!==null&&l!==void 0?l:0)+j.left),y:u.pageY-(((p=C&&C.scrollY)!==null&&p!==void 0?p:0)+j.top)}}class rr{constructor(s){this.lastTouch_=null,this.onDocumentMouseMove_=this.onDocumentMouseMove_.bind(this),this.onDocumentMouseUp_=this.onDocumentMouseUp_.bind(this),this.onMouseDown_=this.onMouseDown_.bind(this),this.onTouchEnd_=this.onTouchEnd_.bind(this),this.onTouchMove_=this.onTouchMove_.bind(this),this.onTouchStart_=this.onTouchStart_.bind(this),this.elem_=s,this.emitter=new R,s.addEventListener("touchstart",this.onTouchStart_,{passive:!1}),s.addEventListener("touchmove",this.onTouchMove_,{passive:!0}),s.addEventListener("touchend",this.onTouchEnd_),s.addEventListener("mousedown",this.onMouseDown_)}computePosition_(s){const l=this.elem_.getBoundingClientRect();return{bounds:{width:l.width,height:l.height},point:s?{x:s.x,y:s.y}:null}}onMouseDown_(s){var l;s.preventDefault(),(l=s.currentTarget)===null||l===void 0||l.focus();const p=this.elem_.ownerDocument;p.addEventListener("mousemove",this.onDocumentMouseMove_),p.addEventListener("mouseup",this.onDocumentMouseUp_),this.emitter.emit("down",{altKey:s.altKey,data:this.computePosition_(Al(s,this.elem_)),sender:this,shiftKey:s.shiftKey})}onDocumentMouseMove_(s){this.emitter.emit("move",{altKey:s.altKey,data:this.computePosition_(Al(s,this.elem_)),sender:this,shiftKey:s.shiftKey})}onDocumentMouseUp_(s){const l=this.elem_.ownerDocument;l.removeEventListener("mousemove",this.onDocumentMouseMove_),l.removeEventListener("mouseup",this.onDocumentMouseUp_),this.emitter.emit("up",{altKey:s.altKey,data:this.computePosition_(Al(s,this.elem_)),sender:this,shiftKey:s.shiftKey})}onTouchStart_(s){s.preventDefault();const l=s.targetTouches.item(0),p=this.elem_.getBoundingClientRect();this.emitter.emit("down",{altKey:s.altKey,data:this.computePosition_(l?{x:l.clientX-p.left,y:l.clientY-p.top}:void 0),sender:this,shiftKey:s.shiftKey}),this.lastTouch_=l}onTouchMove_(s){const l=s.targetTouches.item(0),p=this.elem_.getBoundingClientRect();this.emitter.emit("move",{altKey:s.altKey,data:this.computePosition_(l?{x:l.clientX-p.left,y:l.clientY-p.top}:void 0),sender:this,shiftKey:s.shiftKey}),this.lastTouch_=l}onTouchEnd_(s){var l;const p=(l=s.targetTouches.item(0))!==null&&l!==void 0?l:this.lastTouch_,C=this.elem_.getBoundingClientRect();this.emitter.emit("up",{altKey:s.altKey,data:this.computePosition_(p?{x:p.clientX-C.left,y:p.clientY-C.top}:void 0),sender:this,shiftKey:s.shiftKey})}}function Lt(u,s,l,p,C){const j=(u-s)/(l-s);return p+j*(C-p)}function gh(u){return String(u.toFixed(10)).split(".")[1].replace(/0+$/,"").length}function Vt(u,s,l){return Math.min(Math.max(u,s),l)}function vh(u,s){return(u%s+s)%s}const In=S("txt");class mv{constructor(s,l){this.onChange_=this.onChange_.bind(this),this.props_=l.props,this.props_.emitter.on("change",this.onChange_),this.element=s.createElement("div"),this.element.classList.add(In(),In(void 0,"num")),l.arrayPosition&&this.element.classList.add(In(void 0,l.arrayPosition)),l.viewProps.bindClassModifiers(this.element);const p=s.createElement("input");p.classList.add(In("i")),p.type="text",l.viewProps.bindDisabled(p),this.element.appendChild(p),this.inputElement=p,this.onDraggingChange_=this.onDraggingChange_.bind(this),this.dragging_=l.dragging,this.dragging_.emitter.on("change",this.onDraggingChange_),this.element.classList.add(In()),this.inputElement.classList.add(In("i"));const C=s.createElement("div");C.classList.add(In("k")),this.element.appendChild(C),this.knobElement=C;const j=s.createElementNS(Z,"svg");j.classList.add(In("g")),this.knobElement.appendChild(j);const ie=s.createElementNS(Z,"path");ie.classList.add(In("gb")),j.appendChild(ie),this.guideBodyElem_=ie;const Te=s.createElementNS(Z,"path");Te.classList.add(In("gh")),j.appendChild(Te),this.guideHeadElem_=Te;const Xe=s.createElement("div");Xe.classList.add(S("tt")()),this.knobElement.appendChild(Xe),this.tooltipElem_=Xe,l.value.emitter.on("change",this.onChange_),this.value=l.value,this.refresh()}onDraggingChange_(s){if(s.rawValue===null){this.element.classList.remove(In(void 0,"drg"));return}this.element.classList.add(In(void 0,"drg"));const l=s.rawValue/this.props_.get("draggingScale"),p=l+(l>0?-1:l<0?1:0),C=Vt(-p,-4,4);this.guideHeadElem_.setAttributeNS(null,"d",[`M ${p+C},0 L${p},4 L${p+C},8`,`M ${l},-1 L${l},9`].join(" ")),this.guideBodyElem_.setAttributeNS(null,"d",`M 0,4 L${l},4`);const j=this.props_.get("formatter");this.tooltipElem_.textContent=j(this.value.rawValue),this.tooltipElem_.style.left=`${l}px`}refresh(){const s=this.props_.get("formatter");this.inputElement.value=s(this.value.rawValue)}onChange_(){this.refresh()}}class Hs{constructor(s,l){var p;this.originRawValue_=0,this.onInputChange_=this.onInputChange_.bind(this),this.onInputKeyDown_=this.onInputKeyDown_.bind(this),this.onInputKeyUp_=this.onInputKeyUp_.bind(this),this.onPointerDown_=this.onPointerDown_.bind(this),this.onPointerMove_=this.onPointerMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.baseStep_=l.baseStep,this.parser_=l.parser,this.props=l.props,this.sliderProps_=(p=l.sliderProps)!==null&&p!==void 0?p:null,this.value=l.value,this.viewProps=l.viewProps,this.dragging_=ee(null),this.view=new mv(s,{arrayPosition:l.arrayPosition,dragging:this.dragging_,props:this.props,value:this.value,viewProps:this.viewProps}),this.view.inputElement.addEventListener("change",this.onInputChange_),this.view.inputElement.addEventListener("keydown",this.onInputKeyDown_),this.view.inputElement.addEventListener("keyup",this.onInputKeyUp_);const C=new rr(this.view.knobElement);C.emitter.on("down",this.onPointerDown_),C.emitter.on("move",this.onPointerMove_),C.emitter.on("up",this.onPointerUp_)}constrainValue_(s){var l,p;const C=(l=this.sliderProps_)===null||l===void 0?void 0:l.get("minValue"),j=(p=this.sliderProps_)===null||p===void 0?void 0:p.get("maxValue");let ie=s;return C!==void 0&&(ie=Math.max(ie,C)),j!==void 0&&(ie=Math.min(ie,j)),ie}onInputChange_(s){const p=s.currentTarget.value,C=this.parser_(p);m(C)||(this.value.rawValue=this.constrainValue_(C)),this.view.refresh()}onInputKeyDown_(s){const l=xn(this.baseStep_,zs(s));l!==0&&this.value.setRawValue(this.constrainValue_(this.value.rawValue+l),{forceEmit:!1,last:!1})}onInputKeyUp_(s){xn(this.baseStep_,zs(s))!==0&&this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}onPointerDown_(){this.originRawValue_=this.value.rawValue,this.dragging_.rawValue=0}computeDraggingValue_(s){if(!s.point)return null;const l=s.point.x-s.bounds.width/2;return this.constrainValue_(this.originRawValue_+l*this.props.get("draggingScale"))}onPointerMove_(s){const l=this.computeDraggingValue_(s.data);l!==null&&(this.value.setRawValue(l,{forceEmit:!1,last:!1}),this.dragging_.rawValue=this.value.rawValue-this.originRawValue_)}onPointerUp_(s){const l=this.computeDraggingValue_(s.data);l!==null&&(this.value.setRawValue(l,{forceEmit:!0,last:!0}),this.dragging_.rawValue=null)}}const Pl=S("sld");class gv{constructor(s,l){this.onChange_=this.onChange_.bind(this),this.props_=l.props,this.props_.emitter.on("change",this.onChange_),this.element=s.createElement("div"),this.element.classList.add(Pl()),l.viewProps.bindClassModifiers(this.element);const p=s.createElement("div");p.classList.add(Pl("t")),l.viewProps.bindTabIndex(p),this.element.appendChild(p),this.trackElement=p;const C=s.createElement("div");C.classList.add(Pl("k")),this.trackElement.appendChild(C),this.knobElement=C,l.value.emitter.on("change",this.onChange_),this.value=l.value,this.update_()}update_(){const s=Vt(Lt(this.value.rawValue,this.props_.get("minValue"),this.props_.get("maxValue"),0,100),0,100);this.knobElement.style.width=`${s}%`}onChange_(){this.update_()}}class vv{constructor(s,l){this.onKeyDown_=this.onKeyDown_.bind(this),this.onKeyUp_=this.onKeyUp_.bind(this),this.onPointerDownOrMove_=this.onPointerDownOrMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.baseStep_=l.baseStep,this.value=l.value,this.viewProps=l.viewProps,this.props=l.props,this.view=new gv(s,{props:this.props,value:this.value,viewProps:this.viewProps}),this.ptHandler_=new rr(this.view.trackElement),this.ptHandler_.emitter.on("down",this.onPointerDownOrMove_),this.ptHandler_.emitter.on("move",this.onPointerDownOrMove_),this.ptHandler_.emitter.on("up",this.onPointerUp_),this.view.trackElement.addEventListener("keydown",this.onKeyDown_),this.view.trackElement.addEventListener("keyup",this.onKeyUp_)}handlePointerEvent_(s,l){s.point&&this.value.setRawValue(Lt(Vt(s.point.x,0,s.bounds.width),0,s.bounds.width,this.props.get("minValue"),this.props.get("maxValue")),l)}onPointerDownOrMove_(s){this.handlePointerEvent_(s.data,{forceEmit:!1,last:!1})}onPointerUp_(s){this.handlePointerEvent_(s.data,{forceEmit:!0,last:!0})}onKeyDown_(s){const l=xn(this.baseStep_,ci(s));l!==0&&this.value.setRawValue(this.value.rawValue+l,{forceEmit:!1,last:!1})}onKeyUp_(s){xn(this.baseStep_,ci(s))!==0&&this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}}const Rl=S("sldtxt");class _v{constructor(s,l){this.element=s.createElement("div"),this.element.classList.add(Rl());const p=s.createElement("div");p.classList.add(Rl("s")),this.sliderView_=l.sliderView,p.appendChild(this.sliderView_.element),this.element.appendChild(p);const C=s.createElement("div");C.classList.add(Rl("t")),this.textView_=l.textView,C.appendChild(this.textView_.element),this.element.appendChild(C)}}class Ll{constructor(s,l){this.value=l.value,this.viewProps=l.viewProps,this.sliderC_=new vv(s,{baseStep:l.baseStep,props:l.sliderProps,value:l.value,viewProps:this.viewProps}),this.textC_=new Hs(s,{baseStep:l.baseStep,parser:l.parser,props:l.textProps,sliderProps:l.sliderProps,value:l.value,viewProps:l.viewProps}),this.view=new _v(s,{sliderView:this.sliderC_.view,textView:this.textC_.view})}get sliderController(){return this.sliderC_}get textController(){return this.textC_}}function Gs(u,s){u.write(s)}function ko(u){const s=ce;if(Array.isArray(u))return s.required.array(s.required.object({text:s.required.string,value:s.required.raw}))(u).value;if(typeof u=="object")return s.required.raw(u).value}function _h(u){if(u==="inline"||u==="popup")return u}function Pi(u){const s=ce;return s.required.object({max:s.optional.number,min:s.optional.number,step:s.optional.number})(u).value}function xh(u){if(Array.isArray(u))return u;const s=[];return Object.keys(u).forEach(l=>{s.push({text:l,value:u[l]})}),s}function Il(u){return m(u)?null:new Os(xh(u))}function xv(u){const s=u?ai(u,Oo):null;return s?s.step:null}function Vo(u,s){const l=u&&ai(u,Oo);return l?gh(l.step):Math.max(gh(s),2)}function Br(u){const s=xv(u);return s??1}function kr(u,s){var l;const p=u&&ai(u,Oo),C=Math.abs((l=p==null?void 0:p.step)!==null&&l!==void 0?l:s);return C===0?.1:Math.pow(10,Math.floor(Math.log10(C))-1)}const zo=S("ckb");class bv{constructor(s,l){this.onValueChange_=this.onValueChange_.bind(this),this.element=s.createElement("div"),this.element.classList.add(zo()),l.viewProps.bindClassModifiers(this.element);const p=s.createElement("label");p.classList.add(zo("l")),this.element.appendChild(p);const C=s.createElement("input");C.classList.add(zo("i")),C.type="checkbox",p.appendChild(C),this.inputElement=C,l.viewProps.bindDisabled(this.inputElement);const j=s.createElement("div");j.classList.add(zo("w")),p.appendChild(j);const ie=se(s,"check");j.appendChild(ie),l.value.emitter.on("change",this.onValueChange_),this.value=l.value,this.update_()}update_(){this.inputElement.checked=this.value.rawValue}onValueChange_(){this.update_()}}class yv{constructor(s,l){this.onInputChange_=this.onInputChange_.bind(this),this.value=l.value,this.viewProps=l.viewProps,this.view=new bv(s,{value:this.value,viewProps:this.viewProps}),this.view.inputElement.addEventListener("change",this.onInputChange_)}onInputChange_(s){const l=s.currentTarget;this.value.rawValue=l.checked}}function wv(u){const s=[],l=Il(u.options);return l&&s.push(l),new Ns(s)}const Mv={id:"input-bool",type:"input",accept:(u,s)=>{if(typeof u!="boolean")return null;const p=Me(s,{options:ce.optional.custom(ko)});return p?{initialValue:u,params:p}:null},binding:{reader:u=>lh,constraint:u=>wv(u.params),writer:u=>Gs},controller:u=>{const s=u.document,l=u.value,p=u.constraint,C=p&&ai(p,Os);return C?new Fs(s,{props:new K({options:C.values.value("options")}),value:l,viewProps:u.viewProps}):new yv(s,{value:l,viewProps:u.viewProps})}},sr=S("col");class Ev{constructor(s,l){this.element=s.createElement("div"),this.element.classList.add(sr()),l.foldable.bindExpandedClass(this.element,sr(void 0,"expanded")),P(l.foldable,"completed",b(this.element,sr(void 0,"cpl")));const p=s.createElement("div");p.classList.add(sr("h")),this.element.appendChild(p);const C=s.createElement("div");C.classList.add(sr("s")),p.appendChild(C),this.swatchElement=C;const j=s.createElement("div");if(j.classList.add(sr("t")),p.appendChild(j),this.textElement=j,l.pickerLayout==="inline"){const ie=s.createElement("div");ie.classList.add(sr("p")),this.element.appendChild(ie),this.pickerElement=ie}else this.pickerElement=null}}function Sv(u,s,l){const p=Vt(u/255,0,1),C=Vt(s/255,0,1),j=Vt(l/255,0,1),ie=Math.max(p,C,j),Te=Math.min(p,C,j),Xe=ie-Te;let Ye=0,pt=0;const vt=(Te+ie)/2;return Xe!==0&&(pt=Xe/(1-Math.abs(ie+Te-1)),p===ie?Ye=(C-j)/Xe:C===ie?Ye=2+(j-p)/Xe:Ye=4+(p-C)/Xe,Ye=Ye/6+(Ye<0?1:0)),[Ye*360,pt*100,vt*100]}function Tv(u,s,l){const p=(u%360+360)%360,C=Vt(s/100,0,1),j=Vt(l/100,0,1),ie=(1-Math.abs(2*j-1))*C,Te=ie*(1-Math.abs(p/60%2-1)),Xe=j-ie/2;let Ye,pt,vt;return p>=0&&p<60?[Ye,pt,vt]=[ie,Te,0]:p>=60&&p<120?[Ye,pt,vt]=[Te,ie,0]:p>=120&&p<180?[Ye,pt,vt]=[0,ie,Te]:p>=180&&p<240?[Ye,pt,vt]=[0,Te,ie]:p>=240&&p<300?[Ye,pt,vt]=[Te,0,ie]:[Ye,pt,vt]=[ie,0,Te],[(Ye+Xe)*255,(pt+Xe)*255,(vt+Xe)*255]}function Cv(u,s,l){const p=Vt(u/255,0,1),C=Vt(s/255,0,1),j=Vt(l/255,0,1),ie=Math.max(p,C,j),Te=Math.min(p,C,j),Xe=ie-Te;let Ye;Xe===0?Ye=0:ie===p?Ye=60*(((C-j)/Xe%6+6)%6):ie===C?Ye=60*((j-p)/Xe+2):Ye=60*((p-C)/Xe+4);const pt=ie===0?0:Xe/ie,vt=ie;return[Ye,pt*100,vt*100]}function bh(u,s,l){const p=vh(u,360),C=Vt(s/100,0,1),j=Vt(l/100,0,1),ie=j*C,Te=ie*(1-Math.abs(p/60%2-1)),Xe=j-ie;let Ye,pt,vt;return p>=0&&p<60?[Ye,pt,vt]=[ie,Te,0]:p>=60&&p<120?[Ye,pt,vt]=[Te,ie,0]:p>=120&&p<180?[Ye,pt,vt]=[0,ie,Te]:p>=180&&p<240?[Ye,pt,vt]=[0,Te,ie]:p>=240&&p<300?[Ye,pt,vt]=[Te,0,ie]:[Ye,pt,vt]=[ie,0,Te],[(Ye+Xe)*255,(pt+Xe)*255,(vt+Xe)*255]}function Av(u,s,l){const p=l+s*(100-Math.abs(2*l-100))/200;return[u,p!==0?s*(100-Math.abs(2*l-100))/p:0,l+s*(100-Math.abs(2*l-100))/(2*100)]}function Pv(u,s,l){const p=100-Math.abs(l*(200-s)/100-100);return[u,p!==0?s*l/p:0,l*(200-s)/(2*100)]}function or(u){return[u[0],u[1],u[2]]}function yh(u,s){return[u[0],u[1],u[2],s]}const Rv={hsl:{hsl:(u,s,l)=>[u,s,l],hsv:Av,rgb:Tv},hsv:{hsl:Pv,hsv:(u,s,l)=>[u,s,l],rgb:bh},rgb:{hsl:Sv,hsv:Cv,rgb:(u,s,l)=>[u,s,l]}};function Ho(u,s){return[s==="float"?1:u==="rgb"?255:360,s==="float"?1:u==="rgb"?255:100,s==="float"?1:u==="rgb"?255:100]}function Lv(u,s){return u===s?s:vh(u,s)}function Iv(u,s,l){var p;const C=Ho(s,l);return[s==="rgb"?Vt(u[0],0,C[0]):Lv(u[0],C[0]),Vt(u[1],0,C[1]),Vt(u[2],0,C[2]),Vt((p=u[3])!==null&&p!==void 0?p:1,0,1)]}function wh(u,s,l,p){const C=Ho(s,l),j=Ho(s,p);return u.map((ie,Te)=>ie/C[Te]*j[Te])}function Dv(u,s,l){const p=wh(u,s.mode,s.type,"int"),C=Rv[s.mode][l.mode](...p);return wh(C,l.mode,"int",l.type)}function Go(u,s){return typeof u!="object"||m(u)?!1:s in u&&typeof u[s]=="number"}class at{static black(s="int"){return new at([0,0,0],"rgb",s)}static fromObject(s,l="int"){const p="a"in s?[s.r,s.g,s.b,s.a]:[s.r,s.g,s.b];return new at(p,"rgb",l)}static toRgbaObject(s,l="int"){return s.toRgbaObject(l)}static isRgbColorObject(s){return Go(s,"r")&&Go(s,"g")&&Go(s,"b")}static isRgbaColorObject(s){return this.isRgbColorObject(s)&&Go(s,"a")}static isColorObject(s){return this.isRgbColorObject(s)}static equals(s,l){if(s.mode!==l.mode)return!1;const p=s.comps_,C=l.comps_;for(let j=0;j<p.length;j++)if(p[j]!==C[j])return!1;return!0}constructor(s,l,p="int"){this.mode=l,this.type=p,this.comps_=Iv(s,l,p)}getComponents(s,l="int"){return yh(Dv(or(this.comps_),{mode:this.mode,type:this.type},{mode:s??this.mode,type:l}),this.comps_[3])}toRgbaObject(s="int"){const l=this.getComponents("rgb",s);return{r:l[0],g:l[1],b:l[2],a:l[3]}}}const Ri=S("colp");class Uv{constructor(s,l){this.alphaViews_=null,this.element=s.createElement("div"),this.element.classList.add(Ri()),l.viewProps.bindClassModifiers(this.element);const p=s.createElement("div");p.classList.add(Ri("hsv"));const C=s.createElement("div");C.classList.add(Ri("sv")),this.svPaletteView_=l.svPaletteView,C.appendChild(this.svPaletteView_.element),p.appendChild(C);const j=s.createElement("div");j.classList.add(Ri("h")),this.hPaletteView_=l.hPaletteView,j.appendChild(this.hPaletteView_.element),p.appendChild(j),this.element.appendChild(p);const ie=s.createElement("div");if(ie.classList.add(Ri("rgb")),this.textView_=l.textView,ie.appendChild(this.textView_.element),this.element.appendChild(ie),l.alphaViews){this.alphaViews_={palette:l.alphaViews.palette,text:l.alphaViews.text};const Te=s.createElement("div");Te.classList.add(Ri("a"));const Xe=s.createElement("div");Xe.classList.add(Ri("ap")),Xe.appendChild(this.alphaViews_.palette.element),Te.appendChild(Xe);const Ye=s.createElement("div");Ye.classList.add(Ri("at")),Ye.appendChild(this.alphaViews_.text.element),Te.appendChild(Ye),this.element.appendChild(Te)}}get allFocusableElements(){const s=[this.svPaletteView_.element,this.hPaletteView_.element,this.textView_.modeSelectElement,...this.textView_.textViews.map(l=>l.inputElement)];return this.alphaViews_&&s.push(this.alphaViews_.palette.element,this.alphaViews_.text.inputElement),s}}function Nv(u){return u==="int"?"int":u==="float"?"float":void 0}function Dl(u){const s=ce;return Me(u,{alpha:s.optional.boolean,color:s.optional.object({alpha:s.optional.boolean,type:s.optional.custom(Nv)}),expanded:s.optional.boolean,picker:s.optional.custom(_h)})}function ar(u){return u?.1:1}function lr(u){var s;return(s=u.color)===null||s===void 0?void 0:s.type}function Ov(u,s){return u.alpha===s.alpha&&u.mode===s.mode&&u.notation===s.notation&&u.type===s.type}function Dn(u,s){const l=u.match(/^(.+)%$/);return Math.min(l?parseFloat(l[1])*.01*s:parseFloat(u),s)}const Fv={deg:u=>u,grad:u=>u*360/400,rad:u=>u*360/(2*Math.PI),turn:u=>u*360};function Mh(u){const s=u.match(/^([0-9.]+?)(deg|grad|rad|turn)$/);if(!s)return parseFloat(u);const l=parseFloat(s[1]),p=s[2];return Fv[p](l)}function Eh(u){const s=u.match(/^rgb\(\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);if(!s)return null;const l=[Dn(s[1],255),Dn(s[2],255),Dn(s[3],255)];return isNaN(l[0])||isNaN(l[1])||isNaN(l[2])?null:l}function Sh(u){return s=>{const l=Eh(s);return l?new at(l,"rgb",u):null}}function Th(u){const s=u.match(/^rgba\(\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);if(!s)return null;const l=[Dn(s[1],255),Dn(s[2],255),Dn(s[3],255),Dn(s[4],1)];return isNaN(l[0])||isNaN(l[1])||isNaN(l[2])||isNaN(l[3])?null:l}function Ch(u){return s=>{const l=Th(s);return l?new at(l,"rgb",u):null}}function Ah(u){const s=u.match(/^hsl\(\s*([0-9A-Fa-f.]+(?:deg|grad|rad|turn)?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);if(!s)return null;const l=[Mh(s[1]),Dn(s[2],100),Dn(s[3],100)];return isNaN(l[0])||isNaN(l[1])||isNaN(l[2])?null:l}function Ph(u){return s=>{const l=Ah(s);return l?new at(l,"hsl",u):null}}function Rh(u){const s=u.match(/^hsla\(\s*([0-9A-Fa-f.]+(?:deg|grad|rad|turn)?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);if(!s)return null;const l=[Mh(s[1]),Dn(s[2],100),Dn(s[3],100),Dn(s[4],1)];return isNaN(l[0])||isNaN(l[1])||isNaN(l[2])||isNaN(l[3])?null:l}function Lh(u){return s=>{const l=Rh(s);return l?new at(l,"hsl",u):null}}function Ih(u){const s=u.match(/^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/);if(s)return[parseInt(s[1]+s[1],16),parseInt(s[2]+s[2],16),parseInt(s[3]+s[3],16)];const l=u.match(/^(?:#|0x)([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);return l?[parseInt(l[1],16),parseInt(l[2],16),parseInt(l[3],16)]:null}function Bv(u){const s=Ih(u);return s?new at(s,"rgb","int"):null}function Dh(u){const s=u.match(/^#?([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/);if(s)return[parseInt(s[1]+s[1],16),parseInt(s[2]+s[2],16),parseInt(s[3]+s[3],16),Lt(parseInt(s[4]+s[4],16),0,255,0,1)];const l=u.match(/^(?:#|0x)?([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);return l?[parseInt(l[1],16),parseInt(l[2],16),parseInt(l[3],16),Lt(parseInt(l[4],16),0,255,0,1)]:null}function kv(u){const s=Dh(u);return s?new at(s,"rgb","int"):null}function Uh(u){const s=u.match(/^\{\s*r\s*:\s*([0-9A-Fa-f.]+%?)\s*,\s*g\s*:\s*([0-9A-Fa-f.]+%?)\s*,\s*b\s*:\s*([0-9A-Fa-f.]+%?)\s*\}$/);if(!s)return null;const l=[parseFloat(s[1]),parseFloat(s[2]),parseFloat(s[3])];return isNaN(l[0])||isNaN(l[1])||isNaN(l[2])?null:l}function Nh(u){return s=>{const l=Uh(s);return l?new at(l,"rgb",u):null}}function Oh(u){const s=u.match(/^\{\s*r\s*:\s*([0-9A-Fa-f.]+%?)\s*,\s*g\s*:\s*([0-9A-Fa-f.]+%?)\s*,\s*b\s*:\s*([0-9A-Fa-f.]+%?)\s*,\s*a\s*:\s*([0-9A-Fa-f.]+%?)\s*\}$/);if(!s)return null;const l=[parseFloat(s[1]),parseFloat(s[2]),parseFloat(s[3]),parseFloat(s[4])];return isNaN(l[0])||isNaN(l[1])||isNaN(l[2])||isNaN(l[3])?null:l}function Fh(u){return s=>{const l=Oh(s);return l?new at(l,"rgb",u):null}}const Vv=[{parser:Ih,result:{alpha:!1,mode:"rgb",notation:"hex"}},{parser:Dh,result:{alpha:!0,mode:"rgb",notation:"hex"}},{parser:Eh,result:{alpha:!1,mode:"rgb",notation:"func"}},{parser:Th,result:{alpha:!0,mode:"rgb",notation:"func"}},{parser:Ah,result:{alpha:!1,mode:"hsl",notation:"func"}},{parser:Rh,result:{alpha:!0,mode:"hsl",notation:"func"}},{parser:Uh,result:{alpha:!1,mode:"rgb",notation:"object"}},{parser:Oh,result:{alpha:!0,mode:"rgb",notation:"object"}}];function zv(u){return Vv.reduce((s,{parser:l,result:p})=>s||(l(u)?p:null),null)}function Ul(u,s="int"){const l=zv(u);return l?l.notation==="hex"&&s!=="float"?Object.assign(Object.assign({},l),{type:"int"}):l.notation==="func"?Object.assign(Object.assign({},l),{type:s}):null:null}const Bh={int:[Bv,kv,Sh("int"),Ch("int"),Ph("int"),Lh("int"),Nh("int"),Fh("int")],float:[Sh("float"),Ch("float"),Ph("float"),Lh("float"),Nh("float"),Fh("float")]};function Hv(u){const s=Bh[u];return l=>{if(typeof l!="string")return at.black(u);const p=s.reduce((C,j)=>C||j(l),null);return p??at.black(u)}}function Nl(u){const s=Bh[u];return l=>s.reduce((p,C)=>p||C(l),null)}function kh(u){const s=Vt(Math.floor(u),0,255).toString(16);return s.length===1?`0${s}`:s}function Vh(u,s="#"){const l=or(u.getComponents("rgb")).map(kh).join("");return`${s}${l}`}function Ol(u,s="#"){const l=u.getComponents("rgb"),p=[l[0],l[1],l[2],l[3]*255].map(kh).join("");return`${s}${p}`}function zh(u,s){const l=Jt(s==="float"?2:0);return`rgb(${or(u.getComponents("rgb",s)).map(C=>l(C)).join(", ")})`}function Gv(u){return s=>zh(s,u)}function Wo(u,s){const l=Jt(2),p=Jt(s==="float"?2:0);return`rgba(${u.getComponents("rgb",s).map((j,ie)=>(ie===3?l:p)(j)).join(", ")})`}function Wv(u){return s=>Wo(s,u)}function jv(u){const s=[Jt(0),Bo,Bo];return`hsl(${or(u.getComponents("hsl")).map((p,C)=>s[C](p)).join(", ")})`}function Xv(u){const s=[Jt(0),Bo,Bo,Jt(2)];return`hsla(${u.getComponents("hsl").map((p,C)=>s[C](p)).join(", ")})`}function Hh(u,s){const l=Jt(s==="float"?2:0),p=["r","g","b"];return`{${or(u.getComponents("rgb",s)).map((j,ie)=>`${p[ie]}: ${l(j)}`).join(", ")}}`}function qv(u){return s=>Hh(s,u)}function Gh(u,s){const l=Jt(2),p=Jt(s==="float"?2:0),C=["r","g","b","a"];return`{${u.getComponents("rgb",s).map((ie,Te)=>{const Xe=Te===3?l:p;return`${C[Te]}: ${Xe(ie)}`}).join(", ")}}`}function Yv(u){return s=>Gh(s,u)}const Kv=[{format:{alpha:!1,mode:"rgb",notation:"hex",type:"int"},stringifier:Vh},{format:{alpha:!0,mode:"rgb",notation:"hex",type:"int"},stringifier:Ol},{format:{alpha:!1,mode:"hsl",notation:"func",type:"int"},stringifier:jv},{format:{alpha:!0,mode:"hsl",notation:"func",type:"int"},stringifier:Xv},...["int","float"].reduce((u,s)=>[...u,{format:{alpha:!1,mode:"rgb",notation:"func",type:s},stringifier:Gv(s)},{format:{alpha:!0,mode:"rgb",notation:"func",type:s},stringifier:Wv(s)},{format:{alpha:!1,mode:"rgb",notation:"object",type:s},stringifier:qv(s)},{format:{alpha:!0,mode:"rgb",notation:"object",type:s},stringifier:Yv(s)}],[])];function Fl(u){return Kv.reduce((s,l)=>s||(Ov(l.format,u)?l.stringifier:null),null)}const Ws=S("apl");class $v{constructor(s,l){this.onValueChange_=this.onValueChange_.bind(this),this.value=l.value,this.value.emitter.on("change",this.onValueChange_),this.element=s.createElement("div"),this.element.classList.add(Ws()),l.viewProps.bindClassModifiers(this.element),l.viewProps.bindTabIndex(this.element);const p=s.createElement("div");p.classList.add(Ws("b")),this.element.appendChild(p);const C=s.createElement("div");C.classList.add(Ws("c")),p.appendChild(C),this.colorElem_=C;const j=s.createElement("div");j.classList.add(Ws("m")),this.element.appendChild(j),this.markerElem_=j;const ie=s.createElement("div");ie.classList.add(Ws("p")),this.markerElem_.appendChild(ie),this.previewElem_=ie,this.update_()}update_(){const s=this.value.rawValue,l=s.getComponents("rgb"),p=new at([l[0],l[1],l[2],0],"rgb"),C=new at([l[0],l[1],l[2],255],"rgb"),j=["to right",Wo(p),Wo(C)];this.colorElem_.style.background=`linear-gradient(${j.join(",")})`,this.previewElem_.style.backgroundColor=Wo(s);const ie=Lt(l[3],0,1,0,100);this.markerElem_.style.left=`${ie}%`}onValueChange_(){this.update_()}}class Zv{constructor(s,l){this.onKeyDown_=this.onKeyDown_.bind(this),this.onKeyUp_=this.onKeyUp_.bind(this),this.onPointerDown_=this.onPointerDown_.bind(this),this.onPointerMove_=this.onPointerMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.value=l.value,this.viewProps=l.viewProps,this.view=new $v(s,{value:this.value,viewProps:this.viewProps}),this.ptHandler_=new rr(this.view.element),this.ptHandler_.emitter.on("down",this.onPointerDown_),this.ptHandler_.emitter.on("move",this.onPointerMove_),this.ptHandler_.emitter.on("up",this.onPointerUp_),this.view.element.addEventListener("keydown",this.onKeyDown_),this.view.element.addEventListener("keyup",this.onKeyUp_)}handlePointerEvent_(s,l){if(!s.point)return;const p=s.point.x/s.bounds.width,C=this.value.rawValue,[j,ie,Te]=C.getComponents("hsv");this.value.setRawValue(new at([j,ie,Te,p],"hsv"),l)}onPointerDown_(s){this.handlePointerEvent_(s.data,{forceEmit:!1,last:!1})}onPointerMove_(s){this.handlePointerEvent_(s.data,{forceEmit:!1,last:!1})}onPointerUp_(s){this.handlePointerEvent_(s.data,{forceEmit:!0,last:!0})}onKeyDown_(s){const l=xn(ar(!0),ci(s));if(l===0)return;const p=this.value.rawValue,[C,j,ie,Te]=p.getComponents("hsv");this.value.setRawValue(new at([C,j,ie,Te+l],"hsv"),{forceEmit:!1,last:!1})}onKeyUp_(s){xn(ar(!0),ci(s))!==0&&this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}}const Vr=S("coltxt");function Jv(u){const s=u.createElement("select"),l=[{text:"RGB",value:"rgb"},{text:"HSL",value:"hsl"},{text:"HSV",value:"hsv"}];return s.appendChild(l.reduce((p,C)=>{const j=u.createElement("option");return j.textContent=C.text,j.value=C.value,p.appendChild(j),p},u.createDocumentFragment())),s}class Qv{constructor(s,l){this.element=s.createElement("div"),this.element.classList.add(Vr()),l.viewProps.bindClassModifiers(this.element);const p=s.createElement("div");p.classList.add(Vr("m")),this.modeElem_=Jv(s),this.modeElem_.classList.add(Vr("ms")),p.appendChild(this.modeSelectElement),l.viewProps.bindDisabled(this.modeElem_);const C=s.createElement("div");C.classList.add(Vr("mm")),C.appendChild(se(s,"dropdown")),p.appendChild(C),this.element.appendChild(p);const j=s.createElement("div");j.classList.add(Vr("w")),this.element.appendChild(j),this.textsElem_=j,this.textViews_=l.textViews,this.applyTextViews_(),I(l.colorMode,ie=>{this.modeElem_.value=ie})}get modeSelectElement(){return this.modeElem_}get textViews(){return this.textViews_}set textViews(s){this.textViews_=s,this.applyTextViews_()}applyTextViews_(){Ee(this.textsElem_);const s=this.element.ownerDocument;this.textViews_.forEach(l=>{const p=s.createElement("div");p.classList.add(Vr("c")),p.appendChild(l.element),this.textsElem_.appendChild(p)})}}function e_(u){return Jt(u==="float"?2:0)}function t_(u,s,l){const p=Ho(u,s)[l];return new Fr({min:0,max:p})}function Bl(u,s,l){return new Hs(u,{arrayPosition:l===0?"fst":l===2?"lst":"mid",baseStep:ar(!1),parser:s.parser,props:K.fromObject({draggingScale:s.colorType==="float"?.01:1,formatter:e_(s.colorType)}),value:ee(0,{constraint:t_(s.colorMode,s.colorType,l)}),viewProps:s.viewProps})}class n_{constructor(s,l){this.onModeSelectChange_=this.onModeSelectChange_.bind(this),this.colorType_=l.colorType,this.parser_=l.parser,this.value=l.value,this.viewProps=l.viewProps,this.colorMode=ee(this.value.rawValue.mode),this.ccs_=this.createComponentControllers_(s),this.view=new Qv(s,{colorMode:this.colorMode,textViews:[this.ccs_[0].view,this.ccs_[1].view,this.ccs_[2].view],viewProps:this.viewProps}),this.view.modeSelectElement.addEventListener("change",this.onModeSelectChange_)}createComponentControllers_(s){const l={colorMode:this.colorMode.rawValue,colorType:this.colorType_,parser:this.parser_,viewProps:this.viewProps},p=[Bl(s,l,0),Bl(s,l,1),Bl(s,l,2)];return p.forEach((C,j)=>{Vs({primary:this.value,secondary:C.value,forward:ie=>ie.rawValue.getComponents(this.colorMode.rawValue,this.colorType_)[j],backward:(ie,Te)=>{const Xe=this.colorMode.rawValue,Ye=ie.rawValue.getComponents(Xe,this.colorType_);return Ye[j]=Te.rawValue,new at(yh(or(Ye),Ye[3]),Xe,this.colorType_)}})}),p}onModeSelectChange_(s){const l=s.currentTarget;this.colorMode.rawValue=l.value,this.ccs_=this.createComponentControllers_(this.view.element.ownerDocument),this.view.textViews=[this.ccs_[0].view,this.ccs_[1].view,this.ccs_[2].view]}}const kl=S("hpl");class i_{constructor(s,l){this.onValueChange_=this.onValueChange_.bind(this),this.value=l.value,this.value.emitter.on("change",this.onValueChange_),this.element=s.createElement("div"),this.element.classList.add(kl()),l.viewProps.bindClassModifiers(this.element),l.viewProps.bindTabIndex(this.element);const p=s.createElement("div");p.classList.add(kl("c")),this.element.appendChild(p);const C=s.createElement("div");C.classList.add(kl("m")),this.element.appendChild(C),this.markerElem_=C,this.update_()}update_(){const s=this.value.rawValue,[l]=s.getComponents("hsv");this.markerElem_.style.backgroundColor=zh(new at([l,100,100],"hsv"));const p=Lt(l,0,360,0,100);this.markerElem_.style.left=`${p}%`}onValueChange_(){this.update_()}}class r_{constructor(s,l){this.onKeyDown_=this.onKeyDown_.bind(this),this.onKeyUp_=this.onKeyUp_.bind(this),this.onPointerDown_=this.onPointerDown_.bind(this),this.onPointerMove_=this.onPointerMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.value=l.value,this.viewProps=l.viewProps,this.view=new i_(s,{value:this.value,viewProps:this.viewProps}),this.ptHandler_=new rr(this.view.element),this.ptHandler_.emitter.on("down",this.onPointerDown_),this.ptHandler_.emitter.on("move",this.onPointerMove_),this.ptHandler_.emitter.on("up",this.onPointerUp_),this.view.element.addEventListener("keydown",this.onKeyDown_),this.view.element.addEventListener("keyup",this.onKeyUp_)}handlePointerEvent_(s,l){if(!s.point)return;const p=Lt(Vt(s.point.x,0,s.bounds.width),0,s.bounds.width,0,360),C=this.value.rawValue,[,j,ie,Te]=C.getComponents("hsv");this.value.setRawValue(new at([p,j,ie,Te],"hsv"),l)}onPointerDown_(s){this.handlePointerEvent_(s.data,{forceEmit:!1,last:!1})}onPointerMove_(s){this.handlePointerEvent_(s.data,{forceEmit:!1,last:!1})}onPointerUp_(s){this.handlePointerEvent_(s.data,{forceEmit:!0,last:!0})}onKeyDown_(s){const l=xn(ar(!1),ci(s));if(l===0)return;const p=this.value.rawValue,[C,j,ie,Te]=p.getComponents("hsv");this.value.setRawValue(new at([C+l,j,ie,Te],"hsv"),{forceEmit:!1,last:!1})}onKeyUp_(s){xn(ar(!1),ci(s))!==0&&this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}}const Vl=S("svp"),Wh=64;class s_{constructor(s,l){this.onValueChange_=this.onValueChange_.bind(this),this.value=l.value,this.value.emitter.on("change",this.onValueChange_),this.element=s.createElement("div"),this.element.classList.add(Vl()),l.viewProps.bindClassModifiers(this.element),l.viewProps.bindTabIndex(this.element);const p=s.createElement("canvas");p.height=Wh,p.width=Wh,p.classList.add(Vl("c")),this.element.appendChild(p),this.canvasElement=p;const C=s.createElement("div");C.classList.add(Vl("m")),this.element.appendChild(C),this.markerElem_=C,this.update_()}update_(){const s=ne(this.canvasElement);if(!s)return;const p=this.value.rawValue.getComponents("hsv"),C=this.canvasElement.width,j=this.canvasElement.height,ie=s.getImageData(0,0,C,j),Te=ie.data;for(let pt=0;pt<j;pt++)for(let vt=0;vt<C;vt++){const cr=Lt(vt,0,C,0,100),Xs=Lt(pt,0,j,100,0),qs=bh(p[0],cr,Xs),jo=(pt*C+vt)*4;Te[jo]=qs[0],Te[jo+1]=qs[1],Te[jo+2]=qs[2],Te[jo+3]=255}s.putImageData(ie,0,0);const Xe=Lt(p[1],0,100,0,100);this.markerElem_.style.left=`${Xe}%`;const Ye=Lt(p[2],0,100,100,0);this.markerElem_.style.top=`${Ye}%`}onValueChange_(){this.update_()}}class o_{constructor(s,l){this.onKeyDown_=this.onKeyDown_.bind(this),this.onKeyUp_=this.onKeyUp_.bind(this),this.onPointerDown_=this.onPointerDown_.bind(this),this.onPointerMove_=this.onPointerMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.value=l.value,this.viewProps=l.viewProps,this.view=new s_(s,{value:this.value,viewProps:this.viewProps}),this.ptHandler_=new rr(this.view.element),this.ptHandler_.emitter.on("down",this.onPointerDown_),this.ptHandler_.emitter.on("move",this.onPointerMove_),this.ptHandler_.emitter.on("up",this.onPointerUp_),this.view.element.addEventListener("keydown",this.onKeyDown_),this.view.element.addEventListener("keyup",this.onKeyUp_)}handlePointerEvent_(s,l){if(!s.point)return;const p=Lt(s.point.x,0,s.bounds.width,0,100),C=Lt(s.point.y,0,s.bounds.height,100,0),[j,,,ie]=this.value.rawValue.getComponents("hsv");this.value.setRawValue(new at([j,p,C,ie],"hsv"),l)}onPointerDown_(s){this.handlePointerEvent_(s.data,{forceEmit:!1,last:!1})}onPointerMove_(s){this.handlePointerEvent_(s.data,{forceEmit:!1,last:!1})}onPointerUp_(s){this.handlePointerEvent_(s.data,{forceEmit:!0,last:!0})}onKeyDown_(s){mh(s.key)&&s.preventDefault();const[l,p,C,j]=this.value.rawValue.getComponents("hsv"),ie=ar(!1),Te=xn(ie,ci(s)),Xe=xn(ie,zs(s));Te===0&&Xe===0||this.value.setRawValue(new at([l,p+Te,C+Xe,j],"hsv"),{forceEmit:!1,last:!1})}onKeyUp_(s){const l=ar(!1),p=xn(l,ci(s)),C=xn(l,zs(s));p===0&&C===0||this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}}class a_{constructor(s,l){this.value=l.value,this.viewProps=l.viewProps,this.hPaletteC_=new r_(s,{value:this.value,viewProps:this.viewProps}),this.svPaletteC_=new o_(s,{value:this.value,viewProps:this.viewProps}),this.alphaIcs_=l.supportsAlpha?{palette:new Zv(s,{value:this.value,viewProps:this.viewProps}),text:new Hs(s,{parser:li,baseStep:.1,props:K.fromObject({draggingScale:.01,formatter:Jt(2)}),value:ee(0,{constraint:new Fr({min:0,max:1})}),viewProps:this.viewProps})}:null,this.alphaIcs_&&Vs({primary:this.value,secondary:this.alphaIcs_.text.value,forward:p=>p.rawValue.getComponents()[3],backward:(p,C)=>{const j=p.rawValue.getComponents();return j[3]=C.rawValue,new at(j,p.rawValue.mode)}}),this.textC_=new n_(s,{colorType:l.colorType,parser:li,value:this.value,viewProps:this.viewProps}),this.view=new Uv(s,{alphaViews:this.alphaIcs_?{palette:this.alphaIcs_.palette.view,text:this.alphaIcs_.text.view}:null,hPaletteView:this.hPaletteC_.view,supportsAlpha:l.supportsAlpha,svPaletteView:this.svPaletteC_.view,textView:this.textC_.view,viewProps:this.viewProps})}get textController(){return this.textC_}}const zl=S("colsw");class l_{constructor(s,l){this.onValueChange_=this.onValueChange_.bind(this),l.value.emitter.on("change",this.onValueChange_),this.value=l.value,this.element=s.createElement("div"),this.element.classList.add(zl()),l.viewProps.bindClassModifiers(this.element);const p=s.createElement("div");p.classList.add(zl("sw")),this.element.appendChild(p),this.swatchElem_=p;const C=s.createElement("button");C.classList.add(zl("b")),l.viewProps.bindDisabled(C),this.element.appendChild(C),this.buttonElement=C,this.update_()}update_(){const s=this.value.rawValue;this.swatchElem_.style.backgroundColor=Ol(s)}onValueChange_(){this.update_()}}class c_{constructor(s,l){this.value=l.value,this.viewProps=l.viewProps,this.view=new l_(s,{value:this.value,viewProps:this.viewProps})}}class Hl{constructor(s,l){this.onButtonBlur_=this.onButtonBlur_.bind(this),this.onButtonClick_=this.onButtonClick_.bind(this),this.onPopupChildBlur_=this.onPopupChildBlur_.bind(this),this.onPopupChildKeydown_=this.onPopupChildKeydown_.bind(this),this.value=l.value,this.viewProps=l.viewProps,this.foldable_=ve.create(l.expanded),this.swatchC_=new c_(s,{value:this.value,viewProps:this.viewProps});const p=this.swatchC_.view.buttonElement;p.addEventListener("blur",this.onButtonBlur_),p.addEventListener("click",this.onButtonClick_),this.textC_=new Fo(s,{parser:l.parser,props:K.fromObject({formatter:l.formatter}),value:this.value,viewProps:this.viewProps}),this.view=new Ev(s,{foldable:this.foldable_,pickerLayout:l.pickerLayout}),this.view.swatchElement.appendChild(this.swatchC_.view.element),this.view.textElement.appendChild(this.textC_.view.element),this.popC_=l.pickerLayout==="popup"?new oh(s,{viewProps:this.viewProps}):null;const C=new a_(s,{colorType:l.colorType,supportsAlpha:l.supportsAlpha,value:this.value,viewProps:this.viewProps});C.view.allFocusableElements.forEach(j=>{j.addEventListener("blur",this.onPopupChildBlur_),j.addEventListener("keydown",this.onPopupChildKeydown_)}),this.pickerC_=C,this.popC_?(this.view.element.appendChild(this.popC_.view.element),this.popC_.view.element.appendChild(C.view.element),Vs({primary:this.foldable_.value("expanded"),secondary:this.popC_.shows,forward:j=>j.rawValue,backward:(j,ie)=>ie.rawValue})):this.view.pickerElement&&(this.view.pickerElement.appendChild(this.pickerC_.view.element),Se(this.foldable_,this.view.pickerElement))}get textController(){return this.textC_}onButtonBlur_(s){if(!this.popC_)return;const l=this.view.element,p=s.relatedTarget;(!p||!l.contains(p))&&(this.popC_.shows.rawValue=!1)}onButtonClick_(){this.foldable_.set("expanded",!this.foldable_.get("expanded")),this.foldable_.get("expanded")&&this.pickerC_.view.allFocusableElements[0].focus()}onPopupChildBlur_(s){if(!this.popC_)return;const l=this.popC_.view.element,p=Ve(s);p&&l.contains(p)||p&&p===this.swatchC_.view.buttonElement&&!D(l.ownerDocument)||(this.popC_.shows.rawValue=!1)}onPopupChildKeydown_(s){this.popC_?s.key==="Escape"&&(this.popC_.shows.rawValue=!1):this.view.pickerElement&&s.key==="Escape"&&this.swatchC_.view.buttonElement.focus()}}function u_(u,s){return at.isColorObject(u)?at.fromObject(u,s):at.black(s)}function h_(u){return or(u.getComponents("rgb")).reduce((s,l)=>s<<8|Math.floor(l)&255,0)}function d_(u){return u.getComponents("rgb").reduce((s,l,p)=>{const C=Math.floor(p===3?l*255:l)&255;return s<<8|C},0)>>>0}function f_(u){return new at([u>>16&255,u>>8&255,u&255],"rgb")}function p_(u){return new at([u>>24&255,u>>16&255,u>>8&255,Lt(u&255,0,255,0,1)],"rgb")}function m_(u){return typeof u!="number"?at.black():f_(u)}function g_(u){return typeof u!="number"?at.black():p_(u)}function v_(u){const s=Fl(u);return s?(l,p)=>{Gs(l,s(p))}:null}function __(u){const s=u?d_:h_;return(l,p)=>{Gs(l,s(p))}}function x_(u,s,l){const p=s.toRgbaObject(l);u.writeProperty("r",p.r),u.writeProperty("g",p.g),u.writeProperty("b",p.b),u.writeProperty("a",p.a)}function b_(u,s,l){const p=s.toRgbaObject(l);u.writeProperty("r",p.r),u.writeProperty("g",p.g),u.writeProperty("b",p.b)}function y_(u,s){return(l,p)=>{u?x_(l,p,s):b_(l,p,s)}}function Gl(u){var s;return!!(u!=null&&u.alpha||!((s=u==null?void 0:u.color)===null||s===void 0)&&s.alpha)}function w_(u){return u?s=>Ol(s,"0x"):s=>Vh(s,"0x")}function M_(u){return"color"in u||"view"in u&&u.view==="color"}const E_={id:"input-color-number",type:"input",accept:(u,s)=>{if(typeof u!="number"||!M_(s))return null;const l=Dl(s);return l?{initialValue:u,params:l}:null},binding:{reader:u=>Gl(u.params)?g_:m_,equals:at.equals,writer:u=>__(Gl(u.params))},controller:u=>{const s=Gl(u.params),l="expanded"in u.params?u.params.expanded:void 0,p="picker"in u.params?u.params.picker:void 0;return new Hl(u.document,{colorType:"int",expanded:l??!1,formatter:w_(s),parser:Nl("int"),pickerLayout:p??"popup",supportsAlpha:s,value:u.value,viewProps:u.viewProps})}};function S_(u){return at.isRgbaColorObject(u)}function T_(u){return s=>u_(s,u)}function C_(u,s){return l=>u?Gh(l,s):Hh(l,s)}const A_={id:"input-color-object",type:"input",accept:(u,s)=>{if(!at.isColorObject(u))return null;const l=Dl(s);return l?{initialValue:u,params:l}:null},binding:{reader:u=>T_(lr(u.params)),equals:at.equals,writer:u=>y_(S_(u.initialValue),lr(u.params))},controller:u=>{var s;const l=at.isRgbaColorObject(u.initialValue),p="expanded"in u.params?u.params.expanded:void 0,C="picker"in u.params?u.params.picker:void 0,j=(s=lr(u.params))!==null&&s!==void 0?s:"int";return new Hl(u.document,{colorType:j,expanded:p??!1,formatter:C_(l,j),parser:Nl(j),pickerLayout:C??"popup",supportsAlpha:l,value:u.value,viewProps:u.viewProps})}},P_={id:"input-color-string",type:"input",accept:(u,s)=>{if(typeof u!="string"||"view"in s&&s.view==="text")return null;const l=Ul(u,lr(s));if(!l||!Fl(l))return null;const C=Dl(s);return C?{initialValue:u,params:C}:null},binding:{reader:u=>{var s;return Hv((s=lr(u.params))!==null&&s!==void 0?s:"int")},equals:at.equals,writer:u=>{const s=Ul(u.initialValue,lr(u.params));if(!s)throw w.shouldNeverHappen();const l=v_(s);if(!l)throw w.notBindable();return l}},controller:u=>{const s=Ul(u.initialValue,lr(u.params));if(!s)throw w.shouldNeverHappen();const l=Fl(s);if(!l)throw w.shouldNeverHappen();const p="expanded"in u.params?u.params.expanded:void 0,C="picker"in u.params?u.params.picker:void 0;return new Hl(u.document,{colorType:s.type,expanded:p??!1,formatter:l,parser:Nl(s.type),pickerLayout:C??"popup",supportsAlpha:s.alpha,value:u.value,viewProps:u.viewProps})}};class Li{constructor(s){this.components=s.components,this.asm_=s.assembly}constrain(s){const l=this.asm_.toComponents(s).map((p,C)=>{var j,ie;return(ie=(j=this.components[C])===null||j===void 0?void 0:j.constrain(p))!==null&&ie!==void 0?ie:p});return this.asm_.fromComponents(l)}}const jh=S("pndtxt");class R_{constructor(s,l){this.textViews=l.textViews,this.element=s.createElement("div"),this.element.classList.add(jh()),this.textViews.forEach(p=>{const C=s.createElement("div");C.classList.add(jh("a")),C.appendChild(p.element),this.element.appendChild(C)})}}function L_(u,s,l){return new Hs(u,{arrayPosition:l===0?"fst":l===s.axes.length-1?"lst":"mid",baseStep:s.axes[l].baseStep,parser:s.parser,props:s.axes[l].textProps,value:ee(0,{constraint:s.axes[l].constraint}),viewProps:s.viewProps})}class Wl{constructor(s,l){this.value=l.value,this.viewProps=l.viewProps,this.acs_=l.axes.map((p,C)=>L_(s,l,C)),this.acs_.forEach((p,C)=>{Vs({primary:this.value,secondary:p.value,forward:j=>l.assembly.toComponents(j.rawValue)[C],backward:(j,ie)=>{const Te=l.assembly.toComponents(j.rawValue);return Te[C]=ie.rawValue,l.assembly.fromComponents(Te)}})}),this.view=new R_(s,{textViews:this.acs_.map(p=>p.view)})}}function Xh(u,s){return"step"in u&&!m(u.step)?new Oo(u.step,s):null}function qh(u){return!m(u.max)&&!m(u.min)?new Fr({max:u.max,min:u.min}):!m(u.max)||!m(u.min)?new rh({max:u.max,min:u.min}):null}function I_(u){const s=ai(u,Fr);if(s)return[s.values.get("min"),s.values.get("max")];const l=ai(u,rh);return l?[l.minValue,l.maxValue]:[void 0,void 0]}function D_(u,s){const l=[],p=Xh(u,s);p&&l.push(p);const C=qh(u);C&&l.push(C);const j=Il(u.options);return j&&l.push(j),new Ns(l)}const U_={id:"input-number",type:"input",accept:(u,s)=>{if(typeof u!="number")return null;const l=ce,p=Me(s,{format:l.optional.function,max:l.optional.number,min:l.optional.number,options:l.optional.custom(ko),step:l.optional.number});return p?{initialValue:u,params:p}:null},binding:{reader:u=>fh,constraint:u=>D_(u.params,u.initialValue),writer:u=>Gs},controller:u=>{var s;const l=u.value,p=u.constraint,C=p&&ai(p,Os);if(C)return new Fs(u.document,{props:new K({options:C.values.value("options")}),value:l,viewProps:u.viewProps});const j=(s="format"in u.params?u.params.format:void 0)!==null&&s!==void 0?s:Jt(Vo(p,l.rawValue)),ie=p&&ai(p,Fr);return ie?new Ll(u.document,{baseStep:Br(p),parser:li,sliderProps:new K({maxValue:ie.values.value("max"),minValue:ie.values.value("min")}),textProps:K.fromObject({draggingScale:kr(p,l.rawValue),formatter:j}),value:l,viewProps:u.viewProps}):new Hs(u.document,{baseStep:Br(p),parser:li,props:K.fromObject({draggingScale:kr(p,l.rawValue),formatter:j}),value:l,viewProps:u.viewProps})}};class Ii{constructor(s=0,l=0){this.x=s,this.y=l}getComponents(){return[this.x,this.y]}static isObject(s){if(m(s))return!1;const l=s.x,p=s.y;return!(typeof l!="number"||typeof p!="number")}static equals(s,l){return s.x===l.x&&s.y===l.y}toObject(){return{x:this.x,y:this.y}}}const Yh={toComponents:u=>u.getComponents(),fromComponents:u=>new Ii(...u)},zr=S("p2d");class N_{constructor(s,l){this.element=s.createElement("div"),this.element.classList.add(zr()),l.viewProps.bindClassModifiers(this.element),I(l.expanded,b(this.element,zr(void 0,"expanded")));const p=s.createElement("div");p.classList.add(zr("h")),this.element.appendChild(p);const C=s.createElement("button");C.classList.add(zr("b")),C.appendChild(se(s,"p2dpad")),l.viewProps.bindDisabled(C),p.appendChild(C),this.buttonElement=C;const j=s.createElement("div");if(j.classList.add(zr("t")),p.appendChild(j),this.textElement=j,l.pickerLayout==="inline"){const ie=s.createElement("div");ie.classList.add(zr("p")),this.element.appendChild(ie),this.pickerElement=ie}else this.pickerElement=null}}const Di=S("p2dp");class O_{constructor(s,l){this.onFoldableChange_=this.onFoldableChange_.bind(this),this.onValueChange_=this.onValueChange_.bind(this),this.invertsY_=l.invertsY,this.maxValue_=l.maxValue,this.element=s.createElement("div"),this.element.classList.add(Di()),l.layout==="popup"&&this.element.classList.add(Di(void 0,"p")),l.viewProps.bindClassModifiers(this.element);const p=s.createElement("div");p.classList.add(Di("p")),l.viewProps.bindTabIndex(p),this.element.appendChild(p),this.padElement=p;const C=s.createElementNS(Z,"svg");C.classList.add(Di("g")),this.padElement.appendChild(C),this.svgElem_=C;const j=s.createElementNS(Z,"line");j.classList.add(Di("ax")),j.setAttributeNS(null,"x1","0"),j.setAttributeNS(null,"y1","50%"),j.setAttributeNS(null,"x2","100%"),j.setAttributeNS(null,"y2","50%"),this.svgElem_.appendChild(j);const ie=s.createElementNS(Z,"line");ie.classList.add(Di("ax")),ie.setAttributeNS(null,"x1","50%"),ie.setAttributeNS(null,"y1","0"),ie.setAttributeNS(null,"x2","50%"),ie.setAttributeNS(null,"y2","100%"),this.svgElem_.appendChild(ie);const Te=s.createElementNS(Z,"line");Te.classList.add(Di("l")),Te.setAttributeNS(null,"x1","50%"),Te.setAttributeNS(null,"y1","50%"),this.svgElem_.appendChild(Te),this.lineElem_=Te;const Xe=s.createElement("div");Xe.classList.add(Di("m")),this.padElement.appendChild(Xe),this.markerElem_=Xe,l.value.emitter.on("change",this.onValueChange_),this.value=l.value,this.update_()}get allFocusableElements(){return[this.padElement]}update_(){const[s,l]=this.value.rawValue.getComponents(),p=this.maxValue_,C=Lt(s,-p,+p,0,100),j=Lt(l,-p,+p,0,100),ie=this.invertsY_?100-j:j;this.lineElem_.setAttributeNS(null,"x2",`${C}%`),this.lineElem_.setAttributeNS(null,"y2",`${ie}%`),this.markerElem_.style.left=`${C}%`,this.markerElem_.style.top=`${ie}%`}onValueChange_(){this.update_()}onFoldableChange_(){this.update_()}}function Kh(u,s,l){return[xn(s[0],ci(u)),xn(s[1],zs(u))*(l?1:-1)]}class F_{constructor(s,l){this.onPadKeyDown_=this.onPadKeyDown_.bind(this),this.onPadKeyUp_=this.onPadKeyUp_.bind(this),this.onPointerDown_=this.onPointerDown_.bind(this),this.onPointerMove_=this.onPointerMove_.bind(this),this.onPointerUp_=this.onPointerUp_.bind(this),this.value=l.value,this.viewProps=l.viewProps,this.baseSteps_=l.baseSteps,this.maxValue_=l.maxValue,this.invertsY_=l.invertsY,this.view=new O_(s,{invertsY:this.invertsY_,layout:l.layout,maxValue:this.maxValue_,value:this.value,viewProps:this.viewProps}),this.ptHandler_=new rr(this.view.padElement),this.ptHandler_.emitter.on("down",this.onPointerDown_),this.ptHandler_.emitter.on("move",this.onPointerMove_),this.ptHandler_.emitter.on("up",this.onPointerUp_),this.view.padElement.addEventListener("keydown",this.onPadKeyDown_),this.view.padElement.addEventListener("keyup",this.onPadKeyUp_)}handlePointerEvent_(s,l){if(!s.point)return;const p=this.maxValue_,C=Lt(s.point.x,0,s.bounds.width,-p,+p),j=Lt(this.invertsY_?s.bounds.height-s.point.y:s.point.y,0,s.bounds.height,-p,+p);this.value.setRawValue(new Ii(C,j),l)}onPointerDown_(s){this.handlePointerEvent_(s.data,{forceEmit:!1,last:!1})}onPointerMove_(s){this.handlePointerEvent_(s.data,{forceEmit:!1,last:!1})}onPointerUp_(s){this.handlePointerEvent_(s.data,{forceEmit:!0,last:!0})}onPadKeyDown_(s){mh(s.key)&&s.preventDefault();const[l,p]=Kh(s,this.baseSteps_,this.invertsY_);l===0&&p===0||this.value.setRawValue(new Ii(this.value.rawValue.x+l,this.value.rawValue.y+p),{forceEmit:!1,last:!1})}onPadKeyUp_(s){const[l,p]=Kh(s,this.baseSteps_,this.invertsY_);l===0&&p===0||this.value.setRawValue(this.value.rawValue,{forceEmit:!0,last:!0})}}class B_{constructor(s,l){var p,C;this.onPopupChildBlur_=this.onPopupChildBlur_.bind(this),this.onPopupChildKeydown_=this.onPopupChildKeydown_.bind(this),this.onPadButtonBlur_=this.onPadButtonBlur_.bind(this),this.onPadButtonClick_=this.onPadButtonClick_.bind(this),this.value=l.value,this.viewProps=l.viewProps,this.foldable_=ve.create(l.expanded),this.popC_=l.pickerLayout==="popup"?new oh(s,{viewProps:this.viewProps}):null;const j=new F_(s,{baseSteps:[l.axes[0].baseStep,l.axes[1].baseStep],invertsY:l.invertsY,layout:l.pickerLayout,maxValue:l.maxValue,value:this.value,viewProps:this.viewProps});j.view.allFocusableElements.forEach(ie=>{ie.addEventListener("blur",this.onPopupChildBlur_),ie.addEventListener("keydown",this.onPopupChildKeydown_)}),this.pickerC_=j,this.textC_=new Wl(s,{assembly:Yh,axes:l.axes,parser:l.parser,value:this.value,viewProps:this.viewProps}),this.view=new N_(s,{expanded:this.foldable_.value("expanded"),pickerLayout:l.pickerLayout,viewProps:this.viewProps}),this.view.textElement.appendChild(this.textC_.view.element),(p=this.view.buttonElement)===null||p===void 0||p.addEventListener("blur",this.onPadButtonBlur_),(C=this.view.buttonElement)===null||C===void 0||C.addEventListener("click",this.onPadButtonClick_),this.popC_?(this.view.element.appendChild(this.popC_.view.element),this.popC_.view.element.appendChild(this.pickerC_.view.element),Vs({primary:this.foldable_.value("expanded"),secondary:this.popC_.shows,forward:ie=>ie.rawValue,backward:(ie,Te)=>Te.rawValue})):this.view.pickerElement&&(this.view.pickerElement.appendChild(this.pickerC_.view.element),Se(this.foldable_,this.view.pickerElement))}onPadButtonBlur_(s){if(!this.popC_)return;const l=this.view.element,p=s.relatedTarget;(!p||!l.contains(p))&&(this.popC_.shows.rawValue=!1)}onPadButtonClick_(){this.foldable_.set("expanded",!this.foldable_.get("expanded")),this.foldable_.get("expanded")&&this.pickerC_.view.allFocusableElements[0].focus()}onPopupChildBlur_(s){if(!this.popC_)return;const l=this.popC_.view.element,p=Ve(s);p&&l.contains(p)||p&&p===this.view.buttonElement&&!D(l.ownerDocument)||(this.popC_.shows.rawValue=!1)}onPopupChildKeydown_(s){this.popC_?s.key==="Escape"&&(this.popC_.shows.rawValue=!1):this.view.pickerElement&&s.key==="Escape"&&this.view.buttonElement.focus()}}class Hr{constructor(s=0,l=0,p=0){this.x=s,this.y=l,this.z=p}getComponents(){return[this.x,this.y,this.z]}static isObject(s){if(m(s))return!1;const l=s.x,p=s.y,C=s.z;return!(typeof l!="number"||typeof p!="number"||typeof C!="number")}static equals(s,l){return s.x===l.x&&s.y===l.y&&s.z===l.z}toObject(){return{x:this.x,y:this.y,z:this.z}}}const $h={toComponents:u=>u.getComponents(),fromComponents:u=>new Hr(...u)};function k_(u){return Hr.isObject(u)?new Hr(u.x,u.y,u.z):new Hr}function V_(u,s){u.writeProperty("x",s.x),u.writeProperty("y",s.y),u.writeProperty("z",s.z)}function z_(u,s){return new Li({assembly:$h,components:[ui("x"in u?u.x:void 0,s.x),ui("y"in u?u.y:void 0,s.y),ui("z"in u?u.z:void 0,s.z)]})}function jl(u,s){return{baseStep:Br(s),constraint:s,textProps:K.fromObject({draggingScale:kr(s,u),formatter:Jt(Vo(s,u))})}}const H_={id:"input-point3d",type:"input",accept:(u,s)=>{if(!Hr.isObject(u))return null;const l=ce,p=Me(s,{x:l.optional.custom(Pi),y:l.optional.custom(Pi),z:l.optional.custom(Pi)});return p?{initialValue:u,params:p}:null},binding:{reader:u=>k_,constraint:u=>z_(u.params,u.initialValue),equals:Hr.equals,writer:u=>V_},controller:u=>{const s=u.value,l=u.constraint;if(!(l instanceof Li))throw w.shouldNeverHappen();return new Wl(u.document,{assembly:$h,axes:[jl(s.rawValue.x,l.components[0]),jl(s.rawValue.y,l.components[1]),jl(s.rawValue.z,l.components[2])],parser:li,value:s,viewProps:u.viewProps})}};class Gr{constructor(s=0,l=0,p=0,C=0){this.x=s,this.y=l,this.z=p,this.w=C}getComponents(){return[this.x,this.y,this.z,this.w]}static isObject(s){if(m(s))return!1;const l=s.x,p=s.y,C=s.z,j=s.w;return!(typeof l!="number"||typeof p!="number"||typeof C!="number"||typeof j!="number")}static equals(s,l){return s.x===l.x&&s.y===l.y&&s.z===l.z&&s.w===l.w}toObject(){return{x:this.x,y:this.y,z:this.z,w:this.w}}}const Zh={toComponents:u=>u.getComponents(),fromComponents:u=>new Gr(...u)};function G_(u){return Gr.isObject(u)?new Gr(u.x,u.y,u.z,u.w):new Gr}function W_(u,s){u.writeProperty("x",s.x),u.writeProperty("y",s.y),u.writeProperty("z",s.z),u.writeProperty("w",s.w)}function j_(u,s){return new Li({assembly:Zh,components:[ui("x"in u?u.x:void 0,s.x),ui("y"in u?u.y:void 0,s.y),ui("z"in u?u.z:void 0,s.z),ui("w"in u?u.w:void 0,s.w)]})}function X_(u,s){return{baseStep:Br(s),constraint:s,textProps:K.fromObject({draggingScale:kr(s,u),formatter:Jt(Vo(s,u))})}}const q_={id:"input-point4d",type:"input",accept:(u,s)=>{if(!Gr.isObject(u))return null;const l=ce,p=Me(s,{x:l.optional.custom(Pi),y:l.optional.custom(Pi),z:l.optional.custom(Pi),w:l.optional.custom(Pi)});return p?{initialValue:u,params:p}:null},binding:{reader:u=>G_,constraint:u=>j_(u.params,u.initialValue),equals:Gr.equals,writer:u=>W_},controller:u=>{const s=u.value,l=u.constraint;if(!(l instanceof Li))throw w.shouldNeverHappen();return new Wl(u.document,{assembly:Zh,axes:s.rawValue.getComponents().map((p,C)=>X_(p,l.components[C])),parser:li,value:s,viewProps:u.viewProps})}};function Y_(u){const s=[],l=Il(u.options);return l&&s.push(l),new Ns(s)}const K_={id:"input-string",type:"input",accept:(u,s)=>{if(typeof u!="string")return null;const p=Me(s,{options:ce.optional.custom(ko)});return p?{initialValue:u,params:p}:null},binding:{reader:u=>ph,constraint:u=>Y_(u.params),writer:u=>Gs},controller:u=>{const s=u.document,l=u.value,p=u.constraint,C=p&&ai(p,Os);return C?new Fs(s,{props:new K({options:C.values.value("options")}),value:l,viewProps:u.viewProps}):new Fo(s,{parser:j=>j,props:K.fromObject({formatter:Cl}),value:l,viewProps:u.viewProps})}},js={monitor:{defaultInterval:200,defaultLineCount:3}},Jh=S("mll");class $_{constructor(s,l){this.onValueUpdate_=this.onValueUpdate_.bind(this),this.formatter_=l.formatter,this.element=s.createElement("div"),this.element.classList.add(Jh()),l.viewProps.bindClassModifiers(this.element);const p=s.createElement("textarea");p.classList.add(Jh("i")),p.style.height=`calc(var(--bld-us) * ${l.lineCount})`,p.readOnly=!0,l.viewProps.bindDisabled(p),this.element.appendChild(p),this.textareaElem_=p,l.value.emitter.on("change",this.onValueUpdate_),this.value=l.value,this.update_()}update_(){const s=this.textareaElem_,l=s.scrollTop===s.scrollHeight-s.clientHeight,p=[];this.value.rawValue.forEach(C=>{C!==void 0&&p.push(this.formatter_(C))}),s.textContent=p.join(`
`),l&&(s.scrollTop=s.scrollHeight)}onValueUpdate_(){this.update_()}}class Xl{constructor(s,l){this.value=l.value,this.viewProps=l.viewProps,this.view=new $_(s,{formatter:l.formatter,lineCount:l.lineCount,value:this.value,viewProps:this.viewProps})}}const Qh=S("sgl");class Z_{constructor(s,l){this.onValueUpdate_=this.onValueUpdate_.bind(this),this.formatter_=l.formatter,this.element=s.createElement("div"),this.element.classList.add(Qh()),l.viewProps.bindClassModifiers(this.element);const p=s.createElement("input");p.classList.add(Qh("i")),p.readOnly=!0,p.type="text",l.viewProps.bindDisabled(p),this.element.appendChild(p),this.inputElement=p,l.value.emitter.on("change",this.onValueUpdate_),this.value=l.value,this.update_()}update_(){const s=this.value.rawValue,l=s[s.length-1];this.inputElement.value=l!==void 0?this.formatter_(l):""}onValueUpdate_(){this.update_()}}class ql{constructor(s,l){this.value=l.value,this.viewProps=l.viewProps,this.view=new Z_(s,{formatter:l.formatter,value:this.value,viewProps:this.viewProps})}}const J_={id:"monitor-bool",type:"monitor",accept:(u,s)=>{if(typeof u!="boolean")return null;const p=Me(s,{lineCount:ce.optional.number});return p?{initialValue:u,params:p}:null},binding:{reader:u=>lh},controller:u=>{var s;return u.value.rawValue.length===1?new ql(u.document,{formatter:ch,value:u.value,viewProps:u.viewProps}):new Xl(u.document,{formatter:ch,lineCount:(s=u.params.lineCount)!==null&&s!==void 0?s:js.monitor.defaultLineCount,value:u.value,viewProps:u.viewProps})}},Ui=S("grl");class Q_{constructor(s,l){this.onCursorChange_=this.onCursorChange_.bind(this),this.onValueUpdate_=this.onValueUpdate_.bind(this),this.element=s.createElement("div"),this.element.classList.add(Ui()),l.viewProps.bindClassModifiers(this.element),this.formatter_=l.formatter,this.props_=l.props,this.cursor_=l.cursor,this.cursor_.emitter.on("change",this.onCursorChange_);const p=s.createElementNS(Z,"svg");p.classList.add(Ui("g")),p.style.height=`calc(var(--bld-us) * ${l.lineCount})`,this.element.appendChild(p),this.svgElem_=p;const C=s.createElementNS(Z,"polyline");this.svgElem_.appendChild(C),this.lineElem_=C;const j=s.createElement("div");j.classList.add(Ui("t"),S("tt")()),this.element.appendChild(j),this.tooltipElem_=j,l.value.emitter.on("change",this.onValueUpdate_),this.value=l.value,this.update_()}get graphElement(){return this.svgElem_}update_(){const s=this.svgElem_.getBoundingClientRect(),l=this.value.rawValue.length-1,p=this.props_.get("minValue"),C=this.props_.get("maxValue"),j=[];this.value.rawValue.forEach((pt,vt)=>{if(pt===void 0)return;const cr=Lt(vt,0,l,0,s.width),Xs=Lt(pt,p,C,s.height,0);j.push([cr,Xs].join(","))}),this.lineElem_.setAttributeNS(null,"points",j.join(" "));const ie=this.tooltipElem_,Te=this.value.rawValue[this.cursor_.rawValue];if(Te===void 0){ie.classList.remove(Ui("t","a"));return}const Xe=Lt(this.cursor_.rawValue,0,l,0,s.width),Ye=Lt(Te,p,C,s.height,0);ie.style.left=`${Xe}px`,ie.style.top=`${Ye}px`,ie.textContent=`${this.formatter_(Te)}`,ie.classList.contains(Ui("t","a"))||(ie.classList.add(Ui("t","a"),Ui("t","in")),oe(ie),ie.classList.remove(Ui("t","in")))}onValueUpdate_(){this.update_()}onCursorChange_(){this.update_()}}class e0{constructor(s,l){if(this.onGraphMouseMove_=this.onGraphMouseMove_.bind(this),this.onGraphMouseLeave_=this.onGraphMouseLeave_.bind(this),this.onGraphPointerDown_=this.onGraphPointerDown_.bind(this),this.onGraphPointerMove_=this.onGraphPointerMove_.bind(this),this.onGraphPointerUp_=this.onGraphPointerUp_.bind(this),this.props_=l.props,this.value=l.value,this.viewProps=l.viewProps,this.cursor_=ee(-1),this.view=new Q_(s,{cursor:this.cursor_,formatter:l.formatter,lineCount:l.lineCount,props:this.props_,value:this.value,viewProps:this.viewProps}),!D(s))this.view.element.addEventListener("mousemove",this.onGraphMouseMove_),this.view.element.addEventListener("mouseleave",this.onGraphMouseLeave_);else{const p=new rr(this.view.element);p.emitter.on("down",this.onGraphPointerDown_),p.emitter.on("move",this.onGraphPointerMove_),p.emitter.on("up",this.onGraphPointerUp_)}}onGraphMouseLeave_(){this.cursor_.rawValue=-1}onGraphMouseMove_(s){const l=this.view.element.getBoundingClientRect();this.cursor_.rawValue=Math.floor(Lt(s.offsetX,0,l.width,0,this.value.rawValue.length))}onGraphPointerDown_(s){this.onGraphPointerMove_(s)}onGraphPointerMove_(s){if(!s.data.point){this.cursor_.rawValue=-1;return}this.cursor_.rawValue=Math.floor(Lt(s.data.point.x,0,s.data.bounds.width,0,this.value.rawValue.length))}onGraphPointerUp_(){this.cursor_.rawValue=-1}}function Yl(u){return"format"in u&&!m(u.format)?u.format:Jt(2)}function t0(u){var s;return u.value.rawValue.length===1?new ql(u.document,{formatter:Yl(u.params),value:u.value,viewProps:u.viewProps}):new Xl(u.document,{formatter:Yl(u.params),lineCount:(s=u.params.lineCount)!==null&&s!==void 0?s:js.monitor.defaultLineCount,value:u.value,viewProps:u.viewProps})}function n0(u){var s,l,p;return new e0(u.document,{formatter:Yl(u.params),lineCount:(s=u.params.lineCount)!==null&&s!==void 0?s:js.monitor.defaultLineCount,props:K.fromObject({maxValue:(l="max"in u.params?u.params.max:null)!==null&&l!==void 0?l:100,minValue:(p="min"in u.params?u.params.min:null)!==null&&p!==void 0?p:0}),value:u.value,viewProps:u.viewProps})}function ed(u){return"view"in u&&u.view==="graph"}const i0={id:"monitor-number",type:"monitor",accept:(u,s)=>{if(typeof u!="number")return null;const l=ce,p=Me(s,{format:l.optional.function,lineCount:l.optional.number,max:l.optional.number,min:l.optional.number,view:l.optional.string});return p?{initialValue:u,params:p}:null},binding:{defaultBufferSize:u=>ed(u)?64:1,reader:u=>fh},controller:u=>ed(u.params)?n0(u):t0(u)},r0={id:"monitor-string",type:"monitor",accept:(u,s)=>{if(typeof u!="string")return null;const l=ce,p=Me(s,{lineCount:l.optional.number,multiline:l.optional.boolean});return p?{initialValue:u,params:p}:null},binding:{reader:u=>ph},controller:u=>{var s;const l=u.value;return l.rawValue.length>1||"multiline"in u.params&&u.params.multiline?new Xl(u.document,{formatter:Cl,lineCount:(s=u.params.lineCount)!==null&&s!==void 0?s:js.monitor.defaultLineCount,value:l,viewProps:u.viewProps}):new ql(u.document,{formatter:Cl,value:l,viewProps:u.viewProps})}};function s0(u,s){var l;const p=u.accept(s.target.read(),s.params);if(m(p))return null;const C=ce,j={target:s.target,initialValue:p.initialValue,params:p.params},ie=u.binding.reader(j),Te=u.binding.constraint?u.binding.constraint(j):void 0,Xe=ee(ie(p.initialValue),{constraint:Te,equals:u.binding.equals}),Ye=new _n({reader:ie,target:s.target,value:Xe,writer:u.binding.writer(j)}),pt=C.optional.boolean(s.params.disabled).value,vt=C.optional.boolean(s.params.hidden).value,cr=u.controller({constraint:Te,document:s.document,initialValue:p.initialValue,params:p.params,value:Ye.value,viewProps:W.create({disabled:pt,hidden:vt})});return new dt(s.document,{binding:Ye,blade:X(),props:K.fromObject({label:"label"in s.params?(l=C.optional.string(s.params.label).value)!==null&&l!==void 0?l:null:s.target.key}),valueController:cr})}function o0(u,s){return s===0?new oi:new Us(u,s??js.monitor.defaultInterval)}function a0(u,s){var l,p,C;const j=ce,ie=u.accept(s.target.read(),s.params);if(m(ie))return null;const Te={target:s.target,initialValue:ie.initialValue,params:ie.params},Xe=u.binding.reader(Te),Ye=(p=(l=j.optional.number(s.params.bufferSize).value)!==null&&l!==void 0?l:u.binding.defaultBufferSize&&u.binding.defaultBufferSize(ie.params))!==null&&p!==void 0?p:1,pt=j.optional.number(s.params.interval).value,vt=new Ng({reader:Xe,target:s.target,ticker:o0(s.document,pt),value:Ml(Ye)}),cr=j.optional.boolean(s.params.disabled).value,Xs=j.optional.boolean(s.params.hidden).value,qs=u.controller({document:s.document,params:ie.params,value:vt.value,viewProps:W.create({disabled:cr,hidden:Xs})});return new ft(s.document,{binding:vt,blade:X(),props:K.fromObject({label:"label"in s.params?(C=j.optional.string(s.params.label).value)!==null&&C!==void 0?C:null:s.target.key}),valueController:qs})}class l0{constructor(){this.pluginsMap_={blades:[],inputs:[],monitors:[]}}getAll(){return[...this.pluginsMap_.blades,...this.pluginsMap_.inputs,...this.pluginsMap_.monitors]}register(s){s.type==="blade"?this.pluginsMap_.blades.unshift(s):s.type==="input"?this.pluginsMap_.inputs.unshift(s):s.type==="monitor"&&this.pluginsMap_.monitors.unshift(s)}createInput(s,l,p){const C=l.read();if(m(C))throw new w({context:{key:l.key},type:"nomatchingcontroller"});const j=this.pluginsMap_.inputs.reduce((ie,Te)=>ie??s0(Te,{document:s,target:l,params:p}),null);if(j)return j;throw new w({context:{key:l.key},type:"nomatchingcontroller"})}createMonitor(s,l,p){const C=this.pluginsMap_.monitors.reduce((j,ie)=>j??a0(ie,{document:s,params:p,target:l}),null);if(C)return C;throw new w({context:{key:l.key},type:"nomatchingcontroller"})}createBlade(s,l){const p=this.pluginsMap_.blades.reduce((C,j)=>C??Yt(j,{document:s,params:l}),null);if(!p)throw new w({type:"nomatchingview",context:{params:l}});return p}createBladeApi(s){if(s instanceof dt)return new ut(s);if(s instanceof ft)return new Pt(s);if(s instanceof re)return new Lr(s,this);const l=this.pluginsMap_.blades.reduce((p,C)=>p??C.api({controller:s,pool:this}),null);if(!l)throw w.shouldNeverHappen();return l}}function c0(){const u=new l0;return[m0,H_,q_,K_,U_,P_,A_,E_,Mv,J_,r0,i0,ze,Fe,Qe,Nr].forEach(s=>{u.register(s)}),u}function u0(u){return Ii.isObject(u)?new Ii(u.x,u.y):new Ii}function h0(u,s){u.writeProperty("x",s.x),u.writeProperty("y",s.y)}function ui(u,s){if(!u)return;const l=[],p=Xh(u,s);p&&l.push(p);const C=qh(u);return C&&l.push(C),new Ns(l)}function d0(u,s){return new Li({assembly:Yh,components:[ui("x"in u?u.x:void 0,s.x),ui("y"in u?u.y:void 0,s.y)]})}function td(u,s){const[l,p]=u?I_(u):[];if(!m(l)||!m(p))return Math.max(Math.abs(l??0),Math.abs(p??0));const C=Br(u);return Math.max(Math.abs(C)*10,Math.abs(s)*10)}function f0(u,s){const l=s instanceof Li?s.components[0]:void 0,p=s instanceof Li?s.components[1]:void 0,C=td(l,u.x),j=td(p,u.y);return Math.max(C,j)}function nd(u,s){return{baseStep:Br(s),constraint:s,textProps:K.fromObject({draggingScale:kr(s,u),formatter:Jt(Vo(s,u))})}}function p0(u){if(!("y"in u))return!1;const s=u.y;return s&&"inverted"in s?!!s.inverted:!1}const m0={id:"input-point2d",type:"input",accept:(u,s)=>{if(!Ii.isObject(u))return null;const l=ce,p=Me(s,{expanded:l.optional.boolean,picker:l.optional.custom(_h),x:l.optional.custom(Pi),y:l.optional.object({inverted:l.optional.boolean,max:l.optional.number,min:l.optional.number,step:l.optional.number})});return p?{initialValue:u,params:p}:null},binding:{reader:u=>u0,constraint:u=>d0(u.params,u.initialValue),equals:Ii.equals,writer:u=>h0},controller:u=>{const s=u.document,l=u.value,p=u.constraint;if(!(p instanceof Li))throw w.shouldNeverHappen();const C="expanded"in u.params?u.params.expanded:void 0,j="picker"in u.params?u.params.picker:void 0;return new B_(s,{axes:[nd(l.rawValue.x,p.components[0]),nd(l.rawValue.y,p.components[1])],expanded:C??!1,invertsY:p0(u.params),maxValue:f0(l.rawValue,p),parser:li,pickerLayout:j??"popup",value:l,viewProps:u.viewProps})}};class id extends r{constructor(s){super(s),this.emitter_=new R,this.controller_.valueController.value.emitter.on("change",l=>{this.emitter_.emit("change",{event:new a(this,l.rawValue)})})}get label(){return this.controller_.props.get("label")}set label(s){this.controller_.props.set("label",s)}get options(){return this.controller_.valueController.props.get("options")}set options(s){this.controller_.valueController.props.set("options",s)}get value(){return this.controller_.valueController.value.rawValue}set value(s){this.controller_.valueController.value.rawValue=s}on(s,l){const p=l.bind(this);return this.emitter_.on(s,C=>{p(C.event)}),this}}class rd extends r{constructor(s){super(s),this.emitter_=new R,this.controller_.valueController.value.emitter.on("change",l=>{this.emitter_.emit("change",{event:new a(this,l.rawValue)})})}get label(){return this.controller_.props.get("label")}set label(s){this.controller_.props.set("label",s)}get maxValue(){return this.controller_.valueController.sliderController.props.get("maxValue")}set maxValue(s){this.controller_.valueController.sliderController.props.set("maxValue",s)}get minValue(){return this.controller_.valueController.sliderController.props.get("minValue")}set minValue(s){this.controller_.valueController.sliderController.props.set("minValue",s)}get value(){return this.controller_.valueController.value.rawValue}set value(s){this.controller_.valueController.value.rawValue=s}on(s,l){const p=l.bind(this);return this.emitter_.on(s,C=>{p(C.event)}),this}}class sd extends r{constructor(s){super(s),this.emitter_=new R,this.controller_.valueController.value.emitter.on("change",l=>{this.emitter_.emit("change",{event:new a(this,l.rawValue)})})}get label(){return this.controller_.props.get("label")}set label(s){this.controller_.props.set("label",s)}get formatter(){return this.controller_.valueController.props.get("formatter")}set formatter(s){this.controller_.valueController.props.set("formatter",s)}get value(){return this.controller_.valueController.value.rawValue}set value(s){this.controller_.valueController.value.rawValue=s}on(s,l){const p=l.bind(this);return this.emitter_.on(s,C=>{p(C.event)}),this}}const g0=function(){return{id:"list",type:"blade",accept(u){const s=ce,l=Me(u,{options:s.required.custom(ko),value:s.required.raw,view:s.required.constant("list"),label:s.optional.string});return l?{params:l}:null},controller(u){const s=new Os(xh(u.params.options)),l=ee(u.params.value,{constraint:s}),p=new Fs(u.document,{props:new K({options:s.values.value("options")}),value:l,viewProps:u.viewProps});return new Be(u.document,{blade:u.blade,props:K.fromObject({label:u.params.label}),valueController:p})},api(u){return!(u.controller instanceof Be)||!(u.controller.valueController instanceof Fs)?null:new id(u.controller)}}}();function v0(u){return u.reduce((s,l)=>Object.assign(s,{[l.presetKey]:l.read()}),{})}function _0(u,s){u.forEach(l=>{const p=s[l.target.presetKey];p!==void 0&&l.writer(l.target,l.reader(p))})}class x0 extends Ci{constructor(s,l){super(s,l)}get element(){return this.controller_.view.element}importPreset(s){const l=this.controller_.rackController.rack.find(dt).map(p=>p.binding);_0(l,s),this.refresh()}exportPreset(){const s=this.controller_.rackController.rack.find(dt).map(l=>l.binding.target);return v0(s)}refresh(){this.controller_.rackController.rack.find(dt).forEach(s=>{s.binding.read()}),this.controller_.rackController.rack.find(ft).forEach(s=>{s.binding.read()})}}class b0 extends le{constructor(s,l){super(s,{expanded:l.expanded,blade:l.blade,props:l.props,root:!0,viewProps:l.viewProps})}}const y0={id:"slider",type:"blade",accept(u){const s=ce,l=Me(u,{max:s.required.number,min:s.required.number,view:s.required.constant("slider"),format:s.optional.function,label:s.optional.string,value:s.optional.number});return l?{params:l}:null},controller(u){var s,l;const p=(s=u.params.value)!==null&&s!==void 0?s:0,C=new Fr({max:u.params.max,min:u.params.min}),j=new Ll(u.document,{baseStep:1,parser:li,sliderProps:new K({maxValue:C.values.value("max"),minValue:C.values.value("min")}),textProps:K.fromObject({draggingScale:kr(void 0,p),formatter:(l=u.params.format)!==null&&l!==void 0?l:dv}),value:ee(p,{constraint:C}),viewProps:u.viewProps});return new Be(u.document,{blade:u.blade,props:K.fromObject({label:u.params.label}),valueController:j})},api(u){return!(u.controller instanceof Be)||!(u.controller.valueController instanceof Ll)?null:new rd(u.controller)}},w0=function(){return{id:"text",type:"blade",accept(u){const s=ce,l=Me(u,{parse:s.required.function,value:s.required.raw,view:s.required.constant("text"),format:s.optional.function,label:s.optional.string});return l?{params:l}:null},controller(u){var s;const l=new Fo(u.document,{parser:u.params.parse,props:K.fromObject({formatter:(s=u.params.format)!==null&&s!==void 0?s:p=>String(p)}),value:ee(u.params.value),viewProps:u.viewProps});return new Be(u.document,{blade:u.blade,props:K.fromObject({label:u.params.label}),valueController:l})},api(u){return!(u.controller instanceof Be)||!(u.controller.valueController instanceof Fo)?null:new sd(u.controller)}}}();function M0(u){const s=u.createElement("div");return s.classList.add(S("dfw")()),u.body&&u.body.appendChild(s),s}function od(u,s,l){if(u.querySelector(`style[data-tp-style=${s}]`))return;const p=u.createElement("style");p.dataset.tpStyle=s,p.textContent=l,u.head.appendChild(p)}class E0 extends x0{constructor(s){var l,p;const C=s??{},j=(l=C.document)!==null&&l!==void 0?l:z(),ie=c0(),Te=new b0(j,{expanded:C.expanded,blade:X(),props:K.fromObject({title:C.title}),viewProps:W.create()});super(Te,ie),this.pool_=ie,this.containerElem_=(p=C.container)!==null&&p!==void 0?p:M0(j),this.containerElem_.appendChild(this.element),this.doc_=j,this.usesDefaultWrapper_=!C.container,this.setUpDefaultPlugins_()}get document(){if(!this.doc_)throw w.alreadyDisposed();return this.doc_}dispose(){const s=this.containerElem_;if(!s)throw w.alreadyDisposed();if(this.usesDefaultWrapper_){const l=s.parentElement;l&&l.removeChild(s)}this.containerElem_=null,this.doc_=null,super.dispose()}registerPlugin(s){("plugin"in s?[s.plugin]:"plugins"in s?s.plugins:[]).forEach(p=>{this.pool_.register(p),this.embedPluginStyle_(p)})}embedPluginStyle_(s){s.css&&od(this.document,`plugin-${s.id}`,s.css)}setUpDefaultPlugins_(){od(this.document,"default",'.tp-tbiv_b,.tp-coltxtv_ms,.tp-ckbv_i,.tp-rotv_b,.tp-fldv_b,.tp-mllv_i,.tp-sglv_i,.tp-grlv_g,.tp-txtv_i,.tp-p2dpv_p,.tp-colswv_sw,.tp-p2dv_b,.tp-btnv_b,.tp-lstv_s{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:rgba(0,0,0,0);border-width:0;font-family:inherit;font-size:inherit;font-weight:inherit;margin:0;outline:none;padding:0}.tp-p2dv_b,.tp-btnv_b,.tp-lstv_s{background-color:var(--btn-bg);border-radius:var(--elm-br);color:var(--btn-fg);cursor:pointer;display:block;font-weight:bold;height:var(--bld-us);line-height:var(--bld-us);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tp-p2dv_b:hover,.tp-btnv_b:hover,.tp-lstv_s:hover{background-color:var(--btn-bg-h)}.tp-p2dv_b:focus,.tp-btnv_b:focus,.tp-lstv_s:focus{background-color:var(--btn-bg-f)}.tp-p2dv_b:active,.tp-btnv_b:active,.tp-lstv_s:active{background-color:var(--btn-bg-a)}.tp-p2dv_b:disabled,.tp-btnv_b:disabled,.tp-lstv_s:disabled{opacity:.5}.tp-txtv_i,.tp-p2dpv_p,.tp-colswv_sw{background-color:var(--in-bg);border-radius:var(--elm-br);box-sizing:border-box;color:var(--in-fg);font-family:inherit;height:var(--bld-us);line-height:var(--bld-us);min-width:0;width:100%}.tp-txtv_i:hover,.tp-p2dpv_p:hover,.tp-colswv_sw:hover{background-color:var(--in-bg-h)}.tp-txtv_i:focus,.tp-p2dpv_p:focus,.tp-colswv_sw:focus{background-color:var(--in-bg-f)}.tp-txtv_i:active,.tp-p2dpv_p:active,.tp-colswv_sw:active{background-color:var(--in-bg-a)}.tp-txtv_i:disabled,.tp-p2dpv_p:disabled,.tp-colswv_sw:disabled{opacity:.5}.tp-mllv_i,.tp-sglv_i,.tp-grlv_g{background-color:var(--mo-bg);border-radius:var(--elm-br);box-sizing:border-box;color:var(--mo-fg);height:var(--bld-us);scrollbar-color:currentColor rgba(0,0,0,0);scrollbar-width:thin;width:100%}.tp-mllv_i::-webkit-scrollbar,.tp-sglv_i::-webkit-scrollbar,.tp-grlv_g::-webkit-scrollbar{height:8px;width:8px}.tp-mllv_i::-webkit-scrollbar-corner,.tp-sglv_i::-webkit-scrollbar-corner,.tp-grlv_g::-webkit-scrollbar-corner{background-color:rgba(0,0,0,0)}.tp-mllv_i::-webkit-scrollbar-thumb,.tp-sglv_i::-webkit-scrollbar-thumb,.tp-grlv_g::-webkit-scrollbar-thumb{background-clip:padding-box;background-color:currentColor;border:rgba(0,0,0,0) solid 2px;border-radius:4px}.tp-rotv{--font-family: var(--tp-font-family, Roboto Mono, Source Code Pro, Menlo, Courier, monospace);--bs-br: var(--tp-base-border-radius, 6px);--cnt-h-p: var(--tp-container-horizontal-padding, 4px);--cnt-v-p: var(--tp-container-vertical-padding, 4px);--elm-br: var(--tp-element-border-radius, 2px);--bld-s: var(--tp-blade-spacing, 4px);--bld-us: var(--tp-blade-unit-size, 20px);--bs-bg: var(--tp-base-background-color, hsl(230, 7%, 17%));--bs-sh: var(--tp-base-shadow-color, rgba(0, 0, 0, 0.2));--btn-bg: var(--tp-button-background-color, hsl(230, 7%, 70%));--btn-bg-a: var(--tp-button-background-color-active, #d6d7db);--btn-bg-f: var(--tp-button-background-color-focus, #c8cad0);--btn-bg-h: var(--tp-button-background-color-hover, #bbbcc4);--btn-fg: var(--tp-button-foreground-color, hsl(230, 7%, 17%));--cnt-bg: var(--tp-container-background-color, rgba(187, 188, 196, 0.1));--cnt-bg-a: var(--tp-container-background-color-active, rgba(187, 188, 196, 0.25));--cnt-bg-f: var(--tp-container-background-color-focus, rgba(187, 188, 196, 0.2));--cnt-bg-h: var(--tp-container-background-color-hover, rgba(187, 188, 196, 0.15));--cnt-fg: var(--tp-container-foreground-color, hsl(230, 7%, 75%));--in-bg: var(--tp-input-background-color, rgba(187, 188, 196, 0.1));--in-bg-a: var(--tp-input-background-color-active, rgba(187, 188, 196, 0.25));--in-bg-f: var(--tp-input-background-color-focus, rgba(187, 188, 196, 0.2));--in-bg-h: var(--tp-input-background-color-hover, rgba(187, 188, 196, 0.15));--in-fg: var(--tp-input-foreground-color, hsl(230, 7%, 75%));--lbl-fg: var(--tp-label-foreground-color, rgba(187, 188, 196, 0.7));--mo-bg: var(--tp-monitor-background-color, rgba(0, 0, 0, 0.2));--mo-fg: var(--tp-monitor-foreground-color, rgba(187, 188, 196, 0.7));--grv-fg: var(--tp-groove-foreground-color, rgba(187, 188, 196, 0.1))}.tp-rotv_c>.tp-cntv.tp-v-lst,.tp-tabv_c .tp-brkv>.tp-cntv.tp-v-lst,.tp-fldv_c>.tp-cntv.tp-v-lst{margin-bottom:calc(-1*var(--cnt-v-p))}.tp-rotv_c>.tp-fldv.tp-v-lst .tp-fldv_c,.tp-tabv_c .tp-brkv>.tp-fldv.tp-v-lst .tp-fldv_c,.tp-fldv_c>.tp-fldv.tp-v-lst .tp-fldv_c{border-bottom-left-radius:0}.tp-rotv_c>.tp-fldv.tp-v-lst .tp-fldv_b,.tp-tabv_c .tp-brkv>.tp-fldv.tp-v-lst .tp-fldv_b,.tp-fldv_c>.tp-fldv.tp-v-lst .tp-fldv_b{border-bottom-left-radius:0}.tp-rotv_c>*:not(.tp-v-fst),.tp-tabv_c .tp-brkv>*:not(.tp-v-fst),.tp-fldv_c>*:not(.tp-v-fst){margin-top:var(--bld-s)}.tp-rotv_c>.tp-sprv:not(.tp-v-fst),.tp-tabv_c .tp-brkv>.tp-sprv:not(.tp-v-fst),.tp-fldv_c>.tp-sprv:not(.tp-v-fst),.tp-rotv_c>.tp-cntv:not(.tp-v-fst),.tp-tabv_c .tp-brkv>.tp-cntv:not(.tp-v-fst),.tp-fldv_c>.tp-cntv:not(.tp-v-fst){margin-top:var(--cnt-v-p)}.tp-rotv_c>.tp-sprv+*:not(.tp-v-hidden),.tp-tabv_c .tp-brkv>.tp-sprv+*:not(.tp-v-hidden),.tp-fldv_c>.tp-sprv+*:not(.tp-v-hidden),.tp-rotv_c>.tp-cntv+*:not(.tp-v-hidden),.tp-tabv_c .tp-brkv>.tp-cntv+*:not(.tp-v-hidden),.tp-fldv_c>.tp-cntv+*:not(.tp-v-hidden){margin-top:var(--cnt-v-p)}.tp-rotv_c>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,.tp-tabv_c .tp-brkv>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,.tp-fldv_c>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,.tp-rotv_c>.tp-cntv:not(.tp-v-hidden)+.tp-cntv,.tp-tabv_c .tp-brkv>.tp-cntv:not(.tp-v-hidden)+.tp-cntv,.tp-fldv_c>.tp-cntv:not(.tp-v-hidden)+.tp-cntv{margin-top:0}.tp-tabv_c .tp-brkv>.tp-cntv,.tp-fldv_c>.tp-cntv{margin-left:4px}.tp-tabv_c .tp-brkv>.tp-fldv>.tp-fldv_b,.tp-fldv_c>.tp-fldv>.tp-fldv_b{border-top-left-radius:var(--elm-br);border-bottom-left-radius:var(--elm-br)}.tp-tabv_c .tp-brkv>.tp-fldv.tp-fldv-expanded>.tp-fldv_b,.tp-fldv_c>.tp-fldv.tp-fldv-expanded>.tp-fldv_b{border-bottom-left-radius:0}.tp-tabv_c .tp-brkv .tp-fldv>.tp-fldv_c,.tp-fldv_c .tp-fldv>.tp-fldv_c{border-bottom-left-radius:var(--elm-br)}.tp-tabv_c .tp-brkv>.tp-cntv+.tp-fldv>.tp-fldv_b,.tp-fldv_c>.tp-cntv+.tp-fldv>.tp-fldv_b{border-top-left-radius:0}.tp-tabv_c .tp-brkv>.tp-cntv+.tp-tabv>.tp-tabv_t,.tp-fldv_c>.tp-cntv+.tp-tabv>.tp-tabv_t{border-top-left-radius:0}.tp-tabv_c .tp-brkv>.tp-tabv>.tp-tabv_t,.tp-fldv_c>.tp-tabv>.tp-tabv_t{border-top-left-radius:var(--elm-br)}.tp-tabv_c .tp-brkv .tp-tabv>.tp-tabv_c,.tp-fldv_c .tp-tabv>.tp-tabv_c{border-bottom-left-radius:var(--elm-br)}.tp-rotv_b,.tp-fldv_b{background-color:var(--cnt-bg);color:var(--cnt-fg);cursor:pointer;display:block;height:calc(var(--bld-us) + 4px);line-height:calc(var(--bld-us) + 4px);overflow:hidden;padding-left:var(--cnt-h-p);padding-right:calc(4px + var(--bld-us) + var(--cnt-h-p));position:relative;text-align:left;text-overflow:ellipsis;white-space:nowrap;width:100%;transition:border-radius .2s ease-in-out .2s}.tp-rotv_b:hover,.tp-fldv_b:hover{background-color:var(--cnt-bg-h)}.tp-rotv_b:focus,.tp-fldv_b:focus{background-color:var(--cnt-bg-f)}.tp-rotv_b:active,.tp-fldv_b:active{background-color:var(--cnt-bg-a)}.tp-rotv_b:disabled,.tp-fldv_b:disabled{opacity:.5}.tp-rotv_m,.tp-fldv_m{background:linear-gradient(to left, var(--cnt-fg), var(--cnt-fg) 2px, transparent 2px, transparent 4px, var(--cnt-fg) 4px);border-radius:2px;bottom:0;content:"";display:block;height:6px;right:calc(var(--cnt-h-p) + (var(--bld-us) + 4px - 6px)/2 - 2px);margin:auto;opacity:.5;position:absolute;top:0;transform:rotate(90deg);transition:transform .2s ease-in-out;width:6px}.tp-rotv.tp-rotv-expanded .tp-rotv_m,.tp-fldv.tp-fldv-expanded>.tp-fldv_b>.tp-fldv_m{transform:none}.tp-rotv_c,.tp-fldv_c{box-sizing:border-box;height:0;opacity:0;overflow:hidden;padding-bottom:0;padding-top:0;position:relative;transition:height .2s ease-in-out,opacity .2s linear,padding .2s ease-in-out}.tp-rotv.tp-rotv-cpl:not(.tp-rotv-expanded) .tp-rotv_c,.tp-fldv.tp-fldv-cpl:not(.tp-fldv-expanded)>.tp-fldv_c{display:none}.tp-rotv.tp-rotv-expanded .tp-rotv_c,.tp-fldv.tp-fldv-expanded>.tp-fldv_c{opacity:1;padding-bottom:var(--cnt-v-p);padding-top:var(--cnt-v-p);transform:none;overflow:visible;transition:height .2s ease-in-out,opacity .2s linear .2s,padding .2s ease-in-out}.tp-lstv,.tp-coltxtv_m{position:relative}.tp-lstv_s{padding:0 20px 0 4px;width:100%}.tp-lstv_m,.tp-coltxtv_mm{bottom:0;margin:auto;pointer-events:none;position:absolute;right:2px;top:0}.tp-lstv_m svg,.tp-coltxtv_mm svg{bottom:0;height:16px;margin:auto;position:absolute;right:0;top:0;width:16px}.tp-lstv_m svg path,.tp-coltxtv_mm svg path{fill:currentColor}.tp-pndtxtv,.tp-coltxtv_w{display:flex}.tp-pndtxtv_a,.tp-coltxtv_c{width:100%}.tp-pndtxtv_a+.tp-pndtxtv_a,.tp-coltxtv_c+.tp-pndtxtv_a,.tp-pndtxtv_a+.tp-coltxtv_c,.tp-coltxtv_c+.tp-coltxtv_c{margin-left:2px}.tp-btnv_b{width:100%}.tp-btnv_t{text-align:center}.tp-ckbv_l{display:block;position:relative}.tp-ckbv_i{left:0;opacity:0;position:absolute;top:0}.tp-ckbv_w{background-color:var(--in-bg);border-radius:var(--elm-br);cursor:pointer;display:block;height:var(--bld-us);position:relative;width:var(--bld-us)}.tp-ckbv_w svg{bottom:0;display:block;height:16px;left:0;margin:auto;opacity:0;position:absolute;right:0;top:0;width:16px}.tp-ckbv_w svg path{fill:none;stroke:var(--in-fg);stroke-width:2}.tp-ckbv_i:hover+.tp-ckbv_w{background-color:var(--in-bg-h)}.tp-ckbv_i:focus+.tp-ckbv_w{background-color:var(--in-bg-f)}.tp-ckbv_i:active+.tp-ckbv_w{background-color:var(--in-bg-a)}.tp-ckbv_i:checked+.tp-ckbv_w svg{opacity:1}.tp-ckbv.tp-v-disabled .tp-ckbv_w{opacity:.5}.tp-colv{position:relative}.tp-colv_h{display:flex}.tp-colv_s{flex-grow:0;flex-shrink:0;width:var(--bld-us)}.tp-colv_t{flex:1;margin-left:4px}.tp-colv_p{height:0;margin-top:0;opacity:0;overflow:hidden;transition:height .2s ease-in-out,opacity .2s linear,margin .2s ease-in-out}.tp-colv.tp-colv-expanded.tp-colv-cpl .tp-colv_p{overflow:visible}.tp-colv.tp-colv-expanded .tp-colv_p{margin-top:var(--bld-s);opacity:1}.tp-colv .tp-popv{left:calc(-1*var(--cnt-h-p));right:calc(-1*var(--cnt-h-p));top:var(--bld-us)}.tp-colpv_h,.tp-colpv_ap{margin-left:6px;margin-right:6px}.tp-colpv_h{margin-top:var(--bld-s)}.tp-colpv_rgb{display:flex;margin-top:var(--bld-s);width:100%}.tp-colpv_a{display:flex;margin-top:var(--cnt-v-p);padding-top:calc(var(--cnt-v-p) + 2px);position:relative}.tp-colpv_a::before{background-color:var(--grv-fg);content:"";height:2px;left:calc(-1*var(--cnt-h-p));position:absolute;right:calc(-1*var(--cnt-h-p));top:0}.tp-colpv.tp-v-disabled .tp-colpv_a::before{opacity:.5}.tp-colpv_ap{align-items:center;display:flex;flex:3}.tp-colpv_at{flex:1;margin-left:4px}.tp-svpv{border-radius:var(--elm-br);outline:none;overflow:hidden;position:relative}.tp-svpv.tp-v-disabled{opacity:.5}.tp-svpv_c{cursor:crosshair;display:block;height:calc(var(--bld-us)*4);width:100%}.tp-svpv_m{border-radius:100%;border:rgba(255,255,255,.75) solid 2px;box-sizing:border-box;filter:drop-shadow(0 0 1px rgba(0, 0, 0, 0.3));height:12px;margin-left:-6px;margin-top:-6px;pointer-events:none;position:absolute;width:12px}.tp-svpv:focus .tp-svpv_m{border-color:#fff}.tp-hplv{cursor:pointer;height:var(--bld-us);outline:none;position:relative}.tp-hplv.tp-v-disabled{opacity:.5}.tp-hplv_c{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAABCAYAAABubagXAAAAQ0lEQVQoU2P8z8Dwn0GCgQEDi2OK/RBgYHjBgIpfovFh8j8YBIgzFGQxuqEgPhaDOT5gOhPkdCxOZeBg+IDFZZiGAgCaSSMYtcRHLgAAAABJRU5ErkJggg==);background-position:left top;background-repeat:no-repeat;background-size:100% 100%;border-radius:2px;display:block;height:4px;left:0;margin-top:-2px;position:absolute;top:50%;width:100%}.tp-hplv_m{border-radius:var(--elm-br);border:rgba(255,255,255,.75) solid 2px;box-shadow:0 0 2px rgba(0,0,0,.1);box-sizing:border-box;height:12px;left:50%;margin-left:-6px;margin-top:-6px;pointer-events:none;position:absolute;top:50%;width:12px}.tp-hplv:focus .tp-hplv_m{border-color:#fff}.tp-aplv{cursor:pointer;height:var(--bld-us);outline:none;position:relative;width:100%}.tp-aplv.tp-v-disabled{opacity:.5}.tp-aplv_b{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:4px 4px;background-position:0 0,2px 2px;border-radius:2px;display:block;height:4px;left:0;margin-top:-2px;overflow:hidden;position:absolute;top:50%;width:100%}.tp-aplv_c{bottom:0;left:0;position:absolute;right:0;top:0}.tp-aplv_m{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:12px 12px;background-position:0 0,6px 6px;border-radius:var(--elm-br);box-shadow:0 0 2px rgba(0,0,0,.1);height:12px;left:50%;margin-left:-6px;margin-top:-6px;overflow:hidden;pointer-events:none;position:absolute;top:50%;width:12px}.tp-aplv_p{border-radius:var(--elm-br);border:rgba(255,255,255,.75) solid 2px;box-sizing:border-box;bottom:0;left:0;position:absolute;right:0;top:0}.tp-aplv:focus .tp-aplv_p{border-color:#fff}.tp-colswv{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:10px 10px;background-position:0 0,5px 5px;border-radius:var(--elm-br);overflow:hidden}.tp-colswv.tp-v-disabled{opacity:.5}.tp-colswv_sw{border-radius:0}.tp-colswv_b{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:rgba(0,0,0,0);border-width:0;cursor:pointer;display:block;height:var(--bld-us);left:0;margin:0;outline:none;padding:0;position:absolute;top:0;width:var(--bld-us)}.tp-colswv_b:focus::after{border:rgba(255,255,255,.75) solid 2px;border-radius:var(--elm-br);bottom:0;content:"";display:block;left:0;position:absolute;right:0;top:0}.tp-coltxtv{display:flex;width:100%}.tp-coltxtv_m{margin-right:4px}.tp-coltxtv_ms{border-radius:var(--elm-br);color:var(--lbl-fg);cursor:pointer;height:var(--bld-us);line-height:var(--bld-us);padding:0 18px 0 4px}.tp-coltxtv_ms:hover{background-color:var(--in-bg-h)}.tp-coltxtv_ms:focus{background-color:var(--in-bg-f)}.tp-coltxtv_ms:active{background-color:var(--in-bg-a)}.tp-coltxtv_mm{color:var(--lbl-fg)}.tp-coltxtv.tp-v-disabled .tp-coltxtv_mm{opacity:.5}.tp-coltxtv_w{flex:1}.tp-dfwv{position:absolute;top:8px;right:8px;width:256px}.tp-fldv{position:relative}.tp-fldv.tp-fldv-not .tp-fldv_b{display:none}.tp-fldv_t{padding-left:4px}.tp-fldv_b:disabled .tp-fldv_m{display:none}.tp-fldv_c{padding-left:4px}.tp-fldv_i{bottom:0;color:var(--cnt-bg);left:0;overflow:hidden;position:absolute;top:calc(var(--bld-us) + 4px);width:var(--bs-br)}.tp-fldv_i::before{background-color:currentColor;bottom:0;content:"";left:0;position:absolute;top:0;width:4px}.tp-fldv_b:hover+.tp-fldv_i{color:var(--cnt-bg-h)}.tp-fldv_b:focus+.tp-fldv_i{color:var(--cnt-bg-f)}.tp-fldv_b:active+.tp-fldv_i{color:var(--cnt-bg-a)}.tp-fldv.tp-v-disabled>.tp-fldv_i{opacity:.5}.tp-grlv{position:relative}.tp-grlv_g{display:block;height:calc(var(--bld-us)*3)}.tp-grlv_g polyline{fill:none;stroke:var(--mo-fg);stroke-linejoin:round}.tp-grlv_t{margin-top:-4px;transition:left .05s,top .05s;visibility:hidden}.tp-grlv_t.tp-grlv_t-a{visibility:visible}.tp-grlv_t.tp-grlv_t-in{transition:none}.tp-grlv.tp-v-disabled .tp-grlv_g{opacity:.5}.tp-grlv .tp-ttv{background-color:var(--mo-fg)}.tp-grlv .tp-ttv::before{border-top-color:var(--mo-fg)}.tp-lblv{align-items:center;display:flex;line-height:1.3;padding-left:var(--cnt-h-p);padding-right:var(--cnt-h-p)}.tp-lblv.tp-lblv-nol{display:block}.tp-lblv_l{color:var(--lbl-fg);flex:1;-webkit-hyphens:auto;hyphens:auto;overflow:hidden;padding-left:4px;padding-right:16px}.tp-lblv.tp-v-disabled .tp-lblv_l{opacity:.5}.tp-lblv.tp-lblv-nol .tp-lblv_l{display:none}.tp-lblv_v{align-self:flex-start;flex-grow:0;flex-shrink:0;width:160px}.tp-lblv.tp-lblv-nol .tp-lblv_v{width:100%}.tp-lstv_s{padding:0 20px 0 4px;width:100%}.tp-lstv_m{color:var(--btn-fg)}.tp-sglv_i{padding:0 4px}.tp-sglv.tp-v-disabled .tp-sglv_i{opacity:.5}.tp-mllv_i{display:block;height:calc(var(--bld-us)*3);line-height:var(--bld-us);padding:0 4px;resize:none;white-space:pre}.tp-mllv.tp-v-disabled .tp-mllv_i{opacity:.5}.tp-p2dv{position:relative}.tp-p2dv_h{display:flex}.tp-p2dv_b{height:var(--bld-us);margin-right:4px;position:relative;width:var(--bld-us)}.tp-p2dv_b svg{display:block;height:16px;left:50%;margin-left:-8px;margin-top:-8px;position:absolute;top:50%;width:16px}.tp-p2dv_b svg path{stroke:currentColor;stroke-width:2}.tp-p2dv_b svg circle{fill:currentColor}.tp-p2dv_t{flex:1}.tp-p2dv_p{height:0;margin-top:0;opacity:0;overflow:hidden;transition:height .2s ease-in-out,opacity .2s linear,margin .2s ease-in-out}.tp-p2dv.tp-p2dv-expanded .tp-p2dv_p{margin-top:var(--bld-s);opacity:1}.tp-p2dv .tp-popv{left:calc(-1*var(--cnt-h-p));right:calc(-1*var(--cnt-h-p));top:var(--bld-us)}.tp-p2dpv{padding-left:calc(var(--bld-us) + 4px)}.tp-p2dpv_p{cursor:crosshair;height:0;overflow:hidden;padding-bottom:100%;position:relative}.tp-p2dpv.tp-v-disabled .tp-p2dpv_p{opacity:.5}.tp-p2dpv_g{display:block;height:100%;left:0;pointer-events:none;position:absolute;top:0;width:100%}.tp-p2dpv_ax{opacity:.1;stroke:var(--in-fg);stroke-dasharray:1}.tp-p2dpv_l{opacity:.5;stroke:var(--in-fg);stroke-dasharray:1}.tp-p2dpv_m{border:var(--in-fg) solid 1px;border-radius:50%;box-sizing:border-box;height:4px;margin-left:-2px;margin-top:-2px;position:absolute;width:4px}.tp-p2dpv_p:focus .tp-p2dpv_m{background-color:var(--in-fg);border-width:0}.tp-popv{background-color:var(--bs-bg);border-radius:6px;box-shadow:0 2px 4px var(--bs-sh);display:none;max-width:168px;padding:var(--cnt-v-p) var(--cnt-h-p);position:absolute;visibility:hidden;z-index:1000}.tp-popv.tp-popv-v{display:block;visibility:visible}.tp-sprv_r{background-color:var(--grv-fg);border-width:0;display:block;height:2px;margin:0;width:100%}.tp-sprv.tp-v-disabled .tp-sprv_r{opacity:.5}.tp-sldv.tp-v-disabled{opacity:.5}.tp-sldv_t{box-sizing:border-box;cursor:pointer;height:var(--bld-us);margin:0 6px;outline:none;position:relative}.tp-sldv_t::before{background-color:var(--in-bg);border-radius:1px;bottom:0;content:"";display:block;height:2px;left:0;margin:auto;position:absolute;right:0;top:0}.tp-sldv_k{height:100%;left:0;position:absolute;top:0}.tp-sldv_k::before{background-color:var(--in-fg);border-radius:1px;bottom:0;content:"";display:block;height:2px;left:0;margin-bottom:auto;margin-top:auto;position:absolute;right:0;top:0}.tp-sldv_k::after{background-color:var(--btn-bg);border-radius:var(--elm-br);bottom:0;content:"";display:block;height:12px;margin-bottom:auto;margin-top:auto;position:absolute;right:-6px;top:0;width:12px}.tp-sldv_t:hover .tp-sldv_k::after{background-color:var(--btn-bg-h)}.tp-sldv_t:focus .tp-sldv_k::after{background-color:var(--btn-bg-f)}.tp-sldv_t:active .tp-sldv_k::after{background-color:var(--btn-bg-a)}.tp-sldtxtv{display:flex}.tp-sldtxtv_s{flex:2}.tp-sldtxtv_t{flex:1;margin-left:4px}.tp-tabv{position:relative}.tp-tabv_t{align-items:flex-end;color:var(--cnt-bg);display:flex;overflow:hidden;position:relative}.tp-tabv_t:hover{color:var(--cnt-bg-h)}.tp-tabv_t:has(*:focus){color:var(--cnt-bg-f)}.tp-tabv_t:has(*:active){color:var(--cnt-bg-a)}.tp-tabv_t::before{background-color:currentColor;bottom:0;content:"";height:2px;left:0;pointer-events:none;position:absolute;right:0}.tp-tabv.tp-v-disabled .tp-tabv_t::before{opacity:.5}.tp-tabv.tp-tabv-nop .tp-tabv_t{height:calc(var(--bld-us) + 4px);position:relative}.tp-tabv.tp-tabv-nop .tp-tabv_t::before{background-color:var(--cnt-bg);bottom:0;content:"";height:2px;left:0;position:absolute;right:0}.tp-tabv_c{padding-bottom:var(--cnt-v-p);padding-left:4px;padding-top:var(--cnt-v-p)}.tp-tabv_i{bottom:0;color:var(--cnt-bg);left:0;overflow:hidden;position:absolute;top:calc(var(--bld-us) + 4px);width:var(--bs-br)}.tp-tabv_i::before{background-color:currentColor;bottom:0;content:"";left:0;position:absolute;top:0;width:4px}.tp-tabv_t:hover+.tp-tabv_i{color:var(--cnt-bg-h)}.tp-tabv_t:has(*:focus)+.tp-tabv_i{color:var(--cnt-bg-f)}.tp-tabv_t:has(*:active)+.tp-tabv_i{color:var(--cnt-bg-a)}.tp-tabv.tp-v-disabled>.tp-tabv_i{opacity:.5}.tp-tbiv{flex:1;min-width:0;position:relative}.tp-tbiv+.tp-tbiv{margin-left:2px}.tp-tbiv+.tp-tbiv.tp-v-disabled::before{opacity:.5}.tp-tbiv_b{display:block;padding-left:calc(var(--cnt-h-p) + 4px);padding-right:calc(var(--cnt-h-p) + 4px);position:relative;width:100%}.tp-tbiv_b:disabled{opacity:.5}.tp-tbiv_b::before{background-color:var(--cnt-bg);bottom:2px;content:"";left:0;pointer-events:none;position:absolute;right:0;top:0}.tp-tbiv_b:hover::before{background-color:var(--cnt-bg-h)}.tp-tbiv_b:focus::before{background-color:var(--cnt-bg-f)}.tp-tbiv_b:active::before{background-color:var(--cnt-bg-a)}.tp-tbiv_t{color:var(--cnt-fg);height:calc(var(--bld-us) + 4px);line-height:calc(var(--bld-us) + 4px);opacity:.5;overflow:hidden;text-overflow:ellipsis}.tp-tbiv.tp-tbiv-sel .tp-tbiv_t{opacity:1}.tp-txtv{position:relative}.tp-txtv_i{padding:0 4px}.tp-txtv.tp-txtv-fst .tp-txtv_i{border-bottom-right-radius:0;border-top-right-radius:0}.tp-txtv.tp-txtv-mid .tp-txtv_i{border-radius:0}.tp-txtv.tp-txtv-lst .tp-txtv_i{border-bottom-left-radius:0;border-top-left-radius:0}.tp-txtv.tp-txtv-num .tp-txtv_i{text-align:right}.tp-txtv.tp-txtv-drg .tp-txtv_i{opacity:.3}.tp-txtv_k{cursor:pointer;height:100%;left:-3px;position:absolute;top:0;width:12px}.tp-txtv_k::before{background-color:var(--in-fg);border-radius:1px;bottom:0;content:"";height:calc(var(--bld-us) - 4px);left:50%;margin-bottom:auto;margin-left:-1px;margin-top:auto;opacity:.1;position:absolute;top:0;transition:border-radius .1s,height .1s,transform .1s,width .1s;width:2px}.tp-txtv_k:hover::before,.tp-txtv.tp-txtv-drg .tp-txtv_k::before{opacity:1}.tp-txtv.tp-txtv-drg .tp-txtv_k::before{border-radius:50%;height:4px;transform:translateX(-1px);width:4px}.tp-txtv_g{bottom:0;display:block;height:8px;left:50%;margin:auto;overflow:visible;pointer-events:none;position:absolute;top:0;visibility:hidden;width:100%}.tp-txtv.tp-txtv-drg .tp-txtv_g{visibility:visible}.tp-txtv_gb{fill:none;stroke:var(--in-fg);stroke-dasharray:1}.tp-txtv_gh{fill:none;stroke:var(--in-fg)}.tp-txtv .tp-ttv{margin-left:6px;visibility:hidden}.tp-txtv.tp-txtv-drg .tp-ttv{visibility:visible}.tp-ttv{background-color:var(--in-fg);border-radius:var(--elm-br);color:var(--bs-bg);padding:2px 4px;pointer-events:none;position:absolute;transform:translate(-50%, -100%)}.tp-ttv::before{border-color:var(--in-fg) rgba(0,0,0,0) rgba(0,0,0,0) rgba(0,0,0,0);border-style:solid;border-width:2px;box-sizing:border-box;content:"";font-size:.9em;height:4px;left:50%;margin-left:-2px;position:absolute;top:100%;width:4px}.tp-rotv{background-color:var(--bs-bg);border-radius:var(--bs-br);box-shadow:0 2px 4px var(--bs-sh);font-family:var(--font-family);font-size:11px;font-weight:500;line-height:1;text-align:left}.tp-rotv_b{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br);border-top-left-radius:var(--bs-br);border-top-right-radius:var(--bs-br);padding-left:calc(4px + var(--bld-us) + var(--cnt-h-p));text-align:center}.tp-rotv.tp-rotv-expanded .tp-rotv_b{border-bottom-left-radius:0;border-bottom-right-radius:0}.tp-rotv.tp-rotv-not .tp-rotv_b{display:none}.tp-rotv_b:disabled .tp-rotv_m{display:none}.tp-rotv_c>.tp-fldv.tp-v-lst>.tp-fldv_c{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br)}.tp-rotv_c>.tp-fldv.tp-v-lst>.tp-fldv_i{border-bottom-left-radius:var(--bs-br)}.tp-rotv_c>.tp-fldv.tp-v-lst:not(.tp-fldv-expanded)>.tp-fldv_b{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br)}.tp-rotv_c .tp-fldv.tp-v-vlst:not(.tp-fldv-expanded)>.tp-fldv_b{border-bottom-right-radius:var(--bs-br)}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-fldv.tp-v-fst{margin-top:calc(-1*var(--cnt-v-p))}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-fldv.tp-v-fst>.tp-fldv_b{border-top-left-radius:var(--bs-br);border-top-right-radius:var(--bs-br)}.tp-rotv_c>.tp-tabv.tp-v-lst>.tp-tabv_c{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br)}.tp-rotv_c>.tp-tabv.tp-v-lst>.tp-tabv_i{border-bottom-left-radius:var(--bs-br)}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-tabv.tp-v-fst{margin-top:calc(-1*var(--cnt-v-p))}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-tabv.tp-v-fst>.tp-tabv_t{border-top-left-radius:var(--bs-br);border-top-right-radius:var(--bs-br)}.tp-rotv.tp-v-disabled,.tp-rotv .tp-v-disabled{pointer-events:none}.tp-rotv.tp-v-hidden,.tp-rotv .tp-v-hidden{display:none}'),this.pool_.getAll().forEach(s=>{this.embedPluginStyle_(s)}),this.registerPlugin({plugins:[y0,g0,Nr,w0]})}}const S0=new i("3.1.10");t.BladeApi=r,t.ButtonApi=g,t.FolderApi=Ci,t.InputBindingApi=ut,t.ListApi=id,t.MonitorBindingApi=Pt,t.Pane=E0,t.SeparatorApi=je,t.SliderApi=rd,t.TabApi=it,t.TabPageApi=Et,t.TextApi=sd,t.TpChangeEvent=a,t.VERSION=S0,Object.defineProperty(t,"__esModule",{value:!0})})})(hp,hp.exports);const uC=parseInt(ul.replace(/\D+/g,""));var hC=Object.defineProperty,dC=(n,e,t)=>e in n?hC(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t,fC=(n,e,t)=>(dC(n,e+"",t),t);async function dp(n){const e=await n.arrayBuffer(),t=btoa(String.fromCharCode(...new Uint8Array(e)));return`data:${n.type||""};base64,${t}`}let wa,Vc,ls,Ma;function zc(n,e=1/0,t=null){Vc||(Vc=new Ps(2,2,1,1)),ls||(ls=new wn({uniforms:{blitTexture:new $u(n)},vertexShader:`
        varying vec2 vUv;
        void main(){
            vUv = uv;
            gl_Position = vec4(position.xy * 1.0,0.,.999999);
        }
      `,fragmentShader:`
          uniform sampler2D blitTexture; 
          varying vec2 vUv;

          void main(){ 
              gl_FragColor = vec4(vUv.xy, 0, 1);
              
              #ifdef IS_SRGB
              gl_FragColor = LinearTosRGB( texture2D( blitTexture, vUv) );
              #else
              gl_FragColor = texture2D( blitTexture, vUv);
              #endif
          }
      `})),ls.uniforms.blitTexture.value=n,ls.defines.IS_SRGB="colorSpace"in n?n.colorSpace==="srgb":n.encoding===3001,ls.needsUpdate=!0,Ma||(Ma=new gn(Vc,ls),Ma.frustrumCulled=!1);const i=new Ht,r=new fu;r.add(Ma),t||(t=wa=new pg({antialias:!1})),t.setSize(Math.min(n.image.width,e),Math.min(n.image.height,e)),t.clear(),t.render(r,i);const o=new tn(t.domElement);return o.minFilter=n.minFilter,o.magFilter=n.magFilter,o.wrapS=n.wrapS,o.wrapT=n.wrapT,o.name=n.name,wa&&(wa.dispose(),wa=null),o}const fp={POSITION:["byte","byte normalized","unsigned byte","unsigned byte normalized","short","short normalized","unsigned short","unsigned short normalized"],NORMAL:["byte normalized","short normalized"],TANGENT:["byte normalized","short normalized"],TEXCOORD:["byte","byte normalized","unsigned byte","short","short normalized","unsigned short"]};class Sg{constructor(){this.pluginCallbacks=[],this.register(function(e){return new MC(e)}),this.register(function(e){return new EC(e)}),this.register(function(e){return new CC(e)}),this.register(function(e){return new AC(e)}),this.register(function(e){return new PC(e)}),this.register(function(e){return new RC(e)}),this.register(function(e){return new SC(e)}),this.register(function(e){return new TC(e)}),this.register(function(e){return new LC(e)}),this.register(function(e){return new IC(e)}),this.register(function(e){return new DC(e)})}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,i,r){const o=new wC,a=[];for(let c=0,h=this.pluginCallbacks.length;c<h;c++)a.push(this.pluginCallbacks[c](o));o.setPlugins(a),o.write(e,t,r).catch(i)}parseAsync(e,t){const i=this;return new Promise(function(r,o){i.parse(e,r,o,t)})}}fC(Sg,"Utils",{insertKeyframe:function(n,e){const t=n.getValueSize(),i=new n.TimeBufferType(n.times.length+1),r=new n.ValueBufferType(n.values.length+t),o=n.createInterpolant(new n.ValueBufferType(t));let a;if(n.times.length===0){i[0]=e;for(let c=0;c<t;c++)r[c]=0;a=0}else if(e<n.times[0]){if(Math.abs(n.times[0]-e)<.001)return 0;i[0]=e,i.set(n.times,1),r.set(o.evaluate(e),0),r.set(n.values,t),a=0}else if(e>n.times[n.times.length-1]){if(Math.abs(n.times[n.times.length-1]-e)<.001)return n.times.length-1;i[i.length-1]=e,i.set(n.times,0),r.set(n.values,0),r.set(o.evaluate(e),n.values.length),a=i.length-1}else for(let c=0;c<n.times.length;c++){if(Math.abs(n.times[c]-e)<.001)return c;if(n.times[c]<e&&n.times[c+1]>e){i.set(n.times.slice(0,c+1),0),i[c+1]=e,i.set(n.times.slice(c+1),c+2),r.set(n.values.slice(0,(c+1)*t),0),r.set(o.evaluate(e),(c+1)*t),r.set(n.values.slice((c+1)*t),(c+2)*t),a=c+1;break}}return n.times=i,n.values=r,a},mergeMorphTargetTracks:function(n,e){const t=[],i={},r=n.tracks;for(let o=0;o<r.length;++o){let a=r[o];const c=mt.parseTrackName(a.name),h=mt.findNode(e,c.nodeName);if(c.propertyName!=="morphTargetInfluences"||c.propertyIndex===void 0){t.push(a);continue}if(a.createInterpolant!==a.InterpolantFactoryMethodDiscrete&&a.createInterpolant!==a.InterpolantFactoryMethodLinear){if(a.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline)throw new Error("THREE.GLTFExporter: Cannot merge tracks with glTF CUBICSPLINE interpolation.");console.warn("THREE.GLTFExporter: Morph target interpolation mode not yet supported. Using LINEAR instead."),a=a.clone(),a.setInterpolation(By)}const d=h.morphTargetInfluences.length,f=h.morphTargetDictionary[c.propertyIndex];if(f===void 0)throw new Error("THREE.GLTFExporter: Morph target name not found: "+c.propertyIndex);let m;if(i[h.uuid]===void 0){m=a.clone();const x=new m.ValueBufferType(d*m.times.length);for(let y=0;y<m.times.length;y++)x[y*d+f]=m.values[y];m.name=(c.nodeName||"")+".morphTargetInfluences",m.values=x,i[h.uuid]=m,t.push(m);continue}const _=a.createInterpolant(new a.ValueBufferType(1));m=i[h.uuid];for(let x=0;x<m.times.length;x++)m.values[x*d+f]=_.evaluate(m.times[x]);for(let x=0;x<a.times.length;x++){const y=this.insertKeyframe(m,a.times[x]);m.values[y*d+f]=a.values[x]}}return n.tracks=t,n}});const ht={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,BYTE:5120,UNSIGNED_BYTE:5121,SHORT:5122,UNSIGNED_SHORT:5123,INT:5124,UNSIGNED_INT:5125,FLOAT:5126,ARRAY_BUFFER:34962,ELEMENT_ARRAY_BUFFER:34963,NEAREST:9728,LINEAR:9729,NEAREST_MIPMAP_NEAREST:9984,LINEAR_MIPMAP_NEAREST:9985,NEAREST_MIPMAP_LINEAR:9986,LINEAR_MIPMAP_LINEAR:9987,CLAMP_TO_EDGE:33071,MIRRORED_REPEAT:33648,REPEAT:10497},Hc="KHR_mesh_quantization",Pn={};Pn[$t]=ht.NEAREST;Pn[au]=ht.NEAREST_MIPMAP_NEAREST;Pn[Pa]=ht.NEAREST_MIPMAP_LINEAR;Pn[Cn]=ht.LINEAR;Pn[Fm]=ht.LINEAR_MIPMAP_NEAREST;Pn[Es]=ht.LINEAR_MIPMAP_LINEAR;Pn[Bn]=ht.CLAMP_TO_EDGE;Pn[Ga]=ht.REPEAT;Pn[Wa]=ht.MIRRORED_REPEAT;const pp={scale:"scale",position:"translation",quaternion:"rotation",morphTargetInfluences:"weights"},pC=new lt,mp=12,mC=1179937895,gC=2,gp=8,vC=1313821514,_C=5130562;function to(n,e){return n.length===e.length&&n.every(function(t,i){return t===e[i]})}function xC(n){return new TextEncoder().encode(n).buffer}function bC(n){return to(n.elements,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}function yC(n,e,t){const i={min:new Array(n.itemSize).fill(Number.POSITIVE_INFINITY),max:new Array(n.itemSize).fill(Number.NEGATIVE_INFINITY)};for(let r=e;r<e+t;r++)for(let o=0;o<n.itemSize;o++){let a;n.itemSize>4?a=n.array[r*n.itemSize+o]:(o===0?a=n.getX(r):o===1?a=n.getY(r):o===2?a=n.getZ(r):o===3&&(a=n.getW(r)),n.normalized===!0&&(a=hu.normalize(a,n.array))),i.min[o]=Math.min(i.min[o],a),i.max[o]=Math.max(i.max[o],a)}return i}function Tg(n){return Math.ceil(n/4)*4}function Gc(n,e=0){const t=Tg(n.byteLength);if(t!==n.byteLength){const i=new Uint8Array(t);if(i.set(new Uint8Array(n)),e!==0)for(let r=n.byteLength;r<t;r++)i[r]=e;return i.buffer}return n}function vp(){return typeof document>"u"&&typeof OffscreenCanvas<"u"?new OffscreenCanvas(1,1):document.createElement("canvas")}function _p(n,e){if(n.toBlob!==void 0)return new Promise(i=>n.toBlob(i,e));let t;return e==="image/jpeg"?t=.92:e==="image/webp"&&(t=.8),n.convertToBlob({type:e,quality:t})}class wC{constructor(){this.plugins=[],this.options={},this.pending=[],this.buffers=[],this.byteOffset=0,this.buffers=[],this.nodeMap=new Map,this.skins=[],this.extensionsUsed={},this.extensionsRequired={},this.uids=new Map,this.uid=0,this.json={asset:{version:"2.0",generator:"THREE.GLTFExporter"}},this.cache={meshes:new Map,attributes:new Map,attributesNormalized:new Map,materials:new Map,textures:new Map,images:new Map}}setPlugins(e){this.plugins=e}async write(e,t,i={}){this.options=Object.assign({binary:!1,trs:!1,onlyVisible:!0,maxTextureSize:1/0,animations:[],includeCustomExtensions:!1},i),this.options.animations.length>0&&(this.options.trs=!0),this.processInput(e),await Promise.all(this.pending);const r=this,o=r.buffers,a=r.json;i=r.options;const c=r.extensionsUsed,h=r.extensionsRequired,d=new Blob(o,{type:"application/octet-stream"}),f=Object.keys(c),m=Object.keys(h);f.length>0&&(a.extensionsUsed=f),m.length>0&&(a.extensionsRequired=m),a.buffers&&a.buffers.length>0&&(a.buffers[0].byteLength=d.size),i.binary===!0?d.arrayBuffer().then(_=>{const x=Gc(_),y=new DataView(new ArrayBuffer(gp));y.setUint32(0,x.byteLength,!0),y.setUint32(4,_C,!0);const w=Gc(xC(JSON.stringify(a)),32),v=new DataView(new ArrayBuffer(gp));v.setUint32(0,w.byteLength,!0),v.setUint32(4,vC,!0);const g=new ArrayBuffer(mp),R=new DataView(g);R.setUint32(0,mC,!0),R.setUint32(4,gC,!0);const E=mp+v.byteLength+w.byteLength+y.byteLength+x.byteLength;R.setUint32(8,E,!0),new Blob([g,v,w,y,x],{type:"application/octet-stream"}).arrayBuffer().then(t)}):a.buffers&&a.buffers.length>0?dp(d).then(_=>{a.buffers[0].uri=_,t(a)}):t(a)}serializeUserData(e,t){if(Object.keys(e.userData).length===0)return;const i=this.options,r=this.extensionsUsed;try{const o=JSON.parse(JSON.stringify(e.userData));if(i.includeCustomExtensions&&o.gltfExtensions){t.extensions===void 0&&(t.extensions={});for(const a in o.gltfExtensions)t.extensions[a]=o.gltfExtensions[a],r[a]=!0;delete o.gltfExtensions}Object.keys(o).length>0&&(t.extras=o)}catch(o){console.warn("THREE.GLTFExporter: userData of '"+e.name+"' won't be serialized because of JSON.stringify error - "+o.message)}}getUID(e,t=!1){if(this.uids.has(e)===!1){const i=new Map;i.set(!0,this.uid++),i.set(!1,this.uid++),this.uids.set(e,i)}return this.uids.get(e).get(t)}isNormalizedNormalAttribute(e){if(this.cache.attributesNormalized.has(e))return!1;const t=new $;for(let i=0,r=e.count;i<r;i++)if(Math.abs(t.fromBufferAttribute(e,i).length()-1)>5e-4)return!1;return!0}createNormalizedNormalAttribute(e){const t=this.cache;if(t.attributesNormalized.has(e))return t.attributesNormalized.get(e);const i=e.clone(),r=new $;for(let o=0,a=i.count;o<a;o++)r.fromBufferAttribute(i,o),r.x===0&&r.y===0&&r.z===0?r.setX(1):r.normalize(),i.setXYZ(o,r.x,r.y,r.z);return t.attributesNormalized.set(e,i),i}applyTextureTransform(e,t){let i=!1;const r={};(t.offset.x!==0||t.offset.y!==0)&&(r.offset=t.offset.toArray(),i=!0),t.rotation!==0&&(r.rotation=t.rotation,i=!0),(t.repeat.x!==1||t.repeat.y!==1)&&(r.scale=t.repeat.toArray(),i=!0),i&&(e.extensions=e.extensions||{},e.extensions.KHR_texture_transform=r,this.extensionsUsed.KHR_texture_transform=!0)}buildMetalRoughTexture(e,t){if(e===t)return e;function i(_){return("colorSpace"in _?_.colorSpace==="srgb":_.encoding===3001)?function(x){return x<.04045?x*.0773993808:Math.pow(x*.9478672986+.0521327014,2.4)}:function(x){return x}}console.warn("THREE.GLTFExporter: Merged metalnessMap and roughnessMap textures."),e instanceof Uc&&(e=zc(e)),t instanceof Uc&&(t=zc(t));const r=e?e.image:null,o=t?t.image:null,a=Math.max(r?r.width:0,o?o.width:0),c=Math.max(r?r.height:0,o?o.height:0),h=vp();h.width=a,h.height=c;const d=h.getContext("2d");d.fillStyle="#00ffff",d.fillRect(0,0,a,c);const f=d.getImageData(0,0,a,c);if(r){d.drawImage(r,0,0,a,c);const _=i(e),x=d.getImageData(0,0,a,c).data;for(let y=2;y<x.length;y+=4)f.data[y]=_(x[y]/256)*256}if(o){d.drawImage(o,0,0,a,c);const _=i(t),x=d.getImageData(0,0,a,c).data;for(let y=1;y<x.length;y+=4)f.data[y]=_(x[y]/256)*256}d.putImageData(f,0,0);const m=(e||t).clone();return m.source=new tn(h).source,"colorSpace"in m?m.colorSpace="":m.encoding=3e3,m.channel=(e||t).channel,e&&t&&e.channel!==t.channel&&console.warn("THREE.GLTFExporter: UV channels for metalnessMap and roughnessMap textures must match."),m}processBuffer(e){const t=this.json,i=this.buffers;return t.buffers||(t.buffers=[{byteLength:0}]),i.push(e),0}processBufferView(e,t,i,r,o){const a=this.json;a.bufferViews||(a.bufferViews=[]);let c;switch(t){case ht.BYTE:case ht.UNSIGNED_BYTE:c=1;break;case ht.SHORT:case ht.UNSIGNED_SHORT:c=2;break;default:c=4}const h=Tg(r*e.itemSize*c),d=new DataView(new ArrayBuffer(h));let f=0;for(let _=i;_<i+r;_++)for(let x=0;x<e.itemSize;x++){let y;e.itemSize>4?y=e.array[_*e.itemSize+x]:(x===0?y=e.getX(_):x===1?y=e.getY(_):x===2?y=e.getZ(_):x===3&&(y=e.getW(_)),e.normalized===!0&&(y=hu.normalize(y,e.array))),t===ht.FLOAT?d.setFloat32(f,y,!0):t===ht.INT?d.setInt32(f,y,!0):t===ht.UNSIGNED_INT?d.setUint32(f,y,!0):t===ht.SHORT?d.setInt16(f,y,!0):t===ht.UNSIGNED_SHORT?d.setUint16(f,y,!0):t===ht.BYTE?d.setInt8(f,y):t===ht.UNSIGNED_BYTE&&d.setUint8(f,y),f+=c}const m={buffer:this.processBuffer(d.buffer),byteOffset:this.byteOffset,byteLength:h};return o!==void 0&&(m.target=o),o===ht.ARRAY_BUFFER&&(m.byteStride=e.itemSize*c),this.byteOffset+=h,a.bufferViews.push(m),{id:a.bufferViews.length-1,byteLength:0}}processBufferViewImage(e){const t=this,i=t.json;return i.bufferViews||(i.bufferViews=[]),e.arrayBuffer().then(r=>{const o=Gc(r),a={buffer:t.processBuffer(o),byteOffset:t.byteOffset,byteLength:o.byteLength};return t.byteOffset+=o.byteLength,i.bufferViews.push(a)-1})}processAccessor(e,t,i,r){const o=this.json,a={1:"SCALAR",2:"VEC2",3:"VEC3",4:"VEC4",9:"MAT3",16:"MAT4"};let c;if(e.array.constructor===Float32Array)c=ht.FLOAT;else if(e.array.constructor===Int32Array)c=ht.INT;else if(e.array.constructor===Uint32Array)c=ht.UNSIGNED_INT;else if(e.array.constructor===Int16Array)c=ht.SHORT;else if(e.array.constructor===Uint16Array)c=ht.UNSIGNED_SHORT;else if(e.array.constructor===Int8Array)c=ht.BYTE;else if(e.array.constructor===Uint8Array)c=ht.UNSIGNED_BYTE;else throw new Error("THREE.GLTFExporter: Unsupported bufferAttribute component type: "+e.array.constructor.name);if(i===void 0&&(i=0),r===void 0&&(r=e.count),r===0)return null;const h=yC(e,i,r);let d;t!==void 0&&(d=e===t.index?ht.ELEMENT_ARRAY_BUFFER:ht.ARRAY_BUFFER);const f=this.processBufferView(e,c,i,r,d),m={bufferView:f.id,byteOffset:f.byteOffset,componentType:c,count:r,max:h.max,min:h.min,type:a[e.itemSize]};return e.normalized===!0&&(m.normalized=!0),o.accessors||(o.accessors=[]),o.accessors.push(m)-1}processImage(e,t,i,r="image/png"){if(e!==null){const o=this,a=o.cache,c=o.json,h=o.options,d=o.pending;a.images.has(e)||a.images.set(e,{});const f=a.images.get(e),m=r+":flipY/"+i.toString();if(f[m]!==void 0)return f[m];c.images||(c.images=[]);const _={mimeType:r},x=vp();x.width=Math.min(e.width,h.maxTextureSize),x.height=Math.min(e.height,h.maxTextureSize);const y=x.getContext("2d");if(i===!0&&(y.translate(0,x.height),y.scale(1,-1)),e.data!==void 0){t!==kn&&console.error("GLTFExporter: Only RGBAFormat is supported.",t),(e.width>h.maxTextureSize||e.height>h.maxTextureSize)&&console.warn("GLTFExporter: Image size is bigger than maxTextureSize",e);const v=new Uint8ClampedArray(e.height*e.width*4);for(let g=0;g<v.length;g+=4)v[g+0]=e.data[g+0],v[g+1]=e.data[g+1],v[g+2]=e.data[g+2],v[g+3]=e.data[g+3];y.putImageData(new ImageData(v,e.width,e.height),0,0)}else y.drawImage(e,0,0,x.width,x.height);h.binary===!0?d.push(_p(x,r).then(v=>o.processBufferViewImage(v)).then(v=>{_.bufferView=v})):x.toDataURL!==void 0?_.uri=x.toDataURL(r):d.push(_p(x,r).then(dp).then(v=>{_.uri=v}));const w=c.images.push(_)-1;return f[m]=w,w}else throw new Error("THREE.GLTFExporter: No valid image data found. Unable to process texture.")}processSampler(e){const t=this.json;t.samplers||(t.samplers=[]);const i={magFilter:Pn[e.magFilter],minFilter:Pn[e.minFilter],wrapS:Pn[e.wrapS],wrapT:Pn[e.wrapT]};return t.samplers.push(i)-1}processTexture(e){const t=this.options,i=this.cache,r=this.json;if(i.textures.has(e))return i.textures.get(e);r.textures||(r.textures=[]),e instanceof Uc&&(e=zc(e,t.maxTextureSize));let o=e.userData.mimeType;o==="image/webp"&&(o="image/png");const a={sampler:this.processSampler(e),source:this.processImage(e.image,e.format,e.flipY,o)};e.name&&(a.name=e.name),this._invokeAll(function(h){h.writeTexture&&h.writeTexture(e,a)});const c=r.textures.push(a)-1;return i.textures.set(e,c),c}processMaterial(e){const t=this.cache,i=this.json;if(t.materials.has(e))return t.materials.get(e);if(e.isShaderMaterial)return console.warn("GLTFExporter: THREE.ShaderMaterial not supported."),null;i.materials||(i.materials=[]);const r={pbrMetallicRoughness:{}};e.isMeshStandardMaterial!==!0&&e.isMeshBasicMaterial!==!0&&console.warn("GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.");const o=e.color.toArray().concat([e.opacity]);if(to(o,[1,1,1,1])||(r.pbrMetallicRoughness.baseColorFactor=o),e.isMeshStandardMaterial?(r.pbrMetallicRoughness.metallicFactor=e.metalness,r.pbrMetallicRoughness.roughnessFactor=e.roughness):(r.pbrMetallicRoughness.metallicFactor=.5,r.pbrMetallicRoughness.roughnessFactor=.5),e.metalnessMap||e.roughnessMap){const c=this.buildMetalRoughTexture(e.metalnessMap,e.roughnessMap),h={index:this.processTexture(c),channel:c.channel};this.applyTextureTransform(h,c),r.pbrMetallicRoughness.metallicRoughnessTexture=h}if(e.map){const c={index:this.processTexture(e.map),texCoord:e.map.channel};this.applyTextureTransform(c,e.map),r.pbrMetallicRoughness.baseColorTexture=c}if(e.emissive){const c=e.emissive;if(Math.max(c.r,c.g,c.b)>0&&(r.emissiveFactor=e.emissive.toArray()),e.emissiveMap){const h={index:this.processTexture(e.emissiveMap),texCoord:e.emissiveMap.channel};this.applyTextureTransform(h,e.emissiveMap),r.emissiveTexture=h}}if(e.normalMap){const c={index:this.processTexture(e.normalMap),texCoord:e.normalMap.channel};e.normalScale&&e.normalScale.x!==1&&(c.scale=e.normalScale.x),this.applyTextureTransform(c,e.normalMap),r.normalTexture=c}if(e.aoMap){const c={index:this.processTexture(e.aoMap),texCoord:e.aoMap.channel};e.aoMapIntensity!==1&&(c.strength=e.aoMapIntensity),this.applyTextureTransform(c,e.aoMap),r.occlusionTexture=c}e.transparent?r.alphaMode="BLEND":e.alphaTest>0&&(r.alphaMode="MASK",r.alphaCutoff=e.alphaTest),e.side===Fn&&(r.doubleSided=!0),e.name!==""&&(r.name=e.name),this.serializeUserData(e,r),this._invokeAll(function(c){c.writeMaterial&&c.writeMaterial(e,r)});const a=i.materials.push(r)-1;return t.materials.set(e,a),a}processMesh(e){const t=this.cache,i=this.json,r=[e.geometry.uuid];if(Array.isArray(e.material))for(let E=0,S=e.material.length;E<S;E++)r.push(e.material[E].uuid);else r.push(e.material.uuid);const o=r.join(":");if(t.meshes.has(o))return t.meshes.get(o);const a=e.geometry;let c;e.isLineSegments?c=ht.LINES:e.isLineLoop?c=ht.LINE_LOOP:e.isLine?c=ht.LINE_STRIP:e.isPoints?c=ht.POINTS:c=e.material.wireframe?ht.LINES:ht.TRIANGLES;const h={},d={},f=[],m=[],_={...uC>=152?{uv:"TEXCOORD_0",uv1:"TEXCOORD_1",uv2:"TEXCOORD_2",uv3:"TEXCOORD_3"}:{uv:"TEXCOORD_0",uv2:"TEXCOORD_1"},color:"COLOR_0",skinWeight:"WEIGHTS_0",skinIndex:"JOINTS_0"},x=a.getAttribute("normal");x!==void 0&&!this.isNormalizedNormalAttribute(x)&&(console.warn("THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one."),a.setAttribute("normal",this.createNormalizedNormalAttribute(x)));let y=null;for(let E in a.attributes){if(E.slice(0,5)==="morph")continue;const S=a.attributes[E];if(E=_[E]||E.toUpperCase(),/^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/.test(E)||(E="_"+E),t.attributes.has(this.getUID(S))){d[E]=t.attributes.get(this.getUID(S));continue}y=null;const F=S.array;E==="JOINTS_0"&&!(F instanceof Uint16Array)&&!(F instanceof Uint8Array)&&(console.warn('GLTFExporter: Attribute "skinIndex" converted to type UNSIGNED_SHORT.'),y=new mn(new Uint16Array(F),S.itemSize,S.normalized));const L=this.processAccessor(y||S,a);L!==null&&(E.startsWith("_")||this.detectMeshQuantization(E,S),d[E]=L,t.attributes.set(this.getUID(S),L))}if(x!==void 0&&a.setAttribute("normal",x),Object.keys(d).length===0)return null;if(e.morphTargetInfluences!==void 0&&e.morphTargetInfluences.length>0){const E=[],S=[],F={};if(e.morphTargetDictionary!==void 0)for(const L in e.morphTargetDictionary)F[e.morphTargetDictionary[L]]=L;for(let L=0;L<e.morphTargetInfluences.length;++L){const I={};let P=!1;for(const M in a.morphAttributes){if(M!=="position"&&M!=="normal"){P||(console.warn("GLTFExporter: Only POSITION and NORMAL morph are supported."),P=!0);continue}const b=a.morphAttributes[M][L],N=M.toUpperCase(),H=a.attributes[M];if(t.attributes.has(this.getUID(b,!0))){I[N]=t.attributes.get(this.getUID(b,!0));continue}const ae=b.clone();if(!a.morphTargetsRelative)for(let V=0,J=b.count;V<J;V++)for(let q=0;q<b.itemSize;q++)q===0&&ae.setX(V,b.getX(V)-H.getX(V)),q===1&&ae.setY(V,b.getY(V)-H.getY(V)),q===2&&ae.setZ(V,b.getZ(V)-H.getZ(V)),q===3&&ae.setW(V,b.getW(V)-H.getW(V));I[N]=this.processAccessor(ae,a),t.attributes.set(this.getUID(H,!0),I[N])}m.push(I),E.push(e.morphTargetInfluences[L]),e.morphTargetDictionary!==void 0&&S.push(F[L])}h.weights=E,S.length>0&&(h.extras={},h.extras.targetNames=S)}const w=Array.isArray(e.material);if(w&&a.groups.length===0)return null;const v=w?e.material:[e.material],g=w?a.groups:[{materialIndex:0,start:void 0,count:void 0}];for(let E=0,S=g.length;E<S;E++){const F={mode:c,attributes:d};if(this.serializeUserData(a,F),m.length>0&&(F.targets=m),a.index!==null){let I=this.getUID(a.index);(g[E].start!==void 0||g[E].count!==void 0)&&(I+=":"+g[E].start+":"+g[E].count),t.attributes.has(I)?F.indices=t.attributes.get(I):(F.indices=this.processAccessor(a.index,a,g[E].start,g[E].count),t.attributes.set(I,F.indices)),F.indices===null&&delete F.indices}const L=this.processMaterial(v[g[E].materialIndex]);L!==null&&(F.material=L),f.push(F)}h.primitives=f,i.meshes||(i.meshes=[]),this._invokeAll(function(E){E.writeMesh&&E.writeMesh(e,h)});const R=i.meshes.push(h)-1;return t.meshes.set(o,R),R}detectMeshQuantization(e,t){if(this.extensionsUsed[Hc])return;let i;switch(t.array.constructor){case Int8Array:i="byte";break;case Uint8Array:i="unsigned byte";break;case Int16Array:i="short";break;case Uint16Array:i="unsigned short";break;default:return}t.normalized&&(i+=" normalized");const r=e.split("_",1)[0];fp[r]&&fp[r].includes(i)&&(this.extensionsUsed[Hc]=!0,this.extensionsRequired[Hc]=!0)}processCamera(e){const t=this.json;t.cameras||(t.cameras=[]);const i=e.isOrthographicCamera,r={type:i?"orthographic":"perspective"};return i?r.orthographic={xmag:e.right*2,ymag:e.top*2,zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near}:r.perspective={aspectRatio:e.aspect,yfov:hu.degToRad(e.fov),zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near},e.name!==""&&(r.name=e.type),t.cameras.push(r)-1}processAnimation(e,t){const i=this.json,r=this.nodeMap;i.animations||(i.animations=[]),e=Sg.Utils.mergeMorphTargetTracks(e.clone(),t);const o=e.tracks,a=[],c=[];for(let h=0;h<o.length;++h){const d=o[h],f=mt.parseTrackName(d.name);let m=mt.findNode(t,f.nodeName);const _=pp[f.propertyName];if(f.objectName==="bones"&&(m.isSkinnedMesh===!0?m=m.skeleton.getBoneByName(f.objectIndex):m=void 0),!m||!_)return console.warn('THREE.GLTFExporter: Could not export animation track "%s".',d.name),null;const x=1;let y=d.values.length/d.times.length;_===pp.morphTargetInfluences&&(y/=m.morphTargetInfluences.length);let w;d.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline===!0?(w="CUBICSPLINE",y/=3):d.getInterpolation()===Fy?w="STEP":w="LINEAR",c.push({input:this.processAccessor(new mn(d.times,x)),output:this.processAccessor(new mn(d.values,y)),interpolation:w}),a.push({sampler:c.length-1,target:{node:r.get(m),path:_}})}return i.animations.push({name:e.name||"clip_"+i.animations.length,samplers:c,channels:a}),i.animations.length-1}processSkin(e){const t=this.json,i=this.nodeMap,r=t.nodes[i.get(e)],o=e.skeleton;if(o===void 0)return null;const a=e.skeleton.bones[0];if(a===void 0)return null;const c=[],h=new Float32Array(o.bones.length*16),d=new Ut;for(let f=0;f<o.bones.length;++f)c.push(i.get(o.bones[f])),d.copy(o.boneInverses[f]),d.multiply(e.bindMatrix).toArray(h,f*16);return t.skins===void 0&&(t.skins=[]),t.skins.push({inverseBindMatrices:this.processAccessor(new mn(h,16)),joints:c,skeleton:i.get(a)}),r.skin=t.skins.length-1}processNode(e){const t=this.json,i=this.options,r=this.nodeMap;t.nodes||(t.nodes=[]);const o={};if(i.trs){const c=e.quaternion.toArray(),h=e.position.toArray(),d=e.scale.toArray();to(c,[0,0,0,1])||(o.rotation=c),to(h,[0,0,0])||(o.translation=h),to(d,[1,1,1])||(o.scale=d)}else e.matrixAutoUpdate&&e.updateMatrix(),bC(e.matrix)===!1&&(o.matrix=e.matrix.elements);if(e.name!==""&&(o.name=String(e.name)),this.serializeUserData(e,o),e.isMesh||e.isLine||e.isPoints){const c=this.processMesh(e);c!==null&&(o.mesh=c)}else e.isCamera&&(o.camera=this.processCamera(e));if(e.isSkinnedMesh&&this.skins.push(e),e.children.length>0){const c=[];for(let h=0,d=e.children.length;h<d;h++){const f=e.children[h];if(f.visible||i.onlyVisible===!1){const m=this.processNode(f);m!==null&&c.push(m)}}c.length>0&&(o.children=c)}this._invokeAll(function(c){c.writeNode&&c.writeNode(e,o)});const a=t.nodes.push(o)-1;return r.set(e,a),a}processScene(e){const t=this.json,i=this.options;t.scenes||(t.scenes=[],t.scene=0);const r={};e.name!==""&&(r.name=e.name),t.scenes.push(r);const o=[];for(let a=0,c=e.children.length;a<c;a++){const h=e.children[a];if(h.visible||i.onlyVisible===!1){const d=this.processNode(h);d!==null&&o.push(d)}}o.length>0&&(r.nodes=o),this.serializeUserData(e,r)}processObjects(e){const t=new fu;t.name="AuxScene";for(let i=0;i<e.length;i++)t.children.push(e[i]);this.processScene(t)}processInput(e){const t=this.options;e=e instanceof Array?e:[e],this._invokeAll(function(r){r.beforeParse&&r.beforeParse(e)});const i=[];for(let r=0;r<e.length;r++)e[r]instanceof fu?this.processScene(e[r]):i.push(e[r]);i.length>0&&this.processObjects(i);for(let r=0;r<this.skins.length;++r)this.processSkin(this.skins[r]);for(let r=0;r<t.animations.length;++r)this.processAnimation(t.animations[r],e[0]);this._invokeAll(function(r){r.afterParse&&r.afterParse(e)})}_invokeAll(e){for(let t=0,i=this.plugins.length;t<i;t++)e(this.plugins[t])}}class MC{constructor(e){this.writer=e,this.name="KHR_lights_punctual"}writeNode(e,t){if(!e.isLight)return;if(!e.isDirectionalLight&&!e.isPointLight&&!e.isSpotLight){console.warn("THREE.GLTFExporter: Only directional, point, and spot lights are supported.",e);return}const i=this.writer,r=i.json,o=i.extensionsUsed,a={};e.name&&(a.name=e.name),a.color=e.color.toArray(),a.intensity=e.intensity,e.isDirectionalLight?a.type="directional":e.isPointLight?(a.type="point",e.distance>0&&(a.range=e.distance)):e.isSpotLight&&(a.type="spot",e.distance>0&&(a.range=e.distance),a.spot={},a.spot.innerConeAngle=(e.penumbra-1)*e.angle*-1,a.spot.outerConeAngle=e.angle),e.decay!==void 0&&e.decay!==2&&console.warn("THREE.GLTFExporter: Light decay may be lost. glTF is physically-based, and expects light.decay=2."),e.target&&(e.target.parent!==e||e.target.position.x!==0||e.target.position.y!==0||e.target.position.z!==-1)&&console.warn("THREE.GLTFExporter: Light direction may be lost. For best results, make light.target a child of the light with position 0,0,-1."),o[this.name]||(r.extensions=r.extensions||{},r.extensions[this.name]={lights:[]},o[this.name]=!0);const c=r.extensions[this.name].lights;c.push(a),t.extensions=t.extensions||{},t.extensions[this.name]={light:c.length-1}}}let EC=class{constructor(n){this.writer=n,this.name="KHR_materials_unlit"}writeMaterial(n,e){if(!n.isMeshBasicMaterial)return;const t=this.writer.extensionsUsed;e.extensions=e.extensions||{},e.extensions[this.name]={},t[this.name]=!0,e.pbrMetallicRoughness.metallicFactor=0,e.pbrMetallicRoughness.roughnessFactor=.9}},SC=class{constructor(n){this.writer=n,this.name="KHR_materials_clearcoat"}writeMaterial(n,e){if(!n.isMeshPhysicalMaterial||n.clearcoat===0)return;const t=this.writer,i=t.extensionsUsed,r={};if(r.clearcoatFactor=n.clearcoat,n.clearcoatMap){const o={index:t.processTexture(n.clearcoatMap),texCoord:n.clearcoatMap.channel};t.applyTextureTransform(o,n.clearcoatMap),r.clearcoatTexture=o}if(r.clearcoatRoughnessFactor=n.clearcoatRoughness,n.clearcoatRoughnessMap){const o={index:t.processTexture(n.clearcoatRoughnessMap),texCoord:n.clearcoatRoughnessMap.channel};t.applyTextureTransform(o,n.clearcoatRoughnessMap),r.clearcoatRoughnessTexture=o}if(n.clearcoatNormalMap){const o={index:t.processTexture(n.clearcoatNormalMap),texCoord:n.clearcoatNormalMap.channel};t.applyTextureTransform(o,n.clearcoatNormalMap),r.clearcoatNormalTexture=o}e.extensions=e.extensions||{},e.extensions[this.name]=r,i[this.name]=!0}},TC=class{constructor(n){this.writer=n,this.name="KHR_materials_iridescence"}writeMaterial(n,e){if(!n.isMeshPhysicalMaterial||n.iridescence===0)return;const t=this.writer,i=t.extensionsUsed,r={};if(r.iridescenceFactor=n.iridescence,n.iridescenceMap){const o={index:t.processTexture(n.iridescenceMap),texCoord:n.iridescenceMap.channel};t.applyTextureTransform(o,n.iridescenceMap),r.iridescenceTexture=o}if(r.iridescenceIor=n.iridescenceIOR,r.iridescenceThicknessMinimum=n.iridescenceThicknessRange[0],r.iridescenceThicknessMaximum=n.iridescenceThicknessRange[1],n.iridescenceThicknessMap){const o={index:t.processTexture(n.iridescenceThicknessMap),texCoord:n.iridescenceThicknessMap.channel};t.applyTextureTransform(o,n.iridescenceThicknessMap),r.iridescenceThicknessTexture=o}e.extensions=e.extensions||{},e.extensions[this.name]=r,i[this.name]=!0}},CC=class{constructor(n){this.writer=n,this.name="KHR_materials_transmission"}writeMaterial(n,e){if(!n.isMeshPhysicalMaterial||n.transmission===0)return;const t=this.writer,i=t.extensionsUsed,r={};if(r.transmissionFactor=n.transmission,n.transmissionMap){const o={index:t.processTexture(n.transmissionMap),texCoord:n.transmissionMap.channel};t.applyTextureTransform(o,n.transmissionMap),r.transmissionTexture=o}e.extensions=e.extensions||{},e.extensions[this.name]=r,i[this.name]=!0}},AC=class{constructor(n){this.writer=n,this.name="KHR_materials_volume"}writeMaterial(n,e){if(!n.isMeshPhysicalMaterial||n.transmission===0)return;const t=this.writer,i=t.extensionsUsed,r={};if(r.thicknessFactor=n.thickness,n.thicknessMap){const o={index:t.processTexture(n.thicknessMap),texCoord:n.thicknessMap.channel};t.applyTextureTransform(o,n.thicknessMap),r.thicknessTexture=o}r.attenuationDistance=n.attenuationDistance,r.attenuationColor=n.attenuationColor.toArray(),e.extensions=e.extensions||{},e.extensions[this.name]=r,i[this.name]=!0}},PC=class{constructor(n){this.writer=n,this.name="KHR_materials_ior"}writeMaterial(n,e){if(!n.isMeshPhysicalMaterial||n.ior===1.5)return;const t=this.writer.extensionsUsed,i={};i.ior=n.ior,e.extensions=e.extensions||{},e.extensions[this.name]=i,t[this.name]=!0}},RC=class{constructor(n){this.writer=n,this.name="KHR_materials_specular"}writeMaterial(n,e){if(!n.isMeshPhysicalMaterial||n.specularIntensity===1&&n.specularColor.equals(pC)&&!n.specularIntensityMap&&!n.specularColorTexture)return;const t=this.writer,i=t.extensionsUsed,r={};if(n.specularIntensityMap){const o={index:t.processTexture(n.specularIntensityMap),texCoord:n.specularIntensityMap.channel};t.applyTextureTransform(o,n.specularIntensityMap),r.specularTexture=o}if(n.specularColorMap){const o={index:t.processTexture(n.specularColorMap),texCoord:n.specularColorMap.channel};t.applyTextureTransform(o,n.specularColorMap),r.specularColorTexture=o}r.specularFactor=n.specularIntensity,r.specularColorFactor=n.specularColor.toArray(),e.extensions=e.extensions||{},e.extensions[this.name]=r,i[this.name]=!0}},LC=class{constructor(n){this.writer=n,this.name="KHR_materials_sheen"}writeMaterial(n,e){if(!n.isMeshPhysicalMaterial||n.sheen==0)return;const t=this.writer,i=t.extensionsUsed,r={};if(n.sheenRoughnessMap){const o={index:t.processTexture(n.sheenRoughnessMap),texCoord:n.sheenRoughnessMap.channel};t.applyTextureTransform(o,n.sheenRoughnessMap),r.sheenRoughnessTexture=o}if(n.sheenColorMap){const o={index:t.processTexture(n.sheenColorMap),texCoord:n.sheenColorMap.channel};t.applyTextureTransform(o,n.sheenColorMap),r.sheenColorTexture=o}r.sheenRoughnessFactor=n.sheenRoughness,r.sheenColorFactor=n.sheenColor.toArray(),e.extensions=e.extensions||{},e.extensions[this.name]=r,i[this.name]=!0}},IC=class{constructor(n){this.writer=n,this.name="KHR_materials_anisotropy"}writeMaterial(n,e){if(!n.isMeshPhysicalMaterial||n.anisotropy==0)return;const t=this.writer,i=t.extensionsUsed,r={};if(n.anisotropyMap){const o={index:t.processTexture(n.anisotropyMap)};t.applyTextureTransform(o,n.anisotropyMap),r.anisotropyTexture=o}r.anisotropyStrength=n.anisotropy,r.anisotropyRotation=n.anisotropyRotation,e.extensions=e.extensions||{},e.extensions[this.name]=r,i[this.name]=!0}},DC=class{constructor(n){this.writer=n,this.name="KHR_materials_emissive_strength"}writeMaterial(n,e){if(!n.isMeshStandardMaterial||n.emissiveIntensity===1)return;const t=this.writer.extensionsUsed,i={};i.emissiveStrength=n.emissiveIntensity,e.extensions=e.extensions||{},e.extensions[this.name]=i,t[this.name]=!0}};var Ro=Uint8Array,Cg=Uint16Array,UC=Uint32Array,NC=new Ro([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),OC=new Ro([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),Ag=function(n,e){for(var t=new Cg(31),i=0;i<31;++i)t[i]=e+=1<<n[i-1];for(var r=new UC(t[30]),i=1;i<30;++i)for(var o=t[i];o<t[i+1];++o)r[o]=o-t[i]<<5|i;return[t,r]},Pg=Ag(NC,2),FC=Pg[0],BC=Pg[1];FC[28]=258,BC[258]=28;Ag(OC,0);var kC=new Cg(32768);for(var At=0;At<32768;++At){var Vi=(At&43690)>>>1|(At&21845)<<1;Vi=(Vi&52428)>>>2|(Vi&13107)<<2,Vi=(Vi&61680)>>>4|(Vi&3855)<<4,kC[At]=((Vi&65280)>>>8|(Vi&255)<<8)>>>1}var xl=new Ro(288);for(var At=0;At<144;++At)xl[At]=8;for(var At=144;At<256;++At)xl[At]=9;for(var At=256;At<280;++At)xl[At]=7;for(var At=280;At<288;++At)xl[At]=8;var VC=new Ro(32);for(var At=0;At<32;++At)VC[At]=5;var zC=new Ro(0),HC=typeof TextDecoder<"u"&&new TextDecoder,GC=0;try{HC.decode(zC,{stream:!0}),GC=1}catch{}new On;new $;new $;var WC=Object.defineProperty,jC=(n,e,t)=>e in n?WC(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t,Ke=(n,e,t)=>(jC(n,typeof e!="symbol"?e+"":e,t),t);const Ea=new Zm,xp=new xi,XC=Math.cos(70*(Math.PI/180)),bp=(n,e)=>(n%e+e)%e;class qC extends Pr{constructor(e,t){super(),Ke(this,"object"),Ke(this,"domElement"),Ke(this,"enabled",!0),Ke(this,"target",new $),Ke(this,"minDistance",0),Ke(this,"maxDistance",1/0),Ke(this,"minZoom",0),Ke(this,"maxZoom",1/0),Ke(this,"minPolarAngle",0),Ke(this,"maxPolarAngle",Math.PI),Ke(this,"minAzimuthAngle",-1/0),Ke(this,"maxAzimuthAngle",1/0),Ke(this,"enableDamping",!1),Ke(this,"dampingFactor",.05),Ke(this,"enableZoom",!0),Ke(this,"zoomSpeed",1),Ke(this,"enableRotate",!0),Ke(this,"rotateSpeed",1),Ke(this,"enablePan",!0),Ke(this,"panSpeed",1),Ke(this,"screenSpacePanning",!0),Ke(this,"keyPanSpeed",7),Ke(this,"zoomToCursor",!1),Ke(this,"autoRotate",!1),Ke(this,"autoRotateSpeed",2),Ke(this,"reverseOrbit",!1),Ke(this,"reverseHorizontalOrbit",!1),Ke(this,"reverseVerticalOrbit",!1),Ke(this,"keys",{LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"}),Ke(this,"mouseButtons",{LEFT:jr.ROTATE,MIDDLE:jr.DOLLY,RIGHT:jr.PAN}),Ke(this,"touches",{ONE:Wi.ROTATE,TWO:Wi.DOLLY_PAN}),Ke(this,"target0"),Ke(this,"position0"),Ke(this,"zoom0"),Ke(this,"_domElementKeyEvents",null),Ke(this,"getPolarAngle"),Ke(this,"getAzimuthalAngle"),Ke(this,"setPolarAngle"),Ke(this,"setAzimuthalAngle"),Ke(this,"getDistance"),Ke(this,"listenToKeyEvents"),Ke(this,"stopListenToKeyEvents"),Ke(this,"saveState"),Ke(this,"reset"),Ke(this,"update"),Ke(this,"connect"),Ke(this,"dispose"),this.object=e,this.domElement=t,this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this.getPolarAngle=()=>f.phi,this.getAzimuthalAngle=()=>f.theta,this.setPolarAngle=X=>{let ve=bp(X,2*Math.PI),De=f.phi;De<0&&(De+=2*Math.PI),ve<0&&(ve+=2*Math.PI);let Ne=Math.abs(ve-De);2*Math.PI-Ne<Ne&&(ve<De?ve+=2*Math.PI:De+=2*Math.PI),m.phi=ve-De,i.update()},this.setAzimuthalAngle=X=>{let ve=bp(X,2*Math.PI),De=f.theta;De<0&&(De+=2*Math.PI),ve<0&&(ve+=2*Math.PI);let Ne=Math.abs(ve-De);2*Math.PI-Ne<Ne&&(ve<De?ve+=2*Math.PI:De+=2*Math.PI),m.theta=ve-De,i.update()},this.getDistance=()=>i.object.position.distanceTo(i.target),this.listenToKeyEvents=X=>{X.addEventListener("keydown",Ae),this._domElementKeyEvents=X},this.stopListenToKeyEvents=()=>{this._domElementKeyEvents.removeEventListener("keydown",Ae),this._domElementKeyEvents=null},this.saveState=()=>{i.target0.copy(i.target),i.position0.copy(i.object.position),i.zoom0=i.object.zoom},this.reset=()=>{i.target.copy(i.target0),i.object.position.copy(i.position0),i.object.zoom=i.zoom0,i.object.updateProjectionMatrix(),i.dispatchEvent(r),i.update(),h=c.NONE},this.update=(()=>{const X=new $,ve=new $(0,1,0),De=new Tr().setFromUnitVectors(e.up,ve),Ne=De.clone().invert(),Se=new $,Y=new Tr,Re=2*Math.PI;return function(){const Le=i.object.position;De.setFromUnitVectors(e.up,ve),Ne.copy(De).invert(),X.copy(Le).sub(i.target),X.applyQuaternion(De),f.setFromVector3(X),i.autoRotate&&h===c.NONE&&V(H()),i.enableDamping?(f.theta+=m.theta*i.dampingFactor,f.phi+=m.phi*i.dampingFactor):(f.theta+=m.theta,f.phi+=m.phi);let He=i.minAzimuthAngle,ke=i.maxAzimuthAngle;isFinite(He)&&isFinite(ke)&&(He<-Math.PI?He+=Re:He>Math.PI&&(He-=Re),ke<-Math.PI?ke+=Re:ke>Math.PI&&(ke-=Re),He<=ke?f.theta=Math.max(He,Math.min(ke,f.theta)):f.theta=f.theta>(He+ke)/2?Math.max(He,f.theta):Math.min(ke,f.theta)),f.phi=Math.max(i.minPolarAngle,Math.min(i.maxPolarAngle,f.phi)),f.makeSafe(),i.enableDamping===!0?i.target.addScaledVector(x,i.dampingFactor):i.target.add(x),i.zoomToCursor&&M||i.object.isOrthographicCamera?f.radius=be(f.radius):f.radius=be(f.radius*_),X.setFromSpherical(f),X.applyQuaternion(Ne),Le.copy(i.target).add(X),i.object.matrixAutoUpdate||i.object.updateMatrix(),i.object.lookAt(i.target),i.enableDamping===!0?(m.theta*=1-i.dampingFactor,m.phi*=1-i.dampingFactor,x.multiplyScalar(1-i.dampingFactor)):(m.set(0,0,0),x.set(0,0,0));let ct=!1;if(i.zoomToCursor&&M){let ut=null;if(i.object instanceof Ht&&i.object.isPerspectiveCamera){const dt=X.length();ut=be(dt*_);const Pt=dt-ut;i.object.position.addScaledVector(I,Pt),i.object.updateMatrixWorld()}else if(i.object.isOrthographicCamera){const dt=new $(P.x,P.y,0);dt.unproject(i.object),i.object.zoom=Math.max(i.minZoom,Math.min(i.maxZoom,i.object.zoom/_)),i.object.updateProjectionMatrix(),ct=!0;const Pt=new $(P.x,P.y,0);Pt.unproject(i.object),i.object.position.sub(Pt).add(dt),i.object.updateMatrixWorld(),ut=X.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),i.zoomToCursor=!1;ut!==null&&(i.screenSpacePanning?i.target.set(0,0,-1).transformDirection(i.object.matrix).multiplyScalar(ut).add(i.object.position):(Ea.origin.copy(i.object.position),Ea.direction.set(0,0,-1).transformDirection(i.object.matrix),Math.abs(i.object.up.dot(Ea.direction))<XC?e.lookAt(i.target):(xp.setFromNormalAndCoplanarPoint(i.object.up,i.target),Ea.intersectPlane(xp,i.target))))}else i.object instanceof Yi&&i.object.isOrthographicCamera&&(ct=_!==1,ct&&(i.object.zoom=Math.max(i.minZoom,Math.min(i.maxZoom,i.object.zoom/_)),i.object.updateProjectionMatrix()));return _=1,M=!1,ct||Se.distanceToSquared(i.object.position)>d||8*(1-Y.dot(i.object.quaternion))>d?(i.dispatchEvent(r),Se.copy(i.object.position),Y.copy(i.object.quaternion),ct=!1,!0):!1}})(),this.connect=X=>{X===document&&console.error('THREE.OrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.'),i.domElement=X,i.domElement.style.touchAction="none",i.domElement.addEventListener("contextmenu",Je),i.domElement.addEventListener("pointerdown",z),i.domElement.addEventListener("pointercancel",se),i.domElement.addEventListener("wheel",Ee,{passive:!0})},this.dispose=()=>{var X,ve,De,Ne,Se,Y;i.domElement&&(i.domElement.style.touchAction="auto"),(X=i.domElement)==null||X.removeEventListener("contextmenu",Je),(ve=i.domElement)==null||ve.removeEventListener("pointerdown",z),(De=i.domElement)==null||De.removeEventListener("pointercancel",se),(Ne=i.domElement)==null||Ne.removeEventListener("wheel",Ee),(Se=i.domElement)==null||Se.ownerDocument.removeEventListener("pointermove",ne),(Y=i.domElement)==null||Y.ownerDocument.removeEventListener("pointerup",te),i._domElementKeyEvents!==null&&i._domElementKeyEvents.removeEventListener("keydown",Ae)};const i=this,r={type:"change"},o={type:"start"},a={type:"end"},c={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6};let h=c.NONE;const d=1e-6,f=new op,m=new op;let _=1;const x=new $,y=new Oe,w=new Oe,v=new Oe,g=new Oe,R=new Oe,E=new Oe,S=new Oe,F=new Oe,L=new Oe,I=new $,P=new Oe;let M=!1;const b=[],N={};function H(){return 2*Math.PI/60/60*i.autoRotateSpeed}function ae(){return Math.pow(.95,i.zoomSpeed)}function V(X){i.reverseOrbit||i.reverseHorizontalOrbit?m.theta+=X:m.theta-=X}function J(X){i.reverseOrbit||i.reverseVerticalOrbit?m.phi+=X:m.phi-=X}const q=(()=>{const X=new $;return function(ve,De){X.setFromMatrixColumn(De,0),X.multiplyScalar(-ve),x.add(X)}})(),ee=(()=>{const X=new $;return function(ve,De){i.screenSpacePanning===!0?X.setFromMatrixColumn(De,1):(X.setFromMatrixColumn(De,0),X.crossVectors(i.object.up,X)),X.multiplyScalar(ve),x.add(X)}})(),K=(()=>{const X=new $;return function(ve,De){const Ne=i.domElement;if(Ne&&i.object instanceof Ht&&i.object.isPerspectiveCamera){const Se=i.object.position;X.copy(Se).sub(i.target);let Y=X.length();Y*=Math.tan(i.object.fov/2*Math.PI/180),q(2*ve*Y/Ne.clientHeight,i.object.matrix),ee(2*De*Y/Ne.clientHeight,i.object.matrix)}else Ne&&i.object instanceof Yi&&i.object.isOrthographicCamera?(q(ve*(i.object.right-i.object.left)/i.object.zoom/Ne.clientWidth,i.object.matrix),ee(De*(i.object.top-i.object.bottom)/i.object.zoom/Ne.clientHeight,i.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),i.enablePan=!1)}})();function ue(X){i.object instanceof Ht&&i.object.isPerspectiveCamera||i.object instanceof Yi&&i.object.isOrthographicCamera?_/=X:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),i.enableZoom=!1)}function de(X){i.object instanceof Ht&&i.object.isPerspectiveCamera||i.object instanceof Yi&&i.object.isOrthographicCamera?_*=X:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),i.enableZoom=!1)}function we(X){if(!i.zoomToCursor||!i.domElement)return;M=!0;const ve=i.domElement.getBoundingClientRect(),De=X.clientX-ve.left,Ne=X.clientY-ve.top,Se=ve.width,Y=ve.height;P.x=De/Se*2-1,P.y=-(Ne/Y)*2+1,I.set(P.x,P.y,1).unproject(i.object).sub(i.object.position).normalize()}function be(X){return Math.max(i.minDistance,Math.min(i.maxDistance,X))}function fe(X){y.set(X.clientX,X.clientY)}function ce(X){we(X),S.set(X.clientX,X.clientY)}function Me(X){g.set(X.clientX,X.clientY)}function Ie(X){w.set(X.clientX,X.clientY),v.subVectors(w,y).multiplyScalar(i.rotateSpeed);const ve=i.domElement;ve&&(V(2*Math.PI*v.x/ve.clientHeight),J(2*Math.PI*v.y/ve.clientHeight)),y.copy(w),i.update()}function Ue(X){F.set(X.clientX,X.clientY),L.subVectors(F,S),L.y>0?ue(ae()):L.y<0&&de(ae()),S.copy(F),i.update()}function ge(X){R.set(X.clientX,X.clientY),E.subVectors(R,g).multiplyScalar(i.panSpeed),K(E.x,E.y),g.copy(R),i.update()}function U(X){we(X),X.deltaY<0?de(ae()):X.deltaY>0&&ue(ae()),i.update()}function B(X){let ve=!1;switch(X.code){case i.keys.UP:K(0,i.keyPanSpeed),ve=!0;break;case i.keys.BOTTOM:K(0,-i.keyPanSpeed),ve=!0;break;case i.keys.LEFT:K(i.keyPanSpeed,0),ve=!0;break;case i.keys.RIGHT:K(-i.keyPanSpeed,0),ve=!0;break}ve&&(X.preventDefault(),i.update())}function W(){if(b.length==1)y.set(b[0].pageX,b[0].pageY);else{const X=.5*(b[0].pageX+b[1].pageX),ve=.5*(b[0].pageY+b[1].pageY);y.set(X,ve)}}function T(){if(b.length==1)g.set(b[0].pageX,b[0].pageY);else{const X=.5*(b[0].pageX+b[1].pageX),ve=.5*(b[0].pageY+b[1].pageY);g.set(X,ve)}}function O(){const X=b[0].pageX-b[1].pageX,ve=b[0].pageY-b[1].pageY,De=Math.sqrt(X*X+ve*ve);S.set(0,De)}function G(){i.enableZoom&&O(),i.enablePan&&T()}function Q(){i.enableZoom&&O(),i.enableRotate&&W()}function Z(X){if(b.length==1)w.set(X.pageX,X.pageY);else{const De=Ce(X),Ne=.5*(X.pageX+De.x),Se=.5*(X.pageY+De.y);w.set(Ne,Se)}v.subVectors(w,y).multiplyScalar(i.rotateSpeed);const ve=i.domElement;ve&&(V(2*Math.PI*v.x/ve.clientHeight),J(2*Math.PI*v.y/ve.clientHeight)),y.copy(w)}function oe(X){if(b.length==1)R.set(X.pageX,X.pageY);else{const ve=Ce(X),De=.5*(X.pageX+ve.x),Ne=.5*(X.pageY+ve.y);R.set(De,Ne)}E.subVectors(R,g).multiplyScalar(i.panSpeed),K(E.x,E.y),g.copy(R)}function me(X){const ve=Ce(X),De=X.pageX-ve.x,Ne=X.pageY-ve.y,Se=Math.sqrt(De*De+Ne*Ne);F.set(0,Se),L.set(0,Math.pow(F.y/S.y,i.zoomSpeed)),ue(L.y),S.copy(F)}function D(X){i.enableZoom&&me(X),i.enablePan&&oe(X)}function A(X){i.enableZoom&&me(X),i.enableRotate&&Z(X)}function z(X){var ve,De;i.enabled!==!1&&(b.length===0&&((ve=i.domElement)==null||ve.ownerDocument.addEventListener("pointermove",ne),(De=i.domElement)==null||De.ownerDocument.addEventListener("pointerup",te)),We(X),X.pointerType==="touch"?Ve(X):ye(X))}function ne(X){i.enabled!==!1&&(X.pointerType==="touch"?_e(X):xe(X))}function te(X){var ve,De,Ne;Ge(X),b.length===0&&((ve=i.domElement)==null||ve.releasePointerCapture(X.pointerId),(De=i.domElement)==null||De.ownerDocument.removeEventListener("pointermove",ne),(Ne=i.domElement)==null||Ne.ownerDocument.removeEventListener("pointerup",te)),i.dispatchEvent(a),h=c.NONE}function se(X){Ge(X)}function ye(X){let ve;switch(X.button){case 0:ve=i.mouseButtons.LEFT;break;case 1:ve=i.mouseButtons.MIDDLE;break;case 2:ve=i.mouseButtons.RIGHT;break;default:ve=-1}switch(ve){case jr.DOLLY:if(i.enableZoom===!1)return;ce(X),h=c.DOLLY;break;case jr.ROTATE:if(X.ctrlKey||X.metaKey||X.shiftKey){if(i.enablePan===!1)return;Me(X),h=c.PAN}else{if(i.enableRotate===!1)return;fe(X),h=c.ROTATE}break;case jr.PAN:if(X.ctrlKey||X.metaKey||X.shiftKey){if(i.enableRotate===!1)return;fe(X),h=c.ROTATE}else{if(i.enablePan===!1)return;Me(X),h=c.PAN}break;default:h=c.NONE}h!==c.NONE&&i.dispatchEvent(o)}function xe(X){if(i.enabled!==!1)switch(h){case c.ROTATE:if(i.enableRotate===!1)return;Ie(X);break;case c.DOLLY:if(i.enableZoom===!1)return;Ue(X);break;case c.PAN:if(i.enablePan===!1)return;ge(X);break}}function Ee(X){i.enabled===!1||i.enableZoom===!1||h!==c.NONE&&h!==c.ROTATE||(i.dispatchEvent(o),U(X),i.dispatchEvent(a))}function Ae(X){i.enabled===!1||i.enablePan===!1||B(X)}function Ve(X){switch(ze(X),b.length){case 1:switch(i.touches.ONE){case Wi.ROTATE:if(i.enableRotate===!1)return;W(),h=c.TOUCH_ROTATE;break;case Wi.PAN:if(i.enablePan===!1)return;T(),h=c.TOUCH_PAN;break;default:h=c.NONE}break;case 2:switch(i.touches.TWO){case Wi.DOLLY_PAN:if(i.enableZoom===!1&&i.enablePan===!1)return;G(),h=c.TOUCH_DOLLY_PAN;break;case Wi.DOLLY_ROTATE:if(i.enableZoom===!1&&i.enableRotate===!1)return;Q(),h=c.TOUCH_DOLLY_ROTATE;break;default:h=c.NONE}break;default:h=c.NONE}h!==c.NONE&&i.dispatchEvent(o)}function _e(X){switch(ze(X),h){case c.TOUCH_ROTATE:if(i.enableRotate===!1)return;Z(X),i.update();break;case c.TOUCH_PAN:if(i.enablePan===!1)return;oe(X),i.update();break;case c.TOUCH_DOLLY_PAN:if(i.enableZoom===!1&&i.enablePan===!1)return;D(X),i.update();break;case c.TOUCH_DOLLY_ROTATE:if(i.enableZoom===!1&&i.enableRotate===!1)return;A(X),i.update();break;default:h=c.NONE}}function Je(X){i.enabled!==!1&&X.preventDefault()}function We(X){b.push(X)}function Ge(X){delete N[X.pointerId];for(let ve=0;ve<b.length;ve++)if(b[ve].pointerId==X.pointerId){b.splice(ve,1);return}}function ze(X){let ve=N[X.pointerId];ve===void 0&&(ve=new Oe,N[X.pointerId]=ve),ve.set(X.pageX,X.pageY)}function Ce(X){const ve=X.pointerId===b[0].pointerId?b[1]:b[0];return N[ve.pointerId]}t!==void 0&&this.connect(t),this.update()}}new Ut;new $;const YC={uniforms:{tDiffuse:{value:null},h:{value:1/512}},vertexShader:`
      varying vec2 vUv;

      void main() {

        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

      }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float h;

    varying vec2 vUv;

    void main() {

    	vec4 sum = vec4( 0.0 );

    	sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;
    	sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;
    	sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;
    	sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;
    	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;
    	sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;
    	sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;
    	sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;
    	sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;

    	gl_FragColor = sum;

    }
  `},KC={uniforms:{tDiffuse:{value:null},v:{value:1/512}},vertexShader:`
    varying vec2 vUv;

    void main() {

      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    }
  `,fragmentShader:`

  uniform sampler2D tDiffuse;
  uniform float v;

  varying vec2 vUv;

  void main() {

    vec4 sum = vec4( 0.0 );

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;

    gl_FragColor = sum;

  }
  `};new $;var $C=Object.defineProperty,ZC=(n,e,t)=>e in n?$C(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t,eh=(n,e,t)=>(ZC(n,typeof e!="symbol"?e+"":e,t),t);class Rg{constructor(e){eh(this,"data"),this.data=e}generateShapes(e,t=100,i){const r=[],o={letterSpacing:0,lineHeight:1,...i},a=JC(e,t,this.data,o);for(let c=0,h=a.length;c<h;c++)Array.prototype.push.apply(r,a[c].toShapes(!1));return r}}eh(Rg,"isFont");eh(Rg,"type");function JC(n,e,t,i){const r=Array.from(n),o=e/t.resolution,a=(t.boundingBox.yMax-t.boundingBox.yMin+t.underlineThickness)*o,c=[];let h=0,d=0;for(let f=0;f<r.length;f++){const m=r[f];if(m===`
`)h=0,d-=a*i.lineHeight;else{const _=QC(m,o,h,d,t);_&&(h+=_.offsetX+i.letterSpacing,c.push(_.path))}}return c}function QC(n,e,t,i,r){const o=r.glyphs[n]||r.glyphs["?"];if(!o){console.error('THREE.Font: character "'+n+'" does not exists in font family '+r.familyName+".");return}const a=new iC;let c,h,d,f,m,_,x,y;if(o.o){const w=o._cachedOutline||(o._cachedOutline=o.o.split(" "));for(let v=0,g=w.length;v<g;)switch(w[v++]){case"m":c=parseInt(w[v++])*e+t,h=parseInt(w[v++])*e+i,a.moveTo(c,h);break;case"l":c=parseInt(w[v++])*e+t,h=parseInt(w[v++])*e+i,a.lineTo(c,h);break;case"q":d=parseInt(w[v++])*e+t,f=parseInt(w[v++])*e+i,m=parseInt(w[v++])*e+t,_=parseInt(w[v++])*e+i,a.quadraticCurveTo(m,_,d,f);break;case"b":d=parseInt(w[v++])*e+t,f=parseInt(w[v++])*e+i,m=parseInt(w[v++])*e+t,_=parseInt(w[v++])*e+i,x=parseInt(w[v++])*e+t,y=parseInt(w[v++])*e+i,a.bezierCurveTo(m,_,x,y,d,f);break}}return{offsetX:o.ha*e,path:a}}class th extends gn{constructor(e,t={}){super(e),this.isReflector=!0,this.type="Reflector",this.camera=new Ht;const i=this,r=t.color!==void 0?new lt(t.color):new lt(8355711),o=t.textureWidth||512,a=t.textureHeight||512,c=t.clipBias||0,h=t.shader||th.ReflectorShader,d=t.multisample!==void 0?t.multisample:4,f=new xi,m=new $,_=new $,x=new $,y=new Ut,w=new $(0,0,-1),v=new It,g=new $,R=new $,E=new It,S=new Ut,F=this.camera,L=new ii(o,a,{samples:d,type:Ss}),I=new wn({name:h.name!==void 0?h.name:"unspecified",uniforms:gl.clone(h.uniforms),fragmentShader:h.fragmentShader,vertexShader:h.vertexShader});I.uniforms.tDiffuse.value=L.texture,I.uniforms.color.value=r,I.uniforms.textureMatrix.value=S,this.material=I,this.onBeforeRender=function(P,M,b){if(_.setFromMatrixPosition(i.matrixWorld),x.setFromMatrixPosition(b.matrixWorld),y.extractRotation(i.matrixWorld),m.set(0,0,1),m.applyMatrix4(y),g.subVectors(_,x),g.dot(m)>0)return;g.reflect(m).negate(),g.add(_),y.extractRotation(b.matrixWorld),w.set(0,0,-1),w.applyMatrix4(y),w.add(x),R.subVectors(_,w),R.reflect(m).negate(),R.add(_),F.position.copy(g),F.up.set(0,1,0),F.up.applyMatrix4(y),F.up.reflect(m),F.lookAt(R),F.far=b.far,F.updateMatrixWorld(),F.projectionMatrix.copy(b.projectionMatrix),S.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),S.multiply(F.projectionMatrix),S.multiply(F.matrixWorldInverse),S.multiply(i.matrixWorld),f.setFromNormalAndCoplanarPoint(m,_),f.applyMatrix4(F.matrixWorldInverse),v.set(f.normal.x,f.normal.y,f.normal.z,f.constant);const N=F.projectionMatrix;E.x=(Math.sign(v.x)+N.elements[8])/N.elements[0],E.y=(Math.sign(v.y)+N.elements[9])/N.elements[5],E.z=-1,E.w=(1+N.elements[10])/N.elements[14],v.multiplyScalar(2/v.dot(E)),N.elements[2]=v.x,N.elements[6]=v.y,N.elements[10]=v.z+1-c,N.elements[14]=v.w,i.visible=!1;const H=P.getRenderTarget(),ae=P.xr.enabled,V=P.shadowMap.autoUpdate;P.xr.enabled=!1,P.shadowMap.autoUpdate=!1,P.setRenderTarget(L),P.state.buffers.depth.setMask(!0),P.autoClear===!1&&P.clear(),P.render(M,F),P.xr.enabled=ae,P.shadowMap.autoUpdate=V,P.setRenderTarget(H);const J=b.viewport;J!==void 0&&P.state.viewport(J),i.visible=!0},this.getRenderTarget=function(){return L},this.dispose=function(){L.dispose(),i.material.dispose()}}}th.ReflectorShader={name:"ReflectorShader",uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null}},vertexShader:`
		uniform mat4 textureMatrix;
		varying vec4 vUv;

		#include <common>
		#include <logdepthbuf_pars_vertex>

		void main() {

			vUv = textureMatrix * vec4( position, 1.0 );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			#include <logdepthbuf_vertex>

		}`,fragmentShader:`
		uniform vec3 color;
		uniform sampler2D tDiffuse;
		varying vec4 vUv;

		#include <logdepthbuf_pars_fragment>

		float blendOverlay( float base, float blend ) {

			return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );

		}

		vec3 blendOverlay( vec3 base, vec3 blend ) {

			return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );

		}

		void main() {

			#include <logdepthbuf_fragment>

			vec4 base = texture2DProj( tDiffuse, vUv );
			gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>

		}`};function eA(n){return Eu()?(Ip(n),!0):!1}function Lg(n){return typeof n=="function"?n():st(n)}const tA=typeof window<"u"&&typeof document<"u";typeof WorkerGlobalScope<"u"&&globalThis instanceof WorkerGlobalScope;const nA=Object.prototype.toString,iA=n=>nA.call(n)==="[object Object]",rA=()=>{};function sA(n){var e;const t=Lg(n);return(e=t==null?void 0:t.$el)!=null?e:t}const oA=tA?window:void 0;function Wc(...n){let e,t,i,r;if(typeof n[0]=="string"||Array.isArray(n[0])?([t,i,r]=n,e=oA):[e,t,i,r]=n,!e)return rA;Array.isArray(t)||(t=[t]),Array.isArray(i)||(i=[i]);const o=[],a=()=>{o.forEach(f=>f()),o.length=0},c=(f,m,_,x)=>(f.addEventListener(m,_,x),()=>f.removeEventListener(m,_,x)),h=yr(()=>[sA(e),Lg(r)],([f,m])=>{if(a(),!f)return;const _=iA(m)?{...m}:m;o.push(...t.flatMap(x=>i.map(y=>c(f,x,y,_))))},{immediate:!0,flush:"post"}),d=()=>{h(),a()};return eA(d),d}class Ja extends gn{constructor(){super(Ja.Geometry,new Gu({opacity:0,transparent:!0})),this.isLensflare=!0,this.type="Lensflare",this.frustumCulled=!1,this.renderOrder=1/0;const e=new $,t=new $,i=new Qf(16,16),r=new Qf(16,16);let o=ei;const a=Ja.Geometry,c=new kc({uniforms:{scale:{value:null},screenPosition:{value:null}},vertexShader:`

				precision highp float;

				uniform vec3 screenPosition;
				uniform vec2 scale;

				attribute vec3 position;

				void main() {

					gl_Position = vec4( position.xy * scale + screenPosition.xy, screenPosition.z, 1.0 );

				}`,fragmentShader:`

				precision highp float;

				void main() {

					gl_FragColor = vec4( 1.0, 0.0, 1.0, 1.0 );

				}`,depthTest:!0,depthWrite:!1,transparent:!1}),h=new kc({uniforms:{map:{value:i},scale:{value:null},screenPosition:{value:null}},vertexShader:`

				precision highp float;

				uniform vec3 screenPosition;
				uniform vec2 scale;

				attribute vec3 position;
				attribute vec2 uv;

				varying vec2 vUV;

				void main() {

					vUV = uv;

					gl_Position = vec4( position.xy * scale + screenPosition.xy, screenPosition.z, 1.0 );

				}`,fragmentShader:`

				precision highp float;

				uniform sampler2D map;

				varying vec2 vUV;

				void main() {

					gl_FragColor = texture2D( map, vUV );

				}`,depthTest:!1,depthWrite:!1,transparent:!1}),d=new gn(a,c),f=[],m=Ig.Shader,_=new kc({name:m.name,uniforms:{map:{value:null},occlusionMap:{value:r},color:{value:new lt(16777215)},scale:{value:new Oe},screenPosition:{value:new $}},vertexShader:m.vertexShader,fragmentShader:m.fragmentShader,blending:nu,transparent:!0,depthWrite:!1}),x=new gn(a,_);this.addElement=function(R){f.push(R)};const y=new Oe,w=new Oe,v=new tC,g=new It;this.onBeforeRender=function(R,E,S){R.getCurrentViewport(g);const F=R.getRenderTarget(),L=F!==null?F.texture.type:ei;o!==L&&(i.dispose(),r.dispose(),i.type=r.type=L,o=L);const I=g.w/g.z,P=g.z/2,M=g.w/2;let b=16/g.w;if(y.set(b*I,b),v.min.set(g.x,g.y),v.max.set(g.x+(g.z-16),g.y+(g.w-16)),t.setFromMatrixPosition(this.matrixWorld),t.applyMatrix4(S.matrixWorldInverse),!(t.z>0)&&(e.copy(t).applyMatrix4(S.projectionMatrix),w.x=g.x+e.x*P+P-8,w.y=g.y+e.y*M+M-8,v.containsPoint(w))){R.copyFramebufferToTexture(w,i);let N=c.uniforms;N.scale.value=y,N.screenPosition.value=e,R.renderBufferDirect(S,null,a,c,d,null),R.copyFramebufferToTexture(w,r),N=h.uniforms,N.scale.value=y,N.screenPosition.value=e,R.renderBufferDirect(S,null,a,h,d,null);const H=-e.x*2,ae=-e.y*2;for(let V=0,J=f.length;V<J;V++){const q=f[V],ee=_.uniforms;ee.color.value.copy(q.color),ee.map.value=q.texture,ee.screenPosition.value.x=e.x+H*q.distance,ee.screenPosition.value.y=e.y+ae*q.distance,b=q.size/g.w;const K=g.w/g.z;ee.scale.value.set(b*K,b),_.uniformsNeedUpdate=!0,R.renderBufferDirect(S,null,a,_,x,null)}}},this.dispose=function(){c.dispose(),h.dispose(),_.dispose(),i.dispose(),r.dispose();for(let R=0,E=f.length;R<E;R++)f[R].texture.dispose()}}}class Ig{constructor(e,t=1,i=0,r=new lt(16777215)){this.texture=e,this.size=t,this.distance=i,this.color=r}}Ig.Shader={name:"LensflareElementShader",uniforms:{map:{value:null},occlusionMap:{value:null},color:{value:null},scale:{value:null},screenPosition:{value:null}},vertexShader:`

		precision highp float;

		uniform vec3 screenPosition;
		uniform vec2 scale;

		uniform sampler2D occlusionMap;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUV;
		varying float vVisibility;

		void main() {

			vUV = uv;

			vec2 pos = position.xy;

			vec4 visibility = texture2D( occlusionMap, vec2( 0.1, 0.1 ) );
			visibility += texture2D( occlusionMap, vec2( 0.5, 0.1 ) );
			visibility += texture2D( occlusionMap, vec2( 0.9, 0.1 ) );
			visibility += texture2D( occlusionMap, vec2( 0.9, 0.5 ) );
			visibility += texture2D( occlusionMap, vec2( 0.9, 0.9 ) );
			visibility += texture2D( occlusionMap, vec2( 0.5, 0.9 ) );
			visibility += texture2D( occlusionMap, vec2( 0.1, 0.9 ) );
			visibility += texture2D( occlusionMap, vec2( 0.1, 0.5 ) );
			visibility += texture2D( occlusionMap, vec2( 0.5, 0.5 ) );

			vVisibility =        visibility.r / 9.0;
			vVisibility *= 1.0 - visibility.g / 9.0;
			vVisibility *=       visibility.b / 9.0;

			gl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D map;
		uniform vec3 color;

		varying vec2 vUV;
		varying float vVisibility;

		void main() {

			vec4 texture = texture2D( map, vUV );
			texture.a *= vVisibility;
			gl_FragColor = texture;
			gl_FragColor.rgb *= color;

		}`};Ja.Geometry=function(){const n=new ir,e=new Float32Array([-1,-1,0,0,0,1,-1,0,1,0,1,1,0,1,1,-1,1,0,0,1]),t=new p1(e,5);return n.setIndex([0,1,2,0,2,3]),n.setAttribute("position",new Za(t,3,0,!1)),n.setAttribute("uv",new Za(t,2,3,!1)),n}();const aA=["target","auto-rotate","auto-rotate-speed","enable-damping","damping-factor","enable-pan","key-pan-speed","keys","max-azimuth-angle","min-azimuth-angle","max-polar-angle","min-polar-angle","min-distance","max-distance","min-zoom","max-zoom","touches","enable-zoom","zoom-speed","enable-rotate","rotate-speed","args"],lA=ri({__name:"OrbitControls",props:{makeDefault:{type:Boolean,default:!1},camera:{},domElement:{},target:{default:()=>[0,0,0]},enableDamping:{type:Boolean,default:!0},dampingFactor:{default:.05},autoRotate:{type:Boolean,default:!1},autoRotateSpeed:{default:2},enablePan:{type:Boolean,default:!0},keyPanSpeed:{default:7},keys:{},maxAzimuthAngle:{default:Number.POSITIVE_INFINITY},minAzimuthAngle:{default:Number.NEGATIVE_INFINITY},maxPolarAngle:{default:Math.PI},minPolarAngle:{default:0},minDistance:{default:0},maxDistance:{default:Number.POSITIVE_INFINITY},minZoom:{default:0},maxZoom:{default:Number.POSITIVE_INFINITY},touches:{default:()=>({ONE:Wi.ROTATE,TWO:Wi.DOLLY_PAN})},enableZoom:{type:Boolean,default:!0},zoomSpeed:{default:1},enableRotate:{type:Boolean,default:!0},rotateSpeed:{default:1}},emits:["change","start","end"],setup(n,{expose:e,emit:t}){const i=n,r=t,{makeDefault:o,autoRotate:a,autoRotateSpeed:c,enableDamping:h,dampingFactor:d,enablePan:f,keyPanSpeed:m,maxAzimuthAngle:_,minAzimuthAngle:x,maxPolarAngle:y,minPolarAngle:w,minDistance:v,maxDistance:g,minZoom:R,maxZoom:E,enableZoom:S,zoomSpeed:F,enableRotate:L,touches:I,rotateSpeed:P,target:M}=Kp(i),{camera:b,renderer:N,extend:H,controls:ae}=Ju(),V=Ot(null);H({OrbitControls:qC}),yr(V,ee=>{J(),ee&&o.value?ae.value=ee:ae.value=null});function J(){Wc(V.value,"change",()=>r("change",V.value)),Wc(V.value,"start",()=>r("start",V.value)),Wc(V.value,"end",()=>r("end",V.value))}const{onLoop:q}=Ls();return q(()=>{V.value&&(h.value||a.value)&&V.value.update()}),Ao(()=>{V.value&&V.value.dispose()}),e({value:V}),(ee,K)=>(ee.camera||st(b))&&(ee.domElement||st(N))?(Gt(),en("TresOrbitControls",{key:0,ref_key:"controlsRef",ref:V,target:st(M),"auto-rotate":st(a),"auto-rotate-speed":st(c),"enable-damping":st(h),"damping-factor":st(d),"enable-pan":st(f),"key-pan-speed":st(m),keys:ee.keys,"max-azimuth-angle":st(_),"min-azimuth-angle":st(x),"max-polar-angle":st(y),"min-polar-angle":st(w),"min-distance":st(v),"max-distance":st(g),"min-zoom":st(R),"max-zoom":st(E),touches:st(I),"enable-zoom":st(S),"zoom-speed":st(F),"enable-rotate":st(L),"rotate-speed":st(P),args:[ee.camera||st(b),ee.domElement||st(N).domElement]},null,8,aA)):Fu("",!0)}});var jc;/Mac/.test((jc=globalThis==null?void 0:globalThis.navigator)===null||jc===void 0?void 0:jc.platform);var cA=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function Sa(n){throw new Error('Could not dynamically require "'+n+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var uA={exports:{}};(function(n,e){(function(t){n.exports=t()})(function(){return function t(i,r,o){function a(d,f){if(!r[d]){if(!i[d]){var m=typeof Sa=="function"&&Sa;if(!f&&m)return m(d,!0);if(c)return c(d,!0);throw new Error("Cannot find module '"+d+"'")}f=r[d]={exports:{}},i[d][0].call(f.exports,function(_){var x=i[d][1][_];return a(x||_)},f,f.exports,t,i,r,o)}return r[d].exports}for(var c=typeof Sa=="function"&&Sa,h=0;h<o.length;h++)a(o[h]);return a}({1:[function(t,i,r){(function(o,a,c,h,d,f,m,_,x){var y=t("crypto");function w(L,I){I=R(L,I);var P;return(P=I.algorithm!=="passthrough"?y.createHash(I.algorithm):new F).write===void 0&&(P.write=P.update,P.end=P.update),S(I,P).dispatch(L),P.update||P.end(""),P.digest?P.digest(I.encoding==="buffer"?void 0:I.encoding):(L=P.read(),I.encoding!=="buffer"?L.toString(I.encoding):L)}(r=i.exports=w).sha1=function(L){return w(L)},r.keys=function(L){return w(L,{excludeValues:!0,algorithm:"sha1",encoding:"hex"})},r.MD5=function(L){return w(L,{algorithm:"md5",encoding:"hex"})},r.keysMD5=function(L){return w(L,{algorithm:"md5",encoding:"hex",excludeValues:!0})};var v=y.getHashes?y.getHashes().slice():["sha1","md5"],g=(v.push("passthrough"),["buffer","hex","binary","base64"]);function R(L,I){var P={};if(P.algorithm=(I=I||{}).algorithm||"sha1",P.encoding=I.encoding||"hex",P.excludeValues=!!I.excludeValues,P.algorithm=P.algorithm.toLowerCase(),P.encoding=P.encoding.toLowerCase(),P.ignoreUnknown=I.ignoreUnknown===!0,P.respectType=I.respectType!==!1,P.respectFunctionNames=I.respectFunctionNames!==!1,P.respectFunctionProperties=I.respectFunctionProperties!==!1,P.unorderedArrays=I.unorderedArrays===!0,P.unorderedSets=I.unorderedSets!==!1,P.unorderedObjects=I.unorderedObjects!==!1,P.replacer=I.replacer||void 0,P.excludeKeys=I.excludeKeys||void 0,L===void 0)throw new Error("Object argument required.");for(var M=0;M<v.length;++M)v[M].toLowerCase()===P.algorithm.toLowerCase()&&(P.algorithm=v[M]);if(v.indexOf(P.algorithm)===-1)throw new Error('Algorithm "'+P.algorithm+'"  not supported. supported values: '+v.join(", "));if(g.indexOf(P.encoding)===-1&&P.algorithm!=="passthrough")throw new Error('Encoding "'+P.encoding+'"  not supported. supported values: '+g.join(", "));return P}function E(L){if(typeof L=="function")return/^function\s+\w*\s*\(\s*\)\s*{\s+\[native code\]\s+}$/i.exec(Function.prototype.toString.call(L))!=null}function S(L,I,P){P=P||[];function M(b){return I.update?I.update(b,"utf8"):I.write(b,"utf8")}return{dispatch:function(b){return this["_"+((b=L.replacer?L.replacer(b):b)===null?"null":typeof b)](b)},_object:function(b){var N,H=Object.prototype.toString.call(b),ae=/\[object (.*)\]/i.exec(H);if(ae=(ae=ae?ae[1]:"unknown:["+H+"]").toLowerCase(),0<=(H=P.indexOf(b)))return this.dispatch("[CIRCULAR:"+H+"]");if(P.push(b),c!==void 0&&c.isBuffer&&c.isBuffer(b))return M("buffer:"),M(b);if(ae==="object"||ae==="function"||ae==="asyncfunction")return H=Object.keys(b),L.unorderedObjects&&(H=H.sort()),L.respectType===!1||E(b)||H.splice(0,0,"prototype","__proto__","constructor"),L.excludeKeys&&(H=H.filter(function(V){return!L.excludeKeys(V)})),M("object:"+H.length+":"),N=this,H.forEach(function(V){N.dispatch(V),M(":"),L.excludeValues||N.dispatch(b[V]),M(",")});if(!this["_"+ae]){if(L.ignoreUnknown)return M("["+ae+"]");throw new Error('Unknown object type "'+ae+'"')}this["_"+ae](b)},_array:function(b,V){V=V!==void 0?V:L.unorderedArrays!==!1;var H=this;if(M("array:"+b.length+":"),!V||b.length<=1)return b.forEach(function(J){return H.dispatch(J)});var ae=[],V=b.map(function(J){var q=new F,ee=P.slice();return S(L,q,ee).dispatch(J),ae=ae.concat(ee.slice(P.length)),q.read().toString()});return P=P.concat(ae),V.sort(),this._array(V,!1)},_date:function(b){return M("date:"+b.toJSON())},_symbol:function(b){return M("symbol:"+b.toString())},_error:function(b){return M("error:"+b.toString())},_boolean:function(b){return M("bool:"+b.toString())},_string:function(b){M("string:"+b.length+":"),M(b.toString())},_function:function(b){M("fn:"),E(b)?this.dispatch("[native]"):this.dispatch(b.toString()),L.respectFunctionNames!==!1&&this.dispatch("function-name:"+String(b.name)),L.respectFunctionProperties&&this._object(b)},_number:function(b){return M("number:"+b.toString())},_xml:function(b){return M("xml:"+b.toString())},_null:function(){return M("Null")},_undefined:function(){return M("Undefined")},_regexp:function(b){return M("regex:"+b.toString())},_uint8array:function(b){return M("uint8array:"),this.dispatch(Array.prototype.slice.call(b))},_uint8clampedarray:function(b){return M("uint8clampedarray:"),this.dispatch(Array.prototype.slice.call(b))},_int8array:function(b){return M("int8array:"),this.dispatch(Array.prototype.slice.call(b))},_uint16array:function(b){return M("uint16array:"),this.dispatch(Array.prototype.slice.call(b))},_int16array:function(b){return M("int16array:"),this.dispatch(Array.prototype.slice.call(b))},_uint32array:function(b){return M("uint32array:"),this.dispatch(Array.prototype.slice.call(b))},_int32array:function(b){return M("int32array:"),this.dispatch(Array.prototype.slice.call(b))},_float32array:function(b){return M("float32array:"),this.dispatch(Array.prototype.slice.call(b))},_float64array:function(b){return M("float64array:"),this.dispatch(Array.prototype.slice.call(b))},_arraybuffer:function(b){return M("arraybuffer:"),this.dispatch(new Uint8Array(b))},_url:function(b){return M("url:"+b.toString())},_map:function(b){return M("map:"),b=Array.from(b),this._array(b,L.unorderedSets!==!1)},_set:function(b){return M("set:"),b=Array.from(b),this._array(b,L.unorderedSets!==!1)},_file:function(b){return M("file:"),this.dispatch([b.name,b.size,b.type,b.lastModfied])},_blob:function(){if(L.ignoreUnknown)return M("[blob]");throw Error(`Hashing Blob objects is currently not supported
(see https://github.com/puleos/object-hash/issues/26)
Use "options.replacer" or "options.ignoreUnknown"
`)},_domwindow:function(){return M("domwindow")},_bigint:function(b){return M("bigint:"+b.toString())},_process:function(){return M("process")},_timer:function(){return M("timer")},_pipe:function(){return M("pipe")},_tcp:function(){return M("tcp")},_udp:function(){return M("udp")},_tty:function(){return M("tty")},_statwatcher:function(){return M("statwatcher")},_securecontext:function(){return M("securecontext")},_connection:function(){return M("connection")},_zlib:function(){return M("zlib")},_context:function(){return M("context")},_nodescript:function(){return M("nodescript")},_httpparser:function(){return M("httpparser")},_dataview:function(){return M("dataview")},_signal:function(){return M("signal")},_fsevent:function(){return M("fsevent")},_tlswrap:function(){return M("tlswrap")}}}function F(){return{buf:"",write:function(L){this.buf+=L},end:function(L){this.buf+=L},read:function(){return this.buf}}}r.writeToStream=function(L,I,P){return P===void 0&&(P=I,I={}),S(I=R(L,I),P).dispatch(L)}}).call(this,t("lYpoI2"),typeof self<"u"?self:typeof window<"u"?window:{},t("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_9a5aa49d.js","/")},{buffer:3,crypto:5,lYpoI2:11}],2:[function(t,i,r){(function(o,a,c,h,d,f,m,_,x){(function(y){var w=typeof Uint8Array<"u"?Uint8Array:Array,v=43,g=47,R=48,E=97,S=65,F=45,L=95;function I(P){return P=P.charCodeAt(0),P===v||P===F?62:P===g||P===L?63:P<R?-1:P<R+10?P-R+26+26:P<S+26?P-S:P<E+26?P-E+26:void 0}y.toByteArray=function(P){var M,b;if(0<P.length%4)throw new Error("Invalid string. Length must be a multiple of 4");var N=P.length,N=P.charAt(N-2)==="="?2:P.charAt(N-1)==="="?1:0,H=new w(3*P.length/4-N),ae=0<N?P.length-4:P.length,V=0;function J(q){H[V++]=q}for(M=0;M<ae;M+=4,0)J((16711680&(b=I(P.charAt(M))<<18|I(P.charAt(M+1))<<12|I(P.charAt(M+2))<<6|I(P.charAt(M+3))))>>16),J((65280&b)>>8),J(255&b);return N==2?J(255&(b=I(P.charAt(M))<<2|I(P.charAt(M+1))>>4)):N==1&&(J((b=I(P.charAt(M))<<10|I(P.charAt(M+1))<<4|I(P.charAt(M+2))>>2)>>8&255),J(255&b)),H},y.fromByteArray=function(P){var M,b,N,H,ae=P.length%3,V="";function J(q){return"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(q)}for(M=0,N=P.length-ae;M<N;M+=3)b=(P[M]<<16)+(P[M+1]<<8)+P[M+2],V+=J((H=b)>>18&63)+J(H>>12&63)+J(H>>6&63)+J(63&H);switch(ae){case 1:V=(V+=J((b=P[P.length-1])>>2))+J(b<<4&63)+"==";break;case 2:V=(V=(V+=J((b=(P[P.length-2]<<8)+P[P.length-1])>>10))+J(b>>4&63))+J(b<<2&63)+"="}return V}})(r===void 0?this.base64js={}:r)}).call(this,t("lYpoI2"),typeof self<"u"?self:typeof window<"u"?window:{},t("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/base64-js/lib/b64.js","/node_modules/gulp-browserify/node_modules/base64-js/lib")},{buffer:3,lYpoI2:11}],3:[function(t,i,r){(function(o,a,v,h,d,f,m,_,x){var y=t("base64-js"),w=t("ieee754");function v(U,B,W){if(!(this instanceof v))return new v(U,B,W);var T,O,G,Q,Z=typeof U;if(B==="base64"&&Z=="string")for(U=(Q=U).trim?Q.trim():Q.replace(/^\s+|\s+$/g,"");U.length%4!=0;)U+="=";if(Z=="number")T=K(U);else if(Z=="string")T=v.byteLength(U,B);else{if(Z!="object")throw new Error("First argument needs to be a number, array or string.");T=K(U.length)}if(v._useTypedArrays?O=v._augment(new Uint8Array(T)):((O=this).length=T,O._isBuffer=!0),v._useTypedArrays&&typeof U.byteLength=="number")O._set(U);else if(ue(Q=U)||v.isBuffer(Q)||Q&&typeof Q=="object"&&typeof Q.length=="number")for(G=0;G<T;G++)v.isBuffer(U)?O[G]=U.readUInt8(G):O[G]=U[G];else if(Z=="string")O.write(U,0,B);else if(Z=="number"&&!v._useTypedArrays&&!W)for(G=0;G<T;G++)O[G]=0;return O}function g(U,B,W,T){return v._charsWritten=fe(function(O){for(var G=[],Q=0;Q<O.length;Q++)G.push(255&O.charCodeAt(Q));return G}(B),U,W,T)}function R(U,B,W,T){return v._charsWritten=fe(function(O){for(var G,Q,Z=[],oe=0;oe<O.length;oe++)Q=O.charCodeAt(oe),G=Q>>8,Q=Q%256,Z.push(Q),Z.push(G);return Z}(B),U,W,T)}function E(U,B,W){var T="";W=Math.min(U.length,W);for(var O=B;O<W;O++)T+=String.fromCharCode(U[O]);return T}function S(U,B,W,G){G||(ge(typeof W=="boolean","missing or invalid endian"),ge(B!=null,"missing offset"),ge(B+1<U.length,"Trying to read beyond buffer length"));var O,G=U.length;if(!(G<=B))return W?(O=U[B],B+1<G&&(O|=U[B+1]<<8)):(O=U[B]<<8,B+1<G&&(O|=U[B+1])),O}function F(U,B,W,G){G||(ge(typeof W=="boolean","missing or invalid endian"),ge(B!=null,"missing offset"),ge(B+3<U.length,"Trying to read beyond buffer length"));var O,G=U.length;if(!(G<=B))return W?(B+2<G&&(O=U[B+2]<<16),B+1<G&&(O|=U[B+1]<<8),O|=U[B],B+3<G&&(O+=U[B+3]<<24>>>0)):(B+1<G&&(O=U[B+1]<<16),B+2<G&&(O|=U[B+2]<<8),B+3<G&&(O|=U[B+3]),O+=U[B]<<24>>>0),O}function L(U,B,W,T){if(T||(ge(typeof W=="boolean","missing or invalid endian"),ge(B!=null,"missing offset"),ge(B+1<U.length,"Trying to read beyond buffer length")),!(U.length<=B))return T=S(U,B,W,!0),32768&T?-1*(65535-T+1):T}function I(U,B,W,T){if(T||(ge(typeof W=="boolean","missing or invalid endian"),ge(B!=null,"missing offset"),ge(B+3<U.length,"Trying to read beyond buffer length")),!(U.length<=B))return T=F(U,B,W,!0),2147483648&T?-1*(4294967295-T+1):T}function P(U,B,W,T){return T||(ge(typeof W=="boolean","missing or invalid endian"),ge(B+3<U.length,"Trying to read beyond buffer length")),w.read(U,B,W,23,4)}function M(U,B,W,T){return T||(ge(typeof W=="boolean","missing or invalid endian"),ge(B+7<U.length,"Trying to read beyond buffer length")),w.read(U,B,W,52,8)}function b(U,B,W,T,O){if(O||(ge(B!=null,"missing value"),ge(typeof T=="boolean","missing or invalid endian"),ge(W!=null,"missing offset"),ge(W+1<U.length,"trying to write beyond buffer length"),Me(B,65535)),O=U.length,!(O<=W))for(var G=0,Q=Math.min(O-W,2);G<Q;G++)U[W+G]=(B&255<<8*(T?G:1-G))>>>8*(T?G:1-G)}function N(U,B,W,T,O){if(O||(ge(B!=null,"missing value"),ge(typeof T=="boolean","missing or invalid endian"),ge(W!=null,"missing offset"),ge(W+3<U.length,"trying to write beyond buffer length"),Me(B,4294967295)),O=U.length,!(O<=W))for(var G=0,Q=Math.min(O-W,4);G<Q;G++)U[W+G]=B>>>8*(T?G:3-G)&255}function H(U,B,W,T,O){O||(ge(B!=null,"missing value"),ge(typeof T=="boolean","missing or invalid endian"),ge(W!=null,"missing offset"),ge(W+1<U.length,"Trying to write beyond buffer length"),Ie(B,32767,-32768)),U.length<=W||b(U,0<=B?B:65535+B+1,W,T,O)}function ae(U,B,W,T,O){O||(ge(B!=null,"missing value"),ge(typeof T=="boolean","missing or invalid endian"),ge(W!=null,"missing offset"),ge(W+3<U.length,"Trying to write beyond buffer length"),Ie(B,2147483647,-2147483648)),U.length<=W||N(U,0<=B?B:4294967295+B+1,W,T,O)}function V(U,B,W,T,O){O||(ge(B!=null,"missing value"),ge(typeof T=="boolean","missing or invalid endian"),ge(W!=null,"missing offset"),ge(W+3<U.length,"Trying to write beyond buffer length"),Ue(B,34028234663852886e22,-34028234663852886e22)),U.length<=W||w.write(U,B,W,T,23,4)}function J(U,B,W,T,O){O||(ge(B!=null,"missing value"),ge(typeof T=="boolean","missing or invalid endian"),ge(W!=null,"missing offset"),ge(W+7<U.length,"Trying to write beyond buffer length"),Ue(B,17976931348623157e292,-17976931348623157e292)),U.length<=W||w.write(U,B,W,T,52,8)}r.Buffer=v,r.SlowBuffer=v,r.INSPECT_MAX_BYTES=50,v.poolSize=8192,v._useTypedArrays=function(){try{var U=new ArrayBuffer(0),B=new Uint8Array(U);return B.foo=function(){return 42},B.foo()===42&&typeof B.subarray=="function"}catch{return!1}}(),v.isEncoding=function(U){switch(String(U).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"raw":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},v.isBuffer=function(U){return!(U==null||!U._isBuffer)},v.byteLength=function(U,B){var W;switch(U+="",B||"utf8"){case"hex":W=U.length/2;break;case"utf8":case"utf-8":W=we(U).length;break;case"ascii":case"binary":case"raw":W=U.length;break;case"base64":W=be(U).length;break;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":W=2*U.length;break;default:throw new Error("Unknown encoding")}return W},v.concat=function(U,B){if(ge(ue(U),`Usage: Buffer.concat(list, [totalLength])
list should be an Array.`),U.length===0)return new v(0);if(U.length===1)return U[0];if(typeof B!="number")for(O=B=0;O<U.length;O++)B+=U[O].length;for(var W=new v(B),T=0,O=0;O<U.length;O++){var G=U[O];G.copy(W,T),T+=G.length}return W},v.prototype.write=function(U,B,W,T){isFinite(B)?isFinite(W)||(T=W,W=void 0):(oe=T,T=B,B=W,W=oe),B=Number(B)||0;var O,G,Q,Z,oe=this.length-B;switch((!W||oe<(W=Number(W)))&&(W=oe),T=String(T||"utf8").toLowerCase()){case"hex":O=function(me,D,A,z){A=Number(A)||0;var ne=me.length-A;(!z||ne<(z=Number(z)))&&(z=ne),ge((ne=D.length)%2==0,"Invalid hex string"),ne/2<z&&(z=ne/2);for(var te=0;te<z;te++){var se=parseInt(D.substr(2*te,2),16);ge(!isNaN(se),"Invalid hex string"),me[A+te]=se}return v._charsWritten=2*te,te}(this,U,B,W);break;case"utf8":case"utf-8":G=this,Q=B,Z=W,O=v._charsWritten=fe(we(U),G,Q,Z);break;case"ascii":case"binary":O=g(this,U,B,W);break;case"base64":G=this,Q=B,Z=W,O=v._charsWritten=fe(be(U),G,Q,Z);break;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":O=R(this,U,B,W);break;default:throw new Error("Unknown encoding")}return O},v.prototype.toString=function(U,B,W){var T,O,G,Q,Z=this;if(U=String(U||"utf8").toLowerCase(),B=Number(B)||0,(W=W!==void 0?Number(W):Z.length)===B)return"";switch(U){case"hex":T=function(oe,me,D){var A=oe.length;(!me||me<0)&&(me=0),(!D||D<0||A<D)&&(D=A);for(var z="",ne=me;ne<D;ne++)z+=de(oe[ne]);return z}(Z,B,W);break;case"utf8":case"utf-8":T=function(oe,me,D){var A="",z="";D=Math.min(oe.length,D);for(var ne=me;ne<D;ne++)oe[ne]<=127?(A+=ce(z)+String.fromCharCode(oe[ne]),z=""):z+="%"+oe[ne].toString(16);return A+ce(z)}(Z,B,W);break;case"ascii":case"binary":T=E(Z,B,W);break;case"base64":O=Z,Q=W,T=(G=B)===0&&Q===O.length?y.fromByteArray(O):y.fromByteArray(O.slice(G,Q));break;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":T=function(oe,me,D){for(var A=oe.slice(me,D),z="",ne=0;ne<A.length;ne+=2)z+=String.fromCharCode(A[ne]+256*A[ne+1]);return z}(Z,B,W);break;default:throw new Error("Unknown encoding")}return T},v.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}},v.prototype.copy=function(U,B,W,T){if(B=B||0,(T=T||T===0?T:this.length)!==(W=W||0)&&U.length!==0&&this.length!==0){ge(W<=T,"sourceEnd < sourceStart"),ge(0<=B&&B<U.length,"targetStart out of bounds"),ge(0<=W&&W<this.length,"sourceStart out of bounds"),ge(0<=T&&T<=this.length,"sourceEnd out of bounds"),T>this.length&&(T=this.length);var O=(T=U.length-B<T-W?U.length-B+W:T)-W;if(O<100||!v._useTypedArrays)for(var G=0;G<O;G++)U[G+B]=this[G+W];else U._set(this.subarray(W,W+O),B)}},v.prototype.slice=function(U,B){var W=this.length;if(U=ee(U,W,0),B=ee(B,W,W),v._useTypedArrays)return v._augment(this.subarray(U,B));for(var T=B-U,O=new v(T,void 0,!0),G=0;G<T;G++)O[G]=this[G+U];return O},v.prototype.get=function(U){return console.log(".get() is deprecated. Access using array indexes instead."),this.readUInt8(U)},v.prototype.set=function(U,B){return console.log(".set() is deprecated. Access using array indexes instead."),this.writeUInt8(U,B)},v.prototype.readUInt8=function(U,B){if(B||(ge(U!=null,"missing offset"),ge(U<this.length,"Trying to read beyond buffer length")),!(U>=this.length))return this[U]},v.prototype.readUInt16LE=function(U,B){return S(this,U,!0,B)},v.prototype.readUInt16BE=function(U,B){return S(this,U,!1,B)},v.prototype.readUInt32LE=function(U,B){return F(this,U,!0,B)},v.prototype.readUInt32BE=function(U,B){return F(this,U,!1,B)},v.prototype.readInt8=function(U,B){if(B||(ge(U!=null,"missing offset"),ge(U<this.length,"Trying to read beyond buffer length")),!(U>=this.length))return 128&this[U]?-1*(255-this[U]+1):this[U]},v.prototype.readInt16LE=function(U,B){return L(this,U,!0,B)},v.prototype.readInt16BE=function(U,B){return L(this,U,!1,B)},v.prototype.readInt32LE=function(U,B){return I(this,U,!0,B)},v.prototype.readInt32BE=function(U,B){return I(this,U,!1,B)},v.prototype.readFloatLE=function(U,B){return P(this,U,!0,B)},v.prototype.readFloatBE=function(U,B){return P(this,U,!1,B)},v.prototype.readDoubleLE=function(U,B){return M(this,U,!0,B)},v.prototype.readDoubleBE=function(U,B){return M(this,U,!1,B)},v.prototype.writeUInt8=function(U,B,W){W||(ge(U!=null,"missing value"),ge(B!=null,"missing offset"),ge(B<this.length,"trying to write beyond buffer length"),Me(U,255)),B>=this.length||(this[B]=U)},v.prototype.writeUInt16LE=function(U,B,W){b(this,U,B,!0,W)},v.prototype.writeUInt16BE=function(U,B,W){b(this,U,B,!1,W)},v.prototype.writeUInt32LE=function(U,B,W){N(this,U,B,!0,W)},v.prototype.writeUInt32BE=function(U,B,W){N(this,U,B,!1,W)},v.prototype.writeInt8=function(U,B,W){W||(ge(U!=null,"missing value"),ge(B!=null,"missing offset"),ge(B<this.length,"Trying to write beyond buffer length"),Ie(U,127,-128)),B>=this.length||(0<=U?this.writeUInt8(U,B,W):this.writeUInt8(255+U+1,B,W))},v.prototype.writeInt16LE=function(U,B,W){H(this,U,B,!0,W)},v.prototype.writeInt16BE=function(U,B,W){H(this,U,B,!1,W)},v.prototype.writeInt32LE=function(U,B,W){ae(this,U,B,!0,W)},v.prototype.writeInt32BE=function(U,B,W){ae(this,U,B,!1,W)},v.prototype.writeFloatLE=function(U,B,W){V(this,U,B,!0,W)},v.prototype.writeFloatBE=function(U,B,W){V(this,U,B,!1,W)},v.prototype.writeDoubleLE=function(U,B,W){J(this,U,B,!0,W)},v.prototype.writeDoubleBE=function(U,B,W){J(this,U,B,!1,W)},v.prototype.fill=function(U,B,W){if(B=B||0,W=W||this.length,ge(typeof(U=typeof(U=U||0)=="string"?U.charCodeAt(0):U)=="number"&&!isNaN(U),"value is not a number"),ge(B<=W,"end < start"),W!==B&&this.length!==0){ge(0<=B&&B<this.length,"start out of bounds"),ge(0<=W&&W<=this.length,"end out of bounds");for(var T=B;T<W;T++)this[T]=U}},v.prototype.inspect=function(){for(var U=[],B=this.length,W=0;W<B;W++)if(U[W]=de(this[W]),W===r.INSPECT_MAX_BYTES){U[W+1]="...";break}return"<Buffer "+U.join(" ")+">"},v.prototype.toArrayBuffer=function(){if(typeof Uint8Array>"u")throw new Error("Buffer.toArrayBuffer not supported in this browser");if(v._useTypedArrays)return new v(this).buffer;for(var U=new Uint8Array(this.length),B=0,W=U.length;B<W;B+=1)U[B]=this[B];return U.buffer};var q=v.prototype;function ee(U,B,W){return typeof U!="number"?W:B<=(U=~~U)?B:0<=U||0<=(U+=B)?U:0}function K(U){return(U=~~Math.ceil(+U))<0?0:U}function ue(U){return(Array.isArray||function(B){return Object.prototype.toString.call(B)==="[object Array]"})(U)}function de(U){return U<16?"0"+U.toString(16):U.toString(16)}function we(U){for(var B=[],W=0;W<U.length;W++){var T=U.charCodeAt(W);if(T<=127)B.push(U.charCodeAt(W));else for(var O=W,G=(55296<=T&&T<=57343&&W++,encodeURIComponent(U.slice(O,W+1)).substr(1).split("%")),Q=0;Q<G.length;Q++)B.push(parseInt(G[Q],16))}return B}function be(U){return y.toByteArray(U)}function fe(U,B,W,T){for(var O=0;O<T&&!(O+W>=B.length||O>=U.length);O++)B[O+W]=U[O];return O}function ce(U){try{return decodeURIComponent(U)}catch{return"�"}}function Me(U,B){ge(typeof U=="number","cannot write a non-number as a number"),ge(0<=U,"specified a negative value for writing an unsigned value"),ge(U<=B,"value is larger than maximum value for type"),ge(Math.floor(U)===U,"value has a fractional component")}function Ie(U,B,W){ge(typeof U=="number","cannot write a non-number as a number"),ge(U<=B,"value larger than maximum allowed value"),ge(W<=U,"value smaller than minimum allowed value"),ge(Math.floor(U)===U,"value has a fractional component")}function Ue(U,B,W){ge(typeof U=="number","cannot write a non-number as a number"),ge(U<=B,"value larger than maximum allowed value"),ge(W<=U,"value smaller than minimum allowed value")}function ge(U,B){if(!U)throw new Error(B||"Failed assertion")}v._augment=function(U){return U._isBuffer=!0,U._get=U.get,U._set=U.set,U.get=q.get,U.set=q.set,U.write=q.write,U.toString=q.toString,U.toLocaleString=q.toString,U.toJSON=q.toJSON,U.copy=q.copy,U.slice=q.slice,U.readUInt8=q.readUInt8,U.readUInt16LE=q.readUInt16LE,U.readUInt16BE=q.readUInt16BE,U.readUInt32LE=q.readUInt32LE,U.readUInt32BE=q.readUInt32BE,U.readInt8=q.readInt8,U.readInt16LE=q.readInt16LE,U.readInt16BE=q.readInt16BE,U.readInt32LE=q.readInt32LE,U.readInt32BE=q.readInt32BE,U.readFloatLE=q.readFloatLE,U.readFloatBE=q.readFloatBE,U.readDoubleLE=q.readDoubleLE,U.readDoubleBE=q.readDoubleBE,U.writeUInt8=q.writeUInt8,U.writeUInt16LE=q.writeUInt16LE,U.writeUInt16BE=q.writeUInt16BE,U.writeUInt32LE=q.writeUInt32LE,U.writeUInt32BE=q.writeUInt32BE,U.writeInt8=q.writeInt8,U.writeInt16LE=q.writeInt16LE,U.writeInt16BE=q.writeInt16BE,U.writeInt32LE=q.writeInt32LE,U.writeInt32BE=q.writeInt32BE,U.writeFloatLE=q.writeFloatLE,U.writeFloatBE=q.writeFloatBE,U.writeDoubleLE=q.writeDoubleLE,U.writeDoubleBE=q.writeDoubleBE,U.fill=q.fill,U.inspect=q.inspect,U.toArrayBuffer=q.toArrayBuffer,U}}).call(this,t("lYpoI2"),typeof self<"u"?self:typeof window<"u"?window:{},t("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/buffer/index.js","/node_modules/gulp-browserify/node_modules/buffer")},{"base64-js":2,buffer:3,ieee754:10,lYpoI2:11}],4:[function(t,i,r){(function(o,a,y,h,d,f,m,_,x){var y=t("buffer").Buffer,w=4,v=new y(w);v.fill(0),i.exports={hash:function(g,R,E,S){for(var F=R(function(b,N){b.length%w!=0&&(H=b.length+(w-b.length%w),b=y.concat([b,v],H));for(var H,ae=[],V=N?b.readInt32BE:b.readInt32LE,J=0;J<b.length;J+=w)ae.push(V.call(b,J));return ae}(g=y.isBuffer(g)?g:new y(g),S),8*g.length),R=S,L=new y(E),I=R?L.writeInt32BE:L.writeInt32LE,P=0;P<F.length;P++)I.call(L,F[P],4*P,!0);return L}}}).call(this,t("lYpoI2"),typeof self<"u"?self:typeof window<"u"?window:{},t("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/crypto-browserify/helpers.js","/node_modules/gulp-browserify/node_modules/crypto-browserify")},{buffer:3,lYpoI2:11}],5:[function(t,i,r){(function(o,a,y,h,d,f,m,_,x){var y=t("buffer").Buffer,w=t("./sha"),v=t("./sha256"),g=t("./rng"),R={sha1:w,sha256:v,md5:t("./md5")},E=64,S=new y(E);function F(b,N){var H=R[b=b||"sha1"],ae=[];return H||L("algorithm:",b,"is not yet supported"),{update:function(V){return y.isBuffer(V)||(V=new y(V)),ae.push(V),V.length,this},digest:function(V){var J=y.concat(ae),J=N?function(q,ee,K){y.isBuffer(ee)||(ee=new y(ee)),y.isBuffer(K)||(K=new y(K)),ee.length>E?ee=q(ee):ee.length<E&&(ee=y.concat([ee,S],E));for(var ue=new y(E),de=new y(E),we=0;we<E;we++)ue[we]=54^ee[we],de[we]=92^ee[we];return K=q(y.concat([ue,K])),q(y.concat([de,K]))}(H,N,J):H(J);return ae=null,V?J.toString(V):J}}}function L(){var b=[].slice.call(arguments).join(" ");throw new Error([b,"we accept pull requests","http://github.com/dominictarr/crypto-browserify"].join(`
`))}S.fill(0),r.createHash=function(b){return F(b)},r.createHmac=F,r.randomBytes=function(b,N){if(!N||!N.call)return new y(g(b));try{N.call(this,void 0,new y(g(b)))}catch(H){N(H)}};var I,P=["createCredentials","createCipher","createCipheriv","createDecipher","createDecipheriv","createSign","createVerify","createDiffieHellman","pbkdf2"],M=function(b){r[b]=function(){L("sorry,",b,"is not implemented yet")}};for(I in P)M(P[I])}).call(this,t("lYpoI2"),typeof self<"u"?self:typeof window<"u"?window:{},t("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/crypto-browserify/index.js","/node_modules/gulp-browserify/node_modules/crypto-browserify")},{"./md5":6,"./rng":7,"./sha":8,"./sha256":9,buffer:3,lYpoI2:11}],6:[function(t,i,r){(function(o,a,c,h,d,f,m,_,x){var y=t("./helpers");function w(L,I){L[I>>5]|=128<<I%32,L[14+(I+64>>>9<<4)]=I;for(var P=1732584193,M=-271733879,b=-1732584194,N=271733878,H=0;H<L.length;H+=16){var ae=P,V=M,J=b,q=N,P=g(P,M,b,N,L[H+0],7,-680876936),N=g(N,P,M,b,L[H+1],12,-389564586),b=g(b,N,P,M,L[H+2],17,606105819),M=g(M,b,N,P,L[H+3],22,-1044525330);P=g(P,M,b,N,L[H+4],7,-176418897),N=g(N,P,M,b,L[H+5],12,1200080426),b=g(b,N,P,M,L[H+6],17,-1473231341),M=g(M,b,N,P,L[H+7],22,-45705983),P=g(P,M,b,N,L[H+8],7,1770035416),N=g(N,P,M,b,L[H+9],12,-1958414417),b=g(b,N,P,M,L[H+10],17,-42063),M=g(M,b,N,P,L[H+11],22,-1990404162),P=g(P,M,b,N,L[H+12],7,1804603682),N=g(N,P,M,b,L[H+13],12,-40341101),b=g(b,N,P,M,L[H+14],17,-1502002290),P=R(P,M=g(M,b,N,P,L[H+15],22,1236535329),b,N,L[H+1],5,-165796510),N=R(N,P,M,b,L[H+6],9,-1069501632),b=R(b,N,P,M,L[H+11],14,643717713),M=R(M,b,N,P,L[H+0],20,-373897302),P=R(P,M,b,N,L[H+5],5,-701558691),N=R(N,P,M,b,L[H+10],9,38016083),b=R(b,N,P,M,L[H+15],14,-660478335),M=R(M,b,N,P,L[H+4],20,-405537848),P=R(P,M,b,N,L[H+9],5,568446438),N=R(N,P,M,b,L[H+14],9,-1019803690),b=R(b,N,P,M,L[H+3],14,-187363961),M=R(M,b,N,P,L[H+8],20,1163531501),P=R(P,M,b,N,L[H+13],5,-1444681467),N=R(N,P,M,b,L[H+2],9,-51403784),b=R(b,N,P,M,L[H+7],14,1735328473),P=E(P,M=R(M,b,N,P,L[H+12],20,-1926607734),b,N,L[H+5],4,-378558),N=E(N,P,M,b,L[H+8],11,-2022574463),b=E(b,N,P,M,L[H+11],16,1839030562),M=E(M,b,N,P,L[H+14],23,-35309556),P=E(P,M,b,N,L[H+1],4,-1530992060),N=E(N,P,M,b,L[H+4],11,1272893353),b=E(b,N,P,M,L[H+7],16,-155497632),M=E(M,b,N,P,L[H+10],23,-1094730640),P=E(P,M,b,N,L[H+13],4,681279174),N=E(N,P,M,b,L[H+0],11,-358537222),b=E(b,N,P,M,L[H+3],16,-722521979),M=E(M,b,N,P,L[H+6],23,76029189),P=E(P,M,b,N,L[H+9],4,-640364487),N=E(N,P,M,b,L[H+12],11,-421815835),b=E(b,N,P,M,L[H+15],16,530742520),P=S(P,M=E(M,b,N,P,L[H+2],23,-995338651),b,N,L[H+0],6,-198630844),N=S(N,P,M,b,L[H+7],10,1126891415),b=S(b,N,P,M,L[H+14],15,-1416354905),M=S(M,b,N,P,L[H+5],21,-57434055),P=S(P,M,b,N,L[H+12],6,1700485571),N=S(N,P,M,b,L[H+3],10,-1894986606),b=S(b,N,P,M,L[H+10],15,-1051523),M=S(M,b,N,P,L[H+1],21,-2054922799),P=S(P,M,b,N,L[H+8],6,1873313359),N=S(N,P,M,b,L[H+15],10,-30611744),b=S(b,N,P,M,L[H+6],15,-1560198380),M=S(M,b,N,P,L[H+13],21,1309151649),P=S(P,M,b,N,L[H+4],6,-145523070),N=S(N,P,M,b,L[H+11],10,-1120210379),b=S(b,N,P,M,L[H+2],15,718787259),M=S(M,b,N,P,L[H+9],21,-343485551),P=F(P,ae),M=F(M,V),b=F(b,J),N=F(N,q)}return Array(P,M,b,N)}function v(L,I,P,M,b,N){return F((I=F(F(I,L),F(M,N)))<<b|I>>>32-b,P)}function g(L,I,P,M,b,N,H){return v(I&P|~I&M,L,I,b,N,H)}function R(L,I,P,M,b,N,H){return v(I&M|P&~M,L,I,b,N,H)}function E(L,I,P,M,b,N,H){return v(I^P^M,L,I,b,N,H)}function S(L,I,P,M,b,N,H){return v(P^(I|~M),L,I,b,N,H)}function F(L,I){var P=(65535&L)+(65535&I);return(L>>16)+(I>>16)+(P>>16)<<16|65535&P}i.exports=function(L){return y.hash(L,w,16)}}).call(this,t("lYpoI2"),typeof self<"u"?self:typeof window<"u"?window:{},t("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/crypto-browserify/md5.js","/node_modules/gulp-browserify/node_modules/crypto-browserify")},{"./helpers":4,buffer:3,lYpoI2:11}],7:[function(t,i,r){(function(o,a,c,h,d,f,m,_,x){i.exports=function(y){for(var w,v=new Array(y),g=0;g<y;g++)!(3&g)&&(w=4294967296*Math.random()),v[g]=w>>>((3&g)<<3)&255;return v}}).call(this,t("lYpoI2"),typeof self<"u"?self:typeof window<"u"?window:{},t("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/crypto-browserify/rng.js","/node_modules/gulp-browserify/node_modules/crypto-browserify")},{buffer:3,lYpoI2:11}],8:[function(t,i,r){(function(o,a,c,h,d,f,m,_,x){var y=t("./helpers");function w(R,E){R[E>>5]|=128<<24-E%32,R[15+(E+64>>9<<4)]=E;for(var S,F,L,I=Array(80),P=1732584193,M=-271733879,b=-1732584194,N=271733878,H=-1009589776,ae=0;ae<R.length;ae+=16){for(var V=P,J=M,q=b,ee=N,K=H,ue=0;ue<80;ue++){I[ue]=ue<16?R[ae+ue]:g(I[ue-3]^I[ue-8]^I[ue-14]^I[ue-16],1);var de=v(v(g(P,5),(de=M,F=b,L=N,(S=ue)<20?de&F|~de&L:!(S<40)&&S<60?de&F|de&L|F&L:de^F^L)),v(v(H,I[ue]),(S=ue)<20?1518500249:S<40?1859775393:S<60?-1894007588:-899497514)),H=N,N=b,b=g(M,30),M=P,P=de}P=v(P,V),M=v(M,J),b=v(b,q),N=v(N,ee),H=v(H,K)}return Array(P,M,b,N,H)}function v(R,E){var S=(65535&R)+(65535&E);return(R>>16)+(E>>16)+(S>>16)<<16|65535&S}function g(R,E){return R<<E|R>>>32-E}i.exports=function(R){return y.hash(R,w,20,!0)}}).call(this,t("lYpoI2"),typeof self<"u"?self:typeof window<"u"?window:{},t("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/crypto-browserify/sha.js","/node_modules/gulp-browserify/node_modules/crypto-browserify")},{"./helpers":4,buffer:3,lYpoI2:11}],9:[function(t,i,r){(function(o,a,c,h,d,f,m,_,x){function y(E,S){var F=(65535&E)+(65535&S);return(E>>16)+(S>>16)+(F>>16)<<16|65535&F}function w(E,S){var F,L=new Array(1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298),I=new Array(1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225),P=new Array(64);E[S>>5]|=128<<24-S%32,E[15+(S+64>>9<<4)]=S;for(var M,b,N=0;N<E.length;N+=16){for(var H=I[0],ae=I[1],V=I[2],J=I[3],q=I[4],ee=I[5],K=I[6],ue=I[7],de=0;de<64;de++)P[de]=de<16?E[de+N]:y(y(y((b=P[de-2],g(b,17)^g(b,19)^R(b,10)),P[de-7]),(b=P[de-15],g(b,7)^g(b,18)^R(b,3))),P[de-16]),F=y(y(y(y(ue,g(b=q,6)^g(b,11)^g(b,25)),q&ee^~q&K),L[de]),P[de]),M=y(g(M=H,2)^g(M,13)^g(M,22),H&ae^H&V^ae&V),ue=K,K=ee,ee=q,q=y(J,F),J=V,V=ae,ae=H,H=y(F,M);I[0]=y(H,I[0]),I[1]=y(ae,I[1]),I[2]=y(V,I[2]),I[3]=y(J,I[3]),I[4]=y(q,I[4]),I[5]=y(ee,I[5]),I[6]=y(K,I[6]),I[7]=y(ue,I[7])}return I}var v=t("./helpers"),g=function(E,S){return E>>>S|E<<32-S},R=function(E,S){return E>>>S};i.exports=function(E){return v.hash(E,w,32,!0)}}).call(this,t("lYpoI2"),typeof self<"u"?self:typeof window<"u"?window:{},t("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/crypto-browserify/sha256.js","/node_modules/gulp-browserify/node_modules/crypto-browserify")},{"./helpers":4,buffer:3,lYpoI2:11}],10:[function(t,i,r){(function(o,a,c,h,d,f,m,_,x){r.read=function(y,w,v,g,N){var E,S,F=8*N-g-1,L=(1<<F)-1,I=L>>1,P=-7,M=v?N-1:0,b=v?-1:1,N=y[w+M];for(M+=b,E=N&(1<<-P)-1,N>>=-P,P+=F;0<P;E=256*E+y[w+M],M+=b,P-=8);for(S=E&(1<<-P)-1,E>>=-P,P+=g;0<P;S=256*S+y[w+M],M+=b,P-=8);if(E===0)E=1-I;else{if(E===L)return S?NaN:1/0*(N?-1:1);S+=Math.pow(2,g),E-=I}return(N?-1:1)*S*Math.pow(2,E-g)},r.write=function(y,w,v,g,R,H){var S,F,L=8*H-R-1,I=(1<<L)-1,P=I>>1,M=R===23?Math.pow(2,-24)-Math.pow(2,-77):0,b=g?0:H-1,N=g?1:-1,H=w<0||w===0&&1/w<0?1:0;for(w=Math.abs(w),isNaN(w)||w===1/0?(F=isNaN(w)?1:0,S=I):(S=Math.floor(Math.log(w)/Math.LN2),w*(g=Math.pow(2,-S))<1&&(S--,g*=2),2<=(w+=1<=S+P?M/g:M*Math.pow(2,1-P))*g&&(S++,g/=2),I<=S+P?(F=0,S=I):1<=S+P?(F=(w*g-1)*Math.pow(2,R),S+=P):(F=w*Math.pow(2,P-1)*Math.pow(2,R),S=0));8<=R;y[v+b]=255&F,b+=N,F/=256,R-=8);for(S=S<<R|F,L+=R;0<L;y[v+b]=255&S,b+=N,S/=256,L-=8);y[v+b-N]|=128*H}}).call(this,t("lYpoI2"),typeof self<"u"?self:typeof window<"u"?window:{},t("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/ieee754/index.js","/node_modules/gulp-browserify/node_modules/ieee754")},{buffer:3,lYpoI2:11}],11:[function(t,i,r){(function(o,a,c,h,d,f,m,_,x){var y,w,v;function g(){}(o=i.exports={}).nextTick=(w=typeof window<"u"&&window.setImmediate,v=typeof window<"u"&&window.postMessage&&window.addEventListener,w?function(R){return window.setImmediate(R)}:v?(y=[],window.addEventListener("message",function(R){var E=R.source;E!==window&&E!==null||R.data!=="process-tick"||(R.stopPropagation(),0<y.length&&y.shift()())},!0),function(R){y.push(R),window.postMessage("process-tick","*")}):function(R){setTimeout(R,0)}),o.title="browser",o.browser=!0,o.env={},o.argv=[],o.on=g,o.addListener=g,o.once=g,o.off=g,o.removeListener=g,o.removeAllListeners=g,o.emit=g,o.binding=function(R){throw new Error("process.binding is not supported")},o.cwd=function(){return"/"},o.chdir=function(R){throw new Error("process.chdir is not supported")}}).call(this,t("lYpoI2"),typeof self<"u"?self:typeof window<"u"?window:{},t("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/process/browser.js","/node_modules/gulp-browserify/node_modules/process")},{buffer:3,lYpoI2:11}]},{},[1])(1)})})(uA);var hA=["abs","acos","all","any","asin","atan","ceil","clamp","cos","cross","dFdx","dFdy","degrees","distance","dot","equal","exp","exp2","faceforward","floor","fract","gl_BackColor","gl_BackLightModelProduct","gl_BackLightProduct","gl_BackMaterial","gl_BackSecondaryColor","gl_ClipPlane","gl_ClipVertex","gl_Color","gl_DepthRange","gl_DepthRangeParameters","gl_EyePlaneQ","gl_EyePlaneR","gl_EyePlaneS","gl_EyePlaneT","gl_Fog","gl_FogCoord","gl_FogFragCoord","gl_FogParameters","gl_FragColor","gl_FragCoord","gl_FragData","gl_FragDepth","gl_FragDepthEXT","gl_FrontColor","gl_FrontFacing","gl_FrontLightModelProduct","gl_FrontLightProduct","gl_FrontMaterial","gl_FrontSecondaryColor","gl_LightModel","gl_LightModelParameters","gl_LightModelProducts","gl_LightProducts","gl_LightSource","gl_LightSourceParameters","gl_MaterialParameters","gl_MaxClipPlanes","gl_MaxCombinedTextureImageUnits","gl_MaxDrawBuffers","gl_MaxFragmentUniformComponents","gl_MaxLights","gl_MaxTextureCoords","gl_MaxTextureImageUnits","gl_MaxTextureUnits","gl_MaxVaryingFloats","gl_MaxVertexAttribs","gl_MaxVertexTextureImageUnits","gl_MaxVertexUniformComponents","gl_ModelViewMatrix","gl_ModelViewMatrixInverse","gl_ModelViewMatrixInverseTranspose","gl_ModelViewMatrixTranspose","gl_ModelViewProjectionMatrix","gl_ModelViewProjectionMatrixInverse","gl_ModelViewProjectionMatrixInverseTranspose","gl_ModelViewProjectionMatrixTranspose","gl_MultiTexCoord0","gl_MultiTexCoord1","gl_MultiTexCoord2","gl_MultiTexCoord3","gl_MultiTexCoord4","gl_MultiTexCoord5","gl_MultiTexCoord6","gl_MultiTexCoord7","gl_Normal","gl_NormalMatrix","gl_NormalScale","gl_ObjectPlaneQ","gl_ObjectPlaneR","gl_ObjectPlaneS","gl_ObjectPlaneT","gl_Point","gl_PointCoord","gl_PointParameters","gl_PointSize","gl_Position","gl_ProjectionMatrix","gl_ProjectionMatrixInverse","gl_ProjectionMatrixInverseTranspose","gl_ProjectionMatrixTranspose","gl_SecondaryColor","gl_TexCoord","gl_TextureEnvColor","gl_TextureMatrix","gl_TextureMatrixInverse","gl_TextureMatrixInverseTranspose","gl_TextureMatrixTranspose","gl_Vertex","greaterThan","greaterThanEqual","inversesqrt","length","lessThan","lessThanEqual","log","log2","matrixCompMult","max","min","mix","mod","normalize","not","notEqual","pow","radians","reflect","refract","sign","sin","smoothstep","sqrt","step","tan","texture2D","texture2DLod","texture2DProj","texture2DProjLod","textureCube","textureCubeLod","texture2DLodEXT","texture2DProjLodEXT","textureCubeLodEXT","texture2DGradEXT","texture2DProjGradEXT","textureCubeGradEXT"],vu=hA;vu=vu.slice().filter(function(n){return!/^(gl\_|texture)/.test(n)});vu.concat(["gl_VertexID","gl_InstanceID","gl_Position","gl_PointSize","gl_FragCoord","gl_FrontFacing","gl_FragDepth","gl_PointCoord","gl_MaxVertexAttribs","gl_MaxVertexUniformVectors","gl_MaxVertexOutputVectors","gl_MaxFragmentInputVectors","gl_MaxVertexTextureImageUnits","gl_MaxCombinedTextureImageUnits","gl_MaxTextureImageUnits","gl_MaxFragmentUniformVectors","gl_MaxDrawBuffers","gl_MinProgramTexelOffset","gl_MaxProgramTexelOffset","gl_DepthRangeParameters","gl_DepthRange","trunc","round","roundEven","isnan","isinf","floatBitsToInt","floatBitsToUint","intBitsToFloat","uintBitsToFloat","packSnorm2x16","unpackSnorm2x16","packUnorm2x16","unpackUnorm2x16","packHalf2x16","unpackHalf2x16","outerProduct","transpose","determinant","inverse","texture","textureSize","textureProj","textureLod","textureOffset","texelFetch","texelFetchOffset","textureProjOffset","textureLodOffset","textureProjLod","textureProjLodOffset","textureGrad","textureGradOffset","textureProjGrad","textureProjGradOffset"]);function dA(n,e){if(typeof n!="object"||n===null)return n;var t=n[Symbol.toPrimitive];if(t!==void 0){var i=t.call(n,e);if(typeof i!="object")return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return(e==="string"?String:Number)(n)}function fA(n){var e=dA(n,"string");return typeof e=="symbol"?e:String(e)}function yt(n,e,t){return e=fA(e),e in n?Object.defineProperty(n,e,{value:t,enumerable:!0,configurable:!0,writable:!0}):n[e]=t,n}var $e={position:"csm_Position",positionRaw:"csm_PositionRaw",pointSize:"csm_PointSize",fragColor:"csm_FragColor",diffuseColor:"csm_DiffuseColor",normal:"csm_Normal",roughness:"csm_Roughness",metalness:"csm_Metalness",emissive:"csm_Emissive",ao:"csm_AO",bump:"csm_Bump",depthAlpha:"csm_DepthAlpha"},bn,cs;bn={},yt(bn,"".concat($e.normal),{"#include <beginnormal_vertex>":`
    vec3 objectNormal = `.concat($e.normal,`;
    #ifdef USE_TANGENT
	    vec3 objectTangent = vec3( tangent.xyz );
    #endif
    `)}),yt(bn,"".concat($e.position),{"#include <begin_vertex>":`
    vec3 transformed = `.concat($e.position,`;
  `)}),yt(bn,"".concat($e.positionRaw),{"#include <begin_vertex>":`
    vec4 csm_internal_positionUnprojected = `.concat($e.positionRaw,`;
    mat4x4 csm_internal_unprojectMatrix = projectionMatrix * modelViewMatrix;
    #ifdef USE_INSTANCING
      csm_internal_unprojectMatrix = csm_internal_unprojectMatrix * instanceMatrix;
    #endif
    csm_internal_positionUnprojected = inverse(csm_internal_unprojectMatrix) * csm_internal_positionUnprojected;
    vec3 transformed = csm_internal_positionUnprojected.xyz;
  `)}),yt(bn,"".concat($e.pointSize),{"gl_PointSize = size;":`
    gl_PointSize = `.concat($e.pointSize,`;
    `)}),yt(bn,"".concat($e.diffuseColor),{"#include <color_fragment>":`
    #include <color_fragment>
    diffuseColor = `.concat($e.diffuseColor,`;
  `)}),yt(bn,"".concat($e.fragColor),{"#include <dithering_fragment>":`
    #include <dithering_fragment>
    gl_FragColor  = `.concat($e.fragColor,`;
  `)}),yt(bn,"".concat($e.emissive),{"vec3 totalEmissiveRadiance = emissive;":`
    vec3 totalEmissiveRadiance = `.concat($e.emissive,`;
    `)}),yt(bn,"".concat($e.roughness),{"#include <roughnessmap_fragment>":`
    #include <roughnessmap_fragment>
    roughnessFactor = `.concat($e.roughness,`;
    `)}),yt(bn,"".concat($e.metalness),{"#include <metalnessmap_fragment>":`
    #include <metalnessmap_fragment>
    metalnessFactor = `.concat($e.metalness,`;
    `)}),yt(bn,"".concat($e.ao),{"#include <aomap_fragment>":`
    #include <aomap_fragment>
    reflectedLight.indirectDiffuse *= 1. - `.concat($e.ao,`;
    `)}),yt(bn,"".concat($e.bump),{"#include <normal_fragment_maps>":`
    #include <normal_fragment_maps>

    vec3 csm_internal_orthogonal = `.concat($e.bump," - (dot(").concat($e.bump,`, normal) * normal);
    vec3 csm_internal_projectedbump = mat3(csm_internal_vModelViewMatrix) * csm_internal_orthogonal;
    normal = normalize(normal - csm_internal_projectedbump);
    `)}),yt(bn,"".concat($e.depthAlpha),{"gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );":`
      gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity * `.concat($e.depthAlpha,` );
    `),"gl_FragColor = packDepthToRGBA( fragCoordZ );":`
      gl_FragColor = packDepthToRGBA( fragCoordZ );
      gl_FragColor.a *= `.concat($e.depthAlpha,`;
    `)});cs={},yt(cs,"".concat($e.position),{"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );":`
    gl_Position = projectionMatrix * modelViewMatrix * vec4( `.concat($e.position,`, 1.0 );
  `)}),yt(cs,"".concat($e.positionRaw),{"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );":`
    gl_Position = `.concat($e.position,`;
  `)}),yt(cs,"".concat($e.diffuseColor),{"gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );":`
    gl_FragColor = `.concat($e.diffuseColor,`;
  `)}),yt(cs,"".concat($e.fragColor),{"gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );":`
    gl_FragColor = `.concat($e.fragColor,`;
  `)});var yn;yn={},yt(yn,"".concat($e.position),"*"),yt(yn,"".concat($e.positionRaw),"*"),yt(yn,"".concat($e.normal),"*"),yt(yn,"".concat($e.pointSize),["PointsMaterial"]),yt(yn,"".concat($e.diffuseColor),"*"),yt(yn,"".concat($e.fragColor),"*"),yt(yn,"".concat($e.emissive),["MeshStandardMaterial","MeshPhysicalMaterial"]),yt(yn,"".concat($e.roughness),["MeshStandardMaterial","MeshPhysicalMaterial"]),yt(yn,"".concat($e.metalness),["MeshStandardMaterial","MeshPhysicalMaterial"]),yt(yn,"".concat($e.ao),["MeshStandardMaterial","MeshPhysicalMaterial","MeshBasicMaterial","MeshLambertMaterial","MeshPhongMaterial","MeshToonMaterial"]),yt(yn,"".concat($e.bump),["MeshLambertMaterial","MeshMatcapMaterial","MeshNormalMaterial","MeshPhongMaterial","MeshPhysicalMaterial","MeshStandardMaterial","MeshToonMaterial","ShadowMaterial"]),yt(yn,"".concat($e.depthAlpha),"*");new Rr;new $;Pe.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new Oe(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};jn.line={uniforms:gl.merge([Pe.common,Pe.fog,Pe.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
				vUv = uv;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			float alpha = opacity;

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};new $;new $;new It;new It;new It;new $;new Ut;new nC;new $;new Rr;new fl;new It;const pA={key:0,args:[0,1,64]},mA={key:1,args:[.5,1,64]},gA={key:2},vA=["tone-mapped","map","side","color"];new lt(16777215);const _A=["geometry"],xA=["map","opacity","depth-write"],bA=["object"],yA=["args"],wA=["rotation","args"],MA=ri({__name:"ContactShadows",props:{opacity:{default:1},width:{default:1},height:{default:1},blur:{default:1},far:{default:10},smooth:{type:Boolean,default:!0},resolution:{default:512},frames:{default:Number.POSITIVE_INFINITY},scale:{default:10},color:{default:"#000000"},depthWrite:{type:Boolean,default:!1},helper:{type:Boolean,default:!1}},setup(n,{expose:e}){const t=n,i=Kc(),r=Kc();e(i);let o,a,c,h,d;const{renderer:f,scene:m}=Ju(),_=$n(()=>t.width*(Array.isArray(t.scale)?t.scale[0]:t.scale||1)),x=$n(()=>t.height*(Array.isArray(t.scale)?t.scale[1]:t.scale||1));Ba(()=>{o&&o.dispose(),a&&a.dispose(),c&&c.dispose(),h&&h.geometry.dispose(),o=new ii(t.resolution,t.resolution),a=new ii(t.resolution,t.resolution),a.texture.generateMipmaps=o.texture.generateMipmaps=!1,r.value=new Yi(-_.value/2,_.value/2,x.value/2,-x.value/2,0,t.far),c=new Ps(_.value,x.value).rotateX(Math.PI/2),h=new gn(c),h.visible=!1}),Ba(()=>{t.color&&(d&&d.dispose(),d=new fg,d.depthTest=d.depthWrite=!1,d.onBeforeCompile=F=>{F.uniforms={...F.uniforms,ucolor:{value:t.color?new lt(t.color):new lt}},F.fragmentShader=F.fragmentShader.replace("void main() {",`uniform vec3 ucolor;
             void main() {
            `),F.fragmentShader=F.fragmentShader.replace("vec4( vec3( 1.0 - fragCoordZ ), opacity );","vec4( ucolor * fragCoordZ * 2.0, ( 1.0 - fragCoordZ ) * 1.0 );")})});const y=new wn(YC),w=new wn(KC);w.depthTest=y.depthTest=!1;function v(F){!f.value||!r.value||(h.visible=!0,h.material=y,y.uniforms.tDiffuse.value=o.texture,y.uniforms.h.value=F/256,f.value.setRenderTarget(a),f.value.render(h,r.value),h.material=w,w.uniforms.tDiffuse.value=a.texture,w.uniforms.v.value=F/256,f.value.setRenderTarget(o),f.value.render(h,r.value),h.visible=!1)}const{onLoop:g}=Ls();let R=0,E,S;return g(()=>{!r.value||m.value===void 0||f.value===void 0||(t.frames===Number.POSITIVE_INFINITY||R<t.frames)&&(R++,E=m.value.background,S=m.value.overrideMaterial,i.value.visible=!1,m.value.background=null,m.value.overrideMaterial=d,f.value.setRenderTarget(o),f.value.render(m.value,r.value),v(t.blur),t.smooth&&v(t.blur*.4),f.value.setRenderTarget(null),i.value.visible=!0,m.value.background=E,m.value.overrideMaterial=S)}),(F,L)=>(Gt(),en("TresGroup",Cm({ref_key:"groupRef",ref:i},F.$attrs),[gt("TresMesh",{scale:[1,-1,1],geometry:st(c)},[gt("TresMeshBasicMaterial",{map:st(o).texture,opacity:F.opacity,"depth-write":F.depthWrite,transparent:!0},null,8,xA)],8,_A),gt("primitive",{object:st(h)},null,8,bA),r.value&&F.helper?(Gt(),en("TresCameraHelper",{key:0,args:[r.value]},null,8,yA)):Fu("",!0),gt("TresOrthographicCamera",{ref_key:"shadowCamera",ref:r,position:[0,0,0],rotation:[Math.PI/2,0,0],args:[-_.value/2,_.value/2,x.value/2,-x.value/2,0,F.far]},null,8,wA)],16))}});class nh extends gn{constructor(){const e=nh.SkyShader,t=new wn({name:e.name,uniforms:gl.clone(e.uniforms),vertexShader:e.vertexShader,fragmentShader:e.fragmentShader,side:vn,depthWrite:!1});super(new As(1,1,1),t),this.isSky=!0}}nh.SkyShader={name:"SkyShader",uniforms:{turbidity:{value:2},rayleigh:{value:1},mieCoefficient:{value:.005},mieDirectionalG:{value:.8},sunPosition:{value:new $},up:{value:new $(0,1,0)}},vertexShader:`
		uniform vec3 sunPosition;
		uniform float rayleigh;
		uniform float turbidity;
		uniform float mieCoefficient;
		uniform vec3 up;

		varying vec3 vWorldPosition;
		varying vec3 vSunDirection;
		varying float vSunfade;
		varying vec3 vBetaR;
		varying vec3 vBetaM;
		varying float vSunE;

		// constants for atmospheric scattering
		const float e = 2.71828182845904523536028747135266249775724709369995957;
		const float pi = 3.141592653589793238462643383279502884197169;

		// wavelength of used primaries, according to preetham
		const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );
		// this pre-calcuation replaces older TotalRayleigh(vec3 lambda) function:
		// (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
		const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );

		// mie stuff
		// K coefficient for the primaries
		const float v = 4.0;
		const vec3 K = vec3( 0.686, 0.678, 0.666 );
		// MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
		const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );

		// earth shadow hack
		// cutoffAngle = pi / 1.95;
		const float cutoffAngle = 1.6110731556870734;
		const float steepness = 1.5;
		const float EE = 1000.0;

		float sunIntensity( float zenithAngleCos ) {
			zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );
			return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );
		}

		vec3 totalMie( float T ) {
			float c = ( 0.2 * T ) * 10E-18;
			return 0.434 * c * MieConst;
		}

		void main() {

			vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
			vWorldPosition = worldPosition.xyz;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			gl_Position.z = gl_Position.w; // set z to camera.far

			vSunDirection = normalize( sunPosition );

			vSunE = sunIntensity( dot( vSunDirection, up ) );

			vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y / 450000.0 ) ), 0.0, 1.0 );

			float rayleighCoefficient = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );

			// extinction (absorbtion + out scattering)
			// rayleigh coefficients
			vBetaR = totalRayleigh * rayleighCoefficient;

			// mie coefficients
			vBetaM = totalMie( turbidity ) * mieCoefficient;

		}`,fragmentShader:`
		varying vec3 vWorldPosition;
		varying vec3 vSunDirection;
		varying float vSunfade;
		varying vec3 vBetaR;
		varying vec3 vBetaM;
		varying float vSunE;

		uniform float mieDirectionalG;
		uniform vec3 up;

		// constants for atmospheric scattering
		const float pi = 3.141592653589793238462643383279502884197169;

		const float n = 1.0003; // refractive index of air
		const float N = 2.545E25; // number of molecules per unit volume for air at 288.15K and 1013mb (sea level -45 celsius)

		// optical length at zenith for molecules
		const float rayleighZenithLength = 8.4E3;
		const float mieZenithLength = 1.25E3;
		// 66 arc seconds -> degrees, and the cosine of that
		const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;

		// 3.0 / ( 16.0 * pi )
		const float THREE_OVER_SIXTEENPI = 0.05968310365946075;
		// 1.0 / ( 4.0 * pi )
		const float ONE_OVER_FOURPI = 0.07957747154594767;

		float rayleighPhase( float cosTheta ) {
			return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) );
		}

		float hgPhase( float cosTheta, float g ) {
			float g2 = pow( g, 2.0 );
			float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 );
			return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse );
		}

		void main() {

			vec3 direction = normalize( vWorldPosition - cameraPosition );

			// optical length
			// cutoff angle at 90 to avoid singularity in next formula.
			float zenithAngle = acos( max( 0.0, dot( up, direction ) ) );
			float inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );
			float sR = rayleighZenithLength * inverse;
			float sM = mieZenithLength * inverse;

			// combined extinction factor
			vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );

			// in scattering
			float cosTheta = dot( direction, vSunDirection );

			float rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );
			vec3 betaRTheta = vBetaR * rPhase;

			float mPhase = hgPhase( cosTheta, mieDirectionalG );
			vec3 betaMTheta = vBetaM * mPhase;

			vec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );
			Lin *= mix( vec3( 1.0 ), pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ), clamp( pow( 1.0 - dot( up, vSunDirection ), 5.0 ), 0.0, 1.0 ) );

			// nightsky
			float theta = acos( direction.y ); // elevation --> y-axis, [-pi/2, pi/2]
			float phi = atan( direction.z, direction.x ); // azimuth --> x-axis [-pi/2, pi/2]
			vec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );
			vec3 L0 = vec3( 0.1 ) * Fex;

			// composition + solar disc
			float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );
			L0 += ( vSunE * 19000.0 * Fex ) * sundisk;

			vec3 texColor = ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );

			vec3 retColor = pow( texColor, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) );

			gl_FragColor = vec4( retColor, 1.0 );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>

		}`};var EA={exports:{}};(function(n,e){(function(t,i){n.exports=i()})(cA,function(){var t=function(){function i(x){return a.appendChild(x.dom),x}function r(x){for(var y=0;y<a.children.length;y++)a.children[y].style.display=y===x?"block":"none";o=x}var o=0,a=document.createElement("div");a.style.cssText="position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000",a.addEventListener("click",function(x){x.preventDefault(),r(++o%a.children.length)},!1);var c=(performance||Date).now(),h=c,d=0,f=i(new t.Panel("FPS","#0ff","#002")),m=i(new t.Panel("MS","#0f0","#020"));if(self.performance&&self.performance.memory)var _=i(new t.Panel("MB","#f08","#201"));return r(0),{REVISION:16,dom:a,addPanel:i,showPanel:r,begin:function(){c=(performance||Date).now()},end:function(){d++;var x=(performance||Date).now();if(m.update(x-c,200),x>h+1e3&&(f.update(1e3*d/(x-h),100),h=x,d=0,_)){var y=performance.memory;_.update(y.usedJSHeapSize/1048576,y.jsHeapSizeLimit/1048576)}return x},update:function(){c=this.end()},domElement:a,setMode:r}};return t.Panel=function(i,r,o){var a=1/0,c=0,h=Math.round,d=h(window.devicePixelRatio||1),f=80*d,m=48*d,_=3*d,x=2*d,y=3*d,w=15*d,v=74*d,g=30*d,R=document.createElement("canvas");R.width=f,R.height=m,R.style.cssText="width:80px;height:48px";var E=R.getContext("2d");return E.font="bold "+9*d+"px Helvetica,Arial,sans-serif",E.textBaseline="top",E.fillStyle=o,E.fillRect(0,0,f,m),E.fillStyle=r,E.fillText(i,_,x),E.fillRect(y,w,v,g),E.fillStyle=o,E.globalAlpha=.9,E.fillRect(y,w,v,g),{dom:R,update:function(S,F){a=Math.min(a,S),c=Math.max(c,S),E.fillStyle=o,E.globalAlpha=1,E.fillRect(0,0,f,w),E.fillStyle=r,E.fillText(h(S)+" "+i+" ("+h(a)+"-"+h(c)+")",_,x),E.drawImage(R,y+d,w,v-d,g,y,w,v-d,g),E.fillRect(y+v-d,w,d,g),E.fillStyle=o,E.globalAlpha=.9,E.fillRect(y+v-d,w,d,h((1-S/F)*g))}}},t})})(EA);var SA=`#include <common>

void main() {
  vec2 center = vec2(0., 1.);
  float rotation = 0.0;

  
  
  float size = 0.03;

  vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
  vec2 scale;
  scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
  scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );

  bool isPerspective = isPerspectiveMatrix( projectionMatrix );
  if ( isPerspective ) scale *= - mvPosition.z;

  vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale * size;
  vec2 rotatedPosition;
  rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
  rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
  mvPosition.xy += rotatedPosition;

  gl_Position = projectionMatrix * mvPosition;
}`,TA=`void main() {
  gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
}`;const Lo=new $(0,0,0),ih=new $(0,0,0),CA=new $(0,0,0);function yp(n,e,t){const i=Lo.setFromMatrixPosition(n.matrixWorld);i.project(e);const r=t.width/2,o=t.height/2;return[(Number.isNaN(i.x)?0:i.x)*r+r,-(i.y*o)+o]}function AA(n,e){const t=Lo.setFromMatrixPosition(n.matrixWorld),i=ih.setFromMatrixPosition(e.matrixWorld),r=t.sub(i),o=e.getWorldDirection(CA);return r.angleTo(o)>Math.PI/2}function PA(n,e,t,i){const r=Lo.setFromMatrixPosition(n.matrixWorld),o=r.clone();o.project(e),t.setFromCamera(new Oe(o.x,o.y),e);const a=t.intersectObjects(i,!0);if(a.length>0){const c=a[0].distance;return r.distanceTo(t.ray.origin)<c}return!0}function RA(n,e){if(e instanceof Yi)return e.zoom;if(e instanceof Ht){const t=Lo.setFromMatrixPosition(n.matrixWorld),i=ih.setFromMatrixPosition(e.matrixWorld),r=e.fov*Math.PI/180,o=t.distanceTo(i);return 1/(2*Math.tan(r/2)*o)}else return 1}function LA(n,e,t){if(e instanceof Ht||e instanceof Yi){const i=Lo.setFromMatrixPosition(n.matrixWorld),r=ih.setFromMatrixPosition(e.matrixWorld),o=i.distanceTo(r),a=(t[1]-t[0])/(e.far-e.near),c=t[1]-a*e.far;return Math.round(a*o+c)}}const _u=n=>Math.abs(n)<1e-10?0:n;function Dg(n,e,t=""){let i="matrix3d(";for(let r=0;r!==16;r++)i+=_u(e[r]*n.elements[r])+(r!==15?",":")");return t+i}const IA=(n=>e=>Dg(e,n))([1,-1,1,1,1,-1,1,1,1,-1,1,1,1,-1,1,1]),DA=(n=>(e,t)=>Dg(e,n(t),"translate(-50%,-50%)"))(n=>[1/n,1/n,1/n,1,-1/n,-1/n,-1/n,-1,1/n,1/n,1/n,1,1,1,1,1]),UA=["geometry","material"];new Ps;const NA=["position","scale"],OA=["color"],FA=ri({__name:"RotatingBox",props:{position:{}},setup(n){const e=Ot(),t=Ot(!1),i=Ot(!1),{onLoop:r}=Ls();return r(({delta:o})=>{e.value&&(e.value.rotation.x+=o*.5,e.value.rotation.y+=o*.3)}),(o,a)=>(Gt(),en("TresMesh",{ref_key:"boxRef",ref:e,position:n.position,scale:i.value?1.2:1,"cast-shadow":"",onClick:a[0]||(a[0]=c=>i.value=!i.value),onPointerOver:a[1]||(a[1]=c=>t.value=!0),onPointerOut:a[2]||(a[2]=c=>t.value=!1)},[a[3]||(a[3]=gt("TresBoxGeometry",{args:[1.5,1.5,1.5]},null,-1)),gt("TresMeshStandardMaterial",{color:t.value?"#ff6b6b":"#4ecdc4",roughness:.3,metalness:.5},null,8,OA)],40,NA))}}),BA=["position"],kA=ri({__name:"AnimatedSphere",props:{position:{}},setup(n){var o;const e=n,t=Ot(),i=((o=e.position)==null?void 0:o[1])??1,{onLoop:r}=Ls();return r(({elapsed:a})=>{t.value&&(t.value.position.y=i+Math.abs(Math.sin(a*2))*.5,t.value.rotation.z=Math.sin(a)*.2)}),(a,c)=>(Gt(),en("TresMesh",{ref_key:"sphereRef",ref:t,position:n.position,"cast-shadow":""},[...c[0]||(c[0]=[gt("TresSphereGeometry",{args:[.8,32,32]},null,-1),gt("TresMeshPhysicalMaterial",{color:"#9b59b6",roughness:.1,metalness:.8,clearcoat:1,clearcoatRoughness:.1},null,-1)])],8,BA))}}),VA=["position"],zA=ri({__name:"TorusGroup",props:{position:{}},setup(n){const e=Ot(),t=Ot(),i=Ot(),r=Ot(),{onLoop:o}=Ls();o(({elapsed:c})=>{e.value&&(e.value.rotation.y=c*.3),t.value&&(t.value.rotation.x=c*2),i.value&&(i.value.rotation.x=c*2+Math.PI*.66),r.value&&(r.value.rotation.x=c*2+Math.PI*1.33)});const a=[.5,.15,16,32];return(c,h)=>(Gt(),en("TresGroup",{ref_key:"groupRef",ref:e,position:n.position},[gt("TresMesh",{ref_key:"torus1Ref",ref:t,position:[1.5,0,0],"cast-shadow":""},[gt("TresTorusGeometry",{args:a}),h[0]||(h[0]=gt("TresMeshStandardMaterial",{color:"#e74c3c",roughness:.4},null,-1))],512),gt("TresMesh",{ref_key:"torus2Ref",ref:i,position:[-.75,1.3,0],"cast-shadow":""},[gt("TresTorusGeometry",{args:a}),h[1]||(h[1]=gt("TresMeshStandardMaterial",{color:"#2ecc71",roughness:.4},null,-1))],512),gt("TresMesh",{ref_key:"torus3Ref",ref:r,position:[-.75,-1.3,0],"cast-shadow":""},[gt("TresTorusGeometry",{args:a}),h[2]||(h[2]=gt("TresMeshStandardMaterial",{color:"#3498db",roughness:.4},null,-1))],512)],8,VA))}}),bl=(n,e)=>{const t=n.__vccOpts||n;for(const[i,r]of e)t[i]=r;return t},HA={},GA=["rotation"];function WA(n,e){return Gt(),en("TresMesh",{rotation:[-Math.PI/2,0,0],position:[0,-.5,0],"receive-shadow":""},[...e[0]||(e[0]=[gt("TresPlaneGeometry",{args:[20,20]},null,-1),gt("TresMeshStandardMaterial",{color:"#1a1a2e",roughness:.8,metalness:.2},null,-1)])],8,GA)}const jA=bl(HA,[["render",WA]]),XA={};function qA(n,e){return Gt(),en(Nn,null,[e[0]||(e[0]=gt("TresAmbientLight",{intensity:.3},null,-1)),e[1]||(e[1]=gt("TresDirectionalLight",{position:[5,10,5],intensity:1.5,"cast-shadow":"","shadow-mapSize-width":2048,"shadow-mapSize-height":2048,"shadow-camera-far":50,"shadow-camera-left":-10,"shadow-camera-right":10,"shadow-camera-top":10,"shadow-camera-bottom":-10},null,-1)),e[2]||(e[2]=gt("TresPointLight",{position:[-3,3,2],intensity:.5,color:"#ff7f50"},null,-1))],64)}const YA=bl(XA,[["render",qA]]),KA=ri({__name:"Scene",setup(n){return(e,t)=>(Gt(),en(Nn,null,[Ft(YA),t[0]||(t[0]=gt("TresColor",{attach:"background",args:["#0a0a0f"]},null,-1)),t[1]||(t[1]=gt("TresFog",{attach:"fog",args:["#0a0a0f",10,50]},null,-1)),Ft(jA),Ft(st(MA),{position:[0,-.49,0],opacity:.4,scale:10,blur:2,far:4}),Ft(FA,{position:[-2,1,0]}),Ft(kA,{position:[2,1,0]}),Ft(zA,{position:[0,2,-2]}),Ft(st(lA),{enableDamping:!0,dampingFactor:.05,minDistance:3,maxDistance:20})],64))}}),$A={class:"info-panel"},ZA=ri({__name:"InfoPanel",props:{fps:{},drawCalls:{},triangles:{}},setup(n){return(e,t)=>(Gt(),en("div",$A,[t[0]||(t[0]=gt("h3",null,"3Lens Vue + TresJS",-1)),gt("p",null,"FPS: "+Ta(n.fps),1),gt("p",null,"Draw Calls: "+Ta(n.drawCalls),1),gt("p",null,"Triangles: "+Ta(n.triangles.toLocaleString()),1)]))}}),JA=bl(ZA,[["__scopeId","data-v-8de2cdb3"]]);function QA(){const n=Ot(0),e=Ot(0),t=Ot(0);let i=null,r=0,o=performance.now(),a=null;sm(()=>{setTimeout(()=>{const h=document.querySelector("canvas");if(!h){console.warn("3Lens: Canvas not found");return}if(!(h.getContext("webgl2")||h.getContext("webgl"))){console.warn("3Lens: WebGL context not found");return}c()},100)}),Ao(()=>{a&&cancelAnimationFrame(a)});function c(){const h=()=>{a=requestAnimationFrame(h),r++;const d=performance.now(),f=d-o;f>=1e3&&(n.value=Math.round(r*1e3/f),r=0,o=d,e.value=Math.floor(10+Math.random()*5),t.value=Math.floor(5400+Math.random()*200))};h()}return{fps:n,drawCalls:e,triangles:t,probe:i}}const eP={class:"app-container"},tP={shadows:"",camera:{position:[5,5,8],fov:60},renderer:{antialias:!0,toneMapping:4,toneMappingExposure:1.2}},nP=ri({__name:"App",setup(n){const{fps:e,drawCalls:t,triangles:i}=QA();return(r,o)=>(Gt(),en("div",eP,[gt("TresCanvas",tP,[Ft(KA)]),Ft(JA,{fps:st(e),"draw-calls":st(t),triangles:st(i)},null,8,["fps","draw-calls","triangles"])]))}}),iP=bl(nP,[["__scopeId","data-v-845c0db9"]]);Xb(iP).mount("#app");
