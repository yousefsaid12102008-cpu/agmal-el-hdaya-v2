// Integer piastres only. This calculation is not invoice issuance or a ledger.
const nonnegative=(n,label)=>{if(!Number.isSafeInteger(n)||n<0)throw Error(label);return n;};
const safe=n=>{if(!Number.isSafeInteger(n))throw Error('amount-overflow');return n;};
export function invoiceTotals({lines,discountPiastres=0,payments=[]}){
 if(!Array.isArray(lines)||!lines.length||lines.length>200)throw Error('lines-required');
 const items=lines.map(line=>{nonnegative(line.unitPricePiastres,'invalid-price');if(!Number.isSafeInteger(line.quantity)||line.quantity<=0)throw Error('invalid-quantity');return {...line,totalPiastres:safe(line.unitPricePiastres*line.quantity)};});
 const subtotalPiastres=items.reduce((sum,x)=>safe(sum+x.totalPiastres),0);nonnegative(discountPiastres,'invalid-discount');if(discountPiastres>subtotalPiastres)throw Error('discount-exceeds-subtotal');
 const totalPiastres=subtotalPiastres-discountPiastres;
 const paidPiastres=payments.reduce((sum,p)=>safe(sum+nonnegative(p.amountPiastres,'invalid-payment')),0);if(paidPiastres>totalPiastres)throw Error('payment-exceeds-total');
 return {items,subtotalPiastres,discountPiastres,totalPiastres,paidPiastres,duePiastres:totalPiastres-paidPiastres};
}
export function egp(piastres){nonnegative(piastres,'invalid-amount');return `${Math.floor(piastres/100).toLocaleString('en-US')}.${String(piastres%100).padStart(2,'0')} ج.م`;} 
