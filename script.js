const CONFIG={
  firstQuestion:"Sana çıkma teklifi ettiğim tarih? (Sırayla boşluksuz şekilde sayıları yaz. Örn; 15012015)",
  acceptedAnswers:["19052026"],
  noteOne:"Beni affetmen için sana ufak bir sürpriz hazırladım sevgilim. Umarım başarılı olurum. Seni çok seviyorum...",
  noteTwo:"Özür dilerim ömrüm, sana sonsuz aşığım ve bana sonsuz güvenmelisin. Benim gözlerim senden başkasına bakmaz, kalbim senden başkasını istemez. Eğer affettiysen son sürprize hazır ol :) <3",
  photos:Array.from({length:9},(_,i)=>`images/photo${i+1}.jpg`),
  proposalAnswers:["evet","evet!","evet aşkım","evet sevgilim"]
};
const $=s=>document.querySelector(s),screens=[...document.querySelectorAll(".screen")];
const music=$("#bgMusic"),sound=$("#soundToggle");let musicStarted=false,photoIndex=0,typingTimer;
function normalize(v){return v.trim().toLocaleLowerCase("tr-TR").replace(/[.!?,;:❤️]/g,"").replace(/\s+/g," ")}
function showScreen(id){
  clearInterval(typingTimer);
  screens.forEach(s=>s.classList.toggle("active",s.id===id));
  window.scrollTo({top:0,behavior:"smooth"});
  if(id==="noteOneScreen")typeText($("#noteOneText"),CONFIG.noteOne);
  if(id==="noteTwoScreen")typeText($("#noteTwoText"),CONFIG.noteTwo);
}
async function startMusic(){
  if(musicStarted)return;
  music.volume=.38;
  try{
    await music.play();
    musicStarted=true;
    sound.classList.remove("muted");
    $(".sound-icon").textContent="♫";
  }catch(e){
    // MP3 henüz eklenmediyse veya tarayıcı engellerse site çalışmaya devam eder.
    sound.classList.add("muted");
    $(".sound-icon").textContent="×";
  }
}
function openGift(){
  startMusic();$("#boxButton").classList.add("opening");
  setTimeout(()=>{$("#boxButton").classList.remove("opening");showScreen("questionScreen")},850)
}
$("#startButton").onclick=openGift;$("#boxButton").onclick=openGift;
sound.onclick=async()=>{
  if(!musicStarted){
    await startMusic();
    return;
  }
  music.muted=!music.muted;
  sound.classList.toggle("muted",music.muted);
  $(".sound-icon").textContent=music.muted?"×":"♫";
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
let photoTransitioning=false;

// Fotoğrafları galeri açılmadan tarayıcı önbelleğine al.
CONFIG.photos.forEach(src=>{
  const img=new Image();
  img.src=src;
});

function nextPhoto(){
  // Animasyon sürerken gelen ikinci dokunuşu yok say.
  if(photoTransitioning)return;

  if(photoIndex>=CONFIG.photos.length-1){
    photoTransitioning=true;
    showScreen("noteTwoScreen");
    setTimeout(()=>{photoTransitioning=false},500);
    return;
  }

  photoTransitioning=true;
  const nextIndex=photoIndex+1;
  const nextSrc=CONFIG.photos[nextIndex];
  const preload=new Image();

  const applyNextPhoto=()=>{
    photoCard.classList.remove("next");
    void photoCard.offsetWidth;
    photoCard.classList.add("next");

    // Kart görünmez olduğu anda yeni fotoğrafı yerleştir.
    setTimeout(()=>{
      photoIndex=nextIndex;
      galleryImage.src=nextSrc;
      $("#photoCounter").textContent=`${photoIndex+1} / ${CONFIG.photos.length}`;
    },220);

    // Animasyon tamamlandıktan sonra tekrar dokunmaya izin ver.
    setTimeout(()=>{
      photoCard.classList.remove("next");
      photoTransitioning=false;
    },620);
  };

  if(preload.complete){
    applyNextPhoto();
  }else{
    preload.onload=applyNextPhoto;
    preload.onerror=applyNextPhoto;
    preload.src=nextSrc;
  }
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
$("#restartButton").onclick=()=>{photoIndex=0;galleryImage.src=CONFIG.photos[0];$("#photoCounter").textContent="1 / 9";$("#firstAnswer").value="";$("#proposalAnswer").value="";$("#answerFeedback").textContent="";$("#proposalFeedback").textContent="";showScreen("welcomeScreen")};
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
