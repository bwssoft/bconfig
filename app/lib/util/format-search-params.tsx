export function formatSearchParams<T extends object>(
  data: T,
  searchParams?: URLSearchParams
) {
  const params = searchParams ?? new URLSearchParams();

  Object.keys(data).forEach((key) => {
    if (data[key as never]) {
      params.set(key, data[key as never] as string);
    } else {
      params.delete(key);
    }
  });

  return params;
}
