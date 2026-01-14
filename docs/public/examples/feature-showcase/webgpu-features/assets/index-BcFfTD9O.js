(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const n of r)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function t(r){const n={};return r.integrity&&(n.integrity=r.integrity),r.referrerPolicy&&(n.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?n.credentials="include":r.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(r){if(r.ep)return;r.ep=!0;const n=t(r);fetch(r.href,n)}})();const Yr="modulepreload",Xr=function(a){return"/examples/feature-showcase/webgpu-features/"+a},As={},Mr=function(e,t,s){let r=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const i=document.querySelector("meta[property=csp-nonce]"),o=i?.nonce||i?.getAttribute("nonce");r=Promise.allSettled(t.map(l=>{if(l=Xr(l),l in As)return;As[l]=!0;const c=l.endsWith(".css"),d=c?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${d}`))return;const h=document.createElement("link");if(h.rel=c?"stylesheet":Yr,c||(h.as="script"),h.crossOrigin="",h.href=l,o&&h.setAttribute("nonce",o),document.head.appendChild(h),c)return new Promise((p,u)=>{h.addEventListener("load",p),h.addEventListener("error",()=>u(new Error(`Unable to preload CSS for ${l}`)))})}))}function n(i){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=i,window.dispatchEvent(o),!o.defaultPrevented)throw i}return r.then(i=>{for(const o of i||[])o.status==="rejected"&&n(o.reason);return e().catch(n)})};/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Sr="170",ms=0,Zr=1,Bs=1,Is=100,Fs=204,Rs=205,Ls=3,Jr=0,kr=300,Os=1e3,gt=1001,Ds=1002,Kr=1006,Qr=1008,en=1009,tn=1015,sn=1023,rn=0,Cr="",pe="srgb",Tr="srgb-linear",zr="linear",gs="srgb",je=7680,Hs=519,Ns=35044,He=2e3,fs=2001;class Ot{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const s=this._listeners;s[e]===void 0&&(s[e]=[]),s[e].indexOf(t)===-1&&s[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const s=this._listeners;return s[e]!==void 0&&s[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const r=this._listeners[e];if(r!==void 0){const n=r.indexOf(t);n!==-1&&r.splice(n,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const s=this._listeners[e.type];if(s!==void 0){e.target=this;const r=s.slice(0);for(let n=0,i=r.length;n<i;n++)r[n].call(this,e);e.target=null}}}const Z=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Nt=Math.PI/180,js=180/Math.PI;function pt(){const a=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,s=Math.random()*4294967295|0;return(Z[a&255]+Z[a>>8&255]+Z[a>>16&255]+Z[a>>24&255]+"-"+Z[e&255]+Z[e>>8&255]+"-"+Z[e>>16&15|64]+Z[e>>24&255]+"-"+Z[t&63|128]+Z[t>>8&255]+"-"+Z[t>>16&255]+Z[t>>24&255]+Z[s&255]+Z[s>>8&255]+Z[s>>16&255]+Z[s>>24&255]).toLowerCase()}function Q(a,e,t){return Math.max(e,Math.min(t,a))}function nn(a,e){return(a%e+e)%e}function jt(a,e,t){return(1-t)*a+t*e}function it(a,e){switch(e.constructor){case Float32Array:return a;case Uint32Array:return a/4294967295;case Uint16Array:return a/65535;case Uint8Array:return a/255;case Int32Array:return Math.max(a/2147483647,-1);case Int16Array:return Math.max(a/32767,-1);case Int8Array:return Math.max(a/127,-1);default:throw new Error("Invalid component type.")}}function K(a,e){switch(e.constructor){case Float32Array:return a;case Uint32Array:return Math.round(a*4294967295);case Uint16Array:return Math.round(a*65535);case Uint8Array:return Math.round(a*255);case Int32Array:return Math.round(a*2147483647);case Int16Array:return Math.round(a*32767);case Int8Array:return Math.round(a*127);default:throw new Error("Invalid component type.")}}class G{constructor(e=0,t=0){G.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,s=this.y,r=e.elements;return this.x=r[0]*t+r[3]*s+r[6],this.y=r[1]*t+r[4]*s+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const s=this.length();return this.divideScalar(s||1).multiplyScalar(Math.max(e,Math.min(t,s)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const s=this.dot(e)/t;return Math.acos(Q(s,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,s=this.y-e.y;return t*t+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,s){return this.x=e.x+(t.x-e.x)*s,this.y=e.y+(t.y-e.y)*s,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const s=Math.cos(t),r=Math.sin(t),n=this.x-e.x,i=this.y-e.y;return this.x=n*s-i*r+e.x,this.y=n*r+i*s+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Te{constructor(e,t,s,r,n,i,o,l,c){Te.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,s,r,n,i,o,l,c)}set(e,t,s,r,n,i,o,l,c){const d=this.elements;return d[0]=e,d[1]=r,d[2]=o,d[3]=t,d[4]=n,d[5]=l,d[6]=s,d[7]=i,d[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,s=e.elements;return t[0]=s[0],t[1]=s[1],t[2]=s[2],t[3]=s[3],t[4]=s[4],t[5]=s[5],t[6]=s[6],t[7]=s[7],t[8]=s[8],this}extractBasis(e,t,s){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),s.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const s=e.elements,r=t.elements,n=this.elements,i=s[0],o=s[3],l=s[6],c=s[1],d=s[4],h=s[7],p=s[2],u=s[5],m=s[8],g=r[0],f=r[3],y=r[6],b=r[1],w=r[4],v=r[7],C=r[2],k=r[5],M=r[8];return n[0]=i*g+o*b+l*C,n[3]=i*f+o*w+l*k,n[6]=i*y+o*v+l*M,n[1]=c*g+d*b+h*C,n[4]=c*f+d*w+h*k,n[7]=c*y+d*v+h*M,n[2]=p*g+u*b+m*C,n[5]=p*f+u*w+m*k,n[8]=p*y+u*v+m*M,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],s=e[1],r=e[2],n=e[3],i=e[4],o=e[5],l=e[6],c=e[7],d=e[8];return t*i*d-t*o*c-s*n*d+s*o*l+r*n*c-r*i*l}invert(){const e=this.elements,t=e[0],s=e[1],r=e[2],n=e[3],i=e[4],o=e[5],l=e[6],c=e[7],d=e[8],h=d*i-o*c,p=o*l-d*n,u=c*n-i*l,m=t*h+s*p+r*u;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);const g=1/m;return e[0]=h*g,e[1]=(r*c-d*s)*g,e[2]=(o*s-r*i)*g,e[3]=p*g,e[4]=(d*t-r*l)*g,e[5]=(r*n-o*t)*g,e[6]=u*g,e[7]=(s*l-c*t)*g,e[8]=(i*t-s*n)*g,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,s,r,n,i,o){const l=Math.cos(n),c=Math.sin(n);return this.set(s*l,s*c,-s*(l*i+c*o)+i+e,-r*c,r*l,-r*(-c*i+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(Gt.makeScale(e,t)),this}rotate(e){return this.premultiply(Gt.makeRotation(-e)),this}translate(e,t){return this.premultiply(Gt.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),s=Math.sin(e);return this.set(t,-s,0,s,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,s=e.elements;for(let r=0;r<9;r++)if(t[r]!==s[r])return!1;return!0}fromArray(e,t=0){for(let s=0;s<9;s++)this.elements[s]=e[s+t];return this}toArray(e=[],t=0){const s=this.elements;return e[t]=s[0],e[t+1]=s[1],e[t+2]=s[2],e[t+3]=s[3],e[t+4]=s[4],e[t+5]=s[5],e[t+6]=s[6],e[t+7]=s[7],e[t+8]=s[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Gt=new Te;function an(a){for(let e=a.length-1;e>=0;--e)if(a[e]>=65535)return!0;return!1}function Gs(a){return document.createElementNS("http://www.w3.org/1999/xhtml",a)}const ne={enabled:!0,workingColorSpace:Tr,spaces:{},convert:function(a,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===gs&&(a.r=Ce(a.r),a.g=Ce(a.g),a.b=Ce(a.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(a.applyMatrix3(this.spaces[e].toXYZ),a.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===gs&&(a.r=st(a.r),a.g=st(a.g),a.b=st(a.b))),a},fromWorkingColorSpace:function(a,e){return this.convert(a,this.workingColorSpace,e)},toWorkingColorSpace:function(a,e){return this.convert(a,e,this.workingColorSpace)},getPrimaries:function(a){return this.spaces[a].primaries},getTransfer:function(a){return a===Cr?zr:this.spaces[a].transfer},getLuminanceCoefficients:function(a,e=this.workingColorSpace){return a.fromArray(this.spaces[e].luminanceCoefficients)},define:function(a){Object.assign(this.spaces,a)},_getMatrix:function(a,e,t){return a.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(a){return this.spaces[a].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(a=this.workingColorSpace){return this.spaces[a].workingColorSpaceConfig.unpackColorSpace}};function Ce(a){return a<.04045?a*.0773993808:Math.pow(a*.9478672986+.0521327014,2.4)}function st(a){return a<.0031308?a*12.92:1.055*Math.pow(a,.41666)-.055}const Us=[.64,.33,.3,.6,.15,.06],Vs=[.2126,.7152,.0722],Ws=[.3127,.329],qs=new Te().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Ys=new Te().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);ne.define({[Tr]:{primaries:Us,whitePoint:Ws,transfer:zr,toXYZ:qs,fromXYZ:Ys,luminanceCoefficients:Vs,workingColorSpaceConfig:{unpackColorSpace:pe},outputColorSpaceConfig:{drawingBufferColorSpace:pe}},[pe]:{primaries:Us,whitePoint:Ws,transfer:gs,toXYZ:qs,fromXYZ:Ys,luminanceCoefficients:Vs,outputColorSpaceConfig:{drawingBufferColorSpace:pe}}});let Ge;class on{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Ge===void 0&&(Ge=Gs("canvas")),Ge.width=e.width,Ge.height=e.height;const s=Ge.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),t=Ge}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Gs("canvas");t.width=e.width,t.height=e.height;const s=t.getContext("2d");s.drawImage(e,0,0,e.width,e.height);const r=s.getImageData(0,0,e.width,e.height),n=r.data;for(let i=0;i<n.length;i++)n[i]=Ce(n[i]/255)*255;return s.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let s=0;s<t.length;s++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[s]=Math.floor(Ce(t[s]/255)*255):t[s]=Ce(t[s]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let ln=0;class cn{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:ln++}),this.uuid=pt(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const s={uuid:this.uuid,url:""},r=this.data;if(r!==null){let n;if(Array.isArray(r)){n=[];for(let i=0,o=r.length;i<o;i++)r[i].isDataTexture?n.push(Ut(r[i].image)):n.push(Ut(r[i]))}else n=Ut(r);s.url=n}return t||(e.images[this.uuid]=s),s}}function Ut(a){return typeof HTMLImageElement<"u"&&a instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&a instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&a instanceof ImageBitmap?on.getDataURL(a):a.data?{data:Array.from(a.data),width:a.width,height:a.height,type:a.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let dn=0;class Ne extends Ot{constructor(e=Ne.DEFAULT_IMAGE,t=Ne.DEFAULT_MAPPING,s=gt,r=gt,n=Kr,i=Qr,o=sn,l=en,c=Ne.DEFAULT_ANISOTROPY,d=Cr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:dn++}),this.uuid=pt(),this.name="",this.source=new cn(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=s,this.wrapT=r,this.magFilter=n,this.minFilter=i,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new G(0,0),this.repeat=new G(1,1),this.center=new G(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Te,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const s={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(s.userData=this.userData),t||(e.textures[this.uuid]=s),s}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==kr)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Os:e.x=e.x-Math.floor(e.x);break;case gt:e.x=e.x<0?0:1;break;case Ds:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Os:e.y=e.y-Math.floor(e.y);break;case gt:e.y=e.y<0?0:1;break;case Ds:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Ne.DEFAULT_IMAGE=null;Ne.DEFAULT_MAPPING=kr;Ne.DEFAULT_ANISOTROPY=1;class ae{constructor(e=0,t=0,s=0,r=1){ae.prototype.isVector4=!0,this.x=e,this.y=t,this.z=s,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,s,r){return this.x=e,this.y=t,this.z=s,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,s=this.y,r=this.z,n=this.w,i=e.elements;return this.x=i[0]*t+i[4]*s+i[8]*r+i[12]*n,this.y=i[1]*t+i[5]*s+i[9]*r+i[13]*n,this.z=i[2]*t+i[6]*s+i[10]*r+i[14]*n,this.w=i[3]*t+i[7]*s+i[11]*r+i[15]*n,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,s,r,n;const l=e.elements,c=l[0],d=l[4],h=l[8],p=l[1],u=l[5],m=l[9],g=l[2],f=l[6],y=l[10];if(Math.abs(d-p)<.01&&Math.abs(h-g)<.01&&Math.abs(m-f)<.01){if(Math.abs(d+p)<.1&&Math.abs(h+g)<.1&&Math.abs(m+f)<.1&&Math.abs(c+u+y-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const w=(c+1)/2,v=(u+1)/2,C=(y+1)/2,k=(d+p)/4,M=(h+g)/4,S=(m+f)/4;return w>v&&w>C?w<.01?(s=0,r=.707106781,n=.707106781):(s=Math.sqrt(w),r=k/s,n=M/s):v>C?v<.01?(s=.707106781,r=0,n=.707106781):(r=Math.sqrt(v),s=k/r,n=S/r):C<.01?(s=.707106781,r=.707106781,n=0):(n=Math.sqrt(C),s=M/n,r=S/n),this.set(s,r,n,t),this}let b=Math.sqrt((f-m)*(f-m)+(h-g)*(h-g)+(p-d)*(p-d));return Math.abs(b)<.001&&(b=1),this.x=(f-m)/b,this.y=(h-g)/b,this.z=(p-d)/b,this.w=Math.acos((c+u+y-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const s=this.length();return this.divideScalar(s||1).multiplyScalar(Math.max(e,Math.min(t,s)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,s){return this.x=e.x+(t.x-e.x)*s,this.y=e.y+(t.y-e.y)*s,this.z=e.z+(t.z-e.z)*s,this.w=e.w+(t.w-e.w)*s,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class ut{constructor(e=0,t=0,s=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=s,this._w=r}static slerpFlat(e,t,s,r,n,i,o){let l=s[r+0],c=s[r+1],d=s[r+2],h=s[r+3];const p=n[i+0],u=n[i+1],m=n[i+2],g=n[i+3];if(o===0){e[t+0]=l,e[t+1]=c,e[t+2]=d,e[t+3]=h;return}if(o===1){e[t+0]=p,e[t+1]=u,e[t+2]=m,e[t+3]=g;return}if(h!==g||l!==p||c!==u||d!==m){let f=1-o;const y=l*p+c*u+d*m+h*g,b=y>=0?1:-1,w=1-y*y;if(w>Number.EPSILON){const C=Math.sqrt(w),k=Math.atan2(C,y*b);f=Math.sin(f*k)/C,o=Math.sin(o*k)/C}const v=o*b;if(l=l*f+p*v,c=c*f+u*v,d=d*f+m*v,h=h*f+g*v,f===1-o){const C=1/Math.sqrt(l*l+c*c+d*d+h*h);l*=C,c*=C,d*=C,h*=C}}e[t]=l,e[t+1]=c,e[t+2]=d,e[t+3]=h}static multiplyQuaternionsFlat(e,t,s,r,n,i){const o=s[r],l=s[r+1],c=s[r+2],d=s[r+3],h=n[i],p=n[i+1],u=n[i+2],m=n[i+3];return e[t]=o*m+d*h+l*u-c*p,e[t+1]=l*m+d*p+c*h-o*u,e[t+2]=c*m+d*u+o*p-l*h,e[t+3]=d*m-o*h-l*p-c*u,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,s,r){return this._x=e,this._y=t,this._z=s,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const s=e._x,r=e._y,n=e._z,i=e._order,o=Math.cos,l=Math.sin,c=o(s/2),d=o(r/2),h=o(n/2),p=l(s/2),u=l(r/2),m=l(n/2);switch(i){case"XYZ":this._x=p*d*h+c*u*m,this._y=c*u*h-p*d*m,this._z=c*d*m+p*u*h,this._w=c*d*h-p*u*m;break;case"YXZ":this._x=p*d*h+c*u*m,this._y=c*u*h-p*d*m,this._z=c*d*m-p*u*h,this._w=c*d*h+p*u*m;break;case"ZXY":this._x=p*d*h-c*u*m,this._y=c*u*h+p*d*m,this._z=c*d*m+p*u*h,this._w=c*d*h-p*u*m;break;case"ZYX":this._x=p*d*h-c*u*m,this._y=c*u*h+p*d*m,this._z=c*d*m-p*u*h,this._w=c*d*h+p*u*m;break;case"YZX":this._x=p*d*h+c*u*m,this._y=c*u*h+p*d*m,this._z=c*d*m-p*u*h,this._w=c*d*h-p*u*m;break;case"XZY":this._x=p*d*h-c*u*m,this._y=c*u*h-p*d*m,this._z=c*d*m+p*u*h,this._w=c*d*h+p*u*m;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+i)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const s=t/2,r=Math.sin(s);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(s),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,s=t[0],r=t[4],n=t[8],i=t[1],o=t[5],l=t[9],c=t[2],d=t[6],h=t[10],p=s+o+h;if(p>0){const u=.5/Math.sqrt(p+1);this._w=.25/u,this._x=(d-l)*u,this._y=(n-c)*u,this._z=(i-r)*u}else if(s>o&&s>h){const u=2*Math.sqrt(1+s-o-h);this._w=(d-l)/u,this._x=.25*u,this._y=(r+i)/u,this._z=(n+c)/u}else if(o>h){const u=2*Math.sqrt(1+o-s-h);this._w=(n-c)/u,this._x=(r+i)/u,this._y=.25*u,this._z=(l+d)/u}else{const u=2*Math.sqrt(1+h-s-o);this._w=(i-r)/u,this._x=(n+c)/u,this._y=(l+d)/u,this._z=.25*u}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let s=e.dot(t)+1;return s<Number.EPSILON?(s=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=s):(this._x=0,this._y=-e.z,this._z=e.y,this._w=s)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=s),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Q(this.dot(e),-1,1)))}rotateTowards(e,t){const s=this.angleTo(e);if(s===0)return this;const r=Math.min(1,t/s);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const s=e._x,r=e._y,n=e._z,i=e._w,o=t._x,l=t._y,c=t._z,d=t._w;return this._x=s*d+i*o+r*c-n*l,this._y=r*d+i*l+n*o-s*c,this._z=n*d+i*c+s*l-r*o,this._w=i*d-s*o-r*l-n*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const s=this._x,r=this._y,n=this._z,i=this._w;let o=i*e._w+s*e._x+r*e._y+n*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=i,this._x=s,this._y=r,this._z=n,this;const l=1-o*o;if(l<=Number.EPSILON){const u=1-t;return this._w=u*i+t*this._w,this._x=u*s+t*this._x,this._y=u*r+t*this._y,this._z=u*n+t*this._z,this.normalize(),this}const c=Math.sqrt(l),d=Math.atan2(c,o),h=Math.sin((1-t)*d)/c,p=Math.sin(t*d)/c;return this._w=i*h+this._w*p,this._x=s*h+this._x*p,this._y=r*h+this._y*p,this._z=n*h+this._z*p,this._onChangeCallback(),this}slerpQuaternions(e,t,s){return this.copy(e).slerp(t,s)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),s=Math.random(),r=Math.sqrt(1-s),n=Math.sqrt(s);return this.set(r*Math.sin(e),r*Math.cos(e),n*Math.sin(t),n*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class x{constructor(e=0,t=0,s=0){x.prototype.isVector3=!0,this.x=e,this.y=t,this.z=s}set(e,t,s){return s===void 0&&(s=this.z),this.x=e,this.y=t,this.z=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Xs.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Xs.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,s=this.y,r=this.z,n=e.elements;return this.x=n[0]*t+n[3]*s+n[6]*r,this.y=n[1]*t+n[4]*s+n[7]*r,this.z=n[2]*t+n[5]*s+n[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,s=this.y,r=this.z,n=e.elements,i=1/(n[3]*t+n[7]*s+n[11]*r+n[15]);return this.x=(n[0]*t+n[4]*s+n[8]*r+n[12])*i,this.y=(n[1]*t+n[5]*s+n[9]*r+n[13])*i,this.z=(n[2]*t+n[6]*s+n[10]*r+n[14])*i,this}applyQuaternion(e){const t=this.x,s=this.y,r=this.z,n=e.x,i=e.y,o=e.z,l=e.w,c=2*(i*r-o*s),d=2*(o*t-n*r),h=2*(n*s-i*t);return this.x=t+l*c+i*h-o*d,this.y=s+l*d+o*c-n*h,this.z=r+l*h+n*d-i*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,s=this.y,r=this.z,n=e.elements;return this.x=n[0]*t+n[4]*s+n[8]*r,this.y=n[1]*t+n[5]*s+n[9]*r,this.z=n[2]*t+n[6]*s+n[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const s=this.length();return this.divideScalar(s||1).multiplyScalar(Math.max(e,Math.min(t,s)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,s){return this.x=e.x+(t.x-e.x)*s,this.y=e.y+(t.y-e.y)*s,this.z=e.z+(t.z-e.z)*s,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const s=e.x,r=e.y,n=e.z,i=t.x,o=t.y,l=t.z;return this.x=r*l-n*o,this.y=n*i-s*l,this.z=s*o-r*i,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const s=e.dot(this)/t;return this.copy(e).multiplyScalar(s)}projectOnPlane(e){return Vt.copy(this).projectOnVector(e),this.sub(Vt)}reflect(e){return this.sub(Vt.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const s=this.dot(e)/t;return Math.acos(Q(s,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,s=this.y-e.y,r=this.z-e.z;return t*t+s*s+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,s){const r=Math.sin(t)*e;return this.x=r*Math.sin(s),this.y=Math.cos(t)*e,this.z=r*Math.cos(s),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,s){return this.x=e*Math.sin(t),this.y=s,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),s=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=s,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,s=Math.sqrt(1-t*t);return this.x=s*Math.cos(e),this.y=t,this.z=s*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Vt=new x,Xs=new ut;class mt{constructor(e=new x(1/0,1/0,1/0),t=new x(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,s=e.length;t<s;t+=3)this.expandByPoint(ce.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,s=e.count;t<s;t++)this.expandByPoint(ce.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,s=e.length;t<s;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const s=ce.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(s),this.max.copy(e).add(s),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const s=e.geometry;if(s!==void 0){const n=s.getAttribute("position");if(t===!0&&n!==void 0&&e.isInstancedMesh!==!0)for(let i=0,o=n.count;i<o;i++)e.isMesh===!0?e.getVertexPosition(i,ce):ce.fromBufferAttribute(n,i),ce.applyMatrix4(e.matrixWorld),this.expandByPoint(ce);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ft.copy(e.boundingBox)):(s.boundingBox===null&&s.computeBoundingBox(),ft.copy(s.boundingBox)),ft.applyMatrix4(e.matrixWorld),this.union(ft)}const r=e.children;for(let n=0,i=r.length;n<i;n++)this.expandByObject(r[n],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,ce),ce.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,s;return e.normal.x>0?(t=e.normal.x*this.min.x,s=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,s=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,s+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,s+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,s+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,s+=e.normal.z*this.min.z),t<=-e.constant&&s>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(at),bt.subVectors(this.max,at),Ue.subVectors(e.a,at),Ve.subVectors(e.b,at),We.subVectors(e.c,at),ze.subVectors(Ve,Ue),$e.subVectors(We,Ve),Re.subVectors(Ue,We);let t=[0,-ze.z,ze.y,0,-$e.z,$e.y,0,-Re.z,Re.y,ze.z,0,-ze.x,$e.z,0,-$e.x,Re.z,0,-Re.x,-ze.y,ze.x,0,-$e.y,$e.x,0,-Re.y,Re.x,0];return!Wt(t,Ue,Ve,We,bt)||(t=[1,0,0,0,1,0,0,0,1],!Wt(t,Ue,Ve,We,bt))?!1:(yt.crossVectors(ze,$e),t=[yt.x,yt.y,yt.z],Wt(t,Ue,Ve,We,bt))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,ce).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(ce).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ve[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ve[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ve[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ve[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ve[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ve[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ve[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ve[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ve),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const ve=[new x,new x,new x,new x,new x,new x,new x,new x],ce=new x,ft=new mt,Ue=new x,Ve=new x,We=new x,ze=new x,$e=new x,Re=new x,at=new x,bt=new x,yt=new x,Le=new x;function Wt(a,e,t,s,r){for(let n=0,i=a.length-3;n<=i;n+=3){Le.fromArray(a,n);const o=r.x*Math.abs(Le.x)+r.y*Math.abs(Le.y)+r.z*Math.abs(Le.z),l=e.dot(Le),c=t.dot(Le),d=s.dot(Le);if(Math.max(-Math.max(l,c,d),Math.min(l,c,d))>o)return!1}return!0}const hn=new mt,ot=new x,qt=new x;class bs{constructor(e=new x,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const s=this.center;t!==void 0?s.copy(t):hn.setFromPoints(e).getCenter(s);let r=0;for(let n=0,i=e.length;n<i;n++)r=Math.max(r,s.distanceToSquared(e[n]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const s=this.center.distanceToSquared(e);return t.copy(e),s>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ot.subVectors(e,this.center);const t=ot.lengthSq();if(t>this.radius*this.radius){const s=Math.sqrt(t),r=(s-this.radius)*.5;this.center.addScaledVector(ot,r/s),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(qt.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ot.copy(e.center).add(qt)),this.expandByPoint(ot.copy(e.center).sub(qt))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const xe=new x,Yt=new x,vt=new x,Ee=new x,Xt=new x,xt=new x,Zt=new x;class pn{constructor(e=new x,t=new x(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,xe)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const s=t.dot(this.direction);return s<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,s)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=xe.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(xe.copy(this.origin).addScaledVector(this.direction,t),xe.distanceToSquared(e))}distanceSqToSegment(e,t,s,r){Yt.copy(e).add(t).multiplyScalar(.5),vt.copy(t).sub(e).normalize(),Ee.copy(this.origin).sub(Yt);const n=e.distanceTo(t)*.5,i=-this.direction.dot(vt),o=Ee.dot(this.direction),l=-Ee.dot(vt),c=Ee.lengthSq(),d=Math.abs(1-i*i);let h,p,u,m;if(d>0)if(h=i*l-o,p=i*o-l,m=n*d,h>=0)if(p>=-m)if(p<=m){const g=1/d;h*=g,p*=g,u=h*(h+i*p+2*o)+p*(i*h+p+2*l)+c}else p=n,h=Math.max(0,-(i*p+o)),u=-h*h+p*(p+2*l)+c;else p=-n,h=Math.max(0,-(i*p+o)),u=-h*h+p*(p+2*l)+c;else p<=-m?(h=Math.max(0,-(-i*n+o)),p=h>0?-n:Math.min(Math.max(-n,-l),n),u=-h*h+p*(p+2*l)+c):p<=m?(h=0,p=Math.min(Math.max(-n,-l),n),u=p*(p+2*l)+c):(h=Math.max(0,-(i*n+o)),p=h>0?n:Math.min(Math.max(-n,-l),n),u=-h*h+p*(p+2*l)+c);else p=i>0?-n:n,h=Math.max(0,-(i*p+o)),u=-h*h+p*(p+2*l)+c;return s&&s.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(Yt).addScaledVector(vt,p),u}intersectSphere(e,t){xe.subVectors(e.center,this.origin);const s=xe.dot(this.direction),r=xe.dot(xe)-s*s,n=e.radius*e.radius;if(r>n)return null;const i=Math.sqrt(n-r),o=s-i,l=s+i;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const s=-(this.origin.dot(e.normal)+e.constant)/t;return s>=0?s:null}intersectPlane(e,t){const s=this.distanceToPlane(e);return s===null?null:this.at(s,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let s,r,n,i,o,l;const c=1/this.direction.x,d=1/this.direction.y,h=1/this.direction.z,p=this.origin;return c>=0?(s=(e.min.x-p.x)*c,r=(e.max.x-p.x)*c):(s=(e.max.x-p.x)*c,r=(e.min.x-p.x)*c),d>=0?(n=(e.min.y-p.y)*d,i=(e.max.y-p.y)*d):(n=(e.max.y-p.y)*d,i=(e.min.y-p.y)*d),s>i||n>r||((n>s||isNaN(s))&&(s=n),(i<r||isNaN(r))&&(r=i),h>=0?(o=(e.min.z-p.z)*h,l=(e.max.z-p.z)*h):(o=(e.max.z-p.z)*h,l=(e.min.z-p.z)*h),s>l||o>r)||((o>s||s!==s)&&(s=o),(l<r||r!==r)&&(r=l),r<0)?null:this.at(s>=0?s:r,t)}intersectsBox(e){return this.intersectBox(e,xe)!==null}intersectTriangle(e,t,s,r,n){Xt.subVectors(t,e),xt.subVectors(s,e),Zt.crossVectors(Xt,xt);let i=this.direction.dot(Zt),o;if(i>0){if(r)return null;o=1}else if(i<0)o=-1,i=-i;else return null;Ee.subVectors(this.origin,e);const l=o*this.direction.dot(xt.crossVectors(Ee,xt));if(l<0)return null;const c=o*this.direction.dot(Xt.cross(Ee));if(c<0||l+c>i)return null;const d=-o*Ee.dot(Zt);return d<0?null:this.at(d/i,n)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class X{constructor(e,t,s,r,n,i,o,l,c,d,h,p,u,m,g,f){X.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,s,r,n,i,o,l,c,d,h,p,u,m,g,f)}set(e,t,s,r,n,i,o,l,c,d,h,p,u,m,g,f){const y=this.elements;return y[0]=e,y[4]=t,y[8]=s,y[12]=r,y[1]=n,y[5]=i,y[9]=o,y[13]=l,y[2]=c,y[6]=d,y[10]=h,y[14]=p,y[3]=u,y[7]=m,y[11]=g,y[15]=f,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new X().fromArray(this.elements)}copy(e){const t=this.elements,s=e.elements;return t[0]=s[0],t[1]=s[1],t[2]=s[2],t[3]=s[3],t[4]=s[4],t[5]=s[5],t[6]=s[6],t[7]=s[7],t[8]=s[8],t[9]=s[9],t[10]=s[10],t[11]=s[11],t[12]=s[12],t[13]=s[13],t[14]=s[14],t[15]=s[15],this}copyPosition(e){const t=this.elements,s=e.elements;return t[12]=s[12],t[13]=s[13],t[14]=s[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,s){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),s.setFromMatrixColumn(this,2),this}makeBasis(e,t,s){return this.set(e.x,t.x,s.x,0,e.y,t.y,s.y,0,e.z,t.z,s.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,s=e.elements,r=1/qe.setFromMatrixColumn(e,0).length(),n=1/qe.setFromMatrixColumn(e,1).length(),i=1/qe.setFromMatrixColumn(e,2).length();return t[0]=s[0]*r,t[1]=s[1]*r,t[2]=s[2]*r,t[3]=0,t[4]=s[4]*n,t[5]=s[5]*n,t[6]=s[6]*n,t[7]=0,t[8]=s[8]*i,t[9]=s[9]*i,t[10]=s[10]*i,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,s=e.x,r=e.y,n=e.z,i=Math.cos(s),o=Math.sin(s),l=Math.cos(r),c=Math.sin(r),d=Math.cos(n),h=Math.sin(n);if(e.order==="XYZ"){const p=i*d,u=i*h,m=o*d,g=o*h;t[0]=l*d,t[4]=-l*h,t[8]=c,t[1]=u+m*c,t[5]=p-g*c,t[9]=-o*l,t[2]=g-p*c,t[6]=m+u*c,t[10]=i*l}else if(e.order==="YXZ"){const p=l*d,u=l*h,m=c*d,g=c*h;t[0]=p+g*o,t[4]=m*o-u,t[8]=i*c,t[1]=i*h,t[5]=i*d,t[9]=-o,t[2]=u*o-m,t[6]=g+p*o,t[10]=i*l}else if(e.order==="ZXY"){const p=l*d,u=l*h,m=c*d,g=c*h;t[0]=p-g*o,t[4]=-i*h,t[8]=m+u*o,t[1]=u+m*o,t[5]=i*d,t[9]=g-p*o,t[2]=-i*c,t[6]=o,t[10]=i*l}else if(e.order==="ZYX"){const p=i*d,u=i*h,m=o*d,g=o*h;t[0]=l*d,t[4]=m*c-u,t[8]=p*c+g,t[1]=l*h,t[5]=g*c+p,t[9]=u*c-m,t[2]=-c,t[6]=o*l,t[10]=i*l}else if(e.order==="YZX"){const p=i*l,u=i*c,m=o*l,g=o*c;t[0]=l*d,t[4]=g-p*h,t[8]=m*h+u,t[1]=h,t[5]=i*d,t[9]=-o*d,t[2]=-c*d,t[6]=u*h+m,t[10]=p-g*h}else if(e.order==="XZY"){const p=i*l,u=i*c,m=o*l,g=o*c;t[0]=l*d,t[4]=-h,t[8]=c*d,t[1]=p*h+g,t[5]=i*d,t[9]=u*h-m,t[2]=m*h-u,t[6]=o*d,t[10]=g*h+p}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(un,e,mn)}lookAt(e,t,s){const r=this.elements;return te.subVectors(e,t),te.lengthSq()===0&&(te.z=1),te.normalize(),Pe.crossVectors(s,te),Pe.lengthSq()===0&&(Math.abs(s.z)===1?te.x+=1e-4:te.z+=1e-4,te.normalize(),Pe.crossVectors(s,te)),Pe.normalize(),wt.crossVectors(te,Pe),r[0]=Pe.x,r[4]=wt.x,r[8]=te.x,r[1]=Pe.y,r[5]=wt.y,r[9]=te.y,r[2]=Pe.z,r[6]=wt.z,r[10]=te.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const s=e.elements,r=t.elements,n=this.elements,i=s[0],o=s[4],l=s[8],c=s[12],d=s[1],h=s[5],p=s[9],u=s[13],m=s[2],g=s[6],f=s[10],y=s[14],b=s[3],w=s[7],v=s[11],C=s[15],k=r[0],M=r[4],S=r[8],z=r[12],E=r[1],T=r[5],I=r[9],A=r[13],O=r[2],U=r[6],$=r[10],F=r[14],_=r[3],B=r[7],P=r[11],R=r[15];return n[0]=i*k+o*E+l*O+c*_,n[4]=i*M+o*T+l*U+c*B,n[8]=i*S+o*I+l*$+c*P,n[12]=i*z+o*A+l*F+c*R,n[1]=d*k+h*E+p*O+u*_,n[5]=d*M+h*T+p*U+u*B,n[9]=d*S+h*I+p*$+u*P,n[13]=d*z+h*A+p*F+u*R,n[2]=m*k+g*E+f*O+y*_,n[6]=m*M+g*T+f*U+y*B,n[10]=m*S+g*I+f*$+y*P,n[14]=m*z+g*A+f*F+y*R,n[3]=b*k+w*E+v*O+C*_,n[7]=b*M+w*T+v*U+C*B,n[11]=b*S+w*I+v*$+C*P,n[15]=b*z+w*A+v*F+C*R,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],s=e[4],r=e[8],n=e[12],i=e[1],o=e[5],l=e[9],c=e[13],d=e[2],h=e[6],p=e[10],u=e[14],m=e[3],g=e[7],f=e[11],y=e[15];return m*(+n*l*h-r*c*h-n*o*p+s*c*p+r*o*u-s*l*u)+g*(+t*l*u-t*c*p+n*i*p-r*i*u+r*c*d-n*l*d)+f*(+t*c*h-t*o*u-n*i*h+s*i*u+n*o*d-s*c*d)+y*(-r*o*d-t*l*h+t*o*p+r*i*h-s*i*p+s*l*d)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,s){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=s),this}invert(){const e=this.elements,t=e[0],s=e[1],r=e[2],n=e[3],i=e[4],o=e[5],l=e[6],c=e[7],d=e[8],h=e[9],p=e[10],u=e[11],m=e[12],g=e[13],f=e[14],y=e[15],b=h*f*c-g*p*c+g*l*u-o*f*u-h*l*y+o*p*y,w=m*p*c-d*f*c-m*l*u+i*f*u+d*l*y-i*p*y,v=d*g*c-m*h*c+m*o*u-i*g*u-d*o*y+i*h*y,C=m*h*l-d*g*l-m*o*p+i*g*p+d*o*f-i*h*f,k=t*b+s*w+r*v+n*C;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const M=1/k;return e[0]=b*M,e[1]=(g*p*n-h*f*n-g*r*u+s*f*u+h*r*y-s*p*y)*M,e[2]=(o*f*n-g*l*n+g*r*c-s*f*c-o*r*y+s*l*y)*M,e[3]=(h*l*n-o*p*n-h*r*c+s*p*c+o*r*u-s*l*u)*M,e[4]=w*M,e[5]=(d*f*n-m*p*n+m*r*u-t*f*u-d*r*y+t*p*y)*M,e[6]=(m*l*n-i*f*n-m*r*c+t*f*c+i*r*y-t*l*y)*M,e[7]=(i*p*n-d*l*n+d*r*c-t*p*c-i*r*u+t*l*u)*M,e[8]=v*M,e[9]=(m*h*n-d*g*n-m*s*u+t*g*u+d*s*y-t*h*y)*M,e[10]=(i*g*n-m*o*n+m*s*c-t*g*c-i*s*y+t*o*y)*M,e[11]=(d*o*n-i*h*n-d*s*c+t*h*c+i*s*u-t*o*u)*M,e[12]=C*M,e[13]=(d*g*r-m*h*r+m*s*p-t*g*p-d*s*f+t*h*f)*M,e[14]=(m*o*r-i*g*r-m*s*l+t*g*l+i*s*f-t*o*f)*M,e[15]=(i*h*r-d*o*r+d*s*l-t*h*l-i*s*p+t*o*p)*M,this}scale(e){const t=this.elements,s=e.x,r=e.y,n=e.z;return t[0]*=s,t[4]*=r,t[8]*=n,t[1]*=s,t[5]*=r,t[9]*=n,t[2]*=s,t[6]*=r,t[10]*=n,t[3]*=s,t[7]*=r,t[11]*=n,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],s=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,s,r))}makeTranslation(e,t,s){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,s,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),s=Math.sin(e);return this.set(1,0,0,0,0,t,-s,0,0,s,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),s=Math.sin(e);return this.set(t,0,s,0,0,1,0,0,-s,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),s=Math.sin(e);return this.set(t,-s,0,0,s,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const s=Math.cos(t),r=Math.sin(t),n=1-s,i=e.x,o=e.y,l=e.z,c=n*i,d=n*o;return this.set(c*i+s,c*o-r*l,c*l+r*o,0,c*o+r*l,d*o+s,d*l-r*i,0,c*l-r*o,d*l+r*i,n*l*l+s,0,0,0,0,1),this}makeScale(e,t,s){return this.set(e,0,0,0,0,t,0,0,0,0,s,0,0,0,0,1),this}makeShear(e,t,s,r,n,i){return this.set(1,s,n,0,e,1,i,0,t,r,1,0,0,0,0,1),this}compose(e,t,s){const r=this.elements,n=t._x,i=t._y,o=t._z,l=t._w,c=n+n,d=i+i,h=o+o,p=n*c,u=n*d,m=n*h,g=i*d,f=i*h,y=o*h,b=l*c,w=l*d,v=l*h,C=s.x,k=s.y,M=s.z;return r[0]=(1-(g+y))*C,r[1]=(u+v)*C,r[2]=(m-w)*C,r[3]=0,r[4]=(u-v)*k,r[5]=(1-(p+y))*k,r[6]=(f+b)*k,r[7]=0,r[8]=(m+w)*M,r[9]=(f-b)*M,r[10]=(1-(p+g))*M,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,s){const r=this.elements;let n=qe.set(r[0],r[1],r[2]).length();const i=qe.set(r[4],r[5],r[6]).length(),o=qe.set(r[8],r[9],r[10]).length();this.determinant()<0&&(n=-n),e.x=r[12],e.y=r[13],e.z=r[14],de.copy(this);const c=1/n,d=1/i,h=1/o;return de.elements[0]*=c,de.elements[1]*=c,de.elements[2]*=c,de.elements[4]*=d,de.elements[5]*=d,de.elements[6]*=d,de.elements[8]*=h,de.elements[9]*=h,de.elements[10]*=h,t.setFromRotationMatrix(de),s.x=n,s.y=i,s.z=o,this}makePerspective(e,t,s,r,n,i,o=He){const l=this.elements,c=2*n/(t-e),d=2*n/(s-r),h=(t+e)/(t-e),p=(s+r)/(s-r);let u,m;if(o===He)u=-(i+n)/(i-n),m=-2*i*n/(i-n);else if(o===fs)u=-i/(i-n),m=-i*n/(i-n);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=d,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=u,l[14]=m,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,s,r,n,i,o=He){const l=this.elements,c=1/(t-e),d=1/(s-r),h=1/(i-n),p=(t+e)*c,u=(s+r)*d;let m,g;if(o===He)m=(i+n)*h,g=-2*h;else if(o===fs)m=n*h,g=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-p,l[1]=0,l[5]=2*d,l[9]=0,l[13]=-u,l[2]=0,l[6]=0,l[10]=g,l[14]=-m,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,s=e.elements;for(let r=0;r<16;r++)if(t[r]!==s[r])return!1;return!0}fromArray(e,t=0){for(let s=0;s<16;s++)this.elements[s]=e[s+t];return this}toArray(e=[],t=0){const s=this.elements;return e[t]=s[0],e[t+1]=s[1],e[t+2]=s[2],e[t+3]=s[3],e[t+4]=s[4],e[t+5]=s[5],e[t+6]=s[6],e[t+7]=s[7],e[t+8]=s[8],e[t+9]=s[9],e[t+10]=s[10],e[t+11]=s[11],e[t+12]=s[12],e[t+13]=s[13],e[t+14]=s[14],e[t+15]=s[15],e}}const qe=new x,de=new X,un=new x(0,0,0),mn=new x(1,1,1),Pe=new x,wt=new x,te=new x,Zs=new X,Js=new ut;class Ie{constructor(e=0,t=0,s=0,r=Ie.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=s,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,s,r=this._order){return this._x=e,this._y=t,this._z=s,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,s=!0){const r=e.elements,n=r[0],i=r[4],o=r[8],l=r[1],c=r[5],d=r[9],h=r[2],p=r[6],u=r[10];switch(t){case"XYZ":this._y=Math.asin(Q(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-d,u),this._z=Math.atan2(-i,n)):(this._x=Math.atan2(p,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Q(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(o,u),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,n),this._z=0);break;case"ZXY":this._x=Math.asin(Q(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(-h,u),this._z=Math.atan2(-i,c)):(this._y=0,this._z=Math.atan2(l,n));break;case"ZYX":this._y=Math.asin(-Q(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(p,u),this._z=Math.atan2(l,n)):(this._x=0,this._z=Math.atan2(-i,c));break;case"YZX":this._z=Math.asin(Q(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-d,c),this._y=Math.atan2(-h,n)):(this._x=0,this._y=Math.atan2(o,u));break;case"XZY":this._z=Math.asin(-Q(i,-1,1)),Math.abs(i)<.9999999?(this._x=Math.atan2(p,c),this._y=Math.atan2(o,n)):(this._x=Math.atan2(-d,u),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,s===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,s){return Zs.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Zs,t,s)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Js.setFromEuler(this),this.setFromQuaternion(Js,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Ie.DEFAULT_ORDER="XYZ";class gn{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let fn=0;const Ks=new x,Ye=new ut,we=new X,Mt=new x,lt=new x,bn=new x,yn=new ut,Qs=new x(1,0,0),er=new x(0,1,0),tr=new x(0,0,1),sr={type:"added"},vn={type:"removed"},Xe={type:"childadded",child:null},Jt={type:"childremoved",child:null};class ee extends Ot{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:fn++}),this.uuid=pt(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=ee.DEFAULT_UP.clone();const e=new x,t=new Ie,s=new ut,r=new x(1,1,1);function n(){s.setFromEuler(t,!1)}function i(){t.setFromQuaternion(s,void 0,!1)}t._onChange(n),s._onChange(i),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:s},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new X},normalMatrix:{value:new Te}}),this.matrix=new X,this.matrixWorld=new X,this.matrixAutoUpdate=ee.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=ee.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new gn,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ye.setFromAxisAngle(e,t),this.quaternion.multiply(Ye),this}rotateOnWorldAxis(e,t){return Ye.setFromAxisAngle(e,t),this.quaternion.premultiply(Ye),this}rotateX(e){return this.rotateOnAxis(Qs,e)}rotateY(e){return this.rotateOnAxis(er,e)}rotateZ(e){return this.rotateOnAxis(tr,e)}translateOnAxis(e,t){return Ks.copy(e).applyQuaternion(this.quaternion),this.position.add(Ks.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Qs,e)}translateY(e){return this.translateOnAxis(er,e)}translateZ(e){return this.translateOnAxis(tr,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(we.copy(this.matrixWorld).invert())}lookAt(e,t,s){e.isVector3?Mt.copy(e):Mt.set(e,t,s);const r=this.parent;this.updateWorldMatrix(!0,!1),lt.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?we.lookAt(lt,Mt,this.up):we.lookAt(Mt,lt,this.up),this.quaternion.setFromRotationMatrix(we),r&&(we.extractRotation(r.matrixWorld),Ye.setFromRotationMatrix(we),this.quaternion.premultiply(Ye.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(sr),Xe.child=e,this.dispatchEvent(Xe),Xe.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let s=0;s<arguments.length;s++)this.remove(arguments[s]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(vn),Jt.child=e,this.dispatchEvent(Jt),Jt.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),we.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),we.multiply(e.parent.matrixWorld)),e.applyMatrix4(we),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(sr),Xe.child=e,this.dispatchEvent(Xe),Xe.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let s=0,r=this.children.length;s<r;s++){const i=this.children[s].getObjectByProperty(e,t);if(i!==void 0)return i}}getObjectsByProperty(e,t,s=[]){this[e]===t&&s.push(this);const r=this.children;for(let n=0,i=r.length;n<i;n++)r[n].getObjectsByProperty(e,t,s);return s}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(lt,e,bn),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(lt,yn,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let s=0,r=t.length;s<r;s++)t[s].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let s=0,r=t.length;s<r;s++)t[s].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let s=0,r=t.length;s<r;s++)t[s].updateMatrixWorld(e)}updateWorldMatrix(e,t){const s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const r=this.children;for(let n=0,i=r.length;n<i;n++)r[n].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",s={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},s.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function n(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=n(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,d=l.length;c<d;c++){const h=l[c];n(e.shapes,h)}else n(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(n(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(n(e.materials,this.material[l]));r.material=o}else r.material=n(e.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];r.animations.push(n(e.animations,l))}}if(t){const o=i(e.geometries),l=i(e.materials),c=i(e.textures),d=i(e.images),h=i(e.shapes),p=i(e.skeletons),u=i(e.animations),m=i(e.nodes);o.length>0&&(s.geometries=o),l.length>0&&(s.materials=l),c.length>0&&(s.textures=c),d.length>0&&(s.images=d),h.length>0&&(s.shapes=h),p.length>0&&(s.skeletons=p),u.length>0&&(s.animations=u),m.length>0&&(s.nodes=m)}return s.object=r,s;function i(o){const l=[];for(const c in o){const d=o[c];delete d.metadata,l.push(d)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let s=0;s<e.children.length;s++){const r=e.children[s];this.add(r.clone())}return this}}ee.DEFAULT_UP=new x(0,1,0);ee.DEFAULT_MATRIX_AUTO_UPDATE=!0;ee.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const he=new x,Me=new x,Kt=new x,Se=new x,Ze=new x,Je=new x,rr=new x,Qt=new x,es=new x,ts=new x,ss=new ae,rs=new ae,ns=new ae;class ue{constructor(e=new x,t=new x,s=new x){this.a=e,this.b=t,this.c=s}static getNormal(e,t,s,r){r.subVectors(s,t),he.subVectors(e,t),r.cross(he);const n=r.lengthSq();return n>0?r.multiplyScalar(1/Math.sqrt(n)):r.set(0,0,0)}static getBarycoord(e,t,s,r,n){he.subVectors(r,t),Me.subVectors(s,t),Kt.subVectors(e,t);const i=he.dot(he),o=he.dot(Me),l=he.dot(Kt),c=Me.dot(Me),d=Me.dot(Kt),h=i*c-o*o;if(h===0)return n.set(0,0,0),null;const p=1/h,u=(c*l-o*d)*p,m=(i*d-o*l)*p;return n.set(1-u-m,m,u)}static containsPoint(e,t,s,r){return this.getBarycoord(e,t,s,r,Se)===null?!1:Se.x>=0&&Se.y>=0&&Se.x+Se.y<=1}static getInterpolation(e,t,s,r,n,i,o,l){return this.getBarycoord(e,t,s,r,Se)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(n,Se.x),l.addScaledVector(i,Se.y),l.addScaledVector(o,Se.z),l)}static getInterpolatedAttribute(e,t,s,r,n,i){return ss.setScalar(0),rs.setScalar(0),ns.setScalar(0),ss.fromBufferAttribute(e,t),rs.fromBufferAttribute(e,s),ns.fromBufferAttribute(e,r),i.setScalar(0),i.addScaledVector(ss,n.x),i.addScaledVector(rs,n.y),i.addScaledVector(ns,n.z),i}static isFrontFacing(e,t,s,r){return he.subVectors(s,t),Me.subVectors(e,t),he.cross(Me).dot(r)<0}set(e,t,s){return this.a.copy(e),this.b.copy(t),this.c.copy(s),this}setFromPointsAndIndices(e,t,s,r){return this.a.copy(e[t]),this.b.copy(e[s]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,s,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,s),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return he.subVectors(this.c,this.b),Me.subVectors(this.a,this.b),he.cross(Me).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return ue.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return ue.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,s,r,n){return ue.getInterpolation(e,this.a,this.b,this.c,t,s,r,n)}containsPoint(e){return ue.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return ue.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const s=this.a,r=this.b,n=this.c;let i,o;Ze.subVectors(r,s),Je.subVectors(n,s),Qt.subVectors(e,s);const l=Ze.dot(Qt),c=Je.dot(Qt);if(l<=0&&c<=0)return t.copy(s);es.subVectors(e,r);const d=Ze.dot(es),h=Je.dot(es);if(d>=0&&h<=d)return t.copy(r);const p=l*h-d*c;if(p<=0&&l>=0&&d<=0)return i=l/(l-d),t.copy(s).addScaledVector(Ze,i);ts.subVectors(e,n);const u=Ze.dot(ts),m=Je.dot(ts);if(m>=0&&u<=m)return t.copy(n);const g=u*c-l*m;if(g<=0&&c>=0&&m<=0)return o=c/(c-m),t.copy(s).addScaledVector(Je,o);const f=d*m-u*h;if(f<=0&&h-d>=0&&u-m>=0)return rr.subVectors(n,r),o=(h-d)/(h-d+(u-m)),t.copy(r).addScaledVector(rr,o);const y=1/(f+g+p);return i=g*y,o=p*y,t.copy(s).addScaledVector(Ze,i).addScaledVector(Je,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const $r={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},_e={h:0,s:0,l:0},St={h:0,s:0,l:0};function is(a,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?a+(e-a)*6*t:t<1/2?e:t<2/3?a+(e-a)*6*(2/3-t):a}class Fe{constructor(e,t,s){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,s)}set(e,t,s){if(t===void 0&&s===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,s);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=pe){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ne.toWorkingColorSpace(this,t),this}setRGB(e,t,s,r=ne.workingColorSpace){return this.r=e,this.g=t,this.b=s,ne.toWorkingColorSpace(this,r),this}setHSL(e,t,s,r=ne.workingColorSpace){if(e=nn(e,1),t=Q(t,0,1),s=Q(s,0,1),t===0)this.r=this.g=this.b=s;else{const n=s<=.5?s*(1+t):s+t-s*t,i=2*s-n;this.r=is(i,n,e+1/3),this.g=is(i,n,e),this.b=is(i,n,e-1/3)}return ne.toWorkingColorSpace(this,r),this}setStyle(e,t=pe){function s(n){n!==void 0&&parseFloat(n)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let n;const i=r[1],o=r[2];switch(i){case"rgb":case"rgba":if(n=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return s(n[4]),this.setRGB(Math.min(255,parseInt(n[1],10))/255,Math.min(255,parseInt(n[2],10))/255,Math.min(255,parseInt(n[3],10))/255,t);if(n=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return s(n[4]),this.setRGB(Math.min(100,parseInt(n[1],10))/100,Math.min(100,parseInt(n[2],10))/100,Math.min(100,parseInt(n[3],10))/100,t);break;case"hsl":case"hsla":if(n=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return s(n[4]),this.setHSL(parseFloat(n[1])/360,parseFloat(n[2])/100,parseFloat(n[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=pe){const s=$r[e.toLowerCase()];return s!==void 0?this.setHex(s,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ce(e.r),this.g=Ce(e.g),this.b=Ce(e.b),this}copyLinearToSRGB(e){return this.r=st(e.r),this.g=st(e.g),this.b=st(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=pe){return ne.fromWorkingColorSpace(J.copy(this),e),Math.round(Q(J.r*255,0,255))*65536+Math.round(Q(J.g*255,0,255))*256+Math.round(Q(J.b*255,0,255))}getHexString(e=pe){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ne.workingColorSpace){ne.fromWorkingColorSpace(J.copy(this),t);const s=J.r,r=J.g,n=J.b,i=Math.max(s,r,n),o=Math.min(s,r,n);let l,c;const d=(o+i)/2;if(o===i)l=0,c=0;else{const h=i-o;switch(c=d<=.5?h/(i+o):h/(2-i-o),i){case s:l=(r-n)/h+(r<n?6:0);break;case r:l=(n-s)/h+2;break;case n:l=(s-r)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=d,e}getRGB(e,t=ne.workingColorSpace){return ne.fromWorkingColorSpace(J.copy(this),t),e.r=J.r,e.g=J.g,e.b=J.b,e}getStyle(e=pe){ne.fromWorkingColorSpace(J.copy(this),e);const t=J.r,s=J.g,r=J.b;return e!==pe?`color(${e} ${t.toFixed(3)} ${s.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(s*255)},${Math.round(r*255)})`}offsetHSL(e,t,s){return this.getHSL(_e),this.setHSL(_e.h+e,_e.s+t,_e.l+s)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,s){return this.r=e.r+(t.r-e.r)*s,this.g=e.g+(t.g-e.g)*s,this.b=e.b+(t.b-e.b)*s,this}lerpHSL(e,t){this.getHSL(_e),e.getHSL(St);const s=jt(_e.h,St.h,t),r=jt(_e.s,St.s,t),n=jt(_e.l,St.l,t);return this.setHSL(s,r,n),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,s=this.g,r=this.b,n=e.elements;return this.r=n[0]*t+n[3]*s+n[6]*r,this.g=n[1]*t+n[4]*s+n[7]*r,this.b=n[2]*t+n[5]*s+n[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const J=new Fe;Fe.NAMES=$r;let xn=0;class Er extends Ot{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:xn++}),this.uuid=pt(),this.name="",this.blending=Bs,this.side=ms,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Fs,this.blendDst=Rs,this.blendEquation=Is,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Fe(0,0,0),this.blendAlpha=0,this.depthFunc=Ls,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Hs,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=je,this.stencilZFail=je,this.stencilZPass=je,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const s=e[t];if(s===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(s):r&&r.isVector3&&s&&s.isVector3?r.copy(s):this[t]=s}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const s={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.color&&this.color.isColor&&(s.color=this.color.getHex()),this.roughness!==void 0&&(s.roughness=this.roughness),this.metalness!==void 0&&(s.metalness=this.metalness),this.sheen!==void 0&&(s.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(s.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(s.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(s.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(s.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(s.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(s.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(s.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(s.shininess=this.shininess),this.clearcoat!==void 0&&(s.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(s.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(s.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(s.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(s.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,s.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(s.dispersion=this.dispersion),this.iridescence!==void 0&&(s.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(s.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(s.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(s.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(s.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(s.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(s.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(s.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(s.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(s.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(s.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(s.lightMap=this.lightMap.toJSON(e).uuid,s.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(s.aoMap=this.aoMap.toJSON(e).uuid,s.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(s.bumpMap=this.bumpMap.toJSON(e).uuid,s.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(s.normalMap=this.normalMap.toJSON(e).uuid,s.normalMapType=this.normalMapType,s.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(s.displacementMap=this.displacementMap.toJSON(e).uuid,s.displacementScale=this.displacementScale,s.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(s.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(s.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(s.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(s.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(s.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(s.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(s.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(s.combine=this.combine)),this.envMapRotation!==void 0&&(s.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(s.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(s.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(s.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(s.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(s.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(s.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(s.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(s.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(s.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(s.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(s.size=this.size),this.shadowSide!==null&&(s.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(s.sizeAttenuation=this.sizeAttenuation),this.blending!==Bs&&(s.blending=this.blending),this.side!==ms&&(s.side=this.side),this.vertexColors===!0&&(s.vertexColors=!0),this.opacity<1&&(s.opacity=this.opacity),this.transparent===!0&&(s.transparent=!0),this.blendSrc!==Fs&&(s.blendSrc=this.blendSrc),this.blendDst!==Rs&&(s.blendDst=this.blendDst),this.blendEquation!==Is&&(s.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(s.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(s.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(s.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(s.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(s.blendAlpha=this.blendAlpha),this.depthFunc!==Ls&&(s.depthFunc=this.depthFunc),this.depthTest===!1&&(s.depthTest=this.depthTest),this.depthWrite===!1&&(s.depthWrite=this.depthWrite),this.colorWrite===!1&&(s.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(s.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Hs&&(s.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(s.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(s.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==je&&(s.stencilFail=this.stencilFail),this.stencilZFail!==je&&(s.stencilZFail=this.stencilZFail),this.stencilZPass!==je&&(s.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(s.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(s.rotation=this.rotation),this.polygonOffset===!0&&(s.polygonOffset=!0),this.polygonOffsetFactor!==0&&(s.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(s.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(s.linewidth=this.linewidth),this.dashSize!==void 0&&(s.dashSize=this.dashSize),this.gapSize!==void 0&&(s.gapSize=this.gapSize),this.scale!==void 0&&(s.scale=this.scale),this.dithering===!0&&(s.dithering=!0),this.alphaTest>0&&(s.alphaTest=this.alphaTest),this.alphaHash===!0&&(s.alphaHash=!0),this.alphaToCoverage===!0&&(s.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(s.premultipliedAlpha=!0),this.forceSinglePass===!0&&(s.forceSinglePass=!0),this.wireframe===!0&&(s.wireframe=!0),this.wireframeLinewidth>1&&(s.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(s.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(s.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(s.flatShading=!0),this.visible===!1&&(s.visible=!1),this.toneMapped===!1&&(s.toneMapped=!1),this.fog===!1&&(s.fog=!1),Object.keys(this.userData).length>0&&(s.userData=this.userData);function r(n){const i=[];for(const o in n){const l=n[o];delete l.metadata,i.push(l)}return i}if(t){const n=r(e.textures),i=r(e.images);n.length>0&&(s.textures=n),i.length>0&&(s.images=i)}return s}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let s=null;if(t!==null){const r=t.length;s=new Array(r);for(let n=0;n!==r;++n)s[n]=t[n].clone()}return this.clippingPlanes=s,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class wn extends Er{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new Fe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ie,this.combine=Jr,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const V=new x,kt=new G;class rt{constructor(e,t,s=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=s,this.usage=Ns,this.updateRanges=[],this.gpuType=tn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,s){e*=this.itemSize,s*=t.itemSize;for(let r=0,n=this.itemSize;r<n;r++)this.array[e+r]=t.array[s+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,s=this.count;t<s;t++)kt.fromBufferAttribute(this,t),kt.applyMatrix3(e),this.setXY(t,kt.x,kt.y);else if(this.itemSize===3)for(let t=0,s=this.count;t<s;t++)V.fromBufferAttribute(this,t),V.applyMatrix3(e),this.setXYZ(t,V.x,V.y,V.z);return this}applyMatrix4(e){for(let t=0,s=this.count;t<s;t++)V.fromBufferAttribute(this,t),V.applyMatrix4(e),this.setXYZ(t,V.x,V.y,V.z);return this}applyNormalMatrix(e){for(let t=0,s=this.count;t<s;t++)V.fromBufferAttribute(this,t),V.applyNormalMatrix(e),this.setXYZ(t,V.x,V.y,V.z);return this}transformDirection(e){for(let t=0,s=this.count;t<s;t++)V.fromBufferAttribute(this,t),V.transformDirection(e),this.setXYZ(t,V.x,V.y,V.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let s=this.array[e*this.itemSize+t];return this.normalized&&(s=it(s,this.array)),s}setComponent(e,t,s){return this.normalized&&(s=K(s,this.array)),this.array[e*this.itemSize+t]=s,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=it(t,this.array)),t}setX(e,t){return this.normalized&&(t=K(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=it(t,this.array)),t}setY(e,t){return this.normalized&&(t=K(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=it(t,this.array)),t}setZ(e,t){return this.normalized&&(t=K(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=it(t,this.array)),t}setW(e,t){return this.normalized&&(t=K(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,s){return e*=this.itemSize,this.normalized&&(t=K(t,this.array),s=K(s,this.array)),this.array[e+0]=t,this.array[e+1]=s,this}setXYZ(e,t,s,r){return e*=this.itemSize,this.normalized&&(t=K(t,this.array),s=K(s,this.array),r=K(r,this.array)),this.array[e+0]=t,this.array[e+1]=s,this.array[e+2]=r,this}setXYZW(e,t,s,r,n){return e*=this.itemSize,this.normalized&&(t=K(t,this.array),s=K(s,this.array),r=K(r,this.array),n=K(n,this.array)),this.array[e+0]=t,this.array[e+1]=s,this.array[e+2]=r,this.array[e+3]=n,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Ns&&(e.usage=this.usage),e}}class Mn extends rt{constructor(e,t,s){super(new Uint16Array(e),t,s)}}class Sn extends rt{constructor(e,t,s){super(new Uint32Array(e),t,s)}}class j extends rt{constructor(e,t,s){super(new Float32Array(e),t,s)}}let kn=0;const re=new X,as=new ee,Ke=new x,se=new mt,ct=new mt,q=new x;class be extends Ot{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:kn++}),this.uuid=pt(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(an(e)?Sn:Mn)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,s=0){this.groups.push({start:e,count:t,materialIndex:s})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const s=this.attributes.normal;if(s!==void 0){const n=new Te().getNormalMatrix(e);s.applyNormalMatrix(n),s.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return re.makeRotationFromQuaternion(e),this.applyMatrix4(re),this}rotateX(e){return re.makeRotationX(e),this.applyMatrix4(re),this}rotateY(e){return re.makeRotationY(e),this.applyMatrix4(re),this}rotateZ(e){return re.makeRotationZ(e),this.applyMatrix4(re),this}translate(e,t,s){return re.makeTranslation(e,t,s),this.applyMatrix4(re),this}scale(e,t,s){return re.makeScale(e,t,s),this.applyMatrix4(re),this}lookAt(e){return as.lookAt(e),as.updateMatrix(),this.applyMatrix4(as.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ke).negate(),this.translate(Ke.x,Ke.y,Ke.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const s=[];for(let r=0,n=e.length;r<n;r++){const i=e[r];s.push(i.x,i.y,i.z||0)}this.setAttribute("position",new j(s,3))}else{for(let s=0,r=t.count;s<r;s++){const n=e[s];t.setXYZ(s,n.x,n.y,n.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new mt);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new x(-1/0,-1/0,-1/0),new x(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let s=0,r=t.length;s<r;s++){const n=t[s];se.setFromBufferAttribute(n),this.morphTargetsRelative?(q.addVectors(this.boundingBox.min,se.min),this.boundingBox.expandByPoint(q),q.addVectors(this.boundingBox.max,se.max),this.boundingBox.expandByPoint(q)):(this.boundingBox.expandByPoint(se.min),this.boundingBox.expandByPoint(se.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new bs);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new x,1/0);return}if(e){const s=this.boundingSphere.center;if(se.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const o=t[n];ct.setFromBufferAttribute(o),this.morphTargetsRelative?(q.addVectors(se.min,ct.min),se.expandByPoint(q),q.addVectors(se.max,ct.max),se.expandByPoint(q)):(se.expandByPoint(ct.min),se.expandByPoint(ct.max))}se.getCenter(s);let r=0;for(let n=0,i=e.count;n<i;n++)q.fromBufferAttribute(e,n),r=Math.max(r,s.distanceToSquared(q));if(t)for(let n=0,i=t.length;n<i;n++){const o=t[n],l=this.morphTargetsRelative;for(let c=0,d=o.count;c<d;c++)q.fromBufferAttribute(o,c),l&&(Ke.fromBufferAttribute(e,c),q.add(Ke)),r=Math.max(r,s.distanceToSquared(q))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const s=t.position,r=t.normal,n=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new rt(new Float32Array(4*s.count),4));const i=this.getAttribute("tangent"),o=[],l=[];for(let S=0;S<s.count;S++)o[S]=new x,l[S]=new x;const c=new x,d=new x,h=new x,p=new G,u=new G,m=new G,g=new x,f=new x;function y(S,z,E){c.fromBufferAttribute(s,S),d.fromBufferAttribute(s,z),h.fromBufferAttribute(s,E),p.fromBufferAttribute(n,S),u.fromBufferAttribute(n,z),m.fromBufferAttribute(n,E),d.sub(c),h.sub(c),u.sub(p),m.sub(p);const T=1/(u.x*m.y-m.x*u.y);isFinite(T)&&(g.copy(d).multiplyScalar(m.y).addScaledVector(h,-u.y).multiplyScalar(T),f.copy(h).multiplyScalar(u.x).addScaledVector(d,-m.x).multiplyScalar(T),o[S].add(g),o[z].add(g),o[E].add(g),l[S].add(f),l[z].add(f),l[E].add(f))}let b=this.groups;b.length===0&&(b=[{start:0,count:e.count}]);for(let S=0,z=b.length;S<z;++S){const E=b[S],T=E.start,I=E.count;for(let A=T,O=T+I;A<O;A+=3)y(e.getX(A+0),e.getX(A+1),e.getX(A+2))}const w=new x,v=new x,C=new x,k=new x;function M(S){C.fromBufferAttribute(r,S),k.copy(C);const z=o[S];w.copy(z),w.sub(C.multiplyScalar(C.dot(z))).normalize(),v.crossVectors(k,z);const T=v.dot(l[S])<0?-1:1;i.setXYZW(S,w.x,w.y,w.z,T)}for(let S=0,z=b.length;S<z;++S){const E=b[S],T=E.start,I=E.count;for(let A=T,O=T+I;A<O;A+=3)M(e.getX(A+0)),M(e.getX(A+1)),M(e.getX(A+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let s=this.getAttribute("normal");if(s===void 0)s=new rt(new Float32Array(t.count*3),3),this.setAttribute("normal",s);else for(let p=0,u=s.count;p<u;p++)s.setXYZ(p,0,0,0);const r=new x,n=new x,i=new x,o=new x,l=new x,c=new x,d=new x,h=new x;if(e)for(let p=0,u=e.count;p<u;p+=3){const m=e.getX(p+0),g=e.getX(p+1),f=e.getX(p+2);r.fromBufferAttribute(t,m),n.fromBufferAttribute(t,g),i.fromBufferAttribute(t,f),d.subVectors(i,n),h.subVectors(r,n),d.cross(h),o.fromBufferAttribute(s,m),l.fromBufferAttribute(s,g),c.fromBufferAttribute(s,f),o.add(d),l.add(d),c.add(d),s.setXYZ(m,o.x,o.y,o.z),s.setXYZ(g,l.x,l.y,l.z),s.setXYZ(f,c.x,c.y,c.z)}else for(let p=0,u=t.count;p<u;p+=3)r.fromBufferAttribute(t,p+0),n.fromBufferAttribute(t,p+1),i.fromBufferAttribute(t,p+2),d.subVectors(i,n),h.subVectors(r,n),d.cross(h),s.setXYZ(p+0,d.x,d.y,d.z),s.setXYZ(p+1,d.x,d.y,d.z),s.setXYZ(p+2,d.x,d.y,d.z);this.normalizeNormals(),s.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,s=e.count;t<s;t++)q.fromBufferAttribute(e,t),q.normalize(),e.setXYZ(t,q.x,q.y,q.z)}toNonIndexed(){function e(o,l){const c=o.array,d=o.itemSize,h=o.normalized,p=new c.constructor(l.length*d);let u=0,m=0;for(let g=0,f=l.length;g<f;g++){o.isInterleavedBufferAttribute?u=l[g]*o.data.stride+o.offset:u=l[g]*d;for(let y=0;y<d;y++)p[m++]=c[u++]}return new rt(p,d,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new be,s=this.index.array,r=this.attributes;for(const o in r){const l=r[o],c=e(l,s);t.setAttribute(o,c)}const n=this.morphAttributes;for(const o in n){const l=[],c=n[o];for(let d=0,h=c.length;d<h;d++){const p=c[d],u=e(p,s);l.push(u)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const i=this.groups;for(let o=0,l=i.length;o<l;o++){const c=i[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const s=this.attributes;for(const l in s){const c=s[l];e.data.attributes[l]=c.toJSON(e.data)}const r={};let n=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],d=[];for(let h=0,p=c.length;h<p;h++){const u=c[h];d.push(u.toJSON(e.data))}d.length>0&&(r[l]=d,n=!0)}n&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const i=this.groups;i.length>0&&(e.data.groups=JSON.parse(JSON.stringify(i)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const s=e.index;s!==null&&this.setIndex(s.clone(t));const r=e.attributes;for(const c in r){const d=r[c];this.setAttribute(c,d.clone(t))}const n=e.morphAttributes;for(const c in n){const d=[],h=n[c];for(let p=0,u=h.length;p<u;p++)d.push(h[p].clone(t));this.morphAttributes[c]=d}this.morphTargetsRelative=e.morphTargetsRelative;const i=e.groups;for(let c=0,d=i.length;c<d;c++){const h=i[c];this.addGroup(h.start,h.count,h.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const nr=new X,Oe=new pn,Ct=new bs,ir=new x,Tt=new x,zt=new x,$t=new x,os=new x,Et=new x,ar=new x,Pt=new x;class Pr extends ee{constructor(e=new be,t=new wn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,s=Object.keys(t);if(s.length>0){const r=t[s[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let n=0,i=r.length;n<i;n++){const o=r[n].name||String(n);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=n}}}}getVertexPosition(e,t){const s=this.geometry,r=s.attributes.position,n=s.morphAttributes.position,i=s.morphTargetsRelative;t.fromBufferAttribute(r,e);const o=this.morphTargetInfluences;if(n&&o){Et.set(0,0,0);for(let l=0,c=n.length;l<c;l++){const d=o[l],h=n[l];d!==0&&(os.fromBufferAttribute(h,e),i?Et.addScaledVector(os,d):Et.addScaledVector(os.sub(t),d))}t.add(Et)}return t}raycast(e,t){const s=this.geometry,r=this.material,n=this.matrixWorld;r!==void 0&&(s.boundingSphere===null&&s.computeBoundingSphere(),Ct.copy(s.boundingSphere),Ct.applyMatrix4(n),Oe.copy(e.ray).recast(e.near),!(Ct.containsPoint(Oe.origin)===!1&&(Oe.intersectSphere(Ct,ir)===null||Oe.origin.distanceToSquared(ir)>(e.far-e.near)**2))&&(nr.copy(n).invert(),Oe.copy(e.ray).applyMatrix4(nr),!(s.boundingBox!==null&&Oe.intersectsBox(s.boundingBox)===!1)&&this._computeIntersections(e,t,Oe)))}_computeIntersections(e,t,s){let r;const n=this.geometry,i=this.material,o=n.index,l=n.attributes.position,c=n.attributes.uv,d=n.attributes.uv1,h=n.attributes.normal,p=n.groups,u=n.drawRange;if(o!==null)if(Array.isArray(i))for(let m=0,g=p.length;m<g;m++){const f=p[m],y=i[f.materialIndex],b=Math.max(f.start,u.start),w=Math.min(o.count,Math.min(f.start+f.count,u.start+u.count));for(let v=b,C=w;v<C;v+=3){const k=o.getX(v),M=o.getX(v+1),S=o.getX(v+2);r=_t(this,y,e,s,c,d,h,k,M,S),r&&(r.faceIndex=Math.floor(v/3),r.face.materialIndex=f.materialIndex,t.push(r))}}else{const m=Math.max(0,u.start),g=Math.min(o.count,u.start+u.count);for(let f=m,y=g;f<y;f+=3){const b=o.getX(f),w=o.getX(f+1),v=o.getX(f+2);r=_t(this,i,e,s,c,d,h,b,w,v),r&&(r.faceIndex=Math.floor(f/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(i))for(let m=0,g=p.length;m<g;m++){const f=p[m],y=i[f.materialIndex],b=Math.max(f.start,u.start),w=Math.min(l.count,Math.min(f.start+f.count,u.start+u.count));for(let v=b,C=w;v<C;v+=3){const k=v,M=v+1,S=v+2;r=_t(this,y,e,s,c,d,h,k,M,S),r&&(r.faceIndex=Math.floor(v/3),r.face.materialIndex=f.materialIndex,t.push(r))}}else{const m=Math.max(0,u.start),g=Math.min(l.count,u.start+u.count);for(let f=m,y=g;f<y;f+=3){const b=f,w=f+1,v=f+2;r=_t(this,i,e,s,c,d,h,b,w,v),r&&(r.faceIndex=Math.floor(f/3),t.push(r))}}}}function Cn(a,e,t,s,r,n,i,o){let l;if(e.side===Zr?l=s.intersectTriangle(i,n,r,!0,o):l=s.intersectTriangle(r,n,i,e.side===ms,o),l===null)return null;Pt.copy(o),Pt.applyMatrix4(a.matrixWorld);const c=t.ray.origin.distanceTo(Pt);return c<t.near||c>t.far?null:{distance:c,point:Pt.clone(),object:a}}function _t(a,e,t,s,r,n,i,o,l,c){a.getVertexPosition(o,Tt),a.getVertexPosition(l,zt),a.getVertexPosition(c,$t);const d=Cn(a,e,t,s,Tt,zt,$t,ar);if(d){const h=new x;ue.getBarycoord(ar,Tt,zt,$t,h),r&&(d.uv=ue.getInterpolatedAttribute(r,o,l,c,h,new G)),n&&(d.uv1=ue.getInterpolatedAttribute(n,o,l,c,h,new G)),i&&(d.normal=ue.getInterpolatedAttribute(i,o,l,c,h,new x),d.normal.dot(s.direction)>0&&d.normal.multiplyScalar(-1));const p={a:o,b:l,c,normal:new x,materialIndex:0};ue.getNormal(Tt,zt,$t,p.normal),d.face=p,d.barycoord=h}return d}class ys extends be{constructor(e=1,t=1,s=1,r=1,n=1,i=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:s,widthSegments:r,heightSegments:n,depthSegments:i};const o=this;r=Math.floor(r),n=Math.floor(n),i=Math.floor(i);const l=[],c=[],d=[],h=[];let p=0,u=0;m("z","y","x",-1,-1,s,t,e,i,n,0),m("z","y","x",1,-1,s,t,-e,i,n,1),m("x","z","y",1,1,e,s,t,r,i,2),m("x","z","y",1,-1,e,s,-t,r,i,3),m("x","y","z",1,-1,e,t,s,r,n,4),m("x","y","z",-1,-1,e,t,-s,r,n,5),this.setIndex(l),this.setAttribute("position",new j(c,3)),this.setAttribute("normal",new j(d,3)),this.setAttribute("uv",new j(h,2));function m(g,f,y,b,w,v,C,k,M,S,z){const E=v/M,T=C/S,I=v/2,A=C/2,O=k/2,U=M+1,$=S+1;let F=0,_=0;const B=new x;for(let P=0;P<$;P++){const R=P*T-A;for(let L=0;L<U;L++){const W=L*E-I;B[g]=W*b,B[f]=R*w,B[y]=O,c.push(B.x,B.y,B.z),B[g]=0,B[f]=0,B[y]=k>0?1:-1,d.push(B.x,B.y,B.z),h.push(L/M),h.push(1-P/S),F+=1}}for(let P=0;P<S;P++)for(let R=0;R<M;R++){const L=p+R+U*P,W=p+R+U*(P+1),le=p+(R+1)+U*(P+1),ge=p+(R+1)+U*P;l.push(L,W,ge),l.push(W,le,ge),_+=6}o.addGroup(u,_,z),u+=_,p+=F}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ys(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class _r extends ee{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new X,this.projectionMatrix=new X,this.projectionMatrixInverse=new X,this.coordinateSystem=He}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Ae=new x,or=new G,lr=new G;class Ar extends _r{constructor(e=50,t=1,s=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=s,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=js*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Nt*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return js*2*Math.atan(Math.tan(Nt*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,s){Ae.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ae.x,Ae.y).multiplyScalar(-e/Ae.z),Ae.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),s.set(Ae.x,Ae.y).multiplyScalar(-e/Ae.z)}getViewSize(e,t){return this.getViewBounds(e,or,lr),t.subVectors(lr,or)}setViewOffset(e,t,s,r,n,i){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=s,this.view.offsetY=r,this.view.width=n,this.view.height=i,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Nt*.5*this.fov)/this.zoom,s=2*t,r=this.aspect*s,n=-.5*r;const i=this.view;if(this.view!==null&&this.view.enabled){const l=i.fullWidth,c=i.fullHeight;n+=i.offsetX*r/l,t-=i.offsetY*s/c,r*=i.width/l,s*=i.height/c}const o=this.filmOffset;o!==0&&(n+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(n,n+r,t,t-s,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const ls=new x,Tn=new x,zn=new Te;class Qe{constructor(e=new x(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,s,r){return this.normal.set(e,t,s),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,s){const r=ls.subVectors(s,t).cross(Tn.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const s=e.delta(ls),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const n=-(e.start.dot(this.normal)+this.constant)/r;return n<0||n>1?null:t.copy(e.start).addScaledVector(s,n)}intersectsLine(e){const t=this.distanceToPoint(e.start),s=this.distanceToPoint(e.end);return t<0&&s>0||s<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const s=t||zn.getNormalMatrix(e),r=this.coplanarPoint(ls).applyMatrix4(e),n=this.normal.applyMatrix3(s).normalize();return this.constant=-r.dot(n),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const De=new bs,At=new x;class $n{constructor(e=new Qe,t=new Qe,s=new Qe,r=new Qe,n=new Qe,i=new Qe){this.planes=[e,t,s,r,n,i]}set(e,t,s,r,n,i){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(s),o[3].copy(r),o[4].copy(n),o[5].copy(i),this}copy(e){const t=this.planes;for(let s=0;s<6;s++)t[s].copy(e.planes[s]);return this}setFromProjectionMatrix(e,t=He){const s=this.planes,r=e.elements,n=r[0],i=r[1],o=r[2],l=r[3],c=r[4],d=r[5],h=r[6],p=r[7],u=r[8],m=r[9],g=r[10],f=r[11],y=r[12],b=r[13],w=r[14],v=r[15];if(s[0].setComponents(l-n,p-c,f-u,v-y).normalize(),s[1].setComponents(l+n,p+c,f+u,v+y).normalize(),s[2].setComponents(l+i,p+d,f+m,v+b).normalize(),s[3].setComponents(l-i,p-d,f-m,v-b).normalize(),s[4].setComponents(l-o,p-h,f-g,v-w).normalize(),t===He)s[5].setComponents(l+o,p+h,f+g,v+w).normalize();else if(t===fs)s[5].setComponents(o,h,g,w).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),De.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),De.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(De)}intersectsSprite(e){return De.center.set(0,0,0),De.radius=.7071067811865476,De.applyMatrix4(e.matrixWorld),this.intersectsSphere(De)}intersectsSphere(e){const t=this.planes,s=e.center,r=-e.radius;for(let n=0;n<6;n++)if(t[n].distanceToPoint(s)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let s=0;s<6;s++){const r=t[s];if(At.x=r.normal.x>0?e.max.x:e.min.x,At.y=r.normal.y>0?e.max.y:e.min.y,At.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(At)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let s=0;s<6;s++)if(t[s].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class vs extends be{constructor(e=1,t=1,s=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:s,heightSegments:r};const n=e/2,i=t/2,o=Math.floor(s),l=Math.floor(r),c=o+1,d=l+1,h=e/o,p=t/l,u=[],m=[],g=[],f=[];for(let y=0;y<d;y++){const b=y*p-i;for(let w=0;w<c;w++){const v=w*h-n;m.push(v,-b,0),g.push(0,0,1),f.push(w/o),f.push(1-y/l)}}for(let y=0;y<l;y++)for(let b=0;b<o;b++){const w=b+c*y,v=b+c*(y+1),C=b+1+c*(y+1),k=b+1+c*y;u.push(w,v,k),u.push(v,C,k)}this.setIndex(u),this.setAttribute("position",new j(m,3)),this.setAttribute("normal",new j(g,3)),this.setAttribute("uv",new j(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new vs(e.width,e.height,e.widthSegments,e.heightSegments)}}class En extends _r{constructor(e=-1,t=1,s=1,r=-1,n=.1,i=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=s,this.bottom=r,this.near=n,this.far=i,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,s,r,n,i){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=s,this.view.offsetY=r,this.view.width=n,this.view.height=i,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),s=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let n=s-e,i=s+e,o=r+t,l=r-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;n+=c*this.view.offsetX,i=n+c*this.view.width,o-=d*this.view.offsetY,l=o-d*this.view.height}this.projectionMatrix.makeOrthographic(n,i,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Pn extends ee{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ie,this.environmentIntensity=1,this.environmentRotation=new Ie,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class xs extends be{constructor(e=1,t=1,s=1,r=32,n=1,i=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:s,radialSegments:r,heightSegments:n,openEnded:i,thetaStart:o,thetaLength:l};const c=this;r=Math.floor(r),n=Math.floor(n);const d=[],h=[],p=[],u=[];let m=0;const g=[],f=s/2;let y=0;b(),i===!1&&(e>0&&w(!0),t>0&&w(!1)),this.setIndex(d),this.setAttribute("position",new j(h,3)),this.setAttribute("normal",new j(p,3)),this.setAttribute("uv",new j(u,2));function b(){const v=new x,C=new x;let k=0;const M=(t-e)/s;for(let S=0;S<=n;S++){const z=[],E=S/n,T=E*(t-e)+e;for(let I=0;I<=r;I++){const A=I/r,O=A*l+o,U=Math.sin(O),$=Math.cos(O);C.x=T*U,C.y=-E*s+f,C.z=T*$,h.push(C.x,C.y,C.z),v.set(U,M,$).normalize(),p.push(v.x,v.y,v.z),u.push(A,1-E),z.push(m++)}g.push(z)}for(let S=0;S<r;S++)for(let z=0;z<n;z++){const E=g[z][S],T=g[z+1][S],I=g[z+1][S+1],A=g[z][S+1];(e>0||z!==0)&&(d.push(E,T,A),k+=3),(t>0||z!==n-1)&&(d.push(T,I,A),k+=3)}c.addGroup(y,k,0),y+=k}function w(v){const C=m,k=new G,M=new x;let S=0;const z=v===!0?e:t,E=v===!0?1:-1;for(let I=1;I<=r;I++)h.push(0,f*E,0),p.push(0,E,0),u.push(.5,.5),m++;const T=m;for(let I=0;I<=r;I++){const O=I/r*l+o,U=Math.cos(O),$=Math.sin(O);M.x=z*$,M.y=f*E,M.z=z*U,h.push(M.x,M.y,M.z),p.push(0,E,0),k.x=U*.5+.5,k.y=$*.5*E+.5,u.push(k.x,k.y),m++}for(let I=0;I<r;I++){const A=C+I,O=T+I;v===!0?d.push(O,O+1,A):d.push(O+1,O,A),S+=3}c.addGroup(y,S,v===!0?1:2),y+=S}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new xs(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class ws extends xs{constructor(e=1,t=1,s=32,r=1,n=!1,i=0,o=Math.PI*2){super(0,e,t,s,r,n,i,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:s,heightSegments:r,openEnded:n,thetaStart:i,thetaLength:o}}static fromJSON(e){return new ws(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Ms extends be{constructor(e=[],t=[],s=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:s,detail:r};const n=[],i=[];o(r),c(s),d(),this.setAttribute("position",new j(n,3)),this.setAttribute("normal",new j(n.slice(),3)),this.setAttribute("uv",new j(i,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(b){const w=new x,v=new x,C=new x;for(let k=0;k<t.length;k+=3)u(t[k+0],w),u(t[k+1],v),u(t[k+2],C),l(w,v,C,b)}function l(b,w,v,C){const k=C+1,M=[];for(let S=0;S<=k;S++){M[S]=[];const z=b.clone().lerp(v,S/k),E=w.clone().lerp(v,S/k),T=k-S;for(let I=0;I<=T;I++)I===0&&S===k?M[S][I]=z:M[S][I]=z.clone().lerp(E,I/T)}for(let S=0;S<k;S++)for(let z=0;z<2*(k-S)-1;z++){const E=Math.floor(z/2);z%2===0?(p(M[S][E+1]),p(M[S+1][E]),p(M[S][E])):(p(M[S][E+1]),p(M[S+1][E+1]),p(M[S+1][E]))}}function c(b){const w=new x;for(let v=0;v<n.length;v+=3)w.x=n[v+0],w.y=n[v+1],w.z=n[v+2],w.normalize().multiplyScalar(b),n[v+0]=w.x,n[v+1]=w.y,n[v+2]=w.z}function d(){const b=new x;for(let w=0;w<n.length;w+=3){b.x=n[w+0],b.y=n[w+1],b.z=n[w+2];const v=f(b)/2/Math.PI+.5,C=y(b)/Math.PI+.5;i.push(v,1-C)}m(),h()}function h(){for(let b=0;b<i.length;b+=6){const w=i[b+0],v=i[b+2],C=i[b+4],k=Math.max(w,v,C),M=Math.min(w,v,C);k>.9&&M<.1&&(w<.2&&(i[b+0]+=1),v<.2&&(i[b+2]+=1),C<.2&&(i[b+4]+=1))}}function p(b){n.push(b.x,b.y,b.z)}function u(b,w){const v=b*3;w.x=e[v+0],w.y=e[v+1],w.z=e[v+2]}function m(){const b=new x,w=new x,v=new x,C=new x,k=new G,M=new G,S=new G;for(let z=0,E=0;z<n.length;z+=9,E+=6){b.set(n[z+0],n[z+1],n[z+2]),w.set(n[z+3],n[z+4],n[z+5]),v.set(n[z+6],n[z+7],n[z+8]),k.set(i[E+0],i[E+1]),M.set(i[E+2],i[E+3]),S.set(i[E+4],i[E+5]),C.copy(b).add(w).add(v).divideScalar(3);const T=f(C);g(k,E+0,b,T),g(M,E+2,w,T),g(S,E+4,v,T)}}function g(b,w,v,C){C<0&&b.x===1&&(i[w]=b.x-1),v.x===0&&v.z===0&&(i[w]=C/2/Math.PI+.5)}function f(b){return Math.atan2(b.z,-b.x)}function y(b){return Math.atan2(-b.y,Math.sqrt(b.x*b.x+b.z*b.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ms(e.vertices,e.indices,e.radius,e.details)}}class Ss extends Ms{constructor(e=1,t=0){const s=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],r=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(s,r,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Ss(e.radius,e.detail)}}class ks extends be{constructor(e=1,t=32,s=16,r=0,n=Math.PI*2,i=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:s,phiStart:r,phiLength:n,thetaStart:i,thetaLength:o},t=Math.max(3,Math.floor(t)),s=Math.max(2,Math.floor(s));const l=Math.min(i+o,Math.PI);let c=0;const d=[],h=new x,p=new x,u=[],m=[],g=[],f=[];for(let y=0;y<=s;y++){const b=[],w=y/s;let v=0;y===0&&i===0?v=.5/t:y===s&&l===Math.PI&&(v=-.5/t);for(let C=0;C<=t;C++){const k=C/t;h.x=-e*Math.cos(r+k*n)*Math.sin(i+w*o),h.y=e*Math.cos(i+w*o),h.z=e*Math.sin(r+k*n)*Math.sin(i+w*o),m.push(h.x,h.y,h.z),p.copy(h).normalize(),g.push(p.x,p.y,p.z),f.push(k+v,1-w),b.push(c++)}d.push(b)}for(let y=0;y<s;y++)for(let b=0;b<t;b++){const w=d[y][b+1],v=d[y][b],C=d[y+1][b],k=d[y+1][b+1];(y!==0||i>0)&&u.push(w,v,k),(y!==s-1||l<Math.PI)&&u.push(v,C,k)}this.setIndex(u),this.setAttribute("position",new j(m,3)),this.setAttribute("normal",new j(g,3)),this.setAttribute("uv",new j(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ks(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Cs extends be{constructor(e=1,t=.4,s=12,r=48,n=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:s,tubularSegments:r,arc:n},s=Math.floor(s),r=Math.floor(r);const i=[],o=[],l=[],c=[],d=new x,h=new x,p=new x;for(let u=0;u<=s;u++)for(let m=0;m<=r;m++){const g=m/r*n,f=u/s*Math.PI*2;h.x=(e+t*Math.cos(f))*Math.cos(g),h.y=(e+t*Math.cos(f))*Math.sin(g),h.z=t*Math.sin(f),o.push(h.x,h.y,h.z),d.x=e*Math.cos(g),d.y=e*Math.sin(g),p.subVectors(h,d).normalize(),l.push(p.x,p.y,p.z),c.push(m/r),c.push(u/s)}for(let u=1;u<=s;u++)for(let m=1;m<=r;m++){const g=(r+1)*u+m-1,f=(r+1)*(u-1)+m-1,y=(r+1)*(u-1)+m,b=(r+1)*u+m;i.push(g,f,b),i.push(f,y,b)}this.setIndex(i),this.setAttribute("position",new j(o,3)),this.setAttribute("normal",new j(l,3)),this.setAttribute("uv",new j(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Cs(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class Ts extends be{constructor(e=1,t=.4,s=64,r=8,n=2,i=3){super(),this.type="TorusKnotGeometry",this.parameters={radius:e,tube:t,tubularSegments:s,radialSegments:r,p:n,q:i},s=Math.floor(s),r=Math.floor(r);const o=[],l=[],c=[],d=[],h=new x,p=new x,u=new x,m=new x,g=new x,f=new x,y=new x;for(let w=0;w<=s;++w){const v=w/s*n*Math.PI*2;b(v,n,i,e,u),b(v+.01,n,i,e,m),f.subVectors(m,u),y.addVectors(m,u),g.crossVectors(f,y),y.crossVectors(g,f),g.normalize(),y.normalize();for(let C=0;C<=r;++C){const k=C/r*Math.PI*2,M=-t*Math.cos(k),S=t*Math.sin(k);h.x=u.x+(M*y.x+S*g.x),h.y=u.y+(M*y.y+S*g.y),h.z=u.z+(M*y.z+S*g.z),l.push(h.x,h.y,h.z),p.subVectors(h,u).normalize(),c.push(p.x,p.y,p.z),d.push(w/s),d.push(C/r)}}for(let w=1;w<=s;w++)for(let v=1;v<=r;v++){const C=(r+1)*(w-1)+(v-1),k=(r+1)*w+(v-1),M=(r+1)*w+v,S=(r+1)*(w-1)+v;o.push(C,k,S),o.push(k,M,S)}this.setIndex(o),this.setAttribute("position",new j(l,3)),this.setAttribute("normal",new j(c,3)),this.setAttribute("uv",new j(d,2));function b(w,v,C,k,M){const S=Math.cos(w),z=Math.sin(w),E=C/v*w,T=Math.cos(E);M.x=k*(2+T)*.5*S,M.y=k*(2+T)*z*.5,M.z=k*Math.sin(E)*.5}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ts(e.radius,e.tube,e.tubularSegments,e.radialSegments,e.p,e.q)}}class Br extends Er{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new Fe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Fe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=rn,this.normalScale=new G(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ie,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class zs extends ee{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Fe(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}const cs=new X,cr=new x,dr=new x;class Ir{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new G(512,512),this.map=null,this.mapPass=null,this.matrix=new X,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new $n,this._frameExtents=new G(1,1),this._viewportCount=1,this._viewports=[new ae(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,s=this.matrix;cr.setFromMatrixPosition(e.matrixWorld),t.position.copy(cr),dr.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(dr),t.updateMatrixWorld(),cs.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(cs),s.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),s.multiply(cs)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const hr=new X,dt=new x,ds=new x;class _n extends Ir{constructor(){super(new Ar(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new G(4,2),this._viewportCount=6,this._viewports=[new ae(2,1,1,1),new ae(0,1,1,1),new ae(3,1,1,1),new ae(1,1,1,1),new ae(3,0,1,1),new ae(1,0,1,1)],this._cubeDirections=[new x(1,0,0),new x(-1,0,0),new x(0,0,1),new x(0,0,-1),new x(0,1,0),new x(0,-1,0)],this._cubeUps=[new x(0,1,0),new x(0,1,0),new x(0,1,0),new x(0,1,0),new x(0,0,1),new x(0,0,-1)]}updateMatrices(e,t=0){const s=this.camera,r=this.matrix,n=e.distance||s.far;n!==s.far&&(s.far=n,s.updateProjectionMatrix()),dt.setFromMatrixPosition(e.matrixWorld),s.position.copy(dt),ds.copy(s.position),ds.add(this._cubeDirections[t]),s.up.copy(this._cubeUps[t]),s.lookAt(ds),s.updateMatrixWorld(),r.makeTranslation(-dt.x,-dt.y,-dt.z),hr.multiplyMatrices(s.projectionMatrix,s.matrixWorldInverse),this._frustum.setFromProjectionMatrix(hr)}}class pr extends zs{constructor(e,t,s=0,r=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=s,this.decay=r,this.shadow=new _n}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class An extends Ir{constructor(){super(new En(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Bn extends zs{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ee.DEFAULT_UP),this.updateMatrix(),this.target=new ee,this.shadow=new An}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class In extends zs{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Sr}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Sr);const Fn={targetFps:60,maxDrawCalls:1e3,maxTriangles:2e6,maxTextureMemory:256*1024*1024,maxGeometryMemory:128*1024*1024,weights:{timing:.35,drawCalls:.2,geometry:.2,memory:.15,stateChanges:.1}};class Bt{pool=[];factory;reset;maxSize;name;_totalCreated=0;_acquireCount=0;_releaseCount=0;_discardedCount=0;constructor(e){this.factory=e.factory,this.reset=e.reset,this.maxSize=e.maxSize??100,this.name=e.name??"ObjectPool";const t=e.initialSize??0;for(let s=0;s<t;s++)this.pool.push(this.factory()),this._totalCreated++}acquire(){return this._acquireCount++,this.pool.length>0?this.pool.pop():(this._totalCreated++,this.factory())}release(e){this._releaseCount++,this.reset&&this.reset(e),this.pool.length<this.maxSize?this.pool.push(e):this._discardedCount++}releaseAll(e){for(const t of e)this.release(t)}clear(){this.pool.length=0}getStats(){const e=this._acquireCount,t=this._releaseCount-this._discardedCount,s=e>0?Math.min(t/e,1):0;return{available:this.pool.length,totalCreated:this._totalCreated,acquireCount:this._acquireCount,releaseCount:this._releaseCount,discardedCount:this._discardedCount,hitRate:s}}getName(){return this.name}get size(){return this.pool.length}}class hs{pools=new Map;maxSize;name;_acquireCount=0;_releaseCount=0;_totalCreated=0;constructor(e){this.maxSize=e?.maxSize??50,this.name=e?.name??"ArrayPool"}acquire(e=0){this._acquireCount++;const t=this.getLengthBucket(e),s=this.pools.get(t);if(s&&s.length>0){const r=s.pop();return r.length=e,r}return this._totalCreated++,new Array(e)}release(e){this._releaseCount++,e.length=0;const t=this.getLengthBucket(e.length);let s=this.pools.get(t);s||(s=[],this.pools.set(t,s)),s.length<this.maxSize&&s.push(e)}getLengthBucket(e){return e<=8?8:e<=16?16:e<=32?32:e<=64?64:e<=128?128:e<=256?256:e<=512?512:1024}clear(){this.pools.clear()}getStats(){let e=0;for(const t of this.pools.values())e+=t.length;return{available:e,totalCreated:this._totalCreated,acquireCount:this._acquireCount,releaseCount:this._releaseCount}}}function Rn(a){a.frame=0,a.timestamp=0,a.deltaTimeMs=0,a.cpuTimeMs=0,a.gpuTimeMs=void 0,a.triangles=0,a.drawCalls=0,a.points=0,a.lines=0,a.vertices=0,a.objectsVisible=0,a.objectsInFrustum=0,a.objectsCulled=0,a.lightCount=0,a.shadowMapCount=0,a.texturesInUse=0,a.textureMemoryBytes=0,a.geometriesInUse=0,a.geometryMemoryBytes=0,a.programsInUse=0,a.fps=0,a.avgFrameTime=0,a.memoryEstimateBytes=0,a.renderTargetsActive=0,a.rendererBackend="webgl",a.instancedDrawCalls=0,a.computeDispatches=0,a.pipelineSwitches=0,a.bindGroupChanges=0}function Ln(){return{frame:0,timestamp:0,deltaTimeMs:0,cpuTimeMs:0,gpuTimeMs:void 0,triangles:0,drawCalls:0,points:0,lines:0,vertices:0,objectsVisible:0,objectsInFrustum:0,objectsCulled:0,lightCount:0,shadowMapCount:0,texturesInUse:0,textureMemoryBytes:0,geometriesInUse:0,geometryMemoryBytes:0,programsInUse:0,fps:0,avgFrameTime:0,memoryEstimateBytes:0,renderTargetsActive:0,rendererBackend:"webgl",instancedDrawCalls:0,computeDispatches:0,pipelineSwitches:0,bindGroupChanges:0}}class ke{frameStats;vector3;arrays;stringArrays;numberArrays;transformData;plainObjects;static _instance=null;constructor(){this.frameStats=new Bt({factory:Ln,reset:Rn,initialSize:5,maxSize:20,name:"FrameStatsPool"}),this.vector3=new Bt({factory:()=>({x:0,y:0,z:0}),reset:e=>{e.x=0,e.y=0,e.z=0},initialSize:20,maxSize:100,name:"Vector3Pool"}),this.arrays=new hs({maxSize:50,name:"GenericArrayPool"}),this.stringArrays=new hs({maxSize:30,name:"StringArrayPool"}),this.numberArrays=new hs({maxSize:30,name:"NumberArrayPool"}),this.transformData=new Bt({factory:()=>({position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0,order:"XYZ"},scale:{x:1,y:1,z:1}}),reset:e=>{e.position.x=0,e.position.y=0,e.position.z=0,e.rotation.x=0,e.rotation.y=0,e.rotation.z=0,e.rotation.order="XYZ",e.scale.x=1,e.scale.y=1,e.scale.z=1},initialSize:10,maxSize:50,name:"TransformDataPool"}),this.plainObjects=new Bt({factory:()=>({}),reset:e=>{for(const t of Object.keys(e))delete e[t]},initialSize:10,maxSize:50,name:"PlainObjectPool"})}static getInstance(){return ke._instance||(ke._instance=new ke),ke._instance}static reset(){ke._instance&&(ke._instance.clearAll(),ke._instance=null)}getAllStats(){return{frameStats:this.frameStats.getStats(),vector3:this.vector3.getStats(),arrays:this.arrays.getStats(),stringArrays:this.stringArrays.getStats(),numberArrays:this.numberArrays.getStats(),transformData:this.transformData.getStats(),plainObjects:this.plainObjects.getStats()}}clearAll(){this.frameStats.clear(),this.vector3.clear(),this.arrays.clear(),this.stringArrays.clear(),this.numberArrays.clear(),this.transformData.clear(),this.plainObjects.clear()}logStats(){console.group("[3Lens] Pool Statistics");const e=this.getAllStats();for(const[t,s]of Object.entries(e))console.log(`${t}:`,s);console.groupEnd()}}function It(){return ke.getInstance()}function On(a,e={}){const t=[];let s=0,r=!1;const n=e.gpuTiming??!0,i=e.resourceScanInterval??2e3;let o=performance.now(),l=1/0,c=0,d=0,h=0;const p=a.render.bind(a);let u=null,m=[],g=[],f=[],y=0;const b=a.getContext(),w=n?b.getExtension("EXT_disjoint_timer_query_webgl2")||b.getExtension("EXT_disjoint_timer_query"):null;let v=null,C=0;return a.render=function(k,M){if(r){p(k,M);return}if(t.length===0){p(k,M),s++;return}const S=performance.now();let z=null;if(w&&b instanceof WebGL2RenderingContext){if(v){const L=b.getQueryParameter(v,b.QUERY_RESULT_AVAILABLE),W=b.getParameter(w.GPU_DISJOINT_EXT);L&&!W&&(C=b.getQueryParameter(v,b.QUERY_RESULT)/1e6),b.deleteQuery(v),v=null}z=b.createQuery(),z&&b.beginQuery(w.TIME_ELAPSED_EXT,z)}p(k,M),z&&w&&b instanceof WebGL2RenderingContext&&(b.endQuery(w.TIME_ELAPSED_EXT),v=z);const E=performance.now(),T=E-S,I=S-o;o=S,T<l&&(l=T),T>c&&(c=T),d+=T,h++;const A=a.info,O=performance.now();if(O-y>i){y=O;const L=Dn(k);m=L.textures,g=L.geometries,f=L.materials,u=ur(k)}u||(u=ur(k));const U=h>0?d/h:T,$=U>0?Math.round(1e3/U):60,F=A.render.calls>0?Math.round(A.render.triangles/A.render.calls):0,_=(u?.visibleObjects??0)>0?Math.round(A.render.triangles/(u?.visibleObjects??1)):0,B={geometries:A.memory.geometries,textures:A.memory.textures,geometryMemory:u?.estimatedGeometryMemory??0,textureMemory:u?.estimatedTextureMemory??0,totalGpuMemory:(u?.estimatedGeometryMemory??0)+(u?.estimatedTextureMemory??0),renderTargets:0,renderTargetMemory:0,programs:A.programs?.length??0,jsHeapSize:performance.memory?.usedJSHeapSize,jsHeapLimit:performance.memory?.jsHeapSizeLimit},P={shadowMapUpdates:0,shadowCastingLights:u?.shadowCastingLights??0,totalLights:u?.lights??0,activeLights:u?.lights??0,skinnedMeshes:u?.skinnedMeshes??0,totalBones:u?.totalBones??0,instancedDrawCalls:u?.instancedMeshes??0,totalInstances:u?.totalInstances??0,transparentObjects:u?.transparentObjects??0,transparentDrawCalls:0,renderTargetSwitches:0,programSwitches:0,textureBinds:0,bufferUploads:0,bytesUploaded:0,postProcessingPasses:0,xrActive:a.xr?.isPresenting??!1,viewports:a.xr?.isPresenting?2:1},R={frame:s++,timestamp:E,deltaTimeMs:I,cpuTimeMs:T,gpuTimeMs:C>0?C:void 0,triangles:A.render.triangles,drawCalls:A.render.calls,points:A.render.points,lines:A.render.lines,vertices:u?.totalVertices??0,objectsVisible:u?.visibleObjects??0,objectsTotal:u?.totalObjects??0,objectsCulled:0,materialsUsed:A.programs?.length??0,memory:B,performance:{fps:$,fpsSmoothed:$,fpsMin:l>0?Math.round(1e3/c):$,fpsMax:c>0?Math.round(1e3/l):$,fps1PercentLow:$,frameBudgetUsed:T/16.67*100,targetFrameTimeMs:16.67,frameTimeVariance:0,trianglesPerDrawCall:F,trianglesPerObject:_,drawCallEfficiency:Math.min(100,F/100),isSmooth:T<16.67,droppedFrames:0},rendering:P,backend:"webgl"};A.render.calls=0,A.render.triangles=0,A.render.points=0,A.render.lines=0;for(const L of t)L(R)},{kind:"webgl",observeFrame(k){return t.push(k),()=>{const M=t.indexOf(k);M>-1&&t.splice(M,1)}},getRenderTargets(){return[]},getTextures(){return m},getGeometries(){return g},getMaterials(){return f},getPrograms(){return(a.info.programs??[]).map(M=>({id:M.id?.toString()??"unknown",vertexShader:"",fragmentShader:"",uniforms:{},attributes:[],usedByMaterials:[]}))},async getGpuTimings(){return{totalMs:C}},dispose(){r=!0,a.render=p,t.length=0,u=null,l=1/0,c=0,d=0,h=0}}}function ur(a){let e=0,t=0,s=0,r=0,n=0,i=0,o=0,l=0,c=0,d=0,h=0,p=0,u=0;const m=new Set,g=new Set;return a.traverse(f=>{e++,f.visible&&t++;const y=f;y.isLight&&(l++,y.castShadow&&c++);const b=f;if(b.isMesh&&b.geometry){const w=b.geometry,v=w.attributes?.position;v&&(s+=v.count,w.index?r+=w.index.count/3:r+=v.count/3),m.has(w.uuid)||(m.add(w.uuid),p+=Fr(w));const C=b;C.isSkinnedMesh&&C.skeleton&&(n++,i+=C.skeleton.bones.length);const k=b;k.isInstancedMesh&&(d++,h+=k.count);const M=b.material;if(Array.isArray(M)){M.some(S=>S.transparent)&&o++;for(const S of M)u+=ps(S,g)}else M?.transparent?(o++,u+=ps(M,g)):M&&(u+=ps(M,g))}}),{totalObjects:e,visibleObjects:t,totalVertices:s,totalTriangles:Math.round(r),skinnedMeshes:n,totalBones:i,transparentObjects:o,lights:l,shadowCastingLights:c,instancedMeshes:d,totalInstances:h,estimatedGeometryMemory:p,estimatedTextureMemory:u}}function Fr(a){let e=0;for(const t in a.attributes){const s=a.attributes[t];s?.array&&(e+=s.array.byteLength)}return a.index?.array&&(e+=a.index.array.byteLength),e}function ps(a,e){let t=0;const s=a,r=["map","normalMap","roughnessMap","metalnessMap","aoMap","emissiveMap","alphaMap","envMap","lightMap","bumpMap","displacementMap","specularMap","gradientMap"];for(const n of r){const i=s[n];i?.uuid&&!e.has(i.uuid)&&(e.add(i.uuid),t+=Rr(i))}return t}function Rr(a){const e=a.image;if(!e)return 0;let t=0,s=0;if(e instanceof HTMLImageElement||e instanceof HTMLCanvasElement?(t=e.width||0,s=e.height||0):(e instanceof ImageBitmap||typeof e=="object"&&"width"in e&&"height"in e)&&(t=e.width,s=e.height),t===0||s===0)return 0;let r=4;const n=a.format;n===1028?r=1:n===1030&&(r=2);let i=t*s*r;return a.generateMipmaps&&(i=Math.round(i*1.33)),i}function Dn(a){const e=new Map,t=new Map,s=new Map;return a.traverse(r=>{const n=r;if(!n.isMesh)return;if(n.geometry){const o=n.geometry;if(!t.has(o.uuid)){const c=o.attributes?.position?.count??0,d=o.index?.count,h=d?d/3:c/3;t.set(o.uuid,{ref:o.uuid,type:o.type||"BufferGeometry",name:o.name||void 0,vertexCount:c,indexCount:d??void 0,faceCount:Math.round(h),estimatedMemoryBytes:Fr(o)})}}const i=Array.isArray(n.material)?n.material:[n.material];for(const o of i){if(!o)continue;if(!s.has(o.uuid)){const c=o;s.set(o.uuid,{ref:o.uuid,type:o.type||"Material",name:o.name||void 0,color:c.color?.getHex?.(),opacity:o.opacity??1,transparent:o.transparent??!1,visible:o.visible??!0})}const l=["map","normalMap","roughnessMap","metalnessMap","aoMap","emissiveMap","alphaMap","envMap","lightMap","bumpMap","displacementMap","specularMap","gradientMap"];for(const c of l){const d=o[c];if(d&&!e.has(d.uuid)){const h=d.image;let p=0,u=0;h instanceof HTMLImageElement||h instanceof HTMLCanvasElement?(p=h.width||0,u=h.height||0):(h instanceof ImageBitmap||typeof h=="object"&&h&&"width"in h&&"height"in h)&&(p=h.width,u=h.height);const g=e.get(d.uuid)?.usedByMaterials??[];g.includes(o.uuid)||g.push(o.uuid),e.set(d.uuid,{ref:d.uuid,type:d.type??"Texture",name:d.name||c,width:p,height:u,format:d.format??0,estimatedMemoryBytes:Rr(d),usedByMaterials:g})}}}}),{textures:Array.from(e.values()),geometries:Array.from(t.values()),materials:Array.from(s.values())}}const Hn={maxHistorySize:120,autoReadback:!0,maxPassesPerFrame:16};class Nn{device=null;querySet=null;resolveBuffer=null;readBuffer=null;config;enabled=!1;disposed=!1;currentFrame=0;currentPassIndex=0;pendingReadback=!1;passNames=[];passTypes=[];history=[];latestTiming=null;frameBuffers=[];currentBufferIndex=0;BUFFER_COUNT=3;constructor(e={}){this.config={...Hn,...e}}async initialize(e){if(this.disposed)return!1;if(!e.features.has("timestamp-query"))return console.warn("[3Lens GPU Timing] Timestamp queries not supported on this device"),!1;this.device=e;const t=this.config.maxPassesPerFrame*2*this.BUFFER_COUNT;try{this.querySet=e.createQuerySet({type:"timestamp",count:t,label:"3Lens-Timestamp-QuerySet"});const s=t*8;this.resolveBuffer=e.createBuffer({size:s,usage:GPUBufferUsage.QUERY_RESOLVE|GPUBufferUsage.COPY_SRC,label:"3Lens-Query-Resolve"}),this.readBuffer=e.createBuffer({size:s,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ,label:"3Lens-Query-Read"});for(let r=0;r<this.BUFFER_COUNT;r++)this.frameBuffers.push({frameNumber:-1,passCount:0,passNames:[],passTypes:[],readbackPending:!1});return this.enabled=!0,!0}catch(s){return console.error("[3Lens GPU Timing] Failed to initialize:",s),!1}}isEnabled(){return this.enabled&&!this.disposed}beginFrame(e){!this.enabled||this.disposed||(this.currentFrame=e,this.currentPassIndex=0,this.passNames=[],this.passTypes=[],this.currentBufferIndex=(this.currentBufferIndex+1)%this.BUFFER_COUNT)}getPassStartQueryIndex(e,t="unknown"){if(!this.enabled||this.disposed||this.currentPassIndex>=this.config.maxPassesPerFrame)return-1;const r=this.currentBufferIndex*this.config.maxPassesPerFrame*2+this.currentPassIndex*2;return this.passNames.push(e),this.passTypes.push(t),r}getPassEndQueryIndex(){if(!this.enabled||this.disposed||this.currentPassIndex>=this.config.maxPassesPerFrame)return-1;const t=this.currentBufferIndex*this.config.maxPassesPerFrame*2+this.currentPassIndex*2+1;return this.currentPassIndex++,t}writeTimestamp(e,t){if(!this.enabled||!this.querySet||t<0)return;e.writeTimestamp(this.querySet,t)}endFrame(e){if(!this.enabled||this.disposed||!this.querySet||!this.resolveBuffer||this.currentPassIndex===0)return;const t=this.currentBufferIndex*this.config.maxPassesPerFrame*2,s=this.currentPassIndex*2,r=t*8;e.resolveQuerySet(this.querySet,t,s,this.resolveBuffer,r),this.frameBuffers[this.currentBufferIndex]={frameNumber:this.currentFrame,passCount:this.currentPassIndex,passNames:[...this.passNames],passTypes:[...this.passTypes],readbackPending:!0}}copyForReadback(e,t){if(!this.enabled||!this.resolveBuffer||!this.readBuffer)return;const s=t??this.currentBufferIndex,r=s*this.config.maxPassesPerFrame*2*8,n=this.frameBuffers[s].passCount*2*8;n>0&&e.copyBufferToBuffer(this.resolveBuffer,r,this.readBuffer,r,n)}async readResults(){if(!this.enabled||this.disposed||!this.readBuffer||this.pendingReadback)return this.latestTiming;let e=-1,t=1/0;for(let r=0;r<this.BUFFER_COUNT;r++){const n=this.frameBuffers[r];n.readbackPending&&n.frameNumber<t&&n.passCount>0&&(t=n.frameNumber,e=r)}if(e===-1)return this.latestTiming;const s=this.frameBuffers[e];this.pendingReadback=!0;try{await this.readBuffer.mapAsync(GPUMapMode.READ,e*this.config.maxPassesPerFrame*2*8,s.passCount*2*8);const r=this.readBuffer.getMappedRange(e*this.config.maxPassesPerFrame*2*8,s.passCount*2*8),n=new BigInt64Array(r),i=[];let o=BigInt(0);for(let d=0;d<s.passCount;d++){const h=n[d*2],p=n[d*2+1],u=p-h,m=Number(u)/1e6;i.push({name:s.passNames[d],startNs:h,endNs:p,durationMs:Math.max(0,m)}),o+=u>0?u:BigInt(0)}this.readBuffer.unmap(),s.readbackPending=!1;const l={};for(let d=0;d<i.length;d++){const h=s.passTypes[d];l[h]=(l[h]??0)+i[d].durationMs}for(const d of i)l[d.name]=d.durationMs;const c={totalMs:Number(o)/1e6,passes:i,breakdown:l,frameNumber:s.frameNumber,timestamp:performance.now()};return this.history.push(c),this.history.length>this.config.maxHistorySize&&this.history.shift(),this.latestTiming=c,this.pendingReadback=!1,c}catch(r){return console.warn("[3Lens GPU Timing] Readback failed:",r),this.pendingReadback=!1,s.readbackPending=!1,this.latestTiming}}getLatestTiming(){return this.latestTiming}getHistory(){return[...this.history]}getAverageTiming(e=60){if(this.history.length===0)return null;const t=this.history.slice(-e),s=new Map;let r=0;for(const l of t){r+=l.totalMs;for(const c of l.passes){const d=s.get(c.name)??{totalMs:0,count:0};d.totalMs+=c.durationMs,d.count++,s.set(c.name,d)}}const n=r/t.length,i={},o=[];for(const[l,c]of s){const d=c.totalMs/c.count;i[l]=d,o.push({name:l,startNs:BigInt(0),endNs:BigInt(0),durationMs:d})}return{totalMs:n,passes:o,breakdown:i,frameNumber:this.currentFrame,timestamp:performance.now()}}clearHistory(){this.history=[],this.latestTiming=null}getQuerySet(){return this.querySet}dispose(){this.disposed||(this.disposed=!0,this.enabled=!1,this.querySet?.destroy(),this.resolveBuffer?.destroy(),this.readBuffer?.destroy(),this.querySet=null,this.resolveBuffer=null,this.readBuffer=null,this.device=null,this.history=[],this.latestTiming=null,this.frameBuffers=[])}}function Lr(a){return a!==null&&typeof a=="object"&&"isWebGPURenderer"in a&&a.isWebGPURenderer===!0}function jn(a){const e=[];let t=0,s=!1;performance.now();let r=1/0,n=0;const i=a.render.bind(a),o=a.renderAsync?.bind(a);let l=null,c=[],d=[],h=[],p=[],u=0;const m=2e3,g=0;let f=!1,y=null;const b=null,w=a.backend,v=w?.device;v?.features.has("timestamp-query")?(f=!0,y=new Nn({maxHistorySize:120,maxPassesPerFrame:16}),y.initialize(v).then($=>{$&&console.log("[3Lens WebGPU] GPU timing initialized with timestamp queries")}).catch(()=>{})):w?.hasTimestampQuery&&(f=!0);function C($,F,_){const B=performance.now(),P=a.info;_<r&&(r=_),_>n&&(n=_),l||(l=k($)),B-u>m&&(u=B,M($),S());const R=A(P),L=O($,P,l),W=b,le=W?.totalMs??void 0,ge=_>0?1e3/_:60,Es=n>0?1e3/n:ge,Wr=r>0&&r<1/0?1e3/r:ge,qr=t>0?_:0,Ps=l?.lights?.length??0,Ht=Ps;return{frame:t,timestamp:B,deltaTimeMs:qr,cpuTimeMs:_,gpuTimeMs:le,drawCalls:P.render.calls,triangles:P.render.triangles,points:P.render.points,lines:P.render.lines,vertices:0,objectsVisible:Ps,objectsTotal:Ht,objectsCulled:0,materialsUsed:0,memory:R,rendering:L,performance:{fps:ge,fpsSmoothed:ge,fpsMin:Es,fpsMax:Wr,fps1PercentLow:Es,frameBudgetUsed:_/16.67*100,targetFrameTimeMs:16.67,frameTimeVariance:0,trianglesPerDrawCall:P.render.calls>0?P.render.triangles/P.render.calls:0,trianglesPerObject:Ht>0?P.render.triangles/Ht:0,drawCallEfficiency:100,isSmooth:_<16.67,droppedFrames:0},backend:"webgpu",webgpuExtras:{pipelinesUsed:p.length,bindGroupsUsed:0,buffersUsed:0,computePasses:0,renderPasses:1,gpuTiming:W?{totalMs:W.totalMs,passes:W.passes.map(_s=>({name:_s.name,durationMs:_s.durationMs})),breakdown:W.breakdown}:void 0}}}a.render=function($,F){if(s){i($,F);return}if(e.length===0){i($,F),t++;return}const _=performance.now();a.info.autoReset===!1&&(a.info.render.calls=0,a.info.render.triangles=0,a.info.render.points=0,a.info.render.lines=0),i($,F);const B=performance.now()-_;t++,performance.now();const P=C($,F,B);for(const R of e)try{R(P)}catch(L){console.warn("[3Lens WebGPU] Frame callback error:",L)}},o&&(a.renderAsync=async function($,F){if(s){await o($,F);return}if(e.length===0){await o($,F),t++;return}const _=performance.now();a.info.autoReset===!1&&(a.info.render.calls=0,a.info.render.triangles=0,a.info.render.points=0,a.info.render.lines=0),await o($,F);const B=performance.now()-_;t++,performance.now();const P=C($,F,B);for(const R of e)try{R(P)}catch(L){console.warn("[3Lens WebGPU] Frame callback error:",L)}});function k($){const F=[];let _=0,B=0;return $.traverse(P=>{if("isLight"in P&&P.isLight){const R=P,L={type:P.type,castShadow:R.castShadow??!1};"color"in R&&R.color&&(L.color={r:R.color.r,g:R.color.g,b:R.color.b}),"intensity"in R&&(L.intensity=R.intensity),F.push(L),R.castShadow&&_++}"animations"in P&&Array.isArray(P.animations)&&(B+=P.animations.length)}),{lights:F,shadowLights:_,animations:B}}function M($){const F=new Map,_=new Map,B=new Map;$.traverse(P=>{if("geometry"in P&&P.geometry){const R=P.geometry;_.has(R.uuid)||_.set(R.uuid,z(R))}if("material"in P&&P.material){const R=Array.isArray(P.material)?P.material:[P.material];for(const L of R)L&&!B.has(L.uuid)&&(B.set(L.uuid,E(L)),T(L,F))}}),c=Array.from(F.values()),d=Array.from(_.values()),h=Array.from(B.values())}function S(){const $=[],F=a.backend?.pipelines;if(F){let _=0;for(const[B]of F)$.push({id:`pipeline-${_++}`,type:"render",usedByMaterials:[]})}p=$}function z($){const F=$.attributes.position,_=$.index,B=F?.count??0,P=_?.count??0,R=Math.floor(_?P/3:B/3);let L=0;for(const W in $.attributes){const le=$.attributes[W];le.array&&(L+=le.array.byteLength)}return _?.array&&(L+=_.array.byteLength),{ref:$.uuid,type:$.type,name:$.name||void 0,vertexCount:B,indexCount:P||void 0,faceCount:R,estimatedMemoryBytes:L}}function E($){return{ref:$.uuid,type:$.type,name:$.name||void 0,color:"color"in $&&$.color?$.color.getHex():void 0,opacity:$.opacity,transparent:$.transparent,visible:$.visible}}function T($,F){const _=["map","normalMap","roughnessMap","metalnessMap","aoMap","emissiveMap","displacementMap","alphaMap","envMap","lightMap","bumpMap","specularMap","gradientMap"];for(const B of _){const P=$[B];P&&!F.has(P.uuid)&&F.set(P.uuid,I(P,$.uuid))}}function I($,F){const _=$.image?.width??0,B=$.image?.height??0,P=4,R=$.generateMipmaps?Math.floor(Math.log2(Math.max(_,B)))+1:1;let L=0,W=_,le=B;for(let ge=0;ge<R;ge++)L+=W*le*P,W=Math.max(1,Math.floor(W/2)),le=Math.max(1,Math.floor(le/2));return{ref:$.uuid,type:$.type?.toString()??"Texture",name:$.name||void 0,width:_,height:B,format:$.format,estimatedMemoryBytes:L,usedByMaterials:[F]}}function A($){const F=c.reduce((B,P)=>B+P.estimatedMemoryBytes,0),_=d.reduce((B,P)=>B+P.estimatedMemoryBytes,0);return{geometries:$.memory.geometries,textures:$.memory.textures,geometryMemory:_,textureMemory:F,totalGpuMemory:F+_,renderTargets:0,renderTargetMemory:0,programs:p.length,jsHeapSize:performance.memory?.usedJSHeapSize}}function O($,F,_){return{shadowMapUpdates:0,shadowCastingLights:_.shadowLights,totalLights:_.lights.length,activeLights:_.lights.length,skinnedMeshes:0,totalBones:0,instancedDrawCalls:0,totalInstances:0,transparentObjects:0,transparentDrawCalls:0,renderTargetSwitches:0,programSwitches:F.render.calls,textureBinds:0,bufferUploads:0,bytesUploaded:0,postProcessingPasses:0,xrActive:!1,viewports:1}}return{kind:"webgpu",observeFrame($){return e.push($),()=>{const F=e.indexOf($);F!==-1&&e.splice(F,1)}},getRenderTargets(){return[]},getTextures(){return c},getGeometries(){return d},getMaterials(){return h},getPipelines(){return p},async getGpuTimings(){return{totalMs:g,breakdown:f?{render:g}:void 0}},dispose(){s=!0,e.length=0,l=null,c=[],d=[],h=[],p=[],a.render=i,o&&(a.renderAsync=o)}}}function Gn(a){const e=a.backend,t=e?.device;if(e?.adapter,!t)return null;const s=t.limits;return{deviceLabel:t.label??"Unknown",features:Array.from(t.features),maxTextureDimension2D:s.maxTextureDimension2D,maxTextureArrayLayers:s.maxTextureArrayLayers,maxBindGroups:s.maxBindGroups,maxBindingsPerBindGroup:s.maxBindingsPerBindGroup,maxDynamicUniformBuffersPerPipelineLayout:s.maxDynamicUniformBuffersPerPipelineLayout,maxDynamicStorageBuffersPerPipelineLayout:s.maxDynamicStorageBuffersPerPipelineLayout,maxSampledTexturesPerShaderStage:s.maxSampledTexturesPerShaderStage,maxSamplersPerShaderStage:s.maxSamplersPerShaderStage,maxStorageBuffersPerShaderStage:s.maxStorageBuffersPerShaderStage,maxStorageTexturesPerShaderStage:s.maxStorageTexturesPerShaderStage,maxUniformBuffersPerShaderStage:s.maxUniformBuffersPerShaderStage,maxUniformBufferBindingSize:s.maxUniformBufferBindingSize,maxStorageBufferBindingSize:s.maxStorageBufferBindingSize,maxVertexBuffers:s.maxVertexBuffers,maxVertexAttributes:s.maxVertexAttributes,maxVertexBufferArrayStride:s.maxVertexBufferArrayStride,maxComputeWorkgroupStorageSize:s.maxComputeWorkgroupStorageSize,maxComputeInvocationsPerWorkgroup:s.maxComputeInvocationsPerWorkgroup,maxComputeWorkgroupSizeX:s.maxComputeWorkgroupSizeX,maxComputeWorkgroupSizeY:s.maxComputeWorkgroupSizeY,maxComputeWorkgroupSizeZ:s.maxComputeWorkgroupSizeZ,maxComputeWorkgroupsPerDimension:s.maxComputeWorkgroupsPerDimension,hasTimestampQuery:t.features.has("timestamp-query")}}class Un{cache=new Map;maxSize;ttl;name;_hits=0;_misses=0;_evictions=0;_expirations=0;constructor(e={}){this.maxSize=e.maxSize??100,this.ttl=e.ttl??1/0,this.name=e.name??"LRUCache"}get(e){const t=this.cache.get(e);if(!t){this._misses++;return}if(this.isExpired(t)){this.cache.delete(e),this._expirations++,this._misses++;return}return t.lastAccessed=Date.now(),this.cache.delete(e),this.cache.set(e,t),this._hits++,t.value}set(e,t){if(this.cache.has(e)&&this.cache.delete(e),this.cache.size>=this.maxSize){const r=this.cache.keys().next().value;r!==void 0&&(this.cache.delete(r),this._evictions++)}const s=Date.now();this.cache.set(e,{value:t,timestamp:s,lastAccessed:s})}has(e){const t=this.cache.get(e);return t?this.isExpired(t)?(this.cache.delete(e),this._expirations++,!1):!0:!1}peek(e){const t=this.cache.get(e);return t?this.isExpired(t)?(this.cache.delete(e),this._expirations++,{exists:!1,value:void 0}):{exists:!0,value:t.value}:{exists:!1,value:void 0}}delete(e){return this.cache.delete(e)}clear(){this.cache.clear()}get size(){return this.cache.size}getStats(){const e=this._hits+this._misses;return{hits:this._hits,misses:this._misses,size:this.cache.size,maxSize:this.maxSize,hitRate:e>0?this._hits/e*100:0,evictions:this._evictions,expirations:this._expirations}}resetStats(){this._hits=0,this._misses=0,this._evictions=0,this._expirations=0}trackMiss(){this._misses++}prune(){let e=0;for(const[t,s]of this.cache)this.isExpired(s)&&(this.cache.delete(t),this._expirations++,e++);return e}isExpired(e){return this.ttl===1/0?!1:Date.now()-e.timestamp>this.ttl}}function Or(...a){if(a.length===0)return"__empty__";if(a.length===1){const e=a[0];if(e===null)return"__null__";if(e===void 0)return"__undefined__";if(typeof e=="object"){if("uuid"in e&&typeof e.uuid=="string")return e.uuid;if("id"in e&&typeof e.id=="number")return`id:${e.id}`;try{return JSON.stringify(e)}catch{return String(e)}}return String(e)}return a.map(e=>Or(e)).join("::")}function me(a,e={}){const{maxSize:t=100,ttl:s=1/0,keyResolver:r=Or,name:n=a.name||"memoized"}=e,i=new Un({maxSize:t,ttl:s,name:n}),o=function(...l){const c=r(...l),d=i.peek(c);if(d.exists)return i.get(c),d.value;i.trackMiss();const h=a.apply(this,l);return i.set(c,h),h};return o.clear=()=>i.clear(),o.getStats=()=>i.getStats(),o.has=(...l)=>i.has(r(...l)),o.set=(l,c)=>{i.set(r(...l),c)},o.delete=(...l)=>i.delete(r(...l)),Object.defineProperty(o,"name",{value:n,writable:!1}),o}me(a=>a.join("."),{maxSize:500,name:"propertyPathFormatter"});me((a,e=2)=>!Number.isFinite(a)||Number.isInteger(a)?String(a):a.toFixed(e),{maxSize:1e3,name:"numberFormatter",keyResolver:(a,e)=>`${a}:${e}`});me(a=>{if(a===0)return"0 B";const e=["B","KB","MB","GB"],t=Math.floor(Math.log(a)/Math.log(1024));return`${(a/Math.pow(1024,t)).toFixed(t===0?0:1)} ${e[t]}`},{maxSize:200,name:"bytesFormatter"});me(a=>a===null?"null":a===void 0?"undefined":a.constructor?.name||"Unknown",{maxSize:100,name:"typeNameGetter"});me(a=>a.uuid?a.uuid:a.id!==void 0?`id:${a.id}`:`ref:${Math.random().toString(36).substr(2,9)}`,{maxSize:500,name:"objectIdGetter"});class Dr{events=[];activeResources=new Map;eventIdCounter=0;alertIdCounter=0;callbacks=[];alertCallbacks=[];alerts=[];options;sessionStartTime;memoryHistory=[];lastMemoryCheck=0;constructor(e={}){this.options={captureStackTraces:e.captureStackTraces??!1,maxEvents:e.maxEvents??1e3,leakThresholdMs:e.leakThresholdMs??6e4,orphanCheckIntervalMs:e.orphanCheckIntervalMs??1e4,memoryGrowthThresholdBytes:e.memoryGrowthThresholdBytes??50*1024*1024},this.sessionStartTime=performance.now()}setStackTraceCapture(e){this.options.captureStackTraces=e}isStackTraceCaptureEnabled(){return this.options.captureStackTraces}onEvent(e){return this.callbacks.push(e),()=>{const t=this.callbacks.indexOf(e);t!==-1&&this.callbacks.splice(t,1)}}recordCreation(e,t,s){const r=this.createEvent(e,t,"created",{resourceName:s?.name,resourceSubtype:s?.subtype,metadata:{estimatedMemory:s?.estimatedMemory,vertexCount:s?.vertexCount,faceCount:s?.faceCount}});this.activeResources.set(t,{type:e,createdAt:r.timestamp,name:s?.name,subtype:s?.subtype,estimatedMemory:s?.estimatedMemory,attachedMeshes:new Set}),this.addEvent(r),this.updateMemoryHistory()}recordDisposal(e,t){const s=this.createEvent(e,t,"disposed");this.activeResources.delete(t),this.addEvent(s),this.updateMemoryHistory()}recordAttachment(e,t,s,r){const n=this.createEvent(e,t,"attached",{metadata:{meshUuid:s,meshName:r?.meshName,textureSlot:r?.textureSlot}}),i=this.activeResources.get(t);i&&(i.attachedMeshes.add(s),i.lastAttachmentTime=n.timestamp,i.detachedAt=void 0),this.addEvent(n)}recordDetachment(e,t,s,r){const n=this.createEvent(e,t,"detached",{metadata:{meshUuid:s,meshName:r?.meshName,textureSlot:r?.textureSlot}}),i=this.activeResources.get(t);i&&(i.attachedMeshes.delete(s),i.attachedMeshes.size===0&&(i.detachedAt=n.timestamp)),this.addEvent(n)}getEvents(){return[...this.events]}getEventsByType(e){return this.events.filter(t=>t.resourceType===e)}getEventsByEventType(e){return this.events.filter(t=>t.eventType===e)}getEventsInRange(e,t){return this.events.filter(s=>s.timestamp>=e&&s.timestamp<=t)}getSummary(){const e=performance.now(),t=e-this.options.leakThresholdMs,s={geometries:{created:0,disposed:0,active:0,leaked:0},materials:{created:0,disposed:0,active:0,leaked:0},textures:{created:0,disposed:0,active:0,leaked:0},totalEvents:this.events.length},r=i=>{switch(i){case"geometry":return"geometries";case"material":return"materials";case"texture":return"textures"}};for(const i of this.events){const o=s[r(i.resourceType)];i.eventType==="created"?o.created++:i.eventType==="disposed"&&o.disposed++}let n;for(const[i,o]of this.activeResources){const l=s[r(o.type)];l.active++;const c=e-o.createdAt;o.createdAt<t&&l.leaked++,(!n||c>n.ageMs)&&(n={type:o.type,uuid:i,name:o.name,ageMs:c})}return s.oldestActiveResource=n,s}getPotentialLeaks(){const e=performance.now(),t=e-this.options.leakThresholdMs,s=[];for(const[r,n]of this.activeResources)n.createdAt<t&&s.push({type:n.type,uuid:r,name:n.name,subtype:n.subtype,ageMs:e-n.createdAt});return s.sort((r,n)=>n.ageMs-r.ageMs),s}onAlert(e){return this.alertCallbacks.push(e),()=>{const t=this.alertCallbacks.indexOf(e);t!==-1&&this.alertCallbacks.splice(t,1)}}getAlerts(){return[...this.alerts]}clearAlerts(){this.alerts=[]}runLeakDetection(){const e=[],t=performance.now();e.push(...this.detectOrphanedResources(t)),e.push(...this.detectUndisposedResources(t)),e.push(...this.detectDetachedNotDisposed(t)),e.push(...this.detectResourceAccumulation()),e.push(...this.detectMemoryGrowth());for(const s of e){this.alerts.push(s);for(const r of this.alertCallbacks)try{r(s)}catch(n){console.error("[3Lens] Error in leak alert callback:",n)}}return this.alerts.length>100&&(this.alerts=this.alerts.slice(-100)),e}detectOrphanedResources(e){const t=[];for(const[r,n]of this.activeResources)if(n.attachedMeshes.size===0&&!n.lastAttachmentTime&&e-n.createdAt>5e3){if(this.alerts.some(i=>i.resourceUuid===r&&i.type==="orphaned_resource"))continue;t.push({id:`alert_${++this.alertIdCounter}`,type:"orphaned_resource",severity:"warning",resourceType:n.type,resourceUuid:r,resourceName:n.name,message:`Orphaned ${n.type}: ${n.name||n.subtype||r.substring(0,8)}`,details:`Created ${((e-n.createdAt)/1e3).toFixed(1)}s ago but never attached to any mesh`,timestamp:e,suggestion:`Ensure this ${n.type} is attached to a mesh or dispose it if unused`})}return t}detectUndisposedResources(e){const t=[];for(const[s,r]of this.activeResources){const n=e-r.createdAt;if(n>this.options.leakThresholdMs){if(this.alerts.some(o=>o.resourceUuid===s&&o.type==="undisposed_resource"))continue;const i=n>this.options.leakThresholdMs*3?"critical":"warning";t.push({id:`alert_${++this.alertIdCounter}`,type:"undisposed_resource",severity:i,resourceType:r.type,resourceUuid:s,resourceName:r.name,message:`Long-lived ${r.type}: ${r.name||r.subtype||s.substring(0,8)}`,details:`Active for ${(n/1e3).toFixed(1)}s (threshold: ${(this.options.leakThresholdMs/1e3).toFixed(0)}s)`,timestamp:e,suggestion:`Check if this ${r.type} should be disposed. If it's intentionally persistent, you can ignore this alert.`})}}return t}detectDetachedNotDisposed(e){const t=[];for(const[r,n]of this.activeResources)if(n.detachedAt&&e-n.detachedAt>1e4){if(this.alerts.some(i=>i.resourceUuid===r&&i.type==="detached_not_disposed"))continue;t.push({id:`alert_${++this.alertIdCounter}`,type:"detached_not_disposed",severity:"warning",resourceType:n.type,resourceUuid:r,resourceName:n.name,message:`Detached but not disposed: ${n.name||n.subtype||r.substring(0,8)}`,details:`Detached ${((e-n.detachedAt)/1e3).toFixed(1)}s ago but never disposed`,timestamp:e,suggestion:`Call .dispose() on this ${n.type} to free GPU memory`})}return t}detectResourceAccumulation(){const e=[],t={geometry:100,material:200,texture:100},s={geometry:0,material:0,texture:0};for(const r of this.activeResources.values())s[r.type]++;for(const[r,n]of Object.entries(s)){const i=t[r];if(n>i){if(this.alerts.find(c=>c.type==="resource_accumulation"&&c.resourceType===r&&performance.now()-c.timestamp<3e4))continue;const l=n>i*2?"critical":"warning";e.push({id:`alert_${++this.alertIdCounter}`,type:"resource_accumulation",severity:l,resourceType:r,message:`High ${r} count: ${n}`,details:`${n} active ${r}s exceeds threshold of ${i}`,timestamp:performance.now(),suggestion:`Review your ${r} management. Consider reusing ${r}s or disposing unused ones.`})}}return e}detectMemoryGrowth(){const e=[];if(this.memoryHistory.length<10)return e;const t=this.memoryHistory.slice(-10),s=t[0],r=t[t.length-1],n=r.estimatedBytes-s.estimatedBytes,i=r.timestamp-s.timestamp;let o=!0;for(let l=1;l<t.length;l++)if(t[l].estimatedBytes<t[l-1].estimatedBytes){o=!1;break}if(o&&n>this.options.memoryGrowthThresholdBytes&&!this.alerts.find(c=>c.type==="memory_growth"&&performance.now()-c.timestamp<6e4)){const c=n/i*1e3;e.push({id:`alert_${++this.alertIdCounter}`,type:"memory_growth",severity:"critical",message:`Memory growing: +${this.formatBytes(n)}`,details:`Memory increased by ${this.formatBytes(n)} over ${(i/1e3).toFixed(1)}s (${this.formatBytes(c)}/s)`,timestamp:performance.now(),suggestion:"Review resource creation patterns. Ensure resources are being disposed when no longer needed."})}return e}updateMemoryHistory(){const e=performance.now();if(e-this.lastMemoryCheck<1e3)return;this.lastMemoryCheck=e;let t=0;for(const s of this.activeResources.values())t+=s.estimatedMemory||0;this.memoryHistory.push({timestamp:e,estimatedBytes:t}),this.memoryHistory.length>60&&(this.memoryHistory=this.memoryHistory.slice(-60))}getEstimatedMemory(){let e=0;for(const t of this.activeResources.values())e+=t.estimatedMemory||0;return e}getMemoryHistory(){return[...this.memoryHistory]}getOrphanedResources(){const e=performance.now(),t=[];for(const[s,r]of this.activeResources)r.attachedMeshes.size===0&&t.push({type:r.type,uuid:s,name:r.name,subtype:r.subtype,ageMs:e-r.createdAt});return t.sort((s,r)=>r.ageMs-s.ageMs)}generateLeakReport(){const e=performance.now();this.runLeakDetection();const t={geometries:{created:0,disposed:0,orphaned:0,leaked:0},materials:{created:0,disposed:0,orphaned:0,leaked:0},textures:{created:0,disposed:0,orphaned:0,leaked:0}},s={geometry:"geometries",material:"materials",texture:"textures"};for(const o of this.events){const l=s[o.resourceType];o.eventType==="created"&&t[l].created++,o.eventType==="disposed"&&t[l].disposed++}for(const o of this.activeResources.values()){const l=s[o.type];o.attachedMeshes.size===0&&t[l].orphaned++,e-o.createdAt>this.options.leakThresholdMs&&t[l].leaked++}let r=0;for(const o of this.activeResources.values())e-o.createdAt>this.options.leakThresholdMs&&(r+=o.estimatedMemory||0);const n=[];if(t.geometries.orphaned>0&&n.push(`Dispose ${t.geometries.orphaned} orphaned geometries to free memory`),t.materials.orphaned>0&&n.push(`Dispose ${t.materials.orphaned} orphaned materials`),t.textures.orphaned>0&&n.push(`Dispose ${t.textures.orphaned} orphaned textures`),this.alerts.filter(o=>o.severity==="critical").length>0&&n.push("Address critical alerts immediately to prevent memory issues"),this.memoryHistory.length>1){const o=this.memoryHistory[0].estimatedBytes;this.memoryHistory[this.memoryHistory.length-1].estimatedBytes>o*1.5&&n.push("Memory usage has increased significantly. Review resource lifecycle.")}return{generatedAt:e,sessionDurationMs:e-this.sessionStartTime,summary:{totalAlerts:this.alerts.length,criticalAlerts:this.alerts.filter(o=>o.severity==="critical").length,warningAlerts:this.alerts.filter(o=>o.severity==="warning").length,infoAlerts:this.alerts.filter(o=>o.severity==="info").length,estimatedLeakedMemoryBytes:r},alerts:this.alerts,resourceStats:t,memoryHistory:this.memoryHistory,recommendations:n}}formatBytes(e){return e<1024?`${e}B`:e<1024*1024?`${(e/1024).toFixed(1)}KB`:`${(e/(1024*1024)).toFixed(1)}MB`}clear(){this.events=[],this.activeResources.clear(),this.eventIdCounter=0,this.alerts=[],this.alertIdCounter=0,this.memoryHistory=[]}createEvent(e,t,s,r){const n={id:`evt_${++this.eventIdCounter}`,resourceType:e,resourceUuid:t,eventType:s,timestamp:performance.now()};if(r?.resourceName&&(n.resourceName=r.resourceName),r?.resourceSubtype&&(n.resourceSubtype=r.resourceSubtype),r?.metadata&&(n.metadata=r.metadata),this.options.captureStackTraces)try{const i=new Error().stack;if(i){const o=i.split(`
`).slice(3);n.stackTrace=o.join(`
`)}}catch{}return n}addEvent(e){this.events.push(e),this.events.length>this.options.maxEvents&&(this.events=this.events.slice(-this.options.maxEvents));for(const t of this.callbacks)try{t(e)}catch(s){console.error("[3Lens] Error in lifecycle event callback:",s)}}}const Vn={6406:"Alpha",6407:"RGB",6408:"RGBA",6409:"Luminance",6410:"LuminanceAlpha",6402:"Depth",34041:"DepthStencil",6403:"Red",33319:"RG",33320:"RedInteger",33321:"RGInteger",36244:"RGBInteger",36249:"RGBAInteger",33776:"RGB_S3TC_DXT1",33777:"RGBA_S3TC_DXT1",33778:"RGBA_S3TC_DXT3",33779:"RGBA_S3TC_DXT5"},Wn={5121:"UnsignedByte",5120:"Byte",5122:"Short",5123:"UnsignedShort",5124:"Int",5125:"UnsignedInt",5126:"Float",36193:"HalfFloat",33635:"UnsignedShort_4_4_4_4",32819:"UnsignedShort_5_5_5_1",32820:"UnsignedShort_5_6_5"},qn={10497:"Repeat",33071:"ClampToEdge",33648:"MirroredRepeat"},Yn={9728:"Nearest",9729:"Linear",9984:"NearestMipmapNearest",9985:"LinearMipmapNearest",9986:"NearestMipmapLinear",9987:"LinearMipmapLinear"},Xn={35044:"StaticDraw",35048:"DynamicDraw",35040:"StreamDraw",35045:"StaticRead",35049:"DynamicRead",35041:"StreamRead",35046:"StaticCopy",35050:"DynamicCopy",35042:"StreamCopy"},Zn={33776:"DXT1 (RGB)",33777:"DXT1 (RGBA)",33778:"DXT3",33779:"DXT5",35916:"ETC1",36196:"PVRTC_4bpp_RGB",35840:"PVRTC_4bpp_RGBA",35841:"PVRTC_2bpp_RGB",35842:"PVRTC_2bpp_RGBA",37492:"ASTC_4x4",37496:"ASTC_5x5",37808:"BPTC"},Jn=me(a=>Vn[a]||`Format(${a})`,{maxSize:50,name:"formatNameLookup"}),Kn=me(a=>Wn[a]||`Type(${a})`,{maxSize:30,name:"dataTypeNameLookup"}),Qn=me(a=>qn[a]||`Wrap(${a})`,{maxSize:10,name:"wrapNameLookup"}),ei=me(a=>Yn[a]||`Filter(${a})`,{maxSize:10,name:"filterNameLookup"}),ti=me(a=>Xn[a]||`Usage(${a})`,{maxSize:15,name:"usageNameLookup"}),si=me(a=>Zn[a]||`Compressed(${a})`,{maxSize:20,name:"compressionFormatLookup"});class ri{scene;options;objectRefs=new Map;debugIdToObject=new Map;materialsByUuid=new Map;geometriesByUuid=new Map;texturesByUuid=new Map;originalAdd;originalRemove;lifecycleTracker;trackedResourceUuids=new Set;constructor(e,t={}){this.scene=e,this.options=t,this.lifecycleTracker=new Dr,t.onResourceEvent&&this.lifecycleTracker.onEvent(t.onResourceEvent),this.originalAdd=e.add.bind(e),this.originalRemove=e.remove.bind(e),this.patchSceneMethods(),this.traverseScene()}getLifecycleTracker(){return this.lifecycleTracker}getObjectRef(e){return this.objectRefs.get(e)??null}findObjectByDebugId(e){return this.debugIdToObject.get(e)??null}createSceneNode(e){const s={ref:this.getOrCreateRef(e),transform:this.getTransformData(e),visible:e.visible,frustumCulled:e.frustumCulled,layers:e.layers.mask,renderOrder:e.renderOrder,children:[]};this.isMesh(e)?s.meshData=this.getMeshData(e):this.isLight(e)?s.lightData=this.getLightData(e):this.isCamera(e)&&(s.cameraData=this.getCameraData(e));for(const r of e.children)s.children.push(this.createSceneNode(r));return s}findMaterialByUuid(e){return this.materialsByUuid.get(e)??null}findGeometryByUuid(e){return this.geometriesByUuid.get(e)??null}collectMaterials(){const e=new Map;this.materialsByUuid.clear(),this.scene.traverse(o=>{if(this.isMesh(o)){const l=Array.isArray(o.material)?o.material:[o.material],c=this.getOrCreateRef(o);for(const d of l){if(!d)continue;this.materialsByUuid.set(d.uuid,d);const h=e.get(d.uuid);h?h.meshDebugIds.push(c.debugId):e.set(d.uuid,{material:d,meshDebugIds:[c.debugId]})}}});const t=[],s={};let r=0,n=0;for(const[,{material:o,meshDebugIds:l}]of e){const c=this.createMaterialData(o,l);t.push(c),s[c.type]=(s[c.type]||0)+1,c.isShaderMaterial&&r++,c.transparent&&n++}t.sort((o,l)=>o.type!==l.type?o.type.localeCompare(l.type):(o.name||"").localeCompare(l.name||""));const i={totalCount:t.length,byType:s,shaderMaterialCount:r,transparentCount:n};return{materials:t,summary:i}}collectGeometries(){const e=new Map;this.geometriesByUuid.clear(),this.scene.traverse(d=>{if(this.isMesh(d)){const h=d.geometry;if(!h)return;const p=this.getOrCreateRef(d);this.geometriesByUuid.set(h.uuid,h);const u=e.get(h.uuid);u?u.meshDebugIds.push(p.debugId):e.set(h.uuid,{geometry:h,meshDebugIds:[p.debugId]})}});const t=[],s={};let r=0,n=0,i=0,o=0,l=0;for(const[,{geometry:d,meshDebugIds:h}]of e){const p=this.createGeometryData(d,h);t.push(p),s[p.type]=(s[p.type]||0)+1,r+=p.vertexCount,n+=p.faceCount,i+=p.memoryBytes,p.isIndexed&&o++,p.morphAttributes&&p.morphAttributes.length>0&&l++}t.sort((d,h)=>d.memoryBytes!==h.memoryBytes?h.memoryBytes-d.memoryBytes:(d.name||"").localeCompare(h.name||""));const c={totalCount:t.length,totalVertices:r,totalTriangles:n,totalMemoryBytes:i,byType:s,indexedCount:o,morphedCount:l};return{geometries:t,summary:c}}collectTextures(){const e=new Map;this.texturesByUuid.clear();const{materials:t}=this.collectMaterials();for(const h of t){const p=this.materialsByUuid.get(h.uuid);if(!p)continue;const u=this.getTextureSlots();for(const m of u)if(m in p){const g=p[m];if(g&&g.uuid){this.texturesByUuid.set(g.uuid,g);const f=e.get(g.uuid),y={materialUuid:h.uuid,materialName:h.name||`<${h.type}>`,slot:m};f?f.usages.push(y):e.set(g.uuid,{texture:g,usages:[y]})}}if(h.shader?.uniforms){for(const m of h.shader.uniforms)if((m.type==="sampler2D"||m.type==="samplerCube")&&m.value?.uuid){const f=this.findTextureInMaterial(p,m.name);if(f){this.texturesByUuid.set(f.uuid,f);const y=e.get(f.uuid),b={materialUuid:h.uuid,materialName:h.name||`<${h.type}>`,slot:m.name};y?y.usages.push(b):e.set(f.uuid,{texture:f,usages:[b]})}}}}const s=[],r={};let n=0,i=0,o=0,l=0,c=0;for(const[,{texture:h,usages:p}]of e){const u=this.createTextureData(h,p);s.push(u),r[u.type]=(r[u.type]||0)+1,n+=u.memoryBytes,u.isCubeTexture&&i++,u.isCompressed&&o++,u.isVideoTexture&&l++,u.isRenderTarget&&c++}s.sort((h,p)=>h.memoryBytes!==p.memoryBytes?p.memoryBytes-h.memoryBytes:(h.name||"").localeCompare(p.name||""));const d={totalCount:s.length,totalMemoryBytes:n,byType:r,cubeTextureCount:i,compressedCount:o,videoTextureCount:l,renderTargetCount:c};return{textures:s,summary:d}}collectRenderTargets(){const e=new Map,t=h=>h.uuid||h.texture?.uuid||"";this.scene.traverse(h=>{if(this.isLight(h)&&h.castShadow&&"shadow"in h){const p=h.shadow;if(p?.map){const u=p.map,m=t(u);m&&!e.has(m)&&(u._3lensUsage="shadow-map",e.set(m,u))}}if(this.isMesh(h)){const p=Array.isArray(h.material)?h.material:[h.material];for(const u of p)if(u&&"envMap"in u&&u.envMap){const m=u.envMap;"isRenderTargetTexture"in m&&m.isRenderTargetTexture}}});const s=[];let r=0,n=0,i=0,o=0,l=0,c=0;for(const[,h]of e){const p=this.createRenderTargetData(h);s.push(p),r+=p.memoryBytes,p.usage==="shadow-map"&&n++,p.usage==="post-process"&&i++,p.isCubeTarget&&o++,p.colorAttachmentCount>1&&l++,p.samples>0&&c++}s.sort((h,p)=>p.memoryBytes-h.memoryBytes);const d={totalCount:s.length,totalMemoryBytes:r,shadowMapCount:n,postProcessCount:i,cubeTargetCount:o,mrtCount:l,msaaCount:c};return{renderTargets:s,summary:d}}createRenderTargetDataPublic(e,t="custom"){return e._3lensUsage=t,this.createRenderTargetData(e)}createRenderTargetData(e){const t=e.texture,s="isWebGLCubeRenderTarget"in e,n="isWebGLMultipleRenderTargets"in e&&e.count||1,i=e._3lensUsage||"unknown",o=this.getBytesPerPixel(t.format,t.type);let l=e.width*e.height*o*n;e.depthBuffer&&(l+=e.width*e.height*4),e.stencilBuffer&&(l+=e.width*e.height*1),e.samples>0&&(l*=e.samples),s&&(l*=6);const h={uuid:e.uuid||t.uuid,name:t.name||"",type:e.constructor.name||"WebGLRenderTarget",dimensions:{width:e.width,height:e.height},scissorTest:e.scissorTest,depthBuffer:e.depthBuffer,stencilBuffer:e.stencilBuffer,isCubeTarget:s,samples:e.samples||0,colorAttachmentCount:n,textureFormat:t.format,textureFormatName:this.getFormatName(t.format),textureType:t.type,textureTypeName:this.getDataTypeName(t.type),hasDepthTexture:e.depthTexture!==null&&e.depthTexture!==void 0,colorSpace:t.colorSpace||"srgb",filtering:{mag:t.magFilter,min:t.minFilter,magName:this.getFilterName(t.magFilter),minName:this.getFilterName(t.minFilter)},wrap:{s:t.wrapS,t:t.wrapT,sName:this.getWrapName(t.wrapS),tName:this.getWrapName(t.wrapT)},generateMipmaps:t.generateMipmaps,memoryBytes:l,thumbnail:void 0,usage:i,renderCount:0};return e.depthTexture&&(h.depthTextureFormat=e.depthTexture.format,h.depthTextureFormatName=this.getFormatName(e.depthTexture.format)),e.viewport&&(h.viewport={x:e.viewport.x,y:e.viewport.y,width:e.viewport.width,height:e.viewport.height}),e.scissorTest&&e.scissor&&(h.scissor={x:e.scissor.x,y:e.scissor.y,width:e.scissor.width,height:e.scissor.height}),h}getTextureSlots(){return["map","normalMap","roughnessMap","metalnessMap","aoMap","emissiveMap","bumpMap","displacementMap","alphaMap","envMap","lightMap","specularMap","gradientMap","clearcoatMap","clearcoatNormalMap","clearcoatRoughnessMap","sheenColorMap","sheenRoughnessMap","transmissionMap","thicknessMap","iridescenceMap","iridescenceThicknessMap","anisotropyMap","specularIntensityMap","specularColorMap"]}findTextureInMaterial(e,t){if("uniforms"in e){const r=e.uniforms?.[t];if(r?.value?.isTexture)return r.value}return null}findTextureByUuid(e){return this.texturesByUuid.get(e)??null}createTextureData(e,t){const s="isCubeTexture"in e&&e.isCubeTexture===!0,r="isDataTexture"in e&&e.isDataTexture===!0,n="isCompressedTexture"in e,i="isVideoTexture"in e,o="isCanvasTexture"in e,l="isRenderTargetTexture"in e,c=e.image;let d=0,h=0;c&&(s&&Array.isArray(c)&&c.length>0?(d=c[0]?.width||c[0]?.naturalWidth||0,h=c[0]?.height||c[0]?.naturalHeight||0):(d=c.width||c.naturalWidth||c.videoWidth||0,h=c.height||c.naturalHeight||c.videoHeight||0));const p=this.estimateTextureMemory(e,d,h,s),u=this.getTextureSourceInfo(e);let m;!s&&!i&&c&&d>0&&h>0&&(m=this.generateTextureThumbnail(e,d,h));const g={uuid:e.uuid,name:e.name||"",type:e.constructor.name||"Texture",source:u,dimensions:{width:d,height:h},format:e.format,formatName:this.getFormatName(e.format),dataType:e.type,dataTypeName:this.getDataTypeName(e.type),mipmaps:{enabled:e.generateMipmaps||e.mipmaps&&e.mipmaps.length>0,count:e.mipmaps?.length||0,generateMipmaps:e.generateMipmaps},wrap:{s:e.wrapS,t:e.wrapT,sName:this.getWrapName(e.wrapS),tName:this.getWrapName(e.wrapT)},filtering:{mag:e.magFilter,min:e.minFilter,magName:this.getFilterName(e.magFilter),minName:this.getFilterName(e.minFilter)},anisotropy:e.anisotropy,colorSpace:e.colorSpace||"srgb",flipY:e.flipY,premultiplyAlpha:e.premultiplyAlpha,memoryBytes:p,isCompressed:n,isRenderTarget:l,isCubeTexture:s,isDataTexture:r,isVideoTexture:i,isCanvasTexture:o,thumbnail:m,usedByMaterials:t,usageCount:t.length};return"encoding"in e&&(g.encoding=e.encoding),n&&e.mipmaps&&e.mipmaps.length>0&&(g.compressionFormat=this.getCompressionFormat(e.format)),g}getTextureSourceInfo(e){const t=e.image;let s="unknown",r,n=!1,i=!1;if("isCompressedTexture"in e?(s="compressed",n=e.mipmaps&&e.mipmaps.length>0,i=n):"isDataTexture"in e?(s="data",n=!!t,i=n):"isVideoTexture"in e?(s="video",t instanceof HTMLVideoElement&&(r=t.src||t.currentSrc,n=t.readyState>=2,i=!t.paused)):"isCanvasTexture"in e?(s="canvas",n=!!t,i=n):t&&(t instanceof HTMLImageElement?(s="image",r=t.src,n=t.complete,i=t.complete&&t.naturalWidth>0):t instanceof HTMLCanvasElement?(s="canvas",n=!0,i=!0):t instanceof ImageBitmap?(s="image",n=!0,i=!0):typeof t=="object"&&"data"in t&&(s="data",n=!0,i=!0)),!r&&"source"in e&&e.source){const o=e.source;o.data?.src&&(r=o.data.src)}return{type:s,url:r,isLoaded:n,isReady:i}}estimateTextureMemory(e,t,s,r){if(t===0||s===0)return 0;const n=this.getBytesPerPixel(e.format,e.type);let i=t*s*n;return r&&(i*=6),(e.generateMipmaps||e.mipmaps&&e.mipmaps.length>0)&&(i=Math.floor(i*1.33)),i}getBytesPerPixel(e,t){let y=4;switch(e){case 6406:case 6409:case 6403:case 6402:y=1;break;case 6410:case 33319:case 34041:y=2;break;case 6407:y=3;break;case 6408:default:y=4;break}let b=1;switch(t){case 5121:b=1;break;case 5123:case 36193:b=2;break;case 5125:case 5126:b=4;break;default:b=1}return y*b}generateTextureThumbnail(e,t,s){try{const r=e.image;if(!r||t>4096||s>4096)return;const n=64,i=Math.min(n/t,n/s,1),o=Math.floor(t*i),l=Math.floor(s*i),c=document.createElement("canvas");c.width=o,c.height=l;const d=c.getContext("2d");return d?r instanceof HTMLImageElement||r instanceof HTMLCanvasElement||r instanceof ImageBitmap?(d.drawImage(r,0,0,o,l),c.toDataURL("image/png")):(r.data&&r.width&&r.height,void 0):void 0}catch{return}}getFormatName(e){return Jn(e)}getDataTypeName(e){return Kn(e)}getWrapName(e){return Qn(e)}getFilterName(e){return ei(e)}getCompressionFormat(e){return si(e)}createGeometryData(e,t){const s=this.collectGeometryAttributes(e),r=s.reduce((u,m)=>u+m.memoryBytes,0);let n=0,i=0;e.index&&(i=e.index.count,n=this.calculateBufferMemory(e.index));const o=e.attributes.position,l=o?o.count:0;let c=0;e.index?c=e.index.count/3:o&&(c=o.count/3);const d=[];if(e.morphAttributes)for(const[u,m]of Object.entries(e.morphAttributes))Array.isArray(m)&&m.length>0&&d.push({name:u,count:m.length});const h=e.groups.map(u=>({start:u.start,count:u.count,materialIndex:u.materialIndex??0})),p={uuid:e.uuid,name:e.name||"",type:e.type||"BufferGeometry",vertexCount:l,indexCount:i,faceCount:c,isIndexed:e.index!==null,attributes:s,memoryBytes:r+n,drawRange:{start:e.drawRange.start,count:e.drawRange.count},groups:h,usageCount:t.length,usedByMeshes:t};return e.boundingBox&&(p.boundingBox={min:{x:e.boundingBox.min.x,y:e.boundingBox.min.y,z:e.boundingBox.min.z},max:{x:e.boundingBox.max.x,y:e.boundingBox.max.y,z:e.boundingBox.max.z}}),e.boundingSphere&&(p.boundingSphere={center:{x:e.boundingSphere.center.x,y:e.boundingSphere.center.y,z:e.boundingSphere.center.z},radius:e.boundingSphere.radius}),d.length>0&&(p.morphAttributes=d),p}collectGeometryAttributes(e){const t=[];for(const[r,n]of Object.entries(e.attributes))n&&t.push(this.createAttributeData(r,n));const s=["position","normal","uv","uv2","color","tangent"];return t.sort((r,n)=>{const i=s.indexOf(r.name),o=s.indexOf(n.name);return i!==-1&&o!==-1?i-o:i!==-1?-1:o!==-1?1:r.name.localeCompare(n.name)}),t}createAttributeData(e,t){const s="isInstancedBufferAttribute"in t,r=this.calculateBufferMemory(t),n={name:e,count:t.count,itemSize:t.itemSize,normalized:t.normalized,arrayType:t.array.constructor.name,memoryBytes:r,isInstancedAttribute:s};return"usage"in t&&(n.usage=this.getUsageName(t.usage)),s&&"meshPerAttribute"in t&&(n.meshPerAttribute=t.meshPerAttribute),n}calculateBufferMemory(e){const t=e.array.BYTES_PER_ELEMENT||4;return e.count*e.itemSize*t}getUsageName(e){return ti(e)}createMaterialData(e,t){const s=this.isShaderMaterial(e),r={uuid:e.uuid,name:e.name||"",type:e.type||e.constructor.name,isShaderMaterial:s,opacity:e.opacity,transparent:e.transparent,visible:e.visible,side:e.side,depthTest:e.depthTest,depthWrite:e.depthWrite,wireframe:"wireframe"in e?e.wireframe:!1,textures:this.collectMaterialTextures(e),usageCount:t.length,usedByMeshes:t};return"color"in e&&e.color&&(r.color=e.color.getHex()),"emissive"in e&&e.emissive&&(r.emissive=e.emissive.getHex()),this.isPBRMaterial(e)&&(r.pbr=this.extractPBRProperties(e)),s&&(r.shader=this.extractShaderInfo(e)),r}collectMaterialTextures(e){const t=[],s=["map","normalMap","roughnessMap","metalnessMap","aoMap","emissiveMap","bumpMap","displacementMap","alphaMap","envMap","lightMap","specularMap","gradientMap","clearcoatMap","clearcoatNormalMap","clearcoatRoughnessMap","sheenColorMap","sheenRoughnessMap","transmissionMap","thicknessMap"];for(const r of s)if(r in e){const n=e[r];n&&t.push({slot:r,uuid:n.uuid,name:n.name||void 0})}return t}isShaderMaterial(e){return"isShaderMaterial"in e||"isRawShaderMaterial"in e}isPBRMaterial(e){return"isMeshStandardMaterial"in e||"isMeshPhysicalMaterial"in e}extractPBRProperties(e){const t={roughness:e.roughness,metalness:e.metalness};if("isMeshPhysicalMaterial"in e){const s=e;t.reflectivity=s.reflectivity,t.clearcoat=s.clearcoat,t.clearcoatRoughness=s.clearcoatRoughness,t.sheen=s.sheen,t.sheenRoughness=s.sheenRoughness,t.transmission=s.transmission,t.thickness=s.thickness,t.ior=s.ior}return t}extractShaderInfo(e){const t=[];if(e.uniforms)for(const[s,r]of Object.entries(e.uniforms))t.push(this.serializeUniform(s,r));return{vertexShader:e.vertexShader||"",fragmentShader:e.fragmentShader||"",uniforms:t,defines:e.defines||{}}}serializeUniform(e,t){const s=t.value;let r="unknown",n=null;return s==null?(r="float",n=null):typeof s=="number"?(r="float",n=s):typeof s=="boolean"?(r="int",n=s?1:0):s.isVector2?(r="vec2",n={x:s.x,y:s.y}):s.isVector3?(r="vec3",n={x:s.x,y:s.y,z:s.z}):s.isVector4?(r="vec4",n={x:s.x,y:s.y,z:s.z,w:s.w}):s.isColor?(r="vec3",n={r:s.r,g:s.g,b:s.b}):s.isMatrix3?(r="mat3",n=Array.from(s.elements)):s.isMatrix4?(r="mat4",n=Array.from(s.elements)):s.isTexture?(r="sampler2D",n={uuid:s.uuid,name:s.name}):s.isCubeTexture?(r="samplerCube",n={uuid:s.uuid,name:s.name}):Array.isArray(s)?s.length>0&&typeof s[0]=="number"?(r="float",n=s):(r="struct",n=`Array[${s.length}]`):typeof s=="object"&&(r="struct",n=Object.keys(s).join(", ")),{name:e,type:r,value:n}}dispose(){this.scene.add=this.originalAdd,this.scene.remove=this.originalRemove,this.objectRefs.clear(),this.debugIdToObject.clear()}patchSceneMethods(){const e=this.originalAdd,t=this.originalRemove,s=this.trackObject.bind(this),r=this.untrackObject.bind(this),n=this.options.onSceneChange;this.scene.add=function(...i){const o=e.apply(this,i);for(const l of i)s(l);return n?.(),o},this.scene.remove=function(...i){const o=t.apply(this,i);for(const l of i)r(l);return n?.(),o}}traverseScene(){this.scene.traverse(e=>{this.trackObject(e)})}trackObject(e){if(this.objectRefs.has(e))return;const t=this.createRef(e);this.objectRefs.set(e,t),this.debugIdToObject.set(t.debugId,e),this.isMesh(e)&&this.trackMeshResources(e);for(const s of e.children)this.trackObject(s)}untrackObject(e){const t=this.objectRefs.get(e);t&&(this.debugIdToObject.delete(t.debugId),this.objectRefs.delete(e)),this.isMesh(e)&&this.untrackMeshResources(e);for(const s of e.children)this.untrackObject(s)}trackMeshResources(e){const t=this.getOrCreateRef(e);if(e.geometry){const r=e.geometry;if(!this.trackedResourceUuids.has(r.uuid)){this.trackedResourceUuids.add(r.uuid);const i=r.attributes?.position?.count??0,o=r.index?r.index.count/3:i/3;this.lifecycleTracker.recordCreation("geometry",r.uuid,{name:r.name||void 0,subtype:r.type||"BufferGeometry",estimatedMemory:this.estimateGeometryMemory(r),vertexCount:i,faceCount:Math.round(o)})}this.lifecycleTracker.recordAttachment("geometry",r.uuid,e.uuid,{meshName:t.name})}const s=Array.isArray(e.material)?e.material:[e.material];for(const r of s)r&&(this.trackedResourceUuids.has(r.uuid)||(this.trackedResourceUuids.add(r.uuid),this.lifecycleTracker.recordCreation("material",r.uuid,{name:r.name||void 0,subtype:r.type||"Material"})),this.lifecycleTracker.recordAttachment("material",r.uuid,e.uuid,{meshName:t.name}),this.trackMaterialTextures(r,e.uuid,t.name))}trackMaterialTextures(e,t,s){const r=["map","normalMap","roughnessMap","metalnessMap","aoMap","emissiveMap","alphaMap","envMap","lightMap","bumpMap","displacementMap","specularMap","gradientMap"];for(const n of r){const i=e[n];i&&(this.trackedResourceUuids.has(i.uuid)||(this.trackedResourceUuids.add(i.uuid),this.lifecycleTracker.recordCreation("texture",i.uuid,{name:i.name||void 0,subtype:i.constructor.name||"Texture",estimatedMemory:this.estimateTextureMemorySimple(i)})),this.lifecycleTracker.recordAttachment("texture",i.uuid,t,{meshName:s,textureSlot:n}))}}untrackMeshResources(e){const s=this.objectRefs.get(e)?.name;e.geometry&&this.lifecycleTracker.recordDetachment("geometry",e.geometry.uuid,e.uuid,{meshName:s});const r=Array.isArray(e.material)?e.material:[e.material];for(const n of r){if(!n)continue;this.lifecycleTracker.recordDetachment("material",n.uuid,e.uuid,{meshName:s});const i=["map","normalMap","roughnessMap","metalnessMap","aoMap","emissiveMap","alphaMap","envMap","lightMap","bumpMap","displacementMap","specularMap","gradientMap"];for(const o of i){const l=n[o];l&&this.lifecycleTracker.recordDetachment("texture",l.uuid,e.uuid,{meshName:s,textureSlot:o})}}}estimateGeometryMemory(e){let t=0;for(const s in e.attributes){const r=e.attributes[s];r.array&&(t+=r.array.byteLength)}return e.index?.array&&(t+=e.index.array.byteLength),t}estimateTextureMemorySimple(e){const t=e.image;if(!t)return 0;const s=t.width||t.videoWidth||256,r=t.height||t.videoHeight||256,n=4,i=e.generateMipmaps?1.33:1;return Math.round(s*r*n*i)}createRef(e){return{debugId:this.generateDebugId(),threeUuid:e.uuid,type:e.type||e.constructor.name,name:e.name||void 0,path:this.computePath(e)}}getOrCreateRef(e){let t=this.objectRefs.get(e);return t||(t=this.createRef(e),this.objectRefs.set(e,t),this.debugIdToObject.set(t.debugId,e)),t}computePath(e){const t=[];let s=e;for(;s;)t.unshift(s.name||`<${s.type}>`),s=s.parent;return"/"+t.join("/")}getTransformData(e){return{position:this.toVector3Data(e.position),rotation:this.toEulerData(e.rotation),scale:this.toVector3Data(e.scale),worldMatrix:{elements:Array.from(e.matrixWorld.elements)}}}toVector3Data(e){return{x:e.x,y:e.y,z:e.z}}toEulerData(e){return{x:e.x,y:e.y,z:e.z,order:e.order}}isMesh(e){return"isMesh"in e&&e.isMesh===!0}isLight(e){return"isLight"in e&&e.isLight===!0}isCamera(e){return"isCamera"in e&&e.isCamera===!0}getMeshData(e){const t=e.geometry,s=Array.isArray(e.material)?e.material:[e.material];let r=0,n=0;if(t){const o=t.attributes?.position;o&&(r=o.count),t.index?n=t.index.count/3:o&&(n=o.count/3)}const i=this.computeObjectCost(e,s,n);return{geometryRef:t?.uuid??"",materialRefs:s.map(o=>o?.uuid??""),vertexCount:r,faceCount:n,castShadow:e.castShadow,receiveShadow:e.receiveShadow,costData:i}}computeObjectCost(e,t,s){const r=t.map(h=>this.analyzeMaterialComplexity(h)),n=s/1e3,i=r.length>0?r.reduce((h,p)=>h+p.complexityScore,0)/r.length:1,o=r.reduce((h,p)=>h+p.textureCount*2,0);let l=0;e.castShadow&&(l+=2),e.receiveShadow&&(l+=1);const c=n*1+i*.5+o*.3+l*.2;let d;return c<2?d="low":c<10?d="medium":c<50?d="high":d="critical",{triangleCost:n,materialComplexity:i,textureCost:o,shadowCost:l,totalCost:c,costLevel:d,materials:r}}analyzeMaterialComplexity(e){if(!e)return{type:"unknown",textureCount:0,hasNormalMap:!1,hasEnvMap:!1,hasDisplacementMap:!1,hasAoMap:!1,transparent:!1,alphaTest:!1,doubleSided:!1,complexityScore:1};const t=e;let s=0,r=!1,n=!1,i=!1,o=!1;"map"in t&&t.map&&s++,"normalMap"in t&&t.normalMap&&(s++,r=!0),"envMap"in t&&t.envMap&&(s++,n=!0),"displacementMap"in t&&t.displacementMap&&(s++,i=!0),"aoMap"in t&&t.aoMap&&(s++,o=!0),"roughnessMap"in t&&t.roughnessMap&&s++,"metalnessMap"in t&&t.metalnessMap&&s++,"emissiveMap"in t&&t.emissiveMap&&s++,"bumpMap"in t&&t.bumpMap&&s++,"alphaMap"in t&&t.alphaMap&&s++,"lightMap"in t&&t.lightMap&&s++;let l=1;const c=e.type;return c==="MeshBasicMaterial"?l+=0:c==="MeshLambertMaterial"?l+=1:c==="MeshPhongMaterial"?l+=2:c==="MeshStandardMaterial"?l+=3:c==="MeshPhysicalMaterial"?l+=4:(c==="ShaderMaterial"||c==="RawShaderMaterial")&&(l+=5),l+=s*.5,r&&(l+=.5),n&&(l+=1),i&&(l+=1.5),e.transparent&&(l+=.5),e.side===2&&(l+=.3),l=Math.min(10,Math.max(1,l)),{type:c,textureCount:s,hasNormalMap:r,hasEnvMap:n,hasDisplacementMap:i,hasAoMap:o,transparent:e.transparent,alphaTest:e.alphaTest>0,doubleSided:e.side===2,complexityScore:l}}getLightData(e){const s={lightType:this.getLightType(e),color:"color"in e?e.color.getHex():16777215,intensity:e.intensity,castShadow:e.castShadow};return"distance"in e&&(s.distance=e.distance),"decay"in e&&(s.decay=e.decay),"angle"in e&&(s.angle=e.angle),"penumbra"in e&&(s.penumbra=e.penumbra),s}getLightType(e){return"isAmbientLight"in e?"ambient":"isDirectionalLight"in e?"directional":"isPointLight"in e?"point":"isSpotLight"in e?"spot":"isHemisphereLight"in e?"hemisphere":"isRectAreaLight"in e?"rect":"point"}getCameraData(e){if("isPerspectiveCamera"in e){const s=e;return{cameraType:"perspective",near:s.near,far:s.far,fov:s.fov,aspect:s.aspect}}else{const s=e;return{cameraType:"orthographic",near:s.near,far:s.far,left:s.left,right:s.right,top:s.top,bottom:s.bottom}}}generateDebugId(){return"obj_"+Math.random().toString(36).substring(2,11)}}class ni{boxHelper=null;hoverBoxHelper=null;currentObject=null;hoveredObject=null;scene=null;hoverScene=null;THREE=null;highlightColor=2282478;hoverColor=6333946;initialize(e){this.THREE=e}setHighlightColor(e){this.highlightColor=e,this.boxHelper&&this.boxHelper.material.color.setHex(e)}highlight(e){if(this.clearHighlight(),!e||!this.THREE){this.currentObject=null;return}this.currentObject=e;let t=e.parent;for(;t;){if(t.type==="Scene"){this.scene=t;break}t=t.parent}if(e.type==="Scene"){this.scene=e;return}if(!this.scene)return;this.boxHelper=new this.THREE.BoxHelper(e,this.highlightColor),this.boxHelper.name="__3lens_selection_helper__";const s=this.boxHelper.material;s.linewidth=2,s.depthTest=!0,s.transparent=!0,s.opacity=1,this.scene.add(this.boxHelper)}update(){this.boxHelper&&this.currentObject&&this.boxHelper.update(),this.hoverBoxHelper&&this.hoveredObject&&this.hoverBoxHelper.update()}clearHighlight(){this.boxHelper&&this.scene&&(this.scene.remove(this.boxHelper),this.boxHelper.geometry.dispose(),this.boxHelper.material.dispose(),this.boxHelper=null),this.currentObject=null,this.scene=null}highlightHover(e){if(this.clearHoverHighlight(),!e||!this.THREE){this.hoveredObject=null;return}if(e===this.currentObject)return;this.hoveredObject=e;let t=e.parent;for(;t;){if(t.type==="Scene"){this.hoverScene=t;break}t=t.parent}if(e.type==="Scene"){this.hoverScene=e;return}if(!this.hoverScene)return;this.hoverBoxHelper=new this.THREE.BoxHelper(e,this.hoverColor),this.hoverBoxHelper.name="__3lens_hover_helper__";const s=this.hoverBoxHelper.material;s.linewidth=1,s.depthTest=!0,s.transparent=!0,s.opacity=.7,this.hoverScene.add(this.hoverBoxHelper)}clearHoverHighlight(){this.hoverBoxHelper&&this.hoverScene&&(this.hoverScene.remove(this.hoverBoxHelper),this.hoverBoxHelper.geometry.dispose(),this.hoverBoxHelper.material.dispose(),this.hoverBoxHelper=null),this.hoveredObject=null,this.hoverScene=null}getHighlightedObject(){return this.currentObject}getHoveredObject(){return this.hoveredObject}dispose(){this.clearHighlight(),this.clearHoverHighlight(),this.THREE=null}}class ii{constructor(e){this.probe=e}inspecting=!1;raycaster=null;pointer=null;canvas=null;camera=null;pickableObjects=[];initialize(e,t,s){this.canvas=e,this.camera=t,this.raycaster=new s.Raycaster,this.pointer=new s.Vector2,this.setupEventListeners()}setEnabled(e){if(e&&(!this.canvas||!this.camera||!this.raycaster)){console.warn("[3Lens] InspectMode: Cannot enable - not initialized. Call initialize() first.");return}this.inspecting=e,this.canvas&&(this.canvas.style.cursor=e?"crosshair":"default"),e||this.probe.setHoveredObject(null)}isEnabled(){return this.inspecting}setCamera(e){this.camera=e}setPickableObjects(e){this.pickableObjects=e}setupEventListeners(){this.canvas&&(this.canvas.addEventListener("pointerdown",this.handlePointerDown),this.canvas.addEventListener("pointermove",this.handlePointerMove),this.canvas.addEventListener("pointerleave",this.handlePointerLeave))}handlePointerDown=e=>{if(!this.inspecting||!this.canvas||!this.camera||!this.raycaster||!this.pointer)return;const t=this.getIntersection(e);t?this.probe.selectObject(t.object):this.probe.selectObject(null),e.preventDefault(),e.stopPropagation()};handlePointerMove=e=>{if(!this.inspecting||!this.canvas||!this.camera||!this.raycaster||!this.pointer)return;const s=this.getIntersection(e)?.object??null;this.probe.setHoveredObject(s)};handlePointerLeave=()=>{this.inspecting&&this.probe.setHoveredObject(null)};getIntersection(e){if(!this.canvas||!this.camera||!this.raycaster||!this.pointer)return null;const t=this.canvas.getBoundingClientRect();this.pointer.x=(e.clientX-t.left)/t.width*2-1,this.pointer.y=-((e.clientY-t.top)/t.height)*2+1,this.raycaster.setFromCamera(this.pointer,this.camera);const s=this.getPickableObjects(),r=this.raycaster.intersectObjects(s,!0);return r.length>0?r[0]:null}getPickableObjects(){if(this.pickableObjects.length>0)return this.pickableObjects;const e=[],t=this.probe.getObservedScenes();for(const s of t)s.traverse(r=>{"isMesh"in r&&r.isMesh===!0&&r.name!=="__3lens_selection_helper__"&&r.name!=="__3lens_hover_helper__"&&e.push(r)});return e}dispose(){this.canvas&&(this.canvas.removeEventListener("pointerdown",this.handlePointerDown),this.canvas.removeEventListener("pointermove",this.handlePointerMove),this.canvas.removeEventListener("pointerleave",this.handlePointerLeave),this.canvas.style.cursor="default"),this.inspecting=!1,this.canvas=null,this.camera=null,this.raycaster=null,this.pointer=null,this.pickableObjects=[]}}class ai{constructor(e){this.probe=e}transformControls=null;THREE=null;scene=null;camera=null;domElement=null;currentObject=null;enabled=!1;mode="translate";space="world";snapEnabled=!1;translationSnap=1;rotationSnap=Math.PI/12;scaleSnap=.1;history=[];historyIndex=-1;maxHistorySize=50;transformStart=null;onDraggingChangedCallbacks=[];onTransformChangedCallbacks=[];initialize(e,t,s,r){this.scene=e,this.camera=t,this.domElement=s,this.THREE=r}isInitialized(){return this.scene!==null&&this.camera!==null&&this.domElement!==null&&this.THREE!==null}async enable(){if(!this.isInitialized()){console.warn("TransformGizmo: Not initialized. Call initialize() first.");return}if(this.transformControls){this.enabled=!0,this.updateAttachment();return}try{const{TransformControls:e}=await Mr(async()=>{const{TransformControls:t}=await import("./TransformControls-CkKIYJ6e.js");return{TransformControls:t}},[]);this.transformControls=new e(this.camera,this.domElement),this.transformControls.name="__3lens_transform_controls__",this.transformControls.setMode(this.mode),this.transformControls.setSpace(this.space),this.updateSnapping(),this.transformControls.addEventListener("dragging-changed",this.handleDraggingChanged),this.transformControls.addEventListener("objectChange",this.handleObjectChange),this.transformControls.addEventListener("mouseDown",this.handleMouseDown),this.transformControls.addEventListener("mouseUp",this.handleMouseUp),this.scene.add(this.transformControls),this.enabled=!0,this.updateAttachment()}catch(e){console.error("TransformGizmo: Failed to load TransformControls",e)}}disable(){this.enabled=!1,this.transformControls&&this.transformControls.detach()}isEnabled(){return this.enabled}setMode(e){this.mode=e,this.transformControls&&this.transformControls.setMode(e)}getMode(){return this.mode}setSpace(e){this.space=e,this.transformControls&&this.transformControls.setSpace(e)}getSpace(){return this.space}toggleSpace(){const e=this.space==="world"?"local":"world";return this.setSpace(e),e}setSnapEnabled(e){this.snapEnabled=e,this.updateSnapping()}isSnapEnabled(){return this.snapEnabled}setSnapValues(e,t,s){e!==void 0&&(this.translationSnap=e),t!==void 0&&(this.rotationSnap=t),s!==void 0&&(this.scaleSnap=s),this.updateSnapping()}getSnapValues(){return{translation:this.translationSnap,rotation:this.rotationSnap,scale:this.scaleSnap}}updateAttachment(){const e=this.probe.getSelectedObject();if(this.enabled&&this.transformControls&&e){if(e.name.startsWith("__3lens")||e.name.startsWith("3lens_")||e.type==="Scene"){this.transformControls.detach(),this.currentObject=null;return}this.transformControls.attach(e),this.currentObject=e}else this.transformControls&&(this.transformControls.detach(),this.currentObject=null)}onSelectionChanged(){this.updateAttachment()}updateSnapping(){this.transformControls&&(this.snapEnabled?(this.transformControls.setTranslationSnap(this.translationSnap),this.transformControls.setRotationSnap(this.rotationSnap),this.transformControls.setScaleSnap(this.scaleSnap)):(this.transformControls.setTranslationSnap(null),this.transformControls.setRotationSnap(null),this.transformControls.setScaleSnap(null)))}handleDraggingChanged=e=>{const t=!!e.value;for(const s of this.onDraggingChangedCallbacks)s(t)};handleMouseDown=()=>{this.currentObject&&(this.transformStart=this.captureTransform(this.currentObject))};handleMouseUp=()=>{if(this.currentObject&&this.transformStart){const e=this.captureTransform(this.currentObject);if(!this.transformsEqual(this.transformStart,e)){const t={objectUuid:this.currentObject.uuid,objectName:this.currentObject.name||this.currentObject.type,before:this.transformStart,after:e,timestamp:Date.now()};this.addToHistory(t);for(const s of this.onTransformChangedCallbacks)s(t)}this.transformStart=null}};handleObjectChange=()=>{};captureTransform(e){return{position:{x:e.position.x,y:e.position.y,z:e.position.z},rotation:{x:e.rotation.x,y:e.rotation.y,z:e.rotation.z},scale:{x:e.scale.x,y:e.scale.y,z:e.scale.z}}}applyTransform(e,t){e.position.set(t.position.x,t.position.y,t.position.z),e.rotation.set(t.rotation.x,t.rotation.y,t.rotation.z),e.scale.set(t.scale.x,t.scale.y,t.scale.z)}transformsEqual(e,t){return Math.abs(e.position.x-t.position.x)<1e-4&&Math.abs(e.position.y-t.position.y)<1e-4&&Math.abs(e.position.z-t.position.z)<1e-4&&Math.abs(e.rotation.x-t.rotation.x)<1e-4&&Math.abs(e.rotation.y-t.rotation.y)<1e-4&&Math.abs(e.rotation.z-t.rotation.z)<1e-4&&Math.abs(e.scale.x-t.scale.x)<1e-4&&Math.abs(e.scale.y-t.scale.y)<1e-4&&Math.abs(e.scale.z-t.scale.z)<1e-4}addToHistory(e){this.historyIndex<this.history.length-1&&(this.history=this.history.slice(0,this.historyIndex+1)),this.history.push(e),this.historyIndex=this.history.length-1,this.history.length>this.maxHistorySize&&(this.history.shift(),this.historyIndex--)}findObjectByUuid(e){for(const t of this.probe.getObservedScenes()){let s=null;if(t.traverse(r=>{r.uuid===e&&(s=r)}),s)return s}return null}undo(){if(this.historyIndex<0)return!1;const e=this.history[this.historyIndex],t=this.findObjectByUuid(e.objectUuid);return t?(this.applyTransform(t,e.before),this.historyIndex--,!0):!1}redo(){if(this.historyIndex>=this.history.length-1)return!1;this.historyIndex++;const e=this.history[this.historyIndex],t=this.findObjectByUuid(e.objectUuid);return t?(this.applyTransform(t,e.after),!0):!1}canUndo(){return this.historyIndex>=0}canRedo(){return this.historyIndex<this.history.length-1}getHistory(){return[...this.history]}clearHistory(){this.history=[],this.historyIndex=-1}onDraggingChanged(e){return this.onDraggingChangedCallbacks.push(e),()=>{const t=this.onDraggingChangedCallbacks.indexOf(e);t>=0&&this.onDraggingChangedCallbacks.splice(t,1)}}onTransformChanged(e){return this.onTransformChangedCallbacks.push(e),()=>{const t=this.onTransformChangedCallbacks.indexOf(e);t>=0&&this.onTransformChangedCallbacks.splice(t,1)}}update(){}dispose(){this.transformControls&&(this.transformControls.removeEventListener("dragging-changed",this.handleDraggingChanged),this.transformControls.removeEventListener("objectChange",this.handleObjectChange),this.transformControls.removeEventListener("mouseDown",this.handleMouseDown),this.transformControls.removeEventListener("mouseUp",this.handleMouseUp),this.transformControls.detach(),this.scene&&this.scene.remove(this.transformControls),this.transformControls.dispose(),this.transformControls=null),this.currentObject=null,this.scene=null,this.camera=null,this.domElement=null,this.THREE=null,this.enabled=!1,this.history=[],this.historyIndex=-1,this.onDraggingChangedCallbacks=[],this.onTransformChangedCallbacks=[]}}class oi{constructor(e){this.probe=e}THREE=null;camera=null;orbitTarget={x:0,y:0,z:0};animation=null;animationFrameId=null;sceneCameras=[];activeCameraIndex=0;homePosition=null;homeTarget=null;lastFocusedObjectUuid=null;lastFocusPadding=1.5;onCameraChangedCallbacks=[];onAnimationCompleteCallbacks=[];initialize(e,t,s){this.camera=e,this.THREE=t,s&&(this.orbitTarget={...s}),this.homePosition={x:e.position.x,y:e.position.y,z:e.position.z},this.homeTarget={...this.orbitTarget},this.updateSceneCameras()}setHomePosition(e,t){this.homePosition={...e},t&&(this.homeTarget={...t})}saveCurrentAsHome(){this.camera&&(this.homePosition={x:this.camera.position.x,y:this.camera.position.y,z:this.camera.position.z},this.homeTarget={...this.orbitTarget})}goHome(){!this.camera||!this.homePosition||!this.homeTarget||(this.camera.position.set(this.homePosition.x,this.homePosition.y,this.homePosition.z),this.orbitTarget={...this.homeTarget},this.camera.lookAt(this.homeTarget.x,this.homeTarget.y,this.homeTarget.z),this.lastFocusedObjectUuid=null)}flyHome(e={}){if(!this.camera||!this.homePosition||!this.homeTarget)return;const{duration:t=800,easing:s="easeInOut",onComplete:r}=e;this.lastFocusedObjectUuid=null,this.animation={startTime:performance.now(),duration:t,startPosition:{x:this.camera.position.x,y:this.camera.position.y,z:this.camera.position.z},endPosition:{...this.homePosition},startTarget:{...this.orbitTarget},endTarget:{...this.homeTarget},easing:s,onComplete:r},this.startAnimationLoop()}hasHomePosition(){return this.homePosition!==null&&this.homeTarget!==null}getHomePosition(){return!this.homePosition||!this.homeTarget?null:{position:{...this.homePosition},target:{...this.homeTarget}}}isInitialized(){return this.camera!==null&&this.THREE!==null}getCamera(){return this.camera}setCamera(e){this.camera=e,this.notifyCameraChanged()}setOrbitTarget(e){this.orbitTarget={...e}}getOrbitTarget(){return{...this.orbitTarget}}getCameraInfo(){return this.camera?this.extractCameraInfo(this.camera):null}extractCameraInfo(e){const t={uuid:e.uuid,name:e.name||e.type,type:e.type,position:{x:e.position.x,y:e.position.y,z:e.position.z},rotation:{x:e.rotation.x,y:e.rotation.y,z:e.rotation.z},near:.1,far:1e3,zoom:1};if("isPerspectiveCamera"in e&&e.isPerspectiveCamera){const s=e;t.fov=s.fov,t.aspect=s.aspect,t.near=s.near,t.far=s.far,t.zoom=s.zoom}if("isOrthographicCamera"in e&&e.isOrthographicCamera){const s=e;t.left=s.left,t.right=s.right,t.top=s.top,t.bottom=s.bottom,t.near=s.near,t.far=s.far,t.zoom=s.zoom}return t}focusOnObject(e,t=1.5){if(!this.camera||!this.THREE||this.lastFocusedObjectUuid===e.uuid&&this.lastFocusPadding===t)return;const s=this.calculateFocusPosition(e,t);s&&(this.camera.position.set(s.position.x,s.position.y,s.position.z),this.orbitTarget={...s.target},this.camera.lookAt(s.target.x,s.target.y,s.target.z),this.lastFocusedObjectUuid=e.uuid,this.lastFocusPadding=t)}focusOnSelected(e=1.5){const t=this.probe.getSelectedObject();return t?(this.focusOnObject(t,e),!0):!1}flyToObject(e,t={}){if(!this.camera||!this.THREE)return;const{duration:s=800,easing:r="easeInOut",padding:n=1.5,onComplete:i}=t;if(this.lastFocusedObjectUuid===e.uuid&&this.lastFocusPadding===n){i&&i();return}const o=this.calculateFocusPosition(e,n);o&&(this.lastFocusedObjectUuid=e.uuid,this.lastFocusPadding=n,this.animation={startTime:performance.now(),duration:s,startPosition:{x:this.camera.position.x,y:this.camera.position.y,z:this.camera.position.z},endPosition:o.position,startTarget:{...this.orbitTarget},endTarget:o.target,easing:r,onComplete:i},this.startAnimationLoop())}flyToSelected(e={}){const t=this.probe.getSelectedObject();return t?(this.flyToObject(t,e),!0):!1}calculateFocusPosition(e,t){if(!this.THREE||!this.camera)return null;const s=new this.THREE.Box3().setFromObject(e);if(s.isEmpty()){const d=new this.THREE.Vector3;return e.getWorldPosition(d),{position:{x:d.x+5,y:d.y+5,z:d.z+5},target:{x:d.x,y:d.y,z:d.z}}}const r=s.getCenter(new this.THREE.Vector3),n=s.getSize(new this.THREE.Vector3),i=Math.max(n.x,n.y,n.z);let o;if("isPerspectiveCamera"in this.camera&&this.camera.isPerspectiveCamera){const h=this.camera.fov*(Math.PI/180);o=i*t/(2*Math.tan(h/2))}else o=i*t*2;const l=new this.THREE.Vector3;l.subVectors(this.camera.position,new this.THREE.Vector3(this.orbitTarget.x,this.orbitTarget.y,this.orbitTarget.z)),l.normalize();const c=new this.THREE.Vector3;return c.copy(r),c.addScaledVector(l,o),{position:{x:c.x,y:c.y,z:c.z},target:{x:r.x,y:r.y,z:r.z}}}startAnimationLoop(){this.animationFrameId!==null&&cancelAnimationFrame(this.animationFrameId);const e=()=>{if(!this.animation||!this.camera){this.animationFrameId=null;return}const s=performance.now()-this.animation.startTime,r=Math.min(s/this.animation.duration,1),n=this.applyEasing(r,this.animation.easing);if(this.camera.position.set(this.lerp(this.animation.startPosition.x,this.animation.endPosition.x,n),this.lerp(this.animation.startPosition.y,this.animation.endPosition.y,n),this.lerp(this.animation.startPosition.z,this.animation.endPosition.z,n)),this.orbitTarget={x:this.lerp(this.animation.startTarget.x,this.animation.endTarget.x,n),y:this.lerp(this.animation.startTarget.y,this.animation.endTarget.y,n),z:this.lerp(this.animation.startTarget.z,this.animation.endTarget.z,n)},this.camera.lookAt(this.orbitTarget.x,this.orbitTarget.y,this.orbitTarget.z),r<1)this.animationFrameId=requestAnimationFrame(e);else{const i=this.animation.onComplete;this.animation=null,this.animationFrameId=null,i&&i();for(const o of this.onAnimationCompleteCallbacks)o()}};this.animationFrameId=requestAnimationFrame(e)}stopAnimation(){this.animationFrameId!==null&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null),this.animation=null}isAnimating(){return this.animation!==null}lerp(e,t,s){return e+(t-e)*s}applyEasing(e,t){switch(t){case"linear":return e;case"easeOut":return 1-Math.pow(1-e,3);case"easeInOut":return e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2;default:return e}}updateSceneCameras(){this.sceneCameras=[];for(const e of this.probe.getObservedScenes())e.traverse(t=>{"isCamera"in t&&t.isCamera&&t!==this.camera&&this.sceneCameras.push(t)})}getAvailableCameras(){this.updateSceneCameras();const e=[];this.camera&&e.push({...this.extractCameraInfo(this.camera),name:this.camera.name||"Main Camera"});for(const t of this.sceneCameras)e.push(this.extractCameraInfo(t));return e}switchToCamera(e){const t=[this.camera,...this.sceneCameras].filter(Boolean);return e<0||e>=t.length?!1:(this.activeCameraIndex=e,this.camera=t[e],this.notifyCameraChanged(),!0)}switchToCameraByUuid(e){if(this.camera?.uuid===e)return this.activeCameraIndex=0,this.notifyCameraChanged(),!0;const t=this.sceneCameras.findIndex(s=>s.uuid===e);return t>=0?(this.camera=this.sceneCameras[t],this.activeCameraIndex=t+1,this.notifyCameraChanged(),!0):!1}getActiveCameraIndex(){return this.activeCameraIndex}notifyCameraChanged(){if(!this.camera)return;const e=this.getCameraInfo();if(e)for(const t of this.onCameraChangedCallbacks)t(this.camera,e)}onCameraChanged(e){return this.onCameraChangedCallbacks.push(e),()=>{const t=this.onCameraChangedCallbacks.indexOf(e);t>=0&&this.onCameraChangedCallbacks.splice(t,1)}}onAnimationComplete(e){return this.onAnimationCompleteCallbacks.push(e),()=>{const t=this.onAnimationCompleteCallbacks.indexOf(e);t>=0&&this.onAnimationCompleteCallbacks.splice(t,1)}}dispose(){this.stopAnimation(),this.camera=null,this.THREE=null,this.sceneCameras=[],this.onCameraChangedCallbacks=[],this.onAnimationCompleteCallbacks=[]}}const li={maxDrawCalls:1e3,maxTriangles:5e5,maxFrameTimeMs:16.67,maxTextures:100,maxTextureMemory:256*1024*1024,maxGeometryMemory:128*1024*1024,maxGpuMemory:512*1024*1024,maxVertices:1e6,maxSkinnedMeshes:20,maxBones:500,maxLights:10,maxShadowLights:4,maxTransparentObjects:50,maxProgramSwitches:100,minFps:30,min1PercentLowFps:20,maxFrameTimeVariance:10};class Lt{config;thresholds;customRules=[];violationCallbacks=[];recentViolations=[];maxViolationHistory=100;violationCooldowns=new Map;cooldownMs=1e3;constructor(e){this.config=e,this.thresholds=this.mergeThresholds(e.rules),this.customRules=e.rules?.custom||[]}static async loadFromFile(e){try{const t=await import(e),s=t.default||t,r=Lt.validateConfig(s);return r.valid||console.warn("[3Lens] Config validation errors:",r.errors),r.warnings.length>0&&console.warn("[3Lens] Config warnings:",r.warnings),s}catch(t){throw console.error(`[3Lens] Failed to load config from ${e}:`,t),t}}static async autoLoadConfig(){const e=["./3lens.config.js","./3lens.config.ts","./3lens.config.mjs","./.3lens.config.js"];for(const t of e)try{return await Lt.loadFromFile(t)}catch{}return null}static validateConfig(e){const t=[],s=[];if(!e||typeof e!="object")return t.push("Config must be an object"),{valid:!1,errors:t,warnings:s};const r=e;if((!r.appName||typeof r.appName!="string")&&t.push("appName is required and must be a string"),r.env!==void 0&&typeof r.env!="string"&&s.push("env should be a string"),r.debug!==void 0&&typeof r.debug!="boolean"&&s.push("debug should be a boolean"),r.rules!==void 0)if(typeof r.rules!="object")t.push("rules must be an object");else{const n=r.rules,i=["maxDrawCalls","maxTriangles","maxFrameTimeMs","maxTextures","maxTextureMemory","maxGeometryMemory","maxGpuMemory","maxVertices","maxSkinnedMeshes","maxBones","maxLights","maxShadowLights","maxTransparentObjects","maxProgramSwitches","minFps","min1PercentLowFps","maxFrameTimeVariance"];for(const o of i){const l=n[o];l!==void 0&&typeof l!="number"&&s.push(`rules.${o} should be a number`),typeof l=="number"&&l<0&&s.push(`rules.${o} should be positive`)}if(n.custom!==void 0)if(!Array.isArray(n.custom))t.push("rules.custom must be an array");else for(let o=0;o<n.custom.length;o++){const l=n.custom[o];(!l.id||typeof l.id!="string")&&t.push(`rules.custom[${o}].id is required and must be a string`),(!l.name||typeof l.name!="string")&&t.push(`rules.custom[${o}].name is required and must be a string`),(!l.check||typeof l.check!="function")&&t.push(`rules.custom[${o}].check is required and must be a function`)}}if(r.sampling!==void 0)if(typeof r.sampling!="object")t.push("sampling must be an object");else{const n=r.sampling;n.frameStats!==void 0&&(n.frameStats==="every-frame"||n.frameStats==="on-demand"||typeof n.frameStats=="number"||s.push('sampling.frameStats should be "every-frame", "on-demand", or a number')),n.snapshots!==void 0&&(["manual","on-change","every-frame"].includes(n.snapshots)||s.push('sampling.snapshots should be "manual", "on-change", or "every-frame"')),n.gpuTiming!==void 0&&typeof n.gpuTiming!="boolean"&&s.push("sampling.gpuTiming should be a boolean"),n.resourceTracking!==void 0&&typeof n.resourceTracking!="boolean"&&s.push("sampling.resourceTracking should be a boolean")}return{valid:t.length===0,errors:t,warnings:s}}mergeThresholds(e){return{...li,...e}}getThresholds(){return{...this.thresholds}}updateThresholds(e){this.thresholds={...this.thresholds,...e}}addCustomRule(e){this.customRules.push(e)}removeCustomRule(e){const t=this.customRules.findIndex(s=>s.id===e);return t!==-1?(this.customRules.splice(t,1),!0):!1}onViolation(e){return this.violationCallbacks.push(e),()=>{const t=this.violationCallbacks.indexOf(e);t!==-1&&this.violationCallbacks.splice(t,1)}}checkRules(e){const t=[],s=performance.now();t.push(...this.checkBuiltInRules(e));for(const r of this.customRules)try{const n=r.check(e);t.push({ruleId:r.id,ruleName:r.name,passed:n.passed,severity:n.severity||"warning",message:n.message||(n.passed?"Passed":"Failed")})}catch(n){t.push({ruleId:r.id,ruleName:r.name,passed:!1,severity:"error",message:`Rule check threw error: ${n}`})}for(const r of t)if(!r.passed){const n=this.violationCooldowns.get(r.ruleId);if(n&&s-n<this.cooldownMs)continue;const i={ruleId:r.ruleId,ruleName:r.ruleName,severity:r.severity,message:r.message,currentValue:r.currentValue??"N/A",threshold:r.threshold??"N/A",timestamp:s};this.recentViolations.push(i),this.recentViolations.length>this.maxViolationHistory&&this.recentViolations.shift(),this.violationCooldowns.set(r.ruleId,s);for(const o of this.violationCallbacks)try{o(i)}catch(l){console.error("[3Lens] Error in violation callback:",l)}}return t}checkBuiltInRules(e){const t=[],s=this.thresholds,r=e.memory;t.push({ruleId:"maxDrawCalls",ruleName:"Max Draw Calls",passed:e.drawCalls<=s.maxDrawCalls,severity:e.drawCalls>s.maxDrawCalls*1.5?"error":"warning",message:`Draw calls: ${e.drawCalls} (max: ${s.maxDrawCalls})`,currentValue:e.drawCalls,threshold:s.maxDrawCalls}),t.push({ruleId:"maxTriangles",ruleName:"Max Triangles",passed:e.triangles<=s.maxTriangles,severity:e.triangles>s.maxTriangles*1.5?"error":"warning",message:`Triangles: ${e.triangles.toLocaleString()} (max: ${s.maxTriangles.toLocaleString()})`,currentValue:e.triangles,threshold:s.maxTriangles}),t.push({ruleId:"maxFrameTimeMs",ruleName:"Max Frame Time",passed:e.cpuTimeMs<=s.maxFrameTimeMs,severity:e.cpuTimeMs>s.maxFrameTimeMs*2?"error":"warning",message:`Frame time: ${e.cpuTimeMs.toFixed(2)}ms (max: ${s.maxFrameTimeMs}ms)`,currentValue:e.cpuTimeMs.toFixed(2),threshold:s.maxFrameTimeMs});const n=e.performance?.fps??(e.cpuTimeMs>0?1e3/e.cpuTimeMs:60);return t.push({ruleId:"minFps",ruleName:"Min FPS",passed:n>=s.minFps,severity:n<s.minFps/2?"error":"warning",message:`FPS: ${Math.round(n)} (min: ${s.minFps})`,currentValue:Math.round(n),threshold:s.minFps}),r&&(t.push({ruleId:"maxTextures",ruleName:"Max Textures",passed:r.textures<=s.maxTextures,severity:r.textures>s.maxTextures*1.5?"error":"warning",message:`Textures: ${r.textures} (max: ${s.maxTextures})`,currentValue:r.textures,threshold:s.maxTextures}),t.push({ruleId:"maxTextureMemory",ruleName:"Max Texture Memory",passed:r.textureMemory<=s.maxTextureMemory,severity:r.textureMemory>s.maxTextureMemory*1.5?"error":"warning",message:`Texture memory: ${this.formatBytes(r.textureMemory)} (max: ${this.formatBytes(s.maxTextureMemory)})`,currentValue:this.formatBytes(r.textureMemory),threshold:this.formatBytes(s.maxTextureMemory)}),t.push({ruleId:"maxGeometryMemory",ruleName:"Max Geometry Memory",passed:r.geometryMemory<=s.maxGeometryMemory,severity:r.geometryMemory>s.maxGeometryMemory*1.5?"error":"warning",message:`Geometry memory: ${this.formatBytes(r.geometryMemory)} (max: ${this.formatBytes(s.maxGeometryMemory)})`,currentValue:this.formatBytes(r.geometryMemory),threshold:this.formatBytes(s.maxGeometryMemory)}),t.push({ruleId:"maxGpuMemory",ruleName:"Max GPU Memory",passed:r.totalGpuMemory<=s.maxGpuMemory,severity:r.totalGpuMemory>s.maxGpuMemory*1.5?"error":"warning",message:`GPU memory: ${this.formatBytes(r.totalGpuMemory)} (max: ${this.formatBytes(s.maxGpuMemory)})`,currentValue:this.formatBytes(r.totalGpuMemory),threshold:this.formatBytes(s.maxGpuMemory)})),e.rendering&&(t.push({ruleId:"maxLights",ruleName:"Max Lights",passed:e.rendering.totalLights<=s.maxLights,severity:e.rendering.totalLights>s.maxLights*1.5?"error":"warning",message:`Lights: ${e.rendering.totalLights} (max: ${s.maxLights})`,currentValue:e.rendering.totalLights,threshold:s.maxLights}),t.push({ruleId:"maxShadowLights",ruleName:"Max Shadow Lights",passed:e.rendering.shadowCastingLights<=s.maxShadowLights,severity:e.rendering.shadowCastingLights>s.maxShadowLights*1.5?"error":"warning",message:`Shadow lights: ${e.rendering.shadowCastingLights} (max: ${s.maxShadowLights})`,currentValue:e.rendering.shadowCastingLights,threshold:s.maxShadowLights})),t}getRecentViolations(){return[...this.recentViolations]}getViolationsBySeverity(e){return this.recentViolations.filter(t=>t.severity===e)}clearViolations(){this.recentViolations=[],this.violationCooldowns.clear()}getViolationSummary(){return{errors:this.recentViolations.filter(e=>e.severity==="error").length,warnings:this.recentViolations.filter(e=>e.severity==="warning").length,info:this.recentViolations.filter(e=>e.severity==="info").length,total:this.recentViolations.length}}exportConfig(){return{...this.config,rules:{...this.thresholds,custom:this.customRules}}}generateConfigFileContent(){const e=this.exportConfig(),t={...e,rules:e.rules?{...e.rules,custom:e.rules.custom?.map(s=>({id:s.id,name:s.name,check:"/* Custom function - define in config file */"}))}:void 0};return`/**
 * 3Lens Configuration
 * 
 * This file configures the 3Lens developer toolkit for your Three.js application.
 * See documentation at https://3lens.dev/docs/configuration
 */

/** @type {import('@3lens/core').ProbeConfig} */
export default ${JSON.stringify(t,null,2).replace(/"\/\* Custom function - define in config file \*\/"/g,"(stats) => ({ passed: true })")};
`}formatBytes(e){return e<1024?`${e}B`:e<1024*1024?`${(e/1024).toFixed(1)}KB`:`${(e/(1024*1024)).toFixed(1)}MB`}}function ci(){return`entity-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}function di(){return{triangles:0,drawCalls:0,gpuMemory:0,textureCount:0,geometryCount:0,materialCount:0,visibleObjects:0,totalObjects:0}}class hi{_entities=new Map;_objectToEntity=new Map;_componentToEntity=new Map;_moduleEntities=new Map;_eventListeners=[];registerLogicalEntity(e){const t=e.id||ci();if(this._entities.has(t))throw new Error(`Entity with ID "${t}" already exists`);const s={id:t,name:e.name,module:e.module??null,componentType:e.componentType??null,componentId:e.componentId??null,tags:e.tags??[],metadata:e.metadata??{},objects:[],objectUuids:[],parentEntityId:e.parentEntityId??null,childEntityIds:[],registeredAt:Date.now(),updatedAt:Date.now()};if(this._entities.set(t,s),e.componentId&&this._componentToEntity.set(e.componentId,t),e.module&&(this._moduleEntities.has(e.module)||this._moduleEntities.set(e.module,new Set),this._moduleEntities.get(e.module).add(t)),e.parentEntityId){const r=this._entities.get(e.parentEntityId);r&&(r.childEntityIds.push(t),r.updatedAt=Date.now())}return this._emitEvent("registered",s),t}updateLogicalEntity(e,t){const s=this._entities.get(e);if(!s)throw new Error(`Entity "${e}" not found`);if(t.module!==void 0&&t.module!==s.module&&(s.module&&this._moduleEntities.get(s.module)?.delete(e),t.module&&(this._moduleEntities.has(t.module)||this._moduleEntities.set(t.module,new Set),this._moduleEntities.get(t.module).add(e)),s.module=t.module),t.componentId!==void 0&&t.componentId!==s.componentId&&(s.componentId&&this._componentToEntity.delete(s.componentId),t.componentId&&this._componentToEntity.set(t.componentId,e),s.componentId=t.componentId),t.name!==void 0&&(s.name=t.name),t.componentType!==void 0&&(s.componentType=t.componentType),t.tags!==void 0&&(s.tags=t.tags),t.metadata!==void 0&&(s.metadata={...s.metadata,...t.metadata}),t.parentEntityId!==void 0&&t.parentEntityId!==s.parentEntityId){if(s.parentEntityId){const r=this._entities.get(s.parentEntityId);r&&(r.childEntityIds=r.childEntityIds.filter(n=>n!==e),r.updatedAt=Date.now())}if(t.parentEntityId){const r=this._entities.get(t.parentEntityId);r&&(r.childEntityIds.push(e),r.updatedAt=Date.now())}s.parentEntityId=t.parentEntityId}s.updatedAt=Date.now(),this._emitEvent("updated",s)}unregisterLogicalEntity(e,t=!1){const s=this._entities.get(e);if(s){if(t)for(const r of[...s.childEntityIds])this.unregisterLogicalEntity(r,!0);else for(const r of s.childEntityIds){const n=this._entities.get(r);if(n&&(n.parentEntityId=s.parentEntityId,s.parentEntityId)){const i=this._entities.get(s.parentEntityId);i&&i.childEntityIds.push(r)}}if(s.parentEntityId){const r=this._entities.get(s.parentEntityId);r&&(r.childEntityIds=r.childEntityIds.filter(n=>n!==e),r.updatedAt=Date.now())}for(const r of s.objectUuids)this._objectToEntity.delete(r);s.componentId&&this._componentToEntity.delete(s.componentId),s.module&&this._moduleEntities.get(s.module)?.delete(e),this._entities.delete(e),this._emitEvent("unregistered",s)}}addObjectToEntity(e,t){const s=this._entities.get(e);if(!s)throw new Error(`Entity "${e}" not found`);s.objectUuids.includes(t.uuid)||(s.objects.push(t),s.objectUuids.push(t.uuid),s.updatedAt=Date.now(),this._objectToEntity.set(t.uuid,e),t.userData={...t.userData,__3lens_entity:{entityId:e,entityName:s.name,module:s.module}},this._emitEvent("object-added",s,{objectUuid:t.uuid}))}removeObjectFromEntity(e,t){const s=this._entities.get(e);if(!s)return;const r=s.objectUuids.indexOf(t.uuid);r!==-1&&(s.objects.splice(r,1),s.objectUuids.splice(r,1),s.updatedAt=Date.now(),this._objectToEntity.delete(t.uuid),t.userData?.__3lens_entity&&delete t.userData.__3lens_entity,this._emitEvent("object-removed",s,{objectUuid:t.uuid}))}getEntity(e){return this._entities.get(e)}getAllEntities(){return Array.from(this._entities.values())}getEntityByObject(e){const t=this._objectToEntity.get(e.uuid);return t?this._entities.get(t):void 0}getEntityByComponentId(e){const t=this._componentToEntity.get(e);return t?this._entities.get(t):void 0}navigateFromObject(e){const t=this.getEntityByObject(e);return this._buildNavigationResult(t)}navigateFromComponent(e){const t=this.getEntityByComponentId(e);return this._buildNavigationResult(t)}navigateFromEntity(e){const t=this._entities.get(e);return this._buildNavigationResult(t)}filterEntities(e){let t=Array.from(this._entities.values());if(e.module&&(t=t.filter(s=>s.module===e.module)),e.modulePrefix&&(t=t.filter(s=>s.module?.startsWith(e.modulePrefix)??!1)),e.tags&&e.tags.length>0&&(t=t.filter(s=>e.tags.every(r=>s.tags.includes(r)))),e.anyTag&&e.anyTag.length>0&&(t=t.filter(s=>e.anyTag.some(r=>s.tags.includes(r)))),e.componentType&&(t=t.filter(s=>s.componentType===e.componentType)),e.nameContains){const s=e.nameContains.toLowerCase();t=t.filter(r=>r.name.toLowerCase().includes(s))}return e.hasMetadata&&e.hasMetadata.length>0&&(t=t.filter(s=>e.hasMetadata.every(r=>r in s.metadata))),e.hasObjects&&(t=t.filter(s=>s.objects.length>0)),t}getAllModules(){return Array.from(this._moduleEntities.keys())}getModuleInfo(e){const t=this._moduleEntities.get(e);if(!t||t.size===0)return;const s=Array.from(t).map(o=>this._entities.get(o)).filter(o=>o!==void 0),r=this._calculateModuleMetrics(s),n=new Set;s.forEach(o=>o.tags.forEach(l=>n.add(l)));const i=Array.from(this._moduleEntities.keys()).filter(o=>o!==e&&o.startsWith(e+"/"));return{id:e,entityCount:s.length,entityIds:s.map(o=>o.id),objectCount:s.reduce((o,l)=>o+l.objects.length,0),metrics:r,childModules:i,tags:Array.from(n)}}getAllModuleInfo(){return this.getAllModules().map(e=>this.getModuleInfo(e)).filter(e=>e!==void 0)}onEntityEvent(e){return this._eventListeners.push(e),()=>{const t=this._eventListeners.indexOf(e);t!==-1&&this._eventListeners.splice(t,1)}}clear(){const e=Array.from(this._entities.values());for(const t of e)this.unregisterLogicalEntity(t.id)}get entityCount(){return this._entities.size}get moduleCount(){return this._moduleEntities.size}_buildNavigationResult(e){if(!e)return{entity:null,objects:[],module:null,ancestors:[],children:[]};const t=[];let s=e.parentEntityId;for(;s;){const i=this._entities.get(s);if(i)t.unshift(i),s=i.parentEntityId;else break}const r=e.childEntityIds.map(i=>this._entities.get(i)).filter(i=>i!==void 0),n=e.module?this.getModuleInfo(e.module)??null:null;return{entity:e,objects:[...e.objects],module:n,ancestors:t,children:r}}_calculateModuleMetrics(e){const t=di();for(const s of e)for(const r of s.objects){if(t.totalObjects++,r.visible&&t.visibleObjects++,r.isMesh){const n=r,i=n.geometry;if(i){const o=i.attributes?.position;if(o){const l=o.count,c=i.index;c?t.triangles+=c.count/3:t.triangles+=l/3}t.geometryCount++;for(const l in i.attributes){const c=i.attributes[l];c&&(t.gpuMemory+=c.count*c.itemSize*4)}}n.material&&(Array.isArray(n.material)?t.materialCount+=n.material.length:t.materialCount++)}r.isMesh&&r.visible&&t.drawCalls++}return t}_emitEvent(e,t,s){const r={type:e,entityId:t.id,entity:t,timestamp:Date.now(),details:s};for(const n of this._eventListeners)try{n(r)}catch(i){console.error("[3Lens] Entity event listener error:",i)}}}class pi{_probe;_plugins=new Map;_panels=new Map;_toolbarActions=new Map;_contextMenuItems=new Map;_globalMessageHandlers=[];_frameStats=null;_snapshot=null;_selectedNode=null;_toastCallback=null;_renderRequestCallback=null;constructor(e){this._probe=e,e.onFrameStats(t=>{this._frameStats=t,this._notifyPanelsFrameStats(t)}),e.onSnapshot(t=>{this._snapshot=t,this._notifyPanelsSnapshot(t)}),e.onSelectionChanged(t=>{this._selectedNode=t,this._notifyPanelsSelection(t)})}registerPlugin(e){const t=e.metadata.id;if(this._plugins.has(t))throw new Error(`Plugin "${t}" is already registered`);this._validatePlugin(e);const s={plugin:e,state:"registered",storage:{},settings:this._getDefaultSettings(e),messageHandlers:[],panelContainers:new Map,registeredAt:Date.now(),activatedAt:null,error:null};if(this._plugins.set(t,s),e.panels)for(const r of e.panels){const n=`${t}:${r.id}`;this._panels.set(n,{pluginId:t,panel:r})}if(e.toolbarActions)for(const r of e.toolbarActions){const n=`${t}:${r.id}`;this._toolbarActions.set(n,{pluginId:t,action:r})}if(e.contextMenuItems)for(const r of e.contextMenuItems){const n=`${t}:${r.id}`;this._contextMenuItems.set(n,{pluginId:t,item:r})}this._log(`Plugin registered: ${e.metadata.name} (${t})`)}async unregisterPlugin(e){const t=this._plugins.get(e);if(t){t.state==="activated"&&await this.deactivatePlugin(e);for(const[s]of this._panels)s.startsWith(`${e}:`)&&this._panels.delete(s);for(const[s]of this._toolbarActions)s.startsWith(`${e}:`)&&this._toolbarActions.delete(s);for(const[s]of this._contextMenuItems)s.startsWith(`${e}:`)&&this._contextMenuItems.delete(s);this._plugins.delete(e),this._log(`Plugin unregistered: ${e}`)}}async activatePlugin(e){const t=this._plugins.get(e);if(!t)throw new Error(`Plugin "${e}" not found`);if(t.state!=="activated")try{const s=this._createContext(e);await t.plugin.activate(s),t.state="activated",t.activatedAt=Date.now(),t.error=null,this._log(`Plugin activated: ${t.plugin.metadata.name}`)}catch(s){throw t.state="error",t.error=s instanceof Error?s:new Error(String(s)),this._log(`Plugin activation failed: ${e}`,{error:t.error.message}),s}}async deactivatePlugin(e){const t=this._plugins.get(e);if(!(!t||t.state!=="activated"))try{const s=this._createContext(e);for(const[r,n]of t.panelContainers){const i=t.plugin.panels?.find(o=>o.id===r);i?.onUnmount&&i.onUnmount(n)}t.panelContainers.clear(),t.plugin.deactivate&&await t.plugin.deactivate(s),t.state="deactivated",t.messageHandlers=[],this._log(`Plugin deactivated: ${t.plugin.metadata.name}`)}catch(s){t.state="error",t.error=s instanceof Error?s:new Error(String(s)),this._log(`Plugin deactivation failed: ${e}`,{error:t.error.message})}}getPlugins(){return Array.from(this._plugins.entries()).map(([e,t])=>({id:e,metadata:t.plugin.metadata,state:t.state}))}getPlugin(e){return this._plugins.get(e)}getPanels(){return Array.from(this._panels.entries()).map(([e,{pluginId:t,panel:s}])=>({key:e,pluginId:t,panel:s})).sort((e,t)=>(e.panel.order??100)-(t.panel.order??100))}getToolbarActions(){return Array.from(this._toolbarActions.entries()).map(([e,{pluginId:t,action:s}])=>({key:e,pluginId:t,action:s})).sort((e,t)=>(e.action.order??100)-(t.action.order??100))}getContextMenuItems(e){return Array.from(this._contextMenuItems.entries()).filter(([,{item:t}])=>t.target===e||t.target==="all").map(([t,{pluginId:s,item:r}])=>({key:t,pluginId:s,item:r})).sort((t,s)=>(t.item.order??100)-(s.item.order??100))}renderPanel(e){const t=this._panels.get(e);if(!t)return'<div class="plugin-error">Panel not found</div>';const{pluginId:s,panel:r}=t,n=this._plugins.get(s);if(!n||n.state!=="activated")return'<div class="plugin-error">Plugin not active</div>';const i={frameStats:this._frameStats,snapshot:this._snapshot,selectedNode:this._selectedNode,state:n.storage,probe:this._probe};try{return r.render(i)}catch(o){return`<div class="plugin-error">Render error: ${o instanceof Error?o.message:String(o)}</div>`}}mountPanel(e,t){const s=this._panels.get(e);if(!s)return;const{pluginId:r,panel:n}=s,i=this._plugins.get(r);if(!(!i||i.state!=="activated")&&(i.panelContainers.set(n.id,t),n.onMount)){const o=this._createContext(r);n.onMount(t,o)}}unmountPanel(e){const t=this._panels.get(e);if(!t)return;const{pluginId:s,panel:r}=t,n=this._plugins.get(s);if(!n)return;const i=n.panelContainers.get(r.id);i&&r.onUnmount&&r.onUnmount(i),n.panelContainers.delete(r.id)}async executeToolbarAction(e){const t=this._toolbarActions.get(e);if(!t)return;const{pluginId:s,action:r}=t,n=this._plugins.get(s);if(!n||n.state!=="activated")return;const i=this._createContext(s);if(!(r.isEnabled&&!r.isEnabled(i)))try{await r.onClick(i)}catch(o){this._log(`Toolbar action error: ${e}`,{error:o instanceof Error?o.message:String(o)})}}async executeContextMenuItem(e,t){const s=this._contextMenuItems.get(e);if(!s)return;const{pluginId:r,item:n}=s,i=this._plugins.get(r);if(!i||i.state!=="activated")return;const o={...this._createContext(r),...t};if(!(n.isEnabled&&!n.isEnabled(o)))try{await n.onClick(o)}catch(l){this._log(`Context menu item error: ${e}`,{error:l instanceof Error?l.message:String(l)})}}sendMessage(e,t,s,r){const n={source:e,target:t,type:s,payload:r,timestamp:Date.now()};if(t==="*"){for(const[i,o]of this._plugins)if(i!==e&&o.state==="activated")for(const l of o.messageHandlers)this._safeCall(()=>l(n));for(const i of this._globalMessageHandlers)this._safeCall(()=>i(n))}else{const i=this._plugins.get(t);if(i?.state==="activated")for(const o of i.messageHandlers)this._safeCall(()=>o(n))}}onMessage(e){return this._globalMessageHandlers.push(e),()=>{const t=this._globalMessageHandlers.indexOf(e);t!==-1&&this._globalMessageHandlers.splice(t,1)}}setToastCallback(e){this._toastCallback=e}setRenderRequestCallback(e){this._renderRequestCallback=e}getPluginState(e){return this._plugins.get(e)?.storage??{}}setPluginState(e,t,s){const r=this._plugins.get(e);r&&(r.storage[t]=s)}getPluginSettings(e){return this._plugins.get(e)?.settings??{}}updatePluginSettings(e,t){const s=this._plugins.get(e);if(s&&(s.settings={...s.settings,...t},s.plugin.onSettingsChange&&s.state==="activated")){const r=this._createContext(e);this._safeCall(()=>s.plugin.onSettingsChange(s.settings,r))}}get pluginCount(){return this._plugins.size}get activePluginCount(){return Array.from(this._plugins.values()).filter(e=>e.state==="activated").length}_createContext(e){const t=this._plugins.get(e);return{probe:this._probe,getFrameStats:()=>this._frameStats,getSnapshot:()=>this._snapshot,getSelectedNode:()=>this._selectedNode,selectObject:s=>{const r=this._probe.findObjectByDebugIdOrUuid(s);r&&this._probe.selectObject(r)},clearSelection:()=>this._probe.selectObject(null),getEntities:()=>this._probe.getLogicalEntities(),getModuleInfo:s=>this._probe.getModuleInfo(s),log:(s,r)=>this._log(`[${e}] ${s}`,r),showToast:(s,r="info")=>{this._toastCallback&&this._toastCallback(s,r)},getState:s=>t.storage[s],setState:(s,r)=>{t.storage[s]=r},getAllState:()=>({...t.storage}),clearState:()=>{t.storage={}},sendMessage:(s,r,n)=>{this.sendMessage(e,s,r,n)},onMessage:s=>(t.messageHandlers.push(s),()=>{const r=t.messageHandlers.indexOf(s);r!==-1&&t.messageHandlers.splice(r,1)}),requestRender:()=>{this._renderRequestCallback&&this._renderRequestCallback(e)},getContainer:()=>Array.from(t.panelContainers.values())[0]??null}}_validatePlugin(e){if(!e.metadata)throw new Error("Plugin must have metadata");if(!e.metadata.id)throw new Error("Plugin must have an id");if(!e.metadata.name)throw new Error("Plugin must have a name");if(!e.metadata.version)throw new Error("Plugin must have a version");if(!e.activate)throw new Error("Plugin must have an activate function")}_getDefaultSettings(e){const t={};if(e.settings?.fields)for(const s of e.settings.fields)t[s.key]=s.defaultValue;return t}_notifyPanelsFrameStats(e){for(const[,{pluginId:t,panel:s}]of this._panels){if(!s.onFrameStats)continue;const r=this._plugins.get(t);if(!r||r.state!=="activated")continue;const n=r.panelContainers.get(s.id);n&&this._safeCall(()=>s.onFrameStats(e,n))}}_notifyPanelsSnapshot(e){for(const[,{pluginId:t,panel:s}]of this._panels){if(!s.onSnapshot)continue;const r=this._plugins.get(t);if(!r||r.state!=="activated")continue;const n=r.panelContainers.get(s.id);n&&this._safeCall(()=>s.onSnapshot(e,n))}}_notifyPanelsSelection(e){for(const[,{pluginId:t,panel:s}]of this._panels){if(!s.onSelectionChange)continue;const r=this._plugins.get(t);if(!r||r.state!=="activated")continue;const n=r.panelContainers.get(s.id);n&&this._safeCall(()=>s.onSelectionChange(e,n))}}_safeCall(e){try{const t=e();t instanceof Promise&&t.catch(s=>{this._log("Plugin callback error",{error:s instanceof Error?s.message:String(s)})})}catch(t){this._log("Plugin callback error",{error:t instanceof Error?t.message:String(t)})}}_log(e,t){this._probe.config.debug&&console.log(`[3Lens PluginManager] ${e}`,t??"")}}const ui="https://unpkg.com/{package}@{version}/dist/index.js";class mi{options;loadedPlugins=new Map;loadingPromises=new Map;constructor(e={}){this.options={importFn:e.importFn??this.defaultImport.bind(this),timeout:e.timeout??3e4,allowUrlImports:e.allowUrlImports??!0,cdnTemplate:e.cdnTemplate??ui}}async loadFromNpm(e,t="latest",s){const r={type:"npm",source:e,version:t,options:s};return this.loadFromSource(r)}async loadFromUrl(e,t){if(!this.options.allowUrlImports)return{success:!1,error:new Error("URL imports are disabled"),source:{type:"url",source:e},loadTime:0};const s={type:"url",source:e,options:t};return this.loadFromSource(s)}loadInline(e){const t=performance.now();try{return this.validatePlugin(e),this.loadedPlugins.set(e.metadata.id,e),{success:!0,plugin:e,source:{type:"inline",source:e.metadata.id},loadTime:performance.now()-t}}catch(s){return{success:!1,error:s instanceof Error?s:new Error(String(s)),source:{type:"inline",source:e.metadata?.id??"unknown"},loadTime:performance.now()-t}}}async loadFromSource(e){const t=this.getSourceCacheKey(e),s=this.loadingPromises.get(t);if(s)return s;const r=this.getLoadedPluginId(e);if(r){const i=this.loadedPlugins.get(r);if(i)return{success:!0,plugin:i,source:e,loadTime:0}}const n=this.doLoad(e);this.loadingPromises.set(t,n);try{return await n}finally{this.loadingPromises.delete(t)}}async loadMultiple(e){return Promise.all(e.map(t=>this.loadFromSource(t)))}getLoadedPlugin(e){return this.loadedPlugins.get(e)}getLoadedPlugins(){return Array.from(this.loadedPlugins.values())}isLoaded(e){return this.loadedPlugins.has(e)}unload(e){return this.loadedPlugins.delete(e)}clear(){this.loadedPlugins.clear(),this.loadingPromises.clear()}async doLoad(e){const t=performance.now();try{const s=this.getSourceUrl(e),r=await this.loadWithTimeout(s),n=this.extractPlugin(r,e.options);return this.validatePlugin(n),this.loadedPlugins.set(n.metadata.id,n),{success:!0,plugin:n,source:e,loadTime:performance.now()-t}}catch(s){return{success:!1,error:s instanceof Error?s:new Error(String(s)),source:e,loadTime:performance.now()-t}}}getSourceUrl(e){switch(e.type){case"npm":return this.options.cdnTemplate.replace("{package}",e.source).replace("{version}",e.version??"latest");case"url":return e.source;case"local":return e.source;default:throw new Error(`Unsupported source type: ${e.type}`)}}async loadWithTimeout(e){const t=new Promise((r,n)=>{setTimeout(()=>n(new Error(`Plugin load timeout: ${e}`)),this.options.timeout)}),s=this.options.importFn(e);return Promise.race([s,t])}async defaultImport(e){return import(e)}extractPlugin(e,t){const s=e;if(typeof s.createPlugin=="function")return s.createPlugin(t);if(s.plugin&&this.isValidPlugin(s.plugin))return s.plugin;if(s.default){const r=s.default;if(typeof r.createPlugin=="function")return r.createPlugin(t);if(r.plugin&&this.isValidPlugin(r.plugin))return r.plugin;if(this.isValidPlugin(r))return r}if(this.isValidPlugin(s))return s;throw new Error("Plugin package does not export a valid plugin")}isValidPlugin(e){if(!e||typeof e!="object")return!1;const t=e;return!!(t.metadata?.id&&t.metadata?.name&&t.metadata?.version&&typeof t.activate=="function")}validatePlugin(e){if(!e.metadata)throw new Error("Plugin must have metadata");if(!e.metadata.id)throw new Error("Plugin must have an id");if(!e.metadata.name)throw new Error("Plugin must have a name");if(!e.metadata.version)throw new Error("Plugin must have a version");if(typeof e.activate!="function")throw new Error("Plugin must have an activate function");if(this.loadedPlugins.has(e.metadata.id))throw new Error(`Plugin with id "${e.metadata.id}" is already loaded`)}getSourceCacheKey(e){return`${e.type}:${e.source}:${e.version??""}`}getLoadedPluginId(e){return null}}class gi{entries=new Map;sources=[];addSource(e){this.sources.includes(e)||this.sources.push(e)}removeSource(e){const t=this.sources.indexOf(e);t!==-1&&this.sources.splice(t,1)}async refresh(){this.entries.clear();for(const e of this.sources)try{const s=await(await fetch(e)).json();if(Array.isArray(s.plugins))for(const r of s.plugins)this.entries.set(r.metadata.id,r)}catch(t){console.warn(`Failed to fetch plugin registry from ${e}:`,t)}}register(e){this.entries.set(e.metadata.id,e)}unregister(e){this.entries.delete(e)}getAll(){return Array.from(this.entries.values())}get(e){return this.entries.get(e)}search(e){const t=e.toLowerCase();return this.getAll().filter(s=>{const r=s.metadata.name.toLowerCase().includes(t),n=s.metadata.description?.toLowerCase().includes(t),i=s.tags?.some(o=>o.toLowerCase().includes(t));return r||n||i})}getByTag(e){const t=e.toLowerCase();return this.getAll().filter(s=>s.tags?.some(r=>r.toLowerCase()===t))}getVerified(){return this.getAll().filter(e=>e.verified)}getPopular(e=10){return this.getAll().sort((t,s)=>(s.downloads??0)-(t.downloads??0)).slice(0,e)}getRecent(e=10){return this.getAll().sort((t,s)=>(s.updatedAt??0)-(t.updatedAt??0)).slice(0,e)}get count(){return this.entries.size}}const fi="0.1.0-alpha.1";class bi{config;_threeVersion=null;_rendererAdapter=null;_transport=null;_sceneObservers=new Map;_registeredRenderTargets=new Map;_selectedObject=null;_hoveredObject=null;_logicalEntities=new Map;_pluginManager=null;_pluginLoader=null;_pluginRegistry=null;_frameStatsHistory=[];_frameStatsHistoryIndex=0;_maxHistorySize=300;_selectionHelper=null;_inspectMode=null;_transformGizmo=null;_cameraController=null;_entityManager=null;_threeRef=null;_visualizationHelpers=new Map;_globalWireframe=!1;_selectionCallbacks=[];_frameStatsCallbacks=[];_snapshotCallbacks=[];_commandCallbacks=[];_resourceEventCallbacks=[];_globalLifecycleTracker=new Dr;_configLoader;_ruleCheckEnabled=!0;_lastRuleCheck=0;_ruleCheckIntervalMs=1e3;_framesSinceLastSample=0;_lastSampledStats=null;_adaptiveSamplingEnabled=!0;_adaptiveSamplingRate=1;_stableFrameCount=0;_lastFps=0;constructor(e){this.config={env:"development",debug:!1,...e,sampling:{frameStats:"every-frame",snapshots:"on-change",gpuTiming:!0,resourceTracking:!0,...e.sampling}},this._configLoader=new Lt(this.config),this.log("Probe initialized",{appName:e.appName})}get selectionHelper(){return this._selectionHelper||(this._selectionHelper=new ni,this._threeRef&&this._selectionHelper.initialize(this._threeRef)),this._selectionHelper}get inspectMode(){return this._inspectMode||(this._inspectMode=new ii(this)),this._inspectMode}get transformGizmo(){return this._transformGizmo||(this._transformGizmo=new ai(this)),this._transformGizmo}get cameraController(){return this._cameraController||(this._cameraController=new oi(this)),this._cameraController}get entityManager(){return this._entityManager||(this._entityManager=new hi),this._entityManager}get threeVersion(){return this._threeVersion}observeRenderer(e){this._threeVersion=e.version??null;const t=this.config.sampling?.gpuTiming??!0;let s;Lr(e)?(s=jn(e),this.log("Detected WebGPU renderer")):(s=On(e,{gpuTiming:t}),this.log("Detected WebGL renderer",{gpuTiming:t})),this.attachRendererAdapter(s),this.log("Observing renderer",{type:s.kind})}isWebGPU(){return this._rendererAdapter?.kind==="webgpu"}isWebGL(){return this._rendererAdapter?.kind==="webgl"}getRendererKind(){return this._rendererAdapter?.kind??null}attachRendererAdapter(e){this._rendererAdapter&&this._rendererAdapter.dispose(),this._rendererAdapter=e,e.observeFrame(t=>{this.handleFrameStats(t)})}getRendererAdapter(){return this._rendererAdapter}getTextures(){return this._rendererAdapter?.getTextures()??[]}getGeometries(){return this._rendererAdapter?.getGeometries()??[]}getMaterials(){return this._rendererAdapter?.getMaterials()??[]}async getGpuTimings(){return this._rendererAdapter?.getGpuTimings?.()??null}observeScene(e){if(this._sceneObservers.has(e)){this.log("Scene already being observed",{name:e.name});return}const t=new ri(e,{onSceneChange:()=>this.handleSceneChange(),onResourceEvent:s=>this.handleResourceEvent(s)});this._sceneObservers.set(e,t),this.log("Observing scene",{name:e.name||"<unnamed>"})}handleResourceEvent(e){for(const t of this._resourceEventCallbacks)try{t(e)}catch(s){this.log("Error in resource event callback",{error:s})}}unobserveScene(e){const t=this._sceneObservers.get(e);t&&(t.dispose(),this._sceneObservers.delete(e),this.log("Stopped observing scene",{name:e.name}))}getObservedScenes(){return Array.from(this._sceneObservers.keys())}getRenderTargetId(e){return e.uuid||e.texture?.uuid||""}observeRenderTarget(e,t="custom"){const s=this.getRenderTargetId(e);if(!s){this.log("Cannot observe render target: no valid ID",{usage:t});return}if(this._registeredRenderTargets.has(s)){this.log("Render target already being observed",{uuid:s});return}this._registeredRenderTargets.set(s,{rt:e,usage:t}),this.log("Observing render target",{uuid:s,name:e.texture?.name||"<unnamed>",size:`${e.width}x${e.height}`,usage:t})}unobserveRenderTarget(e){const t=this.getRenderTargetId(e);this._registeredRenderTargets.delete(t)&&this.log("Stopped observing render target",{uuid:t})}getRegisteredRenderTargets(){return this._registeredRenderTargets}setThreeReference(e){this._threeRef=e,this.selectionHelper.initialize(e),this.log("THREE.js reference set for selection highlighting")}updateSelectionHighlight(){this.selectionHelper.update()}takeSnapshot(){const e=[],t=[],s={totalCount:0,byType:{},shaderMaterialCount:0,transparentCount:0},r=[],n={totalCount:0,totalVertices:0,totalTriangles:0,totalMemoryBytes:0,byType:{},indexedCount:0,morphedCount:0},i=[],o={totalCount:0,totalMemoryBytes:0,byType:{},cubeTextureCount:0,compressedCount:0,videoTextureCount:0,renderTargetCount:0},l=[],c={totalCount:0,totalMemoryBytes:0,shadowMapCount:0,postProcessCount:0,cubeTargetCount:0,mrtCount:0,msaaCount:0};for(const[u,m]of this._sceneObservers){e.push(m.createSceneNode(u));const{materials:g,summary:f}=m.collectMaterials(),y=new Set(t.map(T=>T.uuid));for(const T of g)y.has(T.uuid)||(t.push(T),y.add(T.uuid));s.totalCount=t.length,s.shaderMaterialCount+=f.shaderMaterialCount,s.transparentCount+=f.transparentCount;for(const[T,I]of Object.entries(f.byType))s.byType[T]=(s.byType[T]||0)+I;const{geometries:b,summary:w}=m.collectGeometries(),v=new Set(r.map(T=>T.uuid));for(const T of b)v.has(T.uuid)||(r.push(T),v.add(T.uuid));n.totalCount=r.length,n.totalVertices+=w.totalVertices,n.totalTriangles+=w.totalTriangles,n.totalMemoryBytes+=w.totalMemoryBytes,n.indexedCount+=w.indexedCount,n.morphedCount+=w.morphedCount;for(const[T,I]of Object.entries(w.byType))n.byType[T]=(n.byType[T]||0)+I;const{textures:C,summary:k}=m.collectTextures(),M=new Set(i.map(T=>T.uuid));for(const T of C)M.has(T.uuid)||(i.push(T),M.add(T.uuid));o.totalCount=i.length,o.totalMemoryBytes+=k.totalMemoryBytes,o.cubeTextureCount+=k.cubeTextureCount,o.compressedCount+=k.compressedCount,o.videoTextureCount+=k.videoTextureCount,o.renderTargetCount+=k.renderTargetCount;for(const[T,I]of Object.entries(k.byType))o.byType[T]=(o.byType[T]||0)+I;const{renderTargets:S,summary:z}=m.collectRenderTargets(),E=new Set(l.map(T=>T.uuid));for(const T of S)E.has(T.uuid)||(l.push(T),E.add(T.uuid));c.totalCount=l.length,c.totalMemoryBytes+=z.totalMemoryBytes,c.shadowMapCount+=z.shadowMapCount,c.postProcessCount+=z.postProcessCount,c.cubeTargetCount+=z.cubeTargetCount,c.mrtCount+=z.mrtCount,c.msaaCount+=z.msaaCount}const d=new Set(l.map(u=>u.uuid)),h=this._sceneObservers.values().next().value;for(const[u,{rt:m,usage:g}]of this._registeredRenderTargets)if(!d.has(u)&&h){const f=h.createRenderTargetDataPublic(m,g);l.push(f),d.add(u),c.totalMemoryBytes+=f.memoryBytes,g==="shadow-map"&&c.shadowMapCount++,g==="post-process"&&c.postProcessCount++,f.isCubeTarget&&c.cubeTargetCount++,f.colorAttachmentCount>1&&c.mrtCount++,f.samples>0&&c.msaaCount++}c.totalCount=l.length;const p={snapshotId:this.generateId(),timestamp:performance.now(),scenes:e,materials:t,materialsSummary:s,geometries:r,geometriesSummary:n,textures:i,texturesSummary:o,renderTargets:l,renderTargetsSummary:c};this.sendMessage({type:"snapshot",timestamp:performance.now(),snapshotId:p.snapshotId,trigger:"manual",snapshot:p});for(const u of this._snapshotCallbacks)try{u(p)}catch(m){this.log("Snapshot callback error",{error:String(m)})}return p}selectObject(e){const t=this._selectedObject;this._selectedObject=e;const s=t?this.getObjectMeta(t):null,r=e?this.getObjectMeta(e):null;this.selectionHelper.highlight(e);for(const n of this._selectionCallbacks)n(e,r??void 0);this.sendMessage({type:"selection-changed",timestamp:performance.now(),selectedObject:r,previousObject:s})}selectByDebugId(e){if(!e)return this.selectObject(null),!0;for(const t of this._sceneObservers.values()){const s=t.findObjectByDebugId(e);if(s)return this.selectObject(s),!0}return!1}findObjectByDebugIdOrUuid(e){for(const t of this._sceneObservers.values()){const s=t.findObjectByDebugId(e);if(s)return s}for(const t of this._sceneObservers.keys()){let s=null;if(t.traverse(r=>{r.uuid===e&&(s=r)}),s)return s}return null}getSelectedObject(){return this._selectedObject}toggleWireframe(e,t){if(!("isMesh"in e)||!e.isMesh)return;const s=e;this.applyGeometryVisualization(s,"wireframe",t)}toggleBoundingBox(e,t){if(!("isMesh"in e)||!e.isMesh)return;const s=e;this.applyGeometryVisualization(s,"boundingBox",t)}toggleSelectedWireframe(e){this._selectedObject&&this.toggleWireframe(this._selectedObject,e)}toggleSelectedBoundingBox(e){this._selectedObject&&this.toggleBoundingBox(this._selectedObject,e)}isWireframeEnabled(e){const t=`${e.uuid}_wireframe`;return this._visualizationHelpers.has(t)}isBoundingBoxEnabled(e){const t=`${e.uuid}_boundingBox`;return this._visualizationHelpers.has(t)}toggleGlobalWireframe(e){this._globalWireframe=e;for(const t of this._sceneObservers.keys())t.traverse(s=>{if("isMesh"in s&&s.isMesh){const r=s;if(r.name.startsWith("3lens_")||r.name.startsWith("__3lens"))return;const n=Array.isArray(r.material)?r.material:[r.material];for(const i of n)i&&"wireframe"in i&&(i.wireframe=e,i.needsUpdate=!0)}})}isGlobalWireframeEnabled(){return this._globalWireframe}initializeTransformGizmo(e,t,s,r){this.transformGizmo.initialize(e,t,s,r),this.onSelectionChanged(()=>{this.transformGizmo.onSelectionChanged()}),this.log("Transform gizmo initialized")}async enableTransformGizmo(){await this.transformGizmo.enable()}disableTransformGizmo(){this.transformGizmo.disable()}isTransformGizmoEnabled(){return this.transformGizmo.isEnabled()}setTransformMode(e){this.transformGizmo.setMode(e)}getTransformMode(){return this.transformGizmo.getMode()}setTransformSpace(e){this.transformGizmo.setSpace(e)}getTransformSpace(){return this.transformGizmo.getSpace()}toggleTransformSpace(){return this.transformGizmo.toggleSpace()}setTransformSnapEnabled(e){this.transformGizmo.setSnapEnabled(e)}isTransformSnapEnabled(){return this.transformGizmo.isSnapEnabled()}setTransformSnapValues(e,t,s){this.transformGizmo.setSnapValues(e,t,s)}getTransformSnapValues(){return this.transformGizmo.getSnapValues()}undoTransform(){return this.transformGizmo.undo()}redoTransform(){return this.transformGizmo.redo()}canUndoTransform(){return this.transformGizmo.canUndo()}canRedoTransform(){return this.transformGizmo.canRedo()}getTransformHistory(){return this.transformGizmo.getHistory()}clearTransformHistory(){this.transformGizmo.clearHistory()}onTransformDraggingChanged(e){return this.transformGizmo.onDraggingChanged(e)}onTransformChanged(e){return this.transformGizmo.onTransformChanged(e)}initializeCameraController(e,t,s){this.cameraController.initialize(e,t,s),this.log("Camera controller initialized")}getCameraInfo(){return this.cameraController.getCameraInfo()}getAvailableCameras(){return this.cameraController.getAvailableCameras()}focusOnObject(e,t=1.5){this.cameraController.focusOnObject(e,t)}focusOnSelected(e=1.5){return this.cameraController.focusOnSelected(e)}flyToObject(e,t){this.cameraController.flyToObject(e,t)}flyToSelected(e){return this.cameraController.flyToSelected(e)}stopCameraAnimation(){this.cameraController.stopAnimation()}isCameraAnimating(){return this.cameraController.isAnimating()}switchToCamera(e){return this.cameraController.switchToCamera(e)}switchToCameraByUuid(e){return this.cameraController.switchToCameraByUuid(e)}getActiveCameraIndex(){return this.cameraController.getActiveCameraIndex()}setOrbitTarget(e){this.cameraController.setOrbitTarget(e)}getOrbitTarget(){return this.cameraController.getOrbitTarget()}onCameraChanged(e){return this.cameraController.onCameraChanged(e)}onCameraAnimationComplete(e){return this.cameraController.onAnimationComplete(e)}goHome(){this.cameraController.goHome()}flyHome(e){this.cameraController.flyHome(e)}saveCurrentCameraAsHome(){this.cameraController.saveCurrentAsHome()}hasHomePosition(){return this.cameraController.hasHomePosition()}updateMaterialProperty(e,t,s){for(const r of this._sceneObservers.values()){const n=r.findMaterialByUuid(e);if(n){this.applyMaterialPropertyChange(n,t,s);return}}this.log("Material not found for property update",{uuid:e})}onSelectionChanged(e){return this._selectionCallbacks.push(e),()=>{const t=this._selectionCallbacks.indexOf(e);t>-1&&this._selectionCallbacks.splice(t,1)}}setHoveredObject(e){this._hoveredObject=e,this.selectionHelper.highlightHover(e)}getHoveredObject(){return this._hoveredObject}initializeInspectMode(e,t,s){this.inspectMode.initialize(e,t,s),this.log("Inspect mode initialized")}setInspectModeEnabled(e){this.inspectMode.setEnabled(e),this.log(e?"Inspect mode enabled":"Inspect mode disabled")}isInspectModeEnabled(){return this.inspectMode.isEnabled()}setInspectModeCamera(e){this.inspectMode.setCamera(e)}setInspectModePickableObjects(e){this.inspectMode.setPickableObjects(e)}getEntityManager(){return this.entityManager}registerLogicalEntity(e){if("label"in e){const s=e;this._logicalEntities.set(s.id,s),this.log("Registered logical entity (legacy)",{id:s.id,label:s.label});const r=this.entityManager.registerLogicalEntity({id:s.id,name:s.label,module:s.moduleId,componentId:s.componentId,metadata:s.metadata});for(const n of s.objects)this.entityManager.addObjectToEntity(r,n);return}const t=this.entityManager.registerLogicalEntity(e);return this.log("Registered logical entity",{id:t,name:e.name}),t}updateLogicalEntity(e,t){const s=this._logicalEntities.get(e);s&&Object.assign(s,t);try{this.entityManager.updateLogicalEntity(e,t)}catch{}}unregisterLogicalEntity(e,t=!1){this._logicalEntities.delete(e),this.entityManager.unregisterLogicalEntity(e,t),this.log("Unregistered logical entity",{id:e})}addObjectToEntity(e,t){this.entityManager.addObjectToEntity(e,t);const s=this._logicalEntities.get(e);s&&!s.objects.includes(t)&&s.objects.push(t)}removeObjectFromEntity(e,t){this.entityManager.removeObjectFromEntity(e,t);const s=this._logicalEntities.get(e);if(s){const r=s.objects.indexOf(t);r!==-1&&s.objects.splice(r,1)}}getLogicalEntities(){return this.entityManager.getAllEntities()}getLogicalEntity(e){return this.entityManager.getEntity(e)}findEntityByObject(e){return this.entityManager.getEntityByObject(e)??null}findEntityByComponentId(e){return this.entityManager.getEntityByComponentId(e)??null}filterEntities(e){return this.entityManager.filterEntities(e)}getAllModules(){return this.entityManager.getAllModules()}getModuleInfo(e){return this.entityManager.getModuleInfo(e)}getAllModuleInfo(){return this.entityManager.getAllModuleInfo()}navigateFromObject(e){return this.entityManager.navigateFromObject(e)}navigateFromComponent(e){return this.entityManager.navigateFromComponent(e)}navigateFromEntity(e){return this.entityManager.navigateFromEntity(e)}onEntityEvent(e){return this.entityManager.onEntityEvent(e)}get entityCount(){return this.entityManager.entityCount}get moduleCount(){return this.entityManager.moduleCount}getPluginManager(){return this._pluginManager||(this._pluginManager=new pi(this)),this._pluginManager}registerPlugin(e){this.getPluginManager().registerPlugin(e)}async unregisterPlugin(e){await this.getPluginManager().unregisterPlugin(e)}async activatePlugin(e){await this.getPluginManager().activatePlugin(e)}async deactivatePlugin(e){await this.getPluginManager().deactivatePlugin(e)}getPlugins(){return this.getPluginManager().getPlugins()}get pluginCount(){return this._pluginManager?.pluginCount??0}get activePluginCount(){return this._pluginManager?.activePluginCount??0}getPluginLoader(){return this._pluginLoader||(this._pluginLoader=new mi),this._pluginLoader}getPluginRegistry(){return this._pluginRegistry||(this._pluginRegistry=new gi),this._pluginRegistry}async loadPlugin(e,t="latest",s){const n=await this.getPluginLoader().loadFromNpm(e,t,s);return n.success&&n.plugin&&(this.registerPlugin(n.plugin),await this.activatePlugin(n.plugin.metadata.id)),n}async loadPluginFromUrl(e,t){const r=await this.getPluginLoader().loadFromUrl(e,t);return r.success&&r.plugin&&(this.registerPlugin(r.plugin),await this.activatePlugin(r.plugin.metadata.id)),r}async loadPlugins(e){const s=await this.getPluginLoader().loadMultiple(e);for(const r of s)r.success&&r.plugin&&(this.registerPlugin(r.plugin),r.source.autoActivate!==!1&&await this.activatePlugin(r.plugin.metadata.id));return s}metric(e,t,s){this.sendMessage({type:"custom-metric",timestamp:performance.now(),name:e,value:t,tags:s})}event(e,t){this.sendMessage({type:"custom-event",timestamp:performance.now(),name:e,data:t})}getLatestFrameStats(){return this._frameStatsHistory[this._frameStatsHistory.length-1]??null}getFrameStatsHistory(e){return e?this._frameStatsHistory.slice(-e):[...this._frameStatsHistory]}onFrameStats(e){return this._frameStatsCallbacks.push(e),()=>{const t=this._frameStatsCallbacks.indexOf(e);t>-1&&this._frameStatsCallbacks.splice(t,1)}}onSnapshot(e){return this._snapshotCallbacks.push(e),()=>{const t=this._snapshotCallbacks.indexOf(e);t>-1&&this._snapshotCallbacks.splice(t,1)}}onCommand(e){return this._commandCallbacks.push(e),()=>{const t=this._commandCallbacks.indexOf(e);t>-1&&this._commandCallbacks.splice(t,1)}}connect(e){this._transport&&this._transport.close(),this._transport=e,e.onReceive(t=>{this.handleMessage(t)}),this.log("Connected to transport")}disconnect(){this._transport&&(this._transport.close(),this._transport=null)}isConnected(){return this._transport?.isConnected()??!1}dispose(){this._selectionHelper?.dispose(),this._inspectMode?.dispose();for(const[,e]of this._visualizationHelpers)if(e.parent?.remove(e),"geometry"in e&&e.geometry&&e.geometry.dispose(),"material"in e&&e.material){const t=e.material;Array.isArray(t)?t.forEach(s=>s.dispose()):t.dispose()}this._visualizationHelpers.clear(),this._rendererAdapter&&(this._rendererAdapter.dispose(),this._rendererAdapter=null);for(const e of this._sceneObservers.values())e.dispose();this._sceneObservers.clear(),this._transport&&(this._transport.close(),this._transport=null),this._selectionCallbacks=[],this._frameStatsCallbacks=[],this._commandCallbacks=[],this.log("Probe disposed")}shouldSampleFrame(){const e=this.config.sampling?.frameStats??"every-frame";if(e==="on-demand")return!1;if(e==="every-frame"){if(this._adaptiveSamplingEnabled&&this._adaptiveSamplingRate>1){if(this._framesSinceLastSample++,this._framesSinceLastSample<this._adaptiveSamplingRate)return!1;this._framesSinceLastSample=0}return!0}return typeof e=="number"&&e>0?(this._framesSinceLastSample++,this._framesSinceLastSample>=e?(this._framesSinceLastSample=0,!0):!1):!0}updateAdaptiveSampling(e){if(!this._adaptiveSamplingEnabled)return;const t=e.performance?.fps??60,s=Math.abs(t-this._lastFps);this._lastFps=t,s<t*.05?(this._stableFrameCount++,this._stableFrameCount>60&&this._adaptiveSamplingRate<4&&(this._adaptiveSamplingRate=Math.min(4,this._adaptiveSamplingRate+1),this._stableFrameCount=0,this.log("Adaptive sampling: reducing rate",{rate:this._adaptiveSamplingRate}))):(this._adaptiveSamplingRate>1&&(this._adaptiveSamplingRate=1,this.log("Adaptive sampling: reset to full rate due to FPS variance")),this._stableFrameCount=0)}hasSignificantChange(e){if(!this._lastSampledStats)return!0;const t=this._lastSampledStats,s=Math.abs((e.performance?.fps??0)-(t.performance?.fps??0)),r=Math.abs(e.drawCalls-t.drawCalls),n=Math.abs(e.triangles-t.triangles),i=Math.abs((e.memory?.totalGpuMemory??0)-(t.memory?.totalGpuMemory??0));return s>=2||r>=10||n>=1e3||i>=1024*1024}handleFrameStats(e){if(this._frameStatsHistory.length<this._maxHistorySize?this._frameStatsHistory.push(e):(this._frameStatsHistory[this._frameStatsHistoryIndex]=e,this._frameStatsHistoryIndex=(this._frameStatsHistoryIndex+1)%this._maxHistorySize),!this.shouldSampleFrame()){this._selectedObject&&this.selectionHelper.update();return}if(this.updateAdaptiveSampling(e),!(!(this._frameStatsCallbacks.length>0||this._transport?.isConnected())&&!this._ruleCheckEnabled&&!this._selectedObject)){if(this._ruleCheckEnabled){const s=performance.now();if(s-this._lastRuleCheck>=this._ruleCheckIntervalMs){this._lastRuleCheck=s;const n=this._configLoader.checkRules(e).filter(i=>!i.passed).map(i=>({ruleId:i.ruleId,message:i.message,severity:i.severity}));n.length>0&&(e.violations=n)}}if(this._selectedObject&&this.selectionHelper.update(),this._frameStatsCallbacks.length>0)for(const s of this._frameStatsCallbacks)s(e);this._transport?.isConnected()&&this.hasSignificantChange(e)&&(this._lastSampledStats=e,this.sendMessage({type:"frame-stats",timestamp:e.timestamp,stats:e}))}}handleSceneChange(){this.config.sampling?.snapshots==="on-change"&&this.takeSnapshot()}handleMessage(e){switch(e.type){case"handshake-request":this.handleHandshake(e);break;case"select-object":this.handleSelectObject(e);break;case"hover-object":this.handleHoverObject(e);break;case"request-snapshot":this.takeSnapshot();break;case"update-material-property":this.handleUpdateMaterialProperty(e);break;case"geometry-visualization":this.handleGeometryVisualization(e);break;case"ping":this.sendMessage({type:"pong",timestamp:performance.now(),requestId:e.id??""});break;default:for(const t of this._commandCallbacks)t(e)}}handleHandshake(e){this.sendMessage({type:"handshake-response",timestamp:performance.now(),requestId:e.id??"",appId:this.generateId(),appName:this.config.appName,threeVersion:this._threeVersion??"unknown",probeVersion:fi,backend:this._rendererAdapter?.kind??"webgl",capabilities:["scene-graph","frame-stats","selection"]})}handleSelectObject(e){if(!e.debugId){this.selectObject(null);return}for(const t of this._sceneObservers.values()){const s=t.findObjectByDebugId(e.debugId);if(s){this.selectObject(s);return}}}handleHoverObject(e){if(!e.debugId){this._hoveredObject=null,this.selectionHelper.highlightHover(null);return}for(const t of this._sceneObservers.values()){const s=t.findObjectByDebugId(e.debugId);if(s){this._hoveredObject=s,this.selectionHelper.highlightHover(s);return}}}handleUpdateMaterialProperty(e){for(const t of this._sceneObservers.values()){const s=t.findMaterialByUuid(e.materialUuid);if(s){this.applyMaterialPropertyChange(s,e.property,e.value);return}}this.log("Material not found for property update",{uuid:e.materialUuid})}handleGeometryVisualization(e){const{geometryUuid:t,visualization:s,enabled:r}=e;for(const n of this._sceneObservers.values())if(n.findGeometryByUuid(t)){this._sceneObservers.forEach((o,l)=>{l.traverse(c=>{if("isMesh"in c&&c.isMesh){const d=c;d.geometry?.uuid===t&&this.applyGeometryVisualization(d,s,r)}})});return}this.log("Geometry not found for visualization",{uuid:t})}applyGeometryVisualization(e,t,s){const r=this._threeRef;if(!r){this.log("THREE.js reference not set - cannot create visualization helpers");return}const n=`${e.uuid}_${t}`;if(s){const i=this._visualizationHelpers.get(n);switch(i&&(i.parent?.remove(i),this._visualizationHelpers.delete(n)),t){case"wireframe":{const o=Array.isArray(e.material)?e.material:[e.material];for(const l of o)l&&"wireframe"in l&&(l.wireframe=!0,l.needsUpdate=!0);this._visualizationHelpers.set(n,e);break}case"boundingBox":{e.geometry.boundingBox||e.geometry.computeBoundingBox();const o=new r.BoxHelper(e,2282478);o.name=`3lens_bbox_${e.uuid}`,e.parent?.add(o),this._visualizationHelpers.set(n,o);break}case"normals":{const o=this.createNormalsHelper(e,r);o&&(o.name=`3lens_normals_${e.uuid}`,e.parent?.add(o),this._visualizationHelpers.set(n,o));break}}}else{const i=this._visualizationHelpers.get(n);if(i){if(t==="wireframe"){const o=Array.isArray(e.material)?e.material:[e.material];for(const l of o)l&&"wireframe"in l&&(l.wireframe=!1,l.needsUpdate=!0)}else if(i.parent?.remove(i),"geometry"in i&&i.geometry&&i.geometry.dispose(),"material"in i&&i.material){const o=i.material;Array.isArray(o)?o.forEach(l=>l.dispose()):o.dispose()}this._visualizationHelpers.delete(n)}}}createNormalsHelper(e,t){const s=e.geometry,r=s.attributes.normal;if(!r)return this.log("No normal attribute found on geometry"),null;const n=s.attributes.position;if(!n)return null;const i=.1,o=3462041,l=[],c=n.count;for(let u=0;u<c;u++){const m=n.getX(u),g=n.getY(u),f=n.getZ(u),y=r.getX(u),b=r.getY(u),w=r.getZ(u);l.push(m,g,f),l.push(m+y*i,g+b*i,f+w*i)}const d=new t.BufferGeometry;d.setAttribute("position",new t.Float32BufferAttribute(l,3));const h=new t.LineBasicMaterial({color:o}),p=new t.LineSegments(d,h);return p.matrixAutoUpdate=!1,p.matrix.copy(e.matrixWorld),p}applyMaterialPropertyChange(e,t,s){const r=e;switch(t){case"color":case"emissive":{typeof s=="number"&&r[t]&&typeof r[t].setHex=="function"&&r[t].setHex(s);break}case"opacity":case"roughness":case"metalness":case"reflectivity":case"clearcoat":case"clearcoatRoughness":case"sheen":case"sheenRoughness":case"transmission":case"thickness":case"ior":{typeof s=="number"&&t in r&&(r[t]=s);break}case"transparent":case"visible":case"wireframe":case"depthTest":case"depthWrite":case"flatShading":{typeof s=="boolean"&&t in r&&(r[t]=s);break}case"side":{typeof s=="number"&&t in r&&(r[t]=s);break}default:this.log("Unknown material property",{property:t,value:s})}e.needsUpdate=!0}formatBytes(e){return e>=1073741824?(e/1073741824).toFixed(2)+" GB":e>=1048576?(e/1048576).toFixed(2)+" MB":e>=1024?(e/1024).toFixed(2)+" KB":e+" B"}getObjectMeta(e){for(const t of this._sceneObservers.values()){const s=t.getObjectRef(e);if(s){const r=this.findEntityByObject(e);return{...s,moduleId:r?.module,componentId:r?.componentId,entityId:r?.id}}}return null}onResourceEvent(e){return this._resourceEventCallbacks.push(e),()=>{const t=this._resourceEventCallbacks.indexOf(e);t!==-1&&this._resourceEventCallbacks.splice(t,1)}}getResourceEvents(){const e=[];for(const t of this._sceneObservers.values())e.push(...t.getLifecycleTracker().getEvents());return e.sort((t,s)=>t.timestamp-s.timestamp),e}getResourceEventsByType(e){const t=[];for(const s of this._sceneObservers.values())t.push(...s.getLifecycleTracker().getEventsByType(e));return t.sort((s,r)=>s.timestamp-r.timestamp),t}getResourceEventsByEventType(e){const t=[];for(const s of this._sceneObservers.values())t.push(...s.getLifecycleTracker().getEventsByEventType(e));return t.sort((s,r)=>s.timestamp-r.timestamp),t}getResourceEventsInRange(e,t){const s=[];for(const r of this._sceneObservers.values())s.push(...r.getLifecycleTracker().getEventsInRange(e,t));return s.sort((r,n)=>r.timestamp-n.timestamp),s}getResourceLifecycleSummary(){const e={geometries:{created:0,disposed:0,active:0,leaked:0},materials:{created:0,disposed:0,active:0,leaked:0},textures:{created:0,disposed:0,active:0,leaked:0},totalEvents:0};for(const t of this._sceneObservers.values()){const s=t.getLifecycleTracker().getSummary();e.geometries.created+=s.geometries.created,e.geometries.disposed+=s.geometries.disposed,e.geometries.active+=s.geometries.active,e.geometries.leaked+=s.geometries.leaked,e.materials.created+=s.materials.created,e.materials.disposed+=s.materials.disposed,e.materials.active+=s.materials.active,e.materials.leaked+=s.materials.leaked,e.textures.created+=s.textures.created,e.textures.disposed+=s.textures.disposed,e.textures.active+=s.textures.active,e.textures.leaked+=s.textures.leaked,e.totalEvents+=s.totalEvents,s.oldestActiveResource&&(!e.oldestActiveResource||s.oldestActiveResource.ageMs>e.oldestActiveResource.ageMs)&&(e.oldestActiveResource=s.oldestActiveResource)}return e}getPotentialResourceLeaks(){const e=[];for(const s of this._sceneObservers.values())e.push(...s.getLifecycleTracker().getPotentialLeaks());const t=new Set;return e.sort((s,r)=>r.ageMs-s.ageMs).filter(s=>t.has(s.uuid)?!1:(t.add(s.uuid),!0))}setResourceStackTraceCapture(e){for(const t of this._sceneObservers.values())t.getLifecycleTracker().setStackTraceCapture(e)}isResourceStackTraceCaptureEnabled(){for(const e of this._sceneObservers.values())return e.getLifecycleTracker().isStackTraceCaptureEnabled();return!1}clearResourceEvents(){for(const e of this._sceneObservers.values())e.getLifecycleTracker().clear()}onLeakAlert(e){const t=[];for(const s of this._sceneObservers.values())t.push(s.getLifecycleTracker().onAlert(e));return()=>{for(const s of t)s()}}runLeakDetection(){const e=[];for(const t of this._sceneObservers.values())e.push(...t.getLifecycleTracker().runLeakDetection());return e}getLeakAlerts(){const e=[];for(const t of this._sceneObservers.values())e.push(...t.getLifecycleTracker().getAlerts());return e.sort((t,s)=>s.timestamp-t.timestamp)}clearLeakAlerts(){for(const e of this._sceneObservers.values())e.getLifecycleTracker().clearAlerts()}getOrphanedResources(){const e=[];for(const s of this._sceneObservers.values())e.push(...s.getLifecycleTracker().getOrphanedResources());const t=new Set;return e.sort((s,r)=>r.ageMs-s.ageMs).filter(s=>t.has(s.uuid)?!1:(t.add(s.uuid),!0))}getEstimatedResourceMemory(){let e=0;for(const t of this._sceneObservers.values())e+=t.getLifecycleTracker().getEstimatedMemory();return e}getResourceMemoryHistory(){const e=[];for(const t of this._sceneObservers.values())e.push(...t.getLifecycleTracker().getMemoryHistory());return e.sort((t,s)=>t.timestamp-s.timestamp)}generateLeakReport(){for(const t of this._sceneObservers.values())return t.getLifecycleTracker().generateLeakReport();return{generatedAt:performance.now(),sessionDurationMs:0,summary:{totalAlerts:0,criticalAlerts:0,warningAlerts:0,infoAlerts:0,estimatedLeakedMemoryBytes:0},alerts:[],resourceStats:{geometries:{created:0,disposed:0,orphaned:0,leaked:0},materials:{created:0,disposed:0,orphaned:0,leaked:0},textures:{created:0,disposed:0,orphaned:0,leaked:0}},memoryHistory:[],recommendations:[]}}getConfigLoader(){return this._configLoader}onRuleViolation(e){return this._configLoader.onViolation(e)}checkRules(){const e=this.getLatestFrameStats();return e?this._configLoader.checkRules(e):[]}getRecentViolations(){return this._configLoader.getRecentViolations()}getViolationsBySeverity(e){return this._configLoader.getViolationsBySeverity(e)}getViolationSummary(){return this._configLoader.getViolationSummary()}clearViolations(){this._configLoader.clearViolations()}updateThresholds(e){this._configLoader.updateThresholds(e)}getThresholds(){return this._configLoader.getThresholds()}addCustomRule(e){this._configLoader.addCustomRule(e)}removeCustomRule(e){return this._configLoader.removeCustomRule(e)}setRuleCheckEnabled(e){this._ruleCheckEnabled=e}isRuleCheckEnabled(){return this._ruleCheckEnabled}setRuleCheckInterval(e){this._ruleCheckIntervalMs=Math.max(100,e)}setAdaptiveSamplingEnabled(e){this._adaptiveSamplingEnabled=e,e||(this._adaptiveSamplingRate=1),this.log("Adaptive sampling",{enabled:e})}isAdaptiveSamplingEnabled(){return this._adaptiveSamplingEnabled}getAdaptiveSamplingRate(){return this._adaptiveSamplingRate}updateSamplingConfig(e){this.config.sampling&&Object.assign(this.config.sampling,e),this._framesSinceLastSample=0,this._adaptiveSamplingRate=1,this.log("Sampling config updated",e)}getSamplingConfig(){return{frameStats:this.config.sampling?.frameStats??"every-frame",snapshots:this.config.sampling?.snapshots??"on-change",gpuTiming:this.config.sampling?.gpuTiming??!0,resourceTracking:this.config.sampling?.resourceTracking??!0}}requestFrameStatsSample(){return this.getLatestFrameStats()}generateConfigFile(){return this._configLoader.generateConfigFileContent()}exportConfig(){return this._configLoader.exportConfig()}getPoolManager(){return It()}getPoolStats(){try{return It().getAllStats()}catch{return{}}}clearPools(){try{It().clearAll(),this.log("Memory pools cleared")}catch{}}logPoolStats(){try{It().logStats()}catch{console.log("[3Lens] Memory pools not initialized")}}sendMessage(e){this._transport?.isConnected()&&this._transport.send(e)}generateId(){return Math.random().toString(36).substring(2,11)}log(e,t){this.config.debug&&console.log(`[3Lens] ${e}`,t??"")}}function yi(a,e=Fn){const t=[],s=[],r=1e3/e.targetFps,n=a.cpuTimeMs/r;let i;n<=1?i=100:n<=1.5?i=100-(n-1)*100:n<=2?i=50-(n-1.5)*60:i=Math.max(0,20-(n-2)*10),i<80&&(t.push(`Frame time ${a.cpuTimeMs.toFixed(1)}ms exceeds budget`),s.push("Reduce geometry complexity or draw calls"));const o=a.drawCalls/e.maxDrawCalls;let l;o<=.5?l=100:o<=1?l=100-(o-.5)*40:l=Math.max(0,80-(o-1)*40),l<80&&(t.push(`${a.drawCalls} draw calls is high`),s.push("Enable instancing or merge static geometries"));const c=a.triangles/e.maxTriangles;let d;c<=.5?d=100:c<=1?d=100-(c-.5)*40:d=Math.max(0,80-(c-1)*40),d<80&&(t.push(`${vi(a.triangles)} triangles is high`),s.push("Use LOD or reduce polygon count"));let h=100;if(a.memory){const f=a.memory.textureMemory/e.maxTextureMemory,y=a.memory.geometryMemory/e.maxGeometryMemory,b=Math.max(f,y);b<=.5?h=100:b<=1?h=100-(b-.5)*40:h=Math.max(0,80-(b-1)*40),h<80&&(t.push("High GPU memory usage"),s.push("Compress textures or reduce resolution"))}const p=a.drawCalls>0&&a.rendering?(a.rendering.programSwitches+a.rendering.textureBinds)/a.drawCalls:0;let u;p<=1?u=100:p<=2?u=100-(p-1)*30:u=Math.max(0,70-(p-2)*20),u<80&&(t.push("Excessive state changes"),s.push("Sort objects by material to reduce shader switches"));const m=i*e.weights.timing+l*e.weights.drawCalls+d*e.weights.geometry+h*e.weights.memory+u*e.weights.stateChanges;let g;return m>=90?g="A":m>=75?g="B":m>=60?g="C":m>=40?g="D":g="F",{overall:Math.round(m),breakdown:{timing:Math.round(i),drawCalls:Math.round(l),geometry:Math.round(d),memory:Math.round(h),stateChanges:Math.round(u)},grade:g,topIssues:t.slice(0,3),suggestions:s.slice(0,3)}}function vi(a){return a>=1e6?(a/1e6).toFixed(2)+"M":a>=1e3?(a/1e3).toFixed(1)+"K":a.toString()}function Dt(a,e=500){const t=new Map;return s=>{if(t.has(s))return t.get(s);const r=a(s);if(t.size>=e){const n=t.keys().next().value;t.delete(n)}return t.set(s,r),r}}const Y=Dt(a=>a>=1e6?(a/1e6).toFixed(1)+"M":a>=1e3?(a/1e3).toFixed(1)+"K":a.toString()),D=Dt(a=>a>=1073741824?(a/1073741824).toFixed(2)+" GB":a>=1048576?(a/1048576).toFixed(2)+" MB":a>=1024?(a/1024).toFixed(2)+" KB":a+" B"),mr=Dt(a=>{const e=a.toLowerCase();return e.includes("scene")?"scene":e.includes("mesh")?"mesh":e.includes("group")?"group":e.includes("light")?"light":e.includes("camera")?"camera":e.includes("bone")?"bone":"object"},100),gr=Dt(a=>{const e=a.toLowerCase();return e.includes("scene")?"S":e.includes("mesh")?"M":e.includes("group")?"G":e.includes("light")?"L":e.includes("camera")?"C":e.includes("bone")?"B":"O"},100),xi=`
/* ═══════════════════════════════════════════════════════════════
   3LENS THEME SYSTEM
   ═══════════════════════════════════════════════════════════════ */

/* Base Typography & Constants (theme-independent) */
:root {
  --3lens-font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
  --3lens-font-sans: 'Geist', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;

  --3lens-radius-sm: 4px;
  --3lens-radius-md: 6px;
  --3lens-radius-lg: 8px;
  --3lens-radius-xl: 12px;

  /* Object type colors (consistent across themes) */
  --3lens-color-scene: #34d399;
  --3lens-color-mesh: #60a5fa;
  --3lens-color-group: #a78bfa;
  --3lens-color-light: #fbbf24;
  --3lens-color-camera: #f472b6;
  --3lens-color-object: #9ca3af;
}

/* ─────────────────────────────────────────────────────────────────
   DARK THEME (Default)
   ───────────────────────────────────────────────────────────────── */
.three-lens-root,
.three-lens-root[data-theme="dark"] {
  --3lens-bg-primary: #0a0e14;
  --3lens-bg-secondary: #0f1419;
  --3lens-bg-tertiary: #151b23;
  --3lens-bg-elevated: #1a222c;
  --3lens-bg-hover: #1f2937;
  --3lens-bg-active: #2d3a4d;

  --3lens-border: #2d3748;
  --3lens-border-subtle: #1e2738;
  --3lens-border-focus: #3b82f6;

  --3lens-text-primary: #e4e7eb;
  --3lens-text-secondary: #9ca3af;
  --3lens-text-tertiary: #6b7280;
  --3lens-text-disabled: #4b5563;
  --3lens-text-inverse: #0a0e14;

  --3lens-accent: #22d3ee;
  --3lens-accent-hover: #06b6d4;
  --3lens-accent-blue: #60a5fa;
  --3lens-accent-cyan: #22d3ee;
  --3lens-accent-emerald: #34d399;
  --3lens-accent-amber: #fbbf24;
  --3lens-accent-rose: #fb7185;
  --3lens-accent-violet: #a78bfa;

  --3lens-success: #10b981;
  --3lens-success-bg: rgba(16, 185, 129, 0.15);
  --3lens-warning: #f59e0b;
  --3lens-warning-bg: rgba(245, 158, 11, 0.15);
  --3lens-error: #ef4444;
  --3lens-error-bg: rgba(239, 68, 68, 0.15);
  --3lens-info: #3b82f6;
  --3lens-info-bg: rgba(59, 130, 246, 0.15);

  --3lens-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --3lens-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
  --3lens-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);

  --3lens-overlay-bg: rgba(0, 0, 0, 0.5);
  --3lens-backdrop-blur: blur(8px);

  color-scheme: dark;
}

/* ─────────────────────────────────────────────────────────────────
   LIGHT THEME
   ───────────────────────────────────────────────────────────────── */
.three-lens-root[data-theme="light"] {
  --3lens-bg-primary: #ffffff;
  --3lens-bg-secondary: #f8fafc;
  --3lens-bg-tertiary: #f1f5f9;
  --3lens-bg-elevated: #ffffff;
  --3lens-bg-hover: #e2e8f0;
  --3lens-bg-active: #cbd5e1;

  --3lens-border: #e2e8f0;
  --3lens-border-subtle: #f1f5f9;
  --3lens-border-focus: #3b82f6;

  --3lens-text-primary: #0f172a;
  --3lens-text-secondary: #475569;
  --3lens-text-tertiary: #94a3b8;
  --3lens-text-disabled: #cbd5e1;
  --3lens-text-inverse: #ffffff;

  --3lens-accent: #0891b2;
  --3lens-accent-hover: #0e7490;
  --3lens-accent-blue: #3b82f6;
  --3lens-accent-cyan: #0891b2;
  --3lens-accent-emerald: #059669;
  --3lens-accent-amber: #d97706;
  --3lens-accent-rose: #e11d48;
  --3lens-accent-violet: #7c3aed;

  --3lens-success: #059669;
  --3lens-success-bg: rgba(5, 150, 105, 0.1);
  --3lens-warning: #d97706;
  --3lens-warning-bg: rgba(217, 119, 6, 0.1);
  --3lens-error: #dc2626;
  --3lens-error-bg: rgba(220, 38, 38, 0.1);
  --3lens-info: #2563eb;
  --3lens-info-bg: rgba(37, 99, 235, 0.1);

  --3lens-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
  --3lens-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
  --3lens-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);

  --3lens-overlay-bg: rgba(255, 255, 255, 0.8);
  --3lens-backdrop-blur: blur(8px);

  color-scheme: light;
}

/* ─────────────────────────────────────────────────────────────────
   HIGH CONTRAST THEME (Accessibility)
   ───────────────────────────────────────────────────────────────── */
.three-lens-root[data-theme="high-contrast"] {
  --3lens-bg-primary: #000000;
  --3lens-bg-secondary: #0a0a0a;
  --3lens-bg-tertiary: #141414;
  --3lens-bg-elevated: #1a1a1a;
  --3lens-bg-hover: #262626;
  --3lens-bg-active: #333333;

  --3lens-border: #ffffff;
  --3lens-border-subtle: #808080;
  --3lens-border-focus: #ffff00;

  --3lens-text-primary: #ffffff;
  --3lens-text-secondary: #e0e0e0;
  --3lens-text-tertiary: #b0b0b0;
  --3lens-text-disabled: #666666;
  --3lens-text-inverse: #000000;

  --3lens-accent: #00ffff;
  --3lens-accent-hover: #00cccc;
  --3lens-accent-blue: #00bfff;
  --3lens-accent-cyan: #00ffff;
  --3lens-accent-emerald: #00ff00;
  --3lens-accent-amber: #ffff00;
  --3lens-accent-rose: #ff00ff;
  --3lens-accent-violet: #ff00ff;

  --3lens-success: #00ff00;
  --3lens-success-bg: rgba(0, 255, 0, 0.2);
  --3lens-warning: #ffff00;
  --3lens-warning-bg: rgba(255, 255, 0, 0.2);
  --3lens-error: #ff0000;
  --3lens-error-bg: rgba(255, 0, 0, 0.2);
  --3lens-info: #00bfff;
  --3lens-info-bg: rgba(0, 191, 255, 0.2);

  --3lens-shadow-sm: 0 0 0 1px #ffffff;
  --3lens-shadow-md: 0 0 0 2px #ffffff;
  --3lens-shadow-lg: 0 0 0 3px #ffffff;

  --3lens-overlay-bg: rgba(0, 0, 0, 0.9);
  --3lens-backdrop-blur: none;

  color-scheme: dark;
}

/* Reset */
.three-lens-root,
.three-lens-root * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ═══════════════════════════════════════════════════════════════
   FLOATING ACTION BUTTON (FAB)
   ═══════════════════════════════════════════════════════════════ */

.three-lens-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  background: var(--3lens-bg-primary);
  border: 2px solid var(--3lens-border);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--3lens-text-primary);
  box-shadow: var(--3lens-shadow-md), 0 0 20px rgba(34, 211, 238, 0.3);
  z-index: 999998;
  transition: all 150ms ease;
  user-select: none;
}

.three-lens-fab svg {
  width: 28px;
  height: 28px;
}

.three-lens-fab:hover {
  transform: scale(1.1);
  border-color: var(--3lens-accent-cyan);
  box-shadow: var(--3lens-shadow-lg), 0 0 30px rgba(34, 211, 238, 0.4);
}

.three-lens-fab:active {
  transform: scale(0.95);
}

.three-lens-fab.active {
  background: var(--3lens-bg-elevated);
  border-color: var(--3lens-accent-cyan);
}

/* ═══════════════════════════════════════════════════════════════
   PANEL MENU (appears when FAB is clicked)
   ═══════════════════════════════════════════════════════════════ */

.three-lens-menu {
  position: fixed;
  bottom: 80px;
  right: 20px;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-lg);
  padding: 8px;
  min-width: 180px;
  box-shadow: var(--3lens-shadow-lg);
  z-index: 999999;
  opacity: 0;
  transform: translateY(10px) scale(0.95);
  pointer-events: none;
  transition: all 150ms ease;
}

.three-lens-menu.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.three-lens-menu-header {
  padding: 8px 12px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--3lens-text-tertiary);
  border-bottom: 1px solid var(--3lens-border-subtle);
  margin-bottom: 4px;
}

.three-lens-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-primary);
  font-family: var(--3lens-font-sans);
  font-size: 13px;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all 100ms ease;
}

.three-lens-menu-item:hover {
  background: var(--3lens-bg-hover);
}

.three-lens-menu-item.active {
  background: rgba(34, 211, 238, 0.1);
  color: var(--3lens-accent-cyan);
}

.three-lens-menu-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
}

.three-lens-menu-icon.scene { background: var(--3lens-color-scene); color: #000; }
.three-lens-menu-icon.stats { background: var(--3lens-accent-cyan); color: #000; }
.three-lens-menu-icon.inspector { background: var(--3lens-accent-blue); color: #000; }
.three-lens-menu-icon.textures { background: var(--3lens-accent-amber); color: #000; }
.three-lens-menu-icon.materials { background: var(--3lens-accent-violet); color: #000; }

/* ═══════════════════════════════════════════════════════════════
   FLOATING PANELS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-panel {
  position: fixed;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-lg);
  box-shadow: var(--3lens-shadow-lg);
  z-index: 999997;
  min-width: 280px;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  font-family: var(--3lens-font-sans);
  font-size: 13px;
  color: var(--3lens-text-primary);
  overflow: hidden;
  transition: box-shadow 150ms ease;
}

/* Disable transitions during resize */
.three-lens-panel.resizing {
  transition: none !important;
}

/* Smooth width animation only when not resizing */
.three-lens-panel:not(.resizing) {
  transition: box-shadow 150ms ease, width 150ms ease, min-width 150ms ease;
}

.three-lens-panel:hover {
  box-shadow: var(--3lens-shadow-lg), 0 0 0 1px var(--3lens-border-focus);
}

.three-lens-panel.focused {
  z-index: 999998;
  box-shadow: var(--3lens-shadow-lg), 0 0 0 2px var(--3lens-accent-cyan);
}

.three-lens-panel.minimized {
  min-height: auto;
  height: auto !important;
}

.three-lens-panel.minimized .three-lens-panel-content {
  display: none;
}

.three-lens-panel.minimized .three-lens-panel-resize {
  display: none;
}

/* Panel Header (Draggable) */
.three-lens-panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: linear-gradient(180deg, var(--3lens-bg-secondary), var(--3lens-bg-primary));
  border-bottom: 1px solid var(--3lens-border);
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
}

.three-lens-panel-header:active {
  cursor: grabbing;
}

.three-lens-panel-icon {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.three-lens-panel-title {
  font-weight: 600;
  font-size: 12px;
  color: var(--3lens-text-primary);
  white-space: nowrap;
}

/* When no search bar, title pushes controls right */
.three-lens-panel-header:not(:has(.three-lens-header-search)) .three-lens-panel-title {
  flex: 1;
}

.three-lens-header-search {
  flex: 1;
  margin: 0 12px;
  min-width: 120px;
}

.header-search-input {
  width: 100%;
  padding: 5px 10px;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-primary);
  font-size: 11px;
  font-family: var(--3lens-font-sans);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.header-search-input:focus {
  border-color: var(--3lens-accent-blue);
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.15);
}

.header-search-input::placeholder {
  color: var(--3lens-text-tertiary);
}

.three-lens-panel-controls {
  display: flex;
  gap: 4px;
}

.three-lens-panel-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: var(--3lens-radius-sm);
  background: transparent;
  color: var(--3lens-text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 100ms ease;
}

.three-lens-panel-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

.three-lens-panel-btn.close:hover {
  background: var(--3lens-error);
  color: white;
}

/* Panel Content */
.three-lens-panel-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

.three-lens-panel-content::-webkit-scrollbar {
  width: 6px;
}

.three-lens-panel-content::-webkit-scrollbar-track {
  background: transparent;
}

.three-lens-panel-content::-webkit-scrollbar-thumb {
  background: var(--3lens-border);
  border-radius: 3px;
}

/* Panel Resize Handle */
.three-lens-panel-resize {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
  opacity: 0.5;
  transition: opacity 100ms ease;
}

.three-lens-panel-resize:hover {
  opacity: 1;
}

.three-lens-panel-resize::after {
  content: '';
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  border-right: 2px solid var(--3lens-text-tertiary);
  border-bottom: 2px solid var(--3lens-text-tertiary);
}

/* ═══════════════════════════════════════════════════════════════
   STATS PANEL CONTENT
   ═══════════════════════════════════════════════════════════════ */

.three-lens-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}

.three-lens-stat-card {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  padding: 6px 8px;
}

.three-lens-stat-label {
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 2px;
}

.three-lens-stat-value {
  font-size: 14px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
  line-height: 1;
}

.three-lens-stat-value.warning { color: var(--3lens-warning); }
.three-lens-stat-value.error { color: var(--3lens-error); }

.three-lens-stat-unit {
  font-size: 9px;
  color: var(--3lens-text-secondary);
}

/* Chart */
.three-lens-chart {
  margin-top: 8px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
}

.three-lens-chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  gap: 6px;
}

.three-lens-chart-title {
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
}

.three-lens-chart-controls {
  display: flex;
  align-items: center;
  gap: 3px;
  flex: 1;
  justify-content: center;
}

.three-lens-chart-btn {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-tertiary);
  cursor: pointer;
  font-size: 10px;
  transition: all 100ms ease;
}

.three-lens-chart-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
  border-color: var(--3lens-accent-blue);
}

.three-lens-chart-btn:active {
  transform: scale(0.95);
}

.three-lens-chart-zoom-label {
  font-size: 9px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
  min-width: 24px;
  text-align: center;
}

.three-lens-chart-value {
  font-family: var(--3lens-font-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--3lens-accent-emerald);
}

.three-lens-chart-container {
  position: relative;
  cursor: grab;
}

.three-lens-chart-container:active {
  cursor: grabbing;
}

.three-lens-chart-canvas {
  width: 100%;
  height: 60px;
  background: var(--3lens-bg-primary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-chart-tooltip {
  position: absolute;
  background: var(--3lens-bg-elevated);
  border: 1px solid var(--3lens-border-focus);
  border-radius: var(--3lens-radius-sm);
  padding: 6px 10px;
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  pointer-events: none;
  z-index: 10;
  box-shadow: var(--3lens-shadow-md);
}

.three-lens-tooltip-time {
  color: var(--3lens-accent-cyan);
  font-weight: 600;
}

.three-lens-tooltip-fps {
  color: var(--3lens-text-secondary);
  font-size: 9px;
  margin-top: 2px;
}

.three-lens-chart-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-chart-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.three-lens-chart-stat-label {
  font-size: 7px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-disabled);
}

.three-lens-chart-stat-value {
  font-size: 9px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

.three-lens-chart-stat-value.warning {
  color: var(--3lens-warning);
}

/* ═══════════════════════════════════════════════════════════════
   SCENE SPLIT VIEW (Tree + Inspector integrated)
   ═══════════════════════════════════════════════════════════════ */

.three-lens-split-view {
  display: flex;
  gap: 0;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.three-lens-tree-pane {
  flex: 1;
  min-width: 180px;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid var(--3lens-border);
  padding: 8px;
}

.three-lens-tree-pane::-webkit-scrollbar {
  width: 6px;
}

.three-lens-tree-pane::-webkit-scrollbar-track {
  background: transparent;
}

.three-lens-tree-pane::-webkit-scrollbar-thumb {
  background: var(--3lens-border);
  border-radius: 3px;
}

.three-lens-inspector-pane {
  width: 240px;
  min-width: 200px;
  max-width: 300px;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--3lens-bg-secondary);
  padding: 12px;
}

.three-lens-inspector-pane::-webkit-scrollbar {
  width: 6px;
}

.three-lens-inspector-pane::-webkit-scrollbar-track {
  background: transparent;
}

.three-lens-inspector-pane::-webkit-scrollbar-thumb {
  background: var(--3lens-border);
  border-radius: 3px;
}

/* No Selection State */
.three-lens-no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 24px;
}

.three-lens-no-selection-icon {
  font-size: 28px;
  margin-bottom: 8px;
  opacity: 0.6;
}

.three-lens-no-selection-text {
  font-size: 11px;
  line-height: 1.4;
}

/* Remove padding from panel content for split view and full tree */
.three-lens-panel-content:has(.three-lens-split-view),
.three-lens-panel-content:has(.three-lens-tree-full),
.three-lens-panel-content:has(.panel-split-view),
.three-lens-panel-content:has(.panel-empty-state) {
  padding: 0;
}

/* Auto-height scene panel */
.three-lens-panel:has(.three-lens-tree-full),
.three-lens-panel:has(.three-lens-split-view) {
  height: auto;
  max-height: 80vh;
}

/* Ensure panel content constrains height for scrolling */
.three-lens-panel:has(.three-lens-split-view) .three-lens-panel-content {
  max-height: calc(80vh - 50px);
  overflow: hidden;
}

/* Full width tree (no selection) */
.three-lens-tree-full {
  overflow: auto;
  padding: 8px;
  height: 100%;
}

.three-lens-tree-full::-webkit-scrollbar {
  width: 6px;
}

.three-lens-tree-full::-webkit-scrollbar-track {
  background: transparent;
}

.three-lens-tree-full::-webkit-scrollbar-thumb {
  background: var(--3lens-border);
  border-radius: 3px;
}

/* ═══════════════════════════════════════════════════════════════
   SCENE TREE
   ═══════════════════════════════════════════════════════════════ */

.three-lens-scene-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--3lens-border-subtle);
}

.three-lens-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 11px;
  color: var(--3lens-text-secondary);
  user-select: none;
}

.three-lens-toggle input {
  display: none;
}

.three-lens-toggle-slider {
  position: relative;
  width: 32px;
  height: 18px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: 9px;
  transition: all 150ms ease;
}

.three-lens-toggle-slider::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  background: var(--3lens-text-tertiary);
  border-radius: 50%;
  transition: all 150ms ease;
}

.three-lens-toggle input:checked + .three-lens-toggle-slider {
  background: var(--3lens-accent-cyan);
  border-color: var(--3lens-accent-cyan);
}

.three-lens-toggle input:checked + .three-lens-toggle-slider::after {
  left: 16px;
  background: var(--3lens-bg-primary);
}

.three-lens-toggle-label {
  font-weight: 500;
}

.three-lens-toggle:hover .three-lens-toggle-slider {
  border-color: var(--3lens-accent-blue);
}

.three-lens-tree {
  font-size: 12px;
}

.three-lens-node {
  user-select: none;
}

.three-lens-node-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border-radius: var(--3lens-radius-sm);
  cursor: pointer;
  transition: background 100ms ease;
}

.three-lens-node-header:hover {
  background: var(--3lens-bg-hover);
}

.three-lens-node-header.selected {
  background: rgba(96, 165, 250, 0.25);
  outline: 1px solid var(--3lens-accent-blue);
  box-shadow: inset 3px 0 0 var(--3lens-accent-cyan);
}

.three-lens-node-header.selected .three-lens-node-name {
  color: var(--3lens-accent-cyan);
  font-weight: 600;
}

.three-lens-node-header.selected .three-lens-node-type {
  color: var(--3lens-accent-blue);
}

.three-lens-node-toggle {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--3lens-text-tertiary);
  flex-shrink: 0;
}

.three-lens-node-toggle.expanded svg {
  transform: rotate(90deg);
}

.three-lens-node-toggle.hidden {
  visibility: hidden;
}

.three-lens-node-icon {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 600;
  flex-shrink: 0;
}

.three-lens-node-icon.mesh { background: var(--3lens-color-mesh); color: #000; }
.three-lens-node-icon.scene { background: var(--3lens-color-scene); color: #000; }
.three-lens-node-icon.group { background: var(--3lens-color-group); color: #000; }
.three-lens-node-icon.light { background: var(--3lens-color-light); color: #000; }
.three-lens-node-icon.camera { background: var(--3lens-color-camera); color: #000; }
.three-lens-node-icon.object { background: var(--3lens-text-tertiary); color: #000; }

.three-lens-node-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 1;
  min-width: 20px;
}

.three-lens-node-name.unnamed {
  font-style: italic;
  color: var(--3lens-text-tertiary);
}

.three-lens-visibility-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  margin-left: 4px;
  background: transparent;
  border: none;
  border-radius: 3px;
  color: var(--3lens-text-tertiary);
  cursor: pointer;
  opacity: 0;
  transition: all 100ms ease;
  flex-shrink: 0;
}

.three-lens-node-spacer {
  flex: 1;
  min-width: 8px;
}

.three-lens-node-type {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  font-family: var(--3lens-font-mono);
  flex-shrink: 0;
}

.three-lens-node-header:hover .three-lens-visibility-btn {
  opacity: 1;
}

.three-lens-visibility-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

.three-lens-visibility-btn.visible {
  color: var(--3lens-accent-cyan);
}

.three-lens-visibility-btn.hidden {
  color: var(--3lens-text-disabled);
  opacity: 1;
}

.three-lens-node-header.hidden-object {
  opacity: 0.5;
}

.three-lens-node-header.hidden-object .three-lens-node-name {
  text-decoration: line-through;
  color: var(--3lens-text-disabled);
}

.three-lens-node-children {
  margin-left: 14px;
  border-left: 1px solid var(--3lens-border-subtle);
  padding-left: 4px;
}

/* ═══════════════════════════════════════════════════════════════
   COST HEATMAP COLORS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-node-header.cost-low {
  border-left: 2px solid var(--3lens-accent-green);
}

.three-lens-node-header.cost-medium {
  border-left: 2px solid var(--3lens-accent-yellow);
}

.three-lens-node-header.cost-high {
  border-left: 2px solid var(--3lens-accent-orange);
}

.three-lens-node-header.cost-critical {
  border-left: 2px solid var(--3lens-accent-red);
  background: rgba(239, 68, 68, 0.1);
}

.three-lens-cost-indicator {
  font-size: 8px;
  margin-left: 2px;
  flex-shrink: 0;
}

.three-lens-cost-indicator.cost-low { color: var(--3lens-accent-green); }
.three-lens-cost-indicator.cost-medium { color: var(--3lens-accent-yellow); }
.three-lens-cost-indicator.cost-high { color: var(--3lens-accent-orange); }
.three-lens-cost-indicator.cost-critical { color: var(--3lens-accent-red); }

/* ═══════════════════════════════════════════════════════════════
   COST ANALYSIS SECTION
   ═══════════════════════════════════════════════════════════════ */

.three-lens-cost-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  margin-bottom: 6px;
}

.three-lens-cost-level {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 3px;
  text-transform: uppercase;
}

.three-lens-cost-level.cost-low {
  background: rgba(34, 197, 94, 0.2);
  color: var(--3lens-accent-green);
}

.three-lens-cost-level.cost-medium {
  background: rgba(234, 179, 8, 0.2);
  color: var(--3lens-accent-yellow);
}

.three-lens-cost-level.cost-high {
  background: rgba(249, 115, 22, 0.2);
  color: var(--3lens-accent-orange);
}

.three-lens-cost-level.cost-critical {
  background: rgba(239, 68, 68, 0.2);
  color: var(--3lens-accent-red);
}

.three-lens-cost-score {
  font-size: 11px;
  font-weight: 600;
  color: var(--3lens-text-secondary);
}

.three-lens-cost-breakdown {
  margin-bottom: 8px;
}

.three-lens-cost-bar {
  display: flex;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  background: var(--3lens-bg-tertiary);
  margin-bottom: 4px;
}

.three-lens-cost-bar-segment {
  height: 100%;
  min-width: 1px;
  transition: width 200ms ease;
}

.three-lens-cost-bar-segment.triangles { background: #60a5fa; }
.three-lens-cost-bar-segment.material { background: #a78bfa; }
.three-lens-cost-bar-segment.textures { background: #34d399; }
.three-lens-cost-bar-segment.shadows { background: #fbbf24; }

.three-lens-cost-legend {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.three-lens-cost-legend-item {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
}

.three-lens-cost-legend-item.triangles { color: #60a5fa; }
.three-lens-cost-legend-item.material { color: #a78bfa; }
.three-lens-cost-legend-item.textures { color: #34d399; }
.three-lens-cost-legend-item.shadows { color: #fbbf24; }

.three-lens-cost-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;
}

.three-lens-cost-row {
  display: flex;
  align-items: center;
  font-size: 10px;
  padding: 2px 0;
}

.three-lens-cost-row-label {
  width: 60px;
  color: var(--3lens-text-secondary);
}

.three-lens-cost-row-value {
  width: 40px;
  color: var(--3lens-text-primary);
  font-weight: 500;
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-cost-row-detail {
  color: var(--3lens-text-tertiary);
  font-size: 9px;
}

/* Material Details */
.three-lens-material-details {
  border-top: 1px solid var(--3lens-border-subtle);
  padding-top: 6px;
  margin-top: 4px;
}

.three-lens-material-details-header {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.three-lens-material-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
  font-size: 10px;
}

.three-lens-material-type {
  color: var(--3lens-text-secondary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.three-lens-material-score {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: var(--3lens-text-tertiary);
}

.three-lens-material-features {
  display: flex;
  gap: 3px;
}

.three-lens-mat-feature {
  font-size: 8px;
  padding: 1px 3px;
  background: var(--3lens-bg-tertiary);
  border-radius: 2px;
  color: var(--3lens-text-tertiary);
}

/* ═══════════════════════════════════════════════════════════════
   COST RANKING (Global Tools)
   ═══════════════════════════════════════════════════════════════ */

.three-lens-cost-summary {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.three-lens-cost-summary-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px;
  background: var(--3lens-bg-tertiary);
  border-radius: 4px;
}

.three-lens-cost-summary-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-cost-summary-label {
  font-size: 8px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
}

.three-lens-cost-warning {
  display: flex;
  gap: 8px;
  padding: 4px 6px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 10px;
}

.three-lens-cost-warning .cost-critical {
  color: var(--3lens-accent-red);
}

.three-lens-cost-warning .cost-high {
  color: var(--3lens-accent-orange);
}

.three-lens-cost-ranking-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.three-lens-cost-ranking-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  background: var(--3lens-bg-tertiary);
  border-radius: 4px;
  cursor: pointer;
  transition: background 100ms ease;
}

.three-lens-cost-ranking-item:hover {
  background: var(--3lens-bg-hover);
}

.three-lens-cost-rank {
  font-size: 9px;
  font-weight: 600;
  color: var(--3lens-text-tertiary);
  width: 18px;
}

.three-lens-cost-ranking-name {
  flex: 1;
  font-size: 10px;
  color: var(--3lens-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.three-lens-cost-ranking-triangles {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-cost-ranking-score {
  font-size: 10px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  padding: 1px 4px;
  border-radius: 3px;
}

.three-lens-cost-ranking-score.cost-low {
  color: var(--3lens-accent-green);
  background: rgba(34, 197, 94, 0.15);
}

.three-lens-cost-ranking-score.cost-medium {
  color: var(--3lens-accent-yellow);
  background: rgba(234, 179, 8, 0.15);
}

.three-lens-cost-ranking-score.cost-high {
  color: var(--3lens-accent-orange);
  background: rgba(249, 115, 22, 0.15);
}

.three-lens-cost-ranking-score.cost-critical {
  color: var(--3lens-accent-red);
  background: rgba(239, 68, 68, 0.15);
}

.three-lens-cost-more {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 4px 0;
}

/* ═══════════════════════════════════════════════════════════════
   INSPECTOR PANEL
   ═══════════════════════════════════════════════════════════════ */

.three-lens-inspector-empty {
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 24px;
  font-size: 12px;
}

.three-lens-section {
  display: block;
  margin-bottom: 12px;
}

.three-lens-section-header {
  display: block;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
  padding-bottom: 6px;
  border-bottom: 1px solid var(--3lens-border-subtle);
  margin-bottom: 8px;
}

/* Visual Overlays Toggle Styles */
.three-lens-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 11px;
}

.three-lens-toggle-row.global {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-toggle-label {
  color: var(--3lens-text-secondary);
}

.three-lens-toggle-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: none;
}

.three-lens-toggle-track {
  display: flex;
  align-items: center;
  width: 32px;
  height: 18px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: 9px;
  padding: 2px;
  transition: all 0.2s ease;
}

.three-lens-toggle-thumb {
  width: 12px;
  height: 12px;
  background: var(--3lens-text-tertiary);
  border-radius: 50%;
  transition: all 0.2s ease;
}

.three-lens-toggle-btn:hover .three-lens-toggle-track {
  border-color: var(--3lens-accent-cyan);
}

.three-lens-toggle-btn.active .three-lens-toggle-track {
  background: var(--3lens-accent-cyan);
  border-color: var(--3lens-accent-cyan);
}

.three-lens-toggle-btn.active .three-lens-toggle-thumb {
  background: var(--3lens-bg-primary);
  transform: translateX(14px);
}

.three-lens-overlay-note {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  font-style: italic;
  padding: 4px 0;
}

/* Global Tools Panel */
.three-lens-global-tools {
  padding: 0;
}

.three-lens-global-tools-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 10px;
  background: linear-gradient(135deg, var(--3lens-accent-cyan-dim) 0%, var(--3lens-bg-hover) 100%);
  border-bottom: 1px solid var(--3lens-border);
  font-size: 12px;
  font-weight: 600;
  color: var(--3lens-accent-cyan);
}

.three-lens-global-icon {
  font-size: 14px;
}

/* Sections inside global tools - cleaner look */
.three-lens-global-tools .three-lens-section {
  padding: 10px;
  margin-bottom: 0;
  border-bottom: 1px solid var(--3lens-border-subtle);
}

.three-lens-global-tools .three-lens-section:last-child {
  border-bottom: none;
}

.three-lens-global-tools .three-lens-section-header {
  border-bottom: none;
  padding-bottom: 8px;
  margin-bottom: 0;
}

.three-lens-global-hint {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  line-height: 1.4;
  padding: 4px 0;
}

.three-lens-camera-info {
  margin-bottom: 10px;
}

.three-lens-property-row.compact {
  padding: 3px 0;
}

.three-lens-property-row.compact .three-lens-property-name {
  width: 55px;
  min-width: 55px;
}

.three-lens-property-row.compact .three-lens-property-value {
  font-size: 10px;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.three-lens-camera-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* Transform Gizmo Styles */
.three-lens-transform-modes {
  margin: 8px 0;
}

.three-lens-transform-modes.disabled,
.three-lens-transform-options.disabled,
.three-lens-undo-redo.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.three-lens-mode-label {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  margin-bottom: 6px;
}

.three-lens-mode-buttons {
  display: flex;
  gap: 4px;
}

.three-lens-mode-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 28px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.three-lens-mode-btn:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-accent-cyan);
  color: var(--3lens-text-primary);
}

.three-lens-mode-btn.active {
  background: var(--3lens-accent-cyan);
  border-color: var(--3lens-accent-cyan);
  color: var(--3lens-bg-primary);
}

.three-lens-transform-options {
  margin: 8px 0;
}

.three-lens-option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 11px;
}

.three-lens-option-label {
  color: var(--3lens-text-secondary);
}

.three-lens-space-btn {
  padding: 4px 10px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-primary);
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  cursor: pointer;
  transition: all 0.15s ease;
  min-width: 50px;
  text-align: center;
}

.three-lens-space-btn:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-accent-cyan);
}

.three-lens-undo-redo {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-undo-btn,
.three-lens-redo-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  padding: 6px 8px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-secondary);
  font-size: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  justify-content: center;
}

.three-lens-undo-btn:hover:not(.disabled),
.three-lens-redo-btn:hover:not(.disabled) {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-accent-cyan);
  color: var(--3lens-text-primary);
}

.three-lens-undo-btn.disabled,
.three-lens-redo-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Camera Controls Styles */
.three-lens-camera-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.three-lens-action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  padding: 8px 12px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-md);
  color: var(--3lens-text-secondary);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
  justify-content: center;
}

.three-lens-action-btn:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-accent-cyan);
  color: var(--3lens-text-primary);
}

.three-lens-action-btn.stop {
  background: var(--3lens-error);
  border-color: var(--3lens-error);
  color: white;
}

.three-lens-action-btn.stop:hover {
  background: #dc2626;
  border-color: #dc2626;
}

.three-lens-action-btn.home {
  background: var(--3lens-accent-emerald);
  border-color: var(--3lens-accent-emerald);
  color: var(--3lens-bg-primary);
}

.three-lens-action-btn.home:hover {
  background: #2dd4bf;
  border-color: #2dd4bf;
}

.three-lens-camera-info {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
  margin-bottom: 12px;
}

.three-lens-camera-info-title {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.three-lens-camera-info-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.three-lens-camera-info-row {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
}

.three-lens-camera-info-label {
  color: var(--3lens-text-tertiary);
}

.three-lens-camera-info-value {
  color: var(--3lens-text-primary);
  font-family: var(--3lens-font-mono);
}

.three-lens-camera-switcher {
  margin-top: 8px;
}

.three-lens-camera-switcher-title {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.three-lens-camera-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.three-lens-camera-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-secondary);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.three-lens-camera-item:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-border);
}

.three-lens-camera-item.active {
  background: var(--3lens-accent-cyan);
  border-color: var(--3lens-accent-cyan);
  color: var(--3lens-bg-primary);
}

.three-lens-camera-item-icon {
  font-size: 12px;
}

.three-lens-camera-item-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.three-lens-property-row {
  display: flex;
  align-items: center;
  padding: 5px 0;
  font-size: 11px;
}

.three-lens-property-name {
  width: 95px;
  min-width: 95px;
  color: var(--3lens-text-tertiary);
  flex-shrink: 0;
}

.three-lens-property-value {
  flex: 1;
  color: var(--3lens-text-primary);
  font-family: var(--3lens-font-mono);
  font-size: 11px;
}

.three-lens-vector-inputs {
  display: flex;
  gap: 4px;
  flex: 1;
}

.three-lens-vector-input {
  flex: 1;
  min-width: 0;
}

.three-lens-vector-input input {
  width: 100%;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  padding: 4px 6px;
  color: var(--3lens-text-primary);
  font-family: var(--3lens-font-mono);
  font-size: 10px;
  text-align: center;
  outline: none;
}

.three-lens-vector-input input:focus {
  border-color: var(--3lens-border-focus);
}

.three-lens-vector-label {
  font-size: 8px;
  color: var(--3lens-text-disabled);
  text-align: center;
  margin-top: 2px;
}

/* ═══════════════════════════════════════════════════════════════
   BENCHMARK SCORE
   ═══════════════════════════════════════════════════════════════ */

.three-lens-benchmark {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-benchmark-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.three-lens-benchmark-score {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.three-lens-benchmark-value {
  font-size: 28px;
  font-weight: 700;
  font-family: var(--3lens-font-mono);
}

.three-lens-benchmark-value.grade-A { color: var(--3lens-success); }
.three-lens-benchmark-value.grade-B { color: var(--3lens-accent-emerald); }
.three-lens-benchmark-value.grade-C { color: var(--3lens-warning); }
.three-lens-benchmark-value.grade-D { color: var(--3lens-accent-amber); }
.three-lens-benchmark-value.grade-F { color: var(--3lens-error); }

.three-lens-benchmark-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
}

.three-lens-benchmark-grade {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  font-family: var(--3lens-font-mono);
}

.three-lens-benchmark-grade.A { background: var(--3lens-success); color: #000; }
.three-lens-benchmark-grade.B { background: var(--3lens-accent-emerald); color: #000; }
.three-lens-benchmark-grade.C { background: var(--3lens-warning); color: #000; }
.three-lens-benchmark-grade.D { background: var(--3lens-accent-amber); color: #000; }
.three-lens-benchmark-grade.F { background: var(--3lens-error); color: #fff; }

.three-lens-benchmark-bars {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.three-lens-benchmark-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.three-lens-benchmark-bar-label {
  width: 80px;
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
}

.three-lens-benchmark-bar-track {
  flex: 1;
  height: 6px;
  background: var(--3lens-bg-primary);
  border-radius: 3px;
  overflow: hidden;
}

.three-lens-benchmark-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 300ms ease;
}

.three-lens-benchmark-bar-fill.good { background: var(--3lens-success); }
.three-lens-benchmark-bar-fill.ok { background: var(--3lens-warning); }
.three-lens-benchmark-bar-fill.bad { background: var(--3lens-error); }

.three-lens-benchmark-bar-value {
  width: 30px;
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  text-align: right;
  color: var(--3lens-text-secondary);
}

/* ═══════════════════════════════════════════════════════════════
   TABS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-tabs {
  display: flex;
  gap: 1px;
  margin-bottom: 8px;
  background: var(--3lens-bg-secondary);
  padding: 2px;
  border-radius: var(--3lens-radius-sm);
}

.three-lens-tab {
  flex: 1;
  padding: 4px 6px;
  background: transparent;
  border: none;
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-tertiary);
  font-size: 9px;
  font-family: var(--3lens-font-sans);
  cursor: pointer;
  transition: all 100ms ease;
}

.three-lens-tab:hover {
  color: var(--3lens-text-secondary);
  background: var(--3lens-bg-hover);
}

.three-lens-tab.active {
  background: var(--3lens-accent-cyan);
  color: var(--3lens-bg-primary);
  font-weight: 600;
}

/* ═══════════════════════════════════════════════════════════════
   MEMORY STATS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-memory-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.three-lens-memory-item {
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  padding: 10px;
}

.three-lens-memory-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 4px;
}

.three-lens-memory-value {
  font-size: 14px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-violet);
}

/* ═══════════════════════════════════════════════════════════════
   DETAILED METRICS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-metrics-section {
  margin-bottom: 16px;
}

.three-lens-metrics-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.three-lens-metrics-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--3lens-border-subtle);
}

.three-lens-metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.three-lens-metric {
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
  text-align: center;
}

.three-lens-metric-value {
  font-size: 16px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
  line-height: 1.2;
}

.three-lens-metric-label {
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-disabled);
  margin-top: 2px;
}

/* ═══════════════════════════════════════════════════════════════
   ISSUES LIST
   ═══════════════════════════════════════════════════════════════ */

.three-lens-issues {
  margin-top: 12px;
}

.three-lens-issue {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--3lens-radius-sm);
  margin-bottom: 6px;
  font-size: 11px;
}

.three-lens-issue.warning {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.2);
}

.three-lens-issue-icon {
  flex-shrink: 0;
  font-size: 12px;
}

.three-lens-issue-text {
  flex: 1;
  color: var(--3lens-text-secondary);
  line-height: 1.4;
}

.three-lens-suggestion {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: var(--3lens-radius-sm);
  margin-bottom: 6px;
  font-size: 11px;
}

.three-lens-suggestion-text {
  flex: 1;
  color: var(--3lens-accent-emerald);
  line-height: 1.4;
}

/* ═══════════════════════════════════════════════════════════════
   PERCENTILE STATS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-percentiles {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-percentile {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
}

.three-lens-percentile-label {
  color: var(--3lens-text-disabled);
}

.three-lens-percentile-value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════════════════════ */

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.three-lens-panel {
  animation: fadeIn 150ms ease;
}

.three-lens-stat-value.warning {
  animation: pulse 1s ease-in-out infinite;
}

/* ═══════════════════════════════════════════════════════════════
   MEMORY PROFILER
   ═══════════════════════════════════════════════════════════════ */

.three-lens-memory-profiler {
  padding: 12px;
}

/* Memory Header */
.three-lens-memory-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--3lens-border-subtle);
}

.three-lens-memory-total {
  text-align: left;
}

.three-lens-memory-total-value {
  font-size: 28px;
  font-weight: 700;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
  line-height: 1;
}

.three-lens-memory-total-value.warning {
  color: var(--3lens-warning);
}

.three-lens-memory-total-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-top: 4px;
}

.three-lens-memory-trend {
  font-size: 11px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: var(--3lens-radius-sm);
}

.three-lens-memory-trend.stable {
  color: var(--3lens-text-secondary);
  background: var(--3lens-bg-tertiary);
}

.three-lens-memory-trend.rising {
  color: var(--3lens-warning);
  background: rgba(245, 158, 11, 0.15);
}

.three-lens-memory-trend.falling {
  color: var(--3lens-accent-emerald);
  background: rgba(52, 211, 153, 0.15);
}

/* Memory Breakdown */
.three-lens-memory-breakdown {
  margin-bottom: 16px;
}

.three-lens-memory-breakdown-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 8px;
}

.three-lens-memory-bar {
  height: 12px;
  background: var(--3lens-bg-tertiary);
  border-radius: 6px;
  display: flex;
  overflow: hidden;
  margin-bottom: 8px;
}

.three-lens-memory-bar-segment {
  height: 100%;
  min-width: 2px;
  transition: width 300ms ease;
}

.three-lens-memory-bar-segment.texture {
  background: linear-gradient(90deg, #60a5fa, #3b82f6);
}

.three-lens-memory-bar-segment.geometry {
  background: linear-gradient(90deg, #34d399, #10b981);
}

.three-lens-memory-bar-segment.render-target {
  background: linear-gradient(90deg, #a78bfa, #8b5cf6);
}

/* Memory Legend */
.three-lens-memory-legend {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.three-lens-memory-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.three-lens-memory-legend-color {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}

.three-lens-memory-legend-color.texture {
  background: #60a5fa;
}

.three-lens-memory-legend-color.geometry {
  background: #34d399;
}

.three-lens-memory-legend-color.render-target {
  background: #a78bfa;
}

.three-lens-memory-legend-label {
  flex: 1;
  color: var(--3lens-text-secondary);
}

.three-lens-memory-legend-value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-primary);
  font-weight: 500;
}

.three-lens-memory-legend-value.warning {
  color: var(--3lens-warning);
}

/* Memory History Chart */
.three-lens-memory-chart {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 10px;
  margin-bottom: 16px;
}

.three-lens-memory-chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.three-lens-memory-chart-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-memory-chart-max {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

.three-lens-memory-chart-empty {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: var(--3lens-text-disabled);
}

.three-lens-memory-chart-svg {
  width: 100%;
  height: 48px;
}

.three-lens-memory-chart-area {
  opacity: 0.8;
}

.three-lens-memory-chart-line {
  stroke-linecap: round;
  stroke-linejoin: round;
}

.three-lens-memory-chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 9px;
  color: var(--3lens-text-disabled);
}

/* JS Heap Bar */
.three-lens-heap-container {
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  padding: 10px;
}

.three-lens-heap-bar {
  height: 8px;
  background: var(--3lens-bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.three-lens-heap-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--3lens-accent-cyan), var(--3lens-accent-blue));
  border-radius: 4px;
  transition: width 300ms ease;
}

.three-lens-heap-bar-fill.warning {
  background: linear-gradient(90deg, var(--3lens-warning), var(--3lens-error));
}

.three-lens-heap-stats {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}

.three-lens-heap-used {
  font-family: var(--3lens-font-mono);
  font-weight: 600;
  color: var(--3lens-accent-cyan);
}

.three-lens-heap-used.warning {
  color: var(--3lens-warning);
}

.three-lens-heap-separator {
  color: var(--3lens-text-disabled);
}

.three-lens-heap-limit {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

.three-lens-heap-percent {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
  margin-left: 4px;
}

.three-lens-heap-percent.warning {
  color: var(--3lens-warning);
}

/* Memory Warnings */
.three-lens-memory-warnings {
  margin-top: 12px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: var(--3lens-radius-md);
  padding: 10px;
}

.three-lens-memory-warnings-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-warning);
  margin-bottom: 8px;
  font-weight: 600;
}

.three-lens-memory-warning {
  font-size: 11px;
  color: var(--3lens-text-secondary);
  line-height: 1.5;
  padding: 4px 0;
  border-bottom: 1px solid rgba(245, 158, 11, 0.1);
}

.three-lens-memory-warning:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

/* ═══════════════════════════════════════════════════════════════
   FPS HISTOGRAM
   ═══════════════════════════════════════════════════════════════ */

.three-lens-histogram {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-top: 12px;
}

.three-lens-histogram-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-histogram-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-histogram-total {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

.three-lens-histogram-empty {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: var(--3lens-text-disabled);
}

.three-lens-histogram-chart {
  display: flex;
  align-items: flex-end;
  height: 60px;
  gap: 2px;
}

.three-lens-histogram-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  cursor: pointer;
}

.three-lens-histogram-bar {
  width: 100%;
  min-height: 2px;
  border-radius: 2px 2px 0 0;
  transition: height 300ms ease;
}

.three-lens-histogram-bar.good {
  background: linear-gradient(180deg, var(--3lens-accent-emerald), #059669);
}

.three-lens-histogram-bar.ok {
  background: linear-gradient(180deg, var(--3lens-accent-amber), #d97706);
}

.three-lens-histogram-bar.bad {
  background: linear-gradient(180deg, var(--3lens-error), #b91c1c);
}

.three-lens-histogram-label {
  font-size: 7px;
  color: var(--3lens-text-disabled);
  margin-top: 4px;
}

.three-lens-histogram-legend {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-histogram-legend-item {
  font-size: 9px;
}

.three-lens-histogram-legend-item.good { color: var(--3lens-accent-emerald); }
.three-lens-histogram-legend-item.ok { color: var(--3lens-accent-amber); }
.three-lens-histogram-legend-item.bad { color: var(--3lens-error); }

/* ═══════════════════════════════════════════════════════════════
   FRAME TIME PERCENTILES
   ═══════════════════════════════════════════════════════════════ */

.three-lens-percentiles-section {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-top: 12px;
}

.three-lens-percentiles-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 10px;
}

.three-lens-percentiles-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.three-lens-percentile-item {
  text-align: center;
  padding: 8px 4px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-percentile-label {
  font-size: 9px;
  text-transform: uppercase;
  color: var(--3lens-text-disabled);
  margin-bottom: 2px;
}

.three-lens-percentile-value {
  font-size: 14px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
}

.three-lens-percentile-value.warning {
  color: var(--3lens-warning);
}

.three-lens-percentile-value.error {
  color: var(--3lens-error);
}

.three-lens-percentiles-summary {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-percentile-summary-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
}

.three-lens-percentile-summary-label {
  color: var(--3lens-text-disabled);
}

.three-lens-percentile-summary-value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
  font-weight: 500;
}

.three-lens-percentile-summary-value.warning {
  color: var(--3lens-warning);
}

/* ═══════════════════════════════════════════════════════════════
   BOTTLENECK ANALYSIS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-bottleneck-section {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-top: 12px;
}

.three-lens-bottleneck-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 10px;
}

.three-lens-bottleneck-ok {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: var(--3lens-radius-sm);
  font-size: 11px;
  color: var(--3lens-accent-emerald);
}

.three-lens-bottleneck-ok-icon {
  font-size: 14px;
}

.three-lens-bottleneck-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.three-lens-bottleneck-item {
  padding: 10px;
  border-radius: var(--3lens-radius-sm);
  border-left: 3px solid transparent;
}

.three-lens-bottleneck-item.low {
  background: rgba(59, 130, 246, 0.1);
  border-left-color: var(--3lens-accent-blue);
}

.three-lens-bottleneck-item.medium {
  background: rgba(245, 158, 11, 0.1);
  border-left-color: var(--3lens-warning);
}

.three-lens-bottleneck-item.high {
  background: rgba(239, 68, 68, 0.1);
  border-left-color: var(--3lens-error);
}

.three-lens-bottleneck-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.three-lens-bottleneck-type {
  font-size: 11px;
  font-weight: 600;
  color: var(--3lens-text-primary);
}

.three-lens-bottleneck-severity {
  font-size: 8px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.three-lens-bottleneck-severity.low { background: var(--3lens-accent-blue); color: white; }
.three-lens-bottleneck-severity.medium { background: var(--3lens-warning); color: white; }
.three-lens-bottleneck-severity.high { background: var(--3lens-error); color: white; }

.three-lens-bottleneck-message {
  font-size: 11px;
  color: var(--3lens-text-secondary);
  margin-bottom: 4px;
}

.three-lens-bottleneck-suggestion {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
}

/* ═══════════════════════════════════════════════════════════════
   RENDER PIPELINE VISUALIZATION
   ═══════════════════════════════════════════════════════════════ */

.three-lens-rendering-profiler {
  padding: 12px;
}

.three-lens-pipeline {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-pipeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-pipeline-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-pipeline-time {
  font-size: 11px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
}

.three-lens-pipeline-bar {
  height: 20px;
  display: flex;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.three-lens-pipeline-segment {
  height: 100%;
  min-width: 4px;
  transition: width 300ms ease;
}

.three-lens-pipeline-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.three-lens-pipeline-legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
}

.three-lens-pipeline-legend-color {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.three-lens-pipeline-legend-label {
  color: var(--3lens-text-secondary);
}

/* ═══════════════════════════════════════════════════════════════
   DRAW CALL EFFICIENCY
   ═══════════════════════════════════════════════════════════════ */

.three-lens-efficiency {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-efficiency-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-efficiency-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-efficiency-grade {
  font-size: 20px;
  font-weight: 700;
  font-family: var(--3lens-font-mono);
}

.three-lens-efficiency-content {
  display: flex;
  gap: 12px;
  align-items: center;
}

.three-lens-efficiency-meter {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.three-lens-efficiency-bar {
  flex: 1;
  height: 8px;
  background: var(--3lens-bg-primary);
  border-radius: 4px;
  overflow: hidden;
}

.three-lens-efficiency-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 300ms ease;
}

.three-lens-efficiency-value {
  font-size: 12px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
  min-width: 36px;
  text-align: right;
}

.three-lens-efficiency-stats {
  display: flex;
  gap: 12px;
}

.three-lens-efficiency-stat {
  text-align: center;
}

.three-lens-efficiency-stat-value {
  font-size: 14px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
  display: block;
}

.three-lens-efficiency-stat-label {
  font-size: 8px;
  text-transform: uppercase;
  color: var(--3lens-text-disabled);
}

.three-lens-efficiency-history {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-efficiency-history-title {
  font-size: 9px;
  text-transform: uppercase;
  color: var(--3lens-text-disabled);
  margin-bottom: 6px;
}

.three-lens-mini-chart {
  width: 100%;
  height: 32px;
}

/* ═══════════════════════════════════════════════════════════════
   OBJECT VISIBILITY BREAKDOWN
   ═══════════════════════════════════════════════════════════════ */

.three-lens-visibility-breakdown {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-visibility-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 10px;
}

.three-lens-visibility-bar {
  height: 12px;
  display: flex;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
}

.three-lens-visibility-segment {
  height: 100%;
  min-width: 2px;
  transition: width 300ms ease;
}

.three-lens-visibility-segment.visible {
  background: linear-gradient(90deg, var(--3lens-accent-emerald), #059669);
}

.three-lens-visibility-segment.culled {
  background: linear-gradient(90deg, var(--3lens-text-disabled), #4b5563);
}

.three-lens-visibility-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.three-lens-visibility-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
}

.three-lens-visibility-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.three-lens-visibility-dot.visible { background: var(--3lens-accent-emerald); }
.three-lens-visibility-dot.culled { background: var(--3lens-text-disabled); }
.three-lens-visibility-dot.transparent { background: var(--3lens-accent-cyan); }
.three-lens-visibility-dot.opaque { background: var(--3lens-accent-blue); }

.three-lens-visibility-label {
  color: var(--3lens-text-tertiary);
  flex: 1;
}

.three-lens-visibility-value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

/* ═══════════════════════════════════════════════════════════════
   LIGHTING ANALYSIS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-lighting {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-lighting-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 10px;
}

.three-lens-lighting-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.three-lens-lighting-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-lighting-item.warning {
  background: rgba(245, 158, 11, 0.15);
}

.three-lens-lighting-icon {
  font-size: 16px;
  margin-bottom: 4px;
}

.three-lens-lighting-info {
  text-align: center;
}

.three-lens-lighting-value {
  font-size: 14px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-amber);
}

.three-lens-lighting-label {
  font-size: 8px;
  text-transform: uppercase;
  color: var(--3lens-text-disabled);
}

.three-lens-lighting-warning {
  margin-top: 10px;
  padding: 8px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: var(--3lens-radius-sm);
  font-size: 10px;
  color: var(--3lens-warning);
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATION & INSTANCING
   ═══════════════════════════════════════════════════════════════ */

.three-lens-animation {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-animation-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 10px;
}

.three-lens-animation-empty {
  font-size: 11px;
  color: var(--3lens-text-disabled);
  text-align: center;
  padding: 10px;
}

.three-lens-animation-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.three-lens-animation-section {
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
  padding: 10px;
}

.three-lens-animation-section-title {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 8px;
}

.three-lens-animation-stats {
  display: flex;
  gap: 12px;
}

.three-lens-animation-stat {
  text-align: center;
  flex: 1;
}

.three-lens-animation-stat-value {
  font-size: 16px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-violet);
  display: block;
}

.three-lens-animation-stat-label {
  font-size: 8px;
  text-transform: uppercase;
  color: var(--3lens-text-disabled);
}

/* ═══════════════════════════════════════════════════════════════
   STATE CHANGES ANALYSIS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-state-changes {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-state-changes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-state-changes-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-state-changes-total {
  font-size: 11px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

.three-lens-state-changes-total.warning {
  color: var(--3lens-warning);
}

.three-lens-state-changes-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.three-lens-state-change-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.three-lens-state-change-bar {
  flex: 1;
  height: 6px;
  background: var(--3lens-bg-primary);
  border-radius: 3px;
  overflow: hidden;
}

.three-lens-state-change-fill {
  height: 100%;
  border-radius: 3px;
}

.three-lens-state-change-fill.program { background: var(--3lens-accent-violet); }
.three-lens-state-change-fill.texture { background: var(--3lens-accent-blue); }
.three-lens-state-change-fill.rt { background: var(--3lens-accent-cyan); }
.three-lens-state-change-fill.upload { background: var(--3lens-accent-emerald); }

.three-lens-state-change-info {
  display: flex;
  justify-content: space-between;
  min-width: 100px;
}

.three-lens-state-change-label {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
}

.three-lens-state-change-value {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

.three-lens-state-changes-upload {
  margin-top: 8px;
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  text-align: right;
}

/* ═══════════════════════════════════════════════════════════════
   XR MODE INFO
   ═══════════════════════════════════════════════════════════════ */

.three-lens-xr {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15));
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-xr-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-xr-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--3lens-accent-violet);
}

.three-lens-xr-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
  background: var(--3lens-accent-violet);
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.three-lens-xr-stats {
  display: flex;
  gap: 20px;
}

.three-lens-xr-stat {
  text-align: center;
}

.three-lens-xr-stat-value {
  font-size: 18px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-violet);
  display: block;
}

.three-lens-xr-stat-label {
  font-size: 9px;
  text-transform: uppercase;
  color: var(--3lens-text-tertiary);
}

/* ═══════════════════════════════════════════════════════════════
   RENDERING WARNINGS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-rendering-warnings {
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: var(--3lens-radius-md);
  padding: 10px;
}

.three-lens-rendering-warnings-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-warning);
  margin-bottom: 8px;
  font-weight: 600;
}

.three-lens-rendering-warning {
  font-size: 11px;
  color: var(--3lens-text-secondary);
  line-height: 1.5;
  padding: 4px 0;
  border-bottom: 1px solid rgba(245, 158, 11, 0.1);
}

.three-lens-rendering-warning:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

/* ═══════════════════════════════════════════════════════════════
   FRAME BUDGET GAUGE
   ═══════════════════════════════════════════════════════════════ */

.three-lens-budget-gauge {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-top: 12px;
}

.three-lens-budget-gauge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.three-lens-budget-gauge-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-budget-gauge-target {
  font-size: 9px;
  color: var(--3lens-text-disabled);
}

.three-lens-budget-gauge-visual {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.three-lens-gauge-svg {
  width: 160px;
  height: 90px;
}

.three-lens-budget-gauge-value {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.three-lens-budget-gauge-number {
  font-size: 24px;
  font-weight: 700;
  font-family: var(--3lens-font-mono);
}

.three-lens-budget-gauge-unit {
  font-size: 12px;
  color: var(--3lens-text-secondary);
}

.three-lens-budget-gauge-value.excellent .three-lens-budget-gauge-number { color: var(--3lens-accent-emerald); }
.three-lens-budget-gauge-value.good .three-lens-budget-gauge-number { color: var(--3lens-accent-cyan); }
.three-lens-budget-gauge-value.warning .three-lens-budget-gauge-number { color: var(--3lens-warning); }
.three-lens-budget-gauge-value.over .three-lens-budget-gauge-number { color: var(--3lens-accent-amber); }
.three-lens-budget-gauge-value.critical .three-lens-budget-gauge-number { color: var(--3lens-error); }

.three-lens-budget-gauge-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-budget-gauge-status {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
}

.three-lens-budget-gauge-status.excellent { background: rgba(52, 211, 153, 0.2); color: var(--3lens-accent-emerald); }
.three-lens-budget-gauge-status.good { background: rgba(34, 211, 238, 0.2); color: var(--3lens-accent-cyan); }
.three-lens-budget-gauge-status.warning { background: rgba(245, 158, 11, 0.2); color: var(--3lens-warning); }
.three-lens-budget-gauge-status.over { background: rgba(251, 191, 36, 0.2); color: var(--3lens-accent-amber); }
.three-lens-budget-gauge-status.critical { background: rgba(239, 68, 68, 0.2); color: var(--3lens-error); }

.three-lens-budget-gauge-remaining {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
}

.three-lens-budget-gauge-remaining .over { color: var(--3lens-error); }
.three-lens-budget-gauge-remaining .under { color: var(--3lens-accent-emerald); }

.three-lens-budget-gauge-breakdown {
  margin-top: 8px;
}

.three-lens-budget-bar {
  height: 8px;
  background: var(--3lens-bg-primary);
  border-radius: 4px;
  display: flex;
  overflow: visible;
  position: relative;
}

.three-lens-budget-bar-fill {
  height: 100%;
  border-radius: 4px 0 0 4px;
  transition: width 300ms ease;
}

.three-lens-budget-bar-fill.excellent { background: var(--3lens-accent-emerald); }
.three-lens-budget-bar-fill.good { background: var(--3lens-accent-cyan); }
.three-lens-budget-bar-fill.warning { background: var(--3lens-warning); }
.three-lens-budget-bar-fill.over { background: var(--3lens-accent-amber); }
.three-lens-budget-bar-fill.critical { background: var(--3lens-error); }

.three-lens-budget-bar-over {
  height: 100%;
  background: var(--3lens-error);
  border-radius: 0 4px 4px 0;
  animation: pulse 1s ease-in-out infinite;
}

.three-lens-budget-labels {
  display: flex;
  justify-content: space-between;
  font-size: 8px;
  color: var(--3lens-text-disabled);
  margin-top: 4px;
}

/* ═══════════════════════════════════════════════════════════════
   SESSION STATISTICS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-session {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-top: 12px;
}

.three-lens-session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-session-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-session-duration {
  font-size: 11px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
  padding: 2px 6px;
  background: rgba(34, 211, 238, 0.15);
  border-radius: 4px;
}

.three-lens-session-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.three-lens-session-stat {
  text-align: center;
  padding: 8px 4px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-session-stat-value {
  font-size: 14px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-primary);
}

.three-lens-session-stat-value.warning {
  color: var(--3lens-warning);
}

.three-lens-session-stat-label {
  font-size: 8px;
  text-transform: uppercase;
  color: var(--3lens-text-disabled);
  margin-top: 2px;
}

.three-lens-session-peaks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-session-peak {
  flex: 1;
  min-width: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  padding: 4px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-session-peak-label {
  color: var(--3lens-text-tertiary);
}

.three-lens-session-peak-value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
  font-weight: 500;
}

.three-lens-session-peak-value.warning {
  color: var(--3lens-warning);
}

/* ═══════════════════════════════════════════════════════════════
   MEMORY EFFICIENCY
   ═══════════════════════════════════════════════════════════════ */

.three-lens-memory-efficiency {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-memory-efficiency-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-memory-efficiency-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-memory-efficiency-grade {
  font-size: 20px;
  font-weight: 700;
  font-family: var(--3lens-font-mono);
}

.three-lens-memory-efficiency-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.three-lens-memory-efficiency-item {
  text-align: center;
  padding: 8px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-memory-efficiency-value {
  font-size: 12px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-primary);
}

.three-lens-memory-efficiency-label {
  font-size: 8px;
  text-transform: uppercase;
  color: var(--3lens-text-disabled);
  margin-top: 2px;
}

.three-lens-memory-efficiency-bar {
  height: 6px;
  background: var(--3lens-bg-primary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.three-lens-memory-efficiency-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 300ms ease;
}

.three-lens-memory-efficiency-score {
  font-size: 10px;
  text-align: right;
  color: var(--3lens-text-secondary);
  font-family: var(--3lens-font-mono);
}

/* ═══════════════════════════════════════════════════════════════
   MEMORY CATEGORIES
   ═══════════════════════════════════════════════════════════════ */

.three-lens-memory-categories {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-memory-categories-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 10px;
}

.three-lens-memory-category {
  padding: 10px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
  margin-bottom: 8px;
}

.three-lens-memory-category:last-child {
  margin-bottom: 0;
}

.three-lens-memory-category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.three-lens-memory-category-icon {
  font-size: 14px;
}

.three-lens-memory-category-name {
  flex: 1;
  font-size: 11px;
  font-weight: 500;
  color: var(--3lens-text-primary);
}

.three-lens-memory-category-count {
  font-size: 12px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
}

.three-lens-memory-category-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.three-lens-memory-category-segment {
  min-width: 4px;
}

.three-lens-memory-category-segment.small { background: var(--3lens-accent-emerald); }
.three-lens-memory-category-segment.medium { background: var(--3lens-accent-amber); }
.three-lens-memory-category-segment.large { background: var(--3lens-error); }

.three-lens-memory-category-legend {
  display: flex;
  gap: 10px;
  font-size: 9px;
}

.three-lens-memory-category-legend .small { color: var(--3lens-accent-emerald); }
.three-lens-memory-category-legend .medium { color: var(--3lens-accent-amber); }
.three-lens-memory-category-legend .large { color: var(--3lens-error); }

.three-lens-memory-category-details {
  display: flex;
  gap: 12px;
}

.three-lens-memory-category-detail {
  display: flex;
  gap: 6px;
  font-size: 10px;
}

.three-lens-memory-category-detail .label {
  color: var(--3lens-text-tertiary);
}

.three-lens-memory-category-detail .value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

.three-lens-memory-category-note {
  font-size: 10px;
  color: var(--3lens-text-secondary);
}

.three-lens-memory-category-largest {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-memory-category-largest strong {
  color: var(--3lens-text-secondary);
}

/* ═══════════════════════════════════════════════════════════════
   MEMORY TIPS
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   PERFORMANCE TIMELINE
   ═══════════════════════════════════════════════════════════════ */

.three-lens-timeline-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 8px;
}

.three-lens-timeline-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 6px;
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-timeline-left-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.three-lens-timeline-right-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.three-lens-timeline-divider {
  width: 1px;
  height: 12px;
  background: var(--3lens-border);
  margin: 0 2px;
}

.three-lens-timeline-record-btn {
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-secondary);
  font-size: 9px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.three-lens-timeline-record-btn:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-border-hover);
}

.three-lens-timeline-record-btn.recording {
  background: rgba(239, 68, 68, 0.2);
  border-color: var(--3lens-error);
  color: var(--3lens-error);
  animation: pulse-recording 1s ease-in-out infinite;
}

@keyframes pulse-recording {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.three-lens-timeline-recording-info {
  font-size: 8px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
}

.three-lens-timeline-buffer-select {
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-secondary);
  font-size: 8px;
  font-family: var(--3lens-font-mono);
  padding: 2px 4px;
  cursor: pointer;
}

.three-lens-timeline-buffer-select:hover {
  border-color: var(--3lens-border-hover);
}

.three-lens-timeline-btn {
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-secondary);
  font-size: 11px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.three-lens-timeline-btn:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-border-hover);
  color: var(--3lens-text-primary);
}

.three-lens-timeline-zoom-label {
  font-size: 9px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
  min-width: 28px;
  text-align: center;
}

.three-lens-timeline-stats {
  display: flex;
  gap: 10px;
}

.three-lens-timeline-stat {
  display: flex;
  gap: 3px;
  font-size: 9px;
}

.three-lens-timeline-stat-label {
  color: var(--3lens-text-tertiary);
}

.three-lens-timeline-stat-value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
  font-weight: 600;
}

.three-lens-timeline-stat-value.warning {
  color: var(--3lens-accent-amber);
}

.three-lens-timeline-paused {
  font-size: 8px;
  color: var(--3lens-accent-cyan);
  background: var(--3lens-accent-cyan-dim);
  padding: 1px 5px;
  border-radius: var(--3lens-radius-sm);
  margin-left: 4px;
}

.three-lens-timeline-chart-container {
  flex: 1;
  position: relative;
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  overflow: hidden;
  cursor: grab;
  min-height: 150px;
}

.three-lens-timeline-chart-container:active {
  cursor: grabbing;
}

.three-lens-timeline-chart {
  width: 100%;
  height: 100%;
  display: block;
}

.three-lens-timeline-tooltip {
  position: absolute;
  background: rgba(17, 24, 39, 0.95);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  padding: 6px 8px;
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-primary);
  pointer-events: none;
  display: none;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.three-lens-timeline-tooltip div {
  padding: 2px 0;
}

.three-lens-timeline-legend {
  display: flex;
  gap: 10px;
  padding: 4px 6px;
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
  flex-wrap: wrap;
}

.three-lens-timeline-legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 8px;
  color: var(--3lens-text-secondary);
}

.three-lens-timeline-legend-color {
  width: 8px;
  height: 8px;
  border-radius: 1px;
}

.three-lens-timeline-legend-color.cpu {
  background: rgba(96, 165, 250, 0.6);
}

.three-lens-timeline-legend-color.gpu {
  background: rgba(34, 197, 94, 0.6);
}

.three-lens-timeline-legend-color.spike {
  background: rgba(239, 68, 68, 0.8);
}

.three-lens-timeline-legend-color.selected {
  background: rgba(96, 165, 250, 1);
  border: 1px solid #fff;
}

.three-lens-timeline-frame-details {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  padding: 6px 8px;
}

.three-lens-timeline-frame-details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-text-primary);
}

.three-lens-timeline-close-btn {
  background: transparent;
  border: none;
  color: var(--3lens-text-tertiary);
  font-size: 14px;
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--3lens-radius-sm);
  transition: all 0.2s;
}

.three-lens-timeline-close-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

.three-lens-timeline-frame-details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}

.three-lens-timeline-frame-detail {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.three-lens-timeline-frame-detail-label {
  font-size: 7px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.three-lens-timeline-frame-detail-value {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-primary);
  font-weight: 600;
}

.three-lens-timeline-frame-detail-value.warning {
  color: var(--3lens-accent-amber);
}

.three-lens-timeline-frame-detail-value.error {
  color: var(--3lens-error);
}

.three-lens-memory-tips {
  background: rgba(52, 211, 153, 0.08);
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-memory-tips-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-accent-emerald);
  margin-bottom: 8px;
  font-weight: 600;
}

.three-lens-memory-tips-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.three-lens-memory-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
  border-left: 3px solid transparent;
}

.three-lens-memory-tip.high {
  border-left-color: var(--3lens-error);
}

.three-lens-memory-tip.medium {
  border-left-color: var(--3lens-warning);
}

.three-lens-memory-tip.low {
  border-left-color: var(--3lens-accent-blue);
}

.three-lens-memory-tip-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.three-lens-memory-tip-text {
  font-size: 10px;
  color: var(--3lens-text-secondary);
  line-height: 1.4;
}

/* ═══════════════════════════════════════════════════════════════
   RESOURCE LIFECYCLE TAB
   ═══════════════════════════════════════════════════════════════ */

.three-lens-resources-profiler {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  overflow-y: auto;
}

/* Resource Summary */
.three-lens-resource-summary {
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
}

.three-lens-resource-summary-title {
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  margin-bottom: 8px;
  text-transform: uppercase;
}

.three-lens-resource-summary-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.three-lens-resource-summary-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-resource-summary-icon {
  font-size: 16px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.three-lens-resource-summary-icon.geometry { background: rgba(96, 165, 250, 0.2); }
.three-lens-resource-summary-icon.material { background: rgba(167, 139, 250, 0.2); }
.three-lens-resource-summary-icon.texture { background: rgba(52, 211, 153, 0.2); }

.three-lens-resource-summary-details {
  flex: 1;
}

.three-lens-resource-summary-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  margin-bottom: 2px;
}

.three-lens-resource-summary-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 9px;
}

.three-lens-resource-summary-stats span {
  padding: 1px 4px;
  border-radius: 2px;
  background: var(--3lens-bg-tertiary);
  color: var(--3lens-text-tertiary);
}

.three-lens-resource-summary-stats .created { color: var(--3lens-accent-green); }
.three-lens-resource-summary-stats .disposed { color: var(--3lens-text-disabled); }
.three-lens-resource-summary-stats .active.highlight { color: var(--3lens-accent-cyan); font-weight: 600; }
.three-lens-resource-summary-stats .leaked { color: var(--3lens-accent-red); background: rgba(239, 68, 68, 0.2); }

.three-lens-resource-total-events {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: center;
  margin-top: 6px;
}

/* Resource Controls */
.three-lens-resource-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
}

/* Potential Leaks */
.three-lens-potential-leaks {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
}

.three-lens-potential-leaks-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-accent-red);
  margin-bottom: 6px;
}

.three-lens-potential-leaks-icon {
  font-size: 12px;
}

.three-lens-potential-leaks-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.three-lens-leak-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
  font-size: 9px;
}

.three-lens-leak-type {
  font-size: 10px;
}

.three-lens-leak-type.geometry { color: #60a5fa; }
.three-lens-leak-type.material { color: #a78bfa; }
.three-lens-leak-type.texture { color: #34d399; }

.three-lens-leak-name {
  flex: 1;
  color: var(--3lens-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.three-lens-leak-age {
  color: var(--3lens-accent-red);
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-leak-more {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 4px 0;
}

/* Resource Timeline */
.three-lens-resource-timeline {
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
}

.three-lens-resource-timeline-empty {
  text-align: center;
  padding: 20px;
  color: var(--3lens-text-tertiary);
  font-size: 10px;
}

.three-lens-resource-timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 9px;
  color: var(--3lens-text-secondary);
}

.three-lens-resource-timeline-legend {
  display: flex;
  gap: 8px;
}

.three-lens-resource-timeline-legend span {
  font-size: 8px;
}

.three-lens-resource-timeline-legend .geometry { color: #60a5fa; }
.three-lens-resource-timeline-legend .material { color: #a78bfa; }
.three-lens-resource-timeline-legend .texture { color: #34d399; }
.three-lens-resource-timeline-legend .disposed { color: #ef4444; }

.three-lens-resource-timeline-chart {
  display: flex;
  height: 60px;
  gap: 1px;
  background: var(--3lens-bg-secondary);
  border-radius: 2px;
  padding: 2px;
}

.three-lens-resource-timeline-bar {
  flex: 1;
  display: flex;
  align-items: flex-end;
  min-width: 4px;
}

.three-lens-resource-bar-stack {
  width: 100%;
  display: flex;
  flex-direction: column-reverse;
  border-radius: 1px;
  overflow: hidden;
}

.three-lens-resource-bar-segment {
  min-height: 2px;
}

.three-lens-resource-bar-segment.geometry { background: #60a5fa; }
.three-lens-resource-bar-segment.material { background: #a78bfa; }
.three-lens-resource-bar-segment.texture { background: #34d399; }
.three-lens-resource-bar-segment.disposed { background: #ef4444; }

.three-lens-resource-timeline-labels {
  display: flex;
  justify-content: space-between;
  font-size: 8px;
  color: var(--3lens-text-tertiary);
  margin-top: 4px;
}

/* Resource Event List */
.three-lens-resource-event-list {
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.three-lens-resource-event-list-header {
  font-size: 9px;
  font-weight: 600;
  color: var(--3lens-text-secondary);
  text-transform: uppercase;
  margin-bottom: 6px;
}

.three-lens-resource-event-list-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.three-lens-resource-event-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 4px;
  background: var(--3lens-bg-secondary);
  border-radius: 2px;
  font-size: 9px;
}

.three-lens-resource-event-item.disposed {
  opacity: 0.7;
}

.three-lens-resource-event-type {
  font-size: 10px;
}

.three-lens-resource-event-type.geometry { color: #60a5fa; }
.three-lens-resource-event-type.material { color: #a78bfa; }
.three-lens-resource-event-type.texture { color: #34d399; }

.three-lens-resource-event-action {
  font-weight: 600;
  width: 12px;
  text-align: center;
}

.three-lens-resource-event-action.created { color: var(--3lens-accent-green); }
.three-lens-resource-event-action.disposed { color: var(--3lens-accent-red); }
.three-lens-resource-event-action.attached { color: var(--3lens-accent-cyan); }
.three-lens-resource-event-action.detached { color: var(--3lens-accent-orange); }

.three-lens-resource-event-name {
  flex: 1;
  color: var(--3lens-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.three-lens-resource-event-slot {
  font-size: 8px;
  color: var(--3lens-text-tertiary);
  background: var(--3lens-bg-tertiary);
  padding: 1px 3px;
  border-radius: 2px;
}

.three-lens-resource-event-time {
  font-size: 8px;
  color: var(--3lens-text-tertiary);
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-resource-event-more {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 4px 0;
}

/* ═══════════════════════════════════════════════════════════════
   LEAK DETECTION UI
   ═══════════════════════════════════════════════════════════════ */

.three-lens-resource-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-leak-controls-left {
  display: flex;
  gap: 4px;
}

.three-lens-leak-controls-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.three-lens-action-btn.small {
  padding: 2px 6px;
  font-size: 10px;
  min-width: unset;
}

.three-lens-toggle-row.compact {
  gap: 4px;
}

.three-lens-toggle-row.compact .three-lens-toggle-label {
  font-size: 9px;
}

/* Memory Usage */
.three-lens-memory-usage {
  padding: 6px 8px;
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-memory-usage-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.three-lens-memory-usage-label {
  font-size: 9px;
  color: var(--3lens-text-secondary);
}

.three-lens-memory-usage-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-memory-trend {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 2px;
}

.three-lens-memory-trend.growing {
  color: var(--3lens-accent-red);
  background: rgba(239, 68, 68, 0.2);
}

.three-lens-memory-trend.shrinking {
  color: var(--3lens-accent-green);
  background: rgba(52, 211, 153, 0.2);
}

.three-lens-memory-trend.stable {
  color: var(--3lens-text-tertiary);
  background: var(--3lens-bg-secondary);
}

/* Leak Alerts */
.three-lens-leak-alerts {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
}

.three-lens-leak-alerts-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-accent-red);
  margin-bottom: 6px;
}

.three-lens-leak-alerts-icon {
  font-size: 12px;
}

.three-lens-alert-badge {
  font-size: 8px;
  padding: 1px 4px;
  border-radius: 2px;
  font-weight: 600;
}

.three-lens-alert-badge.critical {
  background: var(--3lens-accent-red);
  color: white;
}

.three-lens-alert-badge.warning {
  background: var(--3lens-accent-orange);
  color: white;
}

.three-lens-leak-alerts-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.three-lens-leak-alert-item {
  display: flex;
  gap: 6px;
  padding: 6px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
  border-left: 2px solid transparent;
}

.three-lens-leak-alert-item.critical {
  border-left-color: var(--3lens-accent-red);
}

.three-lens-leak-alert-item.warning {
  border-left-color: var(--3lens-accent-orange);
}

.three-lens-leak-alert-item.info {
  border-left-color: var(--3lens-accent-blue);
}

.three-lens-alert-severity {
  font-size: 10px;
  flex-shrink: 0;
}

.three-lens-alert-content {
  flex: 1;
  min-width: 0;
}

.three-lens-alert-message {
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  margin-bottom: 2px;
}

.three-lens-alert-details {
  font-size: 9px;
  color: var(--3lens-text-secondary);
  margin-bottom: 4px;
}

.three-lens-alert-suggestion {
  font-size: 8px;
  color: var(--3lens-accent-cyan);
  background: rgba(34, 211, 238, 0.1);
  padding: 2px 4px;
  border-radius: 2px;
}

/* Orphaned Resources */
.three-lens-orphaned-resources {
  background: rgba(167, 139, 250, 0.1);
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
}

.three-lens-orphaned-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: #a78bfa;
  margin-bottom: 4px;
}

.three-lens-orphaned-icon {
  font-size: 12px;
}

.three-lens-orphaned-hint {
  font-size: 8px;
  color: var(--3lens-text-tertiary);
  margin-bottom: 6px;
}

.three-lens-orphaned-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.three-lens-orphan-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 4px;
  background: var(--3lens-bg-secondary);
  border-radius: 2px;
  font-size: 9px;
}

.three-lens-orphan-type {
  font-size: 10px;
}

.three-lens-orphan-type.geometry { color: #60a5fa; }
.three-lens-orphan-type.material { color: #a78bfa; }
.three-lens-orphan-type.texture { color: #34d399; }

.three-lens-orphan-name {
  flex: 1;
  color: var(--3lens-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.three-lens-orphan-age {
  color: var(--3lens-text-tertiary);
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-orphan-more {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 4px 0;
}

.three-lens-leak-more {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 4px 0;
}

/* ═══════════════════════════════════════════════════════════════
   RULE VIOLATIONS UI
   ═══════════════════════════════════════════════════════════════ */

.three-lens-rule-violations {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
  margin-top: 8px;
}

.three-lens-rule-violations-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.three-lens-rule-violations-title {
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-accent-red);
}

.three-lens-rule-violations-badges {
  display: flex;
  gap: 4px;
  flex: 1;
}

.three-lens-violation-badge {
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 8px;
  font-weight: 600;
}

.three-lens-violation-badge.error {
  background: var(--3lens-accent-red);
  color: white;
}

.three-lens-violation-badge.warning {
  background: var(--3lens-accent-orange);
  color: white;
}

.three-lens-rule-violations-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.three-lens-violation-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
  border-left: 2px solid transparent;
  font-size: 9px;
}

.three-lens-violation-item.error {
  border-left-color: var(--3lens-accent-red);
}

.three-lens-violation-item.warning {
  border-left-color: var(--3lens-accent-orange);
}

.three-lens-violation-item.info {
  border-left-color: var(--3lens-accent-blue);
}

.three-lens-violation-severity {
  font-size: 10px;
  flex-shrink: 0;
}

.three-lens-violation-message {
  flex: 1;
  color: var(--3lens-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.three-lens-violation-time {
  font-size: 8px;
  color: var(--3lens-text-tertiary);
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-violations-more {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 4px 0;
  margin-top: 4px;
}

/* ═══════════════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-toast-container {
  position: fixed;
  bottom: 80px;
  right: 20px;
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  z-index: 10000000;
  pointer-events: none;
}

.three-lens-toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--3lens-bg-elevated);
  border: 1px solid var(--3lens-border);
  border-radius: 6px;
  font-family: var(--3lens-font-sans);
  font-size: 12px;
  color: var(--3lens-text-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transform: translateX(100%);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  pointer-events: auto;
}

.three-lens-toast.visible {
  transform: translateX(0);
  opacity: 1;
}

.three-lens-toast-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 10px;
  font-weight: bold;
}

.three-lens-toast-info .three-lens-toast-icon {
  background: var(--3lens-accent-blue);
  color: white;
}

.three-lens-toast-success .three-lens-toast-icon {
  background: var(--3lens-success);
  color: white;
}

.three-lens-toast-warning .three-lens-toast-icon {
  background: var(--3lens-warning);
  color: black;
}

.three-lens-toast-error .three-lens-toast-icon {
  background: var(--3lens-error);
  color: white;
}

.three-lens-toast-message {
  flex: 1;
}

/* ═══════════════════════════════════════════════════════════════
   PLUGIN PANEL STYLES
   ═══════════════════════════════════════════════════════════════ */

.three-lens-menu-icon.plugin {
  background: linear-gradient(135deg, var(--3lens-accent-violet), var(--3lens-accent-rose));
  color: white;
}

.plugin-error {
  padding: 16px;
  text-align: center;
  color: var(--3lens-error);
  font-size: 11px;
  font-family: var(--3lens-font-sans);
}

.plugin-loading {
  padding: 16px;
  text-align: center;
  color: var(--3lens-text-tertiary);
  font-size: 11px;
  font-family: var(--3lens-font-sans);
}

/* Plugin toolbar button */
.three-lens-plugin-toolbar {
  display: flex;
  gap: 2px;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--3lens-border);
}

.three-lens-plugin-toolbar-btn {
  background: transparent;
  border: none;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: var(--3lens-text-secondary);
  transition: background 0.15s, color 0.15s;
}

.three-lens-plugin-toolbar-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

.three-lens-plugin-toolbar-btn.active {
  background: var(--3lens-accent-blue);
  color: white;
}

.three-lens-plugin-toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ═══════════════════════════════════════════════════════════════
   PLUGINS MANAGEMENT PANEL
   ═══════════════════════════════════════════════════════════════ */

.three-lens-plugins-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: var(--3lens-font-sans);
}

.three-lens-plugins-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--3lens-bg-secondary);
  border-bottom: 1px solid var(--3lens-border);
}

.three-lens-plugins-count {
  font-size: 11px;
  color: var(--3lens-text-secondary);
}

.three-lens-plugins-btn {
  background: var(--3lens-accent-blue);
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.three-lens-plugins-btn:hover {
  background: #3b82f6;
}

.three-lens-plugins-btn.primary {
  background: var(--3lens-accent-blue);
}

.three-lens-plugins-btn.danger {
  background: var(--3lens-error);
}

.three-lens-plugins-btn.danger:hover {
  background: #dc2626;
}

.three-lens-plugins-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.three-lens-plugins-empty {
  text-align: center;
  color: var(--3lens-text-tertiary);
  font-size: 11px;
  padding: 24px;
}

.three-lens-plugin-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: 6px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.three-lens-plugin-item:hover {
  background: var(--3lens-bg-hover);
}

.three-lens-plugin-item.selected {
  border-color: var(--3lens-accent-blue);
  background: rgba(96, 165, 250, 0.1);
}

.three-lens-plugin-item.error {
  border-color: var(--3lens-error);
}

.three-lens-plugin-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.three-lens-plugin-info {
  flex: 1;
  min-width: 0;
}

.three-lens-plugin-name {
  font-size: 11px;
  font-weight: 500;
  color: var(--3lens-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.three-lens-plugin-version {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  font-family: var(--3lens-font-mono);
}

.three-lens-plugin-status {
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  border-radius: 50%;
}

.three-lens-plugin-status.active {
  color: var(--3lens-success);
}

.three-lens-plugin-status.inactive {
  color: var(--3lens-text-tertiary);
}

.three-lens-plugin-status.error {
  color: var(--3lens-error);
  font-weight: bold;
}

.three-lens-plugin-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

.three-lens-plugin-item:hover .three-lens-plugin-actions {
  opacity: 1;
}

.three-lens-plugin-action-btn {
  background: transparent;
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  color: var(--3lens-text-secondary);
  transition: background 0.15s, color 0.15s;
}

.three-lens-plugin-action-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

/* Plugin Load Form */
.three-lens-plugin-load-form {
  padding: 12px;
  border-top: 1px solid var(--3lens-border);
  background: var(--3lens-bg-secondary);
}

.three-lens-plugin-form-group {
  margin-bottom: 10px;
}

.three-lens-plugin-label {
  display: block;
  font-size: 10px;
  color: var(--3lens-text-secondary);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.three-lens-plugin-input {
  width: 100%;
  padding: 6px 8px;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: 4px;
  color: var(--3lens-text-primary);
  font-size: 11px;
  font-family: var(--3lens-font-mono);
  box-sizing: border-box;
}

.three-lens-plugin-input:focus {
  outline: none;
  border-color: var(--3lens-accent-blue);
}

.three-lens-plugin-select {
  width: 100%;
  padding: 6px 8px;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: 4px;
  color: var(--3lens-text-primary);
  font-size: 11px;
  cursor: pointer;
}

.three-lens-plugin-submit-btn {
  width: 100%;
  padding: 8px;
  background: var(--3lens-accent-blue);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.three-lens-plugin-submit-btn:hover {
  background: #3b82f6;
}

.three-lens-plugin-load-status {
  margin-top: 8px;
  font-size: 10px;
  text-align: center;
}

.three-lens-plugin-load-status .loading {
  color: var(--3lens-text-secondary);
}

.three-lens-plugin-load-status .success {
  color: var(--3lens-success);
}

.three-lens-plugin-load-status .error {
  color: var(--3lens-error);
}

/* Plugin Settings */
.three-lens-plugin-settings {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.three-lens-plugin-settings-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--3lens-bg-secondary);
  border-bottom: 1px solid var(--3lens-border);
}

.three-lens-plugin-back-btn {
  background: transparent;
  border: none;
  color: var(--3lens-text-secondary);
  font-size: 11px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.15s, color 0.15s;
}

.three-lens-plugin-back-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

.three-lens-plugin-settings-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--3lens-text-primary);
}

.three-lens-plugin-details {
  padding: 12px;
  border-bottom: 1px solid var(--3lens-border);
}

.three-lens-plugin-description {
  font-size: 11px;
  color: var(--3lens-text-secondary);
  margin-bottom: 8px;
  line-height: 1.4;
}

.three-lens-plugin-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 10px;
  color: var(--3lens-text-tertiary);
}

.three-lens-plugin-settings-fields {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.three-lens-plugin-setting-field {
  margin-bottom: 12px;
}

.three-lens-plugin-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.three-lens-plugin-setting-label {
  font-size: 11px;
  color: var(--3lens-text-primary);
}

.three-lens-plugin-setting-desc {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  margin-top: 4px;
}

.three-lens-plugin-no-settings {
  text-align: center;
  color: var(--3lens-text-tertiary);
  font-size: 11px;
  padding: 24px;
}

.three-lens-plugin-settings-actions {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--3lens-border);
  background: var(--3lens-bg-secondary);
}

.three-lens-plugin-color {
  width: 40px;
  height: 24px;
  padding: 0;
  border: 1px solid var(--3lens-border);
  border-radius: 4px;
  cursor: pointer;
}

/* ═══════════════════════════════════════════════════════════════
   LOD CHECKER PLUGIN STYLES
   ═══════════════════════════════════════════════════════════════ */

.lod-checker-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: var(--3lens-font-sans);
  font-size: 11px;
  color: var(--3lens-text-primary);
}

.lod-checker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--3lens-bg-secondary);
  border-bottom: 1px solid var(--3lens-border);
}

.lod-checker-title {
  font-weight: 600;
  font-size: 12px;
}

.lod-checker-btn {
  background: var(--3lens-bg-tertiary);
  color: var(--3lens-text-primary);
  border: 1px solid var(--3lens-border);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.lod-checker-btn:hover {
  background: var(--3lens-bg-hover);
}

.lod-checker-btn.primary {
  background: var(--3lens-accent-blue);
  border-color: var(--3lens-accent-blue);
  color: white;
}

.lod-checker-btn.primary:hover {
  background: #3b82f6;
}

.lod-checker-empty {
  padding: 24px;
  text-align: center;
  color: var(--3lens-text-secondary);
}

.lod-checker-hint {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  margin-top: 8px;
}

.lod-checker-summary {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  background: var(--3lens-bg-tertiary);
  border-bottom: 1px solid var(--3lens-border);
  flex-wrap: wrap;
}

.lod-checker-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
  padding: 4px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: 4px;
}

.lod-checker-stat.warning {
  background: rgba(251, 191, 36, 0.15);
}

.lod-checker-stat.info {
  background: rgba(96, 165, 250, 0.15);
}

.lod-checker-stat-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--3lens-text-primary);
}

.lod-checker-stat.warning .lod-checker-stat-value {
  color: var(--3lens-warning);
}

.lod-checker-stat-label {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
}

.lod-checker-analysis-time {
  padding: 4px 12px;
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: right;
}

.lod-checker-section {
  padding: 10px 12px;
  border-bottom: 1px solid var(--3lens-border);
}

.lod-checker-section-header {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 11px;
}

.lod-checker-section-header.warning {
  color: var(--3lens-warning);
}

.lod-checker-section-header.info {
  color: var(--3lens-accent-blue);
}

.lod-checker-section-desc {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  margin-bottom: 8px;
}

.lod-checker-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lod-checker-list.scrollable {
  max-height: 200px;
  overflow-y: auto;
}

.lod-checker-item {
  padding: 8px 10px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.lod-checker-item:hover {
  background: var(--3lens-bg-hover);
}

.lod-checker-item.warning {
  border-color: var(--3lens-warning);
  border-left-width: 3px;
}

.lod-checker-item.info {
  border-color: var(--3lens-accent-blue);
  border-left-width: 3px;
}

.lod-checker-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.lod-checker-item-name {
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lod-checker-item-badges {
  display: flex;
  gap: 4px;
}

.lod-checker-badge {
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 8px;
  font-weight: 600;
  text-transform: uppercase;
}

.lod-checker-badge.lod {
  background: var(--3lens-accent-emerald);
  color: black;
}

.lod-checker-badge.over {
  background: var(--3lens-warning);
  color: black;
}

.lod-checker-badge.far {
  background: var(--3lens-accent-blue);
  color: white;
}

.lod-checker-item-stats {
  display: flex;
  gap: 10px;
  font-size: 10px;
  color: var(--3lens-text-secondary);
  font-family: var(--3lens-font-mono);
}

.lod-checker-item-stats .highlight {
  color: var(--3lens-warning);
  font-weight: 600;
}

.lod-checker-item-suggestion {
  margin-top: 4px;
  font-size: 9px;
  color: var(--3lens-accent-blue);
}

.lod-checker-success {
  padding: 16px;
  text-align: center;
  color: var(--3lens-success);
  font-size: 12px;
}

.lod-checker-more {
  text-align: center;
  color: var(--3lens-text-tertiary);
  font-size: 10px;
  padding: 8px;
}

/* ═══════════════════════════════════════════════════════════════
   SHADOW DEBUGGER PLUGIN STYLES
   ═══════════════════════════════════════════════════════════════ */

.shadow-debugger-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: var(--3lens-font-sans);
  font-size: 11px;
  color: var(--3lens-text-primary);
}

.shadow-debugger-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--3lens-bg-secondary);
  border-bottom: 1px solid var(--3lens-border);
}

.shadow-debugger-title {
  font-weight: 600;
  font-size: 12px;
}

.shadow-debugger-btn {
  background: var(--3lens-bg-tertiary);
  color: var(--3lens-text-primary);
  border: 1px solid var(--3lens-border);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.shadow-debugger-btn:hover {
  background: var(--3lens-bg-hover);
}

.shadow-debugger-btn.primary {
  background: var(--3lens-accent-blue);
  border-color: var(--3lens-accent-blue);
  color: white;
}

.shadow-debugger-btn.primary:hover {
  background: #3b82f6;
}

.shadow-debugger-empty {
  padding: 24px;
  text-align: center;
  color: var(--3lens-text-secondary);
}

.shadow-debugger-hint {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  margin-top: 8px;
}

.shadow-debugger-summary {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  background: var(--3lens-bg-tertiary);
  border-bottom: 1px solid var(--3lens-border);
  flex-wrap: wrap;
}

.shadow-debugger-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
  padding: 4px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: 4px;
}

.shadow-debugger-stat.warning {
  background: rgba(251, 191, 36, 0.15);
}

.shadow-debugger-stat.error {
  background: rgba(239, 68, 68, 0.15);
}

.shadow-debugger-stat-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--3lens-text-primary);
}

.shadow-debugger-stat.warning .shadow-debugger-stat-value {
  color: var(--3lens-warning);
}

.shadow-debugger-stat.error .shadow-debugger-stat-value {
  color: var(--3lens-error);
}

.shadow-debugger-stat-label {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
}

.shadow-debugger-section {
  padding: 10px 12px;
  border-bottom: 1px solid var(--3lens-border);
}

.shadow-debugger-section-header {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 11px;
}

.shadow-debugger-section-header.warning {
  color: var(--3lens-warning);
}

.shadow-debugger-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shadow-debugger-item {
  padding: 10px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.shadow-debugger-item:hover {
  background: var(--3lens-bg-hover);
}

.shadow-debugger-item.warning {
  border-color: var(--3lens-warning);
  border-left-width: 3px;
}

.shadow-debugger-item.error {
  border-color: var(--3lens-error);
  border-left-width: 3px;
}

.shadow-debugger-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.shadow-debugger-item-icon {
  font-size: 14px;
}

.shadow-debugger-item-name {
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shadow-debugger-item-type {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  padding: 2px 6px;
  background: var(--3lens-bg-secondary);
  border-radius: 3px;
}

.shadow-debugger-item-issues {
  font-size: 9px;
  color: var(--3lens-warning);
  padding: 2px 6px;
  background: rgba(251, 191, 36, 0.15);
  border-radius: 3px;
}

.shadow-debugger-item-stats {
  display: flex;
  gap: 10px;
  font-size: 10px;
  color: var(--3lens-text-secondary);
  font-family: var(--3lens-font-mono);
  flex-wrap: wrap;
}

.shadow-debugger-item-issues-list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.shadow-debugger-issue {
  display: flex;
  gap: 8px;
  padding: 6px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: 4px;
  font-size: 10px;
}

.shadow-debugger-issue.warning {
  background: rgba(251, 191, 36, 0.1);
}

.shadow-debugger-issue.error {
  background: rgba(239, 68, 68, 0.1);
}

.shadow-debugger-issue.info {
  background: rgba(96, 165, 250, 0.1);
}

.shadow-debugger-issue-icon {
  flex-shrink: 0;
}

.shadow-debugger-issue-content {
  flex: 1;
}

.shadow-debugger-issue-message {
  color: var(--3lens-text-primary);
  margin-bottom: 2px;
}

.shadow-debugger-issue-suggestion {
  color: var(--3lens-text-tertiary);
  font-size: 9px;
}

.shadow-debugger-success {
  padding: 16px;
  text-align: center;
  color: var(--3lens-success);
  font-size: 12px;
}

.shadow-debugger-info {
  padding: 16px;
  text-align: center;
  color: var(--3lens-text-secondary);
  font-size: 12px;
}

/* ═══════════════════════════════════════════════════════════════
   WEBGPU PANEL STYLES
   ═══════════════════════════════════════════════════════════════ */

.webgpu-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.webgpu-tabs {
  display: flex;
  gap: 2px;
  padding: 8px 8px 0;
  background: var(--3lens-bg-secondary);
  border-bottom: 1px solid var(--3lens-border);
}

.webgpu-tab {
  padding: 6px 12px;
  background: transparent;
  border: none;
  color: var(--3lens-text-secondary);
  font-size: 10px;
  font-family: inherit;
  cursor: pointer;
  border-radius: 4px 4px 0 0;
  transition: all 0.15s ease;
}

.webgpu-tab:hover {
  color: var(--3lens-text-primary);
  background: var(--3lens-bg-tertiary);
}

.webgpu-tab.active {
  background: var(--3lens-bg-primary);
  color: var(--3lens-accent);
  font-weight: 500;
}

.webgpu-tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

/* Not Available State */
.webgpu-not-available {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.webgpu-not-available-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.webgpu-not-available-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  margin-bottom: 8px;
}

.webgpu-not-available-desc {
  font-size: 11px;
  color: var(--3lens-text-secondary);
  max-width: 300px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.webgpu-not-available-hint {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  background: var(--3lens-bg-secondary);
  padding: 8px 12px;
  border-radius: 4px;
}

.webgpu-not-available-hint code {
  background: var(--3lens-bg-tertiary);
  padding: 1px 4px;
  border-radius: 2px;
  font-family: 'SF Mono', Monaco, monospace;
  color: var(--3lens-accent);
}

/* Section */
.webgpu-section {
  margin-bottom: 16px;
}

.webgpu-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--3lens-border);
}

.webgpu-badge {
  background: var(--3lens-accent);
  color: #000;
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 9px;
  font-weight: 600;
}

/* Pipeline List */
.webgpu-pipeline-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.webgpu-pipeline-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.webgpu-pipeline-item:hover {
  background: var(--3lens-bg-tertiary);
}

.webgpu-pipeline-item.selected {
  background: var(--3lens-accent);
  color: #000;
}

.webgpu-pipeline-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.webgpu-pipeline-name {
  flex: 1;
  font-size: 10px;
  font-family: 'SF Mono', Monaco, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.webgpu-pipeline-type {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
}

.webgpu-pipeline-item.selected .webgpu-pipeline-type {
  color: rgba(0, 0, 0, 0.6);
}

.webgpu-pipeline-usage {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
}

.webgpu-pipeline-item.selected .webgpu-pipeline-usage {
  color: rgba(0, 0, 0, 0.6);
}

/* Pipeline Details */
.webgpu-pipeline-details {
  margin-top: 16px;
  background: var(--3lens-bg-secondary);
  border-radius: 6px;
  border: 1px solid var(--3lens-border);
  overflow: hidden;
}

.webgpu-details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--3lens-bg-tertiary);
  border-bottom: 1px solid var(--3lens-border);
}

.webgpu-details-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--3lens-text-primary);
}

.webgpu-close-btn {
  background: transparent;
  border: none;
  color: var(--3lens-text-tertiary);
  font-size: 16px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.webgpu-close-btn:hover {
  color: var(--3lens-text-primary);
}

.webgpu-details-content {
  padding: 12px;
}

.webgpu-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 10px;
}

.webgpu-detail-label {
  color: var(--3lens-text-secondary);
}

.webgpu-detail-value {
  color: var(--3lens-text-primary);
}

.webgpu-detail-value.mono {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 9px;
}

.webgpu-shader-stage {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--3lens-border);
}

.webgpu-shader-stage-header {
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-text-secondary);
  margin-bottom: 6px;
}

.webgpu-shader-stage-entry {
  font-size: 10px;
  font-family: 'SF Mono', Monaco, monospace;
  color: var(--3lens-accent);
  background: var(--3lens-bg-tertiary);
  padding: 4px 8px;
  border-radius: 4px;
}

/* Bind Groups */
.webgpu-bindgroups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.webgpu-info {
  text-align: center;
  padding: 20px;
}

.webgpu-info-icon {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.7;
}

.webgpu-info-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  margin-bottom: 8px;
}

.webgpu-info-desc {
  font-size: 11px;
  color: var(--3lens-text-secondary);
  line-height: 1.5;
  max-width: 320px;
  margin: 0 auto;
}

.webgpu-bindgroup-types {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.webgpu-bindgroup-type {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: var(--3lens-bg-secondary);
  border-radius: 6px;
}

.webgpu-bindgroup-type-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.webgpu-bindgroup-type-name {
  font-size: 11px;
  font-weight: 500;
  color: var(--3lens-text-primary);
  min-width: 120px;
}

.webgpu-bindgroup-type-desc {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
}

/* Shaders */
.webgpu-shaders {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.webgpu-shader-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.webgpu-shader-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.webgpu-shader-item:hover {
  background: var(--3lens-bg-tertiary);
}

.webgpu-shader-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.webgpu-shader-name {
  flex: 1;
  font-size: 10px;
  font-family: 'SF Mono', Monaco, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.webgpu-shader-stages {
  display: flex;
  gap: 4px;
}

.webgpu-stage-badge {
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 8px;
  font-weight: 600;
  text-transform: uppercase;
}

.webgpu-stage-badge.vs {
  background: rgba(96, 165, 250, 0.2);
  color: #60A5FA;
}

.webgpu-stage-badge.fs {
  background: rgba(251, 146, 60, 0.2);
  color: #FB923C;
}

.webgpu-stage-badge.cs {
  background: rgba(52, 211, 153, 0.2);
  color: #34D399;
}

.webgpu-info-box {
  background: var(--3lens-bg-secondary);
  padding: 12px;
  border-radius: 6px;
  font-size: 10px;
  color: var(--3lens-text-secondary);
  line-height: 1.5;
}

.webgpu-info-box p {
  margin: 0 0 8px;
}

.webgpu-info-box p:last-child {
  margin-bottom: 0;
}

.webgpu-info-box strong {
  color: var(--3lens-accent);
}

.webgpu-info-box ul {
  margin: 8px 0 0;
  padding-left: 16px;
}

.webgpu-info-box li {
  margin-bottom: 4px;
}

/* Capabilities */
.webgpu-capabilities {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.webgpu-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.webgpu-stat {
  text-align: center;
  padding: 12px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: 6px;
}

.webgpu-stat-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--3lens-accent);
  font-family: 'SF Mono', Monaco, monospace;
}

.webgpu-stat-label {
  display: block;
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
  margin-top: 4px;
}

.webgpu-limits-info {
  margin-bottom: 8px;
}

.webgpu-limits-info code {
  background: var(--3lens-bg-tertiary);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 9px;
  color: var(--3lens-accent);
}

.webgpu-limits-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.webgpu-limit {
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: 4px;
  font-size: 10px;
}

.webgpu-limit-name {
  color: var(--3lens-text-secondary);
}

.webgpu-limit-value {
  color: var(--3lens-text-primary);
  font-family: 'SF Mono', Monaco, monospace;
  font-weight: 500;
}

/* Comparison Table */
.webgpu-comparison {
  background: var(--3lens-bg-secondary);
  border-radius: 6px;
  overflow: hidden;
}

.webgpu-compare-row {
  display: grid;
  grid-template-columns: 1fr 60px 60px;
  padding: 8px 12px;
  font-size: 10px;
  border-bottom: 1px solid var(--3lens-border);
}

.webgpu-compare-row:last-child {
  border-bottom: none;
}

.webgpu-compare-row.header {
  background: var(--3lens-bg-tertiary);
  font-weight: 600;
  color: var(--3lens-text-secondary);
  text-transform: uppercase;
  font-size: 9px;
}

.webgpu-compare-row span:nth-child(2),
.webgpu-compare-row span:nth-child(3) {
  text-align: center;
}

.webgpu-compare-row .yes {
  color: var(--3lens-success);
}

.webgpu-compare-row .no {
  color: var(--3lens-text-tertiary);
}

.webgpu-compare-row .partial {
  color: var(--3lens-warning);
}

/* Empty States */
.webgpu-empty {
  text-align: center;
  padding: 24px;
  color: var(--3lens-text-secondary);
}

.webgpu-empty p {
  margin: 0 0 8px;
  font-size: 11px;
}

.webgpu-empty-small {
  padding: 12px;
  text-align: center;
  color: var(--3lens-text-tertiary);
  font-size: 10px;
  font-style: italic;
}

.webgpu-hint {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  font-style: italic;
}

/* GPU Timing Tab */
.webgpu-timing {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.webgpu-timing-badge {
  background: var(--3lens-accent);
  color: #000;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  font-family: 'SF Mono', Monaco, monospace;
}

.webgpu-timing-summary {
  text-align: center;
  padding: 16px;
}

.webgpu-timing-total {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.webgpu-timing-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--3lens-accent);
  font-family: 'SF Mono', Monaco, monospace;
}

.webgpu-timing-unit {
  font-size: 14px;
  color: var(--3lens-text-secondary);
}

/* Timing Bar */
.webgpu-timing-bar-container {
  padding: 8px 0;
}

.webgpu-timing-bar {
  display: flex;
  height: 20px;
  border-radius: 4px;
  overflow: hidden;
  background: var(--3lens-bg-tertiary);
}

.webgpu-timing-bar-segment {
  height: 100%;
  transition: width 0.3s ease;
}

.webgpu-timing-bar-segment:first-child {
  border-radius: 4px 0 0 4px;
}

.webgpu-timing-bar-segment:last-child {
  border-radius: 0 4px 4px 0;
}

/* Timing Legend */
.webgpu-timing-legend {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.webgpu-timing-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 10px;
}

.webgpu-timing-legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.webgpu-timing-legend-name {
  flex: 1;
  color: var(--3lens-text-primary);
}

.webgpu-timing-legend-value {
  color: var(--3lens-text-secondary);
  font-family: 'SF Mono', Monaco, monospace;
  min-width: 60px;
  text-align: right;
}

.webgpu-timing-legend-pct {
  color: var(--3lens-text-tertiary);
  font-family: 'SF Mono', Monaco, monospace;
  min-width: 40px;
  text-align: right;
}

/* Timing Passes */
.webgpu-timing-passes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.webgpu-timing-pass {
  background: var(--3lens-bg-secondary);
  border-radius: 6px;
  padding: 8px 10px;
}

.webgpu-timing-pass.hot {
  border-left: 3px solid var(--3lens-error);
}

.webgpu-timing-pass-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.webgpu-timing-pass-color {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.webgpu-timing-pass-name {
  flex: 1;
  font-size: 10px;
  font-weight: 500;
  color: var(--3lens-text-primary);
}

.webgpu-timing-pass-time {
  font-size: 10px;
  font-family: 'SF Mono', Monaco, monospace;
  color: var(--3lens-accent);
}

.webgpu-timing-pass-bar {
  height: 4px;
  background: var(--3lens-bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
}

.webgpu-timing-pass-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* Timing Analysis */
.webgpu-timing-analysis {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.webgpu-analysis-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: 4px;
  font-size: 10px;
}

.webgpu-analysis-label {
  color: var(--3lens-text-secondary);
}

.webgpu-analysis-value {
  color: var(--3lens-text-primary);
  font-family: 'SF Mono', Monaco, monospace;
  font-weight: 500;
}

.webgpu-analysis-value.over {
  color: var(--3lens-error);
}

.webgpu-analysis-value.ok {
  color: var(--3lens-success);
}

/* ═══════════════════════════════════════════════════════════════
   COMMAND PALETTE
   ═══════════════════════════════════════════════════════════════ */

.three-lens-command-palette {
  position: fixed;
  inset: 0;
  z-index: 1000000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
}

.command-palette-backdrop {
  position: absolute;
  inset: 0;
  background: var(--3lens-overlay-bg);
  backdrop-filter: var(--3lens-backdrop-blur);
}

.command-palette-dialog {
  position: relative;
  width: 100%;
  max-width: 560px;
  max-height: 480px;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-xl);
  box-shadow: var(--3lens-shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: command-palette-enter 0.15s ease-out;
}

@keyframes command-palette-enter {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.command-palette-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--3lens-border);
  gap: 12px;
}

.command-palette-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--3lens-font-sans);
  font-size: 15px;
  color: var(--3lens-text-primary);
}

.command-palette-input::placeholder {
  color: var(--3lens-text-tertiary);
}

.command-palette-close {
  background: transparent;
  border: none;
  color: var(--3lens-text-tertiary);
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
  border-radius: var(--3lens-radius-sm);
  transition: all 0.15s ease;
}

.command-palette-close:hover {
  color: var(--3lens-text-primary);
  background: var(--3lens-bg-hover);
}

.command-palette-results {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.command-palette-empty {
  text-align: center;
  padding: 32px;
  color: var(--3lens-text-tertiary);
  font-size: 13px;
}

.command-palette-group {
  margin-bottom: 8px;
}

.command-palette-group-title {
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 8px 12px 4px;
}

.command-palette-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--3lens-radius-md);
  cursor: pointer;
  transition: all 0.1s ease;
}

.command-palette-item:hover,
.command-palette-item.selected {
  background: var(--3lens-bg-hover);
}

.command-palette-item.selected {
  background: var(--3lens-accent);
  color: var(--3lens-text-inverse);
}

.command-palette-icon {
  font-size: 16px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.command-palette-title {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
}

.command-palette-title mark {
  background: var(--3lens-warning);
  color: var(--3lens-text-inverse);
  border-radius: 2px;
  padding: 0 2px;
}

.command-palette-item.selected .command-palette-title mark {
  background: rgba(255, 255, 255, 0.3);
  color: inherit;
}

.command-palette-desc {
  font-size: 11px;
  color: var(--3lens-text-tertiary);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.command-palette-item.selected .command-palette-desc {
  color: rgba(255, 255, 255, 0.7);
}

.command-palette-shortcut {
  font-family: var(--3lens-font-mono);
  font-size: 10px;
  padding: 2px 6px;
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-secondary);
}

.command-palette-item.selected .command-palette-shortcut {
  background: rgba(255, 255, 255, 0.2);
  color: inherit;
}

.command-palette-footer {
  padding: 8px 16px;
  border-top: 1px solid var(--3lens-border);
  background: var(--3lens-bg-secondary);
}

.command-palette-hint {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  display: flex;
  align-items: center;
  gap: 12px;
}

.command-palette-hint kbd {
  font-family: var(--3lens-font-mono);
  padding: 2px 5px;
  background: var(--3lens-bg-tertiary);
  border-radius: 3px;
  margin-right: 4px;
}

/* ═══════════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS PANEL
   ═══════════════════════════════════════════════════════════════ */

.three-lens-shortcuts-panel {
  position: fixed;
  inset: 0;
  z-index: 1000000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shortcuts-panel-backdrop {
  position: absolute;
  inset: 0;
  background: var(--3lens-overlay-bg);
  backdrop-filter: var(--3lens-backdrop-blur);
}

.shortcuts-panel-dialog {
  position: relative;
  width: 100%;
  max-width: 640px;
  max-height: 80vh;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-xl);
  box-shadow: var(--3lens-shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.shortcuts-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--3lens-border);
}

.shortcuts-panel-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--3lens-text-primary);
}

.shortcuts-panel-close {
  background: transparent;
  border: none;
  color: var(--3lens-text-tertiary);
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
  border-radius: var(--3lens-radius-sm);
}

.shortcuts-panel-close:hover {
  color: var(--3lens-text-primary);
  background: var(--3lens-bg-hover);
}

.shortcuts-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.shortcuts-group {
  margin-bottom: 20px;
}

.shortcuts-group-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.shortcut-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--3lens-border-subtle);
}

.shortcut-row:last-child {
  border-bottom: none;
}

.shortcut-desc {
  font-size: 12px;
  color: var(--3lens-text-primary);
}

.shortcut-keys {
  font-family: var(--3lens-font-mono);
  font-size: 11px;
  padding: 4px 8px;
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-secondary);
}

/* ═══════════════════════════════════════════════════════════════
   ACCESSIBILITY IMPROVEMENTS
   ═══════════════════════════════════════════════════════════════ */

/* Focus visible outlines */
.three-lens-root *:focus-visible {
  outline: 2px solid var(--3lens-border-focus);
  outline-offset: 2px;
}

/* Skip to content link (for screen readers) */
.three-lens-skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 1000001;
  padding: 8px 16px;
  background: var(--3lens-accent);
  color: var(--3lens-text-inverse);
  font-weight: 600;
  text-decoration: none;
  border-radius: var(--3lens-radius-md);
}

.three-lens-skip-link:focus {
  left: 16px;
  top: 16px;
}

/* Screen reader only text */
.three-lens-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Improved button states */
.three-lens-root button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .three-lens-root,
  .three-lens-root * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode improvements */
@media (prefers-contrast: more) {
  .three-lens-root {
    --3lens-border: #ffffff;
    --3lens-text-secondary: #e0e0e0;
  }
}

/* Touch-friendly targets on mobile */
@media (pointer: coarse) {
  .three-lens-root button,
  .three-lens-root [role="button"] {
    min-height: 44px;
    min-width: 44px;
  }
  
  .command-palette-item {
    padding: 14px 12px;
  }
  
  .shortcut-row {
    padding: 12px 0;
  }
}

/* Theme toggle button */
.three-lens-theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-md);
  cursor: pointer;
  color: var(--3lens-text-secondary);
  font-size: 16px;
  transition: all 0.15s ease;
}

.three-lens-theme-toggle:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

/* Theme indicator in menu */
.theme-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--3lens-radius-md);
  background: var(--3lens-bg-secondary);
  margin-bottom: 8px;
}

.theme-indicator-icon {
  font-size: 18px;
}

.theme-indicator-text {
  flex: 1;
  font-size: 11px;
}

.theme-indicator-label {
  color: var(--3lens-text-tertiary);
}

.theme-indicator-value {
  color: var(--3lens-text-primary);
  font-weight: 500;
}
`;class wi{rowHeight;overscan;container;getId;getChildren;isExpanded;renderRow;onScrollCallback;rootNodes=[];flattenedNodes=[];scrollTop=0;containerHeight=0;scrollContainer=null;contentContainer=null;rowsContainer=null;animationFrameId=null;resizeObserver=null;lastRenderRange=null;constructor(e){this.rowHeight=e.rowHeight,this.overscan=e.overscan??5,this.container=e.container,this.getId=e.getId,this.getChildren=e.getChildren,this.isExpanded=e.isExpanded,this.renderRow=e.renderRow,this.onScrollCallback=e.onScroll,this.setupDOM(),this.setupEventListeners()}setData(e){this.rootNodes=e,this.rebuildFlattenedList(),this.render()}rebuildFlattenedList(){this.flattenedNodes=[],this.flattenNodes(this.rootNodes,0,null)}flattenNodes(e,t,s){for(const r of e){const n=this.getId(r),i=this.getChildren(r),o=i.length>0,l=o&&this.isExpanded(n),c={data:r,id:n,depth:t,hasChildren:o,isExpanded:l,parentId:s,flatIndex:this.flattenedNodes.length};this.flattenedNodes.push(c),l&&this.flattenNodes(i,t+1,n)}}setupDOM(){this.container.innerHTML="",this.scrollContainer=document.createElement("div"),this.scrollContainer.className="virtual-scroll-container",this.scrollContainer.style.cssText=`
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
    `,this.contentContainer=document.createElement("div"),this.contentContainer.className="virtual-scroll-content",this.contentContainer.style.cssText=`
      position: relative;
      width: 100%;
    `,this.rowsContainer=document.createElement("div"),this.rowsContainer.className="virtual-scroll-rows",this.rowsContainer.style.cssText=`
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    `,this.contentContainer.appendChild(this.rowsContainer),this.scrollContainer.appendChild(this.contentContainer),this.container.appendChild(this.scrollContainer)}setupEventListeners(){this.scrollContainer&&(this.scrollContainer.addEventListener("scroll",this.handleScroll,{passive:!0}),this.resizeObserver=new ResizeObserver(e=>{for(const t of e)this.containerHeight=t.contentRect.height,this.scheduleRender()}),this.resizeObserver.observe(this.scrollContainer),this.containerHeight=this.scrollContainer.clientHeight)}handleScroll=()=>{this.scrollContainer&&(this.scrollTop=this.scrollContainer.scrollTop,this.scheduleRender(),this.onScrollCallback?.(this.scrollTop))};scheduleRender(){this.animationFrameId===null&&(this.animationFrameId=requestAnimationFrame(()=>{this.animationFrameId=null,this.render()}))}getVisibleRange(){const e=this.flattenedNodes.length;if(e===0)return{start:0,end:0};const t=Math.ceil(this.containerHeight/this.rowHeight),s=Math.floor(this.scrollTop/this.rowHeight),r=Math.max(0,s-this.overscan),n=Math.min(e,s+t+this.overscan);return{start:r,end:n}}render(){if(!this.contentContainer||!this.rowsContainer)return;const t=this.flattenedNodes.length*this.rowHeight;this.contentContainer.style.height=`${t}px`;const{start:s,end:r}=this.getVisibleRange();if(this.lastRenderRange&&this.lastRenderRange.start===s&&this.lastRenderRange.end===r)return;this.lastRenderRange={start:s,end:r};const n=s*this.rowHeight;this.rowsContainer.style.transform=`translateY(${n}px)`;const o=this.flattenedNodes.slice(s,r).map((l,c)=>this.renderRow(l,s+c)).join("");this.rowsContainer.innerHTML=o}getState(){const{start:e,end:t}=this.getVisibleRange();return{scrollTop:this.scrollTop,containerHeight:this.containerHeight,totalHeight:this.flattenedNodes.length*this.rowHeight,startIndex:e,endIndex:t,totalRows:this.flattenedNodes.length}}scrollToIndex(e,t="start"){if(!this.scrollContainer)return;const s=Math.max(0,Math.min(e,this.flattenedNodes.length-1));let r;switch(t){case"start":r=s*this.rowHeight;break;case"center":r=s*this.rowHeight-this.containerHeight/2+this.rowHeight/2;break;case"end":r=(s+1)*this.rowHeight-this.containerHeight;break}this.scrollContainer.scrollTop=Math.max(0,r)}scrollToId(e,t="center"){const s=this.flattenedNodes.findIndex(r=>r.id===e);s!==-1&&this.scrollToIndex(s,t)}getNodeById(e){return this.flattenedNodes.find(t=>t.id===e)}getNodes(){return this.flattenedNodes}update(){this.rebuildFlattenedList(),this.render()}forceRender(){this.lastRenderRange=null,this.render()}dispose(){this.animationFrameId!==null&&cancelAnimationFrame(this.animationFrameId),this.scrollContainer&&this.scrollContainer.removeEventListener("scroll",this.handleScroll),this.resizeObserver&&this.resizeObserver.disconnect(),this.container.innerHTML=""}}const Mi=`
/* Virtual scroll container */
.virtual-scroll-container {
  contain: strict;
}

/* Virtual scroll rows - use will-change for GPU acceleration */
.virtual-scroll-rows {
  will-change: transform;
}

/* Virtual tree node - fixed height for calculations */
.virtual-tree-node {
  height: var(--virtual-row-height, 28px);
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

/* Indentation based on depth */
.virtual-tree-node[data-depth="0"] { padding-left: 8px; }
.virtual-tree-node[data-depth="1"] { padding-left: 24px; }
.virtual-tree-node[data-depth="2"] { padding-left: 40px; }
.virtual-tree-node[data-depth="3"] { padding-left: 56px; }
.virtual-tree-node[data-depth="4"] { padding-left: 72px; }
.virtual-tree-node[data-depth="5"] { padding-left: 88px; }
.virtual-tree-node[data-depth="6"] { padding-left: 104px; }
.virtual-tree-node[data-depth="7"] { padding-left: 120px; }
.virtual-tree-node[data-depth="8"] { padding-left: 136px; }
.virtual-tree-node[data-depth="9"] { padding-left: 152px; }
.virtual-tree-node[data-depth="10"] { padding-left: 168px; }

/* Deep nesting fallback - calculate padding dynamically */
.virtual-tree-node {
  padding-left: calc(8px + var(--depth, 0) * 16px);
}
`;function Hr(a){let e=1;for(const t of a.children)e+=Hr(t);return e}function Si(){return{selectedNodeId:null,selectedMaterialId:null,selectedGeometryId:null,selectedTextureId:null,selectedRenderTargetId:null,expandedNodes:new Set,materialsSearch:"",geometrySearch:"",texturesSearch:"",renderTargetsSearch:"",geometryVisualization:{wireframe:new Set,boundingBox:new Set,normals:new Set},texturePreviewChannel:"rgb",renderTargetPreviewMode:"color",renderTargetZoom:1,frameHistory:[],fpsHistory:[]}}function Be(a){return a>=1e6?(a/1e6).toFixed(1)+"M":a>=1e3?(a/1e3).toFixed(1)+"K":a.toString()}function ye(a){return a<=0||Number.isNaN(a)?"0 B":a<1024?`${a.toFixed(0)} B`:a<1024*1024?`${(a/1024).toFixed(1)} KB`:a<1024*1024*1024?`${(a/(1024*1024)).toFixed(1)} MB`:`${(a/(1024*1024*1024)).toFixed(2)} GB`}function H(a){return a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function ki(a,e=40){if(a.length<=e)return a;const t=a.split("/"),s=t[t.length-1];return s.length<e-3?"..."+s:a.substring(0,e-3)+"..."}function Ci(a){return a.includes("Physical")?"◆":a.includes("Standard")?"◇":a.includes("Basic")?"○":a.includes("Lambert")?"◐":a.includes("Phong")?"◑":a.includes("Toon")?"◕":a.includes("Shader")||a.includes("Raw")?"⬡":a.includes("Sprite")?"◎":a.includes("Points")?"•":a.includes("Line")?"―":"●"}function Nr(a){const e=a.toLowerCase();return e.includes("box")||e.includes("cube")?"📦":e.includes("sphere")?"🔮":e.includes("plane")?"⬛":e.includes("cylinder")?"🧴":e.includes("cone")?"🔺":e.includes("torus")?"🍩":e.includes("ring")?"💍":e.includes("circle")?"⭕":e.includes("tube")?"🧪":e.includes("extrude")?"📊":e.includes("lathe")?"🏺":e.includes("text")||e.includes("shape")?"✒️":e.includes("instanced")?"🔄":"📐"}function jr(a){return a.isCubeTexture?"🎲":a.isVideoTexture?"🎬":a.isCanvasTexture?"🎨":a.isDataTexture?"📊":a.isRenderTarget?"🎯":a.isCompressed?"📦":"🖼️"}function Ti(a){return{Float32Array:"f32",Float64Array:"f64",Int8Array:"i8",Int16Array:"i16",Int32Array:"i32",Uint8Array:"u8",Uint16Array:"u16",Uint32Array:"u32",Uint8ClampedArray:"u8c"}[a]||a}const zi=new Set(["const","uniform","attribute","varying","in","out","inout","centroid","flat","smooth","noperspective","layout","patch","sample","buffer","shared","coherent","volatile","restrict","readonly","writeonly","precision","highp","mediump","lowp","if","else","for","while","do","switch","case","default","break","continue","return","discard","void","bool","int","uint","float","double","vec2","vec3","vec4","dvec2","dvec3","dvec4","bvec2","bvec3","bvec4","ivec2","ivec3","ivec4","uvec2","uvec3","uvec4","mat2","mat3","mat4","mat2x2","mat2x3","mat2x4","mat3x2","mat3x3","mat3x4","mat4x2","mat4x3","mat4x4","sampler1D","sampler2D","sampler3D","samplerCube","sampler1DShadow","sampler2DShadow","samplerCubeShadow","sampler1DArray","sampler2DArray","sampler1DArrayShadow","sampler2DArrayShadow","isampler1D","isampler2D","isampler3D","isamplerCube","usampler1D","usampler2D","usampler3D","usamplerCube","struct","true","false"]),$i=new Set(["radians","degrees","sin","cos","tan","asin","acos","atan","sinh","cosh","tanh","asinh","acosh","atanh","pow","exp","log","exp2","log2","sqrt","inversesqrt","abs","sign","floor","trunc","round","roundEven","ceil","fract","mod","modf","min","max","clamp","mix","step","smoothstep","isnan","isinf","floatBitsToInt","floatBitsToUint","intBitsToFloat","uintBitsToFloat","length","distance","dot","cross","normalize","faceforward","reflect","refract","matrixCompMult","outerProduct","transpose","determinant","inverse","lessThan","lessThanEqual","greaterThan","greaterThanEqual","equal","notEqual","any","all","not","texture","textureProj","textureLod","textureOffset","texelFetch","textureGrad","textureGather","textureSize","textureProjLod","texture2D","texture2DProj","texture2DLod","textureCube","textureCubeLod","dFdx","dFdy","fwidth","noise1","noise2","noise3","noise4","main"]);function fr(a){let e="",t=0;const s=a.length;for(;t<s;){if(a[t]==="/"&&a[t+1]==="*"){const r=a.indexOf("*/",t+2),n=r===-1?s:r+2;e+=`<span class="glsl-comment">${H(a.slice(t,n))}</span>`,t=n;continue}if(a[t]==="/"&&a[t+1]==="/"){const r=a.indexOf(`
`,t),n=r===-1?s:r;e+=`<span class="glsl-comment">${H(a.slice(t,n))}</span>`,t=n;continue}if(a[t]==="#"){const r=a.indexOf(`
`,t),n=r===-1?s:r;e+=`<span class="glsl-preprocessor">${H(a.slice(t,n))}</span>`,t=n;continue}if(a[t]==='"'){let r=t+1;for(;r<s&&a[r]!=='"'&&a[r]!==`
`;)a[r]==="\\"&&r++,r++;a[r]==='"'&&r++,e+=`<span class="glsl-string">${H(a.slice(t,r))}</span>`,t=r;continue}if(/[0-9]/.test(a[t])||a[t]==="."&&/[0-9]/.test(a[t+1])){let r=t;if(a[r]==="0"&&(a[r+1]==="x"||a[r+1]==="X"))for(r+=2;r<s&&/[0-9a-fA-F]/.test(a[r]);)r++;else{for(;r<s&&/[0-9]/.test(a[r]);)r++;if(a[r]==="."&&/[0-9]/.test(a[r+1]))for(r++;r<s&&/[0-9]/.test(a[r]);)r++;if(a[r]==="e"||a[r]==="E")for(r++,(a[r]==="+"||a[r]==="-")&&r++;r<s&&/[0-9]/.test(a[r]);)r++}a[r]==="u"||a[r]==="U"||a[r]==="f"||a[r]==="F"?r++:(a[r]==="l"||a[r]==="L")&&(a[r+1]==="f"||a[r+1]==="F")&&(r+=2),e+=`<span class="glsl-number">${H(a.slice(t,r))}</span>`,t=r;continue}if(/[a-zA-Z_]/.test(a[t])){let r=t;for(;r<s&&/[a-zA-Z0-9_]/.test(a[r]);)r++;const n=a.slice(t,r);zi.has(n)?e+=`<span class="glsl-keyword">${n}</span>`:$i.has(n)?e+=`<span class="glsl-builtin">${n}</span>`:n.startsWith("gl_")?e+=`<span class="glsl-builtin-var">${n}</span>`:e+=`<span class="glsl-ident">${n}</span>`,t=r;continue}if("+-*/%=<>!&|^~?:;,.()[]{}#".includes(a[t])){e+=`<span class="glsl-punct">${H(a[t])}</span>`,t++;continue}e+=H(a[t]),t++}return e}function br(a,e=20){const t=a.split(`
`);return t.length<=e?a:t.slice(0,e).join(`
`)+`

// ... ${t.length-e} more lines`}function Ei(a){const e=new Map;if(!a?.scenes)return e;function t(s){const r=s.ref.name||s.ref.type;if(e.set(s.ref.debugId,r),s.children)for(const n of s.children)t(n)}for(const s of a.scenes)t(s);return e}function Pi(a,e){const t=a.snapshot?.materials,s=a.snapshot?.materialsSummary;if(!t?.length)return`
      <div class="panel-empty-state">
        <div class="empty-icon">🎨</div>
        <h2>No Materials</h2>
        <p>No materials found in observed scenes.</p>
        <p class="hint">Make sure scenes are being observed and contain meshes with materials.</p>
      </div>
    `;const r=Ei(a.snapshot),n=e.materialsSearch.toLowerCase().trim(),i=n?t.filter(l=>{const c=(l.name||l.type).toLowerCase(),d=l.usedByMeshes.map(h=>r.get(h)||"").join(" ").toLowerCase();return c.includes(n)||d.includes(n)}):t,o=e.selectedMaterialId?t.find(l=>l.uuid===e.selectedMaterialId):null;return`
    <div class="panel-split-view materials-split-view">
      <div class="panel-list materials-list-panel">
        ${_i(s)}
        <div class="materials-list">
          ${i.length>0?i.map(l=>Ai(l,e,r)).join(""):`<div class="no-results">No materials match "${H(e.materialsSearch)}"</div>`}
        </div>
      </div>
      <div class="panel-inspector materials-inspector-panel">
        ${o?Ii(o,r):Bi()}
      </div>
    </div>
  `}function _i(a){return a?`
    <div class="panel-summary materials-summary">
      <div class="summary-stat">
        <span class="summary-value">${a.totalCount}</span>
        <span class="summary-label">Materials</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${a.shaderMaterialCount}</span>
        <span class="summary-label">Shaders</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${a.transparentCount}</span>
        <span class="summary-label">Transparent</span>
      </div>
    </div>
  `:""}function Ai(a,e,t){const s=e.selectedMaterialId===a.uuid,r=a.color!==void 0?a.color.toString(16).padStart(6,"0"):null,n=Ci(a.type),i=a.usedByMeshes.map(d=>t.get(d)||d.substring(0,8)).slice(0,3),o=a.usedByMeshes.length-i.length,l=a.name||a.type,c=i.join(", ")+(o>0?` +${o}`:"");return`
    <div class="list-item material-item ${s?"selected":""}" data-uuid="${a.uuid}" data-action="select-material">
      <div class="material-item-color">
        ${r?`<span class="color-swatch" style="background: #${r};"></span>`:'<span class="color-swatch no-color">∅</span>'}
      </div>
      <div class="material-item-info">
        <div class="material-item-name">${H(l)}</div>
        <div class="material-item-type">
          <span class="type-icon">${n}</span>
          ${H(c)}
        </div>
      </div>
      <div class="material-item-badges">
        ${a.isShaderMaterial?'<span class="badge shader">GLSL</span>':""}
        ${a.transparent?'<span class="badge transparent">α</span>':""}
        ${a.textures.length>0?`<span class="badge textures">${a.textures.length} tex</span>`:""}
      </div>
      <div class="material-item-usage">${a.usageCount}×</div>
    </div>
  `}function Bi(){return`
    <div class="no-selection">
      <div class="no-selection-icon">🎨</div>
      <div class="no-selection-text">Select a material to inspect</div>
    </div>
  `}function Ii(a,e){const t=a.color!==void 0?a.color.toString(16).padStart(6,"0"):null,s=a.emissive!==void 0?a.emissive.toString(16).padStart(6,"0"):null,r=a.usedByMeshes.map(i=>({debugId:i,name:e.get(i)||i.substring(0,8)})),n=a.name||a.type;return`
    <div class="inspector-header material-header">
      ${t?`<span class="color-swatch large" style="background: #${t};"></span>`:""}
      <div class="inspector-header-text">
        <span class="inspector-title">${H(n)}</span>
        <span class="inspector-subtitle">${a.type}</span>
      </div>
      <span class="inspector-uuid">${a.uuid.substring(0,8)}</span>
    </div>

    <div class="inspector-section used-by-section">
      <div class="section-title">Used By (${r.length})</div>
      <div class="used-by-list">
        ${r.map(i=>`
          <div class="used-by-item" data-debug-id="${i.debugId}">
            <span class="mesh-icon">M</span>
            <span class="mesh-name">${H(i.name)}</span>
          </div>
        `).join("")}
      </div>
    </div>

    <div class="inspector-section">
      <div class="section-title">Properties</div>
      <div class="property-grid">
        ${t!==null?`
        <div class="property-row">
          <span class="property-label">Color</span>
          <span class="property-value editable">
            <input type="color" class="prop-color-input" data-property="color" data-material="${a.uuid}" value="#${t}" />
            <span class="color-hex">#${t.toUpperCase()}</span>
          </span>
        </div>
        `:""}
        ${s!==null?`
        <div class="property-row">
          <span class="property-label">Emissive</span>
          <span class="property-value editable">
            <input type="color" class="prop-color-input" data-property="emissive" data-material="${a.uuid}" value="#${s}" />
            <span class="color-hex">#${s.toUpperCase()}</span>
          </span>
        </div>
        `:""}
        <div class="property-row">
          <span class="property-label">Opacity</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input" data-property="opacity" data-material="${a.uuid}"
                   min="0" max="1" step="0.01" value="${a.opacity}" />
            <span class="range-value">${a.opacity.toFixed(2)}</span>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Transparent</span>
          <span class="property-value editable">
            <label class="toggle-switch">
              <input type="checkbox" class="prop-checkbox-input" data-property="transparent" data-material="${a.uuid}" ${a.transparent?"checked":""} />
              <span class="toggle-slider"></span>
            </label>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Visible</span>
          <span class="property-value editable">
            <label class="toggle-switch">
              <input type="checkbox" class="prop-checkbox-input" data-property="visible" data-material="${a.uuid}" ${a.visible?"checked":""} />
              <span class="toggle-slider"></span>
            </label>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Side</span>
          <span class="property-value editable">
            <select class="prop-select-input" data-property="side" data-material="${a.uuid}">
              <option value="0" ${a.side===0?"selected":""}>Front</option>
              <option value="1" ${a.side===1?"selected":""}>Back</option>
              <option value="2" ${a.side===2?"selected":""}>Double</option>
            </select>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Wireframe</span>
          <span class="property-value editable">
            <label class="toggle-switch">
              <input type="checkbox" class="prop-checkbox-input" data-property="wireframe" data-material="${a.uuid}" ${a.wireframe?"checked":""} />
              <span class="toggle-slider"></span>
            </label>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Depth Test</span>
          <span class="property-value editable">
            <label class="toggle-switch">
              <input type="checkbox" class="prop-checkbox-input" data-property="depthTest" data-material="${a.uuid}" ${a.depthTest?"checked":""} />
              <span class="toggle-slider"></span>
            </label>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Depth Write</span>
          <span class="property-value editable">
            <label class="toggle-switch">
              <input type="checkbox" class="prop-checkbox-input" data-property="depthWrite" data-material="${a.uuid}" ${a.depthWrite?"checked":""} />
              <span class="toggle-slider"></span>
            </label>
          </span>
        </div>
      </div>
    </div>

    ${a.pbr?Fi(a.pbr,a.uuid):""}
    ${a.textures.length>0?Ri(a.textures):""}
    ${a.shader?Li(a.shader):""}

    <div class="inspector-section">
      <div class="section-title">Usage</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Used by</span>
          <span class="property-value">${a.usageCount} mesh${a.usageCount!==1?"es":""}</span>
        </div>
      </div>
    </div>
  `}function Fi(a,e){return`
    <div class="inspector-section">
      <div class="section-title">PBR Properties</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Roughness</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input pbr-slider" data-property="roughness" data-material="${e}"
                   min="0" max="1" step="0.01" value="${a.roughness}" />
            <span class="range-value">${a.roughness.toFixed(2)}</span>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Metalness</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input pbr-slider metalness" data-property="metalness" data-material="${e}"
                   min="0" max="1" step="0.01" value="${a.metalness}" />
            <span class="range-value">${a.metalness.toFixed(2)}</span>
          </span>
        </div>
        ${a.reflectivity!==void 0?`
        <div class="property-row">
          <span class="property-label">Reflectivity</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input" data-property="reflectivity" data-material="${e}"
                   min="0" max="1" step="0.01" value="${a.reflectivity}" />
            <span class="range-value">${a.reflectivity.toFixed(2)}</span>
          </span>
        </div>
        `:""}
        ${a.clearcoat!==void 0?`
        <div class="property-row">
          <span class="property-label">Clearcoat</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input" data-property="clearcoat" data-material="${e}"
                   min="0" max="1" step="0.01" value="${a.clearcoat}" />
            <span class="range-value">${a.clearcoat.toFixed(2)}</span>
          </span>
        </div>
        `:""}
        ${a.transmission!==void 0?`
        <div class="property-row">
          <span class="property-label">Transmission</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input" data-property="transmission" data-material="${e}"
                   min="0" max="1" step="0.01" value="${a.transmission}" />
            <span class="range-value">${a.transmission.toFixed(2)}</span>
          </span>
        </div>
        `:""}
        ${a.ior!==void 0?`
        <div class="property-row">
          <span class="property-label">IOR</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input" data-property="ior" data-material="${e}"
                   min="1" max="2.5" step="0.01" value="${a.ior}" />
            <span class="range-value">${a.ior.toFixed(2)}</span>
          </span>
        </div>
        `:""}
      </div>
    </div>
  `}function Ri(a){return`
    <div class="inspector-section">
      <div class="section-title">Textures (${a.length})</div>
      <div class="texture-list">
        ${a.map(e=>`
          <div class="texture-item">
            <span class="texture-slot">${e.slot}</span>
            <span class="texture-uuid">${e.uuid.substring(0,8)}...</span>
            ${e.name?`<span class="texture-name">${H(e.name)}</span>`:""}
          </div>
        `).join("")}
      </div>
    </div>
  `}function Li(a){const e=Object.keys(a.defines).length>0;return`
    <div class="inspector-section shader-section">
      <div class="section-title">Shader</div>
      
      ${a.uniforms.length>0?`
      <div class="shader-subsection">
        <div class="subsection-title">Uniforms (${a.uniforms.length})</div>
        <div class="uniforms-list">
          ${a.uniforms.map(t=>`
            <div class="uniform-item">
              <span class="uniform-type">${t.type}</span>
              <span class="uniform-name">${t.name}</span>
              <span class="uniform-value">${Oi(t)}</span>
            </div>
          `).join("")}
        </div>
      </div>
      `:""}

      ${e?`
      <div class="shader-subsection">
        <div class="subsection-title">Defines</div>
        <div class="defines-list">
          ${Object.entries(a.defines).map(([t,s])=>`
            <div class="define-item">
              <span class="define-name">${t}</span>
              <span class="define-value">${String(s)}</span>
            </div>
          `).join("")}
        </div>
      </div>
      `:""}

      <div class="shader-subsection">
        <div class="subsection-title">Vertex Shader</div>
        <pre class="shader-code"><code>${fr(br(a.vertexShader))}</code></pre>
      </div>

      <div class="shader-subsection">
        <div class="subsection-title">Fragment Shader</div>
        <pre class="shader-code"><code>${fr(br(a.fragmentShader))}</code></pre>
      </div>
    </div>
  `}function Oi(a){const e=a.value;if(e==null)return"null";if(typeof e=="number")return e.toFixed(4);if(typeof e=="object"){if("x"in e&&"y"in e&&"z"in e&&"w"in e){const t=e;return`(${t.x.toFixed(2)}, ${t.y.toFixed(2)}, ${t.z.toFixed(2)}, ${t.w.toFixed(2)})`}if("x"in e&&"y"in e&&"z"in e){const t=e;return`(${t.x.toFixed(2)}, ${t.y.toFixed(2)}, ${t.z.toFixed(2)})`}if("r"in e&&"g"in e&&"b"in e){const t=e;return`rgb(${t.r.toFixed(2)}, ${t.g.toFixed(2)}, ${t.b.toFixed(2)})`}if("x"in e&&"y"in e){const t=e;return`(${t.x.toFixed(2)}, ${t.y.toFixed(2)})`}if("uuid"in e)return`texture:${e.uuid.substring(0,8)}`;if(Array.isArray(e))return`[${e.length}]`}return String(e)}function Di(a,e,t,s,r){a.querySelectorAll('[data-action="select-material"]').forEach(n=>{const i=n,o=i.dataset.uuid;i.addEventListener("click",()=>{if(!o)return;const l=t.selectedMaterialId===o?null:o;s({selectedMaterialId:l}),r()})}),a.querySelectorAll(".prop-color-input").forEach(n=>{n.addEventListener("input",()=>{const i=n.dataset.property,o=n.dataset.material;if(!i||!o)return;const l=parseInt(n.value.replace("#",""),16);e.sendCommand({type:"update-material-property",materialUuid:o,property:i,value:l})})}),a.querySelectorAll(".prop-range-input").forEach(n=>{n.addEventListener("input",()=>{const i=n.dataset.property,o=n.dataset.material;if(!i||!o)return;const l=parseFloat(n.value),c=n.parentElement?.querySelector(".range-value");c&&(c.textContent=l.toFixed(2)),e.sendCommand({type:"update-material-property",materialUuid:o,property:i,value:l})})}),a.querySelectorAll(".prop-checkbox-input").forEach(n=>{n.addEventListener("change",()=>{const i=n.dataset.property,o=n.dataset.material;!i||!o||e.sendCommand({type:"update-material-property",materialUuid:o,property:i,value:n.checked})})}),a.querySelectorAll(".prop-select-input").forEach(n=>{n.addEventListener("change",()=>{const i=n.dataset.property,o=n.dataset.material;if(!i||!o)return;const l=parseInt(n.value,10);e.sendCommand({type:"update-material-property",materialUuid:o,property:i,value:l})})})}function Hi(a){const e=new Map;if(!a?.scenes)return e;function t(s){const r=s.ref.name||s.ref.type;if(e.set(s.ref.debugId,r),s.children)for(const n of s.children)t(n)}for(const s of a.scenes)t(s);return e}function Ni(a,e){const t=a.snapshot?.geometries,s=a.snapshot?.geometriesSummary;if(!t?.length)return`
      <div class="panel-empty-state">
        <div class="empty-icon">📐</div>
        <h2>No Geometries</h2>
        <p>No geometries found in observed scenes.</p>
        <p class="hint">Make sure scenes are being observed and contain meshes with geometries.</p>
      </div>
    `;const r=Hi(a.snapshot),n=e.geometrySearch.toLowerCase().trim(),i=n?t.filter(l=>{const c=(l.name||l.type).toLowerCase(),d=l.usedByMeshes.map(h=>r.get(h)||"").join(" ").toLowerCase();return c.includes(n)||d.includes(n)}):t,o=e.selectedGeometryId?t.find(l=>l.uuid===e.selectedGeometryId):null;return`
    <div class="panel-split-view geometry-split-view">
      <div class="panel-list geometry-list-panel">
        ${ji(s)}
        <div class="geometry-list">
          ${i.length>0?i.map(l=>Gi(l,e,r)).join(""):`<div class="no-results">No geometries match "${H(e.geometrySearch)}"</div>`}
        </div>
      </div>
      <div class="panel-inspector geometry-inspector-panel">
        ${o?Vi(o,e,r):Ui()}
      </div>
    </div>
  `}function ji(a){return a?`
    <div class="panel-summary geometry-summary">
      <div class="summary-stat">
        <span class="summary-value">${a.totalCount}</span>
        <span class="summary-label">Geometries</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${Be(a.totalVertices)}</span>
        <span class="summary-label">Vertices</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${Be(a.totalTriangles)}</span>
        <span class="summary-label">Triangles</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${ye(a.totalMemoryBytes)}</span>
        <span class="summary-label">GPU Memory</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${a.indexedCount}</span>
        <span class="summary-label">Indexed</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${a.morphedCount}</span>
        <span class="summary-label">Morphed</span>
      </div>
    </div>
  `:""}function Gi(a,e,t){const s=e.selectedGeometryId===a.uuid,r=Nr(a.type),n=a.usedByMeshes.map(c=>t.get(c)||c.substring(0,8)).slice(0,3),i=a.usedByMeshes.length-n.length,o=a.name||a.type,l=n.join(", ")+(i>0?` +${i}`:"");return`
    <div class="list-item geometry-item ${s?"selected":""}" data-uuid="${a.uuid}" data-action="select-geometry">
      <div class="geometry-item-icon">${r}</div>
      <div class="geometry-item-info">
        <div class="geometry-item-name-row">
          <div class="geometry-item-name">${H(o)}</div>
          <div class="geometry-item-stats">
            <span class="geo-stat-pill vertices">${Be(a.vertexCount)} v</span>
            <span class="geo-stat-pill triangles">${Be(a.faceCount)} △</span>
            <span class="geo-stat-pill memory">${ye(a.memoryBytes)}</span>
            <span class="geo-stat-pill usage">${a.usageCount}×</span>
          </div>
        </div>
        <div class="geometry-item-meta">
          <span class="geometry-used-by">${H(l)}</span>
        </div>
      </div>
    </div>
  `}function Ui(){return`
    <div class="no-selection">
      <div class="no-selection-icon">📐</div>
      <div class="no-selection-text">Select a geometry to inspect</div>
    </div>
  `}function Vi(a,e,t){const s=Nr(a.type),r=a.usedByMeshes.map(i=>({debugId:i,name:t.get(i)||i.substring(0,8)})),n=a.name||a.type;return`
    <div class="inspector-header geometry-header">
      <div class="geometry-item-icon">${s}</div>
      <div class="inspector-header-text">
        <span class="inspector-title">${H(n)}</span>
        <span class="inspector-subtitle">${a.type}</span>
      </div>
      <span class="inspector-uuid">${a.uuid.substring(0,8)}</span>
    </div>

    <div class="inspector-section used-by-section">
      <div class="section-title">Used By (${r.length})</div>
      <div class="used-by-list">
        ${r.map(i=>`
          <div class="used-by-item" data-debug-id="${i.debugId}">
            <span class="mesh-icon">M</span>
            <span class="mesh-name">${H(i.name)}</span>
          </div>
        `).join("")}
      </div>
    </div>

    <div class="inspector-section">
      <div class="section-title">Overview</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Vertices</span>
          <span class="property-value">${Be(a.vertexCount)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Triangles</span>
          <span class="property-value">${Be(a.faceCount)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Indices</span>
          <span class="property-value">${a.isIndexed?Be(a.indexCount):"Non-indexed"}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Memory (est.)</span>
          <span class="property-value">${ye(a.memoryBytes)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Used by</span>
          <span class="property-value">${a.usageCount} mesh${a.usageCount!==1?"es":""}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Draw Range</span>
          <span class="property-value">${a.drawRange.start} → ${a.drawRange.count===1/0?"∞":a.drawRange.count}</span>
        </div>
      </div>
    </div>

    ${Wi(a.attributes)}
    ${a.boundingBox?qi(a.boundingBox):""}
    ${a.boundingSphere?Yi(a.boundingSphere):""}
    ${a.groups.length>0?Xi(a.groups):""}
    ${a.morphAttributes&&a.morphAttributes.length>0?Zi(a.morphAttributes):""}

    <div class="inspector-actions">
      <button class="action-btn ${e.geometryVisualization.boundingBox.has(a.uuid)?"active":""}" data-action="toggle-bbox" data-uuid="${a.uuid}">
        <span class="btn-icon">📦</span>
        Bounds
      </button>
      <button class="action-btn ${e.geometryVisualization.wireframe.has(a.uuid)?"active":""}" data-action="toggle-wireframe" data-uuid="${a.uuid}">
        <span class="btn-icon">🔲</span>
        Wireframe
      </button>
      <button class="action-btn ${e.geometryVisualization.normals.has(a.uuid)?"active":""}" data-action="toggle-normals" data-uuid="${a.uuid}">
        <span class="btn-icon">↗️</span>
        Normals
      </button>
    </div>
  `}function Wi(a){return a.length===0?"":`
    <div class="inspector-section">
      <div class="section-title">Attributes (${a.length})</div>
      <table class="attributes-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Size</th>
            <th>Type</th>
            <th>Memory</th>
          </tr>
        </thead>
        <tbody>
          ${a.map(e=>`
            <tr>
              <td>
                <span class="attr-name">${e.name}</span>
                ${e.isInstancedAttribute?'<span class="badge transparent">instanced</span>':""}
              </td>
              <td class="attr-count">${Be(e.count)} × ${e.itemSize}</td>
              <td class="attr-type">${Ti(e.arrayType)}${e.normalized?" (N)":""}</td>
              <td class="attr-size">${ye(e.memoryBytes)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `}function qi(a){const e=Math.abs(a.max.x-a.min.x),t=Math.abs(a.max.y-a.min.y),s=Math.abs(a.max.z-a.min.z);return`
    <div class="inspector-section">
      <div class="section-title">Bounding Box</div>
      <div class="bounding-box-viz">
        <div class="coord-row">
          <span class="coord-label">Min</span>
          <span class="coord-values">(${a.min.x.toFixed(2)}, ${a.min.y.toFixed(2)}, ${a.min.z.toFixed(2)})</span>
        </div>
        <div class="coord-row">
          <span class="coord-label">Max</span>
          <span class="coord-values">(${a.max.x.toFixed(2)}, ${a.max.y.toFixed(2)}, ${a.max.z.toFixed(2)})</span>
        </div>
        <div class="box-dimensions">
          Dimensions: <span class="dim-value">${e.toFixed(2)}</span> × <span class="dim-value">${t.toFixed(2)}</span> × <span class="dim-value">${s.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `}function Yi(a){return`
    <div class="inspector-section">
      <div class="section-title">Bounding Sphere</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Center</span>
          <span class="property-value vector">(${a.center.x.toFixed(2)}, ${a.center.y.toFixed(2)}, ${a.center.z.toFixed(2)})</span>
        </div>
        <div class="property-row">
          <span class="property-label">Radius</span>
          <span class="property-value">${a.radius.toFixed(3)}</span>
        </div>
      </div>
    </div>
  `}function Xi(a){return`
    <div class="inspector-section">
      <div class="section-title">Groups (${a.length})</div>
      <div class="groups-list">
        ${a.map((e,t)=>`
          <div class="group-item">
            <span class="group-index">#${t}</span>
            <span class="group-range">${e.start} → ${e.start+e.count}</span>
            <span class="group-material">Mat[${e.materialIndex}]</span>
          </div>
        `).join("")}
      </div>
    </div>
  `}function Zi(a){return`
    <div class="inspector-section">
      <div class="section-title">Morph Targets</div>
      <div class="morph-list">
        ${a.map(e=>`
          <div class="morph-item">
            <span class="morph-name">${e.name}</span>
            <span class="morph-count">×${e.count}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `}function Ji(a,e,t,s,r){a.querySelectorAll('[data-action="select-geometry"]').forEach(n=>{const i=n,o=i.dataset.uuid;i.addEventListener("click",()=>{if(!o)return;const l=t.selectedGeometryId===o?null:o;s({selectedGeometryId:l}),r()})}),a.querySelectorAll(".action-btn").forEach(n=>{const i=n,o=i.dataset.action,l=i.dataset.uuid;!o||!l||i.addEventListener("click",c=>{c.stopPropagation(),Ki(o,l,e,t,s,r)})})}function Ki(a,e,t,s,r,n){const i=s.geometryVisualization;switch(a){case"toggle-bbox":{const o=new Set(i.boundingBox);o.has(e)?o.delete(e):o.add(e),r({geometryVisualization:{...i,boundingBox:o}}),t.sendCommand({type:"geometry-visualization",geometryUuid:e,visualization:"boundingBox",enabled:o.has(e)}),n();break}case"toggle-wireframe":{const o=new Set(i.wireframe);o.has(e)?o.delete(e):o.add(e),r({geometryVisualization:{...i,wireframe:o}}),t.sendCommand({type:"geometry-visualization",geometryUuid:e,visualization:"wireframe",enabled:o.has(e)}),n();break}case"toggle-normals":{const o=new Set(i.normals);o.has(e)?o.delete(e):o.add(e),r({geometryVisualization:{...i,normals:o}}),t.sendCommand({type:"geometry-visualization",geometryUuid:e,visualization:"normals",enabled:o.has(e)}),n();break}}}function Qi(a,e){const t=a.snapshot?.textures,s=a.snapshot?.texturesSummary;if(!t?.length)return`
      <div class="panel-empty-state">
        <div class="empty-icon">🖼️</div>
        <h2>No Textures</h2>
        <p>No textures found in observed scenes.</p>
        <p class="hint">Make sure scenes are being observed and contain materials with textures.</p>
      </div>
    `;const r=e.selectedTextureId?t.find(n=>n.uuid===e.selectedTextureId):null;return`
    <div class="panel-split-view textures-split-view">
      <div class="panel-list textures-list-panel">
        ${ea(s)}
        <div class="textures-list">
          ${t.map(n=>ta(n,e)).join("")}
        </div>
      </div>
      <div class="panel-inspector textures-inspector-panel">
        ${r?ra(r,e):sa()}
      </div>
    </div>
  `}function ea(a){return a?`
    <div class="panel-summary textures-summary">
      <div class="summary-stat">
        <span class="summary-value">${a.totalCount}</span>
        <span class="summary-label">Textures</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${ye(a.totalMemoryBytes)}</span>
        <span class="summary-label">GPU Memory</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${a.cubeTextureCount}</span>
        <span class="summary-label">Cube Maps</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${a.compressedCount}</span>
        <span class="summary-label">Compressed</span>
      </div>
    </div>
  `:""}function ta(a,e){const t=e.selectedTextureId===a.uuid,s=a.name||`<${a.type}>`,r=jr(a),n=a.dimensions.width>0?`${a.dimensions.width}×${a.dimensions.height}`:"Unknown";return`
    <div class="list-item texture-item ${t?"selected":""}" data-uuid="${a.uuid}" data-action="select-texture">
      <div class="texture-item-thumbnail">
        ${a.thumbnail?`<img src="${a.thumbnail}" alt="${H(s)}" class="texture-thumb-img" />`:`<div class="texture-thumb-placeholder">${r}</div>`}
      </div>
      <div class="texture-item-info">
        <div class="texture-item-name">${H(s)}</div>
        <div class="texture-item-meta">
          <span>${a.type}</span>
          <span>${n}</span>
        </div>
      </div>
      <div class="texture-item-badges">
        ${a.isCubeTexture?'<span class="badge cube">Cube</span>':""}
        ${a.isCompressed?'<span class="badge compressed">DXT</span>':""}
        ${a.isVideoTexture?'<span class="badge video">Video</span>':""}
        ${a.isRenderTarget?'<span class="badge rt">RT</span>':""}
        ${a.mipmaps.enabled?'<span class="badge mip">MIP</span>':""}
      </div>
      <div class="texture-item-stats">
        <span class="tex-stat-pill memory">${ye(a.memoryBytes)}</span>
      </div>
      <div class="texture-item-usage">${a.usageCount}×</div>
    </div>
  `}function sa(){return`
    <div class="no-selection">
      <div class="no-selection-icon">🖼️</div>
      <div class="no-selection-text">Select a texture to inspect</div>
    </div>
  `}function ra(a,e){const t=jr(a),s=a.dimensions.width>0?`${a.dimensions.width} × ${a.dimensions.height}`:"Unknown";return`
    <div class="inspector-header texture-header">
      <div class="texture-header-thumb">
        ${a.thumbnail?`<img src="${a.thumbnail}" alt="Preview" class="texture-header-img" />`:`<div class="texture-header-placeholder">${t}</div>`}
      </div>
      <div class="inspector-header-text">
        <span class="inspector-title">${H(a.name||`<${a.type}>`)}</span>
        <span class="inspector-subtitle">${a.type}</span>
      </div>
      <span class="inspector-uuid">${a.uuid.substring(0,8)}</span>
    </div>

    ${a.thumbnail?na(a,e):""}

    <div class="inspector-section">
      <div class="section-title">Overview</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Dimensions</span>
          <span class="property-value">${s}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Format</span>
          <span class="property-value type-badge">${a.formatName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Data Type</span>
          <span class="property-value">${a.dataTypeName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Memory (est.)</span>
          <span class="property-value memory-value">${ye(a.memoryBytes)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Color Space</span>
          <span class="property-value">${a.colorSpace}</span>
        </div>
      </div>
    </div>

    ${ia(a)}
    ${aa(a)}
    ${oa(a)}
    ${la(a)}
    ${ca(a)}
    ${da(a)}
  `}function na(a,e){return a.thumbnail?`
    <div class="inspector-section texture-preview-section">
      <div class="section-title">Preview</div>
      <div class="texture-preview-container">
        <img src="${a.thumbnail}" alt="Texture Preview" class="texture-preview-img channel-${e.texturePreviewChannel}" />
        <div class="texture-channel-toggles">
          <button class="channel-btn ${e.texturePreviewChannel==="rgb"?"active":""}" data-channel="rgb" title="RGB">RGB</button>
          <button class="channel-btn ${e.texturePreviewChannel==="r"?"active":""}" data-channel="r" title="Red Channel">R</button>
          <button class="channel-btn ${e.texturePreviewChannel==="g"?"active":""}" data-channel="g" title="Green Channel">G</button>
          <button class="channel-btn ${e.texturePreviewChannel==="b"?"active":""}" data-channel="b" title="Blue Channel">B</button>
          <button class="channel-btn ${e.texturePreviewChannel==="a"?"active":""}" data-channel="a" title="Alpha Channel">A</button>
        </div>
      </div>
    </div>
  `:""}function ia(a){const e=a.source;return`
    <div class="inspector-section">
      <div class="section-title">Source</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Type</span>
          <span class="property-value type-badge">${e.type}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Loaded</span>
          <span class="property-value ${e.isLoaded?"value-true":"value-false"}">${e.isLoaded?"Yes":"No"}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Ready</span>
          <span class="property-value ${e.isReady?"value-true":"value-false"}">${e.isReady?"Yes":"No"}</span>
        </div>
        ${e.url?`
        <div class="property-row url-row">
          <span class="property-label">URL</span>
          <span class="property-value texture-url" title="${H(e.url)}">${ki(e.url)}</span>
        </div>
        `:""}
      </div>
    </div>
  `}function aa(a){const e=a.mipmaps;return`
    <div class="inspector-section">
      <div class="section-title">Mipmaps</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Enabled</span>
          <span class="property-value ${e.enabled?"value-true":"value-false"}">${e.enabled?"Yes":"No"}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Generate</span>
          <span class="property-value ${e.generateMipmaps?"value-true":"value-false"}">${e.generateMipmaps?"Auto":"Manual"}</span>
        </div>
        ${e.count>0?`
        <div class="property-row">
          <span class="property-label">Levels</span>
          <span class="property-value">${e.count}</span>
        </div>
        `:""}
      </div>
    </div>
  `}function oa(a){return`
    <div class="inspector-section">
      <div class="section-title">Filtering</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Mag Filter</span>
          <span class="property-value type-badge">${a.filtering.magName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Min Filter</span>
          <span class="property-value type-badge">${a.filtering.minName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Anisotropy</span>
          <span class="property-value">${a.anisotropy}×</span>
        </div>
      </div>
    </div>
  `}function la(a){return`
    <div class="inspector-section">
      <div class="section-title">Wrapping</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Wrap S</span>
          <span class="property-value type-badge">${a.wrap.sName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Wrap T</span>
          <span class="property-value type-badge">${a.wrap.tName}</span>
        </div>
      </div>
    </div>
  `}function ca(a){return`
    <div class="inspector-section">
      <div class="section-title">Flags</div>
      <div class="texture-flags">
        <div class="flag-item ${a.flipY?"enabled":""}">
          <span class="flag-icon">↕️</span>
          <span class="flag-label">Flip Y</span>
        </div>
        <div class="flag-item ${a.premultiplyAlpha?"enabled":""}">
          <span class="flag-icon">α</span>
          <span class="flag-label">Premultiply Alpha</span>
        </div>
        <div class="flag-item ${a.isCompressed?"enabled":""}">
          <span class="flag-icon">📦</span>
          <span class="flag-label">Compressed</span>
        </div>
        <div class="flag-item ${a.isCubeTexture?"enabled":""}">
          <span class="flag-icon">🎲</span>
          <span class="flag-label">Cube Map</span>
        </div>
        <div class="flag-item ${a.isDataTexture?"enabled":""}">
          <span class="flag-icon">📊</span>
          <span class="flag-label">Data Texture</span>
        </div>
        <div class="flag-item ${a.isRenderTarget?"enabled":""}">
          <span class="flag-icon">🎯</span>
          <span class="flag-label">Render Target</span>
        </div>
      </div>
    </div>
  `}function da(a){return a.usedByMaterials.length===0?`
      <div class="inspector-section">
        <div class="section-title">Usage</div>
        <div class="no-usage">Not used by any materials</div>
      </div>
    `:`
    <div class="inspector-section">
      <div class="section-title">Usage (${a.usedByMaterials.length})</div>
      <div class="texture-usage-list">
        ${a.usedByMaterials.map(e=>`
          <div class="texture-usage-item">
            <span class="usage-slot">${e.slot}</span>
            <span class="usage-material">${H(e.materialName)}</span>
            <span class="usage-uuid">${e.materialUuid.substring(0,8)}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `}function ha(a,e,t,s,r){a.querySelectorAll('[data-action="select-texture"]').forEach(n=>{const i=n,o=i.dataset.uuid;i.addEventListener("click",()=>{if(!o)return;const l=t.selectedTextureId===o?null:o;s({selectedTextureId:l}),r()})}),a.querySelectorAll(".channel-btn").forEach(n=>{const i=n,o=i.dataset.channel;i.addEventListener("click",()=>{o&&(s({texturePreviewChannel:o}),r())})})}function Gr(a){switch(a){case"shadow-map":return"Shadow Map";case"post-process":return"Post Process";case"reflection":return"Reflection";case"refraction":return"Refraction";case"environment":return"Environment";case"picker":return"Picker";case"custom":return"Custom";default:return"Unknown"}}function Ur(a){switch(a.usage){case"shadow-map":return"🌑";case"post-process":return"✨";case"reflection":return"🪞";case"refraction":return"💎";case"environment":return"🌍";case"picker":return"🎯";case"custom":return"🔧";default:return"📺"}}function pa(a){switch(a){case"shadow-map":return"shadow";case"post-process":return"postprocess";case"reflection":return"reflection";case"refraction":return"refraction";case"environment":return"environment";default:return""}}function ua(a,e){const t=a.snapshot?.renderTargets,s=a.snapshot?.renderTargetsSummary;if(!t?.length)return`
      <div class="panel-empty-state">
        <div class="empty-icon">📺</div>
        <h2>No Render Targets</h2>
        <p>No render targets found in observed scenes.</p>
        <p class="hint">Render targets are created for effects like shadows, reflections, and post-processing.</p>
      </div>
    `;const r=e.selectedRenderTargetId?t.find(n=>n.uuid===e.selectedRenderTargetId):null;return`
    <div class="panel-split-view render-targets-split-view">
      <div class="panel-list render-targets-list-panel">
        ${ma(s)}
        <div class="render-targets-grid">
          ${t.map(n=>ga(n,e)).join("")}
        </div>
      </div>
      <div class="panel-inspector render-targets-inspector-panel">
        ${r?ba(r,e):fa()}
      </div>
    </div>
  `}function ma(a){return a?`
    <div class="panel-summary render-targets-summary">
      <div class="summary-stat">
        <span class="summary-value">${a.totalCount}</span>
        <span class="summary-label">Targets</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${ye(a.totalMemoryBytes)}</span>
        <span class="summary-label">GPU Memory</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${a.shadowMapCount}</span>
        <span class="summary-label">Shadows</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${a.postProcessCount}</span>
        <span class="summary-label">Post FX</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${a.msaaCount}</span>
        <span class="summary-label">MSAA</span>
      </div>
    </div>
  `:""}function ga(a,e){const t=e.selectedRenderTargetId===a.uuid,s=a.name||`<${a.type}>`,r=Ur(a),n=`${a.dimensions.width}×${a.dimensions.height}`;return`
    <div class="rt-grid-item ${t?"selected":""}" data-uuid="${a.uuid}" data-action="select-render-target">
      <div class="rt-grid-thumbnail">
        ${a.thumbnail?`<img src="${a.thumbnail}" alt="${H(s)}" class="rt-thumb-img" />`:`<div class="rt-thumb-placeholder">${r}</div>`}
        ${a.hasDepthTexture?'<div class="rt-depth-indicator" title="Has Depth Texture">D</div>':""}
        ${a.samples>0?`<div class="rt-msaa-indicator" title="${a.samples}x MSAA">${a.samples}x</div>`:""}
      </div>
      <div class="rt-grid-info">
        <div class="rt-grid-name" title="${H(s)}">${H(s)}</div>
        <div class="rt-grid-meta">
          <span class="rt-dimensions">${n}</span>
          <span class="rt-usage-badge ${pa(a.usage)}">${Gr(a.usage)}</span>
        </div>
        <div class="rt-grid-stats">
          <span class="rt-memory">${ye(a.memoryBytes)}</span>
          ${a.colorAttachmentCount>1?`<span class="rt-mrt-badge">MRT×${a.colorAttachmentCount}</span>`:""}
        </div>
      </div>
    </div>
  `}function fa(){return`
    <div class="no-selection">
      <div class="no-selection-icon">📺</div>
      <div class="no-selection-text">Select a render target to inspect</div>
    </div>
  `}function ba(a,e){const t=Ur(a),s=`${a.dimensions.width} × ${a.dimensions.height}`;return`
    <div class="inspector-header rt-header">
      <div class="rt-header-thumb">
        ${a.thumbnail?`<img src="${a.thumbnail}" alt="Preview" class="rt-header-img" />`:`<div class="rt-header-placeholder">${t}</div>`}
      </div>
      <div class="inspector-header-text">
        <span class="inspector-title">${H(a.name||`<${a.type}>`)}</span>
        <span class="inspector-subtitle">${a.type}</span>
      </div>
      <span class="inspector-uuid">${a.uuid.substring(0,8)}</span>
    </div>

    ${ya(a,e)}

    <div class="inspector-section">
      <div class="section-title">Overview</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Dimensions</span>
          <span class="property-value">${s}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Usage</span>
          <span class="property-value type-badge rt-usage-${a.usage}">${Gr(a.usage)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Format</span>
          <span class="property-value type-badge">${a.textureFormatName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Data Type</span>
          <span class="property-value">${a.textureTypeName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Memory (est.)</span>
          <span class="property-value memory-value">${ye(a.memoryBytes)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Color Space</span>
          <span class="property-value">${a.colorSpace}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Render Count</span>
          <span class="property-value">${a.renderCount.toLocaleString()}</span>
        </div>
      </div>
    </div>

    ${va(a)}
    ${xa(a)}
    ${wa(a)}
    ${Ma(a)}
    ${Sa(a)}
  `}function ya(a,e){if(!(a.thumbnail||a.depthThumbnail))return"";const s=e.renderTargetPreviewMode,n=(s==="depth"||s==="heatmap")&&a.depthThumbnail?a.depthThumbnail:a.thumbnail;return`
    <div class="inspector-section rt-preview-section">
      <div class="section-title">Preview</div>
      <div class="rt-preview-container">
        ${n?`<img src="${n}" alt="Render Target Preview" class="rt-preview-img channel-${s}" style="transform: scale(${e.renderTargetZoom})" />`:'<div class="rt-preview-placeholder">No preview available</div>'}
        <div class="rt-preview-controls">
          <div class="rt-channel-toggles">
            <button class="channel-btn ${s==="color"?"active":""}" data-mode="color" title="Color (RGB)">RGB</button>
            <button class="channel-btn ${s==="r"?"active":""}" data-mode="r" title="Red Channel">R</button>
            <button class="channel-btn ${s==="g"?"active":""}" data-mode="g" title="Green Channel">G</button>
            <button class="channel-btn ${s==="b"?"active":""}" data-mode="b" title="Blue Channel">B</button>
            <button class="channel-btn ${s==="a"?"active":""}" data-mode="a" title="Alpha Channel">A</button>
            ${a.hasDepthTexture?`
              <span class="channel-separator"></span>
              <button class="channel-btn depth ${s==="depth"?"active":""}" data-mode="depth" title="Depth">Depth</button>
              <button class="channel-btn heatmap ${s==="heatmap"?"active":""}" data-mode="heatmap" title="Depth Heatmap">🌡️</button>
            `:""}
          </div>
          <div class="rt-zoom-controls">
            <button class="zoom-btn" data-zoom="out" title="Zoom Out">−</button>
            <span class="zoom-level">${Math.round(e.renderTargetZoom*100)}%</span>
            <button class="zoom-btn" data-zoom="in" title="Zoom In">+</button>
            <button class="zoom-btn" data-zoom="fit" title="Fit to View">⊡</button>
          </div>
        </div>
        <div class="rt-pixel-info" id="rt-pixel-info">
          <span class="pixel-coords">—</span>
          <span class="pixel-value">Hover to inspect</span>
        </div>
      </div>
    </div>
  `}function va(a){return`
    <div class="inspector-section">
      <div class="section-title">Buffers</div>
      <div class="rt-buffers">
        <div class="rt-buffer-item ${a.depthBuffer?"enabled":""}">
          <span class="buffer-icon">📐</span>
          <span class="buffer-label">Depth Buffer</span>
          <span class="buffer-status">${a.depthBuffer?"Enabled":"Disabled"}</span>
        </div>
        <div class="rt-buffer-item ${a.stencilBuffer?"enabled":""}">
          <span class="buffer-icon">✂️</span>
          <span class="buffer-label">Stencil Buffer</span>
          <span class="buffer-status">${a.stencilBuffer?"Enabled":"Disabled"}</span>
        </div>
        <div class="rt-buffer-item ${a.hasDepthTexture?"enabled":""}">
          <span class="buffer-icon">🗺️</span>
          <span class="buffer-label">Depth Texture</span>
          <span class="buffer-status">${a.hasDepthTexture?a.depthTextureFormatName||"Yes":"None"}</span>
        </div>
        ${a.samples>0?`
        <div class="rt-buffer-item enabled msaa">
          <span class="buffer-icon">🔲</span>
          <span class="buffer-label">MSAA</span>
          <span class="buffer-status">${a.samples}x samples</span>
        </div>
        `:""}
      </div>
    </div>
  `}function xa(a){return a.colorAttachmentCount<=1?"":`
    <div class="inspector-section">
      <div class="section-title">Multiple Render Targets</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Color Attachments</span>
          <span class="property-value mrt-value">${a.colorAttachmentCount}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Total Size</span>
          <span class="property-value">${a.dimensions.width} × ${a.dimensions.height} × ${a.colorAttachmentCount}</span>
        </div>
      </div>
      <div class="mrt-attachments">
        ${Array.from({length:a.colorAttachmentCount},(e,t)=>`
          <div class="mrt-attachment">
            <span class="attachment-index">${t}</span>
            <span class="attachment-format">${a.textureFormatName}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `}function wa(a){return`
    <div class="inspector-section">
      <div class="section-title">Filtering</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Mag Filter</span>
          <span class="property-value type-badge">${a.filtering.magName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Min Filter</span>
          <span class="property-value type-badge">${a.filtering.minName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Generate Mipmaps</span>
          <span class="property-value ${a.generateMipmaps?"value-true":"value-false"}">${a.generateMipmaps?"Yes":"No"}</span>
        </div>
      </div>
    </div>
  `}function Ma(a){return`
    <div class="inspector-section">
      <div class="section-title">Wrapping</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Wrap S</span>
          <span class="property-value type-badge">${a.wrap.sName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Wrap T</span>
          <span class="property-value type-badge">${a.wrap.tName}</span>
        </div>
        ${a.scissorTest?`
        <div class="property-row">
          <span class="property-label">Scissor Test</span>
          <span class="property-value value-true">Enabled</span>
        </div>
        `:""}
      </div>
    </div>
  `}function Sa(a){return`
    <div class="inspector-actions rt-actions">
      <button class="action-btn" data-action="save-color" data-uuid="${a.uuid}" title="Save color attachment as image">
        <span class="btn-icon">💾</span>
        Save Color
      </button>
      ${a.hasDepthTexture?`
      <button class="action-btn" data-action="save-depth" data-uuid="${a.uuid}" title="Save depth texture as image">
        <span class="btn-icon">🗺️</span>
        Save Depth
      </button>
      `:""}
      <button class="action-btn" data-action="refresh" data-uuid="${a.uuid}" title="Refresh preview">
        <span class="btn-icon">🔄</span>
        Refresh
      </button>
    </div>
  `}function ka(a,e,t,s,r){a.querySelectorAll('[data-action="select-render-target"]').forEach(o=>{const l=o,c=l.dataset.uuid;l.addEventListener("click",d=>{if(d.stopPropagation(),!c)return;const h=t.selectedRenderTargetId===c?null:c;s({selectedRenderTargetId:h}),r()})}),a.querySelectorAll(".rt-channel-toggles .channel-btn").forEach(o=>{const l=o,c=l.dataset.mode;l.addEventListener("click",()=>{c&&(s({renderTargetPreviewMode:c}),r())})}),a.querySelectorAll(".zoom-btn").forEach(o=>{const l=o,c=l.dataset.zoom;l.addEventListener("click",()=>{if(!c)return;let d=t.renderTargetZoom;switch(c){case"in":d=Math.min(4,d*1.25);break;case"out":d=Math.max(.25,d/1.25);break;case"fit":d=1;break}s({renderTargetZoom:d}),r()})}),a.querySelectorAll('[data-action="save-color"], [data-action="save-depth"]').forEach(o=>{const l=o,c=l.dataset.action,d=l.dataset.uuid;l.addEventListener("click",()=>{if(!d)return;const h=e.snapshot?.renderTargets?.find(m=>m.uuid===d);if(!h)return;const p=c==="save-depth"&&h.depthThumbnail?h.depthThumbnail:h.thumbnail;if(!p)return;const u=document.createElement("a");u.href=p,u.download=`${h.name||"render-target"}-${c==="save-depth"?"depth":"color"}.png`,document.body.appendChild(u),u.click(),document.body.removeChild(u)})});const n=a.querySelector(".rt-preview-img"),i=a.querySelector("#rt-pixel-info");n&&i&&(n.addEventListener("mousemove",o=>{const l=n.getBoundingClientRect(),c=Math.floor((o.clientX-l.left)/l.width*n.naturalWidth),d=Math.floor((o.clientY-l.top)/l.height*n.naturalHeight),h=i.querySelector(".pixel-coords"),p=i.querySelector(".pixel-value");h&&(h.textContent=`(${c}, ${d})`),p&&(p.textContent="Inspecting...")}),n.addEventListener("mouseleave",()=>{const o=i.querySelector(".pixel-coords"),l=i.querySelector(".pixel-value");o&&(o.textContent="—"),l&&(l.textContent="Hover to inspect")}))}const Ca=`
/* 3Lens Theme Variables */
:root {
  --3lens-font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
  --3lens-font-sans: 'Geist', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;

  --3lens-bg-primary: #0a0e14;
  --3lens-bg-secondary: #0f1419;
  --3lens-bg-tertiary: #151b23;
  --3lens-bg-elevated: #1a222c;
  --3lens-bg-hover: #1f2937;

  --3lens-border: #2d3748;
  --3lens-border-subtle: #1e2738;
  --3lens-border-focus: #3b82f6;

  --3lens-text-primary: #e4e7eb;
  --3lens-text-secondary: #9ca3af;
  --3lens-text-tertiary: #6b7280;
  --3lens-text-disabled: #4b5563;

  --3lens-accent-blue: #60a5fa;
  --3lens-accent-cyan: #22d3ee;
  --3lens-accent-emerald: #34d399;
  --3lens-accent-amber: #fbbf24;
  --3lens-accent-rose: #fb7185;
  --3lens-accent-violet: #a78bfa;
  --3lens-accent-pink: #f472b6;

  --3lens-success: #10b981;
  --3lens-warning: #f59e0b;
  --3lens-error: #ef4444;

  --3lens-color-scene: #34d399;
  --3lens-color-mesh: #60a5fa;
  --3lens-color-group: #a78bfa;
  --3lens-color-light: #fbbf24;
  --3lens-color-camera: #f472b6;

  --3lens-radius-sm: 4px;
  --3lens-radius-md: 6px;
  --3lens-radius-lg: 8px;
  --3lens-radius-xl: 12px;

  --3lens-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --3lens-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
  --3lens-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
}
`,Ta=`
/* ═══════════════════════════════════════════════════════════════
   SHARED PANEL STYLES
   ═══════════════════════════════════════════════════════════════ */

/* Empty State */
.panel-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  text-align: center;
  padding: 32px;
  color: var(--3lens-text-secondary);
}

.panel-empty-state .empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.8;
}

.panel-empty-state h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  margin-bottom: 8px;
}

.panel-empty-state p {
  color: var(--3lens-text-secondary);
  max-width: 300px;
  margin: 0;
}

.panel-empty-state .hint {
  margin-top: 12px;
  font-size: 11px;
  color: var(--3lens-text-tertiary);
}

/* Split View Layout */
.panel-split-view {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.panel-list {
  flex: 1;
  min-width: 280px;
  overflow: auto;
  border-right: 1px solid var(--3lens-border);
}

.panel-inspector {
  width: 320px;
  min-width: 260px;
  max-width: 440px;
  overflow: auto;
  background: var(--3lens-bg-secondary);
}

/* Summary Bar */
.panel-summary {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(180deg, var(--3lens-bg-tertiary), var(--3lens-bg-secondary));
  border-bottom: 1px solid var(--3lens-border);
}

.summary-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: var(--3lens-bg-primary);
  border-radius: var(--3lens-radius-md);
  border: 1px solid var(--3lens-border-subtle);
}

.summary-value {
  font-size: 18px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
}

.summary-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
  margin-top: 2px;
}

/* Search Bar */
.panel-search {
  position: relative;
  padding: 8px 12px;
  background: var(--3lens-bg-secondary);
  border-bottom: 1px solid var(--3lens-border-subtle);
}

.search-input {
  width: 100%;
  padding: 8px 32px 8px 12px;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-md);
  color: var(--3lens-text-primary);
  font-size: 12px;
  font-family: var(--3lens-font-sans);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-input:focus {
  border-color: var(--3lens-accent-blue);
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
}

.search-input::placeholder {
  color: var(--3lens-text-tertiary);
}

.search-clear {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  padding: 0;
  background: var(--3lens-bg-tertiary);
  border: none;
  border-radius: 50%;
  color: var(--3lens-text-secondary);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, color 0.15s ease;
}

.search-clear:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

.no-results {
  padding: 24px;
  text-align: center;
  color: var(--3lens-text-tertiary);
  font-size: 12px;
}

/* List Items */
.list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--3lens-radius-md);
  cursor: pointer;
  transition: all 120ms ease;
  margin: 4px 8px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid transparent;
}

.list-item:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-border);
}

.list-item.selected {
  background: rgba(96, 165, 250, 0.15);
  border-color: var(--3lens-accent-blue);
  box-shadow: inset 3px 0 0 var(--3lens-accent-cyan);
}

/* No Selection State */
.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 24px;
}

.no-selection-icon {
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.6;
}

.no-selection-text {
  font-size: 12px;
}

/* Inspector Header */
.inspector-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(180deg, var(--3lens-bg-tertiary), var(--3lens-bg-secondary));
  border-bottom: 1px solid var(--3lens-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.inspector-header-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.inspector-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inspector-subtitle {
  font-size: 11px;
  color: var(--3lens-text-tertiary);
  font-family: var(--3lens-font-mono);
}

.inspector-uuid {
  font-family: var(--3lens-font-mono);
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  background: var(--3lens-bg-tertiary);
  padding: 2px 6px;
  border-radius: 3px;
}

/* Inspector Sections */
.inspector-section {
  padding: 12px;
  border-bottom: 1px solid var(--3lens-border-subtle);
}

.section-title {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 8px;
}

/* Property Grid */
.property-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.property-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.property-label {
  color: var(--3lens-text-secondary);
}

.property-value {
  font-family: var(--3lens-font-mono);
  font-size: 11px;
  color: var(--3lens-text-primary);
  text-align: right;
}

.property-value.vector {
  color: var(--3lens-accent-cyan);
  font-size: 10px;
}

.property-value.type-badge {
  background: var(--3lens-bg-tertiary);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
}

.property-value.value-true {
  color: var(--3lens-accent-emerald);
}

.property-value.value-false {
  color: var(--3lens-text-tertiary);
}

.property-value.memory-value {
  color: var(--3lens-accent-pink);
  font-weight: 500;
}

/* Badges */
.badge {
  font-size: 9px;
  font-weight: 600;
  padding: 2px 5px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.badge.shader {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: #fff;
}

.badge.transparent {
  background: rgba(34, 211, 238, 0.2);
  color: var(--3lens-accent-cyan);
  border: 1px solid rgba(34, 211, 238, 0.3);
}

.badge.textures {
  background: var(--3lens-bg-primary);
  color: var(--3lens-text-secondary);
  border: 1px solid var(--3lens-border);
}

.badge.cube {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: #fff;
}

.badge.compressed {
  background: rgba(251, 191, 36, 0.2);
  color: var(--3lens-accent-amber);
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.badge.video {
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: #fff;
}

/* Used By Section */
.used-by-section {
  padding: 12px;
  border-bottom: 1px solid var(--3lens-border-subtle);
}

.used-by-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.used-by-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--3lens-bg-primary);
  border-radius: var(--3lens-radius-sm);
  cursor: pointer;
  transition: background 0.15s ease;
}

.used-by-item:hover {
  background: var(--3lens-bg-hover);
}

.used-by-item .mesh-icon {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--3lens-color-mesh);
  color: #000;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 700;
}

.used-by-item .mesh-name {
  font-size: 12px;
  color: var(--3lens-text-primary);
}

.badge.rt {
  background: rgba(34, 211, 238, 0.2);
  color: var(--3lens-accent-cyan);
  border: 1px solid rgba(34, 211, 238, 0.3);
}

.badge.mip {
  background: var(--3lens-bg-primary);
  color: var(--3lens-text-secondary);
  border: 1px solid var(--3lens-border);
}

/* Color Swatch */
.color-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 6px;
  vertical-align: middle;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.color-swatch.large {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  flex-shrink: 0;
}

.color-swatch.no-color {
  background: var(--3lens-bg-primary);
  color: var(--3lens-text-tertiary);
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ═══════════════════════════════════════════════════════════════
   EDITABLE CONTROLS
   ═══════════════════════════════════════════════════════════════ */

.property-value.editable {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Color Picker */
.prop-color-input {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: transparent;
}

.prop-color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.prop-color-input::-webkit-color-swatch {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.color-hex {
  font-family: var(--3lens-font-mono);
  font-size: 10px;
  color: var(--3lens-text-secondary);
}

/* Range Slider */
.prop-range-input {
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--3lens-bg-primary);
  border-radius: 2px;
  cursor: pointer;
}

.prop-range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--3lens-accent-cyan);
  cursor: pointer;
  border: 2px solid var(--3lens-bg-primary);
  box-shadow: 0 0 4px rgba(34, 211, 238, 0.4);
  transition: transform 100ms ease;
}

.prop-range-input::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.prop-range-input.pbr-slider::-webkit-slider-thumb {
  background: linear-gradient(135deg, var(--3lens-accent-blue), var(--3lens-accent-cyan));
}

.prop-range-input.metalness::-webkit-slider-thumb {
  background: linear-gradient(135deg, var(--3lens-accent-amber), #fcd34d);
}

.range-value {
  font-family: var(--3lens-font-mono);
  font-size: 10px;
  color: var(--3lens-text-secondary);
  min-width: 32px;
  text-align: right;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 32px;
  height: 18px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: 18px;
  transition: all 150ms ease;
}

.toggle-slider::before {
  position: absolute;
  content: "";
  height: 12px;
  width: 12px;
  left: 2px;
  bottom: 2px;
  background: var(--3lens-text-tertiary);
  border-radius: 50%;
  transition: all 150ms ease;
}

.toggle-switch input:checked + .toggle-slider {
  background: rgba(34, 211, 238, 0.2);
  border-color: var(--3lens-accent-cyan);
}

.toggle-switch input:checked + .toggle-slider::before {
  background: var(--3lens-accent-cyan);
  transform: translateX(14px);
  box-shadow: 0 0 6px rgba(34, 211, 238, 0.5);
}

/* Select Dropdown */
.prop-select-input {
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: 4px;
  color: var(--3lens-text-primary);
  font-family: var(--3lens-font-mono);
  font-size: 10px;
  padding: 4px 24px 4px 8px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath fill='%239ca3af' d='M1 2l3 3 3-3z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  transition: all 100ms ease;
}

.prop-select-input:hover {
  border-color: var(--3lens-accent-cyan);
}

.prop-select-input:focus {
  outline: none;
  border-color: var(--3lens-accent-cyan);
  box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.2);
}

/* ═══════════════════════════════════════════════════════════════
   MATERIALS PANEL SPECIFIC
   ═══════════════════════════════════════════════════════════════ */

.materials-split-view .panel-list {
  min-width: 280px;
}

.materials-split-view .panel-inspector {
  width: 320px;
}

.material-item.selected {
  background: rgba(251, 113, 133, 0.15);
  border-color: var(--3lens-accent-rose);
  box-shadow: inset 3px 0 0 var(--3lens-accent-rose);
}

.material-item-color .color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
}

.material-item-info {
  flex: 1;
  min-width: 0;
}

.material-item-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--3lens-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-item-type {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  font-family: var(--3lens-font-mono);
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.type-icon {
  font-size: 8px;
  opacity: 0.7;
}

.material-item-badges {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.material-item-usage {
  font-size: 11px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
  flex-shrink: 0;
  padding: 2px 6px;
  background: var(--3lens-bg-primary);
  border-radius: 3px;
}

/* Shader Section */
.shader-section {
  background: var(--3lens-bg-primary);
}

.shader-subsection {
  margin-top: 12px;
}

.shader-subsection:first-child {
  margin-top: 0;
}

.subsection-title {
  font-size: 10px;
  font-weight: 500;
  color: var(--3lens-text-secondary);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.subsection-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--3lens-border-subtle);
}

/* Uniforms List */
.uniforms-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.uniform-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: var(--3lens-bg-tertiary);
  border-radius: 4px;
  font-size: 11px;
  font-family: var(--3lens-font-mono);
}

.uniform-type {
  font-size: 9px;
  color: var(--3lens-accent-blue);
  background: rgba(96, 165, 250, 0.15);
  padding: 2px 4px;
  border-radius: 3px;
  min-width: 52px;
  text-align: center;
}

.uniform-name {
  color: var(--3lens-text-primary);
  flex: 1;
}

.uniform-value {
  color: var(--3lens-text-tertiary);
  font-size: 10px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Defines List */
.defines-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.define-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  background: var(--3lens-bg-tertiary);
  border-radius: 3px;
  font-size: 10px;
  font-family: var(--3lens-font-mono);
}

.define-name {
  color: var(--3lens-accent-amber);
}

.define-value {
  color: var(--3lens-text-tertiary);
}

/* Shader Code */
.shader-code {
  background: #0d1117;
  border: 1px solid var(--3lens-border-subtle);
  border-radius: 6px;
  padding: 12px;
  margin: 0;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}

.shader-code code {
  font-family: var(--3lens-font-mono);
  font-size: 11px;
  line-height: 1.6;
  color: #c9d1d9;
  white-space: pre;
}

/* GLSL Syntax Highlighting */
.glsl-keyword { color: #ff7b72; font-weight: 500; }
.glsl-builtin { color: #d2a8ff; }
.glsl-builtin-var { color: #79c0ff; font-style: italic; }
.glsl-number { color: #a5d6ff; }
.glsl-string { color: #a5d6ff; }
.glsl-comment { color: #8b949e; font-style: italic; }
.glsl-preprocessor { color: #7ee787; }
.glsl-ident { color: #c9d1d9; }
.glsl-punct { color: #8b949e; }

/* Textures in materials */
.texture-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.texture-list .texture-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--3lens-bg-primary);
  border-radius: 4px;
  font-size: 11px;
}

.texture-slot {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-emerald);
  font-weight: 500;
  min-width: 100px;
}

.texture-uuid {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
  font-size: 10px;
}

.texture-name {
  color: var(--3lens-text-secondary);
  flex: 1;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ═══════════════════════════════════════════════════════════════
   GEOMETRY PANEL SPECIFIC
   ═══════════════════════════════════════════════════════════════ */

.geometry-split-view .panel-inspector {
  width: 340px;
  max-width: 480px;
}

.geometry-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.geometry-summary .summary-value {
  color: var(--3lens-accent-emerald);
}

.geometry-item.selected {
  background: rgba(52, 211, 153, 0.15);
  border-color: var(--3lens-accent-emerald);
  box-shadow: inset 3px 0 0 var(--3lens-accent-emerald);
}

.geometry-item-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--3lens-accent-emerald), #059669);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.geometry-item-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.geometry-item-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  row-gap: 4px;
}

.geometry-item-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--3lens-text-primary);
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.geometry-item-meta {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.geometry-used-by {
  color: var(--3lens-text-secondary);
}

.geometry-item-stats {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.geo-stat-pill {
  font-size: 9px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: var(--3lens-font-mono);
  background: var(--3lens-bg-primary);
  color: var(--3lens-text-secondary);
  border: 1px solid var(--3lens-border-subtle);
}

.geo-stat-pill.vertices {
  color: var(--3lens-accent-cyan);
  border-color: rgba(34, 211, 238, 0.3);
}

.geo-stat-pill.triangles {
  color: var(--3lens-accent-blue);
  border-color: rgba(96, 165, 250, 0.3);
}

.geo-stat-pill.memory {
  color: var(--3lens-accent-amber);
  border-color: rgba(251, 191, 36, 0.3);
}

.geo-stat-pill.usage {
  color: var(--3lens-text-secondary);
  border-color: var(--3lens-border);
}

.geometry-item-usage {
  font-size: 11px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
  flex-shrink: 0;
  padding: 2px 6px;
  background: var(--3lens-bg-primary);
  border-radius: 3px;
}

/* Attributes Table */
.attributes-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}

.attributes-table th,
.attributes-table td {
  font-size: 11px;
  padding: 6px 8px;
  text-align: left;
  border-bottom: 1px solid var(--3lens-border-subtle);
}

.attributes-table th {
  font-weight: 500;
  color: var(--3lens-text-tertiary);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: var(--3lens-bg-primary);
}

.attributes-table td {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-primary);
}

.attributes-table tr:hover {
  background: var(--3lens-bg-hover);
}

.attr-name {
  color: var(--3lens-accent-cyan);
  font-weight: 500;
}

.attr-type {
  color: var(--3lens-text-tertiary);
  font-size: 9px;
}

.attr-count {
  color: var(--3lens-text-secondary);
}

.attr-size {
  color: var(--3lens-accent-amber);
  text-align: right;
}

/* Bounding Box */
.bounding-box-viz {
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
}

.bounding-box-viz .coord-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.bounding-box-viz .coord-label {
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--3lens-text-tertiary);
  width: 40px;
}

.bounding-box-viz .coord-values {
  font-family: var(--3lens-font-mono);
  font-size: 11px;
  color: var(--3lens-accent-cyan);
}

.bounding-box-viz .box-dimensions {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--3lens-border-subtle);
  font-size: 11px;
  color: var(--3lens-text-secondary);
}

.bounding-box-viz .dim-value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-emerald);
}

/* Groups */
.groups-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: var(--3lens-bg-primary);
  border-radius: 4px;
  font-size: 11px;
  font-family: var(--3lens-font-mono);
}

.group-item .group-range {
  color: var(--3lens-text-secondary);
}

.group-item .group-material {
  color: var(--3lens-accent-rose);
}

/* Morph Targets */
.morph-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.morph-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 4px;
  font-size: 10px;
  font-family: var(--3lens-font-mono);
}

.morph-item .morph-name {
  color: #a78bfa;
}

.morph-item .morph-count {
  color: var(--3lens-text-tertiary);
}

/* Action Buttons */
.inspector-actions {
  display: flex;
  gap: 6px;
  padding: 12px;
  border-top: 1px solid var(--3lens-border);
  background: var(--3lens-bg-primary);
  position: sticky;
  bottom: 0;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: 6px;
  color: var(--3lens-text-secondary);
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 120ms ease;
}

.action-btn:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-accent-cyan);
  color: var(--3lens-text-primary);
}

.action-btn.active {
  background: rgba(34, 211, 238, 0.15);
  border-color: var(--3lens-accent-cyan);
  color: var(--3lens-accent-cyan);
}

.action-btn .btn-icon {
  font-size: 14px;
}

/* ═══════════════════════════════════════════════════════════════
   TEXTURES PANEL SPECIFIC
   ═══════════════════════════════════════════════════════════════ */

.textures-split-view .panel-list {
  min-width: 300px;
}

.textures-split-view .panel-inspector {
  width: 360px;
  max-width: 500px;
}

.textures-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.textures-summary .summary-value {
  color: var(--3lens-accent-pink);
}

.texture-item.selected {
  background: rgba(244, 114, 182, 0.15);
  border-color: var(--3lens-accent-pink);
  box-shadow: inset 3px 0 0 var(--3lens-accent-pink);
}

.texture-item-thumbnail {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
}

.texture-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
}

.texture-thumb-placeholder {
  font-size: 18px;
  opacity: 0.7;
}

.texture-item-info {
  flex: 1;
  min-width: 0;
}

.texture-item-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--3lens-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.texture-item-meta {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  font-family: var(--3lens-font-mono);
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.texture-item-badges {
  display: flex;
  gap: 3px;
  flex-shrink: 0;
}

.texture-item-stats {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.tex-stat-pill {
  font-size: 9px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: var(--3lens-font-mono);
  background: var(--3lens-bg-primary);
  color: var(--3lens-text-secondary);
  border: 1px solid var(--3lens-border-subtle);
}

.tex-stat-pill.memory {
  color: var(--3lens-accent-pink);
  border-color: rgba(244, 114, 182, 0.3);
}

.texture-item-usage {
  font-size: 11px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
  flex-shrink: 0;
  padding: 2px 6px;
  background: var(--3lens-bg-primary);
  border-radius: 3px;
}

/* Texture Header */
.texture-header-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
}

.texture-header-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
}

.texture-header-placeholder {
  font-size: 24px;
  opacity: 0.7;
}

/* Texture Preview */
.texture-preview-section {
  background: var(--3lens-bg-primary);
}

.texture-preview-container {
  position: relative;
  border: 1px solid var(--3lens-border-subtle);
  border-radius: 8px;
  overflow: hidden;
  background: repeating-conic-gradient(#1f2937 0% 25%, #0f1419 0% 50%) 50% / 16px 16px;
}

.texture-preview-img {
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  display: block;
  image-rendering: pixelated;
}

/* Channel filters */
.texture-preview-img.channel-rgb { /* No filter */ }
.texture-preview-img.channel-r { filter: grayscale(100%) sepia(100%) hue-rotate(-30deg) saturate(300%); }
.texture-preview-img.channel-g { filter: grayscale(100%) sepia(100%) hue-rotate(70deg) saturate(300%); }
.texture-preview-img.channel-b { filter: grayscale(100%) sepia(100%) hue-rotate(190deg) saturate(300%); }
.texture-preview-img.channel-a { filter: grayscale(100%); mix-blend-mode: luminosity; }

.texture-channel-toggles {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 2px;
  background: rgba(10, 14, 20, 0.9);
  border-radius: 4px;
  padding: 2px;
}

.channel-btn {
  padding: 4px 8px;
  background: transparent;
  border: none;
  color: var(--3lens-text-tertiary);
  font-size: 10px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  cursor: pointer;
  border-radius: 3px;
  transition: all 100ms ease;
}

.channel-btn:hover {
  color: var(--3lens-text-secondary);
  background: var(--3lens-bg-hover);
}

.channel-btn.active {
  background: var(--3lens-accent-pink);
  color: #000;
}

/* Texture URL */
.texture-url {
  font-size: 9px;
  color: var(--3lens-accent-cyan);
  word-break: break-all;
  cursor: help;
}

/* Texture Flags */
.texture-flags {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.flag-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--3lens-bg-primary);
  border-radius: 6px;
  border: 1px solid var(--3lens-border-subtle);
  opacity: 0.4;
}

.flag-item.enabled {
  opacity: 1;
  border-color: rgba(244, 114, 182, 0.3);
  background: rgba(244, 114, 182, 0.08);
}

.flag-icon {
  font-size: 14px;
}

.flag-label {
  font-size: 11px;
  color: var(--3lens-text-secondary);
}

.flag-item.enabled .flag-label {
  color: var(--3lens-text-primary);
}

/* Texture Usage */
.texture-usage-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.texture-usage-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: var(--3lens-bg-primary);
  border-radius: 4px;
  font-size: 11px;
}

.usage-slot {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-emerald);
  font-weight: 500;
  min-width: 100px;
}

.usage-material {
  color: var(--3lens-text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.usage-uuid {
  font-family: var(--3lens-font-mono);
  font-size: 10px;
  color: var(--3lens-text-tertiary);
}

.no-usage {
  font-size: 12px;
  color: var(--3lens-text-tertiary);
  font-style: italic;
  padding: 12px;
  text-align: center;
}

/* ═══════════════════════════════════════════════════════════════
   RENDER TARGETS PANEL SPECIFIC
   ═══════════════════════════════════════════════════════════════ */

.render-targets-split-view .panel-list {
  min-width: 320px;
}

.render-targets-split-view .panel-inspector {
  width: 400px;
  max-width: 520px;
}

.render-targets-summary {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
}

.render-targets-summary .summary-value {
  color: var(--3lens-accent-cyan);
}

/* Render Target Grid Layout */
.render-targets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
  padding: 12px;
}

.rt-grid-item {
  background: var(--3lens-bg-tertiary);
  border: 1px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 120ms ease;
}

.rt-grid-item:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-border);
  transform: translateY(-2px);
}

.rt-grid-item.selected {
  background: rgba(34, 211, 238, 0.12);
  border-color: var(--3lens-accent-cyan);
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.2);
}

.rt-grid-thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: repeating-conic-gradient(#1f2937 0% 25%, #0f1419 0% 50%) 50% / 12px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rt-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}

.rt-thumb-placeholder {
  font-size: 28px;
  opacity: 0.6;
}

.rt-depth-indicator,
.rt-msaa-indicator {
  position: absolute;
  bottom: 4px;
  font-size: 9px;
  font-weight: 700;
  font-family: var(--3lens-font-mono);
  padding: 2px 5px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.7);
}

.rt-depth-indicator {
  left: 4px;
  color: var(--3lens-accent-emerald);
  border: 1px solid rgba(52, 211, 153, 0.4);
}

.rt-msaa-indicator {
  right: 4px;
  color: var(--3lens-accent-blue);
  border: 1px solid rgba(96, 165, 250, 0.4);
}

.rt-grid-info {
  padding: 10px;
}

.rt-grid-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--3lens-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.rt-grid-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.rt-dimensions {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
}

.rt-usage-badge {
  font-size: 9px;
  font-weight: 600;
  padding: 2px 5px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: var(--3lens-bg-primary);
  color: var(--3lens-text-secondary);
  border: 1px solid var(--3lens-border-subtle);
}

.rt-usage-badge.shadow {
  background: rgba(30, 30, 30, 0.8);
  color: #9ca3af;
  border-color: rgba(156, 163, 175, 0.3);
}

.rt-usage-badge.postprocess {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
  border-color: rgba(139, 92, 246, 0.3);
}

.rt-usage-badge.reflection {
  background: rgba(96, 165, 250, 0.2);
  color: var(--3lens-accent-blue);
  border-color: rgba(96, 165, 250, 0.3);
}

.rt-usage-badge.refraction {
  background: rgba(34, 211, 238, 0.2);
  color: var(--3lens-accent-cyan);
  border-color: rgba(34, 211, 238, 0.3);
}

.rt-usage-badge.environment {
  background: rgba(52, 211, 153, 0.2);
  color: var(--3lens-accent-emerald);
  border-color: rgba(52, 211, 153, 0.3);
}

.rt-grid-stats {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rt-memory {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-amber);
}

.rt-mrt-badge {
  font-size: 9px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  padding: 1px 4px;
  border-radius: 3px;
  background: rgba(244, 114, 182, 0.2);
  color: var(--3lens-accent-pink);
  border: 1px solid rgba(244, 114, 182, 0.3);
}

/* Render Target Header */
.rt-header-thumb {
  width: 56px;
  height: 42px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: repeating-conic-gradient(#1f2937 0% 25%, #0f1419 0% 50%) 50% / 10px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rt-header-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}

.rt-header-placeholder {
  font-size: 22px;
  opacity: 0.7;
}

/* Render Target Preview */
.rt-preview-section {
  background: var(--3lens-bg-primary);
}

.rt-preview-container {
  position: relative;
  border: 1px solid var(--3lens-border-subtle);
  border-radius: 8px;
  overflow: hidden;
  background: repeating-conic-gradient(#1f2937 0% 25%, #0f1419 0% 50%) 50% / 16px 16px;
}

.rt-preview-img {
  width: 100%;
  max-height: 240px;
  object-fit: contain;
  display: block;
  image-rendering: pixelated;
  transform-origin: center;
  transition: transform 150ms ease;
}

/* Channel filters for render target preview */
.rt-preview-img.channel-color { /* No filter */ }
.rt-preview-img.channel-r { filter: grayscale(100%) sepia(100%) hue-rotate(-30deg) saturate(300%); }
.rt-preview-img.channel-g { filter: grayscale(100%) sepia(100%) hue-rotate(70deg) saturate(300%); }
.rt-preview-img.channel-b { filter: grayscale(100%) sepia(100%) hue-rotate(190deg) saturate(300%); }
.rt-preview-img.channel-a { filter: grayscale(100%); mix-blend-mode: luminosity; }
.rt-preview-img.channel-depth { filter: grayscale(100%); }
.rt-preview-img.channel-heatmap { 
  filter: sepia(100%) saturate(500%) hue-rotate(-50deg);
}

.rt-preview-placeholder {
  padding: 40px;
  text-align: center;
  color: var(--3lens-text-tertiary);
  font-size: 12px;
}

.rt-preview-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: linear-gradient(transparent, rgba(10, 14, 20, 0.95));
}

.rt-channel-toggles {
  display: flex;
  gap: 2px;
  background: rgba(10, 14, 20, 0.9);
  border-radius: 4px;
  padding: 2px;
}

.rt-channel-toggles .channel-btn {
  padding: 4px 8px;
  background: transparent;
  border: none;
  color: var(--3lens-text-tertiary);
  font-size: 10px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  cursor: pointer;
  border-radius: 3px;
  transition: all 100ms ease;
}

.rt-channel-toggles .channel-btn:hover {
  color: var(--3lens-text-secondary);
  background: var(--3lens-bg-hover);
}

.rt-channel-toggles .channel-btn.active {
  background: var(--3lens-accent-cyan);
  color: #000;
}

.rt-channel-toggles .channel-btn.depth.active {
  background: var(--3lens-accent-emerald);
}

.rt-channel-toggles .channel-btn.heatmap.active {
  background: linear-gradient(135deg, #ef4444, #f97316, #facc15);
  color: #000;
}

.channel-separator {
  width: 1px;
  height: 16px;
  background: var(--3lens-border);
  margin: 0 4px;
  align-self: center;
}

.rt-zoom-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(10, 14, 20, 0.9);
  border-radius: 4px;
  padding: 2px;
}

.zoom-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--3lens-text-secondary);
  font-size: 14px;
  cursor: pointer;
  border-radius: 3px;
  transition: all 100ms ease;
}

.zoom-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

.zoom-level {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
  min-width: 40px;
  text-align: center;
}

.rt-pixel-info {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 12px;
  background: rgba(10, 14, 20, 0.9);
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 10px;
  font-family: var(--3lens-font-mono);
}

.pixel-coords {
  color: var(--3lens-accent-cyan);
}

.pixel-value {
  color: var(--3lens-text-secondary);
}

/* Render Target Buffers */
.rt-buffers {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.rt-buffer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--3lens-bg-primary);
  border-radius: 6px;
  border: 1px solid var(--3lens-border-subtle);
  opacity: 0.4;
}

.rt-buffer-item.enabled {
  opacity: 1;
  border-color: rgba(34, 211, 238, 0.3);
  background: rgba(34, 211, 238, 0.06);
}

.rt-buffer-item.msaa {
  border-color: rgba(96, 165, 250, 0.3);
  background: rgba(96, 165, 250, 0.08);
}

.buffer-icon {
  font-size: 14px;
}

.buffer-label {
  font-size: 11px;
  color: var(--3lens-text-secondary);
  flex: 1;
}

.rt-buffer-item.enabled .buffer-label {
  color: var(--3lens-text-primary);
}

.buffer-status {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
}

.rt-buffer-item.enabled .buffer-status {
  color: var(--3lens-accent-cyan);
}

/* MRT Section */
.mrt-value {
  color: var(--3lens-accent-pink);
  font-weight: 600;
}

.mrt-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.mrt-attachment {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(244, 114, 182, 0.1);
  border: 1px solid rgba(244, 114, 182, 0.2);
  border-radius: 4px;
}

.attachment-index {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--3lens-accent-pink);
  color: #000;
  font-size: 10px;
  font-weight: 700;
  border-radius: 3px;
}

.attachment-format {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

/* Render Target Actions */
.rt-actions {
  flex-wrap: wrap;
}

.rt-actions .action-btn {
  min-width: 100px;
}

/* ═══════════════════════════════════════════════════════════════
   SCROLLBAR
   ═══════════════════════════════════════════════════════════════ */

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--3lens-border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--3lens-text-tertiary);
}
`;function za(){return Ca+`
`+Ta}const ht=560,$a=450,Ea=[{id:"scene",title:"Scene",icon:"S",iconClass:"scene",defaultWidth:ht,defaultHeight:0},{id:"stats",title:"Performance",icon:"⚡",iconClass:"stats",defaultWidth:320,defaultHeight:400},{id:"materials",title:"Materials",icon:"🎨",iconClass:"materials",defaultWidth:700,defaultHeight:500},{id:"geometry",title:"Geometry",icon:"📐",iconClass:"inspector",defaultWidth:750,defaultHeight:500},{id:"textures",title:"Textures",icon:"🖼️",iconClass:"textures",defaultWidth:800,defaultHeight:520},{id:"render-targets",title:"Render Targets",icon:"🎯",iconClass:"render-targets",defaultWidth:850,defaultHeight:550},{id:"webgpu",title:"WebGPU",icon:"🔷",iconClass:"webgpu",defaultWidth:700,defaultHeight:500},{id:"plugins",title:"Plugins",icon:"🔌",iconClass:"plugin",defaultWidth:420,defaultHeight:480}];class Pa{root;probe;menuVisible=!1;openPanels=new Map;selectedNodeId=null;expandedNodes=new Set;latestStats=null;latestBenchmark=null;latestSnapshot=null;frameHistory=[];gpuHistory=[];fpsHistory=[];topZIndex=999997;dragState=null;resizeState=null;lastStatsUpdate=0;statsUpdateInterval=500;statsTab="overview";timelineZoom=1;timelineOffset=0;timelineSelectedFrame=null;timelineDragging=!1;timelineDragStartX=0;timelineDragStartOffset=0;timelineHoverIndex=null;timelinePaused=!1;isRecording=!1;recordedFrames=[];maxRecordedFrames=1800;frameBufferSize=300;panelDefinitions=new Map;panelContexts=new Map;pluginPanelUnsubscribers=new Map;pluginToolbarActions=[];uiState=Si();chartZoom=1;chartOffset=0;chartHoverIndex=null;chartDragging=!1;chartDragStartX=0;chartDragStartOffset=0;maxHistoryLength=300;memoryHistory=[];memoryHistoryMaxLength=60;lastMemoryUpdate=0;memoryUpdateInterval=1e3;fpsHistogram=new Array(12).fill(0);drawCallHistory=[];triangleHistory=[];frameTimePercentiles={p50:0,p90:0,p95:0,p99:0};performanceHistory=[];performanceHistoryMaxLength=120;sessionStartTime=performance.now();totalFramesRendered=0;droppedFrameCount=0;smoothFrameCount=0;peakFps=0;lowestFps=1/0;peakDrawCalls=0;peakTriangles=0;peakMemory=0;gpuCapabilities=null;virtualScrollThreshold=100;virtualScroller=null;virtualScrollContainer=null;constructor(e){this.probe=e.probe,this.injectStyles(),this.root=document.createElement("div"),this.root.className="three-lens-root",document.body.appendChild(this.root),this.initializePanelDefinitions(e.panels),this.probe.onFrameStats(t=>{this.latestStats=t,this.frameHistory.push(t.cpuTimeMs),this.frameHistory.length>this.frameBufferSize&&this.frameHistory.shift(),t.gpuTimeMs!==void 0&&(this.gpuHistory.push(t.gpuTimeMs),this.gpuHistory.length>this.frameBufferSize&&this.gpuHistory.shift()),this.isRecording&&this.recordedFrames.length<this.maxRecordedFrames&&this.recordedFrames.push({cpu:t.cpuTimeMs,gpu:t.gpuTimeMs,timestamp:t.timestamp,drawCalls:t.drawCalls,triangles:t.triangles});const s=t.cpuTimeMs>0?1e3/t.cpuTimeMs:0;this.fpsHistory.push(s),this.fpsHistory.length>this.frameBufferSize&&this.fpsHistory.shift();const r=Math.min(11,Math.floor(s/5));if(this.fpsHistogram[r]++,this.drawCallHistory.push(t.drawCalls),this.drawCallHistory.length>this.frameBufferSize&&this.drawCallHistory.shift(),this.triangleHistory.push(t.triangles),this.triangleHistory.length>this.frameBufferSize&&this.triangleHistory.shift(),this.totalFramesRendered++,s>this.peakFps&&(this.peakFps=s),s<this.lowestFps&&s>0&&(this.lowestFps=s),t.drawCalls>this.peakDrawCalls&&(this.peakDrawCalls=t.drawCalls),t.triangles>this.peakTriangles&&(this.peakTriangles=t.triangles),t.memory&&t.memory.totalGpuMemory>this.peakMemory&&(this.peakMemory=t.memory.totalGpuMemory),t.cpuTimeMs>16.67?this.droppedFrameCount++:this.smoothFrameCount++,this.frameHistory.length>=10){const i=[...this.frameHistory].sort((l,c)=>l-c),o=i.length;this.frameTimePercentiles={p50:i[Math.floor(o*.5)],p90:i[Math.floor(o*.9)],p95:i[Math.floor(o*.95)],p99:i[Math.floor(o*.99)]}}this.latestBenchmark=yi(t);const n=performance.now();n-this.lastMemoryUpdate>=this.memoryUpdateInterval&&(this.lastMemoryUpdate=n,t.memory&&(this.memoryHistory.push({timestamp:t.timestamp,totalGpu:t.memory.totalGpuMemory,textures:t.memory.textureMemory,geometry:t.memory.geometryMemory,renderTargets:t.memory.renderTargetMemory,jsHeap:t.memory.jsHeapSize??0}),this.memoryHistory.length>this.memoryHistoryMaxLength&&this.memoryHistory.shift()),this.performanceHistory.push({timestamp:t.timestamp,fps:s,frameTime:t.cpuTimeMs,drawCalls:t.drawCalls,triangles:t.triangles}),this.performanceHistory.length>this.performanceHistoryMaxLength&&this.performanceHistory.shift()),n-this.lastStatsUpdate>=this.statsUpdateInterval&&(this.lastStatsUpdate=n,this.updateStatsPanel())}),this.probe.onSelectionChanged((t,s)=>{this.selectedNodeId=s?.debugId??null,this.updateScenePanel(),this.updateInspectorPanel()}),this.probe.onTransformChanged(()=>{this.updateScenePanel()}),this.render(),document.addEventListener("mousemove",this.handleMouseMove.bind(this)),document.addEventListener("mouseup",this.handleMouseUp.bind(this)),document.addEventListener("keydown",this.handleKeyDown.bind(this)),this.initializePluginIntegration()}initializePluginIntegration(){const e=this.probe.getPluginManager();e.setToastCallback((t,s)=>{this.showToast(t,s)}),e.setRenderRequestCallback(t=>{this.refreshPluginPanel(t)})}registerAndActivatePlugin(e){const t=this.probe.getPluginManager();if(t.registerPlugin(e),e.panels)for(const s of e.panels)this.registerPluginPanel(e.metadata.id,s);return this.syncPluginToolbarActions(),t.activatePlugin(e.metadata.id)}async unregisterAndDeactivatePlugin(e){const t=this.probe.getPluginManager();await t.deactivatePlugin(e);for(const[s,r]of this.pluginPanelUnsubscribers)s.startsWith(`${e}:`)&&(r(),this.pluginPanelUnsubscribers.delete(s));this.syncPluginToolbarActions(),await t.unregisterPlugin(e)}registerPluginPanel(e,t){const s=`${e}:${t.id}`,r=this.probe.getPluginManager(),n={id:s,title:t.name,icon:t.icon??"🔌",iconClass:"plugin",defaultWidth:400,defaultHeight:300,render:o=>r.renderPanel(s),onMount:o=>{r.mountPanel(s,o.container)},onDestroy:o=>{r.unmountPanel(s)}},i=this.registerPanel(n);this.pluginPanelUnsubscribers.set(s,i)}syncPluginToolbarActions(){const e=this.probe.getPluginManager();this.pluginToolbarActions=e.getToolbarActions(),this.menuVisible&&this.updateMenu()}refreshPluginPanel(e){for(const[t]of this.pluginPanelUnsubscribers)t.startsWith(`${e}:`)&&this.updatePanelContent(t)}showToast(e,t="info"){const s=document.createElement("div");s.className=`three-lens-toast three-lens-toast-${t}`,s.innerHTML=`
      <span class="three-lens-toast-icon">${t==="success"?"✓":t==="warning"?"⚠":t==="error"?"✕":"ℹ"}</span>
      <span class="three-lens-toast-message">${e}</span>
    `;let r=this.root.querySelector(".three-lens-toast-container");r||(r=document.createElement("div"),r.className="three-lens-toast-container",this.root.appendChild(r)),r.appendChild(s),requestAnimationFrame(()=>{s.classList.add("visible")}),setTimeout(()=>{s.classList.remove("visible"),setTimeout(()=>s.remove(),300)},3e3)}getPluginManager(){return this.probe.getPluginManager()}injectStyles(){if(document.getElementById("three-lens-styles"))return;const e=document.createElement("style");e.id="three-lens-styles",e.textContent=xi+`
`+za()+`
`+Mi,document.head.appendChild(e)}render(){this.root.innerHTML=`
      ${this.renderFAB()}
      ${this.renderMenu()}
    `,this.attachFABEvents()}renderFAB(){return`
      <button class="three-lens-fab ${this.menuVisible?"active":""}" id="three-lens-fab" title="3Lens DevTools">
        <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Penrose Triangle - 3Lens Logo -->
          <path d="M50 10L85 70H70L50 35L30 70H15L50 10Z" fill="#EF6B6B"/>
          <path d="M15 70L50 10L35 10L10 55L25 55L15 70Z" fill="#60A5FA"/>
          <path d="M85 70L50 10L65 10L90 55L75 55L85 70Z" fill="#34D399"/>
          <path d="M15 70H35L50 45L65 70H85L50 10L15 70Z" fill="none" stroke="currentColor" stroke-width="2" stroke-opacity="0.2"/>
        </svg>
      </button>
    `}renderMenu(){return`
      <div class="three-lens-menu ${this.menuVisible?"visible":""}" id="three-lens-menu">
        <div class="three-lens-menu-header">Panels</div>
        ${this.renderMenuItems()}
      </div>
    `}renderMenuItems(){return this.getPanelDefinitions().map(e=>`
          <button class="three-lens-menu-item ${this.openPanels.has(e.id)?"active":""}" data-panel="${e.id}">
            <span class="three-lens-menu-icon ${e.iconClass}">${e.icon}</span>
            <span>${e.title}</span>
          </button>
        `).join("")}attachFABEvents(){document.getElementById("three-lens-fab")?.addEventListener("click",t=>{t.stopPropagation(),this.menuVisible=!this.menuVisible,this.updateMenu()}),this.attachMenuItemEvents(),document.addEventListener("click",t=>{this.menuVisible&&!t.target.closest(".three-lens-menu, .three-lens-fab")&&(this.menuVisible=!1,this.updateMenu())})}attachMenuItemEvents(e=document){e.querySelectorAll(".three-lens-menu-item").forEach(t=>{t.addEventListener("click",s=>{const r=s.currentTarget.dataset.panel;r&&(this.togglePanel(r),this.menuVisible=!1,this.updateMenu())})})}updateMenu(){const e=document.getElementById("three-lens-fab"),t=document.getElementById("three-lens-menu");e&&(e.className=`three-lens-fab ${this.menuVisible?"active":""}`),t&&(t.className=`three-lens-menu ${this.menuVisible?"visible":""}`),document.querySelectorAll(".three-lens-menu-item").forEach(s=>{const r=s.dataset.panel;r&&s.classList.toggle("active",this.openPanels.has(r))})}initializePanelDefinitions(e){[...Ea,...e??[]].forEach(t=>this.registerPanelDefinition(t))}registerPanelDefinition(e){this.panelDefinitions.has(e.id)||this.panelDefinitions.set(e.id,e)}registerPanel(e){return this.registerPanelDefinition(e),this.refreshMenuItems(),()=>this.unregisterPanel(e.id)}unregisterPanel(e){this.openPanels.has(e)?this.closePanel(e):this.updateMenu(),this.panelDefinitions.delete(e),this.refreshMenuItems()}getPanelDefinitions(){return Array.from(this.panelDefinitions.values())}refreshMenuItems(){const e=document.getElementById("three-lens-menu");e&&(e.innerHTML=`
        <div class="three-lens-menu-header">Panels</div>
        ${this.renderMenuItems()}
      `,this.attachMenuItemEvents(e),this.updateMenu())}togglePanel(e){this.openPanels.has(e)?this.closePanel(e):this.openPanel(e)}openPanel(e){const t=this.panelDefinitions.get(e);if(!t)return;const s=this.openPanels.size*30,r=t.defaultWidth,n={id:e,x:100+s,y:100+s,width:r,height:t.defaultHeight,minimized:!1,zIndex:++this.topZIndex};this.openPanels.set(e,n),this.createPanelElement(t,n),e==="scene"&&requestAnimationFrame(()=>{this.updateScenePanelSize()}),this.updateMenu()}closePanel(e){this.destroyPanel(e),this.updateMenu()}createPanelElement(e,t){const s=document.createElement("div");s.id=`three-lens-panel-${e.id}`,s.className="three-lens-panel";const n=e.id==="scene"?`max-height: ${$a}px`:`height: ${t.height}px`;s.style.cssText=`
      left: ${t.x}px;
      top: ${t.y}px;
      width: ${t.width}px;
      ${n};
      z-index: ${t.zIndex};
    `;const i=["materials","geometry","textures"].includes(e.id),o=e.id==="materials"?"Search materials...":e.id==="geometry"?"Search geometry...":"Search textures...";s.innerHTML=`
      <div class="three-lens-panel-header" data-panel="${e.id}">
        <span class="three-lens-panel-icon ${e.iconClass}">${e.icon}</span>
        <span class="three-lens-panel-title">${e.title}</span>
        ${i?`
          <div class="three-lens-header-search">
            <input 
              type="text" 
              class="header-search-input" 
              data-panel="${e.id}"
              placeholder="${o}" 
            />
          </div>
        `:""}
        <div class="three-lens-panel-controls">
          <button class="three-lens-panel-btn minimize" data-action="minimize" title="Minimize">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="2" y1="6" x2="10" y2="6"/>
            </svg>
          </button>
          <button class="three-lens-panel-btn close" data-action="close" title="Close">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="2" y1="2" x2="10" y2="10"/>
              <line x1="10" y1="2" x2="2" y2="10"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="three-lens-panel-content" id="three-lens-content-${e.id}">
        ${this.getInitialPanelMarkup(e.id)}
      </div>
      <div class="three-lens-panel-resize" data-panel="${e.id}"></div>
    `,this.root.appendChild(s),this.mountPanel(e.id,s),this.attachPanelEvents(s,e.id)}getInitialPanelMarkup(e){switch(e){case"scene":return this.renderSceneContent();case"stats":return this.renderStatsContent();case"materials":return this.renderMaterialsContent();case"geometry":return this.renderGeometryContent();case"textures":return this.renderTexturesContent();case"render-targets":return this.renderRenderTargetsContent();case"webgpu":return this.renderWebGPUContent();case"plugins":return this.renderPluginsContent();default:return'<div class="three-lens-inspector-empty">Panel content</div>'}}buildSharedPanelContext(){return{probe:this.probe,snapshot:this.latestSnapshot,stats:this.latestStats,benchmark:this.latestBenchmark,sendCommand:e=>this.handlePanelCommand(e),requestSnapshot:()=>this.refreshSnapshot()}}handlePanelCommand(e){switch(e.type){case"select-object":e.debugId?this.probe.selectByDebugId(e.debugId):this.probe.selectObject(null);break;case"update-material-property":this.probe.updateMaterialProperty(e.materialUuid,e.property,e.value),this.refreshSnapshot();break}}refreshSnapshot(){this.latestSnapshot=this.probe.takeSnapshot()}updateUIState(e){this.uiState={...this.uiState,...e}}renderMaterialsContent(){return this.refreshSnapshot(),Pi(this.buildSharedPanelContext(),this.uiState)}renderGeometryContent(){return this.refreshSnapshot(),Ni(this.buildSharedPanelContext(),this.uiState)}renderTexturesContent(){return this.refreshSnapshot(),Qi(this.buildSharedPanelContext(),this.uiState)}renderRenderTargetsContent(){return this.refreshSnapshot(),ua(this.buildSharedPanelContext(),this.uiState)}selectedPluginId=null;renderPluginsContent(){const t=this.probe.getPluginManager().getPlugins();return`
      <div class="three-lens-plugins-panel">
        <div class="three-lens-plugins-header">
          <span class="three-lens-plugins-count">${t.length} plugin${t.length!==1?"s":""}</span>
          <button class="three-lens-plugins-btn" data-action="load-plugin" title="Load Plugin">
            <span>+ Load Plugin</span>
          </button>
        </div>
        
        <div class="three-lens-plugins-list">
          ${t.length===0?'<div class="three-lens-plugins-empty">No plugins installed</div>':t.map(s=>this.renderPluginListItem(s)).join("")}
        </div>
        
        ${this.selectedPluginId?this.renderPluginSettings(this.selectedPluginId):this.renderPluginLoadForm()}
      </div>
    `}renderPluginListItem(e){const t=this.selectedPluginId===e.id,s=e.state==="activated",r=e.state==="error";return`
      <div class="three-lens-plugin-item ${t?"selected":""} ${r?"error":""}" data-plugin-id="${e.id}">
        <div class="three-lens-plugin-icon">${e.metadata.icon??"🔌"}</div>
        <div class="three-lens-plugin-info">
          <div class="three-lens-plugin-name">${e.metadata.name}</div>
          <div class="three-lens-plugin-version">v${e.metadata.version}</div>
        </div>
        <div class="three-lens-plugin-status ${s?"active":r?"error":"inactive"}">
          ${s?"●":r?"!":"○"}
        </div>
        <div class="three-lens-plugin-actions">
          ${s?`<button class="three-lens-plugin-action-btn" data-action="deactivate" data-plugin-id="${e.id}" title="Deactivate">⏸</button>`:`<button class="three-lens-plugin-action-btn" data-action="activate" data-plugin-id="${e.id}" title="Activate">▶</button>`}
          <button class="three-lens-plugin-action-btn" data-action="unregister" data-plugin-id="${e.id}" title="Unregister">✕</button>
        </div>
      </div>
    `}renderPluginLoadForm(){return`
      <div class="three-lens-plugin-load-form">
        <div class="three-lens-section-header">Load Plugin</div>
        <div class="three-lens-plugin-form-group">
          <label class="three-lens-plugin-label">Source</label>
          <select class="three-lens-plugin-select" id="plugin-load-source">
            <option value="npm">npm Package</option>
            <option value="url">URL</option>
          </select>
        </div>
        <div class="three-lens-plugin-form-group">
          <label class="three-lens-plugin-label">Package / URL</label>
          <input type="text" class="three-lens-plugin-input" id="plugin-load-input" placeholder="@3lens/plugin-example" />
        </div>
        <div class="three-lens-plugin-form-group npm-only">
          <label class="three-lens-plugin-label">Version</label>
          <input type="text" class="three-lens-plugin-input" id="plugin-load-version" placeholder="latest" value="latest" />
        </div>
        <button class="three-lens-plugin-submit-btn" data-action="submit-load">Load Plugin</button>
        <div class="three-lens-plugin-load-status" id="plugin-load-status"></div>
      </div>
    `}renderPluginSettings(e){const s=this.probe.getPluginManager().getPlugin(e);if(!s)return'<div class="three-lens-plugin-settings">Plugin not found</div>';const{plugin:r,state:n,settings:i}=s,o=r.settings;return`
      <div class="three-lens-plugin-settings">
        <div class="three-lens-plugin-settings-header">
          <button class="three-lens-plugin-back-btn" data-action="back-to-list">← Back</button>
          <span class="three-lens-plugin-settings-title">${r.metadata.name}</span>
        </div>
        
        <div class="three-lens-plugin-details">
          ${r.metadata.description?`<div class="three-lens-plugin-description">${r.metadata.description}</div>`:""}
          <div class="three-lens-plugin-meta">
            <span>Version: ${r.metadata.version}</span>
            ${r.metadata.author?`<span>Author: ${r.metadata.author}</span>`:""}
            <span>Status: ${n}</span>
          </div>
        </div>
        
        ${o&&o.fields.length>0?`
          <div class="three-lens-section-header">Settings</div>
          <div class="three-lens-plugin-settings-fields">
            ${o.fields.map(l=>this.renderPluginSettingField(e,l,i[l.key])).join("")}
          </div>
        `:'<div class="three-lens-plugin-no-settings">This plugin has no configurable settings.</div>'}
        
        <div class="three-lens-plugin-settings-actions">
          ${n==="activated"?`<button class="three-lens-plugin-btn danger" data-action="deactivate" data-plugin-id="${e}">Deactivate</button>`:`<button class="three-lens-plugin-btn primary" data-action="activate" data-plugin-id="${e}">Activate</button>`}
          <button class="three-lens-plugin-btn danger" data-action="unregister" data-plugin-id="${e}">Unregister</button>
        </div>
      </div>
    `}renderPluginSettingField(e,t,s){const r=`plugin-setting-${e}-${t.key}`;let n="";switch(t.type){case"boolean":n=`
          <label class="three-lens-toggle">
            <input type="checkbox" id="${r}" data-plugin-id="${e}" data-setting-key="${t.key}" ${s?"checked":""} />
            <span class="three-lens-toggle-slider"></span>
          </label>
        `;break;case"number":n=`
          <input type="number" class="three-lens-plugin-input" id="${r}" 
            data-plugin-id="${e}" data-setting-key="${t.key}"
            value="${s??""}" 
            ${t.min!==void 0?`min="${t.min}"`:""}
            ${t.max!==void 0?`max="${t.max}"`:""}
            ${t.step!==void 0?`step="${t.step}"`:""}
          />
        `;break;case"select":n=`
          <select class="three-lens-plugin-select" id="${r}" data-plugin-id="${e}" data-setting-key="${t.key}">
            ${(t.options??[]).map(i=>`
              <option value="${i.value}" ${i.value===s?"selected":""}>${i.label}</option>
            `).join("")}
          </select>
        `;break;case"color":n=`
          <input type="color" class="three-lens-plugin-color" id="${r}" 
            data-plugin-id="${e}" data-setting-key="${t.key}"
            value="${s??"#000000"}" 
          />
        `;break;case"string":default:n=`
          <input type="text" class="three-lens-plugin-input" id="${r}" 
            data-plugin-id="${e}" data-setting-key="${t.key}"
            value="${s??""}" 
          />
        `;break}return`
      <div class="three-lens-plugin-setting-field">
        <div class="three-lens-plugin-setting-row">
          <label class="three-lens-plugin-setting-label" for="${r}">${t.label}</label>
          ${n}
        </div>
        ${t.description?`<div class="three-lens-plugin-setting-desc">${t.description}</div>`:""}
      </div>
    `}attachPluginsPanelEvents(e){e.querySelectorAll(".three-lens-plugin-item").forEach(s=>{s.addEventListener("click",r=>{if(r.target.closest(".three-lens-plugin-action-btn"))return;const n=s.dataset.pluginId;n&&(this.selectedPluginId=n,this.updatePluginsPanel())})}),e.querySelectorAll(".three-lens-plugin-action-btn").forEach(s=>{s.addEventListener("click",async r=>{r.stopPropagation();const n=s.dataset.action,i=s.dataset.pluginId;i&&await this.handlePluginAction(n,i)})}),e.querySelector('[data-action="load-plugin"]')?.addEventListener("click",()=>{this.selectedPluginId=null,this.updatePluginsPanel()}),e.querySelector('[data-action="back-to-list"]')?.addEventListener("click",()=>{this.selectedPluginId=null,this.updatePluginsPanel()}),e.querySelectorAll(".three-lens-plugin-btn[data-action]").forEach(s=>{s.addEventListener("click",async()=>{const r=s.dataset.action,n=s.dataset.pluginId;n&&await this.handlePluginAction(r,n)})}),e.querySelectorAll("[data-setting-key]").forEach(s=>{s.addEventListener("change",()=>{const r=s.dataset.pluginId,n=s.dataset.settingKey;let i;s.type==="checkbox"?i=s.checked:s.type==="number"?i=parseFloat(s.value):i=s.value,this.probe.getPluginManager().updatePluginSettings(r,{[n]:i})})});const t=e.querySelector("#plugin-load-source");t?.addEventListener("change",()=>{const s=e.querySelectorAll(".npm-only"),r=e.querySelector("#plugin-load-input");t.value==="npm"?(s.forEach(n=>n.style.display=""),r&&(r.placeholder="@3lens/plugin-example")):(s.forEach(n=>n.style.display="none"),r&&(r.placeholder="https://example.com/plugin.js"))}),e.querySelector('[data-action="submit-load"]')?.addEventListener("click",async()=>{const s=e.querySelector("#plugin-load-source")?.value??"npm",r=e.querySelector("#plugin-load-input")?.value?.trim(),n=e.querySelector("#plugin-load-version")?.value?.trim()||"latest",i=e.querySelector("#plugin-load-status");if(!r){i&&(i.innerHTML='<span class="error">Please enter a package name or URL</span>');return}i&&(i.innerHTML='<span class="loading">Loading plugin...</span>');try{let o;s==="npm"?o=await this.probe.loadPlugin(r,n):o=await this.probe.loadPluginFromUrl(r),o.success?(i&&(i.innerHTML=`<span class="success">✓ Loaded ${o.plugin?.metadata.name}</span>`),setTimeout(()=>this.updatePluginsPanel(),1e3)):i&&(i.innerHTML=`<span class="error">✕ ${o.error?.message??"Failed to load"}</span>`)}catch(o){i&&(i.innerHTML=`<span class="error">✕ ${o instanceof Error?o.message:"Unknown error"}</span>`)}})}async handlePluginAction(e,t){const s=this.probe.getPluginManager();switch(e){case"activate":await s.activatePlugin(t);break;case"deactivate":await s.deactivatePlugin(t);break;case"unregister":this.selectedPluginId===t&&(this.selectedPluginId=null),await s.unregisterPlugin(t);break}this.updatePluginsPanel()}updatePluginsPanel(){const e=document.getElementById("three-lens-content-plugins");e&&(e.innerHTML=this.renderPluginsContent(),this.attachPluginsPanelEvents(e))}webgpuTab="pipelines";selectedPipelineId=null;selectedBindGroupId=null;renderWebGPUContent(){return this.probe.isWebGPU()?`
      <div class="webgpu-panel">
        <div class="webgpu-tabs">
          <button class="webgpu-tab ${this.webgpuTab==="pipelines"?"active":""}" data-tab="pipelines">Pipelines</button>
          <button class="webgpu-tab ${this.webgpuTab==="bindgroups"?"active":""}" data-tab="bindgroups">Bind Groups</button>
          <button class="webgpu-tab ${this.webgpuTab==="shaders"?"active":""}" data-tab="shaders">Shaders</button>
          <button class="webgpu-tab ${this.webgpuTab==="timing"?"active":""}" data-tab="timing">GPU Timing</button>
          <button class="webgpu-tab ${this.webgpuTab==="capabilities"?"active":""}" data-tab="capabilities">Capabilities</button>
        </div>
        <div class="webgpu-tab-content">
          ${this.renderWebGPUTabContent()}
        </div>
      </div>
    `:`
        <div class="webgpu-panel">
          <div class="webgpu-not-available">
            <div class="webgpu-not-available-icon">🔷</div>
            <div class="webgpu-not-available-title">WebGPU Not Active</div>
            <div class="webgpu-not-available-desc">
              The current renderer is using WebGL. This panel provides debugging tools 
              specifically for Three.js WebGPURenderer.
            </div>
            <div class="webgpu-not-available-hint">
              To use WebGPU, initialize your app with <code>WebGPURenderer</code> from 
              <code>three/webgpu</code>.
            </div>
          </div>
        </div>
      `}renderWebGPUTabContent(){switch(this.webgpuTab){case"pipelines":return this.renderWebGPUPipelinesTab();case"bindgroups":return this.renderWebGPUBindGroupsTab();case"shaders":return this.renderWebGPUShadersTab();case"timing":return this.renderWebGPUTimingTab();case"capabilities":return this.renderWebGPUCapabilitiesTab();default:return""}}renderWebGPUPipelinesTab(){const t=this.probe.getRendererAdapter()?.getPipelines?.()??[];if(t.length===0)return`
        <div class="webgpu-empty">
          <p>No pipelines detected yet.</p>
          <p class="webgpu-hint">Pipelines are created when materials are compiled for rendering.</p>
        </div>
      `;const s=t.filter(n=>n.type==="render"),r=t.filter(n=>n.type==="compute");return`
      <div class="webgpu-pipelines">
        <div class="webgpu-section">
          <div class="webgpu-section-header">
            <span>Render Pipelines</span>
            <span class="webgpu-badge">${s.length}</span>
          </div>
          <div class="webgpu-pipeline-list">
            ${s.length===0?'<div class="webgpu-empty-small">No render pipelines</div>':s.map(n=>this.renderPipelineItem(n)).join("")}
          </div>
        </div>
        
        ${r.length>0?`
          <div class="webgpu-section">
            <div class="webgpu-section-header">
              <span>Compute Pipelines</span>
              <span class="webgpu-badge">${r.length}</span>
            </div>
            <div class="webgpu-pipeline-list">
              ${r.map(n=>this.renderPipelineItem(n)).join("")}
            </div>
          </div>
        `:""}
        
        ${this.selectedPipelineId?this.renderPipelineDetails(this.selectedPipelineId,t):""}
      </div>
    `}renderPipelineItem(e){const t=this.selectedPipelineId===e.id,s=e.type==="render"?"🎨":"⚡",r=e.label??e.id;return`
      <div class="webgpu-pipeline-item ${t?"selected":""}" data-pipeline-id="${e.id}">
        <span class="webgpu-pipeline-icon">${s}</span>
        <span class="webgpu-pipeline-name">${this.escapeHtml(r)}</span>
        <span class="webgpu-pipeline-type">${e.type}</span>
        ${e.usageCount?`<span class="webgpu-pipeline-usage">${e.usageCount} uses</span>`:""}
      </div>
    `}renderPipelineDetails(e,t){const s=t.find(r=>r.id===e);return s?`
      <div class="webgpu-pipeline-details">
        <div class="webgpu-details-header">
          <span class="webgpu-details-title">${s.type==="render"?"🎨":"⚡"} ${this.escapeHtml(s.label??s.id)}</span>
          <button class="webgpu-close-btn" data-action="close-pipeline-details">×</button>
        </div>
        
        <div class="webgpu-details-content">
          <div class="webgpu-detail-row">
            <span class="webgpu-detail-label">Type</span>
            <span class="webgpu-detail-value">${s.type}</span>
          </div>
          <div class="webgpu-detail-row">
            <span class="webgpu-detail-label">ID</span>
            <span class="webgpu-detail-value mono">${s.id}</span>
          </div>
          ${s.usedByMaterials.length>0?`
            <div class="webgpu-detail-row">
              <span class="webgpu-detail-label">Materials</span>
              <span class="webgpu-detail-value">${s.usedByMaterials.length} material(s)</span>
            </div>
          `:""}
          
          ${s.vertexStage?`
            <div class="webgpu-shader-stage">
              <div class="webgpu-shader-stage-header">Vertex Stage</div>
              <div class="webgpu-shader-stage-entry">${s.vertexStage}</div>
            </div>
          `:""}
          
          ${s.fragmentStage?`
            <div class="webgpu-shader-stage">
              <div class="webgpu-shader-stage-header">Fragment Stage</div>
              <div class="webgpu-shader-stage-entry">${s.fragmentStage}</div>
            </div>
          `:""}
          
          ${s.computeStage?`
            <div class="webgpu-shader-stage">
              <div class="webgpu-shader-stage-header">Compute Stage</div>
              <div class="webgpu-shader-stage-entry">${s.computeStage}</div>
            </div>
          `:""}
        </div>
      </div>
    `:""}renderWebGPUBindGroupsTab(){return`
      <div class="webgpu-bindgroups">
        <div class="webgpu-info">
          <div class="webgpu-info-icon">📦</div>
          <div class="webgpu-info-title">Bind Groups</div>
          <div class="webgpu-info-desc">
            Bind groups contain resources (buffers, textures, samplers) that are bound to shaders.
            Deep bind group tracking requires additional instrumentation.
          </div>
        </div>
        
        <div class="webgpu-section">
          <div class="webgpu-section-header">Common Bind Group Types</div>
          <div class="webgpu-bindgroup-types">
            <div class="webgpu-bindgroup-type">
              <span class="webgpu-bindgroup-type-icon">📐</span>
              <span class="webgpu-bindgroup-type-name">Camera Uniforms</span>
              <span class="webgpu-bindgroup-type-desc">View, projection, camera position</span>
            </div>
            <div class="webgpu-bindgroup-type">
              <span class="webgpu-bindgroup-type-icon">🎨</span>
              <span class="webgpu-bindgroup-type-name">Material Properties</span>
              <span class="webgpu-bindgroup-type-desc">Color, roughness, metalness, textures</span>
            </div>
            <div class="webgpu-bindgroup-type">
              <span class="webgpu-bindgroup-type-icon">💡</span>
              <span class="webgpu-bindgroup-type-name">Lighting Data</span>
              <span class="webgpu-bindgroup-type-desc">Light positions, colors, shadow maps</span>
            </div>
            <div class="webgpu-bindgroup-type">
              <span class="webgpu-bindgroup-type-icon">🦴</span>
              <span class="webgpu-bindgroup-type-name">Skeleton/Morph</span>
              <span class="webgpu-bindgroup-type-desc">Bone matrices, morph targets</span>
            </div>
          </div>
        </div>
      </div>
    `}renderWebGPUShadersTab(){const s=(this.probe.getRendererAdapter()?.getPipelines?.()??[]).filter(r=>r.vertexStage||r.fragmentStage||r.computeStage);return`
      <div class="webgpu-shaders">
        <div class="webgpu-section">
          <div class="webgpu-section-header">
            <span>WGSL Shaders</span>
            <span class="webgpu-badge">${s.length}</span>
          </div>
          
          ${s.length===0?`
            <div class="webgpu-empty">
              <p>No shader sources available.</p>
              <p class="webgpu-hint">Shader source inspection requires additional instrumentation of the WebGPU backend.</p>
            </div>
          `:`
            <div class="webgpu-shader-list">
              ${s.map(r=>`
                <div class="webgpu-shader-item" data-pipeline-id="${r.id}">
                  <span class="webgpu-shader-icon">${r.type==="compute"?"⚡":"🎨"}</span>
                  <span class="webgpu-shader-name">${this.escapeHtml(r.label??r.id)}</span>
                  <span class="webgpu-shader-stages">
                    ${r.vertexStage?'<span class="webgpu-stage-badge vs">VS</span>':""}
                    ${r.fragmentStage?'<span class="webgpu-stage-badge fs">FS</span>':""}
                    ${r.computeStage?'<span class="webgpu-stage-badge cs">CS</span>':""}
                  </span>
                </div>
              `).join("")}
            </div>
          `}
        </div>
        
        <div class="webgpu-section">
          <div class="webgpu-section-header">About WGSL</div>
          <div class="webgpu-info-box">
            <p><strong>WGSL</strong> (WebGPU Shading Language) is the shader language for WebGPU.</p>
            <p>Unlike GLSL, WGSL is designed specifically for the web with:</p>
            <ul>
              <li>Rust-like syntax</li>
              <li>Explicit types</li>
              <li>Memory safety features</li>
              <li>Consistent behavior across browsers</li>
            </ul>
          </div>
        </div>
      </div>
    `}renderWebGPUTimingTab(){const e=this.latestStats,t=e?.webgpuExtras?.gpuTiming,s=e?.gpuTimeMs;if(!(t&&t.passes.length>0))return`
        <div class="webgpu-timing">
          <div class="webgpu-info">
            <div class="webgpu-info-icon">⏱️</div>
            <div class="webgpu-info-title">GPU Timing</div>
            <div class="webgpu-info-desc">
              GPU timing via timestamp queries provides accurate per-pass breakdown of GPU execution time.
            </div>
          </div>
          
          ${s!==void 0?`
            <div class="webgpu-section">
              <div class="webgpu-section-header">Estimated GPU Time</div>
              <div class="webgpu-timing-summary">
                <div class="webgpu-timing-total">
                  <span class="webgpu-timing-value">${s.toFixed(2)}</span>
                  <span class="webgpu-timing-unit">ms</span>
                </div>
                <p class="webgpu-hint">This is an estimate. Enable timestamp queries for accurate per-pass breakdown.</p>
              </div>
            </div>
          `:""}
          
          <div class="webgpu-section">
            <div class="webgpu-section-header">Timestamp Query Requirements</div>
            <div class="webgpu-info-box">
              <p><strong>Requirements:</strong></p>
              <ul>
                <li>WebGPU device with <code>timestamp-query</code> feature</li>
                <li>Browser support (Chrome 113+, Edge 113+)</li>
                <li>Renderer must be initialized with timestamp queries enabled</li>
              </ul>
              <p><strong>Note:</strong> Some browsers may require a flag to enable timestamp queries for privacy reasons.</p>
            </div>
          </div>
        </div>
      `;const n=t.totalMs,i=t.passes;t.breakdown;const o=[...i].sort((d,h)=>h.durationMs-d.durationMs),l={shadow:"#9333EA",opaque:"#3B82F6",transparent:"#10B981","post-process":"#F59E0B",compute:"#EF4444",copy:"#6B7280"},c=d=>{const h=d.toLowerCase();for(const[p,u]of Object.entries(l))if(h.includes(p))return u;return"#8B5CF6"};return`
      <div class="webgpu-timing">
        <div class="webgpu-section">
          <div class="webgpu-section-header">
            <span>GPU Frame Time</span>
            <span class="webgpu-timing-badge">${n.toFixed(2)} ms</span>
          </div>
          
          <div class="webgpu-timing-bar-container">
            <div class="webgpu-timing-bar">
              ${o.map((d,h)=>{const p=n>0?d.durationMs/n*100:0,u=c(d.name);return`<div class="webgpu-timing-bar-segment" style="width: ${p}%; background: ${u};" title="${d.name}: ${d.durationMs.toFixed(2)}ms"></div>`}).join("")}
            </div>
          </div>
          
          <div class="webgpu-timing-legend">
            ${o.map(d=>{const h=n>0?d.durationMs/n*100:0;return`
                <div class="webgpu-timing-legend-item">
                  <span class="webgpu-timing-legend-color" style="background: ${c(d.name)};"></span>
                  <span class="webgpu-timing-legend-name">${this.escapeHtml(d.name)}</span>
                  <span class="webgpu-timing-legend-value">${d.durationMs.toFixed(2)} ms</span>
                  <span class="webgpu-timing-legend-pct">${h.toFixed(1)}%</span>
                </div>
              `}).join("")}
          </div>
        </div>
        
        <div class="webgpu-section">
          <div class="webgpu-section-header">Pass Breakdown</div>
          <div class="webgpu-timing-passes">
            ${o.map(d=>{const h=n>0?d.durationMs/n*100:0,p=c(d.name);return`
                <div class="webgpu-timing-pass ${d.durationMs>n*.3?"hot":""}">
                  <div class="webgpu-timing-pass-header">
                    <span class="webgpu-timing-pass-color" style="background: ${p};"></span>
                    <span class="webgpu-timing-pass-name">${this.escapeHtml(d.name)}</span>
                    <span class="webgpu-timing-pass-time">${d.durationMs.toFixed(2)} ms</span>
                  </div>
                  <div class="webgpu-timing-pass-bar">
                    <div class="webgpu-timing-pass-fill" style="width: ${h}%; background: ${p};"></div>
                  </div>
                </div>
              `}).join("")}
          </div>
        </div>
        
        <div class="webgpu-section">
          <div class="webgpu-section-header">Timing Analysis</div>
          <div class="webgpu-timing-analysis">
            <div class="webgpu-analysis-row">
              <span class="webgpu-analysis-label">Total GPU Time</span>
              <span class="webgpu-analysis-value">${n.toFixed(2)} ms</span>
            </div>
            <div class="webgpu-analysis-row">
              <span class="webgpu-analysis-label">Target (60 FPS)</span>
              <span class="webgpu-analysis-value ${n>16.67?"over":"ok"}">16.67 ms</span>
            </div>
            <div class="webgpu-analysis-row">
              <span class="webgpu-analysis-label">Budget Used</span>
              <span class="webgpu-analysis-value ${n>16.67?"over":"ok"}">${(n/16.67*100).toFixed(0)}%</span>
            </div>
            <div class="webgpu-analysis-row">
              <span class="webgpu-analysis-label">Number of Passes</span>
              <span class="webgpu-analysis-value">${i.length}</span>
            </div>
            ${o.length>0?`
              <div class="webgpu-analysis-row">
                <span class="webgpu-analysis-label">Slowest Pass</span>
                <span class="webgpu-analysis-value">${this.escapeHtml(o[0].name)}</span>
              </div>
            `:""}
          </div>
        </div>
      </div>
    `}renderWebGPUCapabilitiesTab(){const t=this.latestStats?.webgpuExtras;return`
      <div class="webgpu-capabilities">
        <div class="webgpu-section">
          <div class="webgpu-section-header">Current Frame Stats</div>
          <div class="webgpu-stats-grid">
            <div class="webgpu-stat">
              <span class="webgpu-stat-value">${t?.pipelinesUsed??"—"}</span>
              <span class="webgpu-stat-label">Pipelines</span>
            </div>
            <div class="webgpu-stat">
              <span class="webgpu-stat-value">${t?.renderPasses??"—"}</span>
              <span class="webgpu-stat-label">Render Passes</span>
            </div>
            <div class="webgpu-stat">
              <span class="webgpu-stat-value">${t?.computePasses??"—"}</span>
              <span class="webgpu-stat-label">Compute Passes</span>
            </div>
            <div class="webgpu-stat">
              <span class="webgpu-stat-value">${t?.bindGroupsUsed??"—"}</span>
              <span class="webgpu-stat-label">Bind Groups</span>
            </div>
          </div>
        </div>
        
        <div class="webgpu-section">
          <div class="webgpu-section-header">Device Limits</div>
          <div class="webgpu-limits-info">
            <p class="webgpu-hint">
              Device limits are available via <code>getWebGPUCapabilities(renderer)</code>.
            </p>
          </div>
          <div class="webgpu-limits-grid">
            ${this.renderWebGPULimitsGrid()}
          </div>
        </div>
        
        <div class="webgpu-section">
          <div class="webgpu-section-header">WebGPU vs WebGL</div>
          <div class="webgpu-comparison">
            <div class="webgpu-compare-row header">
              <span>Feature</span>
              <span>WebGL</span>
              <span>WebGPU</span>
            </div>
            <div class="webgpu-compare-row">
              <span>Compute Shaders</span>
              <span class="no">❌</span>
              <span class="yes">✅</span>
            </div>
            <div class="webgpu-compare-row">
              <span>Explicit Binding</span>
              <span class="no">❌</span>
              <span class="yes">✅</span>
            </div>
            <div class="webgpu-compare-row">
              <span>Pipeline State Objects</span>
              <span class="no">❌</span>
              <span class="yes">✅</span>
            </div>
            <div class="webgpu-compare-row">
              <span>Multi-threaded Commands</span>
              <span class="no">❌</span>
              <span class="yes">✅</span>
            </div>
            <div class="webgpu-compare-row">
              <span>Timestamp Queries</span>
              <span class="partial">⚠️</span>
              <span class="yes">✅</span>
            </div>
          </div>
        </div>
      </div>
    `}renderWebGPULimitsGrid(){return[{name:"Max Texture Size 2D",value:"16384"},{name:"Max Bind Groups",value:"4"},{name:"Max Bindings/Group",value:"1000"},{name:"Max Uniform Buffer",value:"64KB"},{name:"Max Storage Buffer",value:"128MB"},{name:"Max Vertex Buffers",value:"8"},{name:"Max Vertex Attributes",value:"16"},{name:"Max Compute Workgroup",value:"256"}].map(t=>`
      <div class="webgpu-limit">
        <span class="webgpu-limit-name">${t.name}</span>
        <span class="webgpu-limit-value">${t.value}</span>
      </div>
    `).join("")}attachWebGPUPanelEvents(e){e.querySelectorAll(".webgpu-tab").forEach(t=>{t.addEventListener("click",()=>{this.webgpuTab=t.dataset.tab,this.updateWebGPUPanel()})}),e.querySelectorAll(".webgpu-pipeline-item").forEach(t=>{t.addEventListener("click",()=>{const s=t.dataset.pipelineId;this.selectedPipelineId=this.selectedPipelineId===s?null:s??null,this.updateWebGPUPanel()})}),e.querySelector('[data-action="close-pipeline-details"]')?.addEventListener("click",()=>{this.selectedPipelineId=null,this.updateWebGPUPanel()}),e.querySelectorAll(".webgpu-shader-item").forEach(t=>{t.addEventListener("click",()=>{const s=t.dataset.pipelineId;s&&(this.webgpuTab="pipelines",this.selectedPipelineId=s,this.updateWebGPUPanel())})})}updateWebGPUPanel(){const e=document.getElementById("three-lens-content-webgpu");e&&(e.innerHTML=this.renderWebGPUContent(),this.attachWebGPUPanelEvents(e))}escapeHtml(e){return e.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]??t)}mountPanel(e,t){const s=this.panelDefinitions.get(e),r=t.querySelector(`#three-lens-content-${e}`);if(!s||!r)return;const n=this.openPanels.get(e),i=this.buildPanelContext(e,r,t,n);this.panelContexts.set(e,i);const o=this.renderPanelContent(e,i);this.applyPanelContent(r,o),s.onMount?.(i),e==="plugins"?this.attachPluginsPanelEvents(r):e==="webgpu"&&this.attachWebGPUPanelEvents(r)}applyPanelContent(e,t){if(typeof t=="string"){e.innerHTML=t;return}if(t instanceof HTMLElement){e.innerHTML="",e.appendChild(t);return}e.innerHTML=""}buildPanelContext(e,t,s,r){return{panelId:e,container:t,panelElement:s,probe:this.probe,overlay:this,state:r??this.openPanels.get(e)}}updatePanelContent(e){const t=this.panelDefinitions.get(e),s=this.panelContexts.get(e);if(!(!t||!s)&&t.render){const r=t.render(s);typeof r=="string"?s.container.innerHTML=r:r instanceof HTMLElement&&(s.container.innerHTML="",s.container.appendChild(r))}}destroyPanel(e){const t=this.panelDefinitions.get(e),s=this.panelContexts.get(e);t?.onDestroy&&s&&t.onDestroy(s),this.panelContexts.delete(e),e==="scene"&&this.virtualScroller&&(this.virtualScroller.dispose(),this.virtualScroller=null,this.virtualScrollContainer=null);const r=document.getElementById(`three-lens-panel-${e}`);r&&r.remove(),this.openPanels.delete(e)}attachPanelEvents(e,t){e.querySelector(".three-lens-panel-header")?.addEventListener("mousedown",i=>{i.target.closest(".three-lens-panel-btn")||i.target.closest(".three-lens-header-search")||this.startDrag(t,i)});const r=e.querySelector(".header-search-input");r&&r.addEventListener("input",()=>{const i=t==="materials"?"materialsSearch":t==="geometry"?"geometrySearch":"texturesSearch";this.updateUIState({[i]:r.value}),this.updatePanelById(t)}),e.addEventListener("mousedown",()=>{this.focusPanel(t)}),e.querySelectorAll(".three-lens-panel-btn").forEach(i=>{i.addEventListener("click",o=>{const l=o.currentTarget.dataset.action;l==="close"&&this.closePanel(t),l==="minimize"&&this.toggleMinimize(t)})}),e.querySelector(".three-lens-panel-resize")?.addEventListener("mousedown",i=>{i.stopPropagation(),this.startResize(t,i)}),t==="scene"&&this.attachTreeEvents(e),t==="stats"&&this.attachStatsTabEvents(e),t==="materials"&&this.attachMaterialsPanelEvents(e),t==="geometry"&&this.attachGeometryPanelEvents(e),t==="textures"&&this.attachTexturesPanelEvents(e),t==="render-targets"&&this.attachRenderTargetsPanelEvents(e)}attachMaterialsPanelEvents(e){const t=e.querySelector("#three-lens-content-materials");t&&Di(t,this.buildSharedPanelContext(),this.uiState,s=>this.updateUIState(s),()=>this.updateMaterialsPanel())}attachGeometryPanelEvents(e){const t=e.querySelector("#three-lens-content-geometry");t&&Ji(t,this.buildSharedPanelContext(),this.uiState,s=>this.updateUIState(s),()=>this.updateGeometryPanel())}attachTexturesPanelEvents(e){const t=e.querySelector("#three-lens-content-textures");t&&ha(t,this.buildSharedPanelContext(),this.uiState,s=>this.updateUIState(s),()=>this.updateTexturesPanel())}attachRenderTargetsPanelEvents(e){const t=e.querySelector("#three-lens-content-render-targets");t&&ka(t,this.buildSharedPanelContext(),this.uiState,s=>this.updateUIState(s),()=>this.updateRenderTargetsPanel())}updateMaterialsPanel(){const e=document.getElementById("three-lens-content-materials");if(!e)return;e.innerHTML=this.renderMaterialsContent();const t=document.getElementById("three-lens-panel-materials");t&&this.attachMaterialsPanelEvents(t)}updateGeometryPanel(){const e=document.getElementById("three-lens-content-geometry");if(!e)return;e.innerHTML=this.renderGeometryContent();const t=document.getElementById("three-lens-panel-geometry");t&&this.attachGeometryPanelEvents(t)}updateTexturesPanel(){const e=document.getElementById("three-lens-content-textures");if(!e)return;e.innerHTML=this.renderTexturesContent();const t=document.getElementById("three-lens-panel-textures");t&&this.attachTexturesPanelEvents(t)}updateRenderTargetsPanel(){const e=document.getElementById("three-lens-content-render-targets");if(!e)return;e.innerHTML=this.renderRenderTargetsContent();const t=document.getElementById("three-lens-panel-render-targets");t&&this.attachRenderTargetsPanelEvents(t)}updatePanelById(e){switch(e){case"materials":this.updateMaterialsPanel();break;case"geometry":this.updateGeometryPanel();break;case"textures":this.updateTexturesPanel();break;case"render-targets":this.updateRenderTargetsPanel();break}}focusPanel(e){const t=this.openPanels.get(e);if(!t)return;t.zIndex=++this.topZIndex;const s=document.getElementById(`three-lens-panel-${e}`);s&&(s.style.zIndex=String(t.zIndex),document.querySelectorAll(".three-lens-panel").forEach(r=>r.classList.remove("focused")),s.classList.add("focused"))}toggleMinimize(e){const t=this.openPanels.get(e);if(!t)return;t.minimized=!t.minimized;const s=document.getElementById(`three-lens-panel-${e}`);s&&s.classList.toggle("minimized",t.minimized)}startDrag(e,t){const s=this.openPanels.get(e);s&&(this.dragState={panelId:e,startX:t.clientX,startY:t.clientY,startPanelX:s.x,startPanelY:s.y},this.focusPanel(e))}startResize(e,t){const s=this.openPanels.get(e);if(!s)return;const r=document.getElementById(`three-lens-panel-${e}`);if(!r)return;const n=r.getBoundingClientRect();r.classList.add("resizing"),r.style.height=`${n.height}px`,r.style.maxHeight="none",s.height=n.height,this.resizeState={panelId:e,startX:t.clientX,startY:t.clientY,startWidth:n.width,startHeight:n.height},this.focusPanel(e)}handleMouseMove(e){if(this.dragState){const t=this.openPanels.get(this.dragState.panelId);if(!t)return;const s=e.clientX-this.dragState.startX,r=e.clientY-this.dragState.startY;t.x=Math.max(0,this.dragState.startPanelX+s),t.y=Math.max(0,this.dragState.startPanelY+r);const n=document.getElementById(`three-lens-panel-${this.dragState.panelId}`);n&&(n.style.left=`${t.x}px`,n.style.top=`${t.y}px`)}if(this.resizeState){const t=this.openPanels.get(this.resizeState.panelId);if(!t)return;const s=e.clientX-this.resizeState.startX,r=e.clientY-this.resizeState.startY;t.width=Math.max(280,this.resizeState.startWidth+s),t.height=Math.max(100,this.resizeState.startHeight+r);const n=document.getElementById(`three-lens-panel-${this.resizeState.panelId}`);n&&(n.style.width=`${t.width}px`,n.style.height=`${t.height}px`)}}handleMouseUp(){if(this.resizeState){const e=document.getElementById(`three-lens-panel-${this.resizeState.panelId}`);e&&e.classList.remove("resizing")}this.dragState=null,this.resizeState=null}handleKeyDown(e){e.ctrlKey&&e.shiftKey&&e.key==="D"&&(this.menuVisible=!this.menuVisible,this.updateMenu(),e.preventDefault())}renderPanelContent(e,t){switch(e){case"scene":return this.renderSceneContent();case"stats":return this.renderStatsContent();case"materials":return this.renderMaterialsContent();case"geometry":return this.renderGeometryContent();case"textures":return this.renderTexturesContent();case"render-targets":return this.renderRenderTargetsContent();case"webgpu":return this.renderWebGPUContent();case"plugins":return this.renderPluginsContent();default:{const s=this.panelDefinitions.get(e);return s?.render&&t?s.render(t):'<div class="three-lens-inspector-empty">Panel content</div>'}}}renderSceneContent(){if(this.probe.getObservedScenes().length===0)return'<div class="three-lens-inspector-empty">No scenes observed</div>';const t=this.probe.takeSnapshot();for(const i of t.scenes){this.expandedNodes.add(i.ref.debugId);for(const o of i.children.slice(0,3))o.children.length>0&&this.expandedNodes.add(o.ref.debugId)}const s=this.selectedNodeId?this.findNodeById(t.scenes,this.selectedNodeId):null;return t.scenes.reduce((i,o)=>i+Hr(o),0)>this.virtualScrollThreshold?`
        <div class="three-lens-split-view">
          <div class="three-lens-tree-pane">
            <div class="three-lens-virtual-scroll-container" id="three-lens-virtual-tree">
              <div class="three-lens-virtual-scroll-content"></div>
            </div>
          </div>
          <div class="three-lens-inspector-pane">
          ${s?this.renderNodeInspector(s):this.renderGlobalTools()}
          </div>
        </div>
      `:`
        <div class="three-lens-split-view">
          <div class="three-lens-tree-pane">
            <div class="three-lens-tree">${t.scenes.map(i=>this.renderNode(i)).join("")}</div>
          </div>
          <div class="three-lens-inspector-pane">
          ${s?this.renderNodeInspector(s):this.renderGlobalTools()}
          </div>
      </div>
    `}initVirtualScroller(){const e=document.getElementById("three-lens-virtual-tree");if(!e)return;const t=this.probe.takeSnapshot();t.scenes.length!==0&&(this.virtualScroller?this.virtualScroller.setData(t.scenes):(this.virtualScroller=new wi({container:e,getChildren:s=>s.children,getId:s=>s.ref.debugId,isExpanded:s=>this.expandedNodes.has(s),renderRow:s=>this.renderVirtualTreeNode(s),rowHeight:28,overscan:5}),this.virtualScroller.setData(t.scenes)),this.virtualScrollContainer=e)}renderVirtualTreeNode(e){const t=e.data,s=t.children.length>0,r=this.expandedNodes.has(t.ref.debugId),n=this.selectedNodeId===t.ref.debugId,i=t.visible,o=t.meshData?.costData?.costLevel||"",l=o?`cost-${o}`:"",c=e.depth*16;return`
      <div class="three-lens-virtual-row" data-id="${t.ref.debugId}" data-depth="${e.depth}" style="padding-left: ${c}px;">
        <div class="three-lens-node-header ${n?"selected":""} ${i?"":"hidden-object"} ${l}">
          <span class="three-lens-node-toggle ${s?r?"expanded":"":"hidden"}">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><path d="M2 1L6 4L2 7z"/></svg>
          </span>
          <span class="three-lens-node-icon ${mr(t.ref.type)}">${gr(t.ref.type)}</span>
          <span class="three-lens-node-name ${t.ref.name?"":"unnamed"}">${t.ref.name||"unnamed"}</span>
          ${o?`<span class="three-lens-cost-indicator ${l}" title="Cost: ${o}">${this.getCostIcon(o)}</span>`:""}
          <button class="three-lens-visibility-btn ${i?"visible":"hidden"}" data-id="${t.ref.debugId}" title="${i?"Hide object":"Show object"}">
            ${i?this.getEyeOpenIcon():this.getEyeClosedIcon()}
          </button>
          <span class="three-lens-node-spacer"></span>
          <span class="three-lens-node-type">${t.ref.type}</span>
        </div>
      </div>
    `}renderNode(e){const t=e.children.length>0,s=this.expandedNodes.has(e.ref.debugId),r=this.selectedNodeId===e.ref.debugId,n=e.visible,i=e.meshData?.costData?.costLevel||"",o=i?`cost-${i}`:"";return`
      <div class="three-lens-node" data-id="${e.ref.debugId}">
        <div class="three-lens-node-header ${r?"selected":""} ${n?"":"hidden-object"} ${o}">
          <span class="three-lens-node-toggle ${t?s?"expanded":"":"hidden"}">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><path d="M2 1L6 4L2 7z"/></svg>
          </span>
          <span class="three-lens-node-icon ${mr(e.ref.type)}">${gr(e.ref.type)}</span>
          <span class="three-lens-node-name ${e.ref.name?"":"unnamed"}">${e.ref.name||"unnamed"}</span>
          ${i?`<span class="three-lens-cost-indicator ${o}" title="Cost: ${i}">${this.getCostIcon(i)}</span>`:""}
          <button class="three-lens-visibility-btn ${n?"visible":"hidden"}" data-id="${e.ref.debugId}" title="${n?"Hide object":"Show object"}">
            ${n?this.getEyeOpenIcon():this.getEyeClosedIcon()}
          </button>
          <span class="three-lens-node-spacer"></span>
          <span class="three-lens-node-type">${e.ref.type}</span>
        </div>
        ${t&&s?`<div class="three-lens-node-children">${e.children.map(l=>this.renderNode(l)).join("")}</div>`:""}
      </div>
    `}getCostIcon(e){switch(e){case"low":return"●";case"medium":return"●";case"high":return"●";case"critical":return"🔥";default:return""}}getEyeOpenIcon(){return`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>`}getEyeClosedIcon(){return`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>`}renderStatsContent(){const e=this.latestStats;if(!e)return'<div class="three-lens-inspector-empty">Waiting for frame data...</div>';const t=this.latestBenchmark,s=e.performance?.fps??(e.cpuTimeMs>0?Math.round(1e3/e.cpuTimeMs):0),r=e.performance?.fpsSmoothed??s,n=e.performance?.fps1PercentLow??0;return`
      <div class="three-lens-tabs" id="three-lens-stats-tabs">
        <button class="three-lens-tab ${this.statsTab==="overview"?"active":""}" data-tab="overview">Overview</button>
        <button class="three-lens-tab ${this.statsTab==="memory"?"active":""}" data-tab="memory">Memory</button>
        <button class="three-lens-tab ${this.statsTab==="rendering"?"active":""}" data-tab="rendering">Rendering</button>
        <button class="three-lens-tab ${this.statsTab==="timeline"?"active":""}" data-tab="timeline">Frames</button>
        <button class="three-lens-tab ${this.statsTab==="resources"?"active":""}" data-tab="resources">Resources</button>
      </div>
      <div class="three-lens-stats-tab-content" id="three-lens-stats-tab-content">
        ${this.statsTab==="overview"?this.renderOverviewTab(e,t,s,r,n):""}
        ${this.statsTab==="memory"?this.renderMemoryTab(e):""}
        ${this.statsTab==="rendering"?this.renderRenderingTab(e):""}
        ${this.statsTab==="timeline"?this.renderTimelineTab(e):""}
        ${this.statsTab==="resources"?this.renderResourcesTab():""}
      </div>
    `}renderOverviewTab(e,t,s,r,n){const i=e.performance?.frameBudgetUsed??e.cpuTimeMs/16.67*100;return e.performance?.isSmooth??e.cpuTimeMs<=18,`
      ${t?this.renderBenchmarkScore(t):""}
      <div class="three-lens-stats-grid">
        <div class="three-lens-stat-card">
          <div class="three-lens-stat-label">FPS</div>
          <div class="three-lens-stat-value ${s<30?"error":s<55?"warning":""}">${s}</div>
        </div>
        <div class="three-lens-stat-card">
          <div class="three-lens-stat-label">CPU Time</div>
          <div class="three-lens-stat-value ${e.cpuTimeMs>16.67?"warning":""}">${e.cpuTimeMs.toFixed(1)}<span class="three-lens-stat-unit">ms</span></div>
        </div>
        ${e.gpuTimeMs!==void 0?`
          <div class="three-lens-stat-card gpu">
            <div class="three-lens-stat-label">GPU Time</div>
            <div class="three-lens-stat-value ${e.gpuTimeMs>16.67?"warning":""}">${e.gpuTimeMs.toFixed(1)}<span class="three-lens-stat-unit">ms</span></div>
          </div>
        `:""}
        <div class="three-lens-stat-card">
          <div class="three-lens-stat-label">Draw Calls</div>
          <div class="three-lens-stat-value ${e.drawCalls>1e3?"warning":""}">${Y(e.drawCalls)}</div>
        </div>
        <div class="three-lens-stat-card">
          <div class="three-lens-stat-label">Triangles</div>
          <div class="three-lens-stat-value ${e.triangles>5e5?"warning":""}">${Y(e.triangles)}</div>
        </div>
      </div>
      
      <!-- Frame Time Chart -->
      <div class="three-lens-chart">
        <div class="three-lens-chart-header">
          <span class="three-lens-chart-title">Frame Time</span>
          <div class="three-lens-chart-controls">
            <button class="three-lens-chart-btn" id="three-lens-chart-zoom-out" title="Zoom Out">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="2" y1="6" x2="10" y2="6"/>
              </svg>
            </button>
            <span class="three-lens-chart-zoom-label" id="three-lens-chart-zoom-label">${this.getVisibleFrameCount()}f</span>
            <button class="three-lens-chart-btn" id="three-lens-chart-zoom-in" title="Zoom In">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="2" y1="6" x2="10" y2="6"/>
                <line x1="6" y1="2" x2="6" y2="10"/>
              </svg>
            </button>
            <button class="three-lens-chart-btn" id="three-lens-chart-reset" title="Reset View">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M1 4.5a5 5 0 1 1 0 3"/>
                <path d="M1 1v4h4"/>
              </svg>
            </button>
          </div>
          <span class="three-lens-chart-value">${e.cpuTimeMs.toFixed(2)}ms</span>
        </div>
        <div class="three-lens-chart-container" id="three-lens-chart-container">
          <canvas class="three-lens-chart-canvas" id="three-lens-stats-chart"></canvas>
          <div class="three-lens-chart-tooltip" id="three-lens-chart-tooltip" style="display: none;">
            <div class="three-lens-tooltip-time"></div>
            <div class="three-lens-tooltip-fps"></div>
          </div>
        </div>
        <div class="three-lens-chart-stats">
          <div class="three-lens-chart-stat">
            <span class="three-lens-chart-stat-label">Min</span>
            <span class="three-lens-chart-stat-value" id="three-lens-chart-min">${this.getFrameTimeMin().toFixed(1)}ms</span>
          </div>
          <div class="three-lens-chart-stat">
            <span class="three-lens-chart-stat-label">Avg</span>
            <span class="three-lens-chart-stat-value" id="three-lens-chart-avg">${this.getFrameTimeAvg().toFixed(1)}ms</span>
          </div>
          <div class="three-lens-chart-stat">
            <span class="three-lens-chart-stat-label">Max</span>
            <span class="three-lens-chart-stat-value warning" id="three-lens-chart-max">${this.getFrameTimeMax().toFixed(1)}ms</span>
          </div>
          <div class="three-lens-chart-stat">
            <span class="three-lens-chart-stat-label">Jitter</span>
            <span class="three-lens-chart-stat-value" id="three-lens-chart-jitter">${this.getFrameTimeJitter().toFixed(1)}ms</span>
          </div>
        </div>
          </div>
      
      <!-- FPS Histogram -->
      ${this.renderFpsHistogram()}
      
      <!-- Frame Time Percentiles -->
      ${this.renderFrameTimePercentiles(r,n,i)}
      
      <!-- Frame Budget Gauge -->
      ${this.renderFrameBudgetGauge(e,i)}
      
      <!-- Bottleneck Analysis -->
      ${this.renderBottleneckAnalysis(e)}
      
      <!-- Session Statistics -->
      ${this.renderSessionStatistics()}
      
      <!-- Rule Violations -->
      ${this.renderRuleViolations()}
      
      ${t&&t.topIssues.length>0?this.renderIssues(t):""}
    `}renderRuleViolations(){const e=this.probe.getRecentViolations(),t=this.probe.getViolationSummary();if(e.length===0)return"";const s=e.slice(-10).reverse();return`
      <div class="three-lens-rule-violations">
        <div class="three-lens-rule-violations-header">
          <span class="three-lens-rule-violations-title">⚠ Rule Violations</span>
          <div class="three-lens-rule-violations-badges">
            ${t.errors>0?`<span class="three-lens-violation-badge error">${t.errors}</span>`:""}
            ${t.warnings>0?`<span class="three-lens-violation-badge warning">${t.warnings}</span>`:""}
          </div>
          <button class="three-lens-action-btn small" data-action="clear-violations" title="Clear violations">✕</button>
          </div>
        <div class="three-lens-rule-violations-list">
          ${s.map(r=>`
            <div class="three-lens-violation-item ${r.severity}">
              <span class="three-lens-violation-severity">${this.getViolationIcon(r.severity)}</span>
              <span class="three-lens-violation-message">${r.message}</span>
              <span class="three-lens-violation-time">${this.formatViolationTime(r.timestamp)}</span>
        </div>
          `).join("")}
      </div>
        ${e.length>10?`<div class="three-lens-violations-more">+ ${e.length-10} more violations...</div>`:""}
      </div>
    `}getViolationIcon(e){switch(e){case"error":return"🔴";case"warning":return"🟡";case"info":return"🔵";default:return"⚪"}}formatViolationTime(e){const t=performance.now()-e;return t<1e3?"now":t<6e4?`${Math.round(t/1e3)}s`:`${Math.round(t/6e4)}m`}renderFpsHistogram(){const e=Math.max(...this.fpsHistogram,1),t=this.fpsHistogram.reduce((r,n)=>r+n,0);if(t<10)return`
        <div class="three-lens-histogram">
          <div class="three-lens-histogram-title">FPS Distribution</div>
          <div class="three-lens-histogram-empty">Collecting data...</div>
          </div>
      `;const s=["0-5","5-10","10-15","15-20","20-25","25-30","30-35","35-40","40-45","45-50","50-55","55+"];return`
      <div class="three-lens-histogram">
        <div class="three-lens-histogram-header">
          <div class="three-lens-histogram-title">FPS Distribution</div>
          <div class="three-lens-histogram-total">${t} frames</div>
          </div>
        <div class="three-lens-histogram-chart">
          ${this.fpsHistogram.map((r,n)=>{const i=r/e*100,o=t>0?(r/t*100).toFixed(1):0,l=n>=10,c=n>=6&&n<10,d=l?"good":c?"ok":"bad";return`
              <div class="three-lens-histogram-bar-wrapper" title="${s[n]} FPS: ${r} frames (${o}%)">
                <div class="three-lens-histogram-bar ${d}" style="height: ${i}%"></div>
                <div class="three-lens-histogram-label">${n===11?"55+":n*5}</div>
        </div>
            `}).join("")}
      </div>
        <div class="three-lens-histogram-legend">
          <span class="three-lens-histogram-legend-item bad">●&nbsp;Slow</span>
          <span class="three-lens-histogram-legend-item ok">●&nbsp;Okay</span>
          <span class="three-lens-histogram-legend-item good">●&nbsp;Smooth</span>
        </div>
      </div>
    `}renderFrameTimePercentiles(e,t,s){return`
      <div class="three-lens-percentiles-section">
        <div class="three-lens-percentiles-title">Frame Time Percentiles</div>
        <div class="three-lens-percentiles-grid">
          <div class="three-lens-percentile-item">
            <div class="three-lens-percentile-label">P50</div>
            <div class="three-lens-percentile-value">${this.frameTimePercentiles.p50.toFixed(1)}ms</div>
          </div>
          <div class="three-lens-percentile-item">
            <div class="three-lens-percentile-label">P90</div>
            <div class="three-lens-percentile-value ${this.frameTimePercentiles.p90>16.67?"warning":""}">${this.frameTimePercentiles.p90.toFixed(1)}ms</div>
          </div>
          <div class="three-lens-percentile-item">
            <div class="three-lens-percentile-label">P95</div>
            <div class="three-lens-percentile-value ${this.frameTimePercentiles.p95>16.67?"warning":""}">${this.frameTimePercentiles.p95.toFixed(1)}ms</div>
          </div>
          <div class="three-lens-percentile-item">
            <div class="three-lens-percentile-label">P99</div>
            <div class="three-lens-percentile-value ${this.frameTimePercentiles.p99>33.33?"error":this.frameTimePercentiles.p99>16.67?"warning":""}">${this.frameTimePercentiles.p99.toFixed(1)}ms</div>
          </div>
        </div>
        <div class="three-lens-percentiles-summary">
          <div class="three-lens-percentile-summary-item">
            <span class="three-lens-percentile-summary-label">Avg FPS:</span>
            <span class="three-lens-percentile-summary-value">${e}</span>
          </div>
          <div class="three-lens-percentile-summary-item">
            <span class="three-lens-percentile-summary-label">1% Low:</span>
            <span class="three-lens-percentile-summary-value">${Math.round(t)}</span>
          </div>
          <div class="three-lens-percentile-summary-item">
            <span class="three-lens-percentile-summary-label">Budget:</span>
            <span class="three-lens-percentile-summary-value ${s>100?"warning":""}">${s.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    `}renderBottleneckAnalysis(e){const t=[];if(e.drawCalls>500){const r=e.drawCalls>1e3?"high":e.drawCalls>750?"medium":"low";t.push({type:"Draw Calls",severity:r,message:`${e.drawCalls} draw calls per frame`,suggestion:"Consider using instancing, merging geometries, or LOD"})}if(e.triangles>1e6){const r=e.triangles>2e6?"high":e.triangles>15e5?"medium":"low";t.push({type:"Geometry",severity:r,message:`${Y(e.triangles)} triangles`,suggestion:"Use LOD, occlusion culling, or reduce mesh complexity"})}const s=e.rendering;return s&&(s.shadowCastingLights>2&&t.push({type:"Shadows",severity:s.shadowCastingLights>4?"high":"medium",message:`${s.shadowCastingLights} shadow-casting lights`,suggestion:"Reduce shadow-casting lights or use baked shadows"}),s.skinnedMeshes>10&&t.push({type:"Animation",severity:s.skinnedMeshes>20?"high":"medium",message:`${s.skinnedMeshes} skinned meshes with ${s.totalBones} bones`,suggestion:"Use LOD for animated characters or reduce bone counts"}),s.transparentObjects>50&&t.push({type:"Transparency",severity:s.transparentObjects>100?"high":"medium",message:`${s.transparentObjects} transparent objects`,suggestion:"Reduce transparent objects or use alpha cutout"})),e.memory&&e.memory.textureMemory>256*1048576&&t.push({type:"Texture Memory",severity:e.memory.textureMemory>512*1048576?"high":"medium",message:`${D(e.memory.textureMemory)} texture memory`,suggestion:"Use compressed textures (KTX2/Basis) or reduce texture sizes"}),t.length===0?`
        <div class="three-lens-bottleneck-section">
          <div class="three-lens-bottleneck-title">Bottleneck Analysis</div>
          <div class="three-lens-bottleneck-ok">
            <span class="three-lens-bottleneck-ok-icon">✓</span>
            <span>No significant bottlenecks detected</span>
          </div>
        </div>
      `:`
      <div class="three-lens-bottleneck-section">
        <div class="three-lens-bottleneck-title">Bottleneck Analysis</div>
        <div class="three-lens-bottleneck-list">
          ${t.map(r=>`
            <div class="three-lens-bottleneck-item ${r.severity}">
              <div class="three-lens-bottleneck-header">
                <span class="three-lens-bottleneck-type">${r.type}</span>
                <span class="three-lens-bottleneck-severity ${r.severity}">${r.severity.toUpperCase()}</span>
              </div>
              <div class="three-lens-bottleneck-message">${r.message}</div>
              <div class="three-lens-bottleneck-suggestion">💡 ${r.suggestion}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `}renderFrameBudgetGauge(e,t){const r=e.cpuTimeMs,n=Math.max(0,16.67-r),i=r>16.67,o=Math.min(180,r/(16.67*2)*180);let l="excellent",c="Excellent";return t>120?(l="critical",c="Critical"):t>100?(l="over",c="Over Budget"):t>80?(l="warning",c="Warning"):t>60&&(l="good",c="Good"),`
      <div class="three-lens-budget-gauge">
        <div class="three-lens-budget-gauge-header">
          <div class="three-lens-budget-gauge-title">Frame Budget</div>
          <div class="three-lens-budget-gauge-target">Target: ${16.67.toFixed(2)}ms (60 FPS)</div>
        </div>
        <div class="three-lens-budget-gauge-visual">
          <svg viewBox="0 0 200 110" class="three-lens-gauge-svg">
            <!-- Background arc -->
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--3lens-bg-primary)" stroke-width="12" stroke-linecap="round"/>
            <!-- Colored segments -->
            <path d="M 20 100 A 80 80 0 0 1 65 32" fill="none" stroke="var(--3lens-accent-emerald)" stroke-width="12" stroke-linecap="round" opacity="0.3"/>
            <path d="M 65 32 A 80 80 0 0 1 100 20" fill="none" stroke="var(--3lens-accent-cyan)" stroke-width="12" stroke-linecap="round" opacity="0.3"/>
            <path d="M 100 20 A 80 80 0 0 1 135 32" fill="none" stroke="var(--3lens-warning)" stroke-width="12" stroke-linecap="round" opacity="0.3"/>
            <path d="M 135 32 A 80 80 0 0 1 180 100" fill="none" stroke="var(--3lens-error)" stroke-width="12" stroke-linecap="round" opacity="0.3"/>
            <!-- Needle -->
            <line x1="100" y1="100" x2="${100+60*Math.cos((o-180)*Math.PI/180)}" y2="${100+60*Math.sin((o-180)*Math.PI/180)}" 
                  stroke="var(--3lens-text-primary)" stroke-width="3" stroke-linecap="round"/>
            <circle cx="100" cy="100" r="6" fill="var(--3lens-text-primary)"/>
          </svg>
          <div class="three-lens-budget-gauge-value ${l}">
            <span class="three-lens-budget-gauge-number">${r.toFixed(2)}</span>
            <span class="three-lens-budget-gauge-unit">ms</span>
          </div>
        </div>
        <div class="three-lens-budget-gauge-footer">
          <div class="three-lens-budget-gauge-status ${l}">${c}</div>
          <div class="three-lens-budget-gauge-remaining">
            ${i?`<span class="over">+${(r-16.67).toFixed(2)}ms over</span>`:`<span class="under">${n.toFixed(2)}ms remaining</span>`}
          </div>
        </div>
        <div class="three-lens-budget-gauge-breakdown">
          <div class="three-lens-budget-bar">
            <div class="three-lens-budget-bar-fill ${l}" style="width: ${Math.min(100,t)}%"></div>
            ${t>100?`<div class="three-lens-budget-bar-over" style="width: ${Math.min(50,t-100)}%"></div>`:""}
          </div>
          <div class="three-lens-budget-labels">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
            <span>150%</span>
          </div>
        </div>
      </div>
    `}renderSessionStatistics(){const e=(performance.now()-this.sessionStartTime)/1e3,t=this.totalFramesRendered/e,s=this.totalFramesRendered>0?this.smoothFrameCount/this.totalFramesRendered*100:100;return`
      <div class="three-lens-session">
        <div class="three-lens-session-header">
          <div class="three-lens-session-title">Session Statistics</div>
          <div class="three-lens-session-duration">${(n=>{const i=Math.floor(n/60),o=Math.floor(n%60);return i>0?`${i}m ${o}s`:`${o}s`})(e)}</div>
        </div>
        <div class="three-lens-session-grid">
          <div class="three-lens-session-stat">
            <div class="three-lens-session-stat-value">${Y(this.totalFramesRendered)}</div>
            <div class="three-lens-session-stat-label">Total Frames</div>
          </div>
          <div class="three-lens-session-stat">
            <div class="three-lens-session-stat-value">${t.toFixed(1)}</div>
            <div class="three-lens-session-stat-label">Avg FPS</div>
          </div>
          <div class="three-lens-session-stat">
            <div class="three-lens-session-stat-value ${s<90?"warning":""}">${s.toFixed(1)}%</div>
            <div class="three-lens-session-stat-label">Smooth Frames</div>
          </div>
          <div class="three-lens-session-stat">
            <div class="three-lens-session-stat-value">${this.droppedFrameCount}</div>
            <div class="three-lens-session-stat-label">Dropped</div>
          </div>
        </div>
        <div class="three-lens-session-peaks">
          <div class="three-lens-session-peak">
            <span class="three-lens-session-peak-label">Peak FPS</span>
            <span class="three-lens-session-peak-value">${this.peakFps.toFixed(0)}</span>
          </div>
          <div class="three-lens-session-peak">
            <span class="three-lens-session-peak-label">Lowest FPS</span>
            <span class="three-lens-session-peak-value ${this.lowestFps<30?"warning":""}">${this.lowestFps===1/0?"--":this.lowestFps.toFixed(0)}</span>
          </div>
          <div class="three-lens-session-peak">
            <span class="three-lens-session-peak-label">Peak Draw Calls</span>
            <span class="three-lens-session-peak-value">${this.peakDrawCalls}</span>
          </div>
          <div class="three-lens-session-peak">
            <span class="three-lens-session-peak-label">Peak Triangles</span>
            <span class="three-lens-session-peak-value">${Y(this.peakTriangles)}</span>
          </div>
          <div class="three-lens-session-peak">
            <span class="three-lens-session-peak-label">Peak Memory</span>
            <span class="three-lens-session-peak-value">${D(this.peakMemory)}</span>
          </div>
        </div>
      </div>
    `}renderBenchmarkScore(e){const t=s=>s>=80?"good":s>=50?"ok":"bad";return`
      <div class="three-lens-benchmark">
        <div class="three-lens-benchmark-header">
          <div class="three-lens-benchmark-score">
            <span class="three-lens-benchmark-value grade-${e.grade}">${e.overall}</span>
            <span class="three-lens-benchmark-label">/ 100</span>
          </div>
          <div class="three-lens-benchmark-grade ${e.grade}">${e.grade}</div>
        </div>
        <div class="three-lens-benchmark-bars">
          <div class="three-lens-benchmark-bar">
            <span class="three-lens-benchmark-bar-label">Timing</span>
            <div class="three-lens-benchmark-bar-track">
              <div class="three-lens-benchmark-bar-fill ${t(e.breakdown.timing)}" style="width: ${e.breakdown.timing}%"></div>
            </div>
            <span class="three-lens-benchmark-bar-value">${e.breakdown.timing}</span>
          </div>
          <div class="three-lens-benchmark-bar">
            <span class="three-lens-benchmark-bar-label">Draw Calls</span>
            <div class="three-lens-benchmark-bar-track">
              <div class="three-lens-benchmark-bar-fill ${t(e.breakdown.drawCalls)}" style="width: ${e.breakdown.drawCalls}%"></div>
            </div>
            <span class="three-lens-benchmark-bar-value">${e.breakdown.drawCalls}</span>
          </div>
          <div class="three-lens-benchmark-bar">
            <span class="three-lens-benchmark-bar-label">Geometry</span>
            <div class="three-lens-benchmark-bar-track">
              <div class="three-lens-benchmark-bar-fill ${t(e.breakdown.geometry)}" style="width: ${e.breakdown.geometry}%"></div>
            </div>
            <span class="three-lens-benchmark-bar-value">${e.breakdown.geometry}</span>
          </div>
          <div class="three-lens-benchmark-bar">
            <span class="three-lens-benchmark-bar-label">Memory</span>
            <div class="three-lens-benchmark-bar-track">
              <div class="three-lens-benchmark-bar-fill ${t(e.breakdown.memory)}" style="width: ${e.breakdown.memory}%"></div>
            </div>
            <span class="three-lens-benchmark-bar-value">${e.breakdown.memory}</span>
          </div>
          <div class="three-lens-benchmark-bar">
            <span class="three-lens-benchmark-bar-label">State Chg</span>
            <div class="three-lens-benchmark-bar-track">
              <div class="three-lens-benchmark-bar-fill ${t(e.breakdown.stateChanges)}" style="width: ${e.breakdown.stateChanges}%"></div>
            </div>
            <span class="three-lens-benchmark-bar-value">${e.breakdown.stateChanges}</span>
          </div>
        </div>
      </div>
    `}renderIssues(e){return e.topIssues.length===0&&e.suggestions.length===0?"":`
      <div class="three-lens-issues">
        ${e.topIssues.map(t=>`
          <div class="three-lens-issue warning">
            <span class="three-lens-issue-icon">⚠️</span>
            <span class="three-lens-issue-text">${t}</span>
          </div>
        `).join("")}
        ${e.suggestions.slice(0,2).map(t=>`
          <div class="three-lens-suggestion">
            <span class="three-lens-issue-icon">💡</span>
            <span class="three-lens-suggestion-text">${t}</span>
          </div>
        `).join("")}
      </div>
    `}renderMemoryTab(e){const t=e.memory;if(!t)return'<div class="three-lens-inspector-empty">Memory stats not available</div>';const s=t.totalGpuMemory||1,r=Math.round(t.textureMemory/s*100),n=Math.round(t.geometryMemory/s*100),i=Math.round(t.renderTargetMemory/s*100),o=1024*1024,l=t.textureMemory>256*o,c=t.geometryMemory>128*o,d=t.totalGpuMemory>512*o,h=this.memoryHistory.length>0?this.memoryHistory.reduce((u,m)=>u+m.totalGpu,0)/this.memoryHistory.length:t.totalGpuMemory,p=t.totalGpuMemory>h*1.1?"rising":t.totalGpuMemory<h*.9?"falling":"stable";return`
      <div class="three-lens-memory-profiler">
        <!-- Total GPU Memory Header -->
        <div class="three-lens-memory-header">
            <div class="three-lens-memory-total">
              <div class="three-lens-memory-total-value ${d?"warning":""}">${D(t.totalGpuMemory)}</div>
              <div class="three-lens-memory-total-label">Total GPU Memory</div>
          </div>
            <div class="three-lens-memory-trend ${p}">
              ${p==="rising"?"↗ Rising":p==="falling"?"↘ Falling":"→ Stable"}
          </div>
          </div>

          <!-- Memory Breakdown Bar -->
          <div class="three-lens-memory-breakdown">
            <div class="three-lens-memory-breakdown-title">Memory Breakdown</div>
            <div class="three-lens-memory-bar">
              <div class="three-lens-memory-bar-segment texture" style="width: ${r}%" title="Textures: ${D(t.textureMemory)}"></div>
              <div class="three-lens-memory-bar-segment geometry" style="width: ${n}%" title="Geometry: ${D(t.geometryMemory)}"></div>
              <div class="three-lens-memory-bar-segment render-target" style="width: ${i}%" title="Render Targets: ${D(t.renderTargetMemory)}"></div>
          </div>
            <div class="three-lens-memory-legend">
              <div class="three-lens-memory-legend-item">
                <span class="three-lens-memory-legend-color texture"></span>
                <span class="three-lens-memory-legend-label">Textures</span>
                <span class="three-lens-memory-legend-value ${l?"warning":""}">${D(t.textureMemory)}</span>
        </div>
              <div class="three-lens-memory-legend-item">
                <span class="three-lens-memory-legend-color geometry"></span>
                <span class="three-lens-memory-legend-label">Geometry</span>
                <span class="three-lens-memory-legend-value ${c?"warning":""}">${D(t.geometryMemory)}</span>
      </div>
              <div class="three-lens-memory-legend-item">
                <span class="three-lens-memory-legend-color render-target"></span>
                <span class="three-lens-memory-legend-label">Render Targets</span>
                <span class="three-lens-memory-legend-value">${D(t.renderTargetMemory)}</span>
              </div>
            </div>
          </div>

          <!-- Memory History Chart -->
          ${this.renderMemoryHistoryChart()}

          <!-- Resource Counts -->
      <div class="three-lens-metrics-section">
        <div class="three-lens-metrics-title">Resource Counts</div>
        <div class="three-lens-metrics-grid">
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${t.geometries}</div>
            <div class="three-lens-metric-label">Geometries</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${t.textures}</div>
            <div class="three-lens-metric-label">Textures</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${t.programs}</div>
                <div class="three-lens-metric-label">Shaders</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${t.renderTargets}</div>
            <div class="three-lens-metric-label">RT</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${e.objectsTotal}</div>
            <div class="three-lens-metric-label">Objects</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${e.materialsUsed}</div>
            <div class="three-lens-metric-label">Materials</div>
          </div>
        </div>
      </div>

          <!-- Memory Efficiency Analysis -->
          ${this.renderMemoryEfficiency(t,e)}
          
          <!-- Memory Per Category Breakdown -->
          ${this.renderMemoryCategoryDetails(t)}

          <!-- JS Heap (if available) -->
          ${t.jsHeapSize?this.renderJsHeapSection(t.jsHeapSize,t.jsHeapLimit??0):""}
          
          <!-- Memory Tips -->
          ${this.renderMemoryTips(t,e)}

        <!-- Memory Warnings -->
        ${this.renderMemoryWarnings(t,e)}
            </div>
    `}renderMemoryEfficiency(e,t){const s=t.objectsTotal>0?e.totalGpuMemory/t.objectsTotal:0,r=e.textures>0?e.textureMemory/e.textures:0,n=e.geometries>0?e.geometryMemory/e.geometries:0,i=1024*1024;let o=100;e.totalGpuMemory>512*i?o-=30:e.totalGpuMemory>256*i&&(o-=15),r>4*i?o-=20:r>2*i&&(o-=10),e.geometries>100&&(o-=15),e.textures>50&&(o-=10),o=Math.max(0,o);const l=o>=80?"A":o>=60?"B":o>=40?"C":o>=20?"D":"F",c=l==="A"?"var(--3lens-accent-emerald)":l==="B"?"var(--3lens-accent-cyan)":l==="C"?"var(--3lens-accent-amber)":"var(--3lens-error)";return`
      <div class="three-lens-memory-efficiency">
        <div class="three-lens-memory-efficiency-header">
          <div class="three-lens-memory-efficiency-title">Memory Efficiency</div>
          <div class="three-lens-memory-efficiency-grade" style="color: ${c};">${l}</div>
            </div>
        <div class="three-lens-memory-efficiency-grid">
          <div class="three-lens-memory-efficiency-item">
            <div class="three-lens-memory-efficiency-value">${D(s)}</div>
            <div class="three-lens-memory-efficiency-label">Avg per Object</div>
          </div>
          <div class="three-lens-memory-efficiency-item">
            <div class="three-lens-memory-efficiency-value">${D(r)}</div>
            <div class="three-lens-memory-efficiency-label">Avg Texture Size</div>
          </div>
          <div class="three-lens-memory-efficiency-item">
            <div class="three-lens-memory-efficiency-value">${D(n)}</div>
            <div class="three-lens-memory-efficiency-label">Avg Geometry Size</div>
          </div>
        </div>
        <div class="three-lens-memory-efficiency-bar">
          <div class="three-lens-memory-efficiency-fill" style="width: ${o}%; background: ${c};"></div>
        </div>
        <div class="three-lens-memory-efficiency-score">${o}/100</div>
      </div>
    `}renderMemoryCategoryDetails(e){const r=this.probe.getTextures(),n=this.probe.getGeometries();let i=0,o=0,l=0,c={name:"",size:0,dimensions:""};for(const f of r)f.estimatedMemoryBytes<512*1024?i++:f.estimatedMemoryBytes<2*1048576?o++:l++,f.estimatedMemoryBytes>c.size&&(c={name:f.name||"unnamed",size:f.estimatedMemoryBytes,dimensions:`${f.width}×${f.height}`});r.length===0&&e.textures>0&&(i=Math.floor(e.textures*.6),o=Math.floor(e.textures*.3),l=e.textures-i-o);let d=0,h=0,p=0,u={name:"",vertices:0,faces:0};for(const f of n)f.vertexCount<1e3?d++:f.vertexCount<1e4?h++:p++,f.vertexCount>u.vertices&&(u={name:f.name||f.type,vertices:f.vertexCount,faces:f.faceCount});const m=r.length||e.textures,g=n.length||e.geometries;return`
      <div class="three-lens-memory-categories">
        <div class="three-lens-memory-categories-title">Memory Distribution</div>
        
        <!-- Texture Size Distribution -->
        <div class="three-lens-memory-category">
          <div class="three-lens-memory-category-header">
            <span class="three-lens-memory-category-icon">🖼️</span>
            <span class="three-lens-memory-category-name">Textures</span>
            <span class="three-lens-memory-category-count">${m}</span>
          </div>
          <div class="three-lens-memory-category-bar">
            <div class="three-lens-memory-category-segment small" style="flex: ${i||1}" title="Small (<512KB): ${i}"></div>
            <div class="three-lens-memory-category-segment medium" style="flex: ${o||0}" title="Medium (512KB-2MB): ${o}"></div>
            <div class="three-lens-memory-category-segment large" style="flex: ${l||0}" title="Large (>2MB): ${l}"></div>
          </div>
          <div class="three-lens-memory-category-legend">
            <span class="small">● Small (${i})</span>
            <span class="medium">● Medium (${o})</span>
            <span class="large">● Large (${l})</span>
          </div>
          ${c.size>0?`
            <div class="three-lens-memory-category-largest">
              Largest: <strong>${c.name}</strong> (${c.dimensions}, ${D(c.size)})
        </div>
      `:""}
        </div>
        
        <!-- Geometry Complexity Distribution -->
        <div class="three-lens-memory-category">
          <div class="three-lens-memory-category-header">
            <span class="three-lens-memory-category-icon">📐</span>
            <span class="three-lens-memory-category-name">Geometries</span>
            <span class="three-lens-memory-category-count">${g}</span>
          </div>
          ${n.length>0?`
            <div class="three-lens-memory-category-bar">
              <div class="three-lens-memory-category-segment small" style="flex: ${d||1}" title="Simple (<1K verts): ${d}"></div>
              <div class="three-lens-memory-category-segment medium" style="flex: ${h||0}" title="Medium (1K-10K verts): ${h}"></div>
              <div class="three-lens-memory-category-segment large" style="flex: ${p||0}" title="Complex (>10K verts): ${p}"></div>
            </div>
            <div class="three-lens-memory-category-legend">
              <span class="small">● Simple (${d})</span>
              <span class="medium">● Medium (${h})</span>
              <span class="large">● Complex (${p})</span>
            </div>
            ${u.vertices>0?`
              <div class="three-lens-memory-category-largest">
                Largest: <strong>${u.name}</strong> (${Y(u.vertices)} verts, ${Y(u.faces)} faces)
              </div>
            `:""}
          `:`
            <div class="three-lens-memory-category-details">
              <div class="three-lens-memory-category-detail">
                <span class="label">Total Memory</span>
                <span class="value">${D(e.geometryMemory)}</span>
              </div>
              <div class="three-lens-memory-category-detail">
                <span class="label">Avg Size</span>
                <span class="value">${D(e.geometries>0?e.geometryMemory/e.geometries:0)}</span>
              </div>
            </div>
          `}
        </div>
        
        <!-- Programs/Shaders -->
        <div class="three-lens-memory-category">
          <div class="three-lens-memory-category-header">
            <span class="three-lens-memory-category-icon">⚡</span>
            <span class="three-lens-memory-category-name">Shader Programs</span>
            <span class="three-lens-memory-category-count">${e.programs}</span>
          </div>
          <div class="three-lens-memory-category-note">
            ${e.programs>20?"⚠️ Many unique shaders may impact performance":"✓ Reasonable number of shader variants"}
          </div>
        </div>
        
        <!-- Render Targets -->
        ${e.renderTargets>0?`
          <div class="three-lens-memory-category">
            <div class="three-lens-memory-category-header">
              <span class="three-lens-memory-category-icon">🎯</span>
              <span class="three-lens-memory-category-name">Render Targets</span>
              <span class="three-lens-memory-category-count">${e.renderTargets}</span>
            </div>
            <div class="three-lens-memory-category-details">
              <div class="three-lens-memory-category-detail">
                <span class="label">Memory</span>
                <span class="value">${D(e.renderTargetMemory)}</span>
              </div>
              <div class="three-lens-memory-category-detail">
                <span class="label">Avg Size</span>
                <span class="value">${D(e.renderTargets>0?e.renderTargetMemory/e.renderTargets:0)}</span>
              </div>
            </div>
          </div>
        `:""}
      </div>
    `}renderMemoryTips(e,t){const s=[];if(e.textureMemory>128*1048576&&e.textures>10&&s.push({icon:"🗜️",tip:"Use KTX2/Basis texture compression to reduce texture memory by 75%+",priority:"high"}),e.geometries>50&&s.push({icon:"🔗",tip:"Consider merging static geometries with BufferGeometryUtils.mergeBufferGeometries()",priority:"medium"}),e.textures>30&&s.push({icon:"🎨",tip:"Use texture atlases to reduce texture count and draw calls",priority:"medium"}),t.objectsTotal>1e3&&e.geometryMemory>64*1048576&&s.push({icon:"📏",tip:"Implement LOD (Level of Detail) for distant objects",priority:"high"}),e.programs>15&&s.push({icon:"⚙️",tip:"Reduce shader variants by sharing materials when possible",priority:"low"}),e.renderTargets>5&&s.push({icon:"🎯",tip:"Consolidate post-processing passes to reduce render target memory",priority:"medium"}),this.memoryHistory.length>=10){const n=this.memoryHistory[0].totalGpu;this.memoryHistory[this.memoryHistory.length-1].totalGpu>n*1.5&&s.push({icon:"🔍",tip:"Memory is growing - check for texture/geometry leaks. Dispose unused resources.",priority:"high"})}return s.length===0?"":(s.sort((n,i)=>{const o={high:0,medium:1,low:2};return o[n.priority]-o[i.priority]}),`
      <div class="three-lens-memory-tips">
        <div class="three-lens-memory-tips-title">💡 Optimization Tips</div>
        <div class="three-lens-memory-tips-list">
          ${s.slice(0,4).map(n=>`
            <div class="three-lens-memory-tip ${n.priority}">
              <span class="three-lens-memory-tip-icon">${n.icon}</span>
              <span class="three-lens-memory-tip-text">${n.tip}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `)}renderMemoryHistoryChart(){if(this.memoryHistory.length<2)return`
        <div class="three-lens-memory-chart">
          <div class="three-lens-memory-chart-title">Memory Over Time</div>
          <div class="three-lens-memory-chart-empty">Collecting data...</div>
        </div>
      `;const e=Math.max(...this.memoryHistory.map(l=>l.totalGpu),1),t=48,s=300,r=s/Math.max(this.memoryHistory.length-1,1),n=this.memoryHistory.map((l,c)=>{const d=c*r,h=t-l.totalGpu/e*t;return`${d},${h}`}),i=`M${n.join(" L")}`,o=`M0,${t} L${n.join(" L")} L${s},${t} Z`;return`
      <div class="three-lens-memory-chart">
        <div class="three-lens-memory-chart-header">
          <div class="three-lens-memory-chart-title">Memory Over Time</div>
          <div class="three-lens-memory-chart-max">${D(e)}</div>
        </div>
        <svg class="three-lens-memory-chart-svg" viewBox="0 0 ${s} ${t}" preserveAspectRatio="none">
          <defs>
            <linearGradient id="memoryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color: var(--3lens-accent-cyan); stop-opacity: 0.4"/>
              <stop offset="100%" style="stop-color: var(--3lens-accent-cyan); stop-opacity: 0.05"/>
            </linearGradient>
          </defs>
          <path class="three-lens-memory-chart-area" d="${o}" fill="url(#memoryGradient)"/>
          <path class="three-lens-memory-chart-line" d="${i}" fill="none" stroke="var(--3lens-accent-cyan)" stroke-width="1.5"/>
        </svg>
        <div class="three-lens-memory-chart-labels">
          <span>60s ago</span>
          <span>Now</span>
        </div>
      </div>
    `}renderJsHeapSection(e,t){const s=t>0?Math.round(e/t*100):0,r=s>80;return`
      <div class="three-lens-metrics-section">
        <div class="three-lens-metrics-title">JavaScript Heap</div>
        <div class="three-lens-heap-container">
          <div class="three-lens-heap-bar">
            <div class="three-lens-heap-bar-fill ${r?"warning":""}" style="width: ${s}%"></div>
          </div>
          <div class="three-lens-heap-stats">
            <span class="three-lens-heap-used ${r?"warning":""}">${D(e)}</span>
            <span class="three-lens-heap-separator">/</span>
            <span class="three-lens-heap-limit">${D(t)}</span>
            <span class="three-lens-heap-percent ${r?"warning":""}">(${s}%)</span>
          </div>
        </div>
      </div>
    `}renderMemoryWarnings(e,t){const s=[];if(e.textureMemory>256*1048576&&s.push(`High texture memory: ${D(e.textureMemory)}. Consider using compressed textures or reducing texture sizes.`),e.geometryMemory>128*1048576&&s.push(`High geometry memory: ${D(e.geometryMemory)}. Consider using LOD or geometry instancing.`),e.totalGpuMemory>512*1048576&&s.push(`Total GPU memory is high: ${D(e.totalGpuMemory)}. May cause performance issues on lower-end devices.`),e.textures>50&&s.push(`Many textures loaded (${e.textures}). Consider using texture atlases.`),e.geometries>100&&s.push(`Many geometries (${e.geometries}). Consider merging static meshes.`),this.memoryHistory.length>=10){const n=this.memoryHistory.slice(-10);n.every((o,l)=>l===0||o.totalGpu>=n[l-1].totalGpu)&&n[n.length-1].totalGpu>n[0].totalGpu*1.2&&s.push("⚠️ Memory appears to be continuously increasing. Possible memory leak detected.")}return s.length===0?"":`
      <div class="three-lens-memory-warnings">
        <div class="three-lens-memory-warnings-title">⚠ Memory Warnings</div>
        ${s.map(n=>`<div class="three-lens-memory-warning">${n}</div>`).join("")}
      </div>
    `}renderRenderingTab(e){const t=e.rendering,s=e.performance;return t?`
      <div class="three-lens-rendering-profiler">
        <!-- Render Pipeline Visualization -->
        ${this.renderPipelineVisualization(e,t)}
        
        <!-- Draw Call Efficiency -->
        ${this.renderDrawCallEfficiency(e,s)}
        
        <!-- Geometry Statistics -->
      <div class="three-lens-metrics-section">
          <div class="three-lens-metrics-title">Geometry Statistics</div>
        <div class="three-lens-metrics-grid">
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${Y(e.triangles)}</div>
            <div class="three-lens-metric-label">Triangles</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${Y(e.vertices)}</div>
            <div class="three-lens-metric-label">Vertices</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${e.drawCalls}</div>
            <div class="three-lens-metric-label">Draw Calls</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${s?.trianglesPerDrawCall??0}</div>
            <div class="three-lens-metric-label">Tri/Call</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${e.points}</div>
            <div class="three-lens-metric-label">Points</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${e.lines}</div>
            <div class="three-lens-metric-label">Lines</div>
          </div>
        </div>
      </div>
        
        <!-- Object Visibility Breakdown -->
        ${this.renderObjectVisibilityBreakdown(e,t)}
        
        <!-- Lighting Analysis -->
        ${this.renderLightingAnalysis(t)}
        
        <!-- Animation & Instancing -->
        ${this.renderAnimationInstancing(t)}
        
        <!-- State Changes Analysis -->
        ${this.renderStateChangesAnalysis(t)}
        
        ${t.xrActive?this.renderXRInfo(t):""}
        
        <!-- Rendering Warnings -->
        ${this.renderRenderingWarnings(e,t)}
          </div>
    `:'<div class="three-lens-inspector-empty">Rendering stats not available</div>'}renderPipelineVisualization(e,t){const s=e.cpuTimeMs,r=t.shadowCastingLights*.5,n=s*.6,i=t.transparentObjects>0?s*.2:0,o=t.postProcessingPasses*.3,l=[{name:"Shadow Pass",time:r,color:"#8b5cf6",active:t.shadowCastingLights>0},{name:"Opaque",time:n,color:"#3b82f6",active:!0},{name:"Transparent",time:i,color:"#22d3ee",active:t.transparentObjects>0},{name:"Post-Process",time:o,color:"#f59e0b",active:t.postProcessingPasses>0}].filter(d=>d.active),c=l.reduce((d,h)=>d+h.time,0);return`
      <div class="three-lens-pipeline">
        <div class="three-lens-pipeline-header">
          <div class="three-lens-pipeline-title">Render Pipeline</div>
          <div class="three-lens-pipeline-time">${s.toFixed(2)}ms total</div>
          </div>
        <div class="three-lens-pipeline-bar">
          ${l.map(d=>`<div class="three-lens-pipeline-segment" style="width: ${c>0?d.time/c*100:0}%; background: ${d.color};" title="${d.name}: ~${d.time.toFixed(1)}ms"></div>`).join("")}
          </div>
        <div class="three-lens-pipeline-legend">
          ${l.map(d=>`
            <div class="three-lens-pipeline-legend-item">
              <span class="three-lens-pipeline-legend-color" style="background: ${d.color};"></span>
              <span class="three-lens-pipeline-legend-label">${d.name}</span>
        </div>
          `).join("")}
      </div>
          </div>
    `}renderDrawCallEfficiency(e,t){const s=t?.trianglesPerDrawCall??(e.drawCalls>0?e.triangles/e.drawCalls:0),r=t?.drawCallEfficiency??Math.min(100,s/100);let n="A",i="var(--3lens-accent-emerald)";r<25?(n="F",i="var(--3lens-error)"):r<50?(n="D",i="var(--3lens-warning)"):r<65?(n="C",i="var(--3lens-accent-amber)"):r<80&&(n="B",i="var(--3lens-accent-cyan)");const o=this.drawCallHistory.length>5?this.renderMiniChart(this.drawCallHistory,"var(--3lens-accent-blue)"):"";return`
      <div class="three-lens-efficiency">
        <div class="three-lens-efficiency-header">
          <div class="three-lens-efficiency-title">Draw Call Efficiency</div>
          <div class="three-lens-efficiency-grade" style="color: ${i};">${n}</div>
          </div>
        <div class="three-lens-efficiency-content">
          <div class="three-lens-efficiency-meter">
            <div class="three-lens-efficiency-bar">
              <div class="three-lens-efficiency-fill" style="width: ${Math.min(100,r)}%; background: ${i};"></div>
          </div>
            <div class="three-lens-efficiency-value">${r.toFixed(0)}%</div>
        </div>
          <div class="three-lens-efficiency-stats">
            <div class="three-lens-efficiency-stat">
              <span class="three-lens-efficiency-stat-value">${Y(Math.round(s))}</span>
              <span class="three-lens-efficiency-stat-label">Triangles/Call</span>
      </div>
            <div class="three-lens-efficiency-stat">
              <span class="three-lens-efficiency-stat-value">${e.drawCalls}</span>
              <span class="three-lens-efficiency-stat-label">Total Calls</span>
          </div>
          </div>
          </div>
        ${o?`
          <div class="three-lens-efficiency-history">
            <div class="three-lens-efficiency-history-title">Draw Calls Over Time</div>
            ${o}
        </div>
        `:""}
      </div>
    `}renderMiniChart(e,t){const s=Math.max(...e,1),r=Math.min(...e,0),n=s-r||1,i=32,o=200,l=o/Math.max(e.length-1,1),c=e.map((p,u)=>{const m=u*l,g=i-(p-r)/n*i;return`${m},${g}`}),d=`M${c.join(" L")}`,h=`M0,${i} L${c.join(" L")} L${o},${i} Z`;return`
      <svg class="three-lens-mini-chart" viewBox="0 0 ${o} ${i}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="miniChartGradient-${t.replace("#","")}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color: ${t}; stop-opacity: 0.3"/>
            <stop offset="100%" style="stop-color: ${t}; stop-opacity: 0.05"/>
          </linearGradient>
        </defs>
        <path d="${h}" fill="url(#miniChartGradient-${t.replace("#","")})"/>
        <path d="${d}" fill="none" stroke="${t}" stroke-width="1.5"/>
      </svg>
    `}renderObjectVisibilityBreakdown(e,t){const s=e.objectsTotal||1,r=e.objectsVisible,n=e.objectsCulled,i=t.transparentObjects,o=r-i,l=r/s*100,c=n/s*100;return`
      <div class="three-lens-visibility-breakdown">
        <div class="three-lens-visibility-title">Object Visibility</div>
        <div class="three-lens-visibility-bar">
          <div class="three-lens-visibility-segment visible" style="width: ${l}%;" title="Visible: ${r}"></div>
          <div class="three-lens-visibility-segment culled" style="width: ${c}%;" title="Culled: ${n}"></div>
          </div>
        <div class="three-lens-visibility-stats">
          <div class="three-lens-visibility-stat">
            <span class="three-lens-visibility-dot visible"></span>
            <span class="three-lens-visibility-label">Visible</span>
            <span class="three-lens-visibility-value">${r}</span>
          </div>
          <div class="three-lens-visibility-stat">
            <span class="three-lens-visibility-dot culled"></span>
            <span class="three-lens-visibility-label">Culled</span>
            <span class="three-lens-visibility-value">${n}</span>
          </div>
          <div class="three-lens-visibility-stat">
            <span class="three-lens-visibility-dot transparent"></span>
            <span class="three-lens-visibility-label">Transparent</span>
            <span class="three-lens-visibility-value">${i}</span>
        </div>
          <div class="three-lens-visibility-stat">
            <span class="three-lens-visibility-dot opaque"></span>
            <span class="three-lens-visibility-label">Opaque</span>
            <span class="three-lens-visibility-value">${o}</span>
      </div>
            </div>
            </div>
    `}renderLightingAnalysis(e){e.totalLights>0,e.shadowCastingLights>0;const t=e.shadowCastingLights*2,s=t>4;return`
      <div class="three-lens-lighting">
        <div class="three-lens-lighting-title">Lighting & Shadows</div>
        <div class="three-lens-lighting-grid">
          <div class="three-lens-lighting-item">
            <div class="three-lens-lighting-icon">💡</div>
            <div class="three-lens-lighting-info">
              <div class="three-lens-lighting-value">${e.totalLights}</div>
              <div class="three-lens-lighting-label">Total Lights</div>
          </div>
        </div>
          <div class="three-lens-lighting-item ${s?"warning":""}">
            <div class="three-lens-lighting-icon">🌓</div>
            <div class="three-lens-lighting-info">
              <div class="three-lens-lighting-value">${e.shadowCastingLights}</div>
              <div class="three-lens-lighting-label">Shadow Casters</div>
            </div>
          </div>
          <div class="three-lens-lighting-item">
            <div class="three-lens-lighting-icon">🔄</div>
            <div class="three-lens-lighting-info">
              <div class="three-lens-lighting-value">${e.shadowMapUpdates}</div>
              <div class="three-lens-lighting-label">Shadow Updates</div>
            </div>
          </div>
          <div class="three-lens-lighting-item">
            <div class="three-lens-lighting-icon">👁️</div>
            <div class="three-lens-lighting-info">
              <div class="three-lens-lighting-value">${e.activeLights}</div>
              <div class="three-lens-lighting-label">Active Lights</div>
            </div>
          </div>
        </div>
        ${s?`
          <div class="three-lens-lighting-warning">
            ⚠️ High shadow cost (~${t.toFixed(0)}ms). Consider reducing shadow-casting lights.
        </div>
      `:""}
      </div>
    `}renderAnimationInstancing(e){const t=e.skinnedMeshes>0||e.totalBones>0,s=e.instancedDrawCalls>0||e.totalInstances>0;return!t&&!s?`
        <div class="three-lens-animation">
          <div class="three-lens-animation-title">Animation & Instancing</div>
          <div class="three-lens-animation-empty">No skinned meshes or instances detected</div>
        </div>
      `:`
      <div class="three-lens-animation">
        <div class="three-lens-animation-title">Animation & Instancing</div>
        <div class="three-lens-animation-grid">
          ${t?`
            <div class="three-lens-animation-section">
              <div class="three-lens-animation-section-title">Skinned Meshes</div>
              <div class="three-lens-animation-stats">
                <div class="three-lens-animation-stat">
                  <span class="three-lens-animation-stat-value">${e.skinnedMeshes}</span>
                  <span class="three-lens-animation-stat-label">Meshes</span>
                </div>
                <div class="three-lens-animation-stat">
                  <span class="three-lens-animation-stat-value">${e.totalBones}</span>
                  <span class="three-lens-animation-stat-label">Bones</span>
                </div>
                <div class="three-lens-animation-stat">
                  <span class="three-lens-animation-stat-value">${e.skinnedMeshes>0?Math.round(e.totalBones/e.skinnedMeshes):0}</span>
                  <span class="three-lens-animation-stat-label">Avg/Mesh</span>
                </div>
              </div>
            </div>
          `:""}
          ${s?`
            <div class="three-lens-animation-section">
              <div class="three-lens-animation-section-title">Instancing</div>
              <div class="three-lens-animation-stats">
                <div class="three-lens-animation-stat">
                  <span class="three-lens-animation-stat-value">${e.instancedDrawCalls}</span>
                  <span class="three-lens-animation-stat-label">Draw Calls</span>
                </div>
                <div class="three-lens-animation-stat">
                  <span class="three-lens-animation-stat-value">${Y(e.totalInstances)}</span>
                  <span class="three-lens-animation-stat-label">Instances</span>
                </div>
                <div class="three-lens-animation-stat">
                  <span class="three-lens-animation-stat-value">${e.instancedDrawCalls>0?Math.round(e.totalInstances/e.instancedDrawCalls):0}</span>
                  <span class="three-lens-animation-stat-label">Avg/Call</span>
                </div>
              </div>
            </div>
          `:""}
        </div>
      </div>
    `}renderStateChangesAnalysis(e){const t=e.programSwitches+e.textureBinds+e.renderTargetSwitches;return`
      <div class="three-lens-state-changes">
        <div class="three-lens-state-changes-header">
          <div class="three-lens-state-changes-title">State Changes</div>
          <div class="three-lens-state-changes-total ${t>200?"warning":""}">${t} total</div>
        </div>
        <div class="three-lens-state-changes-grid">
          <div class="three-lens-state-change-item">
            <div class="three-lens-state-change-bar">
              <div class="three-lens-state-change-fill program" style="width: ${Math.min(100,e.programSwitches/2)}%;"></div>
            </div>
            <div class="three-lens-state-change-info">
              <span class="three-lens-state-change-label">Shader Switches</span>
              <span class="three-lens-state-change-value">${e.programSwitches}</span>
            </div>
          </div>
          <div class="three-lens-state-change-item">
            <div class="three-lens-state-change-bar">
              <div class="three-lens-state-change-fill texture" style="width: ${Math.min(100,e.textureBinds/5)}%;"></div>
            </div>
            <div class="three-lens-state-change-info">
              <span class="three-lens-state-change-label">Texture Binds</span>
              <span class="three-lens-state-change-value">${e.textureBinds}</span>
            </div>
          </div>
          <div class="three-lens-state-change-item">
            <div class="three-lens-state-change-bar">
              <div class="three-lens-state-change-fill rt" style="width: ${Math.min(100,e.renderTargetSwitches*10)}%;"></div>
            </div>
            <div class="three-lens-state-change-info">
              <span class="three-lens-state-change-label">RT Switches</span>
              <span class="three-lens-state-change-value">${e.renderTargetSwitches}</span>
            </div>
          </div>
          <div class="three-lens-state-change-item">
            <div class="three-lens-state-change-bar">
              <div class="three-lens-state-change-fill upload" style="width: ${Math.min(100,e.bufferUploads*5)}%;"></div>
            </div>
            <div class="three-lens-state-change-info">
              <span class="three-lens-state-change-label">Buffer Uploads</span>
              <span class="three-lens-state-change-value">${e.bufferUploads}</span>
            </div>
          </div>
        </div>
        ${e.bytesUploaded>0?`
          <div class="three-lens-state-changes-upload">
            Data uploaded: ${D(e.bytesUploaded)}/frame
          </div>
        `:""}
      </div>
    `}renderXRInfo(e){return`
      <div class="three-lens-xr">
        <div class="three-lens-xr-header">
          <div class="three-lens-xr-title">🥽 XR Mode Active</div>
          <div class="three-lens-xr-badge">VR</div>
        </div>
        <div class="three-lens-xr-stats">
          <div class="three-lens-xr-stat">
            <span class="three-lens-xr-stat-value">${e.viewports}</span>
            <span class="three-lens-xr-stat-label">Viewports</span>
          </div>
          <div class="three-lens-xr-stat">
            <span class="three-lens-xr-stat-value">×${e.viewports}</span>
            <span class="three-lens-xr-stat-label">Draw Cost</span>
          </div>
        </div>
      </div>
    `}renderRenderingWarnings(e,t){const s=[];return e.drawCalls>500&&e.performance?.trianglesPerDrawCall&&e.performance.trianglesPerDrawCall<500&&s.push("Low triangles per draw call. Consider batching or using instancing."),t.transparentObjects>50&&s.push(`${t.transparentObjects} transparent objects may cause overdraw issues.`),t.shadowCastingLights>4&&s.push("Many shadow-casting lights. Consider using fewer or baked shadows."),t.renderTargetSwitches>10&&s.push("High render target switches. Consider consolidating post-processing passes."),s.length===0?"":`
      <div class="three-lens-rendering-warnings">
        <div class="three-lens-rendering-warnings-title">⚠ Rendering Warnings</div>
        ${s.map(r=>`<div class="three-lens-rendering-warning">${r}</div>`).join("")}
      </div>
    `}renderTimelineTab(e){const t=this.gpuHistory.length>0,s=this.getTimelineVisibleFrameCount(),r=33.33,n=this.recordedFrames.length>0,i=n?((this.recordedFrames[this.recordedFrames.length-1].timestamp-this.recordedFrames[0].timestamp)/1e3).toFixed(1):"0",o=this.detectSpikes(r);return`
      <div class="three-lens-timeline-container">
        <div class="three-lens-timeline-controls">
          <div class="three-lens-timeline-left-controls">
            <button class="three-lens-timeline-record-btn ${this.isRecording?"recording":""}" id="three-lens-timeline-record" title="${this.isRecording?"Stop Recording":"Start Recording"}">
              ${this.isRecording?"⏹":"⏺"}
            </button>
            ${n?`
              <button class="three-lens-timeline-btn" id="three-lens-timeline-clear" title="Clear Recording">🗑</button>
              <span class="three-lens-timeline-recording-info">${this.recordedFrames.length}f / ${i}s</span>
            `:""}
            <div class="three-lens-timeline-divider"></div>
            <button class="three-lens-timeline-btn" id="three-lens-timeline-zoom-out" title="Zoom Out">−</button>
            <span class="three-lens-timeline-zoom-label" id="three-lens-timeline-zoom-label">${s}f</span>
            <button class="three-lens-timeline-btn" id="three-lens-timeline-zoom-in" title="Zoom In">+</button>
            <button class="three-lens-timeline-btn" id="three-lens-timeline-reset" title="Reset View">↺</button>
          </div>
          <div class="three-lens-timeline-right-controls">
            <span class="three-lens-timeline-stat">
              <span class="three-lens-timeline-stat-label">Spikes:</span>
              <span class="three-lens-timeline-stat-value ${o.length>0?"warning":""}">${o.length}</span>
            </span>
            <select class="three-lens-timeline-buffer-select" id="three-lens-timeline-buffer-size" title="Buffer size">
              <option value="120" ${this.frameBufferSize===120?"selected":""}>2s</option>
              <option value="300" ${this.frameBufferSize===300?"selected":""}>5s</option>
              <option value="600" ${this.frameBufferSize===600?"selected":""}>10s</option>
            </select>
          </div>
        </div>
        
        <div class="three-lens-timeline-chart-container" id="three-lens-timeline-chart-container">
          <canvas id="three-lens-timeline-chart" class="three-lens-timeline-chart"></canvas>
          <div class="three-lens-timeline-tooltip" id="three-lens-timeline-tooltip"></div>
        </div>
        
        <div class="three-lens-timeline-legend">
          <div class="three-lens-timeline-legend-item">
            <span class="three-lens-timeline-legend-color cpu"></span>
            <span>CPU</span>
          </div>
          ${t?`
            <div class="three-lens-timeline-legend-item">
              <span class="three-lens-timeline-legend-color gpu"></span>
              <span>GPU</span>
            </div>
          `:""}
          <div class="three-lens-timeline-legend-item">
            <span class="three-lens-timeline-legend-color spike"></span>
            <span>Spike</span>
          </div>
        </div>
        
        ${this.timelineSelectedFrame!==null?this.renderTimelineFrameDetails(this.timelineSelectedFrame):""}
      </div>
    `}renderTimelineFrameDetails(e){const t=this.frameHistory[e]??0,s=this.gpuHistory[e],r=t>0?1e3/t:0,n=this.performanceHistory[e];return`
      <div class="three-lens-timeline-frame-details">
        <div class="three-lens-timeline-frame-details-header">
          <span>Frame #${e+1}</span>
          <button class="three-lens-timeline-close-btn" id="three-lens-timeline-close-details">×</button>
        </div>
        <div class="three-lens-timeline-frame-details-grid">
          <div class="three-lens-timeline-frame-detail">
            <span class="three-lens-timeline-frame-detail-label">CPU Time</span>
            <span class="three-lens-timeline-frame-detail-value ${t>16.67?"warning":""}">${t.toFixed(2)}ms</span>
          </div>
          ${s!==void 0?`
            <div class="three-lens-timeline-frame-detail">
              <span class="three-lens-timeline-frame-detail-label">GPU Time</span>
              <span class="three-lens-timeline-frame-detail-value ${s>16.67?"warning":""}">${s.toFixed(2)}ms</span>
            </div>
          `:""}
          <div class="three-lens-timeline-frame-detail">
            <span class="three-lens-timeline-frame-detail-label">FPS</span>
            <span class="three-lens-timeline-frame-detail-value ${r<30?"error":r<55?"warning":""}">${r.toFixed(1)}</span>
          </div>
          ${n?`
            <div class="three-lens-timeline-frame-detail">
              <span class="three-lens-timeline-frame-detail-label">Draw Calls</span>
              <span class="three-lens-timeline-frame-detail-value">${n.drawCalls}</span>
            </div>
            <div class="three-lens-timeline-frame-detail">
              <span class="three-lens-timeline-frame-detail-label">Triangles</span>
              <span class="three-lens-timeline-frame-detail-value">${Y(n.triangles)}</span>
            </div>
          `:""}
        </div>
      </div>
    `}getTimelineVisibleFrameCount(){return Math.max(10,Math.min(this.maxHistoryLength,Math.floor(this.maxHistoryLength/this.timelineZoom)))}detectSpikes(e){const t=[];for(let s=0;s<this.frameHistory.length;s++){const r=this.frameHistory[s],n=this.gpuHistory[s];r+(n??0)>e&&t.push(s)}return t}renderResourcesTab(){const e=this.probe.getResourceLifecycleSummary(),t=this.probe.getResourceEvents(),s=this.probe.getPotentialResourceLeaks(),r=this.probe.getOrphanedResources(),n=this.probe.getLeakAlerts(),i=this.probe.isResourceStackTraceCaptureEnabled(),o=this.probe.getEstimatedResourceMemory(),l=t.slice(-50).reverse();return`
      <div class="three-lens-resources-profiler">
        ${this.renderResourceSummary(e)}
        ${this.renderLeakDetectionControls(i)}
        ${this.renderMemoryUsage(o)}
        ${n.length>0?this.renderLeakAlerts(n):""}
        ${r.length>0?this.renderOrphanedResources(r):""}
        ${s.length>0?this.renderPotentialLeaks(s):""}
        ${this.renderResourceTimeline(l)}
        ${this.renderResourceEventList(l)}
      </div>
    `}renderResourceSummary(e){return`
      <div class="three-lens-resource-summary">
        <div class="three-lens-resource-summary-title">Resource Lifecycle Summary</div>
        <div class="three-lens-resource-summary-grid">
          <div class="three-lens-resource-summary-item">
            <div class="three-lens-resource-summary-icon geometry">📐</div>
            <div class="three-lens-resource-summary-details">
              <div class="three-lens-resource-summary-label">Geometries</div>
              <div class="three-lens-resource-summary-stats">
                <span class="created">${e.geometries.created} created</span>
                <span class="disposed">${e.geometries.disposed} disposed</span>
                <span class="active ${e.geometries.active>0?"highlight":""}">${e.geometries.active} active</span>
                ${e.geometries.leaked>0?`<span class="leaked">⚠ ${e.geometries.leaked} leaked?</span>`:""}
              </div>
            </div>
          </div>
          <div class="three-lens-resource-summary-item">
            <div class="three-lens-resource-summary-icon material">🎨</div>
            <div class="three-lens-resource-summary-details">
              <div class="three-lens-resource-summary-label">Materials</div>
              <div class="three-lens-resource-summary-stats">
                <span class="created">${e.materials.created} created</span>
                <span class="disposed">${e.materials.disposed} disposed</span>
                <span class="active ${e.materials.active>0?"highlight":""}">${e.materials.active} active</span>
                ${e.materials.leaked>0?`<span class="leaked">⚠ ${e.materials.leaked} leaked?</span>`:""}
              </div>
            </div>
          </div>
          <div class="three-lens-resource-summary-item">
            <div class="three-lens-resource-summary-icon texture">🖼</div>
            <div class="three-lens-resource-summary-details">
              <div class="three-lens-resource-summary-label">Textures</div>
              <div class="three-lens-resource-summary-stats">
                <span class="created">${e.textures.created} created</span>
                <span class="disposed">${e.textures.disposed} disposed</span>
                <span class="active ${e.textures.active>0?"highlight":""}">${e.textures.active} active</span>
                ${e.textures.leaked>0?`<span class="leaked">⚠ ${e.textures.leaked} leaked?</span>`:""}
              </div>
            </div>
          </div>
        </div>
        <div class="three-lens-resource-total-events">${e.totalEvents} total events tracked</div>
      </div>
    `}renderLeakDetectionControls(e){return`
      <div class="three-lens-resource-controls">
        <div class="three-lens-leak-controls-left">
          <button class="three-lens-action-btn" data-action="run-leak-detection" title="Run leak detection checks">
            🔍 Detect Leaks
          </button>
          <button class="three-lens-action-btn" data-action="generate-leak-report" title="Generate detailed leak report">
            📋 Report
          </button>
        </div>
        <div class="three-lens-leak-controls-right">
          <div class="three-lens-toggle-row compact" data-action="toggle-stack-traces">
            <span class="three-lens-toggle-label">Stacks</span>
            <button class="three-lens-toggle-btn ${e?"active":""}" title="Capture stack traces (performance impact)">
              <span class="three-lens-toggle-track">
                <span class="three-lens-toggle-thumb"></span>
              </span>
            </button>
          </div>
          <button class="three-lens-action-btn small" data-action="clear-resource-events" title="Clear">
            🗑
          </button>
        </div>
      </div>
    `}renderMemoryUsage(e){const t=this.probe.getResourceMemoryHistory(),s=t.length>1;let r="",n="";if(s){const i=t[0].estimatedBytes,l=t[t.length-1].estimatedBytes-i;l>1024*1024?(r=`↑ +${D(l)}`,n="growing"):l<-1024*1024?(r=`↓ ${D(Math.abs(l))}`,n="shrinking"):(r="→ stable",n="stable")}return`
      <div class="three-lens-memory-usage">
        <div class="three-lens-memory-usage-header">
          <span class="three-lens-memory-usage-label">Resource Memory</span>
          <span class="three-lens-memory-usage-value">${D(e)}</span>
          ${r?`<span class="three-lens-memory-trend ${n}">${r}</span>`:""}
        </div>
      </div>
    `}renderLeakAlerts(e){const t=e.filter(r=>r.severity==="critical"),s=e.filter(r=>r.severity==="warning");return`
      <div class="three-lens-leak-alerts">
        <div class="three-lens-leak-alerts-header">
          <span class="three-lens-leak-alerts-icon">🚨</span>
          <span>Leak Alerts (${e.length})</span>
          ${t.length>0?`<span class="three-lens-alert-badge critical">${t.length} critical</span>`:""}
          ${s.length>0?`<span class="three-lens-alert-badge warning">${s.length} warning</span>`:""}
          <button class="three-lens-action-btn small" data-action="clear-leak-alerts" title="Clear alerts">✕</button>
        </div>
        <div class="three-lens-leak-alerts-list">
          ${e.slice(0,5).map(r=>`
            <div class="three-lens-leak-alert-item ${r.severity}">
              <span class="three-lens-alert-severity ${r.severity}">${this.getSeverityIcon(r.severity)}</span>
              <div class="three-lens-alert-content">
                <div class="three-lens-alert-message">${r.message}</div>
                <div class="three-lens-alert-details">${r.details}</div>
                <div class="three-lens-alert-suggestion">💡 ${r.suggestion}</div>
              </div>
            </div>
          `).join("")}
          ${e.length>5?`<div class="three-lens-leak-more">+ ${e.length-5} more alerts...</div>`:""}
        </div>
      </div>
    `}renderOrphanedResources(e){return`
      <div class="three-lens-orphaned-resources">
        <div class="three-lens-orphaned-header">
          <span class="three-lens-orphaned-icon">👻</span>
          <span>Orphaned Resources (${e.length})</span>
        </div>
        <div class="three-lens-orphaned-hint">Not attached to any mesh - consider disposing</div>
        <div class="three-lens-orphaned-list">
          ${e.slice(0,5).map(t=>`
            <div class="three-lens-orphan-item">
              <span class="three-lens-orphan-type ${t.type}">${this.getResourceIcon(t.type)}</span>
              <span class="three-lens-orphan-name">${t.name||t.subtype||t.uuid.substring(0,8)}</span>
              <span class="three-lens-orphan-age">${this.formatAge(t.ageMs)}</span>
            </div>
          `).join("")}
          ${e.length>5?`<div class="three-lens-orphan-more">+ ${e.length-5} more...</div>`:""}
        </div>
      </div>
    `}getSeverityIcon(e){switch(e){case"critical":return"🔴";case"warning":return"🟡";case"info":return"🔵";default:return"⚪"}}renderPotentialLeaks(e){return`
      <div class="three-lens-potential-leaks">
        <div class="three-lens-potential-leaks-header">
          <span class="three-lens-potential-leaks-icon">⚠</span>
          <span>Potential Memory Leaks (${e.length})</span>
        </div>
        <div class="three-lens-potential-leaks-list">
          ${e.slice(0,5).map(t=>`
            <div class="three-lens-leak-item">
              <span class="three-lens-leak-type ${t.type}">${this.getResourceIcon(t.type)}</span>
              <span class="three-lens-leak-name">${t.name||t.subtype||t.uuid.substring(0,8)}</span>
              <span class="three-lens-leak-age">${this.formatAge(t.ageMs)}</span>
            </div>
          `).join("")}
          ${e.length>5?`<div class="three-lens-leak-more">+ ${e.length-5} more...</div>`:""}
        </div>
      </div>
    `}renderResourceTimeline(e){if(e.length===0)return'<div class="three-lens-resource-timeline-empty">No resource events recorded yet</div>';const t=performance.now(),s=6e4,r=30,n=s/r,i=[];for(let l=0;l<r;l++)i.push({geometry:0,material:0,texture:0,disposed:0});for(const l of e){const c=t-l.timestamp;if(c>s)continue;const d=Math.floor((s-c)/n);if(d>=0&&d<r){if(l.eventType==="disposed")i[d].disposed++;else if(l.eventType==="created"){const h=l.resourceType;h in i[d]&&i[d][h]++}}}const o=Math.max(1,...i.map(l=>l.geometry+l.material+l.texture+l.disposed));return`
      <div class="three-lens-resource-timeline">
        <div class="three-lens-resource-timeline-header">
          <span>Event Timeline (last 60s)</span>
          <div class="three-lens-resource-timeline-legend">
            <span class="geometry">📐 Geo</span>
            <span class="material">🎨 Mat</span>
            <span class="texture">🖼 Tex</span>
            <span class="disposed">✕ Disposed</span>
          </div>
        </div>
        <div class="three-lens-resource-timeline-chart">
          ${i.map((l,c)=>{const d=(l.geometry+l.material+l.texture+l.disposed)/o*100,h=l.geometry/o*100,p=l.material/o*100,u=l.texture/o*100,m=l.disposed/o*100;return`
              <div class="three-lens-resource-timeline-bar" title="${l.geometry+l.material+l.texture} created, ${l.disposed} disposed">
                <div class="three-lens-resource-bar-stack" style="height: ${d}%">
                  ${h>0?`<div class="three-lens-resource-bar-segment geometry" style="height: ${h/d*100}%"></div>`:""}
                  ${p>0?`<div class="three-lens-resource-bar-segment material" style="height: ${p/d*100}%"></div>`:""}
                  ${u>0?`<div class="three-lens-resource-bar-segment texture" style="height: ${u/d*100}%"></div>`:""}
                  ${m>0?`<div class="three-lens-resource-bar-segment disposed" style="height: ${m/d*100}%"></div>`:""}
                </div>
              </div>
            `}).join("")}
        </div>
        <div class="three-lens-resource-timeline-labels">
          <span>60s ago</span>
          <span>now</span>
        </div>
      </div>
    `}renderResourceEventList(e){return e.length===0?"":`
      <div class="three-lens-resource-event-list">
        <div class="three-lens-resource-event-list-header">Recent Events</div>
        <div class="three-lens-resource-event-list-items">
          ${e.slice(0,20).map(t=>`
            <div class="three-lens-resource-event-item ${t.eventType}">
              <span class="three-lens-resource-event-type ${t.resourceType}">${this.getResourceIcon(t.resourceType)}</span>
              <span class="three-lens-resource-event-action ${t.eventType}">${this.getEventTypeLabel(t.eventType)}</span>
              <span class="three-lens-resource-event-name">${t.resourceName||t.resourceSubtype||t.resourceUuid.substring(0,8)}</span>
              ${t.metadata?.textureSlot?`<span class="three-lens-resource-event-slot">[${t.metadata.textureSlot}]</span>`:""}
              <span class="three-lens-resource-event-time">${this.formatEventTime(t.timestamp)}</span>
            </div>
          `).join("")}
        </div>
        ${e.length>20?`<div class="three-lens-resource-event-more">${e.length-20} more events...</div>`:""}
      </div>
    `}getResourceIcon(e){switch(e){case"geometry":return"📐";case"material":return"🎨";case"texture":return"🖼";default:return"📦"}}getEventTypeLabel(e){switch(e){case"created":return"+";case"disposed":return"✕";case"attached":return"→";case"detached":return"←";default:return"?"}}formatAge(e){return e<1e3?`${Math.round(e)}ms`:e<6e4?`${(e/1e3).toFixed(1)}s`:e<36e5?`${(e/6e4).toFixed(1)}m`:`${(e/36e5).toFixed(1)}h`}formatEventTime(e){const t=performance.now()-e;return t<1e3?"now":t<6e4?`${Math.round(t/1e3)}s ago`:t<36e5?`${Math.round(t/6e4)}m ago`:`${Math.round(t/36e5)}h ago`}findNodeById(e,t){for(const s of e){if(s.ref.debugId===t)return s;const r=this.findNodeById(s.children,t);if(r)return r}return null}renderNodeInspector(e){const t=e.transform,s=r=>(r*180/Math.PI).toFixed(2);return`
      <div class="three-lens-section">
        <div class="three-lens-section-header">Transform</div>
        <div class="three-lens-property-row">
          <span class="three-lens-property-name">Position</span>
          <div class="three-lens-vector-inputs">
            <div class="three-lens-vector-input"><input type="number" value="${t.position.x.toFixed(2)}" step="0.1" readonly><div class="three-lens-vector-label">X</div></div>
            <div class="three-lens-vector-input"><input type="number" value="${t.position.y.toFixed(2)}" step="0.1" readonly><div class="three-lens-vector-label">Y</div></div>
            <div class="three-lens-vector-input"><input type="number" value="${t.position.z.toFixed(2)}" step="0.1" readonly><div class="three-lens-vector-label">Z</div></div>
          </div>
        </div>
        <div class="three-lens-property-row">
          <span class="three-lens-property-name">Rotation</span>
          <div class="three-lens-vector-inputs">
            <div class="three-lens-vector-input"><input type="number" value="${s(t.rotation.x)}" step="0.1" readonly><div class="three-lens-vector-label">X</div></div>
            <div class="three-lens-vector-input"><input type="number" value="${s(t.rotation.y)}" step="0.1" readonly><div class="three-lens-vector-label">Y</div></div>
            <div class="three-lens-vector-input"><input type="number" value="${s(t.rotation.z)}" step="0.1" readonly><div class="three-lens-vector-label">Z</div></div>
          </div>
        </div>
        <div class="three-lens-property-row">
          <span class="three-lens-property-name">Scale</span>
          <div class="three-lens-vector-inputs">
            <div class="three-lens-vector-input"><input type="number" value="${t.scale.x.toFixed(2)}" step="0.1" readonly><div class="three-lens-vector-label">X</div></div>
            <div class="three-lens-vector-input"><input type="number" value="${t.scale.y.toFixed(2)}" step="0.1" readonly><div class="three-lens-vector-label">Y</div></div>
            <div class="three-lens-vector-input"><input type="number" value="${t.scale.z.toFixed(2)}" step="0.1" readonly><div class="three-lens-vector-label">Z</div></div>
          </div>
        </div>
      </div>
      ${e.meshData?this.renderMeshInfo(e.meshData):""}
      ${e.lightData?this.renderLightInfo(e.lightData):""}
      ${e.cameraData?this.renderCameraInfo(e.cameraData):""}
      ${this.renderVisualOverlaysSection(e)}
      ${this.renderCameraControlsSection(e)}
      <div class="three-lens-section">
        <div class="three-lens-section-header">Rendering</div>
        ${this.renderProp("Layers",this.formatLayers(e.layers))}
        ${this.renderProp("Render Order",e.renderOrder)}
        ${this.renderProp("Frustum Culled",e.frustumCulled)}
        ${this.renderProp("Children",e.children.length)}
      </div>
    `}renderGlobalTools(){const e=this.probe.isGlobalWireframeEnabled(),t=this.probe.getCameraInfo(),s=this.probe.hasHomePosition(),r=this.probe.getAvailableCameras(),n=this.collectCostRanking();return`
      <div class="three-lens-global-tools">
        <div class="three-lens-global-tools-header">
          <span class="three-lens-global-icon">🌐</span>
          <span>Global Tools</span>
        </div>
        <div class="three-lens-section">
          <div class="three-lens-section-header">Visual Settings</div>
          <div class="three-lens-toggle-row global" data-action="toggle-global-wireframe">
            <span class="three-lens-toggle-label">Global Wireframe</span>
            <button class="three-lens-toggle-btn ${e?"active":""}" title="Toggle wireframe for all meshes">
              <span class="three-lens-toggle-track">
                <span class="three-lens-toggle-thumb"></span>
              </span>
            </button>
          </div>
        </div>
        <div class="three-lens-section">
          <div class="three-lens-section-header">Camera</div>
          ${t?`
            <div class="three-lens-camera-info">
              <div class="three-lens-property-row compact">
                <span class="three-lens-property-name">Type</span>
                <span class="three-lens-property-value">${t.type}</span>
              </div>
              <div class="three-lens-property-row compact">
                <span class="three-lens-property-name">Position</span>
                <span class="three-lens-property-value">(${t.position.x.toFixed(1)}, ${t.position.y.toFixed(1)}, ${t.position.z.toFixed(1)})</span>
              </div>
            </div>
          `:""}
          <div class="three-lens-camera-actions">
            <button class="three-lens-action-btn three-lens-home-btn" data-action="go-home" ${s?"":"disabled"} title="Return to home position">
              <span class="three-lens-btn-icon">🏠</span>
              <span>Home</span>
            </button>
            <button class="three-lens-action-btn" data-action="save-home" title="Save current camera position as home">
              <span class="three-lens-btn-icon">💾</span>
              <span>Save Home</span>
            </button>
          </div>
          ${r.length>1?`
            <div class="three-lens-camera-switcher">
              <div class="three-lens-camera-switcher-title">Switch Camera</div>
              <div class="three-lens-camera-list">
                ${r.map((i,o)=>`
                  <button class="three-lens-camera-item ${o===this.probe.getActiveCameraIndex()?"active":""}" 
                          data-camera-index="${o}" 
                          data-camera-uuid="${i.uuid}"
                          title="${i.type}">
                    <span class="three-lens-camera-item-icon">📷</span>
                    <span class="three-lens-camera-item-name">${i.name}</span>
                  </button>
                `).join("")}
              </div>
            </div>
          `:""}
        </div>
        ${this.renderCostRankingSection(n)}
      </div>
    `}collectCostRanking(){const e=this.probe.takeSnapshot(),t=[],s=r=>{r.meshData?.costData&&t.push({debugId:r.ref.debugId,name:r.ref.name||"unnamed",type:r.ref.type,cost:r.meshData.costData.totalCost,costLevel:r.meshData.costData.costLevel,triangles:r.meshData.faceCount});for(const n of r.children)s(n)};for(const r of e.scenes)s(r);return t.sort((r,n)=>n.cost-r.cost),t}renderCostRankingSection(e){if(e.length===0)return"";const t=e.reduce((o,l)=>o+l.cost,0),s=e.reduce((o,l)=>o+l.triangles,0),r=e.filter(o=>o.costLevel==="critical").length,n=e.filter(o=>o.costLevel==="high").length,i=e.slice(0,5);return`
      <div class="three-lens-section">
        <div class="three-lens-section-header">Cost Ranking</div>
        <div class="three-lens-cost-summary">
          <div class="three-lens-cost-summary-stat">
            <span class="three-lens-cost-summary-value">${t.toFixed(1)}</span>
            <span class="three-lens-cost-summary-label">Total Cost</span>
          </div>
          <div class="three-lens-cost-summary-stat">
            <span class="three-lens-cost-summary-value">${Y(s)}</span>
            <span class="three-lens-cost-summary-label">Triangles</span>
          </div>
          <div class="three-lens-cost-summary-stat">
            <span class="three-lens-cost-summary-value">${e.length}</span>
            <span class="three-lens-cost-summary-label">Meshes</span>
          </div>
        </div>
        ${r>0||n>0?`
          <div class="three-lens-cost-warning">
            ${r>0?`<span class="cost-critical">🔥 ${r} critical</span>`:""}
            ${n>0?`<span class="cost-high">⚠ ${n} high cost</span>`:""}
          </div>
        `:""}
        <div class="three-lens-cost-ranking-list">
          ${i.map((o,l)=>`
            <div class="three-lens-cost-ranking-item" data-id="${o.debugId}" data-action="select-object">
              <span class="three-lens-cost-rank">#${l+1}</span>
              <span class="three-lens-cost-ranking-name">${o.name}</span>
              <span class="three-lens-cost-ranking-triangles">${Y(o.triangles)}</span>
              <span class="three-lens-cost-ranking-score cost-${o.costLevel}">${o.cost.toFixed(1)}</span>
            </div>
          `).join("")}
        </div>
        ${e.length>5?`<div class="three-lens-cost-more">+ ${e.length-5} more objects</div>`:""}
      </div>
    `}renderMeshInfo(e){return`
      <div class="three-lens-section">
        <div class="three-lens-section-header">Mesh</div>
        ${this.renderProp("Vertices",Y(e.vertexCount))}
        ${this.renderProp("Triangles",Y(e.faceCount))}
        ${this.renderProp("Geometry",e.geometryRef?e.geometryRef.substring(0,8)+"...":"(none)")}
        ${this.renderProp("Material",this.formatMaterialRefs(e.materialRefs))}
        ${this.renderProp("Cast Shadow",e.castShadow)}
        ${this.renderProp("Receive Shadow",e.receiveShadow)}
      </div>
      ${e.costData?this.renderCostAnalysis(e.costData):""}
    `}renderCostAnalysis(e){const t=`cost-${e.costLevel}`,s=e.costLevel.charAt(0).toUpperCase()+e.costLevel.slice(1),r=e.triangleCost+e.materialComplexity+e.textureCost+e.shadowCost,n=r>0?(e.triangleCost/r*100).toFixed(0):"0",i=r>0?(e.materialComplexity/r*100).toFixed(0):"0",o=r>0?(e.textureCost/r*100).toFixed(0):"0",l=r>0?(e.shadowCost/r*100).toFixed(0):"0";return`
      <div class="three-lens-section">
        <div class="three-lens-section-header">Cost Analysis</div>
        <div class="three-lens-cost-header">
          <span class="three-lens-cost-level ${t}">${s}</span>
          <span class="three-lens-cost-score">${e.totalCost.toFixed(1)} pts</span>
        </div>
        <div class="three-lens-cost-breakdown">
          <div class="three-lens-cost-bar">
            <div class="three-lens-cost-bar-segment triangles" style="width: ${n}%" title="Triangles: ${n}%"></div>
            <div class="three-lens-cost-bar-segment material" style="width: ${i}%" title="Material: ${i}%"></div>
            <div class="three-lens-cost-bar-segment textures" style="width: ${o}%" title="Textures: ${o}%"></div>
            <div class="three-lens-cost-bar-segment shadows" style="width: ${l}%" title="Shadows: ${l}%"></div>
          </div>
          <div class="three-lens-cost-legend">
            <span class="three-lens-cost-legend-item triangles">▪ Tris ${n}%</span>
            <span class="three-lens-cost-legend-item material">▪ Mat ${i}%</span>
            <span class="three-lens-cost-legend-item textures">▪ Tex ${o}%</span>
            <span class="three-lens-cost-legend-item shadows">▪ Shd ${l}%</span>
          </div>
        </div>
        <div class="three-lens-cost-details">
          ${this.renderCostRow("Triangles",e.triangleCost.toFixed(2),Y(Math.round(e.triangleCost*1e3))+" tris")}
          ${this.renderCostRow("Material",e.materialComplexity.toFixed(1)+"/10",this.getMaterialComplexityLabel(e.materialComplexity))}
          ${this.renderCostRow("Textures",e.textureCost.toFixed(1),e.materials.reduce((c,d)=>c+d.textureCount,0)+" maps")}
          ${this.renderCostRow("Shadows",e.shadowCost.toFixed(1),this.getShadowLabel(e.shadowCost))}
        </div>
        ${this.renderMaterialDetails(e.materials)}
      </div>
    `}renderCostRow(e,t,s){return`
      <div class="three-lens-cost-row">
        <span class="three-lens-cost-row-label">${e}</span>
        <span class="three-lens-cost-row-value">${t}</span>
        <span class="three-lens-cost-row-detail">${s}</span>
      </div>
    `}getMaterialComplexityLabel(e){return e<=2?"Simple":e<=4?"Standard":e<=6?"Complex":e<=8?"Heavy":"Very Heavy"}getShadowLabel(e){return e===0?"None":e===1?"Receive only":e===2?"Cast only":"Cast + Receive"}renderMaterialDetails(e){return e.length===0?"":`
      <div class="three-lens-material-details">
        <div class="three-lens-material-details-header">Materials (${e.length})</div>
        ${e.map((t,s)=>`
          <div class="three-lens-material-item">
            <span class="three-lens-material-type">${t.type}</span>
            <span class="three-lens-material-score">${t.complexityScore.toFixed(1)}/10</span>
            <div class="three-lens-material-features">
              ${t.textureCount>0?`<span class="three-lens-mat-feature" title="Textures">🖼 ${t.textureCount}</span>`:""}
              ${t.hasNormalMap?'<span class="three-lens-mat-feature" title="Normal Map">N</span>':""}
              ${t.hasEnvMap?'<span class="three-lens-mat-feature" title="Environment Map">E</span>':""}
              ${t.transparent?'<span class="three-lens-mat-feature" title="Transparent">α</span>':""}
              ${t.doubleSided?'<span class="three-lens-mat-feature" title="Double Sided">⇄</span>':""}
            </div>
          </div>
        `).join("")}
      </div>
    `}renderLightInfo(e){return`
      <div class="three-lens-section">
        <div class="three-lens-section-header">Light</div>
        ${this.renderProp("Light Type",e.lightType)}
        ${this.renderProp("Color","#"+e.color.toString(16).padStart(6,"0").toUpperCase())}
        ${this.renderProp("Intensity",e.intensity.toFixed(2))}
        ${this.renderProp("Cast Shadow",e.castShadow)}
        ${e.distance!==void 0?this.renderProp("Distance",e.distance):""}
        ${e.angle!==void 0?this.renderProp("Angle",(e.angle*180/Math.PI).toFixed(1)+"°"):""}
      </div>
    `}renderCameraInfo(e){return`
      <div class="three-lens-section">
        <div class="three-lens-section-header">Camera</div>
        ${this.renderProp("Camera Type",e.cameraType)}
        ${this.renderProp("Near",e.near)}
        ${this.renderProp("Far",e.far)}
        ${e.fov!==void 0?this.renderProp("FOV",e.fov+"°"):""}
        ${e.aspect!==void 0?this.renderProp("Aspect",e.aspect.toFixed(2)):""}
      </div>
    `}renderVisualOverlaysSection(e){if(!(e.ref.type==="Mesh"||e.ref.type==="SkinnedMesh"||e.ref.type==="InstancedMesh"))return this.renderTransformGizmoSection();const s=this.probe.getSelectedObject(),r=s?this.probe.isWireframeEnabled(s):!1,n=s?this.probe.isBoundingBoxEnabled(s):!1;return`
      <div class="three-lens-section">
        <div class="three-lens-section-header">Visual Overlays</div>
        <div class="three-lens-toggle-row" data-action="toggle-wireframe">
          <span class="three-lens-toggle-label">Wireframe</span>
          <button class="three-lens-toggle-btn ${r?"active":""}" title="Toggle wireframe for this object">
            <span class="three-lens-toggle-track">
              <span class="three-lens-toggle-thumb"></span>
            </span>
          </button>
        </div>
        <div class="three-lens-toggle-row" data-action="toggle-boundingbox">
          <span class="three-lens-toggle-label">Bounding Box</span>
          <button class="three-lens-toggle-btn ${n?"active":""}" title="Toggle bounding box for this object">
            <span class="three-lens-toggle-track">
              <span class="three-lens-toggle-thumb"></span>
            </span>
          </button>
        </div>
      </div>
      ${this.renderTransformGizmoSection()}
    `}renderCameraControlsSection(e){const t=this.probe.isCameraAnimating();return`
      <div class="three-lens-section">
        <div class="three-lens-section-header">Camera</div>
        
        <div class="three-lens-camera-actions">
          <button class="three-lens-action-btn" data-action="focus-selected" title="Focus camera on selected object (F)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
            </svg>
            Focus
          </button>
          <button class="three-lens-action-btn" data-action="fly-to-selected" title="Fly camera to selected object">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13"/>
              <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
            Fly To
          </button>
          <button class="three-lens-action-btn home" data-action="go-home" ${this.probe.hasHomePosition()?"":"disabled"} title="Return to home view (H)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Home
          </button>
        </div>
        
        ${t?`
          <button class="three-lens-action-btn stop" data-action="stop-animation" title="Stop camera animation">
            Stop Animation
          </button>
        `:""}
      </div>
    `}renderTransformGizmoSection(){const e=this.probe.isTransformGizmoEnabled(),t=this.probe.getTransformMode(),s=this.probe.getTransformSpace(),r=this.probe.isTransformSnapEnabled(),n=this.probe.canUndoTransform(),i=this.probe.canRedoTransform();return`
      <div class="three-lens-section">
        <div class="three-lens-section-header">Transform Gizmo</div>
        
        <div class="three-lens-toggle-row" data-action="toggle-transform-gizmo">
          <span class="three-lens-toggle-label">Enable Gizmo</span>
          <button class="three-lens-toggle-btn ${e?"active":""}" title="Enable transform gizmo">
            <span class="three-lens-toggle-track">
              <span class="three-lens-toggle-thumb"></span>
            </span>
          </button>
        </div>

        <div class="three-lens-transform-modes ${e?"":"disabled"}">
          <div class="three-lens-mode-label">Mode</div>
          <div class="three-lens-mode-buttons">
            <button class="three-lens-mode-btn ${t==="translate"?"active":""}" data-mode="translate" title="Translate (W)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>
              </svg>
            </button>
            <button class="three-lens-mode-btn ${t==="rotate"?"active":""}" data-mode="rotate" title="Rotate (E)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
                <path d="M21 3v5h-5"/>
              </svg>
            </button>
            <button class="three-lens-mode-btn ${t==="scale"?"active":""}" data-mode="scale" title="Scale (R)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 21l-6-6m6 6v-4.8m0 4.8h-4.8"/>
                <path d="M3 16.2V21h4.8"/>
                <path d="M21 7.8V3h-4.8"/>
                <path d="M3 7.8V3h4.8"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="three-lens-transform-options ${e?"":"disabled"}">
          <div class="three-lens-option-row" data-action="toggle-space">
            <span class="three-lens-option-label">Space</span>
            <button class="three-lens-space-btn" title="Toggle between world and local space">
              ${s==="world"?"World":"Local"}
            </button>
          </div>
          
          <div class="three-lens-toggle-row" data-action="toggle-snap">
            <span class="three-lens-toggle-label">Snap to Grid</span>
            <button class="three-lens-toggle-btn ${r?"active":""}" title="Enable grid snapping">
              <span class="three-lens-toggle-track">
                <span class="three-lens-toggle-thumb"></span>
              </span>
            </button>
          </div>
        </div>

        <div class="three-lens-undo-redo ${e?"":"disabled"}">
          <button class="three-lens-undo-btn ${n?"":"disabled"}" data-action="undo-transform" title="Undo (Ctrl+Z)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 7v6h6"/>
              <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/>
            </svg>
            Undo
          </button>
          <button class="three-lens-redo-btn ${i?"":"disabled"}" data-action="redo-transform" title="Redo (Ctrl+Shift+Z)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 7v6h-6"/>
              <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/>
            </svg>
            Redo
          </button>
        </div>
      </div>
    `}formatLayers(e){if(e===0)return"None";if(e===1)return"0 (default)";const t=[];for(let s=0;s<32;s++)e&1<<s&&t.push(s);return t.length===1?t[0]===0?"0 (default)":String(t[0]):t.join(", ")}formatMaterialRefs(e){return e.length===0?"(none)":e.length===1?e[0]?e[0].substring(0,8)+"...":"(none)":`${e[0]?e[0].substring(0,8):"???"}... +${e.length-1}`}renderProp(e,t){return`<div class="three-lens-property-row"><span class="three-lens-property-name">${e}</span><span class="three-lens-property-value">${String(t)}</span></div>`}renderVectorProp(e,t,s=!1){const r=s?180/Math.PI:1;return`
      <div class="three-lens-property-row">
        <span class="three-lens-property-name">${e}</span>
        <div class="three-lens-vector-inputs">
          <div class="three-lens-vector-input"><input type="number" value="${(t.x*r).toFixed(2)}" step="0.1"><div class="three-lens-vector-label">X</div></div>
          <div class="three-lens-vector-input"><input type="number" value="${(t.y*r).toFixed(2)}" step="0.1"><div class="three-lens-vector-label">Y</div></div>
          <div class="three-lens-vector-input"><input type="number" value="${(t.z*r).toFixed(2)}" step="0.1"><div class="three-lens-vector-label">Z</div></div>
        </div>
      </div>
    `}updateStatsPanel(){const e=document.getElementById("three-lens-content-stats");if(!e)return;const t=document.getElementById("three-lens-stats-tabs"),s=document.getElementById("three-lens-stats-tab-content");t&&s?this.statsTab==="timeline"?!this.timelinePaused&&!this.timelineDragging&&this.renderTimelineChart():(s.innerHTML=this.renderCurrentTabContent(),this.statsTab==="overview"&&(this.attachChartEvents(),this.renderChart())):(e.innerHTML=this.renderStatsContent(),document.getElementById("three-lens-stats-tabs")&&this.attachStatsTabEvents(e),this.statsTab==="overview"?(this.attachChartEvents(),this.renderChart()):this.statsTab==="timeline"?(this.attachTimelineEvents(),this.renderTimelineChart()):this.statsTab==="resources"&&this.attachResourceEvents())}renderCurrentTabContent(){const e=this.latestStats;if(!e)return'<div class="three-lens-inspector-empty">Waiting for frame data...</div>';const t=this.latestBenchmark,s=e.performance?.fps??(e.cpuTimeMs>0?Math.round(1e3/e.cpuTimeMs):0),r=e.performance?.fpsSmoothed??s,n=e.performance?.fps1PercentLow??0;switch(this.statsTab){case"overview":return this.renderOverviewTab(e,t,s,r,n);case"memory":return this.renderMemoryTab(e);case"rendering":return this.renderRenderingTab(e);case"timeline":return this.renderTimelineTab(e);case"resources":return this.renderResourcesTab();default:return""}}attachStatsTabEvents(e){e.querySelectorAll(".three-lens-tab").forEach(t=>{t.addEventListener("click",s=>{const r=s.currentTarget.dataset.tab;if(r&&r!==this.statsTab){this.statsTab=r,e.querySelectorAll(".three-lens-tab").forEach(i=>{i.classList.toggle("active",i.dataset.tab===r)});const n=document.getElementById("three-lens-stats-tab-content");n&&(n.innerHTML=this.renderCurrentTabContent(),this.statsTab==="overview"?(this.attachChartEvents(),this.renderChart()):this.statsTab==="timeline"?(this.attachTimelineEvents(),this.renderTimelineChart()):this.statsTab==="resources"&&this.attachResourceEvents())}})})}attachResourceEvents(){const e=document.querySelector('[data-action="toggle-stack-traces"]'),t=e?.querySelector(".three-lens-toggle-btn");e?.addEventListener("click",()=>{const s=this.probe.isResourceStackTraceCaptureEnabled();this.probe.setResourceStackTraceCapture(!s),t?.classList.toggle("active",!s)}),document.querySelector('[data-action="clear-resource-events"]')?.addEventListener("click",()=>{this.probe.clearResourceEvents(),this.updateResourcesView()}),document.querySelector('[data-action="run-leak-detection"]')?.addEventListener("click",()=>{this.probe.runLeakDetection(),this.updateResourcesView()}),document.querySelector('[data-action="generate-leak-report"]')?.addEventListener("click",()=>{const s=this.probe.generateLeakReport();this.showLeakReport(s)}),document.querySelector('[data-action="clear-leak-alerts"]')?.addEventListener("click",()=>{this.probe.clearLeakAlerts(),this.updateResourcesView()})}showLeakReport(e){const t=r=>r<1024?`${r}B`:r<1048576?`${(r/1024).toFixed(1)}KB`:`${(r/1048576).toFixed(1)}MB`,s=`
═══════════════════════════════════════════════════════════════
                    3LENS LEAK DETECTION REPORT
═══════════════════════════════════════════════════════════════

Session Duration: ${(e.sessionDurationMs/1e3/60).toFixed(1)} minutes
Generated At: ${new Date().toISOString()}

SUMMARY
───────────────────────────────────────────────────────────────
Total Alerts: ${e.summary.totalAlerts}
  • Critical: ${e.summary.criticalAlerts}
  • Warning: ${e.summary.warningAlerts}
  • Info: ${e.summary.infoAlerts}

Estimated Leaked Memory: ${t(e.summary.estimatedLeakedMemoryBytes)}

RESOURCE STATISTICS
───────────────────────────────────────────────────────────────
Geometries: ${e.resourceStats.geometries.created} created, ${e.resourceStats.geometries.disposed} disposed, ${e.resourceStats.geometries.orphaned} orphaned, ${e.resourceStats.geometries.leaked} leaked
Materials:  ${e.resourceStats.materials.created} created, ${e.resourceStats.materials.disposed} disposed, ${e.resourceStats.materials.orphaned} orphaned, ${e.resourceStats.materials.leaked} leaked
Textures:   ${e.resourceStats.textures.created} created, ${e.resourceStats.textures.disposed} disposed, ${e.resourceStats.textures.orphaned} orphaned, ${e.resourceStats.textures.leaked} leaked

${e.alerts.length>0?`
ALERTS
───────────────────────────────────────────────────────────────
${e.alerts.map(r=>`[${r.severity.toUpperCase()}] ${r.message}
   ${r.details}
   💡 ${r.suggestion}
`).join(`
`)}
`:""}

${e.recommendations.length>0?`
RECOMMENDATIONS
───────────────────────────────────────────────────────────────
${e.recommendations.map((r,n)=>`${n+1}. ${r}`).join(`
`)}
`:""}

═══════════════════════════════════════════════════════════════
`;console.log("%c3Lens Leak Report","font-size: 16px; font-weight: bold; color: #60a5fa;"),console.log(s),alert(`Leak Report Generated!

Check the browser console for the full report.

Summary:
• ${e.summary.totalAlerts} alerts
• ${t(e.summary.estimatedLeakedMemoryBytes)} estimated leaked memory
• ${e.recommendations.length} recommendations`)}updateResourcesView(){const e=document.getElementById("three-lens-stats-tab-content");e&&this.statsTab==="resources"&&(e.innerHTML=this.renderCurrentTabContent(),this.attachResourceEvents())}updateScenePanel(){const e=document.getElementById("three-lens-content-scene");if(e){const s=e.querySelector(".three-lens-inspector-pane")?.scrollTop??0;e.innerHTML=this.renderSceneContent();const r=document.getElementById("three-lens-panel-scene");if(r&&this.attachTreeEvents(r),requestAnimationFrame(()=>{this.initVirtualScroller(),this.attachVirtualTreeEvents()}),s>0){const n=e.querySelector(".three-lens-inspector-pane");n&&(n.scrollTop=s)}}}updateInspectorPanel(){const e=document.getElementById("three-lens-panel-scene"),t=document.getElementById("three-lens-content-scene");if(!e||!t)return;const s=e.offsetWidth;e.style.minWidth=`${s}px`,this.updateScenePanel(),requestAnimationFrame(()=>{this.updateScenePanelSize()})}updateScenePanelSize(){const e=document.getElementById("three-lens-panel-scene"),t=this.openPanels.get("scene");!e||!t||(e.style.minWidth=`${ht}px`,t.width!==ht&&(t.width=ht,e.style.width=`${ht}px`))}attachTreeEvents(e){e.querySelectorAll(".three-lens-visibility-btn").forEach(t=>{t.addEventListener("click",s=>{s.stopPropagation();const r=t.dataset.id;r&&this.toggleObjectVisibility(r)})}),e.querySelectorAll(".three-lens-toggle-row").forEach(t=>{const s=t.dataset.action,r=t.querySelector(".three-lens-toggle-btn");!r||!s||r.addEventListener("click",n=>{n.stopPropagation();const i=r.classList.contains("active");switch(s){case"toggle-wireframe":this.probe.toggleSelectedWireframe(!i),r.classList.toggle("active",!i);break;case"toggle-boundingbox":this.probe.toggleSelectedBoundingBox(!i),r.classList.toggle("active",!i);break;case"toggle-global-wireframe":this.probe.toggleGlobalWireframe(!i),r.classList.toggle("active",!i);break;case"toggle-transform-gizmo":i?(this.probe.disableTransformGizmo(),r.classList.toggle("active",!1),this.updateScenePanel()):this.probe.enableTransformGizmo().then(()=>{r.classList.toggle("active",!0),this.updateScenePanel()});break;case"toggle-snap":this.probe.setTransformSnapEnabled(!i),r.classList.toggle("active",!i);break}})}),e.querySelectorAll(".three-lens-mode-btn").forEach(t=>{t.addEventListener("click",s=>{s.stopPropagation();const r=t.dataset.mode;r&&this.probe.isTransformGizmoEnabled()&&(this.probe.setTransformMode(r),e.querySelectorAll(".three-lens-mode-btn").forEach(n=>{n.classList.toggle("active",n.dataset.mode===r)}))})}),e.querySelectorAll('.three-lens-option-row[data-action="toggle-space"]').forEach(t=>{const s=t.querySelector(".three-lens-space-btn");s&&s.addEventListener("click",r=>{if(r.stopPropagation(),this.probe.isTransformGizmoEnabled()){const n=this.probe.toggleTransformSpace();s.textContent=n==="world"?"World":"Local"}})}),e.querySelectorAll(".three-lens-undo-btn").forEach(t=>{t.addEventListener("click",s=>{s.stopPropagation(),this.probe.canUndoTransform()&&(this.probe.undoTransform(),this.updateScenePanel())})}),e.querySelectorAll(".three-lens-redo-btn").forEach(t=>{t.addEventListener("click",s=>{s.stopPropagation(),this.probe.canRedoTransform()&&(this.probe.redoTransform(),this.updateScenePanel())})}),e.querySelectorAll(".three-lens-action-btn").forEach(t=>{const s=t.dataset.action;s&&t.addEventListener("click",r=>{switch(r.stopPropagation(),s){case"focus-selected":this.probe.focusOnSelected();break;case"fly-to-selected":this.probe.flyToSelected({duration:800,easing:"easeInOut",onComplete:()=>this.updateScenePanel()}),this.updateScenePanel();break;case"stop-animation":this.probe.stopCameraAnimation(),this.updateScenePanel();break;case"go-home":this.probe.flyHome({duration:600,easing:"easeOut",onComplete:()=>this.updateScenePanel()});break;case"save-home":this.probe.saveCurrentCameraAsHome();break}})}),e.querySelectorAll(".three-lens-camera-item").forEach(t=>{t.addEventListener("click",s=>{s.stopPropagation();const r=parseInt(t.dataset.cameraIndex||"0",10);this.probe.switchToCamera(r)&&this.updateScenePanel()})}),e.querySelectorAll(".three-lens-cost-ranking-item").forEach(t=>{t.addEventListener("click",s=>{s.stopPropagation();const r=t.dataset.id;r&&this.probe.selectByDebugId(r)})}),e.querySelectorAll(".three-lens-node-header").forEach(t=>{t.addEventListener("click",s=>{if(s.target.closest(".three-lens-visibility-btn"))return;const n=t.parentElement?.dataset.id;if(!n)return;const i=s.target.closest(".three-lens-node-toggle");if(i&&!i.classList.contains("hidden")){this.expandedNodes.has(n)?this.expandedNodes.delete(n):this.expandedNodes.add(n),this.updateScenePanel();return}this.selectedNodeId===n?this.probe.selectObject(null):this.probe.selectByDebugId(n)})})}toggleObjectVisibility(e){const t=this.selectedNodeId;if(this.probe.selectByDebugId(e)){const s=this.probe.getSelectedObject();s&&(s.visible=!s.visible)}t?this.probe.selectByDebugId(t):this.probe.selectObject(null),this.selectedNodeId=t,this.updateScenePanel(),this.updateInspectorPanel()}attachVirtualTreeEvents(){const e=document.getElementById("three-lens-virtual-tree");e&&e.addEventListener("click",t=>{const s=t.target,r=s.closest(".three-lens-visibility-btn");if(r){const l=r.dataset.id;l&&this.toggleObjectVisibility(l);return}const n=s.closest(".three-lens-virtual-row");if(!n)return;const i=n.dataset.id;if(!i)return;const o=s.closest(".three-lens-node-toggle");if(o&&!o.classList.contains("hidden")){this.expandedNodes.has(i)?this.expandedNodes.delete(i):this.expandedNodes.add(i),this.virtualScroller&&(this.virtualScroller.rebuildFlattenedList(),this.virtualScroller.forceRender()),this.updateInspectorPane();return}this.selectedNodeId===i?this.probe.selectObject(null):this.probe.selectByDebugId(i)})}updateInspectorPane(){const e=document.getElementById("three-lens-content-scene");if(!e)return;const t=e.querySelector(".three-lens-inspector-pane");if(!t)return;const s=this.probe.takeSnapshot(),r=this.selectedNodeId?this.findNodeById(s.scenes,this.selectedNodeId):null;t.innerHTML=r?this.renderNodeInspector(r):this.renderGlobalTools();const n=document.getElementById("three-lens-panel-scene");n&&this.attachTreeEvents(n)}getVisibleFrameCount(){return Math.max(10,Math.floor(60/this.chartZoom))}getVisibleFrameData(){const e=this.getVisibleFrameCount(),t=this.frameHistory.length-this.chartOffset,s=Math.max(0,t-e);return this.frameHistory.slice(s,t)}getFrameTimeMin(){const e=this.getVisibleFrameData();return e.length>0?Math.min(...e):0}getFrameTimeMax(){const e=this.getVisibleFrameData();return e.length>0?Math.max(...e):0}getFrameTimeAvg(){const e=this.getVisibleFrameData();return e.length===0?0:e.reduce((t,s)=>t+s,0)/e.length}getFrameTimeJitter(){const e=this.getVisibleFrameData();if(e.length<2)return 0;const t=this.getFrameTimeAvg(),s=e.reduce((r,n)=>r+Math.pow(n-t,2),0)/e.length;return Math.sqrt(s)}handleChartZoomIn(){this.chartZoom<4&&(this.chartZoom*=1.5,this.updateChartView())}handleChartZoomOut(){this.chartZoom>.5&&(this.chartZoom/=1.5,this.chartOffset=Math.max(0,Math.min(this.chartOffset,this.frameHistory.length-this.getVisibleFrameCount())),this.updateChartView())}handleChartReset(){this.chartZoom=1,this.chartOffset=0,this.updateChartView()}updateChartView(){this.renderChart();const e=document.getElementById("three-lens-chart-zoom-label");e&&(e.textContent=`${this.getVisibleFrameCount()}f`);const t=document.getElementById("three-lens-chart-min"),s=document.getElementById("three-lens-chart-avg"),r=document.getElementById("three-lens-chart-max"),n=document.getElementById("three-lens-chart-jitter");t&&(t.textContent=`${this.getFrameTimeMin().toFixed(1)}ms`),s&&(s.textContent=`${this.getFrameTimeAvg().toFixed(1)}ms`),r&&(r.textContent=`${this.getFrameTimeMax().toFixed(1)}ms`),n&&(n.textContent=`${this.getFrameTimeJitter().toFixed(1)}ms`)}attachChartEvents(){const e=document.getElementById("three-lens-chart-container"),t=document.getElementById("three-lens-stats-chart"),s=document.getElementById("three-lens-chart-tooltip");!e||!t||(document.getElementById("three-lens-chart-zoom-in")?.addEventListener("click",()=>this.handleChartZoomIn()),document.getElementById("three-lens-chart-zoom-out")?.addEventListener("click",()=>this.handleChartZoomOut()),document.getElementById("three-lens-chart-reset")?.addEventListener("click",()=>this.handleChartReset()),document.querySelector('[data-action="clear-violations"]')?.addEventListener("click",()=>{this.probe.clearViolations();const r=document.getElementById("three-lens-stats-tab-content");r&&(r.innerHTML=this.renderCurrentTabContent(),this.attachChartEvents(),this.renderChart())}),e.addEventListener("wheel",r=>{r.preventDefault(),r.deltaY<0?this.handleChartZoomIn():this.handleChartZoomOut()}),e.addEventListener("mousedown",r=>{this.chartDragging=!0,this.chartDragStartX=r.clientX,this.chartDragStartOffset=this.chartOffset,e.style.cursor="grabbing"}),document.addEventListener("mousemove",r=>{if(this.chartDragging){const n=r.clientX-this.chartDragStartX,i=this.getVisibleFrameCount(),o=i/t.getBoundingClientRect().width,l=Math.round(n*o),c=Math.max(0,this.frameHistory.length-i);this.chartOffset=Math.max(0,Math.min(c,this.chartDragStartOffset-l)),this.updateChartView()}}),document.addEventListener("mouseup",()=>{this.chartDragging&&(this.chartDragging=!1,e&&(e.style.cursor="grab"))}),t.addEventListener("mousemove",r=>{if(this.chartDragging||!s)return;const n=t.getBoundingClientRect(),i=r.clientX-n.left,o=this.getVisibleFrameData(),l=n.width/o.length,c=Math.floor(i/l);if(c>=0&&c<o.length){this.chartHoverIndex=c;const d=o[c],h=d>0?Math.round(1e3/d):0;s.style.display="block",s.style.left=`${Math.min(i,n.width-80)}px`,s.style.top="-40px";const p=s.querySelector(".three-lens-tooltip-time"),u=s.querySelector(".three-lens-tooltip-fps");p&&(p.textContent=`${d.toFixed(2)}ms`),u&&(u.textContent=`${h} FPS`),this.renderChart()}}),t.addEventListener("mouseleave",()=>{s&&(s.style.display="none"),this.chartHoverIndex=null,this.renderChart()}))}renderChart(){const e=document.getElementById("three-lens-stats-chart"),t=this.getVisibleFrameData();if(!e||t.length<2)return;const s=e.getContext("2d");if(!s)return;const r=e.getBoundingClientRect();e.width=r.width*window.devicePixelRatio,e.height=r.height*window.devicePixelRatio,s.scale(window.devicePixelRatio,window.devicePixelRatio);const{width:n,height:i}=r,o={top:4,bottom:4,left:0,right:0},l=n-o.left-o.right,c=i-o.top-o.bottom;s.clearRect(0,0,n,i);const d=Math.max(...t,16.67),h=Math.ceil(d/8.33)*8.33,p=l/t.length,u=Math.max(1,p*.15);s.strokeStyle="rgba(45, 55, 72, 0.5)",s.lineWidth=1,s.setLineDash([]),[16.67,33.33].forEach(v=>{if(v<=h){const C=o.top+c-v/h*c;s.beginPath(),s.moveTo(o.left,C),s.lineTo(n-o.right,C),s.stroke()}}),s.strokeStyle="rgba(52, 211, 153, 0.6)",s.setLineDash([4,4]),s.lineWidth=1.5;const g=o.top+c-16.67/h*c;s.beginPath(),s.moveTo(o.left,g),s.lineTo(n-o.right,g),s.stroke(),s.setLineDash([]);const f=this.getFrameTimeAvg();if(f>0){s.strokeStyle="rgba(251, 191, 36, 0.5)",s.setLineDash([2,4]),s.lineWidth=1;const v=o.top+c-f/h*c;s.beginPath(),s.moveTo(o.left,v),s.lineTo(n-o.right,v),s.stroke(),s.setLineDash([])}const y=s.createLinearGradient(0,i,0,0);y.addColorStop(0,"rgba(52, 211, 153, 0.9)"),y.addColorStop(1,"rgba(34, 211, 238, 0.9)");const b=s.createLinearGradient(0,i,0,0);b.addColorStop(0,"rgba(251, 191, 36, 0.9)"),b.addColorStop(1,"rgba(245, 158, 11, 0.9)");const w=s.createLinearGradient(0,i,0,0);w.addColorStop(0,"rgba(239, 68, 68, 0.9)"),w.addColorStop(1,"rgba(248, 113, 113, 0.9)"),t.forEach((v,C)=>{const k=o.left+C*p+u/2,M=v/h*c,S=o.top+c-M,z=p-u;v<=16.67?s.fillStyle=y:v<=33.33?s.fillStyle=b:s.fillStyle=w,this.chartHoverIndex===C&&(s.fillStyle="rgba(96, 165, 250, 1)",s.shadowColor="rgba(96, 165, 250, 0.5)",s.shadowBlur=8);const E=Math.min(3,z/2);s.beginPath(),s.moveTo(k+E,S),s.lineTo(k+z-E,S),s.quadraticCurveTo(k+z,S,k+z,S+E),s.lineTo(k+z,S+M),s.lineTo(k,S+M),s.lineTo(k,S+E),s.quadraticCurveTo(k,S,k+E,S),s.closePath(),s.fill(),s.shadowBlur=0}),s.strokeStyle="rgba(96, 165, 250, 0.8)",s.lineWidth=2,s.lineJoin="round",s.lineCap="round",s.beginPath(),t.forEach((v,C)=>{const k=o.left+C*p+p/2,M=o.top+c-v/h*c;C===0?s.moveTo(k,M):s.lineTo(k,M)}),s.stroke(),t.forEach((v,C)=>{const k=o.left+C*p+p/2,M=o.top+c-v/h*c;this.chartHoverIndex===C&&(s.beginPath(),s.arc(k,M,4,0,Math.PI*2),s.fillStyle="#60a5fa",s.fill(),s.strokeStyle="#fff",s.lineWidth=2,s.stroke())})}attachTimelineEvents(){const e=document.getElementById("three-lens-timeline-chart-container"),t=document.getElementById("three-lens-timeline-chart"),s=document.getElementById("three-lens-timeline-tooltip");if(!e||!t)return;document.getElementById("three-lens-timeline-record")?.addEventListener("click",()=>{this.isRecording=!this.isRecording,this.isRecording&&(this.recordedFrames=[]),this.updateTimelineView()}),document.getElementById("three-lens-timeline-clear")?.addEventListener("click",()=>{this.recordedFrames=[],this.updateTimelineView()});const r=document.getElementById("three-lens-timeline-buffer-size");r?.addEventListener("change",()=>{for(this.frameBufferSize=parseInt(r.value,10),this.maxHistoryLength=this.frameBufferSize;this.frameHistory.length>this.frameBufferSize;)this.frameHistory.shift();for(;this.gpuHistory.length>this.frameBufferSize;)this.gpuHistory.shift();for(;this.fpsHistory.length>this.frameBufferSize;)this.fpsHistory.shift();for(;this.drawCallHistory.length>this.frameBufferSize;)this.drawCallHistory.shift();for(;this.triangleHistory.length>this.frameBufferSize;)this.triangleHistory.shift();this.updateTimelineView()}),document.getElementById("three-lens-timeline-zoom-in")?.addEventListener("click",()=>{this.timelineZoom=Math.min(10,this.timelineZoom*1.5),this.updateTimelineView()}),document.getElementById("three-lens-timeline-zoom-out")?.addEventListener("click",()=>{this.timelineZoom=Math.max(.1,this.timelineZoom/1.5),this.updateTimelineView()}),document.getElementById("three-lens-timeline-reset")?.addEventListener("click",()=>{this.timelineZoom=1,this.timelineOffset=0,this.timelineSelectedFrame=null,this.updateTimelineView()}),document.getElementById("three-lens-timeline-close-details")?.addEventListener("click",()=>{this.timelineSelectedFrame=null,this.updateTimelineView()}),e.addEventListener("wheel",n=>{n.preventDefault(),n.deltaY<0?this.timelineZoom=Math.min(10,this.timelineZoom*1.2):this.timelineZoom=Math.max(.1,this.timelineZoom/1.2),this.updateTimelineView()}),e.addEventListener("mousedown",n=>{this.timelineDragging=!0,this.timelineDragStartX=n.clientX,this.timelineDragStartOffset=this.timelineOffset,e.style.cursor="grabbing"}),document.addEventListener("mousemove",n=>{if(this.timelineDragging){const i=n.clientX-this.timelineDragStartX,o=this.getTimelineVisibleFrameCount(),l=t.getBoundingClientRect(),c=o/l.width,d=Math.round(i*c),h=Math.max(0,this.frameHistory.length-o);this.timelineOffset=Math.max(0,Math.min(h,this.timelineDragStartOffset-d)),this.updateTimelineView()}}),document.addEventListener("mouseup",()=>{this.timelineDragging&&(this.timelineDragging=!1,e&&(e.style.cursor="default"))}),t.addEventListener("click",n=>{const i=t.getBoundingClientRect(),o=n.clientX-i.left,l=this.getTimelineVisibleFrameCount(),c=i.width/l,d=Math.floor(o/c)+this.timelineOffset;d>=0&&d<this.frameHistory.length&&(this.timelineSelectedFrame=d,this.updateTimelineView())}),t.addEventListener("mouseenter",()=>{this.timelinePaused=!0}),t.addEventListener("mousemove",n=>{const i=t.getBoundingClientRect(),o=n.clientX-i.left,l=this.getTimelineVisibleFrameCount(),c=i.width/l,d=Math.floor(o/c)+this.timelineOffset;if(this.timelineHoverIndex=d,d>=0&&d<this.frameHistory.length&&s){const h=this.frameHistory[d],p=this.gpuHistory[d],u=h>0?1e3/h:0;s.style.display="block",s.style.left=`${n.clientX-i.left+10}px`,s.style.top=`${n.clientY-i.top-10}px`,s.innerHTML=`
          <div>Frame #${d+1}</div>
          <div>CPU: ${h.toFixed(2)}ms</div>
          ${p!==void 0?`<div>GPU: ${p.toFixed(2)}ms</div>`:""}
          <div>FPS: ${u.toFixed(1)}</div>
        `}}),t.addEventListener("mouseleave",()=>{s&&(s.style.display="none"),this.timelineHoverIndex=null,this.timelinePaused=!1})}updateTimelineView(){const e=document.getElementById("three-lens-stats-tab-content");e&&this.statsTab==="timeline"&&(e.innerHTML=this.renderCurrentTabContent(),this.attachTimelineEvents(),this.renderTimelineChart())}renderTimelineChart(){const e=document.getElementById("three-lens-timeline-chart");if(!e)return;const t=this.getTimelineVisibleFrameCount(),s=Math.max(0,this.frameHistory.length-t-this.timelineOffset),r=Math.min(this.frameHistory.length,s+t),n=this.frameHistory.slice(s,r),i=this.gpuHistory.slice(s,r),o=this.detectSpikes(33.33).filter(M=>M>=s&&M<r).map(M=>M-s);if(n.length===0)return;const l=e.getContext("2d");if(!l)return;const c=e.getBoundingClientRect();e.width=c.width*window.devicePixelRatio,e.height=c.height*window.devicePixelRatio,l.scale(window.devicePixelRatio,window.devicePixelRatio);const{width:d,height:h}=c,p={top:20,bottom:20,left:40,right:10},u=d-p.left-p.right,m=h-p.top-p.bottom;l.clearRect(0,0,d,h);const g=Math.max(...n,16.67),f=i.length>0?Math.max(...i,16.67):0,y=Math.ceil(Math.max(g,f,33.33)/8.33)*8.33,b=u/n.length;l.strokeStyle="rgba(45, 55, 72, 0.3)",l.lineWidth=1,l.setLineDash([]),[16.67,33.33,50,66.67].forEach(M=>{if(M<=y){const S=p.top+m-M/y*m;l.beginPath(),l.moveTo(p.left,S),l.lineTo(d-p.right,S),l.stroke(),l.fillStyle="rgba(156, 163, 175, 0.8)",l.font="10px monospace",l.textAlign="right",l.fillText(`${M.toFixed(0)}ms`,p.left-5,S+3)}}),l.strokeStyle="rgba(52, 211, 153, 0.5)",l.setLineDash([4,4]),l.lineWidth=1;const v=p.top+m-16.67/y*m;l.beginPath(),l.moveTo(p.left,v),l.lineTo(d-p.right,v),l.stroke(),l.strokeStyle="rgba(245, 158, 11, 0.5)";const C=p.top+m-33.33/y*m;l.beginPath(),l.moveTo(p.left,C),l.lineTo(d-p.right,C),l.stroke(),l.setLineDash([]),n.forEach((M,S)=>{const z=p.left+S*b,E=M/y*m,T=p.top+m-E,I=o.includes(S),A=this.timelineSelectedFrame===s+S,O=this.timelineHoverIndex===s+S;l.fillStyle=I?"rgba(239, 68, 68, 0.8)":"rgba(96, 165, 250, 0.6)",O&&(l.fillStyle="rgba(147, 197, 253, 1)"),A&&(l.fillStyle="rgba(96, 165, 250, 1)",l.strokeStyle="#fff",l.lineWidth=2,l.strokeRect(z,T,b-1,E)),l.fillRect(z,T,b-1,E)}),i.length>0&&i.forEach((M,S)=>{if(M>0){const z=p.left+S*b,E=M/y*m,T=p.top+m-E;l.fillStyle="rgba(34, 197, 94, 0.6)",l.fillRect(z,T,b-1,E)}}),l.fillStyle="rgba(156, 163, 175, 0.8)",l.font="9px monospace",l.textAlign="center";const k=Math.max(1,Math.floor(n.length/10));for(let M=0;M<n.length;M+=k){const S=p.left+M*b+b/2;l.fillText(`${s+M+1}`,S,h-p.bottom+12)}}destroy(){this.virtualScroller&&(this.virtualScroller.dispose(),this.virtualScroller=null),this.root.remove(),document.getElementById("three-lens-styles")?.remove()}showPanel(e){this.openPanels.has(e)||this.openPanel(e)}hidePanel(e){this.closePanel(e)}toggle(){this.menuVisible=!this.menuVisible,this.updateMenu()}}function _a(a,e={}){return new Pa({probe:a,...e})}let tt=null,ie,fe,oe,Rt=!1,nt=[],N=null;const et=document.getElementById("status-badge"),Aa=document.getElementById("fps"),Ba=document.getElementById("draw-calls"),Ia=document.getElementById("triangles"),yr=document.getElementById("pipelines-used"),Fa=document.getElementById("memory"),vr=document.getElementById("gpu-time"),Ra=document.getElementById("gpu-bar"),xr=document.getElementById("pass-breakdown"),Ft=document.getElementById("pipeline-list"),La=document.getElementById("device-label"),Oa=document.getElementById("max-texture-2d"),Da=document.getElementById("max-bind-groups"),Ha=document.getElementById("timestamp-query"),Na=document.getElementById("max-compute-wg"),wr=document.getElementById("features-list"),ja=document.getElementById("limits-table"),us=document.getElementById("fallback-message");async function Ga(){if(!navigator.gpu)return!1;try{return await navigator.gpu.requestAdapter()!==null}catch{return!1}}async function Ua(){if(!await Ga())return et.textContent="WebGPU Not Supported",et.classList.add("error"),us.classList.add("visible"),!1;try{const{WebGPURenderer:e}=await Mr(async()=>{const{WebGPURenderer:s}=await import("./three.webgpu-g6KuaYO8.js");return{WebGPURenderer:s}},[]);oe=new e({antialias:!0}),await oe.init();const t=document.getElementById("canvas-container");return oe.setSize(t.clientWidth,t.clientHeight),oe.setPixelRatio(Math.min(window.devicePixelRatio,2)),t.appendChild(oe.domElement),et.textContent="WebGPU Active",et.classList.add("supported"),!0}catch(e){return console.error("Failed to initialize WebGPU:",e),et.textContent="WebGPU Init Failed",et.classList.add("error"),us.classList.add("visible"),us.querySelector("p").textContent="Failed to initialize WebGPU renderer. Error: "+e.message,!1}}function Va(){ie=new Pn,ie.background=new Fe(1710638),fe=new Ar(60,document.getElementById("canvas-container").clientWidth/document.getElementById("canvas-container").clientHeight,.1,1e3),fe.position.set(0,10,25),fe.lookAt(0,0,0);const a=new In(4210752,.5);ie.add(a);const e=new Bn(16777215,1);e.position.set(10,20,10),e.castShadow=!0,e.shadow.mapSize.width=2048,e.shadow.mapSize.height=2048,ie.add(e);const t=new pr(54527,1,50);t.position.set(-10,5,10),ie.add(t);const s=new pr(15287648,1,50);s.position.set(10,5,-10),ie.add(s);const r=new vs(50,50),n=new Br({color:1450302,roughness:.8,metalness:.2}),i=new Pr(r,n);i.rotation.x=-Math.PI/2,i.receiveShadow=!0,i.name="Ground",ie.add(i),$s(20)}function $s(a){const e=[new ys(1,1,1),new ks(.5,32,32),new Cs(.4,.15,16,48),new ws(.5,1,32),new Ss(.5),new Ts(.3,.1,64,8)],t=[54527,15287648,1096065,16096779,9133302,15680580];for(let s=0;s<a;s++){const r=e[s%e.length],n=new Br({color:t[s%t.length],roughness:.3+Math.random()*.4,metalness:.5+Math.random()*.5}),i=new Pr(r,n);i.name=`Object_${nt.length+1}`;const o=5+Math.random()*10,l=Math.random()*Math.PI*2,c=Math.random()*Math.PI;i.position.x=o*Math.sin(c)*Math.cos(l),i.position.y=1+Math.random()*5,i.position.z=o*Math.sin(c)*Math.sin(l),i.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI),i.castShadow=!0,i.receiveShadow=!0,ie.add(i),nt.push(i)}}function Wa(){tt=new bi({debug:!0}),tt.observeRenderer(oe),tt.observeScene(ie),Lr(oe)&&(N=Gn(oe),qa()),_a(tt,{defaultWidth:400}).showPanel("stats");const e=tt.rendererAdapter;e&&e.observeFrame(t=>{Ya(t)})}function qa(){if(!N)return;La.textContent=N.deviceLabel||"Unknown Device",Oa.textContent=N.maxTextureDimension2D.toLocaleString(),Da.textContent=N.maxBindGroups.toString(),Ha.textContent=N.hasTimestampQuery?"✓ Yes":"✗ No",Na.textContent=N.maxComputeWorkgroupsPerDimension.toLocaleString(),wr.innerHTML=N.features.slice(0,15).map(t=>`<span class="capability-tag">${t}</span>`).join(""),N.features.length>15&&(wr.innerHTML+=`<span class="capability-tag">+${N.features.length-15} more</span>`);const a=[["Max Texture 2D",N.maxTextureDimension2D],["Max Texture Array Layers",N.maxTextureArrayLayers],["Max Bind Groups",N.maxBindGroups],["Max Bindings/Group",N.maxBindingsPerBindGroup],["Max Uniform Buffers",N.maxUniformBuffersPerShaderStage],["Max Storage Buffers",N.maxStorageBuffersPerShaderStage],["Max Samplers",N.maxSamplersPerShaderStage],["Max Sampled Textures",N.maxSampledTexturesPerShaderStage],["Max Vertex Buffers",N.maxVertexBuffers],["Max Vertex Attributes",N.maxVertexAttributes],["Max Compute WG Size X",N.maxComputeWorkgroupSizeX],["Max Compute WG Size Y",N.maxComputeWorkgroupSizeY],["Max Compute WG Size Z",N.maxComputeWorkgroupSizeZ],["Max Compute Invocations",N.maxComputeInvocationsPerWorkgroup]],e=ja.querySelector("tbody");e.innerHTML=a.map(([t,s])=>`
      <tr>
        <td>${t}</td>
        <td>${typeof s=="number"?s.toLocaleString():s}</td>
      </tr>
    `).join("")}function Ya(a){if(Aa.textContent=Math.round(a.summary.fps).toString(),Ba.textContent=a.summary.drawCalls.toString(),Ia.textContent=Ka(a.summary.triangles),Fa.textContent=Qa(a.memory.totalGpuMemory),a.webgpuExtras){if(yr.textContent=a.webgpuExtras.pipelinesUsed.toString(),a.webgpuExtras.gpuTiming){const e=a.webgpuExtras.gpuTiming.totalMs;vr.textContent=`${e.toFixed(2)} ms`;const t=Math.min(100,e/16.67*100);Ra.style.width=`${t}%`,a.webgpuExtras.gpuTiming.passes&&a.webgpuExtras.gpuTiming.passes.length>0&&Xa(a.webgpuExtras.gpuTiming.passes,e)}}else yr.textContent="--",vr.textContent="N/A";Ja()}function Xa(a,e){if(!a||a.length===0){xr.innerHTML='<p style="color: #888; font-size: 0.75rem;">No pass data available</p>';return}xr.innerHTML=a.map(t=>{const s=t.durationMs/e*100,r=t.type||Za(t.name);return`
      <div class="pass-item">
        <span class="pass-name">${t.name}</span>
        <div class="pass-bar">
          <div class="pass-fill ${r}" style="width: ${s}%"></div>
        </div>
        <span class="pass-time">${t.durationMs.toFixed(2)}</span>
      </div>
    `}).join("")}function Za(a){const e=a.toLowerCase();return e.includes("shadow")?"shadow":e.includes("post")||e.includes("bloom")||e.includes("blur")?"post":e.includes("compute")?"compute":"render"}function Ja(){const a=tt?.rendererAdapter;if(!a||typeof a.getPipelines!="function"){Ft.innerHTML='<div class="pipeline-item"><span class="pipeline-name">No pipeline data</span></div>';return}const e=a.getPipelines()||[];if(e.length===0){Ft.innerHTML='<div class="pipeline-item"><span class="pipeline-name">No pipelines tracked</span></div>';return}Ft.innerHTML=e.slice(0,10).map(t=>`
    <div class="pipeline-item">
      <span class="pipeline-name">${t.label||t.id}</span>
      <span class="pipeline-type ${t.type}">${t.type}</span>
    </div>
  `).join(""),e.length>10&&(Ft.innerHTML+=`
      <div class="pipeline-item">
        <span class="pipeline-name" style="color: #888">+${e.length-10} more pipelines</span>
      </div>
    `)}function Ka(a){return a>=1e6?(a/1e6).toFixed(1)+"M":a>=1e3?(a/1e3).toFixed(1)+"K":a.toString()}function Qa(a){return a>=1024*1024*1024?(a/(1024*1024*1024)).toFixed(1)+" GB":a>=1024*1024?(a/(1024*1024)).toFixed(1)+" MB":a>=1024?(a/1024).toFixed(1)+" KB":a+" B"}function Vr(){if(requestAnimationFrame(Vr),!Rt){const a=performance.now()*.001;nt.forEach((e,t)=>{e.rotation.x+=.005*(1+t%3*.2),e.rotation.y+=.007*(1+t%2*.3),e.position.y+=Math.sin(a*2+t)*.003}),fe.position.x=Math.sin(a*.1)*25,fe.position.z=Math.cos(a*.1)*25,fe.lookAt(0,0,0)}oe.renderAsync?oe.renderAsync(ie,fe):oe.render(ie,fe)}async function eo(){const a=document.getElementById("btn-stress-test");a.disabled=!0,a.textContent="Running...";const e=nt.length;for(let t=0;t<5;t++)$s(50),await new Promise(s=>setTimeout(s,100));for(await new Promise(t=>setTimeout(t,2e3));nt.length>e;){const t=nt.pop();ie.remove(t),t.geometry.dispose(),t.material.dispose()}a.disabled=!1,a.textContent="Run Stress Test"}function to(){document.getElementById("btn-add-objects").addEventListener("click",()=>{$s(10)});const a=document.getElementById("btn-toggle-animation");a.addEventListener("click",()=>{Rt=!Rt,a.textContent=Rt?"Resume Animation":"Pause Animation"}),document.getElementById("btn-stress-test").addEventListener("click",eo),window.addEventListener("resize",()=>{const e=document.getElementById("canvas-container");fe.aspect=e.clientWidth/e.clientHeight,fe.updateProjectionMatrix(),oe.setSize(e.clientWidth,e.clientHeight)})}async function so(){await Ua()&&(Va(),Wa(),to(),Vr(),console.log("🔮 WebGPU Features Example initialized"),console.log("   Press F12 to open 3Lens DevTools overlay"),N&&console.log("📊 WebGPU Capabilities:",N))}so();
