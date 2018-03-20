(function(){

function constrain(val_, min_, max_){
	val_ = val_>=min_ ? val_ : min_;
	val_ = val_<=max_ ? val_ : max_;
	return val_;
}

function helperMove(e_){
	var curEle = this;
	var curEle = e_.currentTarget;
	var parEle = curEle.parentNode;
	if(e_.capturePolyFill){
		e_ = e_.captureInfo;
	}
	var newL, newT;
	newL = constrain(e_.clientX-e_.offX, 0, e_.moveRangeX);
	newT = constrain(e_.clientY-e_.offY, 0, e_.moveRangeY);
	parEle.setAttribute('data-pos_percent', newL/e_.moveRangeX +';'+ newT/e_.moveRangeY);
	parEle.style.left = newL/window.innerWidth*100 +'%';
	parEle.style.top = newT/window.innerHeight*100 +'%';
}

function lockMove(e_){
	e_.helperTargetEle.scrollBy(e_.movementX, e_.movementY);
}

function ScrollHelper(bindEle_, tarEle_){
	this.bindEle = bindEle_;
	this.targetEle = tarEle_ = tarEle_ || document.documentElement;
	this.bindEle.setAttribute('data-pos_percent', '0;0');
	var self = this;
	if(!(Element.prototype.requestPointerLock instanceof Function)){
		console.log('Your browser doesn\'t support the PointLock API.')
		return {};
	};
	window.addEventListener('resize', function(e_){
		var leftPercent, topPercent, dataPosPercent;
		dataPosPercent = self.bindEle.getAttribute('data-pos_percent').split(';');
		leftPercent = +dataPosPercent[0];
		topPercent = +dataPosPercent[1];
		self.bindEle.style.left = leftPercent*self.moveRangeX/window.innerWidth*100 +'%';
		self.bindEle.style.top = topPercent*self.moveRangeY/window.innerHeight*100 +'%';
	});
};

Object.defineProperties(ScrollHelper.prototype, {
	moveRangeX: {
		get: function(){
			return window.innerWidth - this.bindEle.getBoundingClientRect().width;
		}
	},
	moveRangeY: {
		get: function(){
			return window.innerHeight - this.bindEle.getBoundingClientRect().height;
		}
	}
});

ScrollHelper.prototype.open = function(){
	var self = this;
	self.bindEle.classList.replace('component-close', 'component-open');
	var dragZone = self.bindEle.querySelector('.drag-zone');
	var pointerlockZone = self.bindEle.querySelector('.pointerlock-zone');

	dragZone.onmousedown = function(e_){
		var curEle = e_.currentTarget;
		var parEle = curEle.parentNode;
		parEle.parentNode.appendChild(parEle);
		curEle.setCapture();
		curEle.addEventListener('mousemove', helperMove);
		MouseEvent.prototype.offX = e_.clientX - curEle.getBoundingClientRect().left;
		MouseEvent.prototype.offY = e_.clientY - curEle.getBoundingClientRect().top;
		MouseEvent.prototype.moveRangeX = self.moveRangeX;
		MouseEvent.prototype.moveRangeY = self.moveRangeY;
		log("%o:\n", e_);
	}

	dragZone.onmouseup = function(e_){
		e_.currentTarget.removeEventListener('mousemove', helperMove);
		log('dragzone mouse up')
		delete MouseEvent.prototype.offX;
		delete MouseEvent.prototype.offY;
		delete MouseEvent.prototype.moveRangeX;
		delete MouseEvent.prototype.moveRangeY;
	}

	pointerlockZone.onmousedown = function(e_){
		e_.currentTarget.parentNode.parentNode.appendChild(e_.currentTarget.parentNode);
		e_.currentTarget.addEventListener('mousemove', lockMove);
		e_.currentTarget.requestPointerLock();
		MouseEvent.prototype.helperTargetEle = self.targetEle;
	}

	pointerlockZone.onmouseup = function(e_){
		e_.currentTarget.removeEventListener('mousemove', lockMove);
		document.exitPointerLock();
		delete MouseEvent.prototype.helperTargetEle;
	}
}

ScrollHelper.prototype.close = function(){
	var self = this;
	self.bindEle.classList.replace('component-open', 'component-close');
	var dragZone = self.bindEle.querySelector('.drag-zone');
	var pointerlockZone = self.bindEle.querySelector('.pointerlock-zone');

	dragZone.onmousedown = null;
	dragZone.onmouseup = null;

	pointerlockZone.onmousedown = null;
	pointerlockZone.onmouseup = null;
}

window.ScrollHelper = ScrollHelper;
})();