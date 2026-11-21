export async function deviceLabel(nav=globalThis.navigator){
 const ua=nav?.userAgent||'';let model='';
 try{model=(await nav?.userAgentData?.getHighEntropyValues(['model']))?.model||'';}catch{}
 const ios=ua.match(/(?:iPhone OS|CPU OS) ([\d_]+)/)?.[1]?.replaceAll('_','.');
 if(/iPhone/i.test(ua))return `iPhone${ios?' · iOS '+ios:''}`;
 if(/iPad/i.test(ua))return `iPad${ios?' · iPadOS '+ios:''}`;
 if(/Android/i.test(ua)){const version=ua.match(/Android ([\d.]+)/)?.[1]||'';if(!model)model=ua.match(/Android [^;]+;\s*([^;)]+?)(?: Build\/|\))/)?.[1]||'';if(['K','Mobile'].includes(model))model='';return `${model||'Android phone'}${version?' · Android '+version:''}`.slice(0,120);}
 if(/Windows/i.test(ua))return 'Computer · Windows';if(/Macintosh|Mac OS/i.test(ua))return 'Computer · macOS';if(/Linux/i.test(ua))return 'Computer · Linux';return 'Unknown device';
}
