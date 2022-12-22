var carCount = [];
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

		carCount[ getCar(ele) ] += 1;
		updateCarCount();
	};

	min.onclick = function(e){
		count.innerHTML = (parseInt( count.innerHTML ) - 1);

		carCount[ getCar(ele) ] -= 1;
		updateCarCount();

		if( 0 < parseInt( count.innerHTML ) ) return;
		if( 2 < ele.children.length ) ele.parentNode.appendChild( ele.children[2] );

		ele.parentNode.removeChild( ele );
	};

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

		let dEle = document.getElementById(id)
		let num = parseInt( dEle.children[1].children[1].innerHTML );

		carCount[ getCar(dEle) ] -= num;
		carCount[ getCar(ele) ] += num;
		updateCarCount();
		ele.appendChild( dEle );
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

	carCount[ getCar(ele) ] += num;
	updateCarCount();
}

function setCards( deck, side, back ){
	document.getElementById("car0").innerHTML = "";
	document.getElementById("car1").innerHTML = "";
	for(let i = 0 ; i < carCount.length ; ++i) carCount[i] = 0;
	for( let k in deck ) createCard( k, "car0", deck[k] );
	for( let k in side ) createCard( k, "car1", side[k] );

	document.getElementById("urlBack").value = back;
	document.getElementById("showBack").src = document.getElementById("urlBack").value;
	updateCarCount();
}

function updateCarCount(){
		for(let i = 0 ; i < carCount.length ; ++i){
			let ele = document.getElementById("car" + i + "c");
			if(ele == null) continue;
			ele.innerHTML = carCount[i];
		}
}

function getCar( ele ){
	for(let i = 0 ; i < carCount.length ; ++i){
		if( document.getElementById("car"+i).contains(ele) ) return i;
	}
	return -1;
}

function toggleCBack(){
	let ele = document.getElementById("cbackWindow");
	ele.style.display = ["none", "block"][ +(ele.style.display != "block") ];
}

document.getElementById("urlBack").onkeyup = function(e){
	document.getElementById("showBack").src = document.getElementById("urlBack").value;
}

document.getElementById("showBack").onerror = function(e){
	this.src = "img/not_found.svg";
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

		carCount.push(0);

		ele.ondragover = allowDrop;

		ele.ondrop = function(e){
			let id = e.dataTransfer.getData("dragID");
			let dEle = document.getElementById(id)
			let num = parseInt( dEle.children[1].children[1].innerHTML );

			carCount[ getCar(dEle) ] -= num;
			carCount[ getCar(ele) ] += num;
			updateCarCount();
			ele.appendChild( dEle );
		}
	}

	document.getElementById("showBack").src = document.getElementById("urlBack").value;
}
