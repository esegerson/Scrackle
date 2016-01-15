function getBoard() {
	var rv = new Array();
	$("TABLE#board TD[data-letter]").each(function(i, td) {
		var o = {};
		o.letter = $(td).attr("data-letter");
		o.x = $(td).index(); 				//From top-left, zero-based
		o.y = $(td).closest("TR").index(); 	//From top-left, zero-based
		//Determine how much space is around letter (west, east, north, south)
		var i = 0;
		var t = o.x;
		while (t > 0 && $(td).closest("TR").find("TD").eq(--t).attr("data-letter") == undefined) i++;
		o.west = i;
		t = o.x;
		i = 0;
		while (t < 14 && $(td).closest("TR").find("TD").eq(++t).attr("data-letter") == undefined) i++;
		o.east = i;
		t = o.x;
		t = o.y;
		i = 0;
		while (t > 0 && $(td).closest("TABLE").find("TR").eq(--t).find("TD").eq(tx).attr("data-letter") == undefined) i++;
		o.north = i;
		t = o.y;
		i = 0;
		while (t < 14 && $(td).closest("TABLE").find("TR").eq(++t).find("TD").eq(tx).attr("data-letter") == undefined) i++;
		o.south = i;
		//May want to record whether triple-letter score positions are, etc.
		rv.push(o);
	});
	return rv;
}

function rankResults(lettersOnHand, results) {
	/*Return results and some data, including a score that can be sorted by
		Rules:
			Add up the points of every matched letter (Z=10)
			Subtract N for every letter you don't have to complete the word (penalty)
	*/
	var penalty = 50; //This is N in the rules
	var score = [];
	for (var i = 0; i < results.length; i++) {
		var word = results[i];
		var wordScore = {};
		wordScore.word = word;
		var t = 0;
		var p = 0;
		var loh = lettersOnHand.slice(0);
		var matched = [];
		var need = [];
		word.split("").forEach(function(c) {
			if (loh.indexOf(c) > -1) {
				t += letterPoints[c];
				loh.splice(loh.indexOf(c), 1); //Remove letter from array
				matched.push(c);
			} else {
				p+= penalty;
				need.push(c);
			}
		});
		wordScore.matchedLetters = matched.join("");
		wordScore.unusedLetters = loh.join("");
		wordScore.needLetters = need.join("");
		wordScore.pointTotal = t;
		wordScore.penalty = p;
		wordScore.score = t - p;
		wordScore.id = i;
		score.push(wordScore);
	};
	return score;
}

function getTopScores(scores, maxResults) {
	scores.sort(compareScore);
	return scores.splice(0, maxResults);
}

function compareScore(a, b) {
	//Sorts in descending order
	if (a.score > b.score) return -1;
	if (a.score < b.score) return 1;
	return 0;
}
