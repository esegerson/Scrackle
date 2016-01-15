//Scrackle main

var dictionary = [];
var letterDistribution = "  EEEEEEEEEEEEAAAAAAAAAIIIIIIIIIOOOOOOOONNNNNNRRRRRRTTTTTTLLLLSSSSUUUUDDDDGGGBBCCMMPPFFHHVVWWYYKJXQZ";
var letterPoints = {
	E: 1, A: 1, I: 1, O: 1, N: 1, R: 1, T: 1, L: 1, S: 1, U: 1,
	D: 2, G: 2,
	B: 3, C: 3, M: 3, P: 3,
	F: 4, H: 4, V: 4, W: 4, Y: 4,
	K: 5,
	J: 8, X: 8,
	Q: 10, Z: 10
};
var lettersInBag = letterDistribution.split("");

$(function() {
	//Page load
	initBoard();
	$("#tray TD:first-child").addClass("select");
	$(window).on("resize", resize);
	$("#tray TD").click(function(e) {
		$("#board TD, #tray TD").removeClass("select");
		var td = e.target;
		if (!$(td).is("TD")) td = $(td).closest("TD");
		$(td).addClass("select");
	});
	$("#board TD").click(function(e) {
		$("#board TD, #tray TD").removeClass("select");
		var td = e.target;
		if (!$(td).is("TD")) td = $(td).closest("TD");
		$(td).addClass("select");
	});
	$(window).on("keydown", detectKeys);
	
	$.get("dictionaries/TWL06.txt", function(data) {
		dictionary = data.split("\r\n");
	}, "text").error(function(jqXHR, textStatus, errorThrown) { alert(errorThrown); });
	
	updateBag();
});

function initBoard() {
	//Board is 15x15 table with specific tiles having certain rules
	var squareType = { 
		Normal: 			0, 
		Start: 				1, 
		DoubleLetterScore: 	2, 
		TripleLetterScore: 	3, 
		DoubleWordScore: 	4, 
		TripleWordScore: 	5 
	};
	
	var board = [
		[5,0,0,2,0,0,0,5,0,0,0,2,0,0,5],
		[0,4,0,0,0,3,0,0,0,3,0,0,0,4,0],
		[0,0,4,0,0,0,2,0,2,0,0,0,4,0,0],
		[2,0,0,4,0,0,0,2,0,0,0,4,0,0,2],
		[0,0,0,0,4,0,0,0,0,0,4,0,0,0,0],
		[0,3,0,0,0,3,0,0,0,3,0,0,0,3,0],
		[0,0,2,0,0,0,2,0,2,0,0,0,2,0,0],
		[5,0,0,0,0,0,0,1,0,0,0,0,0,0,5],
		[0,0,2,0,0,0,2,0,2,0,0,0,2,0,0],
		[0,3,0,0,0,3,0,0,0,3,0,0,0,3,0],
		[0,0,0,0,4,0,0,0,0,0,4,0,0,0,0],
		[2,0,0,4,0,0,0,2,0,0,0,4,0,0,2],
		[0,0,4,0,0,0,2,0,2,0,0,0,4,0,0],
		[0,4,0,0,0,3,0,0,0,3,0,0,0,4,0],
		[5,0,0,0,0,0,0,5,0,0,0,0,0,0,5]
	];
		
	var b = $("#board")[0];
	board.forEach(function(e, i) {
		var row = document.createElement("tr");
		e.forEach(function(cellType, j) {
			var cell = document.createElement("td");
			var css = "";
			switch(cellType) {
				case 1: css = "start"; break;
				case 2: css = "dls"; break;
				case 3: css = "tls"; break;
				case 4: css = "dws"; break;
				case 5: css = "tws"; break;
			}
			if (css != "") $(cell).addClass(css);
			row.appendChild(cell);
		});
		b.appendChild(row);
	});
	
	$(".start").attr("title", "Start");
	$(".dls").append("Double Letter Score").attr("title", "Double Letter Score");
	$(".tls").append("Triple Letter Score").attr("title", "Triple Letter Score");
	$(".dws").append("Double Word Score").attr("title", "Double Word Score");
	$(".tws").append("Triple Word Score").attr("title", "Triple Word Score");
}

function resize() {
	if (window.innerWidth < 1000) {
		$(".dls, .tls, .dws, .tws").each(function(i, o) {
			var v = $(o).text();
			if (v.length > 3) {
				v = v.replace(/[a-z ]/g, "");
				$(o).text(v);
			}
		});
	} else {
		$(".dls, .tls, .dws, .tws").each(function(i, o) {
			var v = $(o).text();
			if (v.length == 3) $(o).text($(o).attr("title"));
		});
	}
}

function drawTrayLetter(traySlot, letter) {
	if (letter == "") {
		$(traySlot).html("").removeAttr("data-letter");
	} else {
		var letterVal = letterPoints[letter];
		if (typeof letterVal === "undefined") letterVal = "";
		$(traySlot).html(letter + "<sub>" + letterVal + "</sub>").attr("data-letter", letter);
	}
	var score = 0;
	getTrayLetters().forEach(function(l) {
		if (letterPoints[l] != undefined) score += letterPoints[l];
	});
	$("#score").text(score);
}

function selectNext() {
	if ($(".select").next().length > 0)
		$(".select").removeClass("select").next().addClass("select");
}

function selectPrev() {
	if ($(".select").prev().length > 0)
		$(".select").removeClass("select").prev().addClass("select");
}

function getTrayLetters() {
	var letters = [];
	$("#tray TD[data-letter]").each(function(i, o) { 
		var l = $(o).attr("data-letter");
		if (l != undefined && l != " ") letters.push(l);
	});
	return letters;
}

