function copyToClip( ele_id ){
	navigator.clipboard.writeText( document.getElementById( ele_id ).innerHTML );
}

function allowDrop(e){ e.preventDefault(); }

function setMovable( ele_id ){
	let ele = document.getElementById( ele_id );
	if(ele == null) return;

	ele.draggable = true;

	ele.ondragstart = function(e){
		e.stopPropagation();

		const x = (e.clientX - ele.getBoundingClientRect().left );
		const y = (e.clientY - ele.getBoundingClientRect().top  ); 

		e.dataTransfer.setData("dragID", ele.id);
		e.dataTransfer.setData("dragX", x);
		e.dataTransfer.setData("dragY", y);

		document.getElementById("showCard").style.display = "none";
	}
}

// Proportion equal to height
function setScaleProp( ele_id, prop ){
	let ele = document.getElementById( ele_id );
	if(ele == null) return;

	let f = function(){
		if(ele.parentNode == null) return;
		let scw = ele.clientHeight * prop / ele.parentNode.clientWidth;
		ele.style.width  = Math.min(scw*100, 100) + "%";
	}

	ele.onmouseup = function(e){
		if(e.button != 0) return;
		let sch = ele.clientHeight / ele.parentNode.clientHeight;
		ele.style.height = Math.min(sch*100, 100) + "%";

		send({
			'type': 'RESIZE',
			'width': ele.style.width,
			'height': ele.style.height,
			'id': ele.id
		});
	};

	new ResizeObserver( f ).observe(ele);
}

function setHoverZoom( ele_id ){
	let ele = document.getElementById( ele_id );
	if(ele == null) return

	ele.onmouseenter = function(e){
		let img = document.getElementById("showCard");
		img.src = ele.src;
		img.style.display = "block";
		img.style.left = "0px";
		img.style.right = "";

		let box = img.getBoundingClientRect();
		
		if( !(e.pageX < box.left || box.right < e.pageX || e.pageY < box.top || box.bottom < e.pageY) ){
			img.style.left = "";
			img.style.right = "0px";			
		}
	}
	
	ele.onmouseleave = function(e){
		document.getElementById("showCard").style.display = "none";
	}
}

let nCardPos = 0;
function createCard( cardID, container ){
	let card = cards[ cardID ];

	let ele = document.getElementById("c" + cardID);
	if( ele != null ) ele.parentNode.removeChild(ele);
	ele = document.getElementById("c" + cardID + "img");
	if( ele != null ) ele.parentNode.removeChild(ele);
	if( cardsPile[cardID] != -1 ) piles[ cardsPile[ cardID ] ].erase(cardID);

	ele = document.createElement('div');
	ele.classList.add( "Card" );
	ele.id = "c" + cardID;

	let img = document.createElement( 'img' );
	img.classList.add( "CardIMG" );
	img.src = card.getIMG();
	img.draggable = false;
	img.id = "c" + cardID + "img";
	img.onerror = function(e){
		this.src = "img/not_found.svg";
	}

	ele.onclick = function(e){
		let cbox = ele.getBoundingClientRect();
		if( e.pageX < cbox.left + 16 || cbox.right < e.pageX + 16 || e.pageY < cbox.top + 16 || cbox.bottom < e.pageY + 16 ) return;
		if(e.target.id != ele.id + "img") return;

		cCard = cardID;
		if( ele.style.transform == "rotate(90deg)" ) rotate(-90);
		else rotate(90);
	}

	ele.ondragover = allowDrop;
	
	ele.ondrop = function(e){
		e.preventDefault();
		let box = ele.getBoundingClientRect();
		
		let cr = document.getElementById( e.dataTransfer.getData("dragID") );
		if(cr.id == ele.id) return;
		if( cr.id[0] != 'c' ) return;

		let x = e.pageX - box.left - e.dataTransfer.getData("dragX");
		let y = e.pageY - box.top  - e.dataTransfer.getData("dragY");
		
		e.stopPropagation();

		let val_x = x*100 / ele.clientWidth;
		let val_y = y*100 / ele.clientHeight;

		send({
			'type': 'MOVE',
			'left': val_x,
			'top': val_y,
			'id': cr.id,
			'parent': ele.id
		});

		cr.style.left = val_x + "%";
		cr.style.top = val_y + "%";
			
		if(cr.parentNode.id != ele.id){
			cr.style.width  = (cr.clientWidth*100 / ele.clientWidth) + "%";
			cr.style.height = (cr.clientHeight*100 / ele.clientHeight) + "%";
			ele.appendChild( cr );
		}
	}
	
	ele.oncontextmenu = function(e){
		e.stopPropagation();
		cCard = cardID;
		displayBox( "cardMenu", e );
		return false;
	}

	let par = document.getElementById( container );

	ele.appendChild(img);
	par.appendChild( ele );
	
	setMovable( ele.id );
	setScaleProp( ele.id, 635 / 889 );
	setHoverZoom( img.id );

	ele.style.height = "10%";
	ele.style.left = (40 + 1*nCardPos) + "%";
	ele.style.top = (40 + 1*(nCardPos)) + "%";
	nCardPos = (nCardPos+1) % 10;
}

