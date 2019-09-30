const HashToken = 0;
const TextToken = 1;
const BoldToken = 2;
const NewlineToken = 3;

class Item {
	constructor() {
		if (new.target === Item) {
		  throw new TypeError("Cannot construct Item instances directly");
		}
	}
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

class MarkdownDocumentItem extends Item {
	constructor(subItems) {
		super();
		this.subItems = subItems;
	}
	toPlainString(indent) {
		let result = '\t'.repeat(indent);
		this.subItems.forEach(element => {
			result += element.toPlainString(indent);
		});
		return result;		
	}	
	toHTML() {
		let result = '';
		this.subItems.forEach(element => {
			result += element.toHTML();
		});
		return result;		
	}	
	toWikimedia() {
		let result = '';
		this.subItems.forEach(element => {
			result += element.toWikimedia();
		});
		return result;		
	}	

}

class SectionItem extends MarkdownDocumentItem {
	constructor(titleItem, level, subItems) {
		super();
		this.titleItem = titleItem;
		this.level = level;
		this.subItems = subItems;
	}
	toPlainString(indent) {
		let result = this.titleItem.toPlainString(indent);
		this.subItems.forEach(element => {
			result += element.toPlainString(indent + 1);
		});
		return result;		
	}
	toHTML() {
		let result = this.titleItem.toHTML();
		this.subItems.forEach(element => {
			result += element.toHTML();
		});
		return '<section>' + result + '</section>';		
	}
	toWikimedia() {
		let result = this.titleItem.toWikimedia();
		this.subItems.forEach(element => {
			result += element.toWikimedia();
		});
		return result ;		
	}		
}

class ParagraphItem extends Item {
	constructor(subItems) {
		super();
		this.subItems = subItems;
	}
	toPlainString(indent) {
		let result = '';
		this.subItems.forEach(element => {
			result += element.toPlainString(indent);
		});
		return result;		
	}
	toHTML() {
		let result = '';
		this.subItems.forEach(element => {
			result += element.toHTML();
		});
		return '<p>' + result + '</p>';		
	}
	toWikimedia() {
		let result = '';
		this.subItems.forEach(element => {
			result += element.toWikimedia();
		});
		return result;		
	}		
}

class TitleItem extends Item {
	constructor(text, level) {
		super();
		this.text = text;
		this.level = level;
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

class TextItem extends Item {
	constructor() {
		super();
		if (new.target === TextItem) {
		  throw new TypeError("Cannot construct TextItem instances directly");
		}
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

class NewlineItem extends TextItem {
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



class Parser {
	tokenize(text) {
		let tokens = [];
		let tokenValue = '';

		for (let i = 0; i < text.length; i++) {
			if (text[i] == "#") {
        		if (tokenValue.length > 0) {
           			tokens.push({type : TextToken, value : tokenValue});
           			tokenValue = "";
         		}
        		tokens.push({type : HashToken});
      		} else if (text[i] == "*" & text[i+1] == "*") {
          		if (tokenValue.length > 0) {
              		tokens.push({type : TextToken, value : tokenValue});
              		tokenValue = "";
          		}
          		tokens.push({type : BoldToken});
          		i++;
      		} else if (text[i] == "\n") {
          		if (tokenValue.length > 0) {
            		tokens.push({type : TextToken, value : tokenValue});
            		tokenValue = "";
         		}
          		tokens.push({type : NewlineToken});
      		} else {
        		tokenValue += text[i];
      		}
		}
		//handling the end of input case when we have text acumulated 
		if (tokenValue.length > 0) {
			tokens.push({type : TextToken, value : tokenValue});
		}
    	return tokens;
	}

	parseTitleItem(tokens, cursor) {	
		let hashLevel = 0; 
		for (let i = cursor.index; i < tokens.length; i++) { 
			if (tokens[i].type == 0) {
				hashLevel++;
			} else {
				break;
			}
        } 

		let newLineIndex = cursor.index + hashLevel + 1;
		if (hashLevel > 0 && tokens.length > newLineIndex) {
			if (tokens[cursor.index + hashLevel].type == TextToken && tokens[newLineIndex].type == NewlineToken) { 
				let value = tokens[cursor.index + hashLevel].value;
				cursor.index += hashLevel + 2;
				return new TitleItem(value, hashLevel);
			}
		}
	}

	parsePlainTextItem(tokens, cursor) {
		if (cursor.index >= tokens.length) {
			return undefined;
		} 
		if (tokens[cursor.index].type == TextToken) {
			cursor.index++;
			return new PlainTextItem(tokens[cursor.index-1].value);
		}
	}

	parseBoldTextItem(tokens, cursor) {
		if (cursor.index + 2 >= tokens.length) {
			return undefined;
		} 
		if (tokens[cursor.index].type == BoldToken && tokens[cursor.index+1].type == TextToken && tokens[cursor.index+2].type == BoldToken) {
			cursor.index += 3;
			return new BoldTextItem(tokens[cursor.index-2].value);
		}
	}

	parseNewLineItem(tokens, cursor) {
		if (cursor.index >= tokens.length) {
			return undefined;
		} 
		if (tokens[cursor.index].type == NewlineToken) {
			cursor.index++;
			return new NewlineItem();
		}
	}
	
	parseParagraphSubitem(tokens, cursor) {
		let plainTextItem = this.parsePlainTextItem(tokens, cursor);
		if (plainTextItem != undefined) {
			return plainTextItem;
		}
		let boldTextItem = this.parseBoldTextItem(tokens, cursor);
		if (boldTextItem != undefined) {
			return boldTextItem;
		}
		let newLineItem = this.parseNewLineItem(tokens, cursor);
		if (newLineItem != undefined) {
			return newLineItem;
		}
	}

	parseParagraphItem(tokens, cursor) {
		let items = [];
		while (true) {
			let item = this.parseParagraphSubitem(tokens, cursor);
			if (item != undefined) {
				items.push(item);
			} else {
				break;
			}
		}
		if (items.length > 0) {
			return new ParagraphItem(items);
		}
	}

	parseSectionItem(tokens, cursor, minLevel) {
		let oldCursor = cursor.index; // make an actual copy of the index (oldcursor = cursor would not work because of reference semantics)
		let titleItem = this.parseTitleItem(tokens, cursor);
		if (titleItem == undefined) {
			return undefined;
		}
		if (titleItem.level > minLevel) {
			let items = [];
			while (true) {
				let item = this.parseSectionSubItem(tokens, cursor, titleItem.level);
				if (item != undefined) {
					items.push(item);
				} else {
					break;
				}
			}
			if (items.length > 0) {
				return new SectionItem(titleItem, titleItem.level, items);
			} else {
				return titleItem;
			}
		}
		cursor.index = oldCursor;
	}

	parseSectionSubItem(tokens, cursor, minLevel) {
		let paragraphItem = this.parseParagraphItem(tokens, cursor);
		if (paragraphItem != undefined) {
			return paragraphItem;
		}
		let sectionItem = this.parseSectionItem(tokens, cursor, minLevel);
		if (sectionItem != undefined) {
			return sectionItem;
		}
	}

	parseDocumentSubitem(tokens, cursor) {
		let sectionItem = this.parseSectionItem(tokens, cursor, 0);
		if (sectionItem != undefined) {
			return sectionItem;
		}
		let paragraphItem = this.parseParagraphItem(tokens, cursor);
		if (paragraphItem != undefined) {
			return paragraphItem;
		}	
	}

	parseMarkdownDocumentItem(tokens, cursor) {
		let items = [];
		while (true) {
			let item = this.parseDocumentSubitem(tokens, cursor);
			if (item != undefined) {
				items.push(item);
			} else {
				break;
			}
		}
		if (items.length > 0) {
			return new MarkdownDocumentItem(items);
		}
	}
}


/*
 # Section 1\nSome **(bold) introduction** to Section 1.\n## Section 1.1\nA text describing Section 1.1\nSome conclusion to Section 1.\n# Section 2\nAn introduction to Section 2.\nSome conclusion to Section 2. 
 HASH TEXT NEWLINE BOLD TEXT BOLD TEXT NEWLINE HASH HASH TEXT NEWLINE TEXT NEWLINE TEXT NEWLINE HASH TEXT NEWLINE TEXT NEWLINE TEXT

markup_document_item
	[document_subitem]

document_subitem
	section_item
	paragraph_item

section_item 
	title_item [section_subitem]

title_item
	HASH TEXT NEWLINE

section_subitem
	paragraph_item
	section_item

paragraph_item
	[paragraph_subitem]

paragraph_subitem
	plaintext_item
	boldtext_item
	newline_item

plaintext_item
	TEXT

boldtext_item
	BOLD TEXT BOLD

newline_item
	NL
 */