function translateTo() {
	const selectElement = document.getElementById('outputs');
	let input = document.querySelector('#input-area').value;
	let parser = new Parser;
	let tokens = parser.tokenize(input);
	let cursor = {index: 0};
	let root = parser.parseMarkdownDocumentItem(tokens, cursor);
	let option = selectElement.value;
	if (option == "html") {
		document.querySelector('#output-area').innerHTML = root.toHTML();
				
	} else if(option == "Wikimedia") {
		document.querySelector('#output-area').innerHTML = root.toWikimedia();
	} else {
		alert("Please pick an option");
	}	
}

function eraseText() {
	document.getElementById("output-area").value = "";
}
document.getElementById("download-button").onclick = function() {
	let content = document.getElementById('output-area').value;
	window.open("data:application/text," + encodeURIComponent(content), "_self");
}