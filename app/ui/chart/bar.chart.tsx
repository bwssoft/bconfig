"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  title?: string;
  subtitle?: string;
  series: { name: string; data: (number | string)[]; color?: string }[];
  options: {
    xaxis: {
      categories: string[];
    };
    chart: {
      stacked: boolean;
    };
    plotOptions: {
      bar: {
        horizontal: boolean;
      };
    };
    stroke?: {
      width?: number;
    };
  };
}

export const BarChart = (props: Props) => {
  const { series: _series, options: _options, title, subtitle } = props;
  const [chartOptions, setChartOptions] = useState({});
  const [series, setSeries] = useState<any>([]);

  useEffect(() => {
    const options = {
      chart: {
        type: "bar",
        fontFamily: "Inter, sans-serif",
        toolbar: {
          show: false,
        },
        stacked: _options.chart.stacked,
      },
      plotOptions: {
        bar: {
          horizontal: _options.plotOptions.bar.horizontal,
          columnWidth: "70%",
        },
      },
      states: {
        hover: {
          filter: {
            type: "darken",
            value: 1,
          },
        },
      },
      stroke: {
        show: true,
        width: _options?.stroke?.width ?? 0,
        colors: ["transparent"],
      },
      grid: {
        strokeDashArray: 4,
        width: 1,
        colors: ["#fff"],
      },
      xaxis: {
        categories: _options.xaxis.categories,
        labels: {
          show: true,
          style: {
            fontFamily: "Inter, sans-serif",
            cssClass: "text-xs font-normal fill-gray-500",
          },
        },
        floating: false,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        position: "bottom",
        horizontalAlign: "left",
        offsetX: 40,
      },
    };

    setChartOptions(options);
  }, [_options]);

  useEffect(() => {
    setSeries(_series);
  }, [_series]);

  return (
    <div className="flex flex-col w-full h-full bg-white border-x-2 border-x-gray-900/5 p-4 md:p-6">
      {(title || subtitle) && (
        <div className="flex justify-between mb-2">
          <div>
            {title && (
              <h5 className="leading-none text-lg font-bold text-gray-900 pb-2">
                {title}
              </h5>
            )}
            {subtitle && (
              <p className="text-sm font-semibold text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      <div className="flex-1">
        {series.length > 0 && (
          <Chart
            options={chartOptions}
            series={series}
            type="bar"
            height="100%"
            width="100%"
          />
        )}
      </div>
    </div>
  );
};
