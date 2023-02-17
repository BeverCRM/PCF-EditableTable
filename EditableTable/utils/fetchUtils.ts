export const getFetchResponse = async (request: string) => {
  const response = await fetch(request);
  return await response.json();
};