function updateSuggestions() {
	var letters = getTrayLetters();	
	if (letters.length < 7) {
		$("#suggestions").html("");
		return;
	}
	//var sugs = suggestAll(letters);
	var scores = rankResults(letters, dictionary);
	scores = getTopScores(scores, 49);
	$("#suggestions").html(formatResults(scores, letters));
	$("#suggestions LI").click(sortTray);
	$("#suggestions LI").click(selectResult);
	//$("#suggestions").html("<ul><li>" + sugs.join("</li><li>") + "<span></span></li></ul>");
	//$("#suggestions LI").each(function(i, o) { highlightLetters(letters, o); });
}

function highlightLetters(word, lettersOnHand) {
	var loh = lettersOnHand.slice(0);
	var lettersFound = [ ]; //Letters in lettersOnHand
	var result = "";
	word.split("").forEach(function(c) {
		if (loh.indexOf(c) > -1) {
			result += "<b>" + c + "</b>";
			loh.splice(loh.indexOf(c), 1); //Remove letter from array
			lettersFound.push(c);
		} else {
			result += c;
		}
	});
	return result; 
}

function detectKeys(e) {
	var key = e.which;
	if (key >= 65 && key <= 90 || key == 32) {
		var letter = String.fromCharCode(key).toUpperCase();
		if (removeLetterFromBag(letter)) {
			var oldLetter = $("TD.select").first().attr("data-letter");
			if (oldLetter != undefined)
				lettersInBag.push(oldLetter);
			drawTrayLetter($("TD.select").first(), letter);
			if ($("TD.select").length == 0) $("#tray TD:first-child").addClass("select");
			selectNext();
			updateSuggestions();
		}
		return false; //Prevent spacebar from scrolling
	} else if ((key == 8 || key == 46) && $("TD.select[data-letter]").length == 1) {
		//Clear slot (backspace, delete)
		var td = $("TD.select");
		addLetterToBag($(td).first().attr("data-letter"));
		$(td).first().text("").removeAttr("data-letter");
		updateSuggestions();
		drawTrayLetter($(td).first(), "");
		if ($(td).closest("#board").length == 1) {
			//Replace words if is a colored square
			var txt = "";
			if ($(td).hasClass("dls")) txt = "Double Letter Score";
			if ($(td).hasClass("tls")) txt = "Triple Letter Score";
			if ($(td).hasClass("dws")) txt = "Double Word Score";
			if ($(td).hasClass("tws")) txt = "Triple Word Score";
			$(td).text(txt);
			
		}
	} else if (key == 27) {
		//Esc, deselect
		$(".select").removeClass("select");
	} else if (key == 37) {
		//Left arrow
		if ($("TD.select").length == 0) $("#tray TD:first-child").addClass("select");
		selectPrev();
	} else if (key == 39) {
		//Right arrow
		if ($("TD.select").length == 0) $("#tray TD:first-child").addClass("select");
		selectNext();
	} else if (key == 40 && $("#board TD.select").length == 1 && $("#board TD.select").closest("TR").is(":not(:last-child)")) {
		//Down arrow
		var i = $("#board TD.select").index();
		$("#board TD.select").removeClass("select").closest("TR").next().find("TD").eq(i).addClass("select");
		return false; //Prevent scroll
	} else if (key == 38 && $("#board TD.select").length == 1 && $("#board TD.select").closest("TR").is(":not(:first-child)")) {
		//Up arrow
		var i = $("#board TD.select").index();
		$("#board TD.select").removeClass("select").closest("TR").prev().find("TD").eq(i).addClass("select");			
		return false; //Prevent scroll
	} else if (key == 9) {
		//Tab or shift+tab
		if ($("TD.select").length == 0) $("#tray TD:first-child").addClass("select");
		if (e.shiftKey) {
			selectPrev();
		} else {
			selectNext();
		}
		return false; //Prevent tab from doing stuff
	} 
}

function removeLetterFromBag(letter) {
	if (lettersInBag.indexOf(letter) == -1) return false;
	lettersInBag.splice(lettersInBag.indexOf(letter), 1); //Remove from array
	updateBag();
	return true;
}

function addLetterToBag(letter) {
	if (letter == undefined) return;
	lettersInBag.push(letter);
	updateBag();
}

function updateBag() {
	var html = "";
	lettersInBag.sort();
	lettersInBag.forEach(function(c) {
		var p = letterPoints[c];
		if (p == undefined) p = "";
		html += "<span>" + c + "<sub>" + p + "</sub></span> ";
	});
	$("#bag > DIV").html(html);
}

function formatResults(results, lettersOnHand) {
	var html = "<ul>";
	results.forEach(function(o) {
		html += "<li title='Points = " + o.pointTotal + "'>" 
			+ highlightLetters(o.word, lettersOnHand) 
			+ "<span><span>" + o.unusedLetters + "</span></span>"
			+ "</li>";
	});
	html += "</ul>";
	return html;
}

Array.prototype.move = function(oldIndex, newIndex) {
	if (newIndex >= this.length) {
		var k = newIndex - this.length;
		while ((k--) + 1) {
			this.puch(undefined);
		}
	}
	this.splice(newIndex, 0, this.splice(oldIndex, 1)[0]);
	return this;
}

function sortTray(e) {
	var li = e.target;
	if (!$(e.target).is("LI")) li = $(e.target).closest("LI");
	var letters = getTrayLetters();
	var matchedLettersInOrder = $("B", li).text();
	var traySlots = $("#tray TD");
	matchedLettersInOrder.split("").forEach(function(c, i) {
		//drawTrayLetter(traySlots[i], c);
		letters = letters.move(letters.indexOf(c), i);
	});
	letters.forEach(function(c, i) {
		drawTrayLetter(traySlots[i], c);
	});
}

function selectResult(e) {
	var li = e.target;
	
}