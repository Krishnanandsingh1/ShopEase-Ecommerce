async function loadCart(){
 const box=document.getElementById('cartContent');if(!box||!requireLogin())return;
 try{const items=await api('/cart');
 if(!items.length){box.innerHTML='<div class="panel">Your cart is empty. <a href="/products.html">Start shopping</a>.</div>';return;}
 box.innerHTML=`<div class="table-wrap"><table><thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Subtotal</th><th></th></tr></thead><tbody>
 ${items.map(i=>`<tr><td>${escapeHtml(i.name)}</td><td>${money(i.price)}</td><td><input class="qty" type="number" min="1" max="20" value="${i.quantity}" onchange="updateQty(${i.productId},this.value)"></td><td>${money(i.price*i.quantity)}</td><td><button class="secondary" onclick="removeItem(${i.productId})">Remove</button></td></tr>`).join('')}
 </tbody></table></div><div class="panel row"><strong>Total: ${money(items.reduce((s,i)=>s+i.price*i.quantity,0))}</strong><a class="btn" href="/checkout.html">Proceed to checkout</a></div>`;
 }catch(e){box.textContent=e.message;}
}
async function updateQty(id,quantity){try{await api('/cart/'+id,{method:'PUT',body:JSON.stringify({quantity:Number(quantity)})});loadCart();}catch(e){message(e.message,true);}}
async function removeItem(id){try{await api('/cart/'+id,{method:'DELETE'});loadCart();}catch(e){message(e.message,true);}}
document.addEventListener('DOMContentLoaded',loadCart);
