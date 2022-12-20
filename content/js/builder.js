var cardCount = 0;

function allowDrop(e){ e.preventDefault(); }

function addCard(){
	let url = document.getElementById("urlInput").value;
	document.getElementById("urlInput").value = "";
	createCard( url, "car0" );
}

function createCard( src, container, num=1 ){
	let ele = document.createElement('div');
	ele.classList.add("Card");
	ele.id = "c" + cardCount++;
	ele.draggable = true;
	
	let img = document.createElement('img');
	img.classList.add("CardIMG");
	img.src = src;
	img.draggable = false;
	img.onerror = function(e){
		this.src = "img/not_found.svg";
	}
	
	let add = document.createElement('span');
	let count = document.createElement('span');
	let min = document.createElement('span');

	add.innerHTML = "+";
	count.innerHTML = num;
	min.innerHTML = "-";

	add.onclick = function(e){
		count.innerHTML = (parseInt( count.innerHTML ) + 1);
	}

	min.onclick = function(e){
		count.innerHTML = (parseInt( count.innerHTML ) - 1);

		if( 0 < parseInt( count.innerHTML ) ) return;
		if( 2 < ele.children.length ) ele.parentNode.appendChild( ele.children[2] );

		ele.parentNode.removeChild( ele );
	}

	let wrap = document.createElement('div');
	wrap.classList.add("CardNumber");
	wrap.appendChild( min );
	wrap.appendChild( count );
	wrap.appendChild( add );

	ele.ondragover = allowDrop;
	
	ele.ondragstart = function(e){
		e.stopPropagation();
		e.dataTransfer.setData("dragID", ele.id);
		img.onmouseleave(e);
	}

	ele.ondrop = function(e){
		e.stopPropagation();
		if( 2 < ele.children.length ) return;
		let id = e.dataTransfer.getData("dragID");
		ele.appendChild( document.getElementById(id) );
	}

	img.onmouseenter = function(e){
		let card = document.getElementById("showCard");
		card.style.display = "block";
		card.src = src;
	}

	img.onmouseleave = function(e){
		document.getElementById("showCard").style.display = "none";
	}

	ele.appendChild( img );
	ele.appendChild( wrap );
	document.getElementById( container ).appendChild( ele );
}

function setCards( deck, side, back ){
    document.getElementById("car0").innerHTML = "";
    document.getElementById("car1").innerHTML = "";
    for( let k in deck ) createCard( k, "car0", deck[k] );
    for( let k in side ) createCard( k, "car1", side[k] );

	document.getElementById("urlBack").value = back;
	document.getElementById("showBack").src = document.getElementById("urlBack").value;
}

document.getElementById("urlBack").onmouseenter = function(e){
	document.getElementById("showBack").style.display = "block";
}

document.getElementById("urlBack").onmouseleave = function(e){
	document.getElementById("showBack").style.display = "none";
}

document.getElementById("urlBack").onkeyup = function(e){
	document.getElementById("showBack").src = document.getElementById("urlBack").value;
}

window.onmousemove = function(e){
	let ele = document.getElementById("showCard");
	if(ele == null) return;

	let box = ele.getBoundingClientRect();

	let x = e.pageX + 1;
	let y = e.pageY + 1;
	let w = box.right - box.left;
	let h = box.bottom - box.top;

	if(x + w > document.documentElement.clientWidth ) x -= 2 + w;
	if(y + h > document.documentElement.clientHeight ) y -= 2 + h;

	ele.style.left = x + "px";
	ele.style.top  = y + "px";
}

window.onload = function(e){
	let i = 0;
	while(i < 100){
		let ele = document.getElementById("car" + i++);
		if(ele == null) break;

		ele.ondragover = allowDrop;

		ele.ondrop = function(e){
			let id = e.dataTransfer.getData("dragID");
			ele.appendChild( document.getElementById(id) );
		}
	}

	document.getElementById("showBack").src = document.getElementById("urlBack").value;
}
