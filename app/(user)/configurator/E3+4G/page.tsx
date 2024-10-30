import {
  findAllProfile,
  findManyByModel,
  findOneProfile,
} from "@/app/lib/action";
import { ProfileSelect } from "./@components/porfile-select";
import { ConfigPanel } from "./@components/config-panel";
import { IProfile } from "@/app/lib/definition";
import { auth } from "@/auth";

interface Props {
  searchParams: {
    id: string;
  };
}

export default async function Page(props: Props) {
  const {
    searchParams: { id },
  } = props;
  const profiles = await findAllProfile({
    model: "E3+4G" as IProfile["model"],
    is_for_customer: false,
  });
  const profileSelected = (await findOneProfile({ id })) ?? undefined;
  const date = new Date();
  const session = await auth();
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
              Família E3+4G.
            </a>{" "}
            Data de hoje:{" "}
            <time dateTime={date.toLocaleDateString()}>
              {date.toLocaleDateString()}
            </time>
          </p>
        </div>
      </div>
      <ProfileSelect profiles={profiles} currentProfileIdSelected={id} />
      <ConfigPanel profile={profileSelected} user_type={session?.user.type!} />
    </div>
  );
}
