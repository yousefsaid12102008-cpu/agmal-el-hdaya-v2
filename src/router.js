// Design previews exist only in the local development build and never authenticate a user.
export function designPreviewRole(){
 if(!import.meta.env.DEV)return null;
 const match=location.hash.match(/^#review\/(owner|employee|customer)$/);
 return match?.[1]||null;
}
