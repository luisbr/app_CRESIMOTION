import * as Localization from "expo-localization";
import enI18n from "./en";
const locale = Localization.locale;
const i18n = {
  en: enI18n,
};
const strings = i18n[locale] || i18n.en;

export default strings;
