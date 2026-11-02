async function loadProducts(){
 const grid=document.getElementById('productGrid'); if(!grid)return;
 const count=document.getElementById('catalogCount');
 try{
  const query=new URLSearchParams(location.search);
  const categoryFilter=document.querySelector('input[name="categoryFilter"]:checked');
  const category=categoryFilter?categoryFilter.value:(query.get('category')||'');
  const search=document.getElementById('search')?.value||document.getElementById('globalSearch')?.value||query.get('search')||'';
  const params=new URLSearchParams({search,category});
  const rows=await api('/products?'+params);
  let products=Array.from(new Map(rows.map(product=>[product.name,product])).values());
  const maxPrice=Number(document.getElementById('maxPrice')?.value||5000000);
  if(document.getElementById('maxPrice'))products=products.filter(product=>Number(product.price)<=maxPrice);
  if(document.getElementById('inStockOnly')?.checked)products=products.filter(product=>product.stock>0);
  const sort=document.getElementById('sort')?.value;
  if(sort==='price-low')products.sort((a,b)=>Number(a.price)-Number(b.price));
  if(sort==='price-high')products.sort((a,b)=>Number(b.price)-Number(a.price));
  if(sort==='name')products.sort((a,b)=>a.name.localeCompare(b.name));
  if(!document.querySelector('.catalog-layout')){
   const categories=[...new Set(products.map(product=>product.category))];
   const groups=categories.map(category=>products.filter(product=>product.category===category));
   products=[];
   while(products.length<10&&groups.some(group=>group.length)){
    for(const group of groups){
     if(group.length&&products.length<10)products.push(group.shift());
    }
   }
  }
  if(count)count.textContent=`${products.length} ${products.length===1?'product':'products'}`;
  const summary=document.getElementById('resultSummary');
  if(summary)summary.textContent=`Showing ${products.length} products`;
  const maxPriceLabel=document.getElementById('maxPriceLabel');
  if(maxPriceLabel)maxPriceLabel.textContent=maxPrice>=5000000?'₹50,00,000+':money(maxPrice);
  grid.innerHTML=products.length?products.map((p,index)=>`<article class="product" style="--card-index:${index}">
   <a class="product-image-wrap" href="/product-details.html?id=${p.id}" aria-label="View ${escapeHtml(p.name)}">
    <img src="${escapeHtml(p.image_url||'https://placehold.co/600x400?text=ShopEase')}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async">
    <span class="product-tag ${p.stock>0&&p.stock<=5?'low-stock':''}">${p.stock<1?'Sold out':p.stock<=5?'Going fast':escapeHtml(p.category)}</span>
   </a>
   <div class="product-body"><span class="product-category">${escapeHtml(p.category)}</span><h3>${escapeHtml(p.name)}</h3>
   <div class="product-actions"><span class="price">${money(p.price)}</span><button type="button" onclick="addToCart(${Number(p.id)})" ${p.stock<1?'disabled':''}>${p.stock<1?'Sold out':'Add to cart +'}</button></div></div></article>`).join('')
   :'<div class="empty-state"><strong>No finds just yet</strong><p>Try another search or choose a different category.</p></div>';
 }catch(err){if(count)count.textContent='';grid.innerHTML=`<div class="empty-state">${escapeHtml(err.message)}</div>`;}
}
async function loadDetail(){
 const box=document.getElementById('productDetail');if(!box)return;
 try{const p=await api('/products/'+new URLSearchParams(location.search).get('id'));
 box.innerHTML=`<div class="grid"><img class="product-detail-image" src="${escapeHtml(p.image_url||'https://placehold.co/600x400?text=ShopEase')}" alt="${escapeHtml(p.name)}">
 <div><span class="eyebrow">${escapeHtml(p.category)}</span><h1>${escapeHtml(p.name)}</h1><p>${escapeHtml(p.description||'')}</p>
 <p class="price">${money(p.price)}</p><p class="muted">${p.stock>0?`${p.stock} in stock`:'Currently sold out'}</p><button onclick="addToCart(${Number(p.id)})" ${p.stock<1?'disabled':''}>${p.stock<1?'Sold out':'Add to cart +'}</button></div></div>`;
 }catch(err){box.textContent=err.message;}
}
async function addToCart(id){if(!requireLogin())return;try{await api('/cart',{method:'POST',body:JSON.stringify({productId:id,quantity:1})});message('Added to cart.');}catch(e){message(e.message,true);}}
let searchTimer;
document.addEventListener('DOMContentLoaded',()=>{
 const requestedCategory=new URLSearchParams(location.search).get('category')||'';
 const categoryFilters=document.querySelectorAll('input[name="categoryFilter"]');
 categoryFilters.forEach(input=>{input.checked=input.value===requestedCategory;});
 const globalSearch=document.getElementById('globalSearch');
 if(globalSearch)globalSearch.value=new URLSearchParams(location.search).get('search')||'';
 if(globalSearch)globalSearch.addEventListener('input',()=>{
  clearTimeout(searchTimer);
  searchTimer=setTimeout(loadProducts,250);
 });
 categoryFilters.forEach(input=>input.addEventListener('change',loadProducts));
 const maxPrice=document.getElementById('maxPrice');
 if(maxPrice)maxPrice.addEventListener('input',loadProducts);
 const inStock=document.getElementById('inStockOnly');
 if(inStock)inStock.addEventListener('change',loadProducts);
 const reset=document.getElementById('resetFilters');
 if(reset)reset.addEventListener('click',()=>{
  const all=document.querySelector('input[name="categoryFilter"][value=""]');
  if(all)all.checked=true;
  if(maxPrice)maxPrice.value=maxPrice.max;
  if(inStock)inStock.checked=false;
  if(globalSearch)globalSearch.value='';
  history.replaceState(null,'','/products.html');
  loadProducts();
 });
 const sort=document.getElementById('sort');
 if(sort)sort.addEventListener('change',loadProducts);
 loadProducts();loadDetail();
});
