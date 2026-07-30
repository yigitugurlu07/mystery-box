const CONFIG={
  firstQuestion:"Sana çıkma teklifi ettiğim tarih? (Sırayla boşluksuz şekilde sayıları yaz. Örn; 15012015)",
  acceptedAnswers:["19052026"],
  noteOne:"Beni affetmen için sana ufak bir sürpriz hazırladım sevgilim. Umarım başarılı olurum. Seni çok seviyorum...",
  noteTwo:"Özür dilerim ömrüm, sana sonsuz aşığım ve bana sonsuz güvenmelisin. Benim gözlerim senden başkasına bakmaz, kalbim senden başkasını istemez. Eğer affettiysen son sürprize hazır ol :) <3",
  photos:Array.from({length:9},(_,i)=>`images/photo${i+1}.jpg`),
  proposalAnswers:["evet","evet!","evet aşkım","evet sevgilim"]
};
const $=s=>document.querySelector(s),screens=[...document.querySelectorAll(".screen")];
const music=$("#bgMusic"),sound=$("#soundToggle");
let musicStarted=false,firstPlaybackChecked=false,photoIndex=0,typingTimer;

function normalize(v){
  return v.trim().toLocaleLowerCase("tr-TR")
    .replace(/[.!?,;:❤️]/g,"")
    .replace(/\s+/g," ");
}

function showScreen(id){
  clearInterval(typingTimer);
  for(let i=0;i<screens.length;i++){
    const screen=screens[i];
    if(screen.id===id)screen.classList.add("active");
    else screen.classList.remove("active");
  }
  try{window.scrollTo(0,0)}catch(e){}
  if(id==="noteOneScreen") typeText($("#noteOneText"),CONFIG.noteOne);
  if(id==="noteTwoScreen") typeText($("#noteTwoText"),CONFIG.noteTwo);
}

music.preload="auto";
music.volume=.38;
music.load();

function setSoundUI(active){
  sound.classList.toggle("muted",!active);
  $(".sound-icon").textContent=active?"♫":"×";
}

// Mobil Safari bazen ilk play isteğini bekletip parçayı ileriden başlatabiliyor.
// İlk gerçek oynatma anında konumu tekrar sıfırlıyoruz.
music.addEventListener("playing",()=>{
  if(!firstPlaybackChecked){
    firstPlaybackChecked=true;
    if(music.currentTime>.35){
      try{music.currentTime=0}catch(e){}
    }
  }
  musicStarted=true;
  setSoundUI(true);
});

async function startMusic(){
  if(!music.paused && musicStarted)return;
  music.muted=false;
  music.volume=.38;
  firstPlaybackChecked=false;
  try{
    music.pause();
    if(Number.isFinite(music.duration) || music.readyState>0) music.currentTime=0;
    await music.play();
    // play() çözülse bile bazı mobil tarayıcılar birkaç kare sonra ileriden başlatabiliyor.
    requestAnimationFrame(()=>{
      if(!firstPlaybackChecked && music.currentTime>.35){
        try{music.currentTime=0}catch(e){}
      }
    });
  }catch(e){
    setSoundUI(false);
  }
}

let giftOpening=false;
let lastGiftTouch=0;

function openGift(event){
  if(event){
    event.preventDefault();
    event.stopPropagation();
  }
  if(giftOpening)return;
  giftOpening=true;

  // Ses başarısız olsa veya Safari play isteğini bekletse bile ekran geçişi etkilenmez.
  try{ startMusic(); }catch(e){}

  const box=$("#boxButton");
  if(box)box.classList.add("opening");

  window.setTimeout(()=>{
    if(box)box.classList.remove("opening");
    showScreen("questionScreen");
    giftOpening=false;
  },700);
}

// iPhone Safari için touchend yedeği; ardından oluşan click çift çalıştırılmaz.
function bindGiftButton(el){
  if(!el)return;
  el.setAttribute("type","button");

  el.addEventListener("touchend",e=>{
    lastGiftTouch=Date.now();
    openGift(e);
  },{passive:false});

  el.addEventListener("click",e=>{
    if(Date.now()-lastGiftTouch<900){
      e.preventDefault();
      return;
    }
    openGift(e);
  });
}

bindGiftButton($("#startButton"));
bindGiftButton($("#boxButton"));

// Inline/yedek çağrılar için global erişim.
window.openGift=openGift;

sound.onclick=async()=>{
  if(music.paused || !musicStarted){
    await startMusic();
    return;
  }
  music.muted=!music.muted;
  setSoundUI(!music.muted);
};
$("#firstQuestion").textContent=CONFIG.firstQuestion;
function checkFirst(){
  const ok=CONFIG.acceptedAnswers.map(normalize).includes(normalize($("#firstAnswer").value));
  if(ok){$("#answerFeedback").textContent="Kilit açıldı...";setTimeout(()=>showScreen("noteOneScreen"),600)}
  else{$("#answerFeedback").textContent="Bu tarih kutunun kalbine uymadı, bir daha dene ♡";const c=$(".question-card");c.classList.remove("shake");void c.offsetWidth;c.classList.add("shake")}
}
$("#answerButton").onclick=checkFirst;$("#firstAnswer").onkeydown=e=>{if(e.key==="Enter")checkFirst()};
function typeText(el,text){el.textContent="";let i=0;typingTimer=setInterval(()=>{el.textContent+=text[i++]||"";if(i>=text.length)clearInterval(typingTimer)},18)}
function goGallery(){showScreen("galleryScreen")}
$("#letterOne").onclick=goGallery;$("#letterOne").onkeydown=e=>{if(e.key==="Enter"||e.key===" ")goGallery()};
const photoCard=$("#photoCard"),galleryImage=$("#galleryImage");
let galleryBusy=false,pendingPhotoSteps=0,galleryFinished=false;

