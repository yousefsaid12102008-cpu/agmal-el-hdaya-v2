export async function makeInvoicePdf(sheet){
 const [{default:html2canvas},{jsPDF}]=await Promise.all([import('html2canvas'),import('jspdf')]);
 await document.fonts.ready;
 const clone=sheet.cloneNode(true);clone.classList.remove('invoice-thermal');clone.style.cssText='width:794px;max-width:none;min-height:1050px;padding:32px 38px 26px;box-sizing:border-box;position:relative;';
 const stage=document.createElement('div');stage.style.cssText='position:fixed;left:-12000px;top:0;width:794px;direction:rtl;background:white;';stage.append(clone);document.body.append(stage);
 try{const canvas=await html2canvas(clone,{scale:2,backgroundColor:'#ffffff',useCORS:false,windowWidth:1200,logging:false});const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});const width=186,height=canvas.height*width/canvas.width,pageHeight=273;if(height>pageHeight)throw new Error('pdf-page-too-long');pdf.addImage(canvas.toDataURL('image/jpeg',.92),'JPEG',12,12,width,height);return new File([pdf.output('blob')],'agmal-draft-review.pdf',{type:'application/pdf'});}finally{stage.remove();}
}
export function downloadInvoicePdf(file){const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
