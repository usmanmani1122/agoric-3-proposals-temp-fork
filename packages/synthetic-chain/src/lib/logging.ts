export const step = async (name: string, fn: Function) => {
  console.log('START', name);
  await fn();
  console.log('END', name);
};
