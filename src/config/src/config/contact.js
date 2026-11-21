export const shopContact=Object.freeze({
 facebook:'https://www.facebook.com/share/1QHmUy8BBx/',
 maps:'https://maps.app.goo.gl/VRsWT1MR5eX8Mg1s8',
 address:'10 شارع زكريا رشوان، شبرا الخيمة'
});
// Supplied directly by the owner. Link destination content could not be independently fetched.
export function contactLinks(){return `<a href="${shopContact.facebook}" target="_blank" rel="noopener noreferrer">صفحتنا على فيسبوك <span aria-hidden="true">↗</span></a><a href="${shopContact.maps}" target="_blank" rel="noopener noreferrer">افتح موقع المكتبة <span aria-hidden="true">↗</span></a>`;}
export function contactSection(){return `<section class="contact-section" id="contact"><div><div class="store-kicker">VISIT THE SHOP / 05</div><h2>أفكارك تستاهل<br><span>زيارة لأجمل الهدايا.</span></h2><p>هتلاقينا في</p><address>${shopContact.address}</address></div><div class="contact-card"><span class="contact-overline">أجمل الهدايا</span><h3>خلّينا أقرب.</h3><p>زور المكتبة، أو تابع صفحتنا على فيسبوك.</p><div class="contact-buttons">${contactLinks()}</div></div></section>`;}
export function footerContact(){return `<div class="footer-contact"><address>${shopContact.address}</address><div>${contactLinks()}</div></div>`;}
