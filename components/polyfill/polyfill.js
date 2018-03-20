var Capture = {
}
Capture.__proto__ = {
	__info__: null,
	__targetEle__: null
}
Capture.info = null;
Capture.targetEle = null;
Object.defineProperties(Capture, {
	info: {
		get: function(){
			return this.__proto__.__info__;
		},
		set: function(val_){
			this.__proto__.__info__ = val_;
			if(this.mouseMoveHandler instanceof Function){
				this.mouseMoveHandler.call(this.targetEle, this.info);
			}
		}
	},
	targetEle: {
		get: function(){
			return this.__proto__.__targetEle__;
		},
		set: function(val_){
			this.__proto__.__targetEle__ = val_;
		}
	}
})
Capture.mouseMoveHandler = null;

if(!(Element.prototype.setCapture instanceof Function)){
	// Object.defineProperty(MouseEvent.prototype, 'capturePolyFill', {
	// 	get: function(){
	// 		return true;
	// 	}
	// });
	Object.defineProperty(Capture, 'isPolyFill', {
		get: function(){
			return true;
		}
	});
	Object.preventExtensions(Capture);
	function docMoveHandler(e_){
		if(e_.buttons == 0){
			console.log('press the Mouse down, then use Element.SetCapture() !');
			document.releaseCapture();
			log(Capture);
			return;
		}
		// MouseEvent.prototype.captureInfo = e_;
		Capture.info = e_;
	}
	function docUpHandler(e_){
		// delete MouseEvent.prototype.captureInfo;
		// delete MouseEvent.prototype.captureTargetEle;
		Capture.info = null;
		Capture.targetEle = null;
		Capture.mouseMoveHandler = null;
		document.removeEventListener('mousemove', docMoveHandler);
		document.removeEventListener('mouseup', docUpHandler);
		//// e_.stopPropagation();
	}
	Element.prototype.setCapture = function(mouseMoveHandler){
		// MouseEvent.prototype.captureInfo = null;
		// MouseEvent.prototype.captureTargetEle = this;
		Capture.info = null;
		Capture.targetEle = this;
		Capture.mouseMoveHandler = mouseMoveHandler;
		document.addEventListener('mousemove', docMoveHandler, true);
		document.addEventListener('mouseup', docUpHandler, true);
	}
	document.releaseCapture = function(){

		/* similar to docUpHandler func */

		// delete MouseEvent.prototype.captureInfo;
		// delete MouseEvent.prototype.captureTargetEle;
		Capture.info = null;
		Capture.targetEle = null;
		Capture.mouseMoveHandler = null;
		document.removeEventListener('mousemove', docMoveHandler);
		document.removeEventListener('mouseup', docUpHandler);
	}
}else{
	// Object.defineProperty(MouseEvent.prototype, 'capturePolyFill', {
	// 	get: function(){
	// 		return false;
	// 	}
	// });
	Object.defineProperty(Capture, 'isPolyFill', {
		get: function(){
			return false;
		}
	});
	Object.freeze(Capture);
}