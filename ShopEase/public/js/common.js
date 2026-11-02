const API = '/api';
const token = () => localStorage.getItem('shopease_token');
const currentUser = () => { try { return JSON.parse(localStorage.getItem('shopease_user')); } catch { return null; } };
async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token()) headers.Authorization = `Bearer ${token()}`;
  const response = await fetch(`${API}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
}
function money(value){ return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Number(value)); }
let messageTimer;
function message(text, isError=false){
 const el=document.getElementById('message');
 if(el){el.textContent=text;el.className='notice'+(isError?' error':'');el.hidden=false;return;}
 let toast=document.getElementById('shopToast');
 if(!toast){toast=document.createElement('div');toast.id='shopToast';toast.className='notice toast-notice';document.body.appendChild(toast);}
 toast.textContent=text;toast.className='notice toast-notice'+(isError?' error':'');toast.setAttribute('role',isError?'alert':'status');toast.setAttribute('aria-live',isError?'assertive':'polite');toast.hidden=false;
 clearTimeout(messageTimer);messageTimer=setTimeout(()=>{toast.hidden=true;},3200);
}
function logout(){localStorage.removeItem('shopease_token');localStorage.removeItem('shopease_user');location.href='/';}
function requireLogin(){if(!token()){location.href='/login.html';return false;}return true;}
function searchProducts(event){
 event.preventDefault();
 const query=document.getElementById('globalSearch')?.value.trim()||'';
 location.href=`/products.html${query?`?search=${encodeURIComponent(query)}`:''}`;
}
function nav(){const user=currentUser();document.getElementById('nav').innerHTML=`
<div class="market-nav-inner">
 <a class="logo" href="/" aria-label="ShopEase home"><span class="logo-word">shop</span>ease<span class="logo-dot">.</span></a>
 <form class="nav-search" role="search" onsubmit="searchProducts(event)">
  <input id="globalSearch" type="search" placeholder="What are you looking for?" aria-label="Search products">
  <button type="submit" aria-label="Search">⌕</button>
 </form>
 <div class="navlinks">
  ${user?`<span class="nav-greeting">Hi, ${escapeHtml(user.name)}</span>`:'<a class="nav-login" href="/login.html">Login</a>'}
  <a href="/cart.html"><span aria-hidden="true">🛍</span> Bag</a>
  ${user?'<a href="/orders.html">My Orders</a>':''}
  ${user?.role==='admin'?'<a href="/admin.html">Admin</a>':''}
  ${user?'<a href="#" onclick="logout()">Logout</a>':'<a class="nav-signup" href="/signup.html">Sign up</a>'}
 </div>
</div>
<div class="nav-category-row" aria-label="Shop categories">
 <a href="/products.html">Discover</a>
 <a href="/products.html?category=Fashion">Fashion</a>
 <a href="/products.html?category=Electronics">Tech & gadgets</a>
 <a href="/products.html?category=Accessories">Accessories</a>
 <a href="/products.html?category=Home">For your space</a>
</div>`;}
function escapeHtml(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
document.addEventListener('DOMContentLoaded',()=>{
 if(document.getElementById('nav'))nav();
 const search=document.getElementById('globalSearch');
 if(search)search.value=new URLSearchParams(location.search).get('search')||'';
});
