export const PERMISSIONS=Object.freeze(['view_sales','create_sales','cancel_sales','view_inventory','manage_inventory','manage_prices','manage_treasury','manage_customers','manage_suppliers','manage_employees','view_reports','export_data','approve_transactions','manage_backup','view_orders','manage_orders','view_own_purchases','view_own_orders','view_own_account']);
export const ROLES=Object.freeze(['owner','cashier','employee','customer']);
export const DAILY=Object.freeze(['view_sales','create_sales','view_inventory','manage_inventory','manage_customers','view_orders','manage_orders']);
export const CUSTOMER=Object.freeze(['view_own_purchases','view_own_orders','view_own_account']);
export function isOwner(profile){return profile?.status==='active'&&profile?.role==='owner';}
export function hasPermission(profile,permission){
 if(profile?.status!=='active'||!PERMISSIONS.includes(permission))return false;
 if(profile.role==='owner')return true;
 const allowed=profile.role==='customer'?CUSTOMER:['employee','cashier'].includes(profile.role)?DAILY:[];
 return allowed.includes(permission)&&Array.isArray(profile.permissions)&&profile.permissions.includes(permission);
}
export function validateDecision(input,actorUid){
 if(!input||typeof input.uid!=='string'||!input.uid||input.uid.length>128||input.uid.includes('/')||input.uid===actorUid)throw new Error('invalid-target');
 if(!['active','rejected','suspended'].includes(input.status))throw new Error('invalid-status');
 if(!['cashier','employee','customer'].includes(input.role))throw new Error('invalid-role');
 const allowed=input.role==='customer'?CUSTOMER:DAILY;
 if(!Array.isArray(input.permissions)||new Set(input.permissions).size!==input.permissions.length||input.permissions.some(p=>!allowed.includes(p)))throw new Error('invalid-permissions');
 return {uid:input.uid,status:input.status,role:input.role,permissions:input.permissions};
}
