export function cairoTime(date=new Date()){return new Intl.DateTimeFormat('ar-EG',{timeZone:'Africa/Cairo',dateStyle:'medium',timeStyle:'medium'}).format(date);}
export function mountClock(host){host.textContent=`القاهرة · ${cairoTime()}`;const timer=setInterval(()=>{host.textContent=`القاهرة · ${cairoTime()}`;},1000);return()=>clearInterval(timer);}
