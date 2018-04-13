/**
 * created by bibibobo
 * last edit on 2018/03/26 01:17
 * This is a web component, uses web component standard techs, like 
 * Custom Elements: https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
 * Shadow DOM: https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM
 * HTML <template>: https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_templates_and_slots
 * Now, just include this .js doc, and write:
 * var scrollHelper = new scrollHelper();
 * scrollHelper.open();
 * That's all, you have already used this component!
**/
(function(){
/** 
 *  limit a val between min and max.
 *  @params: Number, Number, Number
 *  @return: Number
**/
function constrain(val_, min_, max_){
	val_ = val_>=min_ ? val_ : min_;
	val_ = val_<=max_ ? val_ : max_;
	return val_;
}

/**
 *  when the document mouseMove Event reseting the positon of scrollHelper,
 *  this is the handler.
**/
function helperMove(e_){
	var dragZoneEle = e_.helperDragZoneEle;
	// if dragZoneEle booleans false, means mouseUp has fired.
	// add e_.buttons==0, because user may drag outside the document and then mouseUp the mouse,
	// in this situation, document won't fire mouseUp. We need to use e_.buttons to judge
	// if mouse is pressed down.
	if(!dragZoneEle || e_.buttons==0){
		var mouseUpEvent = new MouseEvent('mouseup');
		e_.currentTarget.dispatchEvent(mouseUpEvent);
		return;
	}
	var helperEle = dragZoneEle.parentNode;
	var newL, newT;
	// update ScrollHelper Element's data-pos_rate attribute.
	newL = constrain(e_.clientX-e_.offX, 0, e_.moveRangeX);
	newT = constrain(e_.clientY-e_.offY, 0, e_.moveRangeY);
	helperEle.setAttribute('data-pos_rate', newL/e_.moveRangeX +';'+ newT/e_.moveRangeY);
	helperEle.style.left = newL/window.innerWidth*100 +'%';
	helperEle.style.top = newT/window.innerHeight*100 +'%';
}

/**
 *  when the pointLock Api starts work, this is the mousemove handler to
 *  scroll the scrollbars.
**/
function lockMove(e_){
	e_.helperTargetEle.scrollBy(e_.movementX, e_.movementY);
}

/**
 *  the document mouseup event handler.
**/
function docMouseUp(e_){
	// remove document mousemove handler
	document.removeEventListener('mousemove', helperMove);
	// delete extensive properties in MouseEvent.prototype
	delete MouseEvent.prototype.offX;
	delete MouseEvent.prototype.offY;
	delete MouseEvent.prototype.moveRangeX;
	delete MouseEvent.prototype.moveRangeY;
	delete MouseEvent.prototype.helperDragZoneEle;
	// document mouseup, means the interaction done, so clear the mouseup event too.
	document.removeEventListener('mouseup', docMouseUp);
}

// Because in origin DOM, a key Up will stop keydown event, though there are keys down.
// So we build a structure: KeyboardEvent.prototype.keys, to store which keys are down.
// And use a interval to poll while there are keys stored in this structure.
function createPollInterval(){
	var scrollEle = MouseEvent.prototype.helperTargetEle;
	var keyEvtPrototype = KeyboardEvent.prototype;
	var keys = keyEvtPrototype.keys;
	var moveX, moveY, dis;
	var pow = Math.pow;
	var now = Date.now;
	var isPageBtnTriggered;
	var id = setInterval(function(){
		moveX=0, moveY=0;
		dis = 1 + pow((now()-keyEvtPrototype.keyDnTriggeredTime)/5000, 2)*60;
		dis = constrain(dis, -70, 70);
		dis = constrain(dis, -70, 70);
		isPageBtnTriggered = false;
		if(keys.codes.length){
			// Page Up
			if(keys[33]){
				let lastPressTime = keyEvtPrototype.lastPgBtnActivedTime;
				if(lastPressTime===null || (now()-lastPressTime)>=500){
					isPageBtnTriggered = true;
					moveY -= scrollEle===document.documentElement ? innerHeight : scrollEle.getBoundingClientRect().height;
				}
			}
			// page Down
			if(keys[34]){
				let lastPressTime = keyEvtPrototype.lastPgBtnActivedTime;
				if(lastPressTime===null || (now()-lastPressTime)>=500){
					isPageBtnTriggered = true;
					moveY += scrollEle===document.documentElement ? innerHeight : scrollEle.getBoundingClientRect().height;
				}
			}
			// Left Arrow
			if(keys[37]){
				moveX -= dis;
			}
			// Up Arrow
			if(keys[39]){
				moveX += dis;
			}
			// Right Arrow
			if(keys[38]){
				moveY -= dis;
			}
			// Down Arrow
			if(keys[40]){
				moveY += dis;
			}
			scrollEle.scrollBy(moveX, moveY);
			if(isPageBtnTriggered){
				keyEvtPrototype.lastPgBtnActivedTime = now();
			}
		}
	}, 16);
	KeyboardEvent.prototype.intervalId = id;
};

// clear the current polling interval, because of all keys up or restart a interval while a new key's down.
function clearPollInterval(){
	clearInterval(KeyboardEvent.prototype.intervalId);
	KeyboardEvent.prototype.intervalId = null;
}

// when pressed the pointerlockZone, press left/up/right/down arrow to scroll.
function keysDown(e_){
	var keys = KeyboardEvent.prototype.keys;
	var intervalId = KeyboardEvent.prototype.intervalId;
	var keyCode = e_.keyCode;
	if(keys[keyCode] === undefined){
		keys[keyCode] = true;
		keys.codes.push(keyCode);
		if(intervalId === null){
			clearPollInterval();
			createPollInterval();
		}
		// When trigger any key down, set keyDnTriggeredTime.
		KeyboardEvent.prototype.keyDnTriggeredTime = Date.now();
	}
	e_.preventDefault();
}

// when key up, remove from KeyboardEvent.prototype.keys
function keysUp(e_){
	var keys = KeyboardEvent.prototype.keys;
	var codes = keys.codes;
	var keyCode = e_.keyCode;
	delete keys[keyCode];
	codes.splice(codes.indexOf(keyCode), 1);
	clearPollInterval();
	if(codes.length){
		createPollInterval();
	}
	// If pgUp or pgDn is released, reset lastPgBtnActivedTime value.
	// So that when user click this two keys quickly, we can trigger correctly.
	if(keyCode===33 || keyCode===34){
		KeyboardEvent.prototype.lastPgBtnActivedTime = null;
	}
	e_.preventDefault();
}



/**
 *  Class ScrollHelper
 *  @params: the scrollhelper component element,  the element which the component acts on.
 *  @properties: bindEle, targetEle
 *  @methods: open, close, moveRangeX[get], moveRangeY[get]
**/
function ScrollHelper(tarEle_){
	this.bindEle = (function(){
		var ele = document.createElement('scroll-helper');
		document.body.appendChild(ele);
		return ele.shadowRoot.querySelector('.comp-scroll-helper');
	})();
	if(tarEle_ === null){
		throw Error('targetElement is null, can\'t create ScrollHelper.');
	}else{
		this.targetEle = tarEle_ = tarEle_ || document.documentElement;
	}
	// use the data-pos_rate attribute stores current positon of scrolHelper ele,
	// between [0, 1.0]. Will be useful when recalculate position while window resizing.
	var initPosRate = {
		left: window.innerWidth*0.70 / this.moveRangeX,
		top: window.innerHeight*0.65 / this.moveRangeY
	}
	this.bindEle.setAttribute('data-pos_rate', initPosRate.left+';0.5'+initPosRate.top);
	var self = this;
	// if browser doesn\'t pointerLock Api, log info.'
	if(!(Element.prototype.requestPointerLock instanceof Function)){
		console.log('Your browser doesn\'t support the PointLock API.')
		return {};
	};
	// relocate in percent position when resizing window.
	window.addEventListener('resize', function(e_){
		var leftPercent, topPercent, dataPosPercent;
		dataPosPercent = self.bindEle.getAttribute('data-pos_rate').split(';');
		leftPercent = +dataPosPercent[0];
		topPercent = +dataPosPercent[1];
		self.bindEle.style.left = leftPercent*self.moveRangeX/window.innerWidth*100 +'%';
		self.bindEle.style.top = topPercent*self.moveRangeY/window.innerHeight*100 +'%';
	});
};

Object.defineProperty(ScrollHelper, 'templateEle', {
	value: (function(){
		var templateEle = document.createElement('template');
		templateEle.innerHTML = `
			<style>
				.component-open{
				  visibility: 1;
				  opacity: 1;
				}
				.component-close{
				  visibility: 0;
				  opacity: 0;
				  z-index: -10 !important;
				}
				.component{
				  transition: visibility .15s linear, opacity .15s linear;
				}

				.comp-scroll-helper{
				  min-width: 160px;
				  position: fixed;
				  left: 70%;
				  top: 65%;
				  z-index: 9995;
				  -moz-user-select: none;
				  -webkit-user-select: none;
				  background-color: hsla(0, 0%, 50%, .35);
				  box-sizing: border-box;
				  border-radius: 6px;
				  text-align: center;
				  overflow: hidden;
				}
				.comp-scroll-helper>.drag-zone{
				  height: 30px;
				  display: block;
				  padding: 0 6px;
				  background-color: hsla(0, 0%, 50%, .4);
				  font-size: 20px;
				  line-height: 30px;
				  color: #fff;
				}
				.comp-scroll-helper>.pointerlock-zone{
				  height: 110px;
				  margin: 0;
				  line-height: 1.2;
				  color: gray;
				}
			</style>
			<div class="comp-scroll-helper component-close component">
				<div class="drag-zone">PressPanel</div>
				<div class="pointerlock-zone"></div>
			</div>
		`;
		customElements.define('scroll-helper', 
			class extends HTMLElement{
				constructor(){
					super();
					var content = templateEle.content;
					this.attachShadow({mode:'open'}).appendChild(content.cloneNode(true));
				}
			}
		);
		return templateEle;
	})(),
	writable: false,
	enumerable: true,
	configurable: false
})

// get max-Width and max-Height the scrollHelper can move, to avoid going outside the viewport.
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

// set the scrollHelper visible.
ScrollHelper.prototype.open = function(){
	var self = this;
	// change CSS class to open.
	self.bindEle.classList.replace('component-close', 'component-open');
	var dragZone = self.bindEle.querySelector('.drag-zone');
	var pointerlockZone = self.bindEle.querySelector('.pointerlock-zone');

	// start move scrollHelper position.
	dragZone.onmousedown = function(e_){
		var curEle = e_.currentTarget;
		var customEle = curEle.parentNode.parentNode.host;
		if(customEle.parentNode.lastChild !== customEle){
			customEle.parentNode.appendChild(customEle);
		}
		// register document mouseMove and mouseUp event.
		document.addEventListener('mousemove', helperMove);
		document.addEventListener('mouseup', docMouseUp);
		// transfer necessary data by MouseEvent.prototype,
		// and use e_.xxx to get data while MouseEvent happened.
		//offX, offY store the offset position info when drag start.
		// moveRange, moveRangeY store the moveRange info of ScrollHelper Element.
		// helperDragZoneEle stores the current dragging ele.
		MouseEvent.prototype.offX = e_.clientX - curEle.getBoundingClientRect().left;
		MouseEvent.prototype.offY = e_.clientY - curEle.getBoundingClientRect().top;
		MouseEvent.prototype.moveRangeX = self.moveRangeX;
		MouseEvent.prototype.moveRangeY = self.moveRangeY;
		MouseEvent.prototype.helperDragZoneEle = e_.currentTarget;
	}

	// Starts pointerLock Api.
	pointerlockZone.onmousedown = function(e_){
		var curEle = e_.currentTarget;
		var customEle = curEle.parentNode.parentNode.host;
		if(customEle.parentNode.lastChild !== customEle){
			customEle.parentNode.appendChild(customEle);
		}
		curEle.addEventListener('mousemove', lockMove);
		document.addEventListener('keydown', keysDown);
		document.addEventListener('keyup', keysUp);
		curEle.requestPointerLock();
		// HelperTargetEle stores element which ScrollHelper acts on.
		MouseEvent.prototype.helperTargetEle = self.targetEle;
		// Add a Keyboard event attribute: keys, store current pressed keyCodes
		KeyboardEvent.prototype.keys = {codes: []};
		// Store keys polling intervalId.
		KeyboardEvent.prototype.intervalId = null;
		// When press pageUp and pageDown, we don't want to trigger in a high frequency,
		// this two attriutes store last time moment when we press such keys, so we can judge
		// time between two triggers.
		KeyboardEvent.prototype.lastPgBtnActivedTime = null;
		// To scroll faster and faster when the pressedTime grows. We save the time when keyDown is
		// triggered.
		KeyboardEvent.prototype.keyDnTriggeredTime = null;
	}

	// finish pointerLock Api, delete extensive property on MouseEvent.prototype.
	pointerlockZone.onmouseup = function(e_){
		e_.currentTarget.removeEventListener('mousemove', lockMove);
		document.removeEventListener('keydown', keysDown);
		document.removeEventListener('keyup', keysUp);
		document.exitPointerLock();
		clearPollInterval();
		delete MouseEvent.prototype.helperTargetEle;
		delete KeyboardEvent.prototype.keys;
		delete KeyboardEvent.prototype.intervalId;
		delete KeyboardEvent.prototype.lastPgBtnActivedTime;
		delete KeyboardEvent.prototype.keyDnTriggeredTime;
	}
}

// hide ScrollHelper, unregister relative events. can be open again by open() method.
ScrollHelper.prototype.close = function(){
	var self = this;
	// set CSS class to close.
	self.bindEle.classList.replace('component-open', 'component-close');
	var dragZone = self.bindEle.querySelector('.drag-zone');
	var pointerlockZone = self.bindEle.querySelector('.pointerlock-zone');

	dragZone.onmousedown = null;
	pointerlockZone.onmousedown = null;
	pointerlockZone.onmouseup = null;
}

window.ScrollHelper = ScrollHelper;
})();