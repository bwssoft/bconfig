"use client";

import Alert from "@/app/ui/components/alert";
import { Button } from "@/app/ui/components/button";
import { useE34GAutoTest } from "@/app/hook/use-E34G-auto-test";
import DevicesToAutoTest from "@/app/ui/tables/devices-to-auto-test/table";
import { cn } from "@/app/lib/util";
import { Spinner } from "@/app/ui/components/spinner";

export function AutoTestPanel() {
  const {
    identified,
    requestPort,
    handleDeviceAutoTest,
    ports,
    test,
    inTest,
    identifiedLog,
    testLog,
  } = useE34GAutoTest();

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
              <DevicesToAutoTest
                data={identifiedLog.map((d) => ({
                  ...d,
                  ...(identified.find((el) => el.port === d.port) ?? {
                    isIdentified: false,
                  }),
                }))}
              />
            ) : (
              <Alert label="You have no serial ports sync." />
            )}
          </div>
          <div className="flex justify-between gap-2">
            <div className="flex gap-2">
              <Button
                disabled={inTest}
                variant="primary"
                className="h-fit"
                onClick={() => handleDeviceAutoTest(identified)}
              >
                Auto Test
              </Button>
            </div>

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
      <div className="mt-10 flex flex-col gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
        <div>
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Step 2: Review
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            List of auto test results for all connected devices.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          {testLog.length > 0 ? (
            <>
              {testLog.map((log, i) => {
                const current_test = test.find((el) => (el.imei = log.imei));
                if (!current_test || log.progress !== 100) {
                  return (
                    <div
                      className="flex flex-col p-4 max-w-96 bg-white shadow-lg rounded-lg"
                      key={i}
                    >
                      <div className="grid grid-cols-1 gap-4">
                        <div className="p-4 rounded-lg">
                          <h3 className="font-semibold text-sm text-gray-700 flex gap-2">
                            <Spinner svgClassName="h-4 w-4 fill-gray-600" />
                            Auto Test is running
                          </h3>
                          <div className="mt-4 flex items-center gap-2">
                            <div className="w-full">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                Serial Number
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-gray-700">
                                {log.imei?.length ? log.imei : "--"}
                              </dd>
                            </div>
                            <div className="w-full">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                Stage
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-gray-700">
                                {log.label}
                              </dd>
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="w-full">
                              <dt className="text-sm font-medium leading-6 text-gray-900">
                                Progress
                              </dt>
                              <dd className="mt-1 text-sm leading-6 text-gray-700">
                                {log.progress}%
                              </dd>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                const test_result_status = current_test.is_successful
                  ? "success"
                  : "fail";
                return (
                  <div
                    className="flex flex-col p-4 max-w-96 bg-white shadow-lg rounded-lg"
                    key={i}
                  >
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 pb-0 rounded-lg">
                        <div className="flex items-center gap-1">
                          <div
                            className={cn(
                              statuses[test_result_status],
                              "flex-none rounded-full p-1 w-fit"
                            )}
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-current" />
                          </div>
                          <div
                            className={cn(
                              "hidden font-semibold sm:block",
                              text[test_result_status]
                            )}
                          >
                            {current_test.is_successful ? "Success" : "Failed"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Serial and Device Info */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 rounded-lg">
                        <h3 className="font-semibold text-sm text-gray-700">
                          Device Identification
                        </h3>
                        <div className="mt-4 flex items-center gap-2">
                          <div className="w-full">
                            <dt className="text-sm font-medium leading-6 text-gray-900">
                              Serial Number
                            </dt>
                            <dd className="mt-1 text-sm leading-6 text-gray-700">
                              {current_test.imei?.length
                                ? current_test.imei
                                : "--"}
                            </dd>
                          </div>
                          <div className="w-full">
                            <dt className="text-sm font-medium leading-6 text-gray-900">
                              ICCID
                            </dt>
                            <dd className="mt-1 text-sm leading-6 text-gray-700">
                              {current_test.iccid?.length
                                ? current_test.iccid
                                : "--"}
                            </dd>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="w-full">
                            <dt className="text-sm font-medium leading-6 text-gray-900">
                              Firmware
                            </dt>
                            <dd className="mt-1 text-sm leading-6 text-gray-700">
                              {current_test.et?.length ? current_test.et : "--"}
                            </dd>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Time info */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 rounded-lg">
                        <h3 className="font-semibold text-sm text-gray-700">
                          Time Information
                        </h3>
                        <div className="mt-4 flex items-center gap-2">
                          <div className="w-full">
                            <dt className="text-sm font-medium leading-6 text-gray-900">
                              Initial Time
                            </dt>
                            <dd className="mt-1 text-sm leading-6 text-gray-700">
                              {new Date(
                                current_test.metadata.init_time_configuration
                              ).toLocaleTimeString()}
                            </dd>
                          </div>
                          <div className="w-full">
                            <dt className="text-sm font-medium leading-6 text-gray-900">
                              End Time
                            </dt>
                            <dd className="mt-1 text-sm leading-6 text-gray-700">
                              {new Date(
                                current_test.metadata.end_time_configuration
                              ).toLocaleTimeString()}
                            </dd>
                          </div>
                          <div className="w-full">
                            <dt className="text-sm font-medium leading-6 text-gray-900">
                              Test duration
                            </dt>
                            <dd className="mt-1 text-sm leading-6 text-gray-700">
                              {(current_test.metadata.end_time_configuration -
                                current_test.metadata.init_time_configuration) /
                                1000}{" "}
                              s
                            </dd>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tests Status */}
                    <div className="p-4 rounded-lg">
                      <h3 className="font-semibold text-sm text-gray-700">
                        Results
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {[
                          ["SIM HW", "SIMHW"],
                          ["GPS HW", "GPS"],
                          // ["GPS Signal", "GPSf"],
                          // ["GSM", "GSM"],
                          // ["LTE Signal", "LTE"],
                          ["IN 1", "IN1"],
                          ["IN 2", "IN2"],
                          ["OUT 1", "OUT"],
                          ["ACEL HW", "ACEL"],
                          ["VCC", "VCC"],
                          ["CHARGER", "CHARGER"],
                          ["MEM", "MEM"],
                        ].map((label) => (
                          <div
                            key={label[0]}
                            className="flex items-center space-x-2"
                          >
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full",
                                current_test.auto_test_analysis[
                                  label[1] as keyof typeof current_test.auto_test_analysis
                                ]
                                  ? "bg-green-400"
                                  : "bg-red-400"
                              )}
                            ></div>
                            <span className="text-xs text-gray-700">
                              {label[0]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Raw data */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 rounded-lg">
                        <h3 className="font-semibold text-sm text-gray-700">
                          Raw data
                        </h3>
                        <div className="mt-4 flex-col gap-2">
                          {[current_test.metadata.commands_sent?.[0]].map(
                            (c, cindex) => (
                              <div className="w-full" key={cindex}>
                                <dt className="text-sm font-medium leading-6 text-gray-900">
                                  {c.request}
                                </dt>
                                <dd className="mt-1 text-sm leading-6 text-gray-700 break-words">
                                  {c.response ?? "--"}
                                </dd>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Test hints */}
                    {Object.entries(current_test.auto_test_hints).length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        <div className="p-4 rounded-lg">
                          <h3 className="font-semibold text-sm text-gray-700">
                            Hints
                          </h3>
                          <div className="mt-4 flex-col gap-2">
                            {Object.entries(current_test.auto_test_hints).map(
                              (h, hindex) => (
                                <div className="w-full" key={hindex}>
                                  <dt className="text-sm font-medium leading-6 text-gray-900">
                                    {h[0]}
                                  </dt>
                                  <dd className="mt-1 text-sm leading-6 text-gray-700 break-words">
                                    {h[1]}
                                  </dd>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            <Alert label="You have no results." />
          )}
        </div>
      </div>
    </>
  );
}

const statuses = {
  success: "text-green-500 bg-green-800/20",
  fail: "text-rose-500 bg-rose-800/20",
};

const text = {
  success: "text-green-800",
  fail: "text-rose-800",
};
