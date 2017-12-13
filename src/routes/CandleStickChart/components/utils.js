

import { tsvParse, csvParse } from  "d3-dsv";
import { timeParse } from "d3-time-format";
import $ from "jquery";

function parseData(parse) {
	return function(d) {
		d.date = parse(d.date);
		d.open = +d.open;
		d.high = +d.high;
		d.low = +d.low;
		d.close = +d.close;
		d.volume = +d.volume;

		return d;
	};
}

const parseDate = timeParse("%Y-%m-%d");

// export function getData() {
// 	const promiseMSFT = fetch("//rrag.github.io/react-stockcharts/data/MSFT.tsv")
// 		.then(response => response.text())
// 		.then(data => tsvParse(data, parseData(parseDate)))
// 	return promiseMSFT;
// }

export function getData() {
	$.ajax({
        url: "http://5.9.144.226:6001/fetch/koinex",
		type: 'GET',
        success: function (response) {
			if(response.data){
				console.log(response.data);
				return response.data;
			}
        }
    });
	const promiseMSFT = fetch("//rrag.github.io/react-stockcharts/data/MSFT.tsv")
			.then(response => response.text())
			.then(data => tsvParse(data, parseData(parseDate)))
		return promiseMSFT;
}
