// functions releated to input (mouse, keyboard)

pg.input = function() {
	
	var downKeys = [];
	var mouseIsDown = false;
	
	var setup = function () {
		setupKeyboard();
		setupMouse();
	};
	
	var setupKeyboard = function() {
			
		$(document).unbind('keydown').bind('keydown', function (event) {
			
			console.log('key', event.keyCode);
			
			if(!isKeyDown(event.keyCode)) {
				storeDownKey(event.keyCode);
			}
			
			// ctrl-c / copy
			if (event.keyCode === 67 && event.ctrlKey) {
				// only use the clipboard stuff if no text or input text is selected
				if(!textIsSelected() && !userIsTyping(event)) {
					pg.edit.copySelectionToClipboard();
				}
			}
			
			// ctrl-v / paste
			if (event.keyCode === 86 && event.ctrlKey) {
				// only use the clipboard stuff if no text or input text is selected
				if(!textIsSelected() && !userIsTyping(event)) {
					pg.edit.pasteObjectsFromClipboard();
				}
			}
			
			// ctrl-a / select all
			if (event.keyCode === 65 && event.ctrlKey) {
				if(!textIsSelected() && !userIsTyping(event)) {
					event.preventDefault();
					pg.selection.selectAll();
					paper.view.update();
				}
			}
			
			// ctrl-g / group
			if (event.keyCode === 71 && event.ctrlKey && !event.shiftKey) {
				event.preventDefault();
				pg.group.groupSelection();
			}
			
			// ctrl-shift-g / ungroup
			if (event.keyCode === 71 && event.ctrlKey && event.shiftKey) {
				event.preventDefault();
				pg.group.ungroupItems(pg.selection.getSelectedItems());
			}
			
			
			// ctrl-1 / reset view to 100%
			if ((event.keyCode === 97 || 
				 event.keyCode === 49) &&
				 event.ctrlKey && 
				 !event.shiftKey) {
			 
				event.preventDefault();
				pg.view.resetZoom();
			}
			
			// ctrl-z / undo
			if ((event.keyCode === 90) && event.ctrlKey && !event.shiftKey) {
				event.preventDefault();
				pg.undo.undo();
			}
			
			// ctrl-shift-z / undo
			if ((event.keyCode === 90) && event.ctrlKey && event.shiftKey) {
				event.preventDefault();
				pg.undo.redo();
			}
			
			// backspace / stop browsers "back" functionality
			if(event.keyCode === 8 && !userIsTyping(event)) {
				event.preventDefault();
			}
			
			
			// everything after this is blocked by mousedown!
			if(mouseIsDown) return;


			// alt
			if(event.keyCode === 18) {
				event.preventDefault();
			}
			
			// esc
			if(event.keyCode === 27) {
				pg.style.blurInputs();
			}
				
			// space / pan tool
			if(event.keyCode === 32 && !userIsTyping(event)) {
				event.preventDefault();
				pg.toolbar.switchTool(pg.tools.newToolByName('ViewGrab'));
			}
		});
				

		$(document).keyup(function( event ) {
			
			// remove event key from downkeys
			var index = downKeys.indexOf(event.keyCode);
			if(index > -1) {
				downKeys.splice(index, 1);
			}

			
			// alt
			if(event.keyCode === 18) {
				// if viewZoom is active and we just released alt,
				// reset tool to previous
				if(pg.toolbar.getActiveTool().options.name === 'ViewZoom') {
					pg.toolbar.switchTool(pg.toolbar.getPreviousTool());
				}
			}
			
			if(userIsTyping(event)) return;
			
			
			// space : stop pan tool on keyup
			if(event.keyCode === 32) {
				if(!isModifierKeyDown(event)) {
					event.preventDefault();
					pg.toolbar.switchTool(pg.toolbar.getPreviousTool());
				}
			}
			
			if(mouseIsDown) return;
			if(isModifierKeyDown(event)) return;
			
			
			// ----------------------------------------
			// keys that don't fire if modifier key down or mousedown or typing
			
			// backspace, delete : delete selection
			if(event.keyCode === 8 || event.keyCode === 46) {
				pg.selection.deleteSelection();
			}
			
			// x : switch color
			if(event.keyCode === 88) {
				pg.style.switchColors();
			}
			
			// v : select tool
			if(event.keyCode === 86) {
				pg.toolbar.switchTool(pg.tools.newToolByName('Select'));
			}
			
			// a : fine select tool
			if(event.keyCode === 65) {
				pg.toolbar.switchTool(pg.tools.newToolByName('DetailSelect'));
			}
			
			// p : pen/bezier tool
			if(event.keyCode === 80) {
				pg.toolbar.switchTool(pg.tools.newToolByName('Bezier'));
			}
			
			// r : rotate tool
			if(event.keyCode === 82) {
				pg.toolbar.switchTool(pg.tools.newToolByName('Rotate'));
			}
			
			// s : scale tool
			if(event.keyCode === 83) {
				pg.toolbar.switchTool(pg.tools.newToolByName('Scale'));
			}
			
			// t : text tool
			if(event.keyCode === 84) {
				pg.toolbar.switchTool(pg.tools.newToolByName('Text'));
			}
			
			// i : eyedropper tool
			if(event.keyCode === 73) {
				pg.toolbar.switchTool(pg.tools.newToolByName('Eyedropper'));
			}
			
			// z : zoom tool
			if(event.keyCode === 90) {
				pg.toolbar.switchTool(pg.tools.newToolByName('Zoom'));
			}
		});
		
	};
	
	
	var storeDownKey = function(keyCode) {
		if(downKeys.indexOf(keyCode) < 0) {
			downKeys.push(keyCode);
		}
	};
	
	
	var isMouseDown = function() {
		return mouseIsDown;
	};
	
	
	var isKeyDown = function(keyCode) {
		if(downKeys.indexOf(keyCode) < 0) {
			return false;
		} else {
			return true;
		}
	};
	
	
	var isModifierKeyDown = function(event) {
		if( event.altKey || 
			event.shiftKey || 
			event.ctrlKey || 
			(event.ctrlKey && event.altKey)) {
			return true;
		} else {
			return false;
		}
	};
	

	var textIsSelected = function() {
		if (window.getSelection().toString()) {
			return true;
		}
		if(document.selection && document.selection.createRange().text) {
			return true;
		}

		return false;
	};


	var userIsTyping = function(event) {		
		var d = event.srcElement || event.target;
		if ((d.tagName.toUpperCase() === 'INPUT' &&
			(
				d.type.toUpperCase() === 'TEXT' ||
				d.type.toUpperCase() === 'PASSWORD' ||
				d.type.toUpperCase() === 'FILE' || 
				d.type.toUpperCase() === 'EMAIL' ||
				d.type.toUpperCase() === 'SEARCH' ||
				d.type.toUpperCase() === 'DATE' ||
				d.type.toUpperCase() === 'NUMBER' )
			)
		|| d.tagName.toUpperCase() === 'TEXTAREA') {
			return true;
		}
		return false;
	};

	
	
	// mouse stuff

	var setupMouse = function() {

		$('body').on('mousedown', function (e) {
			if ((e.which === 1)) { //left
				mouseIsDown = true;
			}
			if ((e.which === 3)) { // right
				
			}
			if ((e.which === 2)) { //middle
				
			}
			
			
		}).on('mouseup', function(e) {
			if ((e.which === 1)) { // left
				mouseIsDown = false;
			}
			if ((e.which === 2)) { // middle
				
			}
			if((e.which === 3)) { //right
				
			}

		}).on('contextmenu', function (e) {
			e.preventDefault();
			pg.menu.showContextMenu(e);
		});
		

		$(window).bind('mousewheel DOMMouseScroll', function(event){
			if(event.altKey) {
				if (pg.toolbar.getActiveTool().name !== 'ViewZoom') {
					pg.toolbar.switchTool(pg.tools.newToolByName('ViewZoom'));
				}
				//console.log(pg.toolbar.activeTool);
				if(pg.toolbar.getActiveTool()) {
					pg.toolbar.getActiveTool().updateTool(event);
				}
			}
		});
	};
	
	
	return {
		isMouseDown: isMouseDown,
		setup: setup,
		isModifierKeyDown: isModifierKeyDown,
		userIsTyping: userIsTyping,
		textIsSelected: textIsSelected,
	};
		
}();

