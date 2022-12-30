var cards = [];
var piles = [];

var cardsPile = [];

class Card {
	constructor( src, backsrcID ){
		if( src.indexOf("https:") != 0 ) this.src = "img/not_found.svg";
		else this.src = src;

		this.back = backsrcID;
		this.facedown = false;
		this.peek = false;
	}

	getIMG(){
		if( this.facedown && !this.peek ) return backs[ this.back ];
		return this.src;
	}
};

class Pile {
	constructor( facedown=false ){
		this.id = piles.length;
		this.facedown = facedown;
		this.cards = [];
		this.manifest("table");
	}

	updateIMG(){
		let ele = document.getElementById( "pile" + this.id + "img" );
		if(ele == null) return;

		let len = this.cards.length;

		ele.style.display = [ "none", "block" ][ +(len != 0) ];
		if( len != 0 ) ele.src = cards[ this.cards[ len-1 ] ].getIMG();
	}

	push( cardID, top=true ){
		if(top) this.cards.push( cardID );
		else this.cards.splice( 0, 0, cardID );

		cards[ cardID ].peek = false;
		if(this.facedown) cards[ cardID ].facedown = true;
		cardsPile[ cardID ] = this.id;

		if(openP == this.id) pushToBrowser( cardID, this.id, top );
		this.updateIMG();
		this.setAnimation( "PileAction" );
	}
	
	take( top=true ){
		let pos = 0;
		if(top) pos = this.cards.length - 1;
		let out = this.cards[pos];
		this.cards.splice( pos, 1 );

		cards[ out ].peek = false;
		cardsPile[ out ] = -1;
		this.updateIMG();
		this.setAnimation( "PileAction" );

		return out;
	}

	erase( cardID ){
		for(let i = 0 ; i < this.cards.length ; ++i){
			if( this.cards[i] == cardID ){
				this.cards.splice( i, 1 );
				break;
			}
		}

		cardsPile[ cardID ] = -1;
		this.updateIMG();
		this.setAnimation( "PileAction" );
	}

	setAnimation( anim ){
		let ele = document.getElementById( "pile" + this.id );
		if(ele == null) return;

		let bef = ele.style.animationName;
		if( bef != "" && bef != "none" && bef != "PileSearch" ) return;

		ele.style.animationIterationCount = "1";
		ele.style.animationName = anim;

		ele.onanimationend = function(e){
			ele.style.animationIterationCount = "infinite";
			ele.style.animationName = bef;
		}
	}

	manifest( container ){
		let ele = document.createElement('div');
		ele.classList.add( "Pile" );
		ele.id = "pile" + this.id;

		let img = document.createElement('img');
		img.classList.add("CardIMG");
		img.id = "pile" + this.id + "img";
		img.style.display = "none";
		
		// ---
		
		const ID = this.id;
		
		ele.ondrop = function(e){
			e.preventDefault();
			e.stopPropagation();

			let dropID = e.dataTransfer.getData("dragID");

			if( ele.id == dropID ) return;
			if( dropID == "selcards" ){
				let sel = document.getElementById("selcards");

				while(sel.children.length > 0){
					let id = sel.children[0].id;
					let cs = getStackCards( id );
					sel.removeChild( sel.children[0] );
					for(let i = 0 ; i < cs.length ; ++i) piles[ ID ].push( cs[i], !e.shiftKey );

					send({
						'type': 'INPILE',
						'pile': ID,
						'top': !e.shiftKey,
						'id': id
					});
				}
				sel.innerHTML = "";
			}
			if( parseID( dropID ) < 0 ) return;

			let onTop = !e.shiftKey;

			send({
				'type': 'INPILE',
				'pile': ID,
				'top': onTop,
				'id': dropID
			});

			let cs = getStackCards( dropID );
			for(let i = 0 ; i < cs.length ; ++i) piles[ ID ].push( cs[i], onTop );

			removeCard( cs[0] );
		}

		ele.oncontextmenu = function(e){
			e.stopPropagation();
			cPile = ID;
			displayBox( "pileMenu", e );
			return false;
		}

		img.ondrop = ele.ondrop;
		img.oncontextmenu = ele.oncontextmenu;
		img.onclick = ele.onclick;
		ele.ondropover = img.ondropover = allowDrop;

		// ---
		
		ele.appendChild( img );
		document.getElementById( container ).appendChild( ele );

		setMovable( ele.id );
		setScaleProp( ele.id, 635 / 889 );
	}
};

// Utility functions ---

function getSrcIMG( mID ){
	return "https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=" + mID + "&type=card";
}

function getStackCards( ele_id ){
	let ele = document.getElementById( ele_id );
	if(ele == null) return [];

	let out = [ parseID( ele_id ) ];
	
	for( let i = 0 ; i < ele.children.length ; ++i ){
		if( !ele.children[i].classList.contains("Card") ) continue;

		let res = getStackCards( ele.children[i].id )
		if( res.length > out.length ) out, res = res, out;
		for( let j = 0 ; j < res.length ; ++j ) out.push( res[j] );
	}

	return out;
}

function parseID( ele_id ){
	let out = parseInt( ele_id.slice(1) );
	if( isNaN(out) ) return -1;
	return out;
}

// Removes a card from the field
function removeCard( cardID ){
	let ele = document.getElementById("c" + cardID);
	if(ele == null) return;
	
	ele.parentNode.removeChild( ele );
}

// ---

var openP = -1;

function updateBrowserCardnum(){
	document.getElementById("browserNum").innerHTML = "Cards: " + piles[ openP ].cards.length;
}

function closeBrowser(){
	if(openP == -1) return;

	if(piles[openP].facedown){
		for(let i = 0 ; i < piles[ openP ].cards.length ; ++i ) cards[ piles[openP].cards[i] ].facedown = true;
	}

	document.getElementById("browser").style.display = "none";
	document.getElementById("browsercontent").innerHTML = "";
	piles[ openP ].updateIMG();
	send({
		'type': 'OPENPILE',
		'id': openP,
		'close': true
	});
	openP = -1;
}

function pushToBrowser( cardID, pileID, top=true ){
	if( piles[openP].facedown ) cards[ cardID ].facedown = false;
	createDisplayCard( cardID, "browsercontent", top );
	updateBrowserCardnum();

	let ele = document.getElementById( "c" + cardID + "img" );

	ele.onclick = function(e){
		send({
			'type': 'PLAY',
			'id': cardID,
			'pile': openP
		});
		send({
			'type': "SETFACE",
			'id': cardID,
			'facedown': cards[cardID].facedown
		});
		ele.parentNode.removeChild(ele);
		createCard( cardID, "table" );
		piles[ openP ].erase( cardID );
		updateBrowserCardnum();
	}
}

function openPile( pileID ){
	openP = pileID;
	document.getElementById("browsercontent").innerHTML = ""; //Clear all cards currently displayed
	updateBrowserCardnum();

	for(let i = 0 ; i < piles[pileID].cards.length ; ++i){
		const c = piles[pileID].cards[i];
		pushToBrowser( c, pileID );
	}

	document.getElementById("browser").style.display = "block";
	piles[ openP ].updateIMG();
	send({
		'type': 'OPENPILE',
		'id': openP,
		'close': false
	});
}
