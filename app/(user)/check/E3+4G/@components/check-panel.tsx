"use client";

import { useE34GCheckConfiguration } from "@/app/hook/use-E34G-check-configuration";
import { IProfile } from "@/app/lib/definition";
import DevicesToCheckConfigurationTable from "@/app/ui/tables/devices-to-check-configuration/table";
import { Spinner } from "@/app/ui/components/spinner";
import DevicesDisconnectedCheckConfigurationTable from "@/app/ui/tables/devices-disconnected-check-configuration/table";
import DevicesCheckedConfigurationTable from "@/app/ui/tables/devices-checked-configuration/table";
import { Dialog } from "@/app/ui/components/dialog";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { DialogTitle } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { cn } from "@/app/lib/util";

interface Props {
  has_count: boolean;
  redirect_to_automatic: boolean;
}

export function CheckConfigurationPanel(props: Props) {
  const {
    identified,
    checkConfiguration,
    disconnection,
    identifiedLog,
    inChecking,
    getDeviceProfile,
    showModal,
    setShowModal,
    checkResult,
    lastConfigurationLog,
  } = useE34GCheckConfiguration(props);
  const router = useRouter();

  return (
    <>
      <div className="mt-10 flex flex-col gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
        <div>
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Step 1: Identification
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            List of all connected serial ports sync with identified devices.
          </p>
        </div>
        <div className="flex flex-col gap-6 w-full">
          <div className="flow-root w-full">
            <DevicesToCheckConfigurationTable
              model={"E3+4G" as IProfile["model"]}
              data={identified.map((d) => ({
                ...d,
                getDeviceProfile,
                progress: identifiedLog.find((el) => el.port === d.port)
                  ?.progress,
              }))}
            />
          </div>
        </div>

        <div>
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Step 2: Desconnection
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            List of all connected serial ports sync with identified devices.
          </p>
        </div>
        <div className="flex flex-col gap-6 w-full">
          <div className="flow-root w-full">
            <DevicesDisconnectedCheckConfigurationTable data={disconnection} />
          </div>
        </div>

        <div>
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Step 3: Checking {inChecking && <Spinner />}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            List of all connected serial ports sync with identified devices.
          </p>
        </div>
        <div className="flex flex-col gap-6 w-full">
          <div className="flow-root w-full">
            <DevicesCheckedConfigurationTable data={checkConfiguration} />
          </div>
        </div>
      </div>
      {showModal && (
        <Dialog open={showModal} setOpen={setShowModal}>
          <div>
            <div
              className={cn(
                "mx-auto flex size-12 items-center justify-center rounded-full bg-green-100",
                !checkResult && "bg-red-100"
              )}
            >
              {checkResult ? (
                <CheckIcon
                  aria-hidden="true"
                  className="size-6 text-green-600"
                />
              ) : (
                <XMarkIcon
                  aria-hidden="false"
                  className="size-6 text-red-600"
                />
              )}
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <DialogTitle
                as="h3"
                className="text-base font-semibold text-gray-900"
              >
                {checkResult
                  ? "Configuração Validada com sucesso"
                  : "Confguração não validada"}
              </DialogTitle>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {checkResult
                    ? "A configuração enviada ao equipamento foi validada e o equipamento está apto para seguir para as proximas etapas."
                    : "A configuração do equipamento não foi validada, reconfigure o equipamento."}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                router.push(
                  !props.redirect_to_automatic
                    ? `/configurator/E3+4G?id=${lastConfigurationLog?.profile_id}`
                    : `/configurator/E3+4G/automatic?id=${lastConfigurationLog?.profile_id}`
                );
              }}
              className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2"
            >
              Ok
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
