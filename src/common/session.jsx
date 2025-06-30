export const storeInSession = (key, value) => {
  return localStorage.setItem(key, value);
};
export const lookInSession = (key) => {
  return localStorage.getItem(key);
};
export const removeFromSession = (key) => {
  return localStorage.removeItem(key);
};
export const logoutUser = () => {
  return localStorage.clear();
};
