const STORAGE_KEY = 'vocab_trainer_words'
// 若要將單字送到 Google Apps Script，請在此填入你的 Web App URL（doPost 接收端點）
// 例如: const GAS_ENDPOINT = 'https://script.google.com/macros/s/AAAAAAAA/exec'
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwTyFBVsqDWRF7kF_FCJ4dMB0nEz91-vi4iAFrXU7b1-wZno8Ky4rzdas4kY1vVnESFyg/exec'

let editingIndex = -1

function getWords(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }catch(e){ return [] } }
function saveWords(list){ localStorage.setItem(STORAGE_KEY,JSON.stringify(list)); renderList() }

function renderList(){
  const list = getWords()
  const el = document.getElementById('list'); el.innerHTML=''
  if(!list.length){ el.textContent='目前沒有單字' ; return }
  list.forEach((w,i)=>{
    const div = document.createElement('div'); div.style.borderTop='1px solid #e6eef3'; div.style.padding='8px 0'
    div.innerHTML = `<strong>${w.word}</strong> <span style="color:#4b5563;margin-left:8px">${w.pos||''} ${w.translation? '• '+w.translation: ''}</span>
      <div style="margin-top:6px"><button data-i="${i}" class="edit">Edit</button> <button data-i="${i}" class="del">Delete</button></div>`
    el.appendChild(div)
  })
  el.querySelectorAll('.edit').forEach(b=>b.addEventListener('click',e=>{ const i=+e.target.dataset.i; startEdit(i)}))
  el.querySelectorAll('.del').forEach(b=>b.addEventListener('click',e=>{ const i=+e.target.dataset.i; deleteItem(i)}))
}

function startEdit(i){ const list=getWords(); const w=list[i]; editingIndex=i; document.getElementById('word').value=w.word; document.getElementById('translation').value=w.translation||''; document.getElementById('pos').value=w.pos||''; document.getElementById('example').value=w.example||''; document.getElementById('root').value=w.root||'' }
function deleteItem(i){ const list=getWords(); list.splice(i,1); saveWords(list); }

async function autoFill(){
  const word = document.getElementById('word').value.trim(); if(!word) return alert('請先輸入英文單字')
  const translationEl = document.getElementById('translation')
  const posEl = document.getElementById('pos')
  const exampleEl = document.getElementById('example')
  const rootEl = document.getElementById('root')

  // fetch dictionary info
  try{
    const resp = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
    if(resp.ok){
      const data = await resp.json()
      const first = data[0]
      if(first.meanings && first.meanings.length){
        const m = first.meanings[0]
        posEl.value = m.partOfSpeech || posEl.value
        if(m.definitions && m.definitions.length){
          const d = m.definitions[0]
          exampleEl.value = exampleEl.value || (d.example || '')
        }
      }
    }
  }catch(e){ console.warn('dictionary fetch failed',e) }

  // try simple translation via libretranslate public endpoint (may be rate-limited)
  try{
    const tResp = await fetch('https://libretranslate.de/translate',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({q:word,source:'en',target:'zh',format:'text'})
    })
    if(tResp.ok){
      const t = await tResp.json(); translationEl.value = translationEl.value || t.translatedText || ''
    }
  }catch(e){ console.warn('translate failed',e) }

  // basic root heuristic: strip common prefixes/suffixes
  const root = guessRoot(word)
  rootEl.value = rootEl.value || root
}

function guessRoot(word){
  const prefixes = ['un','re','in','im','dis','pre','post','sub','inter','trans','super','anti','auto','bene','mal','micro','macro']
  const suffixes = ['ing','ed','ion','tion','sion','able','ible','al','ly','ness','ment','ous','ive']
  let w = word.toLowerCase()
  let foundPrefix = prefixes.find(p=>w.startsWith(p))
  let foundSuffix = suffixes.find(s=>w.endsWith(s))
  let core = w
  if(foundPrefix) core = core.slice(foundPrefix.length)
  if(foundSuffix) core = core.slice(0, -foundSuffix.length)
  let parts = []
  if(foundPrefix) parts.push(foundPrefix)
  parts.push(core)
  if(foundSuffix) parts.push(foundSuffix)
  return parts.join(' + ')
}

document.addEventListener('DOMContentLoaded',()=>{
  renderList()
  document.getElementById('word-form').addEventListener('submit',async e=>{
    e.preventDefault(); const list=getWords(); const w=document.getElementById('word').value.trim(); if(!w) return; const obj={word:w,translation:document.getElementById('translation').value.trim(),pos:document.getElementById('pos').value.trim(),example:document.getElementById('example').value.trim(),root:document.getElementById('root').value.trim()}
    if(editingIndex>=0){ list[editingIndex]=obj; editingIndex=-1 }else{ list.push(obj) }
    saveWords(list); document.getElementById('word-form').reset();

    // 如果有設定 GAS_ENDPOINT，則將資料送出到後端 (非必要)
    if(GAS_ENDPOINT){
      try{
        const res = await fetch(GAS_ENDPOINT,{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify(obj)
        })
        if(res.ok){
          // 可視需求處理回應內容
          alert('已送出至後端並儲存於試算表（若設定正確）')
        }else{
          console.warn('GAS response not OK',res.status)
          alert('儲存到本地成功，但後端回傳錯誤，請檢查 GAS 設定')
        }
      }catch(err){
        console.warn('送出到 GAS 失敗',err)
        alert('儲存到本地成功，但無法連到後端（檢查 URL 與網路）')
      }
    }
  })
  document.getElementById('auto-fill').addEventListener('click',autoFill)
  document.getElementById('clear').addEventListener('click',()=>document.getElementById('word-form').reset())
})
