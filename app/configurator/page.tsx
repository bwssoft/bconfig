import { findAllProfile, findOneProfile } from "../lib/action";
import { Panel } from "./components/panel";
import { ProfileSelect } from "./components/porfile-select";

interface Props {
  searchParams: {
    id: string;
  };
}
export default async function Page(props: Props) {
  const {
    searchParams: { id },
  } = props;
  const profiles = await findAllProfile();
  const profileSelected = await findOneProfile({ id });
  console.log(profileSelected?.config ?? {});
  const date = new Date();
  return (
    <div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 ">
        <div>
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Configurador
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Possivel configurar a{" "}
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
        profiles={[
          {
            id: null as unknown as string,
            name: "Nenhumm",
            config: {} as any,
            created_at: new Date(),
            model: "E3+",
          },
          ...profiles,
        ]}
        currentProfileIdSelected={id}
      />
      <Panel config={profileSelected?.config ?? {}} />
    </div>
  );
}
