document.addEventListener('DOMContentLoaded',()=>{
 const login=document.getElementById('loginForm');
 const signup=document.getElementById('signupForm');
 if(login) login.addEventListener('submit',async e=>{
  e.preventDefault();
  try{const data=await api('/auth/login',{method:'POST',body:JSON.stringify({email:login.email.value,password:login.password.value})});
   localStorage.setItem('shopease_token',data.token);localStorage.setItem('shopease_user',JSON.stringify(data.user));
   location.href=data.user.role==='admin'?'/admin.html':'/';}
  catch(err){message(err.message,true);}
 });
 if(signup) signup.addEventListener('submit',async e=>{
  e.preventDefault();
  try{await api('/auth/register',{method:'POST',body:JSON.stringify({name:signup.name.value,email:signup.email.value,password:signup.password.value})});
   message('Account created! Redirecting to login...');setTimeout(()=>location.href='/login.html',900);}
  catch(err){message(err.message,true);}
 });
});
