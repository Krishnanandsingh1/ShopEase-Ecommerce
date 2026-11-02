async function adminInit(){
 const user=currentUser();if(!token()||user?.role!=='admin'){location.href='/login.html';return;}
 try{const s=await api('/admin/stats');
 document.getElementById('stats').innerHTML=[['Customers',s.users],['Products',s.products],['Orders',s.orders],['Sales',money(s.sales)]].map(x=>`<div class="stat"><span class="muted">${x[0]}</span><strong>${x[1]}</strong></div>`).join('');
 loadAdminProducts();loadAdminOrders();loadCustomers();
 }catch(e){message(e.message,true);}
}
async function loadAdminProducts(){
 const rows=await api('/admin/products');document.getElementById('adminProducts').innerHTML=rows.map(p=>`<tr><td>${escapeHtml(p.name)}</td><td>${money(p.price)}</td><td>${p.stock}</td><td><button onclick="editProduct(${p.id})">Edit</button> <button onclick="deleteProduct(${p.id})">Delete</button></td></tr>`).join('');
}
async function editProduct(id){
 const p=(await api('/admin/products')).find(x=>x.id===id);if(!p)return;
 const name=prompt('Product name',p.name);if(name===null)return;
 const price=prompt('Price',p.price);if(price===null)return;
 const stock=prompt('Stock',p.stock);if(stock===null)return;
 try{await api('/admin/products/'+id,{method:'PUT',body:JSON.stringify({...p,name,price:Number(price),stock:Number(stock)})});loadAdminProducts();message('Product updated.');}catch(e){message(e.message,true);}
}
async function deleteProduct(id){if(!confirm('Delete this product?'))return;try{await api('/admin/products/'+id,{method:'DELETE'});loadAdminProducts();}catch(e){message(e.message,true);}}
async function loadAdminOrders(){
 const rows=await api('/admin/orders');document.getElementById('adminOrders').innerHTML=rows.map(o=>`<tr><td>#${o.id}</td><td>${escapeHtml(o.customer)}</td><td>${money(o.total)}</td><td><select onchange="changeStatus(${o.id},this.value)">${['Placed','Processing','Shipped','Delivered','Cancelled'].map(s=>`<option ${s===o.status?'selected':''}>${s}</option>`).join('')}</select></td></tr>`).join('');
}
async function changeStatus(id,status){try{await api('/admin/orders/'+id,{method:'PATCH',body:JSON.stringify({status})});message('Order status updated.');}catch(e){message(e.message,true);}}
async function loadCustomers(){const rows=await api('/admin/customers');document.getElementById('customers').innerHTML=rows.map(u=>`<tr><td>${escapeHtml(u.name)}</td><td>${escapeHtml(u.email)}</td><td>${new Date(u.created_at).toLocaleDateString()}</td></tr>`).join('');}
document.addEventListener('DOMContentLoaded',()=>{
 const form=document.getElementById('productForm');
 if(form)form.addEventListener('submit',async e=>{e.preventDefault();try{await api('/admin/products',{method:'POST',body:JSON.stringify({name:form.name.value,description:form.description.value,category:form.category.value,price:Number(form.price.value),image_url:form.image_url.value,stock:Number(form.stock.value)})});form.reset();loadAdminProducts();message('Product added.');}catch(err){message(err.message,true);}});
 if(document.getElementById('stats'))adminInit();
});
