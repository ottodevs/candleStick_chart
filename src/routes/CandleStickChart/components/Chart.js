import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import $ from "jquery";
import { ema } from "react-stockcharts/lib/indicator";
import { ChartCanvas, Chart } from "react-stockcharts";
import {
	ScatterSeries,
	SquareMarker,
	TriangleMarker,
	CircleMarker,
	LineSeries,
	BarSeries,
	CandlestickSeries
} from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	EdgeIndicator,
	CrossHairCursor,
	MouseCoordinateX,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import {
	OHLCTooltip,
	HoverTooltip
} from "react-stockcharts/lib/tooltip";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";
import { LabelAnnotation, Label, Annotate } from "react-stockcharts/lib/annotation";

const dateFormat = timeFormat("%Y-%m-%d %H:%M");
const numberFormat = format(".2f");

function tooltipContent(ys) {
	return ({ currentItem, xAccessor }) => {
		return {
			x: dateFormat(xAccessor(currentItem)),
			y: [
				{
					label: "open",
					value: currentItem.open && numberFormat(currentItem.open)
				},
				{
					label: "high",
					value: currentItem.high && numberFormat(currentItem.high)
				},
				{
					label: "low",
					value: currentItem.low && numberFormat(currentItem.low)
				},
				{
					label: "close",
					value: currentItem.close && numberFormat(currentItem.close)
				},
				{
					label: "currency",
					value: currentItem.currency && numberFormat(currentItem.currency)
				}
			]
				// .concat(
				// 	ys.map(each => ({
				// 		label: each.label,
				// 		value: each.value(currentItem),
				// 		stroke: each.stroke
				// 	}))
				// )
				.filter(line => line.value)
		};
	};
}

class CandleStickChart extends React.Component {
    componentDidMount(){
        $("svg").css("margin-left", "-600px");
        $("svg").css("width", "100%");
        //$(".react-stockchart").css("width",'100%')
    }
	render() {
		const annotationProps = {
			fontFamily: "Glyphicons Halflings",
			fontSize: 20,
			fill: "#060F8F",
			opacity: 0.8,
			text: "\ue182",
			y: ({ yScale }) => yScale.range()[0],
			onClick: console.log.bind(console),
			tooltip: d => timeFormat("%B")(d.date),
			// onMouseOver: console.log.bind(console),
		};
		const { data: initialData, type, width, ratio } = this.props;
		const xScaleProvider = discontinuousTimeScaleProvider
			.inputDateAccessor(d => d.date);
		const {
			data,
			xScale,
			xAccessor,
			displayXAccessor,
		} = xScaleProvider(initialData);
		const ema20 = ema()
			.id(0)
			.options({ windowSize: 20 })
			.merge((d, c) => {
				d.ema20 = c;
			})
			.accessor(d => d.ema20);

		const ema50 = ema()
			.id(2)
			.options({ windowSize: 50 })
			.merge((d, c) => {
				d.ema50 = c;
			})
			.accessor(d => d.ema50);
		const xExtents = [
			xAccessor(last(data)),
			//xAccessor(data[data.length - 20])
			xAccessor(data[Math.max(0, data.length - 150)])
		];
		const margin = { left: 70, right: 70, top: 20, bottom: 30 };
		const height = 400;
		const gridHeight = height - margin.top - margin.bottom;
		const gridWidth = width - margin.left - margin.right;
		const showGrid = true;
		const yGrid = showGrid ? { innerTickSize: -1 * gridWidth, tickStrokeOpacity: 0.2 } : {};
		const xGrid = showGrid ? { innerTickSize: -1 * gridHeight, tickStrokeOpacity: 0.2 } : {};
		const [yAxisLabelX, yAxisLabelY] = [
			width - margin.left - 40,
			(height - margin.top - margin.bottom) / 2
		];
		return (
			<ChartCanvas
				height={400}
				ratio={ratio}
				width={width}
				margin={{ left: 70, right: 70, top: 15, bottom: 30 }}
				type={type}
				seriesName="MSFT"
				data={data}
				xScale={xScale}
				xAccessor={xAccessor}
				displayXAccessor={displayXAccessor}
				xExtents={xExtents}
			>
				<Chart id={1} yExtents={[d => [d.open, d.close]]} padding={{ top: 10, bottom: 20 }}>
					<XAxis
						axisAt="bottom"
						orient="bottom"
						{...xGrid}
					 />
					 <MouseCoordinateX
 						at="bottom"
 						orient="bottom"
 						displayFormat={timeFormat("%H:%M")}
 					/>
					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")}
						fontSize="9"
					/>
					{/*<Label x={(width - margin.left - margin.right) / 2} y={height - 45}
						fontSize="12" text="Date" />*/}
					<YAxis
						axisAt="right"
						ticks={5}
						orient="right"
						{...yGrid}
					/>
					{/*<Label x={yAxisLabelX} y={yAxisLabelY}
						rotate={-90}
						fontSize="12" text="Open-Close" />*/}


					<CandlestickSeries />
					<EdgeIndicator itemType="last" orient="right" edgeAt="right" fontSize="9"
						yAccessor={d => d.close} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"}/>
					<OHLCTooltip forChart={1} origin={[-40, -10]} />
					{/*<Annotate with={LabelAnnotation}
						when={d => d.date.getDate() === 1}
						usingProps={annotationProps} />*/}
					<HoverTooltip
						yAccessor={ema50.accessor()}
						tooltipContent={tooltipContent([
							{
								label: `${ema20.type()}(${ema20.options()
									.windowSize})`,
								value: d => numberFormat(ema20.accessor()(d)),
								stroke: ema20.stroke()
							},
							{
								label: `${ema50.type()}(${ema50.options()
									.windowSize})`,
								value: d => numberFormat(ema50.accessor()(d)),
								stroke: ema50.stroke()
							}
						])}
						fontSize={15}
					/>
				</Chart>
				<Chart
					id={2}
					height={150}
					yExtents={d => d.volume}
					origin={(w, h) => [0, h - 150]}
				>
					<YAxis
						axisAt="left"
						orient="left"
						ticks={5}
						tickFormat={format(".2f")}
					/>

					<MouseCoordinateX
						at="bottom"
						orient="bottom"
						displayFormat={timeFormat("%H:%M")}
					/>
					<MouseCoordinateY
						at="left"
						orient="left"
						displayFormat={format(".4s")}
					/>

					<BarSeries
						yAccessor={d => d.volume}
						fill={d => (d.close > d.open ? "rgba(196, 205, 211, 0.8)" : "rgba(22, 22, 22, 0.8)")}
					/>
				</Chart>
				<CrossHairCursor />
			</ChartCanvas>

		);
	}
}

CandleStickChart.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

CandleStickChart.defaultProps = {
	type: "svg",
};
CandleStickChart = fitWidth(CandleStickChart);

export default CandleStickChart;