// Tüm fotoğrafları önceden yükle ve mümkünse decode et.
const photoPreloads=CONFIG.photos.map(src=>{
  const img=new Image();
  img.src=src;
  return img.decode?img.decode().catch(()=>{}):Promise.resolve();
});

function wait(ms){return new Promise(resolve=>setTimeout(resolve,ms))}

async function processPhotoQueue(){
  if(galleryBusy || galleryFinished)return;
  galleryBusy=true;

  while(pendingPhotoSteps>0 && !galleryFinished){
    pendingPhotoSteps--;

    if(photoIndex>=CONFIG.photos.length-1){
      galleryFinished=true;
      showScreen("noteTwoScreen");
      break;
    }

    const nextIndex=photoIndex+1;
    await photoPreloads[nextIndex];

    photoCard.classList.remove("next");
    void photoCard.offsetWidth;
    photoCard.classList.add("next");

    await wait(150);
    photoIndex=nextIndex;
    galleryImage.src=CONFIG.photos[photoIndex];
    $("#photoCounter").textContent=`${photoIndex+1} / ${CONFIG.photos.length}`;

    await wait(300);
    photoCard.classList.remove("next");
    await wait(40);
  }

  galleryBusy=false;
  if(pendingPhotoSteps>0 && !galleryFinished)processPhotoQueue();
}

function nextPhoto(){
  // Her dokunuş kaydedilir; animasyon sırasında yapılan dokunuşlar artık kaybolmaz.
  pendingPhotoSteps++;
  processPhotoQueue();
}

$("#photoDeck").onclick=nextPhoto;
$("#photoDeck").onkeydown=e=>{
  if(e.key==="Enter"||e.key===" "){
    e.preventDefault();
    nextPhoto();
  }
};
function goClue(){showScreen("clueScreen")}$("#letterTwo").onclick=goClue;$("#letterTwo").onkeydown=e=>{if(e.key==="Enter"||e.key===" ")goClue()};
function goProposal(){showScreen("proposalScreen")}$("#ringBoxButton").onclick=goProposal;$("#openRingQuestion").onclick=goProposal;
function checkProposal(){
  const v=normalize($("#proposalAnswer").value),ok=v==="evet"||CONFIG.proposalAnswers.map(normalize).includes(v);
  if(ok){$("#proposalFeedback").textContent="Kalbimin kilidi açıldı...";setTimeout(()=>{showScreen("finalScreen");celebrate()},650)}
  else $("#proposalFeedback").textContent="Bu küçük kutu yalnızca tek bir kelimeyi bekliyor 💍";
}
$("#proposalButton").onclick=checkProposal;$("#proposalAnswer").onkeydown=e=>{if(e.key==="Enter")checkProposal()};
$("#restartButton").onclick=()=>{photoIndex=0;pendingPhotoSteps=0;galleryBusy=false;galleryFinished=false;galleryImage.src=CONFIG.photos[0];$("#photoCounter").textContent="1 / 9";$("#firstAnswer").value="";$("#proposalAnswer").value="";$("#answerFeedback").textContent="";$("#proposalFeedback").textContent="";showScreen("welcomeScreen")};
function celebrate(){
  const hearts=$("#floatingHearts"),confetti=$("#confetti");hearts.innerHTML="";confetti.innerHTML="";
  for(let i=0;i<36;i++){const h=document.createElement("span");h.className="float-heart";h.textContent=Math.random()>.45?"♥":"♡";h.style.left=`${Math.random()*100}vw`;h.style.fontSize=`${14+Math.random()*24}px`;h.style.animationDuration=`${4+Math.random()*5}s`;h.style.animationDelay=`${Math.random()*3}s`;hearts.appendChild(h)}
  const colors=["#f2abc6","#e8c98b","#fff8ee","#9a7fbd"];
  for(let i=0;i<90;i++){const p=document.createElement("span");p.className="confetti-piece";p.style.left=`${Math.random()*100}vw`;p.style.background=colors[i%colors.length];p.style.animationDuration=`${3+Math.random()*3}s`;p.style.animationDelay=`${Math.random()*1.5}s`;confetti.appendChild(p)}
}
function shootingStar(){const s=document.createElement("span");s.className="shooting-star";s.style.left=`${Math.random()*30-10}vw`;s.style.top=`${Math.random()*30-10}vh`;document.body.appendChild(s);setTimeout(()=>s.remove(),1400)}
setInterval(shootingStar,5200);setTimeout(shootingStar,900);
const canvas=$("#stars"),ctx=canvas.getContext("2d");let stars=[];
function resize(){const d=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*d;canvas.height=innerHeight*d;canvas.style.width=innerWidth+"px";canvas.style.height=innerHeight+"px";ctx.setTransform(d,0,0,d,0,0);stars=Array.from({length:Math.max(70,Math.floor(innerWidth/8))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.4+.25,a:Math.random(),v:Math.random()*.018+.005}))}
function draw(){ctx.clearRect(0,0,innerWidth,innerHeight);for(const s of stars){s.a+=s.v;if(s.a>1||s.a<.18)s.v*=-1;ctx.globalAlpha=s.a;ctx.fillStyle="#fff4d6";ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill()}requestAnimationFrame(draw)}
addEventListener("resize",resize);resize();draw();
