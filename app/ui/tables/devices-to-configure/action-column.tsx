import { useState } from "react";
import { Button } from "../../components/button";
import { toast } from "@/app/hook/use-toast";
import { Spinner } from "../../components/spinner";
import {
  ArchiveBoxXMarkIcon,
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
  handleForgetPort: (port: ISerialPort) => Promise<void>;
}

export function DevicesToConfigureActionColumn(props: Props) {
  const { getDeviceProfile, port, model, handleForgetPort } = props;
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
            window.open(
              `/configurator/${model}/actual-profile?id=${id}`,
              "_blank"
            );
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
      <Button
        disabled={forgetPortloading}
        variant="outlined"
        className="p-2"
        onClick={async () => {
          try {
            setForgetPortLoading(true);
            await handleForgetPort(port);
          } catch (e) {
            toast({
              title: "Falha!",
              description: "Falha ao esquecer a porta!",
              variant: "error",
            });
          } finally {
            setForgetPortLoading(false);
          }
        }}
        title="Esquecer porta usb"
      >
        {forgetPortloading ? (
          <Spinner svgClassName="h-4 w-4 fill-gray-600" />
        ) : (
          <ArchiveBoxXMarkIcon
            width={16}
            height={16}
            title="Esquecer porta usb"
          />
        )}
      </Button>
    </div>
  );
}