function createDisplayCard( cardID, container, top=true ){
	let card = cards[ cardID ];

	let ele = document.createElement('img');
	ele.classList.add( "DisplayCard" );
	ele.id = "c" + cardID + "img";
	ele.src = card.getIMG();
	ele.draggable = false;
	
	ele.onerror = function(e){
		this.src = "img/not_found.svg";
	}

	ele.onclick = function(e){
		ele.parentNode.removeChild( ele );
		createCard( cardID, "table" );
		send({
			'type': 'PLAY',
			'id': cardID,
			'pile': -1
		});
		send({
			'type': 'HANDSIZE',
			'size': document.getElementById(container).children.length
		});
	}
	
	ele.oncontextmenu = function(e){
		e.stopPropagation();
		cCard = cardID;
		displayBox( "displaycardMenu", e );
		return false;
	}

	let ids = document.createElement("div");
	ids.classList.add("IDShower");
	ids.innerHTML = cardID;
	ele.appendChild(ids);
	if(top) document.getElementById( container ).appendChild( ele );
	else document.getElementById( container ).prepend( ele );
	setHoverZoom( ele.id );

	if(container == "handcontainer"){
		send({
			'type': 'HANDSIZE',
			'size': document.getElementById(container).children.length
		});
	}
}

var counter = 0;
function createCounter( container, doSend=true ){
	let ele = document.createElement('textarea');
	ele.id = "count" + counter++;
	ele.classList.add( "Counter" );

	ele.placeholder = "Enter some Text";

	ele.onkeydown = function(e){
		if( e.ctrlKey && (e.which == 88 || e.which == 46) ){
			ele.parentNode.removeChild(ele);
			send({
				'type': 'REMCOUNTER',
				'id': ele.id
			});
		}
	}

	ele.onchange = function(e){
		send({
			'type': 'COUNTERCONTENT',
			'value': ele.value,
			'id': ele.id
		});
	}

	ele.onmouseup = function(e){
		ele.style.width = ele.clientWidth*100 / ele.parentNode.clientWidth + "%";
		ele.style.height = ele.clientHeight*100 / ele.parentNode.clientHeight + "%";

		send({
			'type': 'RESIZE',
			'width': ele.style.width,
			'height': ele.style.height,
			'id': ele.id
		});
	}
		
	ele.spellcheck = false;
	document.getElementById( container ).appendChild( ele );
	setMovable( ele.id );

	if( !doSend ) return;

	send({
		'type': 'COUNTER'
	});
	send({
		'type': 'MOVE',
		'left': 0,
		'top': 0,
		'id': ele.id,
		'parent': container
	});
}

