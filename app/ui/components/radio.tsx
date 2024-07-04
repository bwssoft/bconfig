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
const sides = [
  { id: null, name: "None" },
  { id: 1, name: "Baked beans" },
  { id: 2, name: "Coleslaw" },
  { id: 3, name: "French fries" },
  { id: 4, name: "Garden salad" },
  { id: 5, name: "Mashed potatoes" },
];

export function Radio<T>(props: {
  data: T[];
  keyExtractor: (arg: T) => string | number;
  valueExtractor: (arg: T) => string | number;
  label?: string;
  onChange?: (arg: T) => void;
  name: string;
  defaultValue?: T;
}) {
  const { label, data, keyExtractor, valueExtractor, defaultValue, onChange } =
    props;
  return (
    <fieldset className="w-full">
      {label && (
        <legend className="text-sm font-semibold leading-6 text-gray-900">
          {label}
        </legend>
      )}
      <div className="mt-4 divide-y divide-gray-200 border-b border-t border-gray-200">
        {data.map((op, opIdx) => (
          <div key={opIdx} className="relative flex items-start py-4">
            <div className="min-w-0 flex-1 text-sm leading-6">
              <label
                htmlFor={`radio-${keyExtractor(op)}`}
                className="select-none font-medium text-gray-900"
              >
                {valueExtractor(op)}
              </label>
            </div>
            <div className="ml-3 flex h-6 items-center">
              <input
                id={`radio-${keyExtractor(op)}`}
                name="plan"
                type="radio"
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                defaultChecked={
                  defaultValue &&
                  valueExtractor(op) === valueExtractor(defaultValue)
                }
                onChange={() => {
                  onChange?.(op);
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
