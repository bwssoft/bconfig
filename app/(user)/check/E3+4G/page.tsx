import { CheckConfigurationPanel } from "./@components/check-panel";

interface Props {
  searchParams: {
    has_count: string;
    redirect_to_automatic: string;
  };
}

export default async function Page(props: Props) {
  const {
    searchParams: { has_count, redirect_to_automatic },
  } = props;
  const date = new Date();
  return (
    <div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 ">
        <div>
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Check configuration
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Check configuration tool for{" "}
            <a href="#" className="text-gray-900">
              E3+4G.
            </a>{" "}
            Today:{" "}
            <time dateTime={date.toLocaleDateString()}>
              {date.toLocaleDateString()}
            </time>
          </p>
        </div>
      </div>
      <CheckConfigurationPanel
        has_count={has_count ? (has_count === "true" ? true : false) : false}
        redirect_to_automatic={
          redirect_to_automatic
            ? redirect_to_automatic === "true"
              ? true
              : false
            : true
        }
      />
    </div>
  );
}
