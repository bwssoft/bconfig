"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  title?: string;
  subtitle?: string;
  series: (number | string)[];
  options: {
    labels: string[];
    colors: string[];
  };
}

export const DoughnutChart = (props: Props) => {
  const { series: _series, options: _options, title, subtitle } = props;
  const [chartOptions, setChartOptions] = useState({});
  const [series, setSeries] = useState<any>([]);

  useEffect(() => {
    const options = {
      chart: {
        type: "donut",
        fontFamily: "Inter, sans-serif",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        pie: {
          customScale: 1,
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
        width: 5,
        colors: ["#fff"],
      },
      grid: {
        strokeDashArray: 4,
        width: 1,
        colors: ["#fff"],
      },
      labels: _options.labels,
      colors: _options.colors,
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
    <div className="flex flex-col w-full h-full bg-white border-x-2 border-x-gray-900/5 dark:bg-gray-800 p-4 md:p-6">
      {(title || subtitle) && (
        <div className="flex justify-between mb-5">
          <div>
            {title && (
              <h5 className="leading-none text-3xl font-bold text-gray-900 dark:text-white pb-2">
                {title}
              </h5>
            )}
            {subtitle && (
              <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
      <div className="flex-1">
        {series.length > 0 && (
          <Chart
            options={chartOptions}
            series={series}
            type="donut"
            height="100%"
            width="100%"
          />
        )}
      </div>
    </div>
  );
};
