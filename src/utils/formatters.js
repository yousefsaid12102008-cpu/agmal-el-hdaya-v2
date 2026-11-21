export const formatMoney=(minor)=>new Intl.NumberFormat('ar-EG',{style:'currency',currency:'EGP'}).format(minor/100);
export const formatDate=(date)=>new Intl.DateTimeFormat('ar-EG',{timeZone:'Africa/Cairo',dateStyle:'long'}).format(date);
