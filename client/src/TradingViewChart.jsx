import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, HistogramSeries, CrosshairMode } from 'lightweight-charts';

const TradingViewChart = ({ data, volumeData }) => {
  const chartContainerRef = useRef(null);
  
  // Folosim useRef pentru a pastra instantele graficului intre randari
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);

  // 1. Efectul de INIȚIALIZARE a graficului (se rulează o singură dată)
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Crearea graficului
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: '#0b0e14' },
        textColor: '#848e9c',
      },
      grid: {
        vertLines: { color: 'rgba(43, 49, 57, 0.5)', style: 1 },
        horzLines: { color: 'rgba(43, 49, 57, 0.5)', style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#848e9c', width: 1, style: 3, labelBackgroundColor: '#3b82f6' },
        horzLine: { color: '#848e9c', width: 1, style: 3, labelBackgroundColor: '#3b82f6' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: '#2b3139',
        rightOffset: 12, 
        barSpacing: 15, 
      },
      rightPriceScale: {
        borderColor: '#2b3139',
        autoScale: true,
      },
    });

    // Adaugarea seriilor
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#2ebd85',      
      downColor: '#f6465d',    
      borderVisible: false,
      wickUpColor: '#2ebd85',
      wickDownColor: '#f6465d',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: '', 
    });
    
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    // Salvam instantele in referinte pentru a le accesa mai tarziu
    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Curatarea la distrugerea componentei
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []); // Array gol [] => Se ruleaza strict la montarea componentei

  // 2. Efectul de ACTUALIZARE a datelor
  useEffect(() => {
    if (!chartRef.current || !candlestickSeriesRef.current || !volumeSeriesRef.current) return;

    const timeScale = chartRef.current.timeScale();
    const currentZoom = timeScale.getVisibleLogicalRange();

    if (data && data.length > 0) {
      candlestickSeriesRef.current.setData(data);
    }
    
    if (volumeData && volumeData.length > 0) {
      volumeSeriesRef.current.setData(volumeData);
    }

    if (currentZoom) {
      timeScale.setVisibleLogicalRange(currentZoom);
    } else if (data && data.length > 0) {
      timeScale.fitContent();
    }
    
  }, [data, volumeData]); 

  return <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />;
};

export default TradingViewChart;