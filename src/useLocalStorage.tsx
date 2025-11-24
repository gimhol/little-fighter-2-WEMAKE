const __clear_flag = "1001";
if (localStorage.getItem("__clear_flag") !== __clear_flag) {
  localStorage.clear();
  localStorage.setItem("__clear_flag", __clear_flag);
}
export * from "@fimagine/dom-hooks/dist/useLocalStorage"