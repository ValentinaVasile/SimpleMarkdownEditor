class Item {
	toPlainString(indent) {
		throw new Error('You have to implement the method toPlainString!');
	}
	toHTML() {
		throw new Error('You have to implement the method toHTML!');
	}	
	toWikimedia() {
		throw new Error('You have to implement the method toWikimedia!');
	}	
}

class TextItem extends Item {

}

class BoldTextItem extends TextItem {
	constructor(text) {
		super();
		this.text = text;
	}
	toPlainString(indent) {
		return '**' + this.text + '**';
	}
	toHTML() {
		return '<strong>' + this.text + '</strong>';
	}
	toWikimedia() {
		return  "'''" + this.text + "'''";
	}		
}

class PlainTextItem extends TextItem {
	constructor(text) {
		super();
		this.text = text;
	}
	toPlainString(indent) {
		return this.text;
	}
	toHTML() {
		return this.text;
	}
	toWikimedia() {
		return this.text;
	}		

}

class NewLineItem extends TextItem {
	constructor() {
		super();
	}
	toPlainString(indent) {
		return '\n' + '\t'.repeat(indent);
	}
	toHTML() {
		return '\n';
	}	
	toWikimedia() {
		return '\n';
	}	
}

class DocumentItem extends Item {
	
}

class TitleItem extends Item {
	constructor(level, text) {
		super();
		this.level =  level;
		this.text = text;
	}
	toPlainString(indent) {
		let hashes = '\n' + '\t'.repeat(indent);
		for (let i = 0; i < this.level; i++) {
			hashes += '#';
		}
		return hashes + this.text + '\n' + '\t'.repeat(indent + 1);
	}
	toHTML() {
		return '<h' + this.level + '>' + this.text + '</h' + this.level + '>';
	}
	toWikimedia() {
		return '='.repeat(this.level) + this.text + '='.repeat(this.level);
	}
}

class SectionDocumentItem extends DocumentItem {
	constructor(titleItem, level, documentItems) {
		super();	
		this.titleItem = titleItem;	
		this.documentItems = documentItems;
		this.level = level;
	}
	toPlainString(indent) {
		let result = this.titleItem.toPlainString(indent);
		this.documentItems.forEach(element => {
			result += element.toPlainString(indent + 1);
		});
		return result;		
	}
	toHTML() {
		let result = this.titleItem.toHTML();
		this.documentItems.forEach(element => {
			result += element.toHTML();
		});
		return '<section>' + result + '</section>';		
	}
	toWikimedia() {
		let result = this.titleItem.toWikimedia();
		this.documentItems.forEach(element => {
			result += element.toWikimedia();
		});
		return result ;		
	}		
	
}

class ParagraphDocumentItem extends DocumentItem{
	constructor(textItems) {
		super();
		this.textItems = textItems;
	}
	toPlainString(indent) {
		let result = '';
		this.textItems.forEach(element => {
			result += element.toPlainString(indent);
		});
		return result;		
	}
	toHTML() {
		let result = '';
		this.textItems.forEach(element => {
			result += element.toHTML();
		});
		return '<p>' + result + '</p>';		
	}
	toWikimedia() {
		let result = '';
		this.textItems.forEach(element => {
			result += element.toWikimedia();
		});
		return result;		
	}		
}

class MarkupDocument extends Item {
	constructor(documentItems) {
		super();
		this.documentItems = documentItems;
	}
	toPlainString(indent) {
		let result = '\t'.repeat(indent);
		this.documentItems.forEach(element => {
			result += element.toPlainString(indent);
		});
		return result;		
	}	
	toHTML() {
		let result = '';
		this.documentItems.forEach(element => {
			result += element.toHTML();
		});
		return result;		
	}	
	toWikimedia() {
		let result = '';
		this.documentItems.forEach(element => {
			result += element.toWikimedia();
		});
		return result;		
	}	
}


const HashToken = 0;
const NewLineToken = 1;
const BoldToken = 2;
const TextToken = 3;


class Parser {
	
	tokenize(text) {
		let tokens = [];
		let tokenValue = '';
	
		for (let i = 0; i < text.length; i++) {
			if (text[i] == "#") {
				if (tokenValue.length > 0) {
					tokens.push({type: TextToken, value: tokenValue});
					tokenValue = "";
				}
				tokens.push({type: HashToken});
			} else if (text[i] == "*" && text[i+1] == "*") {
				if (tokenValue.length > 0) {
					tokens.push({type: TextToken, value: tokenValue});
					tokenValue = "";
				}
				tokens.push({type: BoldToken});
				i++;
			} else if (text[i] == "\n") {
				if (tokenValue.length > 0) {
					tokens.push({type: TextToken, value: tokenValue});
					tokenValue = "";
				}
				tokens.push({type: NewLineToken});
			} else {
				tokenValue += text[i];
			}
		}
		return tokens;
	}
	
