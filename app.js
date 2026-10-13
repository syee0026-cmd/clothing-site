'use strict';
const products = [
  {id:'coat',name:'City Edit Longline Coat',category:'Women',tags:['Women','New'],price:69.95,image:'womenswear',color:'Sky blue',badge:'THE EDIT',description:'A statement blue layer for a city-inspired wardrobe.'},
  {id:'shirt',name:'Essential Tailored Shirt',category:'Men',tags:['Men','Tops'],price:29.95,image:'menswear',color:'White',badge:'ESSENTIAL',description:'A crisp shirt silhouette for a polished everyday look.'},
  {id:'jacket',name:'Vintage-Inspired Denim Jacket',category:'Denim',tags:['Denim','Women','Men','New'],price:54.95,image:'outerwear',color:'Washed blue',badge:'NEW IN',description:'A relaxed denim layer with a contrasting textured collar.'},
  {id:'jersey',name:'Everyday Graphic Jersey',category:'Knitwear',tags:['Knitwear','Tops','Women','Men'],price:24.95,image:'knitwear',color:'Black',badge:'EVERYDAY',description:'A laid-back long-sleeve graphic jersey for off-duty outfits.'},
  {id:'dress',name:'Scarlet Occasion Maxi Dress',category:'Dresses',tags:['Dresses','Women','New'],price:59.95,image:'dress',color:'Scarlet',badge:'NEW IN',description:'A flowing statement dress in a vibrant scarlet shade.'},
  {id:'jeans',name:'Classic Blue Denim',category:'Denim',tags:['Denim','Women','Men'],price:39.95,image:'denim',color:'Indigo',badge:'ESSENTIAL',description:'Classic blue denim inspiration for an everyday wardrobe.'},
  {id:'capsule',name:'Neutral Wardrobe Capsule',category:'Tops',tags:['Tops','Women','New'],price:89.95,image:'hero',color:'Neutral mix',badge:'THE EDIT',description:'An illustrative capsule of light, neutral garments to inspire your next outfit.'},
  {id:'tee',name:'The Everyday White Tee',category:'Tops',tags:['Tops','Women','Men'],price:19.95,image:'tee',color:'White',badge:'ESSENTIAL',description:'A minimal white tee to style your own way.'}
];
const $ = (selector) => document.querySelector(selector);
const money = (amount) => new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD'}).format(amount);
function readSaved(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
const validId = (id) => products.some(p=>p.id===id);
const rawSaved=readSaved('northloom-saved',[]);
let saved=new Set(Array.isArray(rawSaved)?rawSaved.filter(validId):[]);
const rawBag=readSaved('northloom-bag',[]);
let bag=Array.isArray(rawBag)?rawBag.filter(i=>i&&validId(i.id)&&['XS','S','M','L','XL'].includes(i.size)&&Number.isInteger(i.qty)&&i.qty>0&&i.qty<=99):[];
let category='All',query='',savedOnly=false,currentProduct=null,toastTimer;
const heart='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 4.8c-2.2-2.2-5.5-1.6-8.5 1.4-3-3-6.3-3.6-8.5-1.4C.6 7.7 2.8 12 12 20c9.2-8 11.4-12.3 8.5-15.2Z"/></svg>';
function persist(){try{localStorage.setItem('northloom-saved',JSON.stringify([...saved]));localStorage.setItem('northloom-bag',JSON.stringify(bag))}catch{/* Browsing remains usable when storage is unavailable. */}updateCounts()}
function updateCounts(){$('#saved-count').textContent=saved.size;$('#bag-count').textContent=bag.reduce((n,i)=>n+i.qty,0);$('#saved-button').setAttribute('aria-pressed',String(savedOnly))}
function notify(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2400)}
function renderProducts(){
  let filtered=products.filter(p=>(category==='All'||p.tags.includes(category))&&(!savedOnly||saved.has(p.id))&&`${p.name} ${p.tags.join(' ')} ${p.color}`.toLowerCase().includes(query));
  const sort=$('#sort').value;
  if(sort==='low')filtered.sort((a,b)=>a.price-b.price);
  if(sort==='high')filtered.sort((a,b)=>b.price-a.price);
  if(sort==='new')filtered.sort((a,b)=>Number(b.tags.includes('New'))-Number(a.tags.includes('New')));
  $('#product-grid').innerHTML=filtered.map(p=>`<article class="product-card"><div class="product-image"><button class="product-open" data-product="${p.id}" aria-label="View ${p.name}"><img src="assets/${p.image}.jpg" alt="${p.name} in ${p.color}" width="600" height="800" loading="lazy"></button><span class="product-badge">${p.badge}</span><button class="save-product" data-save="${p.id}" aria-label="Save ${p.name}" aria-pressed="${saved.has(p.id)}">${heart}</button><button class="quick-view" data-product="${p.id}">QUICK VIEW +</button></div><div class="product-info"><h3><button class="product-title" data-product="${p.id}">${p.name}</button></h3><p class="product-price">${money(p.price)}<small>AUD · sample</small></p><p class="product-meta">${p.color} / ${p.category}</p></div></article>`).join('');
  $('#empty-state').hidden=filtered.length!==0;
  $('#result-count').textContent=`${filtered.length} style${filtered.length===1?'':'s'}`;
  $('#active-filter').hidden=!(category!=='All'||query||savedOnly);
  $('#filter-description').textContent=[savedOnly?'Saved styles':'',category!=='All'?category:'',query?`Search: “${query}”`:''].filter(Boolean).join(' · ');
  document.querySelectorAll('.nav [data-category],.filter-tabs [data-category]').forEach(button=>{const selected=button.dataset.category===category;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected))});updateCounts();
}
function scrollShop(){$('#shop').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
function resetFilters(){category='All';query='';savedOnly=false;$('#search-input').value='';renderProducts()}
function showProduct(id){
  const p=products.find(p=>p.id===id);if(!p)return;currentProduct=p;
  $('#product-detail').innerHTML=`<img class="detail-photo" src="assets/${p.image}.jpg" alt="${p.name} in ${p.color}"><div class="detail-copy"><p class="eyebrow">NORTH LOOM / ${p.category.toUpperCase()}</p><h2 id="detail-title">${p.name}</h2><p class="detail-price">${money(p.price)} <small>AUD</small></p><p class="muted">${p.description}</p><p>Colour: ${p.color}</p><label for="product-size">Select a sample size</label><select id="product-size"><option value="">Choose a size</option><option>XS</option><option>S</option><option>M</option><option>L</option><option>XL</option></select><button id="add-to-bag" class="button dark">ADD TO PREVIEW BAG +</button><p class="sample-note">Sample product, photography, sizes and price. This preview does not reserve stock or place an order.</p></div>`;$('#product-dialog').showModal();
}
function renderBag(){
  $('#bag-items').innerHTML=bag.length?bag.map((item,index)=>{const p=products.find(p=>p.id===item.id);return `<article class="bag-item"><img src="assets/${p.image}.jpg" alt="${p.name}"><div><h3>${p.name}</h3><p>Size ${item.size} · ${p.color}</p><strong>${money(p.price*item.qty)}</strong><div class="quantity-controls"><button data-quantity="${index}" data-delta="-1" aria-label="Decrease quantity of ${p.name}" ${item.qty===1?'disabled':''}>−</button><span>${item.qty}</span><button data-quantity="${index}" data-delta="1" aria-label="Increase quantity of ${p.name}" ${item.qty===99?'disabled':''}>+</button><button class="remove" data-remove="${index}" aria-label="Remove ${p.name}">Remove</button></div></div></article>`}).join(''):'<p class="bag-empty">Your bag is waiting for a little inspiration.<br>Explore a style and choose a size to add it here.</p>';
  $('#bag-total').textContent=money(bag.reduce((sum,item)=>sum+products.find(p=>p.id===item.id).price*item.qty,0));
}
document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.category){category=button.dataset.category;savedOnly=false;query='';$('#search-input').value='';renderProducts();scrollShop()}
  if(button.dataset.product)showProduct(button.dataset.product);
  if(button.dataset.save){const id=button.dataset.save;saved.has(id)?saved.delete(id):saved.add(id);persist();if(savedOnly){renderProducts();$('#saved-button').focus()}else{button.setAttribute('aria-pressed',String(saved.has(id)))}notify(saved.has(id)?'Added to your saved styles':'Removed from your saved styles')}
  if(button.dataset.close)document.getElementById(button.dataset.close).close();
  if(button.id==='add-to-bag'){
    const size=$('#product-size').value;if(!size){$('#product-size').focus();notify('Please select a size first');return}
    const existing=bag.find(i=>i.id===currentProduct.id&&i.size===size);if(existing&&existing.qty>=99){notify('Maximum preview quantity reached');return}
    existing?existing.qty++:bag.push({id:currentProduct.id,size,qty:1});persist();$('#product-dialog').close();notify('Added to your preview bag');
  }
  if(button.dataset.quantity!==undefined){const i=Number(button.dataset.quantity);bag[i].qty=Math.max(1,Math.min(99,bag[i].qty+Number(button.dataset.delta)));persist();renderBag();$(`[data-quantity="${i}"][data-delta="${button.dataset.delta}"]`)?.focus()}
  if(button.dataset.remove!==undefined){bag.splice(Number(button.dataset.remove),1);persist();renderBag();$('#bag-dialog .close-dialog').focus()}
});
$('#search-form').addEventListener('submit',event=>{event.preventDefault();query=$('#search-input').value.trim().toLowerCase();category='All';savedOnly=false;renderProducts();scrollShop()});
$('#search-input').addEventListener('input',()=>{if(!$('#search-input').value&&query){query='';renderProducts()}});
$('#sort').addEventListener('change',renderProducts);
$('#saved-button').addEventListener('click',()=>{savedOnly=!savedOnly;category='All';query='';$('#search-input').value='';renderProducts();scrollShop()});
$('#bag-button').addEventListener('click',()=>{renderBag();$('#bag-dialog').showModal()});
$('#clear-filters').addEventListener('click',resetFilters);$('#empty-reset').addEventListener('click',resetFilters);
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});
renderProducts();