var zone = 0;
function createZone( container, doSend=true ){
	const zoneID = zone++;

	let ele = document.createElement('div');
	ele.id = "zones" + zoneID;
	ele.classList.add( "Zone" );
	ele.style.backgroundColor = "#FFFFFF";

	ele.onmouseup = function(e){
		ele.style.width = Math.min(ele.clientWidth*100 / ele.parentNode.clientWidth, 100) + "%";
		ele.style.height = Math.min(ele.clientHeight*100 / ele.parentNode.clientHeight, 100) + "%";

		send({
			'type': 'RESIZE',
			'width': ele.style.width,
			'height': ele.style.height,
			'id': ele.id
		});
	}

	ele.oncontextmenu = function(e){
		e.stopPropagation();
		cZone = zoneID;

		displayBox( "zoneMenu", e );

		let c = document.getElementById("contextMenu").children[0].children[0];
		c.value = SRGBtoHEX( ele.style.backgroundColor ); // People say, Javascript is great...
		c.onchange = function(e){
			ele.style.backgroundColor = c.value;
			send({
				'type': 'ZONECOLOR',
				'id': zoneID,
				'color': c.value
			});
		}

		return false;
	}

	document.getElementById( container ).appendChild( ele );
	setMovable( ele.id );

	if( !doSend ) return;

	send({
		'type': 'ZONE'
	});
	send({
		'type': 'MOVE',
		'left': 0,
		'top': 0,
		'id': ele.id,
		'parent': container
	});
}

function createPile( container, doSend=true ){
	piles.push( new Pile() );

	if(!doSend) return;

	send({
		'type': 'PILE'
	});
	send({
		'type': 'MOVE',
		'left': 0,
		'top': 0,
		'id': "pile" + (piles[piles.length-1].id),
		'parent': "table"
	});
}

var prbuttons = 0;

function togglePrio( ele_id, doSend=true ){
	let ele = document.getElementById( ele_id );
	if(ele == null && ele_id.indexOf("prbutton") == 0) return;

	let cur = +( ele.children[0].style.pointerEvents != "none" );

	for(let i = 0 ; i < 2 ; ++i){
		ele.children[i].style.backgroundColor = ["#545454", "#CCCCCC"][ +(cur == i) ];
		ele.children[i].style.pointerEvents = ["none", "auto"][ +(cur == i) ];
	}

	if(!doSend) return;

	send({
		'type': 'TOGGLEPRIORITY',
		'id': ele_id
	});
}

function createPriorityButton( container, yourPrio, doSend=true ){
	const ID = prbuttons++;

	let ele = document.createElement('div');
	ele.classList.add("PriorityButton");
	ele.id = "pbutton" + ID;

	for(let i = 0 ; i < 2 ; ++i){
		let div = document.createElement('div');
		div.style.top = ["", "50%"][i];

		let span = document.createElement('span');
		span.classList.add("centerXY");
		span.innerHTML = ["Opponent's", "Your"][i] + " priority";

		if(i == +(!yourPrio)){
			div.style.backgroundColor = "#545454";
			div.style.pointerEvents = "none";
		}

		div.onmouseenter = function(e){
			if(this.style.pointerEvents == "none") return;
			this.style.backgroundColor = "#BBBBBB";
		}
		div.onmouseleave = function(e){
			if(this.style.pointerEvents == "none") return;
			this.style.backgroundColor = "#CCCCCC";
		}

		div.appendChild(span);
		ele.appendChild(div);
	}

	let purpose = document.createElement('input');
	purpose.type = "text";
	purpose.classList.add("PriorityPurpose");
	purpose.id = "priopurpose" + ID;

	purpose.onchange = function(e){
		send({
			'type': 'BUTTONPURPOSE',
			'id': purpose.id,
			'content': purpose.value
		});
	}

	ele.children[1].onclick = function(e){
		togglePrio(ele.id);
	}

	ele.oncontextmenu = function(e){
		e.stopPropagation();
		cPButton = ID;
		displayBox( "pbuttonMenu", e );
		return false;
	}

	ele.appendChild(purpose);
	document.getElementById(container).appendChild(ele);

	setMovable( ele.id );
	setScaleProp( ele.id, 635 / 889 );

	if( !doSend ) return;

	send({
		'type': 'PRIORITYBUTTON'
	});
	send({
		'type': 'MOVE',
		'left': 0,
		'top': 0,
		'id': ele.id,
		'parent': "table"
	});
}

