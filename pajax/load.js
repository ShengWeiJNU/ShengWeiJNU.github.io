onload = e_=>{
  console.log('page onload');
  var script = document.createElement('script');
  script.src = 'main.js';
  document.head.append(script);
}