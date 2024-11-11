import PieChart from "@/app/ui/chart/pie.chart";

export function ConfigurationLogsInsights(props: {
  gatewaysConfigured: { _id: string; count: number }[];
}) {
  const { gatewaysConfigured } = props;
  return (
    <PieChart
      title="Gráfico de endpoints"
      subtitle="Dados para aprensetar os gateways onde mais foram configurados equipamentos"
      series={gatewaysConfigured.map((d) => d.count)}
      options={{
        labels: gatewaysConfigured.map((d) => d._id),
        chart: {
          stacked: false,
        },
        plotOptions: {
          bar: {
            horizontal: true,
          },
        },
      }}
    />
  );
}
