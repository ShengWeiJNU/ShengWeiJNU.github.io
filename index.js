(function(){
// Get config infomation from config.json
const configInfo = getJSON('config.json');
configInfo.then(config=>{
	var navInd = 0;
	initNav(config, navInd);
}, errText_=>{
	new Error(errText_);
});

// Get a json file asynchronously
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

// When document is loaded, render categories
function initNav(config_, ind_){
	var items = config_.nav;
	var nav = document.getElementById('nav');
	var docEle = document.documentElement;
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
		// When mousedown on nav item, save current scrollTop val to cuttent content-ele's data-scrolly attr.
		liEle.addEventListener('mousedown', e_=>{
			var oldContent = mainContainer.querySelector('.content.active');
			oldContent.setAttribute('data-scrolly', docEle.scrollTop);
		});
		liEle.addEventListener('click', e_=>{
			// Change checked nav item.
			var oldCheckedItem = nav.querySelector('li[data-checked="true"]');
			// If click same nav item for the second time, scroll document to top.
			if(oldCheckedItem === e_.currentTarget){
				docEle.scrollTo(docEle.scrollLeft, 0);
				return;
			}
			oldCheckedItem.removeAttribute('data-checked');
			e_.currentTarget.setAttribute('data-checked', 'true');
			// Change actived content-ele, and scroll document to content-ele's data-scrolly attr.
			var content = getContentPage(config_.pages, items[i]);
			var oldContent = mainContainer.querySelector('.content.active');
			oldContent.classList.remove('active');
			content.classList.add('active');
			var newScrollY = content.getAttribute('data-scrolly');
			docEle.scrollTo(docEle.scrollLeft, newScrollY);
		});
		nav.appendChild(liEle);
	}
	return ind_;
}

// At first, only render the page which is to be shown, then
// when click other category, render connected content page.
function getContentPage(pages_, pagename_){
	var name = '/'+ pagename_;
	var mainContainer = document.getElementById('main-content');
	var container = mainContainer.querySelector(`.content[data-page="${name}"]`);
	if(container === null){
		container = document.createElement('div');
		container.className = 'content';
		container.setAttribute('data-page', name);
		container.setAttribute('data-scrollY', '0');
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