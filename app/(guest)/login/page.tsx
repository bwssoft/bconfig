import { LoginForm } from "@/app/ui/forms/login/login.form";
// import { hashSync } from "bcrypt";
/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
export default function Example() {
  // console.log(
  //   JSON.stringify([
  //     {
  //       name: "Brian",
  //       password: hashSync("brian@2025", 10),
  //       type: "client",
  //       created_at: new Date(),
  //       id: crypto.randomUUID(),
  //       connected: false,
  //       email: "brian.augusto@bwsiot.com",
  //     },
  //     {
  //       name: "Alessandra",
  //       password: hashSync("alessandra@2025", 10),
  //       type: "client",
  //       created_at: new Date(),
  //       id: crypto.randomUUID(),
  //       connected: false,
  //       email: "alessandra@bwstechnology.com",
  //     },
  //     {
  //       name: "Edson",
  //       password: hashSync("edson@2025", 10),
  //       type: "client",
  //       created_at: new Date(),
  //       id: crypto.randomUUID(),
  //       connected: false,
  //       email: "edson.molina@bwsiot.com",
  //     },
  //     {
  //       name: "Gilberto",
  //       password: hashSync("gilberto@2025", 10),
  //       type: "client",
  //       created_at: new Date(),
  //       id: crypto.randomUUID(),
  //       connected: false,
  //       email: "gilberto.borges@bwsiot.com",
  //     },
  //     {
  //       name: "Raphaela",
  //       password: hashSync("rapha@2025", 10),
  //       type: "client",
  //       created_at: new Date(),
  //       id: crypto.randomUUID(),
  //       connected: false,
  //       email: "rapha.braga@bwsiot.com",
  //     },
  //     {
  //       name: "Walter",
  //       password: hashSync("walter@2025", 10),
  //       type: "client",
  //       created_at: new Date(),
  //       id: crypto.randomUUID(),
  //       connected: false,
  //       email: "walter@bwstechnology.com",
  //     },
  //     {
  //       name: "Rodrigo",
  //       password: hashSync("rodrigo@2025", 10),
  //       type: "client",
  //       created_at: new Date(),
  //       id: crypto.randomUUID(),
  //       connected: false,
  //       email: "rodrigo.arruda@bwsiot.com",
  //     },
  //     {
  //       name: "Victor",
  //       password: hashSync("victor@2025", 10),
  //       type: "client",
  //       created_at: new Date(),
  //       id: crypto.randomUUID(),
  //       connected: false,
  //       email: "victor.fernandes@bwsiot.com",
  //     },
  //   ])
  // );

  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-white">
        <body class="h-full">
        ```
      */}
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Your Company"
            src="/logo-bws.png"
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <LoginForm />
        </div>
      </div>
    </>
  );
}
