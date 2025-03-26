import { Progress } from "@/app/ui/components/progress";

interface Props {
  configurationLog: { imei: string; progress: number; label: string }[];
  inConfiguration: boolean;
}
export const ConfigurationProgress = (props: Props) => {
  const { inConfiguration, configurationLog } = props;

  const totalProgress = configurationLog
    .filter((el) => el.progress !== 100)
    .reduce((acc, cur) => acc + cur.progress, 0);

  const averageProgress =
    configurationLog.length > 0 ? totalProgress / configurationLog.length : 0;

  return inConfiguration ? (
    <Progress percentage={averageProgress} hint={configurationLog[0]?.label} />
  ) : (
    <></>
  );
};
