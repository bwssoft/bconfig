"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  title?: string;
  subtitle?: string;
  series: { name: string; data: number[]; color?: string }[];
  options: {
    xaxis: {
      categories: string[];
    };
  };
}

export const MultilineChart = (props: Props) => {
  const { series: _series, options: _options, title, subtitle } = props;
  const [chartOptions, setChartOptions] = useState({});
  const [series, setSeries] = useState<any>([]);

  useEffect(() => {
    const options = {
      yaxis: {
        show: true,
        // labels: {
        //   formatter: function (value: any) {
        //     return "€" + value;
        //   },
        // },
      },
      chart: {
        type: "area",
        fontFamily: "Inter, sans-serif",
        dropShadow: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
        animations: {
          enabled: false,
        },
      },
      tooltip: {
        enabled: true,
        x: {
          show: false,
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          opacityFrom: 0.55,
          opacityTo: 0,
          shade: "#1C64F2",
          gradientToColors: ["#1C64F2"],
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 2,
      },
      grid: {
        show: false,
        strokeDashArray: 2,
        padding: {
          left: 2,
          right: 2,
          top: -26,
        },
      },
      xaxis: {
        categories: _options.xaxis.categories,
        labels: {
          show: true,
          style: {
            fontFamily: "Inter, sans-serif",
            cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
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
    };

    setChartOptions(options);
  }, []);

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
            type="area"
            height="100%"
            width="100%"
          />
        )}
      </div>
    </div>
  );
};
