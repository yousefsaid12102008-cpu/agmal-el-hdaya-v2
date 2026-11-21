// Phase 2 groundwork only, no persistence or client-side stock balance mutation.
export const inventoryMovementTypes=Object.freeze(['purchase_receipt','issue','sale','return','count_adjustment','damage','transfer']);
export function baseQuantity(quantity,baseUnitsPerUnit){
 if(!Number.isSafeInteger(quantity)||quantity<=0||!Number.isSafeInteger(baseUnitsPerUnit)||baseUnitsPerUnit<=0)throw Error('positive-integer-unit-conversion-required');
 const result=quantity*baseUnitsPerUnit;if(!Number.isSafeInteger(result))throw Error('quantity-overflow');return result;
}
export function stockMovement({productId,warehouseId,type,deltaBaseUnits,reason,referenceId}){
 if(!productId||!warehouseId||!inventoryMovementTypes.includes(type)||!Number.isSafeInteger(deltaBaseUnits)||deltaBaseUnits===0||!reason?.trim()||!referenceId)throw Error('documented-movement-required');
 if(type==='transfer')throw Error('paired-source-destination-transaction-required');
 if(['issue','sale','damage'].includes(type)&&deltaBaseUnits>0)throw Error('outgoing-movement-must-be-negative');
 if(type==='purchase_receipt'&&deltaBaseUnits<0)throw Error('receipt-must-be-positive');
 return {productId,warehouseId,type,deltaBaseUnits,reason:reason.trim(),referenceId};
}
