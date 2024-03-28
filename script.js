let response;
const url = "https://data.hkbus.app/routeFareList.min.json";
const xhttpr = new XMLHttpRequest();
xhttpr.open("GET", url, true);

xhttpr.send();

xhttpr.onload = ()=> {
	if (xhttpr.status == 200){
		response = JSON.parse(xhttpr.response);
		const routeList = response["routeList"];
		const routeNameList = Object.keys(routeList);
		const tbody = document.querySelector('#routeTable tbody');
		
		for (let i = 0; i < routeNameList.length; i++){
			const routeInfo = routeList[routeNameList[i]];
			if (routeInfo.co == "gmb"){
				continue;
			}
			let tr = document.createElement('tr');
			let td = document.createElement('td');
			let button = document.createElement('button');
			let span = document.createElement('span');
			let routeIdTd = document.createElement('td');
			let routeNumberTd = document.createElement('td');
			let company = document.createElement('p');
			let routeOrigTd = document.createElement('p');
			let routeDestTd = document.createElement('p');

			routeIdTd.textContent = routeInfo.gtfsId;
			routeNumberTd.textContent = routeInfo.route;
			company.style = "font-size: 75%;color: #FFEC31;margin: 0px 0px";
			company.textContent = transitOperators(routeInfo.co);
			routeNumberTd.appendChild(company);
			
			button.className = "btnOrigin";
			button.type = "button";
			button.onclick = function (){routeStop(routeNameList[i])};
			
			span.style = "font-size: 75%";
			span.textContent = "往 ";
			routeDestTd.style = "margin: 0px 0px";
			
			routeOrigTd.textContent = routeInfo.orig.zh;
			routeOrigTd.style = "font-size: 75%;margin: 0px 0px";
			routeDestTd.textContent = routeInfo.dest.zh;

			routeDestTd.prepend(span);
			tr.appendChild(routeNumberTd);
			button.appendChild(routeOrigTd);
			button.appendChild(routeDestTd);
			td.appendChild(button);
			tr.appendChild(td);
			
			tbody.appendChild(tr);
			
			//console.log(routeList[routeNameList[i]]);
		}
		document.getElementById("waiting").style.display = "none";
	}
}

function routeStop(routeName){
	document.getElementById("routeList").style.display = "none";
	document.getElementById("routeSearch").style.display = "none";
	document.getElementById("routeSearch").value = "";
	
	const routeInfo = response.routeList[routeName];
	const company = routeInfo.co[0];
	const stops = routeInfo["stops"][company];
	const tbody = document.querySelector("#stationTable tbody");
	for (let i = 0; i < stops.length; i++){
		stopInfo = response.stopList[stops[i]];
		let tr = document.createElement("tr");
		let number = document.createElement("td");
		let stopName = document.createElement("td");
		let button = document.createElement("button");
		let fare = document.createElement("p");
		
		number.textContent = i + 1;
		button.className = "btnEta";
		button.style = "text-align: left";
		button.textContent = stopInfo.name.zh;
		fare.style = "font-size: 75%;color: #ffff99;margin: 0px 0px;";
		
		if (routeInfo.faresHoliday && i != stops.length - 1){
			fare.textContent = "平日車資: $" + routeInfo.fares[i] + " 假日車資: $" + routeInfo.faresHoliday[i];
		} else if (i != stops.length - 1) {
			fare.textContent = "車資: $" + routeInfo.fares[i];
		}
		
		button.append(fare);
		stopName.append(button);
		tr.append(number);
		tr.append(stopName);
		tbody.append(tr);
	}
	document.getElementById("stationList").style.display = "block";
}

function transitOperators(code){
	const output = [];
	for (let i = 0; i < code.length; i++){
		switch (code[i]){
			case "ctb":
				output[i] = "城巴";
				continue;
			case "kmb":
				output[i] = "九巴";
				continue;
			case "gmb":
				output[i] = "小巴";
				continue;
			case "nlb":
				output[i] = "嶼巴";
				continue;
			case "lrtfeeder":
				output[i] = "港鐵巴士";
				continue;
			case "lightRail":
				output[i] = "輕鐵";
				continue;
			case "mtr":
				output[i] = "港鐵";
				continue;
		}
	}
	return output.join("/");
}

function searchRoute(){
	let input, filter, table, tr, td, i, txtValue;
	input = document.getElementById("routeSearch");
	filter = input.value.toUpperCase();
	table = document.getElementById("routeTable");
	tr = table.getElementsByTagName("tr");
	for (i = 1; i < tr.length; i++) {
		td = tr[i].getElementsByTagName("td")[0];
		if (td) {
		  txtValue = td.textContent || td.innerText;
		  if (txtValue.toUpperCase().indexOf(filter) == 0) {
			  tr[i].style.display = "";
		  } else {
			  tr[i].style.display = "none";
		  }
		}       
	}
}