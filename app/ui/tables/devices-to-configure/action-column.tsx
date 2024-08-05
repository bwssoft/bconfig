import { useState } from "react";
import { Button } from "../../components/button";
import { toast } from "@/app/hook/use-toast";
import { Spinner } from "../../components/spinner";
import { ArrowDownOnSquareIcon } from "@heroicons/react/24/outline";
import { IProfile, ISerialPort } from "@/app/lib/definition";

interface Props {
  port: ISerialPort;
  getDeviceProfile: (port: ISerialPort) => Promise<{
    profile: IProfile["config"];
    native_profile: { cxip?: string; dns?: string; check?: string };
  } | void>;
}

export function DevicesToConfigureActionColumn(props: Props) {
  const { getDeviceProfile, port } = props;
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex gap-2">
      {/* <Button
            variant="outlined"
            className="p-2"
            title="Levar para área de teste"
          >
            <ArrowTopRightOnSquareIcon
              width={16}
              height={16}
              title="Levar para área de teste"
            />
          </Button> */}
      <Button
        disabled={loading}
        variant="outlined"
        className="p-2"
        onClick={async () => {
          setLoading(true);
          const result = await getDeviceProfile(port);
          setLoading(false);
          if (result) {
            const uid = crypto.randomUUID();
            localStorage.setItem(`profile_${uid}`, JSON.stringify(result));
            window.open(`/configurator/E3+/actual-profile?id=${uid}`, "_blank");
          } else {
            toast({
              title: "Falha!",
              description: "Falha ao resgatar o perfil do equipamento!",
              variant: "error",
            });
          }
        }}
        title="Requisitar Configurações"
      >
        {loading ? (
          <Spinner svgClassName="h-4 w-4 fill-gray-600" />
        ) : (
          <ArrowDownOnSquareIcon
            width={16}
            height={16}
            title="Requisitar Configurações"
          />
        )}
      </Button>
    </div>
  );
}
