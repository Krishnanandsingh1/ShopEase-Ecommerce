document.addEventListener('DOMContentLoaded',async()=>{
 const box=document.getElementById('ordersList');if(!box||!requireLogin())return;
 try{const orders=await api('/orders');
 box.innerHTML=orders.length?orders.map(o=>`<div class="panel"><div class="row"><h3>Order #${o.id}</h3><strong>${money(o.total)}</strong></div>
 <p class="muted">${new Date(o.created_at).toLocaleString()} · ${escapeHtml(o.status)}</p>
 <p>${o.items.map(i=>`${escapeHtml(i.name)} × ${i.quantity}`).join(', ')}</p><small>${escapeHtml(o.address)}</small>
 <p class="order-payment"><strong>Payment:</strong> ${escapeHtml(o.payment_method)}</p>${deliveryTracker(o)}</div>`).join(''):'<p>You have not placed any orders yet.</p>';
 }catch(e){box.textContent=e.message;}
});

function deliveryTracker(order){
 const steps=['Placed','Processing','Shipped','Delivered'];
 const current=steps.indexOf(order.status);
 const estimate=new Date(new Date(order.created_at).getTime()+5*24*60*60*1000);
 const eta=estimate.toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});
 if(order.status==='Cancelled')return '<p class="delivery-cancelled">This order was cancelled.</p>';
 return `<section class="delivery-tracker" aria-label="Delivery progress"><div class="row"><strong>Delivery progress</strong><span class="muted">${current===3?'Delivered':`Estimated by ${eta}`}</span></div><ol class="delivery-steps">${steps.map((step,index)=>`<li class="${index<current?'complete':index===current?'current':''}"><span class="delivery-dot" aria-hidden="true"></span><span>${step}</span></li>`).join('')}</ol></section>`;
}
