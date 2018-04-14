document.querySelectorAll('a').forEach((v_, i_, arr_)=>{
	v_.addEventListener('click', f, true);
});
function genKey(){
	const s = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	var r = '';
	for(let i=0; i<6; i++){
		r += s[~~(Math.random()*s.length)];
	}
	return r;
}
function f(e_){
  var ele = e_.currentTarget;
  var url = ele.getAttribute('href');
  var title = ele.getAttribute('data-title');
  var curr = ele.getAttribute('data-current');
  e_.preventDefault();
  e_.stopPropagation();

  if(curr !== null){
    return;
  }
  var state = {
    key: genKey()
  }
  history.pushState(state, title, url);
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = 'text';
  xhr.onreadystatechange = ()=>{
    if(xhr.readyState==4 && xhr.status==200){
      // console.log(xhr);
      let doc = document.implementation.createHTMLDocument();
      doc.documentElement.innerHTML = xhr.responseText;
      document.documentElement.innerHTML = doc.documentElement.innerHTML;
      
      console.log('page url change');
      var script = document.createElement('script');
      script.src = 'main.js';
      document.head.append(script);
    }
  }
  xhr.send();
}
onpopstate = e_=>{
  console.log(e_.state);
}