import { useState } from "react";
import { Button } from "../../components/button";
import { toast } from "@/app/hook/use-toast";
import { Spinner } from "../../components/spinner";
import {
  ArrowDownOnSquareIcon,
} from "@heroicons/react/24/outline";
import { IProfile, ISerialPort } from "@/app/lib/definition";

interface Props {
  port: ISerialPort;
  model: IProfile["model"];
  getDeviceProfile: (port: ISerialPort) => Promise<{
    profile: IProfile["config"];
    native_profile: { cxip?: string; dns?: string; check?: string };
  } | void>;
}

export function DevicesToCheckActionColumn(props: Props) {
  const { getDeviceProfile, port } = props;
  const [getProfileloading, setGetProfileLoading] = useState(false);
  const [forgetPortloading, setForgetPortLoading] = useState(false);
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
        disabled={getProfileloading}
        variant="outlined"
        className="p-2"
        onClick={async () => {
          setGetProfileLoading(true);
          const result = await getDeviceProfile(port);
          setGetProfileLoading(false);
          if (result) {
            const id = crypto.randomUUID();
            localStorage.setItem(`profile_${id}`, JSON.stringify(result));
            window.open(`/configuration/actual-profile?id=${id}`, "_blank");
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
        {getProfileloading ? (
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
