
var etsy = new Etsy();
// etsy.getRequest('listings', 'listings/trending', {'limit': 18, 'offset': 0});
etsy.getRequest('trending', undefined, undefined, 0, undefined);

// Keycode arrays. Index of key corresponds with index of cell in hover-row
var linkListKeyCodes          = [49,50,51,52,53,54];
var tableFirstColumnKeyCodes  = [81,87,69,82,84,89];
var tableSecondColumnKeyCodes = [65,83,68,70,71,72];
var tableThirdColumnKeyCodes  = [90,88,67,86,66,78];
var nextProductPageKeyCodes   = [85,74,77];

var contextMessage = new SpeechSynthesisUtterance();


// Assigns click handler to cells (effect differs based on cell type)
$('body').keydown(function(e) {
	// find which hover-row had a cell pressed
	var kc = e.which || e.keyCode;
	// find out whether UI is showing Table or ProductTable (because no arrow control / activation on latter)
	// AND is located on select conditionals (does not apply to LinkList)
	var isNotProductTable = $('.hover-row:nth-child(3)').children().length;
	var isSearch = $('#search input:focus').length;
	console.log(isNotProductTable);
	// don't collect data on pause (except for upause)
	if (!log.paused) {
		// all key functionality doesn't hold for typing in search box
		if (!isSearch) {
			if (linkListKeyCodes.indexOf(kc) > -1) {
				activateCategoryCell(kc);
			} else if (tableFirstColumnKeyCodes.indexOf(kc) > -1 && isNotProductTable) {
				activateTableCell(kc, 2);
			} else if (tableSecondColumnKeyCodes.indexOf(kc) > -1 && isNotProductTable) {
				activateTableCell(kc, 3);
			} else if (tableThirdColumnKeyCodes.indexOf(kc) > -1 && isNotProductTable) {
				activateTableCell(kc, 4);
			} else if (nextProductPageKeyCodes.indexOf(kc) > -1 && isNotProductTable) {
				activateNextPageCell(kc);
			} else if (kc === 192) { // grave accent (back button)
				// reset categories in base case (from first page) or going back to first page
				if (etsy.requestHistory.length > 1) {
					// giveContext('back'); // hover executes it
					// last element of etsy.requestHistory is the current call, so pop it
					etsy.requestHistory.pop();
					// previous call from this page is now last element, so send new request with popped element
					var pr = etsy.requestHistory.pop();
					// this request will add it back into history again; next back call will remove it
					etsy.getRequest(pr.type, pr.uri, pr.productIndex, pr.offset, pr.keywords);
				}
				log.logInteraction(kc, 'press', 'back');
			} else if (kc === 16) { // press shift to set focus to search bar
				$('#search input').focus();
				// alert user of search
				giveContext('search');
				log.logInteraction(kc, 'press', 'focus search');
			} else if (kc === 27) { // press escape to pause
				log.paused = !log.paused;
				giveContext('pause');
				log.logInteraction(kc, 'press', 'pause');
			} else if (kc === 39) { // press right arrow to end task
				log.logInteraction(kc, 'press', 'end task');
			} else {
				// log any other key presses as well
				log.logInteraction(kc, 'press', 'unmapped');
			}
		} else {
			if (kc === 13) { // enter to search
				var searchString = $('#search input').val().replace(/\s+/g, '%20');
				console.log(searchString);
				$('#search input').val('');
				// etsy.getRequest('listings', 'listings/active', {'limit': 18, 'offset': 0, 'keywords': searchString});
				etsy.getRequest('search', 'listings/active', undefined, 0, searchString);
				giveContext('search');
				// remove focus from input so user can use site again
				$('#search input').blur();
				log.logInteraction(kc, 'press', 'search');
			} else if (kc === 16) { // press shift again to unfocus search
				$('#search input').blur();
				// alert user of un-search
				giveContext('page'); // this message may be unclear
				log.logInteraction(kc, 'press', 'unfocus search');
			} else if (kc === 27) { // press escape to pause
				log.paused = !log.paused;
				giveContext('pause');
				log.logInteraction(kc, 'press', 'pause');
			} else {
				// say current key when pressed
				giveContext(kc);
			}
			// DON'T ALLOW END TASK ON SEARCH BAR (users might use arrow keys to fix typos)
		}
	} else {
		if (kc === 27) { // press escape to unpause
			log.paused = !log.paused;
			giveContext('unpause');
			log.logInteraction(kc, 'press', 'unpause');
		}
	}
	
	
	// cancel speech because cell won't contain same content
	// speechSynthesis.cancel();
});

// note: fromCharCode doesn't handle everything, so I'm not using it to log data. It may still be helpful
// for post-processing though
function giveContext(action) {
	if (typeof action == 'number') {
		contextMessage.text = String.fromCharCode((96 <= action && action <= 105)? action-48 : action);
	} else {
		contextMessage.text = action;
	}
	speechSynthesis.speak(contextMessage);
}

function activateTableCell(kc, nthChild) {
	var ckc;
	if (nthChild === 2) {
		ckc = tableFirstColumnKeyCodes;
	} else if (nthChild === 3) {
		ckc = tableSecondColumnKeyCodes;
	} else if (nthChild === 4) {
		ckc = tableThirdColumnKeyCodes;
	}
	var cell = $('.hover-row:nth-child('+nthChild+') .cell:nth-child('+(1+ckc.indexOf(kc))+')');
	console.log(cell);
	// log interaction
	var text = cell.data('title') + '  ' + cell.data('price');
	log.logInteraction(kc, 'press', text);
	etsy.getRequest(undefined, undefined, cell.data('product_index'), undefined, undefined);
	// etsy.getRequest('product', 'listings/'+cell.data('listing_id'), {});
}

/*
 * Moving logic to external function to make keydown handler less awful
 */
function activateCategoryCell(kc) {
	var cell = $('.hover-row:first-child .cell:nth-child('+(1+linkListKeyCodes.indexOf(kc))+')');
	var text = cell.data('name');
	log.logInteraction(kc, 'press', text);
	etsy.getRequest(cell.data('name'), undefined, undefined, 0, undefined);
	// etsy.getRequest('listings', 'listings/active', {'limit': 18, 'offset': 0, 'category': cell.data('name')});
}

function activateNextPageCell(kc) {
	// send previous Etsy request with an updated offset
	giveContext('next page');
	var lastRequest = etsy.requestHistory[etsy.requestHistory.length-1];
	log.logInteraction(kc, 'press', 'next page');
	etsy.getRequest(lastRequest.type, lastRequest.uri, lastRequest.productIndex, lastRequest.offset+18, lastRequest.keywords);
	// etsy.getRequest(lastRequest.purpose, lastRequest.uri, newParameters);
}


// Search //
$('#search input').focus(function() {
	// Message about turning off Fingers
});
$('#search form').submit(function(e) {
	e.preventDefault();
})



