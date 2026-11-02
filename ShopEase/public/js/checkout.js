document.addEventListener('DOMContentLoaded',()=>{
 const form=document.getElementById('checkoutForm');if(!form)return;
 if(!requireLogin())return;
 form.addEventListener('submit',async e=>{e.preventDefault();
 try{const result=await api('/orders',{method:'POST',body:JSON.stringify({address:form.address.value,phone:form.phone.value,paymentMethod:form.paymentMethod.value})});
 message(`Order #${result.orderId} placed successfully!`);setTimeout(()=>location.href='/orders.html',1000);
 }catch(err){message(err.message,true);}
 });
});
