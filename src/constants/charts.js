export const defaultOptions = {
    annotations: {
      position: 'front'
    },
    chart: {
      type: 'area',
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 700, // first render
        dynamicAnimation: { // re-render (switching between 3 graphs)
          enabled: true,
          speed: 500
        }
      },
      height: 240,
      width: 380,
      zoom: {
        enabled: false
      },
      selection: {
          enabled: false,
          type: 'x',
          fill: {
            color: '#e9effb',
            opacity: 0.4
          },
          stroke: {
            width: 0,
            dashArray: 3,
            color: '#24292e',
            opacity: 0.4
          },
          xaxis: {
              min: undefined,
              max: undefined
          }
        }
    },
    colors: ['#000'],
    fill: {
      gradient: {
        opacityFrom: 0.75,
        opacityTo: 0.35,
        shadeIntensity: 0,
        gradientToColors: ['#E7B35A', '#fff']
      }
    },
    tooltip: {
      enabled: true
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'straight',
      width: 1
    },
    xaxis: {
      type: 'numeric',
      tooltip: {
        enabled: false
      },
      tickAmount: 6,
      labels: {
          offsetX: 3,
          show: true,
          formatter: function (value) {
              if (value !== null) {
                  return value.toFixed(2)
              }
          }
      }
    },
    yaxis: {
      show: false,
    },
    legend: {
      show: false
    },
    grid: {
      show: false
    }
  };