	parseTitle(tokens, cursor) {
		if (cursor.index >= tokens.length) {
			return undefined;
		}
		let countHash = 0;
		for (let i = cursor.index; i < tokens.length; i++) {
			if (tokens[i].type == HashToken) {
				countHash++;
			} else {
				break;
			} 
		}
		if (countHash > 0 && tokens[countHash + cursor.index].type == TextToken && tokens[countHash + cursor.index + 1].type == NewLineToken) {
			cursor.index += countHash + 2;
			return new TitleItem(countHash, tokens[cursor.index - 2].value);			
		} 
	}
	
	parsePlainText(tokens, cursor) {
		if (cursor.index >= tokens.length) {
			return undefined;
		}
		let token = tokens[cursor.index];
		if (token.type == TextToken) {
			cursor.index++;
			return new PlainTextItem(token.value);
		}
	}
	
	parseBoldText(tokens, cursor) {
		if (cursor.index >= tokens.length) {
			return undefined;
		}
		let token = tokens[cursor.index];
		if (token.type == BoldToken && tokens[cursor.index + 1].type == TextToken && tokens[cursor.index + 2].type == BoldToken) {
			cursor.index += 3;
			return new BoldTextItem(tokens[cursor.index - 2].value);
		}
		if (cursor >= tokens.length) {
			return undefined;
		}
	}

	parseNewline(tokens, cursor) {
		if (cursor.index >= tokens.length) {
			return undefined;
		}
		let token = tokens[cursor.index];
		if (token.type == NewLineToken) {
			cursor.index++;
			return new NewLineItem();
		}
		if (cursor >= tokens.length) {
			return undefined;
		}
	}

	parseTextItem(tokens, cursor) {
		let plainTextItem = this.parsePlainText(tokens, cursor);
		if (plainTextItem != undefined) {
			return plainTextItem;
		}
		let boldTextItem = this.parseBoldText(tokens, cursor);
		if (boldTextItem != undefined) {
			return boldTextItem;
		}
		let newLineItem = this.parseNewline(tokens, cursor);
		if (newLineItem != undefined) {
			return newLineItem;
		}

	}
	
	parseParagraph(tokens, cursor) {
		let textItems = [];
		while (true) {
			let textItem = this.parseTextItem(tokens, cursor);
			if (textItem != undefined) {
				textItems.push(textItem);
			} else {
				break;
			}
		}
		if (textItems.length > 0) {
			return new ParagraphDocumentItem(textItems);
		}
	}
	
	parseSection(tokens, cursor, minAcceptedLevel) {
		let oldCursorIndex = cursor.index;

		let titleItem = this.parseTitle(tokens, cursor);
		if (titleItem != undefined) {
			let level = titleItem.level;

			//apply filter so that we only accept sections with the right level (just subsections, never super-sections)
			if (level <= minAcceptedLevel) {
				cursor.index = oldCursorIndex; //must revert the cursor so the title can be parsed again by whoemever will want this section
				return;
			}

			let documentItems = [];
			while (true) {
				let documentItem = this.parseDocumentItem(tokens, cursor, level);
				if (documentItem != undefined) {
					documentItems.push(documentItem);
				} else {
					break;
				}
			}
			if (documentItems.length > 0) {
				return new SectionDocumentItem(titleItem, level, documentItems);
			}
		}
	}
	
	parseDocumentItem(tokens, cursor, level) {	
		let paragraphItem = this.parseParagraph(tokens, cursor);
		if (paragraphItem != undefined) {
			return paragraphItem;
		}
		let sectionItem = this.parseSection(tokens, cursor, level);
		if (sectionItem != undefined) {
			return sectionItem;
		}		
	}
	
	parseDocument(tokens, cursor) {
		let documentItems = [];
		while (true) {
			let documentItem = this.parseDocumentItem(tokens, cursor);
			if (documentItem != undefined) {
				documentItems.push(documentItem);
			} else {
				break;
			}
		}
		if (documentItems.length > 0) {
			return new MarkupDocument(documentItems);
		}
	}
}

	

	







