import { findManyByModel, findOneProfile } from "@/app/lib/action";
import { Panel } from "./@components/panel";
import { ProfileSelect } from "./@components/porfile-select";
import { IProfile } from "@/app/lib/definition";

interface Props {
  searchParams: {
    id: string;
  };
}

export default async function Page(props: Props) {
  const {
    searchParams: { id },
  } = props;
  const profiles = await findManyByModel("E3+" as IProfile["model"]);
  const profileSelected = (await findOneProfile({ id })) ?? undefined;
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
      <ProfileSelect profiles={profiles} currentProfileIdSelected={id} />
      <Panel profile={profileSelected} />
    </div>
  );
}
