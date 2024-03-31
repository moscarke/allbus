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
			if (routeInfo.co == "gmb" || routeInfo.co == "mtr" || routeInfo.co == "lightRail" || routeInfo.gtfsId == null){
				continue;
			}
			let tr = document.createElement('tr');
			let td = document.createElement('td');
			let button = document.createElement('button');
			let span = document.createElement('span');
			let routeNumberTd = document.createElement('td');
			let company = document.createElement('p');
			let serviceType = document.createElement('p');
			let routeOrigTd = document.createElement('p');
			let routeDestTd = document.createElement('p');
			
			routeNumberTd.textContent = routeInfo.route;
			company.style = "font-size: 75%;color: #FFEC31;margin: 0px 0px";
			company.textContent = transitOperators(routeInfo.co);
			routeNumberTd.appendChild(company);
			
			if (routeInfo.serviceType != "1"){
				serviceType.textContent = "特別班";
				serviceType.style = "font-size: 75%;color: lightcyan;margin: 0px 0px";
				routeNumberTd.appendChild(serviceType);
			}
			
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
		changeTable("城巴");
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
		let eta = document.createElement("div");
		
		number.textContent = i + 1;
		button.className = "btnEta";
		button.style = "text-align: left";
		button.onclick = function (){routeStopEta(routeName, stops[i], i)};
		button.textContent = stopInfo.name.zh;
		fare.style = "font-size: 75%;color: #ffff99;margin: 0px 0px;";
		eta.id = i.toString();
		
		if (routeInfo.fares[i] == undefined){
			fare.textContent = "";
		} else if (routeInfo.faresHoliday && i != stops.length - 1){
			fare.textContent = "平日車資: $" + routeInfo.fares[i] + " 假日車資: $" + routeInfo.faresHoliday[i];
		} else if (i != stops.length - 1) {
			fare.textContent = "車資: $" + routeInfo.fares[i];
		}
		
		button.append(fare);
		stopName.append(button);
		stopName.append(eta);
		tr.append(number);
		tr.append(stopName);
		tbody.append(tr);
	}
	document.getElementById("stationList").style.display = "block";
}

function routeStopEta(routeName, stopId, sequence){
	const co = response.routeList[routeName].co;
	const eta = [];
	for (let i = 0; i < response.routeList[routeName].stops[co[0]].length; i++){
		let div = document.getElementById(i);	
		div.innerHTML = "";
	}
	let div = document.getElementById(sequence);	
	div.innerHTML = "<span>Loading...</span>";
	
	for (let i = 0; i < co.length; i++){
		if (co[i] == "ctb"){
			const url = "https://rt.data.gov.hk/v2/transport/citybus/eta/ctb/" + response.routeList[routeName].stops.ctb[sequence] + "/" + response.routeList[routeName].route;
			const xhttpr = new XMLHttpRequest();
			xhttpr.open("GET", url, true);

			xhttpr.send();

			xhttpr.onload = ()=> {
				if (xhttpr.status == 200){
					const rawInfo = JSON.parse(xhttpr.response);
					const etaInfo = rawInfo.data;
					for (let i = 0; i < etaInfo.length; i++){
						if (response.routeList[routeName].bound.ctb != etaInfo[i].dir || etaInfo[i].eta == ""){
							continue;
						}
						eta.push({dest: etaInfo[i].dest_tc, time: etaInfo[i].eta, co: "城巴", remark: etaInfo[i].rmk_tc});
					}
					let div = document.getElementById(sequence);	
					div.innerHTML = "";
					
					outputEta(eta, div);
				}
			}
		} else if (co[i] == "kmb"){
			const url = "https://data.etabus.gov.hk/v1/transport/kmb/eta/" + response.routeList[routeName].stops.kmb[sequence] + "/" + response.routeList[routeName].route + "/" + response.routeList[routeName].serviceType;
			const xhttpr = new XMLHttpRequest();
			xhttpr.open("GET", url, true);

			xhttpr.send();

			xhttpr.onload = ()=> {
				if (xhttpr.status == 200){
					const rawInfo = JSON.parse(xhttpr.response);
					const etaInfo = rawInfo.data;
					for (let i = 0; i < etaInfo.length; i++){
						if (response.routeList[routeName].bound.kmb != etaInfo[i].dir || etaInfo[i].eta == ""){
							continue;
						}
						eta.push({dest: etaInfo[i].dest_tc, time: etaInfo[i].eta, co: "九巴", remark: etaInfo[i].rmk_tc});
					}
					let div = document.getElementById(sequence);	
					div.innerHTML = "";
					
					outputEta(eta, div);
				}
			}
		} else if (co[i] == "nlb"){
			const url = "https://rt.data.gov.hk/v2/transport/nlb/stop.php?action=estimatedArrivals&language=zh&routeId=" + response.routeList[routeName].nlbId + "&stopId=" + stopId;
			const xhttpr = new XMLHttpRequest();
			xhttpr.open("GET", url, true);

			xhttpr.send();

			xhttpr.onload = ()=> {
				if (xhttpr.status == 200){
					const rawInfo = JSON.parse(xhttpr.response);
					const etaInfo = rawInfo.estimatedArrivals;
					for (let i = 0; i < etaInfo.length; i++){
						if (etaInfo[i].estimatedArrivalTime == ""){
							continue;
						}
						eta.push({dest: "", time: etaInfo[i].estimatedArrivalTime, co: "嶼巴", remark: etaInfo[i].routeVariantName});
					}
					let div = document.getElementById(sequence);	
					div.innerHTML = "";
					
					outputEta(eta, div);
				}
			}
		} else if (co[i] == "lrtfeeder"){
			const url = "https://rt.data.gov.hk/v1/transport/mtr/bus/getSchedule"
			const xhttpr = new XMLHttpRequest();
			const params = JSON.stringify({
				language: "zh",
				routeName: response.routeList[routeName].route
			});
			
			xhttpr.open("POST", url, true);
			xhttpr.setRequestHeader("Content-type", "application/json");
			xhttpr.send(params);

			xhttpr.onreadystatechange = ()=> {
				if (xhttpr.readyState === 4 && xhttpr.status == 200){
					const rawInfo = JSON.parse(xhttpr.response);
					const busStop = rawInfo.busStop;
					for (let i = 0; i < busStop.length; i++){
						if (busStop[i].busStopId != stopId){
							console.log(stopId);
							console.log(busStop);
							continue;
						}
						const etaInfo = busStop[i].bus;
						for (let j = 0; j < etaInfo.length; j++){
							if (etaInfo[j].eta == ""){
								continue;
							}
							let currentTime = new Date();
							currentTime.setTime(currentTime.getTime() + (etaInfo[j].arrivalTimeInSecond * 1000))
							eta.push({dest: "", time: currentTime.toString(), co: "港鐵巴士", remark: etaInfo[j].busRemark});
						}
						break;
					}
					let div = document.getElementById(sequence);	
					div.innerHTML = "";
					
					outputEta(eta, div);
				}
			}
		}
	}
	
}

