import { ISerialPort } from "@/app/lib/definition";
import { Progress } from "@/app/ui/components/progress";

interface Props {
  identifiedLog: { port: ISerialPort; progress: number; label: string }[];
  inIdentification: boolean;
}
export const IdentificationProgress = (props: Props) => {
  const { inIdentification, identifiedLog } = props;
  const totalProgress = identifiedLog.reduce(
    (acc, cur) => acc + cur.progress,
    0
  );
  const averageProgress =
    identifiedLog.length > 0 ? totalProgress / identifiedLog.length : 0;

  return inIdentification ? <Progress percentage={averageProgress} /> : <></>;
};