var pinNumber = 0;

function createPin( container, x, y, myPin=true ){
	if(pinNumber >= 1024) return;

	let ele = document.createElement('div');
	ele.classList.add("Pin");

	if(!myPin) ele.style.backgroundColor = "#0000BB";

	ele.style.left = x + "%";
	ele.style.top = y + "%";
	ele.id = "pin" + pinNumber;

	document.getElementById(container).appendChild(ele);
	pinNumber += 1;

	if(!myPin) return;

	send({
		'type': 'PIN',
		'container': container,
		'x': x,
		'y': y
	});
}

function removePins( doSend=true ){
	for(let i = 0 ; i < pinNumber ; ++i){
		let ele = document.getElementById("pin" + i);
		if(ele == null) continue;
		ele.parentNode.removeChild(ele);
	}

	pinNumber = 0;

	if(!doSend) return;

	send({
		'type': 'REMPINS'
	});
}

function toggleManual(){
	let ele = document.getElementById("manualWindow");
	ele.style.display = ["block", "none"][ +(ele.style.display == "block") ]
}

//---

document.getElementById("table").ondragover = allowDrop;

document.getElementById("table").ondrop = function(e){
	e.preventDefault();

	let table = document.getElementById("table");

	let ele = document.getElementById( e.dataTransfer.getData("dragID") );
	let ew = ele.getBoundingClientRect().right - ele.getBoundingClientRect().left;
	let eh = ele.getBoundingClientRect().bottom - ele.getBoundingClientRect().top;
	let x = e.pageX - table.getBoundingClientRect().left - e.dataTransfer.getData("dragX");
	let y = e.pageY - table.getBoundingClientRect().top - e.dataTransfer.getData("dragY");

	let tbox = table.getBoundingClientRect();
	let tw = tbox.right - tbox.left;
	let th = tbox.bottom - tbox.top;

	let val_x = Math.max( Math.min(x*100 / tw, (1-ew/tw)*100), 0 );
	let val_y = Math.max( Math.min(y*100 / th, (1-eh/th)*100), 0 );

	ele.style.left = val_x + "%";
	ele.style.top = val_y + "%";

	if( ele.id == "selcards" ){
		for(let i = 0 ; i < ele.children.length ; ++i){
			let child = ele.children[i];

			let cbox = child.getBoundingClientRect();

			let val_x = (cbox.left - tbox.left) * 100 / tw;
			let val_y = (cbox.top - tbox.top) * 100 / th;

			send({
				'type': 'MOVE',
				'left': val_x,
				'top': val_y,
				'id': child.id,
				'parent': "table"
			});
		}

		return;
	}

	send({
		'type': 'MOVE',
		'left': val_x,
		'top': val_y,
		'id': ele.id,
		'parent': "table"
	});
	
	if(ele.parentNode.id != "table"){
		ele.style.width = (ele.clientWidth*100 / table.clientWidth) + "%";
		ele.style.height = (ele.clientHeight*100 / table.clientHeight) + "%";
		document.getElementById("table").appendChild( ele );
	}
}

document.getElementById("table").oncontextmenu = function(e){
	displayBox( "tableMenu", e );
	return false;
}

document.getElementById("table").onDblclick = function(e){
	if( e.button == 1 || (e.button == 0 && e.ctrlKey) ) removePins();
}

document.getElementById("UtilityToggle").onclick = function(e){
	let ele = document.getElementById("UtilityToggle");
	let utl = document.getElementById("Utils");

	utl.style.display = ["none", "block"][ +(utl.style.display != "block") ];
	ele.innerHTML = ["Actions", "Hide Actions"][ +(utl.style.display == "block") ];
}

