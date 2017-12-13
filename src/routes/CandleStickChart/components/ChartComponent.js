import React from 'react';
import { render } from 'react-dom';
import Chart from './Chart';
import { getData } from "./utils"
import $ from "jquery";
import { TypeChooser } from "react-stockcharts/lib/helper";


class ChartComponent extends React.Component {
	componentDidMount() {
		// getData().then(data => {
		// 	this.setState({ data })
		// })
		let self = this;
        setInterval(function(){
        	self.getCurrency();
        }, 60000);
		self.getCurrency(0);
	}
	getCurrency(){
		let self = this;
		$.ajax({
	        url: "http://5.9.144.226:6001/fetch/koinex",
			type: 'GET',
	        success: function (response) {
				if(response.data){
					let data = response.data
					if(data){
						let a = self.getActualData(data,self.state && self.state.currentSelectCurrency ? self.state.currentSelectCurrency : 0)
						self.setState({
							'actualData':a,
							'data': data
						})
					}
				}
	        }
	    });
	}
	getActualData(data,curr){
		let currencyType = 'BTC';
		if(curr == 0){
			currencyType = 'BTC'
		} else if(curr == 1){
			currencyType = 'ETH'
		} else if(curr == 2){
			currencyType = 'XRP'
		} else if(curr == 3){
			currencyType = 'LTC'
		} else if(curr == 4){
			currencyType = 'BCH'
		}
		let actualData = [];
		$.map( data, function(d, i){
			//if(i<2){
				let calculated = d.calculated[0]
			actualData.push({
				date: new Date(calculated.date),
				currency: calculated.price[curr][currencyType],
				close: calculated.price[curr]['close'],
				high: calculated.price[curr]['high'],
            	low: calculated.price[curr]['low'],
            	open: calculated.price[curr]['open'],
            	volume: calculated.price[curr]['volume'],
			});
		//}
		})
		//console.log(actualData,"1111")
		return actualData;
	}
	render() {
		let actualData = this.state && this.state.actualData && this.state.actualData.length ? this.state.actualData : []
		if (this.state == null) {
			return <div>Loading...</div>
		}
		return (
			<div className="containers row" >
			    <div className="col-sm-12" style={{display:'inlineBlock'}}>
			    <label>Select Currency: </label>
			    	<select
			    		id="currency"
			    		onChange={(e)=>{
			    			let val = parseInt($("#currency option:selected").val())
			    			this.setState({
			    				currentSelectCurrency: val
			    			})
			    			let actData = this.getActualData(this.state.data,val);
			    			this.setState({
								'actualData':actData,
							})
			    		}}
			    		style={{marginLeft:'10px'}}
			    	>
  						<option value='0'>BitCoins (BTC)</option>
  						<option value='1'>Ethereum (ETH)</option>
  						<option value='2'>Ripple (XRP)</option>
  						<option value='3'>Litecoin (LTC)</option>
  						<option value='4'>Bitcoin Cash (BCH)</option>
					</select>
			    </div>
			    <div className="col-sm-12">
			    	<Chart data={actualData} />
			    </div>
			</div>
		)
	}
}

export default ChartComponent;
