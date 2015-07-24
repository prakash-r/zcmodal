(function($) {
	$(window).bind("keydown",function(event){
		var k = event.keyCode;
		if(k==27){
			var modal = $zcmodal.getTopPopup();
			if(modal && modal.isCloseOnEsc()){
				modal.close();
			}
		}
		stopEventBubbling(event);
	});
	
	function stopEventBubbling(event) {
		if($.browser.msie) {
			if(event == null){
				return;
			}
			event.cancelBubble = true;
			if(event.stopPropagation){
				event.stopPropagation();
			}
		} else{
			event.stopPropagation();
		}
	};
	
	$zcmodal = {
		_modalStack: [],
		_theme : 'default',
		getTopPopup : function(){
			return this._modalStack[this._modalStack.length-1];
		},
		hasInstance : function(){
			return this._modalStack.length > 0
		}
	};
	
	function ZCModal($target,options){
		var self = this;
		this.target = $target;
		var defaults = {
				width		: null,
				height		: null,
				offsetTop	: 150,	
				showClose 	: true,
				showOnfocus	: false,
				closeOnEsc	: true,
				closeOnAnyClick	: true,
				draggable	: false,
				hideHeader	: false,
				hideFooter	: false,
				showInFullScreen : false,
				showPreloader : false,
				type		: Constants.DEFAULT_MODAL,	//choices: DEFAULT_MODAL,CLONE_MODAL,AJAX_MODAL, JIT_MODAL
				modalBody	: null, 					// set body of the modal for DEFAULT_MODAL and CLONE_MODAL type modal
				ajaxuri		: null,						// string uri for AJAX_MODAL type modal
				buildDOM	: null ,					//build custom DOM is a FUNCTION for JIT_MODAL type modal,
				buttons		: [], //[{name : "Done",type : Constants.MODAL_SUBMIT,action : function(modalBody){}},{name : "cancel",type	: Constants.MODAL_CANCEL,action	: function(){}}],			// list of buttons
				title		: null,
				bodyClass	: null,
				beforeShow	: function(modal){},	//trigger before showing modal
				beforeClose	: function(modal){},	//trigger before closing modal		
				afterClose	: function(){},			//trigger after DOM removal
			};
			
		var _options = $.extend(defaults, options);
		this.getOptions = function(){
			return _options;
		}
		this.isCloseOnEsc = function(){
			return _options.closeOnEsc;
		}
		
		this.getBeforeClose = function(){
			return _options.beforeClose;
		}
		this.getAfterClose = function(){
			return _options.afterClose;
		}
		this.open();
		
	};
	
	ZCModal.prototype.open = function(){
		var self = this, options = this.getOptions();
		this._optionCache={};
		var overlayer,target,id,index;
		
		var HTMLStr = '<div class="zcpopup '+$zcmodal._theme+((options.showInFullScreen) ? " fullscreen" : " compact" )+'"><div class="popupbox-overlay"></div><div class="popupbox-wrapper"><div class="popupbox"><div class="popupboxOuter '+(!isNull(options.bodyClass) ? options.bodyClass : '')+' " style="'+(!isNull(options.width) ? "width:"+options.width+"px;": '')+(!isNull(options.height) ? "height:"+options.height+"px;": '')+'">';
		if(!isNull(options.title)){
		   HTMLStr += '<div class="popupHeader"><span>'+options.title+'</span></div>';
		}
		if(options.showClose){
		    HTMLStr += '<span class="popupClose"><i class="fa fa-close"></i></span>';
		}
		HTMLStr += '<div class="popupConentContainer"></div>';
		if(options.buttons.length > 0){
		    HTMLStr += '<div class="popupFooter">';
		    for (var i=0, len=options.buttons.length; i<len; i++) {
		        var button = options.buttons[i];
		        HTMLStr += '<a id="'+button.name+'" class="'+((button.type == Constants.MODAL_SUBMIT)? 'zc-live-primary-btn' : 'zc-live-secondary-btn' )+'" href="#">'+button.name+'</a>'
		    }
		    HTMLStr += '</div>';    
		}
		HTMLStr += '</div></div></div></div>';
		
		self.$overlay = $(HTMLStr);
		
		function validateModal(){
			switch(options.type){
				case Constants.DEFAULT_MODAL:
				case Constants.CLONE_MODAL:
						if(isNull(options.modalBody)){
							throw new MissingProperty("modalBody for "+((options.type == Constants.DEFAULT_MODAL) ? 'DEFAULT_MODAL' : 'CLONE_MODAL')+" modal");
						}
						break;
				case Constants.AJAX_MODAL:
						if(isNull(options.ajaxuri)){
							throw new MissingProperty("ajaxuri for AJAX MODAL");
						}
						break;
				case Constants.JIT_MODAL:
						if(isNull(options.buildDOM)){
							throw new MissingProperty("buildDOM for JIT_MODAL");
						}else if(typeof options.buildDOM() == "undefined"){
							throw new Error("buildDOM : function(){} should return HTML DOM");
						}
						break;
			}
			var buttonUsage = "\n Button Usage: \n{ \n\t name : //Name and value of button (STRING),\n\t type : //Type of button <Choices :Constants.MODAL_SUBMIT,Constants.MODAL_CANCEL,Constants.MODAL_BUTTON> (INTEGER),\n\t action : //action execute on click of this button (FUNCTION)\n}";
			var buttons = options.buttons;
			for (var i=0, len=buttons.length; i<len; i++) {
				var button = buttons[i];
				if(isNull(button.name) || isNull(button.type) || isNull(button.action)){
					throw new MissingProperty("for button "+button+buttonUsage);
				}else if(isNaN(button.type)){
					throw new InvalidProperty("Button.type for button : "+button+buttonUsage)
				}
				else if(!isFunction(button.action)){
					throw new InvalidProperty("Button.action for button : "+button+buttonUsage)
				}
			}
			var intOptions = ["width","height","offsetTop","type"];
			for (var i=0, len=intOptions.length; i<len; i++) {
				if(isNaN(options[intOptions[i]])){
					throw new InvalidProperty(intOptions[i]);
				}
			}
			var boolOptions = ["showClose","closeOnEsc","closeOnAnyClick","draggable","hideHeader","hideFooter","showOnfocus"];
			for (var i=0, len=boolOptions.length; i<len; i++) {
				if(options[boolOptions[i]].constructor != Boolean){
					throw new InvalidProperty(boolOptions[i]);
				}
			}
			var funOptions = ["beforeShow","beforeClose","afterClose"];
			for (var i=0, len=funOptions.length; i<len; i++) {
				if(!isFunction(options[funOptions[i]])){
					throw new InvalidProperty(funOptions[i]);
				}
			}
		}
		
		function buildDOM(){
			self.$body = $(document.body);
			self._optionCache.bodySource = self.target;
			self.$container = self.$overlay.find(".popupbox-wrapper");
			switch(options.type){
				case Constants.DEFAULT_MODAL:
				case Constants.CLONE_MODAL:
						self.$modalBody = (isNull(self.target)) ? self.$container.find('.popupConentContainer').html() : (options.type != Constants.CLONE_MODAL) ? $(self.target).html() : $($(self.target).html()).clone();
						break;
				case Constants.AJAX_MODAL:
						self.$modalBody="";
						$.ajax({
							beforeSend : function(){
								if(options.showPreloader){
									LIB._startLoading();
									this.async = true;
								}
							},
							url :options.ajaxuri,
							type : "GET",
							async : false,
							success:function(response, status, xhr){
								self.$modalBody = response;
								if(options.showPreloader){
									self.setBody(response);
									LIB._stopLoading();
								}
							}
						});
						break;
				case Constants.JIT_MODAL:
						self.$modalBody = options.buildDOM();
						break;
			}
			var containerStyle = (self.$container[0]).style;
			containerStyle.visibility = "visible";
			
	        	self.$overlay.find(".popupConentContainer")[0].innerHTML = self.$modalBody;
			if(options.showInFullScreen){
	        		$('#zc-component').append(self.$overlay)
	        	}else{
	        		self.$body.append(self.$overlay);	
	        	}
		}
		
		
		function addButtonEvent(button){
			self.$container.find("a[id="+button.name+"]").bind("click", function(e) {
				e.preventDefault();
				if(button.action){
					if(!(button.action)(self.getBody())){
						self.close();
					}
				}else{
					self.close();
				}
				if(button.type == Constants.MODAL_SUBMIT){
					self.$container.trigger("confirm");
				}else{
					self.$container.trigger("cancel");
				}
			});
		}
		
		function addEventListeners(){
			
			$((self.$container[0]).getElementsByClassName("popupClose")).bind("click", function(e) {
				e.preventDefault();
				self.close();
			});
			
			$(self.$container).click(function(e){
				e.stopPropagation();
			});
			
			if(options.closeOnAnyClick){
				(self.$overlay).find('.popupbox-wrapper').bind("click", function(e) {
					e.preventDefault();
					self.close();
				});
			}
			
			(self.$overlay).find('.popupboxOuter').bind("click", function(e) {
				stopPropogation(e);
			});
			
			if(options.draggable && !options.showInFullScreen){
				self.$container.draggable({
					handle 		: '.popupboxOuter',
					containment : 'document',
					cursor 		: 'move'
				});
			}
			
			var buttons = options.buttons;
			for (var i=0, len=buttons.length; i<len; i++) {
				addButtonEvent(buttons[i]);
			}
		}
		
	//	validateModal();
		buildDOM();
		addEventListeners();
		lockScreen();
		
		(options.beforeShow)(self.$container.find('.popupConentContainer'));	// Calling before show modal window
		
		self._optionCache.type = options.type;
		self.$overlay.show().data(self);
		self.index = $zcmodal._modalStack.push(self) - 1;
		self.$overlay.show();
		setTimeout(function() {
	    	self.$body.addClass("zcmodal_active");
	    	self.$container.trigger("opened");
	}, ($zcmodal.hasInstance() ? 0 : 50));
	
	};
	
	ZCModal.prototype.setBody = function(innerHTMl) {
		var self = this;
		self.$overlay.find(".popupConentContainer").fadeIn('slow',function(){
				$(this).html(innerHTMl);
		});
	}
	ZCModal.prototype.getBody = function(){
		return this.$overlay.find(".popupConentContainer");
	}
	
	ZCModal.prototype.close = function() {
		var self = this;
		this.$container.trigger("close");
		var beforeCloseReturn = (self.getBeforeClose())(self.$container.find('.popupConentContainer'));
		if (beforeCloseReturn != false) {
			
			if(this.index != undefined){
				$zcmodal._modalStack.splice(this.index, 1);
			}
			if(!$zcmodal.hasInstance()){
				$(document.body).removeClass("zcmodal_active");
				unlockScreen();
			}
			self.$overlay.hide();
			self.$overlay.remove();
			(self.getAfterClose())();
		}
		
	};
	
	
	function lockScreen(){
		var bodystyle = document.body.style, paddingRight = parseInt(bodystyle.paddingRight, 10) + getScrollbarWidth();
		bodystyle.paddingRight = paddingRight + "px";
		$(document.body).addClass("zcmodal_lock");
	}
	
	function unlockScreen(){
		var bodystyle = document.body.style, paddingRight = parseInt(bodystyle.paddingRight, 10) - getScrollbarWidth();
		bodystyle.paddingRight = paddingRight + "px";
		$(document.body).removeClass("zcmodal_lock");
	}
	
	function getScrollbarWidth() {
		if ($(document.body).height() <= $(window).height()) {
		    return 0;
		}
		var outer = document.createElement("div"),inner = document.createElement("div"),widthNoScroll,widthWithScroll;
		
		outer.style.visibility = "hidden";
		outer.style.width = "100px";
		document.body.appendChild(outer);
		widthNoScroll = outer.offsetWidth;
		outer.style.overflow = "scroll";
		
		inner.style.width = "100%";
		outer.appendChild(inner);
		widthWithScroll = inner.offsetWidth;
		
		outer.parentNode.removeChild(outer);
		return widthNoScroll - widthWithScroll;
	}
	
	$.fn.zcmodal = function(opts) {
		var instance = new ZCModal(this, opts);
		$(this).data("zcmodal", instance.index);
		return instance;
	};
	$.zcmodal = function(opts) {
		var instance = new ZCModal(undefined, opts);
		return instance;
	};
})(window.jQuery);	
