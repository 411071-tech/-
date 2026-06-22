const STORAGE_KEY = 'vocab_trainer_words'
let words = []
let idx = 0

function loadWords(){
  try{ words = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }catch(e){ words = [] }
  if(!words.length){
    words = [
      {word:'abate',translation:'減弱',pos:'verb',example:'The storm finally abated.',root:'ab- (away) + -ate'},
      {word:'benevolent',translation:'仁慈的',pos:'adj',example:'A benevolent donor gave funds.',root:'bene- (good)'}
    ]
    localStorage.setItem(STORAGE_KEY,JSON.stringify(words))
  }
}

function renderCard(){
  const front = document.getElementById('card-front')
  const back = document.getElementById('card-back')
  if(!words.length){ front.textContent='No words. Go to 管理單字'; back.innerHTML='' ; return }
  const w = words[idx]
  front.textContent = w.word
  back.innerHTML = `<div class="word-key">${w.word}</div>
    <div class="meta">${w.pos || ''} ${w.translation? '• '+w.translation : ''}</div>
    <div class="section"><strong>例句:</strong><div>${w.example || ''}</div></div>
    <div class="section"><strong>字根分析:</strong><div>${w.root || ''}</div></div>`
}

function nextCard(){ idx = (idx+1) % words.length; document.getElementById('card').classList.remove('flipped'); renderCard() }
function prevCard(){ idx = (idx-1+words.length) % words.length; document.getElementById('card').classList.remove('flipped'); renderCard() }
function shuffle(){ for(let i=words.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[words[i],words[j]]=[words[j],words[i]]} idx=0; localStorage.setItem(STORAGE_KEY,JSON.stringify(words)); renderCard() }

document.addEventListener('DOMContentLoaded',()=>{
  loadWords(); renderCard();
  const card = document.getElementById('card')
  card.addEventListener('click',()=>card.classList.toggle('flipped'))
  document.getElementById('next').addEventListener('click',nextCard)
  document.getElementById('prev').addEventListener('click',prevCard)
  document.getElementById('shuffle').addEventListener('click',shuffle)
})
