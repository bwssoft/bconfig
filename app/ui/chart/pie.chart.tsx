"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  title?: string;
  subtitle?: string;
  series: (number | string)[];
  options: ApexCharts.ApexOptions;
}

const PieChart: React.FC<Props> = (props) => {
  const { series: _series, options: _options, title, subtitle } = props;

  const [chartOptions, setChartOptions] = useState<ApexCharts.ApexOptions>({});
  const [series, setSeries] = useState<any>([]);

  useEffect(() => {
    const defaulltOptions = {
      ..._options,
    };

    setChartOptions(defaulltOptions);
  }, [_options]);

  useEffect(() => {
    setSeries(_series);
  }, [_series]);

  return (
    <div className="flex flex-col w-full h-full bg-white border-x-2 border-x-gray-900/5 p-4 md:p-6">
      {(title || subtitle) && (
        <div className="flex justify-between mb-5">
          <div>
            {title && (
              <h5 className="leading-none text-lg font-bold text-gray-900 pb-2">
                {title}
              </h5>
            )}
            {subtitle && (
              <p className="text-sm font-normal text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      <div className="flex-1">
        {series.length > 0 && (
          <Chart
            options={chartOptions}
            series={series}
            type="pie"
            height="100%"
            width="100%"
          />
        )}
      </div>
    </div>
  );
};

export default PieChart;
