import { findAllProfile, findOneProfile } from "../../lib/action";
import { IProfile } from "../../lib/definition";
import { Panel } from "./@components/panel";
import { ProfileSelect } from "./@components/porfile-select";

interface Props {
  searchParams: {
    id: string;
  };
}

const nullProfile: IProfile = {
  id: "null",
  name: "Nenhum",
  created_at: new Date(),
  model: "E3+" as IProfile["model"],
  config: {
    ip: {
      primary: {
        ip: undefined,
        port: undefined,
      },
      secondary: {
        ip: undefined,
        port: undefined,
      },
    },
    dns: undefined,
    apn: undefined,
    timezone: undefined,
    lock_type: undefined,
    data_transmission: undefined,
    odometer: undefined,
    keep_alive: undefined,
    accelerometer_sensitivity: undefined,
    economy_mode: undefined,
    lbs_position: undefined,
    cornering_position_update: undefined,
    ignition_alert_power_cut: undefined,
    gprs_failure_alert: undefined,
    led: undefined,
    virtual_ignition: undefined,
  },
};

export default async function Page(props: Props) {
  const {
    searchParams: { id },
  } = props;
  const profiles = await findAllProfile();
  const profileSelected =
    id === "null" ? nullProfile : await findOneProfile({ id });
  const date = new Date();
  return (
    <div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 ">
        <div>
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Configurador
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Ferramenta para configurar a{" "}
            <a href="#" className="text-gray-900">
              Família E3.
            </a>{" "}
            Data de hoje:{" "}
            <time dateTime={date.toLocaleDateString()}>
              {date.toLocaleDateString()}
            </time>
          </p>
        </div>
      </div>
      <ProfileSelect
        profiles={[nullProfile, ...profiles]}
        currentProfileIdSelected={id}
      />
      <Panel config={profileSelected?.config} />
    </div>
  );
}
