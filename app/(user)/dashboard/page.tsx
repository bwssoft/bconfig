import { countGatewayConfigured } from "@/app/lib/action";
import { IProfile } from "@/app/lib/definition";
import { ConfigurationLogsInsights } from "./@components/configuration-log.insights";

export default async function Example() {
  const model = "E3+4G" as IProfile["model"];
  const gatewaysConfigured = await countGatewayConfigured({ model });
  return (
    <div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 ">
        <div>
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Insights sobre a configuração dos equipamentos.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 h-screen">
        <ConfigurationLogsInsights
          gatewaysConfigured={gatewaysConfigured as any}
        />
      </div>
    </div>
  );
}
