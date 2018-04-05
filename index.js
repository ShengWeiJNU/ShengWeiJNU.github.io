(function(){
const configInfo = getJSON('config.json');
configInfo.then(config=>{
	var navInd = 0;
	initNav(config, navInd);
	var navName = config.nav[navInd];
	getContentPage(config.pages, navName);
}, errText_=>{
	new Error(errText_);
});

function getJSON(url){
	const promise = new Promise((resolve_, reject_)=>{
		const xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onreadystatechange = function(){
			if(this.readyState != 4){
				return;
			}
			if(this.readyState==4 && this.status==200){
				resolve_(this.response);
			}else{
				reject_(this.statusText);
			}
		}
		xhr.responseType = 'json';
		xhr.setRequestHeader('Accept', 'application/json');
		xhr.send();
	});
	return promise;
}

function initNav(config_, ind_){
	var items = config_.nav;
	var nav = document.getElementById('nav');
	var liEle;
	var mainContainer = document.getElementById('main-content');
	for(let i=0; i<items.length; i++){
		liEle = document.createElement('li');
		if(i === ind_){
			liEle.setAttribute('data-checked', 'true');
			let content = getContentPage(config_.pages, items[i]);
			content.classList.add('active');
			mainContainer.appendChild(content);
		}
		liEle.innerHTML = `<a href="##">${items[i]}</a>`;
		liEle.setAttribute('data-router', `/${items[i]}`);
		liEle.addEventListener('click', e_=>{
			nav.querySelector('li[data-checked="true"]').removeAttribute('data-checked');
			e_.currentTarget.setAttribute('data-checked', 'true');
		
			var content = getContentPage(config_.pages, items[i]);
			mainContainer.querySelector('.content.active').classList.remove('active');
			content.classList.add('active');
		});
		nav.appendChild(liEle);
	}
	return ind_;
}

function getContentPage(pages_, pagename_){
	var name = '/'+ pagename_;
	var mainContainer = document.getElementById('main-content');
	var container = mainContainer.querySelector(`.content[data-page="${name}"]`);
	if(container === null){
		container = document.createElement('div');
		container.className = 'content';
		container.setAttribute('data-page', name);
		let ul = document.createElement('ul');
		let page = pages_[pagename_];
		let content = '';
		if(page){
			for(let i=0; i<page.length; i++){
				content += `<li><a class="link" href="${page[i].url}">${page[i].title}</a></li>`
			}
			ul.innerHTML = content;
			container.appendChild(ul);
		}
		mainContainer.appendChild(container);
	}
	return container;
}
})();