function outputEta(eta, div){
	eta.sort(function (a, b) {
		return a.time.localeCompare(b.time);
	});

	for (let i = 0; i < eta.length; i++){
		let etaStamp = new Date(eta[i].time);
		let currentTime = new Date()
		etaStamp = (etaStamp.getTime() - currentTime.getTime()) / 60000;
		etaStamp = Math.ceil(etaStamp);
		if (etaStamp <= 0){
			etaStamp = 1;
		}
		if (eta[i].remark == null){
			eta[i].remark = "";
		}
		
		let row = document.createElement("span");
		row.style = "font-size: 80%"
		let time = etaStamp.toString() + "分鐘";
		let timeElement = document.createElement("td");
		row.textContent = time + " " + eta[i].dest + " " + eta[i].co + " " + eta[i].remark;
		
		row.appendChild(document.createElement("br"));
		div.appendChild(row);
	}
	if (eta.length == 0){
		div.innerHTML = "<span>未有班次資料</span>";
	}
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

function changeTable(company){
	document.getElementById("routeSearch").onkeyup = function (){searchRoute(company)};
	let btn = document.getElementsByTagName("button");
	for (let i = 0; i < 5; i++){
		btn[i].style = "background-color: rgb(0, 187, 0);";
	}
	document.getElementById(company).style = "background-color: rgb(0, 107, 0);";
	
	let table, tr, td, i, txtValue;
	table = document.getElementById("routeTable");
	tr = table.getElementsByTagName("tr");
	for (i = 1; i < tr.length; i++) {
		td = tr[i].getElementsByTagName("td")[0];
		if (td) {
		  txtValue = td.textContent || td.innerText;
		  if (txtValue.indexOf(company) >= 0) {
			  tr[i].style.display = "";
		  } else {
			  tr[i].style.display = "none";
		  }
		}       
	}
	
	searchRoute(company);
}

function searchRoute(company){
	let input, filter, table, tr, td, i, txtValue;
	input = document.getElementById("routeSearch");
	filter = input.value.toUpperCase();
	table = document.getElementById("routeTable");
	tr = table.getElementsByTagName("tr");
	for (i = 1; i < tr.length; i++) {
		td = tr[i].getElementsByTagName("td")[0];
		if (td) {
		  txtValue = td.textContent || td.innerText;
		  if (txtValue.toUpperCase().indexOf(filter) == 0 && txtValue.indexOf(company) >= 0) {
			  tr[i].style.display = "";
		  } else {
			  tr[i].style.display = "none";
		  }
		}       
	}
}