//---

document.getElementById("showCard").onmouseover = function(e){
	document.getElementById("showCard").style.display = "none";
}

document.getElementById("showCard").ondropover = function(e){
	e.preventDefault();
	document.getElementById("showCard").style.display = "none";
}

//---

window.onkeydown = function(e){
	if( e.which == 112 ) removePins();
	if( e.which == 113 ) openChat(true);
	if( e.which ==  27 ) openChat(false);
}

function mergeToTable(ele_id){
	let ele = document.getElementById(ele_id);

	let table = document.getElementById("table");
	let tbox = table.getBoundingClientRect();
	let tw = tbox.right - tbox.left;
	let th = tbox.bottom - tbox.top;

	let bef = ele.style.transform;
	ele.style.transform = "";

	let cbox = ele.getBoundingClientRect();

	ele.style.left = (cbox.left - tbox.left) * 100 / tw + "%";
	ele.style.top = (cbox.top - tbox.top) * 100 / th + "%";
	ele.style.width = (cbox.right - cbox.left) * 100 / tw + "%";
	ele.style.height = (cbox.bottom - cbox.top) * 100 / th + "%";

	ele.style.transform = bef;

	table.appendChild( ele );
}

function clearSelected(){
	let sel = document.getElementById("selcards");

	for(let i = 0 ; i < sel.children.length ; ++i){
		mergeToTable( sel.children[i].id );
		i--;
	}

	sel.style.width = "0%";
	sel.style.height = "0%";
}

let mX = -1, mY = -1;
window.onmousedown = function(e){
	let b = document.getElementById("contextMenu").contains( e.target );
	document.getElementById("contextMenu").style.display = ["none", "display"][+b];

	if( e.button == 1 || (e.button == 0 && e.ctrlKey) ){
		let ele = e.target;
		if(ele.id == "selcards") ele = document.getElementById("table");

		if(ele.id != "table" && !document.getElementById("table").contains(ele)) return;
		if(ele.id.substr(-3) == "img"){
			ele = document.getElementById( ele.id.substr(0, ele.id.length-3) );
			if(ele == null) return;
		}

		let ex = ele.getBoundingClientRect().left;
		let ey = ele.getBoundingClientRect().top;
		let ew = ele.getBoundingClientRect().right - ele.getBoundingClientRect().left;
		let eh = ele.getBoundingClientRect().bottom - ele.getBoundingClientRect().top;

		let x = (e.pageX - ex) / ew * 100;
		let y = (e.pageY - ey) / eh * 100;

		createPin( ele.id, x, y );
	}

	if(e.target.id == "table" && e.button === 0){
		mX = e.pageX;
		mY = e.pageY;
		clearSelected();
	}
}

window.onmousemove = function(e){
	if(mX < 0 || mY < 0) return;

	let area = document.getElementById("selectArea");
	area.style.display = "block";

	var x = [mX, Math.min(document.documentElement.clientWidth-2, e.pageX)];
	var y = [mY, Math.min(document.documentElement.clientHeight-2, e.pageY)];
	if(x[0] > x[1]) x = [x[1], x[0]];
	if(y[0] > y[1]) y = [y[1], y[0]];

	area.style.left = x[0] + "px";
	area.style.top = y[0] + "px";
	area.style.width = x[1] - x[0] + "px";
	area.style.height = y[1] - y[0] + "px";
}

