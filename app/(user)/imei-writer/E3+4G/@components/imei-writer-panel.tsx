"use client";

import Alert from "@/app/ui/components/alert";
import { Button } from "@/app/ui/components/button";
import { useE34GImeiWriter } from "@/app/hook/use-E34G-imei-writer";
import { Input } from "@/app/ui/components/input";
import DevicesToWriteImei from "@/app/ui/tables/devices-to-auto-test/table";
import DeviceConfiguredImeiTable from "@/app/ui/tables/devices-configured-imei/table";
import { ImeiWriterForm } from "@/app/ui/forms/imei-writer/imie-writer.form";

export function ImeiWriterPanel() {
  const {
    identified,
    requestPort,
    handleDeviceConfiguration,
    ports,
    configuration,
    inConfiguration,
    identifiedLog,
    handleDeviceIdentification,
  } = useE34GImeiWriter();

  return (
    <>
      <div className="mt-10 flex flex-col gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
        <div>
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Step 1: Serial Ports
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            List of all connected serial ports sync with identified devices.
          </p>
        </div>
        <div className="flex flex-col gap-6 w-full">
          <div className="flow-root w-full">
            {ports.length > 0 ? (
              <DevicesToWriteImei
                data={identifiedLog.map((d) => ({
                  ...d,
                  ...(identified.find((el) => el.port === d.port) ?? {
                    isIdentified: false,
                  }),
                }))}
              />
            ) : (
              <Alert variant="info" title="You have no serial ports sync." />
            )}
          </div>
          <div className="flex justify-between gap-2">
            <ImeiWriterForm
              disabled={inConfiguration}
              onSubmit={async (imeiForWriting) => {
                if (!identified?.[0]) return;
                await handleDeviceConfiguration(identified[0], imeiForWriting);
                await handleDeviceIdentification([identified[0].port]);
              }}
            />

            <Button
              variant="outlined"
              className="h-fit whitespace-nowrap"
              onClick={requestPort}
            >
              New serial port
            </Button>
          </div>
        </div>
      </div>
      {configuration.length ? (
        <div className="mt-10 flex flex-col gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
          <div>
            <h1 className="text-base font-semibold leading-7 text-gray-900">
              Etapa 2: Verification
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              List of all devices configured.
            </p>
          </div>
          <DeviceConfiguredImeiTable data={configuration} />
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