window.onmouseup = function(e){
	if(mX < 0 || mY < 0) return;

	mX = -1;
	mY = -1;

	let area = document.getElementById("selectArea");
	let abox = area.getBoundingClientRect();
	let table = document.getElementById("table");
	let tbox = table.getBoundingClientRect();

	let x = [table.clientWidth, 0];
	let y = [table.clientHeight, 0];

	for(let i = 0 ; i < table.children.length ; ++i){
		let child = table.children[i];
		if(!child.classList.contains("Card")) continue;

		let cbox = child.getBoundingClientRect();

		if( !(cbox.right < abox.left || abox.right < cbox.left || cbox.bottom < abox.top || abox.bottom < cbox.top) ){
			x[0] = Math.min(x[0], cbox.left - tbox.left);
			x[1] = Math.max(x[1], cbox.right - tbox.left);
			y[0] = Math.min(y[0], cbox.top - tbox.top);
			y[1] = Math.max(y[1], cbox.bottom - tbox.top);
		}
	}

	let sel = document.getElementById("selcards");

	sel.style.left = x[0] * 100 / table.clientWidth + "%";
	sel.style.top = y[0] * 100 / table.clientHeight + "%";
	sel.style.width = (x[1] - x[0]) * 100 / table.clientWidth + "%";
	sel.style.height = (y[1] - y[0]) * 100 / table.clientHeight + "%";

	for(let i = 0 ; i < table.children.length ; ++i){
		let child = table.children[i];
		if(!child.classList.contains("Card")) continue;

		let cbox = child.getBoundingClientRect();
		let sbox = sel.getBoundingClientRect();

		if( !(cbox.right < abox.left || abox.right < cbox.left || cbox.bottom < abox.top || abox.bottom < cbox.top) ){
			let bef = child.style.transform;
			child.style.transform = "";
			cbox = child.getBoundingClientRect();

			child.style.left = (cbox.left - sbox.left) * 100 / (sbox.right - sbox.left) + "%";
			child.style.top = (cbox.top - sbox.top) * 100 / (sbox.bottom - sbox.top) + "%";
			child.style.width = (cbox.right - cbox.left) * 100 / (sbox.right - sbox.left) + "%";
			child.style.height = (cbox.bottom - cbox.top) * 100 / (sbox.bottom - sbox.top) + "%";

			child.style.transform = bef;
			sel.appendChild( child );
			i--;
		}
	}

	area.style.display = "none";
}

document.getElementById("selcards").ondragstart = function(e){
	e.stopPropagation();

	let ele = document.getElementById("selcards");

	const x = (e.clientX - ele.getBoundingClientRect().left );
	const y = (e.clientY - ele.getBoundingClientRect().top  );

	e.dataTransfer.setData("dragID", "selcards");
	e.dataTransfer.setData("dragX", x);
	e.dataTransfer.setData("dragY", y);
}

document.getElementById("selcards").oncontextmenu = function(e){
	e.stopPropagation();
	displayBox( "selMenu", e );
	return false;
}

function openChat(open){
	document.getElementById("chatWindow").style.borderStyle = ["hidden", "solid"][+open];
	document.getElementById("chatContainer").style.height = ["0px", "50%"][+open];
	document.getElementById("chatInput").focus();
}

function addMSG( msg, color, textalign="left" ){
	let ele = document.createElement('div');
	ele.innerHTML = msg;
	ele.style.color = color;
	ele.style.textAlign = textalign;

	let comp = document.getElementById("chatComponents");
	chatHistory.appendChild(ele);
	comp.scrollTop = comp.scrollHeight;
}

document.getElementById("chatButton").onclick = function(e){
	openChat( +(document.getElementById("chatContainer").style.height != "50%") );
}

document.getElementById("chatInput").onkeydown = function(e){
	if(e.which == 13 && !e.shiftKey){
		// Return key

		let ele = document.getElementById("chatInput");

		send({
			'type': 'CHATMSG',
			'msg': ele.innerHTML
		});
		addMSG(ele.innerHTML, "#FFFF00", "right");
		ele.innerHTML = "";

		e.preventDefault();
	}
}

window.onresize = function(e){
	const PROP = 0.625; // 1200 / 1920 = 5 / 8
	let w = document.documentElement.clientWidth;
	let h = w * PROP;

	if( document.documentElement.clientHeight < h ){
		h = document.documentElement.clientHeight;
		w = h / PROP;
	}

	let table = document.getElementById("table");
	table.style.width = w + "px";
	table.style.height = h + "px";
}

window.onload = window.onresize();
